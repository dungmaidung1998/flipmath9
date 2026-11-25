/**
 * FILE NÀY LÀM GÌ: Component React giao diện hiển thị và xử lý tương tác của người dùng trên trình duyệt.
 * AI DÙNG: học sinh
 * LẤY DỮ LIỆU TỪ: không truy vấn bảng trực tiếp
 * GỌI TỚI: không gọi mô-đun nội bộ khác
 */
/**
 * THANH ĐO ĐƯỜNG ĐI CỦA MỘT VI BÀI HỌC
 *
 * Ba đoạn cộng lại đúng bằng số lượt ĐÃ GIAO, và ba đoạn ấy lồng nhau về nghĩa:
 * làm xong ⊆ đã mở ⊆ đã giao. Vì vậy đây là quan hệ bộ phận – toàn thể trên một
 * thang CÓ THỨ BẬC, không phải ba hạng mục ngang hàng — nên dùng một tông màu
 * đậm dần theo mức tiến triển chứ không dùng ba màu khác nhau.
 *
 * Đoạn "chưa mở" để màu trung tính: nó là phần KHÔNG xảy ra, không phải một giá
 * trị. Cho nó một sắc màu riêng sẽ khiến mắt đọc nó ngang hàng với hai đoạn kia.
 *
 * Bảng số nằm ngay cạnh trong cùng một hàng, nên thanh này chỉ cần cho thấy
 * HÌNH DẠNG — chỗ nào hụt nhiều — chứ không phải để đọc ra con số.
 */

export default function PhieuViBaiHoc({
  giao, mo, xong
}: { giao: number; mo: number; xong: number }) {
  if (!giao) return <span className="hint">—</span>;

  const W = 132, H = 14, GAP = 2, R = 3;
  // Tính toán, làm tròn hoặc giới hạn giá trị theo công thức
  const an = Math.min(xong, mo, giao);           // làm xong
  // Tính toán, làm tròn hoặc giới hạn giá trị theo công thức
  const b = Math.max(0, Math.min(mo, giao) - an); // mở nhưng chưa xong
  // Tính toán, làm tròn hoặc giới hạn giá trị theo công thức
  const c = Math.max(0, giao - an - b);           // chưa mở

  const doan = [
    { n: an, mau: 'var(--viz-bar)', ten: 'làm xong' },
    { n: b, mau: 'var(--viz-o1)', ten: 'mở nhưng chưa làm xong' },
    { n: c, mau: 'var(--viz-grid)', ten: 'chưa mở' }
  ].filter((d) => d.n > 0);

  let x = 0;
  return (
    <span className="viz" style={{ display: 'inline-block', width: W, verticalAlign: 'middle' }}>
      <svg viewBox={`0 0 ${W} ${H}`} role="img"
           aria-label={`Trong ${giao} lượt giao: ${mo} lượt có mở, ${xong} lượt làm xong`}>
        {doan.map((d, i) => {
          const w = (d.n / giao) * W - (i < doan.length - 1 ? GAP : 0);
          const seg = (
            <rect key={d.ten} x={x} y={0} width={Math.max(w, 1)} height={H} rx={R} fill={d.mau}>
              <title>{`${d.ten}: ${d.n}/${giao}`}</title>
            </rect>
          );
          x += (d.n / giao) * W;
          return seg;
        })}
      </svg>
    </span>
  );
}
