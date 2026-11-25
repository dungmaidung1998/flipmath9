/**
 * FILE NÀY LÀM GÌ: Component React giao diện hiển thị và xử lý tương tác của người dùng trên trình duyệt.
 * AI DÙNG: học sinh
 * LẤY DỮ LIỆU TỪ: không truy vấn bảng trực tiếp
 * GỌI TỚI: không gọi mô-đun nội bộ khác
 */
/**
 * BỐN THÀNH PHẦN CỦA ĐỘ TRUNG THỰC — CẢ ĐỢT
 *
 * Con số tổng "71%" không nói cho giáo viên biết phải sửa gì. Biểu đồ này tách
 * ra bốn thành phần, xếp theo đúng thứ tự trong bản thiết kế (không xếp theo giá
 * trị, để tuần nào nhìn cũng cùng một trật tự và so sánh được giữa các lần xem).
 *
 * Cột ngang vì nhãn dài. Thành phần dưới ngưỡng được tô màu nhấn — vẫn là dạng
 * nhấn mạnh, không phải bốn hạng mục bốn màu.
 */

const NGUONG = 80;

const THU_TU = ['tuanThu', 'lieuLuong', 'chatLuong', 'dapUng'] as const;
const TEN: Record<string, string> = {
  tuanThu: 'Tuân thủ quy trình ba pha',
  lieuLuong: 'Liều lượng — HS học trước giờ',
  chatLuong: 'Chất lượng — dùng dữ liệu để dạy',
  dapUng: 'Đáp ứng — HS làm nội dung giao lại'
};

/**
 * Component React `FidelityComponents`: nhận props (thuộc tính truyền vào từ component cha) và dựng giao diện tương ứng.
 */
export default function FidelityComponents({
  thanhPhan
}: { thanhPhan: Record<string, number | null> }) {
  const W = 680, ROW = 40, PAD_T = 6;
  const LBL = 250, MR = 44;
  const bw = W - LBL - MR;
  const H = PAD_T + ROW * THU_TU.length + 22;

  return (
    <figure className="viz" style={{ margin: 0 }}>
      <div className="chart-scroll" tabIndex={0} role="region" aria-label="Biểu đồ — dùng phím mũi tên hoặc vuốt để xem hết biểu đồ"><svg style={{width:W,height:H}} viewBox={`0 0 ${W} ${H}`} role="img"
           aria-label="Bốn thành phần của độ trung thực triển khai">
        {/* đường ngưỡng chạy suốt vùng vẽ */}
        <line x1={LBL + bw * (NGUONG / 100)} x2={LBL + bw * (NGUONG / 100)}
              y1={PAD_T} y2={PAD_T + ROW * THU_TU.length}
              stroke="var(--viz-accent)" strokeWidth={1.5} strokeDasharray="5 4" />
        <text x={LBL + bw * (NGUONG / 100)} y={H - 6} textAnchor="middle"
              fontSize="13" fontWeight="700" fill="var(--viz-accent)">{NGUONG}%</text>

        {THU_TU.map((k, i) => {
          const v = thanhPhan[k];
          const yTop = PAD_T + ROW * i + 8;
          if (v === null || v === undefined) {
            return (
              <g key={k}>
                <text x={LBL - 10} y={yTop + 15} textAnchor="end" className="val">{TEN[k]}</text>
                <text x={LBL} y={yTop + 15} className="lbl">chưa có dữ liệu để tính</text>
              </g>
            );
          }
          // Tính toán, làm tròn hoặc giới hạn giá trị theo công thức
          const w = Math.max(1, (v / 100) * bw);
          const dat = v >= NGUONG;
          return (
            <g key={k}>
              <text x={LBL - 10} y={yTop + 15} textAnchor="end" className="val">{TEN[k]}</text>
              <rect x={LBL} y={yTop} width={bw} height={22} rx={3} fill="var(--viz-grid)" />
              <rect x={LBL} y={yTop} width={w} height={22} rx={3}
                    fill={dat ? 'var(--viz-bar)' : 'var(--viz-accent)'}>
                <title>{`${TEN[k]}: ${v}%`}</title>
              </rect>
              <text x={LBL + bw + 6} y={yTop + 16} className="val">{v}%</text>
            </g>
          );
        })}
      </svg></div>
      <figcaption>
        Thanh màu cam là thành phần chưa đạt ngưỡng {NGUONG}%. Thứ tự bốn thành phần luôn cố định
        để so sánh được giữa các lần xem.
      </figcaption>
    </figure>
  );
}
