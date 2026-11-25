/**
 * FILE NÀY LÀM GÌ: Component React giao diện hiển thị và xử lý tương tác của người dùng trên trình duyệt.
 * AI DÙNG: học sinh
 * LẤY DỮ LIỆU TỪ: không truy vấn bảng trực tiếp
 * GỌI TỚI: không gọi mô-đun nội bộ khác
 */
/**
 * TƯƠNG QUAN % XEM VIDEO × ĐIỂM QUIZ LẦN ĐẦU
 *
 * Đây là biểu đồ mang tính chẩn đoán nhất của hệ thống: nó tách bạch bằng hình
 * ảnh hai tình trạng mà mọi nền tảng khác gộp làm một —
 *   góc phải dưới : xem hết video nhưng điểm thấp  → XEM THỤ ĐỘNG (quy tắc R01)
 *   góc trái dưới : chưa xem, điểm thấp            → chưa chuẩn bị bài
 * Hai tình trạng này cần hai can thiệp khác hẳn nhau.
 *
 * Dùng lối NHẤN MẠNH thay vì tô bốn màu theo nhóm: nhóm cần chú ý một màu, phần
 * còn lại xám nền. Một chấm mang màu thì luôn kèm nhãn chữ, không để màu đứng một mình.
 */

type Pt = { name: string; video: number; quiz: number };

const VIDEO_THRESHOLD = 90;   // ngưỡng của quy tắc R01
const QUIZ_THRESHOLD = 5;

/**
 * Component React `VideoQuizScatter`: nhận props (thuộc tính truyền vào từ component cha) và dựng giao diện tương ứng.
 */
export default function VideoQuizScatter({ points }: { points: Pt[] }) {
  if (!points.length) {
    return <p className="hint">Chưa có học sinh nào làm bài kiểm tra ngắn của đơn vị kiến thức này.</p>;
  }

  const W = 640, H = 342, L = 40, R = 16, T = 26, B = 40;  // T chừa chỗ cho nhãn trục tung
  const pw = W - L - R, ph = H - T - B;
  // Tính toán, làm tròn hoặc giới hạn giá trị theo công thức
  const sx = (v: number) => L + (Math.max(0, Math.min(100, v)) / 100) * pw;
  // Tính toán, làm tròn hoặc giới hạn giá trị theo công thức
  const sy = (v: number) => T + ph - (Math.max(0, Math.min(10, v)) / 10) * ph;

  const passive = (p: Pt) => p.video >= VIDEO_THRESHOLD && p.quiz < QUIZ_THRESHOLD;
  const nPassive = points.filter(passive).length;

  const tx = sx(VIDEO_THRESHOLD);
  const ty = sy(QUIZ_THRESHOLD);

  return (
    <figure className="viz" style={{ margin: 0 }}>
      <div className="chart-scroll" tabIndex={0} role="region" aria-label="Biểu đồ — dùng phím mũi tên hoặc vuốt để xem hết biểu đồ"><svg style={{width:W,height:H}} viewBox={`0 0 ${W} ${H}`} role="img"
           aria-label="Tương quan giữa tỉ lệ xem video và điểm bài kiểm tra ngắn lần đầu">
        {/* nền nhấn cho vùng xem thụ động */}
        <rect x={tx} y={ty} width={W - R - tx} height={T + ph - ty}
              fill="var(--viz-accent)" opacity={0.07} />

        {/* lưới ngang, nét mảnh liền */}
        {[0, 2, 4, 6, 8, 10].map((v) => (
          <g key={v}>
            <line x1={L} y1={sy(v)} x2={W - R} y2={sy(v)} stroke="var(--viz-grid)" strokeWidth={1} />
            <text x={L - 8} y={sy(v) + 4} textAnchor="end" className="lbl">{v}</text>
          </g>
        ))}
        {[0, 25, 50, 75, 100].map((v) => (
          <text key={v} x={sx(v)} y={H - 18} textAnchor="middle" className="lbl">{v}%</text>
        ))}

        {/* hai đường ngưỡng của quy tắc R01 */}
        <line x1={tx} y1={T} x2={tx} y2={T + ph} stroke="var(--viz-axis)" strokeWidth={1} />
        <line x1={L} y1={ty} x2={W - R} y2={ty} stroke="var(--viz-axis)" strokeWidth={1} />

        {/* trục */}
        <line x1={L} y1={T + ph} x2={W - R} y2={T + ph} stroke="var(--viz-axis)" strokeWidth={1} />
        <line x1={L} y1={T} x2={L} y2={T + ph} stroke="var(--viz-axis)" strokeWidth={1} />

        {/* điểm: vòng nền 2px để hai chấm chồng nhau vẫn tách được */}
        {points.map((p, i) => {
          const on = passive(p);
          return (
            <circle key={i} cx={sx(p.video)} cy={sy(p.quiz)} r={5.5}
                    fill={on ? 'var(--viz-accent)' : 'var(--viz-rest)'}
                    stroke="var(--viz-surface)" strokeWidth={2}>
              <title>{`${p.name} · xem ${Math.round(p.video)}% · ${p.quiz.toFixed(1)} điểm`}</title>
            </circle>
          );
        })}

        {/* nhãn trực tiếp cho vùng đáng chú ý — không ghi số lên từng chấm */}
        {nPassive > 0 && (
          <text x={W - R - 6} y={T + ph - 8} textAnchor="end"
                fontSize="13" fontWeight="700" fill="var(--viz-accent)">
            xem chưa kĩ · {nPassive}
          </text>
        )}

        <text x={L} y={H - 3} className="lbl">Tỉ lệ xem video có tương tác →</text>
        <text x={L - 8} y={12} textAnchor="end" className="lbl">điểm</text>
      </svg></div>

      <div className="legend">
        <span><i style={{ background: 'var(--viz-accent)' }} />Xem gần hết video nhưng dưới 5 điểm</span>
        <span><i style={{ background: 'var(--viz-rest)' }} />Học sinh còn lại</span>
      </div>
      <figcaption>
        Góc phải dưới là những em đã xem hết video mà vẫn không nắm bài — cần hoạt động
        kiến tạo lại khái niệm, không phải giảng lại. Góc trái dưới là những em chưa chuẩn bị bài,
        đó lại là vấn đề khác hẳn.
      </figcaption>
    </figure>
  );
}
