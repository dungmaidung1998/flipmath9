'use client';
/**
 * FILE NÀY LÀM GÌ: Component React giao diện hiển thị và xử lý tương tác của người dùng trên trình duyệt.
 * AI DÙNG: học sinh
 * LẤY DỮ LIỆU TỪ: không truy vấn bảng trực tiếp
 * GỌI TỚI: ./DuongCauHoi, ./DeCauHoi, ./DauCauHoi, @/components/NhanVat, @/components/tro-choi-nen/amThanh, @/components/truc-quan/NutAmHieuUng, @/components/truc-quan/PhanHoiDung, @/components/truc-quan/HuyHieuMoi
 */
import DuongCauHoi from './DuongCauHoi';
import DeCauHoi from './DeCauHoi';
import DauCauHoi from './DauCauHoi';
import NhanVat from '@/components/NhanVat';
import { phat, chuanBiAmHieuUng } from '@/components/tro-choi-nen/amThanh';
import NutAmHieuUng from '@/components/truc-quan/NutAmHieuUng';
import { TichVang } from '@/components/truc-quan/PhanHoiDung';
import HuyHieuMoi from '@/components/truc-quan/HuyHieuMoi';

import { useContext, useEffect, useMemo, useRef, useState } from 'react';
import GoiY from './GoiY';
import LearningScreen, {LearningBack} from './LearningScreen';
import {supabaseBrowser} from '@/lib/supabase/client';
import MathText from './MathText';
import NutDoc from './NutDoc';
import QuestionFigure from './QuestionFigure';
import AnhMinhHoa from '@/components/AnhMinhHoa';
import NutHanhTrinh from '@/components/HanhTrinh/NutHanhTrinh';
import { nhanCua } from '@/lib/tronPhuongAn';
import AdaptiveOptions from './AdaptiveOptions';
import { useActiveQuizTime } from './useActiveQuizTime';
import { hinhNhanVat } from '../lib/minhHoa';
import { tenCapDo } from '../lib/capDo';
import LinhVatDaNang from '@/components/LinhVatDaNang';
import { noi, chonGiong } from '../lib/giongDoc';
import { docDuoc } from './tieng-anh/ToanTiengAnh';
import { chuDeChuong } from '@/lib/chuDeChuong';
import AnhChuDe from '@/components/AnhChuDe';
import BayDonVi from '@/components/BayDonVi';
import PhaoGiayChuong from '@/components/PhaoGiayChuong';
import { luuBaiOffline, taoMaLuotLam } from '@/lib/offlineQueue';

type Q = {
  question_id: string;
  stem: string;
  level: number;
  expected_time_sec: number;
  hinh?: unknown;
  /** Câu được chọn vì nhắm vào lỗi em từng mắc (bài vận dụng). */
  onLoi?: boolean;
  /** Đề tiếng Anh (dòng phụ khi bật Song ngữ). */
  en?: string;
  options: { option_key: string; option_text: string; nhan?: string; en?: string }[];
};

type Result = {
  supportAvailable?: boolean;
  recoverySaved?: boolean;
  thuong?: { huyHieuMoi?: string[] } | null;
  score: number;
  attemptNo: number;
  mastery: number | null;
  masteryStatus: string;
  correctCount: number;
  total: number;
  perQuestion: { questionId: string; isCorrect: boolean }[];
  recommendation: {
    triggerRule: string | null;
    diagnosis: string;
    action: string;
    content: { title: string; minutes: number } | null;
    contentId: string | null;
    allTriggered: string[];
  };
  videoCompletionRate: number | null;
};

/**
 * Component React `Quiz`: nhận props (thuộc tính truyền vào từ component cha) và dựng giao diện tương ứng.
 */
export default function Quiz({
  kuId,
  questions,
  mode = 'chuan-bi',
  heading,
  note,
  giamTai = false
}: {
  kuId: string;
  questions: Q[];
  mode?: 'chuan-bi' | 'van-dung';
  heading?: string;
  note?: string;
  giamTai?: boolean;
}) {
  const previousActivity=useContext(LearningBack);
  const [cursor,setCursor]=useState(0);
  const cursorRef=useRef(0);cursorRef.current=cursor;
  const [ready,setReady]=useState(false);
  const [reviewResult,setReviewResult]=useState(false);
  const [picked, setPicked] = useState<Record<string, string>>({});
  // Song ngữ (đề xuất §5): tiếng Việt luôn là bản chính; bật thì hiện thêm dòng tiếng Anh. Nhớ lựa chọn trên máy này.
  const coTiengAnh = questions.some((x) => x.en);
  const [songNgu, setSongNgu] = useState(false);
  useEffect(() => { try { setSongNgu(localStorage.getItem('fm9-song-ngu') === '1'); } catch { /* chế độ riêng tư */ } }, []);
  const doiSongNgu = () => setSongNgu((v) => { try { localStorage.setItem('fm9-song-ngu', v ? '0' : '1'); } catch { /* bỏ qua */ } return !v; });
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState<Result | null>(null);
  const [bayKey, setBayKey] = useState(0);
  const [locked, setLocked] = useState<string | null>(null);
  const [err, setErr] = useState('');
  const [queuedOffline, setQueuedOffline] = useState(false);
  const clientSubmissionIdRef = useRef<string>('');
  const activeTime = useActiveQuizTime();
  const firstTouch = useRef<Record<string, number>>({});

  const draftKey = useRef<string | null>(null);
  const pickedRef = useRef(picked);
  pickedRef.current = picked;
  const [draftNotice, setDraftNotice] = useState('');
  const fingerprint = JSON.stringify(questions.map(q => [q.question_id,q.stem,q.options]));
  useEffect(() => {
    if (!clientSubmissionIdRef.current) clientSubmissionIdRef.current = taoMaLuotLam();
    let cancelled = false;
    const save = () => {
      if (!draftKey.current) return;
      try { sessionStorage.setItem(draftKey.current, JSON.stringify({fingerprint, cursor:cursorRef.current, picked:pickedRef.current, seconds:activeTime.current, firstTouch:firstTouch.current})); }
      catch { setDraftNotice('Không lưu được bản nháp trên trình duyệt này.'); }
    };
    // Kiểm tra xác thực tài khoản, vai trò giáo viên hoặc điều kiện đồng ý
    void supabaseBrowser().auth.getUser().then(({data}) => {
      if(cancelled || !data.user)return;
      const key = `quiz-draft:${data.user.id}:${kuId}:${mode}`;
      draftKey.current = key;
      try {
        const draft=JSON.parse(sessionStorage.getItem(key) ?? 'null');
        if(draft?.fingerprint === fingerprint && draft.picked && typeof draft.picked==='object'){
          const valid:Record<string,string>={};
          questions.forEach(q=>{if(q.options.some(o=>o.option_key===draft.picked[q.question_id]))valid[q.question_id]=draft.picked[q.question_id];});
          // Tính toán, làm tròn hoặc giới hạn giá trị theo công thức
          if(Number.isInteger(draft.cursor))setCursor(Math.max(0,Math.min(questions.length,draft.cursor)));
          setPicked(valid);pickedRef.current=valid;
          if(Number.isFinite(draft.seconds)&&draft.seconds>=0)activeTime.current+=draft.seconds;
          if(draft.firstTouch && typeof draft.firstTouch==='object')firstTouch.current=draft.firstTouch;
          setDraftNotice('Đã khôi phục bài đang làm trong tab này.');
        }
      }catch { setDraftNotice('Bản nháp cũ không đọc được. Em có thể tiếp tục làm bài.'); }
    }).catch(()=>setDraftNotice('Chưa lưu được bản nháp.')).finally(()=>{if(!cancelled)setReady(true);});
    const timer=setInterval(save,1000);
    window.addEventListener('pagehide',save);
    return ()=>{cancelled=true;save();clearInterval(timer);window.removeEventListener('pagehide',save);draftKey.current=null;};
  },[kuId,mode,fingerprint]);

  const done = useMemo(() => questions.every((q) => picked[q.question_id]), [picked, questions]);

  function goToMissing() { const index=questions.findIndex(q=>!picked[q.question_id]);if(index>=0)setCursor(index); }
  useEffect(()=>{
    if(!ready||!draftKey.current)return;
    try{sessionStorage.setItem(draftKey.current,JSON.stringify({fingerprint,cursor,picked,seconds:activeTime.current,firstTouch:firstTouch.current}));setDraftNotice('Đã lưu bản nháp trong tab này · Chưa nộp bài.');}
    catch{setDraftNotice('Chưa lưu được bản nháp trên thiết bị.');}
  },[cursor,picked,ready,fingerprint]);
  function back(){if(cursor>0)setCursor(cursor-1);else if(previousActivity)previousActivity();else window.location.assign('/bai-hoc');}

  async function submit() {
    if (!done || busy) return;
    setBusy(true);
    setErr('');
    const subId = clientSubmissionIdRef.current || taoMaLuotLam();
    clientSubmissionIdRef.current = subId;
    const payloadAnswers = questions.map((q) => ({
      questionId: q.question_id,
      option: picked[q.question_id] ?? null,
      answerTimeSec: firstTouch.current[q.question_id]
        ? Math.round(firstTouch.current[q.question_id])
        : null
    }));
    const payloadBody = {
      clientSubmissionId: subId,
      kuId,
      mode,
      giamTai,
      timeOnTaskSec: Math.round(activeTime.current),
      answers: payloadAnswers
    };

    try {
      chuanBiAmHieuUng();
      if (typeof navigator !== 'undefined' && !navigator.onLine) {
        const saved = await luuBaiOffline({ ...payloadBody, createdAt: Date.now() });
        setBusy(false);
        if (saved) {
          setQueuedOffline(true);
          if (draftKey.current) { try { sessionStorage.removeItem(draftKey.current); } catch {} draftKey.current = null; }
          window.dispatchEvent(new Event('f9-offline-queued'));
          return;
        }
      }
      const res = await fetch('/api/quiz/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payloadBody)
      });
      setBusy(false);

      if (res.status === 423) {
        const d = await res.json();
        setLocked(d.message);
        return;
      }
      if (!res.ok) {
        setErr(
          res.status === 401 || res.status === 403
            ? 'Phiên đăng nhập chưa hợp lệ. Em đăng nhập lại bằng tài khoản học sinh.'
            : res.status === 400
            ? 'Chưa nộp được bài. Em kiểm tra lại các câu trả lời; nếu đề đã thay đổi, hãy mở lại bài.'
            : 'Chưa gửi được bài. Các lựa chọn vẫn được giữ lại; em thử nộp lại sau ít phút.'
        );
        return;
      }
      const daCham: Result = await res.json();
      if (daCham.correctCount > 0) {
        phat('dung');
        setBayKey((k) => k + 1);
      }
      for (const pq of daCham.perQuestion ?? []) {
        window.dispatchEvent(new CustomEvent('f9-qua-tai-cau', { detail: { dung: Boolean(pq.isCorrect) } }));
      }
      setResult(daCham);
      if (mode === 'van-dung') window.dispatchEvent(new Event('f9-nop-bai-xong'));
      if (mode !== 'van-dung') window.dispatchEvent(new CustomEvent('f9-buoc-xong', { detail: 'quiz' }));
      if(draftKey.current){try{sessionStorage.removeItem(draftKey.current);}catch{}draftKey.current=null;}
    } catch {
      const saved = await luuBaiOffline({ ...payloadBody, createdAt: Date.now() });
      if (saved) {
        setQueuedOffline(true);
        if (draftKey.current) { try { sessionStorage.removeItem(draftKey.current); } catch {} draftKey.current = null; }
        window.dispatchEvent(new Event('f9-offline-queued'));
      } else {
        setErr('Mất kết nối khi gửi bài. Các đáp án đã chọn vẫn được giữ lại; em thử nộp lại.');
      }
    } finally {
      setBusy(false);
    }
  }

  const cd = chuDeChuong(kuId);

  if (queuedOffline) {
    return (
      <div className="card" style={{ borderLeft: '5px solid #d97706' }}>
        <h2>📡 Đã lưu bài làm trên máy (đang mất mạng)</h2>
        <p style={{ fontSize: 16, lineHeight: 1.6 }}>
          Bài làm của em đã được lưu an toàn vào bộ nhớ trình duyệt (kèm mã lượt làm chống gửi trùng) và sẽ <strong>tự động gửi</strong> lên hệ thống ngay khi máy có mạng trở lại.
        </p>
        <p className="action-row">
          <a className="action-link" href="/bai-hoc">← Quay lại danh sách bài học</a>
        </p>
      </div>
    );
  }

  if (locked) {
    return (
      <div className="card" style={{ borderLeft: '5px solid var(--accent)' }}>
        <h2>⏳ Tạm dừng để ôn tập</h2>
        <p style={{ fontSize: 16, lineHeight: 1.6 }}>{locked}</p>
        <p className="hint" style={{ marginTop: 12 }}>
          💡 <strong>Lời khuyên từ thầy cô:</strong> Bài làm vừa rồi được ghi nhận diễn ra rất nhanh so với thời gian cần thiết. Em hãy dành 15–20 phút xem kỹ lại video bài học và làm phiếu học tập, sau đó quay lại thử thách nhé!
        </p>
      </div>
    );
  }

  if (result) {
    // Tính toán, làm tròn hoặc giới hạn giá trị theo công thức
    const q = questions[Math.min(cursor, questions.length - 1)];
    const correct = result.perQuestion.find((p) => p.questionId === q?.question_id)?.isCorrect;
    const scoreVal = result.score;
    const isMaster = scoreVal >= 8;
    const isPass = scoreVal >= 5;
    // Tính toán, làm tròn hoặc giới hạn giá trị theo công thức
    const muc5Kq = Math.min(4, Math.max(0, Math.round((result.correctCount / Math.max(1, result.total)) * 4)));

    return (
      <LearningScreen
        title={heading ?? 'Kết quả bài kiểm tra'}
        chuong={kuId}
        step={reviewResult ? `Xem lại câu ${cursor + 1}/${questions.length}` : 'Đánh giá mức hiểu bài'}
        onBack={() => {
          if (reviewResult && cursor > 0) setCursor(cursor - 1);
          else if (reviewResult) setReviewResult(false);
          else { setCursor(0); setReviewResult(true); }
        }}
        onNext={() => {
          if (reviewResult && cursor < questions.length - 1) setCursor(cursor + 1);
          else if (reviewResult) setReviewResult(false);
          else window.location.assign(result.supportAvailable ? '/ho-tro' : `/hoc/${encodeURIComponent(kuId)}/lo-trinh`);
        }}
        nextLabel={reviewResult ? (cursor < questions.length - 1 ? 'Câu tiếp theo →' : 'Trở về tổng quan') : 'Tiếp tục lộ trình →'}
        status="Bài đã nộp thành công và kết quả đã được ghi nhận vào hồ sơ học tập."
      >
        <DuongCauHoi
          cau={questions}
          hienTai={reviewResult ? cursor : questions.length}
          daLam={(id) => !!result.perQuestion.find((p) => p.questionId === id)?.isCorrect}
          denCau={(idx) => { setCursor(idx); setReviewResult(true); }}
          chuong={kuId}
          soDung={result.correctCount}
        />
        {reviewResult && q ? (
          <div>
            <div className="quiz-review-navigator" role="tablist" aria-label="Danh sách câu hỏi">
              {questions.map((item, idx) => {
                const itemCorrect = result.perQuestion.find((p) => p.questionId === item.question_id)?.isCorrect;
                const isActive = cursor === idx;
                return (
                  <button
                    key={item.question_id}
                    type="button"
                    className={`quiz-review-pill ${isActive ? 'active' : ''} ${itemCorrect ? 'correct' : 'incorrect'}`}
                    onClick={() => setCursor(idx)}
                  >
                    Câu {idx + 1} {itemCorrect ? '✓' : '○'}
                  </button>
                );
              })}
            </div>

            <div className="card" style={{ marginBottom: 16 }}>
              <p className="quiz-stem">
                <DauCauHoi ma={q.question_id} chuong={kuId} viTri={cursor + 1} tong={questions.length} soDaLam={result.total} daChon={true} soDung={result.correctCount} />
                <MathText>{q.stem}</MathText>
              </p>
              <QuestionFigure hinh={q.hinh} /><AnhMinhHoa id={q.question_id} />
              <NutHanhTrinh id={q.question_id} />

              <div className={`quiz-status-banner ${correct ? 'correct' : 'incorrect'}`}>
                <span>{correct ? <><TichVang/> Em đã làm đúng câu này!</> : '○ Phương án chưa chính xác'}</span>
                {correct && <BayDonVi chuong={kuId} so={1} triggerKey={`${q.question_id}-ok`} />}
              </div>

              <div style={{ margin: '14px 0', fontSize: 15 }}>
                <span style={{ color: 'var(--muted)', fontWeight: 600 }}>Phương án em chọn: </span>
                <strong style={{ color: correct ? 'var(--ok)' : 'var(--warn)' }}>
                  <MathText>{q.options.find((o) => o.option_key === picked[q.question_id])?.option_text ?? 'Chưa chọn'}</MathText>
                </strong>
              </div>

              {!correct && (
                <div style={{ marginTop: 20, paddingTop: 16, borderTop: '1px solid var(--line)' }}>
                  <p style={{ fontWeight: 700, color: 'var(--navy-d)', marginBottom: 6 }}>
                    💡 Trợ giảng AI đồng hành cùng em:
                  </p>
                  <p className="hint" style={{ marginTop: 0 }}>
                    Hệ thống đã chuẩn bị gợi ý phân tầng để em tự tìm ra đáp án đúng mà không cần xem lời giải sẵn:
                  </p>
                  <NhanVat loi="sai" chuong={kuId} compact />
                  <GoiY questionId={q.question_id} />
                </div>
              )}
            </div>

            <div style={{ marginTop: 12 }}>
              <button type="button" onClick={() => setReviewResult(false)}>
                ← Quay lại tổng quan kết quả
              </button>
            </div>
          </div>
        ) : (
          <div className="quiz-result-view kq-gon">
            <span className="cau-huy-hieu">🏅 Đã nộp bài</span>
            {result.correctCount > 0 && (
              <div style={{ marginTop: 8 }}>
                <BayDonVi chuong={kuId} so={result.correctCount} triggerKey={bayKey} />
              </div>
            )}
            <HuyHieuMoi codes={result.thuong?.huyHieuMoi}/>
            {((result.mastery != null && result.mastery >= 2) || (result.thuong?.huyHieuMoi?.length ?? 0) > 0) && (
              <div className="kq-len-cap">
                <LinhVatDaNang
                  loai="ca-chep"
                  tuThe={result.mastery != null && result.mastery >= 3 ? 'hoa-rong' : 'nhay'}
                  kichThuoc={68}
                  chuyenDong
                />
                <span>
                  {result.mastery != null && result.mastery >= 2
                    ? `Cá chép vượt vũ môn · ${tenCapDo(result.mastery)}`
                    : 'Cá chép vượt vũ môn nhận huy hiệu mới!'}
                </span>
              </div>
            )}
            {/* Tối giản 22/11/2026: một con số (số câu đúng), một lời nhắn, một gợi ý, hai nút. */}
            <div className="kq-gon__dau">
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12 }}>
                {cd && (
                  <AnhChuDe
                    className="kq-gon__hinh"
                    src={cd.anhMuc(muc5Kq)}
                    fallback={hinhNhanVat(isPass ? 'reo-ho' : 'suy-nghi')}
                    alt={cd.mucTen[muc5Kq]}
                    width={96}
                    height={96}
                    loading="lazy"
                  />
                )}
                {cd ? (
                  <AnhChuDe
                    className="kq-gon__hinh"
                    src={isPass ? cd.nvBin : cd.nvNa}
                    fallback={hinhNhanVat(isPass ? 'reo-ho' : 'suy-nghi')}
                    alt=""
                    width={96}
                    height={144}
                    loading="lazy"
                  />
                ) : (
                  <img className="kq-gon__hinh" src={hinhNhanVat(isPass ? 'reo-ho' : 'suy-nghi')} alt="" width={96} height={144} loading="lazy" />
                )}
              </div>
              <p className="kq-gon__so"><b>{result.correctCount}</b>/{result.total}</p>
              <p className="kq-gon__nhan">câu đúng{cd ? ` · ${result.correctCount} ${cd.donVi}` : ''}</p>
              <h3 className="kq-gon__loi">{isMaster ? '🎉 Xuất sắc!' : isPass ? '👍 Làm tốt lắm!' : '💪 Cùng ôn lại nhé!'}</h3>
            </div>

            {cd && isPass && kuId.includes('-OTC') && (
              <div className="kq-thuong-otc">
                <PhaoGiayChuong mau={cd.mau} active />
                <AnhChuDe src={cd.thuongAnh} fallback={cd.anhMuc(4)} width={112} height={112} alt={cd.thuong} loading="lazy" />
                <p>🏆 Hoàn thành Ôn tập cuối chương! Phần thưởng: {cd.thuong}</p>
              </div>
            )}

            {(result.recommendation.action || result.recommendation.content) && (
              <div className="kq-gon__goi-y">
                {result.recommendation.action && <p>{result.recommendation.action}</p>}
                {result.recommendation.content && (
                  <p className="hint">📖 {result.recommendation.content.title} · {result.recommendation.content.minutes} phút</p>
                )}
              </div>
            )}

            {result.recoverySaved === false && (
              <p role="status" className="hint" style={{ color: 'var(--warn)' }}>
                Điểm đã lưu; hồ sơ hỗ trợ chưa cập nhật được. Em không cần nộp lại.
              </p>
            )}

            <div className="kq-gon__nut">
              <button
                type="button"
                className="primary"
                onClick={() => window.location.assign(result.supportAvailable ? '/ho-tro' : `/hoc/${encodeURIComponent(kuId)}/lo-trinh`)}
              >
                Tiếp tục →
              </button>
              <button type="button" className="action-link" onClick={() => { setCursor(0); setReviewResult(true); }}>
                Xem lại từng câu
              </button>
            </div>
          </div>
        )}
      </LearningScreen>
    );
  }

  if (!questions.length) return <p>Chưa có câu hỏi cho bài này.</p>;
  const q = questions[cursor];
  const review = cursor === questions.length;

  return (
    <LearningScreen
      title={heading ?? 'Bài kiểm tra ngắn'}
      chuong={kuId}
      step={review ? 'Rà soát trước khi nộp bài' : 'Làm bài'}
      onBack={back}
      onNext={() => (review ? void submit() : setCursor(cursor + 1))}
      nextLabel={review ? 'Nộp bài' : 'Tiếp theo →'}
      busy={busy}
      disabled={!ready || (review && !done)}
      status={!ready ? 'Đang khôi phục bài làm…' : review && !done ? 'Còn câu chưa trả lời. Em quay lại kiểm tra nhé.' : draftNotice}
    >
      <DuongCauHoi cau={questions} hienTai={cursor} daLam={id => !!picked[id]} denCau={setCursor} khoa={!ready || busy} chuong={kuId} />
      {review ? (
        <div>
          <div className="card" style={{ textAlign: 'center', padding: '24px' }}>
            <h3 style={{ margin: '0 0 8px', color: 'var(--navy-d)' }}>Kiểm tra trước khi nộp bài</h3>
            <p style={{ fontSize: 15, color: 'var(--muted)', margin: '0 0 16px' }}>
              Em đã trả lời <strong>{Object.keys(picked).length}/{questions.length}</strong> câu hỏi. Em có thể bấm vào từng câu dưới đây để xem lại hoặc sửa phương án trước khi bấm <strong>Nộp bài</strong>.
            </p>
            <div style={{ display: 'flex', gap: 10, justifyContent: 'center', flexWrap: 'wrap' }}>
              {questions.map((item, i) => (
                <button
                  key={item.question_id}
                  type="button"
                  className={`action-link ${picked[item.question_id] ? '' : 'warn'}`}
                  style={{ minWidth: 100 }}
                  onClick={() => setCursor(i)}
                >
                  Câu {i + 1} · {picked[item.question_id] ? 'Đã chọn' : 'Chưa làm'}
                </button>
              ))}
            </div>
            {!done && (
              <p style={{ marginTop: 20 }}>
                <button type="button" className="primary" onClick={goToMissing}>
                  Đi tới câu chưa làm ngay →
                </button>
              </p>
            )}
          </div>
        </div>
      ) : (
        <fieldset disabled={busy || !ready} style={{ border: 0, padding: 0 }}>
          <legend className="quiz-stem cau-de">
            <DauCauHoi ma={q.question_id} chuong={kuId} viTri={cursor + 1} tong={questions.length} soDaLam={Object.keys(picked).length} daChon={!!picked[q.question_id]} />
            {q.onLoi && <span className="on-loi">🎯 Câu này giúp em luyện lại chỗ em từng làm sai</span>}
            <DeCauHoi key={q.question_id} text={q.stem} />
            {songNgu && q.en && <span className="en-dong" lang="en"><MathText>{q.en}</MathText></span>}
          </legend>
          <QuestionFigure hinh={q.hinh} /><AnhMinhHoa id={q.question_id} />
          <NutHanhTrinh id={q.question_id} />
          <div className="quiz-cong-cu" role="group" aria-label="Công cụ câu hỏi">
            <NutAmHieuUng/>
            <NutDoc gon text={[q.stem, ...q.options.map((o) => `Phương án ${o.nhan ?? o.option_key}. ${o.option_text}`)].join('. ')} />
            {coTiengAnh && <button type="button" aria-pressed={songNgu} onClick={doiSongNgu} aria-label="Song ngữ" title="Song ngữ">🇬🇧</button>}
            {songNgu && q.en && <button type="button" lang="en" title="Listen in English" aria-label="Listen in English" onClick={() => noi(docDuoc([q.en!, ...q.options.map((o) => `Option ${o.nhan ?? o.option_key}. ${o.en ?? o.option_text}`)].join('. ')), chonGiong('en-US') ? 'en-US' : 'en-GB', { rate: 0.85 })}>EN ▶</button>}
          </div>
          <AdaptiveOptions>
            {q.options.map((o) => (
              <label key={o.option_key} data-viec={{ A: 'hoc', B: 'luyen', C: 'choi', D: 'kiem' }[nhanCua(q.options, o.option_key)]} className={'opt touch-opt cau-phuong-an' + (picked[q.question_id] === o.option_key ? ' picked' : '')}>
                <input
                  type="radio"
                  name={q.question_id}
                  checked={picked[q.question_id] === o.option_key}
                  onChange={() => {
                    if (!firstTouch.current[q.question_id]) firstTouch.current[q.question_id] = activeTime.current;
                    setPicked((p) => ({ ...p, [q.question_id]: o.option_key }));
                  }}
                />
                <span className="opt-key-badge" data-nhan={nhanCua(q.options, o.option_key)}>{nhanCua(q.options, o.option_key)}</span>
                <span className="answer-scroll">
                  <span className="answer-content">
                    <MathText inline>{o.option_text}</MathText>
                    {songNgu && o.en && o.en !== o.option_text && <span className="en-pa" lang="en"><MathText inline>{o.en}</MathText></span>}
                  </span>
                </span>
              </label>
            ))}
          </AdaptiveOptions>
          <p className="hint">Chọn đáp án rồi bấm Tiếp theo. Em có thể quay lại sửa trước khi nộp.</p>
        </fieldset>
      )}
      {err && <p role="alert">{err}</p>}
    </LearningScreen>
  );
}
