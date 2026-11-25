/**
 * FILE NÀY LÀM GÌ: Trang Next.js App Router trong khu vực học tập đã đăng nhập, nạp dữ liệu ban đầu và hiển thị giao diện tương tác.
 * AI DÙNG: học sinh
 * ĐỊA CHỈ TRÊN WEB: /de-kiem-tra
 * LẤY DỮ LIỆU TỪ: profiles
 * GỌI TỚI: @/lib/supabase/server, @/components/DauTrang, @/components/DeKiemTraHS, @/lib/minhHoa, @/lib/gv/lopCuaToi
 */
import { supabaseServer } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import DauTrang from '@/components/DauTrang';
import DeKiemTraHS from '@/components/DeKiemTraHS';
import { hinhNhanVat } from '@/lib/minhHoa';
import { laVaiTroGV } from '@/lib/gv/lopCuaToi';

export const dynamic = 'force-dynamic';

/**
 * Component React `DeKiemTraHocSinhPage`: nhận props (thuộc tính truyền vào từ component cha) và dựng giao diện tương ứng.
 */
export default async function DeKiemTraHocSinhPage() {
  const db = supabaseServer();
  // Kiểm tra xác thực tài khoản, vai trò giáo viên hoặc điều kiện đồng ý
  const { data: { user } } = await db.auth.getUser();
  if (!user) redirect('/dang-nhap');
  // Truy vấn Supabase: đọc dữ liệu từ bảng profiles
  const { data: p } = await db.from('profiles').select('role').eq('id', user.id).maybeSingle();
  // Kiểm tra xác thực tài khoản, vai trò giáo viên hoặc điều kiện đồng ý
  if (laVaiTroGV(p?.role)) redirect('/gv/de-kiem-tra');

  return (
    <div className="wrap">
      <DauTrang
        tieuDe="Làm thử 15 phút trước kiểm tra"
        phu="Đề theo đúng ma trận 4 mức độ thầy cô vừa tạo cho lớp, chấm ngay và tự đưa lỗi sai vào Sổ lỗi."
        hinh={hinhNhanVat('kinh-lup')}
      />
      <DeKiemTraHS />
    </div>
  );
}
