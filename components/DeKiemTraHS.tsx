'use client';

/**
 * FILE NÀY LÀM GÌ: Component React giao diện hiển thị và xử lý tương tác của người dùng trên trình duyệt.
 * AI DÙNG: học sinh
 * LẤY DỮ LIỆU TỪ: không truy vấn bảng trực tiếp
 * GỌI TỚI: @/components/MathText, @/components/QuestionFigure
 */
import { useEffect, useRef, useState } from 'react';
import MathText from '@/components/MathText';
import QuestionFigure from '@/components/QuestionFigure';

type CauHS = {
  question_id: string;
  ku_id: string;
  level: number;
  stem: string;
  hinh?: unknown;
  options: { option_key: string; option_text: string; nhan: string }[];
};

type DeHS = {
  id: string;
  chuong: string;
  tieu_de: string;
  thoi_gian_phut: number;
  tao_luc: string;
  cau_hoi: CauHS[];
};

type KetQua = {
  diem: number;
  soDung: number;
  tongCau: number;
  chiTiet: {
    question_id: string;
    ku_id: string;
    chosen_option: string | null;
    correct_option: string;
    is_correct: boolean;
    error_code: string | null;
    moTaLoi: string | null;
  }[];
};

/**
 * Component React `DeKiemTraHS`: nhận props (thuộc tính truyền vào từ component cha) và dựng giao diện tương ứng.
 */
export default function DeKiemTraHS() {
  const [deList, setDeList] = useState<DeHS[]>([]);
  const [lichSu, setLichSu] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [dangLam, setDangLam] = useState<DeHS | null>(null);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [giayConLai, setGiayConLai] = useState(0);
  const [busy, setBusy] = useState(false);
  const [ketQua, setKetQua] = useState<KetQua | null>(null);
  const [loi, setLoi] = useState('');
  const batDauRef = useRef(0);

  async function tai() {
    setLoading(true);
    try {
      const res = await fetch('/api/de-kiem-tra', { cache: 'no-store' });
      const data = await res.json();
      if (res.ok) {
        setDeList(data.deList ?? []);
        setLichSu(data.lichSu ?? []);
      }
    } catch {
      setLoi('Không tải được danh sách đề làm thử.');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void tai();
  }, []);

  useEffect(() => {
    if (!dangLam || ketQua) return;
    const t = window.setInterval(() => {
      setGiayConLai((s) => {
        if (s <= 1) {
          window.clearInterval(t);
          void nopBai();
          return 0;
        }
        return s - 1;
      });
    }, 1000);
    return () => window.clearInterval(t);
  }, [dangLam?.id, ketQua]); // eslint-disable-line react-hooks/exhaustive-deps

  function batDauLam(de: DeHS) {
    setDangLam(de);
    setAnswers({});
    setKetQua(null);
    setLoi('');
    setGiayConLai(de.thoi_gian_phut * 60);
    batDauRef.current = Date.now();
  }

  async function nopBai() {
    if (!dangLam || busy) return;
    setBusy(true);
    setLoi('');
    try {
      // Tính toán, làm tròn hoặc giới hạn giá trị theo công thức
      const thoiGianGiay = Math.round((Date.now() - batDauRef.current) / 1000);
      const res = await fetch('/api/de-kiem-tra', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          deId: dangLam.id,
          answers,
          thoiGianGiay,
        }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json?.error || 'Không nộp được bài.');
      setKetQua(json);
      void tai();
    } catch (e: any) {
      setLoi(e?.message || 'Lỗi khi nộp bài.');
    } finally {
      setBusy(false);
    }
  }

  if (loading) return <div className="card"><p>Đang tải đề làm thử trước kiểm tra…</p></div>;

  if (dangLam && ketQua) {
    return (
      <div className="card">
        <h2>🏁 Kết quả làm thử: {dangLam.tieu_de}</h2>
        <p style={{ fontSize: 22, fontWeight: 800, color: ketQua.diem >= 5 ? 'var(--ok)' : 'var(--warn)' }}>
          {ketQua.diem.toFixed(1)} điểm · Đúng {ketQua.soDung}/{ketQua.tongCau} câu
        </p>
        <p className="hint">
          Các câu làm sai (nếu có mã lỗi) đã được tự động ghi vào <a href="/so-loi">Sổ lỗi</a> để em ôn trước khi kiểm tra thật trên lớp.
        </p>

        <ol style={{ paddingLeft: 20, display: 'grid', gap: 12 }}>
          {dangLam.cau_hoi.map((q, idx) => {
            const ct = ketQua.chiTiet.find((x) => x.question_id === q.question_id);
            const dung = ct?.is_correct;
            const chonNhan = q.options.find((o) => o.option_key === ct?.chosen_option)?.nhan ?? 'Chưa chọn';
            const dungNhan = q.options.find((o) => o.option_key === ct?.correct_option)?.nhan ?? ct?.correct_option;
            return (
              <li key={q.question_id} style={{ padding: 12, borderRadius: 10, border: `1px solid ${dung ? '#86efac' : '#fca5a5'}`, background: dung ? '#f0fdf4' : '#fef2f2' }}>
                <div style={{ fontWeight: 700, marginBottom: 4 }}>
                  {dung ? '✓' : '✗'} Câu {idx + 1} ({q.ku_id})
                </div>
                <MathText>{q.stem}</MathText>
                {!dung && (
                  <div style={{ marginTop: 6, fontSize: 14 }}>
                    Em chọn: <b>{chonNhan}</b> · Đáp án đúng: <b style={{ color: '#15803d' }}>{dungNhan}</b>
                    {ct?.moTaLoi && <div style={{ color: '#b45309', marginTop: 4 }}>💡 Chú ý lỗi: {ct.moTaLoi}</div>}
                  </div>
                )}
              </li>
            );
          })}
        </ol>

        <p style={{ marginTop: 14, display: 'flex', gap: 10 }}>
          <button type="button" className="primary" onClick={() => setDangLam(null)}>
            ← Về danh sách đề
          </button>
          <a className="action-link" href="/so-loi">Mở Sổ lỗi để ôn ngay</a>
        </p>
      </div>
    );
  }

  if (dangLam) {
    // Tính toán, làm tròn hoặc giới hạn giá trị theo công thức
    const mm = Math.floor(giayConLai / 60);
    const ss = String(giayConLai % 60).padStart(2, '0');
    const daChon = Object.keys(answers).length;
    return (
      <div className="card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 10, paddingBottom: 12, borderBottom: '1px solid var(--line)', marginBottom: 16 }}>
          <div>
            <h2 style={{ margin: 0 }}>{dangLam.tieu_de}</h2>
            <small className="hint">Đã chọn {daChon}/{dangLam.cau_hoi.length} câu</small>
          </div>
          <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
            <span style={{ fontWeight: 800, fontSize: 18, color: giayConLai < 180 ? '#c0312b' : 'var(--navy-d)' }}>
              ⏱ {mm}:{ss}
            </span>
            <button type="button" className="primary" disabled={busy} onClick={nopBai}>
              {busy ? 'Đang chấm…' : 'Nộp bài'}
            </button>
            <button type="button" onClick={() => setDangLam(null)}>Thoát</button>
          </div>
        </div>

        <ol style={{ paddingLeft: 20, display: 'grid', gap: 18 }}>
          {dangLam.cau_hoi.map((q, idx) => (
            <li key={q.question_id}>
              <div style={{ fontWeight: 600, marginBottom: 6 }}>
                Câu {idx + 1}: <MathText>{q.stem}</MathText>
              </div>
              <QuestionFigure hinh={q.hinh} />
              <div style={{ display: 'grid', gap: 8, marginTop: 8 }}>
                {q.options.map((o) => {
                  const picked = answers[q.question_id] === o.option_key;
                  return (
                    <label
                      key={o.option_key}
                      className={'opt touch-opt' + (picked ? ' picked' : '')}
                      style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 10 }}
                    >
                      <input
                        type="radio"
                        name={q.question_id}
                        checked={picked}
                        onChange={() => setAnswers((a) => ({ ...a, [q.question_id]: o.option_key }))}
                      />
                      <b>{o.nhan}.</b>
                      <MathText>{o.option_text}</MathText>
                    </label>
                  );
                })}
              </div>
            </li>
          ))}
        </ol>

        {loi && <p role="alert" style={{ color: '#c0312b', marginTop: 12 }}>{loi}</p>}
        <p style={{ marginTop: 16 }}>
          <button type="button" className="primary" disabled={busy} onClick={nopBai}>
            {busy ? 'Đang chấm…' : '✅ Nộp bài & xem kết quả ngay'}
          </button>
        </p>
      </div>
    );
  }

  return (
    <>
      {/* Khối giao diện: Khối nội dung chính */}
      <section className="card">
        <h2>⏱️ Đề làm thử trước kiểm tra của lớp em</h2>
        {loi && <p role="alert">{loi}</p>}
        {deList.length === 0 ? (
          <p className="hint">Hiện thầy cô chưa mở đề làm thử nào cho lớp em.</p>
        ) : (
          <ul style={{ listStyle: 'none', padding: 0, display: 'grid', gap: 10 }}>
            {deList.map((d) => (
              <li key={d.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12, padding: 12, borderRadius: 10, border: '1px solid var(--line)', flexWrap: 'wrap' }}>
                <div>
                  <b>{d.tieu_de}</b>
                  <div className="hint">{d.chuong} · {d.cau_hoi.length} câu · {d.thoi_gian_phut} phút</div>
                </div>
                <button type="button" className="primary" onClick={() => batDauLam(d)}>
                  ▶ Làm thử {d.thoi_gian_phut} phút
                </button>
              </li>
            ))}
          </ul>
        )}
      </section>

      {lichSu.length > 0 && (
        <section className="card">
          <h2>🕘 Lịch sử làm thử</h2>
          <ul style={{ listStyle: 'none', padding: 0, display: 'grid', gap: 6 }}>
            {lichSu.map((h) => (
              <li key={h.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: '1px solid var(--line)' }}>
                <span>{new Date(h.nop_luc).toLocaleString('vi-VN')}</span>
                <b>{Number(h.diem).toFixed(1)} điểm ({h.so_dung}/{h.tong_cau} câu)</b>
              </li>
            ))}
          </ul>
        </section>
      )}
    </>
  );
}
