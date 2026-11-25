/**
 * FILE NÀY LÀM GÌ: Trang giao diện dành cho giáo viên trong khu vực đã đăng nhập, tổng hợp số liệu lớp và hỗ trợ điều chỉnh dạy học.
 * AI DÙNG: giáo viên
 * ĐỊA CHỈ TRÊN WEB: /gv/mat-goc
 * LẤY DỮ LIỆU TỪ: profiles, students
 * GỌI TỚI: @/lib/supabase/server, @/lib/chapters, @/components/gv/HanhDong, @/lib/kyNangNen, @/components/gv/BoLoc, @/lib/gv/lopCuaToi
 */
import { supabaseServer } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { CHAPTERS } from '@/lib/chapters';
import { NutGiaoViec } from '@/components/gv/HanhDong';
import { taiHoSoNen, DS_KY_NANG, TEN_MUC_NEN, KHONG_DU, kyNangCuaChuong } from '@/lib/kyNangNen';
import { docCookieLop } from '@/components/gv/BoLoc';
import { chonLopTu, laVaiTroGV, lopCuaToi, nhanTruongLop, tenHienThiLop } from '@/lib/gv/lopCuaToi';
import '@/components/soat-loi/soat-loi.css';

export const dynamic = 'force-dynamic';

/**
 * GV-08 BẢN ĐỒ MẤT GỐC CỦA LỚP: bảng nhiệt học sinh × kỹ năng nền (🟢 Vững · 🟡 Chưa chắc · 🔴 Hổng · ⚪ Chưa đủ dữ liệu),
 * lọc theo chương; kỹ năng có từ 30% lớp Hổng thì cảnh báo ôn đầu giờ; giao Gói lấp nền cho cả nhóm hổng một lần bấm.
 */
export default async function MatGoc({ searchParams }: { searchParams: { lop?: string; chuong?: string } }) {
  const db = supabaseServer();
  // Kiểm tra xác thực tài khoản, vai trò giáo viên hoặc điều kiện đồng ý
  const { data: { user } } = await db.auth.getUser();
  if (!user) redirect('/dang-nhap');
  // Truy vấn Supabase: đọc dữ liệu từ bảng profiles
  const { data: profile } = await db.from('profiles').select('role').eq('id', user.id).maybeSingle();
  // Kiểm tra xác thực tài khoản, vai trò giáo viên hoặc điều kiện đồng ý
  if (!laVaiTroGV(profile?.role)) redirect('/');
  const lops = await lopCuaToi(db);
  const lop = chonLopTu(lops, searchParams.lop, docCookieLop(), false).lop;
  if (!lop) return <div className="wrap"><h1>Bản đồ mất gốc</h1><p className="hint">Thầy cô chưa có lớp nào.</p></div>;
  const chuong = CHAPTERS.find((c) => c.id === searchParams.chuong && c.id !== 'TN') ?? CHAPTERS[0];

  // Truy vấn Supabase: đọc dữ liệu từ bảng students
  const { data: hs } = await db.from('students').select('student_id, display_name').eq('class_id', lop.class_id).order('student_id');
  const ds = hs ?? [];
  let hoSo = new Map<string, Map<string, any>>(), loi = '';
  try { hoSo = await taiHoSoNen(db, ds.map((h) => h.student_id)); } catch (e: any) { loi = e.message; }
  const kn = kyNangCuaChuong(chuong.id).map((ma) => DS_KY_NANG.find((k) => k.ma === ma)!);
  const nv = (sid: string, ma: string) => hoSo.get(sid)?.get(ma) ?? KHONG_DU;

  const thongKe = kn.map((k) => {
    const hong = ds.filter((h) => nv(h.student_id, k.ma).muc === 'hong');
    const coDuLieu = ds.filter((h) => nv(h.student_id, k.ma).muc !== 'chua-du').length;
    return { k, hong, coDuLieu, tiLe: ds.length ? hong.length / ds.length : 0 };
  });
  const canhBao = thongKe.filter((t) => t.tiLe >= 0.3).sort((a, b) => b.tiLe - a.tiLe);
  const ten = (h: { student_id: string; display_name: string | null }) => h.display_name ?? h.student_id;

  return (
    <div className="wrap mat-goc">
      <h1>Bản đồ mất gốc của lớp</h1>
      <p className="sub">Lớp {tenHienThiLop(lop)} · {chuong.label}: {chuong.title.toLowerCase()} · tính từ trò chơi ôn nền học sinh đã chơi</p>
      {/* Khối giao diện: Biểu mẫu nhập liệu */}
      <form className="hd-loc" method="get">
        <label>Lớp<select name="lop" defaultValue={lop.class_id}>{lops.map((l) => <option key={l.class_id} value={l.class_id}>{nhanTruongLop(l)}</option>)}</select></label>
        <label>Chương<select name="chuong" defaultValue={chuong.id}>{CHAPTERS.filter((c) => c.id !== 'TN').map((c) => <option key={c.id} value={c.id}>{c.label}</option>)}</select></label>
        <button type="submit">Xem</button>
      </form>
      {loi && <p role="alert" className="banner">{loi}</p>}

      {canhBao.map((t) => (
        <div key={t.k.ma} className="canh">
          <p style={{ margin: '0 0 6px' }}>⚠️ <b>{Math.round(t.tiLe * 100)}% lớp hổng "{t.k.ten}"</b> (Toán {t.k.lop}). Nên ôn lại 5 phút đầu giờ.</p>
          <NutGiaoViec lop={lop.class_id} loai="goi-lap-nen" hs={t.hong.map((h) => ({ id: h.student_id, ten: ten(h) }))} mucTieu={[t.k.ma]}
            loiNhan={`Em làm Gói lấp nền "${t.k.ten}" trước buổi học tới nhé: đọc thẻ Ôn nhanh 1 phút rồi làm một lượt luyện.`}
            nhan={`🧱 Giao gói lấp nền cho ${t.hong.length} em hổng`} chinh />
        </div>
      ))}

      <div className="card">
        <h2>Học sinh × kỹ năng nền <small className="hint">{Object.values(TEN_MUC_NEN).map((t) => `${t.bieuTuong} ${t.ten}`).join(' · ')}</small></h2>
        {!kn.length ? <p className="hint">Chương này chưa có kỹ năng nền.</p> : (
          <div className="scroll"><table>
            <thead>
              <tr><th>Học sinh</th>{kn.map((k) => <th key={k.ma} className="n" title={`${k.ma} · Toán ${k.lop}`} style={{ minWidth: 92, fontSize: 12.5 }}>{k.ten}</th>)}</tr>
            </thead>
            <tbody>
              {ds.map((h) => (
                <tr key={h.student_id}>
                  <th scope="row">{ten(h)}</th>
                  {kn.map((k) => { const x = nv(h.student_id, k.ma); const t = TEN_MUC_NEN[x.muc as keyof typeof TEN_MUC_NEN];
                    // Tính toán, làm tròn hoặc giới hạn giá trị theo công thức
                    return <td key={k.ma} className="o" style={{ background: t.nen }} title={`${t.ten}${x.soCau ? ` · ${Math.round((x.tiLe ?? 0) * 100)}% trong ${x.soCau} câu` : ''}`}>{t.bieuTuong}</td>; })}
                </tr>
              ))}
              <tr>
                <th scope="row">Số em hổng</th>
                {thongKe.map((t) => <td key={t.k.ma} className="o"><b>{t.hong.length}</b><br /><small className="hint">{t.coDuLieu}/{ds.length} có dữ liệu</small></td>)}
              </tr>
            </tbody>
          </table></div>
        )}
      </div>

      {thongKe.some((t) => t.hong.length && t.tiLe < 0.3) && (
        <div className="card">
          <h2>Giao gói lấp nền theo nhóm nhỏ</h2>
          <ul className="nen-ds">
            {thongKe.filter((t) => t.hong.length && t.tiLe < 0.3).map((t) => (
              <li key={t.k.ma} className="nen-the">
                <p><b>{t.k.ten}</b> <small className="hint">Toán {t.k.lop}</small></p>
                <p className="hint">{t.hong.map(ten).join(', ')}</p>
                <NutGiaoViec lop={lop.class_id} loai="goi-lap-nen" hs={t.hong.map((h) => ({ id: h.student_id, ten: ten(h) }))} mucTieu={[t.k.ma]}
                  loiNhan={`Em làm Gói lấp nền "${t.k.ten}" nhé: đọc thẻ Ôn nhanh 1 phút rồi làm một lượt luyện.`} nhan={`🧱 Giao cho ${t.hong.length} em`} />
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
