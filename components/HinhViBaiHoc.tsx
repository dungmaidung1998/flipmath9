'use client';

/**
 * FILE NÀY LÀM GÌ: Component React giao diện hiển thị và xử lý tương tác của người dùng trên trình duyệt.
 * AI DÙNG: học sinh
 * LẤY DỮ LIỆU TỪ: không truy vấn bảng trực tiếp
 * GỌI TỚI: @/components/AnhChuDe, @/lib/hinhViBaiHoc
 */
import type { ReactNode } from 'react';
import AnhChuDe from '@/components/AnhChuDe';
import { anhLoiBinNa, hinhViBaiHocTheoMa, type CauHinhVbhHinh, type MauVbhHinh } from '@/lib/hinhViBaiHoc';

const MAU_SAI = '#c0312b';
const MAU_DUNG = '#16794c';
const MAU_NET = '#1f2937';
const MAU_PHU = '#64748b';

/**
 * Component React `VeSvg`: nhận props (thuộc tính truyền vào từ component cha) và dựng giao diện tương ứng.
 */
function VeSvg({ mau, laDung }: { mau: MauVbhHinh; laDung: boolean }) {
  const c = laDung ? MAU_DUNG : MAU_SAI;
  const cNen = laDung ? '#dcfce7' : '#fee2e2';

  const khung = (nd: ReactNode) => (
    <svg viewBox="0 0 220 140" className="vbh-svg" role="img" aria-hidden="true">
      {nd}
    </svg>
  );

  // Tam giác vuông ABC chuẩn A(42,108), B(42,24), C(168,108)
  const tgVuongCoBan = (extra: ReactNode) =>
    khung(
      <>
        <polyline points="42,96 54,96 54,108" fill="none" stroke={MAU_NET} strokeWidth="1.5" />
        <polygon points="42,108 42,24 168,108" fill="#f8fafc" stroke={MAU_NET} strokeWidth="2.2" strokeLinejoin="round" />
        <text x="30" y="118" fontSize="13" fontStyle="italic" fontWeight="700" fill={MAU_NET}>A</text>
        <text x="34" y="18" fontSize="13" fontStyle="italic" fontWeight="700" fill={MAU_NET}>B</text>
        <text x="174" y="118" fontSize="13" fontStyle="italic" fontWeight="700" fill={MAU_NET}>C</text>
        {extra}
      </>
    );

  // Đường tròn tâm O(105,68) R=46 chuẩn
  const duongTronCoBan = (extra: ReactNode, cx = 105, cy = 68, R = 46) =>
    khung(
      <>
        <circle cx={cx} cy={cy} r={R} fill="#f8fafc" stroke={MAU_NET} strokeWidth="2.2" />
        <circle cx={cx} cy={cy} r="2.8" fill={MAU_NET} />
        <text x={cx - 12} y={cy + 14} fontSize="12.5" fontStyle="italic" fontWeight="700" fill={MAU_NET}>O</text>
        {extra}
      </>
    );

  switch (mau) {
    case 'doi-ke':
      return tgVuongCoBan(
        <>
          <path d="M 42 46 A 22 22 0 0 0 60 36" fill="none" stroke="#d97706" strokeWidth="2" />
          <text x="116" y="24" fontSize="11.5" fontWeight="800" fill="#b45309">Xét góc B</text>
          {laDung ? (
            <>
              <line x1="42" y1="108" x2="168" y2="108" stroke={c} strokeWidth="4" strokeLinecap="round" />
              <line x1="42" y1="24" x2="42" y2="108" stroke="#2563eb" strokeWidth="3.2" strokeLinecap="round" />
              <text x="86" y="128" fontSize="12" fontWeight="800" fill={c}>AC: ĐỐI ∠B ✓</text>
              <text x="6" y="70" fontSize="11.5" fontWeight="800" fill="#2563eb">Kề</text>
            </>
          ) : (
            <>
              <line x1="42" y1="24" x2="42" y2="108" stroke={c} strokeWidth="4" strokeLinecap="round" />
              <text x="6" y="70" fontSize="11" fontWeight="800" fill={c}>ĐỐI?</text>
              <text x="72" y="128" fontSize="11.5" fontWeight="700" fill={c}>Nhầm đối thành AB</text>
            </>
          )}
        </>
      );

    case 'ti-so-4':
      return tgVuongCoBan(
        <>
          <line x1="42" y1="24" x2="168" y2="108" stroke={c} strokeWidth="3.2" />
          <text x="112" y="54" fontSize="11.5" fontWeight="800" fill={MAU_NET}>Huyền (lớn nhất)</text>
          <rect x="64" y="66" width="144" height="32" rx="8" fill={cNen} stroke={c} strokeWidth="1.5" />
          <text x="136" y="86" textAnchor="middle" fontSize="12.5" fontWeight="800" fill={c}>
            {laDung ? 'sin B = đối / huyền < 1 ✓' : 'sin B = huyền / đối > 1 ✗'}
          </text>
        </>
      );

    case 'goc-dac-biet':
      return khung(
        <>
          <polygon points="34,110 34,26 146,110" fill="#f8fafc" stroke={MAU_NET} strokeWidth="2.2" />
          <polyline points="34,98 46,98 46,110" fill="none" stroke={MAU_NET} strokeWidth="1.5" />
          <text x="110" y="103" fontSize="11.5" fontWeight="700" fill="#0f766e">30°</text>
          <text x="40" y="47" fontSize="11.5" fontWeight="700" fill="#0f766e">60°</text>
          <text x="90" y="60" fontSize="12" fontWeight="700" fill={MAU_NET}>2</text>
          <text x="20" y="72" fontSize="12" fontWeight="700" fill={c}>1</text>
          <text x="84" y="128" fontSize="12" fontWeight="700" fill={MAU_NET}>√3</text>
          <rect x="136" y="18" width="76" height="44" rx="8" fill={cNen} stroke={c} strokeWidth="1.5" />
          <text x="174" y="37" textAnchor="middle" fontSize="11.5" fontWeight="800" fill={c}>
            {laDung ? 'sin 30° = 1/2' : 'sin 30° = √3/2'}
          </text>
          <text x="174" y="53" textAnchor="middle" fontSize="11" fontWeight="700" fill={c}>
            {laDung ? 'đối / huyền' : 'đảo với cos'}
          </text>
        </>
      );

    case 'goc-phu':
      return tgVuongCoBan(
        <>
          <text x="48" y="50" fontSize="11.5" fontWeight="800" fill={c}>α</text>
          <text x="132" y="102" fontSize="11.5" fontWeight="800" fill={c}>90° − α</text>
          <rect x="76" y="14" width="134" height="42" rx="8" fill={cNen} stroke={c} strokeWidth="1.5" />
          <text x="143" y="33" textAnchor="middle" fontSize="12.5" fontWeight="800" fill={c}>
            {laDung ? 'sin α = cos(90° − α)' : 'sin α = sin(90° − α)'}
          </text>
          <text x="143" y="49" textAnchor="middle" fontSize="11" fontWeight="700" fill={c}>
            {laDung ? 'Đổi sin ↔ cos khi phụ nhau' : 'Quên đổi sang cos'}
          </text>
        </>
      );

    case 'canh-huyen-sin-cos':
      return tgVuongCoBan(
        <>
          <line x1="42" y1="24" x2="168" y2="108" stroke={MAU_NET} strokeWidth="2.4" />
          <text x="110" y="58" fontSize="12" fontWeight="700" fill={MAU_NET}>a (huyền)</text>
          <line x1="42" y1="108" x2="168" y2="108" stroke={c} strokeWidth="3.8" />
          <text x="48" y="48" fontSize="11.5" fontWeight="700" fill="#2563eb">B</text>
          <text x="105" y="128" textAnchor="middle" fontSize="12.5" fontWeight="800" fill={c}>
            {laDung ? 'AC = a · sin B (đối B) ✓' : 'AC = a · cos B ✗'}
          </text>
        </>
      );

    case 'canh-goc-vuong-tan':
      return tgVuongCoBan(
        <>
          <line x1="42" y1="24" x2="42" y2="108" stroke="#2563eb" strokeWidth="3" />
          <line x1="42" y1="108" x2="168" y2="108" stroke={c} strokeWidth="3.8" />
          <text x="20" y="70" fontSize="12" fontWeight="700" fill="#2563eb">c</text>
          <text x="105" y="128" textAnchor="middle" fontSize="12" fontWeight="800" fill={c}>
            {laDung ? 'AC = c · tan B ✓' : 'AC = c · tan C ✗'}
          </text>
        </>
      );

    case 'goc-nang-ha':
      return khung(
        <>
          <line x1="36" y1="112" x2="184" y2="112" stroke={MAU_PHU} strokeWidth="1.5" />
          <line x1="164" y1="22" x2="164" y2="112" stroke={MAU_NET} strokeWidth="2.5" />
          <line x1="44" y1="112" x2="164" y2="28" stroke="#2563eb" strokeWidth="2.5" />
          <line x1="44" y1="28" x2="164" y2="28" stroke={MAU_PHU} strokeWidth="1.5" strokeDasharray="4 4" />
          {laDung ? (
            <>
              <path d="M 76 112 A 32 32 0 0 0 70 94" fill="none" stroke={c} strokeWidth="3" />
              <text x="82" y="102" fontSize="11.5" fontWeight="800" fill={c}>α (so phương ngang) ✓</text>
            </>
          ) : (
            <>
              <path d="M 164 56 A 28 28 0 0 1 141 44" fill="none" stroke={c} strokeWidth="3" />
              <text x="74" y="42" fontSize="11.5" fontWeight="800" fill={c}>Đặt nhầm ở phương đứng ✗</text>
            </>
          )}
        </>
      );

    case 'tong-goc-nhon':
      return tgVuongCoBan(
        <>
          <rect x="78" y="18" width="132" height="44" rx="8" fill={cNen} stroke={c} strokeWidth="1.5" />
          <text x="144" y="37" textAnchor="middle" fontSize="12.5" fontWeight="800" fill={c}>
            {laDung ? '∠B + ∠C = 90° ✓' : '∠B + ∠C = 180° ✗'}
          </text>
          <text x="144" y="53" textAnchor="middle" fontSize="11" fontWeight="700" fill={c}>
            {laDung ? 'Vì ∠A đã = 90°' : 'Quên trừ ∠A = 90°'}
          </text>
        </>
      );

    case 'diem-duong-tron':
      return duongTronCoBan(
        <>
          <line x1="105" y1="68" x2="151" y2="68" stroke="#2563eb" strokeWidth="2.2" />
          <text x="128" y="61" textAnchor="middle" fontSize="11.5" fontWeight="700" fill="#2563eb">R</text>
          <circle cx="136" cy="52" r="4" fill={c} />
          <text x="142" y="48" fontSize="12" fontStyle="italic" fontWeight="800" fill={c}>M</text>
          <text x="110" y="132" textAnchor="middle" fontSize="11.5" fontWeight="800" fill={c}>
            {laDung ? 'OM < R = d/2 ⇒ trong (O)' : 'Nhầm d làm bán kính R'}
          </text>
        </>
      );

    case 'truc-doi-xung':
      return duongTronCoBan(
        <>
          <line x1="50" y1="68" x2="160" y2="68" stroke="#2563eb" strokeWidth="2" strokeDasharray="5 3" />
          <line x1="105" y1="14" x2="105" y2="122" stroke="#2563eb" strokeWidth="2" strokeDasharray="5 3" />
          {laDung && (
            <>
              <line x1="65" y1="28" x2="145" y2="108" stroke={c} strokeWidth="2.4" />
              <line x1="65" y1="108" x2="145" y2="28" stroke={c} strokeWidth="2.4" />
            </>
          )}
          <text x="110" y="134" textAnchor="middle" fontSize="11.5" fontWeight="800" fill={c}>
            {laDung ? 'Vô số trục đi qua tâm O ✓' : 'Chỉ có 2 trục ngang/dọc? ✗'}
          </text>
        </>
      );

    case 'nua-day':
      return duongTronCoBan(
        <>
          <line x1="69" y1="40" x2="141" y2="40" stroke={MAU_NET} strokeWidth="2.8" />
          <line x1="105" y1="68" x2="105" y2="40" stroke={MAU_PHU} strokeWidth="1.8" strokeDasharray="4 3" />
          <polyline points="105,49 114,49 114,40" fill="none" stroke={MAU_NET} strokeWidth="1.4" />
          <line x1="105" y1="68" x2="141" y2="40" stroke="#2563eb" strokeWidth="2.2" />
          <line x1={laDung ? 105 : 69} y1="40" x2="141" y2="40" stroke={c} strokeWidth="4" />
          <text x="61" y="36" fontSize="11.5" fontStyle="italic" fontWeight="700" fill={MAU_NET}>A</text>
          <text x="103" y="34" fontSize="11.5" fontStyle="italic" fontWeight="700" fill={MAU_NET}>H</text>
          <text x="145" y="36" fontSize="11.5" fontStyle="italic" fontWeight="700" fill={MAU_NET}>B</text>
          <text x="110" y="134" textAnchor="middle" fontSize="11.5" fontWeight="800" fill={c}>
            {laDung ? 'Dùng nửa dây HB = AB/2 ✓' : 'Lấy cả dây AB vào tam giác ✗'}
          </text>
        </>
      );

    case 'goc-tam-cung':
      return duongTronCoBan(
        <>
          <line x1="105" y1="68" x2="73" y2="34" stroke={MAU_NET} strokeWidth="2" />
          <line x1="105" y1="68" x2="137" y2="34" stroke={MAU_NET} strokeWidth="2" />
          <path d="M 73 34 A 46 46 0 0 1 137 34" fill="none" stroke={c} strokeWidth="4" />
          <text x="105" y="54" textAnchor="middle" fontSize="11" fontWeight="800" fill="#2563eb">70°</text>
          <text x="110" y="134" textAnchor="middle" fontSize="11.5" fontWeight="800" fill={c}>
            {laDung ? 'sđ cung nhỏ AB = 70° ✓' : 'Nhầm chia đôi còn 35° ✗'}
          </text>
        </>
      );

    case 'cong-cung':
      return duongTronCoBan(
        <>
          <path d="M 65 44 A 46 46 0 0 1 145 44" fill="none" stroke={c} strokeWidth="3.8" />
          <line x1="65" y1="44" x2="145" y2="44" stroke={MAU_NET} strokeWidth="2" strokeDasharray={laDung ? '0' : '4 3'} />
          <circle cx="105" cy="22" r="3" fill={MAU_NET} />
          <text x="105" y="15" textAnchor="middle" fontSize="11" fontStyle="italic" fontWeight="700" fill={MAU_NET}>C</text>
          <text x="110" y="134" textAnchor="middle" fontSize="11.5" fontWeight="800" fill={c}>
            {laDung ? 'sđ AB = sđ AC + sđ CB ✓' : 'Gấp đôi cung không gấp đôi dây ✗'}
          </text>
        </>
      );

    case 'do-dai-cung':
      return duongTronCoBan(
        <>
          <line x1="105" y1="68" x2="151" y2="68" stroke="#2563eb" strokeWidth="2.2" />
          <path d="M 105 22 A 46 46 0 0 1 151 68" fill="none" stroke={c} strokeWidth="4" />
          <rect x="20" y="106" width="180" height="26" rx="8" fill={cNen} stroke={c} strokeWidth="1.4" />
          <text x="110" y="123" textAnchor="middle" fontSize="12" fontWeight="800" fill={c}>
            {laDung ? 'l = πRn / 180 ✓' : 'l = πRn / 360 hoặc πdn/180 ✗'}
          </text>
        </>
      );

    case 'dien-tich-quat':
      return duongTronCoBan(
        <>
          <path d="M 105 68 L 105 22 A 46 46 0 0 1 151 68 Z" fill={cNen} stroke={c} strokeWidth="2.5" />
          <rect x="20" y="106" width="180" height="26" rx="8" fill={cNen} stroke={c} strokeWidth="1.4" />
          <text x="110" y="123" textAnchor="middle" fontSize="12" fontWeight="800" fill={c}>
            {laDung ? 'S = πR²n/360 = lR/2 ✓' : 'Thiếu bình phương R hoặc chia 2 ✗'}
          </text>
        </>
      );

    case 'vanh-khuyen':
      return khung(
        <>
          <circle cx="105" cy="58" r="44" fill={cNen} stroke={c} strokeWidth="2.2" />
          <circle cx="105" cy="58" r="22" fill="#fff" stroke={MAU_NET} strokeWidth="2" />
          <circle cx="105" cy="58" r="2.5" fill={MAU_NET} />
          <text x="110" y="128" textAnchor="middle" fontSize="12" fontWeight="800" fill={c}>
            {laDung ? 'S = π(R² − r²) ✓' : 'S = π(R − r)² ✗'}
          </text>
        </>
      );

    case 'duong-thang-d-r':
      return duongTronCoBan(
        <>
          {laDung ? (
            <>
              <line x1="151" y1="14" x2="151" y2="112" stroke={c} strokeWidth="3" />
              <line x1="105" y1="68" x2="151" y2="68" stroke="#2563eb" strokeWidth="2" />
              <text x="110" y="134" textAnchor="middle" fontSize="11.5" fontWeight="800" fill={c}>d = R ⇒ tiếp xúc; d &lt; R ⇒ cắt ✓</text>
            </>
          ) : (
            <>
              <line x1="168" y1="14" x2="168" y2="112" stroke={c} strokeWidth="3" />
              <text x="110" y="134" textAnchor="middle" fontSize="11.5" fontWeight="800" fill={c}>Đảo ngược d &gt; R thành cắt ✗</text>
            </>
          )}
        </>,
        86,
        62,
        40
      );

    case 'tiep-tuyen-pythagore':
      return khung(
        <>
          <circle cx="64" cy="68" r="38" fill="#f8fafc" stroke={MAU_NET} strokeWidth="2" />
          <circle cx="64" cy="68" r="2.5" fill={MAU_NET} />
          <line x1="64" y1="68" x2="88" y2="38" stroke="#2563eb" strokeWidth="2.2" />
          <line x1="88" y1="38" x2="178" y2="68" stroke={c} strokeWidth="2.8" />
          <line x1="64" y1="68" x2="178" y2="68" stroke={MAU_NET} strokeWidth="2.2" />
          <text x="54" y="64" fontSize="12" fontStyle="italic" fontWeight="700" fill={MAU_NET}>O</text>
          <text x="86" y="30" fontSize="12" fontStyle="italic" fontWeight="700" fill={MAU_NET}>A (90°)</text>
          <text x="184" y="72" fontSize="12" fontStyle="italic" fontWeight="700" fill={MAU_NET}>M</text>
          <text x="110" y="130" textAnchor="middle" fontSize="12" fontWeight="800" fill={c}>
            {laDung ? 'MA² = OM² − R² (OM huyền) ✓' : 'MA² = OM² + R² ✗'}
          </text>
        </>
      );

    case 'hai-tiep-tuyen':
      return khung(
        <>
          <circle cx="62" cy="62" r="34" fill="#f8fafc" stroke={MAU_NET} strokeWidth="2" />
          <line x1="82" y1="34" x2="174" y2="62" stroke={MAU_NET} strokeWidth="2.2" />
          <line x1="82" y1="90" x2="174" y2="62" stroke={MAU_NET} strokeWidth="2.2" />
          <line x1="62" y1="62" x2="174" y2="62" stroke={c} strokeWidth="2" strokeDasharray="5 3" />
          <text x="50" y="66" fontSize="11.5" fontStyle="italic" fontWeight="700" fill={MAU_NET}>O</text>
          <text x="80" y="26" fontSize="11.5" fontStyle="italic" fontWeight="700" fill={MAU_NET}>A</text>
          <text x="80" y="104" fontSize="11.5" fontStyle="italic" fontWeight="700" fill={MAU_NET}>B</text>
          <text x="180" y="66" fontSize="11.5" fontStyle="italic" fontWeight="700" fill={MAU_NET}>M</text>
          <text x="110" y="130" textAnchor="middle" fontSize="11.5" fontWeight="800" fill={c}>
            {laDung ? 'MA = MB, MO phân giác, ∠AOB+∠M=180°' : 'Nhầm ∠AMO = ∠AMB hoặc MA = OA'}
          </text>
        </>
      );

    case 'hai-duong-tron-diem':
      return khung(
        <>
          <circle cx="76" cy="58" r="34" fill="#f8fafc" stroke={MAU_NET} strokeWidth="2" />
          <circle cx={laDung ? 132 : 114} cy="58" r="22" fill="none" stroke={c} strokeWidth="2.4" />
          <text x="110" y="128" textAnchor="middle" fontSize="11.5" fontWeight="800" fill={c}>
            {laDung ? '1 điểm chung: tiếp xúc (O,O′,A thẳng) ✓' : 'Nhầm số điểm chung / vị trí ✗'}
          </text>
        </>
      );

    case 'hai-duong-tron-truc':
      return khung(
        <>
          <line x1="22" y1="62" x2="200" y2="62" stroke={MAU_NET} strokeWidth="2.2" />
          <circle cx="72" cy="62" r="4.5" fill={MAU_NET} />
          <circle cx="148" cy="62" r="4.5" fill={MAU_NET} />
          <line x1={laDung ? 72 : 148} y1="62" x2={laDung ? 148 : 200} y2="62" stroke={c} strokeWidth="5" opacity="0.45" />
          <text x="72" y="48" textAnchor="middle" fontSize="11.5" fontWeight="800" fill={MAU_NET}>R − r</text>
          <text x="148" y="48" textAnchor="middle" fontSize="11.5" fontWeight="800" fill={MAU_NET}>R + r</text>
          <text x="110" y="114" textAnchor="middle" fontSize="11.5" fontWeight="800" fill={c}>
            {laDung ? 'R − r < d < R + r ⇒ Cắt nhau ✓' : 'Nhầm khoảng tiếp xúc trong / cắt ✗'}
          </text>
        </>
      );
  }
}

/**
 * Component React `VeDoiChieuHinh`: nhận props (thuộc tính truyền vào từ component cha) và dựng giao diện tương ứng.
 */
function VeDoiChieuHinh({ cfg }: { cfg: CauHinhVbhHinh }) {
  return (
    <section className="card vbh-the vbh-hinh-khung" aria-label={`Hình minh hoạ: ${cfg.tieuDe}`}>
      <h2>🖼️ Nhìn hình để tránh bẫy: {cfg.tieuDe}</h2>
      <div className="vbh-doi-chieu">
        <div className="vbh-doi-chieu__o vbh-doi-chieu__o--sai">
          <span className="vbh-doi-chieu__nhan vbh-doi-chieu__nhan--sai">Sai ✗</span>
          <VeSvg mau={cfg.mau} laDung={false} />
          <p className="vbh-doi-chieu__chu">{cfg.saiNhan}</p>
        </div>
        <div className="vbh-doi-chieu__o vbh-doi-chieu__o--dung">
          <span className="vbh-doi-chieu__nhan vbh-doi-chieu__nhan--dung">Đúng ✓</span>
          <VeSvg mau={cfg.mau} laDung />
          <p className="vbh-doi-chieu__chu">{cfg.dungNhan}</p>
        </div>
      </div>
    </section>
  );
}

/**
 * Component React `HinhViBaiHoc`: nhận props (thuộc tính truyền vào từ component cha) và dựng giao diện tương ứng.
 */
export default function HinhViBaiHoc({ id, kuId }: { id: string; kuId?: string | null }) {
  const cfg = hinhViBaiHocTheoMa(id);
  if (cfg) {
    return <VeDoiChieuHinh cfg={cfg} />;
  }

  const bn = anhLoiBinNa(id, kuId);
  return (
    <section className="card vbh-the vbh-hinh-khung" aria-label="Minh hoạ sửa lỗi cùng Bin và Na">
      <h2>🖼️ Từ bối rối đến hiểu ra cùng {bn.tenNhanVat}</h2>
      <div className="vbh-bin-na">
        <div className="vbh-bin-na__buoc vbh-bin-na__buoc--sai">
          <AnhChuDe src={bn.boiRoi} fallback={bn.fallback} alt={`${bn.tenNhanVat} đang bối rối`} width={132} height={132} loading="lazy" />
          <span className="vbh-doi-chieu__nhan vbh-doi-chieu__nhan--sai">Hay nhầm · Sai ✗</span>
        </div>
        <div className="vbh-bin-na__mui-ten" aria-hidden="true">→</div>
        <div className="vbh-bin-na__buoc vbh-bin-na__buoc--dung">
          <AnhChuDe src={bn.hieuRa} fallback={bn.fallback} alt={`${bn.tenNhanVat} đã hiểu ra`} width={132} height={132} loading="lazy" />
          <span className="vbh-doi-chieu__nhan vbh-doi-chieu__nhan--dung">Hiểu ra · Đúng ✓</span>
        </div>
      </div>
    </section>
  );
}
