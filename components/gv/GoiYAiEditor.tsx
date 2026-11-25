'use client';

/**
 * FILE NÀY LÀM GÌ: Component React phía trình duyệt phục vụ bảng điều khiển, biểu đồ và biểu mẫu thao tác cho giáo viên.
 * AI DÙNG: giáo viên
 * LẤY DỮ LIỆU TỪ: không truy vấn bảng trực tiếp
 * GỌI TỚI: @/components/MathText
 */
import { useState } from 'react';
import MathText from '@/components/MathText';

export type MucLoiGoiY = {
  error_code: string;
  misconception: string;
  viDu: string | null;
  soHS: number;
  tongLanSai: number;
  tiers: [string, string, string];
  nguon: 'gv' | 'ai-duyet' | null;
};

type TrangThaiLuu = {
  dangSoan?: boolean;
  dangLuu?: boolean;
  bao?: string;
  loi?: string;
  canhBaoLo?: string;
  tuAi: boolean;
};

/**
 * Component React `GoiYAiEditor`: nhận props (thuộc tính truyền vào từ component cha) và dựng giao diện tương ứng.
 */
export default function GoiYAiEditor({
  items,
  aiBat,
  coKhoa,
  phamViNhan
}: {
  items: MucLoiGoiY[];
  aiBat: boolean;
  coKhoa: boolean;
  phamViNhan: string;
}) {
  const [ds, setDs] = useState<MucLoiGoiY[]>(items);
  const [loc, setLoc] = useState<'tat-ca' | 'chua-duyet' | 'da-duyet'>('tat-ca');
  const [tt, setTt] = useState<Record<string, TrangThaiLuu>>({});

  const daDuyet = ds.filter((x) => x.tiers.every((t) => t.trim().length > 0)).length;

  function capNhatTier(code: string, idx: 0 | 1 | 2, val: string) {
    setDs((cu) =>
      cu.map((x) => {
        if (x.error_code !== code) return x;
        const tiers: [string, string, string] = [...x.tiers] as [string, string, string];
        tiers[idx] = val;
        return { ...x, tiers };
      })
    );
  }

  async function soanAi(code: string) {
    setTt((p) => ({ ...p, [code]: { ...(p[code] ?? { tuAi: false }), dangSoan: true, bao: undefined, loi: undefined } }));
    try {
      const res = await fetch('/api/gv/goi-y-ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ hanhDong: 'soan-ai', errorCode: code })
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json?.error || 'Không soạn được gợi ý.');
      const goiY = json.goiY as [string, string, string];
      setDs((cu) => cu.map((x) => (x.error_code === code ? { ...x, tiers: goiY } : x)));
      setTt((p) => ({
        ...p,
        [code]: {
          dangSoan: false,
          tuAi: Boolean(json.tuAi),
          bao: json.canhBao
            ? `Đã điền bản nháp dự phòng (${json.canhBao}). Thầy cô sửa lại rồi bấm duyệt.`
            : 'Gemini đã soạn 3 tầng nháp. Thầy cô rà soát rồi bấm "Duyệt & lưu".'
        }
      }));
    } catch (e: any) {
      setTt((p) => ({
        ...p,
        [code]: { ...(p[code] ?? { tuAi: false }), dangSoan: false, loi: e?.message || 'Lỗi kết nối.' }
      }));
    }
  }

  async function luuDuyet(item: MucLoiGoiY, boQuaCanhBao = false) {
    const code = item.error_code;
    const dang = tt[code];
    const dungAi = Boolean(dang?.tuAi || item.nguon === 'ai-duyet');
    setTt((p) => ({ ...p, [code]: { ...(p[code] ?? { tuAi: dungAi }), dangLuu: true, bao: undefined, loi: undefined, canhBaoLo: undefined } }));
    try {
      const res = await fetch('/api/gv/goi-y-ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ hanhDong: 'luu', errorCode: code, tiers: item.tiers, dungAi, boQuaCanhBao })
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json?.error || 'Không lưu được gợi ý.');
      if (json?.canXacNhan && json?.canhBaoLoDapAn) {
        setTt((p) => ({
          ...p,
          [code]: { ...(p[code] ?? { tuAi: dungAi }), dangLuu: false, canhBaoLo: json.canhBaoLoDapAn }
        }));
        return;
      }
      setDs((cu) => cu.map((x) => (x.error_code === code ? { ...x, nguon: json.nguon } : x)));
      setTt((p) => ({
        ...p,
        [code]: {
          dangLuu: false,
          tuAi: json.nguon === 'ai-duyet',
          bao: 'Đã duyệt & lưu vào error_hints. Học sinh sai từ lần 2 sẽ thấy gợi ý này.'
        }
      }));
    } catch (e: any) {
      setTt((p) => ({
        ...p,
        [code]: { ...(p[code] ?? { tuAi: dungAi }), dangLuu: false, loi: e?.message || 'Lỗi lưu.' }
      }));
    }
  }

  const hien = ds.filter((x) => {
    const du = x.tiers.every((t) => t.trim().length > 0);
    if (loc === 'da-duyet') return du;
    if (loc === 'chua-duyet') return !du;
    return true;
  });

  return (
    <div style={{ display: 'grid', gap: 16 }}>
      <div className="the" style={{ display: 'flex', flexWrap: 'wrap', gap: 10, alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, alignItems: 'center' }}>
          <span className="pill">{phamViNhan}</span>
          <span className="pill">Mã lỗi sai ≥ 2 lần: <b>{ds.length}</b></span>
          <span className="pill">Đã duyệt đủ 3 tầng: <b>{daDuyet}/{ds.length}</b></span>
          <span className="pill">
            {!aiBat
              ? 'AI đang tắt (AI_TRO_GIUP_BAT=false)'
              : coKhoa
                ? 'Gemini sẵn sàng (chỉ giáo viên gọi)'
                : 'AI bật · chưa có GEMINI_API_KEY (có mẫu dự phòng)'}
          </span>
        </div>
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
          {(['tat-ca', 'chua-duyet', 'da-duyet'] as const).map((k) => (
            <button
              key={k}
              type="button"
              className={loc === k ? 'nho' : 'nho phu'}
              onClick={() => setLoc(k)}
            >
              {k === 'tat-ca' ? 'Tất cả' : k === 'chua-duyet' ? 'Chưa đủ gợi ý' : 'Đã duyệt'}
            </button>
          ))}
        </div>
      </div>

      {!hien.length && (
        <div className="the">
          <p className="nho">Chưa có mã lỗi nào phù hợp bộ lọc trong phạm vi lớp đang chọn.</p>
        </div>
      )}

      {hien.map((item) => {
        const dang = tt[item.error_code];
        const daDu = item.tiers.every((t) => t.trim().length > 0);
        return (
          <article key={item.error_code} className="the" style={{ display: 'grid', gap: 10 }}>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, alignItems: 'center', justifyContent: 'space-between' }}>
              <div>
                <b style={{ fontSize: '1.05rem', color: 'var(--navy-d)' }}>{item.error_code}</b>{' '}
                <span className="pill">{item.soHS} HS sai ≥ 2 lần ({item.tongLanSai} lượt)</span>{' '}
                <span className="pill">
                  {daDu
                    ? item.nguon === 'ai-duyet'
                      ? '🤖 AI hỗ trợ · Thầy cô đã duyệt'
                      : '✍️ Thầy cô soạn · Đã duyệt'
                    : 'Chưa đủ 3 tầng gợi ý'}
                </span>
              </div>
              {aiBat && (
                <button
                  type="button"
                  className="nho phu"
                  disabled={Boolean(dang?.dangSoan)}
                  onClick={() => soanAi(item.error_code)}
                >
                  {dang?.dangSoan ? 'Đang soạn nháp...' : '✨ AI soạn gợi ý'}
                </button>
              )}
            </div>

            <div style={{ fontSize: 14.5, lineHeight: 1.55 }}>
              <MathText>{item.misconception}</MathText>
              {item.viDu && (
                <p className="nho" style={{ marginTop: 4, color: 'var(--muted)' }}>
                  Ví dụ lỗi thường gặp: <MathText>{item.viDu}</MathText>
                </p>
              )}
            </div>

            <div style={{ display: 'grid', gap: 8 }}>
              {([
                [0, 'Tầng 1 — Nhắc chú ý nhẹ (hiện ngay khi học sinh sai lại lần 2)'],
                [1, 'Tầng 2 — Gợi mở bước làm / quy tắc'],
                [2, 'Tầng 3 — Ví dụ tương tự khác số (không cho đáp án cuối)']
              ] as const).map(([idx, nhan]) => (
                <label key={idx} style={{ display: 'grid', gap: 4, fontSize: 13.5, fontWeight: 600 }}>
                  <span>{nhan}</span>
                  <textarea
                    rows={2}
                    value={item.tiers[idx]}
                    onChange={(e) => capNhatTier(item.error_code, idx, e.target.value)}
                    placeholder={`Nhập gợi ý tầng ${idx + 1} (dùng $...$ cho công thức)...`}
                    style={{ width: '100%', padding: '8px 10px', borderRadius: 8, border: '1px solid var(--line)', font: 'inherit', fontWeight: 400 }}
                  />
                </label>
              ))}
            </div>

            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ fontSize: 13.5 }}>
                {dang?.loi && <span style={{ color: 'var(--st-nguy)', fontWeight: 600 }}>{dang.loi}</span>}
                {dang?.bao && <span style={{ color: 'var(--navy)', fontWeight: 600 }}>{dang.bao}</span>}
                {dang?.canhBaoLo && (
                  <div className="bang-vang" style={{ marginTop: 6, marginBottom: 0 }}>
                    ⚠️ {dang.canhBaoLo}{' '}
                    <button
                      type="button"
                      className="nho"
                      style={{ marginLeft: 8 }}
                      onClick={() => luuDuyet(item, true)}
                    >
                      Vẫn lưu theo quyết định của thầy cô
                    </button>
                  </div>
                )}
              </div>
              <button
                type="button"
                disabled={Boolean(dang?.dangLuu)}
                onClick={() => luuDuyet(item)}
              >
                {dang?.dangLuu ? 'Đang lưu...' : 'Duyệt & lưu vào error_hints'}
              </button>
            </div>
          </article>
        );
      })}
    </div>
  );
}
