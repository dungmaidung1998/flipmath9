'use client';

/**
 * FILE NÀY LÀM GÌ: Giao diện số hoá bài kiểm tra KTTX trên giấy cho học sinh (kèm hộp che tên Canvas) và màn hình duyệt/thống kê cho giáo viên.
 * AI DÙNG: học sinh
 * LẤY DỮ LIỆU TỪ: không truy vấn bảng trực tiếp
 * GỌI TỚI: @/components/MathText, @/components/AnhChuDe, @/lib/anhCanvas, @/lib/khkt/kttx
 */
import { useEffect, useRef, useState } from 'react';
import MathText from '@/components/MathText';
import AnhChuDe from '@/components/AnhChuDe';
import {
  xuLyAnhKttxCanvas,
  type CatVienAnh,
  type VungCheCanvas,
} from '@/lib/anhCanvas';
import type { CauKTTX } from '@/lib/khkt/kttx';
import {
  chuanHoaTrangThaiKTTX,
  kiemTraDiemCauHopLe,
} from '@/lib/khkt/kttx';
import './kttx.css';

export type BaiKttxItem = {
  id: string;
  tieu_de: string;
  chuong: string | null;
  ngay_thi: string | null;
  thang_diem: number;
  khung_cau?: any[];
};

export type BaiNopKttxHS = {
  id: string;
  bai_id: string | null;
  ten_bai_ai: string | null;
  ngay_thi_ai: string | null;
  so_trang: number;
  tong_diem_ai: number | null;
  tong_diem_tren_bai: number | null;
  tong_diem_hs?: number | null;
  tong_diem_excel?: number | null;
  tong_diem_gv: number | null;
  tong_diem_khop: boolean;
  can_kiem_tra: boolean;
  ly_do_kiem_tra: string[];
  mo_hinh: string | null;
  trang_thai: 'ai-nhap' | 'hs-xac-nhan' | 'hs-bao-sai' | 'da-chot' | 'lech' | 'tu-choi' | string;
  nhan_xet_gv: string | null;
  hs_ly_do_bao_sai?: string | null;
  hs_xac_nhan_luc?: string | null;
  chua_co_anh?: boolean;
  tao_luc: string;
  cacCau: CauKTTX[];
};

export type LoiDictItem = {
  error_code: string;
  ku_id: string | null;
  misconception: string;
};

type TrangAnh = {
  id: string;
  file: File;
  rotateDeg: number;
  crop: CatVienAnh;
  highContrast: boolean;
  vungChe: VungCheCanvas[];
  previewUrl: string;
  base64: string;
  bytes: number;
};

/**
 * Component React `KttxHocSinhClient`: nhận props (thuộc tính truyền vào từ component cha) và dựng giao diện tương ứng.
 */
export default function KttxHocSinhClient({
  baiListBanDau,
  baiNopBanDau,
  errorDictionary,
  quotaBanDau,
  chuaCoBangBanDau = false,
  cheDoXemThu = false,
}: {
  baiListBanDau: BaiKttxItem[];
  baiNopBanDau: BaiNopKttxHS[];
  errorDictionary: LoiDictItem[];
  quotaBanDau: {
    daDungHomNay: number;
    gioiHanNgay: number;
    conLaiHomNay: number;
    consentStatus: string;
    coKhoaClaude: boolean;
    aiBat: boolean;
  };
  chuaCoBangBanDau?: boolean;
  cheDoXemThu?: boolean;
}) {
  const [baiList] = useState<BaiKttxItem[]>(baiListBanDau);
  const [baiChonId, setBaiChonId] = useState<string>(baiListBanDau[0]?.id ?? '');
  const [submissions, setSubmissions] = useState<BaiNopKttxHS[]>(baiNopBanDau);
  const [quota, setQuota] = useState(quotaBanDau);
  const [chuaCoBang] = useState(chuaCoBangBanDau);

  const [pages, setPages] = useState<TrangAnh[]>([]);
  const [activeIdx, setActiveIdx] = useState<number>(0);
  const [cheDoCheTen, setCheDoCheTen] = useState<boolean>(true);
  const [dangVe, setDangVe] = useState<{ x0: number; y0: number; x1: number; y1: number } | null>(null);
  const hopRef = useRef<HTMLDivElement>(null);

  const [busy, setBusy] = useState(false);
  const [loi, setLoi] = useState('');
  const [thongBao, setThongBao] = useState('');

  const baiDauTT = baiNopBanDau[0] ? chuanHoaTrangThaiKTTX(baiNopBanDau[0].trang_thai) : null;
  const [dangSuaId, setDangSuaId] = useState<string | null>(
    baiNopBanDau[0] && baiDauTT !== 'da-chot' ? baiNopBanDau[0].id : null
  );
  const [cauSua, setCauSua] = useState<CauKTTX[]>(baiNopBanDau[0]?.cacCau ?? []);
  const [tongTrenBaiSua, setTongTrenBaiSua] = useState<string>(
    baiNopBanDau[0]?.tong_diem_tren_bai != null ? String(baiNopBanDau[0].tong_diem_tren_bai) : ''
  );
  const [moBaoSai, setMoBaoSai] = useState<boolean>(baiDauTT === 'hs-bao-sai');
  const [lyDoBaoSai, setLyDoBaoSai] = useState<string>(baiNopBanDau[0]?.hs_ly_do_bao_sai ?? '');

  const activePage = pages[activeIdx] ?? null;

  async function xuLyLaiTrang(p: TrangAnh): Promise<TrangAnh> {
    const kq = await xuLyAnhKttxCanvas(p.file, {
      rotateDeg: p.rotateDeg,
      crop: p.crop,
      highContrast: p.highContrast,
      vungChe: p.vungChe,
      maxBytes: 960_000,
    });
    return { ...p, previewUrl: kq.dataUrl, base64: kq.base64, bytes: kq.bytes };
  }

  useEffect(() => {
    if (!activePage) return;
    let huy = false;
    xuLyLaiTrang(activePage)
      .then((capNhat) => {
        if (huy) return;
        setPages((prev) =>
          prev.map((item, idx) =>
            idx === activeIdx && item.id === capNhat.id ? capNhat : item
          )
        );
      })
      .catch(() => {});
    return () => {
      huy = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    activeIdx,
    activePage?.id,
    activePage?.rotateDeg,
    activePage?.highContrast,
    activePage?.crop.top,
    activePage?.crop.bottom,
    activePage?.crop.left,
    activePage?.crop.right,
    activePage?.vungChe.length,
  ]);

  async function themTep(fileList: FileList | null) {
    if (!fileList?.length) return;
    setLoi('');
    setThongBao('');
    const moi: TrangAnh[] = [];
    const conCho = 4 - pages.length;
    // Tính toán, làm tròn hoặc giới hạn giá trị theo công thức
    const ds = Array.from(fileList).slice(0, Math.max(0, conCho));
    if (fileList.length > conCho) {
      setLoi('Mỗi bài KTTX tải tối đa 4 trang ảnh.');
    }
    for (let i = 0; i < ds.length; i++) {
      const f = ds[i];
      if (!f.type.startsWith('image/')) continue;
      const base: TrangAnh = {
        id: `${Date.now()}-${i}-${Math.random().toString(36).slice(2, 6)}`,
        file: f,
        rotateDeg: 0,
        crop: { top: 0, bottom: 0, left: 0, right: 0 },
        highContrast: false,
        vungChe: [],
        previewUrl: '',
        base64: '',
        bytes: 0,
      };
      try {
        moi.push(await xuLyLaiTrang(base));
      } catch (e: any) {
        setLoi(e?.message || 'Không xử lý được tệp ảnh.');
      }
    }
    if (moi.length) {
      setPages((prev) => {
        const next = [...prev, ...moi].slice(0, 4);
        // Tính toán, làm tròn hoặc giới hạn giá trị theo công thức
        setActiveIdx(Math.max(0, prev.length));
        return next;
      });
    }
  }

  function updateActive(fn: (p: TrangAnh) => TrangAnh) {
    setPages((prev) => prev.map((p, idx) => (idx === activeIdx ? fn(p) : p)));
  }

  function getNormPos(clientX: number, clientY: number) {
    const el = hopRef.current;
    if (!el) return { x: 0, y: 0 };
    const r = el.getBoundingClientRect();
    return {
      x: Math.max(0, Math.min(1, (clientX - r.left) / Math.max(1, r.width))),
      y: Math.max(0, Math.min(1, (clientY - r.top) / Math.max(1, r.height))),
    };
  }

  function onPointerDown(e: React.PointerEvent<HTMLDivElement>) {
    if (!cheDoCheTen || !activePage) return;
    e.currentTarget.setPointerCapture(e.pointerId);
    const p = getNormPos(e.clientX, e.clientY);
    setDangVe({ x0: p.x, y0: p.y, x1: p.x, y1: p.y });
  }

  function onPointerMove(e: React.PointerEvent<HTMLDivElement>) {
    if (!dangVe) return;
    const p = getNormPos(e.clientX, e.clientY);
    setDangVe((prev) => (prev ? { ...prev, x1: p.x, y1: p.y } : null));
  }

  function onPointerUp() {
    if (!dangVe || !activePage) return;
    // Tính toán, làm tròn hoặc giới hạn giá trị theo công thức
    const x = Math.min(dangVe.x0, dangVe.x1);
    // Tính toán, làm tròn hoặc giới hạn giá trị theo công thức
    const y = Math.min(dangVe.y0, dangVe.y1);
    // Tính toán, làm tròn hoặc giới hạn giá trị theo công thức
    const w = Math.abs(dangVe.x1 - dangVe.x0);
    // Tính toán, làm tròn hoặc giới hạn giá trị theo công thức
    const h = Math.abs(dangVe.y1 - dangVe.y0);
    setDangVe(null);
    if (w > 0.03 && h > 0.02) {
      updateActive((p) => ({ ...p, vungChe: [...p.vungChe, { x, y, w, h }] }));
    }
  }

  async function guiClaudeDocBai() {
    if (!pages.length) return;
    if (cheDoXemThu) {
      setThongBao('Đang ở chế độ xem thử cục bộ — dữ liệu mẫu đã được hiển thị bên dưới.');
      return;
    }
    setBusy(true);
    setLoi('');
    setThongBao('');
    try {
      const res = await fetch('/api/kttx', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'doc-va-luu',
          baiId: baiChonId || null,
          pages: pages.map((p) => ({
            imageBase64: p.base64,
            mediaType: 'image/jpeg',
          })),
        }),
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) {
        setLoi(json?.error || 'Không đọc được bài KTTX.');
        return;
      }
      const sub: BaiNopKttxHS = json.baiNop;
      setSubmissions((prev) => [sub, ...prev]);
      setDangSuaId(sub.id);
      setCauSua(sub.cacCau ?? []);
      setTongTrenBaiSua(sub.tong_diem_tren_bai != null ? String(sub.tong_diem_tren_bai) : '');
      setQuota((q) => ({
        ...q,
        daDungHomNay: q.daDungHomNay + pages.length,
        conLaiHomNay: Math.max(0, q.conLaiHomNay - pages.length),
      }));
      setPages([]);
      setThongBao('✓ Claude AI đã đọc xong bài KTTX. Em kiểm tra lại điểm từng câu bên dưới trước khi thầy cô duyệt.');
    } catch {
      setLoi('Lỗi kết nối khi gửi bài KTTX.');
    } finally {
      setBusy(false);
    }
  }

  async function guiXacNhanHS(kieu: 'xac-nhan-hs' | 'bao-sai-hs') {
    if (!dangSuaId) return;
    setLoi('');
    setThongBao('');

    const kiemDiem = kiemTraDiemCauHopLe(cauSua);
    if (!kiemDiem.hopLe) {
      setLoi(kiemDiem.lyDo || 'Điểm câu không hợp lệ.');
      return;
    }

    const lyDo = lyDoBaoSai.trim().slice(0, 200);
    if (kieu === 'bao-sai-hs' && !lyDo) {
      setMoBaoSai(true);
      setLoi('Em hãy nhập ngắn gọn lý do báo sai (tối đa 200 ký tự) trước khi gửi.');
      return;
    }

    if (cheDoXemThu) {
      const trangThaiMoi = kieu === 'bao-sai-hs' ? 'hs-bao-sai' : 'hs-xac-nhan';
      setSubmissions((prev) =>
        prev.map((s) =>
          s.id === dangSuaId
            ? {
                ...s,
                trang_thai: trangThaiMoi,
                tong_diem_hs: kiemDiem.tongTuCong,
                hs_ly_do_bao_sai: kieu === 'bao-sai-hs' ? lyDo : null,
                cacCau: cauSua,
              }
            : s
        )
      );
      setThongBao(
        kieu === 'bao-sai-hs'
          ? '✓ Đã ghi nhận phản hồi báo sai trên giao diện xem thử.'
          : '✓ Em đã xác nhận điểm trên giao diện xem thử.'
      );
      return;
    }

    setBusy(true);
    try {
      const res = await fetch('/api/kttx', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: kieu,
          baiNopId: dangSuaId,
          tongDiemTrenBai: tongTrenBaiSua.trim() === '' ? null : Number(tongTrenBaiSua.replace(',', '.')),
          tongDiemHs: kiemDiem.tongTuCong,
          lyDoBaoSai: kieu === 'bao-sai-hs' ? lyDo : undefined,
          cacCau: cauSua,
        }),
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) {
        setLoi(json?.error || 'Không lưu được xác nhận điểm.');
        return;
      }
      const capNhat: BaiNopKttxHS = json.baiNop;
      setSubmissions((prev) => prev.map((s) => (s.id === dangSuaId ? capNhat : s)));
      setThongBao(
        kieu === 'bao-sai-hs'
          ? '✓ Đã gửi báo sai cho thầy cô rà soát.'
          : '✓ Em đã xác nhận bảng điểm. Thầy cô sẽ đối chiếu bảng điểm Excel để chốt chính thức.'
      );
    } catch {
      setLoi('Lỗi kết nối khi lưu xác nhận.');
    } finally {
      setBusy(false);
    }
  }

  const dictMap = new Map(errorDictionary.map((e) => [e.error_code, e.misconception]));

  return (
    <main className="kttx-wrap">
      <div className="kttx-card">
        <div style={{ display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap' }}>
          <AnhChuDe
            src="/tinh-nang/kttx/dau-trang.webp"
            fallback="/minh-hoa/nv/kinh-lup.webp"
            alt="Số hoá bài kiểm tra thường xuyên"
            width={92}
            height={72}
            style={{ borderRadius: 12, objectFit: 'cover', flex: 'none' }}
          />
          <div style={{ flex: '1 1 220px' }}>
            <span className="kttx-pill" style={{ background: '#eff6ff', color: '#1d4ed8' }}>
              🤖 Claude AI hỗ trợ số hoá KTTX
            </span>
            <h1 style={{ margin: '6px 0 4px', fontSize: '1.3rem' }}>
              Chụp bài KTTX đã chấm để theo dõi lỗi
            </h1>
            <p className="hint" style={{ margin: 0 }}>
              Hôm nay còn <b>{quota.conLaiHomNay}/{quota.gioiHanNgay}</b> lượt ảnh. Mọi lỗi và điểm chính thức chỉ ghi vào Sổ lỗi sau khi thầy cô duyệt.
            </p>
          </div>
        </div>

        <div className="kttx-pii">
          🔒 <b>Bảo vệ riêng tư:</b> Dùng công cụ <b>Hộp che họ tên</b> kéo tô đen vùng ghi họ tên/trường lớp trên ảnh trước khi gửi AI. Ảnh tự xoá khỏi máy chủ sau 30 ngày.
        </div>

        <section className="kttx-hd-chup" aria-label="Hướng dẫn chụp bài kiểm tra rõ nét">
          <b style={{ fontSize: 13.5, color: '#1e293b' }}>📸 Chụp thế nào cho AI đọc đúng?</b>
          <div className="kttx-hd-luoi">
            <div className="kttx-hd-o dung">
              <AnhChuDe
                src="/tinh-nang/kttx/chup-dung.webp"
                fallback="/minh-hoa/nv/kinh-lup.webp"
                alt="Chụp đúng: thẳng từ trên xuống, đủ 4 góc, đủ sáng"
                width={200}
                height={150}
                loading="lazy"
              />
              <span>✓ Chụp thẳng, đủ 4 góc, đủ sáng</span>
            </div>
            <div className="kttx-hd-o">
              <AnhChuDe
                src="/tinh-nang/kttx/chup-sai-nghieng.webp"
                fallback="/minh-hoa/nv/suy-nghi.webp"
                alt="Chụp sai: đặt máy nghiêng làm lệch dòng"
                width={200}
                height={150}
                loading="lazy"
              />
              <span>✗ Chụp nghiêng dễ lệch dòng</span>
            </div>
            <div className="kttx-hd-o">
              <AnhChuDe
                src="/tinh-nang/kttx/chup-sai-toi.webp"
                fallback="/minh-hoa/nv/suy-nghi.webp"
                alt="Chụp sai: thiếu sáng hoặc có bóng đè lên chữ"
                width={200}
                height={150}
                loading="lazy"
              />
              <span>✗ Thiếu sáng, có bóng che chữ</span>
            </div>
            <div className="kttx-hd-o">
              <AnhChuDe
                src="/tinh-nang/kttx/chup-sai-cat-goc.webp"
                fallback="/minh-hoa/nv/suy-nghi.webp"
                alt="Chụp sai: cắt mất góc tờ bài kiểm tra"
                width={200}
                height={150}
                loading="lazy"
              />
              <span>✗ Cắt góc, thiếu câu hoặc điểm</span>
            </div>
          </div>
        </section>

        {chuaCoBang && (
          <div className="kttx-canh-bao">
            Chưa chạy file SQL <code>57-kttx.sql</code> trên Supabase — cần cô chạy SQL này để lưu bài KTTX.
          </div>
        )}

        {quota.consentStatus !== 'dong-y' && !cheDoXemThu && (
          <div className="kttx-canh-bao">
            Tính năng gửi ảnh cho AI chỉ bật khi em có trạng thái đồng ý tham gia nghiên cứu (<code>dong-y</code>). Em vẫn có thể xem các bài đã duyệt bên dưới.
          </div>
        )}

        <label style={{ display: 'grid', gap: 6, fontSize: 14, fontWeight: 700 }}>
          Chọn bài KTTX của lớp (hoặc để AI tự nhận diện tiêu đề)
          <select value={baiChonId} onChange={(e) => setBaiChonId(e.target.value)}>
            <option value="">Tự nhận diện tên bài từ ảnh</option>
            {baiList.map((b) => (
              <option key={b.id} value={b.id}>
                {b.tieu_de} {b.ngay_thi ? `(${b.ngay_thi})` : ''}
              </option>
            ))}
          </select>
        </label>

        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          <label className="primary" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, cursor: 'pointer', padding: '10px 14px', borderRadius: 10, fontWeight: 700, background: 'var(--navy, #1d4ed8)', color: '#fff' }}>
            📸 Chụp trang bài KTTX
            <input
              type="file"
              accept="image/*"
              capture="environment"
              style={{ display: 'none' }}
              disabled={pages.length >= 4}
              onChange={(e) => {
                void themTep(e.target.files);
                e.currentTarget.value = '';
              }}
            />
          </label>
          <label className="action-link" style={{ cursor: 'pointer' }}>
            🖼️ Chọn tối đa 4 ảnh từ máy
            <input
              type="file"
              accept="image/*"
              multiple
              style={{ display: 'none' }}
              disabled={pages.length >= 4}
              onChange={(e) => {
                void themTep(e.target.files);
                e.currentTarget.value = '';
              }}
            />
          </label>
        </div>

        {pages.length > 0 && activePage && (
          <div style={{ display: 'grid', gap: 10 }}>
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
              {pages.map((p, idx) => (
                <button
                  key={p.id}
                  type="button"
                  className={idx === activeIdx ? 'primary' : 'nho'}
                  onClick={() => setActiveIdx(idx)}
                >
                  Trang {idx + 1} ({Math.round(p.bytes / 1024)} KB)
                </button>
              ))}
            </div>

            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
              <button
                type="button"
                className="nho"
                onClick={() => updateActive((p) => ({ ...p, rotateDeg: (p.rotateDeg + 90) % 360 }))}
              >
                ↻ Xoay 90°
              </button>
              <label style={{ display: 'inline-flex', gap: 6, alignItems: 'center', fontSize: 13.5 }}>
                <input
                  type="checkbox"
                  checked={activePage.highContrast}
                  onChange={(e) => updateActive((p) => ({ ...p, highContrast: e.target.checked }))}
                  style={{ width: 'auto' }}
                />
                🌗 Tăng tương phản
              </label>
              <label style={{ display: 'inline-flex', gap: 6, alignItems: 'center', fontSize: 13.5 }}>
                <input
                  type="checkbox"
                  checked={cheDoCheTen}
                  onChange={(e) => setCheDoCheTen(e.target.checked)}
                  style={{ width: 'auto' }}
                />
                ⬛ Kéo chuột/ngón tay để che họ tên
              </label>
              <button
                type="button"
                className="nho"
                onClick={() =>
                  updateActive((p) => ({
                    ...p,
                    vungChe: [...p.vungChe, { x: 0.03, y: 0.02, w: 0.52, h: 0.14 }],
                  }))
                }
              >
                Che nhanh góc trên trái
              </button>
              {activePage.vungChe.length > 0 && (
                <button
                  type="button"
                  className="nho"
                  onClick={() => updateActive((p) => ({ ...p, vungChe: p.vungChe.slice(0, -1) }))}
                >
                  ↺ Bỏ 1 hộp che ({activePage.vungChe.length})
                </button>
              )}
              <button
                type="button"
                className="nho"
                onClick={() => {
                  setPages((prev) => prev.filter((_, i) => i !== activeIdx));
                  setActiveIdx(0);
                }}
              >
                🗑 Xoá trang này
              </button>
            </div>

            <div className="kttx-o-doi" style={{ gridTemplateColumns: 'repeat(4, minmax(0, 1fr))' }}>
              {(['top', 'bottom', 'left', 'right'] as const).map((side) => (
                <label key={side} style={{ fontSize: 12 }}>
                  Cắt {side === 'top' ? 'trên' : side === 'bottom' ? 'dưới' : side === 'left' ? 'trái' : 'phải'} ({activePage.crop[side]}%)
                  <input
                    type="range"
                    min={0}
                    max={35}
                    value={activePage.crop[side]}
                    onChange={(e) => {
                      const val = Number(e.target.value);
                      updateActive((p) => ({ ...p, crop: { ...p.crop, [side]: val } }));
                    }}
                  />
                </label>
              ))}
            </div>

            <div
              ref={hopRef}
              className="kttx-canvas-hop"
              onPointerDown={onPointerDown}
              onPointerMove={onPointerMove}
              onPointerUp={onPointerUp}
              aria-label="Khung ảnh bài KTTX — kéo để vẽ hộp che tên"
            >
              {activePage.previewUrl && (
                <img src={activePage.previewUrl} alt={`Trang ${activeIdx + 1} bài KTTX`} />
              )}
              {dangVe && (
                <div
                  className="kttx-box-ve"
                  style={{
                    left: `${Math.min(dangVe.x0, dangVe.x1) * 100}%`,
                    top: `${Math.min(dangVe.y0, dangVe.y1) * 100}%`,
                    width: `${Math.abs(dangVe.x1 - dangVe.x0) * 100}%`,
                    height: `${Math.abs(dangVe.y1 - dangVe.y0) * 100}%`,
                  }}
                />
              )}
            </div>

            <button
              type="button"
              className="primary"
              disabled={busy || (!cheDoXemThu && quota.conLaiHomNay < pages.length)}
              onClick={guiClaudeDocBai}
            >
              {busy ? 'Claude AI đang đọc điểm & lời phê…' : `🔍 Gửi ${pages.length} trang để Claude AI đọc bài KTTX`}
            </button>
          </div>
        )}

        {loi && <p role="alert" style={{ color: '#b91c1c', fontWeight: 700, margin: 0 }}>{loi}</p>}
        {thongBao && <p role="status" style={{ color: '#15803d', fontWeight: 700, margin: 0 }}>{thongBao}</p>}
      </div>

      {/* Khu vực học sinh kiểm tra & xác nhận điểm AI đọc */}
      {dangSuaId && (() => {
        const hien = submissions.find((s) => s.id === dangSuaId);
        const ttHien = chuanHoaTrangThaiKTTX(hien?.trang_thai);
        const daKhoa = ttHien === 'da-chot';
        const tongTuCong = Math.round(
          cauSua.reduce((sum, c) => sum + (c.diemDat != null && Number.isFinite(c.diemDat) ? c.diemDat : 0), 0) * 100
        ) / 100;
        const kiemDiemHien = kiemTraDiemCauHopLe(cauSua);
        return (
        <section className="kttx-card" aria-label="Kiểm tra kết quả AI đọc">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 10 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, minWidth: 0 }}>
              <AnhChuDe
                src="/tinh-nang/kttx/xac-nhan.webp"
                fallback="/minh-hoa/nv/kinh-lup.webp"
                alt="Đối chiếu bảng điểm AI đọc với bài kiểm tra trên giấy"
                width={80}
                height={60}
                loading="lazy"
                style={{ borderRadius: 10, objectFit: 'cover', flex: 'none' }}
              />
              <div>
                <h2 style={{ margin: 0, fontSize: '1.1rem' }}>Bước 2 · Em kiểm tra &amp; xác nhận điểm</h2>
                <p className="hint" style={{ margin: '2px 0 0' }}>
                  Tổng điểm tự cộng: <b>{String(tongTuCong).replace('.', ',')}</b> điểm
                  {hien?.tong_diem_ai != null ? ` (AI đọc: ${String(hien.tong_diem_ai).replace('.', ',')})` : ''}
                </p>
              </div>
            </div>
            <span className={`kttx-pill ${ttHien === 'da-chot' ? 'duyet' : ttHien === 'lech' || ttHien === 'hs-bao-sai' ? 'tay' : 'cho'}`}>
              <AnhChuDe
                src={
                  ttHien === 'da-chot'
                    ? '/tinh-nang/kttx/ic-da-chot.webp'
                    : ttHien === 'hs-xac-nhan'
                      ? '/tinh-nang/kttx/ic-hs-xac-nhan.webp'
                      : ttHien === 'lech' || ttHien === 'hs-bao-sai'
                        ? '/tinh-nang/kttx/ic-lech.webp'
                        : '/tinh-nang/kttx/ic-ban-nhap.webp'
                }
                fallbackNode={<span>📝</span>}
                alt="Trạng thái bài nộp"
                width={24}
                height={24}
                className="kttx-ic"
                loading="lazy"
              />
              {ttHien === 'da-chot'
                ? 'Đã chốt chính thức'
                : ttHien === 'hs-xac-nhan'
                  ? 'Em đã xác nhận · Có thể sửa trước khi GV chốt'
                  : ttHien === 'hs-bao-sai'
                    ? 'Đã báo sai · Chờ GV kiểm tra'
                    : ttHien === 'lech'
                      ? 'Lệch điểm · Chờ GV kiểm tra'
                      : 'Bản nháp AI · Chờ em xác nhận'}
            </span>
          </div>

          {hien?.can_kiem_tra && (
            <div className="kttx-canh-bao">
              <b>⚠️ Cần rà soát kỹ:</b> {hien.ly_do_kiem_tra.join('; ')}
            </div>
          )}

          {!kiemDiemHien.hopLe && (
            <div className="kttx-canh-bao" role="alert">
              <b>⚠️ Chưa hợp lệ:</b> {kiemDiemHien.lyDo}
            </div>
          )}

          <label style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap', fontSize: 14 }}>
            <b>Tổng điểm thầy cô ghi trên đầu bài (nếu có):</b>
            <input
              type="text"
              inputMode="decimal"
              disabled={daKhoa}
              value={tongTrenBaiSua}
              onChange={(e) => setTongTrenBaiSua(e.target.value)}
              placeholder="Ví dụ: 7,5"
              style={{ width: 90 }}
            />
          </label>

          <div className="kttx-cau-list">
            {cauSua.map((c, idx) => (
              <div key={c.soCau} className={`kttx-cau-item${c.doTinCay < 0.6 ? ' thap' : ''}`}>
                <div style={{ display: 'flex', justifyContent: 'space-between', gap: 8, flexWrap: 'wrap' }}>
                  <b>Câu {c.soCau}</b>
                  <span className="hint" style={{ margin: 0 }}>
                    Độ rõ chữ: {Math.round(c.doTinCay * 100)}%
                    {c.kuId ? ` · ${c.kuId}` : ''}
                  </span>
                </div>
                <div style={{ fontSize: 13.5, color: '#334155' }}>
                  <MathText>{c.noiDungNgan}</MathText>
                </div>
                <div className="kttx-o-doi">
                  <label style={{ fontSize: 13 }}>
                    Điểm đạt {c.diemToiDa != null ? `(tối đa ${c.diemToiDa})` : ''}
                    <input
                      type="number"
                      step={0.25}
                      min={0}
                      max={c.diemToiDa ?? 10}
                      disabled={daKhoa}
                      value={c.diemDat ?? ''}
                      onChange={(e) => {
                        const raw = e.target.value === '' ? null : Number(e.target.value);
                        const v = raw != null && c.diemToiDa != null ? Math.min(c.diemToiDa, Math.max(0, raw)) : raw;
                        setCauSua((list) => list.map((x, i) => (i === idx ? { ...x, diemDat: v } : x)));
                      }}
                    />
                  </label>
                  <label style={{ fontSize: 13 }}>
                    Điểm tối đa
                    <input
                      type="number"
                      step={0.25}
                      min={0}
                      max={10}
                      disabled={daKhoa}
                      value={c.diemToiDa ?? ''}
                      onChange={(e) => {
                        const v = e.target.value === '' ? null : Number(e.target.value);
                        setCauSua((list) => list.map((x, i) => (i === idx ? { ...x, diemToiDa: v } : x)));
                      }}
                    />
                  </label>
                </div>
                <label style={{ fontSize: 13 }}>
                  Lời phê thầy cô / ghi chú thêm
                  <input
                    type="text"
                    disabled={daKhoa}
                    value={c.nhanXetGV}
                    onChange={(e) => {
                      const val = e.target.value;
                      setCauSua((list) => list.map((x, i) => (i === idx ? { ...x, nhanXetGV: val } : x)));
                    }}
                  />
                </label>
                {c.maLoiGoiY && (
                  <div style={{ fontSize: 12.5, color: '#9a3412' }}>
                    Lỗi AI gợi ý: <b>{c.maLoiGoiY}</b>
                    {dictMap.get(c.maLoiGoiY) ? ` — ${dictMap.get(c.maLoiGoiY)}` : ''}
                  </div>
                )}
              </div>
            ))}
          </div>

          {moBaoSai && !daKhoa && (
            <label style={{ display: 'grid', gap: 4, fontSize: 13.5 }}>
              <b>Lý do báo sai (tối đa 200 ký tự):</b>
              <input
                type="text"
                maxLength={200}
                value={lyDoBaoSai}
                onChange={(e) => setLyDoBaoSai(e.target.value)}
                placeholder="Ví dụ: Câu 2 trên giấy cô chấm 3,5 điểm nhưng AI đọc nhầm 2,5"
              />
            </label>
          )}

          {!daKhoa && (
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              <button
                type="button"
                className="primary"
                disabled={busy || !kiemDiemHien.hopLe}
                onClick={() => void guiXacNhanHS('xac-nhan-hs')}
              >
                ✓ Em xác nhận điểm đúng với bài thầy cô chấm
              </button>
              <button
                type="button"
                className="nho"
                disabled={busy || !kiemDiemHien.hopLe}
                onClick={() => {
                  if (!moBaoSai || !lyDoBaoSai.trim()) {
                    setMoBaoSai(true);
                  } else {
                    void guiXacNhanHS('bao-sai-hs');
                  }
                }}
              >
                {moBaoSai && lyDoBaoSai.trim() ? '⚠️ Gửi báo sai cho thầy cô' : 'Báo sai'}
              </button>
              <button type="button" className="nho" onClick={() => setDangSuaId(null)}>
                Thu gọn
              </button>
            </div>
          )}
        </section>
        );
      })()}

      {/* Lịch sử các bài KTTX đã nộp */}
      <section className="kttx-card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 8 }}>
          <h2 style={{ margin: 0, fontSize: '1.1rem' }}>Bài KTTX của em</h2>
          <a className="action-link" href="/so-loi">🪤 Mở Sổ lỗi</a>
        </div>

        {submissions.length === 0 ? (
          <p className="hint" style={{ margin: 0 }}>Chưa có bài KTTX nào được số hoá.</p>
        ) : (
          <div style={{ display: 'grid', gap: 10 }}>
            {submissions.map((s) => {
              const tt = chuanHoaTrangThaiKTTX(s.trang_thai);
              const diemCuoi = s.tong_diem_excel ?? s.tong_diem_gv ?? s.tong_diem_hs ?? s.tong_diem_tren_bai ?? s.tong_diem_ai;
              const cacLoi = Array.from(new Set((s.cacCau ?? []).map((c) => c.maLoiGoiY).filter(Boolean))) as string[];
              return (
                <article key={s.id} className="kttx-cau-item">
                  <div style={{ display: 'flex', justifyContent: 'space-between', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
                    <b>{s.ten_bai_ai || 'Bài kiểm tra thường xuyên'}</b>
                    <span className={`kttx-pill ${tt === 'da-chot' ? 'duyet' : tt === 'tu-choi' ? 'tu-choi' : tt === 'lech' || tt === 'hs-bao-sai' ? 'tay' : 'cho'}`}>
                      <AnhChuDe
                        src={
                          tt === 'da-chot'
                            ? '/tinh-nang/kttx/ic-da-chot.webp'
                            : tt === 'hs-xac-nhan'
                              ? '/tinh-nang/kttx/ic-hs-xac-nhan.webp'
                              : tt === 'lech' || tt === 'hs-bao-sai' || tt === 'tu-choi'
                                ? '/tinh-nang/kttx/ic-lech.webp'
                                : '/tinh-nang/kttx/ic-ban-nhap.webp'
                        }
                        fallbackNode={<span>📝</span>}
                        alt={
                          tt === 'da-chot'
                            ? 'Thầy cô đã chốt điểm'
                            : tt === 'hs-xac-nhan'
                              ? 'Học sinh đã xác nhận, chờ chốt'
                              : tt === 'lech' || tt === 'hs-bao-sai'
                                ? 'Lệch điểm cần thầy cô xem'
                                : 'Bản nháp AI'
                        }
                        width={24}
                        height={24}
                        className="kttx-ic"
                        loading="lazy"
                      />
                      {tt === 'da-chot'
                        ? 'Đã chốt điểm chính thức'
                        : tt === 'hs-xac-nhan'
                          ? 'Em đã xác nhận'
                          : tt === 'hs-bao-sai'
                            ? 'Đã báo sai'
                            : tt === 'lech'
                              ? 'Lệch điểm (chờ GV xem)'
                              : tt === 'tu-choi'
                                ? 'Cần chụp lại'
                                : 'AI nháp · Chờ em xác nhận'}
                    </span>
                  </div>
                  <div style={{ fontSize: 13.5, color: '#334155', display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'center' }}>
                    <span>Điểm chính thức / hiện tại: <b>{diemCuoi != null ? `${String(diemCuoi).replace('.', ',')}` : '—'}</b></span>
                    {s.tong_diem_ai != null && <span>AI: <b>{String(s.tong_diem_ai).replace('.', ',')}</b></span>}
                    {s.tong_diem_hs != null && <span>HS xác nhận: <b>{String(s.tong_diem_hs).replace('.', ',')}</b></span>}
                    {s.tong_diem_excel != null && <span>Excel GV: <b>{String(s.tong_diem_excel).replace('.', ',')}</b></span>}
                    <span>{s.chua_co_anh ? 'Chưa nộp ảnh (chốt bằng Excel)' : `Số trang: ${s.so_trang}`}</span>
                  </div>
                  {s.hs_ly_do_bao_sai && (
                    <p style={{ margin: 0, fontSize: 13, color: '#9a3412' }}>
                      <b>Lý do em báo sai:</b> {s.hs_ly_do_bao_sai}
                    </p>
                  )}
                  {s.nhan_xet_gv && (
                    <p style={{ margin: 0, fontSize: 13.5 }}>
                      <b>Nhận xét thầy cô:</b> {s.nhan_xet_gv}
                    </p>
                  )}
                  {cacLoi.length > 0 && (
                    <div style={{ fontSize: 12.5, color: '#475569' }}>
                      Lỗi cần ôn: {cacLoi.map((m) => `${m}${dictMap.get(m) ? ` (${dictMap.get(m)})` : ''}`).join('; ')}
                    </div>
                  )}
                  {tt !== 'da-chot' ? (
                    <div>
                      <button
                        type="button"
                        className="nho"
                        onClick={() => {
                          setDangSuaId(s.id);
                          setCauSua(s.cacCau ?? []);
                          setTongTrenBaiSua(s.tong_diem_tren_bai != null ? String(s.tong_diem_tren_bai) : '');
                          setLyDoBaoSai(s.hs_ly_do_bao_sai ?? '');
                          setMoBaoSai(tt === 'hs-bao-sai');
                        }}
                      >
                        ✏️ Kiểm tra / sửa xác nhận điểm
                      </button>
                    </div>
                  ) : (
                    <span className="hint" style={{ margin: 0 }}>🔒 Đã chốt chính thức, không sửa được nữa.</span>
                  )}
                </article>
              );
            })}
          </div>
        )}
      </section>
    </main>
  );
}
