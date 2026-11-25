'use client';

/**
 * FILE NÀY LÀM GÌ: Component React giao diện hiển thị và xử lý tương tác của người dùng trên trình duyệt.
 * AI DÙNG: học sinh
 * LẤY DỮ LIỆU TỪ: không truy vấn bảng trực tiếp
 * GỌI TỚI: không gọi mô-đun nội bộ khác
 */
/**
 * Component React `PrintLink`: nhận props (thuộc tính truyền vào từ component cha) và dựng giao diện tương ứng.
 */
export default function PrintLink({ nhan }: { nhan?: string }) {
  return (
    <a className="action-link" href="#" onClick={(e) => { e.preventDefault(); window.print(); }}>
      {nhan ?? 'In danh sách nhóm'}
    </a>
  );
}
