/**
 * FILE NÀY LÀM GÌ: Component React giao diện hiển thị và xử lý tương tác của người dùng trên trình duyệt.
 * AI DÙNG: học sinh
 * LẤY DỮ LIỆU TỪ: không truy vấn bảng trực tiếp
 * GỌI TỚI: @/components/MathText, @/components/truc-quan/TheCongThuc, @/components/tom-tat/AnhTrangTomTatBai, @/lib/dfle/t9-tom-tat.js, @/lib/dfle/t9-phieu-hoc-tap.js, @/lib/dfle/latex-hoa.js
 */
import MathText from '@/components/MathText';
import TheCongThuc from '@/components/truc-quan/TheCongThuc';
import AnhTrangTomTatBai from '@/components/tom-tat/AnhTrangTomTatBai';
import { tomTatCuaMuc, anhTomTatCuaMuc, BAI_CO_ANH_TRANG_DAY_DU } from '@/lib/dfle/t9-tom-tat.js';
import { phieuHocTap } from '@/lib/dfle/t9-phieu-hoc-tap.js';
import { latexHoa } from '@/lib/dfle/latex-hoa.js';
import './tom-tat.css';

type TomTat = { bai: number; anh: string[]; ghi: { quyTac: string; viDu: string; deSai: string } };

/** Bước sau video: xem ảnh ghi nhớ đúng mục rồi chép vào vở theo thứ tự từ trên xuống. */
export default function TomTatGhiVo({ kuId }: { kuId: string }) {
  const anh = anhTomTatCuaMuc(kuId);
  if (!anh) return null;
  const t = tomTatCuaMuc(kuId) as TomTat | null;
  const p = phieuHocTap(kuId) as { ten: string; viDu: { de: string; giai: string }[]; loiHayGap: string[] } | null;
  const M = ({ c }: { c: string }) => <MathText>{latexHoa(String(c))}</MathText>;
  return (
    <section className="tt" aria-labelledby={`tt-${kuId}`}>
      <h2 id={`tt-${kuId}`} className="sr-only">Xem tóm tắt rồi chép vào vở</h2>
      <TheCongThuc kuId={kuId}/>
      <div className="tt-anh">
        <a href={anh} target="_blank" rel="noreferrer" title="Mở ảnh to">
          <img src={anh} alt={`Sơ đồ ghi nhớ: ${p?.ten ?? kuId}`} width={1024} height={1536} loading="lazy" decoding="async" />
        </a>
      </div>
      <p className="tt-nguon">
        Sơ đồ ghi nhớ · FlipMath9 ·{' '}
        <a href={anh} target="_blank" rel="noreferrer">Mở ảnh đầy đủ</a>
      </p>

      {t && <div className="tt-vo">
        <h3>✍️ Chép vào vở (4 dòng)</h3>
        <ol>
          <li><span className="tt-nhan">Quy tắc</span> <span className="tt-khung"><MathText>{t.ghi.quyTac}</MathText></span> <small>(đóng khung trong vở)</small></li>
          <li><span className="tt-nhan">Ví dụ</span> <MathText>{t.ghi.viDu}</MathText></li>
          <li><span className="tt-nhan">Dễ sai</span> <MathText>{t.ghi.deSai}</MathText></li>
          <li><span className="tt-nhan">Câu em muốn hỏi</span> em tự viết một câu hỏi về chỗ chưa hiểu, mang lên lớp hỏi thầy cô (chưa có thì để trống).</li>
        </ol>
      </div>}

      {!!p?.viDu?.length && (
        <details className="tt-them">
          <summary>📘 Ví dụ mẫu có lời giải</summary>
          {p.viDu.map((v) => (
            <div key={v.de} className="tt-vd"><p><b>Đề:</b> <M c={v.de} /></p><p><b>Giải:</b> <M c={v.giai} /></p></div>
          ))}
        </details>
      )}
      {!!p?.loiHayGap?.length && (
        <details className="tt-them">
          <summary>⚠️ Lỗi hay gặp</summary>
          <ul>{p.loiHayGap.map((l) => <li key={l}><M c={l} /></li>)}</ul>
        </details>
      )}
      {t && BAI_CO_ANH_TRANG_DAY_DU.has(t.bai) && (
        <details className="tt-them">
          <summary>🗺 Trang tóm tắt cả Bài {t.bai}</summary>
          <AnhTrangTomTatBai bai={t.bai} />
        </details>
      )}
      {p && (
        <p className="tt-in"><a href={`/phieu/${encodeURIComponent(kuId)}`}>🖨 Phiếu in ra giấy (nếu thầy cô phát phiếu)</a></p>
      )}
    </section>
  );
}
