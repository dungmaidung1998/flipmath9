'use client';

/**
 * FILE NÀY LÀM GÌ: Component React giao diện hiển thị và xử lý tương tác của người dùng trên trình duyệt.
 * AI DÙNG: học sinh
 * LẤY DỮ LIỆU TỪ: không truy vấn bảng trực tiếp
 * GỌI TỚI: ./HanhTrinh, @/lib/hanhTrinh
 */
import { useId, useState } from 'react';
import HanhTrinh from './HanhTrinh';
import { layHanhTrinh } from '@/lib/hanhTrinh';

/**
 * Component React `NutHanhTrinh`: nhận props (thuộc tính truyền vào từ component cha) và dựng giao diện tương ứng.
 */
export default function NutHanhTrinh({ id }: { id: string }) {
  return <NoiTuyen key={id} id={id}/>;
}

/**
 * Component React `NoiTuyen`: nhận props (thuộc tính truyền vào từ component cha) và dựng giao diện tương ứng.
 */
function NoiTuyen({ id }: { id: string }) {
  const noiDung = useId();
  const [mo, setMo] = useState(false);
  const [daMo, setDaMo] = useState(false);
  const data = layHanhTrinh(id);
  if (!data) return null;

  return <div>
    <button type="button" className="ht-toggle" aria-expanded={mo} aria-controls={noiDung}
      onClick={() => { setMo(!mo); setDaMo(true); }}>
      {mo ? 'Thu gọn hành trình' : '🧭 Phân tích đề từng bước'}
    </button>
    <div id={noiDung} hidden={!mo}>{daMo && <HanhTrinh data={data}/>}</div>
  </div>;
}

