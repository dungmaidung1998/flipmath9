'use client';
/**
 * FILE NÀY LÀM GÌ: Component React phía trình duyệt phục vụ bảng điều khiển, biểu đồ và biểu mẫu thao tác cho giáo viên.
 * AI DÙNG: giáo viên
 * LẤY DỮ LIỆU TỪ: không truy vấn bảng trực tiếp
 * GỌI TỚI: @/lib/dfle/man-chinh-gv.js
 */
import { useMemo, useState } from 'react';
// @ts-ignore
import { canLaiThoiGian, TONG_PHUT } from '@/lib/dfle/man-chinh-gv.js';

type TrangThai = 'goi-y' | 'chap-nhan' | 'bo';
interface HD {
  id: string; ten: string; phut: number; phutGoiY: number; min: number; max: number;
  noiDung: string[]; viSao: string[]; trangThai: TrangThai; coDinh?: boolean; noiDungSua?: string | null;
}
interface HS { id: string; ten: string }
type Nhom = 'sao' | 'choi' | 'mam';
const TEN_NHOM: Record<Nhom, string> = { sao: '⭐ Nhóm Sao', choi: '🌿 Nhóm Chồi', mam: '🌱 Nhóm Mầm' };

/** GV-17: chấp nhận, sửa hoặc bỏ từng hoạt động; tổng thời gian tự cân về 45 phút. */
export default function KeHoachTiet({ lop, bai, hoatDongBanDau, nhom, nhomSua, ghepCap }: {
  lop: string; bai: string; hoatDongBanDau: HD[];
  nhom: Record<Nhom, HS[]>; nhomSua: Record<string, Nhom>; ghepCap: { kem: HS; duocKem: HS }[];
}) {
  const [ds, setDs] = useState<HD[]>(hoatDongBanDau);
  const [dangSua, setDangSua] = useState<string | null>(null);
  const [phanNhom, setPhanNhom] = useState<Record<string, Nhom>>(() => {
    const m: Record<string, Nhom> = {};
    for (const k of ['sao', 'choi', 'mam'] as Nhom[]) for (const h of nhom[k]) m[h.id] = k;
    return { ...m, ...nhomSua };
  });
  const [luu, setLuu] = useState<'' | 'dang' | 'xong' | 'loi'>('');
  const [moNhom, setMoNhom] = useState(false);
  const tatCaHS = useMemo(() => [...nhom.sao, ...nhom.choi, ...nhom.mam].sort((a, b) => a.ten.localeCompare(b.ten, 'vi')), [nhom]);
  const theoNhom = (k: Nhom) => tatCaHS.filter((h) => phanNhom[h.id] === k);

  function capNhat(id: string, sua: Partial<HD>) {
    const moi = ds.map((h) => (h.id === id ? { ...h, ...sua } : h));
    const kq = canLaiThoiGian(moi.map((h) => ({ ...h, bo: h.trangThai === 'bo' })), TONG_PHUT);
    setDs(kq.ds.map((h: any) => ({ ...h })));
    setLuu('');
  }
  const tong = ds.filter((h) => h.trangThai !== 'bo').reduce((s, h) => s + h.phut, 0);

  async function luuKeHoach() {
    setLuu('dang');
    try {
      const r = await fetch('/api/gv/ke-hoach', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ lop, bai, banSua: {
          hoatDong: ds.map((h) => ({ id: h.id, trangThai: h.trangThai, coDinh: !!h.coDinh, phut: h.phut, noiDungSua: h.noiDungSua ?? null })),
          nhom: phanNhom
        } })
      });
      if (!r.ok) throw new Error();
      setLuu('xong'); return true;
    } catch { setLuu('loi'); return false; }
  }

  const q = new URLSearchParams({ lop, bai });
  return (
    <>
      <div className="mc-dong-dau khong-in" style={{ justifyContent: 'space-between' }}>
        <span className={`tong-phut${tong !== TONG_PHUT ? ' lech' : ''}`}>Tổng thời gian: {tong}/{TONG_PHUT} phút</span>
        <span style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
          {luu === 'xong' && <span className="da-gui">✓ Đã lưu</span>}
          {luu === 'loi' && <span style={{ color: 'var(--st-nguy)', fontWeight: 700 }}>Chưa lưu được</span>}
          <button type="button" className="nho" onClick={luuKeHoach} disabled={luu === 'dang'}>{luu === 'dang' ? 'Đang lưu…' : 'Lưu kế hoạch'}</button>
          <button type="button" className="nho chinh" onClick={async () => { if (await luuKeHoach()) window.location.href = `/api/gv/khbd?${q}`; }}>Xuất KHBD Word</button>
          <button type="button" className="nho" onClick={() => window.print()}>In 1 trang</button>
        </span>
      </div>

      {ds.map((h, i) => {
        const bo = h.trangThai === 'bo';
        return (
          <section key={h.id} className={`hd${bo ? ' bo' : ''}`} aria-labelledby={`hd-${h.id}`}>
            <div className="hd-dau">
              <h2 id={`hd-${h.id}`}>{'①②③④'[i]} {h.ten} <span className="hd-phut">· {bo ? 'đã bỏ' : `${h.phut}'`}</span></h2>
              <div className="hd-nut">
                <button type="button" className="nho" aria-pressed={h.trangThai === 'chap-nhan'} title="Chấp nhận"
                  onClick={() => capNhat(h.id, { trangThai: h.trangThai === 'chap-nhan' ? 'goi-y' : 'chap-nhan' })}>✓ Dùng</button>
                <button type="button" className="nho" aria-pressed={dangSua === h.id} disabled={bo} onClick={() => setDangSua(dangSua === h.id ? null : h.id)}>✎ Sửa</button>
                <button type="button" className="nho" onClick={() => capNhat(h.id, { trangThai: bo ? 'goi-y' : 'bo' })}>{bo ? 'Khôi phục' : '✕ Bỏ'}</button>
              </div>
            </div>
            {!bo && (h.noiDungSua
              ? <p style={{ whiteSpace: 'pre-wrap', margin: '10px 0 0' }}>{h.noiDungSua}</p>
              : <ul>{h.noiDung.map((x, j) => <li key={j}>{x}</li>)}</ul>)}
            {!bo && h.id === 'luyen-tap' && (
              <div className="khong-in" style={{ marginTop: 8 }}>
                <button type="button" className="nho" onClick={() => setMoNhom(!moNhom)} aria-expanded={moNhom}>{moNhom ? 'Ẩn danh sách nhóm' : 'Xem danh sách nhóm'}</button>
              </div>
            )}
            {!bo && h.id === 'luyen-tap' && (
              <div className="nhom3" style={moNhom ? undefined : { display: 'none' }}>
                {(['sao', 'choi', 'mam'] as Nhom[]).map((k) => (
                  <div key={k}>
                    <h3>{TEN_NHOM[k]} · {theoNhom(k).length} HS</h3>
                    {theoNhom(k).map((hs) => (
                      <div key={hs.id} style={{ display: 'flex', justifyContent: 'space-between', gap: 6, alignItems: 'center', padding: '2px 0' }}>
                        <span>{hs.ten}</span>
                        <select aria-label={`Chuyển nhóm cho ${hs.ten}`} className="khong-in" value={k} style={{ fontSize: 12.5, padding: '2px 4px', width: 'auto', minWidth: 0 }}
                          onChange={(e) => { setPhanNhom({ ...phanNhom, [hs.id]: e.target.value as Nhom }); setLuu(''); }}>
                          <option value="sao">⭐</option><option value="choi">🌿</option><option value="mam">🌱</option>
                        </select>
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            )}
            {!bo && h.id === 'luyen-tap' && moNhom && ghepCap.length > 0 && (
              <p className="mc-ghi">Gợi ý ghép cặp kèm học: {ghepCap.slice(0, 8).map((g) => `${g.kem.ten} – ${g.duocKem.ten}`).join(' · ')}</p>
            )}
            {!bo && h.viSao.length > 0 && <p className="hd-visao">ⓘ Vì sao: {h.viSao.join(' · ')}</p>}
            {dangSua === h.id && !bo && (
              <div className="khong-in">
                <textarea defaultValue={h.noiDungSua ?? h.noiDung.join('\n')} aria-label={`Nội dung ${h.ten}`}
                  onBlur={(e) => capNhat(h.id, { noiDungSua: e.target.value.trim() || null, trangThai: 'chap-nhan' })} />
                <div style={{ display: 'flex', gap: 10, alignItems: 'center', marginTop: 8, flexWrap: 'wrap' }}>
                  <label style={{ textTransform: 'none', letterSpacing: 'normal', display: 'flex', gap: 6, alignItems: 'center' }}>
                    Thời lượng <input type="number" min={1} max={40} defaultValue={h.phut}
                      // Tính toán, làm tròn hoặc giới hạn giá trị theo công thức
                      onBlur={(e) => { const v = Math.max(1, Math.min(40, Number(e.target.value) || h.phut)); capNhat(h.id, { phut: v, coDinh: true, trangThai: 'chap-nhan' }); }} /> phút
                  </label>
                  {h.coDinh && <button type="button" className="nho" onClick={() => capNhat(h.id, { coDinh: false, phut: h.phutGoiY })}>Để hệ thống tự chia</button>}
                  {h.noiDungSua && <button type="button" className="nho" onClick={() => capNhat(h.id, { noiDungSua: null })}>Về nội dung gợi ý</button>}
                  <button type="button" className="nho chinh" onClick={() => setDangSua(null)}>Xong</button>
                </div>
              </div>
            )}
          </section>
        );
      })}
    </>
  );
}
