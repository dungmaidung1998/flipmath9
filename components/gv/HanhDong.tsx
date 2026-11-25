'use client';
/**
 * FILE NÀY LÀM GÌ: Component React phía trình duyệt phục vụ bảng điều khiển, biểu đồ và biểu mẫu thao tác cho giáo viên.
 * AI DÙNG: giáo viên
 * LẤY DỮ LIỆU TỪ: không truy vấn bảng trực tiếp
 * GỌI TỚI: không gọi mô-đun nội bộ khác
 */
import { Children, useState, type ReactNode } from 'react';

/**
 * Component React `goi`: nhận props (thuộc tính truyền vào từ component cha) và dựng giao diện tương ứng.
 */
async function goi(url: string, body: unknown) {
  const r = await fetch(url, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
  const d = await r.json().catch(() => ({}));
  if (!r.ok) throw new Error(d.error ?? 'Không gửi được, thử lại sau.');
  return d;
}

/** Hiện tối đa `soDong` dòng, còn lại ẩn sau "Xem tất cả (n)". */
export function DanhSachGon({ children, soDong = 5, className = 'mc-ds' }: { children: ReactNode; soDong?: number; className?: string }) {
  const [mo, setMo] = useState(false);
  const ds = Children.toArray(children);
  return (
    <>
      <ul className={className}>{mo ? ds : ds.slice(0, soDong)}</ul>
      {ds.length > soDong && (
        <div className="mc-xem-tat-ca">
          <button type="button" onClick={() => setMo(!mo)} aria-expanded={mo}>{mo ? 'Thu gọn' : `Xem tất cả (${ds.length})`}</button>
        </div>
      )}
    </>
  );
}

/** Giao việc cho một nhóm HS: nhắc nhở, Gói sửa lỗi, Gói lấp nền. GV đọc và sửa lời nhắn trước khi gửi. */
export function NutGiaoViec({ lop, hs, loai, mucTieu = [], mucTieuTheoHS, loiNhan, nhan, chinh = false }: {
  lop: string; hs: { id: string; ten: string }[]; loai: 'nhac-nho' | 'goi-sua-loi' | 'goi-lap-nen';
  mucTieu?: string[]; mucTieuTheoHS?: Record<string, string[]>; loiNhan: string; nhan: string; chinh?: boolean;
}) {
  const [mo, setMo] = useState(false);
  const [chu, setChu] = useState(loiNhan);
  const [dang, setDang] = useState(false);
  const [xong, setXong] = useState<string | null>(null);
  const [loi, setLoi] = useState<string | null>(null);
  if (!hs.length) return null;
  if (xong) return <span className="da-gui" role="status">✓ {xong}</span>;
  return (
    <div style={{ width: mo ? '100%' : undefined }}>
      {!mo && <button type="button" className={`nho${chinh ? ' chinh' : ''}`} onClick={() => setMo(true)}>{nhan}</button>}
      {mo && (
        <div className="hop-gui">
          <label style={{ textTransform: 'none', letterSpacing: 'normal', fontSize: 13.5 }}>
            Lời nhắn tới {hs.length === 1 ? hs[0].ten : `${hs.length} HS: ${hs.slice(0, 6).map((h) => h.ten).join(', ')}${hs.length > 6 ? '…' : ''}`}
            <textarea value={chu} maxLength={300} onChange={(e) => setChu(e.target.value)} />
          </label>
          {loi && <p role="alert" style={{ color: 'var(--st-nguy)', margin: '6px 0 0' }}>{loi}</p>}
          <div className="hop-hd">
            <button type="button" className="nho" onClick={() => setMo(false)}>Huỷ</button>
            <button type="button" className="nho chinh" disabled={dang || !chu.trim()} onClick={async () => {
              setDang(true); setLoi(null);
              try {
                const d = await goi('/api/gv/giao-viec', { lop, hs: hs.map((h) => h.id), loai, mucTieu, mucTieuTheoHS, loiNhan: chu.trim() });
                setXong(`Đã gửi cho ${d.soHS} HS`);
              } catch (e: any) { setLoi(e.message); } finally { setDang(false); }
            }}>{dang ? 'Đang gửi…' : `Gửi cho ${hs.length} HS`}</button>
          </div>
        </div>
      )}
    </div>
  );
}

/** GV-15 → GV-17: thêm một lỗi vào phần Mở đầu của tiết dạy. */
export function NutDuaVaoTiet({ lop, bai, code, daCo }: { lop: string; bai: string; code: string; daCo: boolean }) {
  const [co, setCo] = useState(daCo);
  const [dang, setDang] = useState(false);
  return (
    <button type="button" className="nho" aria-pressed={co} disabled={dang} onClick={async () => {
      setDang(true);
      try { await goi('/api/gv/ke-hoach', { lop, bai, loi: code, them: !co }); setCo(!co); } catch (e: any) { alert(e.message); } finally { setDang(false); }
    }}>{co ? '✓ Đã đưa vào tiết' : 'Đưa vào tiết dạy'}</button>
  );
}

/** GV-16 khối C: loại một HS khỏi danh sách trong 14 ngày (thiết bị chung, mất mạng…). */
export function NutBoQua({ lop, sid }: { lop: string; sid: string }) {
  const [xong, setXong] = useState(false);
  if (xong) return <span className="mc-ghi">Đã bỏ qua lần này</span>;
  return (
    <button type="button" className="nho" style={{ color: 'var(--muted)' }} onClick={async () => {
      try { await goi('/api/gv/bo-qua', { lop, hs: sid }); setXong(true); } catch (e: any) { alert(e.message); }
    }}>Bỏ qua lần này</button>
  );
}
