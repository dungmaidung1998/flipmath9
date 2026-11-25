/**
 * FILE NÀY LÀM GÌ: Trang Next.js App Router trong khu vực học tập đã đăng nhập, nạp dữ liệu ban đầu và hiển thị giao diện tương tác.
 * AI DÙNG: học sinh
 * LẤY DỮ LIỆU TỪ: không truy vấn bảng trực tiếp
 * GỌI TỚI: @/components/MathText
 */
import MathText from '@/components/MathText';

// Biểu thức chính quy (regex) kiểm tra hoặc tách chuỗi đúng mẫu dữ liệu
const QUAN_HE = /^(=|≠|≥|≤|<|>|⇔|⇒)$/;
const TU_THUONG_HAI_CHU = new Set([
  'ta', 'co', 'de', 'bi', 'do', 'ra', 'so', 'in', 'is', 'of', 'to', 'or', 'if', 'as', 'at', 'by', 'on', 'no', 'we',
  'an', 'be', 'do', 'go', 'he', 'it', 'me', 'my', 'so', 'up', 'us', 'va', 'la', 'ma', 'ai', 'em', 'ba', 'me', 'bo'
]);
/** Một từ "có vẻ toán": chỉ gồm số, kí hiệu, chữ cái Latin ngắn (≤ 2 chữ liền nhau, không dấu tiếng Việt). */
const laToan = (w: string) =>
  !TU_THUONG_HAI_CHU.has(w.toLowerCase().replace(/[,;.:()[\]{}]+/g, '')) &&
  /^[0-9a-zA-Z√²³±−+\-·×/()[\]{};,.:Ωπ'=≠≥≤<>⇔⇒]+$/.test(w) &&
  !/[a-zA-Z]{3,}/.test(w);

/** Tách một dòng thành chữ thường + các cụm công thức có dấu quan hệ (=, ≠, ≥...). */
export function tachCongThuc(s: string): { ct: boolean; t: string }[] {
  // Biểu thức chính quy (regex) kiểm tra hoặc tách chuỗi đúng mẫu dữ liệu
  const w = s.split(/(\s+)/);
  const ra: { ct: boolean; t: string }[] = [];
  let i = 0;
  while (i < w.length) {
    if (w[i].trim() && laToan(w[i])) {
      let j = i, coQH = false;
      let sau = 0;
      while (j < w.length && (!w[j].trim() || laToan(w[j]))) {
        // Biểu thức chính quy (regex) kiểm tra hoặc tách chuỗi đúng mẫu dữ liệu
        if (QUAN_HE.test(w[j]) || /[=≠≥≤⇔]/.test(w[j])) coQH = true;
        // Tính toán, làm tròn hoặc giới hạn giá trị theo công thức
        for (const ch of w[j]) { if ('([{'.includes(ch)) sau++; else if (')]}'.includes(ch)) sau = Math.max(0, sau - 1); }
        j++;
        // Biểu thức chính quy (regex) kiểm tra hoặc tách chuỗi đúng mẫu dữ liệu
        if (sau === 0 && /[,;:]$/.test(w[j - 1])) break; // hết một công thức: "x = 1, y = 2" → hai khung
      }
      while (j > i && !w[j - 1].trim()) j--;
      if (coQH) {
        let cum = w.slice(i, j).join('');
        // Biểu thức chính quy (regex) kiểm tra hoặc tách chuỗi đúng mẫu dữ liệu
        const duoi = /[,;.:]+$/.exec(cum)?.[0] ?? '';
        cum = cum.slice(0, cum.length - duoi.length);
        ra.push({ ct: true, t: cum });
        if (duoi) ra.push({ ct: false, t: duoi });
        i = j; continue;
      }
    }
    ra.push({ ct: false, t: w[i] }); i++;
  }
  // gộp các mẩu chữ liền nhau
  return ra.reduce<{ ct: boolean; t: string }[]>((a, x) => {
    const c = a[a.length - 1];
    if (c && !c.ct && !x.ct) c.t += x.t; else a.push({ ...x });
    return a;
  }, []);
}

/** Hiện dòng chữ, mỗi công thức nằm trong một khung riêng có hiệu ứng nhấp nháy nhẹ. */
export default function CongThuc({ c }: { c: string }) {
  return <>{tachCongThuc(c).map((x, k) => x.ct
    ? <span key={k} className="sl-ct"><MathText>{x.t}</MathText></span>
    : x.t.trim() ? <MathText key={k}>{x.t}</MathText> : <span key={k}>{x.t}</span>)}</>;
}
