/**
 * FILE NÀY LÀM GÌ: Component React giao diện hiển thị và xử lý tương tác của người dùng trên trình duyệt.
 * AI DÙNG: học sinh
 * LẤY DỮ LIỆU TỪ: không truy vấn bảng trực tiếp
 * GỌI TỚI: @/lib/dfle/gamification.js, @/components/AnhChuDe
 */
import { BADGE_BY_CODE } from '@/lib/dfle/gamification.js';
import AnhChuDe from '@/components/AnhChuDe';
import './truc-quan.css';

/**
 * Component React `HuyHieuMoi`: nhận props (thuộc tính truyền vào từ component cha) và dựng giao diện tương ứng.
 */
export default function HuyHieuMoi({ codes }: { codes?: string[] }) {
  const moi = (codes ?? []).flatMap(code => {
    const h = BADGE_BY_CODE.get(code);
    return h ? [h] : [];
  });
  if (!moi.length) return null;

  return <aside className="tq-huy-hieu" aria-label="Huy hiệu mới nhận">
    <AnhChuDe src="/chu-de/linh-vat/ca-chep-hoa-rong.webp" fallback="/minh-hoa/bt/huy-hieu.webp" width={76} height={76} loading="lazy" alt="Cá chép hóa rồng" />
    <div><strong>Em vừa nhận huy hiệu</strong>
      <ul>{moi.map(h => <li key={h.code} title={h.desc}>{h.name}</li>)}</ul>
    </div>
  </aside>;
}

