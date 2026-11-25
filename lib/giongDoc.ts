/**
 * FILE NÀY LÀM GÌ: Mô-đun TypeScript/JavaScript hỗ trợ xử lý dữ liệu và nghiệp vụ trong hệ thống FlipMath 9.
 * AI DÙNG: dùng chung
 * LẤY DỮ LIỆU TỪ: không truy vấn bảng trực tiếp
 * GỌI TỚI: không gọi mô-đun nội bộ khác
 */
/**
 * Đọc to bằng giọng có sẵn của trình duyệt (Web Speech API). Không gửi chữ đi đâu.
 * lang: 'vi-VN' hoặc 'en-US' / 'en-GB'. Trả về false nếu trình duyệt không hỗ trợ.
 */
export function coGiongDoc(): boolean {
  return typeof window !== 'undefined' && 'speechSynthesis' in window;
}

/**
 * Hàm `chonGiong`: nhận (lang), xử lý nghiệp vụ và trả kết quả tương ứng.
 */
export function chonGiong(lang: string): SpeechSynthesisVoice | null {
  if (!coGiongDoc()) return null;
  const ds = window.speechSynthesis.getVoices();
  const goc = lang.slice(0, 2).toLowerCase();
  const hop = ds.filter((v) => v.lang.toLowerCase().replace('_', '-').startsWith(goc));
  // Biểu thức chính quy (regex) kiểm tra hoặc tách chuỗi đúng mẫu dữ liệu
  return hop.find((v) => v.lang.replace('_', '-') === lang && /google|natural|online|samantha|daniel/i.test(v.name))
    ?? hop.find((v) => v.lang.replace('_', '-') === lang) ?? hop[0] ?? null;
}

/** Tốc độ đọc dùng chung cho mọi nút đọc (SPEC M7.2: 0,75× · 1× · 1,25×). Lưu trên máy em. */
export const TOC_DO = [0.75, 1, 1.25] as const;
const KHOA_TOC_DO = 'f9-toc-do-doc';
/**
 * Hàm `layTocDo`: nhận (không tham số), xử lý nghiệp vụ và trả kết quả tương ứng.
 */
export function layTocDo(): number {
  try { const v = Number(localStorage.getItem(KHOA_TOC_DO)); if ((TOC_DO as readonly number[]).includes(v)) return v; } catch { /* bỏ qua */ }
  return 1;
}
/**
 * Hàm `datTocDo`: nhận (v), xử lý nghiệp vụ và trả kết quả tương ứng.
 */
export function datTocDo(v: number) {
  try { localStorage.setItem(KHOA_TOC_DO, String(v)); } catch { /* bỏ qua */ }
  window.dispatchEvent(new CustomEvent('f9-toc-do', { detail: v }));
}

/**
 * Hàm `noi`: nhận (text, lang, opts), xử lý nghiệp vụ và trả kết quả tương ứng.
 */
export function noi(text: string, lang: string, opts: { rate?: number; onEnd?: () => void } = {}): boolean {
  if (!coGiongDoc()) return false;
  const ss = window.speechSynthesis;
  ss.cancel();
  const u = new SpeechSynthesisUtterance(text);
  u.lang = lang;
  u.rate = (opts.rate ?? 0.9) * layTocDo();
  const g = chonGiong(lang);
  try { if (g) u.voice = g; } catch { /* giọng không hợp lệ thì dùng mặc định */ }
  u.onend = () => opts.onEnd?.();
  u.onerror = () => opts.onEnd?.();
  ss.speak(u);
  return !!g;
}

/**
 * Hàm `ngungDoc`: nhận (không tham số), xử lý nghiệp vụ và trả kết quả tương ứng.
 */
export function ngungDoc() {
  if (coGiongDoc()) window.speechSynthesis.cancel();
}

/** Ghi sự kiện học tập (không chặn giao diện nếu lỗi). */
export function ghiSuKien(kuId: string, type: string, payload: Record<string, unknown>) {
  try {
    void fetch('/api/events', {
      method: 'POST', headers: { 'content-type': 'application/json' }, keepalive: true,
      body: JSON.stringify({ events: [{ type, kuId, payload }] })
    }).catch(() => {});
  } catch { /* bỏ qua */ }
}
