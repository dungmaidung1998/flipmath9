'use client';

/**
 * FILE NÀY LÀM GÌ: Component React giao diện hiển thị và xử lý tương tác của người dùng trên trình duyệt.
 * AI DÙNG: học sinh
 * LẤY DỮ LIỆU TỪ: không truy vấn bảng trực tiếp
 * GỌI TỚI: @/components/MathText
 */
import { useEffect, useRef, useState } from 'react';
import { usePathname } from 'next/navigation';
import MathText from '@/components/MathText';
import './hoi-bin.css';

type MucHoiBin = {
  id: string;
  ku_id: string | null;
  cau_hoi: string;
  trang_thai: 'cho' | 'da-tra-loi' | 'tu-choi';
  tra_loi: string | null;
  nguon: 'gv' | 'ai-duyet' | 'ai-truc-tiep' | null;
  tao_luc: string;
};

/**
 * Component React `HoiBinWidget`: nhận props (thuộc tính truyền vào từ component cha) và dựng giao diện tương ứng.
 */
export default function HoiBinWidget() {
  const pathname = usePathname();
  const [mo, setMo] = useState(false);
  const [dangTai, setDangTai] = useState(false);
  const [daTai, setDaTai] = useState(false);
  const [items, setItems] = useState<MucHoiBin[]>([]);
  const [conLai, setConLai] = useState<number>(10);
  const [cauHoi, setCauHoi] = useState('');
  const [dangGui, setDangGui] = useState(false);
  const [loi, setLoi] = useState('');
  const [chuaSanSang, setChuaSanSang] = useState(false);
  const luongRef = useRef<HTMLDivElement>(null);

  // Biểu thức chính quy (regex) kiểm tra hoặc tách chuỗi đúng mẫu dữ liệu
  const kuMatch = pathname?.match(/^\/hoc\/([^/]+)/);
  const kuHienTai = kuMatch ? decodeURIComponent(kuMatch[1]) : null;

  async function taiLichSu() {
    setDangTai(true);
    setLoi('');
    try {
      const res = await fetch('/api/hoi-bin', { cache: 'no-store' });
      const json = await res.json();
      if (!res.ok) throw new Error(json?.error || 'Không tải được mục Hỏi Bin.');
      setItems(json.items ?? []);
      setConLai(typeof json.conLai === 'number' ? json.conLai : 10);
      setChuaSanSang(Boolean(json.chuaSanSang));
      setDaTai(true);
    } catch (e: any) {
      setLoi(e?.message || 'Không tải được dữ liệu.');
    } finally {
      setDangTai(false);
    }
  }

  useEffect(() => {
    if (mo && !daTai) taiLichSu();
  }, [mo, daTai]);

  useEffect(() => {
    if (mo && luongRef.current) {
      luongRef.current.scrollTop = luongRef.current.scrollHeight;
    }
  }, [mo, items]);

  async function guiCauHoi(e: React.FormEvent) {
    e.preventDefault();
    const text = cauHoi.trim();
    if (!text || dangGui) return;
    setDangGui(true);
    setLoi('');
    try {
      const res = await fetch('/api/hoi-bin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ cauHoi: text, kuId: kuHienTai })
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json?.error || 'Không gửi được câu hỏi.');
      setCauHoi('');
      if (typeof json.conLai === 'number') setConLai(json.conLai);
      if (json.item) {
        setItems((cu) => [...cu, json.item]);
      } else {
        await taiLichSu();
      }
    } catch (err: any) {
      setLoi(err?.message || 'Có lỗi khi gửi câu hỏi.');
    } finally {
      setDangGui(false);
    }
  }

  const soDaTraLoi = items.filter((x) => x.trang_thai === 'da-tra-loi').length;

  return (
    <div className="hoi-bin">
      {!mo ? (
        <button
          type="button"
          className="hoi-bin__nut"
          onClick={() => setMo(true)}
          aria-label="Mở hộp thoại Hỏi Bin"
        >
          <span aria-hidden="true">🤖</span>
          <span>Hỏi Bin</span>
          {soDaTraLoi > 0 && <span className="hoi-bin__badge">{soDaTraLoi}</span>}
        </button>
      ) : (
        <section className="hoi-bin__hop" aria-label="Hỏi Bin trợ lí Toán 9">
          <header className="hoi-bin__dau">
            <div>
              <b>🤖 Hỏi Bin · Toán 9</b>
              <small>Còn {conLai}/10 câu hỏi hôm nay{kuHienTai ? ` · ${kuHienTai}` : ''}</small>
            </div>
            <div style={{ display: 'flex', gap: 6 }}>
              <button
                type="button"
                className="hoi-bin__dong"
                onClick={taiLichSu}
                title="Làm mới phản hồi từ thầy cô"
                aria-label="Làm mới"
              >
                ↻
              </button>
              <button
                type="button"
                className="hoi-bin__dong"
                onClick={() => setMo(false)}
                aria-label="Đóng Hỏi Bin"
              >
                ✕
              </button>
            </div>
          </header>

          <div className="hoi-bin__luong" ref={luongRef}>
            <p className="hoi-bin__chao">
              Chào em! Hãy hỏi về cách làm, công thức hoặc lỗi bài Toán 9. Bin sẽ trả lời gợi mở ngay từ ngân hàng hoặc AI (Gemini) và thầy cô luôn xem lại được.
            </p>

            {chuaSanSang && (
              <p className="hoi-bin__chao">Thầy cô chưa kích hoạt bảng Hỏi Bin trên cơ sở dữ liệu.</p>
            )}

            {dangTai && items.length === 0 && <p className="nho">Đang tải lịch sử...</p>}

            {items.map((m) => (
              <div key={m.id} className="hoi-bin__muc">
                <div className="hoi-bin__hs">{m.cau_hoi}</div>
                {m.trang_thai === 'cho' && (
                  <div className="hoi-bin__tl hoi-bin__tl--cho">
                    Bin đã chuyển câu hỏi cho thầy cô, em sẽ nhận trả lời trong mục Hỏi Bin.
                  </div>
                )}
                {m.trang_thai === 'da-tra-loi' && m.tra_loi && (
                  <div className="hoi-bin__tl">
                    <MathText>{m.tra_loi}</MathText>
                    <p className="hoi-bin__nguon">
                      {m.nguon === 'ai-truc-tiep'
                        ? '🤖 Bạn đang nhận phản hồi trực tiếp từ AI (Gemini) — thầy cô vẫn xem lại được câu hỏi này.'
                        : m.nguon === 'ai-duyet'
                          ? 'Câu trả lời này được soạn với sự hỗ trợ của AI, thầy cô đã duyệt.'
                          : 'Thầy cô đã trả lời và duyệt.'}
                    </p>
                  </div>
                )}
                {m.trang_thai === 'tu-choi' && (
                  <div className="hoi-bin__tl hoi-bin__tl--cho">
                    {m.tra_loi || 'Thầy cô đề nghị em hỏi rõ hơn vào nội dung Toán 9.'}
                  </div>
                )}
              </div>
            ))}
          </div>

          {loi && <p className="hoi-bin__loi" role="alert">{loi}</p>}

          {/* Khối giao diện: Biểu mẫu nhập liệu */}
          <form className="hoi-bin__form" onSubmit={guiCauHoi}>
            <textarea
              rows={2}
              value={cauHoi}
              onChange={(e) => setCauHoi(e.target.value)}
              placeholder="Ví dụ: Em hay nhầm dấu khi thế y vào phương trình (2)..."
              disabled={dangGui || conLai <= 0}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  guiCauHoi(e as unknown as React.FormEvent);
                }
              }}
            />
            <button type="submit" disabled={dangGui || !cauHoi.trim() || conLai <= 0}>
              {dangGui ? '...' : 'Gửi'}
            </button>
          </form>
        </section>
      )}
    </div>
  );
}
