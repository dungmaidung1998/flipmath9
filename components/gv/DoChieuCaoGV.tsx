'use client';

/**
 * FILE NÀY LÀM GÌ: Component React phía trình duyệt phục vụ bảng điều khiển, biểu đồ và biểu mẫu thao tác cho giáo viên.
 * AI DÙNG: giáo viên
 * LẤY DỮ LIỆU TỪ: không truy vấn bảng trực tiếp
 * GỌI TỚI: @/components/AnhChuDe, @/lib/do-chieu-cao/tinh
 */
import { useState } from 'react';
import AnhChuDe from '@/components/AnhChuDe';
import {
  dinhDangSoVN,
  saiSoTuongDoi,
  type BanGhiDoChieuCao,
} from '@/lib/do-chieu-cao/tinh';

export type VatMocGV = {
  id: string;
  ten: string;
  h_that: number | null;
  cach_do_that: string | null;
};

export type LuotDoGV = BanGhiDoChieuCao & {
  student_id: string;
  tenHS: string;
  vat_id: string | null;
};

/**
 * Component React `DoChieuCaoGV`: nhận props (thuộc tính truyền vào từ component cha) và dựng giao diện tương ứng.
 */
export default function DoChieuCaoGV({
  lop,
  vatMocsBanDau,
  luotDo,
  baoCaoVan,
  thongKe,
}: {
  lop: string;
  vatMocsBanDau: VatMocGV[];
  luotDo: LuotDoGV[];
  baoCaoVan: string;
  thongKe: {
    saiSoTB: number | null;
    saiSoTrungVi: number | null;
    saiSoSD: number | null;
    tiLeHsDung: number | null;
    tbCamBien: number | null;
    tbThanhTruot: number | null;
    tbMotDiem: number | null;
    tbHaiDiem: number | null;
  };
}) {
  const [vatMocs, setVatMocs] = useState<VatMocGV[]>(vatMocsBanDau);
  const [locVat, setLocVat] = useState<string>('tat-ca');
  const [tenVat, setTenVat] = useState('');
  const [hThat, setHThat] = useState('');
  const [cachDoThat, setCachDoThat] = useState('');
  const [bao, setBao] = useState('');

  async function themVatMoc(e: React.FormEvent) {
    e.preventDefault();
    setBao('');
    const res = await fetch('/api/gv/do-chieu-cao', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        lop,
        ten: tenVat,
        hThat: hThat ? hThat.replace(',', '.') : null,
        cachDoThat,
      }),
    });
    const json = await res.json().catch(() => ({}));
    if (!res.ok) {
      setBao(json?.error || 'Không thêm được vật mốc.');
      return;
    }
    setVatMocs((p) => [json.vatMoc, ...p]);
    setTenVat('');
    setHThat('');
    setCachDoThat('');
    setBao('Đã lưu vật mốc.');
  }

  async function chonCauRong() {
    setTenVat('Cầu Rồng (đo từ bờ sông Hàn, cách hai điểm)');
    setCachDoThat('Đo 2 điểm trên bờ Tây sông Hàn (chiều cao thật để thầy cô nhập từ nguồn chính thức)');
    setHThat('');
  }

  const luotLoc = luotDo.filter((r) => (locVat === 'tat-ca' ? true : r.vat_id === locVat));
  const vatDangLoc = vatMocs.find((v) => v.id === locVat);
  const coHThat = luotLoc.filter((r) => {
    const v = vatMocs.find((x) => x.id === r.vat_id);
    return (v?.h_that ?? r.h_that) && (v?.h_that ?? r.h_that)! > 0;
  });

  function xuatCSV() {
    const header = ['Học sinh', 'Vật đo', 'Cách đo', 'd (m)', 'a (m)', 'alpha1', 'alpha2', 'm (m)', 'h tính (m)', 'h HS nhập (m)', 'HS tự tính đúng', 'Nguồn góc', 'Thời điểm'];
    const lines = [
      header.join(','),
      ...luotLoc.map((r) =>
        [
          `"${r.tenHS.replace(/"/g, '""')}"`,
          `"${r.ten_vat.replace(/"/g, '""')}"`,
          r.cach_do,
          r.d ?? '',
          r.a ?? '',
          r.alpha1,
          r.alpha2 ?? '',
          r.m,
          r.h_tinh,
          r.h_hs_nhap,
          r.hs_dung ? 'Dung' : 'Sai',
          r.nguon_goc,
          r.tao_luc ?? '',
        ].join(',')
      ),
    ];
    const blob = new Blob(['\ufeff' + lines.join('\n')], { type: 'text/csv;charset=utf-8;' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `do-chieu-cao-${lop}.csv`;
    a.click();
  }

  return (
    <div style={{ display: 'grid', gap: 16 }}>
      {/* Khối giao diện: Khối nội dung chính */}
      <section className="mc-khoi">
        <h2>Quản lý vật mốc của lớp</h2>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, alignItems: 'center', marginBottom: 10 }}>
          <AnhChuDe
            src="/do-chieu-cao/vat-cau-rong.webp"
            fallback="/chu-de/canh/C4.webp"
            alt="Gợi ý vật mốc Cầu Rồng"
            width={110}
            height={82}
            style={{ borderRadius: 10, objectFit: 'cover' }}
          />
          <div style={{ flex: '1 1 240px' }}>
            <p className="mc-ghi" style={{ margin: '0 0 6px' }}>
              Thầy cô khai báo chiều cao thật của vật mốc (cột cờ đo bằng thước dây, toà nhà…) để web tự tính sai số đo thực tế cho báo cáo KHKT.
            </p>
            <button type="button" className="nho phu" onClick={chonCauRong}>
              + Điền mẫu Cầu Rồng (chiều cao thật để thầy cô tự nhập)
            </button>
          </div>
        </div>

        {/* Khối giao diện: Biểu mẫu nhập liệu */}
        <form onSubmit={themVatMoc} style={{ display: 'flex', flexWrap: 'wrap', gap: 8, alignItems: 'end' }}>
          <label style={{ flex: '1 1 220px', display: 'grid', gap: 4, fontSize: 13 }}>
            Tên vật mốc
            <input value={tenVat} onChange={(e) => setTenVat(e.target.value)} placeholder="VD: Cột cờ sân trường" style={{ padding: 8, borderRadius: 8, border: '1px solid var(--mc-vach)' }} />
          </label>
          <label style={{ width: 140, display: 'grid', gap: 4, fontSize: 13 }}>
            Chiều cao thật (m)
            <input value={hThat} onChange={(e) => setHThat(e.target.value)} placeholder="Để trống nếu chưa rõ" style={{ padding: 8, borderRadius: 8, border: '1px solid var(--mc-vach)' }} />
          </label>
          <label style={{ flex: '1 1 200px', display: 'grid', gap: 4, fontSize: 13 }}>
            Cách đo chiều cao thật
            <input value={cachDoThat} onChange={(e) => setCachDoThat(e.target.value)} placeholder="VD: Thước dây lúc hạ cờ" style={{ padding: 8, borderRadius: 8, border: '1px solid var(--mc-vach)' }} />
          </label>
          <button type="submit" className="nho chinh">Lưu vật mốc</button>
        </form>
        {bao && <p className="mc-ghi" style={{ marginTop: 8 }}>{bao}</p>}

        {vatMocs.length > 0 && (
          <ul style={{ marginTop: 12, paddingLeft: 18 }}>
            {vatMocs.map((v) => (
              <li key={v.id} style={{ marginBottom: 4 }}>
                <b>{v.ten}</b> · chiều cao thật: {v.h_that ? `${dinhDangSoVN(v.h_that)} m` : 'chưa nhập'}{' '}
                {v.cach_do_that && <span className="mc-ghi">({v.cach_do_that})</span>}
              </li>
            ))}
          </ul>
        )}
      </section>

      {/* Khối giao diện: Khối nội dung chính */}
      <section className="mc-khoi">
        <h2>Thống kê sai số &amp; so sánh phương pháp đo ({luotDo.length} lượt)</h2>
        <div className="gv-lop-luoi">
          <div className="gv-lop-the">
            <div className="gv-lop-the__ten">Sai số tương đối so với vật mốc</div>
            <div className="gv-lop-the__so">
              <span>Trung bình: <b>{dinhDangSoVN(thongKe.saiSoTB, 1)}%</b></span>
              <span>Trung vị: <b>{dinhDangSoVN(thongKe.saiSoTrungVi, 1)}%</b></span>
              <span>Độ lệch chuẩn: <b>{dinhDangSoVN(thongKe.saiSoSD, 1)}%</b></span>
              <span>HS tự tính đúng: <b>{dinhDangSoVN(thongKe.tiLeHsDung, 1)}%</b></span>
            </div>
          </div>
          <div className="gv-lop-the">
            <div className="gv-lop-the__ten">So sánh công cụ &amp; cách đo</div>
            <div className="gv-lop-the__so">
              <span>Cảm biến ĐT: <b>{dinhDangSoVN(thongKe.tbCamBien, 1)}%</b></span>
              <span>Thanh trượt/giác kế: <b>{dinhDangSoVN(thongKe.tbThanhTruot, 1)}%</b></span>
              <span>Đo 1 điểm: <b>{dinhDangSoVN(thongKe.tbMotDiem, 1)}%</b></span>
              <span>Đo 2 điểm: <b>{dinhDangSoVN(thongKe.tbHaiDiem, 1)}%</b></span>
            </div>
          </div>
        </div>
      </section>

      {vatDangLoc?.h_that && coHThat.length > 0 && (
        <section className="mc-khoi">
          <h2>Phân bố giá trị h đo được quanh chiều cao thật ({dinhDangSoVN(vatDangLoc.h_that)} m)</h2>
          <svg viewBox="0 0 420 90" style={{ width: '100%', maxWidth: 480, height: 'auto' }} role="img" aria-label="Phân bố h đo quanh h thật">
            <line x1={30} x2={390} y1={52} y2={52} stroke="#94a3b8" strokeWidth={2} />
            {(() => {
              const hs = coHThat.map((r) => r.h_tinh);
              const refH = vatDangLoc.h_that!;
              // Tính toán, làm tròn hoặc giới hạn giá trị theo công thức
              const minV = Math.min(refH * 0.8, ...hs);
              // Tính toán, làm tròn hoặc giới hạn giá trị theo công thức
              const maxV = Math.max(refH * 1.2, ...hs);
              // Tính toán, làm tròn hoặc giới hạn giá trị theo công thức
              const span = Math.max(0.5, maxV - minV);
              const px = (v: number) => 30 + ((v - minV) / span) * 360;
              return (
                <>
                  <line x1={px(refH)} x2={px(refH)} y1={14} y2={70} stroke="#16a34a" strokeWidth={2.5} strokeDasharray="4 3" />
                  <text x={px(refH)} y={12} textAnchor="middle" fontSize={10} fill="#15803d">h thật {dinhDangSoVN(refH)} m</text>
                  {hs.map((v, i) => (
                    <circle key={i} cx={px(v)} cy={52} r={5} fill="#2563eb" fillOpacity={0.75} />
                  ))}
                </>
              );
            })()}
          </svg>
        </section>
      )}

      {/* Khối giao diện: Khối nội dung chính */}
      <section className="mc-khoi">
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
          <h2 style={{ margin: 0 }}>Bảng lượt đo của học sinh</h2>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            <select value={locVat} onChange={(e) => setLocVat(e.target.value)} style={{ padding: '6px 10px', borderRadius: 8, border: '1px solid var(--mc-vach)' }}>
              <option value="tat-ca">Tất cả vật đo</option>
              {vatMocs.map((v) => <option key={v.id} value={v.id}>{v.ten}</option>)}
            </select>
            <button type="button" className="nho" onClick={xuatCSV}>⬇ Xuất CSV UTF-8 BOM</button>
          </div>
        </div>
        {luotLoc.length === 0 ? (
          <p className="mc-trong">Chưa có lượt đo nào.</p>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            {/* Khối giao diện: Bảng số liệu tổng hợp */}
            <table>
              <thead>
                <tr>
                  <th>Học sinh</th>
                  <th>Vật</th>
                  <th>Cách</th>
                  <th>Góc</th>
                  <th>h tính (m)</th>
                  <th>Sai số</th>
                  <th>HS tự tính</th>
                  <th>Nguồn</th>
                </tr>
              </thead>
              <tbody>
                {luotLoc.map((r) => {
                  const vm = vatMocs.find((x) => x.id === r.vat_id);
                  const hRef = vm?.h_that ?? r.h_that ?? null;
                  const errPct = hRef && hRef > 0 ? saiSoTuongDoi(r.h_tinh, hRef) : null;
                  return (
                    <tr key={r.id}>
                      <td>{r.tenHS}</td>
                      <td>{r.ten_vat}</td>
                      <td>{r.cach_do === 'hai-diem' ? '2 điểm' : '1 điểm'}</td>
                      <td>{dinhDangSoVN(r.alpha1, 1)}°{r.alpha2 ? ` / ${dinhDangSoVN(r.alpha2, 1)}°` : ''}</td>
                      <td>{dinhDangSoVN(r.h_tinh, 2)}</td>
                      <td>{errPct != null ? `${dinhDangSoVN(errPct, 1)}%` : '—'}</td>
                      <td>{r.hs_dung ? '✓ Đúng' : 'Sai'}</td>
                      <td>{r.nguon_goc === 'cam-bien' ? 'Cảm biến' : 'Thanh trượt'}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {/* Khối giao diện: Khối nội dung chính */}
      <section className="mc-khoi">
        <h2>Đoạn văn tự sinh trung thực cho báo cáo KHKT</h2>
        <p style={{ lineHeight: 1.65, background: '#f8fafc', padding: 12, borderRadius: 10, border: '1px solid var(--mc-vach)' }}>
          {baoCaoVan}
        </p>
      </section>
    </div>
  );
}
