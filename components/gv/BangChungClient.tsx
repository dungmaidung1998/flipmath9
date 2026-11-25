'use client';

/**
 * FILE NÀY LÀM GÌ: Component React phía trình duyệt phục vụ bảng điều khiển, biểu đồ và biểu mẫu thao tác cho giáo viên.
 * AI DÙNG: giáo viên
 * LẤY DỮ LIỆU TỪ: không truy vấn bảng trực tiếp
 * GỌI TỚI: @/lib/gv/lopCuaToi, @/lib/chapters, @/components/charts/BoxPlotChart, @/lib/khkt/thongKeThucNghiem
 */
import { useEffect, useState } from 'react';
import { nhanTruongLop, type LopCuaToi } from '@/lib/gv/lopCuaToi';
import { CHAPTERS } from '@/lib/chapters';
import BoxPlotChart, { type MucBoxPlot } from '@/components/charts/BoxPlotChart';
import type { KetQuaGhepCap, KetQuaSoSanhDocLap } from '@/lib/khkt/thongKeThucNghiem';

type DuLieuBangChung = {
  siSoTN: number;
  siSoDC: number;
  dauVao: KetQuaSoSanhDocLap;
  sauTNvsDC: KetQuaSoSanhDocLap;
  mucTang: KetQuaSoSanhDocLap;
  truocSauTN: KetQuaGhepCap;
  truocSauDC: KetQuaGhepCap;
  boxPlot: MucBoxPlot[];
  doanVan: string;
  coMauNho: boolean;
};

const fmt = (v: number | null | undefined, digits = 2) =>
  v == null || !Number.isFinite(v) ? '—' : v.toFixed(digits);

/**
 * Component React `BangChungClient`: nhận props (thuộc tính truyền vào từ component cha) và dựng giao diện tương ứng.
 */
export default function BangChungClient({ lops }: { lops: LopCuaToi[] }) {
  const [selectedLops, setSelectedLops] = useState<string[]>(lops.map((l) => l.class_id));
  const [chuong, setChuong] = useState('');
  const [chiDongY, setChiDongY] = useState(true);
  const [data, setData] = useState<DuLieuBangChung | null>(null);
  const [loading, setLoading] = useState(true);
  const [loi, setLoi] = useState('');
  const [daChep, setDaChep] = useState(false);

  async function tai() {
    if (!selectedLops.length) {
      setLoi('Vui lòng chọn ít nhất một lớp.');
      return;
    }
    setLoading(true);
    setLoi('');
    try {
      const qs = new URLSearchParams({
        lops: selectedLops.join(','),
        chuong,
        dongY: chiDongY ? '1' : '0',
      });
      const res = await fetch(`/api/gv/bang-chung?${qs.toString()}`, { cache: 'no-store' });
      const json = await res.json();
      if (!res.ok) throw new Error(json?.error || 'Không tải được dữ liệu bằng chứng.');
      setData(json);
    } catch (e: any) {
      setLoi(e?.message || 'Lỗi tải thống kê.');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void tai();
  }, [selectedLops.join(','), chuong, chiDongY]); // eslint-disable-line react-hooks/exhaustive-deps

  const toggleLop = (id: string) =>
    setSelectedLops((cu) => (cu.includes(id) ? cu.filter((x) => x !== id) : [...cu, id]));

  const csvUrl = `/api/gv/bang-chung?lops=${encodeURIComponent(selectedLops.join(','))}&chuong=${encodeURIComponent(chuong)}&dongY=${chiDongY ? '1' : '0'}&format=csv`;

  async function saoChepDoanVan() {
    if (!data?.doanVan) return;
    try {
      await navigator.clipboard.writeText(data.doanVan);
      setDaChep(true);
      window.setTimeout(() => setDaChep(false), 2500);
    } catch {
      /* trình duyệt không cho clipboard */
    }
  }

  return (
    <div className="mc">
      <div className="mc-dau">
        <div>
          <h1>Bảng bằng chứng thực nghiệm tự động</h1>
          <p className="mc-cauhoi">
            So sánh nhóm Thực nghiệm (<code>TN</code>) vs Đối chứng (<code>ĐC</code>) và trước–sau (Đầu vào vs Kiểm tra chương), tự tính t-test và Cohen&apos;s d cho báo cáo KHKT.
          </p>
        </div>
        <a className="nut" href={csvUrl}>
          📊 Xuất Excel (CSV)
        </a>
      </div>

      {/* Khối giao diện: Khối nội dung chính */}
      <section className="mc-khoi">
        <h2>Chọn các lớp &amp; phạm vi chương</h2>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 12 }}>
          {lops.map((l) => {
            const checked = selectedLops.includes(l.class_id);
            return (
              <label
                key={l.class_id}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 6,
                  padding: '7px 12px',
                  borderRadius: 999,
                  border: '1px solid var(--mc-vach)',
                  background: checked ? '#eff6ff' : '#fff',
                  cursor: 'pointer',
                  fontSize: 14,
                  fontWeight: 600,
                }}
              >
                <input type="checkbox" checked={checked} onChange={() => toggleLop(l.class_id)} />
                <span>{nhanTruongLop(l)}</span>
                <span className="st" style={{ background: l.arm === 'DC' ? '#f1f5f9' : '#dbeafe', color: l.arm === 'DC' ? '#475569' : '#1d4ed8' }}>
                  {l.arm ?? 'TN'}
                </span>
              </label>
            );
          })}
        </div>

        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 14, alignItems: 'center' }}>
          <label style={{ display: 'flex', gap: 6, alignItems: 'center', fontSize: 14 }}>
            <b>Chương:</b>
            <select value={chuong} onChange={(e) => setChuong(e.target.value)} style={{ padding: '7px 10px', borderRadius: 8, border: '1px solid var(--mc-vach)' }}>
              <option value="">Tất cả chương đã làm</option>
              {CHAPTERS.filter((c) => c.id !== 'TN').map((c) => (
                <option key={c.id} value={c.id}>{c.label}</option>
              ))}
            </select>
          </label>
          <label style={{ display: 'flex', gap: 6, alignItems: 'center', fontSize: 14 }}>
            <input type="checkbox" checked={chiDongY} onChange={(e) => setChiDongY(e.target.checked)} />
            Chỉ tính học sinh đã có đồng thuận NCKH (<code>dong-y</code>)
          </label>
        </div>
      </section>

      {loi && <p role="alert" style={{ color: 'var(--st-nguy)', fontWeight: 700 }}>{loi}</p>}
      {loading && <div className="mc-khoi"><p>Đang tính toán thống kê thực nghiệm…</p></div>}

      {data && !loading && (
        <>
          {data.coMauNho && (
            <p className="bang-vang">
              ⚠️ Cỡ mẫu hiện tại nhỏ (n &lt; 30 ở ít nhất một nhóm so sánh). Mọi kết luận về độ lớn hiệu quả và ý nghĩa thống kê cần diễn giải thận trọng trong báo cáo KHKT.
            </p>
          )}

          {/* Khối giao diện: Khối nội dung chính */}
          <section className="mc-khoi">
            <h2>1. Bảng so sánh nhóm Thực nghiệm (TN) vs Đối chứng (ĐC)</h2>
            <div className="scroll">
              {/* Khối giao diện: Bảng số liệu tổng hợp */}
              <table>
                <thead>
                  <tr>
                    <th>Phép so sánh</th>
                    <th className="n">n (TN)</th>
                    <th className="n">TB ± ĐLC (TN)</th>
                    <th className="n">n (ĐC)</th>
                    <th className="n">TB ± ĐLC (ĐC)</th>
                    <th className="n">Chênh lệch</th>
                    <th className="n">Cohen&apos;s d</th>
                    <th className="n">t (df)</th>
                    <th className="n">p (2 đuôi)</th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    { ten: 'Đầu vào (trước tác động)', d: data.dauVao },
                    { ten: 'Kiểm tra chương (sau tác động)', d: data.sauTNvsDC },
                    { ten: 'Mức tăng cá nhân (Sau − Trước)', d: data.mucTang },
                  ].map((row) => (
                    <tr key={row.ten}>
                      <th scope="row">{row.ten}</th>
                      <td className="n">{row.d.n1}</td>
                      <td className="n">{fmt(row.d.mean1)} ± {fmt(row.d.sd1)}</td>
                      <td className="n">{row.d.n2}</td>
                      <td className="n">{fmt(row.d.mean2)} ± {fmt(row.d.sd2)}</td>
                      <td className="n"><b>{fmt(row.d.chenhLech)}</b></td>
                      <td className="n">
                        <b>{fmt(row.d.cohenD)}</b>
                        <br />
                        <small style={{ color: 'var(--muted)' }}>{row.d.mucAnhHuong}</small>
                      </td>
                      <td className="n">{row.d.t == null ? '—' : `${fmt(row.d.t)} (${row.d.df})`}</td>
                      <td className="n" style={{ fontWeight: 700, color: row.d.coYNgia05 ? 'var(--st-tot)' : undefined }}>
                        {fmt(row.d.p, 4)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          {/* Khối giao diện: Khối nội dung chính */}
          <section className="mc-khoi">
            <h2>2. So sánh Trước – Sau (t-test ghép cặp trong từng nhóm)</h2>
            <div className="scroll">
              {/* Khối giao diện: Bảng số liệu tổng hợp */}
              <table>
                <thead>
                  <tr>
                    <th>Nhóm</th>
                    <th className="n">Số HS ghép cặp</th>
                    <th className="n">Đầu vào (TB ± ĐLC)</th>
                    <th className="n">Kiểm tra chương (TB ± ĐLC)</th>
                    <th className="n">Mức tăng TB</th>
                    <th className="n">Cohen&apos;s d_z</th>
                    <th className="n">t (df)</th>
                    <th className="n">p (2 đuôi)</th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    { ten: 'Thực nghiệm (TN)', g: data.truocSauTN },
                    { ten: 'Đối chứng (ĐC)', g: data.truocSauDC },
                  ].map((r) => (
                    <tr key={r.ten}>
                      <th scope="row">{r.ten}</th>
                      <td className="n">{r.g.n}</td>
                      <td className="n">{fmt(r.g.meanTruoc)} ± {fmt(r.g.sdTruoc)}</td>
                      <td className="n">{fmt(r.g.meanSau)} ± {fmt(r.g.sdSau)}</td>
                      <td className="n"><b>{fmt(r.g.chenhLechTB)}</b></td>
                      <td className="n">{fmt(r.g.cohenDz)}</td>
                      <td className="n">{r.g.t == null ? '—' : `${fmt(r.g.t)} (${r.g.df})`}</td>
                      <td className="n">{fmt(r.g.p, 4)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          {/* Khối giao diện: Khối nội dung chính */}
          <section className="mc-khoi">
            <h2>3. Biểu đồ cột &amp; Biểu đồ hộp (Box Plot)</h2>
            <BoxPlotChart items={data.boxPlot} />
          </section>

          {/* Khối giao diện: Khối nội dung chính */}
          <section className="mc-khoi">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 10, marginBottom: 8 }}>
              <h2 style={{ margin: 0 }}>4. Đoạn văn mô tả kết quả tự sinh (chép vào báo cáo KHKT)</h2>
              <button type="button" className="nho chinh" onClick={saoChepDoanVan}>
                {daChep ? '✓ Đã sao chép' : '📋 Sao chép đoạn văn'}
              </button>
            </div>
            <p style={{ margin: 0, padding: 14, borderRadius: 10, background: '#f8fafc', border: '1px solid var(--mc-vach)', lineHeight: 1.65, fontSize: 15 }}>
              {data.doanVan}
            </p>
          </section>
        </>
      )}
    </div>
  );
}
