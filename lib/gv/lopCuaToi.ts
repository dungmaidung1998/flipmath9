/**
 * FILE NÀY LÀM GÌ: Mô-đun TypeScript/JavaScript hỗ trợ xử lý dữ liệu và nghiệp vụ trong hệ thống FlipMath 9.
 * AI DÙNG: giáo viên
 * LẤY DỮ LIỆU TỪ: classes
 * GỌI TỚI: không gọi mô-đun nội bộ khác
 */
import type { SupabaseClient } from '@supabase/supabase-js';

/**
 * PHÂN CẤP TRƯỜNG → GIÁO VIÊN → LỚP → HỌC SINH (file SQL 51)
 * Không import next/headers để dùng an toàn ở cả Server Component, API route và Client Component.
 */

export type VaiTro =
  | 'hoc-sinh'
  | 'hoc-sinh-nckh'
  | 'giao-vien'
  | 'quan-tri-truong'
  | 'quan-tri-he-thong';

export type LopCuaToi = {
  class_id: string;
  class_code: string;
  ten_lop: string;
  grade: number | null;
  arm: string | null;
  school_id: string | null;
  ten_truong: string | null;
  vai_tro: string | null;
};

export type ThongKeLop = {
  class_id: string;
  ten_lop: string;
  so_hs: number;
  hs_hoat_dong: number;
  ti_le_lam_chu: number | null;
  muc_tb: number | null;
  loi_dang_mo: number;
  loi_da_nho: number;
  phut_hoc: number;
};

export const COOKIE_LOP = 'f9_lop';

/**
 * Hàm `laVaiTroGV`: nhận (role), xử lý nghiệp vụ và trả kết quả tương ứng.
 */
export function laVaiTroGV(role?: string | null): boolean {
  return role === 'giao-vien' || role === 'quan-tri-truong' || role === 'quan-tri-he-thong';
}

/**
 * Hàm `laQuanTri`: nhận (role), xử lý nghiệp vụ và trả kết quả tương ứng.
 */
export function laQuanTri(role?: string | null): boolean {
  return role === 'quan-tri-truong' || role === 'quan-tri-he-thong';
}

/**
 * Hàm `tenHienThiLop`: nhận (l), xử lý nghiệp vụ và trả kết quả tương ứng.
 */
export function tenHienThiLop(
  l: Partial<LopCuaToi> & { class_id: string; class_code?: string | null }
): string {
  return l.ten_lop || l.class_code || l.class_id;
}

/**
 * Hàm `nhanTruongLop`: nhận (l), xử lý nghiệp vụ và trả kết quả tương ứng.
 */
export function nhanTruongLop(l: LopCuaToi): string {
  const ten = tenHienThiLop(l);
  return l.ten_truong ? `${l.ten_truong} › ${ten}` : ten;
}

/**
 * Danh sách lớp người đang đăng nhập được phép xem (qua RPC lop_cua_toi của file 51).
 * Nếu DB chưa chạy file 51 thì fallback về classes.teacher_id để web không vỡ.
 */
export async function lopCuaToi(db: SupabaseClient): Promise<LopCuaToi[]> {
  try {
    const { data, error } = await db.rpc('lop_cua_toi');
    if (!error && Array.isArray(data)) {
      return data.map((r: any) => ({
        class_id: String(r.class_id),
        class_code: String(r.class_code ?? r.ten_lop ?? r.class_id),
        ten_lop: String(r.ten_lop || r.class_code || r.class_id),
        grade: r.grade == null ? null : Number(r.grade),
        arm: r.arm ?? null,
        school_id: r.school_id ?? null,
        ten_truong: r.ten_truong ?? r.school_id ?? null,
        vai_tro: r.vai_tro ?? null
      }));
    }
  } catch {
    // fallback xuống truy vấn cũ nếu RPC chưa tồn tại
  }

  // Kiểm tra xác thực tài khoản, vai trò giáo viên hoặc điều kiện đồng ý
  const { data: { user } } = await db.auth.getUser();
  if (!user) return [];
  const { data: rows } = await db
    .from('classes')
    .select('class_id, class_code, grade, arm')
    .eq('teacher_id', user.id)
    .order('class_id');

  return (rows ?? []).map((r: any) => ({
    class_id: String(r.class_id),
    class_code: String(r.class_code ?? r.class_id),
    ten_lop: String(r.class_code ?? r.class_id),
    grade: r.grade == null ? null : Number(r.grade),
    arm: r.arm ?? null,
    school_id: null,
    ten_truong: null,
    vai_tro: 'bo-mon'
  }));
}

/**
 * Hàm `kiemTraQuyenLop`: nhận (db, classId), xử lý nghiệp vụ và trả kết quả tương ứng.
 */
export async function kiemTraQuyenLop(
  db: SupabaseClient,
  classId: string
): Promise<LopCuaToi | null> {
  if (!classId) return null;
  const ds = await lopCuaToi(db);
  return ds.find((l) => l.class_id === classId) ?? null;
}

/**
 * Hàm `chonLopTu`: nhận (lops, qLop, cookieLop, choTatCa), xử lý nghiệp vụ và trả kết quả tương ứng.
 */
export function chonLopTu(
  lops: LopCuaToi[],
  qLop?: string | null,
  cookieLop?: string | null,
  choTatCa = false
) {
  const chon = (qLop ?? '').trim();
  const luu = (cookieLop ?? '').trim();
  if (
    choTatCa &&
    lops.length > 0 &&
    (chon === 'tat-ca' || (!chon && luu === 'tat-ca'))
  ) {
    return {
      tatCa: true,
      lop: null as LopCuaToi | null,
      classIds: lops.map((l) => l.class_id),
      dang: 'tat-ca'
    };
  }
  const lop =
    (chon ? lops.find((l) => l.class_id === chon) : undefined) ??
    (luu ? lops.find((l) => l.class_id === luu) : undefined) ??
    lops[0] ??
    null;
  return {
    tatCa: false,
    lop,
    classIds: lop ? [lop.class_id] : [],
    dang: lop?.class_id ?? ''
  };
}
