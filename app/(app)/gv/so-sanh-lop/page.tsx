/**
 * FILE NÀY LÀM GÌ: Trang giao diện dành cho giáo viên trong khu vực đã đăng nhập, tổng hợp số liệu lớp và hỗ trợ điều chỉnh dạy học.
 * AI DÙNG: giáo viên
 * ĐỊA CHỈ TRÊN WEB: /gv/so-sanh-lop
 * LẤY DỮ LIỆU TỪ: students, knowledge_units, mastery_states
 * GỌI TỚI: @/components/gv/BoLoc, @/components/charts/SoSanhLopChart, @/lib/chapters, @/lib/gv/lopCuaToi
 */
import { batBuocGiaoVien } from '@/components/gv/BoLoc';
import SoSanhLopChart from '@/components/charts/SoSanhLopChart';
import { CHAPTERS, chapterOf } from '@/lib/chapters';
import { lopCuaToi, type ThongKeLop } from '@/lib/gv/lopCuaToi';

export const dynamic = 'force-dynamic';

const KHOANG_NGAY = [
  { id: '7', nhan: '7 ngày qua', soNgay: 7 },
  { id: '14', nhan: '14 ngày qua', soNgay: 14 },
  { id: '28', nhan: '28 ngày qua', soNgay: 28 },
  { id: '90', nhan: '90 ngày qua', soNgay: 90 },
  { id: 'tat-ca', nhan: 'Tất cả thời gian', soNgay: 0 }
];

/**
 * Component React `ngayTu`: nhận props (thuộc tính truyền vào từ component cha) và dựng giao diện tương ứng.
 */
function ngayTu(soNgay: number): string {
  if (!soNgay) return '2000-01-01';
  // Xử lý mốc ngày giờ theo múi giờ Việt Nam (UTC+7)
  const d = new Date(Date.now() - soNgay * 86400_000 + 7 * 3600_000);
  return d.toISOString().slice(0, 10);
}

/** Trang So sánh các lớp thầy cô / quản trị được xem. */
export default async function SoSanhLop({
  searchParams
}: {
  searchParams: { ngay?: string; chuong?: string };
}) {
  // Kiểm tra xác thực tài khoản, vai trò giáo viên hoặc điều kiện đồng ý
  const { db } = await batBuocGiaoVien();
  const lops = await lopCuaToi(db);
  const mucNgay = KHOANG_NGAY.find((k) => k.id === searchParams.ngay) ?? KHOANG_NGAY[2];
  const tuNgay = ngayTu(mucNgay.soNgay);
  // Biểu thức chính quy (regex) kiểm tra hoặc tách chuỗi đúng mẫu dữ liệu
  const chuongChon = searchParams.chuong && /^C(?:10|[1-9])$/.test(searchParams.chuong) ? searchParams.chuong : '';

  const { data: tkRaw, error } = await db.rpc('thong_ke_lop', { p_tu: tuNgay });
  const truongCua = new Map(lops.map((l) => [l.class_id, l.ten_truong ?? l.school_id ?? '—']));

  const rows: (ThongKeLop & { truong: string })[] = (tkRaw ?? []).map((r: any) => ({
    class_id: String(r.class_id),
    ten_lop: String(r.ten_lop ?? r.class_id),
    truong: truongCua.get(String(r.class_id)) ?? '—',
    so_hs: Number(r.so_hs ?? 0),
    hs_hoat_dong: Number(r.hs_hoat_dong ?? 0),
    ti_le_lam_chu: r.ti_le_lam_chu == null ? null : Number(r.ti_le_lam_chu),
    muc_tb: r.muc_tb == null ? null : Number(r.muc_tb),
    loi_dang_mo: Number(r.loi_dang_mo ?? 0),
    loi_da_nho: Number(r.loi_da_nho ?? 0),
    phut_hoc: Number(r.phut_hoc ?? 0)
  }));

  // Nếu giáo viên lọc theo một chương cụ thể, tính thêm tỉ lệ làm chủ riêng chương đó
  const chuongStats = new Map<string, { tiLe: number | null; mucTb: number | null }>();
  if (chuongChon && lops.length) {
    const classIds = lops.map((l) => l.class_id);
    const [{ data: hs }, { data: units }] = await Promise.all([
      db.from('students').select('student_id, class_id').in('class_id', classIds),
      db.from('knowledge_units').select('ku_id')
    ]);
    const kuChuong = (units ?? []).map((u) => u.ku_id).filter((id) => chapterOf(id) === chuongChon);
    const hsIds = (hs ?? []).map((h) => h.student_id);
    if (kuChuong.length && hsIds.length) {
      const { data: ms } = await db
        .from('mastery_states')
        .select('student_id, mastery_level')
        .in('student_id', hsIds)
        .in('ku_id', kuChuong);
      const lopCuaHS = new Map((hs ?? []).map((h) => [h.student_id, h.class_id]));
      const gom = new Map<string, number[]>();
      for (const m of ms ?? []) {
        if (m.mastery_level == null) continue;
        const cid = lopCuaHS.get(m.student_id);
        if (!cid) continue;
        gom.set(cid, [...(gom.get(cid) ?? []), Number(m.mastery_level)]);
      }
      for (const cid of classIds) {
        const vals = gom.get(cid) ?? [];
        if (!vals.length) {
          chuongStats.set(cid, { tiLe: null, mucTb: null });
        } else {
          const dat = vals.filter((v) => v >= 2).length;
          chuongStats.set(cid, {
            tiLe: Math.round((dat * 1000) / vals.length) / 10,
            mucTb: Math.round((vals.reduce((a, b) => a + b, 0) * 100) / vals.length) / 100
          });
        }
      }
    }
  }

  const tongHS = rows.reduce((s, r) => s + r.so_hs, 0);
  const tongHoatDong = rows.reduce((s, r) => s + r.hs_hoat_dong, 0);
  const tongLoiMo = rows.reduce((s, r) => s + r.loi_dang_mo, 0);
  const tongLoiNho = rows.reduce((s, r) => s + r.loi_da_nho, 0);
  const tongPhut = rows.reduce((s, r) => s + r.phut_hoc, 0);
  const coLamChu = rows.filter((r) => r.ti_le_lam_chu != null);
  const tbLamChu = coLamChu.length
    ? Math.round((coLamChu.reduce((s, r) => s + (r.ti_le_lam_chu ?? 0), 0) / coLamChu.length) * 10) / 10
    : null;

  return (
    <div className="mc">
      <div className="mc-dau">
        <div>
          <h1>So sánh các lớp</h1>
          <p className="mc-cauhoi">
            {rows.length} lớp được phân quyền · {mucNgay.nhan} (từ {tuNgay})
            {chuongChon ? ` · lọc thêm ${CHAPTERS.find((c) => c.id === chuongChon)?.label ?? chuongChon}` : ''}
          </p>
        </div>

        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'center' }}>
          {/* Khối giao diện: Biểu mẫu nhập liệu */}
          <form className="mc-loc" method="get">
            <label>
              Khoảng ngày
              <select name="ngay" defaultValue={mucNgay.id}>
                {KHOANG_NGAY.map((k) => (
                  <option key={k.id} value={k.id}>{k.nhan}</option>
                ))}
              </select>
            </label>
            <label>
              Chương
              <select name="chuong" defaultValue={chuongChon}>
                <option value="">Tất cả chương</option>
                {CHAPTERS.filter((c) => c.id !== 'TN').map((c) => (
                  <option key={c.id} value={c.id}>{c.label}</option>
                ))}
              </select>
            </label>
            <button type="submit" className="nho">Áp dụng</button>
          </form>

          <a
            className="nut"
            href={`/api/xuat-du-lieu?loai=so-sanh-lop&tu=${encodeURIComponent(tuNgay)}`}
          >
            📊 Xuất Excel (CSV)
          </a>
        </div>
      </div>

      {error ? (
        <div className="mc-khoi">
          <p className="err" role="alert">
            Chưa đọc được thống kê lớp ({error.message}). Kiểm tra đã chạy file <code>supabase/51-phan-cap-truong-gv-lop.sql</code> chưa.
          </p>
        </div>
      ) : !rows.length ? (
        <div className="mc-khoi">
          <p className="mc-trong">Chưa có lớp nào thuộc quyền xem của tài khoản này.</p>
        </div>
      ) : (
        <>
          <SoSanhLopChart rows={rows} />

          {/* Khối giao diện: Khối nội dung chính */}
          <section className="mc-khoi">
            <h2>Bảng số liệu từng lớp</h2>
            <div className="scroll">
              {/* Khối giao diện: Bảng số liệu tổng hợp */}
              <table>
                <thead>
                  <tr>
                    <th>Lớp</th>
                    <th>Trường</th>
                    <th className="n">Sĩ số</th>
                    <th className="n">HS hoạt động</th>
                    <th className="n">Tỉ lệ làm chủ</th>
                    <th className="n">Mức TB (0–3)</th>
                    {chuongChon && <th className="n">Làm chủ {chuongChon}</th>}
                    <th className="n">Lỗi đang mở</th>
                    <th className="n">Lỗi đã nhớ</th>
                    <th className="n">Phút học</th>
                    <th />
                  </tr>
                </thead>
                <tbody>
                  {rows.map((r) => {
                    const cs = chuongStats.get(r.class_id);
                    return (
                      <tr key={r.class_id}>
                        <th scope="row">{r.ten_lop}</th>
                        <td>{r.truong}</td>
                        <td className="n">{r.so_hs}</td>
                        <td className="n">{r.hs_hoat_dong}</td>
                        <td className="n">{r.ti_le_lam_chu == null ? '—' : `${r.ti_le_lam_chu}%`}</td>
                        <td className="n">{r.muc_tb == null ? '—' : r.muc_tb.toFixed(2)}</td>
                        {chuongChon && (
                          <td className="n">{cs?.tiLe == null ? '—' : `${cs.tiLe}%`}</td>
                        )}
                        <td className="n">{r.loi_dang_mo}</td>
                        <td className="n">{r.loi_da_nho}</td>
                        <td className="n">{r.phut_hoc}</td>
                        <td className="n">
                          <a href={`/gv?lop=${encodeURIComponent(r.class_id)}`}>Vào lớp →</a>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
                <tfoot>
                  <tr>
                    <th scope="row" colSpan={2}>Tổng / Trung bình ({rows.length} lớp)</th>
                    <td className="n"><b>{tongHS}</b></td>
                    <td className="n"><b>{tongHoatDong}</b></td>
                    <td className="n"><b>{tbLamChu == null ? '—' : `${tbLamChu}%`}</b></td>
                    <td className="n">—</td>
                    {chuongChon && <td className="n">—</td>}
                    <td className="n"><b>{tongLoiMo}</b></td>
                    <td className="n"><b>{tongLoiNho}</b></td>
                    <td className="n"><b>{tongPhut}</b></td>
                    <td />
                  </tr>
                </tfoot>
              </table>
            </div>
          </section>
        </>
      )}
    </div>
  );
}
