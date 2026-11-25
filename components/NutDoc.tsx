'use client';

/**
 * FILE NÀY LÀM GÌ: Component React giao diện hiển thị và xử lý tương tác của người dùng trên trình duyệt.
 * AI DÙNG: học sinh
 * LẤY DỮ LIỆU TỪ: không truy vấn bảng trực tiếp
 * GỌI TỚI: @/lib/docThanhLoi, @/lib/giongDoc
 */
import { useEffect, useRef, useState } from 'react';
import { docThanhLoi } from '@/lib/docThanhLoi';
import { layTocDo } from '@/lib/giongDoc';

/**
 * Nút loa đọc to đề bài bằng giọng có sẵn của trình duyệt (Web Speech API).
 * Không gửi chữ đi đâu, không tốn tiền. Máy không có giọng tiếng Việt thì nút báo cho em biết.
 */
export default function NutDoc({ text, nhan = 'Đọc đề', gon = false }: { text: string; nhan?: string; gon?: boolean }) {
  const [coThe, setCoThe] = useState(false);
  const [dangDoc, setDangDoc] = useState(false);
  const [bao, setBao] = useState('');
  const giong = useRef<SpeechSynthesisVoice | null>(null);

  useEffect(() => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;
    setCoThe(true);
    const chon = () => {
      const ds = window.speechSynthesis.getVoices();
      // Biểu thức chính quy (regex) kiểm tra hoặc tách chuỗi đúng mẫu dữ liệu
      giong.current = ds.find((v) => /^vi/i.test(v.lang) && /google|online|natural/i.test(v.name)) ?? ds.find((v) => /^vi/i.test(v.lang)) ?? null;
    };
    chon();
    window.speechSynthesis.addEventListener?.('voiceschanged', chon);
    return () => { window.speechSynthesis.removeEventListener?.('voiceschanged', chon); window.speechSynthesis.cancel(); };
  }, []);

  if (!coThe) return null;

  const bam = () => {
    const ss = window.speechSynthesis;
    if (dangDoc) { ss.cancel(); setDangDoc(false); return; }
    ss.cancel();
    const u = new SpeechSynthesisUtterance(docThanhLoi(text));
    u.lang = 'vi-VN'; u.rate = 0.9 * layTocDo();
    try { if (giong.current) u.voice = giong.current; } catch { /* dùng giọng mặc định */ }
    if (!giong.current) setBao('Máy này chưa có giọng đọc tiếng Việt, giọng nghe có thể lạ. Em nhờ người lớn cài thêm giọng Tiếng Việt trong phần Cài đặt ngôn ngữ.');
    u.onend = () => setDangDoc(false);
    u.onerror = () => setDangDoc(false);
    setDangDoc(true);
    ss.speak(u);
  };

  return (
    <span className="nut-doc">
      <button type="button" data-phim-doc="" onClick={bam} aria-pressed={dangDoc} aria-label={dangDoc ? 'Dừng đọc' : nhan} title={dangDoc ? 'Dừng đọc' : 'Đọc to đề bài'}>
        <span aria-hidden="true">{dangDoc ? '⏹' : gon ? '🗣️' : '🔊'}</span> {!gon && (dangDoc ? 'Dừng' : nhan)}
      </button>
      {bao && <small role="status">{bao}</small>}
    </span>
  );
}
