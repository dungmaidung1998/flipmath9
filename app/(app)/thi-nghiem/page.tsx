/**
 * FILE NÀY LÀM GÌ: Trang Next.js App Router trong khu vực học tập đã đăng nhập, nạp dữ liệu ban đầu và hiển thị giao diện tương tác.
 * AI DÙNG: học sinh
 * ĐỊA CHỈ TRÊN WEB: /thi-nghiem
 * LẤY DỮ LIỆU TỪ: profiles, learning_events
 * GỌI TỚI: @/lib/supabase/server, @/lib/thiNghiem, @/lib/chapters, @/components/MathText, @/components/DauTrang, @/lib/minhHoa, @/lib/diaDanh, @/lib/gv/lopCuaToi
 */
import { supabaseServer } from '@/lib/supabase/server';
import { THI_NGHIEM } from '@/lib/thiNghiem';
import { CHAPTERS } from '@/lib/chapters';
import MathText from '@/components/MathText';
import DauTrang from '@/components/DauTrang';
import { hinhNhanVat } from '@/lib/minhHoa';
import { DIA_DANH } from '@/lib/diaDanh';
import '@/components/thi-nghiem/thi-nghiem.css';
import { laVaiTroGV } from '@/lib/gv/lopCuaToi';

export const dynamic = 'force-dynamic';

/** PHÒNG THÍ NGHIỆM: mọi thí nghiệm "Thử tay" theo chương. Giáo viên có nút Chiếu lên lớp. */
export default async function PhongThiNghiem() {
  const supabase = supabaseServer();
  // Kiểm tra xác thực tài khoản, vai trò giáo viên hoặc điều kiện đồng ý
  const { data: { user } } = await supabase.auth.getUser();
  // Truy vấn Supabase: đọc dữ liệu từ bảng profiles
  const { data: prof } = user ? await supabase.from('profiles').select('role, student_id').eq('id', user.id).maybeSingle() : { data: null };
  // Kiểm tra xác thực tài khoản, vai trò giáo viên hoặc điều kiện đồng ý
  const laGV = laVaiTroGV(prof?.role);
  // Học sinh: đánh dấu thí nghiệm đã làm
  const daLam = new Set<string>();
  if (prof?.student_id) {
    // Truy vấn Supabase: đọc dữ liệu từ bảng learning_events
    const { data } = await supabase.from('learning_events').select('ku_id').eq('student_id', prof.student_id).eq('event_type', 'thi_nghiem');
    for (const e of data ?? []) daLam.add(e.ku_id as string);
  }
  const theoChuong = new Map<string, typeof THI_NGHIEM>();
  for (const t of THI_NGHIEM) { const c = t.ku.split('-')[0]; theoChuong.set(c, [...(theoChuong.get(c) ?? []), t]); }

  return (
    <div className={laGV ? 'hn' : 'wrap'}>
      <DauTrang tieuDe="🧪 Thử tay" phu={<>Kéo · Chỉnh · Nhìn · <b>Tự rút ra kết luận</b>{laGV && ' · Thầy cô bấm "Chiếu lên lớp" để mở chữ to.'}</>} hinh={hinhNhanVat('van-dung')} canh="doi-xanh" />
      <div className="tn-buoc-nho" aria-label="Cách thử">
        <span style={{ ['--c' as string]: '#2b6de0' }}>👆 Kéo thanh trượt</span>
        <span style={{ ['--c' as string]: '#ff8a1f' }}>👀 Nhìn hình đổi</span>
        <span style={{ ['--c' as string]: '#22a06b' }}>💡 Tự rút ra quy tắc</span>
      </div>
      {Array.from(theoChuong, ([c, ds]) => {
        const ch = CHAPTERS.find((x) => x.id === c);
        const dia = DIA_DANH[c];
        const xong = ds.filter((t) => daLam.has(t.ku)).length;
        return (
        <section key={c} className="tn-chuong" style={{ ['--tn' as string]: dia?.mau ?? '#2b4ba8' }}>
          <div className="tn-chuong__dau">
            {dia && <img src={`/fluent/${dia.icon}_3d.png`} alt="" width={48} height={48} loading="lazy" />}
            <div>
              <small>{ch?.label}{dia ? ' · ' + dia.ten : ''}</small>
              <h2>{ch ? ch.title.charAt(0) + ch.title.slice(1).toLocaleLowerCase('vi') : c}</h2>
            </div>
            <span className="tn-chuong__dem">{xong}/{ds.length} ✅</span>
          </div>
          <ul className="tn-the-ds tn-the-ds--luoi">
            {c === 'C4' && (
              <li className="tn-the tn-the--mau">
                <span className="tn-the__so">📱</span>
                <a href="/do-chieu-cao" className="tn-the__ten">Đo chiều cao Đà Nẵng bằng điện thoại (3D + AR)</a>
                <details className="tn-the__cach"><summary>🎯 Cách làm</summary>Ngắm góc nâng α, nhập khoảng cách d và chiều cao mắt m, xem tam giác vuông 3D và tự tính h.</details>
                <span className="tn-the__nut">
                  <a className="tn-nut-thu" href="/do-chieu-cao">▶ Mở tính năng đo</a>
                </span>
              </li>
            )}
            {ds.map((t, i) => (
              <li key={t.ku} className={'tn-the tn-the--mau' + (daLam.has(t.ku) ? ' tn-the--xong' : '')}>
                <span className="tn-the__so">{daLam.has(t.ku) ? '✓' : i + 1}</span>
                <a href={`/thi-nghiem/${encodeURIComponent(t.ku)}`} className="tn-the__ten"><MathText inline>{t.ten}</MathText></a>
                <details className="tn-the__cach"><summary>🎯 Cách làm</summary><MathText>{t.viec}</MathText></details>
                <span className="tn-the__nut">
                  <a className="tn-nut-thu" href={`/thi-nghiem/${encodeURIComponent(t.ku)}`}>▶ Thử ngay</a>
                  {laGV && <a className="tn-the__chieu" href={`/thi-nghiem/${encodeURIComponent(t.ku)}?chieu=1`}>📽 Chiếu lên lớp</a>}
                </span>
              </li>
            ))}
          </ul>
        </section>
      ); })}
    </div>
  );
}
