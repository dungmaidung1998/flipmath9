'use client';
/**
 * FILE NÀY LÀM GÌ: Component React giao diện hiển thị và xử lý tương tác của người dùng trên trình duyệt.
 * AI DÙNG: học sinh
 * LẤY DỮ LIỆU TỪ: không truy vấn bảng trực tiếp
 * GỌI TỚI: @/components/tro-choi-nen/amThanh
 */
import { useSyncExternalStore } from 'react';
import { amThanh, datHieuUng, theoDoiHieuUng } from '@/components/tro-choi-nen/amThanh';

/**
 * Component React `NutAmHieuUng`: nhận props (thuộc tính truyền vào từ component cha) và dựng giao diện tương ứng.
 */
export default function NutAmHieuUng({ className = '' }: { className?:string }) {
  const bat = useSyncExternalStore(theoDoiHieuUng, () => amThanh.hieuUng, () => true);
  return <button type="button" className={'nut-am-hieu-ung ' + className} aria-pressed={bat}
    title={bat ? 'Tắt âm thanh phản hồi' : 'Bật âm thanh phản hồi'} aria-label={bat ? 'Tắt âm thanh phản hồi' : 'Bật âm thanh phản hồi'} onClick={() => datHieuUng(!bat)}>
    <span aria-hidden="true">{bat ? '🔊' : '🔇'}</span>
  </button>;
}

