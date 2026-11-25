/**
 * FILE NÀY LÀM GÌ: Component React giao diện hiển thị và xử lý tương tác của người dùng trên trình duyệt.
 * AI DÙNG: học sinh
 * LẤY DỮ LIỆU TỪ: không truy vấn bảng trực tiếp
 * GỌI TỚI: không gọi mô-đun nội bộ khác
 */
/**
 * PHÂN BỐ HỌC SINH THEO BỐN NHÓM THAM GIA (LES)
 *
 * Bốn nhóm là một thang THỨ BẬC (Nguy cơ < Cần hỗ trợ < Đạt < Tốt), không phải
 * bốn hạng mục ngang hàng — nên dùng một tông màu nhạt dần → đậm dần chứ không
 * dùng bốn màu khác nhau. Dạng cột chồng ngang vì câu hỏi của giáo viên là
 * "lớp mình phân bố thế nào", tức quan hệ bộ phận – toàn thể.
 */

const GROUPS = ['Nguy cơ', 'Cần hỗ trợ', 'Đạt', 'Tốt'] as const;
const TOKENS = ['var(--viz-o1)', 'var(--viz-o2)', 'var(--viz-o3)', 'var(--viz-o4)'];

/**
 * Component React `GroupBar`: nhận props (thuộc tính truyền vào từ component cha) và dựng giao diện tương ứng.
 */
export default function GroupBar({ rows }: { rows: { group: string }[] }) {
  const total = rows.length;
  const counts = GROUPS.map((g) => rows.filter((r) => r.group === g).length);

  if (!total) return <p className="hint">Chưa có học sinh nào trong lớp.</p>;

  return (
    <figure className="viz" style={{ margin: 0 }}>
      <div className="group-distribution" role="img" aria-label={GROUPS.map((g,i)=>`${g}: ${counts[i]}/${total} học sinh`).join('; ')}>
        {counts.map((n,i)=>n>0?<span key={GROUPS[i]} style={{flex:n,background:TOKENS[i]}} title={`${GROUPS[i]}: ${n}/${total} học sinh`}/>:null)}
      </div>
      <div className="legend">
        {GROUPS.map((g, i) => (
          <span key={g}><i style={{ background: TOKENS[i] }} />{g} · {counts[i]}</span>
        ))}
      </div>
    </figure>
  );
}
