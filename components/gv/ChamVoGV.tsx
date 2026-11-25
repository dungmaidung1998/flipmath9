'use client';

/**
 * FILE NÀY LÀM GÌ: Component React phía trình duyệt phục vụ bảng điều khiển, biểu đồ và biểu mẫu thao tác cho giáo viên.
 * AI DÙNG: giáo viên
 * LẤY DỮ LIỆU TỪ: không truy vấn bảng trực tiếp
 * GỌI TỚI: @/components/MathText, @/lib/gv/lopCuaToi
 */
import { useEffect, useMemo, useState } from 'react';
import MathText from '@/components/MathText';
import { nhanTruongLop, type LopCuaToi } from '@/lib/gv/lopCuaToi';

type ThongKeAI = {
  tongLuot: number;
  daCham: number;
  daRaSoat: number;
  soAiChamSai: number;
  doChinhXacPct: number | null;
};

type LuotChamVo = {
  id: string;
  student_id: string;
  ten_hs: string;
  class_id: string;
  ten_lop: string;
  nguon: string;
  bai_id: string;
  ku_id: string | null;
  de_bai: string;
  anh_url: string | null;
  anh_da_xoa: boolean;
  dong_ai_doc: string[];
  dong_hs_sua: string[];
  ket_qua: any;
  diem_ai: number | null;
  trang_thai_bai: string | null;
  ma_loi: string[];
  trang_thai_luot: string;
  mo_hinh: string | null;
  nha_cung_cap: string;
  diem_gv: number | null;
  nhan_xet_gv: string | null;
  ai_cham_sai: boolean;
  ly_do_ai_sai: string | null;
  gv_xac_nhan_luc: string | null;
  tao_luc: string;
};

/**
 * Component React `TheLuotCham`: nhận props (thuộc tính truyền vào từ component cha) và dựng giao diện tương ứng.
 */
function TheLuotCham({
  item,
  onSaved,
}: {
  item: LuotChamVo;
  onSaved: () => void;
}) {
  const [diemGv, setDiemGv] = useState(item.diem_gv != null ? String(item.diem_gv) : item.diem_ai != null ? String(item.diem_ai) : '');
  const [nhanXetGv, setNhanXetGv] = useState(item.nhan_xet_gv ?? '');
  const [aiChamSai, setAiChamSai] = useState(Boolean(item.ai_cham_sai));
  const [lyDoAiSai, setLyDoAiSai] = useState(item.ly_do_ai_sai ?? '');
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState('');

  async function luu() {
    setBusy(true);
    setMsg('');
    try {
      const res = await fetch('/api/gv/cham-vo', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: item.id,
          diemGv: diemGv.trim() === '' ? null : Number(diemGv),
          nhanXetGv,
          aiChamSai,
          lyDoAiSai,
        }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json?.error || 'Không lưu được.');
      setMsg('✓ Đã lưu xác nhận');
      onSaved();
    } catch (e: any) {
      setMsg(e?.message || 'Lỗi lưu');
    } finally {
      setBusy(false);
    }
  }

  return (
    <article className="mc-khoi" style={{ borderLeft: item.ai_cham_sai ? '5px solid #dc2626' : item.gv_xac_nhan_luc ? '5px solid #16a34a' : '5px solid #2563eb' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: 8, marginBottom: 10 }}>
        <div>
          <b>{item.ten_hs}</b> (<code>{item.student_id}</code>) · Lớp <b>{item.ten_lop}</b> ·{' '}
          <span className="st" style={{ background: '#eff6ff', color: '#1d4ed8' }}>
            {item.nguon === 'on-thi-10' ? 'Ôn thi vào 10' : 'Vận dụng'} ({item.bai_id})
          </span>
        </div>
        <div style={{ fontSize: 13, color: 'var(--muted)' }}>
          {new Date(item.tao_luc).toLocaleString('vi-VN')} · AI: <code>{item.nha_cung_cap}</code> ({item.mo_hinh ?? '—'})
        </div>
      </div>

      <div style={{ padding: 10, borderRadius: 8, background: '#f8fafc', border: '1px solid var(--mc-vach)', marginBottom: 12, fontSize: 14 }}>
        <b>Đề bài:</b> <MathText>{item.de_bai}</MathText>
      </div>

      <div className="mc-hai" style={{ alignItems: 'start' }}>
        <div>
          <b style={{ fontSize: 13.5, display: 'block', marginBottom: 6 }}>Ảnh bài làm của học sinh</b>
          {item.anh_url ? (
            <img src={item.anh_url} alt={`Bài vở của ${item.ten_hs}`} style={{ width: '100%', maxHeight: 340, objectFit: 'contain', borderRadius: 10, border: '1px solid var(--mc-vach)', background: '#0f172a' }} />
          ) : (
            <p className="mc-ghi" style={{ padding: 12, borderRadius: 8, border: '1px dashed var(--mc-vach)' }}>
              {item.anh_da_xoa
                ? 'Ảnh đã được tự động xoá sau 30 ngày theo chính sách bảo mật.'
                : 'Lượt này học sinh gõ trực tiếp hoặc chưa tải ảnh lên Storage.'}
            </p>
          )}
        </div>

        <div style={{ display: 'grid', gap: 10 }}>
          <div>
            <b style={{ fontSize: 13.5 }}>Các dòng AI đọc / Học sinh sửa ({item.dong_hs_sua?.length ?? 0} dòng):</b>
            <ol style={{ margin: '6px 0 0', paddingLeft: 18, fontSize: 13.5, display: 'grid', gap: 4 }}>
              {(item.dong_hs_sua?.length ? item.dong_hs_sua : item.dong_ai_doc ?? []).map((d, i) => (
                <li key={i}><MathText>{d}</MathText></li>
              ))}
            </ol>
          </div>

          {item.ket_qua && (
            <div style={{ padding: 10, borderRadius: 10, background: '#f8fafc', border: '1px solid var(--mc-vach)', fontSize: 13.5 }}>
              <div>
                <b>AI chấm thử:</b> {item.diem_ai ?? '—'}/1,00 · Trạng thái: <code>{item.trang_thai_bai ?? '—'}</code>
                {item.ma_loi?.length ? ` · Mã lỗi: ${item.ma_loi.join(', ')}` : ''}
              </div>
              {Array.isArray(item.ket_qua.cacDong) && (
                <ul style={{ margin: '6px 0', paddingLeft: 18 }}>
                  {item.ket_qua.cacDong.map((c: any, idx: number) => (
                    <li key={idx} style={{ color: c.ketQua === 'dung' ? '#15803d' : '#b91c1c' }}>
                      {c.ketQua === 'dung' ? '✓' : '✗'} Dòng {idx + 1}: <MathText>{c.lyDo}</MathText>
                    </li>
                  ))}
                </ul>
              )}
              {item.ket_qua.nhanXet && (
                <div><b>Nhận xét AI:</b> <MathText>{item.ket_qua.nhanXet}</MathText></div>
              )}
            </div>
          )}
        </div>
      </div>

      <div style={{ marginTop: 14, paddingTop: 12, borderTop: '1px solid var(--mc-vach)', display: 'grid', gap: 10 }}>
        <div style={{ display: 'grid', gap: 10, gridTemplateColumns: '180px 1fr' }}>
          <label style={{ display: 'flex', flexDirection: 'column', gap: 4, fontSize: 13.5 }}>
            <b>Điểm chính thức (GV)</b>
            <input
              type="number"
              step="0.25"
              min={0}
              max={10}
              value={diemGv}
              onChange={(e) => setDiemGv(e.target.value)}
              style={{ padding: 7, borderRadius: 8, border: '1px solid var(--mc-vach)' }}
            />
          </label>
          <label style={{ display: 'flex', flexDirection: 'column', gap: 4, fontSize: 13.5 }}>
            <b>Nhận xét của thầy/cô</b>
            <input
              value={nhanXetGv}
              onChange={(e) => setNhanXetGv(e.target.value)}
              placeholder="Nhận xét xác nhận cho học sinh…"
              style={{ padding: 7, borderRadius: 8, border: '1px solid var(--mc-vach)' }}
            />
          </label>
        </div>

        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'center' }}>
          <label style={{ display: 'inline-flex', gap: 6, alignItems: 'center', fontSize: 13.5, color: aiChamSai ? '#c0312b' : 'inherit', fontWeight: 600 }}>
            <input type="checkbox" checked={aiChamSai} onChange={(e) => setAiChamSai(e.target.checked)} />
            ⚠️ Đánh dấu “AI chấm sai” (thống kê KHKT)
          </label>
          {aiChamSai && (
            <input
              value={lyDoAiSai}
              onChange={(e) => setLyDoAiSai(e.target.value)}
              placeholder="Ghi ngắn chỗ AI chấm nhầm…"
              style={{ flex: 1, minWidth: 220, padding: 6, borderRadius: 8, border: '1px solid #fca5a5' }}
            />
          )}
          <button type="button" className="nho chinh" disabled={busy} onClick={luu}>
            {busy ? 'Đang lưu…' : '💾 Lưu xác nhận'}
          </button>
          {msg && <span style={{ fontSize: 13, fontWeight: 700 }}>{msg}</span>}
        </div>
      </div>
    </article>
  );
}

/**
 * Component React `ChamVoGV`: nhận props (thuộc tính truyền vào từ component cha) và dựng giao diện tương ứng.
 */
export default function ChamVoGV({
  lops,
  lopMacDinh,
}: {
  lops: LopCuaToi[];
  lopMacDinh: string;
}) {
  const [lop, setLop] = useState(lopMacDinh || 'tat-ca');
  const [loc, setLoc] = useState<'tat-ca' | 'cho' | 'sai' | 'xong'>('tat-ca');
  const [items, setItems] = useState<LuotChamVo[]>([]);
  const [thongKe, setThongKe] = useState<ThongKeAI>({
    tongLuot: 0,
    daCham: 0,
    daRaSoat: 0,
    soAiChamSai: 0,
    doChinhXacPct: null,
  });
  const [loading, setLoading] = useState(true);
  const [thongBao, setThongBao] = useState('');

  async function tai() {
    setLoading(true);
    try {
      const res = await fetch(`/api/gv/cham-vo?lop=${encodeURIComponent(lop)}`, { cache: 'no-store' });
      const json = await res.json();
      if (res.ok) {
        setItems(json.items ?? []);
        if (json.thongKe) setThongKe(json.thongKe);
        setThongBao(json.thongBao ?? '');
      }
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void tai();
  }, [lop]); // eslint-disable-line react-hooks/exhaustive-deps

  const filtered = useMemo(() => {
    if (loc === 'cho') return items.filter((x) => x.gv_xac_nhan_luc == null && !x.ai_cham_sai);
    if (loc === 'sai') return items.filter((x) => x.ai_cham_sai);
    if (loc === 'xong') return items.filter((x) => x.gv_xac_nhan_luc != null);
    return items;
  }, [items, loc]);

  return (
    <div className="mc">
      <div className="mc-dau">
        <div>
          <h1>Giám sát &amp; Xác nhận chấm vở AI</h1>
          <p className="mc-cauhoi">
            Xem lại toàn bộ lượt học sinh chụp vở tự luận (Gemini / Claude API), sửa điểm/nhận xét và đánh dấu “AI chấm sai” cho hồ sơ KHKT.
          </p>
          <p style={{ margin: '8px 0 0' }}>
            <a className="action-link" href="/gv/hoc-sinh">Bật đồng thuận cho học sinh →</a>
          </p>
        </div>

        <div className="mc-loc">
          <label>
            Lớp
            <select value={lop} onChange={(e) => setLop(e.target.value)}>
              <option value="tat-ca">Tất cả lớp phụ trách</option>
              {lops.map((l) => (
                <option key={l.class_id} value={l.class_id}>{nhanTruongLop(l)}</option>
              ))}
            </select>
          </label>
          <label>
            Trạng thái
            <select value={loc} onChange={(e) => setLoc(e.target.value as any)}>
              <option value="tat-ca">Tất cả ({items.length})</option>
              <option value="cho">Chờ thầy cô xác nhận</option>
              <option value="sai">AI chấm sai</option>
              <option value="xong">Đã xác nhận</option>
            </select>
          </label>
        </div>
      </div>

      {/* Khối giao diện: Khối nội dung chính */}
      <section className="mc-khoi">
        <h2>Thống kê độ chính xác AI (hồ sơ KHKT)</h2>
        <div className="gv-lop-luoi">
          <div className="gv-lop-the">
            <div className="gv-lop-the__ten">Tổng lượt chụp / đọc</div>
            <div className="gv-lop-the__so">
              <span>Tổng lượt: <b>{thongKe.tongLuot}</b></span>
              <span>Đã chấm: <b>{thongKe.daCham}</b></span>
            </div>
          </div>
          <div className="gv-lop-the">
            <div className="gv-lop-the__ten">Kiểm định bởi giáo viên</div>
            <div className="gv-lop-the__so">
              <span>GV đã rà soát: <b>{thongKe.daRaSoat}</b></span>
              <span>AI chấm sai: <b style={{ color: 'var(--st-nguy)' }}>{thongKe.soAiChamSai}</b></span>
            </div>
          </div>
          <div className="gv-lop-the">
            <div className="gv-lop-the__ten">Độ chính xác AI</div>
            <div className="gv-lop-the__so">
              <span style={{ fontSize: 22, fontWeight: 800, color: 'var(--st-tot)' }}>
                {thongKe.doChinhXacPct == null ? 'Chưa có lượt rà' : `${thongKe.doChinhXacPct}%`}
              </span>
            </div>
          </div>
        </div>
      </section>

      {thongBao && <p className="bang-vang">⚠️ {thongBao}</p>}
      {loading && <div className="mc-khoi"><p>Đang tải danh sách bài chụp vở…</p></div>}
      {!loading && filtered.length === 0 && (
        <div className="mc-khoi"><p className="mc-trong">Chưa có lượt chấm vở nào khớp bộ lọc hiện tại.</p></div>
      )}

      {!loading && filtered.map((item) => (
        <TheLuotCham key={item.id} item={item} onSaved={() => void tai()} />
      ))}
    </div>
  );
}
