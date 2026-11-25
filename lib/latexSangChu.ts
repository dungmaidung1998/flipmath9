/**
 * FILE NÀY LÀM GÌ: Mô-đun TypeScript/JavaScript hỗ trợ xử lý dữ liệu và nghiệp vụ trong hệ thống FlipMath 9.
 * AI DÙNG: dùng chung
 * LẤY DỮ LIỆU TỪ: không truy vấn bảng trực tiếp
 * GỌI TỚI: không gọi mô-đun nội bộ khác
 */
/**
 * Đổi chữ có công thức $...$ (LaTeX) về chữ thường đọc được, dùng ở những chỗ không vẽ KaTeX:
 * thẻ giáo viên, tệp Word KHBD, lời nhắn rút gọn.
 */
const LENH: Record<string, string> = {
  '\\le': '≤', '\\ge': '≥', '\\ne': '≠', '\\pm': '±', '\\mp': '∓', '\\times': '×', '\\cdot': '·',
  '\\Leftrightarrow': '⇔', '\\Rightarrow': '⇒', '\\to': '→', '\\in': '∈', '\\approx': '≈', '\\perp': '⊥',
  '\\pi': 'π', '\\alpha': 'α', '\\beta': 'β', '\\Delta': 'Δ', '\\Omega': 'Ω', '\\Sigma': 'Σ',
  '\\sin': 'sin', '\\cos': 'cos', '\\tan': 'tan', '\\cot': 'cot', '\\%': '%', '\\{': '{', '\\}': '}',
  '\\left': '', '\\right': ''
};

/**
 * Hàm `mot`: nhận (m), xử lý nghiệp vụ và trả kết quả tương ứng.
 */
function mot(m: string): string {
  let s = m;
  // Biểu thức chính quy (regex) kiểm tra hoặc tách chuỗi đúng mẫu dữ liệu
  s = s.replace(/\\begin\{cases\}([\s\S]*?)\\end\{cases\}/g, (_, c: string) => '{ ' + c.split('\\\\').join('; ') + ' }');
  for (let i = 0; i < 4; i++) {
    s = s
      .replace(/\\dfrac\{([^{}]+)\}\{([^{}]+)\}/g, '$1/$2')
      .replace(/\\sqrt\[3\]\{([^{}]+)\}/g, (_, x: string) => (/^[\w.]+$/.test(x) ? '∛' + x : '∛(' + x + ')'))
      .replace(/\\sqrt\{([^{}]+)\}/g, (_, x: string) => (/^[\w.]+$/.test(x) ? '√' + x : '√(' + x + ')'));
  }
  // Biểu thức chính quy (regex) kiểm tra hoặc tách chuỗi đúng mẫu dữ liệu
  s = s.replace(/\\mathbb\{R\}/g, 'ℝ').replace(/\\mathbb\{N\}/g, 'ℕ')
    .replace(/\^\{2\}/g, '²').replace(/\^\{3\}/g, '³').replace(/\^\{\\circ\}/g, '°')
    .replace(/_\{([^{}]+)\}/g, '$1').replace(/\{,\}/g, ',')
    .replace(/\\[A-Za-z]+|\\[%{}]/g, (c) => (c in LENH ? LENH[c] : c))
    .replace(/-/g, '−').replace(/\s+/g, ' ');
  return s.trim();
}

/**
 * Hàm `latexSangChu`: nhận (s), xử lý nghiệp vụ và trả kết quả tương ứng.
 */
export function latexSangChu(s: string): string {
  // Biểu thức chính quy (regex) kiểm tra hoặc tách chuỗi đúng mẫu dữ liệu
  return String(s ?? '').replace(/\$\$([\s\S]+?)\$\$|\$([^$\n]+)\$/g, (_, a, b) => mot(a ?? b));
}
