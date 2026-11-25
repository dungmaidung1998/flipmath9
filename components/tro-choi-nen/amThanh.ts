'use client';
/**
 * FILE NÀY LÀM GÌ: Component React giao diện hiển thị và xử lý tương tác của người dùng trên trình duyệt.
 * AI DÙNG: học sinh
 * LẤY DỮ LIỆU TỪ: không truy vấn bảng trực tiếp
 * GỌI TỚI: không gọi mô-đun nội bộ khác
 */
/**
 * ÂM THANH TRÒ CHƠI NỀN (23/11/2026) — tự tổng hợp bằng Web Audio, không cần tệp nhạc.
 * Nhạc nền: vòng 4 nhịp C – Am – F – G, 116 BPM, giai điệu ngũ cung + bass + trống nhẹ.
 * Chỉ bật sau khi em bấm nút (trình duyệt chặn tự phát). Lựa chọn bật/tắt lưu trên máy.
 */
type Ten = 'dung' | 'sai' | 'bam' | 'lat' | 've-dich' | 'keo';

let ctx: AudioContext | null = null;
let tong: GainNode | null = null, nhacG: GainNode | null = null, sfxG: GainNode | null = null;
let hen: ReturnType<typeof setInterval> | null = null;
let ke = 0, buoc = 0;
const nguoiNghe = new Set<() => void>();
/**
 * Hàm `theoDoiHieuUng(fn)`: xử lý dữ liệu đầu vào và trả kết quả.
 */
export function theoDoiHieuUng(fn: () => void) { nguoiNghe.add(fn); return () => { nguoiNghe.delete(fn); }; }
const NHIP = 60 / 116 / 2; // một móc đơn

const docBat = (k: string) => { try { return localStorage.getItem(k) !== '0'; } catch { return true; } };
const ghiBat = (k: string, v: boolean) => { try { localStorage.setItem(k, v ? '1' : '0'); } catch { /* bỏ qua */ } };
export const amThanh = { nhac: true, hieuUng: true };
if (typeof window !== 'undefined') { amThanh.nhac = docBat('f9-nhac'); amThanh.hieuUng = docBat('f9-hieu-ung'); }

/**
 * Hàm `moMay(không cần tham số)`: xử lý dữ liệu đầu vào và trả kết quả.
 */
function moMay() {
  if (typeof window === 'undefined') return null;
  try {
    if (!ctx) {
      ctx = new AudioContext();
      tong = ctx.createGain(); tong.gain.value = 0.9; tong.connect(ctx.destination);
      nhacG = ctx.createGain(); nhacG.gain.value = 0.55; nhacG.connect(tong);
      sfxG = ctx.createGain(); sfxG.gain.value = 0.9; sfxG.connect(tong);
    }
    if (ctx.state === 'suspended') void ctx.resume().catch(() => {});
    return ctx;
  } catch { return null; }
}
const hz = (n: number) => 440 * Math.pow(2, (n - 69) / 12); // n: số MIDI

/**
 * Hàm `not(dich, f, t, dai, am, kieu)`: xử lý dữ liệu đầu vào và trả kết quả.
 */
function not(dich: AudioNode, f: number, t: number, dai: number, am: number, kieu: OscillatorType = 'triangle') {
  const c = ctx!; const o = c.createOscillator(); const g = c.createGain();
  o.type = kieu; o.frequency.setValueAtTime(f, t);
  g.gain.setValueAtTime(0.0001, t); g.gain.linearRampToValueAtTime(am, t + 0.012); g.gain.exponentialRampToValueAtTime(0.0001, t + dai);
  o.connect(g); g.connect(dich); o.start(t); o.stop(t + dai + 0.05);
  o.onended = () => { o.disconnect(); g.disconnect(); };
}
/**
 * Hàm `trongCai(t)`: xử lý dữ liệu đầu vào và trả kết quả.
 */
function trongCai(t: number) {
  const c = ctx!; const o = c.createOscillator(); const g = c.createGain();
  o.type = 'sine'; o.frequency.setValueAtTime(140, t); o.frequency.exponentialRampToValueAtTime(45, t + 0.18);
  g.gain.setValueAtTime(0.5, t); g.gain.exponentialRampToValueAtTime(0.0001, t + 0.22);
  o.connect(g); g.connect(nhacG!); o.start(t); o.stop(t + 0.25);
}
let nhieu: AudioBuffer | null = null;
/**
 * Hàm `tiengSuot(t, dai, am, loc)`: xử lý dữ liệu đầu vào và trả kết quả.
 */
function tiengSuot(t: number, dai: number, am: number, loc: number) {
  const c = ctx!;
  if (!nhieu) { nhieu = c.createBuffer(1, c.sampleRate * 0.3, c.sampleRate); const d = nhieu.getChannelData(0); for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1; }
  const s = c.createBufferSource(); s.buffer = nhieu; const f = c.createBiquadFilter(); f.type = 'highpass'; f.frequency.value = loc;
  const g = c.createGain(); g.gain.setValueAtTime(am, t); g.gain.exponentialRampToValueAtTime(0.0001, t + dai);
  s.connect(f); f.connect(g); g.connect(nhacG!); s.start(t); s.stop(t + dai + 0.02);
}

// 4 ô nhịp × 8 móc đơn. Hợp âm C – Am – F – G (bass), giai điệu ngũ cung C D E G A.
const BASS = [48, 45, 41, 43];
const GIAI_DIEU = [
  72, 0, 76, 79, 76, 0, 74, 72,
  69, 0, 72, 76, 74, 72, 69, 0,
  65, 69, 72, 0, 74, 72, 69, 72,
  67, 0, 71, 74, 79, 77, 74, 71
];
/**
 * Hàm `lenLich(t, b)`: xử lý dữ liệu đầu vào và trả kết quả.
 */
function lenLich(t: number, b: number) {
  // Tính toán, làm tròn hoặc giới hạn giá trị theo công thức
  const o = Math.floor(b / 8) % 4, k = b % 8;
  // Tính toán, làm tròn hoặc giới hạn giá trị theo công thức
  const m = GIAI_DIEU[(Math.floor(b / 8) % 4) * 8 + k];
  if (m) not(nhacG!, hz(m), t, NHIP * 0.9, 0.07, 'square');
  if (k % 2 === 0) not(nhacG!, hz(BASS[o]), t, NHIP * 1.6, 0.16, 'triangle');
  if (k === 0 || k === 4) trongCai(t);
  if (k === 2 || k === 6) tiengSuot(t, 0.12, 0.12, 1800);
  tiengSuot(t, 0.035, 0.035, 7000);
}
/**
 * Hàm `batNhac(không cần tham số)`: xử lý dữ liệu đầu vào và trả kết quả.
 */
export function batNhac() {
  if (!amThanh.nhac || hen) return;
  const c = moMay(); if (!c) return;
  ke = c.currentTime + 0.08; buoc = 0;
  hen = setInterval(() => {
    if (!ctx) return;
    while (ke < ctx.currentTime + 0.15) { lenLich(ke, buoc++); ke += NHIP; }
  }, 30);
}
/**
 * Hàm `tatNhac(không cần tham số)`: xử lý dữ liệu đầu vào và trả kết quả.
 */
export function tatNhac() { if (hen) clearInterval(hen); hen = null; }
/**
 * Hàm `datNhac(v)`: xử lý dữ liệu đầu vào và trả kết quả.
 */
export function datNhac(v: boolean) { amThanh.nhac = v; ghiBat('f9-nhac', v); if (v) batNhac(); else tatNhac(); }
/**
 * Hàm `datHieuUng(v)`: xử lý dữ liệu đầu vào và trả kết quả.
 */
export function datHieuUng(v: boolean) {
  amThanh.hieuUng = v;
  ghiBat('f9-hieu-ung', v);
  nguoiNghe.forEach(fn => fn());
}
/**
 * Hàm `chuanBiAmHieuUng(không cần tham số)`: xử lý dữ liệu đầu vào và trả kết quả.
 */
export function chuanBiAmHieuUng() {
  if (amThanh.hieuUng) moMay();
}

/** Hiệu ứng: chuoi = số câu đúng liên tiếp (càng dài tiếng "ting" càng cao). */
export function phat(ten: Ten, chuoi = 0) {
  if (!amThanh.hieuUng) return;
  const c = moMay(); if (!c || !sfxG) return;
  const t = c.currentTime + 0.01;
  if (ten === 'dung') {
    // Tính toán, làm tròn hoặc giới hạn giá trị theo công thức
    const heSo = 2 ** (Math.min(chuoi, 6) / 24);
    not(sfxG, 1568 * heSo, t, .58, .14, 'sine');
    not(sfxG, 2349 * heSo, t + .06, .45, .085, 'sine');
  }
  if (ten === 'sai') { const o = c.createOscillator(), g = c.createGain(); o.type = 'sawtooth'; o.frequency.setValueAtTime(220, t); o.frequency.exponentialRampToValueAtTime(90, t + 0.32); g.gain.setValueAtTime(0.12, t); g.gain.exponentialRampToValueAtTime(0.0001, t + 0.36); o.connect(g); g.connect(sfxG); o.start(t); o.stop(t + 0.4); }
  if (ten === 'keo') not(sfxG, hz(83), t, 0.05, 0.035, 'triangle');
  if (ten === 'bam') not(sfxG, hz(88), t, 0.06, 0.08, 'square');
  if (ten === 'lat') { not(sfxG, hz(79), t, 0.05, 0.07, 'triangle'); not(sfxG, hz(86), t + 0.04, 0.06, 0.06, 'triangle'); }
  if (ten === 've-dich') { const nhac = [72, 76, 79, 72, 76, 79, 84, 84]; const nh = [0, .12, .24, .42, .54, .66, .84, 1.0]; nhac.forEach((n, i) => not(sfxG!, hz(n), t + nh[i], i === 7 ? 0.7 : 0.16, 0.15, 'square')); [60, 64, 67].forEach((n) => not(sfxG!, hz(n), t + 0.84, 0.9, 0.08, 'triangle')); }
}
