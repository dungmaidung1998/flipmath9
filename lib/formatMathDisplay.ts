/**
 * FILE NÀY LÀM GÌ: Mô-đun TypeScript/JavaScript hỗ trợ xử lý dữ liệu và nghiệp vụ trong hệ thống FlipMath 9.
 * AI DÙNG: dùng chung
 * LẤY DỮ LIỆU TỪ: không truy vấn bảng trực tiếp
 * GỌI TỚI: @/lib/dfle/latex-hoa.js, @/lib/normalizeMathText
 */
import katex from 'katex';
import { latexHoa } from '@/lib/dfle/latex-hoa.js';
import { normalizeMathText } from '@/lib/normalizeMathText';

export type MathNode =
  | { type: 'text'; value: string }
  | { type: 'inline-math'; math: string; scroll?: boolean }
  | { type: 'block-math'; math: string }
  | { type: 'break' };

const CONTINUATION_RE =
  /^\s*(?:chứ|là|và|hoặc|khi|với|thì|nên|có|được|không|bằng|tức|hay|của|trong|trên|tại|cho|vào|từ|nhưng|mà|vì|do|để|luôn)\b/iu;

const ABBREV_RE =
  /(?:^|[\s(])(?:v\.v|v|tr|vd|mr|mrs|ms|dr|tp|ths|ts|gs|pgs|st|no|fig|ch|bài\s*\d+|câu\s*\d+|mục\s*\d+|bước\s*\d+|chương\s*[ivx\d]+)$/iu;

/** Độ dài hiển thị ước lượng của công thức LaTeX (bỏ lệnh trang trí và khoảng trắng). */
export function visibleMathLength(math: string): number {
  const s = math
    .replace(/\\(?:dfrac|tfrac|frac)\b/g, '/')
    .replace(/\\sqrt(?:\[3\])?\b/g, '√')
    .replace(/\\(?:Leftrightarrow|Rightarrow|leftrightarrow|rightarrow|approx|cdot|times|leq|geq|neq|le|ge|ne|pm|mp|in|pi|alpha|beta|Delta|Omega|circ)\b/g, 'x')
    .replace(/\\(?:left|right|text|mathrm|mathbb|quad|qquad|begin\{[^}]*\}|end\{[^}]*\})/g, '')
    .replace(/\\[,;!]/g, '')
    .replace(/[{}\^_\\ \t\r\n]/g, '');
  return s.length;
}

/** Kiểm tra công thức có chứa dấu quan hệ đẳng thức / bất đẳng thức / suy ra / tương đương. */
export function hasRelation(math: string): boolean {
  // Biểu thức chính quy (regex) kiểm tra hoặc tách chuỗi đúng mẫu dữ liệu
  return /[=<>≤≥≠⇔⇒≈]|\\(?:le|leq|ge|geq|ne|neq|Leftrightarrow|Rightarrow|approx)\b/.test(math);
}

/** Kiểm tra công thức có phép toán hoặc quan hệ toán học. */
export function hasMathOperator(math: string): boolean {
  // Biểu thức chính quy (regex) kiểm tra hoặc tách chuỗi đúng mẫu dữ liệu
  return hasRelation(math) || /[+\-*/·×]|\\(?:dfrac|tfrac|frac|sqrt|cdot|times|pm)\b/.test(math);
}

/** Tách chuỗi đã chuẩn hoá thành danh sách node văn bản, ngắt câu, công thức inline và block. */
export function formatMathNodes(
  normalized: string,
  opts?: { inline?: boolean }
): { nodes: MathNode[]; isMulti: boolean } {
  // Biểu thức chính quy (regex) kiểm tra hoặc tách chuỗi đúng mẫu dữ liệu
  const rawTokens = normalized.split(/(\$\$[\s\S]*?\$\$|\$[^$\n]+\$)/g);
  type RawItem =
    | { type: 'text'; value: string }
    | { type: 'inline-math'; math: string }
    | { type: 'block-math'; math: string };

  const items: RawItem[] = [];
  for (const part of rawTokens) {
    if (!part) continue;
    if (part.startsWith('$$') && part.endsWith('$$')) {
      const m = part.slice(2, -2).trim();
      if (m) items.push({ type: 'block-math', math: m });
    } else if (part.startsWith('$') && part.endsWith('$')) {
      const m = part.slice(1, -1).trim();
      if (m) items.push({ type: 'inline-math', math: m });
    } else {
      items.push({ type: 'text', value: part });
    }
  }

  if (opts?.inline) {
    const out: MathNode[] = [];
    for (let i = 0; i < items.length; i++) {
      const cur = items[i];
      if (cur.type === 'text') {
        out.push({ type: 'text', value: cur.value });
      } else if (cur.type === 'block-math') {
        out.push({ type: 'block-math', math: cur.math });
      } else {
        const len = visibleMathLength(cur.math);
        const prev = out[out.length - 1];
        // Biểu thức chính quy (regex) kiểm tra hoặc tách chuỗi đúng mẫu dữ liệu
        if (len <= 3 && prev?.type === 'text' && /[^\s] $/.test(prev.value)) {
          prev.value = prev.value.slice(0, -1) + '\u00A0';
        }
        out.push({ type: 'inline-math', math: cur.math, scroll: len > 24 });
      }
    }
    return { nodes: out, isMulti: out.some((n) => n.type === 'block-math') };
  }

  // Pass 1: Đưa công thức khối (đẳng thức/bất đẳng thức dài hoặc đứng sau dấu :) thành block-math.
  const promoted: RawItem[] = items.map((item) => ({ ...item }));
  for (let i = 0; i < promoted.length; i++) {
    const cur = promoted[i];
    if (cur.type !== 'inline-math') continue;
    const prev = promoted[i - 1];
    const next = promoted[i + 1];
    const prevText = prev?.type === 'text' ? prev.value : '';
    const nextText = next?.type === 'text' ? next.value : '';

    // Không tách công thức đang nằm trong cặp ngoặc đơn của câu văn.
    if (prevText.trimEnd().endsWith('(') && nextText.trimStart().startsWith(')')) {
      continue;
    }

    const precededByColon = prev?.type === 'text' && prev.value.trimEnd().endsWith(':');
    const followedBySentenceEnd =
      !next ||
      (next.type === 'text' && (/^\s*(?:[.!?;]|$)/.test(next.value) || /^\s*\n/.test(next.value)));
    // Biểu thức chính quy (regex) kiểm tra hoặc tách chuỗi đúng mẫu dữ liệu
    const followedByComma = next?.type === 'text' && /^\s*,/.test(next.value);
    const followedByContinuation = next?.type === 'text' && CONTINUATION_RE.test(next.value);
    const len = visibleMathLength(cur.math);
    const rel = hasRelation(cur.math);
    // Biểu thức chính quy (regex) kiểm tra hoặc tách chuỗi đúng mẫu dữ liệu
    const hasBegin = /\\begin\{(?:cases|aligned)\}/.test(cur.math);

    const shouldPromote =
      hasBegin ||
      (!followedByComma &&
        ((rel && precededByColon && !followedByContinuation) ||
          (rel && len > 8 && (!followedByContinuation || len > 24)) ||
          (precededByColon && len >= 4 && hasMathOperator(cur.math) && followedBySentenceEnd && !followedByContinuation)));

    if (shouldPromote) {
      promoted[i] = { type: 'block-math', math: cur.math };
      if (prev?.type === 'text') {
        // Biểu thức chính quy (regex) kiểm tra hoặc tách chuỗi đúng mẫu dữ liệu
        prev.value = prev.value.replace(/[ \t]+$/, '');
      }
      if (next?.type === 'text') {
        // Bỏ dấu chấm/chấm phẩy đứng lẻ loi ngay sau công thức khối.
        if (hasBegin) {
          // Biểu thức chính quy (regex) kiểm tra hoặc tách chuỗi đúng mẫu dữ liệu
          next.value = next.value.replace(/^\s*[:.;](?=\s|$)[ \t]*/, '');
        } else {
          // Biểu thức chính quy (regex) kiểm tra hoặc tách chuỗi đúng mẫu dữ liệu
          next.value = next.value.replace(/^\s*[.;](?=\s|$)[ \t]*/, '');
        }
      }
    }
  }

  // Pass 2: Tách câu sau dấu '.', '!', '?', ';' ở ngoài ngoặc.
  const nodes: MathNode[] = [];
  let depth = 0;

  const pushTextWithBreaks = (text: string, nextItem?: RawItem) => {
    let segStart = 0;
    for (let idx = 0; idx < text.length; idx++) {
      const ch = text[idx];
      if (ch === '\n') {
        if (idx > segStart) nodes.push({ type: 'text', value: text.slice(segStart, idx) });
        nodes.push({ type: 'break' });
        segStart = idx + 1;
        continue;
      }
      if ('([{'.includes(ch)) {
        depth++;
        continue;
      }
      if (')]}'.includes(ch)) {
        // Tính toán, làm tròn hoặc giới hạn giá trị theo công thức
        depth = Math.max(0, depth - 1);
        continue;
      }
      if (depth !== 0) continue;
      if (ch !== '.' && ch !== '!' && ch !== '?' && ch !== ';') continue;

      // Bỏ qua dấu ba chấm hoặc số thập phân (2.5).
      if (ch === '.') {
        if (text[idx - 1] === '.' || text[idx + 1] === '.') continue;
        // Biểu thức chính quy (regex) kiểm tra hoặc tách chuỗi đúng mẫu dữ liệu
        if (idx > 0 && idx + 1 < text.length && /\d/.test(text[idx - 1]) && /\d/.test(text[idx + 1])) continue;
        const prefix = text.slice(segStart, idx);
        // Biểu thức chính quy (regex) kiểm tra hoặc tách chuỗi đúng mẫu dữ liệu
        if (ABBREV_RE.test(prefix) || /^\s*\d+$/.test(prefix)) continue;
      }

      // Tìm khoảng trắng ngay sau dấu câu.
      let wsEnd = idx + 1;
      while (wsEnd < text.length && (text[wsEnd] === ' ' || text[wsEnd] === '\t')) wsEnd++;
      if (wsEnd === idx + 1) continue; // Không có khoảng trắng sau dấu câu.

      if (wsEnd < text.length) {
        const rest = text.slice(wsEnd);
        // Biểu thức chính quy (regex) kiểm tra hoặc tách chuỗi đúng mẫu dữ liệu
        if (/^(?:\p{Lu}|["“«(\[]\p{Lu})/u.test(rest)) {
          nodes.push({ type: 'text', value: text.slice(segStart, idx + 1) });
          nodes.push({ type: 'break' });
          segStart = wsEnd;
          idx = wsEnd - 1;
        }
      } else if (nextItem) {
        // Khoảng trắng chạm cuối đoạn text, ngay sau là công thức.
        if (nextItem.type === 'inline-math') {
          const isSentencePunct = ch === '.' || ch === '!' || ch === '?';
          const isSemiFormula = ch === ';' && visibleMathLength(nextItem.math) > 5;
          if (isSentencePunct || isSemiFormula) {
            nodes.push({ type: 'text', value: text.slice(segStart, idx + 1) });
            nodes.push({ type: 'break' });
            segStart = wsEnd;
          }
        }
      }
    }
    if (segStart < text.length) {
      nodes.push({ type: 'text', value: text.slice(segStart) });
    }
  };

  for (let i = 0; i < promoted.length; i++) {
    const cur = promoted[i];
    if (cur.type === 'text') {
      if (cur.value) pushTextWithBreaks(cur.value, promoted[i + 1]);
    } else if (cur.type === 'block-math') {
      nodes.push({ type: 'block-math', math: cur.math });
    } else {
      const len = visibleMathLength(cur.math);
      const prev = nodes[nodes.length - 1];
      // Biểu thức chính quy (regex) kiểm tra hoặc tách chuỗi đúng mẫu dữ liệu
      if (len <= 3 && prev?.type === 'text' && /[^\s] $/.test(prev.value)) {
        prev.value = prev.value.slice(0, -1) + '\u00A0';
      }
      nodes.push({ type: 'inline-math', math: cur.math, scroll: len > 24 });
    }
  }

  // Pass 3: Dọn break trùng, rỗng hoặc nằm sát block-math.
  const cleaned: MathNode[] = [];
  for (const n of nodes) {
    if (n.type === 'text' && !n.value) continue;
    if (n.type === 'break') {
      const prev = cleaned[cleaned.length - 1];
      if (!prev || prev.type === 'break' || prev.type === 'block-math') continue;
      cleaned.push(n);
      continue;
    }
    if (n.type === 'block-math') {
      while (cleaned.length && cleaned[cleaned.length - 1].type === 'break') cleaned.pop();
      cleaned.push(n);
      continue;
    }
    cleaned.push(n);
  }
  while (cleaned.length && cleaned[cleaned.length - 1].type === 'break') cleaned.pop();
  while (cleaned.length && cleaned[0].type === 'break') cleaned.shift();

  const isMulti = cleaned.some((n) => n.type === 'break' || n.type === 'block-math');
  return { nodes: cleaned, isMulti };
}

/** Kết xuất công thức LaTeX thành HTML KaTeX an toàn (không ném lỗi). */
export function renderKatexHtml(math: string, displayMode: boolean): string {
  try {
    return katex.renderToString(math, { displayMode, throwOnError: false });
  } catch {
    return math
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');
  }
}

/**
 * Hàm `extractPureMath`: nhận (norm), xử lý nghiệp vụ và trả kết quả tương ứng.
 */
function extractPureMath(norm: string): string | null {
  const s = norm.trim();
  // Biểu thức chính quy (regex) kiểm tra hoặc tách chuỗi đúng mẫu dữ liệu
  const blk = s.match(/^\$\$([\s\S]+?)\$\$[.,;]?$/);
  if (blk) return blk[1].trim();
  // Biểu thức chính quy (regex) kiểm tra hoặc tách chuỗi đúng mẫu dữ liệu
  const inl = s.match(/^\$([^$\n]+)\$[.,;]?$/);
  if (inl) return inl[1].trim();
  return null;
}

/**
 * Hàm `extractPrefixAndMath`: nhận (norm), xử lý nghiệp vụ và trả kết quả tương ứng.
 */
function extractPrefixAndMath(norm: string): { prefix: string; math: string } | null {
  // Biểu thức chính quy (regex) kiểm tra hoặc tách chuỗi đúng mẫu dữ liệu
  const m = norm.trim().match(/^([^$\n]{1,32}?)\s*\$([^$\n]+)\$[.,;]?$/);
  if (!m) return null;
  const prefix = m[1].trim();
  // Biểu thức chính quy (regex) kiểm tra hoặc tách chuỗi đúng mẫu dữ liệu
  if (/[.!?]/.test(prefix)) return null;
  return { prefix, math: m[2].trim() };
}

/**
 * Hàm `startsWithEquals`: nhận (math), xử lý nghiệp vụ và trả kết quả tương ứng.
 */
function startsWithEquals(math: string): boolean {
  // Biểu thức chính quy (regex) kiểm tra hoặc tách chuỗi đúng mẫu dữ liệu
  return /^=/.test(math.trim());
}

/**
 * Hàm `splitAtFirstTopLevelEquals`: nhận (math), xử lý nghiệp vụ và trả kết quả tương ứng.
 */
function splitAtFirstTopLevelEquals(math: string): [string, string] | null {
  let braceDepth = 0;
  for (let i = 0; i < math.length; i++) {
    const ch = math[i];
    if (ch === '\\') {
      i++;
      continue;
    }
    if (ch === '{') braceDepth++;
    // Tính toán, làm tròn hoặc giới hạn giá trị theo công thức
    else if (ch === '}') braceDepth = Math.max(0, braceDepth - 1);
    else if (ch === '=' && braceDepth === 0) {
      return [math.slice(0, i).trim(), math.slice(i + 1).trim()];
    }
  }
  return null;
}

export type LoiGiaiItem = { kind: 'aligned'; latex: string } | { kind: 'prose'; text: string };

/**
 * Gom các dòng lời giải tự luận: bỏ số thứ tự, gộp chuỗi biến đổi có '=' ở đầu dòng sau
 * thành một khối KaTeX `\begin{aligned}` căn thẳng theo dấu `=`.
 */
export function groupSolutionLines(rawLines: string[]): LoiGiaiItem[] {
  const normLines = rawLines.map((line) => {
    const raw = String(line ?? '').trim();
    const withDollar = raw.includes('$') ? raw : latexHoa(raw);
    return normalizeMathText(withDollar).trim();
  });

  const out: LoiGiaiItem[] = [];
  for (let i = 0; i < normLines.length; i++) {
    const nextPure = i + 1 < normLines.length ? extractPureMath(normLines[i + 1]) : null;
    if (nextPure && startsWithEquals(nextPure)) {
      const pure0 = extractPureMath(normLines[i]);
      const pref0 = pure0 ? null : extractPrefixAndMath(normLines[i]);
      const math0 = pure0 ?? pref0?.math ?? null;
      const split0 = math0 ? splitAtFirstTopLevelEquals(math0) : null;

      if (split0) {
        if (pref0?.prefix) {
          out.push({ kind: 'prose', text: pref0.prefix });
        }
        const rows = [`${split0[0]} &= ${split0[1]}`];
        let j = i + 1;
        while (j < normLines.length) {
          const mj = extractPureMath(normLines[j]);
          if (!mj || !startsWithEquals(mj)) break;
          rows.push(`&= ${mj.trim().slice(1).trim()}`);
          j++;
        }
        out.push({
          kind: 'aligned',
          latex: `\\begin{aligned}\n${rows.join(' \\\\\n')}\n\\end{aligned}`,
        });
        i = j - 1;
        continue;
      }
    }
    if (rawLines[i] != null && String(rawLines[i]).trim() !== '') {
      out.push({ kind: 'prose', text: String(rawLines[i]).includes('$') ? String(rawLines[i]) : latexHoa(String(rawLines[i])) });
    }
  }
  return out;
}
