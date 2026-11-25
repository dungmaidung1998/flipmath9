/**
 * FILE NÀY LÀM GÌ: Component React giao diện hiển thị và xử lý tương tác của người dùng trên trình duyệt.
 * AI DÙNG: học sinh
 * LẤY DỮ LIỆU TỪ: không truy vấn bảng trực tiếp
 * GỌI TỚI: @/lib/khkt/thongKeThucNghiem
 */
import type { TuPhanVi } from '@/lib/khkt/thongKeThucNghiem';

export type MucBoxPlot = {
  nhan: string;
  mau: string;
  stats: TuPhanVi | null;
};

/**
 * Biểu đồ SVG kết hợp:
 *   1. Biểu đồ cột điểm trung bình (± độ lệch chuẩn)
 *   2. Biểu đồ hộp (Box Plot: Min – Q1 – Trung vị – Q3 – Max)
 */
export default function BoxPlotChart({ items }: { items: MucBoxPlot[] }) {
  const coDuLieu = items.some((x) => x.stats != null);
  if (!coDuLieu) {
    return <p className="mc-trong">Chưa có dữ liệu điểm để vẽ biểu đồ cột và biểu đồ hộp.</p>;
  }

  const W = 740;
  const H = 280;
  const padL = 44;
  const padR = 20;
  const padT = 22;
  const padB = 56;
  const innerW = W - padL - padR;
  const innerH = H - padT - padB;
  // Tính toán, làm tròn hoặc giới hạn giá trị theo công thức
  const yOf = (val: number) => padT + innerH - (Math.max(0, Math.min(10, val)) / 10) * innerH;
  const colW = innerW / items.length;

  return (
    <div style={{ display: 'grid', gap: 18, gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))' }}>
      {/* Biểu đồ 1: Cột trung bình ± SD */}
      <div style={{ border: '1px solid var(--mc-vach)', borderRadius: 12, padding: 12, background: '#fff' }}>
        <h3 style={{ margin: '0 0 8px', fontSize: 14 }}>Biểu đồ cột: Điểm trung bình (± Độ lệch chuẩn)</h3>
        <svg viewBox={`0 0 ${W} ${H}`} width="100%" role="img" aria-label="Biểu đồ cột điểm trung bình và độ lệch chuẩn">
          {[0, 2, 4, 6, 8, 10].map((v) => (
            <g key={v}>
              <line x1={padL} y1={yOf(v)} x2={W - padR} y2={yOf(v)} stroke="#e2e8f0" strokeDasharray="3 3" />
              <text x={padL - 8} y={yOf(v) + 4} textAnchor="end" fontSize={12} fill="#64748b">{v}</text>
            </g>
          ))}
          {items.map((it, idx) => {
            const cx = padL + colW * idx + colW / 2;
            const st = it.stats;
            // Tính toán, làm tròn hoặc giới hạn giá trị theo công thức
            const barW = Math.min(68, colW * 0.48);
            const y0 = yOf(0);
            if (!st) {
              return (
                <text key={it.nhan} x={cx} y={H - 16} textAnchor="middle" fontSize={12} fill="#94a3b8">
                  {it.nhan} (trống)
                </text>
              );
            }
            const yMean = yOf(st.mean);
            const sd = st.sd ?? 0;
            // Tính toán, làm tròn hoặc giới hạn giá trị theo công thức
            const yHi = yOf(Math.min(10, st.mean + sd));
            // Tính toán, làm tròn hoặc giới hạn giá trị theo công thức
            const yLo = yOf(Math.max(0, st.mean - sd));
            return (
              <g key={it.nhan}>
                <rect x={cx - barW / 2} y={yMean} width={barW} height={Math.max(2, y0 - yMean)} rx={6} fill={it.mau} opacity={0.9} />
                {st.sd != null && (
                  <>
                    <line x1={cx} y1={yHi} x2={cx} y2={yLo} stroke="#0f172a" strokeWidth={2} />
                    <line x1={cx - 8} y1={yHi} x2={cx + 8} y2={yHi} stroke="#0f172a" strokeWidth={2} />
                    <line x1={cx - 8} y1={yLo} x2={cx + 8} y2={yLo} stroke="#0f172a" strokeWidth={2} />
                  </>
                )}
                <text x={cx} y={Math.max(14, yHi - 6)} textAnchor="middle" fontSize={12} fontWeight={700} fill="#0f172a">
                  {st.mean.toFixed(2)} (n={st.n})
                </text>
                <text x={cx} y={H - 22} textAnchor="middle" fontSize={12} fontWeight={600} fill="#334155">
                  {it.nhan}
                </text>
              </g>
            );
          })}
        </svg>
      </div>

      {/* Biểu đồ 2: Biểu đồ hộp (Box Plot) */}
      <div style={{ border: '1px solid var(--mc-vach)', borderRadius: 12, padding: 12, background: '#fff' }}>
        <h3 style={{ margin: '0 0 8px', fontSize: 14 }}>Biểu đồ hộp (Box Plot): Min – Q1 – Trung vị – Q3 – Max</h3>
        <svg viewBox={`0 0 ${W} ${H}`} width="100%" role="img" aria-label="Biểu đồ hộp phân bố điểm số">
          {[0, 2, 4, 6, 8, 10].map((v) => (
            <g key={v}>
              <line x1={padL} y1={yOf(v)} x2={W - padR} y2={yOf(v)} stroke="#e2e8f0" strokeDasharray="3 3" />
              <text x={padL - 8} y={yOf(v) + 4} textAnchor="end" fontSize={12} fill="#64748b">{v}</text>
            </g>
          ))}
          {items.map((it, idx) => {
            const cx = padL + colW * idx + colW / 2;
            const st = it.stats;
            // Tính toán, làm tròn hoặc giới hạn giá trị theo công thức
            const boxW = Math.min(62, colW * 0.44);
            if (!st) {
              return (
                <text key={it.nhan} x={cx} y={H - 16} textAnchor="middle" fontSize={12} fill="#94a3b8">
                  {it.nhan} (trống)
                </text>
              );
            }
            const yMin = yOf(st.min);
            const yQ1 = yOf(st.q1);
            const yMed = yOf(st.median);
            const yQ3 = yOf(st.q3);
            const yMax = yOf(st.max);
            return (
              <g key={it.nhan}>
                {/* râu min–max */}
                <line x1={cx} y1={yMax} x2={cx} y2={yMin} stroke="#334155" strokeWidth={2} />
                <line x1={cx - 12} y1={yMax} x2={cx + 12} y2={yMax} stroke="#334155" strokeWidth={2} />
                <line x1={cx - 12} y1={yMin} x2={cx + 12} y2={yMin} stroke="#334155" strokeWidth={2} />
                {/* hộp Q1–Q3 */}
                <rect
                  x={cx - boxW / 2}
                  y={yQ3}
                  width={boxW}
                  height={Math.max(4, yQ1 - yQ3)}
                  rx={5}
                  fill={it.mau}
                  fillOpacity={0.35}
                  stroke={it.mau}
                  strokeWidth={2.5}
                />
                {/* đường trung vị */}
                <line x1={cx - boxW / 2} y1={yMed} x2={cx + boxW / 2} y2={yMed} stroke="#0f172a" strokeWidth={3} />
                {/* chấm trung bình */}
                <circle cx={cx} cy={yOf(st.mean)} r={4} fill="#dc2626" />
                <text x={cx} y={Math.max(14, yMax - 6)} textAnchor="middle" fontSize={11.5} fill="#334155">
                  Med={st.median.toFixed(1)}
                </text>
                <text x={cx} y={H - 22} textAnchor="middle" fontSize={12} fontWeight={600} fill="#334155">
                  {it.nhan}
                </text>
              </g>
            );
          })}
        </svg>
      </div>
    </div>
  );
}
