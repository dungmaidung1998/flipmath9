/**
 * FILE NÀY LÀM GÌ: Trang Next.js App Router trong khu vực học tập đã đăng nhập, nạp dữ liệu ban đầu và hiển thị giao diện tương tác.
 * AI DÙNG: học sinh
 * ĐỊA CHỈ TRÊN WEB: /bai-hoc
 * LẤY DỮ LIỆU TỪ: profiles, knowledge_units, mastery_states, recommendations, contents, gv_giao_viec, error_dictionary, students
 * GỌI TỚI: @/lib/diaDanh, @/lib/chuDeChuong, @/components/AnhChuDe, @/lib/mauHocSinh, @/lib/supabase/server, @/lib/soatLoiMayChu, @/lib/kyNangNen, @/lib/lichBai
 */
import { DIA_DANH } from '@/lib/diaDanh';
import { chuDeChuong } from '@/lib/chuDeChuong';
import AnhChuDe from '@/components/AnhChuDe';
import { loaiViec } from '@/lib/mauHocSinh';
import { supabaseServer, supabaseAdmin } from '@/lib/supabase/server';
import { demLoiDenHan } from '@/lib/soatLoiMayChu';
import { taiHoSoNen, DS_KY_NANG } from '@/lib/kyNangNen';
import { trangThaiBai, TEN_TRANG_THAI_BAI, ngayDep, gioDep, ngayVN, type Lich } from '@/lib/lichBai';
import '@/components/soat-loi/soat-loi.css';
import { redirect } from 'next/navigation';
import { CHAPTERS, chapterOf } from '@/lib/chapters';
import LoiNhanThayCo, { type Viec } from '@/components/LoiNhanThayCo';
import { BanDoDaNang } from '@/components/truc-quan/BanDoDaNang';
import { laVaiTroGV } from '@/lib/gv/lopCuaToi';

export const dynamic = 'force-dynamic';

/**
 * DANH SÁCH BÀI HỌC CỦA HỌC SINH
 *
 * Gom theo BÀI của sách giáo khoa, mỗi bài là một nhóm các MỤC. Học sinh mở
 * sách ra thấy "Bài 2, mục 1" thì ở đây cũng phải thấy đúng như vậy.
 */
export default async function Home({ searchParams }: { searchParams: { chuong?: string } }) {
  // Liên kết cũ /bai-hoc?chuong=C3 → trang riêng của chương (23/11/2026).
  if (searchParams.chuong && CHAPTERS.some((c) => c.id === searchParams.chuong)) redirect(`/bai-hoc/${searchParams.chuong}`);
  const supabase = supabaseServer();
  // Kiểm tra xác thực tài khoản, vai trò giáo viên hoặc điều kiện đồng ý
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/dang-nhap');

  const { data: profile } = await supabase
    .from('profiles').select('role, student_id, full_name').eq('id', user.id).maybeSingle();

  // Kiểm tra xác thực tài khoản, vai trò giáo viên hoặc điều kiện đồng ý
  if (laVaiTroGV(profile?.role)) redirect('/gv');

  const { data: units } = await supabase
    .from('knowledge_units')
    .select('ku_id, ku_name, order_index, lesson_id, prerequisite_ku')
    .order('order_index');

  const { data: mastery } = await supabase
    .from('mastery_states').select('ku_id, mastery_level')
    .eq('student_id', profile?.student_id ?? '');

  // Việc hệ thống đang giao
  const { data: viec } = await supabase
    .from('recommendations')
    .select('rec_id, ku_id, trigger_rule, diagnosis, action, recommended_content, accepted, created_at')
    .eq('student_id', profile?.student_id ?? '')
    .is('post_score', null)
    .order('created_at', { ascending: false })
    .limit(4);

  const idsVbh = [...new Set((viec ?? []).map((v) => v.recommended_content).filter(Boolean))];
  const { data: noiDung } = idsVbh.length
    ? await supabase.from('contents').select('content_id, title, duration_sec').in('content_id', idsVbh)
    : { data: [] };
  const vbh = new Map((noiDung ?? []).map((c: any) => [c.content_id, c]));

  // Lời nhắn và gói bài thầy cô giao (chưa đọc, trong 14 ngày)
  const { data: giao } = await supabase.from('gv_giao_viec')
    .select('id, loai, loi_nhan, muc_tieu, da_xem_at, created_at')
    .eq('student_id', profile?.student_id ?? '').is('da_xem_at', null)
    .gte('created_at', new Date(Date.now() - 14 * 86400000).toISOString())
    .order('created_at', { ascending: false }).limit(5)
    .then((r) => r, () => ({ data: [] as any[] }));
  const maLoiGiao = [...new Set((giao ?? []).filter((g: any) => g.loai === 'goi-sua-loi').flatMap((g: any) => g.muc_tieu ?? []))];
  const { data: dictGiao } = maLoiGiao.length
    ? await supabase.from('error_dictionary').select('error_code, misconception, remediation_id').in('error_code', maLoiGiao)
    : { data: [] as any[] };
  const vbhCua = new Map((dictGiao ?? []).map((d: any) => [d.error_code, d]));

  const byKu = new Map((mastery ?? []).map((m) => [m.ku_id, m.mastery_level]));
  const tenKu = new Map((units ?? []).map((u) => [u.ku_id, u.ku_name]));
  const viecGV: Viec[] = (giao ?? []).map((g: any) => ({
    id: g.id, loai: g.loai, loiNhan: g.loi_nhan, daXem: !!g.da_xem_at,
    links: g.loai === 'goi-sua-loi'
      ? (g.muc_tieu ?? []).map((c: string) => vbhCua.get(c)).filter((d: any) => d?.remediation_id).map((d: any) => ({ href: `/vi-bai-hoc/${encodeURIComponent(d.remediation_id)}`, ten: d.misconception.length > 40 ? d.misconception.slice(0, 39) + '…' : d.misconception }))
      : g.loai === 'goi-lap-nen'
        ? (g.muc_tieu ?? []).map((k: string) => k.startsWith('NEN-')
            ? { href: `/lap-nen/${encodeURIComponent(k)}`, ten: '🧱 ' + (DS_KY_NANG.find((x) => x.ma === k)?.ten ?? k) }
            : tenKu.has(k) ? { href: `/hoc/${k}`, ten: String(tenKu.get(k)) } : null).filter(Boolean)
        : []
  }));

  const tongDat = (units ?? []).filter((u) => (byKu.get(u.ku_id) ?? 0) >= 2).length;

  // Thẻ "Ôn lỗi hôm nay": số lỗi đến hạn (0 nếu hôm nay đã soát, hoặc chưa có sổ lỗi).
  // Gói lấp nền: kỹ năng nền đang Hổng (tối đa 2) hiện ở "Việc nên làm".
  let nenHong: { ma: string; ten: string }[] = [];
  // Kiểm tra xác thực tài khoản, vai trò giáo viên hoặc điều kiện đồng ý
  if (profile?.student_id && !laVaiTroGV(profile.role)) {
    try {
      const m = (await taiHoSoNen(supabase, [profile.student_id])).get(profile.student_id) ?? new Map();
      nenHong = DS_KY_NANG.filter((k) => m.get(k.ma)?.muc === 'hong').slice(0, 2).map((k) => ({ ma: k.ma, ten: k.ten }));
    } catch { nenHong = []; }
  }
  // Lịch giao bài ba mốc (tệp 43): trạng thái từng bài và các bài sắp tới.
  const laHS = !!profile?.student_id && !laVaiTroGV(profile.role);
  const lichCua = new Map<string, Lich>();
  const nopDau = new Map<string, string>();
  if (laHS) {
    // Truy vấn Supabase: đọc dữ liệu từ bảng students
    const { data: em } = await supabase.from('students').select('class_id').eq('student_id', profile!.student_id).maybeSingle();
    const [{ data: lich }, { data: cb }] = await Promise.all([
      em?.class_id ? supabase.from('lich_bai').select('lesson_id, ngay_mo, han_chuan_bi, ngay_hoc').eq('class_id', em.class_id).then((r) => r, () => ({ data: [] as Lich[] })) : Promise.resolve({ data: [] as Lich[] }),
      supabase.from('quiz_attempts').select('ku_id, submitted_at').eq('student_id', profile!.student_id).eq('kind', 'chuan-bi').order('submitted_at')
    ]);
    for (const l of (lich ?? []) as Lich[]) lichCua.set(l.lesson_id, l);
    for (const a of cb ?? []) if (a.submitted_at && !nopDau.has(a.ku_id)) nopDau.set(a.ku_id, a.submitted_at);
  }
  const mucCuaBai = new Map<string, string[]>();
  for (const u of units ?? []) if (u.lesson_id) (mucCuaBai.get(u.lesson_id) ?? mucCuaBai.set(u.lesson_id, []).get(u.lesson_id)!).push(u.ku_id);
  // Xử lý mốc ngày giờ theo múi giờ Việt Nam (UTC+7)
  const homNayVN = ngayVN();
  // Xử lý mốc ngày giờ theo múi giờ Việt Nam (UTC+7)
  const sapToi = Array.from(lichCua.values()).filter((l) => l.ngay_hoc >= homNayVN).sort((a, b) => a.ngay_hoc.localeCompare(b.ngay_hoc)).slice(0, 4);

  let loiDenHan = 0;
  // Kiểm tra xác thực tài khoản, vai trò giáo viên hoặc điều kiện đồng ý
  if (profile?.student_id && !laVaiTroGV(profile.role)) {
    try { loiDenHan = (await demLoiDenHan(supabaseAdmin(), profile.student_id)).denHan; } catch { loiDenHan = 0; }
  }

  const hocTiep = viec?.[0]?.ku_id ?? units?.[0]?.ku_id;
  const chuongTiep = (hocTiep && chapterOf(hocTiep)) || 'C1';
  const diaTiep = DIA_DANH[chuongTiep] ?? DIA_DANH.C1;
  const homNay = [
    { href: hocTiep ? `/hoc/${hocTiep}${viec?.[0] ? '/lo-trinh' : ''}` : '#dn-map-title',
      hinh: chuDeChuong(chuongTiep)?.tranh ?? '/canh/bai-hoc.webp',
      fallback: '/canh/bai-hoc.webp',
      nhan: '📘 Học tiếp', ten: hocTiep ? `${diaTiep.ten} · ${tenKu.get(hocTiep) ?? hocTiep}` : 'Chọn một chương' },
    { href: '/kien-thuc-nen', hinh: '/canh/kien-thuc-nen.webp', fallback: '/chu-de/canh/C5.webp', nhan: '🪁 Trò chơi', ten: 'Luyện kiến thức nền' },
    { href: '/so-loi', hinh: '/canh/so-loi.webp', fallback: '/chu-de/canh/C2.webp', nhan: '🔎 Soát lỗi', ten: loiDenHan ? `${loiDenHan} lỗi đến hạn ôn` : 'Mở sổ lỗi của em' },
  ];
  return (
    <div className="wrap">
      {/* Khối giao diện: Khối nội dung chính */}
      <section className="hs-hom-nay" aria-labelledby="hs-hom-nay">
        <h2 id="hs-hom-nay">Hôm nay em nên làm gì?</h2>
        <div className="hs-hom-nay__luoi">
          {homNay.map((m) => (
            <a key={m.href} className="hs-hom-nay__the" href={m.href} data-viec={loaiViec(m.href)}>
              <AnhChuDe src={m.hinh} fallback={m.fallback} alt="" width={480} height={252} loading="lazy" />
              <span className="hs-hom-nay__chu"><strong className="hs-hom-nay__nhan">{m.nhan}</strong><span>{m.ten}</span></span>
            </a>
          ))}
        </div>
      </section>
      <BanDoDaNang thongKe={`Đã làm chủ ${tongDat}/${units?.length ?? 0} mục kiến thức`}
        loiNhan={<LoiNhanThayCo viec={viecGV}/>}
        moc={CHAPTERS.filter(c => c.id !== 'TN').map(c => {
        const ds = (units ?? []).filter(u => chapterOf(u.ku_id) === c.id);
        return { id: c.id, tong: ds.length, dat: ds.filter(u => (byKu.get(u.ku_id) ?? 0) >= 2).length,
          daBatDau: ds.some(u => byKu.get(u.ku_id) != null) };
      })} />
      {sapToi.length > 0 && (
        <div className="card lich-hs">
          <h2>📅 Lịch bài học sắp tới</h2>
          <ul>
            {sapToi.map((l) => { const tt = trangThaiBai(l, mucCuaBai.get(l.lesson_id) ?? [], nopDau); const t = TEN_TRANG_THAI_BAI[tt]; return (
              <li key={l.lesson_id}>
                <span className="lich-hs__chip" style={{ color: t.mau, background: t.nen }}>{t.bieuTuong} {t.ten}</span>
                <b>{l.lesson_id}</b>
                <small>{tt === 'chua-mo' ? `Mở ngày ${ngayDep(l.ngay_mo)} · ` : ''}Hạn chuẩn bị {gioDep(l.han_chuan_bi)} · Học trên lớp {ngayDep(l.ngay_hoc)}</small>
              </li>); })}
          </ul>
        </div>
      )}

      {nenHong.length > 0 && (
        <div className="card on-loi-hom-nay" style={{ borderColor: '#f4e2a1', background: '#fffbea' }}>
          <p><strong>🧱 Việc nên làm: lấp nền.</strong> Em đang hổng {nenHong.map((n) => `"${n.ten}"`).join(' và ')}. Mỗi gói mất khoảng 5 phút.</p>
          <span style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
            {nenHong.map((n) => <a key={n.ma} className="action-link" href={`/lap-nen/${encodeURIComponent(n.ma)}`}>Làm gói {n.ten.split(/[,:]/)[0]}</a>)}
            <a className="action-link" href="/kien-thuc-nen">Xem tất cả</a>
          </span>
        </div>
      )}

      {loiDenHan > 0 && (
        <div className="card on-loi-hom-nay">
          <p><strong>🪤 Ôn lỗi hôm nay: {loiDenHan} lỗi đến hạn.</strong> Mất khoảng {Math.max(2, loiDenHan * 2)} phút. Em cũng có thể để sang buổi sau.</p>
          <a className="action-link" href="/so-loi">Ôn ngay</a>
        </div>
      )}

      <div className="banner banner-tu-hoc" style={{ fontSize: 13.5, padding: '10px 14px', margin: '14px 0' }}>
        💡 Tự học ở nhà không tính điểm số — làm sai chỗ nào hệ thống sẽ có gợi ý hỗ trợ em chỗ đó.
      </div>

      {/* Việc hệ thống đang giao */}
      {!!viec?.length && (
        <details className="card viec-gon">
          <summary><span>📌 Việc hệ thống gợi ý cho em</span><b>{viec.length}</b></summary>

          {[viec.slice(0, 2), viec.slice(2)].map((nhom, k) => {
            const ds = nhom.map((v, i) => {
            const vbhBai = vbh.get(v.recommended_content ?? '');
            // Tính toán, làm tròn hoặc giới hạn giá trị theo công thức
            const phut = vbhBai?.duration_sec ? Math.round(vbhBai.duration_sec / 60) : null;
            return (
              <div className="rule viec-muc" key={v.rec_id} style={{ marginTop: i ? 14 : 0, borderLeftColor: 'var(--accent)', borderWidth: '2px', background: 'var(--card)' }}>
                <strong>{tenKu.get(v.ku_id) ?? v.ku_id}</strong>

                <div className="lbl">Em đang vướng</div>
                {String(v.diagnosis ?? '').replace(/^Quan niệm sai lặp lại \d+ lần:\s*/, '')}

                <div className="lbl">Làm gì bây giờ</div>
                {vbhBai && !v.accepted ? (
                  <>
                    Đọc vi bài học “{String(vbhBai.title).replace(/^Vi bài học:\s*/, '')}”
                    {phut ? ` — khoảng ${phut} phút` : ''}, rồi quay lại làm bài vận dụng.
                    <div style={{ marginTop: 8 }}>
                      <a className="action-link" href={`/vi-bai-hoc/${v.recommended_content}`}>Mở vi bài học →</a>
                    </div>
                  </>
                ) : vbhBai && v.accepted ? (
                  <>
                    Em đã đọc vi bài học rồi. Còn một bước nữa: làm lại bài vận dụng để hệ thống
                    biết chỗ này đã thông.
                    <div style={{ marginTop: 8 }}>
                      <a className="action-link" href={`/hoc/${v.ku_id}/van-dung`}>Làm lại bài vận dụng →</a>
                    </div>
                  </>
                ) : (
                  <>
                    {v.action}
                    <div style={{ marginTop: 8 }}>
                      <a className="action-link" href={`/hoc/${v.ku_id}/lo-trinh`}>Vào lại mục này →</a>
                    </div>
                  </>
                )}
              </div>
            );
          });
            if (!nhom.length) return null;
            return k === 0 ? <div key="dau">{ds}</div> : (
              <details key="sau" className="viec-them">
                <summary>Xem thêm {nhom.length} việc nữa</summary>
                {ds}
              </details>
            );
          })}
        </details>
      )}

      <p className="action-row" style={{ marginTop: 4 }}>
        <a className="action-link" href="/tien-do">Xem tiến độ của tôi →</a>
      </p>
    </div>
  );
}
