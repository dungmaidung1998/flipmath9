'use client';
/**
 * FILE NÀY LÀM GÌ: Component React giao diện hiển thị và xử lý tương tác của người dùng trên trình duyệt.
 * AI DÙNG: học sinh
 * LẤY DỮ LIỆU TỪ: không truy vấn bảng trực tiếp
 * GỌI TỚI: ./MathText, ../lib/minhHoa
 */
import { useState } from 'react';
import MathText from './MathText';
import { hinhNhanVat } from '../lib/minhHoa';

type Tang = { tang: number; tenTang: string; noiDung: string };

/**
 * Gợi ý 3 tầng tối giản cho học sinh: Định hướng -> Gợi mở -> Quy tắc
 */
export default function GoiY({ questionId }: { questionId: string }) {
  const [tangs, setTangs] = useState<Tang[]>([]);
  const [het, setHet] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function mo() {
    setBusy(true);
    try {
      const res = await fetch('/api/goi-y', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ questionId })
      });
      const d = await res.json();
      setBusy(false);
      if (d.noiDung) {
        setTangs((t) => [...t, { tang: d.tang, tenTang: d.tenTang, noiDung: d.noiDung }]);
        if (!d.conTang) setHet('Đây là gợi ý cuối cùng cho câu này.');
      } else {
        setHet(d.thongBao ?? d.error ?? 'Chưa mở được gợi ý.');
      }
    } catch {
      setHet('Không kết nối được gợi ý.');
    } finally {
      setBusy(false);
    }
  }

  const getTierName = (tang: number) => {
    if (tang === 1) return '🔍 Tầng 1: Định hướng';
    if (tang === 2) return '⚖️ Tầng 2: Gợi mở';
    return '📖 Tầng 3: Quy tắc';
  };

  return (
    <div className="tang-accordion" style={{ marginTop: 10, textAlign: 'left' }}>
      {tangs.length > 0 && <img className="goi-y-hinh" src={hinhNhanVat('goi-y')} alt="" width={120} height={180} />}
      {tangs.map((t) => (
        <div className="tang-card" key={t.tang} style={{ marginBottom: 10 }}>
          <div className="tang-header" style={{ padding: '8px 12px', fontSize: 13 }}>
            <span>{getTierName(t.tang)} · {t.tenTang}</span>
          </div>
          <div className="tang-body" style={{ padding: '12px 14px', fontSize: 14.5 }}>
            <MathText>{t.noiDung}</MathText>
          </div>
        </div>
      ))}

      {het && (
        <p style={{ margin: '8px 0', fontSize: 13, color: 'var(--muted)', fontStyle: 'italic' }}>
          💡 {het}
        </p>
      )}

      {!het && (
        <button
          type="button"
          onClick={mo}
          disabled={busy}
          className="action-link"
          style={{ fontSize: 13.5, padding: '7px 14px' }}
        >
          {busy ? 'Đang mở…' : tangs.length === 0 ? '💡 Xem gợi ý trợ giúp' : `Xem tiếp gợi ý Tầng ${tangs.length + 1}/3 →`}
        </button>
      )}
    </div>
  );
}
