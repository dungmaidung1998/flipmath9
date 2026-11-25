/**
 * FILE NÀY LÀM GÌ: Mô-đun TypeScript/JavaScript hỗ trợ xử lý dữ liệu và nghiệp vụ trong hệ thống FlipMath 9.
 * AI DÙNG: dùng chung
 * LẤY DỮ LIỆU TỪ: không truy vấn bảng trực tiếp
 * GỌI TỚI: không gọi mô-đun nội bộ khác
 */
const CONG_THUC = /(\$\$[\s\S]*?\$\$|\$[^$\n]+\$)/g;
// Biểu thức chính quy (regex) kiểm tra hoặc tách chuỗi đúng mẫu dữ liệu
const TU_KHOA = /(?<!\p{L})(lớn nhất|nhỏ nhất|nhiều nhất|ít nhất|không âm|không dương|số nguyên|số tự nhiên|tối đa|tối thiểu)(?!\p{L})/giu;
type Loai = 'mau' | 'can' | 'he' | 'tuKhoa';

/**
 * Hàm `nhom`: nhận (s, start), xử lý nghiệp vụ và trả kết quả tương ứng.
 */
function nhom(s: string, start: number) {
  if (s[start] !== '{') return -1;
  let sau = 1;
  for (let i = start + 1; i < s.length; i++) {
    // Biểu thức chính quy (regex) kiểm tra hoặc tách chuỗi đúng mẫu dữ liệu
    if (s[i] === '\\' && /[{}]/.test(s[i + 1] ?? '')) { i++; continue; }
    if (s[i] === '{') sau++;
    if (s[i] === '}' && --sau === 0) return i;
  }
  return -1;
}

/**
 * Hàm `goiYDocDe`: nhận (daChuanHoa), xử lý nghiệp vụ và trả kết quả tương ứng.
 */
export function goiYDocDe(daChuanHoa: string) {
  const loai = new Set<Loai>();
  const hop = (mau: string, math: string) => '\\colorbox{' + mau + '}{$' + math + '$}';
  function congThuc(s: string): string {
    // Biểu thức chính quy (regex) kiểm tra hoặc tách chuỗi đúng mẫu dữ liệu
    const lenh = /\\(dfrac|frac|sqrt)\s*(?=\{)/g;
    let ketQua = '';
    let docDen = 0;
    for (const k of s.matchAll(lenh)) {
      const i = k.index!;
      if (i < docDen) continue;
      const a = i + k[0].length;
      const b = nhom(s, a);
      if (b < 0) continue;
      const laCan = k[1] === 'sqrt';
      // Biểu thức chính quy (regex) kiểm tra hoặc tách chuỗi đúng mẫu dữ liệu
      const c = laCan ? a : b + 1 + (s.slice(b + 1).match(/^\s*/)?.[0].length ?? 0);
      const d = laCan ? b : nhom(s, c);
      if (d < 0) continue;
      loai.add(laCan ? 'can' : 'mau');
      ketQua += s.slice(docDen, c + 1) + hop(laCan ? '#eaf9ee' : '#fff0ed', congThuc(s.slice(c + 1, d))) + '}';
      docDen = d + 1;
    }
    return ketQua + s.slice(docDen);
  }

  // Một số đề lưu hệ bằng ngoặc nhọn và dấu chấm phẩy.
  const heViet = /\$?\{([^{}\n;]*=[^{}\n;]*);([^{}\n]*=[^{}\n]*)\}\$?/g;
  const doan: { text: string; math?: boolean; block?: boolean; gach?: boolean }[] = [];
  function thuong(s: string) {
    for (const p of s.split(CONG_THUC)) {
      if (!p) continue;
      if (p.startsWith('$') && p.endsWith('$')) {
        const block = p.startsWith('$$');
        const dai = block ? 2 : 1;
        doan.push({ text: congThuc(p.slice(dai, -dai)), math: true, block });
        continue;
      }
      let dau = 0;
      for (const k of p.matchAll(TU_KHOA)) {
        const i = k.index!;
        loai.add('tuKhoa');
        doan.push({ text: p.slice(dau, i) }, { text: k[0], gach: true });
        dau = i + k[0].length;
      }
      doan.push({ text: p.slice(dau) });
    }
  }

  let dau = 0;
  for (const k of daChuanHoa.matchAll(heViet)) {
    const i = k.index!;
    thuong(daChuanHoa.slice(dau, i));
    // Biểu thức chính quy (regex) kiểm tra hoặc tách chuỗi đúng mẫu dữ liệu
    const dong = (s: string) => s.replace(/\$/g, '').trim();
    loai.add('he');
    doan.push({ math: true, text: '\\begin{cases}' + hop('#eaf6ff', congThuc(dong(k[1]))) + '\\\\' +
      hop('#fff0df', congThuc(dong(k[2]))) + '\\end{cases}' });
    dau = i + k[0].length;
  }
  thuong(daChuanHoa.slice(dau));
  return { loai, doan };
}