'use client';

/**
 * FILE NÀY LÀM GÌ: Component React phía trình duyệt phục vụ bảng điều khiển, biểu đồ và biểu mẫu thao tác cho giáo viên.
 * AI DÙNG: giáo viên
 * LẤY DỮ LIỆU TỪ: không truy vấn bảng trực tiếp
 * GỌI TỚI: @/lib/khkt/tuLuc
 */
import { useState } from 'react';
import {
  type BaoCaoTuLucHS,
  type KetQuaTuLucNhom,
  type NguonGoiY,
  type TuanTuLuc,
  xuatCsvTuLuc,
} from '@/lib/khkt/tuLuc';

const fmt = (v: number | null, d = 1) =>
  v == null || !Number.isFinite(v) ? '—' : v.toFixed(d).replace('.', ',');

/**
 * Component React `TuLucGV`: nhận props (thuộc tính truyền vào từ component cha) và dựng giao diện tương ứng.
 */
export default function TuLucGV({
  lop,
  nguonLoc,
  tongHop,
  theoTuan,
  doDocXuHuong,
  xuHuong,
  coAi,
  khongAi,
  theoHS,
  baoCaoVan,
}: {
  lop: string;
  nguonLoc: NguonGoiY | 'tat-ca';
  tongHop: KetQuaTuLucNhom;
  theoTuan: TuanTuLuc[];
  doDocXuHuong: number | null;
  xuHuong: '↑' | '↓' | '→' | '—';
  coAi: KetQuaTuLucNhom;
  khongAi: KetQuaTuLucNhom;
  theoHS: Array<BaoCaoTuLucHS & { tenHS: string }>;
  baoCaoVan: string;
}) {
  const [daSaoChep, setDaSaoChep] = useState(false);

  const taiCsv = () => {
    const csv = xuatCsvTuLuc(theoHS);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `chi-so-tu-luc-${lop}-${nguonLoc}.csv`;
    a.click();
  };

  const tuanCoSo = theoTuan.filter((t) => t.tl != null);

  return (
    <div style={{ display: 'grid', gap: 16 }}>
      {/* Khối giao diện: Khối nội dung chính */}
      <section className="mc-khoi">
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
            {[
              ['tat-ca', 'Tất cả nguồn'],
              ['goi-y-loi', 'Gợi ý 3 tầng'],
              ['hoi-bin', 'Hỏi Bin'],
              ['cham-vo', 'Chấm vở AI'],
              ['do-chieu-cao', 'Đo chiều cao'],
              ['tro-choi', 'Trò chơi nền'],
            ].map(([k, ten]) => (
              <a
                key={k}
                className={nguonLoc === k ? 'nut' : 'nho'}
                style={
                  nguonLoc === k
                    ? { background: 'var(--navy)', color: '#fff', borderColor: 'var(--navy)' }
                    : undefined
                }
                href={`/gv/tu-luc?lop=${encodeURIComponent(lop)}&nguon=${k}`}
              >
                {ten}
              </a>
            ))}
          </div>
          <button type="button" className="nho" onClick={taiCsv}>
            ⬇ Xuất CSV UTF-8 BOM
          </button>
        </div>
      </section>

      {/* Khối giao diện: Khối nội dung chính */}
      <section className="mc-khoi">
        <h2>Chỉ số tự lực tổng quan của lớp</h2>
        <div className="gv-lop-luoi">
          <div className="gv-lop-the">
            <div className="gv-lop-the__ten">Toàn nhóm đang lọc</div>
            <div className="gv-lop-the__so">
              <span>TL tự giải (≤48h): <b>{tongHop.tl == null ? '—' : `${fmt(tongHop.tl)}%`}</b></span>
              <span>Lượt thử lại / nhận: <b>{tongHop.daThuLai}/{tongHop.tongNhan}</b></span>
              <span>Mức gợi ý TB: <b>{fmt(tongHop.mucGoiYTB, 2)}</b></span>
              <span>Xem lời giải trước: <b>{tongHop.tiLeXemLoiGiai == null ? '—' : `${fmt(tongHop.tiLeXemLoiGiai)}%`}</b></span>
            </div>
          </div>
          <div className="gv-lop-the">
            <div className="gv-lop-the__ten">Xu hướng theo tuần</div>
            <div className="gv-lop-the__so">
              <span>Chiều hướng: <b style={{ fontSize: 18 }}>{xuHuong}</b></span>
              <span>Độ dốc tuyến tính: <b>{doDocXuHuong == null ? '—' : `${fmt(doDocXuHuong, 2)} %/tuần`}</b></span>
              <span>AI hỗ trợ (TL): <b>{coAi.tl == null ? '—' : `${fmt(coAi.tl)}%`}</b> ({coAi.daThuLai})</span>
              <span>Không AI (TL): <b>{khongAi.tl == null ? '—' : `${fmt(khongAi.tl)}%`}</b> ({khongAi.daThuLai})</span>
            </div>
          </div>
        </div>
      </section>

      {/* Khối giao diện: Khối nội dung chính */}
      <section className="mc-khoi">
        <h2>Biểu đồ chỉ số tự lực theo từng tuần</h2>
        <p className="mc-ghi" style={{ marginTop: 0 }}>
          Chỉ tính TL cho tuần có ít nhất 5 lượt nhận gợi ý; tuần ít hơn 5 lượt ghi &ldquo;chưa đủ dữ liệu&rdquo; để tránh nhiễu.
        </p>
        {theoTuan.length === 0 ? (
          <p className="mc-trong">Chưa có dữ liệu gợi ý theo tuần.</p>
        ) : (
          <>
            {tuanCoSo.length >= 2 && (
              <svg viewBox="0 0 460 170" style={{ width: '100%', maxWidth: 540, height: 'auto' }} role="img" aria-label="Biểu đồ đường TL theo tuần">
                <line x1={40} x2={440} y1={135} y2={135} stroke="#cbd5e1" strokeWidth={1.5} />
                <line x1={40} x2={40} y1={15} y2={135} stroke="#cbd5e1" strokeWidth={1.5} />
                {[0, 50, 100].map((v) => {
                  const y = 135 - (v / 100) * 110;
                  return (
                    <g key={v}>
                      <line x1={40} x2={440} y1={y} y2={y} stroke="#eef2f7" strokeDasharray="3 3" />
                      <text x={34} y={y + 4} textAnchor="end" fontSize={10} fill="#64748b">{v}%</text>
                    </g>
                  );
                })}
                <polyline
                  fill="none"
                  stroke="#255f3d"
                  strokeWidth={2.5}
                  points={tuanCoSo
                    .map((t, i) => {
                      // Tính toán, làm tròn hoặc giới hạn giá trị theo công thức
                      const x = 60 + (i / Math.max(1, tuanCoSo.length - 1)) * 360;
                      const y = 135 - ((t.tl ?? 0) / 100) * 110;
                      return `${x},${y}`;
                    })
                    .join(' ')}
                />
                {tuanCoSo.map((t, i) => {
                  // Tính toán, làm tròn hoặc giới hạn giá trị theo công thức
                  const x = 60 + (i / Math.max(1, tuanCoSo.length - 1)) * 360;
                  const y = 135 - ((t.tl ?? 0) / 100) * 110;
                  return (
                    <g key={t.tuan}>
                      <circle cx={x} cy={y} r={4.5} fill="#255f3d" />
                      <text x={x} y={y - 8} textAnchor="middle" fontSize={10} fill="#14532d" fontWeight={700}>
                        {fmt(t.tl, 0)}%
                      </text>
                      <text x={x} y={152} textAnchor="middle" fontSize={9.5} fill="#475569">
                        {t.tuan.slice(5)}
                      </text>
                    </g>
                  );
                })}
              </svg>
            )}
            <div style={{ overflowX: 'auto', marginTop: 10 }}>
              {/* Khối giao diện: Bảng số liệu tổng hợp */}
              <table>
                <thead>
                  <tr>
                    <th>Tuần (từ ngày)</th>
                    <th>Lượt nhận</th>
                    <th>Đã thử lại ≤48h</th>
                    <th>Tự giải được</th>
                    <th>TL (%)</th>
                  </tr>
                </thead>
                <tbody>
                  {theoTuan.map((t) => (
                    <tr key={t.tuan}>
                      <td>{t.tuan}</td>
                      <td>{t.tongNhan}</td>
                      <td>{t.daThuLai}</td>
                      <td>{t.tuGiaiDuoc}</td>
                      <td>{t.tl == null ? 'chưa đủ dữ liệu (<5 lượt)' : `${fmt(t.tl)}%`}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
      </section>

      {/* Khối giao diện: Khối nội dung chính */}
      <section className="mc-khoi">
        <h2>Bảng theo từng học sinh</h2>
        {theoHS.length === 0 ? (
          <p className="mc-trong">Lớp chưa có dữ liệu.</p>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            {/* Khối giao diện: Bảng số liệu tổng hợp */}
            <table>
              <thead>
                <tr>
                  <th>Học sinh</th>
                  <th>Nhận gợi ý</th>
                  <th>Thử lại</th>
                  <th>Tự giải</th>
                  <th>TL (%)</th>
                  <th>Mức gợi ý TB</th>
                  <th>Xu hướng</th>
                </tr>
              </thead>
              <tbody>
                {theoHS.map((h) => (
                  <tr key={h.student_id}>
                    <td>{h.tenHS}</td>
                    <td>{h.tongNhan}</td>
                    <td>{h.daThuLai}</td>
                    <td>{h.tuGiaiDuoc}</td>
                    <td><b>{h.tl == null ? 'chưa đủ dữ liệu' : `${fmt(h.tl)}%`}</b></td>
                    <td>{fmt(h.mucGoiYTB, 2)}</td>
                    <td><b>{h.xuHuong}</b></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {/* Khối giao diện: Khối nội dung chính */}
      <section className="mc-khoi">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 8 }}>
          <h2 style={{ margin: 0 }}>Đoạn văn tự sinh cho báo cáo KHKT</h2>
          <button
            type="button"
            className="nho phu"
            onClick={() => {
              void navigator.clipboard?.writeText(baoCaoVan).then(() => setDaSaoChep(true)).catch(() => {});
            }}
          >
            {daSaoChep ? '✓ Đã chép' : 'Chép đoạn văn'}
          </button>
        </div>
        <p style={{ lineHeight: 1.65, background: '#f8fafc', padding: 12, borderRadius: 10, border: '1px solid var(--mc-vach)', marginTop: 10 }}>
          {baoCaoVan}
        </p>
      </section>
    </div>
  );
}
