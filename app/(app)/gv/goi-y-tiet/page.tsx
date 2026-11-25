/**
 * FILE NÀY LÀM GÌ: Trang giao diện dành cho giáo viên trong khu vực đã đăng nhập, tổng hợp số liệu lớp và hỗ trợ điều chỉnh dạy học.
 * AI DÙNG: giáo viên
 * ĐỊA CHỈ TRÊN WEB: /gv/goi-y-tiet
 * LẤY DỮ LIỆU TỪ: không truy vấn bảng trực tiếp
 * GỌI TỚI: @/components/gv/BoLoc, @/components/gv/KeHoachTiet, @/lib/gv/manChinh
 */
import BoLoc, { batBuocGiaoVien } from '@/components/gv/BoLoc';
import KeHoachTiet from '@/components/gv/KeHoachTiet';
import { napManChinh } from '@/lib/gv/manChinh';

export const dynamic = 'force-dynamic';

/** GV-17 💡 Gợi ý hoạt động sư phạm cho tiết dạy bài mới (theo quy tắc, chưa dùng AI). */
export default async function GoiYTiet({ searchParams }: { searchParams: { lop?: string; bai?: string } }) {
  // Kiểm tra xác thực tài khoản, vai trò giáo viên hoặc điều kiện đồng ý
  const { db, user } = await batBuocGiaoVien();
  let d: any;
  try { d = await napManChinh(db, user.id, searchParams); } catch (e: any) {
    return <div className="mc"><h1>Gợi ý tiết dạy</h1><p role="alert">Không tải được dữ liệu: {e.message}</p></div>;
  }
  if (!d.lop) return <div className="mc"><h1>Gợi ý tiết dạy</h1><p>Chưa có lớp hoặc nội dung.</p></div>;
  const g = d.goiY;
  const rutGon = (ds: any[]) => ds.map((h) => ({ id: h.id, ten: h.ten }));

  return (
    <div className="mc">
      <div className="mc-dau">
        <h1>💡 Gợi ý tiết {d.bai.tenNgan} · 45 phút</h1>
        <BoLoc action="/gv/goi-y-tiet" lops={d.lops} lop={d.lop.class_id} bais={d.bais} bai={d.bai.id} />
      </div>
      <p className="mc-cauhoi">{d.bai.ten} · Lớp {d.lop.class_code} · {g.soDaChuanBi}/{g.siSo} HS đã chuẩn bị</p>
      {g.canhBao.map((c: string) => <div key={c} className="bang-vang">{c}</div>)}

      <KeHoachTiet
        lop={d.lop.class_id} bai={d.bai.id} hoatDongBanDau={g.hoatDong}
        nhom={{ sao: rutGon(g.nhom.sao), choi: rutGon(g.nhom.choi), mam: rutGon(g.nhom.mam) }}
        nhomSua={d.nhomSua} ghepCap={g.nhom.ghepCap.map((x: any) => ({ kem: { id: x.kem.id, ten: x.kem.ten }, duocKem: { id: x.duocKem.id, ten: x.duocKem.ten } }))}
      />

      <p className="mc-ghi khong-in">
        Gợi ý tạo theo quy tắc cố định từ số liệu chuẩn bị của HS, mỗi lần mở trang được tính lại; phần thầy cô đã chỉnh được giữ.
        Mỗi gợi ý có dòng "Vì sao" để thầy cô tự quyết định.
      </p>
    </div>
  );
}
