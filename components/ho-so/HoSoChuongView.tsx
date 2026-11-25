'use client';

/**
 * FILE NÀY LÀM GÌ: Component React giao diện hiển thị và xử lý tương tác của người dùng trên trình duyệt.
 * AI DÙNG: học sinh
 * LẤY DỮ LIỆU TỪ: không truy vấn bảng trực tiếp
 * GỌI TỚI: @/components/MaQR, @/components/AnhChuDe, @/lib/chuDeChuong, @/lib/khkt/hoSoChuong, @/lib/gv/lopCuaToi
 */
import { useEffect, useState, type CSSProperties } from 'react';
import { useRouter } from 'next/navigation';
import MaQR from '@/components/MaQR';
import AnhChuDe from '@/components/AnhChuDe';
import { chuDeChuong } from '@/lib/chuDeChuong';
import type { HoSoChuongItem } from '@/lib/khkt/hoSoChuong';
import type { LopCuaToi } from '@/lib/gv/lopCuaToi';
import { nhanTruongLop } from '@/lib/gv/lopCuaToi';
import './ho-so.css';

const MUC_TEN = ['Chưa đạt', 'Đang học', 'Đạt', 'Thành thạo'];

/**
 * Component React `TheHoSoA4`: nhận props (thuộc tính truyền vào từ component cha) và dựng giao diện tương ứng.
 */
function TheHoSoA4({
  item,
  laGV,
  origin,
}: {
  item: HoSoChuongItem;
  laGV: boolean;
  origin: string;
}) {
  const cd = chuDeChuong(item.chuong);
  const [nhanXet, setNhanXet] = useState(item.nhan_xet_gv);
  const [dangLuu, setDangLuu] = useState(false);
  const [trangThaiLuu, setTrangThaiLuu] = useState('');

  useEffect(() => {
    setNhanXet(item.nhan_xet_gv);
  }, [item.student_id, item.chuong, item.nhan_xet_gv]);

  async function luuNhanXet() {
    setDangLuu(true);
    setTrangThaiLuu('');
    try {
      const res = await fetch('/api/gv/ho-so-nhan-xet', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ studentId: item.student_id, chuong: item.chuong, nhanXet }),
      });
      const j = await res.json();
      if (!res.ok) throw new Error(j?.error || 'Không lưu được.');
      setTrangThaiLuu('✓ Đã lưu nhận xét');
    } catch (e: any) {
      setTrangThaiLuu(e?.message || 'Lỗi lưu');
    } finally {
      setDangLuu(false);
    }
  }

  const progressUrl = `${origin}/tien-do/${item.chuong}`;

  return (
    <article
      className="hs-a4"
      style={cd ? ({ ['--hs-mau' as string]: cd.mau } as CSSProperties) : undefined}
    >
      <header className="hs-header">
        <div>
          <div style={{ fontSize: 12, fontWeight: 700, color: cd?.mau ?? '#2d5fa8', textTransform: 'uppercase' }}>
            {item.ten_truong} · Lớp {item.ten_lop} · HỒ SƠ NĂNG LỰC CHƯƠNG
          </div>
          <h1>
            {cd ? `${cd.bieuTuong} ` : ''}
            {item.chuong_nhan}: {item.ten_chuong}
          </h1>
          <div style={{ fontSize: 13.5, color: '#334155' }}>
            Học sinh: <b>{item.ten_hien_thi}</b> (<code>{item.student_id}</code>) · Chủ đề:{' '}
            <b>{cd?.ten ?? item.chuong}</b>
          </div>
        </div>
        <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
          {cd && (
            <AnhChuDe
              src={cd.anhMuc(item.muc5)}
              fallback={cd.iconImg}
              alt={cd.mucTen[item.muc5]}
              width={74}
              height={74}
            />
          )}
          {cd && (
            <div style={{ textAlign: 'center', fontSize: 11.5 }}>
              <AnhChuDe
                src={cd.huyHieu}
                fallback={cd.anhMuc(item.dat_huy_hieu ? 4 : 0)}
                alt={`Huy hiệu ${item.chuong}`}
                width={58}
                height={58}
              />
              <div style={{ fontWeight: 700, color: item.dat_huy_hieu ? '#15803d' : '#64748b' }}>
                {item.dat_huy_hieu ? '🏅 Đã đạt' : 'Đang tích luỹ'}
              </div>
            </div>
          )}
        </div>
      </header>

      <div className="hs-4chi-so">
        <div className="hs-chi-so">
          <b>{item.so_muc_dat}/{item.tong_muc}</b>
          <span>Mục làm chủ ({item.ti_le_lam_chu}%)</span>
        </div>
        <div className="hs-chi-so">
          <b>{item.loi_da_sua} / {item.loi_con_mo}</b>
          <span>Lỗi đã sửa / còn mở</span>
        </div>
        <div className="hs-chi-so">
          <b>{item.so_bai_chuan_bi}/{item.tong_muc}</b>
          <span>Bài chuẩn bị đã làm</span>
        </div>
        <div className="hs-chi-so">
          <b>{item.phut_hoc} phút</b>
          <span>Thời gian học chương</span>
        </div>
      </div>

      <div className="hs-than">
        {/* Khối giao diện: Khối nội dung chính */}
        <section>
          <h2 style={{ fontSize: 13.5, margin: '0 0 6px' }}>Mức làm chủ từng mục kiến thức</h2>
          {/* Khối giao diện: Bảng số liệu tổng hợp */}
          <table className="hs-muc-bang">
            <thead>
              <tr>
                <th>Mục</th>
                <th>Mức đạt</th>
              </tr>
            </thead>
            <tbody>
              {item.mucs.map((m) => (
                <tr key={m.ku_id}>
                  <td>
                    <code>{m.ku_id}</code> · {m.ku_name}
                  </td>
                  <td style={{ fontWeight: 700, whiteSpace: 'nowrap' }}>
                    {m.mastery_level == null ? 'Chưa đo' : `${m.mastery_level}/3 (${MUC_TEN[m.mastery_level] ?? ''})`}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>

        {/* Khối giao diện: Khối nội dung chính */}
        <section style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {cd && (
            <div style={{ borderRadius: 10, overflow: 'hidden', border: '1px solid #e2e8f0', textAlign: 'center', padding: 6, background: '#f8fafc' }}>
              <AnhChuDe src={cd.tranh} fallback={cd.anhMuc(item.muc5)} alt={cd.ten} width={260} height={110} />
              <div style={{ fontSize: 12, fontWeight: 700, marginTop: 4, color: cd.mau }}>
                Mức hiện tại: {cd.mucTen[item.muc5]}
              </div>
            </div>
          )}

          <div style={{ border: '1px solid #e2e8f0', borderRadius: 10, padding: 8, fontSize: 12.5 }}>
            <b>Lỗi tiêu biểu trong chương:</b>
            {item.loi_tieu_bieu.length === 0 ? (
              <p style={{ margin: '4px 0 0', color: '#475569' }}>Chưa ghi nhận lỗi nào.</p>
            ) : (
              <ul style={{ margin: '4px 0 0', paddingLeft: 16 }}>
                {item.loi_tieu_bieu.map((e) => (
                  <li key={e.error_code}>
                    <code>{e.error_code}</code> ({e.trang_thai === 'da-nho' ? 'đã sửa' : 'cần ôn'}): {e.mo_ta}
                  </li>
                ))}
              </ul>
            )}
          </div>
        </section>
      </div>

      <div className="hs-nhan-xet">
        <b>Nhận xét của giáo viên:</b>
        {laGV ? (
          <div className="no-print" style={{ marginTop: 6 }}>
            <textarea
              value={nhanXet}
              onChange={(e) => setNhanXet(e.target.value)}
              rows={2}
              placeholder="Nhập nhận xét cho học sinh trong chương này…"
              style={{ width: '100%', padding: 6, borderRadius: 8, border: '1px solid #cbd5e1', font: 'inherit' }}
            />
            <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginTop: 6 }}>
              <button type="button" className="nho chinh" disabled={dangLuu} onClick={luuNhanXet}>
                {dangLuu ? 'Đang lưu…' : '💾 Lưu nhận xét'}
              </button>
              {trangThaiLuu && <span style={{ fontSize: 12.5, fontWeight: 700 }}>{trangThaiLuu}</span>}
            </div>
          </div>
        ) : null}
        <p style={{ margin: '4px 0 0', minHeight: 20 }}>
          {nhanXet || 'Học sinh tiếp tục duy trì chuẩn bị bài trước giờ học và ôn lại các mã lỗi còn mở.'}
        </p>
      </div>

      <footer className="hs-chan">
        <div style={{ fontSize: 12, color: '#475569' }}>
          <b>FlipMath9 · Hồ sơ học tập cá nhân</b>
          <div>In ngày: {new Date().toLocaleDateString('vi-VN')}</div>
          <div>Quét mã QR bên cạnh để mở trang tiến độ trực tuyến của {item.chuong_nhan}.</div>
        </div>
        <MaQR value={progressUrl} size={82} label={`QR tiến độ ${item.chuong}`} />
      </footer>
    </article>
  );
}

/**
 * Component React `HoSoChuongView`: nhận props (thuộc tính truyền vào từ component cha) và dựng giao diện tương ứng.
 */
export default function HoSoChuongView({
  chuong,
  items,
  laGV,
  lops,
  lopChon,
  dsHS,
  hsChon,
  inCaLop,
}: {
  chuong: string;
  items: HoSoChuongItem[];
  laGV: boolean;
  lops?: LopCuaToi[];
  lopChon?: string;
  dsHS?: { student_id: string; ten: string }[];
  hsChon?: string;
  inCaLop?: boolean;
}) {
  const router = useRouter();
  const [origin, setOrigin] = useState('https://flipmath9.local');

  useEffect(() => {
    setOrigin(window.location.origin);
  }, []);

  const doiParams = (p: Record<string, string>) => {
    const q = new URLSearchParams({
      ...(lopChon ? { lop: lopChon } : {}),
      ...(hsChon ? { hs: hsChon } : {}),
      ...p,
    });
    router.push(`/ho-so/${encodeURIComponent(chuong)}?${q.toString()}`);
  };

  return (
    <div className="hs-wrap">
      <div className="hs-cong-cu no-print">
        <div style={{ display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
          <a className="action-link" href={laGV ? '/gv/lop' : `/tien-do/${chuong}`}>
            ← Quay lại
          </a>
          <select
            value={chuong}
            aria-label="Chọn chương"
            onChange={(e) => {
              const q = new URLSearchParams({
                ...(lopChon ? { lop: lopChon } : {}),
                ...(hsChon ? { hs: hsChon } : {}),
                ...(inCaLop ? { inCaLop: '1' } : {}),
              });
              router.push(`/ho-so/${encodeURIComponent(e.target.value)}?${q.toString()}`);
            }}
            style={{ padding: '6px 10px', borderRadius: 8, border: '1px solid #cbd5e1' }}
          >
            {['C1', 'C2', 'C3', 'C4', 'C5', 'C6', 'C7', 'C8', 'C9', 'C10'].map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>

          {laGV && lops && (
            <select
              value={lopChon ?? ''}
              aria-label="Chọn lớp"
              onChange={(e) => doiParams({ lop: e.target.value, hs: '', inCaLop: '0' })}
              style={{ padding: '6px 10px', borderRadius: 8, border: '1px solid #cbd5e1' }}
            >
              {lops.map((l) => (
                <option key={l.class_id} value={l.class_id}>{nhanTruongLop(l)}</option>
              ))}
            </select>
          )}

          {laGV && dsHS && (
            <select
              value={hsChon ?? ''}
              aria-label="Chọn học sinh"
              onChange={(e) => doiParams({ hs: e.target.value, inCaLop: '0' })}
              style={{ padding: '6px 10px', borderRadius: 8, border: '1px solid #cbd5e1' }}
            >
              {dsHS.map((h) => (
                <option key={h.student_id} value={h.student_id}>{h.ten} ({h.student_id})</option>
              ))}
            </select>
          )}
        </div>

        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          {laGV && (
            <button
              type="button"
              className="nho"
              onClick={() => doiParams({ inCaLop: inCaLop ? '0' : '1' })}
            >
              {inCaLop ? '👤 Xem 1 học sinh' : '📚 Chuẩn bị in cả lớp'}
            </button>
          )}
          <button type="button" className="primary nho chinh" onClick={() => window.print()}>
            🖨️ Xuất PDF / In A4
          </button>
        </div>
      </div>

      {items.length === 0 ? (
        <div className="card"><p>Không có dữ liệu học sinh để hiển thị hồ sơ.</p></div>
      ) : (
        items.map((it) => <TheHoSoA4 key={it.student_id} item={it} laGV={laGV} origin={origin} />)
      )}
    </div>
  );
}
