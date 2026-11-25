/**
 * FILE NÀY LÀM GÌ: Trang Next.js App Router trong khu vực học tập đã đăng nhập, nạp dữ liệu ban đầu và hiển thị giao diện tương tác.
 * AI DÙNG: học sinh
 * ĐỊA CHỈ TRÊN WEB: /tien-do
 * LẤY DỮ LIỆU TỪ: students, goi_y_su_kien, profiles, knowledge_units, mastery_states, quiz_attempts, recommendations, quiz_answers
 * GỌI TỚI: @/lib/supabase/server, @/lib/dfle/gamification.js, @/components/PersonalErrorMap, @/components/KnowledgeTrajectory, @/components/DauTrang, @/lib/mucHoatDong, @/lib/fasDuLieu, @/lib/minhHoa
 */
import { Suspense } from 'react';
import { supabaseServer, supabaseAdmin } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
// @ts-ignore — dùng chung với gói dfle-engine
import { BADGES } from '@/lib/dfle/gamification.js';
import PersonalErrorMap, { ErrorIncident } from '@/components/PersonalErrorMap';
import KnowledgeTrajectory, { KuTrajectoryData } from '@/components/KnowledgeTrajectory';
import DauTrang from '@/components/DauTrang';
import { khungTuan, TEN_NHOM, CHI_TIEU_CAU_TUAN, type Fas } from '@/lib/mucHoatDong';
import { taiFas } from '@/lib/fasDuLieu';
import { hinhNhanVat } from '@/lib/minhHoa';
import { CHAPTERS, chapterOf } from '@/lib/chapters';
import { CAP_DO } from '@/lib/capDo';
import { DIA_DANH } from '@/lib/diaDanh';
import { docSauTheoMuc } from '@/lib/vuonKienThuc';
import { HanhTrinhDiaDanh } from '@/components/truc-quan/VuonKienThuc';
import NhanVat from '@/components/NhanVat';
import AnhChuDe from '@/components/AnhChuDe';
import TheTuLucHS from '@/components/tu-luc/TheTuLucHS';
import { chuDeChuong } from '@/lib/chuDeChuong';
import type { CSSProperties } from 'react';
import { laVaiTroGV } from '@/lib/gv/lopCuaToi';

export const dynamic = 'force-dynamic';

/** 22/11/2026: tách khỏi trang để truyền dần (Suspense) — trước đây trang Tiến độ chờ cả khối này mới hiện. */
async function NangDongTuanNay({ sid }: { sid: string }) {
  // Chỉ số năng động (FAS) tuần này của chính em. Cần số liệu cả lớp để biết "mục lớp đang học",
  // nên tính ở máy chủ bằng khoá máy chủ; chỉ trả về kết quả của em.
  let hd: Fas | null = null;
  try {
    const admin = supabaseAdmin();
    // Truy vấn Supabase: đọc dữ liệu từ bảng students
    const { data: em } = await admin.from('students').select('class_id').eq('student_id', sid).maybeSingle();
    // Truy vấn Supabase: đọc dữ liệu từ bảng students
    const { data: ban } = em?.class_id ? await admin.from('students').select('student_id').eq('class_id', em.class_id) : { data: [] as { student_id: string }[] };
    const ids = Array.from(new Set([sid, ...(ban ?? []).map((b) => b.student_id)]));
    const tuan = khungTuan();
    hd = (await taiFas(admin, ids, tuan.tu, tuan.den)).get(sid) ?? null;
  } catch { hd = null; }
  const mucHd = hd ? TEN_NHOM[hd.nhom] : null;
  if (!hd || !mucHd) return null;
  return (
    <div className="card hd-cua-em">
          <span className="hd-muc" style={{ color: mucHd.mau, background: mucHd.nen, fontSize: 15 }}>{mucHd.bieuTuong} {mucHd.ten}</span>
          <p><strong>Chỉ số năng động tuần này: {hd.fas}/100</strong></p>
          <p className="hint">{hd.ngay} ngày có học · {hd.cauTraLoi} câu đã làm · điểm phiếu TB {hd.diemPhieu ?? '—'}.
            {hd.fas < 80 && (hd.R < 1 ? ' Vào học đều hơn (5 ngày/tuần) để tăng điểm.' : hd.L < 1 ? ` Làm thêm câu luyện (mục tiêu ${CHI_TIEU_CAU_TUAN} câu/tuần).` : ' Làm bài chuẩn bị đủ các mục lớp đang học.')}
            {' '}Thời gian ngồi máy không cộng điểm, học đều mỗi ngày một chút là tốt nhất.</p>
        </div>
  );
}

/** Thẻ nhỏ tự lực trong tuần: không xếp hạng với bạn, chỉ khích lệ em tự giải sau gợi ý. */
async function TuLucTuanNay({ sid }: { sid: string }) {
  try {
    const admin = supabaseAdmin();
    // Xử lý mốc ngày giờ theo múi giờ Việt Nam (UTC+7)
    const dauTuanMs = Date.now() - 7 * 86400_000;
    const { data, error } = await admin
      .from('goi_y_su_kien')
      .select('tao_luc, thu_lai_luc, tu_giai, so_goi_y_them, xem_loi_giai')
      .eq('student_id', sid)
      .gte('tao_luc', new Date(dauTuanMs).toISOString())
      .not('thu_lai_luc', 'is', null);
    if (error || !data?.length) return null;
    const { xetSuKienTuLuc } = await import('@/lib/khkt/tuLuc');
    const hopLe = data.filter((r: any) => xetSuKienTuLuc(r).daThuLai);
    if (!hopLe.length) return null;
    const tuGiai = hopLe.filter((r: any) => xetSuKienTuLuc(r).tuGiai).length;
    const muc3 = hopLe.filter((r: any) => !xetSuKienTuLuc(r).tuGiai && Boolean(r.xem_loi_giai)).length;
    const muc2 = hopLe.length - tuGiai - muc3;
    const loiDongVien =
      tuGiai === hopLe.length
        ? 'Tuyệt vời! Gợi ý chỉ là ánh đèn soi đường, em tự bước tiếp rất vững.'
        : tuGiai > 0
          ? 'Mỗi lần đọc gợi ý rồi tự nghĩ nốt là em lại rèn thêm sức tự học đấy!'
          : 'Không sao đâu, lần tới thử dừng lại một nhịp sau gợi ý tầng 1 trước khi bấm xem tiếp nhé.';
    return (
      <TheTuLucHS
        tuGiai={tuGiai}
        tongThuLai={hopLe.length}
        muc1={tuGiai}
        muc2={muc2}
        muc3={muc3}
        loiDongVien={loiDongVien}
      />
    );
  } catch {
    return null;
  }
}


const HUY_HIEU: Record<string, { e: string; m: string }> = {
  CHUAN_BI_5: { e: '📘', m: '#2b6de0' }, KIEN_TRI_3: { e: '💪', m: '#e0498a' }, SUA_LOI: { e: '🛠️', m: '#22a06b' },
  CHUOI_7: { e: '🔥', m: '#ff7a1a' }, LAM_CHU_3: { e: '👑', m: '#d4a017' }, HO_TRO_NHOM: { e: '🤝', m: '#7a4fd6' }, VAN_DUNG: { e: '🧩', m: '#0fa3b1' }
};

/**
 * Component React `TienDo`: nhận props (thuộc tính truyền vào từ component cha) và dựng giao diện tương ứng.
 */
export default async function TienDo() {
  const supabase = supabaseServer();
  // Kiểm tra xác thực tài khoản, vai trò giáo viên hoặc điều kiện đồng ý
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/dang-nhap');

  const { data: profile } = await supabase
    .from('profiles').select('student_id, role').eq('id', user.id).maybeSingle();
  // Kiểm tra xác thực tài khoản, vai trò giáo viên hoặc điều kiện đồng ý
  if (laVaiTroGV(profile?.role)) redirect('/gv');
  const sid = profile?.student_id ?? '';

  const { data: units } = await supabase
    .from('knowledge_units').select('ku_id, ku_name, order_index').order('order_index');
  const { data: mastery } = await supabase
    .from('mastery_states').select('ku_id, mastery_level, evidence, updated_at').eq('student_id', sid);
  const { data: attempts } = await supabase
    .from('quiz_attempts').select('attempt_id, ku_id, score, attempt_no, submitted_at')
    .eq('student_id', sid).order('submitted_at', { ascending: true }).limit(50);
  const { data: recs } = await supabase
    .from('recommendations')
    .select('ku_id, trigger_rule, diagnosis, action, created_at, accepted, post_score, recommended_content')
    .eq('student_id', sid).order('created_at', { ascending: false }).limit(5);

  const attemptIds = (attempts ?? []).map((a) => a.attempt_id);
  const attemptMap = new Map((attempts ?? []).map((a) => [a.attempt_id, a]));

  // Lấy các câu trả lời thô của học sinh kèm mã lỗi và vi bài học đã hoàn thành
  const [{ data: answers }, { data: errorDict }, { data: microEvents }, { data: xpRow }, { data: badges }, { data: xpLog }, sau] =
    await Promise.all([
      attemptIds.length
        ? supabase.from('quiz_answers')
            .select('attempt_id, question_id, error_code, is_correct, created_at')
            .in('attempt_id', attemptIds)
        : { data: [] },
      supabase.from('error_dictionary').select('error_code, ku_id, misconception, remediation_id'),
      supabase.from('micro_lesson_events').select('content_id, kind').eq('student_id', sid).eq('kind', 'hoan-thanh'),
      supabase.from('student_xp').select('xp, streak_days').eq('student_id', sid).maybeSingle(),
      supabase.from('student_badges').select('badge_code, earned_at').eq('student_id', sid),
      supabase.from('xp_log').select('ly_do, diem, created_at').eq('student_id', sid).order('created_at', { ascending: false }).limit(6),
      docSauTheoMuc(supabase, sid)
    ]);

  const daCo = new Set((badges ?? []).map((b: any) => b.badge_code));
  const mMap = new Map((mastery ?? []).map((m) => [m.ku_id, m.mastery_level]));
  const evidenceMap = new Map((mastery ?? []).map((m) => [m.ku_id, m.evidence]));
  const tenKu = new Map((units ?? []).map((u) => [u.ku_id, u.ku_name]));
  const dictMap = new Map((errorDict ?? []).map((d) => [d.error_code, d]));
  const completedVbh = new Set((microEvents ?? []).map((m: any) => m.content_id));

  // Điểm quiz lần đầu
  const firstScore = new Map<string, number>();
  for (const a of (attempts ?? [])) {
    if (a.attempt_no === 1 && !firstScore.has(a.ku_id)) firstScore.set(a.ku_id, Number(a.score));
  }

  // --- Dữ liệu cho Tính năng 1 & 2: Bản đồ lỗi cá nhân & Lỗi lặp lại ---
  const errorCountMap = new Map<string, { count: number; lastTs: string; kuId: string }>();
  for (const ans of (answers ?? [])) {
    if (ans.error_code) {
      const prev = errorCountMap.get(ans.error_code);
      const att = attemptMap.get(ans.attempt_id);
      const kuId = att?.ku_id ?? dictMap.get(ans.error_code)?.ku_id ?? '';
      const ts = ans.created_at ?? att?.submitted_at ?? new Date().toISOString();
      if (!prev) {
        errorCountMap.set(ans.error_code, { count: 1, lastTs: ts, kuId });
      } else {
        prev.count += 1;
        if (new Date(ts) > new Date(prev.lastTs)) prev.lastTs = ts;
      }
    }
  }

  const errorIncidents: ErrorIncident[] = Array.from(errorCountMap.entries()).map(([code, val]) => {
    const dict = dictMap.get(code);
    const remediationId = dict?.remediation_id ?? null;
    const isResolved = remediationId ? completedVbh.has(remediationId) : false;
    return {
      errorCode: code,
      kuId: val.kuId,
      kuName: tenKu.get(val.kuId) ?? val.kuId,
      misconception: dict?.misconception ?? 'Quan niệm sai cần lưu ý',
      remediationId,
      count: val.count,
      lastOccurredAt: val.lastTs,
      isResolved
    };
  }).sort((a, b) => b.count - a.count);

  // --- Dữ liệu cho Tính năng 3: Quỹ đạo tri thức BKT ---
  const obsByKu = new Map<string, Array<{ questionId: string; isCorrect: boolean; ts: string }>>();
  for (const ans of (answers ?? []).slice().sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime())) {
    const att = attemptMap.get(ans.attempt_id);
    if (!att?.ku_id) continue;
    const list = obsByKu.get(att.ku_id) ?? [];
    list.push({
      questionId: ans.question_id,
      isCorrect: !!ans.is_correct,
      ts: ans.created_at ?? att.submitted_at
    });
    obsByKu.set(att.ku_id, list);
  }

  const trajectories: KuTrajectoryData[] = (units ?? [])
    .filter((u) => obsByKu.has(u.ku_id))
    .map((u) => ({
      kuId: u.ku_id,
      kuName: u.ku_name,
      masteryLevel: mMap.get(u.ku_id) ?? null,
      observations: obsByKu.get(u.ku_id) ?? []
    }));


  return (
    <div className="wrap">
      <DauTrang tieuDe="Tiến độ của tôi" phu="Em đã học tới đâu, hay sai chỗ nào và đã sửa được gì" hinh={hinhNhanVat('cup')} />

      <p style={{ display: 'flex', gap: 10, flexWrap: 'wrap', margin: '0 0 14px' }}>
        <a className="action-link" href="/kien-thuc-nen">🧱 Kiến thức nền của em</a>
        <a className="action-link" href="/so-loi">🪤 Sổ lỗi</a>
        <a className="action-link" href="/kttx">📄 Nộp bài KTTX giấy</a>
      </p>

      <NhanVat loi="tienDo" compact />
      <HanhTrinhDiaDanh mucs={(units ?? []).map(u => ({
        id: u.ku_id, muc: mMap.get(u.ku_id), loi: sau.get(u.ku_id) ?? 0,
      }))} />

      {/* Chỉ số năng động phải đọc số liệu cả lớp (chậm): tải sau, phần còn lại của trang hiện ngay. */}
      <Suspense fallback={null}><NangDongTuanNay sid={sid} /></Suspense>
      <Suspense fallback={null}><TuLucTuanNay sid={sid} /></Suspense>

      {/* Điểm kinh nghiệm & huy hiệu — bản gọn (23/11/2026) */}
      <div className="card xp-gon">
        <h2>🏆 Thành tích của em</h2>
        <div className="xp-gon__o">
          <div><img src="/minh-hoa/bt/sao.webp" alt="" width={44} height={44} loading="lazy" /><b>{xpRow?.xp ?? 0}</b><span>điểm kinh nghiệm</span></div>
          <div><img src="/minh-hoa/bt/lua.webp" alt="" width={44} height={44} loading="lazy" /><b>{xpRow?.streak_days ?? 0}</b><span>ngày học liên tục</span></div>
          <div><img src="/minh-hoa/bt/huy-hieu.webp" alt="" width={44} height={44} loading="lazy" /><b>{daCo.size}/{BADGES.length}</b><span>huy hiệu</span></div>
        </div>
        <p className="hint">Điểm thưởng cho <strong>việc em làm</strong> (chuẩn bị bài, làm lại câu sai, học đều), không thưởng cho điểm cao.</p>
        <h3 className="hh-tieu">🎖️ Bộ sưu tập huy hiệu <small>{daCo.size}/{BADGES.length}</small></h3>
        <ul className="hh-ds">{BADGES.map((h) => { const k = HUY_HIEU[h.code] ?? { e: '🏅', m: '#e0a020' }; const co = daCo.has(h.code); return (
          <li key={h.code} className={'hh' + (co ? ' hh--co' : ' hh--chua')} style={{ ['--hh' as string]: k.m }} title={h.desc}>
            <span className="hh__huy" aria-hidden="true"><i className="hh__day" /><span className="hh__mat">{co ? k.e : '🔒'}</span></span>
            <b>{h.name}</b><small>{h.desc}</small>
          </li>); })}</ul>
        {(() => {
          const dsChuong = CHAPTERS.filter((c) => DIA_DANH[c.id]).map((c) => {
            const dsMuc = (units ?? []).filter((u) => chapterOf(u.ku_id) === c.id);
            const dat = dsMuc.filter((u) => (mMap.get(u.ku_id) ?? -1) >= 2).length;
            const datHet = dsMuc.length > 0 && dsMuc.every((u) => (mMap.get(u.ku_id) ?? -1) >= 2);
            return { c, cd: chuDeChuong(c.id)!, dsMuc, dat, datHet };
          });
          const soChuongDat = dsChuong.filter((x) => x.datHet).length;
          return (
            <>
              <h3 className="hh-tieu">🏅 Huy hiệu 10 chương <small>{soChuongDat}/{dsChuong.length}</small></h3>
              <p className="hint" style={{ marginTop: 0 }}>Đạt khi mọi mục của chương đều đạt từ mức 🌳 Đại Thụ trở lên.</p>
              <ul className="hh-chuong-ds">
                {dsChuong.map(({ c, cd, dsMuc, dat, datHet }) => (
                  <li key={c.id} className={'hh-chuong' + (datHet ? ' hh--co' : ' hh--chua')} style={{ ['--hh' as string]: cd.mau } as CSSProperties}>
                    <a href={`/tien-do/${c.id}`}>
                      <AnhChuDe
                        className="hh-chuong__anh"
                        src={cd.huyHieu}
                        fallback={cd.anhMuc(datHet ? 4 : 0)}
                        alt={`Huy hiệu ${c.label}`}
                        width={68}
                        height={68}
                        loading="lazy"
                      />
                      <b>{c.label} · {cd.ten}</b>
                      <small>{datHet ? '🏅 Đã đạt huy hiệu' : `${dat}/${dsMuc.length} mục ≥ Đại Thụ`}</small>
                    </a>
                  </li>
                ))}
              </ul>
            </>
          );
        })()}
        {!!xpLog?.length && (() => {
          const gom = new Map<string, { lan: number; diem: number }>();
          for (const l of xpLog as any[]) { const g = gom.get(l.ly_do) ?? { lan: 0, diem: 0 }; g.lan += 1; g.diem += Number(l.diem) || 0; gom.set(l.ly_do, g); }
          // Biểu thức chính quy (regex) kiểm tra hoặc tách chuỗi đúng mẫu dữ liệu
          const bieuTuong = (t: string) => /làm lại/i.test(t) ? '🔁' : /chuẩn bị/i.test(t) ? '📘' : /vận dụng/i.test(t) ? '🧩' : /chuỗi|liên tục|đều/i.test(t) ? '🔥' : '✨';
          return (
            <div className="xp-cong">
              <h3 className="hh-tieu">✨ Gần đây em được cộng</h3>
              <ul>
                {Array.from(gom.entries()).map(([t, g], k) => (
                  <li key={t} style={{ ['--tre' as string]: `${k * 0.12}s`, ['--mx' as string]: ['#ff8a3d', '#2b6de0', '#22a06b', '#a24bd8', '#e0498a'][k % 5] }}>
                    <span className="xp-cong__bt" aria-hidden="true">{bieuTuong(t)}</span>
                    <span className="xp-cong__chu">{t}{g.lan > 1 && <em>×{g.lan}</em>}</span>
                    <b className="xp-cong__diem">+{g.diem}<small>XP</small></b>
                  </li>
                ))}
              </ul>
            </div>
          );
        })()}
      </div>

      {/* TÍNH NĂNG 1 & 2: BẢN ĐỒ LỖI SAI CÁ NHÂN & PHÁT HIỆN LỖI LẶP LẠI */}
      <PersonalErrorMap errors={errorIncidents} />

      {/* TÍNH NĂNG 3: KNOWLEDGE TRACING (BKT) */}
      <KnowledgeTrajectory trajectories={trajectories} />

      {/* Mức làm chủ theo chương (23/11/2026): bấm vào chương để xem từng bài, từng mục */}
      <details className="card vuon-chi-tiet" style={{ marginTop: 20 }}>
        <summary>Mức làm chủ theo chương dạng danh sách</summary>
        <p className="hint" style={{ margin: '0 0 12px' }}>Một mục được tính là <strong>đã làm chủ</strong> khi đạt 🌳 Đại Thụ hoặc ⭐ Đỉnh Sao. Bấm vào chương để xem từng bài, từng mục.</p>
        <div className="lc-chuong">
          {CHAPTERS.map((c) => {
            const ds = (units ?? []).filter((u) => chapterOf(u.ku_id) === c.id);
            if (!ds.length) return null;
            const dem = [0, 1, 2, 3].map((k) => ds.filter((u) => mMap.get(u.ku_id) === k).length);
            const dat = dem[2] + dem[3];
            // Tính toán, làm tròn hoặc giới hạn giá trị theo công thức
            const pt = Math.round((dat / ds.length) * 100);
            return (
              <a key={c.id} className="lc-chuong__the" href={`/tien-do/${c.id}`}>
                <img src={DIA_DANH[c.id] ? `/fluent/${DIA_DANH[c.id].icon}_3d.png` : `/minh-hoa/chuong/${c.id}.webp`} alt="" width={52} height={52} loading="lazy" />
                <span className="lc-chuong__chu">
                  <small>{c.label}</small>
                  <strong>{c.title}</strong>
                  <span className="lc-thanh" aria-label={`Đã làm chủ ${dat}/${ds.length} mục`}><i style={{ width: `${pt}%` }} /></span>
                  <span className="lc-chuong__dem">
                    <b>{dat}/{ds.length} mục</b>
                    {dem.map((n, k) => n ? <span key={k} title={CAP_DO[k].ten}>{CAP_DO[k].bieuTuong}{n}</span> : null)}
                  </span>
                </span>
                <span className="lc-chuong__vao" aria-hidden="true">›</span>
              </a>
            );
          })}
        </div>
      </details>

      {/* Việc hệ thống gợi ý: thẻ ngắn, nút bấm được ngay */}
      <section className="card goi-y-ht">
        <h2>🧭 Việc nên làm tiếp</h2>
        {recs?.length ? <ul className="gy-ds">{recs.map((r, i) => {
          const xong = r.post_score !== null && r.post_score !== undefined;
          // Biểu thức chính quy (regex) kiểm tra hoặc tách chuỗi đúng mẫu dữ liệu
          const chan = String(r.diagnosis ?? '').replace(/^Quan niệm sai lặp lại \d+ lần:\s*/, '');
          // Biểu thức chính quy (regex) kiểm tra hoặc tách chuỗi đúng mẫu dữ liệu
          const ngan = chan.split(/[:.]/)[0].trim();
          // Biểu thức chính quy (regex) kiểm tra hoặc tách chuỗi đúng mẫu dữ liệu
          const doanMo = /đoán mò/i.test(chan);
          return (
            <li key={i} className={'gy' + (xong ? ' gy--xong' : '')}>
              <div className="gy__dau">
                <span className="gy__muc">📍 {tenKu.get(r.ku_id) ?? r.ku_id}</span>
                <span className={'gy__tt ' + (xong ? 'ok' : 'cho')}>{xong ? '✅ Đã xong' : '⏳ Cần làm'}</span>
              </div>
              <p className={'gy__van-de' + (doanMo ? ' gy__van-de--nhanh' : '')}>{doanMo ? '⚡ Làm quá nhanh, có vẻ đoán' : '🪤 ' + ngan}</p>
              {!xong && <div className="gy__nut">
                {r.recommended_content && !r.accepted && <a className="gy-btn gy-btn--tim" href={`/vi-bai-hoc/${r.recommended_content}`}>📖 Đọc vi bài học</a>}
                {doanMo && <a className="gy-btn gy-btn--xanh" href={`/hoc/${r.ku_id}`}>🎬 Xem lại bài</a>}
                <a className="gy-btn gy-btn--cam" href={`/hoc/${r.ku_id}/van-dung`}>✍️ Làm lại bài vận dụng</a>
              </div>}
            </li>
          );
        })}</ul> : <p className="hint">Chưa có gợi ý nào. Hãy làm bài kiểm tra ngắn của một bài học.</p>}
      </section>
    </div>
  );
}
