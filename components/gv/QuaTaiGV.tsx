'use client';

/**
 * FILE NÀY LÀM GÌ: Component React phía trình duyệt phục vụ bảng điều khiển, biểu đồ và biểu mẫu thao tác cho giáo viên.
 * AI DÙNG: giáo viên
 * LẤY DỮ LIỆU TỪ: không truy vấn bảng trực tiếp
 * GỌI TỚI: @/lib/quaTai
 */
import { useState } from 'react';
import {
  CAU_HINH_QUA_TAI_MAC_DINH,
  NHAN_DAU_HIEU_QUA_TAI,
  type CauHinhQuaTai,
  type LoaiDauHieuQuaTai,
} from '@/lib/quaTai';

export type HocSinhQuaTaiRow = {
  student_id: string;
  tenHS: string;
  dem7Ngay: Record<LoaiDauHieuQuaTai, number> & { tong: number };
  gioiHan: {
    phut_ngay: number;
    gio_khuya: string;
    gio_sang: string;
    dat_boi: 'gv' | 'phu-huynh' | null;
  };
  coMaPhuHuynh: boolean;
};

const DS_LOAI: LoaiDauHieuQuaTai[] = [
  'khuya',
  'lien-tuc',
  'sai-lien-tiep',
  'don-dap',
  'vuot-ngay',
];

/**
 * Component React `QuaTaiGV`: nhận props (thuộc tính truyền vào từ component cha) và dựng giao diện tương ứng.
 */
export default function QuaTaiGV({
  lop,
  cauHinhBanDau,
  hocSinhBanDau,
}: {
  lop: string;
  cauHinhBanDau: CauHinhQuaTai;
  hocSinhBanDau: HocSinhQuaTaiRow[];
}) {
  const [cfg, setCfg] = useState<CauHinhQuaTai>(cauHinhBanDau);
  const [ttLop, setTtLop] = useState<string>('');
  const [dangLuuLop, setDangLuuLop] = useState(false);

  const [dsHs, setDsHs] = useState<HocSinhQuaTaiRow[]>(hocSinhBanDau);
  const [dangXuLyHs, setDangXuLyHs] = useState<string>('');
  const [thongBaoHs, setThongBaoHs] = useState<string>('');
  const [maMoi, setMaMoi] = useState<{
    studentId: string;
    tenHS: string;
    maTho: string;
  } | null>(null);
  const [daSaoChep, setDaSaoChep] = useState(false);

  async function luuCauHinhLop(e: React.FormEvent) {
    e.preventDefault();
    setDangLuuLop(true);
    setTtLop('');
    try {
      const r = await fetch('/api/gv/qua-tai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ hanhDong: 'luu-lop', lop, ...cfg }),
      });
      const d = await r.json().catch(() => ({}));
      setTtLop(r.ok ? '✓ Đã lưu cấu hình lớp.' : d?.error || 'Không lưu được.');
    } catch {
      setTtLop('Lỗi kết nối.');
    } finally {
      setDangLuuLop(false);
    }
  }

  function capNhatHs(studentId: string, patch: Partial<HocSinhQuaTaiRow['gioiHan']>) {
    setDsHs((prev) =>
      prev.map((h) =>
        h.student_id === studentId
          ? { ...h, gioiHan: { ...h.gioiHan, ...patch } }
          : h
      )
    );
  }

  async function luuGioiHanHs(h: HocSinhQuaTaiRow) {
    setDangXuLyHs(h.student_id);
    setThongBaoHs('');
    try {
      const r = await fetch('/api/gv/qua-tai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          hanhDong: 'luu-hs',
          lop,
          studentId: h.student_id,
          phut_ngay: h.gioiHan.phut_ngay,
          gio_khuya: h.gioiHan.gio_khuya,
          gio_sang: h.gioiHan.gio_sang,
        }),
      });
      const d = await r.json().catch(() => ({}));
      if (!r.ok) {
        setThongBaoHs(d?.error || 'Không lưu được giới hạn học sinh.');
      } else {
        setThongBaoHs(`✓ Đã cập nhật giới hạn riêng cho ${h.tenHS}.`);
      }
    } catch {
      setThongBaoHs('Lỗi kết nối khi lưu giới hạn.');
    } finally {
      setDangXuLyHs('');
    }
  }

  async function taoMaPhuHuynh(h: HocSinhQuaTaiRow) {
    setDangXuLyHs(h.student_id);
    setThongBaoHs('');
    setDaSaoChep(false);
    try {
      const r = await fetch('/api/gv/qua-tai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          hanhDong: 'tao-ma',
          lop,
          studentId: h.student_id,
        }),
      });
      const d = await r.json().catch(() => ({}));
      if (!r.ok || !d?.maTho) {
        setThongBaoHs(d?.error || 'Không tạo được mã phụ huynh.');
        return;
      }
      setDsHs((prev) =>
        prev.map((row) =>
          row.student_id === h.student_id ? { ...row, coMaPhuHuynh: true } : row
        )
      );
      setMaMoi({ studentId: h.student_id, tenHS: h.tenHS, maTho: String(d.maTho) });
    } catch {
      setThongBaoHs('Lỗi kết nối khi tạo mã phụ huynh.');
    } finally {
      setDangXuLyHs('');
    }
  }

  async function thuHoiMa(h: HocSinhQuaTaiRow) {
    setDangXuLyHs(h.student_id);
    setThongBaoHs('');
    try {
      const r = await fetch('/api/gv/qua-tai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          hanhDong: 'thu-hoi-ma',
          lop,
          studentId: h.student_id,
        }),
      });
      const d = await r.json().catch(() => ({}));
      if (!r.ok) {
        setThongBaoHs(d?.error || 'Không thu hồi được mã.');
        return;
      }
      setDsHs((prev) =>
        prev.map((row) =>
          row.student_id === h.student_id ? { ...row, coMaPhuHuynh: false } : row
        )
      );
      if (maMoi?.studentId === h.student_id) setMaMoi(null);
      setThongBaoHs(`Đã thu hồi mã phụ huynh của ${h.tenHS}.`);
    } catch {
      setThongBaoHs('Lỗi kết nối khi thu hồi mã.');
    } finally {
      setDangXuLyHs('');
    }
  }

  const huongDanText = maMoi
    ? `PHIẾU GỬI PHỤ HUYNH (FlipMath 9 — Học không quá tải)\nHọc sinh: ${maMoi.tenHS} (${maMoi.studentId})\n1. Mở trình duyệt vào trang: ${typeof window !== 'undefined' ? window.location.origin : ''}/phu-huynh (không cần tài khoản hay mật khẩu).\n2. Nhập mã phụ huynh gồm 6 chữ số: ${maMoi.maTho}\n3. Phụ huynh xem được thời lượng học 7 ngày, dấu hiệu quá tải hành vi học và có thể tự đặt giới hạn phút/ngày hoặc giờ nghỉ khuya tại nhà.\nLưu ý: Máy chủ chỉ lưu bản băm SHA-256 nên mã này chỉ hiển thị 1 lần khi tạo.`
    : '';

  async function saoChepHuongDan() {
    if (!huongDanText || typeof navigator === 'undefined' || !navigator.clipboard) return;
    try {
      await navigator.clipboard.writeText(huongDanText);
      setDaSaoChep(true);
    } catch {
      setDaSaoChep(false);
    }
  }

  const tongSuKienLop = dsHs.reduce((s, h) => s + h.dem7Ngay.tong, 0);

  return (
    <div style={{ display: 'grid', gap: 16, minWidth: 0 }}>
      {/* Khối giao diện: Biểu mẫu nhập liệu */}
      <form className="mc-khoi" style={{ minWidth: 0 }} onSubmit={luuCauHinhLop}>
        <h2 style={{ marginTop: 0 }}>1. Ngưỡng nhận diện quá tải hành vi của lớp</h2>
        <p className="mc-ghi" style={{ marginTop: 0 }}>
          Chỉ dựa trên hành vi học (giờ học, thời lượng liên tục, nhịp làm bài). Không dùng từ ngữ chẩn đoán sức khoẻ hay cảm xúc.
        </p>

        <ul className="mc-ds">
          <li className="mc-dong" style={{ display: 'flex', flexWrap: 'wrap', gap: '8px 12px', alignItems: 'center', justifyContent: 'space-between' }}>
            <label htmlFor="qt-phut-ngay" style={{ flex: '1 1 190px', textTransform: 'none', letterSpacing: 'normal', fontSize: 15, color: 'var(--ink)' }}>
              Giới hạn tối đa mỗi ngày <span className="mc-ghi">(mặc định 90 phút)</span>
            </label>
            <span style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
              <input
                id="qt-phut-ngay"
                type="number"
                min={20}
                max={240}
                value={cfg.phut_ngay}
                onChange={(e) => setCfg({ ...cfg, phut_ngay: Number(e.target.value) })}
                style={{ width: 80 }}
              />
              <span className="mc-ghi">phút</span>
            </span>
          </li>

          <li className="mc-dong" style={{ display: 'flex', flexWrap: 'wrap', gap: '8px 12px', alignItems: 'center', justifyContent: 'space-between' }}>
            <label htmlFor="qt-gio-khuya" style={{ flex: '1 1 210px', textTransform: 'none', letterSpacing: 'normal', fontSize: 15, color: 'var(--ink)' }}>
              Khung giờ nghỉ khuya – sáng sớm <span className="mc-ghi">(mặc định 22:30 – 05:30)</span>
            </label>
            <span style={{ display: 'flex', gap: 6, alignItems: 'center', flexWrap: 'wrap' }}>
              <input
                id="qt-gio-khuya"
                type="time"
                value={cfg.gio_khuya}
                onChange={(e) => setCfg({ ...cfg, gio_khuya: e.target.value })}
                style={{ width: 'auto' }}
              />
              <span>→</span>
              <input
                aria-label="Giờ sáng hết khuya"
                type="time"
                value={cfg.gio_sang}
                onChange={(e) => setCfg({ ...cfg, gio_sang: e.target.value })}
                style={{ width: 'auto' }}
              />
            </span>
          </li>

          <li className="mc-dong" style={{ display: 'flex', flexWrap: 'wrap', gap: '8px 12px', alignItems: 'center', justifyContent: 'space-between' }}>
            <label htmlFor="qt-lien-tuc" style={{ flex: '1 1 190px', textTransform: 'none', letterSpacing: 'normal', fontSize: 15, color: 'var(--ink)' }}>
              Nhắc nghỉ mắt sau khi học liên tục <span className="mc-ghi">(mặc định 50 phút)</span>
            </label>
            <span style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
              <input
                id="qt-lien-tuc"
                type="number"
                min={20}
                max={120}
                value={cfg.phut_lien_tuc}
                onChange={(e) => setCfg({ ...cfg, phut_lien_tuc: Number(e.target.value) })}
                style={{ width: 80 }}
              />
              <span className="mc-ghi">phút</span>
            </span>
          </li>

          <li className="mc-dong" style={{ display: 'flex', flexWrap: 'wrap', gap: '8px 12px', alignItems: 'center', justifyContent: 'space-between' }}>
            <label htmlFor="qt-sai-lt" style={{ flex: '1 1 190px', textTransform: 'none', letterSpacing: 'normal', fontSize: 15, color: 'var(--ink)' }}>
              Cảnh báo sai liên tiếp <span className="mc-ghi">(mặc định 5 câu)</span>
            </label>
            <span style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
              <input
                id="qt-sai-lt"
                type="number"
                min={3}
                max={10}
                value={cfg.sai_lien_tiep}
                onChange={(e) => setCfg({ ...cfg, sai_lien_tiep: Number(e.target.value) })}
                style={{ width: 80 }}
              />
              <span className="mc-ghi">câu</span>
            </span>
          </li>

          <li className="mc-dong" style={{ display: 'flex', flexWrap: 'wrap', gap: '8px 12px', alignItems: 'center', justifyContent: 'space-between' }}>
            <label htmlFor="qt-don-dap-cau" style={{ flex: '1 1 210px', textTransform: 'none', letterSpacing: 'normal', fontSize: 15, color: 'var(--ink)' }}>
              Nhịp làm dồn dập (15 phút cuối) <span className="mc-ghi">(mặc định ≥ 12 câu, ≥ 50% sai)</span>
            </label>
            <span style={{ display: 'flex', gap: 6, alignItems: 'center', flexWrap: 'wrap' }}>
              <input
                id="qt-don-dap-cau"
                type="number"
                min={6}
                max={25}
                value={cfg.don_dap_so_cau}
                onChange={(e) => setCfg({ ...cfg, don_dap_so_cau: Number(e.target.value) })}
                style={{ width: 70 }}
              />
              <span className="mc-ghi">câu /</span>
              <input
                aria-label="Tỉ lệ sai dồn dập (%)"
                type="number"
                min={20}
                max={80}
                value={Math.round(cfg.don_dap_ti_le * 100)}
                onChange={(e) => setCfg({ ...cfg, don_dap_ti_le: Number(e.target.value) / 100 })}
                style={{ width: 70 }}
              />
              <span className="mc-ghi">% sai</span>
            </span>
          </li>
        </ul>

        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, margin: '12px 0' }}>
          {(
            [
              ['bat_khuya', 'Nhắc giờ khuya'],
              ['bat_lien_tuc', 'Nhắc nghỉ 50 phút'],
              ['bat_sai_lien_tiep', 'Gợi ý giảm tải khi sai liên tiếp'],
              ['bat_don_dap', 'Nhắc chậm lại khi làm dồn dập'],
              ['bat_vuot_ngay', 'Khoá mềm bài mới khi hết phút/ngày'],
            ] as const
          ).map(([k, nhan]) => (
            <label
              key={k}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 6,
                textTransform: 'none',
                letterSpacing: 'normal',
                fontSize: 14,
                color: 'var(--ink)',
              }}
            >
              <input
                type="checkbox"
                checked={cfg[k]}
                onChange={(e) => setCfg({ ...cfg, [k]: e.target.checked })}
                style={{ width: 'auto', flex: 'none', margin: 0 }}
              />
              {nhan}
            </label>
          ))}
        </div>

        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'center' }}>
          <button type="submit" className="nho chinh" disabled={dangLuuLop}>
            {dangLuuLop ? 'Đang lưu…' : 'Lưu cấu hình lớp'}
          </button>
          <button
            type="button"
            className="nho"
            onClick={() => {
              setCfg({ ...CAU_HINH_QUA_TAI_MAC_DINH });
              setTtLop('');
            }}
          >
            Về mặc định
          </button>
          {ttLop && (
            <span style={{ fontWeight: 700, color: ttLop.startsWith('✓') ? '#15803d' : '#b91c1c' }}>
              {ttLop}
            </span>
          )}
        </div>
      </form>

      {maMoi && (
        <section
          className="mc-khoi"
          style={{ borderColor: '#2563eb', background: '#eff6ff' }}
          aria-live="polite"
        >
          <h2 style={{ marginTop: 0, color: '#1e3a8a' }}>
            Mã phụ huynh vừa tạo (chỉ hiển thị 1 lần)
          </h2>
          <p style={{ margin: '4px 0' }}>
            Học sinh: <b>{maMoi.tenHS}</b> ({maMoi.studentId})
          </p>
          <div
            style={{
              fontSize: '2rem',
              fontWeight: 900,
              letterSpacing: 6,
              padding: '10px 16px',
              background: '#fff',
              border: '2px dashed #2563eb',
              borderRadius: 12,
              display: 'inline-block',
              color: '#1e40af',
              margin: '6px 0 10px',
            }}
          >
            {maMoi.maTho}
          </div>
          <pre
            style={{
              whiteSpace: 'pre-wrap',
              background: '#fff',
              border: '1px solid #bfdbfe',
              borderRadius: 10,
              padding: 12,
              fontSize: 13.5,
              margin: '0 0 10px',
              fontFamily: 'inherit',
            }}
          >
            {huongDanText}
          </pre>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
            <button type="button" className="nho chinh" onClick={saoChepHuongDan}>
              {daSaoChep ? '✓ Đã sao chép hướng dẫn' : 'Sao chép hướng dẫn'}
            </button>
            <button
              type="button"
              className="nho"
              onClick={() => typeof window !== 'undefined' && window.print()}
            >
              In phiếu gửi phụ huynh
            </button>
            <button type="button" className="nho" onClick={() => setMaMoi(null)}>
              Đóng khung mã
            </button>
          </div>
        </section>
      )}

      {/* Khối giao diện: Khối nội dung chính */}
      <section className="mc-khoi" style={{ minWidth: 0 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', flexWrap: 'wrap', gap: 8 }}>
          <h2 style={{ marginTop: 0 }}>
            2. Theo dõi 7 ngày qua &amp; Mã phụ huynh từng học sinh
          </h2>
          <span className="mc-ghi">Tổng {tongSuKienLop} lượt dấu hiệu quá tải hành vi trong tuần</span>
        </div>

        {thongBaoHs && (
          <p
            role="status"
            style={{
              margin: '6px 0 10px',
              fontWeight: 700,
              color: thongBaoHs.startsWith('✓') || thongBaoHs.startsWith('Đã') ? '#15803d' : '#b91c1c',
            }}
          >
            {thongBaoHs}
          </p>
        )}

        <div style={{ overflowX: 'auto' }}>
          {/* Khối giao diện: Bảng số liệu tổng hợp */}
          <table style={{ width: '100%', minWidth: 720 }}>
            <thead>
              <tr>
                <th>Học sinh</th>
                <th>7 ngày qua</th>
                <th>Giới hạn riêng (phút/ngày · khuya · sáng)</th>
                <th>Mã phụ huynh</th>
              </tr>
            </thead>
            <tbody>
              {dsHs.map((h) => {
                const ban = dangXuLyHs === h.student_id;
                return (
                  <tr key={h.student_id}>
                    <td>
                      <b>{h.tenHS}</b>
                      <div className="mc-ghi">{h.student_id}</div>
                    </td>
                    <td>
                      {h.dem7Ngay.tong === 0 ? (
                        <span className="mc-ghi">0 lượt</span>
                      ) : (
                        <div style={{ display: 'grid', gap: 2, fontSize: 13 }}>
                          <b>{h.dem7Ngay.tong} lượt</b>
                          <span className="mc-ghi">
                            {DS_LOAI.filter((l) => h.dem7Ngay[l] > 0)
                              .map((l) => `${NHAN_DAU_HIEU_QUA_TAI[l].ten} (${h.dem7Ngay[l]})`)
                              .join(' · ')}
                          </span>
                        </div>
                      )}
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', alignItems: 'center' }}>
                        <input
                          aria-label={`Phút/ngày của ${h.tenHS}`}
                          type="number"
                          min={20}
                          max={240}
                          value={h.gioiHan.phut_ngay}
                          onChange={(e) => capNhatHs(h.student_id, { phut_ngay: Number(e.target.value) })}
                          style={{ width: 64 }}
                        />
                        <input
                          aria-label={`Giờ khuya của ${h.tenHS}`}
                          type="time"
                          value={h.gioiHan.gio_khuya}
                          onChange={(e) => capNhatHs(h.student_id, { gio_khuya: e.target.value })}
                        />
                        <input
                          aria-label={`Giờ sáng của ${h.tenHS}`}
                          type="time"
                          value={h.gioiHan.gio_sang}
                          onChange={(e) => capNhatHs(h.student_id, { gio_sang: e.target.value })}
                        />
                        <button
                          type="button"
                          className="nho"
                          disabled={ban}
                          onClick={() => luuGioiHanHs(h)}
                        >
                          Lưu
                        </button>
                      </div>
                      {h.gioiHan.dat_boi && (
                        <div className="mc-ghi">
                          Nguồn: {h.gioiHan.dat_boi === 'phu-huynh' ? 'Phụ huynh (chặt hơn được ưu tiên)' : 'Giáo viên'}
                        </div>
                      )}
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', alignItems: 'center' }}>
                        <span className="mc-ghi">
                          {h.coMaPhuHuynh ? 'Đang hoạt động' : 'Chưa cấp'}
                        </span>
                        <button
                          type="button"
                          className="nho chinh"
                          disabled={ban}
                          onClick={() => taoMaPhuHuynh(h)}
                        >
                          {h.coMaPhuHuynh ? 'Đổi mã 6 số' : 'Tạo mã 6 số'}
                        </button>
                        {h.coMaPhuHuynh && (
                          <button
                            type="button"
                            className="nho"
                            disabled={ban}
                            onClick={() => thuHoiMa(h)}
                          >
                            Thu hồi
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
