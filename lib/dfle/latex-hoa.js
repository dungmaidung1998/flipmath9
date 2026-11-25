/**
 * Chuyển chữ có công thức viết bằng ký tự Unicode (x², √(x − 1), 35°, { x + y = 3; x − y = 1 })
 * thành chữ có công thức LaTeX bọc trong $...$ để web hiển thị bằng KaTeX.
 *
 * Chạy lúc sinh tệp SQL (cli/emit-toan-9.js). Nguồn nội dung vẫn viết bằng Unicode cho dễ đọc, dễ sửa.
 * Phần chữ thường giữ nguyên; chỉ những đoạn là công thức mới được bọc $...$.
 */

const HAM = { sin: '\\sin', cos: '\\cos', tan: '\\tan', cot: '\\cot' };
const DAC_BIET = { Sxq: 'S_{xq}', Stp: 'S_{tp}' };
const CAP_CHU = new Set(['xy', 'ax', 'bx', 'cx', 'mx', 'ac', 'ab', 'bc', 'bd', 'uv', 'by']);
const LOAI_TRU = new Set(['SHIFT', 'SAI', 'MTC', 'II', 'III', 'IV', 'VI', 'VII', 'VIII', 'IX', 'Sin', 'Cos', 'Tan', 'Cot']);
const DON_VI = new Set(['cm', 'km', 'kg', 'dm', 'mm', 'ml', 'ha', 'm', 'h', 'g']);
const TRUOC_SO_LA_MA = /(đội|tổ|vòi|máy|xe|nhóm|người|phần|khu|ô tô|lớp|câu|thứ|tư)\s*$/iu;

const KY_HIEU = {
  '+': '+', '−': '-', '-': '-', '=': '=', '<': '<', '>': '>',
  '≤': '\\le ', '≥': '\\ge ', '≠': '\\ne ', '±': '\\pm ', '∓': '\\mp ', '×': '\\times ', '·': '\\cdot ',
  '⇔': '\\Leftrightarrow ', '⇒': '\\Rightarrow ', '→': '\\to ', '∈': '\\in ', '≈': '\\approx ', '⊥': '\\perp ',
  '|': '|', '^': '^', '²': '^{2}', '³': '^{3}', '°': '^{\\circ}', '′': "'", '%': '\\%',
  'π': '\\pi ', 'α': '\\alpha ', 'β': '\\beta ', 'Δ': '\\Delta ', 'Ω': '\\Omega ', 'Σ': '\\Sigma ',
  'ℝ': '\\mathbb{R}', 'ℕ': '\\mathbb{N}', '/': '/', '√': '√', '∛': '∛'
};
const MO = '([{', DONG = ')]}';

/** Tách chuỗi thành các mảnh: {t: kiểu, s: chữ}. */
function tach(s) {
  const out = [];
  const re = /(\s+)|(\d+(?:,\d+)?)|([παβΔΩΣℝℕ])|([\p{L}\p{M}]+)|(.)/gsu;
  let m;
  while ((m = re.exec(s))) {
    if (m[1]) out.push({ t: 'cach', s: m[1] });
    else if (m[2]) out.push({ t: 'so', s: m[2] });
    else if (m[3]) out.push({ t: 'kh', s: m[3] });
    else if (m[4]) out.push({ t: 'chu', s: m[4] });
    else out.push({ t: 'kh', s: m[5] });
  }
  return out;
}

function laChuToan(tk, i, ds, nguon, viTri) {
  const w = tk.s;
  if (/[^A-Za-z]/.test(w)) return false;
  if (LOAI_TRU.has(w)) return false;
  if (HAM[w] || DAC_BIET[w]) return true;
  if (w === 'I' && TRUOC_SO_LA_MA.test(nguon.slice(0, viTri))) return false;
  // Đơn vị đo đứng ngay sau một số: "5 cm", "34 m", "2 h" (trừ khi sau nó là dấu so sánh).
  if (DON_VI.has(w)) {
    let j = i - 1; if (ds[j]?.t === 'cach') j--;
    let k = i + 1; while (ds[k]?.t === 'cach') k++;
    const sau = ds[k]?.s ?? '';
    if ((ds[j]?.t === 'so' || ds[j]?.s === 'π') && !/^[=<>≤≥≠]$/.test(sau)) return false;
    if (ds[i - 1]?.s === '(' && (sau === ',' || sau === ')')) return false;
  }
  if (w.length === 1) return true;
  if (/^[A-Z]{2,6}$/.test(w)) return true;
  if (/^O[xy]$/.test(w)) return true;
  if (CAP_CHU.has(w)) return true;
  // Tích nhiều biến viết liền: x1x2 đã tách bởi số; còn lại như "abc" thì coi là chữ thường.
  return false;
}

/** Mảnh nào là công thức (m), mảnh nào trung tính (n: ngoặc, ; ), mảnh nào là chữ (c). */
function phanLoai(ds, nguon) {
  let viTri = 0;
  return ds.map((tk, i) => {
    const p = viTri; viTri += tk.s.length;
    if (tk.t === 'cach') return 'cach';
    if (tk.t === 'so') return 'm';
    if (tk.t === 'chu') return laChuToan(tk, i, ds, nguon, p) ? 'm' : 'c';
    if (MO.includes(tk.s) || DONG.includes(tk.s) || tk.s === ';') return 'n';
    if (tk.s === ':' && ds[i - 1]?.t === 'cach' && ds[i + 1]?.t === 'cach') return 'n';
    if (tk.s in KY_HIEU) return 'm';
    return 'c';
  });
}

/** Đổi phần đuôi đơn vị "cm²" thành chữ thường (không phải công thức). */
function giuDonVi(ds, loai) {
  for (let i = 1; i < ds.length; i++) {
    if ((ds[i].s === '²' || ds[i].s === '³') && ds[i - 1].t === 'chu' && loai[i - 1] === 'c') loai[i] = 'c';
    if (ds[i].s === '/' && loai[i - 1] === 'c' && ds[i - 1].t === 'chu' && DON_VI.has(ds[i - 1].s) && ds[i + 1] && DON_VI.has(ds[i + 1].s)) {
      loai[i] = 'c'; loai[i + 1] = 'c';
    }
  }
}

/** Gom các đoạn công thức liền nhau thành [bắt đầu, kết thúc). */
function gom(ds, loai) {
  const doan = [];
  let i = 0;
  while (i < ds.length) {
    if (loai[i] !== 'm' && !(loai[i] === 'n' && MO.includes(ds[i].s) && batDauToan(ds, loai, i + 1))) { i++; continue; }
    let j = i, sau = 0;
    while (j < ds.length && (loai[j] === 'm' || loai[j] === 'n' || loai[j] === 'cach')) {
      if (MO.includes(ds[j].s)) sau++;
      if (DONG.includes(ds[j].s)) sau--;
      // Dấu ; ở ngoài ngoặc là dấu ngắt câu, không thuộc công thức.
      if (ds[j].s === ';' && sau <= 0) break;
      j++;
    }
    catDoan(ds, loai, i, j, doan);
    i = j === i ? i + 1 : j;
  }
  return doan;
}

/** Cắt bỏ ngoặc lẻ (không có cặp) rồi gọt hai đầu. */
function catDoan(ds, loai, a, b, doan) {
  const ngan = [], ngoac = [];
  for (let k = a; k < b; k++) {
    if (MO.includes(ds[k].s)) ngoac.push(k);
    else if (DONG.includes(ds[k].s)) { if (ngoac.length) ngoac.pop(); else ngan.push(k); }
  }
  ngan.push(...ngoac);
  if (ngan.length) {
    ngan.sort((x, y) => x - y);
    let s = a;
    for (const k of ngan) { catDoan(ds, loai, s, k, doan); s = k + 1; }
    catDoan(ds, loai, s, b, doan);
    return;
  }
  while (a < b && (loai[a] === 'cach' || ds[a].s === ';' || ds[a].s === ':')) a++;
  while (b > a && (loai[b - 1] === 'cach' || ds[b - 1].s === ';' || ds[b - 1].s === ':')) b--;
  if (a < b && ds.slice(a, b).some((t, k) => loai[a + k] === 'm')) doan.push([a, b]);
}

function batDauToan(ds, loai, k) {
  while (ds[k] && loai[k] === 'cach') k++;
  return loai[k] === 'm' || (loai[k] === 'n' && MO.includes(ds[k].s));
}

/** Đổi một đoạn mảnh công thức sang LaTeX. */
function sangLatex(ds) {
  // Hệ phương trình "{ A; B }" → cases.
  const chu = ds.map((t) => t.s).join('');
  const he = chu.match(/^\{\s*([^{}]+?)\s*\}$/);
  if (he && he[1].includes(';') && /[=<>≤≥]/.test(he[1])) {
    return '\\begin{cases}' + he[1].split(';').map((p) => sangLatex(tach(p.trim()))).join('\\\\') + '\\end{cases}';
  }
  let out = '', chiSoTruoc = -1;
  for (let i = 0; i < ds.length; i++) {
    const t = ds[i];
    if (t.t === 'cach') { out += ' '; continue; }
    if (t.t === 'so') {
      // Phân số đơn giản: a/b với a, b là số hoặc một chữ.
      out += t.s.replace(',', '{,}');
      continue;
    }
    if (t.t === 'chu') {
      if (HAM[t.s]) { out += HAM[t.s] + ' '; continue; }
      if (DAC_BIET[t.s]) { out += DAC_BIET[t.s]; continue; }
      // Chỉ số: x0, x1, y2 (một chữ thường đứng ngay trước một chữ số).
      const sau = ds[i + 1];
      if (/^[a-z]$/.test(t.s) && sau?.t === 'so' && /^\d$/.test(sau.s) && (ds[i - 1]?.t !== 'so' || chiSoTruoc === i - 1)) {
        out += `${t.s}_{${sau.s}}`; i++; chiSoTruoc = i; continue;
      }
      out += t.s;
      continue;
    }
    if (t.s === '√' || t.s === '∛') {
      const dau = t.s === '√' ? '\\sqrt{' : '\\sqrt[3]{';
      let k = i + 1;
      if (ds[k]?.s === '(') {
        let mo = 0, e = k;
        for (; e < ds.length; e++) { if (ds[e].s === '(') mo++; if (ds[e].s === ')') { mo--; if (mo === 0) break; } }
        out += dau + sangLatex(ds.slice(k + 1, e)) + '}';
        i = e;
      } else if (ds[k] && (ds[k].t === 'so' || ds[k].t === 'chu' || /[πα]/.test(ds[k].s))) {
        out += dau + sangLatex([ds[k]]) + '}';
        i = k;
      } else out += dau.replace('{', '{\\,}');
      continue;
    }
    if (t.s === '{') { out += '\\{'; continue; }
    if (t.s === '}') { out += '\\}'; continue; }
    out += KY_HIEU[t.s] ?? t.s;
  }
  // a/b đơn giản → phân số đứng.
  out = out.replace(/(?<![\w}])(\d+(?:\{,\}\d+)?|[a-zA-Z])\s*\/\s*(\d+(?:\{,\}\d+)?|[a-zA-Z])(?![\w{])/g, '\\dfrac{$1}{$2}');
  return out.replace(/\s+/g, ' ').trim();
}

export function latexHoa(s) {
  if (typeof s !== 'string' || !s || s.includes('$')) return s;
  const ds = tach(s);
  const loai = phanLoai(ds, s);
  giuDonVi(ds, loai);
  const doan = gom(ds, loai);
  if (!doan.length) return s;
  let out = '', k = 0;
  for (const [a, b] of doan) {
    out += ds.slice(k, a).map((t) => t.s).join('');
    out += '$' + sangLatex(ds.slice(a, b)) + '$';
    k = b;
  }
  return out + ds.slice(k).map((t) => t.s).join('');
}

/** Áp latexHoa cho mọi chuỗi trong một đối tượng (giữ nguyên khoá). */
export function latexHoaSau(o, boQua = new Set()) {
  if (typeof o === 'string') return latexHoa(o);
  if (Array.isArray(o)) return o.map((x) => latexHoaSau(x, boQua));
  if (o && typeof o === 'object') return Object.fromEntries(Object.entries(o).map(([k, v]) => [k, boQua.has(k) ? v : latexHoaSau(v, boQua)]));
  return o;
}
