/**
 * FILE NÀY LÀM GÌ: Trang giao diện dành cho giáo viên trong khu vực đã đăng nhập, tổng hợp số liệu lớp và hỗ trợ điều chỉnh dạy học.
 * AI DÙNG: giáo viên
 * ĐỊA CHỈ TRÊN WEB: /gv/quet-phieu
 * LẤY DỮ LIỆU TỪ: students, knowledge_units
 * GỌI TỚI: @/components/gv/BoLoc, @/components/gv/QuetPhieuClient, @/lib/gv/lopCuaToi, @/lib/supabase/server
 */
import { batBuocGiaoVien } from '@/components/gv/BoLoc';
import QuetPhieuClient from '@/components/gv/QuetPhieuClient';
import { lopCuaToi } from '@/lib/gv/lopCuaToi';
import { supabaseAdmin } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';

/**
 * Component React `QuetPhieuPage`: nhận props (thuộc tính truyền vào từ component cha) và dựng giao diện tương ứng.
 */
export default async function QuetPhieuPage() {
  // Kiểm tra xác thực tài khoản, vai trò giáo viên hoặc điều kiện đồng ý
  const { db } = await batBuocGiaoVien();
  const lops = await lopCuaToi(db);
  if (!lops.length) {
    return (
      <div className="mc">
        <h1>Quét phiếu QR</h1>
        <p className="mc-trong">Thầy cô chưa được phân công lớp nào.</p>
      </div>
    );
  }

  const admin = supabaseAdmin();
  const classIds = lops.map((l) => l.class_id);
  const [{ data: hsRows }, { data: units }] = await Promise.all([
    admin.from('students').select('student_id, class_id, display_name').in('class_id', classIds).order('student_id'),
    admin.from('knowledge_units').select('ku_id, ku_name, order_index').order('order_index'),
  ]);

  return (
    <QuetPhieuClient
      lops={lops}
      students={(hsRows ?? []).map((s) => ({
        student_id: String(s.student_id),
        class_id: String(s.class_id),
        ten: String(s.display_name || s.student_id),
      }))}
      units={(units ?? []).map((u) => ({
        ku_id: String(u.ku_id),
        ku_name: String(u.ku_name),
      }))}
    />
  );
}
