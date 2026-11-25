/**
 * FILE NÀY LÀM GÌ: Mô-đun TypeScript/JavaScript hỗ trợ xử lý dữ liệu và nghiệp vụ trong hệ thống FlipMath 9.
 * AI DÙNG: dùng chung
 * LẤY DỮ LIỆU TỪ: learning_events
 * GỌI TỚI: ./dfle/t9-ky-nang-nen.js
 */
import type { SupabaseClient } from '@supabase/supabase-js';
import { KY_NANG_NEN, KY_NANG_THEO_MUC, mucNamVung } from './dfle/t9-ky-nang-nen.js';

/**
 * HỒ SƠ KIẾN THỨC NỀN (SPEC M13): mức nắm vững từng kỹ năng nền của từng học sinh,
 * tính từ các lượt trò chơi ôn nền đã chơi (sự kiện game_finish: số câu đúng / tổng số câu).
 * Mỗi mục Toán 9 gắn một kỹ năng nền, nên lượt chơi ở nhiều mục khác nhau cộng dồn về cùng kỹ năng.
 */
export type MucNen = 'vung' | 'chua-chac' | 'hong' | 'chua-du';
export type NamVung = { muc: MucNen; tiLe: number | null; soCau: number; xuHuong: 1 | 0 | -1 };

export const TEN_MUC_NEN: Record<MucNen, { ten: string; bieuTuong: string; mau: string; nen: string }> = {
  vung: { ten: 'Vững', bieuTuong: '🟢', mau: '#1e7a4b', nen: '#e3f6ea' },
  'chua-chac': { ten: 'Chưa chắc', bieuTuong: '🟡', mau: '#8a6100', nen: '#fff4d6' },
  hong: { ten: 'Hổng', bieuTuong: '🔴', mau: '#b3261e', nen: '#fde7e5' },
  'chua-du': { ten: 'Chưa đủ dữ liệu', bieuTuong: '⚪', mau: '#5b6478', nen: '#eef1f7' }
};

export const DS_KY_NANG = Object.entries(KY_NANG_NEN as Record<string, { ten: string; lop: number; congThuc: string; viDu: string; muc: string[] }>)
  .map(([ma, k]) => ({ ma, ...k }));
export const kyNangCuaMuc = (ku: string): string | undefined => (KY_NANG_THEO_MUC as Record<string, string>)[ku];

/** Kỹ năng nền của các mục thuộc một chương (theo thứ tự xuất hiện). */
export function kyNangCuaChuong(chuong: string): string[] {
  const ra: string[] = [];
  for (const k of DS_KY_NANG) if (k.muc.some((m) => m.split('-')[0] === chuong) && !ra.includes(k.ma)) ra.push(k.ma);
  return ra;
}

/** Tải lượt trò chơi nền của các học sinh và tính mức nắm vững từng kỹ năng. */
export async function taiHoSoNen(db: SupabaseClient, ids: string[]): Promise<Map<string, Map<string, NamVung>>> {
  const ev: { student_id: string; ku_id: string; ts: string; payload: any }[] = [];
  for (let i = 0; i < ids.length; i += 60) {
    const lo = ids.slice(i, i + 60);
    for (let tu = 0; tu < 50000; tu += 1000) {
      // Truy vấn Supabase: đọc dữ liệu từ bảng learning_events
      const { data, error } = await db.from('learning_events').select('student_id, ku_id, ts, payload')
        .in('student_id', lo).eq('event_type', 'game_finish').order('event_id').range(tu, tu + 999);
      if (error) throw new Error('Không đọc được lượt trò chơi nền.');
      ev.push(...(data ?? []));
      if (!data || data.length < 1000) break;
    }
  }
  const nhom = new Map<string, Map<string, { dung: number; tong: number; ts: string }[]>>();
  for (const e of ev) {
    const ma = kyNangCuaMuc(e.ku_id);
    const tong = Number(e.payload?.tong), dung = Number(e.payload?.dung);
    if (!ma || !(tong > 0) || !(dung >= 0)) continue;
    const hs = nhom.get(e.student_id) ?? nhom.set(e.student_id, new Map()).get(e.student_id)!;
    // Tính toán, làm tròn hoặc giới hạn giá trị theo công thức
    (hs.get(ma) ?? hs.set(ma, []).get(ma)!).push({ dung: Math.min(dung, tong), tong, ts: e.ts });
  }
  const kq = new Map<string, Map<string, NamVung>>();
  for (const id of ids) {
    const m = new Map<string, NamVung>();
    for (const [ma, ds] of nhom.get(id) ?? []) m.set(ma, mucNamVung(ds.sort((a, b) => b.ts.localeCompare(a.ts))) as NamVung);
    kq.set(id, m);
  }
  return kq;
}

export const KHONG_DU: NamVung = { muc: 'chua-du', tiLe: null, soCau: 0, xuHuong: 0 };
