/**
 * FILE NÀY LÀM GÌ: Mô-đun TypeScript/JavaScript hỗ trợ xử lý dữ liệu và nghiệp vụ trong hệ thống FlipMath 9.
 * AI DÙNG: dùng chung
 * LẤY DỮ LIỆU TỪ: không truy vấn bảng trực tiếp
 * GỌI TỚI: @/lib/dfle/bkt.js, @/lib/dfle/mastery.js, @/lib/dfle/phan-tich-cau-hoi.js, @/lib/phanTichDuLieu
 */
import type { SupabaseClient } from '@supabase/supabase-js';
import { soSanhVoiMasteryV2, chayChuoi, uocLuongThamSo, BKT_MAC_DINH, NGUONG_DA_NAM } from '@/lib/dfle/bkt.js';
import { computeMasteryV2 } from '@/lib/dfle/mastery.js';
import { phanTichCauHoi } from '@/lib/dfle/phan-tich-cau-hoi.js';
import { taiDuLieuPhanTich, theoHocSinhDonVi } from '@/lib/phanTichDuLieu';

/**
 * Tính toàn bộ số liệu cho trang /gv/phan-tich và tệp CSV — một chỗ, để trang
 * và tệp tải về không bao giờ lệch nhau.
 */
export async function tinhPhanTich(dbUser: SupabaseClient, chonLop?: string | null) {
  const d = await taiDuLieuPhanTich(dbUser, chonLop);
  const duLieu = theoHocSinhDonVi(d.traLoi);

  const coDuLieu = d.traLoi.length > 0;
  const soSanh = coDuLieu ? soSanhVoiMasteryV2(duLieu, { uocLuong: true }) : null;
  const soSanhMacDinh = coDuLieu ? soSanhVoiMasteryV2(duLieu, { uocLuong: false }) : null;

  // Tham số dùng cho bảng trạng thái: ước lượng trên TOÀN BỘ dữ liệu. (Phần so
  // sánh độ chính xác ở trên thì ước lượng trên một nửa, đo trên nửa kia.)
  const tatCaChuoi = [...duLieu.values()].flatMap((m) => [...m.values()]);
  const uocLuong = coDuLieu ? uocLuongThamSo(tatCaChuoi) : null;
  const thamSo = uocLuong?.thamSo ?? BKT_MAC_DINH;

  // trạng thái cuối từng (học sinh, đơn vị)
  const trangThai: {
    studentId: string; kuId: string; soCau: number; pNam: number; bktDaNam: boolean;
    masteryV2: number | null; tiLeDungV2: number | null;
  }[] = [];
  for (const [hs, m] of duLieu) for (const [ku, qs] of m) {
    const b = chayChuoi(qs, thamSo);
    const v = computeMasteryV2(qs);
    trangThai.push({
      studentId: hs, kuId: ku, soCau: b.soCau, pNam: Math.round(b.pL * 1000) / 1000,
      bktDaNam: b.daNam, masteryV2: v.level, tiLeDungV2: v.index
    });
  }
  trangThai.sort((a, b) => a.studentId.localeCompare(b.studentId) || a.kuId.localeCompare(b.kuId));

  // tóm tắt theo đơn vị
  const theoDonVi = [...d.tenDonVi.keys()].map((ku) => {
    const ds = trangThai.filter((t) => t.kuId === ku && t.soCau > 0);
    const dem = (f: (t: typeof ds[number]) => boolean) => ds.filter(f).length;
    return {
      kuId: ku, ten: d.tenDonVi.get(ku) ?? ku, soCap: ds.length,
      bktDaNam: dem((t) => t.bktDaNam),
      v2: { chuaDu: dem((t) => t.masteryV2 === null), m0: dem((t) => t.masteryV2 === 0),
            m1: dem((t) => t.masteryV2 === 1), m2: dem((t) => t.masteryV2 === 2), m3: dem((t) => t.masteryV2 === 3) }
    };
  });

  const cauHoi = phanTichCauHoi(d.traLoi, d.nganHang);

  // Thuật toán 1: Ước lượng mô hình Rasch 1PL (Item Response Theory)
  // @ts-ignore
  const { estimateRasch } = await import('@/lib/dfle/irt.js');
  const raschResult = coDuLieu
    ? estimateRasch(
        d.traLoi.map((t: any) => ({
          studentId: t.studentId,
          itemId: t.questionId,
          isCorrect: Boolean(t.isCorrect)
        }))
      )
    : null;

  return {
    lop: d.lop, soHocSinh: d.soHocSinh, soTraLoi: d.traLoi.length, coDuLieu,
    soSanh, soSanhMacDinh, thamSo, thamSoLaUocLuong: !!uocLuong, nguongDaNam: NGUONG_DA_NAM,
    trangThai, theoDonVi, cauHoi, tenDonVi: d.tenDonVi,
    rasch: raschResult
  };
}
