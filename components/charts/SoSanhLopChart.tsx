/**
 * FILE NÀY LÀM GÌ: Component React giao diện hiển thị và xử lý tương tác của người dùng trên trình duyệt.
 * AI DÙNG: học sinh
 * LẤY DỮ LIỆU TỪ: không truy vấn bảng trực tiếp
 * GỌI TỚI: @/lib/gv/lopCuaToi
 */
import type { ThongKeLop } from '@/lib/gv/lopCuaToi';

type BieuDoConfig = {
  tieuDe: string;
  donVi: string;
  mau: string;
  layGiaTri: (r: ThongKeLop) => number;
  hienThi: (r: ThongKeLop) => string;
  toiDaCoDinh?: number;
};

const BIEU_DO: BieuDoConfig[] = [
  {
    tieuDe: 'Tỉ lệ làm chủ (%)',
    donVi: '%',
    mau: '#22a06b',
    layGiaTri: (r) => r.ti_le_lam_chu ?? 0,
    hienThi: (r) => (r.ti_le_lam_chu == null ? '—' : `${r.ti_le_lam_chu}%`),
    toiDaCoDinh: 100
  },
  {
    tieuDe: 'Học sinh hoạt động',
    donVi: 'HS',
    mau: '#2d5fa8',
    layGiaTri: (r) => r.hs_hoat_dong,
    hienThi: (r) => `${r.hs_hoat_dong}/${r.so_hs} HS`
  },
  {
    tieuDe: 'Lỗi đang mở',
    donVi: 'lỗi',
    mau: '#d97706',
    layGiaTri: (r) => r.loi_dang_mo,
    hienThi: (r) => `${r.loi_dang_mo} lỗi`
  },
  {
    tieuDe: 'Thời gian học (phút)',
    donVi: 'phút',
    mau: '#7c3aed',
    layGiaTri: (r) => r.phut_hoc,
    hienThi: (r) => `${r.phut_hoc} phút`
  }
];

/**
 * Component React `SoSanhLopChart`: nhận props (thuộc tính truyền vào từ component cha) và dựng giao diện tương ứng.
 */
export default function SoSanhLopChart({ rows }: { rows: ThongKeLop[] }) {
  if (!rows.length) return null;

  return (
    <div className="ss-luoi">
      {BIEU_DO.map((bd) => {
        // Tính toán, làm tròn hoặc giới hạn giá trị theo công thức
        const maxVal = bd.toiDaCoDinh ?? Math.max(1, ...rows.map((r) => bd.layGiaTri(r)));
        return (
          <section className="ss-bieudo" key={bd.tieuDe} aria-label={bd.tieuDe}>
            <h2>{bd.tieuDe}</h2>
            <div className="ss-cot-ds">
              {rows.map((r) => {
                const v = bd.layGiaTri(r);
                // Tính toán, làm tròn hoặc giới hạn giá trị theo công thức
                const pct = Math.max(0, Math.min(100, (v / maxVal) * 100));
                return (
                  <div className="ss-cot" key={r.class_id}>
                    <span className="ss-cot__ten">{r.ten_lop}</span>
                    <span className="ss-cot__ray" aria-hidden="true">
                      <span
                        className="ss-cot__fill"
                        style={{ width: `${v > 0 ? Math.max(3, pct) : 0}%`, background: bd.mau }}
                      />
                    </span>
                    <span className="ss-cot__val">{bd.hienThi(r)}</span>
                  </div>
                );
              })}
            </div>
          </section>
        );
      })}
    </div>
  );
}
