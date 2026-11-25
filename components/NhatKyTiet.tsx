'use client';
/**
 * FILE NÀY LÀM GÌ: Component React giao diện hiển thị và xử lý tương tác của người dùng trên trình duyệt.
 * AI DÙNG: học sinh
 * LẤY DỮ LIỆU TỪ: không truy vấn bảng trực tiếp
 * GỌI TỚI: @/lib/dfle/ngay.js, @/components/UnitOptions
 */
import { useState } from 'react';
import { useRouter } from 'next/navigation';
// @ts-ignore — dùng chung với gói dfle-engine, viết bằng JavaScript thuần
import { homNayVN } from '@/lib/dfle/ngay.js';
import UnitOptions from '@/components/UnitOptions';

type KU = { ku_id: string; ku_name: string };

/**
 * Component React `NhatKyTiet`: nhận props (thuộc tính truyền vào từ component cha) và dựng giao diện tương ứng.
 */
export default function NhatKyTiet({
  classId, units, tuanGoiY
}: { classId: string; units: KU[]; tuanGoiY: number }) {
  const router = useRouter();
  const [tab, setTab] = useState<'nhat-ky' | 'ke-hoach'>('nhat-ky');
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<{ ok: boolean; t: string } | null>(null);

  const [tuan, setTuan] = useState(String(tuanGoiY));
  const [soTiet, setSoTiet] = useState('2');

  const [kuId, setKuId] = useState(units[0]?.ku_id ?? '');
  // Ngày mặc định phải là hôm nay THEO LỊCH VIỆT NAM. Lấy theo UTC thì mọi tiết
  // dạy buổi sáng (trước 7h) bị đề ngày hôm trước, và nhật ký tiết là bằng chứng
  // cho chỉ số độ trung thực — sai ngày là hỏng cả phép đối chiếu.
  const [ngay, setNgay] = useState(homNayVN());
  const [gio, setGio] = useState('');
  const [p1, setP1] = useState(false);
  const [p2, setP2] = useState(false);
  const [p3, setP3] = useState(false);
  const [nhom, setNhom] = useState(false);
  const [soHs, setSoHs] = useState('');
  const [ghiChu, setGhiChu] = useState('');

  async function gui(loai: 'nhat-ky' | 'ke-hoach') {
    setBusy(true); setMsg(null);
    const res = await fetch('/api/do-trung-thuc', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(
        loai === 'ke-hoach'
          ? { loai, classId, tuan: Number(tuan), soTietKeHoach: Number(soTiet) }
          : { loai, classId, tuan: Number(tuan), kuId, ngayDay: ngay, gioBatDau: gio,
              phaTruocGio: p1, phaTrenLop: p2, phaSauGio: p3, daChiaNhom: nhom,
              soHsCoMat: Number(soHs), ghiChu }
      )
    });
    const d = await res.json();
    setBusy(false);
    if (!res.ok) { setMsg({ ok: false, t: d.error ?? 'Không ghi được' }); return; }
    setMsg({ ok: true, t: d.thongBao });
    if (loai === 'nhat-ky') { setP1(false); setP2(false); setP3(false); setNhom(false); setGhiChu(''); }
    router.refresh();
  }

  const oCheck = (v: boolean, set: (b: boolean) => void, nhan: string, phu: string) => (
    <label className={'opt' + (v ? ' picked' : '')} style={{ alignItems: 'flex-start' }}>
      <input type="checkbox" checked={v} onChange={(e) => set(e.target.checked)} />
      <span>
        <strong>{nhan}</strong>
        <span className="hint" style={{ display: 'block', marginTop: 2 }}>{phu}</span>
      </span>
    </label>
  );

  return (
    <div className="card no-print">
      <h2>Ghi nhận</h2>
      <div style={{ display: 'flex', gap: 8, marginBottom: 14 }}>
        <button className={tab === 'nhat-ky' ? 'primary' : ''} onClick={() => setTab('nhat-ky')}>
          Nhật ký một tiết
        </button>
        <button className={tab === 'ke-hoach' ? 'primary' : ''} onClick={() => setTab('ke-hoach')}>
          Kế hoạch tuần
        </button>
      </div>

      <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap' }}>
        <span>
          <label htmlFor="tuan">Tuần thực nghiệm</label>
          <input id="tuan" type="number" min={1} max={40} value={tuan}
                 onChange={(e) => setTuan(e.target.value)} style={{ width: 110 }} />
        </span>
        {tab === 'ke-hoach' && (
          <span>
            <label htmlFor="st">Số tiết dự kiến dạy theo mô hình</label>
            <input id="st" type="number" min={0} max={10} value={soTiet}
                   onChange={(e) => setSoTiet(e.target.value)} style={{ width: 110 }} />
          </span>
        )}
      </div>

      {tab === 'ke-hoach' ? (
        <>
          <p className="hint" style={{ marginTop: 10 }}>
            Khai <strong>trước khi dạy</strong>. Con số này là mẫu số của độ trung thực: khai sau
            khi dạy xong, cho đúng bằng số tiết đã chạy trôi chảy, thì chỉ số nào cũng ra 100% và
            không còn đo được gì. Cả hai bảng đều lưu thời điểm ghi để đối chiếu.
          </p>
          <button className="primary" onClick={() => gui('ke-hoach')} disabled={busy}
                  style={{ marginTop: 12 }}>
            {busy ? 'Đang ghi…' : 'Ghi kế hoạch tuần'}
          </button>
        </>
      ) : (
        <>
          <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap', marginTop: 4 }}>
            <span style={{ minWidth: 260, flex: 1 }}>
              <label htmlFor="ku">Bài học</label>
              <select id="ku" value={kuId} onChange={(e) => setKuId(e.target.value)}>
                <UnitOptions units={units} />
              </select>
            </span>
            <span>
              <label htmlFor="ng">Ngày dạy</label>
              <input id="ng" type="date" value={ngay} onChange={(e) => setNgay(e.target.value)} />
            </span>
            <span>
              <label htmlFor="gi">Giờ bắt đầu</label>
              <input id="gi" type="time" value={gio} onChange={(e) => setGio(e.target.value)}
                     style={{ width: 130 }} />
            </span>
            <span>
              <label htmlFor="hs">Sĩ số có mặt</label>
              <input id="hs" type="number" min={0} value={soHs}
                     onChange={(e) => setSoHs(e.target.value)} style={{ width: 110 }} />
            </span>
          </div>

          <label style={{ marginTop: 12 }}>Tiết này đã chạy những pha nào?</label>
          {oCheck(p1, setP1, 'Pha trước giờ học',
            'Học sinh được giao video và bài kiểm tra chuẩn bị, có thời hạn trước tiết.')}
          {oCheck(p2, setP2, 'Pha trên lớp',
            'Có hoạt động phân hoá theo nhóm, không dạy lại toàn bộ nội dung video cho cả lớp.')}
          {oCheck(p3, setP3, 'Pha sau giờ học',
            'Học sinh làm bài vận dụng hoặc nội dung được hệ thống giao lại.')}
          {oCheck(nhom, setNhom, 'Có chia nhóm theo dữ liệu chẩn đoán',
            'Chia theo bảng ở trang Chia nhóm, không chia theo chỗ ngồi hay theo cảm tính.')}

          <label htmlFor="gc" style={{ marginTop: 10 }}>Ghi chú (tuỳ chọn)</label>
          <input id="gc" value={ghiChu} onChange={(e) => setGhiChu(e.target.value)}
                 placeholder="Ví dụ: mất điện 15 phút đầu giờ nên bỏ pha nhóm" />

          <p className="hint" style={{ marginTop: 8 }}>
            Không có ô “đã mở báo cáo chẩn đoán trước giờ dạy”: hệ thống tự ghi mỗi lần thầy cô mở
            bảng điều khiển lớp và tự đối chiếu với giờ bắt đầu tiết. Ô tự tích chỉ đo được sự
            trung thực của người điền, không đo được hành vi.
          </p>
          <button className="primary" onClick={() => gui('nhat-ky')} disabled={busy || !kuId}
                  style={{ marginTop: 12 }}>
            {busy ? 'Đang ghi…' : 'Ghi nhật ký tiết dạy'}
          </button>
        </>
      )}

      {msg && (
        <p className={msg.ok ? 'hint' : 'err'} style={{ marginTop: 10, fontSize: 13 }}>{msg.t}</p>
      )}
    </div>
  );
}
