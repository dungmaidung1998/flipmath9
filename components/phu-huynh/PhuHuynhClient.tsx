'use client';

/**
 * FILE NÀY LÀM GÌ: Giao diện công khai dành cho phụ huynh nhập mã 6 chữ số xem thời lượng học và tự đặt giới hạn cho con.
 * AI DÙNG: công khai / phụ huynh
 * LẤY DỮ LIỆU TỪ: không truy vấn bảng trực tiếp
 * GỌI TỚI: @/components/AnhChuDe
 */
import { useState } from 'react';
import AnhChuDe from '@/components/AnhChuDe';

type DuLieuPH = {
  tenGoiNgan: string;
  phut7Ngay: number;
  chiTiet7Ngay: { ngay: string; phut: number }[];
  dauHieuQuaTai: { loai: string; ten: string; soLan: number }[];
  gioiHanHienTai: { phut_ngay: number; gio_khuya: string; gio_sang: string };
};

/**
 * Component React `PhuHuynhClient`: nhận props (thuộc tính truyền vào từ component cha) và dựng giao diện tương ứng.
 */
export default function PhuHuynhClient() {
  const [ma, setMa] = useState('');
  const [duLieu, setDuLieu] = useState<DuLieuPH | null>(null);
  const [phutNgay, setPhutNgay] = useState('90');
  const [gioKhuya, setGioKhuya] = useState('22:30');
  const [gioSang, setGioSang] = useState('05:30');
  const [busy, setBusy] = useState(false);
  const [loi, setLoi] = useState('');
  const [bao, setBao] = useState('');

  async function xemBangMa(e: React.FormEvent) {
    e.preventDefault();
    // Biểu thức chính quy (regex) kiểm tra hoặc tách chuỗi đúng mẫu dữ liệu
    const sach = ma.replace(/\s+/g, '');
    // Biểu thức chính quy (regex) kiểm tra hoặc tách chuỗi đúng mẫu dữ liệu
    if (!/^\d{6}$/.test(sach)) {
      setLoi('Vui lòng nhập đủ 6 chữ số do thầy cô cấp.');
      return;
    }
    setBusy(true);
    setLoi('');
    setBao('');
    try {
      const res = await fetch('/phu-huynh/api', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'xem', ma: sach }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json?.error || 'Không tra cứu được.');
      const dl: DuLieuPH = json.duLieu;
      setDuLieu(dl);
      setPhutNgay(String(dl.gioiHanHienTai.phut_ngay));
      setGioKhuya(dl.gioiHanHienTai.gio_khuya);
      setGioSang(dl.gioiHanHienTai.gio_sang);
    } catch (err: any) {
      setLoi(err?.message || 'Lỗi kết nối.');
    } finally {
      setBusy(false);
    }
  }

  async function luuGioiHan(e: React.FormEvent) {
    e.preventDefault();
    // Biểu thức chính quy (regex) kiểm tra hoặc tách chuỗi đúng mẫu dữ liệu
    const sach = ma.replace(/\s+/g, '');
    // Biểu thức chính quy (regex) kiểm tra hoặc tách chuỗi đúng mẫu dữ liệu
    if (!/^\d{6}$/.test(sach)) return;
    setBusy(true);
    setLoi('');
    setBao('');
    try {
      const res = await fetch('/phu-huynh/api', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'dat-gioi-han',
          ma: sach,
          phut_ngay: Number(phutNgay),
          gio_khuya: gioKhuya,
          gio_sang: gioSang,
        }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json?.error || 'Không lưu được giới hạn.');
      const dl: DuLieuPH = json.duLieu;
      setDuLieu(dl);
      setPhutNgay(String(dl.gioiHanHienTai.phut_ngay));
      setGioKhuya(dl.gioiHanHienTai.gio_khuya);
      setGioSang(dl.gioiHanHienTai.gio_sang);
      setBao('✓ Đã lưu giới hạn mới cho con (hệ thống tự áp dụng mức chặt hơn giữa thầy cô và phụ huynh).');
    } catch (err: any) {
      setLoi(err?.message || 'Không lưu được.');
    } finally {
      setBusy(false);
    }
  }

  return (
    <div style={{ display: 'grid', gap: 16 }}>
      <div className="card" style={{ display: 'grid', gap: 12 }}>
        <div style={{ display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap' }}>
          <AnhChuDe
            src="/tinh-nang/phu-huynh/nhap-ma.webp"
            fallback="/minh-hoa/nv/chao.webp"
            alt=""
            width={110}
            height={84}
            style={{ borderRadius: 12, objectFit: 'cover', flex: 'none' }}
          />
          <div style={{ flex: '1 1 220px' }}>
            <h2 style={{ margin: 0, fontSize: '1.08rem' }}>Nhập mã phụ huynh (6 chữ số)</h2>
            <p className="hint" style={{ margin: '4px 0 0' }}>
              Không cần tạo tài khoản. Trang chỉ hiển thị thời lượng học 7 ngày, dấu hiệu quá tải (nếu có) và phần đặt giới hạn giờ học — tuyệt đối không xem bài làm chi tiết hay tên bạn học khác.
            </p>
          </div>
        </div>

        {/* Khối giao diện: Biểu mẫu nhập liệu */}
        <form onSubmit={xemBangMa} style={{ display: 'flex', flexWrap: 'wrap', gap: 8, alignItems: 'center' }}>
          <input
            type="text"
            inputMode="numeric"
            maxLength={6}
            value={ma}
            onChange={(e) => setMa(e.target.value.replace(/[^\d]/g, '').slice(0, 6))}
            placeholder="Nhập mã 6 số (vd: 123456)"
            aria-label="Mã phụ huynh 6 chữ số"
            style={{ flex: '1 1 180px', padding: '10px 12px', fontSize: 18, letterSpacing: 4, fontWeight: 700, borderRadius: 10, border: '1.5px solid var(--line)' }}
          />
          <button type="submit" className="primary" disabled={busy}>
            {busy ? 'Đang kiểm tra…' : 'Xem & Cài đặt'}
          </button>
        </form>
        {loi && <p role="alert" style={{ color: '#b42318', fontWeight: 700, margin: 0 }}>{loi}</p>}
      </div>

      {duLieu && (
        <>
          {/* Khối giao diện: Khối nội dung chính */}
          <section className="card" style={{ display: 'grid', gap: 12 }}>
            <h2 style={{ margin: 0 }}>Tổng quan 7 ngày qua · {duLieu.tenGoiNgan}</h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: 10 }}>
              <div style={{ background: '#f4f8ff', padding: 12, borderRadius: 12, border: '1px solid #dbeafe', display: 'flex', gap: 10, alignItems: 'center' }}>
                <AnhChuDe src="/tinh-nang/phu-huynh/ic-phut-hoc.webp" fallbackNode={<span style={{ fontSize: 28 }}>⏳</span>} alt="" width={44} height={44} />
                <div>
                  <div className="hint" style={{ margin: 0 }}>Tổng thời lượng</div>
                  <b style={{ fontSize: '1.35rem', color: 'var(--navy-d)' }}>{duLieu.phut7Ngay} phút</b>
                </div>
              </div>
              <div style={{ background: '#f5fbf7', padding: 12, borderRadius: 12, border: '1px solid #bbf7d0', display: 'flex', gap: 10, alignItems: 'center' }}>
                <AnhChuDe src="/tinh-nang/phu-huynh/ic-gioi-han.webp" fallbackNode={<span style={{ fontSize: 28 }}>⏱️</span>} alt="" width={44} height={44} />
                <div>
                  <div className="hint" style={{ margin: 0 }}>Giới hạn đang áp dụng</div>
                  <b style={{ fontSize: '1.25rem', color: '#14532d' }}>{duLieu.gioiHanHienTai.phut_ngay} phút/ngày</b>
                </div>
              </div>
              <div style={{ background: '#f8fafc', padding: 12, borderRadius: 12, border: '1px solid var(--line)', display: 'flex', gap: 10, alignItems: 'center' }}>
                <AnhChuDe src="/tinh-nang/phu-huynh/ic-gio-ngu.webp" fallbackNode={<span style={{ fontSize: 28 }}>🌙</span>} alt="" width={44} height={44} />
                <div>
                  <div className="hint" style={{ margin: 0 }}>Khung giờ nghỉ ngơi</div>
                  <b>{duLieu.gioiHanHienTai.gio_khuya} – {duLieu.gioiHanHienTai.gio_sang}</b>
                </div>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, minmax(0, 1fr))', gap: 6, marginTop: 4 }}>
              {duLieu.chiTiet7Ngay.map((d) => (
                <div key={d.ngay} style={{ background: '#f8fafc', borderRadius: 8, padding: '6px 4px', textAlign: 'center', fontSize: 12 }}>
                  <div style={{ color: 'var(--muted)' }}>{d.ngay.slice(8)}/{d.ngay.slice(5, 7)}</div>
                  <b>{d.phut}p</b>
                </div>
              ))}
            </div>

            <div>
              <h3 style={{ margin: '6px 0', fontSize: '0.96rem' }}>Dấu hiệu cần nghỉ ngơi trong 7 ngày</h3>
              {duLieu.dauHieuQuaTai.length === 0 ? (
                <p className="hint" style={{ margin: 0 }}>Chưa ghi nhận dấu hiệu học quá tải nào tuần này.</p>
              ) : (
                <ul style={{ margin: 0, paddingLeft: 18 }}>
                  {duLieu.dauHieuQuaTai.map((x) => (
                    <li key={x.loai}>{x.ten}: <b>{x.soLan} lần</b></li>
                  ))}
                </ul>
              )}
            </div>
          </section>

          {/* Khối giao diện: Khối nội dung chính */}
          <section className="card">
            <h2 style={{ marginTop: 0 }}>Đặt giới hạn cho con</h2>
            {/* Khối giao diện: Biểu mẫu nhập liệu */}
            <form onSubmit={luuGioiHan} style={{ display: 'grid', gap: 10 }}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: 10 }}>
                <label style={{ display: 'grid', gap: 4, fontSize: 13.5, fontWeight: 700 }}>
                  Phút tối đa mỗi ngày
                  <input
                    type="number"
                    min={20}
                    max={240}
                    value={phutNgay}
                    onChange={(e) => setPhutNgay(e.target.value)}
                    style={{ padding: 8, borderRadius: 8, border: '1.5px solid var(--line)', fontSize: 15 }}
                  />
                </label>
                <label style={{ display: 'grid', gap: 4, fontSize: 13.5, fontWeight: 700 }}>
                  Giờ bắt đầu nghỉ buổi tối
                  <input
                    type="time"
                    value={gioKhuya}
                    onChange={(e) => setGioKhuya(e.target.value)}
                    style={{ padding: 8, borderRadius: 8, border: '1.5px solid var(--line)', fontSize: 15 }}
                  />
                </label>
                <label style={{ display: 'grid', gap: 4, fontSize: 13.5, fontWeight: 700 }}>
                  Giờ mở lại buổi sáng
                  <input
                    type="time"
                    value={gioSang}
                    onChange={(e) => setGioSang(e.target.value)}
                    style={{ padding: 8, borderRadius: 8, border: '1.5px solid var(--line)', fontSize: 15 }}
                  />
                </label>
              </div>
              <div>
                <button type="submit" className="primary" disabled={busy}>
                  {busy ? 'Đang lưu…' : 'Lưu giới hạn cho con'}
                </button>
              </div>
              {bao && <p style={{ color: '#14532d', fontWeight: 700, margin: 0 }}>{bao}</p>}
            </form>
          </section>
        </>
      )}
    </div>
  );
}
