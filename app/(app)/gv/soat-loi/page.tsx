/**
 * FILE NÀY LÀM GÌ: Trang giao diện dành cho giáo viên trong khu vực đã đăng nhập, tổng hợp số liệu lớp và hỗ trợ điều chỉnh dạy học.
 * AI DÙNG: giáo viên
 * ĐỊA CHỈ TRÊN WEB: /gv/soat-loi
 * LẤY DỮ LIỆU TỪ: profiles, students, student_errors, soat_loi_luot, error_dictionary
 * GỌI TỚI: @/lib/supabase/server, @/lib/soatLoi, @/lib/latexSangChu, @/lib/chapters, @/components/gv/BoLoc, @/lib/gv/lopCuaToi
 */
import { supabaseServer } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { TEN_TRANG_THAI, ngayVN, type TrangThai } from '@/lib/soatLoi';
import { latexSangChu } from '@/lib/latexSangChu';
import { CHAPTERS, chapterOf } from '@/lib/chapters';
import { docCookieLop } from '@/components/gv/BoLoc';
import { chonLopTu, laVaiTroGV, lopCuaToi, nhanTruongLop } from '@/lib/gv/lopCuaToi';

export const dynamic = 'force-dynamic';

const TT: TrangThai[] = ['can-sua', 'cho-on-1', 'cho-on-2', 'da-nho'];
const NGAY_LOC = [
  { id: 'tat-ca', nhan: 'Tất cả thời gian', soNgay: 0 },
  { id: '7', nhan: '7 ngày qua', soNgay: 7 },
  { id: '14', nhan: '14 ngày qua', soNgay: 14 },
  { id: '28', nhan: '28 ngày qua', soNgay: 28 },
  { id: '90', nhan: '90 ngày qua', soNgay: 90 }
];

/** KẾT QUẢ SOÁT LỖI CŨ (GV-05): hỗ trợ xem 1 lớp hoặc Tất cả lớp, lọc theo chương và khoảng ngày. */
export default async function SoatLoiLop({
  searchParams
}: {
  searchParams: { lop?: string; chuong?: string; ngay?: string };
}) {
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
  if (!chon.classIds.length) return <div className="wrap"><h1>Soát lỗi cũ</h1><p className="hint">Thầy cô chưa có lớp nào.</p></div>;

  // Biểu thức chính quy (regex) kiểm tra hoặc tách chuỗi đúng mẫu dữ liệu
  const chuongChon = searchParams.chuong && /^C(?:10|[1-9])$/.test(searchParams.chuong) ? searchParams.chuong : '';
  const mucNgay = NGAY_LOC.find((n) => n.id === searchParams.ngay) ?? NGAY_LOC[0];
  // Xử lý mốc ngày giờ theo múi giờ Việt Nam (UTC+7)
  const mocIso = mucNgay.soNgay ? new Date(Date.now() - mucNgay.soNgay * 86400_000).toISOString() : null;

  // Truy vấn Supabase: đọc dữ liệu từ bảng students
  const { data: hs } = await db.from('students').select('student_id, display_name, class_id').in('class_id', chon.classIds).order('student_id');
  const ids = (hs ?? []).map((s) => s.student_id);
  const ten = new Map((hs ?? []).map((s) => [s.student_id, s.display_name ?? s.student_id]));
  const none = ['__none__'];
  const [{ data: loi, error: e1 }, { data: luot }, { data: td }] = await Promise.all([
    db.from('student_errors').select('student_id, error_code, trang_thai, han_on, so_lan_sai, tai_phat, lan_sai_cuoi').in('student_id', ids.length ? ids : none).limit(10000),
    db.from('soat_loi_luot').select('student_id, ngay, thieu_cau, ket_qua, nop_luc').in('student_id', ids.length ? ids : none).order('luot_id', { ascending: false }).limit(2000),
    db.from('error_dictionary').select('error_code, ku_id, misconception').limit(5000)
  ]);
  if (e1) return <div className="wrap"><h1>Soát lỗi cũ</h1><p role="alert" className="banner">Chưa đọc được sổ lỗi. Thầy cô kiểm tra đã chạy tệp <code>42-soat-loi-va-on-ngat-quang.sql</code> trong Supabase chưa.</p></div>;

  const moTa = new Map((td ?? []).map((t) => [t.error_code, t]));
  const khopChuong = (maLoi: string) => !chuongChon || chapterOf(moTa.get(maLoi)?.ku_id) === chuongChon;

  // Xử lý mốc ngày giờ theo múi giờ Việt Nam (UTC+7)
  const homNay = ngayVN();
  const ds = (loi ?? []).filter((l) => khopChuong(l.error_code) && (!mocIso || !l.lan_sai_cuoi || l.lan_sai_cuoi >= mocIso));
  const luotLoc = (luot ?? []).filter((l) => !mocIso || !l.nop_luc || l.nop_luc >= mocIso);

  const denHan = ds.filter((l) => l.trang_thai === 'can-sua' || (l.trang_thai !== 'da-nho' && l.han_on && l.han_on <= homNay));
  const taiDien = ds.filter((l) => l.tai_phat > 0);
  const thieu = new Map<string, number>();
  for (const l of luotLoc) for (const m of (l.thieu_cau as string[]) ?? []) if (khopChuong(m)) thieu.set(m, (thieu.get(m) ?? 0) + 1);

  const theoMa = new Map<string, { hs: Record<TrangThai, number>; soat: number; khacPhuc: number; lan: number }>();
  const lay = (m: string) => theoMa.get(m) ?? theoMa.set(m, { hs: { 'can-sua': 0, 'cho-on-1': 0, 'cho-on-2': 0, 'da-nho': 0 }, soat: 0, khacPhuc: 0, lan: 0 }).get(m)!;
  for (const l of ds) { const x = lay(l.error_code); x.hs[l.trang_thai as TrangThai]++; x.lan += l.so_lan_sai; }
  for (const l of luotLoc) for (const k of ((l.ket_qua as any)?.ma ?? []) as any[]) {
    if (!khopChuong(k.error_code)) continue;
    const x = lay(k.error_code); x.soat++; if (k.danhGia === 'da-khac-phuc') x.khacPhuc++;
  }
  const bang = Array.from(theoMa).sort((a, b) => (b[1].hs['can-sua'] - a[1].hs['can-sua']) || b[1].lan - a[1].lan).slice(0, 40);
  const tongSoat = bang.reduce((s, [, x]) => s + x.soat, 0), tongKP = bang.reduce((s, [, x]) => s + x.khacPhuc, 0);
  const rut = (s: string, n = 110) => { const t = latexSangChu(s ?? ''); return t.length > n ? t.slice(0, n) + '…' : t; };

  return (
    <div className="wrap">
      <h1>Lỗi của lớp</h1>
      <p className="sub">
        {chon.tatCa ? `Tất cả ${lops.length} lớp` : chon.lop ? nhanTruongLop(chon.lop) : ''} · {chuongChon || 'Tất cả chương'} · {mucNgay.nhan.toLowerCase()}
      </p>
      {/* Khối giao diện: Biểu mẫu nhập liệu */}
      <form className="hd-loc" method="get">
        <input type="hidden" name="lop" value={chon.dang} />
        <label>Chương
          <select name="chuong" defaultValue={chuongChon}>
            <option value="">Tất cả chương</option>
            {CHAPTERS.filter((c) => c.id !== 'TN').map((c) => <option key={c.id} value={c.id}>{c.label}</option>)}
          </select>
        </label>
        <label>Khoảng ngày
          <select name="ngay" defaultValue={mucNgay.id}>
            {NGAY_LOC.map((n) => <option key={n.id} value={n.id}>{n.nhan}</option>)}
          </select>
        </label>
        <button type="submit">Lọc</button>
      </form>

      <div className="hd-tong">
        <div className="hd-o"><span className="hd-muc">Mục lỗi đến hạn hôm nay</span><strong>{denHan.length}</strong><small>{new Set(denHan.map((l) => l.student_id)).size} học sinh</small></div>
        <div className="hd-o"><span className="hd-muc">Tỉ lệ khắc phục khi soát</span><strong>{tongSoat ? Math.round(tongKP / tongSoat * 100) + '%' : '—'}</strong><small>{tongKP}/{tongSoat} lượt soát</small></div>
        <div className="hd-o"><span className="hd-muc">Lỗi tái diễn</span><strong>{taiDien.length}</strong><small>đã nhớ rồi mắc lại</small></div>
        <div className="hd-o"><span className="hd-muc">Lỗi chưa đủ câu ôn</span><strong>{thieu.size}</strong><small>cần bổ sung ngân hàng câu</small></div>
      </div>

      <div className="card">
        <h2>Từng lỗi <small className="hint">(nhiều em đang cần sửa xếp trước)</small></h2>
        <div className="scroll"><table>
          <thead><tr><th>Lỗi</th><th>Bài</th>{TT.map((t) => <th key={t} className="n">{TEN_TRANG_THAI[t].bieuTuong} {TEN_TRANG_THAI[t].ten}</th>)}<th className="n">Khắc phục khi soát</th></tr></thead>
          <tbody>
            {bang.map(([m, x]) => (
              <tr key={m}>
                <th scope="row" title={m}>{rut(moTa.get(m)?.misconception ?? m)}</th>
                <td>{(moTa.get(m)?.ku_id ?? '').match(/-B(\d+)-/)?.[1] ? `Bài ${(moTa.get(m)?.ku_id ?? '').match(/-B(\d+)-/)![1]}` : '—'}</td>
                {TT.map((t) => <td key={t} className="n">{x.hs[t] || ''}</td>)}
                <td className="n">{x.soat ? `${x.khacPhuc}/${x.soat}` : '—'}</td>
              </tr>
            ))}
            {!bang.length && <tr><td colSpan={7} className="hint">Chưa có lỗi nào khớp bộ lọc hiện tại.</td></tr>}
          </tbody>
        </table></div>
      </div>

      {taiDien.length > 0 && (
        <div className="card">
          <h2>Lỗi tái diễn</h2>
          <ul>{taiDien.slice(0, 30).map((l) => <li key={l.student_id + l.error_code}><b>{ten.get(l.student_id)}</b>: {rut(moTa.get(l.error_code)?.misconception ?? l.error_code, 90)} (tái diễn {l.tai_phat} lần)</li>)}</ul>
        </div>
      )}

      {thieu.size > 0 && (
        <div className="card">
          <h2>Mã lỗi đang thiếu câu để ôn</h2>
          <p className="hint">Học sinh đến hạn ôn các lỗi này nhưng ngân hàng không còn câu mới cùng lỗi. Mục ôn được giữ lại; thầy cô bổ sung câu ở trang Nội dung.</p>
          <ul>{Array.from(thieu).sort((a, b) => b[1] - a[1]).map(([m, n]) => <li key={m}>{rut(moTa.get(m)?.misconception ?? m, 90)} <small className="hint" title={m}>({(moTa.get(m)?.ku_id ?? '').match(/-B(\d+)-/) ? `Bài ${(moTa.get(m)?.ku_id ?? '').match(/-B(\d+)-/)![1]} · ` : ''}thiếu câu ôn {n} lượt)</small></li>)}</ul>
        </div>
      )}
    </div>
  );
}
