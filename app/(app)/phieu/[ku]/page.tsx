/**
 * FILE NÀY LÀM GÌ: Trang Next.js App Router trong khu vực học tập đã đăng nhập, nạp dữ liệu ban đầu và hiển thị giao diện tương tác.
 * AI DÙNG: học sinh
 * ĐỊA CHỈ TRÊN WEB: /phieu/[ku]
 * LẤY DỮ LIỆU TỪ: profiles, students, questions_public, question_options
 * GỌI TỚI: @/lib/supabase/server, @/components/MathText, @/components/MaQR, @/lib/dfle/latex-hoa.js, @/lib/dfle/t9-phieu-hoc-tap.js, @/components/phieu/PhieuTuongTac, @/lib/dfle/t9-tom-tat.js, @/lib/chuDeChuong
 */
import { supabaseAdmin, supabaseServer } from '@/lib/supabase/server';
import { redirect, notFound } from 'next/navigation';
import MathText from '@/components/MathText';
import MaQR from '@/components/MaQR';
import { latexHoa } from '@/lib/dfle/latex-hoa.js';
import { phieuHocTap } from '@/lib/dfle/t9-phieu-hoc-tap.js';
import { OGhi, ODanh, NutIn } from '@/components/phieu/PhieuTuongTac';
import '@/components/phieu/phieu.css';
import { tomTatCuaMuc, anhTomTatCuaMuc } from '@/lib/dfle/t9-tom-tat.js';
import { chuDeChuong } from '@/lib/chuDeChuong';
import { chonCauPhieuQR, taoChuoiQRPhieu } from '@/lib/khkt/phieuQR';
import { laVaiTroGV, lopCuaToi, tenHienThiLop } from '@/lib/gv/lopCuaToi';
import LinhVatDaNang from '@/components/LinhVatDaNang';

export const dynamic = 'force-dynamic';

const M = ({ c }: { c: string }) => <MathText>{latexHoa(String(c))}</MathText>;
const CHU = 'ABCDEFGH';
const MUC = ['', '🌱 Hạt Mầm', '🌿 Chồi Xanh', '🌳 Đại Thụ', '⭐ Đỉnh Sao'];

type Cau = { de: string; lua?: string[]; noi?: { trai: string[]; phai: string[] }; dapAn: string };

/** PHIẾU HƯỚNG DẪN TỰ HỌC của một mục: xem trên máy, ghi chép trực tiếp hoặc in ra giấy. */
export default async function PhieuHocTap({
  params,
  searchParams,
}: {
  params: { ku: string };
  searchParams?: { lop?: string; hs?: string };
}) {
  const db = supabaseServer();
  // Kiểm tra xác thực tài khoản, vai trò giáo viên hoặc điều kiện đồng ý
  const { data: { user } } = await db.auth.getUser();
  if (!user) redirect('/dang-nhap');
  const ku = decodeURIComponent(params.ku);
  const p = phieuHocTap(ku) as any;
  if (!p) notFound();
  const k = (s: string) => `${ku}:${s}`;
  const tt = tomTatCuaMuc(ku) as { bai: number; anh: string[]; ghi: { quyTac: string; viDu: string; deSai: string } } | null;
  const anhTomTat = anhTomTatCuaMuc(ku);
  const cd = chuDeChuong(ku);

  // Truy vấn Supabase: đọc dữ liệu từ bảng profiles
  const { data: prof } = await db.from('profiles').select('student_id, role, class_id').eq('id', user.id).maybeSingle();
  // Kiểm tra xác thực tài khoản, vai trò giáo viên hoặc điều kiện đồng ý
  const laGV = laVaiTroGV(prof?.role);
  const admin = supabaseAdmin();

  let qrStudentId = String(prof?.student_id ?? '');
  let qrTenHS = qrStudentId;
  let qrLopTen = String(prof?.class_id ?? '');
  let dsHSChon: { student_id: string; ten: string }[] = [];
  let lopChonId = '';
  let lopsGV: Awaited<ReturnType<typeof lopCuaToi>> = [];

  if (laGV) {
    lopsGV = await lopCuaToi(db);
    lopChonId = searchParams?.lop && lopsGV.some((l) => l.class_id === searchParams.lop)
      ? searchParams.lop
      : lopsGV[0]?.class_id ?? '';
    if (lopChonId) {
      const { data: hsLop } = await admin
        .from('students')
        .select('student_id, display_name')
        .eq('class_id', lopChonId)
        .order('student_id');
      dsHSChon = (hsLop ?? []).map((h) => ({
        student_id: String(h.student_id),
        ten: String(h.display_name || h.student_id),
      }));
      const chonHS = searchParams?.hs && dsHSChon.some((h) => h.student_id === searchParams.hs)
        ? searchParams.hs
        : dsHSChon[0]?.student_id ?? '';
      qrStudentId = chonHS;
      qrTenHS = dsHSChon.find((h) => h.student_id === chonHS)?.ten ?? chonHS;
      const lopObj = lopsGV.find((l) => l.class_id === lopChonId);
      qrLopTen = lopObj ? tenHienThiLop(lopObj) : lopChonId;
    }
  } else if (qrStudentId) {
    // Truy vấn Supabase: đọc dữ liệu từ bảng students
    const { data: st } = await admin.from('students').select('display_name, class_id').eq('student_id', qrStudentId).maybeSingle();
    if (st) {
      qrTenHS = st.display_name || qrStudentId;
      qrLopTen = st.class_id || qrLopTen;
    }
  }

  const { data: bankQR } = await admin
    .from('questions_public')
    .select('question_id, stem, level')
    .eq('ku_id', ku)
    .order('level');
  const qrQids = (bankQR ?? []).map((q) => q.question_id);
  const { data: optsQR } = qrQids.length
    ? await admin.from('question_options').select('question_id, option_key, option_text').in('question_id', qrQids).order('option_key')
    : { data: [] as any[] };
  const cauTracNghiemQR = chonCauPhieuQR(bankQR ?? [], optsQR ?? [], qrStudentId || ku, 'chuan-bi');
  const qrPayload = taoChuoiQRPhieu(qrStudentId || 'CHUA_GAN_HS', ku, 'chuan-bi');

  return (
    <div className="wrap phieu">
      <div className="phieu-cong-cu no-print">
        <a className="action-link" href={`/hoc/${encodeURIComponent(ku)}`}>← Về bài học</a>
        <NutIn />
      </div>

      <header className="phieu-dau">
        <div className="phieu-linh-vat" aria-hidden="true">
          <LinhVatDaNang loai="vooc" tuThe="chi-tay" kichThuoc={48} inDenTrang />
        </div>
        <p className="phieu-loai">
          PHIẾU HƯỚNG DẪN TỰ HỌC · TOÁN 9
          {cd && <span className="phieu-chuong-bt"> · {cd.bieuTuong} {cd.chuong} ({cd.ten})</span>}
        </p>
        <h1>{p.ten}</h1>
        <p className="phieu-bai">{p.bai} · {p.muc}</p>
        <p className="phieu-ten">Họ và tên: ……………………………………… Lớp: ………… Ngày: ……………</p>
      </header>

      {/* Khối giao diện: Khối nội dung chính */}
      <section className="phieu-muc-tieu">
        <h2>🎯 Mục tiêu</h2>
        <ul>{p.mucTieu.map((m: string) => <li key={m}><M c={m} /></li>)}</ul>
      </section>

      {/* Khối giao diện: Khối nội dung chính */}
      <section>
        <h2><span className="phieu-so">I</span> Ôn kiến thức nền <small>trước khi xem video · 5 phút</small></h2>
        {p.onNen.nen && <p className="phieu-nen"><M c={p.onNen.nen} /></p>}
        <ol className="phieu-cau">
          {p.onNen.cau.map((c: Cau, i: number) => (
            <li key={i}>
              <p><M c={c.de} /></p>
              {c.noi && (
                <div className="phieu-noi">
                  <ol>{c.noi.trai.map((t) => <li key={t}><M c={t} /></li>)}</ol>
                  <ol type="A">{c.noi.phai.map((t) => <li key={t}><M c={t} /></li>)}</ol>
                </div>
              )}
              {c.lua && <ol type="A" className="phieu-lua">{c.lua.map((t) => <li key={t}><M c={t} /></li>)}</ol>}
              <OGhi khoa={k('nen' + i)} dong={1} goiY="Câu trả lời của em…" />
            </li>
          ))}
        </ol>
      </section>

      {/* Khối giao diện: Khối nội dung chính */}
      <section>
        <h2><span className="phieu-so">II</span> Xem video và ghi chép {p.video && <small>khoảng {p.video.phut} phút</small>}</h2>
        {p.video
          ? <p>Xem video bài học trên trang <a href={`/hoc/${encodeURIComponent(ku)}`}>bài học</a>{' '}(<a href={p.video.url} target="_blank" rel="noreferrer">mở trên YouTube</a>). Dừng video khi cần để ghi lại.</p>
          : <p>Mục này không có video mới. Em đọc khung Ghi nhớ bên dưới và xem lại vở ghi các mục trước.</p>}
        {anhTomTat && <p className="no-print"><a href={anhTomTat} target="_blank" rel="noreferrer">Xem ảnh tóm tắt của mục</a></p>}
        {tt ? (
          <div className="phieu-ghi-nho">
            <p className="phieu-ghi-nho__nhan">✍️ Xem xong video, em chép 4 dòng này vào vở</p>
            <ol className="phieu-ghi-vo">
              <li><b>Quy tắc</b> (đóng khung): <MathText>{tt.ghi.quyTac}</MathText></li>
              <li><b>Ví dụ:</b> <MathText>{tt.ghi.viDu}</MathText></li>
              <li><b>Dễ sai:</b> <MathText>{tt.ghi.deSai}</MathText></li>
              <li><b>Câu em muốn hỏi:</b> em tự viết, mang lên lớp hỏi thầy cô.</li>
            </ol>
          </div>
        ) : (
          <>
            <div className="phieu-ghi">
              <p><b>1.</b> Kiến thức chính em vừa học (định nghĩa, quy tắc, công thức):</p>
              <OGhi khoa={k('ghi1')} dong={4} />
              <p><b>2.</b> Chép lại một ví dụ trong video và cách giải:</p>
              <OGhi khoa={k('ghi2')} dong={4} />
            </div>
            <div className="phieu-ghi-nho">
              <p className="phieu-ghi-nho__nhan">📌 Ghi nhớ — xem xong video, em đối chiếu với phần em đã ghi</p>
              {p.ghiNho.map((g: any) => <div key={g.tieuDe}><p><b><M c={g.tieuDe} /></b></p><p><M c={g.quyTac} /></p></div>)}
            </div>
          </>
        )}
        {p.viDu.length > 0 && (
          <div className="phieu-vi-du">
            <p className="phieu-vi-du__nhan">Ví dụ mẫu</p>
            {p.viDu.map((v: any) => <div key={v.de}><p><b>Đề:</b> <M c={v.de} /></p><p><b>Giải:</b> <M c={v.giai} /></p></div>)}
          </div>
        )}
        {p.loiHayGap.length > 0 && (
          <div className="phieu-loi">
            <p className="phieu-loi__nhan">⚠️ Lỗi hay gặp — em cẩn thận</p>
            <ul>{p.loiHayGap.map((l: string) => <li key={l}><M c={l} /></li>)}</ul>
          </div>
        )}
      </section>

      {/* Khối giao diện: Khối nội dung chính */}
      <section>
        <h2><span className="phieu-so">III</span> Tự luyện <small>sau khi xem video · 15 phút</small></h2>
        <p className="phieu-chu-y">Trắc nghiệm: khoanh (hoặc chọn) một phương án đúng.</p>
        <ol className="phieu-cau">
          {p.tuLuyen.map((c: any, i: number) => (
            <li key={i}>
              <p><span className="phieu-muc">{MUC[c.muc]}</span> <M c={c.de} /></p>
              <div className="phieu-lua-chon">
                {c.lua.map((t: string, j: number) => <ODanh key={j} kieu="radio" nhom={k('tl' + i)} khoa={CHU[j]} nhan={<><b>{CHU[j]}.</b> <M c={t} /></>} />)}
              </div>
            </li>
          ))}
          {p.tuLam.map((c: any, i: number) => (
            <li key={'tl' + i}>
              <p><span className="phieu-muc">Tự làm</span> <M c={c.de} /></p>
              <OGhi khoa={k('tulam' + i)} dong={3} goiY="Bài làm của em…" />
            </li>
          ))}
        </ol>
      </section>

      {/* Khối giao diện: Khối nội dung chính */}
      <section>
        <h2><span className="phieu-so">IV</span> Tự đánh giá</h2>
        <p>Đánh dấu những việc em đã làm được:</p>
        {p.mucTieu.map((m: string, i: number) => <ODanh key={i} khoa={k('dg' + i)} nhan={<M c={m} />} />)}
        <ODanh khoa={k('dg-video')} nhan="Em đã xem hết video và ghi chép đầy đủ" />
        <p style={{ marginTop: 12 }}>Điều em chưa hiểu, muốn hỏi thầy cô trên lớp:</p>
        <OGhi khoa={k('hoi')} dong={3} />
      </section>

      <details className="phieu-dap-an">
        <summary>Đáp án (chỉ xem sau khi em đã làm xong)</summary>
        <p><b>I. Ôn nền:</b></p>
        <ol>{p.onNen.cau.map((c: Cau, i: number) => <li key={i}><M c={c.dapAn} /></li>)}</ol>
        <p><b>III. Tự luyện:</b></p>
        <ol>
          {p.tuLuyen.map((c: any, i: number) => <li key={i}>{c.dapAn}</li>)}
          {p.tuLam.map((c: any, i: number) => <li key={'t' + i}><M c={c.dapAn} />. <M c={c.giaiThich} /></li>)}
        </ol>
      </details>

      {cauTracNghiemQR.length > 0 && (
        <section style={{ breakBefore: 'page', border: '2px solid #2d5fa8' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 16, flexWrap: 'wrap', borderBottom: '1px solid #cbd5e1', paddingBottom: 12, marginBottom: 12 }}>
            <div>
              <p className="phieu-loai" style={{ marginBottom: 4 }}>PHIẾU TRẮC NGHIỆM NỘP GIẤY (CÓ MÃ QR QUÉT BẰNG ĐIỆN THOẠI)</p>
              <h2 style={{ margin: '0 0 4px' }}>{p.ten} ({ku})</h2>
              <p style={{ margin: 0, fontSize: 14 }}>
                Học sinh: <b>{qrTenHS || '…………………………'}</b> · Mã HS: <code>{qrStudentId || '…………'}</code> · Lớp: <b>{qrLopTen || '………'}</b>
              </p>
              <p className="phieu-chu-y" style={{ margin: '4px 0 0' }}>
                Khoanh tròn chữ cái A, B, C hoặc D. Thầy cô mở <code>/gv/quet-phieu</code> để quét mã QR và chấm ngay.
              </p>
            </div>
            <div style={{ textAlign: 'center' }}>
              <MaQR value={qrPayload} size={104} label={`QR phiếu ${qrPayload}`} />
              <div style={{ fontSize: 11, color: '#475569', marginTop: 4 }}><code>{qrPayload}</code></div>
            </div>
          </div>

          {laGV && dsHSChon.length > 0 && (
            <form method="get" className="no-print" style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center', marginBottom: 12, padding: 10, background: '#f8fafc', borderRadius: 10 }}>
              <label style={{ fontSize: 13 }}>
                Lớp{' '}
                <select name="lop" defaultValue={lopChonId}>
                  {lopsGV.map((l) => (
                    <option key={l.class_id} value={l.class_id}>{tenHienThiLop(l)}</option>
                  ))}
                </select>
              </label>
              <label style={{ fontSize: 13 }}>
                Học sinh{' '}
                <select name="hs" defaultValue={qrStudentId}>
                  {dsHSChon.map((h) => (
                    <option key={h.student_id} value={h.student_id}>{h.ten} ({h.student_id})</option>
                  ))}
                </select>
              </label>
              <button type="submit">Đổi QR cho HS này</button>
            </form>
          )}

          <ol className="phieu-cau">
            {cauTracNghiemQR.map((q) => (
              <li key={q.question_id} style={{ breakInside: 'avoid' }}>
                <p><MathText>{q.stem}</MathText></p>
                <div className="phieu-lua-chon">
                  {q.options.map((o) => (
                    <div key={o.option_key} style={{ padding: '2px 0' }}>
                      <b>({o.nhan})</b> <MathText>{o.option_text}</MathText>
                    </div>
                  ))}
                </div>
              </li>
            ))}
          </ol>
        </section>
      )}
    </div>
  );
}
