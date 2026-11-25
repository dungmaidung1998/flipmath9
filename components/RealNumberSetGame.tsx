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

interface SetItem {
  numberText: string;
  description: string;
  options: string[];
  correct: number;
  explanation: string;
}

const SET_ITEMS: SetItem[] = [
  {
    numberText: '-5',
    description: 'Số nguyên âm',
    options: [String.raw`\mathbb{N}`, String.raw`\mathbb{Z}`, String.raw`\mathbb{I}`],
    correct: 1,
    explanation: String.raw`$-5 \in \mathbb{Z}$ (tập số nguyên). Vì $\mathbb{Z} \subset \mathbb{Q} \subset \mathbb{R}$ nên $-5$ cũng thuộc $\mathbb{Q}$ và $\mathbb{R}$, nhưng không thuộc $\mathbb{N}$.`
  },
  {
    numberText: String.raw`\dfrac{3}{4}`,
    description: 'Phân số tối giản',
    options: [String.raw`\mathbb{Z}`, String.raw`\mathbb{Q}`, String.raw`\mathbb{I}`],
    correct: 1,
    explanation: String.raw`$\dfrac{3}{4} \in \mathbb{Q}$ (tập số hữu tỉ). Mọi số viết được dưới dạng $\dfrac{a}{b}$ với $a, b \in \mathbb{Z}, b \ne 0$ đều là số hữu tỉ.`
  },
  {
    numberText: '0{,}(6) = 0{,}666...',
    description: 'Số thập phân vô hạn tuần hoàn',
    options: [String.raw`\mathbb{Q} \text{ (Số hữu tỉ)}`, String.raw`\mathbb{I} \text{ (Số vô tỉ)}`, String.raw`\text{Không thuộc } \mathbb{R}`],
    correct: 0,
    explanation: String.raw`$0{,}(6) = \dfrac{2}{3}$ là số thập phân vô hạn tuần hoàn nên là SỐ HỮU TỈ ($\in \mathbb{Q}$). Chỉ số thập phân vô hạn KHÔNG tuần hoàn mới là số vô tỉ.`
  },
  {
    numberText: String.raw`\sqrt{2} \approx 1{,}4142...`,
    description: 'Căn bậc hai của 2',
    options: [String.raw`\mathbb{Q}`, String.raw`\mathbb{I} \text{ (Số vô tỉ)}`, String.raw`\mathbb{Z}`],
    correct: 1,
    explanation: String.raw`$\sqrt{2}$ viết thành số thập phân vô hạn không tuần hoàn, không viết được dưới dạng phân số $\dfrac{a}{b}$, nên $\sqrt{2} \in \mathbb{I}$ (số vô tỉ).`
  },
  {
    numberText: String.raw`\pi \approx 3{,}1415...`,
    description: 'Số pi (tỉ số chu vi và đường kính)',
    options: [String.raw`\mathbb{Q}`, String.raw`\mathbb{I} \text{ (Số vô tỉ)}`, String.raw`\mathbb{N}`],
    correct: 1,
    explanation: String.raw`Số $\pi$ là số vô tỉ ($\pi \in \mathbb{I}$). Giá trị $3{,}14$ hay $\dfrac{22}{7}$ chỉ là giá trị gần đúng trong tính toán, không phải giá trị chính xác của $\pi$.`
  },
  {
    numberText: '0{,}1010010001...',
    description: 'Số lượng chữ số 0 tăng dần đều',
    options: [String.raw`\mathbb{Q} \text{ (Tuần hoàn)}`, String.raw`\mathbb{I} \text{ (Số vô tỉ)}`, String.raw`\mathbb{Z}`],
    correct: 1,
    explanation: String.raw`Số này có vô hạn chữ số sau dấu phẩy nhưng không có chu kì lặp lại cố định nào $\implies$ số thập phân vô hạn không tuần hoàn $\implies$ số vô tỉ $\mathbb{I}$.`
  }
];

/**
 * Component React `RealNumberSetGame`: nhận props (thuộc tính truyền vào từ component cha) và dựng giao diện tương ứng.
 */
export default function RealNumberSetGame() {
  const mission = useGameMission();
  const audio = useGameAudio();

  const [index, setIndex] = useState(0);
  const [picked, setPicked] = useState<number | null>(null);
  const [sound, setSound] = useState(true);
  const [correctCount, setCorrectCount] = useState(0);

  const finished = index >= SET_ITEMS.length;
  // Tính toán, làm tròn hoặc giới hạn giá trị theo công thức
  const current = SET_ITEMS[Math.min(index, SET_ITEMS.length - 1)];
  const isCorrect = picked !== null && picked === current.correct;

  function reset() {
    setIndex(0);
    setPicked(null);
    setCorrectCount(0);
    audio.begin();
  }

  function advance() {
    if (index < SET_ITEMS.length) {
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
      title="🗂️ Phân loại tập hợp số: N, Z, Q, I, R"
      icon="🗂️"
      intro="Phân loại chính xác các số vào tập hợp số tự nhiên (N), số nguyên (Z), số hữu tỉ (Q), số vô tỉ (I) và số thực (R)."
      step={`Số thứ ${Math.min(index + 1, SET_ITEMS.length)}/${SET_ITEMS.length}`}
      finished={finished}
      ready={isCorrect}
      onStart={reset}
      onAdvance={advance}
    >
      {/* Khối giao diện: Khối nội dung chính */}
      <section className="foundation-game" aria-labelledby="real-set-game-title">
        <div className="game-heading">
          <div>
            <span className="game-eyebrow">KHỞI ĐỘNG · BÀI 6 & 7</span>
            <h2 id="real-set-game-title">🗂️ Phân loại tập hợp số</h2>
            <p>Khám phá quan hệ bao hàm N ⊂ Z ⊂ Q ⊂ R và phân biệt số hữu tỉ với số vô tỉ.</p>
          </div>
          <button type="button" aria-pressed={sound} onClick={() => setSound((s) => !s)}>
            {sound ? '🔊 Âm thanh bật' : '🔇 Âm thanh tắt'}
          </button>
        </div>

        {finished ? (
          <div className="game-check" role="status">
            <h3>🎉 Chúc mừng em đã hoàn thành thử thách phân loại!</h3>
            <p>
              Trả lời đúng <strong>{correctCount}/{SET_ITEMS.length}</strong> số. Em đã sẵn sàng để khám phá toàn cảnh bức tranh Tập hợp các số thực (tập R)!
            </p>
            <button type="button" onClick={reset}>Chơi lại</button>
          </div>
        ) : (
          <>
            <div className="game-controls">
              <strong>⭐ Câu hỏi {index + 1}/{SET_ITEMS.length}</strong>
              <span>Đã làm đúng: {correctCount}</span>
              <button type="button" onClick={reset}>Chơi lại từ đầu</button>
            </div>

            <div className="game-help power-question" style={{ textAlign: 'center', padding: '16px 8px' }}>
              <div style={{ fontSize: '0.9rem', color: 'var(--muted)', marginBottom: 4 }}>
                {current.description}
              </div>
              <div style={{ fontSize: '1.8rem', fontWeight: 700, color: 'var(--navy)' }}>
                <MathText>{`$${current.numberText}$`}</MathText>
              </div>
              <p style={{ margin: '8px 0 0', fontSize: '1rem' }}>
                Số trên thuộc tập hợp nào dưới đây?
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
                    style={{ minWidth: 120 }}
                  >
                    <MathText>{`$${opt}$`}</MathText>
                    {isSelected && <span className="target-arrow" aria-hidden="true">➶</span>}
                  </button>
                );
              })}
            </div>

            {picked !== null && (
              <div className="game-feedback" role="status">
                <strong>{isCorrect ? '✓ Chính xác!' : 'Chưa đúng — cùng ôn lại quy tắc:'}</strong>
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
