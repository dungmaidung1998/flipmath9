"use client";
/**
 * FILE NÀY LÀM GÌ: Component React giao diện hiển thị và xử lý tương tác của người dùng trên trình duyệt.
 * AI DÙNG: học sinh
 * LẤY DỮ LIỆU TỪ: không truy vấn bảng trực tiếp
 * GỌI TỚI: không gọi mô-đun nội bộ khác
 */
import {useEffect} from 'react';
import {useRouter} from 'next/navigation';
/**
 * Tự tải lại lộ trình khi học sinh QUAY LẠI trang — ví dụ sau khi mở vi bài học
 * ở tab khác rồi bấm về.
 *
 * KHÔNG đặt hẹn giờ 15 giây như bản trước. Trang lộ trình chạy khoảng chín truy
 * vấn cộng một lời gọi hàm mỗi lần dựng lại; một lớp 40 em để tab mở là gần
 * 1.400 truy vấn mỗi phút vào Supabase gói miễn phí, mà nội dung trang gần như
 * không đổi giữa hai lần làm bài. Sự kiện focus và visibilitychange đã bắt đúng
 * khoảnh khắc cần làm mới; nhịp 10 phút chỉ để phòng trường hợp trình duyệt
 * không bắn hai sự kiện đó.
 */
export default function RefreshLearningPath(){
  const router=useRouter();
  useEffect(()=>{
    const refresh=()=>{if(!document.hidden)router.refresh();};
    const timer=setInterval(refresh,600000);
    window.addEventListener('focus',refresh);
    document.addEventListener('visibilitychange',refresh);
    return()=>{clearInterval(timer);window.removeEventListener('focus',refresh);document.removeEventListener('visibilitychange',refresh);};
  },[router]);
  return null;
}
