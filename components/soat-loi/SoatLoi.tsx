'use client';
/**
 * FILE NÀY LÀM GÌ: Component React giao diện hiển thị và xử lý tương tác của người dùng trên trình duyệt.
 * AI DÙNG: học sinh
 * LẤY DỮ LIỆU TỪ: không truy vấn bảng trực tiếp
 * GỌI TỚI: @/components/tro-choi-nen/amThanh, @/components/DuongCauHoi, @/components/DeCauHoi, @/components/DauCauHoi, @/components/truc-quan/NutAmHieuUng, @/components/truc-quan/PhanHoiDung, @/components/NhanVat, @/lib/tronPhuongAn
 */
import { phat, chuanBiAmHieuUng } from '@/components/tro-choi-nen/amThanh';
import DuongCauHoi from '@/components/DuongCauHoi';
import DeCauHoi from '@/components/DeCauHoi';
import DauCauHoi from '@/components/DauCauHoi';
import NutAmHieuUng from '@/components/truc-quan/NutAmHieuUng';
import { TichVang } from '@/components/truc-quan/PhanHoiDung';
import NhanVat from '@/components/NhanVat';

import { nhanCua } from '@/lib/tronPhuongAn';
import { useEffect, useRef, useState } from 'react';
import MathText from '@/components/MathText';
import NutDoc from '@/components/NutDoc';
import QuestionFigure from '@/components/QuestionFigure';
import AnhMinhHoa from '@/components/AnhMinhHoa';
import LinhVatDaNang from '@/components/LinhVatDaNang';
import NutHanhTrinh from '@/components/HanhTrinh/NutHanhTrinh';
import { TEN_DANH_GIA, TEN_TRANG_THAI } from '@/lib/soatLoi';
import { tachLoi } from '@/lib/tachLoi';
import './soat-loi.css';

type Cau = { question_id: string; stem: string; hinh: unknown; loai: 'sua' | 'on-1' | 'on-2'; options: { option_key: string; option_text: string; nhan?: string }[] };
type KetQua = {
  ma: {
    error_code: string;
    loai: string;
    dung: number;
    tong: number;
    danhGia: keyof typeof TEN_DANH_GIA;
    trangThaiMoi: keyof typeof TEN_TRANG_THAI;
    hanMoi: string | null;
    moTa: string;
    saiLanThu?: number;
    goiY?: { tier: number; text: string; nguon: string }[];
  }[];
  cau: { question_id: string; dung: boolean; dapAn: string; chon: string | null }[];
  tiLeKhacPhuc: number;
};
type De = { luotId: number; daNop: boolean; cau: Cau[]; ketQua?: KetQua };

export const baoBuocXong = (buoc: string) => window.dispatchEvent(new CustomEvent('f9-buoc-xong', { detail: buoc }));
const ngayDep = (d: string | null) => d ? d.split('-').reverse().slice(0, 2).join('/') : '';

/**
 * BƯỚC 0 · SOÁT LỖI CŨ 🪤 (và ôn lỗi đến hạn).
 * Không gợi ý, không giới hạn giờ. Nộp xong hiện kết quả từng lỗi và ngày ôn kế tiếp.
 */
export default function SoatLoi({ kuId = null, hoat = true }: { kuId?: string | null; hoat?: boolean }) {
  const [tt, setTt] = useState<'tai' | 'khong-co' | 'lam' | 'ket-qua' | 'loi'>('tai');
  const [de, setDe] = useState<De | null>(null);
  const [i, setI] = useState(0);
  const [chon, setChon] = useState<Record<string, string>>({});
  const [kq, setKq] = useState<KetQua | null>(null);
  const [ban, setBan] = useState(false);
  const [bao, setBao] = useState('');
  const gio = useRef<Record<string, number>>({});
  const moLuc = useRef(Date.now());
  const daTai = useRef(false);

  useEffect(() => {
    if (!hoat || daTai.current) return;
    daTai.current = true;
    fetch('/api/soat-loi' + (kuId ? '?ku=' + encodeURIComponent(kuId) : ''))
      .then(async (r) => ({ ok: r.ok, d: await r.json() }))
      .then(({ ok, d }) => {
        if (!ok) { setBao(d.error ?? 'Chưa đọc được sổ lỗi.'); setTt('loi'); baoBuocXong('soat'); window.dispatchEvent(new Event('f9-soat-bo-qua')); return; }
        if (d.khongCo) { setTt('khong-co'); baoBuocXong('soat'); window.dispatchEvent(new Event('f9-soat-bo-qua')); return; }
        setDe(d);
        if (d.daNop) { setKq(d.ketQua ?? null); setTt('ket-qua'); baoBuocXong('soat'); window.dispatchEvent(new Event('f9-soat-bo-qua')); } else { setTt('lam'); moLuc.current = Date.now(); }
      })
      .catch(() => { setBao('Mất kết nối. Em tải lại trang để soát lỗi.'); setTt('loi'); baoBuocXong('soat'); });
  }, [hoat, kuId]);

  if (tt === 'tai') return <div className="card sl"><p className="hint">Đang xem sổ lỗi của em…</p></div>;
  if (tt === 'loi') return <div className="card sl"><p role="alert">{bao}</p><p className="hint">Em vẫn học tiếp được; lỗi cũ sẽ được soát ở lần sau.</p></div>;
  if (tt === 'khong-co') return (
    <div className="card sl sl-trong">
      <LinhVatDaNang loai="vooc" tuThe="co-vu" kichThuoc={96} chuyenDong />
      <h3>Không có lỗi cũ cần soát hôm nay 🎉</h3>
      <p>Em sang bước tiếp theo nhé.</p>
    </div>
  );

  if (tt === 'ket-qua') {
    const k = kq;
    if (!k) return <div className="card sl"><p>Hôm nay em đã soát lỗi xong rồi.</p></div>;
    const tenCau = new Map((de?.cau ?? []).map((c) => [c.question_id, c]));
    return (
      <div className="card sl">
        {/* Tối giản 22/11/2026: mỗi lỗi một dòng; lịch ôn lại chỉ nói một lần ở cuối. */}
        <h3>Khắc phục {k.ma.filter((m) => m.danhGia === 'da-khac-phuc').length}/{k.ma.length} lỗi cũ</h3>
        <ul className="sl-ma sl-ma--gon">
          {k.ma.map((m) => (
            <li key={m.error_code} className={'sl-ma--' + m.danhGia} title={m.trangThaiMoi === 'da-nho' || m.trangThaiMoi === 'can-sua' ? undefined : `${TEN_TRANG_THAI[m.trangThaiMoi].ten}: ôn lại ngày ${ngayDep(m.hanMoi)}`}>
              {/* Rút gọn 24/11/2026: chỉ hiện tên lỗi ngắn; giải thích và ví dụ bấm mới mở. */}
              {(() => { const [ngan, them] = tachLoi(m.moTa); return <>
                <span className="sl-ma__nhan">{TEN_DANH_GIA[m.danhGia]}</span>
                <span className="sl-ma__ten"><MathText>{ngan}</MathText></span>
                {them && <details className="sl-ma__them"><summary>Xem giải thích</summary><MathText>{them}</MathText></details>}
                {m.goiY && m.goiY.length > 0 && (
                  <div className="sl-goi-y">
                    <div className="sl-goi-y__dau">
                      <span>🤖 Gợi ý đã được thầy cô duyệt</span>
                      {m.saiLanThu && <span className="sl-goi-y__tang">Lần sai thứ {m.saiLanThu}</span>}
                    </div>
                    <div><MathText>{m.goiY[0].text}</MathText></div>
                    {m.goiY.length > 1 && (
                      <details className="sl-goi-y__them">
                        <summary>Xem gợi ý bước tiếp theo (Tầng 2–{m.goiY.length})</summary>
                        <ul>
                          {m.goiY.slice(1).map((g) => (
                            <li key={g.tier}><b>Tầng {g.tier}:</b> <MathText>{g.text}</MathText></li>
                          ))}
                        </ul>
                      </details>
                    )}
                    {m.goiY.some((g) => g.nguon === 'ai-duyet') && (
                      <p className="sl-goi-y__minh-bach">Gợi ý này được soạn với sự hỗ trợ của AI, thầy cô đã duyệt.</p>
                    )}
                  </div>
                )}
              </>; })()}
            </li>
          ))}
        </ul>
        {k.ma.some((m) => m.danhGia !== 'da-khac-phuc') && <p className="hint">Lỗi chưa khắc phục sẽ được hỏi lại ở lần soát sau.</p>}
        {k.cau.some(c => !c.dung) && <NhanVat loi="sai" chuong={kuId} compact />}
        <details className="sl-chua">
          <summary>Xem lại từng câu</summary>
          <ol>
            {k.cau.map((c) => { const q = tenCau.get(c.question_id); const o = (key: string | null) => q?.options.find((x) => x.option_key === key)?.option_text ?? ''; return (
              <li key={c.question_id} className={c.dung ? 'dung' : 'sai'}>
                {q && <p><MathText>{q.stem}</MathText></p>}
                <p>{c.dung ? <><TichVang/> Em chọn đúng: </> : <>✗ Em chọn <b>{c.chon ? nhanCua(q?.options ?? [], c.chon) : '—'}</b>{c.chon ? <>. <MathText>{o(c.chon)}</MathText></> : ''} · Đáp án đúng: </>}<b>{nhanCua(q?.options ?? [], c.dapAn)}</b>. <MathText>{o(c.dapAn)}</MathText></p>
              </li>); })}
          </ol>
        </details>
      </div>
    );
  }

  const ds = de!.cau;
  const c = ds[i];
  const du = ds.every((x) => chon[x.question_id]);
  const nop = async () => {
    setBan(true); setBao(''); chuanBiAmHieuUng();
    try {
      const r = await fetch('/api/soat-loi', { method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ luotId: de!.luotId, answers: ds.map((x) => ({ questionId: x.question_id, chosen: chon[x.question_id], timeSec: gio.current[x.question_id] ?? 0 })) }) });
      const d = await r.json();
      if (!r.ok) throw new Error(d.error);
      if ((d as KetQua).cau.some(c => c.dung)) phat('dung');
      setKq(d); setTt('ket-qua'); baoBuocXong('soat');
    } catch (e: any) { setBao(e?.message ?? 'Chưa nộp được. Em thử lại.'); }
    finally { setBan(false); }
  };
  const chonPa = (k: string) => {
    // Tính toán, làm tròn hoặc giới hạn giá trị theo công thức
    gio.current[c.question_id] = Math.round((Date.now() - moLuc.current) / 1000);
    setChon((p) => ({ ...p, [c.question_id]: k }));
  };
  const doi = (n: number) => { setI(n); moLuc.current = Date.now(); };

  return (
    <div className="card sl">

      <p className="sl-dau">
        <span className="sl-the">{c.loai === 'sua' ? '🪤 Soát lỗi cũ' : '⏳ Ôn lại lỗi đã sửa'}</span>
        <small>Không tính giờ</small>
      </p>
      <DuongCauHoi cau={ds} hienTai={i} daLam={id => !!chon[id]} denCau={doi} khoa={ban} toiDa={du ? ds.length - 1 : ds.findIndex(q => !chon[q.question_id])} chuong={kuId} />
      <fieldset disabled={ban} className="sl-cau">
        <legend className="quiz-stem cau-de"><DauCauHoi ma={c.question_id} chuong={kuId} viTri={i + 1} tong={ds.length} soDaLam={Object.keys(chon).length} daChon={!!chon[c.question_id]} /><DeCauHoi key={c.question_id} text={c.stem} /></legend>
        <QuestionFigure hinh={c.hinh} /><AnhMinhHoa id={c.question_id} />
        <NutHanhTrinh id={c.question_id} />
        <div className="quiz-cong-cu" role="group" aria-label="Công cụ câu hỏi"><NutAmHieuUng/><NutDoc gon text={[c.stem, ...c.options.map((o) => `Phương án ${o.nhan ?? o.option_key}. ${o.option_text}`)].join('. ')} /></div>
        <div className="sl-pa">
          {c.options.map((o) => (
            <label key={o.option_key} data-viec={{ A: 'hoc', B: 'luyen', C: 'choi', D: 'kiem' }[nhanCua(c.options, o.option_key)]} className={'opt touch-opt cau-phuong-an' + (chon[c.question_id] === o.option_key ? ' picked' : '')}>
              <input type="radio" name={'sl-' + c.question_id} checked={chon[c.question_id] === o.option_key} onChange={() => chonPa(o.option_key)} />
              <span className="opt-key-badge" data-nhan={nhanCua(c.options, o.option_key)}>{nhanCua(c.options, o.option_key)}</span>
              <span className="answer-content"><MathText inline>{o.option_text}</MathText></span>
            </label>
          ))}
        </div>
      </fieldset>
      <div className="sl-nut">
        <button type="button" disabled={i === 0 || ban} onClick={() => doi(i - 1)}>← Câu trước</button>
        {i + 1 < ds.length
          ? <button type="button" className="primary" disabled={!chon[c.question_id]} onClick={() => doi(i + 1)}>Câu sau →</button>
          : <button type="button" className="primary" disabled={!du || ban} onClick={nop}>{ban ? 'Đang chấm…' : 'Nộp bài soát lỗi'}</button>}
      </div>
      {bao && <p role="alert">{bao}</p>}
    </div>
  );
}
