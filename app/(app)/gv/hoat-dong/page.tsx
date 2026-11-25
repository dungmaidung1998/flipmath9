/**
 * FILE NÀY LÀM GÌ: Trang giao diện dành cho giáo viên trong khu vực đã đăng nhập, tổng hợp số liệu lớp và hỗ trợ điều chỉnh dạy học.
 * AI DÙNG: giáo viên
 * ĐỊA CHỈ TRÊN WEB: /gv/hoat-dong
 * LẤY DỮ LIỆU TỪ: profiles, students
 * GỌI TỚI: @/lib/supabase/server, @/lib/mucHoatDong, @/lib/fasDuLieu, @/components/gv/BoLoc, @/lib/gv/lopCuaToi
 */
import { supabaseServer } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { khungTuan, TEN_NHOM, TRONG_SO, CHI_TIEU_CAU_TUAN, type NhomFas, type Fas } from '@/lib/mucHoatDong';
import { taiFas } from '@/lib/fasDuLieu';
import { docCookieLop } from '@/components/gv/BoLoc';
import { chonLopTu, laVaiTroGV, lopCuaToi, nhanTruongLop, tenHienThiLop } from '@/lib/gv/lopCuaToi';

export const dynamic = 'force-dynamic';

const THU_TU: NhomFas[] = ['can-quan-tam', 'can-ho-tro', 'tich-cuc', 'xuat-sac'];
// Tính toán, làm tròn hoặc giới hạn giá trị theo công thức
const pt = (x: number | null) => x == null ? '—' : Math.round(x * 100) + '%';

/**
 * Component React `Nhom`: nhận props (thuộc tính truyền vào từ component cha) và dựng giao diện tương ứng.
 */
function Nhom({ n }: { n: NhomFas }) {
  const t = TEN_NHOM[n];
  return <span className="hd-muc" style={{ color: t.mau, background: t.nen }}>{t.bieuTuong} {t.ten}</span>;
}

/** MỨC ĐỘ HOẠT ĐỘNG — chỉ số FAS theo tuần (SPEC M11.1), so với tuần trước. */
export default async function HoatDongHocSinh({ searchParams }: { searchParams: { lop?: string; tuan?: string } }) {
  const db = supabaseServer();
  // Kiểm tra xác thực tài khoản, vai trò giáo viên hoặc điều kiện đồng ý
  const { data: { user } } = await db.auth.getUser();
  if (!user) redirect('/dang-nhap');
  // Truy vấn Supabase: đọc dữ liệu từ bảng profiles
  const { data: profile } = await db.from('profiles').select('role').eq('id', user.id).maybeSingle();
  // Kiểm tra xác thực tài khoản, vai trò giáo viên hoặc điều kiện đồng ý
  if (!laVaiTroGV(profile?.role)) redirect('/');

  const lops = await lopCuaToi(db);
  const chon = chonLopTu(lops, searchParams.lop, docCookieLop(), true);
  if (!chon.classIds.length) return <div className="wrap"><h1>Mức độ hoạt động</h1><p className="hint">Thầy cô chưa có lớp nào.</p></div>;
  // Tính toán, làm tròn hoặc giới hạn giá trị theo công thức
  const lui = Math.max(0, Math.min(20, Number(searchParams.tuan) || 0));
  const tuan = khungTuan(Date.now(), lui), truoc = khungTuan(Date.now(), lui + 1);

  // Truy vấn Supabase: đọc dữ liệu từ bảng students
  const { data: hs } = await db.from('students').select('student_id, display_name, class_id').in('class_id', chon.classIds).order('student_id');
  const tenLopCua = new Map(lops.map((l) => [l.class_id, tenHienThiLop(l)]));

  let nay = new Map<string, Fas>(), cu = new Map<string, Fas>(), loi = '';
  try {
    const byClass = new Map<string, string[]>();
    for (const s of hs ?? []) {
      const cid = String(s.class_id ?? '');
      byClass.set(cid, [...(byClass.get(cid) ?? []), s.student_id]);
    }
    const perClass = await Promise.all(
      Array.from(byClass.values()).map((cIds) =>
        Promise.all([taiFas(db, cIds, tuan.tu, tuan.den), taiFas(db, cIds, truoc.tu, truoc.den)])
      )
    );
    for (const [mNay, mCu] of perClass) {
      for (const [k, v] of mNay) nay.set(k, v);
      for (const [k, v] of mCu) cu.set(k, v);
    }
  } catch (e: any) {
    loi = e.message;
  }

  const dong = (hs ?? []).filter((s) => nay.has(s.student_id)).map((s) => ({ ...s, tenLop: tenLopCua.get(s.class_id) ?? s.class_id, f: nay.get(s.student_id)!, cu: cu.get(s.student_id)?.fas ?? null }))
    .sort((a, b) => a.f.fas - b.f.fas || a.student_id.localeCompare(b.student_id));
  const dem = Object.fromEntries(THU_TU.map((n) => [n, dong.filter((d) => d.f.nhom === n).length])) as Record<NhomFas, number>;
  // Tính toán, làm tròn hoặc giới hạn giá trị theo công thức
  const tb = dong.length ? Math.round(dong.reduce((s, d) => s + d.f.fas, 0) / dong.length) : 0;
  const coP = dong.some((d) => d.f.P != null);
  const coLich = dong.some((d) => d.f.theoLich);
  const ngayGio = (s: string | null) => s ? new Date(s).toLocaleString('vi-VN', { timeZone: 'Asia/Ho_Chi_Minh', day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' }) : '—';
  const link = (q: Record<string, string>) => '/gv/hoat-dong?' + new URLSearchParams({ lop: chon.dang, tuan: String(lui), ...q });

  return (
    <div className="wrap">
      <h1>Chăm chỉ theo tuần</h1>
      <p className="sub">
        {chon.tatCa ? `Tất cả ${lops.length} lớp` : `Lớp ${chon.lop ? nhanTruongLop(chon.lop) : ''}`} · Tuần {tuan.nhan} · chỉ tính từ dữ liệu học sinh dùng web thật
      </p>

      <div className="hd-loc">
        <a className="action-link" href={link({ tuan: String(lui + 1) })}>← Tuần trước</a>
        {lui > 0 && <a className="action-link" href={link({ tuan: String(lui - 1) })}>Tuần sau →</a>}
      </div>

      {loi && <p role="alert" className="banner">{loi} Thầy cô tải lại trang.</p>}

      <div className="hd-tong">
        {THU_TU.map((n) => (
          <div key={n} className="hd-o" style={{ borderColor: TEN_NHOM[n].nen }}>
            <Nhom n={n} /><strong>{dem[n]}</strong><small>{TEN_NHOM[n].goiY}</small>
          </div>
        ))}
        <div className="hd-o"><span className="hd-muc">Điểm chăm chỉ trung bình lớp</span><strong>{tb}</strong><small>/ 100</small></div>
      </div>

      <div className="card">
        <h2>Từng học sinh <small className="hint">(điểm thấp xếp trước)</small></h2>
        <div className="scroll">
          {/* Khối giao diện: Bảng số liệu tổng hợp */}
          <table>
            <thead><tr>
              <th>Học sinh</th>{chon.tatCa && <th>Lớp</th>}<th>Nhóm</th><th className="n">Điểm chăm chỉ</th><th className="n">So tuần trước</th>
              <th className="n">Chuẩn bị</th><th className="n">Luyện tập</th><th className="n">Phiếu</th>
              <th className="n">Đều đặn</th><th className="n">Kiên trì</th><th className="n">Sửa lỗi</th>
              <th className="n">Ngày học</th><th className="n">Câu đã làm</th><th className="n">Điểm phiếu TB</th><th>Ghi chú</th><th>Lần cuối</th>
            </tr></thead>
            <tbody>
              {dong.map((d) => {
                const delta = d.cu == null ? null : d.f.fas - d.cu;
                return (
                  <tr key={d.student_id}>
                    <th scope="row">{d.display_name ?? d.student_id}</th>
                    {chon.tatCa && <td>{d.tenLop}</td>}
                    <td><Nhom n={d.f.nhom} /></td>
                    <td className="n"><span className="hd-thanh"><i style={{ width: d.f.fas + '%', background: TEN_NHOM[d.f.nhom].mau }} /></span> <b>{d.f.fas}</b></td>
                    <td className="n" style={{ color: delta != null && delta <= -20 ? '#b3261e' : undefined, fontWeight: delta != null && delta <= -20 ? 700 : undefined }}>
                      {delta == null ? '—' : (delta > 0 ? '+' : '') + delta}{delta != null && delta <= -20 ? ' ⚠️' : ''}
                    </td>
                    <td className="n">{pt(d.f.P)}</td><td className="n">{pt(d.f.L)}</td><td className="n">{pt(d.f.T)}</td>
                    <td className="n">{pt(d.f.R)}</td><td className="n">{pt(d.f.K)}</td><td className="n">{pt(d.f.E)}</td>
                    <td className="n">{d.f.ngay}/7</td><td className="n">{d.f.cauTraLoi}</td><td className="n">{d.f.diemPhieu ?? '—'}</td>
                    <td>{!d.f.coHoatDong ? '💤 Chưa vào web tuần này' : d.f.khuya ? `🌙 ${d.f.khuya} lần học khuya` : ''}</td>
                    <td>{ngayGio(d.f.lanCuoi)}</td>
                  </tr>
                );
              })}
              {!dong.length && <tr><td colSpan={chon.tatCa ? 16 : 15} className="hint">Lớp chưa có học sinh.</td></tr>}
            </tbody>
          </table>
        </div>
      </div>

      <details className="card">
        <summary><strong>Cách tính điểm chăm chỉ</strong></summary>
        <p><b>Điểm = 100 × (0,25P + 0,20L + 0,20T + 0,15R + 0,10K + 0,10E)</b>, tính theo tuần thứ Hai đến Chủ nhật.</p>
        <ul>
          <li><b>P – Chuẩn bị trước giờ</b> ({TRONG_SO.P * 100}%): số mục em chuẩn bị xong trước hạn / số mục được giao có hạn chuẩn bị trong tuần (theo trang Lịch giao bài).</li>
          <li><b>L – Luyện tập</b> ({TRONG_SO.L * 100}%): số câu em trả lời trong tuần (bài làm, trò chơi ôn nền, ôn thi 10, luyện nghe) / {CHI_TIEU_CAU_TUAN}.</li>
          <li><b>T – Phiếu học tập</b> ({TRONG_SO.T * 100}%): điểm trung bình bài chuẩn bị / 10; chưa làm tính 0.</li>
          <li><b>R – Đều đặn</b> ({TRONG_SO.R * 100}%): số ngày có hoạt động / 5.</li>
          <li><b>K – Kiên trì</b> ({TRONG_SO.K * 100}%): tỉ lệ câu sai em làm lại cùng mục trong 48 giờ; không có câu sai tính 100%.</li>
          <li><b>E – Sửa lỗi</b> ({TRONG_SO.E * 100}%): tỉ lệ lỗi được khắc phục ở các lượt Soát lỗi cũ trong tuần; tuần không soát lỗi nào tính 100%.</li>
        </ul>
        <p>Nhóm: dưới 40 🔴 Cần quan tâm · 40–59 🟠 Cần hỗ trợ · 60–79 🟢 Tích cực · từ 80 🔵 Xuất sắc. Thời gian ngồi trên web không được cộng điểm. Học trong khung 22:00–06:00 vẫn ghi nhận nhưng có ghi chú 🌙. Điểm giảm từ 20 so với tuần trước có dấu ⚠️.</p>
        <p className="hint">{coLich ? 'P tính theo lịch giao bài của tuần này.' : <><b>Đang tạm tính P:</b> tuần này lớp chưa có bài nào có hạn chuẩn bị trên trang <a href="/gv/lich-bai">Lịch giao bài</a>, nên "mục được giao" tạm lấy là mục mà từ 1/3 lớp trở lên đã làm bài chuẩn bị{coP ? '' : ' (tuần này chưa có mục nào như vậy nên bỏ P và chia lại trọng số các phần còn lại)'}.</>}</p>
      </details>
    </div>
  );
}
