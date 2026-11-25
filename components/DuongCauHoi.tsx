/**
 * FILE NÀY LÀM GÌ: Component React giao diện hiển thị và xử lý tương tác của người dùng trên trình duyệt.
 * AI DÙNG: học sinh
 * LẤY DỮ LIỆU TỪ: không truy vấn bảng trực tiếp
 * GỌI TỚI: @/lib/minhHoa, @/lib/chuDeChuong, @/components/AnhChuDe
 */
import type { CSSProperties } from 'react';
import { hinhNhanVat } from '@/lib/minhHoa';
import { chuDeChuong } from '@/lib/chuDeChuong';
import AnhChuDe from '@/components/AnhChuDe';

/**
 * Component React `DuongCauHoi`: nhận props (thuộc tính truyền vào từ component cha) và dựng giao diện tương ứng.
 */
export default function DuongCauHoi({
  cau,
  hienTai,
  daLam,
  denCau,
  khoa = false,
  toiDa = cau.length - 1,
  chuong,
  soDung,
}: {
  cau: { question_id: string }[];
  hienTai: number;
  daLam: (id: string) => boolean;
  denCau: (i: number) => void;
  khoa?: boolean;
  toiDa?: number;
  chuong?: string | null;
  soDung?: number;
}) {
  const cd = chuDeChuong(chuong ?? cau[0]?.question_id);
  const soDaLam = cau.filter((c) => daLam(c.question_id)).length;
  const tiLe = typeof soDung === 'number'
    ? soDung / Math.max(1, cau.length)
    : soDaLam / Math.max(1, cau.length);
  // Tính toán, làm tròn hoặc giới hạn giá trị theo công thức
  const muc5 = Math.min(4, Math.max(0, Math.round(tiLe * 4)));

  return (
    <nav
      className={'cau-duong' + (cd ? ' cau-duong--chu-de' : '')}
      aria-label="Tiến độ câu hỏi"
      style={cd ? ({ ['--mau-chuong' as string]: cd.mau } as CSSProperties) : undefined}
    >
      {cd && (
        <div className="cau-duong__muc-bar">
          <img src={cd.anhMuc(muc5)} alt={cd.mucTen[muc5]} width={36} height={36} loading="lazy" />
          <strong>{cd.bieuTuong} {cd.chuDe} · {cd.mucTen[muc5]}</strong>
          <small>
            {typeof soDung === 'number'
              ? `${soDung}/${cau.length} ${cd.donVi}`
              : `${soDaLam}/${cau.length} câu`}
          </small>
        </div>
      )}
      <div style={{ position: 'relative', isolation: 'isolate' }}>
        <svg viewBox="0 0 300 24" preserveAspectRatio="none" aria-hidden="true">
          <path d="M0 12 Q37.5 -2 75 12 T150 12 T225 12 T300 12" />
        </svg>
        <ol>
          {cau.map(({ question_id }, i) => {
            const xong = daLam(question_id);
            return (
              <li key={question_id}>
                <button
                  type="button"
                  aria-current={i === hienTai ? 'step' : undefined}
                  aria-label={`Câu ${i + 1} · ${xong ? 'Đã trả lời' : 'Chưa trả lời'}`}
                  data-xong={xong}
                  disabled={khoa || i > toiDa}
                  onClick={() => denCau(i)}
                >
                  {i === hienTai && (
                    cd ? (
                      <AnhChuDe src={cd.nvBin} fallback={hinhNhanVat('di-hoc')} width={16} height={23} alt="" />
                    ) : (
                      <img src={hinhNhanVat('di-hoc')} width={16} height={23} alt="" />
                    )
                  )}
                  {i + 1}{xong && <span aria-hidden="true"> ✓</span>}
                </button>
              </li>
            );
          })}
        </ol>
      </div>
    </nav>
  );
}
