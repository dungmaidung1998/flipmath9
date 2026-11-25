/**
 * FILE NÀY LÀM GÌ: Component React giao diện hiển thị và xử lý tương tác của người dùng trên trình duyệt.
 * AI DÙNG: học sinh
 * LẤY DỮ LIỆU TỪ: không truy vấn bảng trực tiếp
 * GỌI TỚI: @/lib/capDo, @/lib/diaDanh
 */
import { CAP_DO } from '@/lib/capDo';
import { DIA_DANH } from '@/lib/diaDanh';

/** Huy hiệu cấp độ làm chủ cho học sinh: biểu tượng + tên + (m/3). */
export default function CapDo({ m, nho, chuong }: { m: number | null | undefined; nho?: boolean; chuong?: string }) {
  const dia = chuong ? DIA_DANH[chuong] : undefined;
  if (dia) {
    // Cấp theo chủ đề Đà Nẵng của chương: chưa có bài làm = mức 0 (vd. "Giỏ trống"), cấp m = mức m+1.
    const i = m != null && CAP_DO[m] ? m + 1 : 0;
    const c = i > 0 ? CAP_DO[i - 1] : null;
    return (
      <span className={'cap-do cap-do--vuon' + (i === 0 ? ' cap-do--trong' : '')}
        style={c ? { color: c.mau, background: c.nen } : { color: dia.mau }}
        title={c ? `${dia.mucTen[i]} · ${c.ten} (cấp ${i}/4): ${c.y}` : `${dia.mucTen[0]}: em cần làm thêm bài để lên cấp`}>
        <img src={`/vuon/${chuong}-${i}.webp`} width={26} height={26} alt="" loading="lazy" decoding="async" />
        {dia.mucTen[i]}{!nho && c && <small aria-hidden="true"> · cấp {i}/4</small>}
      </span>
    );
  }
  if (m == null || !CAP_DO[m]) return <span className="cap-do cap-do--trong">Cần thêm bài làm</span>;
  const c = CAP_DO[m];
  return (
    <span className={'cap-do' + (nho ? ' cap-do--nho' : '')} style={{ color: c.mau, background: c.nen }} title={`${c.ten} (cấp ${m + 1}/4): ${c.y}`}>
      <span aria-hidden="true">{c.bieuTuong}</span> {c.ten}{!nho && <small aria-hidden="true"> · cấp {m + 1}/4</small>}
    </span>
  );
}

/** Chú giải 4 cấp độ. */
export function ChuGiaiCapDo() {
  return (
    <ul className="cap-do-chu-giai" aria-label="Bốn cấp độ làm chủ">
      {CAP_DO.map((c, i) => (
        <li key={c.ten}><CapDo m={i} /><span>{c.y}</span></li>
      ))}
    </ul>
  );
}
