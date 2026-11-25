'use client';

/**
 * FILE NÀY LÀM GÌ: Component React giao diện hiển thị và xử lý tương tác của người dùng trên trình duyệt.
 * AI DÙNG: học sinh
 * LẤY DỮ LIỆU TỪ: không truy vấn bảng trực tiếp
 * GỌI TỚI: @/components/MathText
 */
import { useEffect, useState } from 'react';
import MathText from '@/components/MathText';
import './cham-vo.css';

type DongCham = {
  dong: string;
  ketQua: 'dung' | 'sai' | 'thieu';
  lyDo: string;
};

type KetQuaChamVo = {
  cacDong: DongCham[];
  diem: number;
  dongSaiDau: number | null;
  maLoi: string[];
  trangThai: 'xong' | 'nua-bai' | 'sai';
  goiYTiep: string;
  nhanXet: string;
  rutKinhNghiem: string;
  thieuTrinhBay: string[];
};

type CropMargins = { top: number; bottom: number; left: number; right: number };

/**
 * Component React `xuLyAnhCanvas`: nhận props (thuộc tính truyền vào từ component cha) và dựng giao diện tương ứng.
 */
async function xuLyAnhCanvas(
  srcDataUrl: string,
  rotateDeg: number,
  crop: CropMargins,
  highContrast: boolean
): Promise<{ dataUrl: string; bytes: number }> {
  const img = await new Promise<HTMLImageElement>((resolve, reject) => {
    const el = new Image();
    el.onload = () => resolve(el);
    el.onerror = () => reject(new Error('Không đọc được tệp ảnh.'));
    el.src = srcDataUrl;
  });

  // 1. Xoay ảnh lên canvas trung gian
  const rotCanvas = document.createElement('canvas');
  const rad = ((rotateDeg % 360) * Math.PI) / 180;
  const swap = rotateDeg % 180 !== 0;
  rotCanvas.width = swap ? img.height : img.width;
  rotCanvas.height = swap ? img.width : img.height;
  const rctx = rotCanvas.getContext('2d');
  if (!rctx) throw new Error('Trình duyệt không hỗ trợ Canvas.');
  rctx.translate(rotCanvas.width / 2, rotCanvas.height / 2);
  rctx.rotate(rad);
  rctx.drawImage(img, -img.width / 2, -img.height / 2);

  // 2. Cắt theo tỉ lệ % 4 cạnh
  const sx = Math.round((crop.left / 100) * rotCanvas.width);
  // Tính toán, làm tròn hoặc giới hạn giá trị theo công thức
  const sy = Math.round((crop.top / 100) * rotCanvas.height);
  // Tính toán, làm tròn hoặc giới hạn giá trị theo công thức
  const sw = Math.max(40, Math.round(((100 - crop.left - crop.right) / 100) * rotCanvas.width));
  // Tính toán, làm tròn hoặc giới hạn giá trị theo công thức
  const sh = Math.max(40, Math.round(((100 - crop.top - crop.bottom) / 100) * rotCanvas.height));

  // 3. Thu nhỏ giữ tỷ lệ và nén xuống ≤ 1 MB
  let maxDim = 1350;
  for (let pass = 0; pass < 4; pass++) {
    // Tính toán, làm tròn hoặc giới hạn giá trị theo công thức
    const scale = Math.min(1, maxDim / Math.max(sw, sh));
    // Tính toán, làm tròn hoặc giới hạn giá trị theo công thức
    const dw = Math.max(40, Math.round(sw * scale));
    // Tính toán, làm tròn hoặc giới hạn giá trị theo công thức
    const dh = Math.max(40, Math.round(sh * scale));

    const out = document.createElement('canvas');
    out.width = dw;
    out.height = dh;
    const octx = out.getContext('2d');
    if (!octx) throw new Error('Không khởi tạo được bộ xử lý ảnh.');
    octx.drawImage(rotCanvas, sx, sy, sw, sh, 0, 0, dw, dh);

    if (highContrast) {
      const imgData = octx.getImageData(0, 0, dw, dh);
      const d = imgData.data;
      const factor = 1.65;
      for (let i = 0; i < d.length; i += 4) {
        const lum = 0.299 * d[i] + 0.587 * d[i + 1] + 0.114 * d[i + 2];
        // Tính toán, làm tròn hoặc giới hạn giá trị theo công thức
        const adj = Math.max(0, Math.min(255, factor * (lum - 128) + 138));
        d[i] = adj;
        d[i + 1] = adj;
        d[i + 2] = adj;
      }
      octx.putImageData(imgData, 0, 0);
    }

    for (const q of [0.85, 0.72, 0.58, 0.45]) {
      const dataUrl = out.toDataURL('image/jpeg', q);
      // Tính toán, làm tròn hoặc giới hạn giá trị theo công thức
      const approxBytes = Math.ceil(((dataUrl.length - dataUrl.indexOf(',') - 1) * 3) / 4);
      if (approxBytes <= 960_000) {
        return { dataUrl, bytes: approxBytes };
      }
    }
    // Tính toán, làm tròn hoặc giới hạn giá trị theo công thức
    maxDim = Math.round(maxDim * 0.78);
  }

  const fallbackUrl = rotCanvas.toDataURL('image/jpeg', 0.4);
  // Tính toán, làm tròn hoặc giới hạn giá trị theo công thức
  const approxBytes = Math.ceil(((fallbackUrl.length - fallbackUrl.indexOf(',') - 1) * 3) / 4);
  return { dataUrl: fallbackUrl, bytes: approxBytes };
}

/**
 * Component React `ChamVoModal`: nhận props (thuộc tính truyền vào từ component cha) và dựng giao diện tương ứng.
 */
export function ChamVoModal({
  nguon,
  baiId,
  kuId,
  deBai,
  onDong,
}: {
  nguon: 'on-thi-10' | 'van-dung';
  baiId: string;
  kuId: string;
  deBai: string;
  onDong: () => void;
}) {
  const [buoc, setBuoc] = useState<'chup' | 'sua' | 'ket-qua'>('chup');
  const [trangThaiAI, setTrangThaiAI] = useState<{
    duDieuKien: boolean;
    conLaiHomNay: number;
    gioiHanNgay: number;
    lyDoChan: string | null;
  } | null>(null);

  const [rawUrl, setRawUrl] = useState<string>('');
  const [rotateDeg, setRotateDeg] = useState(0);
  const [crop, setCrop] = useState<CropMargins>({ top: 0, bottom: 0, left: 0, right: 0 });
  const [highContrast, setHighContrast] = useState(true);
  const [previewUrl, setPreviewUrl] = useState('');
  const [previewBytes, setPreviewBytes] = useState(0);

  const [luotId, setLuotId] = useState<string>('');
  const [dongList, setDongList] = useState<string[]>(['']);
  const [ketQua, setKetQua] = useState<KetQuaChamVo | null>(null);
  const [thongTinMaLoi, setThongTinMaLoi] = useState<{ error_code: string; misconception: string }[]>([]);
  const [busy, setBusy] = useState(false);
  const [loi, setLoi] = useState('');

  useEffect(() => {
    void fetch('/api/cham-vo', { cache: 'no-store' })
      .then((r) => r.json())
      .then((d) => setTrangThaiAI(d))
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (!rawUrl) return;
    let cancelled = false;
    void xuLyAnhCanvas(rawUrl, rotateDeg, crop, highContrast)
      .then((res) => {
        if (!cancelled) {
          setPreviewUrl(res.dataUrl);
          setPreviewBytes(res.bytes);
        }
      })
      .catch((e) => {
        if (!cancelled) setLoi(e?.message || 'Không xử lý được ảnh.');
      });
    return () => {
      cancelled = true;
    };
  }, [rawUrl, rotateDeg, crop, highContrast]);

  function chonTep(file: File | undefined) {
    if (!file) return;
    setLoi('');
    const reader = new FileReader();
    reader.onload = () => {
      setRawUrl(String(reader.result ?? ''));
      setRotateDeg(0);
      setCrop({ top: 0, bottom: 0, left: 0, right: 0 });
    };
    reader.readAsDataURL(file);
  }

  async function docAnh() {
    if (!previewUrl || busy) return;
    setBusy(true);
    setLoi('');
    try {
      const res = await fetch('/api/cham-vo', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          buoc: 'doc',
          nguon,
          baiId,
          kuId,
          deBai,
          imageDataUrl: previewUrl,
        }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json?.error || 'AI chưa đọc được, em chụp lại hoặc gõ bài');
      setLuotId(json.luotId || '');
      setDongList(Array.isArray(json.dong) && json.dong.length ? json.dong : ['']);
      if (typeof json.conLaiHomNay === 'number') {
        setTrangThaiAI((cu) => (cu ? { ...cu, conLaiHomNay: json.conLaiHomNay } : cu));
      }
      setBuoc('sua');
    } catch (e: any) {
      setLoi(e?.message || 'AI chưa đọc được, em chụp lại hoặc gõ bài');
    } finally {
      setBusy(false);
    }
  }

  async function chamBai() {
    const clean = dongList.map((d) => d.trim()).filter(Boolean);
    if (!clean.length || busy) {
      setLoi('Em cần có ít nhất một dòng bài làm trước khi bấm Chấm.');
      return;
    }
    setBusy(true);
    setLoi('');
    try {
      const res = await fetch('/api/cham-vo', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          buoc: 'cham',
          luotId: luotId || undefined,
          nguon,
          baiId,
          kuId,
          deBai,
          dongHocSinh: clean,
        }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json?.error || 'AI chưa đọc được, em chụp lại hoặc gõ bài');
      setKetQua(json.ketQua);
      setThongTinMaLoi(json.thongTinMaLoi ?? []);
      setBuoc('ket-qua');
    } catch (e: any) {
      setLoi(e?.message || 'AI chưa đọc được, em chụp lại hoặc gõ bài');
    } finally {
      setBusy(false);
    }
  }

  function lamTiepVaChupLai() {
    setKetQua(null);
    setRawUrl('');
    setPreviewUrl('');
    setLoi('');
    setBuoc('chup');
  }

  return (
    <div className="cv-man" role="dialog" aria-modal="true" aria-label="Chụp vở tự luận để AI chấm thử">
      <div className="cv-hop">
        <div className="cv-dau">
          <div>
            <span className="cv-nhan-ai">🤖 Bạn đang nhận phản hồi từ AI</span>
            <h2 style={{ margin: '6px 0 2px', fontSize: 18 }}>Chụp bài làm tự luận trong vở</h2>
            {trangThaiAI && (
              <small style={{ color: '#475569' }}>
                Hôm nay còn <b>{trangThaiAI.conLaiHomNay}/{trangThaiAI.gioiHanNgay}</b> lượt chụp ảnh
              </small>
            )}
          </div>
          <button type="button" onClick={onDong} aria-label="Đóng">✕</button>
        </div>

        <div className="cv-canh-bao-pii">
          ⚠️ <b>Lưu ý riêng tư:</b> Em hãy che hoặc <b>không chụp họ tên</b> trên trang vở. Ảnh bài làm chỉ lưu tối đa 30 ngày để thầy cô xem và xác nhận.
        </div>

        <div style={{ padding: '8px 12px', borderRadius: 10, background: '#f8fafc', border: '1px solid #e2e8f0', marginBottom: 12, fontSize: 14 }}>
          <b>Đề bài:</b> <MathText>{deBai}</MathText>
        </div>

        {trangThaiAI && !trangThaiAI.duDieuKien && (
          <p role="alert" style={{ color: '#c0312b', fontWeight: 700 }}>{trangThaiAI.lyDoChan}</p>
        )}

        {buoc === 'chup' && (!trangThaiAI || trangThaiAI.duDieuKien) && (
          <div>
            <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'center' }}>
              <label className="cv-nut-mo">
                📸 Mở camera chụp vở
                <input
                  type="file"
                  accept="image/*"
                  capture="environment"
                  style={{ display: 'none' }}
                  onChange={(e) => chonTep(e.target.files?.[0])}
                />
              </label>
              <label className="action-link" style={{ cursor: 'pointer' }}>
                🖼️ Chọn ảnh có sẵn
                <input
                  type="file"
                  accept="image/*"
                  style={{ display: 'none' }}
                  onChange={(e) => chonTep(e.target.files?.[0])}
                />
              </label>
              <button
                type="button"
                onClick={() => {
                  setDongList(['']);
                  setBuoc('sua');
                }}
              >
                ⌨️ Gõ bài trực tiếp
              </button>
            </div>

            {previewUrl && (
              <div style={{ marginTop: 12 }}>
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
                  <button type="button" onClick={() => setRotateDeg((r) => (r + 90) % 360)}>
                    ↻ Xoay 90°
                  </button>
                  <label style={{ display: 'inline-flex', gap: 6, alignItems: 'center', fontSize: 13.5 }}>
                    <input type="checkbox" checked={highContrast} onChange={(e) => setHighContrast(e.target.checked)} />
                    🌗 Tăng tương phản chữ viết
                  </label>
                  <span style={{ fontSize: 12.5, color: '#475569' }}>
                    Dung lượng nén: <b>{Math.round(previewBytes / 1024)} KB</b> (≤ 1024 KB)
                  </span>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, minmax(0, 1fr))', gap: 8, marginTop: 8, fontSize: 12 }}>
                  {(['top', 'bottom', 'left', 'right'] as const).map((side) => (
                    <label key={side}>
                      Cắt {side === 'top' ? 'trên' : side === 'bottom' ? 'dưới' : side === 'left' ? 'trái' : 'phải'} ({crop[side]}%)
                      <input
                        type="range"
                        min={0}
                        max={35}
                        value={crop[side]}
                        onChange={(e) => setCrop((c) => ({ ...c, [side]: Number(e.target.value) }))}
                        style={{ width: '100%' }}
                      />
                    </label>
                  ))}
                </div>

                <div className="cv-canvas-khung">
                  <img src={previewUrl} alt="Ảnh bài làm đã xử lý" />
                </div>

                <button type="button" className="primary" disabled={busy || (trangThaiAI?.conLaiHomNay ?? 1) <= 0} onClick={docAnh}>
                  {busy ? 'AI đang đọc từng dòng…' : '🔍 Đọc chữ viết tay trong ảnh'}
                </button>
              </div>
            )}
          </div>
        )}

        {buoc === 'sua' && (
          <div>
            <p style={{ margin: '0 0 8px', fontWeight: 700, fontSize: 14 }}>
              Kiểm tra và sửa lại nếu AI đọc nhầm dấu/số trước khi bấm Chấm:
            </p>
            <div style={{ display: 'grid', gap: 8 }}>
              {dongList.map((d, idx) => (
                <div key={idx} className="cv-dong-sua">
                  <span style={{ fontWeight: 800, paddingTop: 6 }}>{idx + 1}.</span>
                  <div style={{ display: 'grid', gap: 4 }}>
                    <input
                      value={d}
                      onChange={(e) =>
                        setDongList((list) => list.map((x, i) => (i === idx ? e.target.value : x)))
                      }
                      placeholder="Ví dụ: $\sqrt{9} - \sqrt{50} = 3 - 5\sqrt{2}$"
                      style={{ width: '100%', padding: '7px 9px', borderRadius: 8, border: '1px solid #cbd5e1' }}
                    />
                    <div style={{ fontSize: 13.5, color: '#334155', minHeight: 20 }}>
                      <MathText>{d}</MathText>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setDongList((list) => (list.length > 1 ? list.filter((_, i) => i !== idx) : ['']))}
                    aria-label="Xoá dòng"
                  >
                    🗑
                  </button>
                </div>
              ))}
            </div>

            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 12 }}>
              <button type="button" onClick={() => setDongList((l) => [...l, ''])}>+ Thêm dòng</button>
              <button type="button" onClick={() => setBuoc('chup')}>← Chụp/chọn lại ảnh</button>
              <button type="button" className="primary" disabled={busy} onClick={chamBai}>
                {busy ? 'AI đang chấm từng bước…' : '✅ Chấm bài'}
              </button>
            </div>
          </div>
        )}

        {buoc === 'ket-qua' && ketQua && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 8, marginBottom: 10 }}>
              <strong style={{ fontSize: 18 }}>
                Điểm tham khảo: {ketQua.diem.toFixed(2).replace('.', ',')}/1,00
              </strong>
              <span>
                {ketQua.trangThai === 'xong' ? '🏅 Hoàn thành tốt' : ketQua.trangThai === 'nua-bai' ? '👍 Đúng một phần' : '💪 Cần sửa lại'}
              </span>
            </div>

            <div style={{ display: 'grid', gap: 8 }}>
              {ketQua.cacDong.map((d, idx) => {
                const laSaiDau = ketQua.dongSaiDau === idx + 1;
                const icon = d.ketQua === 'dung' ? '✓' : d.ketQua === 'sai' ? '✗' : '⚠';
                return (
                  <div key={idx} className={`cv-kq-dong ${d.ketQua}${laSaiDau ? ' sai-dau' : ''}`}>
                    <div style={{ fontWeight: 700 }}>
                      <span style={{ color: d.ketQua === 'dung' ? '#15803d' : '#dc2626', marginRight: 6 }}>{icon}</span>
                      Dòng {idx + 1}: <MathText>{d.dong}</MathText>
                      {laSaiDau && <small style={{ marginLeft: 8, color: '#dc2626' }}>(Chỗ sai đầu tiên)</small>}
                    </div>
                    {d.lyDo && (
                      <div style={{ fontSize: 13.5, color: '#334155' }}>
                        <MathText>{d.lyDo}</MathText>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {ketQua.trangThai !== 'xong' && ketQua.goiYTiep && (
              <div className="cv-nua-bai">
                <p style={{ margin: '0 0 8px', fontWeight: 700 }}>
                  Em đúng tới đây 👍 · Bước tiếp theo: <MathText>{ketQua.goiYTiep}</MathText>
                </p>
                <button type="button" className="primary" onClick={lamTiepVaChupLai}>
                  📸 Làm tiếp và chụp lại
                </button>
              </div>
            )}

            {ketQua.thieuTrinhBay.length > 0 && (
              <div style={{ marginTop: 10, padding: '8px 12px', borderRadius: 10, background: '#fff7ed', border: '1px solid #fdba74', fontSize: 13.5 }}>
                <b>Thiếu trình bày:</b> {ketQua.thieuTrinhBay.join('; ')}
              </div>
            )}

            <p style={{ margin: '10px 0 0', fontSize: 14 }}>
              <b>Nhận xét:</b> <MathText>{ketQua.nhanXet}</MathText>
            </p>

            {ketQua.rutKinhNghiem && (
              <div className="cv-rut-kn">
                <b>📝 Rút kinh nghiệm:</b> <MathText>{ketQua.rutKinhNghiem}</MathText>
              </div>
            )}

            {thongTinMaLoi.length > 0 && (
              <div style={{ marginTop: 10, fontSize: 13, color: '#475569' }}>
                Đã ghi vào <a href="/so-loi">Sổ lỗi</a>:{' '}
                {thongTinMaLoi.map((m) => `${m.error_code} (${m.misconception})`).join('; ')}
              </div>
            )}

            <div className="cv-chan-minh-bach">
              AI chấm thử — điểm chính thức do thầy cô xác nhận.
            </div>
          </div>
        )}

        {loi && <p role="alert" style={{ color: '#c0312b', fontWeight: 700, marginTop: 10 }}>{loi}</p>}
      </div>
    </div>
  );
}

/**
 * Component React `NutChamVo`: nhận props (thuộc tính truyền vào từ component cha) và dựng giao diện tương ứng.
 */
export function NutChamVo({
  nguon,
  baiId,
  kuId,
  deBai,
  bat = true,
}: {
  nguon: 'on-thi-10' | 'van-dung';
  baiId: string;
  kuId: string;
  deBai: string;
  bat?: boolean;
}) {
  const [mo, setMo] = useState(false);
  if (!bat) return null;
  return (
    <>
      <button type="button" className="cv-nut-mo" onClick={() => setMo(true)}>
        📸 Chụp bài làm
      </button>
      {mo && (
        <ChamVoModal
          nguon={nguon}
          baiId={baiId}
          kuId={kuId}
          deBai={deBai}
          onDong={() => setMo(false)}
        />
      )}
    </>
  );
}

/**
 * Component React `KhoiChamVoVanDung`: nhận props (thuộc tính truyền vào từ component cha) và dựng giao diện tương ứng.
 */
export function KhoiChamVoVanDung({
  kuId,
  cauHoi,
  bat = true,
}: {
  kuId: string;
  cauHoi: { question_id: string; stem: string }[];
  bat?: boolean;
}) {
  const [chonId, setChonId] = useState(cauHoi[0]?.question_id ?? '');
  if (!bat || !cauHoi.length) return null;
  const chon = cauHoi.find((c) => c.question_id === chonId) ?? cauHoi[0];
  return (
    <section className="card" style={{ marginTop: 14, borderLeft: '4px solid #2563eb' }}>
      <h2 style={{ margin: '0 0 6px', fontSize: 17 }}>📸 Chụp bài tự luận trình bày vào vở (Bài Vận dụng)</h2>
      <p className="hint" style={{ marginTop: 0 }}>
        Em chọn một câu vận dụng, giải chi tiết vào vở rồi chụp để AI đọc từng dòng, chỉ chỗ sai và gợi mở bước tiếp theo.
      </p>
      <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'center', marginBottom: 8 }}>
        <select
          value={chon.question_id}
          onChange={(e) => setChonId(e.target.value)}
          style={{ flex: 1, minWidth: 220, padding: 8, borderRadius: 8, border: '1px solid var(--line)' }}
        >
          {cauHoi.map((q, idx) => (
            <option key={q.question_id} value={q.question_id}>
              Câu {idx + 1} ({q.question_id})
            </option>
          ))}
        </select>
        <NutChamVo nguon="van-dung" baiId={chon.question_id} kuId={kuId} deBai={chon.stem} bat={bat} />
      </div>
      <div style={{ fontSize: 14, padding: 10, borderRadius: 8, background: '#f8fafc' }}>
        <MathText>{chon.stem}</MathText>
      </div>
    </section>
  );
}
