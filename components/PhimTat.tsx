'use client';

/**
 * FILE NÀY LÀM GÌ: Component React giao diện hiển thị và xử lý tương tác của người dùng trên trình duyệt.
 * AI DÙNG: học sinh
 * LẤY DỮ LIỆU TỪ: không truy vấn bảng trực tiếp
 * GỌI TỚI: @/lib/giongDoc, @/lib/docThanhLoi, ./TroNang
 */
import { useEffect } from 'react';
import { coGiongDoc, layTocDo, datTocDo, TOC_DO, noi } from '@/lib/giongDoc';
import { docThanhLoi } from '@/lib/docThanhLoi';
import { layChuDeDoc } from './TroNang';

/**
 * PHÍM TẮT KHI LÀM BÀI (SPEC M8.3), dùng chung cho mọi màn làm bài:
 *   R đọc lại đề · Alt+R đọc cả trang · 1–4 chọn phương án · Enter / N câu tiếp hoặc nộp
 *   H mở gợi ý · [ ] giảm / tăng tốc độ đọc · Esc dừng đọc
 * Không bắt phím khi em đang gõ trong ô chữ. Phương án được tìm theo thứ tự trên màn hình đang mở.
 */
const PHUONG_AN = '.opt input[type="radio"], .ot-pa__nut, .ta-nghe__pa button, .phieu-lua-chon input';

/**
 * Component React `vung`: nhận props (thuộc tính truyền vào từ component cha) và dựng giao diện tương ứng.
 */
function vung(): ParentNode {
  return document.querySelector('.learning-screen') ?? document.querySelector('.ot-khung') ?? document.querySelector('.ta-nghe') ?? document;
}
/**
 * Component React `thongBao`: nhận props (thuộc tính truyền vào từ component cha) và dựng giao diện tương ứng.
 */
function thongBao(chu: string) {
  let el = document.getElementById('phim-tat-bao');
  if (!el) {
    el = document.createElement('div');
    el.id = 'phim-tat-bao'; el.className = 'phim-tat-bao'; el.setAttribute('role', 'status'); el.setAttribute('aria-live', 'polite');
    document.body.appendChild(el);
  }
  el.textContent = chu; el.classList.add('hien');
  window.clearTimeout((el as any)._t);
  (el as any)._t = window.setTimeout(() => el!.classList.remove('hien'), 1500);
}

/**
 * Component React `PhimTat`: nhận props (thuộc tính truyền vào từ component cha) và dựng giao diện tương ứng.
 */
export default function PhimTat() {
  useEffect(() => {
    const bam = (e: KeyboardEvent) => {
      const t = e.target as HTMLElement | null;
      const dangGo = !!t && (t.tagName === 'TEXTAREA' || t.tagName === 'SELECT' || t.isContentEditable
        || (t.tagName === 'INPUT' && !['radio', 'checkbox', 'button'].includes((t as HTMLInputElement).type)));
      if (e.key === 'Escape') {
        if (coGiongDoc()) window.speechSynthesis.cancel();
        window.dispatchEvent(new Event('f9-ngung-doc'));
        return;
      }
      if (dangGo || e.ctrlKey || e.metaKey) return;
      const v = vung();
      const k = e.key.toLowerCase();
      if (e.altKey) {
        if (k === 'r' || e.code === 'KeyR') { e.preventDefault(); window.dispatchEvent(new Event('f9-doc-trang')); }
        return;
      }
      if (k === 'r') {
        const nut = v.querySelector<HTMLButtonElement>('[data-phim-doc]');
        if (nut) { e.preventDefault(); nut.click(); }
      } else if (['1', '2', '3', '4'].includes(k)) {
        const ds = Array.from(v.querySelectorAll<HTMLElement>(PHUONG_AN)).filter((x) => x.getClientRects().length);
        const x = ds[Number(k) - 1];
        if (x && !(x as HTMLButtonElement).disabled) { e.preventDefault(); x.click(); x.focus(); thongBao(`Đã chọn phương án ${'ABCD'[Number(k) - 1]}`); }
      } else if (k === 'enter' || k === 'n') {
        // Trên nút bấm thì Enter giữ nguyên tác dụng của nút đó.
        if (k === 'enter' && t && (t.tagName === 'BUTTON' || t.tagName === 'A' || t.tagName === 'SUMMARY')) return;
        const tiep = document.querySelector<HTMLButtonElement>('.learning-screen footer button.primary');
        if (tiep && !tiep.disabled) { e.preventDefault(); tiep.click(); }
      } else if (k === 'h') {
        // Biểu thức chính quy (regex) kiểm tra hoặc tách chuỗi đúng mẫu dữ liệu
        const goiY = Array.from(v.querySelectorAll<HTMLButtonElement>('button')).find((b) => /gợi ý/i.test(b.textContent ?? '') && !b.disabled);
        if (goiY) { e.preventDefault(); goiY.click(); }
      } else if (k === '[' || k === ']') {
        const i = TOC_DO.indexOf(layTocDo() as (typeof TOC_DO)[number]);
        // Tính toán, làm tròn hoặc giới hạn giá trị theo công thức
        const moi = TOC_DO[Math.max(0, Math.min(TOC_DO.length - 1, i + (k === ']' ? 1 : -1)))];
        datTocDo(moi); thongBao(`Tốc độ đọc ${String(moi).replace('.', ',')}×`);
      }
    };
    // Chế độ đọc (bật trong Trợ năng): em di chuyển tới phương án nào thì đọc phương án đó.
    const toi = (e: FocusEvent) => {
      let bat = false;
      try { bat = localStorage.getItem('f9-doc-khi-chon') === '1'; } catch { /* bỏ qua */ }
      if (!bat || !coGiongDoc()) return;
      const el = (e.target as HTMLElement | null)?.closest('.opt, .ot-pa__nut, .ta-nghe__pa button, .phieu-danh');
      if (el) noi(docThanhLoi(layChuDeDoc(el)), 'vi-VN');
    };
    window.addEventListener('keydown', bam);
    window.addEventListener('focusin', toi);
    return () => { window.removeEventListener('keydown', bam); window.removeEventListener('focusin', toi); };
  }, []);
  return null;
}
