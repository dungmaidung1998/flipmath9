/**
 * FILE NÀY LÀM GÌ: Component React giao diện hiển thị và xử lý tương tác của người dùng trên trình duyệt.
 * AI DÙNG: học sinh
 * LẤY DỮ LIỆU TỪ: không truy vấn bảng trực tiếp
 * GỌI TỚI: không gọi mô-đun nội bộ khác
 */
/**
 * ĐỘ TRUNG THỰC TRIỂN KHAI THEO TỪNG TUẦN
 *
 * Câu hỏi biểu đồ này trả lời: "tuần nào tuột khỏi ngưỡng 80%?" — nên dạng cột,
 * trục thời gian nằm ngang, và có MỘT đường tham chiếu ở 80%.
 *
 * Chỉ dùng hai màu: màu trung tính cho các tuần đạt, màu nhấn cho các tuần chưa
 * đạt. Đây là dạng NHẤN MẠNH (emphasis) chứ không phải thang thứ bậc — vì việc
 * cần làm chỉ là tìm ra những cột thấp, không phải so sánh sắc độ giữa chúng.
 */

const NGUONG = 80;

/**
 * Component React `FidelityWeeks`: nhận props (thuộc tính truyền vào từ component cha) và dựng giao diện tương ứng.
 */
export default function FidelityWeeks({
  rows
}: { rows: { tuan: number; tong: number | null }[] }) {
  const co = rows.filter((r) => r.tong !== null);
  if (!co.length) {
    return <p className="hint">Chưa có tuần nào đủ dữ liệu để vẽ. Khai báo kế hoạch tuần rồi ghi nhật ký tiết dạy.</p>;
  }

  const W = 680, H = 230;
  // lề phải rộng để nhãn ngưỡng nằm NGOÀI vùng vẽ — đặt trong vùng vẽ thì nó
  // đè lên đúng những cột quanh mốc 80%, tức là những cột cần đọc kỹ nhất
  const ML = 34, MR = 52, MT = 12, MB = 40;
  const iw = W - ML - MR, ih = H - MT - MB;
  const n = rows.length;
  const step = iw / n;
  // Tính toán, làm tròn hoặc giới hạn giá trị theo công thức
  const bw = Math.min(38, step * 0.62);
  const y = (v: number) => MT + ih - (v / 100) * ih;

  return (
    <figure className="viz" style={{ margin: 0 }}>
      <div className="chart-scroll" tabIndex={0} role="region" aria-label="Biểu đồ — dùng phím mũi tên hoặc vuốt để xem hết biểu đồ"><svg style={{width:W,height:H}} viewBox={`0 0 ${W} ${H}`} role="img"
           aria-label={`Độ trung thực triển khai của ${n} tuần, ngưỡng đạt ${NGUONG} phần trăm`}>
        {/* lưới ngang */}
        {[0, 25, 50, 75, 100].map((v) => (
          <g key={v}>
            <line x1={ML} x2={W - MR} y1={y(v)} y2={y(v)} stroke="var(--viz-grid)" strokeWidth={1} />
            <text x={ML - 6} y={y(v) + 4} textAnchor="end" className="lbl">{v}</text>
          </g>
        ))}

        {/* đường ngưỡng 80% — vẽ đè lên lưới, nét đứt, nhãn đặt ngoài lề phải */}
        <line x1={ML} x2={W - MR + 8} y1={y(NGUONG)} y2={y(NGUONG)}
              stroke="var(--viz-accent)" strokeWidth={1.5} strokeDasharray="5 4" />
        <text x={W - MR + 12} y={y(NGUONG) + 4}
              fontSize="13" fontWeight="700" fill="var(--viz-accent)">{NGUONG}%</text>

        {rows.map((r, i) => {
          const cx = ML + step * i + step / 2;
          if (r.tong === null) {
            return (
              <g key={r.tuan}>
                <text x={cx} y={y(0) - 6} textAnchor="middle" className="lbl">chưa có</text>
                <text x={cx} y={H - 22} textAnchor="middle" className="lbl">T{r.tuan}</text>
              </g>
            );
          }
          const dat = r.tong >= NGUONG;
          // Tính toán, làm tròn hoặc giới hạn giá trị theo công thức
          const h = Math.max(1, (r.tong / 100) * ih);
          return (
            <g key={r.tuan}>
              <rect x={cx - bw / 2} y={y(r.tong)} width={bw} height={h} rx={3}
                    fill={dat ? 'var(--viz-rest)' : 'var(--viz-accent)'}>
                <title>{`Tuần ${r.tuan}: ${r.tong}%`}</title>
              </rect>
              <text x={cx} y={y(r.tong) - 5} textAnchor="middle" className="val">{r.tong}</text>
              <text x={cx} y={H - 22} textAnchor="middle" className="lbl">T{r.tuan}</text>
            </g>
          );
        })}

        <line x1={ML} x2={W - MR} y1={y(0)} y2={y(0)} stroke="var(--viz-axis)" strokeWidth={1} />
        <text x={ML} y={H - 5} className="lbl">Tuần thực nghiệm</text>
      </svg></div>
      <figcaption>
        Đường đứt màu cam là ngưỡng {NGUONG}% trong bản thiết kế nghiên cứu. Cột màu cam là tuần
        chưa đạt ngưỡng.
      </figcaption>
    </figure>
  );
}
