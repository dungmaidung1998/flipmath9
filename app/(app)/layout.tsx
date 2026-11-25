/**
 * FILE NÀY LÀM GÌ: Trang Next.js App Router trong khu vực học tập đã đăng nhập, nạp dữ liệu ban đầu và hiển thị giao diện tương tác.
 * AI DÙNG: học sinh
 * LẤY DỮ LIỆU TỪ: profiles
 * GỌI TỚI: @/lib/supabase/server, @/components/SignOut, @/components/NhacNghi, @/components/TroNang, @/components/PhimTat, @/components/gv/ThanhBen, @/components/gv/ThanhTrenGV, @/components/gv/TheNhom
 */
import { supabaseServer } from '@/lib/supabase/server';
import { Suspense } from 'react';
import SignOut from '@/components/SignOut';
import NhacNghi from '@/components/NhacNghi';
import TroNang from '@/components/TroNang';
import PhimTat from '@/components/PhimTat';
import ThanhBen from '@/components/gv/ThanhBen';
import ThanhTrenGV from '@/components/gv/ThanhTrenGV';
import TheNhom from '@/components/gv/TheNhom';
import ChonLop from '@/components/gv/ChonLop';
import ThanhTrenHS from '@/components/ThanhTrenHS';
import '@/components/gv/man-chinh.css';
import KhungMauHS from '@/components/KhungMauHS';
import HoiBinWidget from '@/components/HoiBinWidget';
import PwaDangKy from '@/components/PwaDangKy';
import { laQuanTri, laVaiTroGV, lopCuaToi } from '@/lib/gv/lopCuaToi';
import './mau-sac.css';
import './chu-de.css';

/**
 * Layout của phần đã đăng nhập.
 *
 * Năm vai trò:
 *   quan-tri-he-thong / quan-tri-truong — quản trị trường & xem toàn trường + phần GV
 *   giao-vien                           — phần quản lí các lớp được phân công
 *   hoc-sinh-nckh                       — học như mọi học sinh, thêm sổ nhật ký
 *   hoc-sinh                            — học sinh trong đợt thực nghiệm
 */
export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const supabase = supabaseServer();
  // Kiểm tra xác thực tài khoản, vai trò giáo viên hoặc điều kiện đồng ý
  const { data: { user } } = await supabase.auth.getUser();
  let role: string | null = null;
  if (user) {
    // Truy vấn Supabase: đọc dữ liệu từ bảng profiles
    const { data } = await supabase.from('profiles').select('role, class_id').eq('id', user.id).maybeSingle();
    role = data?.role ?? null;
  }
  // Kiểm tra xác thực tài khoản, vai trò giáo viên hoặc điều kiện đồng ý
  const laGV = laVaiTroGV(role);
  const laQT = laQuanTri(role);
  const laNCKH = role === 'hoc-sinh-nckh';

  if (user && !laGV) {
    return <KhungMauHS><ThanhTrenHS laNCKH={laNCKH} />{children}<NhacNghi /><HoiBinWidget /><PwaDangKy /><TroNang /><PhimTat /></KhungMauHS>;
  }

  const lopsGV = user && laGV ? await lopCuaToi(supabase).catch(() => []) : [];

  return (
    <>
      {user && laGV ? (
        <Suspense fallback={<div className="topnav tg" />}>
          <ThanhTrenGV laQuanTri={laQT} role={role} />
        </Suspense>
      ) : (
        <div className="topnav">
          <span className="brand">{laGV ? 'FlipMath9 · Giáo viên' : 'FlipMath9'}</span>
          {user && (
            <nav>
              <a href="/gv">Trang chính</a>
              <SignOut />
            </nav>
          )}
        </div>
      )}
      {laGV ? (
        <div className="gv-khung">
          <Suspense fallback={<aside className="gv-ben" />}>
            <ThanhBen laQuanTri={laQT} />
          </Suspense>
          <div className="gv-noi">
            <Suspense fallback={null}>
              <ChonLop lops={lopsGV} coTatCa kieu="thanh" />
            </Suspense>
            <Suspense fallback={null}><TheNhom /></Suspense>
            {children}
          </div>
        </div>
      ) : children}
    </>
  );
}
