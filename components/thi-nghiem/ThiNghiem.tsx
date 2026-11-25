'use client';
/**
 * FILE NÀY LÀM GÌ: Các component tương tác trực quan của phòng thí nghiệm Thử tay giúp học sinh tự kéo thanh trượt và rút ra quy tắc Toán 9.
 * AI DÙNG: học sinh
 * LẤY DỮ LIỆU TỪ: không truy vấn bảng trực tiếp
 * GỌI TỚI: @/components/tro-choi-nen/amThanh, @/components/truc-quan/NutAmHieuUng, @/components/truc-quan/PhanHoiDung, @/components/NhanVat, @/components/MathText, ./Khung, @/lib/thiNghiem
 */
import { phat } from '@/components/tro-choi-nen/amThanh';
import NutAmHieuUng from '@/components/truc-quan/NutAmHieuUng';
import { TichVang } from '@/components/truc-quan/PhanHoiDung';
import NhanVat from '@/components/NhanVat';
import { useRef, useState } from 'react';
import MathText from '@/components/MathText';
import { VeKhung } from './Khung';
import type { ThiNghiem as TN } from '@/lib/thiNghiem';
import './thi-nghiem.css';

/**
 * Một thí nghiệm "Thử tay": học sinh thao tác trên khung, rồi trả lời "Em thấy gì?".
 * Khi nộp: ghi sự kiện thi_nghiem { chon, dung, thao_tac, ghi } (chỉ học sinh) và báo bước 'thu-tay' đã xong.
 * chieu = chế độ chiếu lên lớp (chữ to, ẩn phần trả lời của học sinh).
 */
export default function ThiNghiem({ tn, ghi = false, chieu = false }: { tn: TN; ghi?: boolean; chieu?: boolean }) {
  const [thaoTac, setThaoTac] = useState(0);
  const [chon, setChon] = useState<number | null>(null);
  const [daNop, setDaNop] = useState(false);
  const [ghiChu, setGhiChu] = useState('');
  const batDau = useRef(Date.now());

  const nop = () => {
    if (chon == null) return;
    if (chon === tn.cauHoi.dung && !chieu) phat('dung');
    setDaNop(true);
    window.dispatchEvent(new CustomEvent('f9-buoc-xong', { detail: 'thu-tay' }));
    if (!ghi) return;
    const body = JSON.stringify({ events: [{
      type: 'thi_nghiem', kuId: tn.ku,
      payload: { chon, dung: chon === tn.cauHoi.dung, thao_tac: thaoTac, giay: Math.round((Date.now() - batDau.current) / 1000), ghi: ghiChu.trim().slice(0, 300) }
    }] });
    fetch('/api/events', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body, keepalive: true }).catch(() => {});
  };

  return (
    <section className={`tn${chieu ? ' tn--chieu' : ''}`} aria-labelledby={`tn-${tn.ku}`}>
      <header className="tn-dau">
        {!chieu && <NutAmHieuUng/>}
        <p className="tn-nhan">🧪 Thử tay</p>
        <h2 id={`tn-${tn.ku}`}><MathText inline>{tn.ten}</MathText></h2>
        <p className="tn-viec"><MathText>{tn.viec}</MathText></p>
      </header>

      <div className="tn-khung">
        <VeKhung khung={tn.khung} onThaoTac={() => setThaoTac((n) => n + 1)} />
      </div>
      {tn.goiY && <p className="tn-goi-y">💡 <MathText>{tn.goiY}</MathText></p>}

      <div className="tn-hoi">
        <h3>Em thấy gì?</h3>
        <p><MathText>{tn.cauHoi.hoi}</MathText></p>
        <div className="tn-lua-chon" role="radiogroup" aria-label="Chọn câu trả lời">
          {tn.cauHoi.luaChon.map((l, i) => {
            const trangThai = daNop ? (i === tn.cauHoi.dung ? ' tn-lc--dung' : i === chon ? ' tn-lc--sai' : '') : '';
            return (
              <button key={i} type="button" role="radio" aria-checked={chon === i} disabled={daNop}
                className={`tn-lc${chon === i ? ' tn-lc--chon' : ''}${trangThai}`} onClick={() => setChon(i)}>
                <span className="tn-lc__chu">{'ABCD'[i]}</span> <MathText inline>{l}</MathText>
              </button>
            );
          })}
        </div>
        {!chieu && !daNop && (
          <details className="tn-ghi-mo">
            <summary>✍️ Ghi lại điều em nhận ra / hỏi thầy cô</summary>
            <label className="tn-ghi">
              <span className="sr-only">Ghi chú (không bắt buộc)</span>
              <textarea rows={2} maxLength={300} value={ghiChu} onChange={(e) => setGhiChu(e.target.value)} />
            </label>
          </details>
        )}
        {!daNop ? (
          <button type="button" className="primary" disabled={chon == null} onClick={nop}>{chieu ? 'Xem đáp án' : 'Nộp câu trả lời'}</button>
        ) : (
          <div className={`tn-giai-thich ${chon === tn.cauHoi.dung ? 'tn-giai-thich--dung' : ''}`} role="status">
            {chon !== tn.cauHoi.dung && <NhanVat loi="sai" chuong={tn.ku} compact/>}
            <p><b>{chon === tn.cauHoi.dung ? <><TichVang/> Đúng rồi!</> : `✖️ Chưa đúng. Đáp án là ${'ABCD'[tn.cauHoi.dung]}.`}</b></p>
            <p><MathText>{tn.cauHoi.giaiThich}</MathText></p>
            <button type="button" className="tn-lam-lai" onClick={() => { setDaNop(false); setChon(null); }}>Thử lại câu hỏi</button>
          </div>
        )}
      </div>
    </section>
  );
}
