'use client';

/**
 * FILE NÀY LÀM GÌ: Component React giao diện hiển thị và xử lý tương tác của người dùng trên trình duyệt.
 * AI DÙNG: học sinh
 * LẤY DỮ LIỆU TỪ: không truy vấn bảng trực tiếp
 * GỌI TỚI: ./GameMission, ./MathText, ./useGameAudio
 */
import { useState, useEffect } from 'react';
import GameMission, { useGameMission } from './GameMission';
import MathText from './MathText';
import { useGameAudio } from './useGameAudio';

interface RoundingChallenge {
  prompt: string;
  detail: string;
  options: string[];
  correct: number;
  explanation: string;
}

const ROUNDING_ITEMS: RoundingChallenge[] = [
  {
    prompt: 'Làm tròn số 3,14159 với độ chính xác d = 0,05.',
    detail: 'Độ chính xác d = 0,05 ở hàng phần trăm',
    options: ['3,14', '3,1', '3,2'],
    correct: 1,
    explanation: 'Quy tắc: Độ chính xác d = 0,05 ở hàng phần trăm thì ta làm tròn đến hàng liền trước nó là hàng PHẦN MƯỜI. Chữ số ngay sau hàng phần mười là 4 (< 5), nên giữ nguyên 3,1.'
  },
  {
    prompt: 'Làm tròn số 8,637 với độ chính xác d = 0,005.',
    detail: 'Độ chính xác d = 0,005 ở hàng phần nghìn',
    options: ['8,63', '8,64', '8,6'],
    correct: 1,
    explanation: 'd = 0,005 ở hàng phần nghìn nên làm tròn đến hàng PHẦN TRĂM. Chữ số ngay sau hàng phần trăm là 7 (≥ 5), ta cộng 1 vào chữ số 3 thành 8,64.'
  },
  {
    prompt: 'Làm tròn số 4725 với độ chính xác d = 50.',
    detail: 'Độ chính xác d = 50 ở hàng chục',
    options: ['4720', '4730', '4700'],
    correct: 2,
    explanation: 'd = 50 ở hàng chục nên làm tròn đến HÀNG TRĂM. Chữ số hàng chục là 2 (< 5), ta giữ nguyên chữ số hàng trăm là 7 và thay các chữ số sau bằng 0 thành 4700.'
  },
  {
    prompt: 'Làm tròn số âm −2,15 đến hàng phần mười.',
    detail: 'Chú ý dấu âm của số',
    options: ['−2,1', '−2,2', '−2,0'],
    correct: 1,
    explanation: 'Quy tắc làm tròn số âm: xét giá trị tuyệt đối 2,15. Chữ số sau hàng phần mười là 5 (≥ 5) nên làm tròn thành 2,2. Đặt dấu trừ phía trước kết quả thu được: −2,2.'
  },
  {
    prompt: 'Làm tròn số 4,46 đến hàng đơn vị.',
    detail: 'Làm tròn thẳng một bước, không làm tròn trung gian',
    options: ['5', '4', '4,5'],
    correct: 1,
    explanation: 'Nhìn thẳng vào chữ số ngay sau hàng đơn vị là 4 (< 5) nên giữ nguyên hàng đơn vị là 4. Tuyệt đối không làm tròn hai bước 4,46 → 4,5 → 5 vì sẽ gây tích luỹ sai số!'
  }
];

/**
 * Component React `RoundingDartGame`: nhận props (thuộc tính truyền vào từ component cha) và dựng giao diện tương ứng.
 */
export default function RoundingDartGame() {
  const mission = useGameMission();
  const audio = useGameAudio();

  const [index, setIndex] = useState(0);
  const [picked, setPicked] = useState<number | null>(null);
  const [sound, setSound] = useState(true);
  const [correctCount, setCorrectCount] = useState(0);

  const finished = index >= ROUNDING_ITEMS.length;
  // Tính toán, làm tròn hoặc giới hạn giá trị theo công thức
  const current = ROUNDING_ITEMS[Math.min(index, ROUNDING_ITEMS.length - 1)];
  const isCorrect = picked !== null && picked === current.correct;

  function reset() {
    setIndex(0);
    setPicked(null);
    setCorrectCount(0);
    audio.begin();
  }

  function advance() {
    if (index < ROUNDING_ITEMS.length) {
      setIndex((i) => i + 1);
      setPicked(null);
    }
  }

  function choose(i: number) {
    if (picked !== null) return;
    setPicked(i);
    const ok = i === current.correct;
    if (sound) audio.effect(ok);
    if (ok) setCorrectCount((c) => c + 1);
  }

  useEffect(() => {
    if (!mission.autoRun || !isCorrect || finished) return;
    const timer = setTimeout(advance, 1800);
    return () => clearTimeout(timer);
  }, [mission.autoRun, isCorrect, finished, index]);

  return (
    <GameMission
      mission={mission}
      title="🎯 Phi tiêu làm tròn số thập phân"
      icon="🎯"
      intro="Luyện tập làm tròn số thập phân căn cứ vào độ chính xác cho trước. Nắm vững quy tắc làm tròn số âm và tránh sai sót nhiều bước."
      step={`Mục tiêu ${Math.min(index + 1, ROUNDING_ITEMS.length)}/${ROUNDING_ITEMS.length}`}
      finished={finished}
      ready={isCorrect}
      onStart={reset}
      onAdvance={advance}
    >
      {/* Khối giao diện: Khối nội dung chính */}
      <section className="foundation-game" aria-labelledby="rounding-game-title">
        <div className="game-heading">
          <div>
            <span className="game-eyebrow">KHỞI ĐỘNG · BÀI 5 MỤC 2</span>
            <h2 id="rounding-game-title">🎯 Phi tiêu làm tròn</h2>
            <p>Xác định đúng hàng làm tròn theo độ chính xác d và thực hiện làm tròn chuẩn xác.</p>
          </div>
          <button type="button" aria-pressed={sound} onClick={() => setSound((s) => !s)}>
            {sound ? '🔊 Âm thanh bật' : '🔇 Âm thanh tắt'}
          </button>
        </div>

        {finished ? (
          <div className="game-check" role="status">
            <h3>🎉 Bắn trúng hồng tâm! Em đã hoàn thành bài luyện tập làm tròn!</h3>
            <p>
              Trả lời đúng <strong>{correctCount}/{ROUNDING_ITEMS.length}</strong> câu. Em đã hoàn toàn tự tin khi làm tròn với bất kì độ chính xác nào!
            </p>
            <button type="button" onClick={reset}>Chơi lại</button>
          </div>
        ) : (
          <>
            <div className="game-controls">
              <strong>⭐ Câu hỏi {index + 1}/{ROUNDING_ITEMS.length}</strong>
              <span>Đã làm đúng: {correctCount}</span>
              <button type="button" onClick={reset}>Chơi lại từ đầu</button>
            </div>

            <div className="game-help power-question" style={{ padding: '16px 8px' }}>
              <div style={{ fontSize: '0.9rem', color: 'var(--muted)', marginBottom: 4 }}>
                {current.detail}
              </div>
              <p style={{ fontSize: '1.2rem', fontWeight: 600, margin: '4px 0' }}>
                <MathText>{current.prompt}</MathText>
              </p>
            </div>

            <div className="fraction-signs power-targets">
              {current.options.map((opt, i) => {
                const isSelected = picked === i;
                const isItemCorrect = i === current.correct;
                return (
                  <button
                    key={`${index}-${i}`}
                    type="button"
                    className={`game-tile tile-${i} ${picked !== null && isItemCorrect ? 'paired' : ''} ${isSelected && !isItemCorrect ? 'target-shot' : ''}`}
                    disabled={picked !== null}
                    onClick={() => choose(i)}
                    style={{ minWidth: 110 }}
                  >
                    <MathText>{opt.startsWith('$') ? opt : `$${opt}$`}</MathText>
                    {isSelected && <span className="target-arrow" aria-hidden="true">➶</span>}
                  </button>
                );
              })}
            </div>

            {picked !== null && (
              <div className="game-feedback" role="status">
                <strong>{isCorrect ? '✓ Bắn trúng!' : 'Chệch mục tiêu rồi — cùng xem hướng dẫn:'}</strong>
                <p>
                  <MathText>{current.explanation}</MathText>
                </p>
                {isCorrect ? (
                  <p>{mission.autoRun ? 'Tự chuyển sau 2 giây…' : 'Bấm Tiếp theo khi đã sẵn sàng.'}</p>
                ) : (
                  <button type="button" onClick={() => setPicked(null)}>Thử lại câu này</button>
                )}
              </div>
            )}
          </>
        )}
        <p className="hint">Chỉ ôn kiến thức trước giờ học. Kết quả trò chơi không ảnh hưởng điểm kiểm tra chính thức.</p>
      </section>
    </GameMission>
  );
}
