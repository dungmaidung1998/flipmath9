/**
 * FILE NÀY LÀM GÌ: Trang giao diện dành cho giáo viên trong khu vực đã đăng nhập, tổng hợp số liệu lớp và hỗ trợ điều chỉnh dạy học.
 * AI DÙNG: giáo viên
 * ĐỊA CHỈ TRÊN WEB: /gv/do-chieu-cao
 * LẤY DỮ LIỆU TỪ: vat_moc, do_chieu_cao, students
 * GỌI TỚI: @/components/gv/BoLoc, @/components/gv/DoChieuCaoGV, @/lib/gv/lopCuaToi, @/lib/supabase/server, @/lib/do-chieu-cao/tinh, @/lib/khkt/thongKeThucNghiem
 */
import { batBuocGiaoVien, docCookieLop } from '@/components/gv/BoLoc';
import DoChieuCaoGV, { type LuotDoGV, type VatMocGV } from '@/components/gv/DoChieuCaoGV';
import { chonLopTu, lopCuaToi, nhanTruongLop, tenHienThiLop } from '@/lib/gv/lopCuaToi';
import { supabaseAdmin } from '@/lib/supabase/server';
import {
  saiSoTuongDoi,
  taoBaoCaoDoChieuCao,
  type BanGhiDoChieuCao,
} from '@/lib/do-chieu-cao/tinh';
import { doLechChuan, trungBinh, tuPhanVi } from '@/lib/khkt/thongKeThucNghiem';

export const dynamic = 'force-dynamic';

/**
 * Component React `GvDoChieuCaoPage`: nhận props (thuộc tính truyền vào từ component cha) và dựng giao diện tương ứng.
 */
export default async function GvDoChieuCaoPage({
  searchParams,
}: {
  searchParams: { lop?: string };
}) {
  // Kiểm tra xác thực tài khoản, vai trò giáo viên hoặc điều kiện đồng ý
  const { db } = await batBuocGiaoVien();
  const lops = await lopCuaToi(db);
  const chon = chonLopTu(lops, searchParams.lop, docCookieLop(), false);
  const lop = chon.lop;
  if (!lop) {
    return (
      <div className="mc">
        <h1>Đo chiều cao Đà Nẵng (Chương IV)</h1>
        <p className="mc-trong">Thầy cô chưa được phân công lớp nào.</p>
      </div>
    );
  }

  const admin = supabaseAdmin();
  let vatMocs: VatMocGV[] = [];
  let luotDo: LuotDoGV[] = [];
  let chuaCoBang = false;

  try {
    const [{ data: vms, error: eVm }, { data: rows, error: eRows }, { data: sts }] = await Promise.all([
      admin.from('vat_moc').select('id, ten, h_that, cach_do_that').eq('class_id', lop.class_id).order('tao_luc', { ascending: false }),
      admin
        .from('do_chieu_cao')
        .select('id, student_id, vat_id, ten_vat, cach_do, d, a, alpha1, alpha2, m, h_tinh, h_hs_nhap, hs_dung, nguon_goc, tao_luc')
        .eq('class_id', lop.class_id)
        .order('tao_luc', { ascending: false })
        .limit(200),
      admin.from('students').select('student_id, display_name').eq('class_id', lop.class_id),
    ]);
    if (eVm || eRows) chuaCoBang = true;
    const tenHS = new Map((sts ?? []).map((s: any) => [String(s.student_id), String(s.display_name || s.student_id)]));
    vatMocs = (vms ?? []).map((v: any) => ({
      id: String(v.id),
      ten: String(v.ten),
      h_that: v.h_that != null ? Number(v.h_that) : null,
      cach_do_that: v.cach_do_that ?? null,
    }));
    const hThatMap = new Map(vatMocs.map((v) => [v.id, v.h_that]));
    luotDo = (rows ?? []).map((r: any) => ({
      ...(r as BanGhiDoChieuCao),
      student_id: String(r.student_id),
      tenHS: tenHS.get(String(r.student_id)) ?? String(r.student_id),
      vat_id: r.vat_id ? String(r.vat_id) : null,
      h_that: r.vat_id ? (hThatMap.get(String(r.vat_id)) ?? null) : null,
    }));
  } catch {
    chuaCoBang = true;
  }

  const errAll: number[] = [];
  const errCamBien: number[] = [];
  const errThanhTruot: number[] = [];
  const errMotDiem: number[] = [];
  const errHaiDiem: number[] = [];

  for (const r of luotDo) {
    if (r.h_that && r.h_that > 0) {
      const e = saiSoTuongDoi(r.h_tinh, r.h_that);
      errAll.push(e);
      if (r.nguon_goc === 'cam-bien') errCamBien.push(e);
      else errThanhTruot.push(e);
      if (r.cach_do === 'hai-diem') errHaiDiem.push(e);
      else errMotDiem.push(e);
    }
  }

  const tv = tuPhanVi(errAll);
  const thongKe = {
    saiSoTB: trungBinh(errAll),
    saiSoTrungVi: tv?.median ?? null,
    saiSoSD: doLechChuan(errAll),
    tiLeHsDung: luotDo.length ? (luotDo.filter((r) => r.hs_dung).length / luotDo.length) * 100 : null,
    tbCamBien: trungBinh(errCamBien),
    tbThanhTruot: trungBinh(errThanhTruot),
    tbMotDiem: trungBinh(errMotDiem),
    tbHaiDiem: trungBinh(errHaiDiem),
  };

  const baoCaoVan = taoBaoCaoDoChieuCao({
    banGhi: luotDo,
    ...thongKe,
  });

  return (
    <div className="mc">
      <div className="mc-dau">
        <h1>Đo chiều cao Đà Nẵng — Lớp {tenHienThiLop(lop)}</h1>
        {lops.length > 1 && (
          <form className="mc-loc" action="/gv/do-chieu-cao">
            <label>
              Lớp
              <select name="lop" defaultValue={lop.class_id}>
                {lops.map((l) => <option key={l.class_id} value={l.class_id}>{nhanTruongLop(l)}</option>)}
              </select>
            </label>
            <button className="nho">Xem</button>
          </form>
        )}
      </div>
      <p className="mc-cauhoi">Dữ liệu nghiên cứu KHKT Chương IV · Tích hợp giác kế 3D+AR với bài Hệ thức lượng tam giác vuông.</p>
      {chuaCoBang && (
        <p className="bang-vang">
          Chưa thấy bảng <code>do_chieu_cao</code> / <code>vat_moc</code> trên Supabase — cô chạy file SQL <code>56-tu-luc-va-qua-tai.sql</code> để lưu số liệu thật.
        </p>
      )}
      <DoChieuCaoGV
        lop={lop.class_id}
        vatMocsBanDau={vatMocs}
        luotDo={luotDo}
        baoCaoVan={baoCaoVan}
        thongKe={thongKe}
      />
    </div>
  );
}
