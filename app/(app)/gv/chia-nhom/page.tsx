/**
 * FILE NÀY LÀM GÌ: Trang giao diện dành cho giáo viên trong khu vực đã đăng nhập, tổng hợp số liệu lớp và hỗ trợ điều chỉnh dạy học.
 * AI DÙNG: giáo viên
 * ĐỊA CHỈ TRÊN WEB: /gv/chia-nhom
 * LẤY DỮ LIỆU TỪ: profiles, knowledge_units, students, mastery_states, quiz_attempts, error_dictionary, quiz_answers
 * GỌI TỚI: @/lib/supabase/server, @/lib/dfle/grouping.js, @/components/PrintLink, @/components/UnitOptions, @/components/gv/BoLoc, @/lib/gv/lopCuaToi
 */
import { supabaseServer } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
// @ts-ignore
import { buildGroups, buildTargetedGroups, buildOptimizedGroups, balanceGap } from '@/lib/dfle/grouping.js';
import PrintLink from '@/components/PrintLink';
import UnitOptions from '@/components/UnitOptions';
import { docCookieLop } from '@/components/gv/BoLoc';
import { chonLopTu, laVaiTroGV, lopCuaToi, nhanTruongLop } from '@/lib/gv/lopCuaToi';

export const dynamic = 'force-dynamic';

/**
 * CHIA NHÓM PHÂN HOÁ CHO TIẾT TRÊN LỚP (TÍNH NĂNG 7 & 9)
 *
 * Hỗ trợ 3 chiến lược sư phạm:
 * 1. CHIẾN LƯỢC TỐI ƯU HÓA ĐA MỤC TIÊU (AI-Optimized - Thuật toán 7):
 *    Sử dụng tìm kiếm heuristic đa mục tiêu giải quyết đồng thời: cân bằng năng lực,
 *    phủ nhóm trưởng R06, bù trừ quan niệm sai và đồng đều sĩ số.
 * 2. CHIẾN LƯỢC HỖN HỢP TƯƠNG TRỢ (Jigsaw): Rải serpentine cân bằng trình độ.
 * 3. CHIẾN LƯỢC ĐỒNG CHẤT PHÂN HÓA (Targeted): Gom theo 3 tầng trình độ để giao bài phân tầng.
 */
export default async function ChiaNhom({
  searchParams
}: { searchParams: { lop?: string; ku?: string; co?: string; chienLuoc?: string } }) {
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
    .from('knowledge_units').select('ku_id, ku_name, order_index').order('order_index');
  const kuId = searchParams.ku ?? units?.[0]?.ku_id;
  // Tính toán, làm tròn hoặc giới hạn giá trị theo công thức
  const size = Math.max(2, Math.min(6, Number(searchParams.co) || 4));

  // Mặc định chiến lược tối ưu hóa đa mục tiêu nếu không truyền tham số
  const strategy = searchParams.chienLuoc === 'targeted'
    ? 'targeted'
    : searchParams.chienLuoc === 'jigsaw'
    ? 'jigsaw'
    : 'optimized';

  const kuName = units?.find((u) => u.ku_id === kuId)?.ku_name ?? kuId;

  if (!classId) {
    return (
      <div className="wrap">
        <h1>Chia nhóm</h1>
        <div className="card"><p className="hint">Tài khoản chưa được gán lớp nào.</p></div>
      </div>
    );
  }

  const { data: students } = await supabase
    .from('students').select('student_id, display_name').eq('class_id', classId);
  const ids = (students ?? []).map((s) => s.student_id);
  const none = ids.length === 0;

  const [{ data: mastery }, { data: attempts }, { data: dict }] = await Promise.all([
    supabase.from('mastery_states').select('student_id, mastery_level')
      .eq('ku_id', kuId).in('student_id', none ? ['__none__'] : ids),
    supabase.from('quiz_attempts').select('attempt_id, student_id, score, attempt_no, kind')
      .eq('ku_id', kuId).in('student_id', none ? ['__none__'] : ids),
    supabase.from('error_dictionary').select('error_code, misconception')
  ]);

  const prep = (attempts ?? []).filter((a) => (a.kind ?? 'chuan-bi') === 'chuan-bi');
  const attemptOwner = new Map(prep.map((a) => [a.attempt_id, a.student_id]));
  const { data: answers } = prep.length
    ? await supabase.from('quiz_answers').select('attempt_id, error_code')
        .in('attempt_id', prep.map((a) => a.attempt_id)).not('error_code', 'is', null)
    : { data: [] as any[] };

  const errsOf = new Map<string, string[]>();
  for (const a of answers ?? []) {
    const sid = attemptOwner.get(a.attempt_id);
    if (!sid) continue;
    errsOf.set(sid, [...(errsOf.get(sid) ?? []), a.error_code]);
  }

  const learners = (students ?? []).map((s) => ({
    id: s.student_id,
    name: s.display_name ?? s.student_id,
    mastery: (mastery ?? []).find((m) => m.student_id === s.student_id)?.mastery_level ?? 0,
    quiz: prep.find((a) => a.student_id === s.student_id && a.attempt_no === 1)?.score ?? null,
    errorCodes: errsOf.get(s.student_id) ?? []
  })).map((l) => ({ ...l, quiz: l.quiz === null ? null : Number(l.quiz) }));

  let groups: any[] = [];
  let metrics: any = null;
  let gap: number | null = null;

  if (strategy === 'optimized') {
    const optRes = buildOptimizedGroups(learners, size);
    groups = optRes.groups;
    metrics = optRes.metrics;
    gap = metrics.balanceGap;
  } else if (strategy === 'targeted') {
    groups = buildTargetedGroups(learners, size);
  } else {
    groups = buildGroups(learners, size);
    gap = balanceGap(groups);
  }

  const dictMap = new Map((dict ?? []).map((d) => [d.error_code, d.misconception]));
  const chuaLam = learners.filter((l) => l.quiz === null).length;

  return (
    <div className="wrap">
      <h1 className="no-print">Chia nhóm</h1>
      <p className="sub no-print">
        {strategy === 'optimized'
          ? 'Nhóm cân sức: nhóm nào cũng có bạn giỏi kèm và các bạn mắc lỗi khác nhau để bù cho nhau.'
          : strategy === 'jigsaw'
          ? 'Nhóm trộn trình độ: chia đều khá và yếu, có nhóm trưởng kèm bạn.'
          : 'Nhóm cùng trình độ: gom theo 3 mức để giao phiếu bài tập theo mức.'}
      </p>

      {/* Khối giao diện: Biểu mẫu nhập liệu */}
      <form className="card no-print" style={{ display: 'flex', gap: 14, flexWrap: 'wrap', alignItems: 'end' }}>
        <div style={{ minWidth: 140 }}>
          <label htmlFor="lop">Lớp</label>
          <select id="lop" name="lop" defaultValue={classId}>
            {classes.map((c) => <option key={c.class_id} value={c.class_id}>{nhanTruongLop(c)}</option>)}
          </select>
        </div>
        <div style={{ minWidth: 200, flex: 1 }}>
          <label htmlFor="ku">Mục của tiết học</label>
          <select id="ku" name="ku" defaultValue={kuId}>
            <UnitOptions units={units ?? []} />
          </select>
        </div>
        <div style={{ minWidth: 260 }}>
          <label htmlFor="chienLuoc">Cách chia</label>
          <select id="chienLuoc" name="chienLuoc" defaultValue={strategy}>
            <option value="optimized">Nhóm cân sức (nên dùng)</option>
            <option value="jigsaw">Nhóm trộn trình độ</option>
            <option value="targeted">Nhóm cùng trình độ</option>
          </select>
        </div>
        <div style={{ width: 110 }}>
          <label htmlFor="co">Số em / nhóm</label>
          <input id="co" name="co" type="number" min={2} max={6} defaultValue={size} />
        </div>
        <button className="primary">Áp dụng</button>
      </form>

      {/* Thẻ bảng điều khiển chất lượng chia nhóm */}
      <div className="card no-print">
        {strategy === 'optimized' && metrics ? (
          <div>
            <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', flexWrap: 'wrap', gap: '4px 12px', marginBottom: 12 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ fontSize: 14, fontWeight: 700, color: 'var(--navy-d)' }}>
                  Cách chia này tốt tới đâu
                </span>
              </div>
              <div style={{ fontSize: 20, fontWeight: 800, color: 'var(--ok)' }}>
                {metrics.overallQualityScore}/100 điểm
              </div>
            </div>

            <div className="stat">
              <div>
                <b style={{ color: 'var(--ok)' }}>{metrics.balanceScore}%</b>
                <span>các nhóm cân sức</span>
              </div>
              <div>
                <b style={{ color: metrics.leaderCoverageScore >= 90 ? 'var(--ok)' : 'var(--accent)' }}>
                  {metrics.leaderCoverageScore}%
                </b>
                <span>nhóm có bạn giỏi kèm</span>
              </div>
              <div>
                <b style={{ color: 'var(--navy)' }}>{metrics.complementarityScore}%</b>
                <span>lỗi trong nhóm bù cho nhau</span>
              </div>
              <div>
                <b>{groups.length} nhóm</b>
                <span>Tổng {learners.length} học sinh</span>
              </div>
            </div>
          </div>
        ) : (
          <div className="stat">
            <div><b>{learners.length}</b><span>học sinh</span></div>
            <div><b>{groups.length}</b><span>nhóm</span></div>
            {gap !== null ? (
              <div><b>{gap.toFixed(2)}</b><span>chênh lệch trình độ giữa các nhóm (càng gần 0 càng đều)</span></div>
            ) : (
              <div><b style={{ color: 'var(--navy)' }}>Phân tầng</b><span>theo 3 mức năng lực</span></div>
            )}
            <div><b style={{ color: chuaLam ? 'var(--warn)' : undefined }}>{chuaLam}</b><span>chưa làm bài chuẩn bị</span></div>
          </div>
        )}

        <p style={{ marginTop: 12, display: 'flex', gap: 12, alignItems: 'center' }}>
          <PrintLink />
        </p>
      </div>

      <h2 className="only-print" style={{ marginBottom: 12 }}>
        Danh sách nhóm học tập — {kuName} ({
          strategy === 'optimized' ? 'Nhóm cân sức' :
          strategy === 'jigsaw' ? 'Nhóm trộn trình độ' : 'Nhóm cùng trình độ'
        })
      </h2>

      <div className="group-grid">
        {groups.map((g: any) => (
          <div className="card group-card" key={g.index}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
              <h2 style={{ margin: 0 }}>Nhóm {g.index}</h2>
              {g.tierType ? (
                <span className={`tag ${g.tierType === 'remediation' ? 'warn' : g.tierType === 'enrichment' ? 'ok' : ''}`}>
                  {g.tierType === 'remediation' ? 'Bồi dưỡng' : g.tierType === 'enrichment' ? 'Mở rộng' : 'Luyện tập'}
                </span>
              ) : null}
            </div>

            {g.tierName && (
              <p className="hint" style={{ fontSize: '12.5px', margin: '0 0 10px', color: 'var(--navy-d)', fontWeight: 600 }}>
                {g.tierName} — {g.tierDesc}
              </p>
            )}

            {/* Khối giao diện: Bảng số liệu tổng hợp */}
            <table>
              <tbody>
                {g.members.map((m: any) => (
                  <tr key={m.id}>
                    <td>
                      {m.name}
                      {m.id === g.leaderId && strategy !== 'targeted' && (
                        <span className="tag ok" style={{ marginLeft: 7 }}>nhóm trưởng</span>
                      )}
                    </td>
                    <td className="n">{m.quiz !== null ? Number(m.quiz).toFixed(1) : '—'}</td>
                    <td className="n">{m.mastery}/3</td>
                  </tr>
                ))}
              </tbody>
            </table>

            {g.dominantError ? (
              <div className="rule" style={{ marginTop: 10 }}>
                <div className="lbl">Cả nhóm cùng chữa lỗi ({g.dominantErrorCount} lượt):</div>
                {dictMap.get(g.dominantError) ?? ''}
              </div>
            ) : (
              <p className="hint" style={{ marginTop: 10 }}>
                Nhóm này chưa lộ quan niệm sai nào — giao nhiệm vụ vận dụng hoặc nâng cao.
              </p>
            )}
          </div>
        ))}
      </div>

      {!learners.length && (
        <div className="card"><p className="hint">Lớp chưa có học sinh nào.</p></div>
      )}
    </div>
  );
}
