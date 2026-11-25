/**
 * FILE NÀY LÀM GÌ: Trang công khai (cho phép mở không cần tài khoản) kèm xử lý giới hạn dữ liệu an toàn riêng tư.
 * AI DÙNG: công khai / phụ huynh
 * ĐỊA CHỈ TRÊN WEB: /phu-huynh
 * LẤY DỮ LIỆU TỪ: không truy vấn bảng trực tiếp
 * GỌI TỚI: @/components/AnhChuDe, @/components/phu-huynh/PhuHuynhClient
 */
import AnhChuDe from '@/components/AnhChuDe';
import PhuHuynhClient from '@/components/phu-huynh/PhuHuynhClient';

export const dynamic = 'force-dynamic';

/**
 * Component React `PhuHuynhPage`: nhận props (thuộc tính truyền vào từ component cha) và dựng giao diện tương ứng.
 */
export default function PhuHuynhPage() {
  return (
    <main className="wrap" style={{ maxWidth: 760, margin: '0 auto', padding: '16px 12px 48px' }}>
      <p style={{ margin: '0 0 10px' }}>
        <a className="action-link" href="/dang-nhap">← Trang đăng nhập</a>
      </p>
      <div style={{ marginBottom: 14 }}>
        <AnhChuDe
          src="/tinh-nang/phu-huynh/dau-trang.webp"
          fallback="/minh-hoa/nv/chao.webp"
          alt="Cổng dành cho phụ huynh"
          width={960}
          height={280}
          style={{ width: '100%', maxHeight: 190, objectFit: 'cover', borderRadius: 14, border: '1px solid var(--line)' }}
        />
      </div>
      <h1 style={{ margin: '0 0 6px' }}>Đồng hành cùng con — Cổng phụ huynh</h1>
      <p className="hint" style={{ margin: '0 0 16px' }}>
        Theo dõi thời lượng tự học và đặt giới hạn nghỉ ngơi hợp lý cho con em.
      </p>
      <PhuHuynhClient />
    </main>
  );
}
