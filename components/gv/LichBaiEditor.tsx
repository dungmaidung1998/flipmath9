'use client';

/**
 * FILE NÀY LÀM GÌ: Component React phía trình duyệt phục vụ bảng điều khiển, biểu đồ và biểu mẫu thao tác cho giáo viên.
 * AI DÙNG: giáo viên
 * LẤY DỮ LIỆU TỪ: không truy vấn bảng trực tiếp
 * GỌI TỚI: @/lib/lichBai
 */
import { useMemo, useState } from 'react';
import { tuDienChuong, gioVN, congNgay, ngayVN, type Lich } from '@/lib/lichBai';

type Bai = { lesson_id: string; soMuc: number };
const THU = [['T2', 1], ['T3', 2], ['T4', 3], ['T5', 4], ['T6', 5], ['T7', 6]] as const;
/** ISO (UTC) → giá trị cho ô datetime-local theo giờ Việt Nam. */
const sangO = (iso: string) => new Date(new Date(iso).getTime() + 7 * 3600_000).toISOString().slice(0, 16);
const tuO = (v: string) => (v ? new Date(v + ':00+07:00').toISOString() : '');

/** GV-03 LỊCH DẠY & GIAO BÀI: ba mốc cho từng bài của một chương, tự điền cả chương, lưu một lần. */
export default function LichBaiEditor({ lop, bai, coSan }: { lop: string; bai: Bai[]; coSan: Lich[] }) {
  const [lich, setLich] = useState<Record<string, Lich>>(() => Object.fromEntries(coSan.map((l) => [l.lesson_id, l])));
  const [xoa, setXoa] = useState<string[]>([]);
  // Xử lý mốc ngày giờ theo múi giờ Việt Nam (UTC+7)
  const [batDau, setBatDau] = useState(() => congNgay(ngayVN(), 1));
  const [thu, setThu] = useState<number[]>([1, 4]);
  const [bao, setBao] = useState('');
  const [dang, setDang] = useState(false);
  const doi = useMemo(() => JSON.stringify(lich) + xoa.join(), [lich, xoa]);
  const [daLuu, setDaLuu] = useState(doi);

  const sua = (id: string, k: keyof Lich, v: string) => setLich((o) => {
    // Xử lý mốc ngày giờ theo múi giờ Việt Nam (UTC+7)
    const cu = o[id] ?? { lesson_id: id, ngay_mo: ngayVN(), ngay_hoc: congNgay(ngayVN(), 3), han_chuan_bi: gioVN(congNgay(ngayVN(), 2)) };
    const moi = { ...cu, [k]: v };
    // Đổi ngày học thì hạn chuẩn bị tự về 19:00 tối hôm trước (thầy cô vẫn sửa lại được).
    if (k === 'ngay_hoc' && v) moi.han_chuan_bi = gioVN(congNgay(v, -1));
    setXoa((x) => x.filter((y) => y !== id));
    return { ...o, [id]: moi };
  });
  const tuDien = () => {
    const ds = tuDienChuong(bai.map((b) => b.lesson_id), batDau, thu);
    if (!ds.length) { setBao('Chọn ít nhất một thứ có tiết Toán.'); return; }
    setLich((o) => ({ ...o, ...Object.fromEntries(ds.map((l) => [l.lesson_id, l])) }));
    setXoa([]);
    setBao(`Đã điền ${ds.length} bài. Kiểm tra lại rồi bấm Lưu lịch.`);
  };
  const luu = async () => {
    setDang(true); setBao('');
    try {
      const r = await fetch('/api/gv/lich-bai', { method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ lop, dong: bai.map((b) => lich[b.lesson_id]).filter(Boolean), xoa }) });
      const d = await r.json();
      if (!r.ok) throw new Error(d.error);
      setDaLuu(doi); setBao(`✓ Đã lưu lịch ${d.luu} bài.`);
    } catch (e: any) { setBao(e?.message ?? 'Chưa lưu được.'); } finally { setDang(false); }
  };

  return (
    <>
      <div className="card">
        <h2>Tự điền cả chương</h2>
        <div className="hd-loc">
          <label>Buổi học bài đầu từ ngày<input type="date" value={batDau} onChange={(e) => setBatDau(e.target.value)} /></label>
          <fieldset style={{ border: 0, padding: 0, margin: 0 }}>
            <legend style={{ fontSize: 13, color: 'var(--muted)' }}>Các thứ có tiết Toán</legend>
            <span style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
              {THU.map(([t, n]) => <label key={n} style={{ display: 'flex', gap: 4, alignItems: 'center' }}><input type="checkbox" checked={thu.includes(n)} onChange={(e) => setThu((x) => e.target.checked ? [...x, n] : x.filter((y) => y !== n))} />{t}</label>)}
            </span>
          </fieldset>
          <button type="button" onClick={tuDien}>Điền lịch</button>
        </div>
        <p className="hint">Mỗi bài một buổi học. Ngày mở bài = ngày học của bài trước (bài đầu mở trước 3 ngày). Hạn chuẩn bị = 19:00 tối hôm trước ngày học.</p>
      </div>

      <div className="card">
        <div className="scroll"><table>
          <thead><tr><th>Bài</th><th>Ngày mở</th><th>Hạn chuẩn bị</th><th>Ngày học trên lớp</th><th /></tr></thead>
          <tbody>
            {bai.map((b) => { const l = lich[b.lesson_id]; return (
              <tr key={b.lesson_id}>
                <th scope="row">{b.lesson_id}<br /><small className="hint">{b.soMuc} mục</small></th>
                <td><input type="date" aria-label={`Ngày mở ${b.lesson_id}`} value={l?.ngay_mo ?? ''} onChange={(e) => sua(b.lesson_id, 'ngay_mo', e.target.value)} /></td>
                <td><input type="datetime-local" aria-label={`Hạn chuẩn bị ${b.lesson_id}`} value={l ? sangO(l.han_chuan_bi) : ''} onChange={(e) => sua(b.lesson_id, 'han_chuan_bi', tuO(e.target.value))} /></td>
                <td><input type="date" aria-label={`Ngày học ${b.lesson_id}`} value={l?.ngay_hoc ?? ''} onChange={(e) => sua(b.lesson_id, 'ngay_hoc', e.target.value)} /></td>
                <td>{l && <button type="button" className="nho" onClick={() => { setLich((o) => { const n = { ...o }; delete n[b.lesson_id]; return n; }); if (coSan.some((c) => c.lesson_id === b.lesson_id)) setXoa((x) => [...x, b.lesson_id]); }}>Bỏ lịch</button>}</td>
              </tr>); })}
          </tbody>
        </table></div>
        <p style={{ display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap' }}>
          <button type="button" className="primary" disabled={dang || doi === daLuu} onClick={luu}>{dang ? 'Đang lưu…' : 'Lưu lịch'}</button>
          {doi !== daLuu && !dang && <span className="hint">Có thay đổi chưa lưu.</span>}
          {bao && <span role="status">{bao}</span>}
        </p>
      </div>
    </>
  );
}
