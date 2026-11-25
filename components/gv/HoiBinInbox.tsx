'use client';

/**
 * FILE NÀY LÀM GÌ: Component React phía trình duyệt phục vụ bảng điều khiển, biểu đồ và biểu mẫu thao tác cho giáo viên.
 * AI DÙNG: giáo viên
 * LẤY DỮ LIỆU TỪ: không truy vấn bảng trực tiếp
 * GỌI TỚI: @/components/MathText
 */
import { useState } from 'react';
import MathText from '@/components/MathText';

export type CauHoiBinGV = {
  id: string;
  student_id: string;
  tenHS: string;
  class_id: string;
  tenLop: string;
  ku_id: string | null;
  cau_hoi: string;
  trang_thai: 'cho' | 'da-tra-loi' | 'tu-choi';
  tra_loi: string | null;
  nguon: 'gv' | 'ai-duyet' | null;
  tao_luc: string;
};

export type MucNganHangGV = {
  id: string;
  ku_id: string | null;
  cau_hoi: string;
  tra_loi: string;
  tu_khoa: string[];
  nguon: 'gv' | 'ai-duyet';
  so_lan_dung: number;
};

/**
 * Component React `HoiBinInbox`: nhận props (thuộc tính truyền vào từ component cha) và dựng giao diện tương ứng.
 */
export default function HoiBinInbox({
  items,
  nganHang,
  aiBat,
  coKhoa,
  phamViNhan
}: {
  items: CauHoiBinGV[];
  nganHang: MucNganHangGV[];
  aiBat: boolean;
  coKhoa: boolean;
  phamViNhan: string;
}) {
  const [ds, setDs] = useState<CauHoiBinGV[]>(items);
  const [loc, setLoc] = useState<'cho' | 'da-tra-loi' | 'tat-ca'>('cho');
  const [nhap, setNhap] = useState<Record<string, string>>(() =>
    Object.fromEntries(items.map((x) => [x.id, x.tra_loi ?? '']))
  );
  const [tuKhoa, setTuKhoa] = useState<Record<string, string>>({});
  const [luuBank, setLuuBank] = useState<Record<string, boolean>>(() =>
    Object.fromEntries(items.map((x) => [x.id, true]))
  );
  const [dungAi, setDungAi] = useState<Record<string, boolean>>({});
  const [ban, setBan] = useState<Record<string, string>>({});
  const [bao, setBao] = useState<Record<string, { ok?: string; err?: string; canhBaoLo?: string }>>({});

  async function soanAi(id: string) {
    setBan((p) => ({ ...p, [id]: 'soan' }));
    setBao((p) => ({ ...p, [id]: {} }));
    try {
      const res = await fetch('/api/gv/hoi-bin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ hanhDong: 'soan-nhap', id })
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json?.error || 'Không soạn được nháp.');
      setNhap((p) => ({ ...p, [id]: json.nhap ?? '' }));
      setDungAi((p) => ({ ...p, [id]: Boolean(json.tuAi) }));
      setBao((p) => ({
        ...p,
        [id]: {
          ok: json.canhBao
            ? `Đã điền gợi ý dự phòng (${json.canhBao}).`
            : 'Gemini đã soạn nháp (không gửi tên/mã học sinh). Thầy cô sửa lại rồi bấm gửi.'
        }
      }));
    } catch (e: any) {
      setBao((p) => ({ ...p, [id]: { err: e?.message || 'Lỗi AI.' } }));
    } finally {
      setBan((p) => ({ ...p, [id]: '' }));
    }
  }

  async function guiTraLoi(item: CauHoiBinGV, boQuaCanhBao = false) {
    const text = (nhap[item.id] ?? '').trim();
    if (!text) return;
    setBan((p) => ({ ...p, [item.id]: 'gui' }));
    setBao((p) => ({ ...p, [item.id]: {} }));
    try {
      const res = await fetch('/api/gv/hoi-bin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          hanhDong: 'tra-loi',
          id: item.id,
          traLoi: text,
          dungAi: Boolean(dungAi[item.id]),
          luuNganHang: luuBank[item.id] ?? true,
          tuKhoa: tuKhoa[item.id] ?? '',
          boQuaCanhBao
        })
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json?.error || 'Không gửi được trả lời.');
      if (json?.canXacNhan && json?.canhBaoLoDapAn) {
        setBao((p) => ({ ...p, [item.id]: { canhBaoLo: json.canhBaoLoDapAn } }));
        return;
      }
      setDs((cu) =>
        cu.map((x) =>
          x.id === item.id
            ? { ...x, trang_thai: 'da-tra-loi', tra_loi: text, nguon: json.nguon }
            : x
        )
      );
      setBao((p) => ({
        ...p,
        [item.id]: {
          ok: json.daLuuNganHang
            ? 'Đã gửi cho học sinh và lưu vào ngân hàng Hỏi–Đáp.'
            : 'Đã gửi câu trả lời cho học sinh.'
        }
      }));
    } catch (e: any) {
      setBao((p) => ({ ...p, [item.id]: { err: e?.message || 'Lỗi gửi.' } }));
    } finally {
      setBan((p) => ({ ...p, [item.id]: '' }));
    }
  }

  async function tuChoi(item: CauHoiBinGV) {
    setBan((p) => ({ ...p, [item.id]: 'bo' }));
    try {
      const res = await fetch('/api/gv/hoi-bin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ hanhDong: 'tu-choi', id: item.id, traLoi: nhap[item.id] ?? '' })
      });
      if (res.ok) {
        setDs((cu) => cu.map((x) => (x.id === item.id ? { ...x, trang_thai: 'tu-choi' } : x)));
      }
    } finally {
      setBan((p) => ({ ...p, [item.id]: '' }));
    }
  }

  const demCho = ds.filter((x) => x.trang_thai === 'cho').length;
  const hien = ds.filter((x) => (loc === 'tat-ca' ? true : x.trang_thai === loc));

  return (
    <div style={{ display: 'grid', gap: 16 }}>
      <div className="the" style={{ display: 'flex', flexWrap: 'wrap', gap: 10, alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
          <span className="pill">{phamViNhan}</span>
          <span className="pill">Chờ trả lời: <b>{demCho}</b></span>
          <span className="pill">Ngân hàng đã duyệt: <b>{nganHang.length}</b></span>
          <span className="pill">{aiBat ? (coKhoa ? 'AI sẵn sàng soạn nháp' : 'AI bật · chờ GEMINI_API_KEY') : 'AI đang tắt'}</span>
        </div>
        <div style={{ display: 'flex', gap: 6 }}>
          {([
            ['cho', `Chờ trả lời (${demCho})`],
            ['da-tra-loi', 'Đã trả lời'],
            ['tat-ca', 'Tất cả']
          ] as const).map(([k, ten]) => (
            <button
              key={k}
              type="button"
              className={loc === k ? 'nho' : 'nho phu'}
              onClick={() => setLoc(k)}
            >
              {ten}
            </button>
          ))}
        </div>
      </div>

      {!hien.length && (
        <div className="the">
          <p className="nho">Không có câu hỏi nào ở mục lọc hiện tại.</p>
        </div>
      )}

      {hien.map((item) => (
        <article key={item.id} className="the" style={{ display: 'grid', gap: 10 }}>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <b>{item.tenHS}</b>{' '}
              <span className="pill">Lớp {item.tenLop}</span>{' '}
              {item.ku_id && <span className="pill">{item.ku_id}</span>}{' '}
              <span className="pill">
                {item.trang_thai === 'cho'
                  ? '⏳ Chờ thầy cô'
                  : item.trang_thai === 'da-tra-loi'
                    ? item.nguon === 'ai-duyet'
                      ? '🤖 AI hỗ trợ · Đã duyệt'
                      : '✓ Thầy cô đã trả lời'
                    : 'Đã nhắc hỏi lại'}
              </span>
            </div>
            {aiBat && item.trang_thai !== 'tu-choi' && (
              <button
                type="button"
                className="nho phu"
                disabled={ban[item.id] === 'soan'}
                onClick={() => soanAi(item.id)}
              >
                {ban[item.id] === 'soan' ? 'Đang soạn nháp...' : '✨ AI soạn nháp'}
              </button>
            )}
          </div>

          <blockquote style={{ margin: 0, padding: '10px 12px', background: '#f8faff', borderLeft: '3px solid var(--navy)', borderRadius: 8 }}>
            <MathText>{item.cau_hoi}</MathText>
          </blockquote>

          <textarea
            rows={3}
            value={nhap[item.id] ?? ''}
            onChange={(e) => setNhap((p) => ({ ...p, [item.id]: e.target.value }))}
            placeholder="Nhập câu trả lời gợi mở cho học sinh (dùng $...$ cho công thức)..."
            style={{ width: '100%', padding: '8px 10px', borderRadius: 8, border: '1px solid var(--line)', font: 'inherit' }}
          />

          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, alignItems: 'center' }}>
            <label style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 13.5 }}>
              <input
                type="checkbox"
                checked={luuBank[item.id] ?? true}
                onChange={(e) => setLuuBank((p) => ({ ...p, [item.id]: e.target.checked }))}
              />
              Lưu vào ngân hàng để lần sau trả lời tự động
            </label>
            {(luuBank[item.id] ?? true) && (
              <input
                type="text"
                value={tuKhoa[item.id] ?? ''}
                onChange={(e) => setTuKhoa((p) => ({ ...p, [item.id]: e.target.value }))}
                placeholder="Từ khoá tuỳ chọn (cách nhau dấu phẩy)"
                style={{ flex: '1 1 220px', padding: '6px 10px', borderRadius: 8, border: '1px solid var(--line)', font: 'inherit', fontSize: 13.5 }}
              />
            )}
          </div>

          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ fontSize: 13.5 }}>
              {bao[item.id]?.err && <span style={{ color: 'var(--st-nguy)', fontWeight: 600 }}>{bao[item.id]?.err}</span>}
              {bao[item.id]?.ok && <span style={{ color: 'var(--navy)', fontWeight: 600 }}>{bao[item.id]?.ok}</span>}
              {bao[item.id]?.canhBaoLo && (
                <div className="bang-vang" style={{ marginTop: 6, marginBottom: 0 }}>
                  ⚠️ {bao[item.id]?.canhBaoLo}{' '}
                  <button
                    type="button"
                    className="nho"
                    style={{ marginLeft: 8 }}
                    onClick={() => guiTraLoi(item, true)}
                  >
                    Vẫn duyệt &amp; lưu theo quyết định của thầy cô
                  </button>
                </div>
              )}
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
              {item.trang_thai === 'cho' && (
                <button
                  type="button"
                  className="nho phu"
                  disabled={Boolean(ban[item.id])}
                  onClick={() => tuChoi(item)}
                >
                  Nhắc hỏi rõ hơn
                </button>
              )}
              <button
                type="button"
                disabled={Boolean(ban[item.id]) || !(nhap[item.id] ?? '').trim()}
                onClick={() => guiTraLoi(item)}
              >
                {ban[item.id] === 'gui' ? 'Đang gửi...' : 'Duyệt & gửi học sinh'}
              </button>
            </div>
          </div>
        </article>
      ))}

      {nganHang.length > 0 && (
        <details className="the">
          <summary style={{ cursor: 'pointer', fontWeight: 700 }}>
            Ngân hàng Hỏi–Đáp đã duyệt ({nganHang.length} câu — học sinh tra cứu tức thì không dùng AI)
          </summary>
          <ul style={{ marginTop: 10, paddingLeft: 18, display: 'grid', gap: 8 }}>
            {nganHang.map((m) => (
              <li key={m.id}>
                <div>
                  <b>{m.cau_hoi}</b>{' '}
                  {m.ku_id && <span className="pill">{m.ku_id}</span>}{' '}
                  <span className="pill">{m.nguon === 'ai-duyet' ? '🤖 AI+GV' : '✍️ GV'}</span>{' '}
                  <span className="pill">Đã trả lời tự động: {m.so_lan_dung} lần</span>
                </div>
                <div className="nho" style={{ marginTop: 4 }}><MathText>{m.tra_loi}</MathText></div>
              </li>
            ))}
          </ul>
        </details>
      )}
    </div>
  );
}
