'use client';

/**
 * FILE NÀY LÀM GÌ: Component React giao diện hiển thị và xử lý tương tác của người dùng trên trình duyệt.
 * AI DÙNG: học sinh
 * LẤY DỮ LIỆU TỪ: không truy vấn bảng trực tiếp
 * GỌI TỚI: @/lib/offlineQueue
 */
import { useEffect, useState } from 'react';
import { demBaiChoGui, dongBoHangDoi } from '@/lib/offlineQueue';

/**
 * Đăng ký Service Worker PWA cho học sinh và tự động gửi hàng đợi bài làm IndexedDB khi có mạng lại.
 */
export default function PwaDangKy() {
  const [offline, setOffline] = useState(false);
  const [choGui, setChoGui] = useState(0);
  const [thongBao, setThongBao] = useState('');

  useEffect(() => {
    try {
      setOffline(typeof navigator !== 'undefined' ? !navigator.onLine : false);
      if ('serviceWorker' in navigator) {
        navigator.serviceWorker.register('/sw.js').catch(() => {});
      }
    } catch {
      /* bỏ qua */
    }

    const capNhat = async () => {
      const n = await demBaiChoGui();
      setChoGui(n);
      if (typeof navigator !== 'undefined' && navigator.onLine && n > 0) {
        const kq = await dongBoHangDoi();
        setChoGui(kq.conLai);
        if (kq.daGui > 0) {
          setThongBao(`✅ Đã tự động gửi ${kq.daGui} bài làm lưu tạm khi mất mạng.`);
          window.setTimeout(() => setThongBao(''), 6000);
        }
      }
    };

    const onOnline = () => {
      setOffline(false);
      void capNhat();
    };
    const onOffline = () => {
      setOffline(true);
      void demBaiChoGui().then(setChoGui);
    };
    const onQueued = () => {
      void demBaiChoGui().then(setChoGui);
    };

    void capNhat();
    window.addEventListener('online', onOnline);
    window.addEventListener('offline', onOffline);
    window.addEventListener('f9-offline-queued', onQueued);
    return () => {
      window.removeEventListener('online', onOnline);
      window.removeEventListener('offline', onOffline);
      window.removeEventListener('f9-offline-queued', onQueued);
    };
  }, []);

  if (!offline && choGui === 0 && !thongBao) return null;

  return (
    <div
      className="no-print"
      role="status"
      style={{
        position: 'fixed',
        left: 14,
        bottom: 14,
        zIndex: 45,
        maxWidth: 340,
        padding: '8px 12px',
        borderRadius: 10,
        background: offline ? '#fef3c7' : '#dcfce7',
        color: offline ? '#92400e' : '#166534',
        border: `1px solid ${offline ? '#f59e0b' : '#4ade80'}`,
        fontSize: 13,
        fontWeight: 600,
        boxShadow: '0 6px 18px rgba(0,0,0,0.12)',
      }}
    >
      {thongBao
        ? thongBao
        : offline
          ? `📡 Đang mất mạng${choGui ? ` · Có ${choGui} bài chờ gửi khi có mạng lại` : ' · Bài đã mở vẫn xem được'}`
          : `⏳ Có ${choGui} bài làm đang chờ đồng bộ…`}
    </div>
  );
}
