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

interface Challenge {
  prompt: string;
  options: string[];
  correct: number;
  explanation: string;
}

const CHALLENGES: Challenge[] = [
  {
    prompt: String.raw`Căn bậc hai số học của $16$ là $\sqrt{16} = \ ?$`,
    options: ['8', '4', '2'],
    correct: 1,
    explanation: String.raw`$\sqrt{16} = 4$ vì $4 \ge 0$ và $4^2 = 16$. Lưu ý: không lấy $16 : 2 = 8$.`
  },
  {
    prompt: String.raw`Tìm $\sqrt{49}$.`,
    options: ['7', String.raw`\pm 7`, '-7'],
    correct: 0,
    explanation: String.raw`Kí hiệu $\sqrt{49}$ luôn chỉ nhận một giá trị KHÔNG ÂM duy nhất: $\sqrt{49} = 7$.`
  },
  {
    prompt: String.raw`Tính giá trị của $\sqrt{0{,}25}$.`,
    options: ['0{,}05', '0{,}5', '0{,}125'],
    correct: 1,
    explanation: String.raw`$\sqrt{0{,}25} = 0{,}5$ vì $0{,}5^2 = 0{,}25$. Chú ý $0{,}5 > 0{,}25$.`
  },
  {
    prompt: String.raw`Tính giá trị của $\sqrt{\dfrac{4}{9}}$.`,
    options: [String.raw`\dfrac{2}{9}`, String.raw`\dfrac{4}{3}`, String.raw`\dfrac{2}{3}`],
    correct: 2,
    explanation: String.raw`$\sqrt{\dfrac{4}{9}} = \dfrac{2}{3}$ vì $\left(\dfrac{2}{3}\right)^2 = \dfrac{4}{9}$.`
  },
  {
    prompt: String.raw`Tính giá trị của biểu thức $\sqrt{9 + 16}$.`,
    options: ['7', '5', '25'],
    correct: 1,
    explanation: String.raw`Cộng trong căn trước: $9 + 16 = 25 \implies \sqrt{25} = 5$. Tuyệt đối không tách $\sqrt{9} + \sqrt{16} = 3 + 4 = 7$.`
  },
  {
    prompt: String.raw`Số nào dưới đây KHÔNG có căn bậc hai số học trong tập số thực?`,
    options: ['0', '25', '-9'],
    correct: 2,
    explanation: String.raw`Bình phương của mọi số thực đều không âm ($x^2 \ge 0$), do đó số âm $-9$ không có căn bậc hai số học.`
  }
];

/**
 * Component React `SquareRootMatchGame`: nhận props (thuộc tính truyền vào từ component cha) và dựng giao diện tương ứng.
 */
export default function SquareRootMatchGame() {
  const mission = useGameMission();
  const audio = useGameAudio();

  const [index, setIndex] = useState(0);
  const [picked, setPicked] = useState<number | null>(null);
  const [sound, setSound] = useState(true);
  const [correctCount, setCorrectCount] = useState(0);

  const finished = index >= CHALLENGES.length;
  // Tính toán, làm tròn hoặc giới hạn giá trị theo công thức
  const current = CHALLENGES[Math.min(index, CHALLENGES.length - 1)];
  const isCorrect = picked !== null && picked === current.correct;

  function reset() {
    setIndex(0);
    setPicked(null);
    setCorrectCount(0);
    audio.begin();
  }

  function advance() {
    if (index < CHALLENGES.length) {
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

  // Tự động chuyển sau 2 giây nếu trả lời đúng
  useEffect(() => {
    if (!mission.autoRun || !isCorrect || finished) return;
    const timer = setTimeout(advance, 1800);
    return () => clearTimeout(timer);
  }, [mission.autoRun, isCorrect, finished, index]);

  return (
    <GameMission
      mission={mission}
      title="🎯 Khởi động: Căn bậc hai số học"
      icon="🎯"
      intro="Bắn trúng mục tiêu mang giá trị đúng của căn bậc hai số học. Không nhầm với phép chia đôi hay tách căn qua phép cộng!"
      step={`Thử thách ${Math.min(index + 1, CHALLENGES.length)}/${CHALLENGES.length}`}
      finished={finished}
      ready={isCorrect}
      onStart={reset}
      onAdvance={advance}
    >
      {/* Khối giao diện: Khối nội dung chính */}
      <section className="foundation-game" aria-labelledby="sqrt-game-title">
        <div className="game-heading">
          <div>
            <span className="game-eyebrow">KHỞI ĐỘNG · BÀI 6 MỤC 2</span>
            <h2 id="sqrt-game-title">🎯 Căn bậc hai số học</h2>
            <p>Ôn tập mối liên hệ giữa luỹ thừa bậc hai và căn bậc hai số học. Không giới hạn thời gian.</p>
          </div>
          <button type="button" aria-pressed={sound} onClick={() => setSound((s) => !s)}>
            {sound ? '🔊 Âm thanh bật' : '🔇 Âm thanh tắt'}
          </button>
        </div>

        {finished ? (
          <div className="game-check" role="status">
            <h3>🎉 Xuất sắc! Em đã hoàn thành thử thách Căn bậc hai!</h3>
            <p>
              Trả lời đúng <strong>{correctCount}/{CHALLENGES.length}</strong> thử thách. Em đã nắm vững định nghĩa căn bậc hai số học và các bẫy thường gặp.
            </p>
            <button type="button" onClick={reset}>Chơi lại</button>
          </div>
        ) : (
          <>
            <div className="game-controls">
              <strong>⭐ Câu hỏi {index + 1}/{CHALLENGES.length}</strong>
              <span>Đã làm đúng: {correctCount}</span>
              <button type="button" onClick={reset}>Chơi lại từ đầu</button>
            </div>

            <div className="game-help power-question">
              <p style={{ fontSize: '1.25rem', fontWeight: 600, margin: '8px 0' }}>
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
                  >
                    <MathText>{opt.startsWith('$') ? opt : `$${opt}$`}</MathText>
                    {isSelected && <span className="target-arrow" aria-hidden="true">➶</span>}
                  </button>
                );
              })}
            </div>

            {picked !== null && (
              <div className="game-feedback" role="status">
                <strong>{isCorrect ? '✓ Chính xác!' : 'Chưa đúng — cùng xem giải thích nhé:'}</strong>
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
