/**
 * FILE NÀY LÀM GÌ: Trang giao diện dành cho giáo viên trong khu vực đã đăng nhập, tổng hợp số liệu lớp và hỗ trợ điều chỉnh dạy học.
 * AI DÙNG: giáo viên
 * ĐỊA CHỈ TRÊN WEB: /gv/chuan-bi
 * LẤY DỮ LIỆU TỪ: profiles, knowledge_units, lich_bai, students, learning_events, mastery_states, quiz_attempts, loi_pho_bien
 * GỌI TỚI: @/components/TeacherWorkspace, @/lib/supabase/server, @/lib/dfle/noi-dung.js, @/lib/thiNghiem, @/components/MathText, @/components/PreClassBriefing, @/components/ClassErrorBreakdown, @/components/TeacherInterventionQueue
 */
import TeacherWorkspace from '@/components/TeacherWorkspace';
import { supabaseServer } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
// @ts-ignore
import { ALL_ERRORS as ERRORS } from '@/lib/dfle/noi-dung.js';
import { thiNghiemCuaMuc } from '@/lib/thiNghiem';
import MathText from '@/components/MathText';
import PreClassBriefing from '@/components/PreClassBriefing';
import ClassErrorBreakdown from '@/components/ClassErrorBreakdown';
import TeacherInterventionQueue from '@/components/TeacherInterventionQueue';
import UnitOptions from '@/components/UnitOptions';
import { docCookieLop } from '@/components/gv/BoLoc';
import { chonLopTu, laVaiTroGV, lopCuaToi, nhanTruongLop, tenHienThiLop } from '@/lib/gv/lopCuaToi';

export const dynamic = 'force-dynamic';

const RULE_LABEL: Record<string, string> = {
  R01: 'Xem thụ động — đã xem hết video nhưng chưa nắm nội dung',
  R02: 'Thuộc quy tắc nhưng chưa vận dụng được',
  R03: 'Quan niệm sai lặp lại (Dai dẳng)',
  R04: 'Có dấu hiệu đoán mò (Làm quá nhanh)',
  R05: 'Hổng kiến thức nền tiên quyết',
  R06: 'Đã làm chủ — có thể hỗ trợ nhóm',
  R07: 'Nhiều ngày không hoạt động',
  R09: 'Chưa xem bài học mà điểm đã thấp'
};

/**
 * Component React `ChuanBiTietDay`: nhận props (thuộc tính truyền vào từ component cha) và dựng giao diện tương ứng.
 */
export default async function ChuanBiTietDay({
  searchParams
}: { searchParams: { lop?: string; ku?: string } }) {
  const supabase = supabaseServer();
  // Kiểm tra xác thực tài khoản, vai trò giáo viên hoặc điều kiện đồng ý
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/dang-nhap');

  const { data: profile } = await supabase
    .from('profiles').select('role').eq('id', user.id).maybeSingle();
  // Kiểm tra xác thực tài khoản, vai trò giáo viên hoặc điều kiện đồng ý
  if (!laVaiTroGV(profile?.role)) redirect('/');

  const classes = await lopCuaToi(supabase);
  const classId = chonLopTu(classes, searchParams.lop, docCookieLop(), false).lop?.class_id;

  const { data: units } = await supabase
    .from('knowledge_units').select('ku_id, ku_name, order_index, prerequisite_ku, lesson_id').order('order_index');
  // Mặc định: mục đầu của bài tới trong Lịch giao bài (không có lịch thì mục đầu chương trình)
  let kuMacDinh = units?.[0]?.ku_id;
  if (!searchParams.ku && classId) {
    // Xử lý mốc ngày giờ theo múi giờ Việt Nam (UTC+7)
    const homNay = new Date(Date.now() + 7 * 3600_000).toISOString().slice(0, 10);
    // Truy vấn Supabase: đọc dữ liệu từ bảng lich_bai
    const { data: toi } = await supabase.from('lich_bai').select('lesson_id').eq('class_id', classId).gte('ngay_hoc', homNay).order('ngay_hoc').limit(1)
      .then((r: any) => r, () => ({ data: null }));
    if (toi?.[0]) {
      // Truy vấn Supabase: đọc dữ liệu từ bảng knowledge_units
      const { data: kuBai } = await supabase.from('knowledge_units').select('ku_id').eq('lesson_id', toi[0].lesson_id).order('order_index').limit(1);
      kuMacDinh = kuBai?.[0]?.ku_id ?? kuMacDinh;
    }
  }
  const kuId = searchParams.ku ?? kuMacDinh;

  if (!classId) {
    return (
      <div className="wrap">
        <h1>Chuẩn bị tiết dạy</h1>
        <div className="card">
          <p className="hint">
            Tài khoản này chưa được gán lớp nào. Vui lòng liên hệ quản trị viên hoặc kiểm tra cấu hình lớp.
          </p>
        </div>
      </div>
    );
  }

  const { data: students } = await supabase
    .from('students').select('student_id, display_name, consent_status').eq('class_id', classId);

  const ids = (students ?? []).map((s) => s.student_id);
  const none = ids.length === 0;

  // Bước 4 ❓: tự đánh giá mức hiểu và câu hỏi học sinh mang lên lớp (lần gửi mới nhất của mỗi em).
  const { data: tuDanhGiaRaw } = none ? { data: [] as any[] } : await supabase.from('learning_events')
    .select('student_id, ts, payload').eq('ku_id', kuId).eq('event_type', 'tu_danh_gia').in('student_id', ids).order('ts', { ascending: false }).limit(1000);
  const tuDanhGia = new Map<string, { muc: number; cauHoi: string }>();
  for (const e of tuDanhGiaRaw ?? []) {
    if (tuDanhGia.has(e.student_id)) continue;
    const muc = Number((e.payload as any)?.muc);
    if (muc >= 1 && muc <= 4) tuDanhGia.set(e.student_id, { muc, cauHoi: String((e.payload as any)?.cau_hoi ?? '').trim() });
  }
  const demMuc = [1, 2, 3, 4].map((m) => Array.from(tuDanhGia.values()).filter((t) => t.muc === m).length);
  const cauHoiLenLop = (students ?? []).filter((s) => tuDanhGia.get(s.student_id)?.cauHoi)
    .map((s) => ({ ten: s.display_name ?? s.student_id, cauHoi: tuDanhGia.get(s.student_id)!.cauHoi, muc: tuDanhGia.get(s.student_id)!.muc }));

  // Thử tay: lần nộp mới nhất của mỗi em cho thí nghiệm của mục này
  const thiNghiem = thiNghiemCuaMuc(kuId ?? '');
  // Truy vấn Supabase: đọc dữ liệu từ bảng learning_events
  const { data: thuTayRaw } = none || !thiNghiem ? { data: [] as any[] } : await supabase.from('learning_events')
    .select('student_id, ts, payload').eq('ku_id', kuId).eq('event_type', 'thi_nghiem').in('student_id', ids).order('ts', { ascending: false }).limit(1000);
  const thuTay = new Map<string, { dung: boolean; chon: number; ghi: string }>();
  for (const e of thuTayRaw ?? []) {
    if (thuTay.has(e.student_id)) continue;
    const p = e.payload as any;
    thuTay.set(e.student_id, { dung: !!p?.dung, chon: Number(p?.chon), ghi: String(p?.ghi ?? '').trim() });
  }
  const thuTayDung = Array.from(thuTay.values()).filter((t) => t.dung).length;
  const thuTaySaiNhieu = (() => {
    const dem = new Map<number, number>();
    for (const t of thuTay.values()) if (!t.dung && Number.isInteger(t.chon)) dem.set(t.chon, (dem.get(t.chon) ?? 0) + 1);
    const top = Array.from(dem).sort((x, y) => y[1] - x[1])[0];
    return top && thiNghiem ? { luaChon: thiNghiem.cauHoi.luaChon[top[0]], so: top[1] } : null;
  })();
  const thuTayGhi = (students ?? []).filter((s) => thuTay.get(s.student_id)?.ghi).map((s) => ({ ten: s.display_name ?? s.student_id, ghi: thuTay.get(s.student_id)!.ghi }));

  const currentClass = (classes ?? []).find((c) => c.class_id === classId);
  const currentKu = (units ?? []).find((u) => u.ku_id === kuId);
  const prereqKuId = currentKu?.prerequisite_ku;
  const prereqKu = (units ?? []).find((u) => u.ku_id === prereqKuId);

  // Truy vấn dữ liệu song song
  const [
    allMasteryRes,
    quizAttemptsRes,
    loiPhoBienRes,
    dictRes,
    recsRes,
    prereqMasteryRes,
    hieuQuaRes
  ] = await Promise.all([
    !none
      ? supabase.from('mastery_states').select('student_id, ku_id, mastery_level').in('student_id', ids)
      : Promise.resolve({ data: [] }),
    !none
      ? supabase.from('quiz_attempts')
          .select('student_id, score, attempt_no, kind')
          .in('student_id', ids)
          .eq('ku_id', kuId)
          .order('attempt_no')
      : Promise.resolve({ data: [] }),
    supabase.from('loi_pho_bien').select('error_code, so_luot').eq('class_id', classId).eq('ku_id', kuId),
    supabase.from('error_dictionary').select('error_code, misconception, remediation_id'),
    !none
      ? supabase.from('recommendations')
          .select('student_id, trigger_rule, created_at')
          .in('student_id', ids)
          .eq('ku_id', kuId)
          .order('created_at', { ascending: false })
      : Promise.resolve({ data: [] }),
    prereqKuId && !none
      ? supabase.from('mastery_states').select('student_id, mastery_level').eq('ku_id', prereqKuId).in('student_id', ids)
      : Promise.resolve({ data: [] }),
    supabase.from('hieu_qua_quy_tac').select('*').eq('class_id', classId)
  ]);

  const dictMap = new Map((dictRes.data ?? []).map((d) => [d.error_code, d.misconception]));
  const errorExampleMap = new Map((ERRORS ?? []).map((e: any) => [e.code, e.viDu]));

  // Học sinh và điểm quiz chuẩn bị lần đầu
  const prepAttempts = (quizAttemptsRes.data ?? []).filter(
    (a: any) => (a.kind ?? 'chuan-bi') === 'chuan-bi' && a.attempt_no === 1
  );
  const scoreByStudent = new Map(prepAttempts.map((a: any) => [a.student_id, Number(a.score)]));

  const totalStudents = (students ?? []).length;
  const preparedCount = prepAttempts.length;
  const averageQuizScore = preparedCount > 0
    ? prepAttempts.reduce((sum: number, a: any) => sum + Number(a.score), 0) / preparedCount
    : null;

  // Nhóm theo quy tắc
  // Mỗi em chỉ tính một lần cho mỗi quy tắc (một em có thể nhận cùng gợi ý nhiều lần)
  const byRule = new Map<string, string[]>();
  for (const r of (recsRes.data ?? [])) {
    const sname = (students ?? []).find((s) => s.student_id === r.student_id)?.display_name ?? r.student_id;
    const ds = byRule.get(r.trigger_rule) ?? [];
    if (r.trigger_rule && !ds.includes(sname)) byRule.set(r.trigger_rule, [...ds, sname]);
  }

  const r01List = byRule.get('R01') ?? [];
  const r04List = byRule.get('R04') ?? [];
  const r05List = byRule.get('R05') ?? [];
  const r06List = byRule.get('R06') ?? [];

  // Học sinh cần để mắt
  // Học sinh cần để mắt: mỗi em một dòng, gộp các lý do
  const lyDo = new Map<string, string[]>();
  const them = (name: string, r: string) => lyDo.set(name, [...new Set([...(lyDo.get(name) ?? []), r])]);
  for (const name of r04List) them(name, 'làm quá nhanh, có thể đoán mò');
  for (const name of r05List) them(name, 'hổng kiến thức nền');
  for (const name of r01List) them(name, 'xem video chưa kĩ');
  for (const s of (students ?? [])) if (!scoreByStudent.has(s.student_id)) them(s.display_name ?? s.student_id, 'chưa chuẩn bị bài');
  const flaggedStudents = Array.from(lyDo, ([name, rs]) => ({ name, reason: rs.join(', ') }));

  // Danh sách lỗi sai phổ biến
  const topErrors = (loiPhoBienRes.data ?? [])
    .map((r: any) => ({
      code: r.error_code as string,
      count: Number(r.so_luot),
      desc: dictMap.get(r.error_code) ?? 'Quan niệm sai cần lưu ý',
      misconception: dictMap.get(r.error_code) ?? 'Quan niệm sai cần lưu ý',
      viDu: errorExampleMap.get(r.error_code) as string | undefined
    }))
    .sort((a, b) => b.count - a.count);

  const topMisconception = topErrors.length > 0 ? topErrors[0] : null;

  // Lỗ hổng tiên quyết
  const prereqHoleCount = (prereqMasteryRes.data ?? []).filter((m: any) => m.mastery_level === 0).length;

  // Dữ liệu cho ClassHeatmap
  const heatmapStudents = (students ?? []).map((s) => ({
    id: s.student_id,
    name: s.display_name ?? s.student_id
  }));

  const heatmapUnits = (units ?? []).map((u) => ({
    id: u.ku_id,
    name: u.ku_name,
    order: u.order_index
  }));

  const heatmapMasteryData = (allMasteryRes.data ?? []).map((m: any) => ({
    studentId: m.student_id,
    kuId: m.ku_id,
    level: Number(m.mastery_level)
  }));

  // Dữ liệu hiệu quả can thiệp T6
  const effects = (hieuQuaRes.data ?? [])
    .map((e: any) => ({
      rule: e.trigger_rule as string,
      ruleLabel: RULE_LABEL[e.trigger_rule] ?? e.trigger_rule,
      issued: Number(e.so_luot_goi_y ?? 0),
      done: Number(e.so_luot_da_dong_vong ?? 0),
      pre: Number(e.diem_truoc_tb ?? 0),
      post: Number(e.diem_sau_tb ?? 0),
      gain: Number(e.muc_tang_tb ?? 0)
    }))
    .sort((a, b) => b.gain - a.gain);


  // Read the full recovery population, not just the escalated queue.
  let recoveryQueue: any[] = [];
  let recoveryError = false;
  let recoveryRecords: any[] = [];
  const studentIds = (students ?? []).map(s => s.student_id);
  if (studentIds.length) {
    // Truy vấn Supabase: đọc dữ liệu từ bảng teacher_intervention_queue
    const queueRes = await supabase.from('teacher_intervention_queue').select('*').eq('class_id', classId);
    recoveryError = !!queueRes.error;
    recoveryQueue = queueRes.data ?? [];
    for (let offset = 0; !recoveryError; offset += 500) {
      // Truy vấn Supabase: đọc dữ liệu từ bảng learning_recovery_records
      const page = await supabase.from('learning_recovery_records').select('*').in('student_id', studentIds).order('recovery_id').range(offset, offset + 499);
      if (page.error) { recoveryError = true; break; }
      recoveryRecords.push(...(page.data ?? []));
      if ((page.data?.length ?? 0) < 500) break;
    }
  }
  recoveryQueue = recoveryQueue.map(q=>({...q,teacher_contacted_at:recoveryRecords.find(r=>r.recovery_id===q.recovery_id)?.teacher_contacted_at??null}));
  // Chỉ giữ hồ sơ của bài đang xem (các mục cùng bài), để danh sách vừa đủ cho một tiết
  const baiDangXem = currentKu?.lesson_id;
  const kuCungBai = new Set((units ?? []).filter((u) => baiDangXem ? u.lesson_id === baiDangXem : u.ku_id === kuId).map((u) => u.ku_id));
  recoveryQueue = recoveryQueue.filter((q: any) => !q.ku_id || kuCungBai.has(q.ku_id));
  const gains = recoveryRecords.filter(r => r.learning_gain !== null && Number.isFinite(Number(r.learning_gain))).map(r => Number(r.learning_gain));
  const funnelStats = {
    detectedCount: recoveryRecords.length,
    inRemediationCount: recoveryRecords.filter(r => r.status === 'in_remediation').length,
    recoveredCount: recoveryRecords.filter(r => r.status === 'verified_success').length,
    escalatedCount: recoveryRecords.filter(r => r.status === 'escalated').length,
    averageGain: gains.length ? gains.reduce((a,b) => a+b,0)/gains.length : null,
    guessCount: recoveryRecords.filter(r => r.is_rapid_guess).length,
    armDistribution: {
      micro_lesson: recoveryRecords.filter(r => r.selected_arm === 'micro_lesson').length,
      scaffold_hint: recoveryRecords.filter(r => r.selected_arm === 'scaffold_hint').length,
      jigsaw_peer: recoveryRecords.filter(r => r.selected_arm === 'jigsaw_peer').length,
      teacher_queue: recoveryRecords.filter(r => r.selected_arm === 'teacher_queue').length
    }
  };

  return (
    <div className="wrap">
      {/* Header và Bộ lọc Lớp & KU */}
      <div className="no-print" style={{ marginBottom: 18 }}>
        <h1 style={{ margin: 0 }}>Báo cáo trước giờ</h1>
        <p className="sub" style={{ margin: '4px 0 0' }}>Lớp đã chuẩn bị tới đâu, em nào cần thầy cô, lỗi nào nên chữa đầu giờ.</p>

        {/* Form chọn Lớp và Đơn vị kiến thức */}
        <form className="card" style={{ display: 'flex', gap: 14, flexWrap: 'wrap', alignItems: 'end', marginTop: 14 }}>
          <div style={{ minWidth: 160 }}>
            <label htmlFor="lop">Lớp học</label>
            <select id="lop" name="lop" defaultValue={classId}>
              {classes.map((c) => (
                <option key={c.class_id} value={c.class_id}>{nhanTruongLop(c)}</option>
              ))}
            </select>
          </div>
          <div style={{ minWidth: 280, flex: 1 }}>
            <label htmlFor="ku">Mục của tiết học</label>
            <select id="ku" name="ku" defaultValue={kuId}>
              <UnitOptions units={units ?? []} />
            </select>
          </div>
          <button className="primary" style={{ padding: '9px 18px' }}>Xem</button>
        </form>
      </div>

      <div className="card" style={{ marginTop: 14 }}>
        <h2>❓ Tự đánh giá và câu hỏi mang lên lớp</h2>
        {tuDanhGia.size ? (
          <>
            <p>{tuDanhGia.size}/{ids.length} học sinh đã tự đánh giá mục này:{' '}
              {['Chưa hiểu', 'Hiểu một phần', 'Làm được bài cơ bản', 'Hiểu rõ'].map((t, i) => <span key={t} className="tag" style={{ marginRight: 6 }}>{'⭐'.repeat(i + 1)} {t}: <b>{demMuc[i]}</b></span>)}
            </p>
            {cauHoiLenLop.length ? (
              <ul style={{ lineHeight: 1.7 }}>
                {cauHoiLenLop.map((c, i) => <li key={i}><b>{c.ten}</b> ({'⭐'.repeat(c.muc)}): {c.cauHoi}</li>)}
              </ul>
            ) : <p className="hint">Chưa em nào ghi câu hỏi.</p>}
          </>
        ) : <p className="hint">Chưa có học sinh nào gửi tự đánh giá cho mục này.</p>}
      </div>

      {thiNghiem && (
        <div className="card" style={{ marginTop: 14 }}>
          <h2>🧪 Thử tay: <MathText>{thiNghiem.ten}</MathText></h2>
          {thuTay.size ? (
            <>
              <p>{thuTay.size}/{ids.length} em đã làm thí nghiệm · <b>{thuTayDung}</b> em trả lời đúng câu "Em thấy gì?".
                {thuTaySaiNhieu && <> Chọn sai nhiều nhất: <MathText>{thuTaySaiNhieu.luaChon}</MathText> ({thuTaySaiNhieu.so} em).</>}</p>
              {thuTayGhi.length > 0 && (
                <ul style={{ lineHeight: 1.7 }}>{thuTayGhi.slice(0, 6).map((g, i) => <li key={i}><b>{g.ten}</b>: {g.ghi}</li>)}</ul>
              )}
            </>
          ) : <p className="hint">Chưa em nào làm thí nghiệm của mục này.</p>}
          <p style={{ margin: 0 }}><a href={`/thi-nghiem/${encodeURIComponent(kuId ?? '')}?chieu=1`}>Chiếu thí nghiệm lên lớp</a></p>
        </div>
      )}

      <TeacherWorkspace key={`${classId}:${kuId}`} titles={['Trước giờ học','Cần giáo viên hỗ trợ','Lỗi thường gặp']}>
      {/* #5 BÁO CÁO TRƯỚC GIỜ HỌC (PRE-CLASS BRIEFING - 3 PHÚT ĐỌC) */}
      <PreClassBriefing
        classCode={currentClass ? tenHienThiLop(currentClass) : classId}
        arm={currentClass?.arm ?? undefined}
        kuId={kuId}
        kuName={currentKu?.ku_name ?? kuId}
        totalStudents={totalStudents}
        preparedCount={preparedCount}
        averageQuizScore={averageQuizScore}
        r01Count={r01List.length}
        r04Count={r04List.length}
        r05Count={r05List.length}
        r06Count={r06List.length}
        topMisconception={topMisconception}
        prereqHoleCount={prereqHoleCount}
        prereqKuName={prereqKu?.ku_name ?? prereqKuId ?? null}
        flaggedStudents={flaggedStudents}
      />

      {/* #ALRE HÀNG ĐỢI CAN THIỆP TRỰC TIẾP CỦA GIÁO VIÊN (HUMAN-IN-THE-LOOP QUEUE) */}
      <div>{recoveryError ? <p role="alert">Không tải được hồ sơ can thiệp. Kiểm tra kết nối và cấu hình dữ liệu.</p> : <TeacherInterventionQueue queue={recoveryQueue} classCode={currentClass ? tenHienThiLop(currentClass) : undefined} />}</div>

      {/* #2 BẢN ĐỒ LỖI SAI CỦA LỚP THEO 4 MIỀN NHẬN THỨC */}
      <ClassErrorBreakdown
        errors={topErrors}
        kuId={kuId}
        totalQuizTakers={preparedCount}
        loadError={!!loiPhoBienRes.error}
        overviewHref={`/gv?lop=${encodeURIComponent(classId)}&ku=${encodeURIComponent(kuId)}`}
      />

      </TeacherWorkspace>
    </div>
  );
}
