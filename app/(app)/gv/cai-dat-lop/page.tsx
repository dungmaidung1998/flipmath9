/**
 * FILE NÀY LÀM GÌ: Trang giao diện dành cho giáo viên trong khu vực đã đăng nhập, tổng hợp số liệu lớp và hỗ trợ điều chỉnh dạy học.
 * AI DÙNG: giáo viên
 * ĐỊA CHỈ TRÊN WEB: /gv/cai-dat-lop
 * LẤY DỮ LIỆU TỪ: class_settings
 * GỌI TỚI: @/components/gv/BoLoc, @/components/gv/FormCaiDat, @/lib/gv/lopCuaToi, @/lib/dfle/man-chinh-gv.js
 */
import { batBuocGiaoVien, docCookieLop } from '@/components/gv/BoLoc';
import FormCaiDat from '@/components/gv/FormCaiDat';
import { chonLopTu, lopCuaToi, nhanTruongLop, tenHienThiLop } from '@/lib/gv/lopCuaToi';
// @ts-ignore
import { NGUONG_MAC_DINH, hopNhatNguong } from '@/lib/dfle/man-chinh-gv.js';

export const dynamic = 'force-dynamic';

/** GV-13 Cài đặt lớp — phần ngưỡng của 3 màn chính. */
export default async function CaiDatLop({ searchParams }: { searchParams: { lop?: string } }) {
  // Kiểm tra xác thực tài khoản, vai trò giáo viên hoặc điều kiện đồng ý
  const { db } = await batBuocGiaoVien();
  const lops = await lopCuaToi(db);
  const chon = chonLopTu(lops, searchParams.lop, docCookieLop(), false);
  const lop = chon.lop;
  if (!lop) return <div className="mc"><h1>Cài đặt lớp</h1><p>Chưa có lớp được phân công.</p></div>;
  // Truy vấn Supabase: đọc dữ liệu từ bảng class_settings
  const { data } = await db.from('class_settings').select('nguong').eq('class_id', lop.class_id).maybeSingle();
  return (
    <div className="mc">
      <div className="mc-dau">
        <h1>Cài đặt lớp {tenHienThiLop(lop)}</h1>
        {lops.length > 1 && (
          <form className="mc-loc" action="/gv/cai-dat-lop">
            <label>Lớp<select name="lop" defaultValue={lop.class_id}>{lops.map((l) => <option key={l.class_id} value={l.class_id}>{nhanTruongLop(l)}</option>)}</select></label>
            <button className="nho">Xem</button>
          </form>
        )}
      </div>
      <p className="mc-cauhoi">Ngưỡng xếp học sinh vào các khối ở màn Thống kê cần chú ý và màn Tiến bộ.</p>
      <FormCaiDat lop={lop.class_id} nguong={hopNhatNguong(data?.nguong)} macDinh={{ ...NGUONG_MAC_DINH }} />
      {/* Khối giao diện: Khối nội dung chính */}
      <section className="mc-khoi" style={{ marginTop: 18 }}>
        <h2>Ôn thi không quá tải &amp; Mã phụ huynh</h2>
        <p className="mc-ghi" style={{ marginTop: 0 }}>
          Chỉnh giới hạn phút học mỗi ngày, khung giờ khuya và tạo mã 6 chữ số cho phụ huynh tự điều chỉnh tại nhà.
        </p>
        <a className="nho chinh" href={`/gv/qua-tai?lop=${encodeURIComponent(lop.class_id)}`}>
          Mở cấu hình Học không quá tải &amp; Mã phụ huynh →
        </a>
      </section>
    </div>
  );
}
