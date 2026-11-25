/**
 * FILE NÀY LÀM GÌ: Trang giao diện dành cho giáo viên trong khu vực đã đăng nhập, tổng hợp số liệu lớp và hỗ trợ điều chỉnh dạy học.
 * AI DÙNG: giáo viên
 * ĐỊA CHỈ TRÊN WEB: /gv/tu-luc
 * LẤY DỮ LIỆU TỪ: students, goi_y_su_kien
 * GỌI TỚI: @/components/gv/BoLoc, @/components/gv/TuLucGV, @/components/AnhChuDe, @/lib/gv/lopCuaToi, @/lib/supabase/server, @/lib/khkt/tuLuc
 */
import { batBuocGiaoVien, docCookieLop } from '@/components/gv/BoLoc';
import TuLucGV from '@/components/gv/TuLucGV';
import AnhChuDe from '@/components/AnhChuDe';
import { chonLopTu, lopCuaToi, nhanTruongLop, tenHienThiLop } from '@/lib/gv/lopCuaToi';
import { supabaseAdmin } from '@/lib/supabase/server';
import {
  taoBaoCaoTuLuc,
  tinhChiSoTuLuc,
  tinhTuLucTheoHocSinh,
  type GoiYSuKienRow,
  type NguonGoiY,
} from '@/lib/khkt/tuLuc';

export const dynamic = 'force-dynamic';

const NGUON_HOP_LE = new Set<string>(['tat-ca', 'goi-y-loi', 'hoi-bin', 'cham-vo', 'do-chieu-cao', 'tro-choi']);

/**
 * Component React `GvTuLucPage`: nhận props (thuộc tính truyền vào từ component cha) và dựng giao diện tương ứng.
 */
export default async function GvTuLucPage({
  searchParams,
}: {
  searchParams: { lop?: string; nguon?: string };
}) {
  // Kiểm tra xác thực tài khoản, vai trò giáo viên hoặc điều kiện đồng ý
  const { db } = await batBuocGiaoVien();
  const lops = await lopCuaToi(db);
  const chon = chonLopTu(lops, searchParams.lop, docCookieLop(), false);
  const lop = chon.lop;
  if (!lop) {
    return (
      <div className="mc">
        <h1>Chỉ số tự lực</h1>
        <p className="mc-trong">Thầy cô chưa được phân công lớp nào.</p>
      </div>
    );
  }

  const nguonLoc = (NGUON_HOP_LE.has(String(searchParams.nguon ?? ''))
    ? searchParams.nguon
    : 'tat-ca') as NguonGoiY | 'tat-ca';

  const admin = supabaseAdmin();
  let suKien: GoiYSuKienRow[] = [];
  let students: { student_id: string; display_name: string | null }[] = [];
  let chuaCoBang = false;

  try {
    const [{ data: sts }, { data: evs, error: errEv }] = await Promise.all([
      admin.from('students').select('student_id, display_name').eq('class_id', lop.class_id).order('student_id'),
      admin
        .from('goi_y_su_kien')
        .select('id, student_id, class_id, nguon, tang, ku_id, question_id, error_code, co_ai, tao_luc, thu_lai_luc, tu_giai, so_goi_y_them, xem_loi_giai')
        .eq('class_id', lop.class_id)
        .order('tao_luc', { ascending: true })
        .limit(5000),
    ]);
    students = (sts ?? []) as any[];
    if (errEv) chuaCoBang = true;
    suKien = (evs ?? []) as GoiYSuKienRow[];
  } catch {
    chuaCoBang = true;
  }

  const tenMap = new Map(students.map((s) => [s.student_id, s.display_name || s.student_id]));
  const dsLoc = nguonLoc === 'tat-ca' ? suKien : suKien.filter((e) => e.nguon === nguonLoc);
  const kq = tinhChiSoTuLuc(dsLoc, nguonLoc);
  const theoHS = tinhTuLucTheoHocSinh(
    dsLoc,
    students.map((s) => s.student_id)
  ).map((h) => ({
    ...h,
    tenHS: tenMap.get(h.student_id) ?? h.student_id,
  }));
  const baoCaoVan = taoBaoCaoTuLuc(kq);

  return (
    <div className="mc">
      <div className="mc-dau">
        <h1>Chỉ số tự lực khi có gợi ý / AI — Lớp {tenHienThiLop(lop)}</h1>
        {lops.length > 1 && (
          <form className="mc-loc" action="/gv/tu-luc">
            <label>
              Lớp
              <select name="lop" defaultValue={lop.class_id}>
                {lops.map((l) => <option key={l.class_id} value={l.class_id}>{nhanTruongLop(l)}</option>)}
              </select>
            </label>
            <input type="hidden" name="nguon" value={nguonLoc} />
            <button className="nho">Xem</button>
          </form>
        )}
      </div>
      <p className="mc-cauhoi">
        Đo lường học sinh có tự giải được trong 48 giờ sau gợi ý mà không phải mở thêm tầng gợi ý cao hơn hay xem lời giải.
      </p>

      <div style={{ marginBottom: 14 }}>
        <AnhChuDe
          src="/tinh-nang/tu-luc/gv-nghien-cuu.webp"
          fallback="/minh-hoa/nv/doc-sach.webp"
          alt="Nghiên cứu chỉ số tự lực"
          width={960}
          height={240}
          style={{ width: '100%', maxHeight: 160, objectFit: 'cover', borderRadius: 12, border: '1px solid var(--mc-vach)' }}
        />
      </div>

      {chuaCoBang && (
        <p className="bang-vang">
          Chưa thấy bảng <code>goi_y_su_kien</code> trên Supabase — cô chạy file SQL <code>56-tu-luc-va-qua-tai.sql</code> để hệ thống bắt đầu ghi dữ liệu tự lực.
        </p>
      )}

      <TuLucGV
        lop={lop.class_id}
        nguonLoc={nguonLoc}
        tongHop={kq.tongHop}
        theoTuan={kq.theoTuan}
        doDocXuHuong={kq.doDocXuHuong}
        xuHuong={kq.xuHuong}
        coAi={kq.coAi}
        khongAi={kq.khongAi}
        theoHS={theoHS}
        baoCaoVan={baoCaoVan}
      />
    </div>
  );
}
