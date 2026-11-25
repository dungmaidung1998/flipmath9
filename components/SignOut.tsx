'use client';
/**
 * FILE NÀY LÀM GÌ: Component React giao diện hiển thị và xử lý tương tác của người dùng trên trình duyệt.
 * AI DÙNG: học sinh
 * LẤY DỮ LIỆU TỪ: không truy vấn bảng trực tiếp
 * GỌI TỚI: @/lib/supabase/client
 */
import { supabaseBrowser } from '@/lib/supabase/client';

/**
 * Component React `SignOut`: nhận props (thuộc tính truyền vào từ component cha) và dựng giao diện tương ứng.
 */
export default function SignOut() {
  return (
    <a
      href="#"
      onClick={async (e) => {
        e.preventDefault();
        await supabaseBrowser().auth.signOut();
        // Máy dùng chung: xoá các trang đã lưu để người sau không xem được Sổ lỗi, Tiến độ của em
        try {
          if ('caches' in window) await caches.delete('flipmath9-pages-v1');
        } catch { /* bỏ qua */ }
        window.location.href = '/dang-nhap';
      }}
    >
      Đăng xuất
    </a>
  );
}
