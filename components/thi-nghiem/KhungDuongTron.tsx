'use client';

/**
 * FILE NÀY LÀM GÌ: 6 mô hình thí nghiệm kéo-thả trực quan Chương V Đường tròn (kéo điểm, cung quạt, tiếp tuyến, hai đường tròn).
 * AI DÙNG: học sinh
 * LẤY DỮ LIỆU TỪ: nhận cấu hình khung từ @/lib/thiNghiem
 * GỌI TỚI: @/components/MathText, ./Khung
 */
import { useRef, useState } from 'react';
import MathText from '@/components/MathText';
import type { Khung } from '@/lib/thiNghiem';
import { Truot, so } from './Khung';

const M = ({ t }: { t: string }) => <MathText>{`$${t}$`}</MathText>;
const RAD = Math.PI / 180;
type P = { onThaoTac: () => void };

function diemTrongSvg(e: React.PointerEvent<SVGSVGElement>, w: number, h: number) {
  const rect = e.currentTarget.getBoundingClientRect();
  return {
    x: ((e.clientX - rect.left) / Math.max(1, rect.width)) * w,
    y: ((e.clientY - rect.top) / Math.max(1, rect.height)) * h,
  };
}

/** 1. C5-B13-M1: Đường tròn (O; R) và vị trí điểm M (trong / trên / ngoài). */
export function TronDiem({ k, onThaoTac }: P & { k: Extract<Khung, { loai: 'tron-diem' }> }) {
  const [R, setR] = useState(k.rMacDau);
  const [om, setOm] = useState(k.omMacDau);
  const [goc, setGoc] = useState(-28);
  const keoRef = useRef(false);

  const cx = 165;
  const cy = 115;
  const px = 14;
  const rPx = R * px;
  const omPx = om * px;
  const mx = cx + omPx * Math.cos(goc * RAD);
  const my = cy + omPx * Math.sin(goc * RAD);

  const trangThai = Math.abs(om - R) < 0.05 ? 'tren' : om < R ? 'trong' : 'ngoai';
  const mauM = trangThai === 'trong' ? '#2563eb' : trangThai === 'tren' ? '#16a34a' : '#ea580c';
  const ketLuan =
    trangThai === 'trong'
      ? `OM = ${so(om)} < R = ${so(R)} ⇒ điểm M nằm BÊN TRONG đường tròn`
      : trangThai === 'tren'
        ? `OM = ${so(om)} = R = ${so(R)} ⇒ điểm M nằm TRÊN đường tròn`
        : `OM = ${so(om)} > R = ${so(R)} ⇒ điểm M nằm BÊN NGOÀI đường tròn`;

  const capNhatTuPointer = (e: React.PointerEvent<SVGSVGElement>) => {
    const pt = diemTrongSvg(e, 330, 230);
    const dx = pt.x - cx;
    const dy = pt.y - cy;
    const dist = Math.max(0.5, Math.min(8, Math.round((Math.hypot(dx, dy) / px) * 2) / 2));
    setOm(dist);
    setGoc(Math.round(Math.atan2(dy, dx) / RAD));
    onThaoTac();
  };

  return (
    <div className="tn-khung">
      <div className="tn-hai-cot">
        <Truot nhan="Bán kính $R$" min={2} max={6} step={0.5} value={R} donVi=" cm" onChange={(v) => { setR(v); onThaoTac(); }} />
        <Truot nhan="Khoảng cách $OM$" min={0.5} max={8} step={0.5} value={om} donVi=" cm" onChange={(v) => { setOm(v); onThaoTac(); }} />
      </div>
      <div className="tn-hinh__ve">
        <svg
          viewBox="0 0 330 230"
          className="tn-c5-svg"
          role="img"
          aria-label={ketLuan}
          onPointerDown={(e) => {
            keoRef.current = true;
            e.currentTarget.setPointerCapture(e.pointerId);
            capNhatTuPointer(e);
          }}
          onPointerMove={(e) => { if (keoRef.current) capNhatTuPointer(e); }}
          onPointerUp={() => { keoRef.current = false; }}
        >
          <circle cx={cx} cy={cy} r={rPx} fill="rgba(20, 184, 166, 0.12)" stroke="#0f766e" strokeWidth={2.5} />
          <line x1={cx} y1={cy} x2={cx + rPx} y2={cy} stroke="#0f766e" strokeWidth={1.5} strokeDasharray="4 3" />
          <text x={cx + rPx / 2} y={cy - 6} className="tn-canh" textAnchor="middle">R = {so(R)}</text>
          <line x1={cx} y1={cy} x2={mx} y2={my} stroke={mauM} strokeWidth={2.5} />
          <circle cx={cx} cy={cy} r={4} fill="#0f172a" />
          <text x={cx - 12} y={cy + 16} className="tn-dinh">O</text>
          <circle cx={mx} cy={my} r={8} fill={mauM} style={{ cursor: 'grab' }} />
          <text x={mx + 10} y={my - 8} className="tn-dinh" fill={mauM}>M</text>
          <text x={165} y={220} textAnchor="middle" className="tn-nho">Kéo trực tiếp điểm M trên hình hoặc kéo thanh trượt</text>
        </svg>
        <div className="tn-hinh__so">
          <p className="tn-chuoi"><M t={`OM = ${so(om)}\\text{ cm},\\quad R = ${so(R)}\\text{ cm}`} /></p>
          <p className="tn-phu">Đường kính: <M t={`d = 2R = ${so(2 * R)}\\text{ cm}`} /></p>
          <p className={trangThai === 'tren' ? 'tn-kd tn-kd--dung' : 'tn-nhan-manh'} style={{ marginTop: 8 }}>{ketLuan}</p>
        </div>
      </div>
    </div>
  );
}

/** 2. C5-B13-M2: Tính đối xứng của đường tròn (tâm đối xứng & trục đối xứng qua O). */
export function TronDoiXung({ k, onThaoTac }: P & { k: Extract<Khung, { loai: 'tron-doi-xung' }> }) {
  const [gocTruc, setGocTruc] = useState(k.gocBatDau);
  const [gocA, setGocA] = useState(-50);
  const [latQuaTam, setLatQuaTam] = useState(false);
  const [latQuaTruc, setLatQuaTruc] = useState(false);

  const cx = 160;
  const cy = 115;
  const R = 74;
  const ax = cx + R * Math.cos(gocA * RAD);
  const ay = cy + R * Math.sin(gocA * RAD);
  const axTam = 2 * cx - ax;
  const ayTam = 2 * cy - ay;
  // Điểm đối xứng của A qua đường thẳng đi qua tâm có góc nghiêng gocTruc
  const gocDoiXungTruc = 2 * gocTruc - gocA;
  const axTruc = cx + R * Math.cos(gocDoiXungTruc * RAD);
  const ayTruc = cy + R * Math.sin(gocDoiXungTruc * RAD);

  const tx1 = cx - 96 * Math.cos(gocTruc * RAD);
  const ty1 = cy - 96 * Math.sin(gocTruc * RAD);
  const tx2 = cx + 96 * Math.cos(gocTruc * RAD);
  const ty2 = cy + 96 * Math.sin(gocTruc * RAD);

  return (
    <div className="tn-khung">
      <div className="tn-hai-cot">
        <Truot nhan="Góc đường thẳng $d$ qua tâm $O$" min={0} max={175} step={5} value={gocTruc} donVi="°" onChange={(v) => { setGocTruc(v); onThaoTac(); }} />
        <Truot nhan="Vị trí điểm $A$" min={-180} max={180} step={10} value={gocA} donVi="°" onChange={(v) => { setGocA(v); onThaoTac(); }} />
      </div>
      <div className="tn-nut-hang">
        <button type="button" aria-pressed={latQuaTam} onClick={() => { setLatQuaTam((x) => !x); onThaoTac(); }}>
          🔄 Lấy A′ đối xứng qua tâm O
        </button>
        <button type="button" aria-pressed={latQuaTruc} onClick={() => { setLatQuaTruc((x) => !x); onThaoTac(); }}>
          🪞 Lấy A″ đối xứng qua trục d
        </button>
      </div>
      <div className="tn-hinh__ve">
        <svg viewBox="0 0 320 230" className="tn-c5-svg" role="img" aria-label="Tính đối xứng của đường tròn">
          <circle cx={cx} cy={cy} r={R} fill="rgba(13, 148, 136, 0.08)" stroke="#0f766e" strokeWidth={2.5} />
          <line x1={tx1} y1={ty1} x2={tx2} y2={ty2} stroke="#ea580c" strokeWidth={2} strokeDasharray="6 4" />
          <text x={tx2 + 6} y={ty2 + 4} className="tn-canh" fill="#ea580c">d</text>
          <circle cx={cx} cy={cy} r={4.5} fill="#0f172a" />
          <text x={cx + 6} y={cy + 16} className="tn-dinh">O</text>
          <circle cx={ax} cy={ay} r={6} fill="#2563eb" />
          <text x={ax + 8} y={ay - 6} className="tn-dinh">A</text>
          {latQuaTam && (
            <>
              <line x1={ax} y1={ay} x2={axTam} y2={ayTam} stroke="#16a34a" strokeWidth={1.5} strokeDasharray="4 3" />
              <circle cx={axTam} cy={ayTam} r={6} fill="#16a34a" />
              <text x={axTam - 18} y={ayTam + 14} className="tn-dinh" fill="#16a34a">A′</text>
            </>
          )}
          {latQuaTruc && (
            <>
              <line x1={ax} y1={ay} x2={axTruc} y2={ayTruc} stroke="#9333ea" strokeWidth={1.5} strokeDasharray="4 3" />
              <circle cx={axTruc} cy={ayTruc} r={6} fill="#9333ea" />
              <text x={axTruc + 8} y={ayTruc + 12} className="tn-dinh" fill="#9333ea">A″</text>
            </>
          )}
        </svg>
        <div className="tn-hinh__so">
          <p className="tn-chuoi"><M t={`OA = OA' = OA'' = R`} /></p>
          <p className="tn-phu">Đường thẳng d đi qua tâm O luôn là trục đối xứng dù xoay theo bất kì góc nào ({gocTruc}°).</p>
          <p className="tn-nhan-manh">Đường tròn có <b>1 tâm đối xứng</b> (O) và <b>vô số trục đối xứng</b>.</p>
        </div>
      </div>
    </div>
  );
}

/** 3. C5-B14-M1: Dây và đường kính — đường kính là dây lớn nhất; d² + (AB/2)² = R². */
export function DayCung({ k, onThaoTac }: P & { k: Extract<Khung, { loai: 'day-cung' }> }) {
  const [R, setR] = useState(k.r);
  const [d, setD] = useState(k.dMacDau);
  const keoRef = useRef(false);

  const dHopLe = Math.min(d, R);
  const nuaDay = Math.sqrt(Math.max(0, R * R - dHopLe * dHopLe));
  const ab = 2 * nuaDay;
  const dk = 2 * R;

  const cx = 160;
  const cy = 115;
  const px = 80 / R;
  const hy = cy - dHopLe * px;
  const xTrai = cx - nuaDay * px;
  const xPhai = cx + nuaDay * px;

  const keoDay = (e: React.PointerEvent<SVGSVGElement>) => {
    const pt = diemTrongSvg(e, 320, 230);
    const dMoi = Math.max(0, Math.min(R, Math.round(((cy - pt.y) / px) * 2) / 2));
    setD(dMoi);
    onThaoTac();
  };

  return (
    <div className="tn-khung">
      <div className="tn-hai-cot">
        <Truot nhan="Bán kính $R$" min={3} max={10} step={1} value={R} donVi=" cm" onChange={(v) => { setR(v); if (d > v) setD(v); onThaoTac(); }} />
        <Truot nhan="Khoảng cách $d = OH$" min={0} max={R} step={0.5} value={dHopLe} donVi=" cm" onChange={(v) => { setD(v); onThaoTac(); }} />
      </div>
      <div className="tn-hinh__ve">
        <svg
          viewBox="0 0 320 230"
          className="tn-c5-svg"
          role="img"
          aria-label={`Dây AB = ${so(ab)} cm, đường kính = ${dk} cm`}
          onPointerDown={(e) => {
            keoRef.current = true;
            e.currentTarget.setPointerCapture(e.pointerId);
            keoDay(e);
          }}
          onPointerMove={(e) => { if (keoRef.current) keoDay(e); }}
          onPointerUp={() => { keoRef.current = false; }}
        >
          <circle cx={cx} cy={cy} r={R * px} fill="rgba(20, 184, 166, 0.08)" stroke="#0f766e" strokeWidth={2.5} />
          <line x1={cx - R * px} y1={cy} x2={cx + R * px} y2={cy} stroke="#94a3b8" strokeWidth={1.5} strokeDasharray="4 4" />
          <line x1={xTrai} y1={hy} x2={xPhai} y2={hy} stroke="#2563eb" strokeWidth={3.5} style={{ cursor: 'ns-resize' }} />
          <line x1={cx} y1={cy} x2={cx} y2={hy} stroke="#ea580c" strokeWidth={2} />
          <line x1={cx} y1={cy} x2={xPhai} y2={hy} stroke="#0f766e" strokeWidth={2} />
          <circle cx={cx} cy={cy} r={4} fill="#0f172a" />
          <text x={cx - 12} y={cy + 16} className="tn-dinh">O</text>
          <circle cx={xTrai} cy={hy} r={4} fill="#2563eb" />
          <text x={xTrai - 14} y={hy - 6} className="tn-dinh">A</text>
          <circle cx={xPhai} cy={hy} r={4} fill="#2563eb" />
          <text x={xPhai + 6} y={hy - 6} className="tn-dinh">B</text>
          <text x={cx + 6} y={hy - 6} className="tn-dinh" fill="#ea580c">H</text>
        </svg>
        <div className="tn-hinh__so">
          <p className="tn-chuoi"><M t={`HB = \\sqrt{R^2 - d^2} = \\sqrt{${R}^2 - ${so(dHopLe)}^2} \\approx ${so(nuaDay)}\\text{ cm}`} /></p>
          <p className="tn-chuoi"><M t={`AB = 2HB \\approx ${so(ab)}\\text{ cm} \\le 2R = ${dk}\\text{ cm}`} /></p>
          <p className={dHopLe === 0 ? 'tn-kd tn-kd--dung' : 'tn-phu'}>
            {dHopLe === 0 ? 'Khi d = 0, dây AB đi qua tâm và trở thành ĐƯỜNG KÍNH (lớn nhất)!' : 'Kéo d = 0 để thấy dây AB đạt độ dài cực đại.'}
          </p>
        </div>
      </div>
    </div>
  );
}

/**
 * 4. cung-quat: C5-B14-M2 (góc ở tâm), C5-B14-M3 (cộng cung),
 * C5-B15-M1 (độ dài cung Sun Wheel), C5-B15-M2 (diện tích quạt), C5-B15-M3 (vành khuyên).
 */
export function CungQuat({ k, onThaoTac }: P & { k: Extract<Khung, { loai: 'cung-quat' }> }) {
  const [R, setR] = useState(k.cheDo === 'vanh-khuyen' ? 6 : 6);
  const [rNho, setRNho] = useState(3);
  const [n, setN] = useState(k.gocMacDau);
  const [n2, setN2] = useState(40);
  const [sunWheel, setSunWheel] = useState(false);

  const cx = 160;
  const cy = 115;
  const px = 78 / 8;
  const rPx = (k.cheDo === 'do-dai' && sunWheel ? 6.5 : R) * px;
  const rThuc = k.cheDo === 'do-dai' && sunWheel ? 57.5 : R;

  const gocA = -90;
  const gocB = gocA + n;
  const gocC = gocB + n2;

  const diem = (radDeg: number, rPix = rPx) => ({
    x: cx + rPix * Math.cos(radDeg * RAD),
    y: cy + rPix * Math.sin(radDeg * RAD),
  });

  const A = diem(gocA);
  const B = diem(gocB);
  const C = diem(gocC);
  const cungLon = n > 180 ? 1 : 0;
  const l = (Math.PI * rThuc * n) / 180;
  const sQuat = (Math.PI * R * R * n) / 360;
  const sVanh = Math.PI * (R * R - rNho * rNho);
  const sNham = Math.PI * (R - rNho) * (R - rNho);

  return (
    <div className="tn-khung">
      {k.cheDo === 'vanh-khuyen' ? (
        <div className="tn-hai-cot">
          <Truot nhan="Bán kính ngoài $R$" min={4} max={8} step={1} value={R} donVi=" cm" onChange={(v) => { setR(v); if (rNho >= v) setRNho(v - 1); onThaoTac(); }} />
          <Truot nhan="Bán kính trong $r$" min={1} max={Math.max(1, R - 1)} step={1} value={Math.min(rNho, R - 1)} donVi=" cm" onChange={(v) => { setRNho(v); onThaoTac(); }} />
        </div>
      ) : (
        <div className="tn-hai-cot">
          {k.cheDo === 'cong-cung' ? (
            <>
              <Truot nhan="Cung $\\overset{\\frown}{AB}$" min={20} max={160} step={10} value={n} donVi="°" onChange={(v) => { setN(v); onThaoTac(); }} />
              <Truot nhan="Cung $\\overset{\\frown}{BC}$ kề" min={20} max={140} step={10} value={n2} donVi="°" onChange={(v) => { setN2(v); onThaoTac(); }} />
            </>
          ) : (
            <>
              <Truot nhan="Số đo cung $n$" min={15} max={320} step={15} value={n} donVi="°" onChange={(v) => { setN(v); onThaoTac(); }} />
              {(k.cheDo === 'do-dai' || k.cheDo === 'hinh-quat') && (
                <Truot nhan="Bán kính $R$" min={3} max={8} step={1} value={R} donVi=" cm" onChange={(v) => { setR(v); setSunWheel(false); onThaoTac(); }} />
              )}
            </>
          )}
        </div>
      )}

      {k.cheDo === 'do-dai' && (
        <div className="tn-nut-hang">
          <button type="button" aria-pressed={sunWheel} onClick={() => { setSunWheel((s) => !s); onThaoTac(); }}>
            🎡 Bối cảnh Sun Wheel Đà Nẵng (R ≈ 57,5 m)
          </button>
        </div>
      )}

      <div className="tn-hinh__ve">
        <svg viewBox="0 0 320 230" className="tn-c5-svg" role="img" aria-label="Đường tròn, cung và hình quạt">
          {k.cheDo === 'vanh-khuyen' ? (
            <>
              <circle cx={cx} cy={cy} r={R * px} fill="rgba(20, 184, 166, 0.35)" stroke="#0f766e" strokeWidth={2.5} />
              <circle cx={cx} cy={cy} r={Math.min(rNho, R - 1) * px} fill="#ffffff" stroke="#ea580c" strokeWidth={2.5} />
              <line x1={cx} y1={cy} x2={cx + R * px} y2={cy} stroke="#0f766e" strokeWidth={2} />
              <line x1={cx} y1={cy} x2={cx} y2={cy - Math.min(rNho, R - 1) * px} stroke="#ea580c" strokeWidth={2} />
              <text x={cx + (R * px) / 2} y={cy + 14} className="tn-canh">R={R}</text>
              <text x={cx + 6} y={cy - (Math.min(rNho, R - 1) * px) / 2} className="tn-canh">r={Math.min(rNho, R - 1)}</text>
            </>
          ) : (
            <>
              <circle cx={cx} cy={cy} r={rPx} fill="none" stroke="#94a3b8" strokeWidth={2} />
              {k.cheDo === 'hinh-quat' && (
                <path
                  d={`M ${cx} ${cy} L ${A.x} ${A.y} A ${rPx} ${rPx} 0 ${cungLon} 1 ${B.x} ${B.y} Z`}
                  fill="rgba(249, 115, 22, 0.25)"
                  stroke="none"
                />
              )}
              <path
                d={`M ${A.x} ${A.y} A ${rPx} ${rPx} 0 ${cungLon} 1 ${B.x} ${B.y}`}
                fill="none"
                stroke="#ea580c"
                strokeWidth={5}
                strokeLinecap="round"
              />
              {k.cheDo === 'cong-cung' && (
                <path
                  d={`M ${B.x} ${B.y} A ${rPx} ${rPx} 0 ${n2 > 180 ? 1 : 0} 1 ${C.x} ${C.y}`}
                  fill="none"
                  stroke="#2563eb"
                  strokeWidth={5}
                  strokeLinecap="round"
                />
              )}
              <line x1={cx} y1={cy} x2={A.x} y2={A.y} stroke="#0f766e" strokeWidth={2} />
              <line x1={cx} y1={cy} x2={B.x} y2={B.y} stroke="#0f766e" strokeWidth={2} />
              {k.cheDo === 'cong-cung' && <line x1={cx} y1={cy} x2={C.x} y2={C.y} stroke="#2563eb" strokeWidth={1.5} strokeDasharray="4 3" />}
              <circle cx={cx} cy={cy} r={4} fill="#0f172a" />
              <text x={cx - 12} y={cy + 14} className="tn-dinh">O</text>
              <circle cx={A.x} cy={A.y} r={4.5} fill="#0f766e" />
              <text x={A.x - 4} y={A.y - 8} className="tn-dinh">A</text>
              <circle cx={B.x} cy={B.y} r={4.5} fill="#ea580c" />
              <text x={B.x + 6} y={B.y + 6} className="tn-dinh">B</text>
              {k.cheDo === 'cong-cung' && (
                <>
                  <circle cx={C.x} cy={C.y} r={4.5} fill="#2563eb" />
                  <text x={C.x + 6} y={C.y + 8} className="tn-dinh">C</text>
                </>
              )}
            </>
          )}
        </svg>

        <div className="tn-hinh__so">
          {k.cheDo === 'goc-cung' && (
            <>
              <p className="tn-chuoi"><M t={`\\widehat{AOB} = ${n}^\\circ \\Rightarrow \\text{sđ}\\,\\overset{\\frown}{AB}_{\\text{nhỏ}} = ${Math.min(n, 360 - n)}^\\circ`} /></p>
              <p className="tn-chuoi"><M t={`\\text{sđ}\\,\\overset{\\frown}{AB}_{\\text{lớn}} = 360^\\circ - ${Math.min(n, 360 - n)}^\\circ = ${Math.max(n, 360 - n)}^\\circ`} /></p>
            </>
          )}
          {k.cheDo === 'cong-cung' && (
            <>
              <p className="tn-chuoi"><M t={`\\text{sđ}\\,\\overset{\\frown}{AC} = ${n}^\\circ + ${n2}^\\circ = ${n + n2}^\\circ`} /></p>
              <p className="tn-phu">Cung AC lớn hơn (n₁ + n₂ = {n + n2}°) thì dây căng cung lớn hơn (khi cung nhỏ ≤ 180°).</p>
            </>
          )}
          {k.cheDo === 'do-dai' && (
            <>
              <p className="tn-chuoi"><M t={`l = \\dfrac{\\pi R n}{180} = \\dfrac{\\pi \\cdot ${so(rThuc)} \\cdot ${n}}{180} \\approx ${so(l)}${sunWheel ? '\\text{ m}' : '\\text{ cm}'}`} /></p>
              <p className="tn-phu">Chu vi cả vòng quay: <M t={`C = 2\\pi R \\approx ${so(2 * Math.PI * rThuc)}${sunWheel ? '\\text{ m}' : '\\text{ cm}'}`} /></p>
            </>
          )}
          {k.cheDo === 'hinh-quat' && (
            <>
              <p className="tn-chuoi"><M t={`S = \\dfrac{\\pi R^2 n}{360} = \\dfrac{l \\cdot R}{2} \\approx ${so(sQuat)}\\text{ cm}^2`} /></p>
              <p className="tn-phu">Diện tích hình quạt bằng nửa tích độ dài cung $l$ nhân bán kính $R$.</p>
            </>
          )}
          {k.cheDo === 'vanh-khuyen' && (
            <>
              <p className="tn-chuoi"><M t={`S = \\pi(R^2 - r^2) = ${R * R - Math.min(rNho, R - 1) ** 2}\\pi \\approx ${so(sVanh)}\\text{ cm}^2`} /></p>
              <p className="tn-chu-loi">Cảnh giác lỗi hay nhầm: <M t={`\\pi(R-r)^2 = ${so(sNham)} \\ne ${so(sVanh)}`} /></p>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

/** 5. thang-tron: C5-B16-M1 (cắt/tiếp xúc/không giao), M2 (tiếp tuyến ⊥ bán kính), M3 (2 tiếp tuyến cắt nhau). */
export function ThangTron({ k, onThaoTac }: P & { k: Extract<Khung, { loai: 'thang-tron' }> }) {
  const [R, setR] = useState(4);
  const [d, setD] = useState(k.cheDo === 'vi-tri' ? 4 : 6);
  const [om, setOm] = useState(8);
  const keoRef = useRef(false);

  const cx = 135;
  const cy = 115;
  const px = 14;
  const rPx = R * px;

  // Chế độ 1: Vị trí tương đối đường thẳng a và đường tròn (O; R)
  if (k.cheDo === 'vi-tri') {
    const dPx = d * px;
    const ay = cy - dPx;
    const cat = d < R - 0.05;
    const tx = Math.abs(d - R) <= 0.05;
    const half = cat ? Math.sqrt(Math.max(0, rPx * rPx - dPx * dPx)) : 0;

    return (
      <div className="tn-khung">
        <div className="tn-hai-cot">
          <Truot nhan="Bán kính $R$" min={2} max={6} step={0.5} value={R} donVi=" cm" onChange={(v) => { setR(v); onThaoTac(); }} />
          <Truot nhan="Khoảng cách $d$ từ tâm $O$ đến $a$" min={0} max={8} step={0.5} value={d} donVi=" cm" onChange={(v) => { setD(v); onThaoTac(); }} />
        </div>
        <div className="tn-hinh__ve">
          <svg
            viewBox="0 0 320 230"
            className="tn-c5-svg"
            role="img"
            aria-label="Vị trí tương đối của đường thẳng và đường tròn"
            onPointerDown={(e) => { keoRef.current = true; e.currentTarget.setPointerCapture(e.pointerId); const pt = diemTrongSvg(e, 320, 230); setD(Math.max(0, Math.min(8, Math.round(((cy - pt.y) / px) * 2) / 2))); onThaoTac(); }}
            onPointerMove={(e) => { if (keoRef.current) { const pt = diemTrongSvg(e, 320, 230); setD(Math.max(0, Math.min(8, Math.round(((cy - pt.y) / px) * 2) / 2))); onThaoTac(); } }}
            onPointerUp={() => { keoRef.current = false; }}
          >
            <circle cx={cx + 25} cy={cy} r={rPx} fill="rgba(20, 184, 166, 0.1)" stroke="#0f766e" strokeWidth={2.5} />
            <line x1={30} y1={ay} x2={290} y2={ay} stroke="#2563eb" strokeWidth={3} style={{ cursor: 'ns-resize' }} />
            <text x={285} y={ay - 8} className="tn-dinh" fill="#2563eb">a</text>
            <line x1={cx + 25} y1={cy} x2={cx + 25} y2={ay} stroke="#ea580c" strokeWidth={2} strokeDasharray="4 3" />
            <circle cx={cx + 25} cy={cy} r={4} fill="#0f172a" />
            {cat && (
              <>
                <circle cx={cx + 25 - half} cy={ay} r={5} fill="#dc2626" />
                <circle cx={cx + 25 + half} cy={ay} r={5} fill="#dc2626" />
              </>
            )}
            {tx && <circle cx={cx + 25} cy={ay} r={5.5} fill="#16a34a" />}
          </svg>
          <div className="tn-hinh__so">
            <p className="tn-chuoi"><M t={`d = ${so(d)},\\quad R = ${so(R)}`} /></p>
            <p className={tx ? 'tn-kd tn-kd--dung' : 'tn-nhan-manh'}>
              {cat
                ? 'd < R ⇒ Đường thẳng CẮT đường tròn (2 điểm chung)'
                : tx
                  ? 'd = R ⇒ Đường thẳng TIẾP XÚC đường tròn (1 điểm chung)'
                  : 'd > R ⇒ Đường thẳng KHÔNG GIAO đường tròn (0 điểm chung)'}
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Chế độ 2 & 3: Tiếp tuyến / Hai tiếp tuyến cắt nhau
  const omHopLe = Math.max(R + 0.5, om);
  const omPx = omHopLe * px;
  const sinA = R / omHopLe;
  const cosA = Math.sqrt(Math.max(0, 1 - sinA * sinA));
  const ma = Math.sqrt(Math.max(0, omHopLe * omHopLe - R * R));
  const ox = 95;
  const mx = ox + omPx;
  // Tam giác vuông OAM có góc O = acos(R/OM)
  const ax = ox + (rPx * rPx) / omPx;
  const dy = rPx * cosA;
  const ay = cy - dy;
  const by = cy + dy;

  return (
    <div className="tn-khung">
      <div className="tn-hai-cot">
        <Truot nhan="Bán kính $R$" min={3} max={5} step={1} value={R} donVi=" cm" onChange={(v) => { setR(v); if (om <= v) setOm(v + 2); onThaoTac(); }} />
        <Truot nhan="Khoảng cách $OM$" min={R + 1} max={10} step={0.5} value={omHopLe} donVi=" cm" onChange={(v) => { setOm(v); onThaoTac(); }} />
      </div>
      <div className="tn-hinh__ve">
        <svg viewBox="0 0 320 230" className="tn-c5-svg" role="img" aria-label="Tiếp tuyến của đường tròn">
          <circle cx={ox} cy={cy} r={rPx} fill="rgba(20, 184, 166, 0.1)" stroke="#0f766e" strokeWidth={2.5} />
          <line x1={ox} y1={cy} x2={mx} y2={cy} stroke="#64748b" strokeWidth={1.5} strokeDasharray="4 3" />
          <line x1={ox} y1={cy} x2={ax} y2={ay} stroke="#0f766e" strokeWidth={2} />
          <line x1={mx} y1={cy} x2={ax} y2={ay} stroke="#2563eb" strokeWidth={2.5} />
          {k.cheDo === 'hai-tiep-tuyen' && (
            <>
              <line x1={ox} y1={cy} x2={ax} y2={by} stroke="#0f766e" strokeWidth={2} />
              <line x1={mx} y1={cy} x2={ax} y2={by} stroke="#ea580c" strokeWidth={2.5} />
              <line x1={ax} y1={ay} x2={ax} y2={by} stroke="#9333ea" strokeWidth={1.5} strokeDasharray="3 3" />
              <circle cx={ax} cy={by} r={4.5} fill="#ea580c" />
              <text x={ax - 12} y={by + 16} className="tn-dinh">B</text>
            </>
          )}
          <circle cx={ox} cy={cy} r={4} fill="#0f172a" />
          <text x={ox - 14} y={cy + 15} className="tn-dinh">O</text>
          <circle cx={ax} cy={ay} r={4.5} fill="#2563eb" />
          <text x={ax - 10} y={ay - 8} className="tn-dinh">A</text>
          <circle cx={mx} cy={cy} r={5} fill="#dc2626" />
          <text x={mx + 6} y={cy + 5} className="tn-dinh">M</text>
        </svg>
        <div className="tn-hinh__so">
          <p className="tn-chuoi"><M t={`MA = \\sqrt{OM^2 - R^2}`} /></p>
          <p className="tn-chuoi"><M t={`= \\sqrt{${so(omHopLe)}^2 - ${R}^2} \\approx ${so(ma)}\\text{ cm}`} /></p>
          {k.cheDo === 'tiep-tuyen' ? (
            <p className="tn-nhan-manh"><MathText inline>{'Tại tiếp điểm $A$, luôn có $OA \\perp MA$ ($\\widehat{OAM} = 90^\\circ$).'}</MathText></p>
          ) : (
            <p className="tn-nhan-manh">
              <MathText inline>{`$MA = MB \\approx ${so(ma)}\\text{ cm}$; $MO$ là phân giác $\\widehat{AMB}$; $OM \\perp AB$.`}</MathText>
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

/** 6. hai-tron: C5-B17-M1 (số điểm chung) & C5-B17-M2 (hệ thức d với R+r và R-r). */
export function HaiTron({ onThaoTac }: P & { k: Extract<Khung, { loai: 'hai-tron' }> }) {
  const [R, setR] = useState(5);
  const [r, setRNho] = useState(3);
  const [d, setD] = useState(6);
  const keoRef = useRef(false);

  const px = 13;
  const cx1 = 105;
  const cy = 115;
  const cx2 = cx1 + d * px;

  const tong = R + r;
  const hieu = Math.abs(R - r);
  let tenViTri = '';
  let soDiem = 0;

  if (d > tong + 0.05) {
    tenViTri = 'Hai đường tròn ở ngoài nhau (d > R + r)';
    soDiem = 0;
  } else if (Math.abs(d - tong) <= 0.05) {
    tenViTri = 'Tiếp xúc ngoài (d = R + r)';
    soDiem = 1;
  } else if (d > hieu + 0.05) {
    tenViTri = 'Hai đường tròn cắt nhau (R − r < d < R + r)';
    soDiem = 2;
  } else if (Math.abs(d - hieu) <= 0.05) {
    tenViTri = 'Tiếp xúc trong (d = R − r)';
    soDiem = 1;
  } else {
    tenViTri = '(O; R) đựng (O′; r) (d < R − r)';
    soDiem = 0;
  }

  // Tính toạ độ 2 giao điểm nếu cắt nhau
  let giaoPoints: { x: number; y: number }[] = [];
  if (soDiem === 2 && d > 0.05) {
    const xRel = (R * R - r * r + d * d) / (2 * d);
    const h = Math.sqrt(Math.max(0, R * R - xRel * xRel));
    giaoPoints = [
      { x: cx1 + xRel * px, y: cy - h * px },
      { x: cx1 + xRel * px, y: cy + h * px },
    ];
  } else if (soDiem === 1) {
    const xTiep = Math.abs(d - tong) <= 0.05 ? cx1 + R * px : cx1 + R * px;
    giaoPoints = [{ x: xTiep, y: cy }];
  }

  return (
    <div className="tn-khung">
      <div className="tn-hai-cot">
        <Truot nhan="$R$" min={3} max={6} step={1} value={R} donVi=" cm" onChange={(v) => { setR(v); if (r >= v) setRNho(v - 1); onThaoTac(); }} />
        <Truot nhan="$r$" min={1} max={Math.max(1, R - 1)} step={1} value={Math.min(r, R - 1)} donVi=" cm" onChange={(v) => { setRNho(v); onThaoTac(); }} />
        <Truot nhan="$d = OO'$" min={0} max={11} step={0.5} value={d} donVi=" cm" onChange={(v) => { setD(v); onThaoTac(); }} />
      </div>
      <div className="tn-hinh__ve">
        <svg
          viewBox="0 0 340 230"
          className="tn-c5-svg"
          role="img"
          aria-label={tenViTri}
          onPointerDown={(e) => { keoRef.current = true; e.currentTarget.setPointerCapture(e.pointerId); const pt = diemTrongSvg(e, 340, 230); setD(Math.max(0, Math.min(11, Math.round(((pt.x - cx1) / px) * 2) / 2))); onThaoTac(); }}
          onPointerMove={(e) => { if (keoRef.current) { const pt = diemTrongSvg(e, 340, 230); setD(Math.max(0, Math.min(11, Math.round(((pt.x - cx1) / px) * 2) / 2))); onThaoTac(); } }}
          onPointerUp={() => { keoRef.current = false; }}
        >
          <circle cx={cx1} cy={cy} r={R * px} fill="rgba(20, 184, 166, 0.1)" stroke="#0f766e" strokeWidth={2.5} />
          <circle cx={cx2} cy={cy} r={Math.min(r, R - 1) * px} fill="rgba(249, 115, 22, 0.14)" stroke="#ea580c" strokeWidth={2.5} style={{ cursor: 'ew-resize' }} />
          <line x1={cx1} y1={cy} x2={cx2} y2={cy} stroke="#64748b" strokeWidth={1.5} strokeDasharray="4 3" />
          <circle cx={cx1} cy={cy} r={4} fill="#0f766e" />
          <text x={cx1 - 12} y={cy + 16} className="tn-dinh">O</text>
          <circle cx={cx2} cy={cy} r={4} fill="#ea580c" />
          <text x={cx2 + 6} y={cy + 16} className="tn-dinh">O′</text>
          {giaoPoints.map((p, idx) => (
            <circle key={idx} cx={p.x} cy={p.y} r={5} fill="#dc2626" />
          ))}
        </svg>
        <div className="tn-hinh__so">
          <p className="tn-chuoi"><M t={`R - r = ${R - Math.min(r, R - 1)},\\quad d = ${so(d)},\\quad R + r = ${R + Math.min(r, R - 1)}`} /></p>
          <p className={soDiem === 1 ? 'tn-kd tn-kd--dung' : 'tn-nhan-manh'}>
            <b>{tenViTri}</b> — Số điểm chung: <b>{soDiem}</b>
          </p>
        </div>
      </div>
    </div>
  );
}
