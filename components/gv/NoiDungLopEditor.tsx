'use client';

/**
 * FILE NÀY LÀM GÌ: Component React phía trình duyệt phục vụ bảng điều khiển, biểu đồ và biểu mẫu thao tác cho giáo viên.
 * AI DÙNG: giáo viên
 * LẤY DỮ LIỆU TỪ: không truy vấn bảng trực tiếp
 * GỌI TỚI: không gọi mô-đun nội bộ khác
 */
import { useMemo, useState } from 'react';

export type MucLop = {
  ku_id: string;
  ku_name: string;
  lesson_id: string | null;
  dao_nguoc: boolean;
  an: boolean;
  an_game: boolean;
  an_video: boolean;
};

/**
 * Bảng bật/tắt nội dung theo lớp ngay trong trang Lịch giao bài:
 * Đảo ngược · Ẩn mục · Ẩn trò chơi · Ẩn video (ghi vào class_content).
 */
export default function NoiDungLopEditor({
  lop,
  tenLop,
  mucBanDau,
  chuaCoBang
}: {
  lop: string;
  tenLop: string;
  mucBanDau: MucLop[];
  chuaCoBang?: boolean;
}) {
  const [ds, setDs] = useState<MucLop[]>(mucBanDau);
  const [dang, setDang] = useState(false);
  const [bao, setBao] = useState('');
  const doi = useMemo(() => JSON.stringify(ds), [ds]);
  const [daLuu, setDaLuu] = useState(doi);

  const toggle = (kuId: string, cot: 'dao_nguoc' | 'an' | 'an_game' | 'an_video', val: boolean) => {
    setDs((prev) => prev.map((m) => (m.ku_id === kuId ? { ...m, [cot]: val } : m)));
  };

  const luu = async () => {
    setDang(true);
    setBao('');
    try {
      const r = await fetch('/api/gv/noi-dung-lop', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          lop,
          muc: ds.map(({ ku_id, dao_nguoc, an, an_game, an_video }) => ({
            ku_id,
            dao_nguoc,
            an,
            an_game,
            an_video
          }))
        })
      });
      const d = await r.json();
      if (!r.ok) throw new Error(d.error);
      setDaLuu(doi);
      setBao(`✓ Đã lưu bật/tắt nội dung cho ${d.luu} mục của lớp ${tenLop}.`);
    } catch (e: any) {
      setBao(e?.message ?? 'Chưa lưu được cấu hình nội dung.');
    } finally {
      setDang(false);
    }
  };

  return (
    <div className="card">
      <h2>Bật / tắt nội dung theo lớp ({tenLop})</h2>
      <p className="hint" style={{ marginTop: 0 }}>
        Mục đánh dấu <b>Đảo ngược</b> hiện nhãn <em>&ldquo;🔄 Tiết đảo ngược – chuẩn bị trước giờ học&rdquo;</em>;
        mục khác hiện <em>&ldquo;Tự học thêm (không bắt buộc)&rdquo;</em>. Mục <b>Ẩn mục</b> sẽ không hiện với học sinh lớp này.
      </p>

      {chuaCoBang && (
        <p role="alert" className="banner">
          Chưa đọc được bảng <code>class_content</code>. Hãy chạy file <code>supabase/51-phan-cap-truong-gv-lop.sql</code> trên Supabase.
        </p>
      )}

      <div className="scroll">
        {/* Khối giao diện: Bảng số liệu tổng hợp */}
        <table className="nd-lop-table">
          <thead>
            <tr>
              <th>Mục kiến thức</th>
              <th className="nd-lop-check">🔄 Đảo ngược</th>
              <th className="nd-lop-check">🙈 Ẩn mục</th>
              <th className="nd-lop-check">🎮 Ẩn trò chơi</th>
              <th className="nd-lop-check">🎬 Ẩn video</th>
            </tr>
          </thead>
          <tbody>
            {ds.map((m) => (
              <tr key={m.ku_id}>
                <td>
                  <strong>{m.ku_name}</strong>
                  {m.lesson_id && (
                    <>
                      <br />
                      <small className="hint">{m.lesson_id} · <code>{m.ku_id}</code></small>
                    </>
                  )}
                </td>
                <td className="nd-lop-check">
                  <input
                    type="checkbox"
                    aria-label={`Đảo ngược ${m.ku_name}`}
                    checked={m.dao_nguoc}
                    onChange={(e) => toggle(m.ku_id, 'dao_nguoc', e.target.checked)}
                  />
                </td>
                <td className="nd-lop-check">
                  <input
                    type="checkbox"
                    aria-label={`Ẩn mục ${m.ku_name}`}
                    checked={m.an}
                    onChange={(e) => toggle(m.ku_id, 'an', e.target.checked)}
                  />
                </td>
                <td className="nd-lop-check">
                  <input
                    type="checkbox"
                    aria-label={`Ẩn trò chơi ${m.ku_name}`}
                    checked={m.an_game}
                    onChange={(e) => toggle(m.ku_id, 'an_game', e.target.checked)}
                  />
                </td>
                <td className="nd-lop-check">
                  <input
                    type="checkbox"
                    aria-label={`Ẩn video ${m.ku_name}`}
                    checked={m.an_video}
                    onChange={(e) => toggle(m.ku_id, 'an_video', e.target.checked)}
                  />
                </td>
              </tr>
            ))}
            {!ds.length && (
              <tr><td colSpan={5} className="hint">Chương này chưa có mục nào.</td></tr>
            )}
          </tbody>
        </table>
      </div>

      <p style={{ display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap', marginTop: 12 }}>
        <button
          type="button"
          className="primary"
          disabled={dang || doi === daLuu || !ds.length}
          onClick={luu}
        >
          {dang ? 'Đang lưu…' : 'Lưu bật/tắt nội dung'}
        </button>
        {doi !== daLuu && !dang && <span className="hint">Có thay đổi chưa lưu.</span>}
        {bao && <span role="status">{bao}</span>}
      </p>
    </div>
  );
}
