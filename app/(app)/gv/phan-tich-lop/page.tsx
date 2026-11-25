/**
 * FILE NÀY LÀM GÌ: Trang giao diện dành cho giáo viên trong khu vực đã đăng nhập, tổng hợp số liệu lớp và hỗ trợ điều chỉnh dạy học.
 * AI DÙNG: giáo viên
 * ĐỊA CHỈ TRÊN WEB: /gv/phan-tich-lop
 * LẤY DỮ LIỆU TỪ: profiles, knowledge_units, dashboard_views, students, week_plan, les_tong_hop, quiz_attempts, mastery_states
 * GỌI TỚI: @/lib/supabase/server, @/lib/dfle/les.js, @/components/charts/GroupBar, @/components/charts/VideoQuizScatter, @/components/charts/PhieuViBaiHoc, @/components/TeacherStudentTable, @/components/PrerequisiteGraph, @/components/UnitOptions
 */
import { supabaseServer, supabaseAdmin } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
// @ts-ignore — bộ máy dùng chung với bản CLI, viết bằng JavaScript thuần
import { componentScores, les, soThanhPhanDoDuoc, quartileCutoffs, classify, FIXED_CUTOFFS, WEIGHTS_V1 } from '@/lib/dfle/les.js';
import GroupBar from '@/components/charts/GroupBar';
import VideoQuizScatter from '@/components/charts/VideoQuizScatter';
import PhieuViBaiHoc from '@/components/charts/PhieuViBaiHoc';
import TeacherStudentTable from '@/components/TeacherStudentTable';
import PrerequisiteGraph from '@/components/PrerequisiteGraph';
import UnitOptions from '@/components/UnitOptions';
import { docCookieLop } from '@/components/gv/BoLoc';
import { chonLopTu, laVaiTroGV, lopCuaToi, nhanTruongLop } from '@/lib/gv/lopCuaToi';

export const dynamic = 'force-dynamic';

const RULE_LABEL: Record<string, string> = {
  R01: 'Xem thụ động — đã xem hết video nhưng chưa nắm nội dung',
  R02: 'Thuộc quy tắc nhưng chưa vận dụng được',
  R03: 'Quan niệm sai lặp lại',
  R04: 'Có dấu hiệu đoán mò',
  R05: 'Hổng kiến thức nền',
  R06: 'Đã làm chủ — có thể hỗ trợ nhóm',
  R07: 'Nhiều ngày không hoạt động',
  R09: 'Chưa xem bài học mà điểm đã thấp'
};

/**
 * Component React `BangDieuKhien`: nhận props (thuộc tính truyền vào từ component cha) và dựng giao diện tương ứng.
 */
export default async function BangDieuKhien({
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
    .from('knowledge_units').select('ku_id, ku_name, order_index, prerequisite_ku').order('order_index');
  const kuId = searchParams.ku ?? units?.[0]?.ku_id;

  if (!classId) {
    return (
      <div className="wrap">
        <h1>Bảng điều khiển lớp</h1>
        <div className="card">
          <p className="hint">
            Tài khoản này chưa được phân công lớp nào. Liên hệ quản trị trường để được gán vào lớp.
          </p>
        </div>
      </div>
    );
  }

  // ------------------------------------------------------------------------
  // BẰNG CHỨNG CHO ĐỘ TRUNG THỰC TRIỂN KHAI
  // ------------------------------------------------------------------------
  try {
    // Truy vấn Supabase: đọc dữ liệu từ bảng dashboard_views
    await supabaseAdmin().from('dashboard_views')
      .insert({ teacher_id: user.id, class_id: classId, ku_id: kuId ?? null });
  } catch {
    /* bảng chưa tạo hoặc thiếu khoá service role */
  }

  const { data: students } = await supabase
    .from('students').select('student_id, display_name, consent_status').eq('class_id', classId);

  const { data: keHoachTuan } = await supabase
    .from('week_plan').select('tuan, so_tiet_ke_hoach').eq('class_id', classId);
  const buoiCoBai =
    (keHoachTuan ?? []).reduce((n, w) => n + (w.so_tiet_ke_hoach ?? 0), 0) || null;
  const ids = (students ?? []).map((s) => s.student_id);
  const noStudents = ids.length === 0;
  const khongAi = ['__none__'];

  // Đơn vị kiến thức hiện tại & tiên quyết
  const currentKu = (units ?? []).find((u) => u.ku_id === kuId);
  const prereqKuId = currentKu?.prerequisite_ku;
  const prereqKuName = (units ?? []).find((u) => u.ku_id === prereqKuId)?.ku_name ?? prereqKuId;

  const [tongHopRes, attemptsRes, masteryRes, recsRes, videoRes, vbhAggRes, hqAggRes, loiRes, prereqMasteryRes, allMasteryRes] =
    await Promise.all([
      supabase.from('les_tong_hop').select('*').eq('class_id', classId),
      supabase.from('quiz_attempts')
        .select('student_id, score, attempt_no, kind')
        .in('student_id', noStudents ? khongAi : ids).eq('ku_id', kuId).order('attempt_no'),
      supabase.from('mastery_states')
        .select('student_id, mastery_level')
        .in('student_id', noStudents ? khongAi : ids).eq('ku_id', kuId),
      supabase.from('recommendations')
        .select('student_id, trigger_rule, created_at')
        .in('student_id', noStudents ? khongAi : ids).eq('ku_id', kuId)
        .order('created_at', { ascending: false }),
      supabase.from('contents').select('ku_id, duration_sec').eq('kind', 'video'),
      supabase.from('vi_bai_hoc_tong_hop').select('*').eq('class_id', classId),
      supabase.from('hieu_qua_quy_tac').select('*').eq('class_id', classId),
      supabase.from('loi_pho_bien').select('error_code, so_luot').eq('class_id', classId).eq('ku_id', kuId),
      prereqKuId && !noStudents
        ? supabase.from('mastery_states').select('student_id, mastery_level').eq('ku_id', prereqKuId).in('student_id', ids)
        : Promise.resolve({ data: [] }),
      !noStudents
        ? supabase.from('mastery_states').select('ku_id, mastery_level').in('student_id', ids)
        : Promise.resolve({ data: [] })
    ]);

  if (tongHopRes.error) {
    return (
      <div className="wrap">
        <h1>Theo từng mục</h1>
        <div className="card">
          <h2>Chưa chạy tệp tổng hợp</h2>
          <p className="hint">
            Trang này đọc số liệu đã cộng sẵn ở phía máy chủ. Mở SQL Editor của Supabase và chạy
            <code> supabase/15-view-tong-hop-va-lich-su.sql</code>, rồi tải lại trang.
          </p>
          <p className="hint">Thông báo gốc: <code>{tongHopRes.error.message}</code></p>
        </div>
      </div>
    );
  }

  const tongHop = tongHopRes.data ?? [];
  const attempts = attemptsRes.data ?? [];
  const mastery = masteryRes.data ?? [];
  const recs = recsRes.data ?? [];

  const { data: dict } = await supabase
    .from('error_dictionary').select('error_code, misconception, remediation_id');
  const dictMap = new Map((dict ?? []).map((d) => [d.error_code, d.misconception]));
  const topErrors: [string, number][] = (loiRes.data ?? [])
    .map((r: any) => [r.error_code as string, r.so_luot as number] as [string, number])
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5);

  const { data: dsVbh } = await supabase
    .from('contents').select('content_id, title').eq('kind', 'micro-lesson');
  const tenVbh = new Map((dsVbh ?? []).map((c: any) => [c.content_id, c.title]));

  const loiCuaVbh = new Map<string, string[]>();
  for (const d of dict ?? []) {
    if (!d.remediation_id) continue;
    loiCuaVbh.set(d.remediation_id, [...(loiCuaVbh.get(d.remediation_id) ?? []), d.error_code]);
  }

  const coNhatKyViBaiHoc = !vbhAggRes.error;
  const vbhRows = (vbhAggRes.data ?? [])
    .map((v: any) => ({
      id: v.content_id as string,
      ten: (tenVbh.get(v.content_id) ?? v.content_id).replace(/^Vi bài học:\s*/, ''),
      loi: loiCuaVbh.get(v.content_id) ?? [],
      giao: v.so_em_duoc_giao as number,
      mo: v.so_em_da_mo as number,
      xong: v.so_em_lam_xong as number,
      tiLeXong: v.so_em_duoc_giao ? Math.round((v.so_em_lam_xong / v.so_em_duoc_giao) * 100) : 0,
      tuKiem: v.tong_cau ? Math.round((v.tong_cau_dung / v.tong_cau) * 100) : null
    }))
    .sort((a, b) => (a.giao >= 3 ? 0 : 1) - (b.giao >= 3 ? 0 : 1) || a.tiLeXong - b.tiLeXong)
    .slice(0, 8);

  const vbhYeuNhat = vbhRows.find((r) => r.giao >= 3 && r.tiLeXong < 50) ?? null;

  const dsVideo = (videoRes.data ?? []).filter((c: any) => c.duration_sec);
  const videoTB = dsVideo.length
    ? dsVideo.reduce((n: number, c: any) => n + c.duration_sec, 0) / dsVideo.length
    : 480;

  const rows = (students ?? []).map((s) => {
    const t: any = tongHop.find((x: any) => x.student_id === s.student_id);
    const soMuc = t ? Number(t.so_muc_da_bat_dau ?? 0) : 0;
    const comp = componentScores({
      activeWatchSec: t ? Number(t.giay_xem_co_tuong_tac ?? 0) : 0,
      assignedVideoSec: videoTB * Math.max(1, soMuc),
      firstQuizScores: ((t?.diem_quiz_lan_dau ?? []) as any[]).map(Number),
      assignmentsDone: t ? Number(t.so_bai_tap_da_nop ?? 0) : 0,
      assignmentsAssigned: soMuc,
      activeDays: t ? Number(t.so_ngay_co_hoat_dong ?? 0) : 0,
      daysWithWork: buoiCoBai,
      voluntaryRetries: t ? Number(t.so_lan_tu_lam_lai ?? 0) : 0,
      feedbackWithHints: t ? Number(t.so_lan_nhan_phan_hoi ?? 0) : 0
    });
    const lesValue = les(comp, WEIGHTS_V1);
    const m = mastery.find((x: any) => x.student_id === s.student_id);
    const rec = recs.find((r: any) => r.student_id === s.student_id);
    const firstThisKu = attempts.find(
      (a: any) => a.student_id === s.student_id && a.attempt_no === 1
        && (a.kind ?? 'chuan-bi') === 'chuan-bi'
    );
    return {
      id: s.student_id,
      name: s.display_name ?? s.student_id,
      consent: s.consent_status,
      les: lesValue,
      soThanhPhan: soThanhPhanDoDuoc(comp),
      video: comp.video === null ? null : Math.round(comp.video),
      quiz: firstThisKu ? Number(firstThisKu.score) : null,
      mastery: (m?.mastery_level ?? null) as number | null,
      rule: rec?.trigger_rule ?? null
    };
  });

  const daDo = rows.filter((r) => r.les !== null).map((r) => r.les as number);
  const cutoffs: [number, number, number] =
    daDo.length >= 4 ? (quartileCutoffs(daDo) as [number, number, number]) : FIXED_CUTOFFS;
  const withGroup = rows
    .map((r) => ({ ...r, group: r.les === null ? null : classify(r.les, cutoffs) }))
    .sort((a, b) => (a.les ?? -1) - (b.les ?? -1));

  const byRule = new Map<string, string[]>();
  for (const r of withGroup) if (r.rule) byRule.set(r.rule, [...(byRule.get(r.rule) ?? []), r.name]);

  const effect = (hqAggRes.data ?? [])
    .map((e: any) => ({
      rule: e.trigger_rule as string,
      issued: Number(e.so_luot_goi_y ?? 0),
      done: Number(e.so_luot_da_dong_vong ?? 0),
      pre: Number(e.diem_truoc_tb ?? 0),
      post: Number(e.diem_sau_tb ?? 0),
      gain: Number(e.muc_tang_tb ?? 0)
    }))
    .sort((a, b) => b.gain - a.gain);

  const chuaLam = withGroup.filter((r) => r.quiz === null).length;
  const daLam = withGroup.length - chuaLam;

  // --- TÍNH NĂNG 8: CẢNH BÁO SỚM & ĐỀ XUẤT CAN THIỆP SƯ PHẠM ---
  const topMisconception = topErrors.length > 0 ? {
    code: topErrors[0][0],
    count: topErrors[0][1],
    desc: dictMap.get(topErrors[0][0]) ?? 'Quan niệm sai cần lưu ý'
  } : null;

  const r01Count = byRule.get('R01')?.length ?? 0;
  const r04Count = byRule.get('R04')?.length ?? 0;
  const r06List = byRule.get('R06') ?? [];
  const masteryGoodCount = withGroup.filter((r) => r.group === 'Tốt' || (r.mastery !== null && r.mastery >= 2)).length;

  const prereqHoleCount = (prereqMasteryRes?.data ?? []).filter((m: any) => m.mastery_level === 0).length;

  // Tính mức làm chủ trung bình của cả lớp cho Đồ thị DAG 14 KU
  const kuMasterySum = new Map<string, number>();
  const kuMasteryCount = new Map<string, number>();
  for (const m of (allMasteryRes?.data ?? [])) {
    if (m.mastery_level !== null) {
      kuMasterySum.set(m.ku_id, (kuMasterySum.get(m.ku_id) ?? 0) + m.mastery_level);
      kuMasteryCount.set(m.ku_id, (kuMasteryCount.get(m.ku_id) ?? 0) + 1);
    }
  }

  const classGraphNodes = (units ?? []).map((u) => {
    const sum = kuMasterySum.get(u.ku_id) ?? 0;
    const cnt = kuMasteryCount.get(u.ku_id) ?? 0;
    const avg = cnt > 0 ? sum / cnt : null;
    return {
      id: u.ku_id,
      name: u.ku_name,
      prerequisite: u.prerequisite_ku,
      mastery: avg !== null ? Math.round(avg) : null
    };
  });

  return (
    <div className="wrap">
      <h1>Theo từng mục</h1>
      <p className="sub">Lớp nắm từng mục tới đâu, ai đã làm, lỗi nào nhiều.</p>

      {/* Khối giao diện: Biểu mẫu nhập liệu */}
      <form className="card" style={{ display: 'flex', gap: 14, flexWrap: 'wrap', alignItems: 'end' }}>
        <div style={{ minWidth: 160 }}>
          <label htmlFor="lop">Lớp</label>
          <select id="lop" name="lop" defaultValue={classId}>
            {classes.map((c) => (
              <option key={c.class_id} value={c.class_id}>{nhanTruongLop(c)}</option>
            ))}
          </select>
        </div>
        <div style={{ minWidth: 260, flex: 1 }}>
          <label htmlFor="ku">Mục</label>
          <select id="ku" name="ku" defaultValue={kuId}>
            <UnitOptions units={units ?? []} />
          </select>
        </div>
        <button className="primary">Xem</button>
      </form>

      {/* TÍNH NĂNG 4: BẢN ĐỒ TIÊN QUYẾT TOÀN CHƯƠNG CHO GIÁO VIÊN */}
      <PrerequisiteGraph nodes={classGraphNodes} activeKu={kuId} />

      <div className="card">
        <h2>Tổng quan mục này</h2>
        <div className="stat">
          <div><b>{withGroup.length}</b><span>học sinh</span></div>
          <div><b>{daLam}</b><span>đã làm bài chuẩn bị</span></div>
          <div><b style={{ color: chuaLam ? 'var(--warn)' : undefined }}>{chuaLam}</b><span>chưa làm</span></div>
          <div><b>{byRule.get('R01')?.length ?? 0}</b><span>xem video chưa kĩ</span></div>
          <div><b>{byRule.get('R06')?.length ?? 0}</b><span>đã nắm chắc, kèm được bạn</span></div>
        </div>
        <div style={{ marginTop: 18, paddingTop: 16, borderTop: '1px solid var(--line)' }}>
          <h2>Phân bố mức độ tham gia</h2>
          <GroupBar rows={withGroup.filter((r) => r.group !== null) as { group: string }[]} />
        </div>
      </div>

      <div className="card">
        <h2>Xem video và điểm chuẩn bị</h2>
        <VideoQuizScatter
          points={withGroup
            .filter((r) => r.quiz !== null && r.video !== null)
            .map((r) => ({ name: r.name, video: r.video as number, quiz: r.quiz as number }))}
        />
      </div>

      <div>
        <div className="card">
          <h2>Lỗi nhiều em mắc</h2>
          {topErrors.length ? (
            <div className="scroll" style={{ marginTop: 14 }}>
              {/* Khối giao diện: Bảng số liệu tổng hợp */}
              <table>
                <thead><tr><th>Các em đang hiểu sai điều gì</th><th className="n">Lượt</th></tr></thead>
                <tbody>
                  {topErrors.map(([code, n]) => (
                    <tr key={code}>
                      <td>{dictMap.get(code) ?? '—'}</td>
                      <td className="n">{n}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : null}
          <p className="hint" style={{ marginTop: 10 }}>
            Đây là chỗ nên tổ chức hoạt động kiến tạo lại khái niệm trên lớp, thay vì giảng lại toàn bài.
          </p>
        </div>
      </div>

      {/* Vi bài học nào đang bị bỏ dở */}
      <div className="card">
        <h2>Vi bài học: bài nào đang bị bỏ dở</h2>
        {!coNhatKyViBaiHoc ? (
          <p className="hint">Chưa có nhật ký vi bài học.</p>
        ) : !vbhRows.length ? (
          <p className="hint">Chưa có vi bài học nào được giao.</p>
        ) : (
          <>
            <div className="scroll">
              {/* Khối giao diện: Bảng số liệu tổng hợp */}
              <table>
                <thead>
                  <tr>
                    <th>Vi bài học</th>
                    <th className="n">Giao</th>
                    <th className="n">Mở</th>
                    <th className="n">Làm xong</th>
                    <th>Đường đi</th>
                    <th className="n">Tự kiểm đúng</th>
                  </tr>
                </thead>
                <tbody>
                  {vbhRows.map((r) => (
                    <tr key={r.id}>
                      <td>{r.ten}</td>
                      <td className="n">{r.giao}</td>
                      <td className="n">{r.mo}</td>
                      <td className="n">
                        <span className={'tag ' + (r.giao < 3 ? '' : r.tiLeXong >= 50 ? 'ok' : 'warn')}>
                          {r.xong} · {r.tiLeXong}%
                        </span>
                      </td>
                      <td><PhieuViBaiHoc giao={r.giao} mo={r.mo} xong={r.xong} /></td>
                      <td className="n">{r.tuKiem === null ? '—' : `${r.tuKiem}%`}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {vbhYeuNhat && (
              <div className="rule" style={{ borderLeftColor: 'var(--accent)', marginTop: 14 }}>
                <strong>Việc cần làm trước</strong>
                <div className="lbl">Bài yếu nhất</div>
                “{vbhYeuNhat.ten}” — giao {vbhYeuNhat.giao} em, {vbhYeuNhat.mo} em mở,
                chỉ {vbhYeuNhat.xong} em làm xong.
              </div>
            )}
          </>
        )}
      </div>

      {/* Bảng chi tiết học sinh với bộ lọc nhanh và tìm kiếm */}
      <TeacherStudentTable rows={withGroup} cutoffs={cutoffs} buoiCoBai={buoiCoBai} />
    </div>
  );
}
