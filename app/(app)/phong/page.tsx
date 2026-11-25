'use client';

/**
 * FILE NÀY LÀM GÌ: Trang Next.js App Router trong khu vực học tập đã đăng nhập, nạp dữ liệu ban đầu và hiển thị giao diện tương tác.
 * AI DÙNG: học sinh
 * ĐỊA CHỈ TRÊN WEB: /phong
 * LẤY DỮ LIỆU TỪ: không truy vấn bảng trực tiếp
 * GỌI TỚI: @/components/DauTrang
 */
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import DauTrang from '@/components/DauTrang';

/**
 * Component React `VaoPhongPage`: nhận props (thuộc tính truyền vào từ component cha) và dựng giao diện tương ứng.
 */
export default function VaoPhongPage() {
  const [ma, setMa] = useState('');
  const router = useRouter();

  function vao(e: React.FormEvent) {
    e.preventDefault();
    // Biểu thức chính quy (regex) kiểm tra hoặc tách chuỗi đúng mẫu dữ liệu
    const clean = ma.replace(/\D/g, '').slice(0, 6);
    if (clean.length === 6) router.push(`/phong/${clean}`);
  }

  return (
    <div className="wrap">
      <DauTrang
        gon
        tieuDe="Tham gia trình chiếu trên lớp"
        phu="Nhập mã phòng 6 chữ số trên máy chiếu hoặc quét mã QR của thầy cô."
        tranh="bai-hoc"
        canh="pho-dem"
      />
      <div className="card" style={{ maxWidth: 480, margin: '0 auto' }}>
        <h2 style={{ marginTop: 0 }}>📺 Nhập mã phòng</h2>
        <p className="hint">Điền đủ 6 chữ số do thầy cô phát để vào trả lời câu hỏi cùng lớp.</p>
        {/* Khối giao diện: Biểu mẫu nhập liệu */}
        <form onSubmit={vao} style={{ display: 'flex', gap: 10, marginTop: 12 }}>
          <input
            inputMode="numeric"
            maxLength={6}
            value={ma}
            onChange={(e) => setMa(e.target.value.replace(/\D/g, '').slice(0, 6))}
            placeholder="Ví dụ: 482910"
            style={{ fontSize: 24, letterSpacing: '0.12em', textAlign: 'center', fontWeight: 800, flex: 1, padding: '10px 12px', borderRadius: 10, border: '1px solid var(--line)' }}
          />
          <button type="submit" className="primary" disabled={ma.length !== 6}>
            Vào phòng
          </button>
        </form>
      </div>
    </div>
  );
}
