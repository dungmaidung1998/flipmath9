'use client';
/**
 * FILE NÀY LÀM GÌ: Component React giao diện hiển thị và xử lý tương tác của người dùng trên trình duyệt.
 * AI DÙNG: học sinh
 * LẤY DỮ LIỆU TỪ: không truy vấn bảng trực tiếp
 * GỌI TỚI: @/components/tro-choi-nen/amThanh, @/components/truc-quan/NutAmHieuUng, @/components/truc-quan/PhanHoiDung, ./MathText, ./DauTrang, ../lib/minhHoa, @/lib/chuDeChuong, @/components/CongThucKhung
 */
import { phat, chuanBiAmHieuUng } from '@/components/tro-choi-nen/amThanh';
import NutAmHieuUng from '@/components/truc-quan/NutAmHieuUng';
import { TichVang } from '@/components/truc-quan/PhanHoiDung';

import { useEffect, useState, type CSSProperties } from 'react';
import MathText from './MathText';
import DauTrang from './DauTrang';
import { hinhNhanVat } from '../lib/minhHoa';
import { chuDeChuong } from '@/lib/chuDeChuong';
import CongThucKhung from '@/components/CongThucKhung';
import HinhViBaiHoc from '@/components/HinhViBaiHoc';

type ViDu = { de: string; giai: string };
type CauHoi = { so: number; de: string };
type KetQua = { so: number; de: string; traLoi: string; dung: boolean; dapAn: string; giaiThich: string };

type Bai = {
  id: string; title: string; minutes: number; kuId: string;
  dan: string; quyTac: string; viDu: ViDu[]; tuLam: CauHoi[];
};

const QUICK_MATH_KEYS = ['/', '-', '·', '^', '(', ')', 'x'];

/**
 * Component React `ViBaiHoc`: nhận props (thuộc tính truyền vào từ component cha) và dựng giao diện tương ứng.
 */
export default function ViBaiHoc({ id }: { id: string }) {
  const [bai, setBai] = useState<Bai | null>(null);
  const [err, setErr] = useState('');
  const [traLoi, setTraLoi] = useState<Record<number, string>>({});
  const [ketQua, setKetQua] = useState<KetQua[] | null>(null);
  const [soDung, setSoDung] = useState(0);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    let huy = false;
    fetch(`/api/vi-bai-hoc?id=${encodeURIComponent(id)}`)
      .then(async (r) => {
        const d = await r.json();
        if (huy) return;
        if (!r.ok) setErr(d.error ?? 'Không mở được vi bài học');
        else setBai(d);
      })
      .catch(() => { if (!huy) setErr('Không kết nối được. Em thử lại sau ít phút.'); });
    return () => { huy = true; };
  }, [id]);

  const insertSymbol = (questionNum: number, symbol: string) => {
    setTraLoi((prev) => {
      const current = prev[questionNum] ?? '';
      return { ...prev, [questionNum]: current + symbol };
    });
  };

  async function nop() {
    if (!bai) return;
    chuanBiAmHieuUng();
    setBusy(true);
    const res = await fetch('/api/vi-bai-hoc', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, traLoi: bai.tuLam.map((c) => traLoi[c.so] ?? '') })
    });
    setBusy(false);
    if (!res.ok) { setErr('Không nộp được. Em thử lại.'); return; }
    const d = await res.json();
    if (d.soDung > 0) phat('dung');
    setKetQua(d.ketQua);
    setSoDung(d.soDung);
  }

  if (err) {
    return (
      <div className="card">
        <h2>Chưa mở được bài này</h2>
        <p>{err}</p>
        <p className="action-row" style={{ marginTop: 12 }}>
          <a className="action-link" href="/bai-hoc">← Về danh sách bài học</a>
        </p>
      </div>
    );
  }

  if (!bai) return <div className="card"><p className="hint">Đang mở bài học…</p></div>;

  const daLamHet = bai.tuLam.every((c) => (traLoi[c.so] ?? '').trim() !== '');
  const cd = chuDeChuong(bai.kuId);

  return (
    <div className={cd ? 'trang-chuong' : undefined} style={cd ? ({ ['--mau-chuong' as string]: cd.mau } as CSSProperties) : undefined}>
      <DauTrang gon tieuDe={bai.title.replace(/^Vi bài học:\s*/, '')} phu={<>Vi bài học sửa lỗi · khoảng {bai.minutes} phút</>} chuong={bai.kuId} nhanVat="na" hinh={hinhNhanVat('doc-sach')} />

      <NutAmHieuUng/>
      {/* Phần dẫn: nói thẳng quan niệm sai, không phán xét */}
      <div className="banner"><MathText>{bai.dan}</MathText></div>

      <HinhViBaiHoc id={bai.id} kuId={bai.kuId} />

      <div className="card vbh-the vbh-the--quy-tac">
        <h2>📘 Quy tắc đúng</h2>
        <p style={{ fontSize: 16, lineHeight: 1.75 }}><CongThucKhung text={bai.quyTac} /></p>
      </div>

      <div className="card vbh-the vbh-the--vi-du">
        <h2>🔍 Xem hai ví dụ đối chiếu</h2>
        <div className="vbh-vd-luoi">
          {bai.viDu.map((v, i) => (
            <div key={i} className="vbh-vd-khung">
              <span className="vbh-vd-khung__so">Ví dụ {i + 1}</span>
              <p style={{ margin: '0 0 8px' }}><strong><CongThucKhung text={v.de} /></strong></p>
              <div className="lbl">Lời giải</div>
              <span style={{ lineHeight: 1.75 }}><CongThucKhung text={v.giai} /></span>
            </div>
          ))}
        </div>
      </div>

      <div className="card vbh-the vbh-the--tu-lam">
        <h2>✍️ Tự kiểm tra</h2>
        <p className="hint" style={{ marginBottom: 14 }}>
          Hai câu này không tính điểm. Em làm ra nháp rồi gõ kết quả vào — làm xong mới thấy
          đáp án. Sai cũng không sao, chỗ nào sai sẽ có lời giải thích ngay bên dưới.
        </p>

        {bai.tuLam.map((c) => {
          const kq = ketQua?.find((k) => k.so === c.so);
          return (
            <div key={c.so} style={{ marginBottom: 20 }}>
              <p style={{ fontWeight: 600, margin: '0 0 8px', fontSize: 16 }}>
                Câu {c.so}. <CongThucKhung text={c.de} />
              </p>
              
              {!ketQua && (
                <div className="quick-math-bar">
                  <span>Phím nhanh:</span>
                  {QUICK_MATH_KEYS.map((k) => (
                    <button
                      key={k}
                      type="button"
                      className="quick-math-btn"
                      onClick={() => insertSymbol(c.so, k)}
                      title={`Chèn ký hiệu ${k}`}
                    >
                      {k}
                    </button>
                  ))}
                </div>
              )}

              <input
                value={traLoi[c.so] ?? ''}
                disabled={!!ketQua}
                onChange={(e) => setTraLoi((p) => ({ ...p, [c.so]: e.target.value }))}
                placeholder="Gõ kết quả của em (dùng / để viết phân số, ví dụ -3/4)"
                style={{ fontSize: 15, padding: '10px 14px' }}
              />

              {kq && (
                <div
                  className="rule"
                  style={{
                    marginTop: 10,
                    borderLeftColor: kq.dung ? 'var(--ok)' : 'var(--accent)'
                  }}
                >
                  <strong>
                    <span className={'tag ' + (kq.dung ? 'ok' : 'warn')}>
                      {kq.dung ? <><TichVang/> Đúng rồi</> : '✕ Chưa đúng'}
                    </span>
                  </strong>
                  <div className="lbl">Đáp án đúng</div>
                  <CongThucKhung text={kq.dapAn} />
                  <div className="lbl">Vì sao lại như vậy</div>
                  <CongThucKhung text={kq.giaiThich} />
                </div>
              )}
            </div>
          );
        })}

        {!ketQua ? (
          <button className="primary" onClick={nop} disabled={!daLamHet || busy} style={{ fontSize: 15, padding: '11px 22px' }}>
            {busy ? 'Đang kiểm tra…' : daLamHet ? 'Kiểm tra đáp án' : 'Làm cả hai câu rồi bấm đây'}
          </button>
        ) : (
          <>
            <div className="stat" style={{ marginTop: 6 }}>
              <div>
                <b>{soDung} trên {ketQua.length}</b>
                <span>câu tự kiểm đúng</span>
              </div>
            </div>

            {soDung === ketQua.length ? (
              <div className="banner" style={{ background: '#dcfce7', borderLeftColor: 'var(--ok)', color: '#166534', marginTop: 12 }}>
                🎉 <strong>Xuất sắc!</strong> Em đã trả lời đúng toàn bộ câu tự kiểm và nắm vững quy tắc này. Hãy sang bước tiếp theo để ghi nhận tiến bộ nhé!
              </div>
            ) : (
              <p className="hint" style={{ marginTop: 12 }}>
                Chưa sao cả! Em đọc kỹ lại phần “Vì sao lại như vậy” ở trên để rút kinh nghiệm, rồi tự tin bước vào bài vận dụng nhé.
              </p>
            )}

            <p style={{ marginTop: 14 }}>
              <a className="btnlink" href={`/hoc/${bai.kuId}/van-dung`}>
                Làm bài vận dụng ngay →
              </a>
              {' '}
              <a className="action-link" href="/bai-hoc" style={{ marginLeft: 8 }}>
                Về danh sách bài học
              </a>
            </p>
          </>
        )}
      </div>
    </div>
  );
}
