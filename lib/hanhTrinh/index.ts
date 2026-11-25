/**
 * FILE NÀY LÀM GÌ: Mô-đun TypeScript/JavaScript hỗ trợ xử lý dữ liệu và nghiệp vụ trong hệ thống FlipMath 9.
 * AI DÙNG: dùng chung
 * LẤY DỮ LIỆU TỪ: không truy vấn bảng trực tiếp
 * GỌI TỚI: ../anhMinhHoa, ../dfle/t9-chuong1.js, ../dfle/t9-chuong2.js, ../dfle/t9-chuong3.js, ../dfle/t9-chuong4.js, ../dfle/t9-chuong5.js, ./chuong1, ./chuong2
 */
import { ANH_MINH_HOA } from '../anhMinhHoa';
import { QUESTIONS as Q1 } from '../dfle/t9-chuong1.js';
import { QUESTIONS as Q2 } from '../dfle/t9-chuong2.js';
import { QUESTIONS as Q3 } from '../dfle/t9-chuong3.js';
import { QUESTIONS as Q4 } from '../dfle/t9-chuong4.js';
import { QUESTIONS as Q5 } from '../dfle/t9-chuong5.js';
import { chuong1 } from './chuong1';
import { chuong2 } from './chuong2';
import { chuong3 } from './chuong3';
import { chuong4 } from './chuong4';
import { chuong5 } from './chuong5';
import { layBuocGiai } from './giai';
import type { DangBai } from './mau';

type NganHang = { id: string; stem: string; opts: Record<'A' | 'B' | 'C' | 'D', string> };
const cauHoi = new Map<string, NganHang>(
  [...Q1, ...Q2, ...Q3, ...Q4, ...Q5].map(q => [q.id, q as NganHang])
);
export const MAU: Record<string, DangBai> = { ...chuong1, ...chuong2, ...chuong3, ...chuong4, ...chuong5 };
export const DANH_SACH = Object.keys(ANH_MINH_HOA).filter(id => Object.hasOwn(MAU, id));

/**
 * Hàm `layHanhTrinh`: nhận (id), xử lý nghiệp vụ và trả kết quả tương ứng.
 */
export function layHanhTrinh(id: string) {
  const cau = cauHoi.get(id);
  const mau = Object.hasOwn(MAU, id) ? MAU[id] : undefined;
  if (!cau || !mau || !Object.hasOwn(ANH_MINH_HOA, id)) return null;
  const { ketQua, ...noiDung } = mau;
  return { ...noiDung, id, stem: cau.stem, phuongAn: Object.values(cau.opts),
    buocGiai: layBuocGiai(id, mau) };
}
export type HanhTrinhData = NonNullable<ReturnType<typeof layHanhTrinh>>;

