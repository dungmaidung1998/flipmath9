/**
 * FILE NÀY LÀM GÌ: Trang giao diện dành cho giáo viên trong khu vực đã đăng nhập, tổng hợp số liệu lớp và hỗ trợ điều chỉnh dạy học.
 * AI DÙNG: giáo viên
 * ĐỊA CHỈ TRÊN WEB: /gv/phan-tich
 * LẤY DỮ LIỆU TỪ: profiles
 * GỌI TỚI: @/lib/supabase/server, @/lib/phanTichTinh, @/components/charts/ItemCharacteristicCurve, @/components/gv/BoLoc, @/lib/gv/lopCuaToi
 */
import { supabaseServer } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { tinhPhanTich } from '@/lib/phanTichTinh';
import ItemCharacteristicCurve from '@/components/charts/ItemCharacteristicCurve';
import { docCookieLop } from '@/components/gv/BoLoc';
import { laVaiTroGV } from '@/lib/gv/lopCuaToi';

export const dynamic = 'force-dynamic';

/**
 * PHÂN TÍCH THUẬT TOÁN — BKT so với mastery v2, mô hình Rasch IRT, và phân tích câu hỏi.
 */

const THE = [
  { id: 'bkt', ten: 'BKT và mastery v2' },
  { id: 'cau-hoi', ten: 'Câu hỏi (CTT)' },
  { id: 'rasch', ten: '⚡ Mô hình Rasch (IRT)' },
  { id: 'nhieu', ten: 'Phương án nhiễu và quan niệm sai' }
] as const;

const so = (x: number | null | undefined, k = 3) => (x === null || x === undefined ? '—' : x.toFixed(k));
// Tính toán, làm tròn hoặc giới hạn giá trị theo công thức
const pt = (x: number | null | undefined) => (x === null || x === undefined ? '—' : `${Math.round(x * 100)}%`);

/**
 * Component React `PhanTich`: nhận props (thuộc tính truyền vào từ component cha) và dựng giao diện tương ứng.
 */
export default async function PhanTich({ searchParams }: { searchParams: { the?: string; lop?: string } }) {
  const supabase = supabaseServer();
  // Kiểm tra xác thực tài khoản, vai trò giáo viên hoặc điều kiện đồng ý
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/dang-nhap');
  // Truy vấn Supabase: đọc dữ liệu từ bảng profiles
  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).maybeSingle();
  // Kiểm tra xác thực tài khoản, vai trò giáo viên hoặc điều kiện đồng ý
  if (!laVaiTroGV(profile?.role)) redirect('/bai-hoc');

  const the = THE.some((t) => t.id === searchParams.the) ? searchParams.the! : 'bkt';
  const chonLop = searchParams.lop ?? docCookieLop() ?? 'tat-ca';

  let r: Awaited<ReturnType<typeof tinhPhanTich>>;
  try {
    r = await tinhPhanTich(supabase, chonLop);
  } catch (e: any) {
    return (
      <div className="wrap">
        <h1>Phân tích thuật toán</h1>
        <div className="card"><p className="err">Không đọc được dữ liệu: {e?.message ?? 'lỗi không rõ'}</p></div>
      </div>
    );
  }

  const lopQ = chonLop && chonLop !== 'tat-ca' ? `&lop=${encodeURIComponent(chonLop)}` : '';

  return (
    <div className="wrap">
      <h1>Phân tích thuật toán</h1>
      <p className="sub">
        {r.lop.length
          ? <>Lớp thực nghiệm: {r.lop.map((l) => l.class_code).join(', ')} · {r.soHocSinh} học sinh đã đồng thuận · {r.soTraLoi.toLocaleString('vi-VN')} câu trả lời</>
          : 'Tài khoản này chưa được gán lớp thực nghiệm nào.'}
      </p>

      <div className="banner">
        Trang này chỉ tính và hiển thị, không thay đổi gì trong hệ thống. Câu hỏi bị cảnh báo:
        <strong> ghi lại, chưa sửa</strong> đến khi kết thúc đợt thực nghiệm.
      </div>

      <nav className="action-row" style={{ margin: '0 0 18px' }} aria-label="Chọn nội dung phân tích">
        {THE.map((t) => (
          <a key={t.id} className="action-link" href={`?the=${t.id}${lopQ}`}
             aria-current={t.id === the ? 'page' : undefined}
             style={t.id === the ? { background: 'var(--navy)', color: '#fff' } : undefined}>
            {t.ten}
          </a>
        ))}
      </nav>

      {!r.coDuLieu ? (
        <div className="card">
          <p className="hint">Chưa có câu trả lời nào của học sinh lớp thực nghiệm để phân tích.</p>
        </div>
      ) : the === 'bkt' ? <TheBkt r={r} lopQ={lopQ} /> : the === 'cau-hoi' ? <TheCauHoi r={r} lopQ={lopQ} /> : the === 'rasch' ? <TheRasch r={r} /> : <TheNhieu r={r} lopQ={lopQ} />}
    </div>
  );
}

type R = Awaited<ReturnType<typeof tinhPhanTich>>;

// ======================================================================= BKT

function TheBkt({ r, lopQ }: { r: R; lopQ: string }) {
  const s = r.soSanh!, m = r.soSanhMacDinh!;
  const cot = ['chua-du', '0', '1', '2', '3'];
  const tenCot: Record<string, string> = { 'chua-du': 'chưa đủ', 0: 'mức 0', 1: 'mức 1', 2: 'mức 2', 3: 'mức 3' };
  return (
    <>
      <div className="card">
        <h2>Độ chính xác khi dự đoán câu tiếp theo</h2>
        <p className="hint" style={{ marginBottom: 12 }}>
          Trước mỗi câu trả lời, mỗi phương án đoán em sẽ đúng hay sai. Tham số học trên một nửa số học
          sinh, đo trên nửa còn lại, rồi đổi vai. {s.soDuDoan.toLocaleString('vi-VN')} dự đoán trên {s.soHocSinh} học sinh.
        </p>
        <div className="scroll">
          {/* Khối giao diện: Bảng số liệu tổng hợp */}
          <table>
            <thead><tr><th>Phương án</th><th className="n">AUC (cao hơn tốt hơn)</th><th className="n">Log-loss (thấp hơn tốt hơn)</th></tr></thead>
            <tbody>
              <tr><td>BKT, tham số ước lượng từ dữ liệu</td><td className="n">{so(s.bkt.auc)}</td><td className="n">{so(s.bkt.logLoss)}</td></tr>
              <tr><td>BKT, tham số mặc định</td><td className="n">{so(m.bkt.auc)}</td><td className="n">{so(m.bkt.logLoss)}</td></tr>
              <tr><td><strong>Mastery v2</strong> (đang chạy chính thức)</td><td className="n">{so(s.masteryV2.auc)}</td><td className="n">{so(s.masteryV2.logLoss)}</td></tr>
            </tbody>
          </table>
        </div>
        <p className="hint" style={{ marginTop: 10 }}>
          AUC 0,5 là đoán mò, 1 là hoàn hảo. Chênh lệch dưới 0,02 thì chưa đủ để nói phương án nào tốt hơn.
        </p>
      </div>

      <div className="card">
        <h2>Tham số BKT</h2>
        <p className="hint" style={{ marginBottom: 12 }}>
          {r.thamSoLaUocLuong ? 'Ước lượng trên toàn bộ dữ liệu bằng cách thử lưới giá trị.' : 'Đang dùng giá trị mặc định.'}
          {' '}Ngưỡng "đã nắm": P ≥ {r.nguongDaNam}.
        </p>
        <div className="scroll">
          {/* Khối giao diện: Bảng số liệu tổng hợp */}
          <table>
            <thead><tr><th>Tham số</th><th>Ý nghĩa</th><th className="n">Giá trị</th></tr></thead>
            <tbody>
              <tr><td>L0</td><td>đã biết trước khi làm câu đầu</td><td className="n">{r.thamSo.L0}</td></tr>
              <tr><td>T</td><td>học được sau mỗi câu</td><td className="n">{r.thamSo.T}</td></tr>
              <tr><td>G</td><td>đoán trúng dù chưa biết</td><td className="n">{r.thamSo.G}</td></tr>
              <tr><td>S</td><td>biết mà vẫn làm sai</td><td className="n">{r.thamSo.S}</td></tr>
            </tbody>
          </table>
        </div>
        {(r.thamSo.G >= 0.3 || r.thamSo.S >= 0.3) && (
          <p className="err">
            G hoặc S chạm trần 0,3 — mô hình khớp dữ liệu kém. Chưa nên kết luận từ BKT với bộ tham số này.
          </p>
        )}
      </div>

      <div className="card">
        <h2>Hai phương án có kết luận giống nhau không</h2>
        <p className="hint" style={{ marginBottom: 12 }}>
          Trạng thái cuối của từng cặp (học sinh, đơn vị kiến thức).
        </p>
        <div className="scroll">
          {/* Khối giao diện: Bảng số liệu tổng hợp */}
          <table>
            <thead><tr><th></th>{cot.map((c) => <th key={c} className="n">v2 {tenCot[c]}</th>)}</tr></thead>
            <tbody>
              {Object.entries(s.bangCheo).map(([hang, o]: [string, any]) => (
                <tr key={hang}><td>{hang}</td>{cot.map((c) => <td key={c} className="n">{o[c] ?? 0}</td>)}</tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="card">
        <h2>Theo đơn vị kiến thức</h2>
        <div className="scroll">
          {/* Khối giao diện: Bảng số liệu tổng hợp */}
          <table>
            <thead><tr><th>Đơn vị</th><th className="n">Số em</th><th className="n">BKT đã nắm</th>
              <th className="n">v2 chưa đủ</th><th className="n">v2 mức 0</th><th className="n">mức 1</th><th className="n">mức 2</th><th className="n">mức 3</th></tr></thead>
            <tbody>
              {r.theoDonVi.map((u) => (
                <tr key={u.kuId}>
                  <td>{u.ten}</td><td className="n">{u.soCap}</td><td className="n">{u.bktDaNam}</td>
                  <td className="n">{u.v2.chuaDu}</td><td className="n">{u.v2.m0}</td><td className="n">{u.v2.m1}</td>
                  <td className="n">{u.v2.m2}</td><td className="n">{u.v2.m3}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="hint" style={{ marginTop: 10 }}>
          Mastery v2 không thể đạt mức 3 với ngân hàng câu hỏi hiện tại (mỗi đơn vị có tối đa 1 câu mức 4). BKT không bị giới hạn này.
        </p>
        <p className="action-row" style={{ marginTop: 12 }}>
          <a className="action-link" href={`/api/phan-tich-du-lieu?kind=bkt${lopQ}`}>Tải CSV trạng thái từng em</a>
          <a className="action-link" href={`/api/phan-tich-du-lieu?kind=so-sanh${lopQ}`}>Tải CSV so sánh</a>
        </p>
      </div>
    </>
  );
}

// ================================================================= CÂU HỎI

function TheCauHoi({ r, lopQ }: { r: R; lopQ: string }) {
  const t = r.cauHoi.tongQuan;
  const coCanhBao = r.cauHoi.cauHoi.filter((c: any) => c.canhBao.length);
  return (
    <>
      <div className="card">
        <h2>Tổng quan ngân hàng câu hỏi</h2>
        <p>
          {t.soCau} câu · {t.soCauDuDuLieu} câu đủ ít nhất 20 lượt trả lời để tính chỉ số ·{' '}
          <strong>{t.soCauCoCanhBao} câu có cảnh báo</strong>
        </p>
        <p className="hint">
          Chỉ tính lần trả lời đầu tiên của mỗi em ở mỗi câu. Độ phân biệt: tương quan giữa đúng/sai ở câu này
          và tỉ lệ đúng các câu còn lại của chính em đó — dương là tốt, âm là câu hỏng.
        </p>
      </div>

      {coCanhBao.length > 0 && (
        <div className="card">
          <h2>Câu cần xem lại sau đợt thực nghiệm</h2>
          <div className="scroll">
            {/* Khối giao diện: Bảng số liệu tổng hợp */}
            <table>
              <thead><tr><th>Câu</th><th className="n">Mức</th><th className="n">Lượt</th><th className="n">Độ khó</th><th className="n">Độ phân biệt</th><th>Cảnh báo</th></tr></thead>
              <tbody>
                {coCanhBao.map((c: any) => (
                  <tr key={c.questionId}>
                    <td>{c.questionId}</td><td className="n">{c.level}</td><td className="n">{c.soLuot}</td>
                    <td className="n">{so(c.doKho, 2)}</td><td className="n">{so(c.doPhanBiet, 2)}</td>
                    <td>{c.canhBao.join(' · ')}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <div className="card">
        <h2>Tất cả câu hỏi</h2>
        <div className="scroll">
          {/* Khối giao diện: Bảng số liệu tổng hợp */}
          <table>
            <thead><tr><th>Câu</th><th>Đơn vị</th><th className="n">Mức</th><th className="n">Lượt</th><th className="n">Độ khó</th><th className="n">Độ phân biệt</th></tr></thead>
            <tbody>
              {r.cauHoi.cauHoi.map((c: any) => (
                <tr key={c.questionId}>
                  <td>{c.questionId}</td><td>{r.tenDonVi.get(c.kuId) ?? c.kuId}</td><td className="n">{c.level}</td>
                  <td className="n">{c.soLuot}</td>
                  <td className="n">{c.duDuLieu ? so(c.doKho, 2) : <span className="hint">chưa đủ</span>}</td>
                  <td className="n">{c.duDuLieu ? so(c.doPhanBiet, 2) : <span className="hint">chưa đủ</span>}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="action-row" style={{ marginTop: 12 }}>
          <a className="action-link" href={`/api/phan-tich-du-lieu?kind=cau-hoi${lopQ}`}>Tải CSV câu hỏi</a>
        </p>
      </div>
    </>
  );
}

// ======================================================== PHƯƠNG ÁN NHIỄU

function TheNhieu({ r, lopQ }: { r: R; lopQ: string }) {
  const qns = r.cauHoi.quanNiemSai;
  const nhieuYeu = r.cauHoi.cauHoi.flatMap((c: any) =>
    c.duDuLieu ? c.phuongAn.filter((p: any) => !p.laDapAn && p.tiLe < 0.05).map((p: any) => ({ ...p, questionId: c.questionId })) : []);
  return (
    <>
      <div className="card">
        <h2>Quan niệm sai có thật sự xuất hiện không</h2>
        <p className="hint" style={{ marginBottom: 12 }}>
          {qns.length} mã trong từ điển lỗi, gắn vào các phương án nhiễu. "Lặp lại" = em mắc cùng một mã
          từ 2 lần trở lên — dấu hiệu quan niệm sai thật chứ không phải sơ suất.
        </p>
        <div className="scroll">
          {/* Khối giao diện: Bảng số liệu tổng hợp */}
          <table>
            <thead><tr><th>Mã</th><th className="n">Số phương án gắn</th><th className="n">Lượt chọn</th><th className="n">Số em mắc</th><th className="n">Số em lặp lại</th></tr></thead>
            <tbody>
              {qns.map((q: any) => (
                <tr key={q.maLoi}>
                  <td>{q.maLoi}</td><td className="n">{q.soPhuongAnGan}</td><td className="n">{q.soLanChon}</td>
                  <td className="n">{q.soHocSinhMac === 0 ? <span className="tag warn">chưa ai</span> : q.soHocSinhMac}</td>
                  <td className="n">{q.soHocSinhLapLai}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="action-row" style={{ marginTop: 12 }}>
          <a className="action-link" href={`/api/phan-tich-du-lieu?kind=quan-niem-sai${lopQ}`}>Tải CSV quan niệm sai</a>
          <a className="action-link" href={`/api/phan-tich-du-lieu?kind=phuong-an${lopQ}`}>Tải CSV từng phương án</a>
        </p>
      </div>

      <div className="card">
        <h2>Phương án nhiễu gần như không ai chọn</h2>
        <p className="hint" style={{ marginBottom: 12 }}>Dưới 5% số em chọn, trên các câu đủ dữ liệu.</p>
        {nhieuYeu.length ? (
          <div className="scroll">
            {/* Khối giao diện: Bảng số liệu tổng hợp */}
            <table>
              <thead><tr><th>Câu</th><th>Phương án</th><th>Mã lỗi gắn</th><th className="n">Tỉ lệ chọn</th></tr></thead>
              <tbody>
                {nhieuYeu.map((p: any) => (
                  <tr key={p.questionId + p.phuongAn}>
                    <td>{p.questionId}</td><td>{p.phuongAn}</td><td>{p.maLoi ?? '—'}</td><td className="n">{pt(p.tiLe)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : <p className="hint">Không có — hoặc chưa đủ dữ liệu.</p>}
      </div>
    </>
  );
}

// ========================================================= MÔ HÌNH RASCH (IRT)

function TheRasch({ r }: { r: R }) {
  const rasch = (r as any).rasch;
  if (!rasch || !rasch.items || !rasch.items.size) {
    return (
      <div className="card">
        <h2>Mô hình Rasch (Item Response Theory - 1PL)</h2>
        <p className="hint">Chưa đủ dữ liệu phản hồi để ước lượng mô hình Rasch.</p>
      </div>
    );
  }

  const itemsList = [...rasch.items.entries()].map(([id, it]: [string, any]) => ({
    id,
    b: it.b,
    label: it.difficultyLabel,
    pValue: it.pValue,
    total: it.totalResponses
  })).sort((a, b) => a.b - b.b);

  const studentsList = [...rasch.students.entries()].map(([id, st]: [string, any]) => ({
    id,
    theta: st.theta,
    score: st.score,
    se: st.se,
    rawCount: st.rawCount,
    correctCount: st.correctCount
  })).sort((a, b) => b.theta - a.theta);

  const avgSE = studentsList.length
    ? (studentsList.reduce((s, st) => s + st.se, 0) / studentsList.length).toFixed(2)
    : '0.00';

  return (
    <>
      <div className="card">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
              <span style={{
                background: 'var(--navy)', color: '#fff', fontSize: 11, fontWeight: 700,
                padding: '3px 8px', borderRadius: 4, textTransform: 'uppercase'
              }}>
                Thuật toán 1 · Psychometrics
              </span>
              <span style={{ fontSize: 14, fontWeight: 700, color: 'var(--navy-d)' }}>
                Item Response Theory (Mô hình Rasch 1PL)
              </span>
            </div>
            <p className="hint" style={{ margin: 0 }}>
              Ước lượng năng lực tiềm ẩn &theta; của học sinh và độ khó thực nghiệm b của câu hỏi theo chuẩn đo lường quốc tế (PISA/ETS).
            </p>
          </div>
          <div style={{ textAlign: 'right' }}>
            <span style={{ fontSize: 13, color: 'var(--muted)' }}>Trạng thái hội tụ Bayesian MAP:</span>
            <div style={{ fontSize: 18, fontWeight: 800, color: 'var(--ok)' }}>
              {rasch.converged ? `Đạt (${rasch.iterations} vòng lặp)` : 'Chưa hội tụ'}
            </div>
          </div>
        </div>

        <div className="stat" style={{ marginTop: 16 }}>
          <div><b>{itemsList.length}</b><span>câu hỏi được chuẩn hóa b</span></div>
          <div><b>{studentsList.length}</b><span>học sinh ước lượng &theta;</span></div>
          <div><b style={{ color: 'var(--navy)' }}>0.00</b><span>trọng tâm độ khó b (Căn chuẩn)</span></div>
          <div><b style={{ color: 'var(--ok)' }}>&plusmn;{avgSE}</b><span>sai số chuẩn TB (SEM)</span></div>
        </div>
      </div>

      {/* Đồ thị ICC tương tác */}
      <ItemCharacteristicCurve items={itemsList} />

      {/* Bảng độ khó thực nghiệm của từng câu hỏi */}
      <div className="card" style={{ marginTop: 18 }}>
        <h2>Bảng thông số độ khó Rasch (b) của ngân hàng câu hỏi</h2>
        <p className="hint" style={{ marginBottom: 12 }}>
          Độ khó thực nghiệm b (logit) được tính độc lập với trình độ của lớp học sinh làm bài. b &lt; 0 là câu dễ, b &gt; 0 là câu khó.
        </p>
        <div className="scroll">
          {/* Khối giao diện: Bảng số liệu tổng hợp */}
          <table>
            <thead>
              <tr>
                <th>Mã câu hỏi</th>
                <th>Đơn vị kiến thức</th>
                <th className="n">Số lượt làm</th>
                <th className="n">Tỷ lệ đúng (p)</th>
                <th className="n">Độ khó Rasch (b)</th>
                <th>Đánh giá sư phạm</th>
              </tr>
            </thead>
            <tbody>
              {itemsList.map((it) => (
                <tr key={it.id}>
                  <td><strong>{it.id}</strong></td>
                  <td>{r.tenDonVi.get(it.id.split('-').slice(0, 3).join('-')) ?? it.id}</td>
                  <td className="n">{it.total}</td>
                  <td className="n">{Math.round(it.pValue * 100)}%</td>
                  <td className="n">
                    <strong style={{ color: it.b > 1.0 ? 'var(--warn)' : it.b < -1.0 ? 'var(--ok)' : undefined }}>
                      {it.b > 0 ? `+${it.b.toFixed(2)}` : it.b.toFixed(2)}
                    </strong>
                  </td>
                  <td>
                    <span className={`tag ${it.label === 'rất khó' ? 'warn' : it.label === 'rất dễ' ? 'ok' : ''}`}>
                      {it.label}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Bảng năng lực tiềm ẩn của từng học sinh */}
      <div className="card">
        <h2>Bảng năng lực tiềm ẩn Rasch (&theta;) của học sinh</h2>
        <p className="hint" style={{ marginBottom: 12 }}>
          Năng lực &theta; phản ánh thực chất trình độ học sinh khi đã loại bỏ yếu tố &quot;làm đề dễ được điểm cao&quot;.
        </p>
        <div className="scroll">
          {/* Khối giao diện: Bảng số liệu tổng hợp */}
          <table>
            <thead>
              <tr>
                <th>Mã học sinh</th>
                <th className="n">Số câu làm</th>
                <th className="n">Số câu đúng</th>
                <th className="n">Năng lực &theta; (logit)</th>
                <th className="n">Sai số chuẩn (SE)</th>
                <th className="n">Điểm Rasch (0–10)</th>
              </tr>
            </thead>
            <tbody>
              {studentsList.map((st) => (
                <tr key={st.id}>
                  <td><strong>{st.id}</strong></td>
                  <td className="n">{st.rawCount}</td>
                  <td className="n">{st.correctCount}</td>
                  <td className="n">
                    <b style={{ color: st.theta >= 1.0 ? 'var(--ok)' : st.theta <= -1.0 ? 'var(--warn)' : undefined }}>
                      {st.theta > 0 ? `+${st.theta.toFixed(2)}` : st.theta.toFixed(2)}
                    </b>
                  </td>
                  <td className="n">&plusmn;{st.se.toFixed(2)}</td>
                  <td className="n">
                    <span className="tag ok" style={{ fontSize: 13 }}>
                      {st.score.toFixed(1)}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}
