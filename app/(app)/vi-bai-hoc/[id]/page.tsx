/**
 * FILE NÀY LÀM GÌ: Trang Next.js App Router trong khu vực học tập đã đăng nhập, nạp dữ liệu ban đầu và hiển thị giao diện tương tác.
 * AI DÙNG: học sinh
 * ĐỊA CHỈ TRÊN WEB: /vi-bai-hoc/[id]
 * LẤY DỮ LIỆU TỪ: không truy vấn bảng trực tiếp
 * GỌI TỚI: @/lib/supabase/server, @/components/ViBaiHoc
 */
import { supabaseServer } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import ViBaiHoc from '@/components/ViBaiHoc';

export const dynamic = 'force-dynamic';

/**
 * TRANG VI BÀI HỌC SỬA LỖI
 *
 * Đây là mắt xích cuối của vòng lặp thích ứng: học sinh làm sai → hệ thống nhận
 * ra quan niệm sai qua mã lỗi → giao đúng vi bài học của mã lỗi đó → em đọc và
 * tự kiểm → quay lại làm bài vận dụng.
 *
 * Nội dung lấy qua API chứ không truy vấn thẳng ở trang này, vì API là chỗ kiểm
 * hai việc mà trang không tự kiểm được: vi bài học có được giao cho chính em đó
 * không, và đáp án phần tự kiểm phải giữ lại ở máy chủ cho tới khi em nộp bài.
 */
export default async function TrangViBaiHoc({ params }: { params: { id: string } }) {
  const supabase = supabaseServer();
  // Kiểm tra xác thực tài khoản, vai trò giáo viên hoặc điều kiện đồng ý
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/dang-nhap');

  return (
    <div className="wrap">
      <ViBaiHoc id={decodeURIComponent(params.id)} />
    </div>
  );
}
