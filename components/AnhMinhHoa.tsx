'use client';
/**
 * FILE NÀY LÀM GÌ: Component React giao diện hiển thị và xử lý tương tác của người dùng trên trình duyệt.
 * AI DÙNG: học sinh
 * LẤY DỮ LIỆU TỪ: không truy vấn bảng trực tiếp
 * GỌI TỚI: @/lib/anhMinhHoa, @/components/canh/CanhMinhHoa
 */
import { useEffect, useState } from 'react';
import { ANH_MINH_HOA } from '@/lib/anhMinhHoa';
import { CanhMinhHoa } from '@/components/canh/CanhMinhHoa';

/**
 * Component React `AnhMinhHoa`: nhận props (thuộc tính truyền vào từ component cha) và dựng giao diện tương ứng.
 */
export default function AnhMinhHoa({ id }: { id?: string | null }) {
  if (!id || !Object.hasOwn(ANH_MINH_HOA, id)) return null;
  return <Hinh key={id} id={id}/>;
}

/**
 * Component React `Hinh`: nhận props (thuộc tính truyền vào từ component cha) và dựng giao diện tương ứng.
 */
function Hinh({ id }: { id: string }) {
  const a = ANH_MINH_HOA[id];
  const nan = 've' in a ? a.n : 0;
  const [to, setTo] = useState(false);
  const [goc, setGoc] = useState(0);
  useEffect(() => {
    if (!to) return;
    const dong = (e: KeyboardEvent) => { if (e.key === 'Escape') setTo(false); };
    window.addEventListener('keydown', dong);
    return () => window.removeEventListener('keydown', dong);
  }, [to]);

  return (
    <figure className={'anh-minh-hoa' + (nan ? ' nan-hoa' : '')}>
      <button type="button" className="anh-minh-hoa__nut" onClick={() => setTo(true)} aria-label={`Phóng to ảnh: ${a.mo}`}>
        <CanhMinhHoa id={id} goc={nan ? goc : undefined}/>
        <span className="anh-minh-hoa__kinh" aria-hidden="true">⤢</span>
      </button>
      {nan > 0 && <figcaption>
        <span>{nan} nan hoa chia đều{nan === 8 ? '. Hai nan tô màu là nan đầu và nan thứ tư.' : '.'}</span>
        <button type="button" onClick={() => setGoc(g => g + 360 / nan)}>🔄 Quay một nấc</button>
      </figcaption>}
      {to && (
        <div className="anh-to" role="dialog" aria-modal="true" aria-label={a.mo} onClick={() => setTo(false)}>
          <CanhMinhHoa id={id} goc={nan ? goc : undefined}/>
          <button type="button" className="anh-to__dong" onClick={() => setTo(false)}>✕ Đóng</button>
        </div>
      )}
    </figure>
  );
}

