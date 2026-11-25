/**
 * FILE NÀY LÀM GÌ: Trang giao diện dành cho giáo viên trong khu vực đã đăng nhập, tổng hợp số liệu lớp và hỗ trợ điều chỉnh dạy học.
 * AI DÙNG: giáo viên
 * ĐỊA CHỈ TRÊN WEB: /gv/hoc-sinh
 * LẤY DỮ LIỆU TỪ: profiles, students
 * GỌI TỚI: @/lib/supabase/server, @/components/ThemHocSinh, @/components/gv/BangDongThuan, @/components/gv/BoLoc, @/lib/gv/lopCuaToi
 */
import { supabaseServer } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import ThemHocSinh from '@/components/ThemHocSinh';
import BangDongThuan from '@/components/gv/BangDongThuan';
import { docCookieLop } from '@/components/gv/BoLoc';
import { chonLopTu, laVaiTroGV, lopCuaToi, nhanTruongLop, tenHienThiLop } from '@/lib/gv/lopCuaToi';

export const dynamic = 'force-dynamic';

/**
 * Component React `QuanLyHocSinh`: nhận props (thuộc tính truyền vào từ component cha) và dựng giao diện tương ứng.
 */
export default async function QuanLyHocSinh({ searchParams }: { searchParams: { lop?: string } }) {
  const supabase = supabaseServer();
  // Kiểm tra xác thực tài khoản, vai trò giáo viên hoặc điều kiện đồng ý
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/dang-nhap');

  const { data: profile } = await supabase
    .from('profiles').select('role').eq('id', user.id).maybeSingle();
  // Kiểm tra xác thực tài khoản, vai trò giáo viên hoặc điều kiện đồng ý
  if (!laVaiTroGV(profile?.role)) redirect('/');

  const classes = await lopCuaToi(supabase);
  const chon = chonLopTu(classes, searchParams.lop, docCookieLop(), true);
  const ids = chon.classIds;
  const { data: students } = await supabase
    .from('students').select('student_id, class_id, display_name, consent_status')
    .in('class_id', ids.length ? ids : ['__none__']).order('student_id');
  const tenLopObj: Record<string, string> = {};
  const quyenSuaTheoLop: Record<string, boolean> = {};
  for (const c of classes) {
    tenLopObj[c.class_id] = tenHienThiLop(c);
    // Kiểm tra xác thực tài khoản, vai trò giáo viên hoặc điều kiện đồng ý
    quyenSuaTheoLop[c.class_id] = c.vai_tro !== 'du-gio';
  }

  return (
    <div className="wrap">
      <h1>Tài khoản học sinh</h1>
      <p className="sub">
        {chon.tatCa ? `Tất cả ${classes.length} lớp` : chon.lop ? nhanTruongLop(chon.lop) : 'Chưa có lớp'} · cấp mã đăng nhập không thu email cá nhân
      </p>

      <div className="banner">
        Chỉ tạo tài khoản sau khi Hội đồng thẩm định đã phê duyệt Phiếu 4 và gia đình đã ký phiếu
        đồng thuận. Cột &quot;Đồng thuận&quot; phải chuyển sang <strong>đã đồng ý</strong> thì dữ liệu của
        em đó mới được đưa vào phân tích nghiên cứu và mở quyền chấm vở AI.
      </div>

      <ThemHocSinh
        classes={classes.map((c) => ({
          class_id: c.class_id,
          class_code: nhanTruongLop(c),
          arm: c.arm ?? 'TN'
        }))}
      />

      <BangDongThuan
        students={(students ?? []).map((s) => ({
          student_id: String(s.student_id),
          class_id: String(s.class_id),
          display_name: String(s.display_name ?? s.student_id),
          consent_status: String(s.consent_status ?? 'chua'),
        }))}
        tenLopCua={tenLopObj}
        quyenSuaTheoLop={quyenSuaTheoLop}
        lopDangChon={chon.tatCa ? null : (chon.lop?.class_id ?? null)}
      />
    </div>
  );
}
