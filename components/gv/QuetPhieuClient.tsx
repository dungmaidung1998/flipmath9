'use client';

/**
 * FILE NÀY LÀM GÌ: Component React phía trình duyệt phục vụ bảng điều khiển, biểu đồ và biểu mẫu thao tác cho giáo viên.
 * AI DÙNG: giáo viên
 * LẤY DỮ LIỆU TỪ: không truy vấn bảng trực tiếp
 * GỌI TỚI: @/components/MathText, @/lib/khkt/phieuQR, @/lib/gv/lopCuaToi
 */
import { useEffect, useMemo, useRef, useState } from 'react';
import MathText from '@/components/MathText';
import { giaiMaQRPhieu, type ModePhieuQR } from '@/lib/khkt/phieuQR';
import { nhanTruongLop, type LopCuaToi } from '@/lib/gv/lopCuaToi';

type StudentOpt = { student_id: string; class_id: string; ten: string };
type KuOpt = { ku_id: string; ku_name: string };

type CauQuet = {
  question_id: string;
  stem: string;
  level: number;
  options: { option_key: string; option_text: string; nhan: string }[];
};

/**
 * Component React `QuetPhieuClient`: nhận props (thuộc tính truyền vào từ component cha) và dựng giao diện tương ứng.
 */
export default function QuetPhieuClient({
  lops,
  students,
  units,
}: {
  lops: LopCuaToi[];
  students: StudentOpt[];
  units: KuOpt[];
}) {
  const [classId, setClassId] = useState(lops[0]?.class_id ?? '');
  const [studentId, setStudentId] = useState('');
  const [kuId, setKuId] = useState(units[0]?.ku_id ?? '');
  const [mode, setMode] = useState<ModePhieuQR>('chuan-bi');
  const [qrInput, setQrInput] = useState('');

  const [scanning, setScanning] = useState(false);
  const [scanMsg, setScanMsg] = useState('');
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const [questions, setQuestions] = useState<CauQuet[]>([]);
  const [tenHS, setTenHS] = useState('');
  const [chon, setChon] = useState<Record<string, string>>({});
  const [busy, setBusy] = useState(false);
  const [loi, setLoi] = useState('');
  const [ketQua, setKetQua] = useState<{ score: number; correctCount: number; total: number; errorCodes: string[] } | null>(null);

  const hsLop = useMemo(() => students.filter((s) => s.class_id === classId), [students, classId]);

  useEffect(() => {
    if (!hsLop.some((s) => s.student_id === studentId)) {
      setStudentId(hsLop[0]?.student_id ?? '');
    }
  }, [classId, hsLop]); // eslint-disable-line react-hooks/exhaustive-deps

  function dungCamera() {
    setScanning(false);
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }
  }

  useEffect(() => () => dungCamera(), []);

  async function taiPhieu(sid: string, ku: string, m: ModePhieuQR) {
    if (!sid || !ku) return;
    setBusy(true);
    setLoi('');
    setKetQua(null);
    try {
      const res = await fetch(
        `/api/gv/quet-phieu?studentId=${encodeURIComponent(sid)}&kuId=${encodeURIComponent(ku)}&mode=${m}`,
        { cache: 'no-store' }
      );
      const json = await res.json();
      if (!res.ok) throw new Error(json?.error || 'Không tải được phiếu.');
      setQuestions(json.questions ?? []);
      setTenHS(json.student?.display_name || sid);
      setChon({});
    } catch (e: any) {
      setLoi(e?.message || 'Lỗi tải phiếu.');
    } finally {
      setBusy(false);
    }
  }

  async function batCamera() {
    setLoi('');
    setScanMsg('');
    if (!navigator.mediaDevices?.getUserMedia) {
      setScanMsg('Thiết bị không hỗ trợ camera trình duyệt — thầy cô chọn học sinh và mục ở bên dưới.');
      return;
    }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' },
      });
      streamRef.current = stream;
      setScanning(true);
      window.setTimeout(() => {
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          void videoRef.current.play().catch(() => {});
        }
      }, 60);

      const BD = (window as any).BarcodeDetector;
      if (!BD) {
        setScanMsg('Camera đang mở, nhưng trình duyệt này chưa có BarcodeDetector. Thầy cô xem mã HS trên phiếu rồi chọn nhanh bên dưới hoặc dán mã QR.');
        return;
      }
      const detector = new BD({ formats: ['qr_code'] });
      const loop = async () => {
        if (!streamRef.current || !videoRef.current) return;
        try {
          const codes = await detector.detect(videoRef.current);
          if (codes?.length) {
            const raw = String(codes[0].rawValue ?? '');
            const parsed = giaiMaQRPhieu(raw);
            if (parsed) {
              setQrInput(raw);
              setStudentId(parsed.studentId);
              const hsObj = students.find((s) => s.student_id === parsed.studentId);
              if (hsObj) setClassId(hsObj.class_id);
              setKuId(parsed.kuId);
              setMode(parsed.mode);
              dungCamera();
              void taiPhieu(parsed.studentId, parsed.kuId, parsed.mode);
              return;
            }
          }
        } catch {
          /* bỏ qua khung hình lỗi */
        }
        if (streamRef.current) window.setTimeout(loop, 350);
      };
      window.setTimeout(loop, 500);
    } catch {
      setScanMsg('Không mở được camera (chưa cấp quyền hoặc không có camera). Thầy cô dùng chọn tay bên dưới.');
    }
  }

  function apDungChuoiQR() {
    const parsed = giaiMaQRPhieu(qrInput);
    if (!parsed) {
      setLoi('Mã QR không đúng định dạng FM9|ma_hoc_sinh|ma_muc|chuan-bi.');
      return;
    }
    const hsObj = students.find((s) => s.student_id === parsed.studentId);
    if (hsObj) setClassId(hsObj.class_id);
    setStudentId(parsed.studentId);
    setKuId(parsed.kuId);
    setMode(parsed.mode);
    void taiPhieu(parsed.studentId, parsed.kuId, parsed.mode);
  }

  async function ghiKetQua() {
    if (!questions.length || !studentId || !kuId || busy) return;
    setBusy(true);
    setLoi('');
    try {
      const res = await fetch('/api/gv/quet-phieu', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          studentId,
          kuId,
          mode,
          answers: questions.map((q) => ({
            questionId: q.question_id,
            option: chon[q.question_id] ?? null,
          })),
        }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json?.error || 'Không ghi được kết quả.');
      setKetQua(json);
    } catch (e: any) {
      setLoi(e?.message || 'Lỗi ghi kết quả.');
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="mc">
      <div className="mc-dau">
        <div>
          <h1>Quét phiếu QR (học sinh không thiết bị)</h1>
          <p className="mc-cauhoi">
            Quét mã QR trên phiếu giấy của học sinh rồi bấm nhanh đáp án A/B/C/D em đã khoanh để ghi kết quả như bài làm thường (<code>nguon: &apos;phieu-giay&apos;</code>).
          </p>
        </div>
      </div>

      {/* Khối giao diện: Khối nội dung chính */}
      <section className="mc-khoi">
        <h2>1. Quét mã QR hoặc chọn học sinh &amp; phiếu</h2>
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginBottom: 12 }}>
          {!scanning ? (
            <button type="button" className="nho chinh" onClick={batCamera}>
              📷 Mở camera quét QR trên điện thoại
            </button>
          ) : (
            <button type="button" className="nho" onClick={dungCamera}>
              ⏹ Tắt camera
            </button>
          )}
          <div style={{ display: 'flex', gap: 6, flex: 1, minWidth: 240 }}>
            <input
              value={qrInput}
              onChange={(e) => setQrInput(e.target.value)}
              placeholder="Hoặc dán chuỗi QR: FM9|HS01|C1-B1-M1|chuan-bi"
              style={{ flex: 1, padding: 7, borderRadius: 8, border: '1px solid var(--mc-vach)' }}
            />
            <button type="button" className="nho" onClick={apDungChuoiQR}>
              Đọc mã
            </button>
          </div>
        </div>

        {scanMsg && <p className="mc-ghi" style={{ marginBottom: 10 }}>{scanMsg}</p>}
        {scanning && (
          <div style={{ marginBottom: 12 }}>
            <video ref={videoRef} playsInline muted style={{ width: '100%', maxWidth: 360, borderRadius: 12, border: '2px solid var(--navy)' }} />
          </div>
        )}

        <div style={{ display: 'grid', gap: 10, gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))' }}>
          <label style={{ display: 'flex', flexDirection: 'column', gap: 4, fontSize: 13.5 }}>
            <b>Lớp</b>
            <select value={classId} onChange={(e) => setClassId(e.target.value)} style={{ padding: 7, borderRadius: 8, border: '1px solid var(--mc-vach)' }}>
              {lops.map((l) => (
                <option key={l.class_id} value={l.class_id}>{nhanTruongLop(l)}</option>
              ))}
            </select>
          </label>
          <label style={{ display: 'flex', flexDirection: 'column', gap: 4, fontSize: 13.5 }}>
            <b>Học sinh</b>
            <select value={studentId} onChange={(e) => setStudentId(e.target.value)} style={{ padding: 7, borderRadius: 8, border: '1px solid var(--mc-vach)' }}>
              {hsLop.map((s) => (
                <option key={s.student_id} value={s.student_id}>{s.ten} ({s.student_id})</option>
              ))}
            </select>
          </label>
          <label style={{ display: 'flex', flexDirection: 'column', gap: 4, fontSize: 13.5 }}>
            <b>Mục kiến thức</b>
            <select value={kuId} onChange={(e) => setKuId(e.target.value)} style={{ padding: 7, borderRadius: 8, border: '1px solid var(--mc-vach)' }}>
              {units.map((u) => (
                <option key={u.ku_id} value={u.ku_id}>{u.ku_id} · {u.ku_name}</option>
              ))}
            </select>
          </label>
          <div style={{ display: 'flex', alignItems: 'flex-end' }}>
            <button type="button" className="nho chinh" disabled={busy || !studentId || !kuId} onClick={() => taiPhieu(studentId, kuId, mode)}>
              📋 Nạp phiếu để nhập đáp án
            </button>
          </div>
        </div>
        {loi && <p role="alert" style={{ color: 'var(--st-nguy)', marginTop: 10, fontWeight: 600 }}>{loi}</p>}
      </section>

      {questions.length > 0 && (
        <section className="mc-khoi">
          <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: 8, alignItems: 'center', marginBottom: 12 }}>
            <h2 style={{ margin: 0 }}>
              2. Bấm nhanh đáp án em đã khoanh — {tenHS} ({studentId}) · <code>{kuId}</code>
            </h2>
            <span>Đã chọn {Object.keys(chon).length}/{questions.length} câu</span>
          </div>

          <div style={{ display: 'grid', gap: 10 }}>
            {questions.map((q, idx) => (
              <div key={q.question_id} style={{ padding: 10, borderRadius: 10, border: '1px solid var(--mc-vach)', display: 'grid', gap: 8 }}>
                <div style={{ fontSize: 14 }}>
                  <b>Câu {idx + 1}:</b> <MathText>{q.stem}</MathText>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, minmax(0, 1fr))', gap: 8 }}>
                  {q.options.map((o) => {
                    const picked = chon[q.question_id] === o.option_key;
                    return (
                      <button
                        key={o.option_key}
                        type="button"
                        onClick={() => setChon((c) => ({ ...c, [q.question_id]: o.option_key }))}
                        style={{
                          padding: '12px 8px',
                          borderRadius: 10,
                          border: `2px solid ${picked ? '#2563eb' : '#cbd5e1'}`,
                          background: picked ? '#2563eb' : '#f8fafc',
                          color: picked ? '#ffffff' : '#0f172a',
                          fontWeight: 800,
                          fontSize: 16,
                          cursor: 'pointer',
                        }}
                      >
                        {o.nhan}
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>

          <div style={{ marginTop: 16, display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
            <button type="button" className="nho chinh" style={{ padding: '10px 18px', fontSize: 15 }} disabled={busy} onClick={ghiKetQua}>
              {busy ? 'Đang ghi kết quả…' : '✅ Lưu kết quả phiếu giấy'}
            </button>
            {ketQua && (
              <span style={{ fontWeight: 700, color: 'var(--st-tot)' }}>
                Đã lưu: {ketQua.score.toFixed(1)} điểm ({ketQua.correctCount}/{ketQua.total} đúng)
                {ketQua.errorCodes.length ? ` · Đã đẩy vào Sổ lỗi: ${ketQua.errorCodes.join(', ')}` : ''}
              </span>
            )}
          </div>
        </section>
      )}
    </div>
  );
}
