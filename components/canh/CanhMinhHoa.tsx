/**
 * FILE NÀY LÀM GÌ: Component React giao diện hiển thị và xử lý tương tác của người dùng trên trình duyệt.
 * AI DÙNG: học sinh
 * LẤY DỮ LIỆU TỪ: không truy vấn bảng trực tiếp
 * GỌI TỚI: @/lib/anhMinhHoa, ./index, ./hinh-hoc
 */
import { ANH_MINH_HOA } from '@/lib/anhMinhHoa';
import { CANH } from './index';
import { NanHoa3D } from './hinh-hoc';
import './canh.css';

/**
 * Component React `CanhMinhHoa`: nhận props (thuộc tính truyền vào từ component cha) và dựng giao diện tương ứng.
 */
export function CanhMinhHoa({ id, goc }: { id: string; goc?: number }) {
  const a = ANH_MINH_HOA[id];
  if (!a) return null;
  if ('ve' in a) return <NanHoa3D id={id} mo={a.mo} n={a.n} goc={goc}/>;
  const Canh = CANH[a.anh];
  return Canh ? <Canh id={id} mo={a.mo}/> : <img src={`/minh-hoa/cau/${a.anh}.webp`} alt={a.mo} loading="lazy" decoding="async" width={768} height={512}/>;
}

