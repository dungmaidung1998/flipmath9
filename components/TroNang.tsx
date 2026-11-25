'use client';

/**
 * FILE NÀY LÀM GÌ: Component React giao diện hiển thị và xử lý tương tác của người dùng trên trình duyệt.
 * AI DÙNG: học sinh
 * LẤY DỮ LIỆU TỪ: không truy vấn bảng trực tiếp
 * GỌI TỚI: @/lib/docThanhLoi, @/lib/giongDoc
 */
import { useEffect, useRef, useState } from 'react';
import { docThanhLoi } from '@/lib/docThanhLoi';
import { chonGiong, coGiongDoc, layTocDo, datTocDo, TOC_DO } from '@/lib/giongDoc';

/**
 * THANH TRỢ NĂNG cho học sinh nhìn kém:
 * - Phóng to chữ (4 mức), tương phản cao, khoảng cách dòng rộng.
 * - Đọc cả trang (bỏ qua menu, nút bấm), đọc đoạn em bôi đen, đọc chậm hoặc vừa.
 * Cài đặt lưu trên máy em (localStorage); đọc bằng giọng có sẵn của trình duyệt, không gửi chữ đi đâu.
 */
type CaiDat = { co: number; tuongPhan: boolean; dongRong: boolean };
const MAC_DINH: CaiDat = { co: 0, tuongPhan: false, dongRong: false };
const KHOA = 'f9-tro-nang';
const CO = ['Vừa', 'Lớn', 'Rất lớn', 'Cực lớn'];

/**
 * Component React `apDung`: nhận props (thuộc tính truyền vào từ component cha) và dựng giao diện tương ứng.
 */
function apDung(c: CaiDat) {
  const h = document.documentElement;
  h.dataset.coChu = String(c.co);
  if (c.tuongPhan) h.dataset.tuongPhan = '1'; else delete h.dataset.tuongPhan;
  if (c.dongRong) h.dataset.dongRong = '1'; else delete h.dataset.dongRong;
}

const KHOI = new Set(['P', 'DIV', 'LI', 'H1', 'H2', 'H3', 'H4', 'TR', 'TD', 'TH', 'LEGEND', 'LABEL', 'SECTION', 'ARTICLE', 'FIGCAPTION', 'SUMMARY', 'BR', 'UL', 'OL', 'TABLE', 'FIELDSET']);
const BO_QUA = 'script,style,nav,.topnav,.tro-nang,.nhac-nghi,.hoi-bin,[aria-hidden="true"],.katex-html,svg,button,select,.sr-only';

/** Lấy chữ của vùng nội dung chính; công thức KaTeX lấy lại mã TeX để đọc thành lời. */
export function layChuDeDoc(goc: Element): string {
  const out: string[] = [];
  const di = (n: Node) => {
    if (n.nodeType === Node.TEXT_NODE) { out.push(n.textContent ?? ''); return; }
    if (n.nodeType !== Node.ELEMENT_NODE) return;
    const el = n as Element;
    if (el.classList.contains('katex')) {
      const tex = el.querySelector('annotation')?.textContent;
      if (tex) out.push(' $' + tex + '$ ');
      return;
    }
    if (el.matches(BO_QUA)) return;
    if (el instanceof HTMLElement && el.hidden) return;
    if (el instanceof HTMLImageElement) { if (el.alt) out.push(' ' + el.alt + '. '); return; }
    if (el instanceof HTMLInputElement) { if (el.value && el.type !== 'hidden' && el.type !== 'radio') out.push(' ' + el.value + ' '); return; }
    const khoi = KHOI.has(el.tagName);
    if (khoi) out.push('. ');
    el.childNodes.forEach(di);
    if (khoi) out.push('. ');
  };
  di(goc);
  // Biểu thức chính quy (regex) kiểm tra hoặc tách chuỗi đúng mẫu dữ liệu
  return out.join('').replace(/\s+/g, ' ').replace(/(\s*\.\s*){2,}/g, '. ').replace(/^[\s.]+/, '').trim();
}

/** Chia câu dài thành đoạn ngắn: giọng đọc trình duyệt hay tắt giữa chừng nếu một lần đọc quá dài. */
function chiaDoan(s: string, toiDa = 180): string[] {
  // Biểu thức chính quy (regex) kiểm tra hoặc tách chuỗi đúng mẫu dữ liệu
  const cau = s.split(/(?<=[.!?;:])\s+/);
  const ra: string[] = [];
  let cur = '';
  for (const c of cau) {
    if ((cur + ' ' + c).length > toiDa && cur) { ra.push(cur); cur = c; } else cur = cur ? cur + ' ' + c : c;
    while (cur.length > toiDa * 1.5) { const k = cur.lastIndexOf(',', toiDa) > 40 ? cur.lastIndexOf(',', toiDa) + 1 : toiDa; ra.push(cur.slice(0, k)); cur = cur.slice(k).trim(); }
  }
  if (cur.trim()) ra.push(cur);
  // Biểu thức chính quy (regex) kiểm tra hoặc tách chuỗi đúng mẫu dữ liệu
  return ra.filter((x) => /[\p{L}\d]/u.test(x));
}

/**
 * Component React `TroNang`: nhận props (thuộc tính truyền vào từ component cha) và dựng giao diện tương ứng.
 */
export default function TroNang() {
  const [mo, setMo] = useState(false);
  const [c, setC] = useState<CaiDat>(MAC_DINH);
  const [dangDoc, setDangDoc] = useState<'' | 'trang' | 'chon'>('');
  const [bao, setBao] = useState('');
  const dung = useRef(false);
  const [coDoc, setCoDoc] = useState(false);
  const [tocDo, setTocDo] = useState(1);
  const [docKhiChon, setDocKhiChon] = useState(false);

  useEffect(() => {
    let luu = MAC_DINH;
    try { const s = localStorage.getItem(KHOA); if (s) luu = { ...MAC_DINH, ...JSON.parse(s) }; } catch { /* bỏ qua */ }
    setC(luu); apDung(luu); setCoDoc(coGiongDoc()); setTocDo(layTocDo());
    try { setDocKhiChon(localStorage.getItem('f9-doc-khi-chon') === '1'); } catch { /* bỏ qua */ }
    const doiToc = (e: Event) => setTocDo((e as CustomEvent).detail);
    const docTrangSk = () => docTrangRef.current();
    const ngungSk = () => ngungRef.current();
    window.addEventListener('f9-toc-do', doiToc);
    window.addEventListener('f9-doc-trang', docTrangSk);
    window.addEventListener('f9-ngung-doc', ngungSk);
    const thoat = (e: KeyboardEvent) => { if (e.key === 'Escape') { setMo(false); } };
    window.addEventListener('keydown', thoat);
    return () => { window.removeEventListener('keydown', thoat); window.removeEventListener('f9-toc-do', doiToc); window.removeEventListener('f9-doc-trang', docTrangSk); window.removeEventListener('f9-ngung-doc', ngungSk); if (coGiongDoc()) window.speechSynthesis.cancel(); };
  }, []);

  const doi = (moi: Partial<CaiDat>) => {
    const n = { ...c, ...moi };
    setC(n); apDung(n);
    try { localStorage.setItem(KHOA, JSON.stringify(n)); } catch { /* bỏ qua */ }
  };

  const ngung = () => { dung.current = true; if (coGiongDoc()) window.speechSynthesis.cancel(); setDangDoc(''); };

  const doc = (chu: string, kieu: 'trang' | 'chon') => {
    if (!coGiongDoc()) return;
    const ss = window.speechSynthesis;
    ss.cancel(); dung.current = false;
    const doan = chiaDoan(docThanhLoi(chu));
    if (!doan.length) { setBao('Không có chữ để đọc.'); return; }
    const giong = chonGiong('vi-VN');
    setBao(giong ? '' : 'Máy chưa có giọng tiếng Việt, giọng đọc có thể lạ. Nhờ người lớn cài giọng Tiếng Việt trong Cài đặt ngôn ngữ.');
    setDangDoc(kieu);
    let i = 0;
    const tiep = () => {
      if (dung.current || i >= doan.length) { setDangDoc(''); return; }
      const u = new SpeechSynthesisUtterance(doan[i++]);
      u.lang = 'vi-VN'; u.rate = 0.9 * layTocDo();
      try { if (giong) u.voice = giong; } catch { /* dùng giọng mặc định */ }
      u.onend = tiep; u.onerror = () => setDangDoc('');
      ss.speak(u);
    };
    tiep();
  };

  const docTrang = () => {
    const vung = document.querySelector('.learning-screen') ?? document.querySelector('main') ?? document.querySelector('.wrap') ?? document.body;
    doc(layChuDeDoc(vung), 'trang');
  };
  const docTrangRef = useRef(docTrang); docTrangRef.current = docTrang;
  const ngungRef = useRef(ngung); ngungRef.current = ngung;

  const docChon = () => {
    const sel = window.getSelection();
    if (!sel || sel.isCollapsed) { setBao('Em bôi đen (chọn) một đoạn chữ trên trang trước, rồi bấm lại nút này.'); return; }
    const khung = document.createElement('div');
    for (let k = 0; k < sel.rangeCount; k++) khung.appendChild(sel.getRangeAt(k).cloneContents());
    doc(layChuDeDoc(khung) || sel.toString(), 'chon');
  };

  return (
    <div className="tro-nang">
      <button type="button" className="tro-nang__mo" aria-expanded={mo} aria-controls="tro-nang-bang" onClick={() => setMo(!mo)}
        title="Trợ năng: phóng to chữ, đọc to trang">
        <span aria-hidden="true">👁️</span> <span className="tro-nang__chu">Trợ năng</span>
      </button>
      {dangDoc && !mo && <button type="button" className="tro-nang__dung-nhanh" onClick={ngung}>⏹ Dừng đọc</button>}
      {mo && (
        <div id="tro-nang-bang" className="tro-nang__bang" role="dialog" aria-label="Trợ năng">
          <div className="tro-nang__nhom">
            <p className="tro-nang__nhan">Cỡ chữ: <b>{CO[c.co]}</b></p>
            <div className="tro-nang__hang">
              <button type="button" onClick={() => doi({ co: Math.max(0, c.co - 1) })} disabled={c.co === 0} aria-label="Thu nhỏ chữ">A−</button>
              <button type="button" onClick={() => doi({ co: Math.min(3, c.co + 1) })} disabled={c.co === 3} aria-label="Phóng to chữ" className="to">A+</button>
            </div>
          </div>
          <div className="tro-nang__nhom">
            <label className="tro-nang__bat"><input type="checkbox" checked={c.tuongPhan} onChange={(e) => doi({ tuongPhan: e.target.checked })} /> Tương phản cao</label>
            <label className="tro-nang__bat"><input type="checkbox" checked={c.dongRong} onChange={(e) => doi({ dongRong: e.target.checked })} /> Giãn dòng, giãn chữ</label>
          </div>
          {coDoc && (
            <div className="tro-nang__nhom">
              <p className="tro-nang__nhan">Đọc to</p>
              <div className="tro-nang__hang">
                {dangDoc ? <button type="button" className="primary" onClick={ngung}>⏹ Dừng đọc</button> : <>
                  <button type="button" className="primary" onClick={docTrang}>🔊 Đọc cả trang</button>
                  <button type="button" onClick={docChon}>🔊 Đọc đoạn đã chọn</button>
                </>}
              </div>
              <label className="tro-nang__bat"><input type="checkbox" checked={docKhiChon} onChange={(e) => { setDocKhiChon(e.target.checked); try { localStorage.setItem('f9-doc-khi-chon', e.target.checked ? '1' : ''); } catch { /* bỏ qua */ } }} /> Tự đọc phương án khi em chọn tới</label>
              <label className="tro-nang__bat">Tốc độ
                <select value={tocDo} onChange={(e) => { const v = Number(e.target.value); datTocDo(v); setTocDo(v); }}>
                  {TOC_DO.map((v) => <option key={v} value={v}>{v === 1 ? 'Vừa (1×)' : v < 1 ? `Chậm (${String(v).replace('.', ',')}×)` : `Nhanh (${String(v).replace('.', ',')}×)`}</option>)}
                </select>
              </label>
            </div>
          )}
          <details className="tro-nang__phim">
            <summary>Phím tắt khi làm bài</summary>
            <ul>
              <li><kbd>R</kbd> đọc lại đề · <kbd>Alt</kbd>+<kbd>R</kbd> đọc cả trang</li>
              <li><kbd>1</kbd>–<kbd>4</kbd> chọn phương án · <kbd>Enter</kbd> / <kbd>N</kbd> câu tiếp hoặc nộp</li>
              <li><kbd>H</kbd> mở gợi ý · <kbd>[</kbd> <kbd>]</kbd> chậm / nhanh · <kbd>Esc</kbd> dừng đọc</li>
            </ul>
          </details>
          {bao && <p className="tro-nang__bao" role="status">{bao}</p>}
          <div className="tro-nang__hang tro-nang__cuoi">
            <button type="button" onClick={() => doi(MAC_DINH)}>Về mặc định</button>
            <button type="button" onClick={() => setMo(false)}>Đóng</button>
          </div>
        </div>
      )}
    </div>
  );
}
