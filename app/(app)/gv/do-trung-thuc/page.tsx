/**
 * FILE NÀY LÀM GÌ: Trang giao diện dành cho giáo viên trong khu vực đã đăng nhập, tổng hợp số liệu lớp và hỗ trợ điều chỉnh dạy học.
 * AI DÙNG: giáo viên
 * ĐỊA CHỈ TRÊN WEB: /gv/do-trung-thuc
 * LẤY DỮ LIỆU TỪ: profiles, knowledge_units, students, week_plan, lesson_fidelity, quiz_attempts, recommendations, micro_lesson_events
 * GỌI TỚI: @/lib/supabase/server, @/lib/dfle/fidelity.js, @/components/charts/FidelityWeeks, @/components/charts/FidelityComponents, @/components/NhatKyTiet, @/components/PrintLink, @/components/gv/BoLoc, @/lib/gv/lopCuaToi
 */
import { supabaseServer } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
// @ts-ignore — dùng chung công thức với gói dfle-engine
import { tinhDoTrungThuc, gopCacTuan, viecCanLam, NHAN_XEP_LOAI, NGUONG_DAT, TRONG_SO }
  from '@/lib/dfle/fidelity.js';
import FidelityWeeks from '@/components/charts/FidelityWeeks';
import FidelityComponents from '@/components/charts/FidelityComponents';
import NhatKyTiet from '@/components/NhatKyTiet';
import PrintLink from '@/components/PrintLink';
import { docCookieLop } from '@/components/gv/BoLoc';
import { chonLopTu, laVaiTroGV, lopCuaToi, tenHienThiLop } from '@/lib/gv/lopCuaToi';

export const dynamic = 'force-dynamic';

/**
 * ĐỘ TRUNG THỰC TRIỂN KHAI
 *
 * Trang này tồn tại vì một câu trong bản thiết kế nghiên cứu: chỉ đưa vào phân
 * tích chính những lớp đạt từ 80% trở lên. Không có trang này thì câu đó là lời
 * hứa; có trang này thì nó là một con số kiểm chứng được.
 *
 * Nó cũng trả lời trước một câu hỏi phản biện gần như chắc chắn sẽ bị hỏi: nếu
 * lớp thực nghiệm không hơn lớp đối chứng, làm sao biết là mô hình không hiệu
 * quả chứ không phải mô hình chưa từng được triển khai đúng?
 */

export default async function DoTrungThuc({
  searchParams
}: { searchParams: { lop?: string } }) {
  const supabase = supabaseServer();
  // Kiểm tra xác thực tài khoản, vai trò giáo viên hoặc điều kiện đồng ý
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/dang-nhap');

  const { data: profile } = await supabase
    .from('profiles').select('role').eq('id', user.id).maybeSingle();
  // Kiểm tra xác thực tài khoản, vai trò giáo viên hoặc điều kiện đồng ý
  if (!laVaiTroGV(profile?.role)) redirect('/');

  const classes = await lopCuaToi(supabase);
  const chon = chonLopTu(classes, searchParams.lop, docCookieLop(), false);
  const classId = chon.lop?.class_id;

  const { data: units } = await supabase
    .from('knowledge_units').select('ku_id, ku_name, order_index').order('order_index');

  if (!classId) {
    return (
      <div className="wrap">
        <h1>Độ trung thực triển khai</h1>
        <div className="card"><p className="hint">Tài khoản này chưa được gán lớp nào.</p></div>
      </div>
    );
  }

  const arm = classes?.find((c) => c.class_id === classId)?.arm;

  // ------------------------------------------------------------- lấy dữ liệu
  const { data: students } = await supabase
    .from('students').select('student_id, consent_status').eq('class_id', classId);
  // chỉ tính trên các em đã đồng thuận — đúng với tập sẽ đưa vào phân tích
  const hs = (students ?? []).filter((s) => s.consent_status === 'dong-y');
  const sids = hs.map((s) => s.student_id);
  const siSo = hs.length;

  const [{ data: plans }, { data: logs }] = await Promise.all([
    supabase.from('week_plan').select('tuan, so_tiet_ke_hoach, created_at')
      .eq('class_id', classId).order('tuan'),
    supabase.from('lesson_fidelity').select('*').eq('class_id', classId).order('ngay_day')
  ]);

  const [{ data: attempts }, { data: recs }, mleRes] = await Promise.all([
    supabase.from('quiz_attempts')
      .select('student_id, ku_id, kind, submitted_at')
      .in('student_id', sids.length ? sids : ['__none__']),
    supabase.from('recommendations')
      .select('student_id, ku_id, accepted, created_at')
      .in('student_id', sids.length ? sids : ['__none__']),
    // Nhật ký mở/hoàn thành vi bài học. Bảng này chỉ có sau khi chạy
    // 08-vi-bai-hoc.sql; chưa chạy thì truy vấn lỗi và ta để undefined để
    // thành phần "mức đáp ứng" biết là CHƯA ĐO chứ không phải bằng 0.
    supabase.from('micro_lesson_events')
      .select('student_id, ku_id, kind')
      .in('student_id', sids.length ? sids : ['__none__'])
  ]);

  const coNhatKyViBaiHoc = !mleRes.error;
  const mle = mleRes.data ?? [];

  const chuanBi = (attempts ?? []).filter((a) => (a.kind ?? 'chuan-bi') === 'chuan-bi');

  // ------------------------------------------------- gom số liệu theo từng tuần
  const tuanCoDuLieu = new Set<number>([
    ...(plans ?? []).map((p) => p.tuan),
    ...(logs ?? []).map((l: any) => l.tuan)
  ]);
  const danhSachTuan = [...tuanCoDuLieu].sort((a, b) => a - b);

  // mỗi bài học thuộc về tuần đầu tiên nó được dạy — dùng để quy các gợi ý về tuần
  const tuanCuaKu = new Map<string, number>();
  for (const l of (logs ?? []) as any[]) {
    const cu = tuanCuaKu.get(l.ku_id);
    if (cu === undefined || l.tuan < cu) tuanCuaKu.set(l.ku_id, l.tuan);
  }

  const dauVaoTuan = danhSachTuan.map((tuan) => {
    const keHoach = (plans ?? []).find((p) => p.tuan === tuan);
    const tietTuan = ((logs ?? []) as any[]).filter((l) => l.tuan === tuan);

    // LIỀU LƯỢNG: với mỗi tiết đã dạy, đếm số em nộp bài chuẩn bị TRƯỚC giờ vào lớp
    let luot = 0;
    for (const t of tietTuan) {
      const han = new Date(`${t.ngay_day}T${t.gio_bat_dau ?? '23:59'}:00`);
      const xong = new Set(
        chuanBi
          .filter((a) => a.ku_id === t.ku_id && a.submitted_at && new Date(a.submitted_at) < han)
          .map((a) => a.student_id)
      );
      luot += xong.size;
    }

    const recTuan = (recs ?? []).filter((r) => tuanCuaKu.get(r.ku_id) === tuan);

    // MỞ và HOÀN THÀNH vi bài học, đếm theo LƯỢT HỌC SINH chứ không theo số bản
    // ghi: một em mở đi mở lại cùng một vi bài học vẫn chỉ là một lượt. Đếm bản
    // ghi thì em nào mở nhiều lần sẽ kéo tỉ lệ mở vượt cả 100%.
    const mleTuan = mle.filter((e: any) => tuanCuaKu.get(e.ku_id) === tuan);
    const daMo = new Set(
      mleTuan.filter((e: any) => e.kind === 'mo').map((e: any) => `${e.student_id}|${e.ku_id}`)
    ).size;
    const daLamXong = new Set(
      mleTuan.filter((e: any) => e.kind === 'hoan-thanh').map((e: any) => `${e.student_id}|${e.ku_id}`)
    ).size;

    return {
      tuan,
      soTietTheoKeHoach: keHoach?.so_tiet_ke_hoach ?? 0,
      soTietDayDuBaPha: tietTuan.filter((t) => t.du_ba_pha).length,
      soTietMoDashboardTruocGio: tietTuan.filter((t) => t.da_mo_bao_cao_truoc_gio).length,
      soTietChiaNhomTheoDuLieu: tietTuan.filter((t) => t.da_chia_nhom_theo_du_lieu).length,
      soHocSinh: siSo,
      luotHoanThanhTruocGio: luot,
      soGoiYDaGiao: recTuan.length,
      // Chưa chạy 08-vi-bai-hoc.sql thì để undefined — bộ máy sẽ trả tiLeMo = null
      // (CHƯA ĐO) thay vì 0% (báo động giả).
      soGoiYDaMo: coNhatKyViBaiHoc ? daMo : undefined,
      // Nguồn chuẩn cho "đã làm" là nhật ký vi bài học. Cột recommendations.accepted
      // chỉ dùng khi chưa có bảng nhật ký, vì nó không phân biệt được "mở ra rồi
      // bỏ dở" với "làm xong".
      soGoiYDaLam: coNhatKyViBaiHoc ? daLamXong : recTuan.filter((r) => r.accepted === true).length,
      soGoiYDaMoHienThi: coNhatKyViBaiHoc ? daMo : null,
      soTietDaGhi: tietTuan.length,
      khaiKeHoach: !!keHoach
    };
  });

  const theoTuan = dauVaoTuan.map((d) => ({ tuan: d.tuan, kq: tinhDoTrungThuc(d), d }));
  const gop: any = gopCacTuan(dauVaoTuan);
  const viec = viecCanLam(gop);

  const thieuKeHoach = dauVaoTuan.filter((d) => d.soTietDaGhi > 0 && !d.khaiKeHoach);

  return (
    <div className="wrap">
      <h1>Độ trung thực triển khai</h1>
      <p className="sub">
        Lớp {tenHienThiLop(classes.find((c) => c.class_id === classId) ?? { class_id: classId })}{arm ? ` · ${arm === 'TN' ? 'thực nghiệm' : 'đối chứng'}` : ''} ·
        {' '}{siSo} học sinh đã đồng thuận · {danhSachTuan.length} tuần có dữ liệu
      </p>

      {classes.length > 1 && (
        <div className="card no-print" style={{ padding: '10px 14px' }}>
          {classes.map((c) => (
            <a className="action-link" key={c.class_id} href={`/gv/do-trung-thuc?lop=${c.class_id}`}
               style={{ marginRight: 14, fontWeight: c.class_id === classId ? 700 : 400 }}>
              {tenHienThiLop(c)}
            </a>
          ))}
        </div>
      )}

      <div className="banner">
        Nếu lớp thực nghiệm không hơn lớp đối chứng, có hai cách giải thích hoàn toàn khác nhau:
        mô hình không hiệu quả, hoặc mô hình <strong>chưa từng được triển khai đúng</strong>.
        Trang này là thứ duy nhất phân biệt được hai khả năng đó. Bản thiết kế nghiên cứu chỉ đưa
        vào phân tích chính những lớp đạt từ <strong>{NGUONG_DAT}%</strong> trở lên; lớp dưới ngưỡng
        vẫn được báo cáo nhưng tách ra phân tích riêng và ghi rõ lý do.
      </div>

      {/* ------------------------------------------------------------- tổng quan */}
      <div className="card">
        <h2>Cả đợt thực nghiệm</h2>
        <div className="stat" style={{ marginBottom: 16 }}>
          <div><b>{gop.tong === null ? '—' : `${gop.tong}%`}</b><span>độ trung thực</span></div>
          <div><b>{gop.soTietTheoKeHoach}</b><span>tiết theo kế hoạch</span></div>
          <div><b>{dauVaoTuan.reduce((n, d) => n + d.soTietDaGhi, 0)}</b><span>tiết đã ghi nhật ký</span></div>
          <div><b>{gop.soTuan}</b><span>tuần</span></div>
        </div>

        <div className="rule" style={{ borderLeftColor: gop.dat ? 'var(--ok)' : 'var(--accent)' }}>
          <strong>{NHAN_XEP_LOAI[gop.xepLoai as keyof typeof NHAN_XEP_LOAI]}</strong>
          {gop.tong !== null && (
            <>
              <div className="lbl">Cách tính</div>
              Trung bình có trọng số của {gop.soThanhPhanDoDuoc} thành phần đo được
              (tuân thủ {TRONG_SO.tuanThu} · liều lượng {TRONG_SO.lieuLuong} ·
              chất lượng {TRONG_SO.chatLuong} · đáp ứng {TRONG_SO.dapUng}). Các tuần được cộng dồn
              tử số và mẫu số rồi mới chia, không lấy trung bình của các tỉ lệ tuần.
            </>
          )}
          {viec.length > 0 && (
            <>
              <div className="lbl">Việc cần làm trước</div>
              {viec.map((v: any) => <div key={v.thanhPhan}>{v.viec}</div>)}
            </>
          )}
        </div>
      </div>

      {/* ---------------------------------------------------------- bốn thành phần */}
      <div className="card">
        <h2>Bốn thành phần</h2>
        <FidelityComponents thanhPhan={gop.thanhPhan} />
        <p className="hint" style={{ marginTop: 12 }}>
          Thành phần nào chưa có mẫu số thì để trống chứ không tính là 0 — tuần chưa giao gợi ý nào
          không phải là tuần học sinh từ chối làm gợi ý.
        </p>

        {/* Tỉ lệ mở KHÔNG tính vào điểm. Nó tách "được giao mà không mở" khỏi
            "mở rồi bỏ dở" — hai tình trạng cần hai can thiệp khác hẳn nhau,
            đúng phân biệt mà cả dự án được xây quanh nó. */}
        {gop.tiLeMo !== null && gop.thanhPhan.dapUng !== null && (
          <div className="rule" style={{ marginTop: 14 }}>
            <strong>Chẩn đoán mức đáp ứng — không tính vào điểm</strong>
            <div className="lbl">Đường đi của một nội dung bổ trợ</div>
            Giao <b>100%</b> → có em mở <b>{gop.tiLeMo}%</b> → làm xong <b>{gop.thanhPhan.dapUng}%</b>
            <div className="lbl">Chỗ hụt lớn nhất</div>
            {gop.tiLeMo < 60
              ? 'Nằm ở khâu tiếp cận: phần lớn nội dung giao ra không có em nào mở. Kiểm tra các em có biết mình được giao bài không, và có vào được hệ thống ở nhà không — trước khi kết luận là các em lười.'
              : gop.tiLeMo - gop.thanhPhan.dapUng >= 25
                ? 'Nằm ở chính nội dung bổ trợ: các em có mở nhưng bỏ dở giữa chừng. Xem lại độ dài — vi bài học quá 12 phút thì tỉ lệ bỏ dở tăng rõ.'
                : 'Hai bước khá đều nhau, không có nút thắt riêng ở khâu nào.'}
          </div>
        )}
      </div>

      {/* ------------------------------------------------------------ theo tuần */}
      <div className="card">
        <h2>Từng tuần</h2>
        <FidelityWeeks rows={theoTuan.map((t) => ({ tuan: t.tuan, tong: t.kq.tong }))} />

        <div className="scroll" style={{ marginTop: 16 }}>
          {/* Khối giao diện: Bảng số liệu tổng hợp */}
          <table>
            <thead>
              <tr>
                <th>Tuần</th>
                <th className="n">Kế hoạch</th>
                <th className="n">Đủ 3 pha</th>
                <th className="n">Mở báo cáo trước giờ</th>
                <th className="n">Chia nhóm theo dữ liệu</th>
                <th className="n">HS nộp quiz trước giờ</th>
                <th className="n">Vi bài học: mở → làm xong</th>
                <th className="n">Tổng</th>
              </tr>
            </thead>
            <tbody>
              {theoTuan.map(({ tuan, kq, d }) => (
                <tr key={tuan}>
                  <td>Tuần {tuan}</td>
                  <td className="n">
                    {d.khaiKeHoach ? `${d.soTietTheoKeHoach} tiết`
                                   : <span className="tag warn">chưa khai</span>}
                  </td>
                  <td className="n">{d.soTietDayDuBaPha}/{d.soTietTheoKeHoach}</td>
                  <td className="n">{d.soTietMoDashboardTruocGio}/{d.soTietTheoKeHoach}</td>
                  <td className="n">{d.soTietChiaNhomTheoDuLieu}/{d.soTietTheoKeHoach}</td>
                  <td className="n">
                    {d.luotHoanThanhTruocGio}/{d.soTietTheoKeHoach * d.soHocSinh}
                    {kq.thanhPhan.lieuLuong !== null && <> · {kq.thanhPhan.lieuLuong}%</>}
                  </td>
                  {/* Hiện cả hai bước — giao → mở → làm xong — vì khoảng hụt nằm ở
                      bước nào quyết định giáo viên phải sửa cái gì. Gộp thành một
                      con số thì mất đúng thông tin đó. */}
                  <td className="n">
                    {!d.soGoiYDaGiao ? '—'
                      : d.soGoiYDaMoHienThi === null
                        ? `${d.soGoiYDaLam}/${d.soGoiYDaGiao}`
                        : `${d.soGoiYDaGiao} → ${d.soGoiYDaMoHienThi} → ${d.soGoiYDaLam}`}
                  </td>
                  <td className="n">
                    <span className={'tag ' + (kq.tong === null ? '' : kq.dat ? 'ok' : 'warn')}>
                      {kq.tong === null ? 'chưa đủ' : `${kq.tong}%`}
                    </span>
                  </td>
                </tr>
              ))}
              {!theoTuan.length && (
                <tr><td colSpan={8} className="hint">
                  Chưa có tuần nào. Khai kế hoạch tuần ở phần dưới trước khi bắt đầu dạy.
                </td></tr>
              )}
            </tbody>
          </table>
        </div>

        {thieuKeHoach.length > 0 && (
          <p className="err" style={{ marginTop: 10, fontSize: 13 }}>
            {thieuKeHoach.length} tuần đã có tiết dạy nhưng chưa khai kế hoạch
            (tuần {thieuKeHoach.map((d) => d.tuan).join(', ')}). Mẫu số bằng 0 nên các tuần này
            không tính được và bị loại khỏi con số chung — khai bổ sung ngay, và ghi rõ trong nhật
            ký nghiên cứu là khai muộn.
          </p>
        )}
      </div>

      {/* ---------------------------------------------------------- nhật ký tiết */}
      <div className="card">
        <h2>Nhật ký từng tiết</h2>
        <div className="scroll">
          {/* Khối giao diện: Bảng số liệu tổng hợp */}
          <table>
            <thead>
              <tr>
                <th>Ngày</th><th>Bài học</th><th className="n">Tuần</th>
                <th className="n">Trước giờ</th><th className="n">Trên lớp</th><th className="n">Sau giờ</th>
                <th className="n">Mở báo cáo</th><th className="n">Chia nhóm</th><th>Ghi chú</th>
              </tr>
            </thead>
            <tbody>
              {((logs ?? []) as any[]).map((l) => {
                const o = (v: boolean) => <span className={'tag ' + (v ? 'ok' : 'warn')}>{v ? 'có' : 'không'}</span>;
                return (
                  <tr key={l.log_id}>
                    <td>{l.ngay_day}{l.gio_bat_dau ? ` · ${String(l.gio_bat_dau).slice(0, 5)}` : ''}</td>
                    <td>{units?.find((u) => u.ku_id === l.ku_id)?.ku_name ?? l.ku_id}</td>
                    <td className="n">{l.tuan}</td>
                    <td className="n">{o(l.pha_truoc_gio)}</td>
                    <td className="n">{o(l.pha_tren_lop)}</td>
                    <td className="n">{o(l.pha_sau_gio)}</td>
                    <td className="n">{o(l.da_mo_bao_cao_truoc_gio)}</td>
                    <td className="n">{o(l.da_chia_nhom_theo_du_lieu)}</td>
                    <td>{l.ghi_chu ?? ''}</td>
                  </tr>
                );
              })}
              {!(logs ?? []).length && (
                <tr><td colSpan={9} className="hint">Chưa ghi tiết nào.</td></tr>
              )}
            </tbody>
          </table>
        </div>
        <p className="hint" style={{ marginTop: 10 }}>
          Cột <strong>Mở báo cáo</strong> do hệ thống tự ghi mỗi lần bảng điều khiển lớp được mở,
          rồi đối chiếu với giờ bắt đầu tiết — không phải ô giáo viên tự tích. Tiết chưa điền giờ
          bắt đầu thì lấy mốc cuối ngày, nên dễ dãi hơn thực tế: nên điền giờ.
        </p>
      </div>

      <NhatKyTiet classId={classId} units={units ?? []}
                  tuanGoiY={danhSachTuan.length ? Math.max(...danhSachTuan) : 1} />

      <div className="card no-print">
        <h2>Đưa vào báo cáo</h2>
        <p className="hint" style={{ marginBottom: 10 }}>
          Một câu mẫu cho phần Phương pháp — sửa lại theo số liệu thật của lớp mình, đừng chép
          nguyên khi con số chưa đủ tuần.
        </p>
        <p style={{ fontSize: 14, lineHeight: 1.65 }}>
          {gop.tong === null
            ? 'Chưa đủ dữ liệu để viết câu này. Cần ít nhất một tuần có khai kế hoạch và có nhật ký tiết dạy.'
            : `Độ trung thực triển khai của lớp ${classId} trong ${gop.soTuan} tuần thực nghiệm đạt
               ${gop.tong}% (tuân thủ quy trình ba pha ${gop.thanhPhan.tuanThu ?? '—'}%,
               liều lượng ${gop.thanhPhan.lieuLuong ?? '—'}%,
               chất lượng thực hiện ${gop.thanhPhan.chatLuong ?? '—'}%,
               mức đáp ứng của học sinh ${gop.thanhPhan.dapUng ?? '—'}%),
               ${gop.dat ? `đạt ngưỡng ${NGUONG_DAT}% nên được đưa vào phân tích chính.`
                         : `chưa đạt ngưỡng ${NGUONG_DAT}% nên được tách ra phân tích riêng và ghi rõ lý do.`}`}
        </p>
        <PrintLink nhan="In trang này cho hồ sơ nghiên cứu" />
      </div>
    </div>
  );
}

