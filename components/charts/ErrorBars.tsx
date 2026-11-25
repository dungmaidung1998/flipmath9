/**
 * FILE NÀY LÀM GÌ: Component React giao diện hiển thị và xử lý tương tác của người dùng trên trình duyệt.
 * AI DÙNG: học sinh
 * LẤY DỮ LIỆU TỪ: không truy vấn bảng trực tiếp
 * GỌI TỚI: không gọi mô-đun nội bộ khác
 */
/**
 * MÃ LỖI PHỔ BIẾN TRONG LỚP
 *
 * Các mã lỗi là hạng mục danh định, không có thứ tự tự nhiên, nên MỘT màu duy
 * nhất cho mọi cột — độ dài cột đã mang thông tin, tô đậm dần theo giá trị là
 * mã hoá thừa. Cột nằm ngang vì nhãn là câu mô tả quan niệm sai, khá dài.
 */

export default function ErrorBars({
  items
}: { items: { code: string; misconception: string; count: number }[] }) {
  if (!items.length) return <p className="hint">Chưa có dữ liệu bài làm cho đơn vị kiến thức này.</p>;

  const data = [...items].sort((a, b) => b.count - a.count).slice(0, 6);
  // Tính toán, làm tròn hoặc giới hạn giá trị theo công thức
  const max = Math.max(...data.map((d) => d.count));
  const ROW = 34, PAD_L = 96, PAD_R = 34, W = 640;
  const H = data.length * ROW + 22;
  const plot = W - PAD_L - PAD_R;

  // lưới thưa, nét mảnh, liền — không dùng nét đứt
  const ticks = max <= 4 ? [0, max] : [0, Math.round(max / 2), max];

  return (
    <figure className="viz" style={{ margin: 0 }}>
      <div className="chart-scroll" tabIndex={0} role="region" aria-label="Biểu đồ — dùng phím mũi tên hoặc vuốt để xem hết biểu đồ"><svg style={{width:W,height:H}} viewBox={`0 0 ${W} ${H}`} role="img" aria-label="Số lượt mắc theo từng mã lỗi">
        {ticks.map((t) => {
          const gx = PAD_L + (t / max) * plot;
          return (
            <g key={t}>
              <line x1={gx} y1={4} x2={gx} y2={data.length * ROW + 2}
                    stroke="var(--viz-grid)" strokeWidth={1} />
              <text x={gx} y={H - 4} textAnchor="middle" className="lbl">{t}</text>
            </g>
          );
        })}

        {data.map((d, i) => {
          const y = i * ROW + 6;
          // Tính toán, làm tròn hoặc giới hạn giá trị theo công thức
          const w = Math.max((d.count / max) * plot, 2);
          return (
            <g key={d.code}>
              <text x={0} y={y + 15} className="val" fontSize="13">{d.code}</text>
              <rect x={PAD_L} y={y} width={w} height={20} rx={4} fill="var(--viz-bar)">
                <title>{`${d.code} — ${d.misconception} · ${d.count} lượt`}</title>
              </rect>
              <text x={PAD_L + w + 7} y={y + 15} className="val">{d.count}</text>
            </g>
          );
        })}
      </svg></div>
      <figcaption>
        Bảng bên dưới ghi rõ mỗi mã lỗi tương ứng với điều học sinh đang nghĩ sai.
      </figcaption>
    </figure>
  );
}
