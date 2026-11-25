/**
 * FILE NÀY LÀM GÌ: Trang Next.js App Router trong khu vực học tập đã đăng nhập, nạp dữ liệu ban đầu và hiển thị giao diện tương tác.
 * AI DÙNG: học sinh
 * ĐỊA CHỈ TRÊN WEB: /quan-tri
 * LẤY DỮ LIỆU TỪ: schools, teacher_classes, profiles
 * GỌI TỚI: @/components/gv/BoLoc, @/components/gv/QuanTriTruong, @/components/charts/SoSanhLopChart, @/lib/gv/lopCuaToi
 */
import { batBuocQuanTri } from '@/components/gv/BoLoc';
import QuanTriTruong from '@/components/gv/QuanTriTruong';
import SoSanhLopChart from '@/components/charts/SoSanhLopChart';
import { lopCuaToi, type ThongKeLop } from '@/lib/gv/lopCuaToi';

export const dynamic = 'force-dynamic';

/** Trang Quản trị trường (chỉ vai trò quan-tri-truong và quan-tri-he-thong). */
export default async function TrangQuanTri() {
  const { db, role, schoolId } = await batBuocQuanTri();
  const lops = await lopCuaToi(db);
  const classIds = lops.map((l) => l.class_id);

  const [schoolsRes, tcRes, gvRes, tkRes] = await Promise.all([
    db.from('schools').select('school_id, ten, tinh').order('ten').then((r: any) => r, () => ({ data: [] as any[] })),
    classIds.length
      ? db.from('teacher_classes').select('class_id, teacher_id, vai_tro').in('class_id', classIds).then((r: any) => r, () => ({ data: [] as any[] }))
      : Promise.resolve({ data: [] as any[] }),
    db.from('profiles').select('id, full_name, role, school_id').in('role', ['giao-vien', 'quan-tri-truong', 'quan-tri-he-thong']).then((r: any) => r, () => ({ data: [] as any[] })),
    db.rpc('thong_ke_lop').then((r: any) => r, () => ({ data: [] as any[], error: null }))
  ]);

  const gvList = (gvRes.data ?? []).filter(
    (g: any) => role === 'quan-tri-he-thong' || !g.school_id || g.school_id === schoolId
  );
  const tenGVCua = new Map(gvList.map((g: any) => [g.id, g.full_name || g.id.slice(0, 8)]));
  const phanCong = (tcRes.data ?? []).map((t: any) => ({
    class_id: String(t.class_id),
    teacher_id: String(t.teacher_id),
    vai_tro: String(t.vai_tro),
    ten_gv: String(tenGVCua.get(t.teacher_id) ?? t.teacher_id.slice(0, 8))
  }));

  const tkRows: ThongKeLop[] = (tkRes.data ?? []).map((r: any) => ({
    class_id: String(r.class_id),
    ten_lop: String(r.ten_lop ?? r.class_id),
    so_hs: Number(r.so_hs ?? 0),
    hs_hoat_dong: Number(r.hs_hoat_dong ?? 0),
    ti_le_lam_chu: r.ti_le_lam_chu == null ? null : Number(r.ti_le_lam_chu),
    muc_tb: r.muc_tb == null ? null : Number(r.muc_tb),
    loi_dang_mo: Number(r.loi_dang_mo ?? 0),
    loi_da_nho: Number(r.loi_da_nho ?? 0),
    phut_hoc: Number(r.phut_hoc ?? 0)
  }));

  const truongHienTai = (schoolsRes.data ?? []).find((s: any) => s.school_id === schoolId);

  return (
    <div className="mc">
      <div className="mc-dau">
        <div>
          <h1>🏫 Quản trị trường</h1>
          <p className="mc-cauhoi">
            {role === 'quan-tri-he-thong'
              ? 'Quản trị toàn hệ thống'
              : truongHienTai
                ? `${truongHienTai.ten}${truongHienTai.tinh ? ` (${truongHienTai.tinh})` : ''}`
                : `Mã trường: ${schoolId ?? 'Chưa gắn'}`}
            {' · '}tạo lớp, phân công giáo viên và theo dõi so sánh lớp toàn trường
          </p>
        </div>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          <a className="nut" href="/gv/so-sanh-lop">Xem chi tiết So sánh lớp →</a>
          <a className="nut" href="/api/xuat-du-lieu?loai=so-sanh-lop">📊 Xuất Excel</a>
        </div>
      </div>

      <QuanTriTruong
        lops={lops}
        truongs={schoolsRes.data ?? []}
        giaoViens={gvList}
        phanCong={phanCong}
        laHeThong={role === 'quan-tri-he-thong'}
        schoolIdMacDinh={schoolId ?? ''}
      />

      {/* Khối giao diện: Khối nội dung chính */}
      <section className="mc-khoi">
        <h2>📊 So sánh lớp toàn trường (28 ngày gần nhất)</h2>
        {tkRows.length ? (
          <SoSanhLopChart rows={tkRows} />
        ) : (
          <p className="mc-trong">Chưa có dữ liệu thống kê toàn trường.</p>
        )}
      </section>
    </div>
  );
}
