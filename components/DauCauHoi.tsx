/**
 * FILE NÀY LÀM GÌ: Component React giao diện hiển thị và xử lý tương tác của người dùng trên trình duyệt.
 * AI DÙNG: học sinh
 * LẤY DỮ LIỆU TỪ: không truy vấn bảng trực tiếp
 * GỌI TỚI: @/lib/chapters, @/lib/diaDanh, @/lib/nhanVat, @/lib/minhHoa, @/lib/chuDeChuong, @/components/AnhChuDe
 */
import type { CSSProperties } from 'react';
import { CHAPTERS, chapterOf } from '@/lib/chapters';
import { DIA_DANH } from '@/lib/diaDanh';
import { LOI_CAU_CUOI, LOI_CO_VU_CAU_HOI } from '@/lib/nhanVat';
import { hinhNhanVat } from '@/lib/minhHoa';
import { chuDeChuong } from '@/lib/chuDeChuong';
import AnhChuDe from '@/components/AnhChuDe';

/**
 * Component React `DauCauHoi`: nhận props (thuộc tính truyền vào từ component cha) và dựng giao diện tương ứng.
 */
export default function DauCauHoi({ ma, viTri, tong, daChon, soDaLam, chuong, soDung }: {
  ma: string; viTri: number; tong: number; daChon: boolean; soDaLam: number; chuong?: string | null; soDung?: number;
}) {
  const cd = chuDeChuong(ma) ?? chuDeChuong(chuong);
  const id = cd?.chuong ?? chapterOf(ma) ?? chuong ?? undefined;
  const dia = id ? DIA_DANH[id] : undefined;
  const nhan = CHAPTERS.find(c => c.id === id)?.label;
  const cuoi = viTri === tong;
  const loi = cuoi ? LOI_CAU_CUOI : soDaLam > 0 && soDaLam % 3 === 0
    ? LOI_CO_VU_CAU_HOI[(soDaLam / 3 - 1) % LOI_CO_VU_CAU_HOI.length]
    : null;
  const tuThe = cuoi ? 'reo-ho' : daChon ? 'chi-bang' : 'suy-nghi';
  // Tính toán, làm tròn hoặc giới hạn giá trị theo công thức
  const muc5 = Math.min(4, Math.max(0, Math.round(((typeof soDung === 'number' ? soDung : soDaLam) / Math.max(1, tong)) * 4)));
  const fallbackNv = tuThe === 'chi-bang' ? '/minh-hoa/nv/chi-bang.webp' : hinhNhanVat(tuThe);

  return (
    <span className="cau-dau" data-cuoi={cuoi} style={dia ? { '--mau-chuong': dia.mau } as CSSProperties : undefined}>
      {cd ? (
        <img src={cd.anhMuc(muc5)} alt="" width={40} height={40} loading="lazy" />
      ) : dia && id ? (
        <img src={`/chu-de/canh/${id}.webp`} alt="" width={54} height={34} loading="lazy" />
      ) : null}
      <strong>
        {nhan && `${nhan}${cd ? ` · 📍 ${cd.ten}` : ''} · `}
        Câu {viTri}/{tong}{cuoi && <span aria-hidden="true"> 🏁</span>}
        {loi && <small className="cau-co-vu">{loi}</small>}
      </strong>
      {cd ? (
        <AnhChuDe
          className="cau-dau__nv"
          src={tuThe === 'suy-nghi' ? cd.nvNa : cd.nvBin}
          fallback={fallbackNv}
          alt=""
          width={32}
          height={40}
        />
      ) : (
        <img className="cau-dau__nv" src={fallbackNv} alt="" width={32} height={40} />
      )}
    </span>
  );
}
