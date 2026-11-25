/**
 * FILE NÀY LÀM GÌ: Trang giao diện dành cho giáo viên trong khu vực đã đăng nhập, tổng hợp số liệu lớp và hỗ trợ điều chỉnh dạy học.
 * AI DÙNG: giáo viên
 * ĐỊA CHỈ TRÊN WEB: /gv/ai-minh-bach
 * LẤY DỮ LIỆU TỪ: error_hints, hoi_dap, hoi_bin, ai_nhat_ky, cham_vo_luot, goi_y_su_kien, kttx_bai_nop, profiles
 * GỌI TỚI: @/components/gv/BoLoc, @/lib/ai/gemini, @/lib/ai/nhaCungCap, @/lib/khkt/tuLuc, @/lib/supabase/server
 */
import { batBuocGiaoVien } from '@/components/gv/BoLoc';
import { aiTroGiupBat, coKhoaGemini, tenMoHinhGemini } from '@/lib/ai/gemini';
import { trangThaiChamVoAI } from '@/lib/ai/nhaCungCap';
import { tinhChiSoTuLuc, type GoiYSuKienRow } from '@/lib/khkt/tuLuc';
import { chuanHoaTrangThaiKTTX, tinhThongKeNghienCuuKTTX } from '@/lib/khkt/kttx';
import { supabaseAdmin } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';

/**
 * Component React `gioVNDep`: nhận props (thuộc tính truyền vào từ component cha) và dựng giao diện tương ứng.
 */
function gioVNDep(iso: string): string {
  try {
    return new Date(iso).toLocaleString('vi-VN', { timeZone: 'Asia/Ho_Chi_Minh' });
  } catch {
    return iso;
  }
}

/**
 * Component React `AiMinhBachPage`: nhận props (thuộc tính truyền vào từ component cha) và dựng giao diện tương ứng.
 */
export default async function AiMinhBachPage() {
  // Kiểm tra xác thực tài khoản, vai trò giáo viên hoặc điều kiện đồng ý
  await batBuocGiaoVien();
  const admin = supabaseAdmin();

  const [resHints, resBank, resBin, resLog, resChamVo, resTuLuc, resKttx] = await Promise.all([
    admin.from('error_hints').select('error_code, tier, nguon').then(
      (r) => (r.error ? admin.from('error_hints').select('error_code, tier') : r),
      () => ({ data: [] as any[], error: null })
    ),
    admin.from('hoi_dap').select('id, nguon, so_lan_dung').then((r) => r, () => ({ data: [] as any[], error: null })),
    admin.from('hoi_bin').select('id, trang_thai, nguon').then((r) => r, () => ({ data: [] as any[], error: null })),
    admin
      .from('ai_nhat_ky')
      .select('id, giao_vien, loai, doi_tuong, mo_hinh, thanh_cong, ghi_chu, tao_luc')
      .order('tao_luc', { ascending: false })
      .limit(30)
      .then((r) => r, () => ({ data: [] as any[], error: null })),
    admin
      .from('cham_vo_luot')
      .select('id, trang_thai_luot, ai_cham_sai, gv_xac_nhan_luc')
      .then((r) => r, () => ({ data: [] as any[], error: null })),
    admin
      .from('goi_y_su_kien')
      .select('id, student_id, nguon, tang, ku_id, question_id, error_code, co_ai, tao_luc, thu_lai_luc, tu_giai, so_goi_y_them, xem_loi_giai')
      .limit(4000)
      .then((r) => r, () => ({ data: [] as any[], error: null })),
    admin
      .from('kttx_bai_nop')
      .select('id, trang_thai, can_kiem_tra, tong_diem_ai, tong_diem_hs, tong_diem_excel, hs_ly_do_bao_sai')
      .then(
        (r) =>
          r.error
            ? admin.from('kttx_bai_nop').select('id, trang_thai, can_kiem_tra')
            : r,
        () => ({ data: [] as any[], error: null })
      ),
  ]);

  const tuLuc = tinhChiSoTuLuc((resTuLuc.data ?? []) as GoiYSuKienRow[]);
  const kttxRows = (resKttx.data ?? []) as any[];
  const kttxDaDuyet = kttxRows.filter((k) => chuanHoaTrangThaiKTTX(k.trang_thai) === 'da-chot').length;
  const kttxCanKT = kttxRows.filter((k) => k.can_kiem_tra === true).length;
  const kttxNopIds = kttxRows.map((k) => k.id).filter(Boolean);
  const { data: kttxCauRows } = kttxNopIds.length
    ? await admin
        .from('kttx_cau_chi_tiet')
        .select('bai_nop_id, diem_dat, diem_gv_sua')
        .in('bai_nop_id', kttxNopIds.slice(0, 1000))
        .then((r) => r, () => ({ data: [] as any[] }))
    : { data: [] as any[] };
  const cauDoiChieuMap = new Map<string, { diem_ai: number | null; diem_chot: number | null }[]>();
  for (const c of kttxCauRows ?? []) {
    const arr = cauDoiChieuMap.get(c.bai_nop_id) ?? [];
    arr.push({
      diem_ai: c.diem_dat != null ? Number(c.diem_dat) : null,
      diem_chot: c.diem_gv_sua != null ? Number(c.diem_gv_sua) : null,
    });
    cauDoiChieuMap.set(c.bai_nop_id, arr);
  }
  const kttxNghienCuu = tinhThongKeNghienCuuKTTX(
    kttxRows.map((k) => ({
      trang_thai: k.trang_thai,
      tong_diem_ai: k.tong_diem_ai ?? null,
      tong_diem_hs: k.tong_diem_hs ?? null,
      tong_diem_excel: k.tong_diem_excel ?? null,
      hs_ly_do_bao_sai: k.hs_ly_do_bao_sai ?? null,
      cau_doi_chieu: cauDoiChieuMap.get(k.id) ?? [],
    }))
  );

  const hints = (resHints.data ?? []) as any[];
  const bank = (resBank.data ?? []) as any[];
  const bin = (resBin.data ?? []) as any[];
  const logs = (resLog.data ?? []) as any[];
  const chamVo = (resChamVo.data ?? []) as any[];
  const cvDaCham = chamVo.filter((c) => c.trang_thai_luot === 'da-cham');
  const cvDaRa = cvDaCham.filter((c) => c.gv_xac_nhan_luc != null || c.ai_cham_sai === true);
  const cvSai = cvDaCham.filter((c) => c.ai_cham_sai === true).length;
  const cvChinhXac = cvDaRa.length ? Math.round(((cvDaRa.length - cvSai) * 1000) / cvDaRa.length) / 10 : null;
  const chamVoCfg = trangThaiChamVoAI();

  const maCoGoiY = new Set(hints.map((h) => h.error_code)).size;
  const tangAi = hints.filter((h) => h.nguon === 'ai-duyet').length;
  const bankAi = bank.filter((b) => b.nguon === 'ai-duyet').length;
  const luotTuDong = bank.reduce((s, b) => s + Number(b.so_lan_dung ?? 0), 0);
  const binCho = bin.filter((b) => b.trang_thai === 'cho').length;
  const binXong = bin.filter((b) => b.trang_thai === 'da-tra-loi').length;

  const gvIds = Array.from(new Set(logs.map((l) => l.giao_vien).filter(Boolean)));
  const { data: gvProfiles } = gvIds.length
    ? await admin.from('profiles').select('id, full_name').in('id', gvIds)
    : { data: [] as { id: string; full_name: string | null }[] };
  const tenGV = new Map((gvProfiles ?? []).map((g) => [g.id, g.full_name ?? g.id.slice(0, 8)]));

  const aiBat = aiTroGiupBat();
  const coKhoa = coKhoaGemini();
  const model = tenMoHinhGemini();

  return (
    <div className="gv-noi">
      <header style={{ marginBottom: 16 }}>
        <h1>Hồ sơ minh bạch sử dụng AI</h1>
        <p className="nho">
          Tài liệu minh bạch cấu hình Gemini &amp; Claude API, quy trình giáo viên giám sát và bảo vệ dữ liệu học sinh.
        </p>
        <p style={{ marginTop: 10 }}>
          <a className="action-link" href="/gv/hoc-sinh">Bật đồng thuận cho học sinh →</a>
        </p>
      </header>

      {/* Khối giao diện: Khối nội dung chính */}
      <section className="the" style={{ marginBottom: 16 }}>
        <h2 style={{ marginTop: 0 }}>1. Trạng thái kỹ thuật hiện tại</h2>
        <div className="row" style={{ gap: 10 }}>
          <span className="pill">Công tắc <code>AI_TRO_GIUP_BAT</code>: <b>{aiBat ? 'Đang BẬT (true)' : 'Đang TẮT (false)'}</b></span>
          <span className="pill">Khoá <code>GEMINI_API_KEY</code> (máy chủ): <b>{coKhoa ? 'Đã cấu hình' : 'Chưa cấu hình'}</b></span>
          <span className="pill">Mô hình Gemini mặc định: <b>{model}</b></span>
          <span className="pill">Công tắc chấm vở <code>AI_CHAM_VO_BAT</code>: <b>{chamVoCfg.bat ? 'Đang BẬT (true)' : 'Đang TẮT (false)'}</b></span>
          <span className="pill">Nhà cung cấp chấm vở ưu tiên: <b>{chamVoCfg.nhaCungCap}</b></span>
          <span className="pill">Khoá <code>ANTHROPIC_API_KEY</code> (dự phòng/tuỳ chọn): <b>{chamVoCfg.coKhoaClaude ? 'Đã cấu hình' : 'Chưa cấu hình'}</b></span>
          <span className="pill">Mô hình Claude: <b>{chamVoCfg.moHinhClaude}</b></span>
        </div>
      </section>

      {/* Khối giao diện: Khối nội dung chính */}
      <section className="the" style={{ marginBottom: 16 }}>
        <h2 style={{ marginTop: 0 }}>2. Nguyên tắc vận hành &amp; Cam kết bảo vệ dữ liệu</h2>
        <ul style={{ lineHeight: 1.7, paddingLeft: 20 }}>
          <li>
            <b>Hỏi Bin của học sinh (Gemini qua máy chủ):</b> ở <code>/api/hoi-bin</code>, học sinh được nhận gợi mở trực tiếp từ Gemini khi ngân hàng <code>hoi_dap</code> chưa có câu khớp; mọi câu hỏi vẫn bị lọc ngoài môn Toán, giới hạn <b>10 câu/ngày/HS</b>, ẩn danh không gửi PII, kiểm tra KaTeX &amp; chặn lộ đáp án (<code>kiemTraDauRaToan</code>), gắn nhãn minh bạch và lưu lại để thầy cô rà soát.
          </li>
          <li>
            <b>Gợi ý lỗi sai &amp; duyệt ngân hàng giáo viên:</b> các route <code>/api/gv/goi-y-ai</code> và <code>/api/gv/hoi-bin</code> cho phép giáo viên dùng Gemini soạn nháp, chỉnh sửa và duyệt vào <code>error_hints</code> hoặc <code>hoi_dap</code>.
          </li>
          <li>
            <b>Minh bạch với học sinh:</b> gợi ý lỗi và câu trả lời có AI hỗ trợ đều ghi rõ trên giao diện học sinh nguồn phát sinh (<i>&ldquo;trực tiếp từ AI (Gemini)&rdquo;</i> hoặc <i>&ldquo;thầy cô đã duyệt&rdquo;</i>).
          </li>
          <li>
            <b>Không gửi dữ liệu định danh cá nhân (PII):</b> không gửi họ tên, mã học sinh, email hay lớp học sang AI; toàn bộ văn bản qua hàm ẩn danh, kiểm tra công thức KaTeX và chặn lộ đáp án cuối.
          </li>
          <li>
            <b>Chấm vở tự luận (Gemini / Claude qua <code>lib/ai/nhaCungCap.ts</code>):</b> phần học sinh gửi ở <code>/api/cham-vo</code> hỗ trợ cả Gemini (ưu tiên khi có <code>GEMINI_API_KEY</code>) và Claude, chỉ mở cho học sinh có <code>consent_status = &apos;dong-y&apos;</code>, giới hạn <b>5 ảnh/ngày/HS</b>, kiểm tra JSON &amp; KaTeX ở máy chủ, xoá ảnh sau tối đa <b>30 ngày</b> và giáo viên rà soát, đánh dấu <i>&ldquo;AI chấm sai&rdquo;</i> tại <code>/gv/cham-vo</code>.
          </li>
        </ul>
      </section>

      {/* Khối giao diện: Khối nội dung chính */}
      <section className="the" style={{ marginBottom: 16 }}>
        <h2 style={{ marginTop: 0 }}>3. Số liệu kiểm duyệt đã ghi nhận</h2>
        <div className="gv-lop-luoi">
          <div className="gv-lop-the">
            <div className="gv-lop-the__ten">Gợi ý mã lỗi</div>
            <div className="gv-lop-the__so">
              <span>Số mã có gợi ý: <b>{maCoGoiY}</b></span>
              <span>Tổng tầng lưu: <b>{hints.length}</b></span>
              <span>Tầng AI+GV duyệt: <b>{tangAi}</b></span>
              <span>GV tự soạn: <b>{hints.length - tangAi}</b></span>
            </div>
          </div>
          <div className="gv-lop-the">
            <div className="gv-lop-the__ten">Ngân hàng Hỏi–Đáp</div>
            <div className="gv-lop-the__so">
              <span>Tổng câu duyệt: <b>{bank.length}</b></span>
              <span>AI+GV duyệt: <b>{bankAi}</b></span>
              <span>Lượt HS tra không AI: <b>{luotTuDong}</b></span>
              <span>GV tự soạn: <b>{bank.length - bankAi}</b></span>
            </div>
          </div>
          <div className="gv-lop-the">
            <div className="gv-lop-the__ten">Hộp thư Hỏi Bin</div>
            <div className="gv-lop-the__so">
              <span>Đang chờ GV: <b>{binCho}</b></span>
              <span>Đã trả lời: <b>{binXong}</b></span>
              <span>Tổng câu hỏi: <b>{bin.length}</b></span>
              <span>Giới hạn ngày: <b>10/HS</b></span>
            </div>
          </div>
          <div className="gv-lop-the">
            <div className="gv-lop-the__ten">Chấm vở AI (Gemini / Claude)</div>
            <div className="gv-lop-the__so">
              <span>Tổng lượt đọc/chấm: <b>{chamVo.length}</b></span>
              <span>GV đã rà soát: <b>{cvDaRa.length}</b></span>
              <span>AI chấm sai: <b>{cvSai}</b></span>
              <span>Độ chính xác: <b>{cvChinhXac == null ? '—' : `${cvChinhXac}%`}</b></span>
            </div>
          </div>
          <div className="gv-lop-the">
            <div className="gv-lop-the__ten">Chỉ số tự lực (TL ≤ 48h)</div>
            <div className="gv-lop-the__so">
              <span>Gợi ý có AI: <b>{tuLuc.coAi.tl == null ? '—' : `${tuLuc.coAi.tl}%`}</b> ({tuLuc.coAi.daThuLai})</span>
              <span>Không dùng AI: <b>{tuLuc.khongAi.tl == null ? '—' : `${tuLuc.khongAi.tl}%`}</b> ({tuLuc.khongAi.daThuLai})</span>
              <span>Xem lời giải trước: <b>{tuLuc.tongHop.tiLeXemLoiGiai == null ? '—' : `${tuLuc.tongHop.tiLeXemLoiGiai}%`}</b></span>
              <span><a href="/gv/tu-luc">Xem phân tích chi tiết →</a></span>
            </div>
          </div>
          <div className="gv-lop-the">
            <div className="gv-lop-the__ten">KTTX trên giấy (chỉ Claude API)</div>
            <div className="gv-lop-the__so">
              <span>Tổng bài số hoá: <b>{kttxRows.length}</b></span>
              <span>Đã chốt chính thức: <b>{kttxDaDuyet}</b></span>
              <span>Cần đối chiếu / lệch: <b>{kttxCanKT}</b></span>
              <span>
                AI trùng Excel (±0,05):{' '}
                <b>
                  {kttxNghienCuu.aiTrungExcel.tiLePct == null
                    ? '—'
                    : `${kttxNghienCuu.aiTrungExcel.tiLePct}% (${kttxNghienCuu.aiTrungExcel.trung}/${kttxNghienCuu.aiTrungExcel.n})`}
                </b>
                {kttxNghienCuu.aiTrungExcelTheoCau.n > 0 && (
                  <>
                    {' · '}Theo câu: <b>{kttxNghienCuu.aiTrungExcelTheoCau.tiLePct}%</b> (n={kttxNghienCuu.aiTrungExcelTheoCau.n})
                  </>
                )}
              </span>
              <span>
                HS xác nhận trùng Excel:{' '}
                <b>
                  {kttxNghienCuu.hsTrungExcel.tiLePct == null
                    ? '—'
                    : `${kttxNghienCuu.hsTrungExcel.tiLePct}% (${kttxNghienCuu.hsTrungExcel.trung}/${kttxNghienCuu.hsTrungExcel.n})`}
                </b>
              </span>
              <span>
                HS báo sai trúng AI sai thật:{' '}
                <b>
                  {kttxNghienCuu.baoSaiDungThat.tongBaoSai > 0
                    ? `${kttxNghienCuu.baoSaiDungThat.soBai}/${kttxNghienCuu.baoSaiDungThat.tongBaoSai}`
                    : '0/0'}
                </b>
              </span>
              <span><a href="/gv/kttx">Mở bảng duyệt KTTX →</a></span>
            </div>
          </div>
        </div>
      </section>

      {/* Khối giao diện: Khối nội dung chính */}
      <section className="the">
        <h2 style={{ marginTop: 0 }}>4. Nhật ký gọi AI gần đây (bảng <code>ai_nhat_ky</code>)</h2>
        {logs.length === 0 ? (
          <p className="nho">Chưa có lượt gọi Gemini nào được ghi (hoặc bảng <code>ai_nhat_ky</code> chưa được tạo từ file SQL 52).</p>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            {/* Khối giao diện: Bảng số liệu tổng hợp */}
            <table>
              <thead>
                <tr>
                  <th>Thời gian</th>
                  <th>Giáo viên</th>
                  <th>Mục đích</th>
                  <th>Đối tượng</th>
                  <th>Mô hình</th>
                  <th>Kết quả</th>
                  <th>Ghi chú</th>
                </tr>
              </thead>
              <tbody>
                {logs.map((l) => (
                  <tr key={l.id}>
                    <td>{gioVNDep(l.tao_luc)}</td>
                    <td>{tenGV.get(l.giao_vien) ?? 'Giáo viên'}</td>
                    <td>{l.loai === 'goi-y-loi' ? 'Soạn 3 tầng gợi ý' : 'Soạn nháp Hỏi Bin'}</td>
                    <td><code>{l.doi_tuong ?? '—'}</code></td>
                    <td><code>{l.mo_hinh ?? '—'}</code></td>
                    <td>{l.thanh_cong ? '✓ Tạo nháp AI' : 'Mẫu dự phòng'}</td>
                    <td>{l.ghi_chu ?? '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}
