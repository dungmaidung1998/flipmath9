/**
 * FILE NÀY LÀM GÌ: Trang Next.js App Router trong khu vực học tập đã đăng nhập, nạp dữ liệu ban đầu và hiển thị giao diện tương tác.
 * AI DÙNG: học sinh
 * ĐỊA CHỈ TRÊN WEB: /bai-hoc/[chuong]
 * LẤY DỮ LIỆU TỪ: profiles, knowledge_units, mastery_states, students, lich_bai, quiz_attempts, class_content
 * GỌI TỚI: @/lib/supabase/server, @/lib/lichBai, @/lib/chapters, @/components/PrerequisiteGraph, @/components/CapDo, @/lib/minhHoa, @/components/truc-quan/BanDoDaNang, @/lib/chuDeChuong
 */
import { supabaseServer } from '@/lib/supabase/server';
import { trangThaiBai, TEN_TRANG_THAI_BAI, ngayDep, gioDep, type Lich } from '@/lib/lichBai';
import { notFound, redirect } from 'next/navigation';
import { CHAPTERS, chapterOf } from '@/lib/chapters';
import PrerequisiteGraph from '@/components/PrerequisiteGraph';
import CapDo from '@/components/CapDo';
import { hinhBai } from '@/lib/minhHoa';
import { BangRonDiaDanh } from '@/components/truc-quan/BanDoDaNang';
import { chuDeChuong } from '@/lib/chuDeChuong';
import { laVaiTroGV } from '@/lib/gv/lopCuaToi';
import type { CSSProperties } from 'react';

export const dynamic = 'force-dynamic';

/**
 * TRANG MỘT CHƯƠNG: bấm vào chương ở /bai-hoc thì mở trang này,
 * chỉ hiện các bài và mục của chương đó; lọc bỏ mục có an=true và gắn nhãn đảo ngược / tự học thêm.
 */
export default async function TrangChuong({ params }: { params: { chuong: string } }) {
  const chuong = CHAPTERS.find((c) => c.id === params.chuong);
  if (!chuong) notFound();

  const supabase = supabaseServer();
  // Kiểm tra xác thực tài khoản, vai trò giáo viên hoặc điều kiện đồng ý
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/dang-nhap');
  const { data: profile } = await supabase
    .from('profiles').select('role, student_id').eq('id', user.id).maybeSingle();
  // Kiểm tra xác thực tài khoản, vai trò giáo viên hoặc điều kiện đồng ý
  if (laVaiTroGV(profile?.role)) redirect('/gv');

  const [{ data: units }, { data: mastery }] = await Promise.all([
    supabase.from('knowledge_units').select('ku_id, ku_name, order_index, lesson_id, prerequisite_ku').order('order_index'),
    supabase.from('mastery_states').select('ku_id, mastery_level').eq('student_id', profile?.student_id ?? '')
  ]);
  const byKu = new Map((mastery ?? []).map((m) => [m.ku_id, m.mastery_level]));
  const tenKu = new Map((units ?? []).map((u) => [u.ku_id, u.ku_name]));
  const rawChapterUnits = (units ?? []).filter((u) => chapterOf(u.ku_id) === chuong.id);

  // Lịch giao bài ba mốc & bật/tắt nội dung theo lớp (class_content)
  const lichCua = new Map<string, Lich>();
  const nopDau = new Map<string, string>();
  const noiDungLop = new Map<string, { dao_nguoc: boolean; an: boolean }>();

  if (profile?.student_id) {
    // Truy vấn Supabase: đọc dữ liệu từ bảng students
    const { data: em } = await supabase.from('students').select('class_id').eq('student_id', profile.student_id).maybeSingle();
    const [{ data: lich }, { data: cb }, { data: cc }] = await Promise.all([
      em?.class_id ? supabase.from('lich_bai').select('lesson_id, ngay_mo, han_chuan_bi, ngay_hoc').eq('class_id', em.class_id).then((r) => r, () => ({ data: [] as Lich[] })) : Promise.resolve({ data: [] as Lich[] }),
      supabase.from('quiz_attempts').select('ku_id, submitted_at').eq('student_id', profile.student_id).eq('kind', 'chuan-bi').order('submitted_at'),
      em?.class_id ? supabase.from('class_content').select('ku_id, dao_nguoc, an').eq('class_id', em.class_id).then((r: any) => r, () => ({ data: [] as any[] })) : Promise.resolve({ data: [] as any[] })
    ]);
    for (const l of (lich ?? []) as Lich[]) lichCua.set(l.lesson_id, l);
    for (const a of cb ?? []) if (a.submitted_at && !nopDau.has(a.ku_id)) nopDau.set(a.ku_id, a.submitted_at);
    for (const row of cc ?? []) noiDungLop.set(row.ku_id, { dao_nguoc: !!row.dao_nguoc, an: !!row.an });
  }

  // Ẩn các mục lớp đang đánh dấu an=true
  const chapterUnits = rawChapterUnits.filter((u) => !noiDungLop.get(u.ku_id)?.an);

  // gom theo bài, giữ nguyên thứ tự xuất hiện
  const bai: { ten: string; mucs: NonNullable<typeof units> }[] = [];
  for (const u of chapterUnits) {
    const ten = u.lesson_id ?? 'Khác';
    const cuoi = bai[bai.length - 1];
    if (cuoi && cuoi.ten === ten) cuoi.mucs.push(u);
    else bai.push({ ten, mucs: [u] });
  }

  const dat = chapterUnits.filter((u) => (byKu.get(u.ku_id) ?? 0) >= 2).length;
  const graphNodes = chapterUnits.map((u) => ({ id: u.ku_id, name: u.ku_name, prerequisite: u.prerequisite_ku, mastery: byKu.get(u.ku_id) ?? null }));
  const cd = chuDeChuong(chuong.id);

  return (
    <div className={cd ? 'wrap trang-chuong' : 'wrap'} style={cd ? ({ ['--mau-chuong' as string]: cd.mau } as CSSProperties) : undefined}>
      <p className="chuong-ve"><a href="/bai-hoc">← Bản đồ các chương</a></p>
      {chuong.id !== 'TN' ? <BangRonDiaDanh id={chuong.id} label={chuong.label} title={chuong.title} dat={dat} tong={chapterUnits.length}/> : <div className="chuong-dau">
        <img src={`/minh-hoa/chuong/${chuong.id}.webp`} width={96} height={96} alt="" />
        <div>
          <span className="hint">{chuong.label}</span>
          <h1 className="chapter-heading" style={{ margin: '2px 0 4px' }}>{chuong.title}</h1>
          <span className="hint">{dat}/{chapterUnits.length} mục đã đạt mức làm chủ</span>
        </div>
      </div>}

      {chuong.id === 'C4' && (
        <div className="card" style={{ display: 'flex', flexWrap: 'wrap', gap: 12, alignItems: 'center', justifyContent: 'space-between', background: '#eefaf2', borderColor: '#86efac' }}>
          <div>
            <h2 style={{ margin: 0, fontSize: '1.05rem', color: '#14532d' }}>📐 Thực hành Đà Nẵng: Đo chiều cao bằng điện thoại (3D + AR)</h2>
            <p className="hint" style={{ margin: '4px 0 0' }}>
              Dùng giác kế trên điện thoại (hoặc thanh trượt trên máy tính) ngắm đỉnh cột cờ, cây xanh rồi tự tính chiều cao bằng hệ thức $\tan\alpha$.
            </p>
          </div>
          <a className="button primary" href="/do-chieu-cao">Mở giác kế 3D →</a>
        </div>
      )}

      {bai.map((b) => {
        const datBai = b.mucs.filter((u) => (byKu.get(u.ku_id) ?? 0) >= 2).length;
        return (
          <div className={cd ? 'card bai-the-chuong' : 'card'} key={b.ten}>
            <div className="bai-dau">
              {hinhBai(b.ten) && <img className="bai-dau__hinh" src={hinhBai(b.ten)!} alt="" width={240} height={240} loading="lazy" />}
              <h2>{b.ten}</h2>
              {(() => { const tt = trangThaiBai(lichCua.get(b.ten), b.mucs.map((u) => u.ku_id), nopDau); if (tt === 'chua-giao') return null; const t = TEN_TRANG_THAI_BAI[tt]; const l = lichCua.get(b.ten)!;
                return <span className="lich-hs__chip" style={{ color: t.mau, background: t.nen }} title={`Mở ${ngayDep(l.ngay_mo)} · hạn ${gioDep(l.han_chuan_bi)} · học ${ngayDep(l.ngay_hoc)}`}>
                  {t.bieuTuong} {tt === 'chua-mo' ? `Mở ngày ${ngayDep(l.ngay_mo)}` : tt === 'dang-mo' ? `Hạn ${gioDep(l.han_chuan_bi)}` : t.ten}</span>; })()}
            </div>
            <p className="hint" style={{ marginBottom: 12 }}>{datBai}/{b.mucs.length} mục đã đạt mức làm chủ</p>
            <ul className="muc-ds">
              {b.mucs.map((u) => {
                const tq = u.prerequisite_ku;
                const hong = tq ? (byKu.get(tq) ?? 0) < 2 : false;
                const laLTC = u.ku_id.includes('-LTC');
                const laOTC = u.ku_id.includes('-OTC');
                const daoNguoc = !!noiDungLop.get(u.ku_id)?.dao_nguoc;
                return (
                  <li key={u.ku_id}>
                    <a className={'muc-ds__dong' + (laLTC || laOTC ? ' muc-ds__dong--on-tap' : '')} href={`/hoc/${u.ku_id}`}>
                      <span className="muc-ds__ten">
                        {u.ku_name}
                        {(laLTC || laOTC) && (
                          <span className={'muc-huy-hieu' + (laOTC ? ' muc-huy-hieu--otc' : '')}>
                            🏅 {laOTC ? 'Ôn tập cuối chương' : 'Luyện tập chung'}
                          </span>
                        )}
                        <small
                          style={{
                            display: 'inline-block',
                            marginTop: 4,
                            padding: '2px 8px',
                            borderRadius: 999,
                            fontSize: 12,
                            fontWeight: 700,
                            background: daoNguoc ? '#e8f1ff' : '#f3f5f8',
                            color: daoNguoc ? '#1d4ed8' : '#526075'
                          }}
                        >
                          {daoNguoc ? '🔄 Tiết đảo ngược – chuẩn bị trước giờ học' : 'Tự học thêm (không bắt buộc)'}
                        </small>
                        {hong && <small className="hint">↳ Cần vững trước: {tenKu.get(tq!) ?? tq}</small>}
                      </span>
                      <span className="muc-ds__muc"><CapDo m={byKu.get(u.ku_id)} chuong={chuong.id} /></span>
                      <span className="muc-ds__vao">Vào học →</span>
                    </a>
                  </li>
                );
              })}
            </ul>
          </div>
        );
      })}

      {!chapterUnits.length && (
        <div className="card"><p className="hint">Phần này chưa có bài học khả dụng cho lớp của em.</p></div>
      )}

      {/* Đồ thị kiến thức tiên quyết của chương — thu gọn, bấm mới mở */}
      {chapterUnits.length > 0 && <PrerequisiteGraph nodes={graphNodes} thuGon />}

      <p className="action-row" style={{ marginTop: 4 }}><a className="action-link" href="/bai-hoc">← Về danh sách chương</a></p>
    </div>
  );
}
