/**
 * FILE NÀY LÀM GÌ: Mô-đun TypeScript/JavaScript hỗ trợ xử lý dữ liệu và nghiệp vụ trong hệ thống FlipMath 9.
 * AI DÙNG: dùng chung
 * LẤY DỮ LIỆU TỪ: không truy vấn bảng trực tiếp
 * GỌI TỚI: không gọi mô-đun nội bộ khác
 */
/** √(x − 1) -> \sqrt{x - 1}, √2 -> \sqrt{2}, ∛8 -> \sqrt[3]{8}. 24/11/2026 */
function doiCan(s: string): string {
  let out = '';
  for (let i = 0; i < s.length; i++) {
    const c = s[i];
    if (c !== '√' && c !== '∛') { out += c; continue; }
    const lenh = c === '√' ? '\\sqrt' : '\\sqrt[3]';
    let j = i + 1; while (s[j] === ' ') j++;
    if (s[j] === '(') {
      let d = 0, k = j;
      for (; k < s.length; k++) { if (s[k] === '(') d++; else if (s[k] === ')') { d--; if (d === 0) break; } }
      if (k >= s.length) { out += c; continue; }
      out += lenh + '{' + doiCan(s.slice(j + 1, k)) + '}'; i = k;
    } else {
      // Biểu thức chính quy (regex) kiểm tra hoặc tách chuỗi đúng mẫu dữ liệu
      const m = s.slice(j).match(/^(?:[0-9]+(?:\.[0-9]+)?|[a-zA-Z])/);
      if (!m) { out += c; continue; }
      out += lenh + '{' + m[0] + '}'; i = j + m[0].length - 1;
    }
  }
  return out;
}

/** Bỏ một cặp ngoặc bao trọn toàn bộ biểu thức: (x - 2) -> x - 2. */
function boNgoacNgoai(s: string): string {
  s = s.trim();
  if (!s.startsWith('(') || !s.endsWith(')')) return s;
  let d = 0;
  for (let i = 0; i < s.length; i++) {
    if (s[i] === '(') d++; else if (s[i] === ')') d--;
    if (d === 0 && i < s.length - 1) return s; // (a)+(b): ngoặc không bao trọn
  }
  return s.slice(1, -1).trim();
}

/** Đổi mọi phân số viết bằng dấu / (kể cả có ngoặc) thành \dfrac{tử}{mẫu}. 24/11/2026 */
function gachThanhPhanSo(s: string): string {
  const MU = String.raw`(?:\^\{[^{}]*\}|\^[0-9a-z])?`;
  const SO = String.raw`(?:[0-9]{1,3}(?: [0-9]{3})+|[0-9]+(?:\.[0-9]+)?)`;
  // Biểu thức chính quy (regex) kiểm tra hoặc tách chuỗi đúng mẫu dữ liệu
  const traiDon = new RegExp(String.raw`(?<![\\a-zA-Z0-9])(${SO}?(?:[a-zA-Zπ]${MU})*|${SO}${MU})\s*$`);
  // Biểu thức chính quy (regex) kiểm tra hoặc tách chuỗi đúng mẫu dữ liệu
  const phaiDon = new RegExp(String.raw`^\s*(-?${SO}?(?:[a-zA-Zπ]${MU})*${MU})`);
  for (let vong = 0; vong < 20; vong++) {
    const i = s.indexOf('/');
    if (i < 0) break;
    // Vế trái
    let a = i, tu = '';
    let j = i - 1; while (j >= 0 && s[j] === ' ') j--;
    if (s[j] === '}') {
      let d = 0, k = j;
      for (; k >= 0; k--) { if (s[k] === '}') d++; else if (s[k] === '{') { d--; if (d === 0) break; } }
      // Biểu thức chính quy (regex) kiểm tra hoặc tách chuỗi đúng mẫu dữ liệu
      const truoc = s.slice(0, k).match(/(?:[0-9]+)?\\sqrt(?:\[3\])?$/);
      if (k < 0 || !truoc) break;
      a = k - truoc[0].length; tu = s.slice(a, j + 1);
    } else if (s[j] === ')') {
      let d = 0, k = j;
      for (; k >= 0; k--) { if (s[k] === ')') d++; else if (s[k] === '(') { d--; if (d === 0) break; } }
      if (k < 0) break;
      a = k; tu = s.slice(k, j + 1);
    } else {
      const m = s.slice(0, i).match(traiDon);
      if (!m || !m[1]) break;
      a = i - m[0].length; tu = m[1];
    }
    // Vế phải
    let b = i + 1, mau = '';
    let q = i + 1; while (q < s.length && s[q] === ' ') q++;
    // Biểu thức chính quy (regex) kiểm tra hoặc tách chuỗi đúng mẫu dữ liệu
    const can = s.slice(q).match(/^(?:[0-9]+)?\\sqrt(?:\[3\])?\{/);
    if (can) {
      let d = 0, k = q + can[0].length - 1;
      for (; k < s.length; k++) { if (s[k] === '{') d++; else if (s[k] === '}') { d--; if (d === 0) break; } }
      if (k >= s.length) break;
      b = k + 1; mau = s.slice(q, k + 1);
    } else if (s[q] === '(') {
      let d = 0, k = q;
      for (; k < s.length; k++) { if (s[k] === '(') d++; else if (s[k] === ')') { d--; if (d === 0) break; } }
      if (k >= s.length) break;
      b = k + 1; mau = s.slice(q, k + 1);
    } else {
      const m = s.slice(i + 1).match(phaiDon);
      if (!m || !m[1]) break;
      b = i + 1 + m[0].length; mau = m[1];
    }
    s = s.slice(0, a) + `\\dfrac{${boNgoacNgoai(tu)}}{${boNgoacNgoai(mau)}}` + s.slice(b);
  }
  return s;
}

/**
 * Hàm `formatMath`: nhận (s), xử lý nghiệp vụ và trả kết quả tương ứng.
 */
function formatMath(s: string): string {
  // Biểu thức chính quy (regex) kiểm tra hoặc tách chuỗi đúng mẫu dữ liệu
  const t = s.replace(/−/g, '-')
    .replace(/\/\s*=|!\s*=|≠/g, '\\ne ')
    .replace(/≤/g, '\\le ')
    .replace(/≥/g, '\\ge ')
    .replace(/⇔/g, '\\Leftrightarrow ')
    .replace(/⇒/g, '\\Rightarrow ')
    .replace(/×/g, '\\times ')
    .replace(/±/g, '\\pm ')
    .replace(/≈/g, '\\approx ')
    .replace(/∈/g, '\\in ')
    .replace(/ⁿ/g, '^{n}')
    .replace(/[⁰¹²³⁴⁵⁶⁷⁸⁹]+/g, p => `^{${Array.from(p).map(c => '⁰¹²³⁴⁵⁶⁷⁸⁹'.indexOf(c)).join('')}}`)
    .replace(/(\d),(\d)/g, '$1{,}$2')
    .replace(/·/g, '\\cdot ').replace(/≠/g, '\\ne ');
  // Biểu thức chính quy (regex) kiểm tra hoặc tách chuỗi đúng mẫu dữ liệu
  return gachThanhPhanSo(doiCan(t)).replace(/(\d) (?=\d{3}(?!\d))/g, '$1\\,');
  // Không tự đổi ( ) thành \left( \right): khoảng nửa mở như [a; b) sẽ lệch cặp và KaTeX báo lỗi.
}

/**
 * Hàm `normalizeMathText`: nhận (value), xử lý nghiệp vụ và trả kết quả tương ứng.
 */
export function normalizeMathText(value: string): string {
  // Biểu thức chính quy (regex) kiểm tra hoặc tách chuỗi đúng mẫu dữ liệu
  return value.split(/(\$\$[\s\S]*?\$\$|\$[^$\n]+\$)/g).map(part => {
    if (part.startsWith('$')) {
      const d = part.startsWith('$$') ? '$$' : '$';
      return d + formatMath(part.slice(d.length, -d.length)) + d;
    }
    // Biểu thức chính quy (regex) kiểm tra hoặc tách chuỗi đúng mẫu dữ liệu
    const expression = /(?:\\(?:dfrac|frac)\{[^{}]+\}\{[^{}]+\}|\\(?:ne|neq|cdot|times)\b|\\(?:left|right)\s*[()]|(?<![\p{L}])[abxynA](?![\p{L}])|\d+(?:[.,]\d+)?|[⁰¹²³⁴⁵⁶⁷⁸⁹ⁿ]|[()^{}+−\-·/:!=<>≠≤≥⇔⇒×±≈∈√∛π]|[ \t])+/gu;
    const vulgar: Record<string, string> = {'½':'1/2','⅓':'1/3','⅔':'2/3','¼':'1/4','¾':'3/4','⅕':'1/5','⅖':'2/5','⅗':'3/5','⅘':'4/5','⅙':'1/6','⅚':'5/6','⅛':'1/8','⅜':'3/8','⅝':'5/8','⅞':'7/8'};
    // Biểu thức chính quy (regex) kiểm tra hoặc tách chuỗi đúng mẫu dữ liệu
    return part.replace(/[½⅓⅔¼¾⅕⅖⅗⅘⅙⅚⅛⅜⅝⅞]/g, c => ` \\dfrac{${vulgar[c].split('/')[0]}}{${vulgar[c].split('/')[1]}}`).replace(expression, raw => {
      // Biểu thức chính quy (regex) kiểm tra hoặc tách chuỗi đúng mẫu dữ liệu
      if (!/[\dabxynA]/.test(raw)) return raw;
      let start = raw.length - raw.trimStart().length;
      let end = raw.trimEnd().length;
      while (start < end && (raw[start] === ':' || raw[start] === '!')) {
        start++;
        // Biểu thức chính quy (regex) kiểm tra hoặc tách chuỗi đúng mẫu dữ liệu
        while (start < end && /\s/.test(raw[start])) start++;
      }
      while (end > start && (raw[end - 1] === ':' || raw[end - 1] === '!')) {
        end--;
        // Biểu thức chính quy (regex) kiểm tra hoặc tách chuỗi đúng mẫu dữ liệu
        while (end > start && /\s/.test(raw[end - 1])) end--;
      }
      // Biểu thức chính quy (regex) kiểm tra hoặc tách chuỗi đúng mẫu dữ liệu
      if (start >= end || !/[\dabxynA]/.test(raw.slice(start, end))) return raw;
      const body = raw.slice(start, end);
      // Biểu thức chính quy (regex) kiểm tra hoặc tách chuỗi đúng mẫu dữ liệu
      const balance = (body.match(/\(/g) ?? []).length - (body.match(/\)/g) ?? []).length;
      if (balance < 0 && raw[end - 1] === ')') end += balance;
      if (balance > 0 && raw[start] === '(') start += balance;
      // An opening parenthesis before prose belongs to the prose, not this expression.
      if (balance > 0 && raw[end - 1] === '(') {
        end--;
        // Biểu thức chính quy (regex) kiểm tra hoặc tách chuỗi đúng mẫu dữ liệu
        while (end > start && /\s/.test(raw[end - 1])) end--;
      }
      // Biểu thức chính quy (regex) kiểm tra hoặc tách chuỗi đúng mẫu dữ liệu
      if (start >= end || !/[\dabxynA]/.test(raw.slice(start, end))) return raw;
      return raw.slice(0, start) + '$' + formatMath(raw.slice(start, end)) + '$' + raw.slice(end);
    });
  }).join('');
}
