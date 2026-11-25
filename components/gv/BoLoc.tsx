/**
 * FILE NÀY LÀM GÌ: Component React phía trình duyệt phục vụ bảng điều khiển, biểu đồ và biểu mẫu thao tác cho giáo viên.
 * AI DÙNG: giáo viên
 * LẤY DỮ LIỆU TỪ: profiles
 * GỌI TỚI: @/lib/supabase/server, @/lib/chapters, @/lib/gv/manChinh, @/lib/gv/lopCuaToi
 */
import { supabaseServer } from '@/lib/supabase/server';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { CHAPTERS } from '@/lib/chapters';
import type { Bai } from '@/lib/gv/manChinh';
import {
  COOKIE_LOP,
  laQuanTri,
  laVaiTroGV,
  nhanTruongLop,
  type LopCuaToi,
  type VaiTro
} from '@/lib/gv/lopCuaToi';

/** Đọc lớp đang chọn từ cookie (dùng chung giữa các trang giáo viên). */
export function docCookieLop(): string | null {
  try {
    return cookies().get(COOKIE_LOP)?.value ?? null;
  } catch {
    return null;
  }
}

/** Đăng nhập và đúng vai trò giáo viên / quản trị, không thì chuyển trang. */
export async function batBuocGiaoVien() {
  const db = supabaseServer();
  // Kiểm tra xác thực tài khoản, vai trò giáo viên hoặc điều kiện đồng ý
  const { data: { user } } = await db.auth.getUser();
  if (!user) redirect('/dang-nhap');
  const { data: p } = await db
    .from('profiles')
    .select('role, school_id')
    .eq('id', user.id)
    .maybeSingle();
  // Kiểm tra xác thực tài khoản, vai trò giáo viên hoặc điều kiện đồng ý
  if (!laVaiTroGV(p?.role)) redirect('/');
  return {
    db,
    user,
    role: p!.role as VaiTro,
    schoolId: (p?.school_id ?? null) as string | null
  };
}

/** Đăng nhập và đúng vai trò quản trị trường / quản trị hệ thống. */
export async function batBuocQuanTri() {
  const db = supabaseServer();
  // Kiểm tra xác thực tài khoản, vai trò giáo viên hoặc điều kiện đồng ý
  const { data: { user } } = await db.auth.getUser();
  if (!user) redirect('/dang-nhap');
  const { data: p } = await db
    .from('profiles')
    .select('role, school_id')
    .eq('id', user.id)
    .maybeSingle();
  if (!laQuanTri(p?.role)) {
    // Kiểm tra xác thực tài khoản, vai trò giáo viên hoặc điều kiện đồng ý
    if (laVaiTroGV(p?.role)) redirect('/gv');
    redirect('/bai-hoc');
  }
  return {
    db,
    user,
    role: p!.role as VaiTro,
    schoolId: (p?.school_id ?? null) as string | null
  };
}

/** Bộ lọc duy nhất trên đầu 3 màn chính: Lớp và Bài sắp dạy. */
export default function BoLoc({
  action,
  lops,
  lop,
  bais,
  bai,
  them
}: {
  action: string;
  lops: LopCuaToi[];
  lop: string;
  bais: Bai[];
  bai: string;
  them?: Record<string, string>;
}) {
  const theoChuong = new Map<number, Bai[]>();
  for (const b of bais) {
    if (!theoChuong.has(b.chuong)) theoChuong.set(b.chuong, []);
    theoChuong.get(b.chuong)!.push(b);
  }
  return (
    <form className="mc-loc" action={action}>
      <label>
        Lớp
        <select name="lop" defaultValue={lop}>
          {lops.map((l) => (
            <option key={l.class_id} value={l.class_id}>
              {nhanTruongLop(l)}
            </option>
          ))}
        </select>
      </label>
      <label>
        Bài sắp dạy
        <select name="bai" defaultValue={bai}>
          {[...theoChuong.entries()].map(([c, ds]) => (
            <optgroup
              key={c}
              label={CHAPTERS.find((x: any) => x.id === `C${c}`)?.label ?? `Chương ${c}`}
            >
              {ds.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.ten}
                </option>
              ))}
            </optgroup>
          ))}
        </select>
      </label>
      {Object.entries(them ?? {}).map(([k, v]) => (
        <input key={k} type="hidden" name={k} value={v} />
      ))}
      <button className="nho">Xem</button>
    </form>
  );
}

export const phanTram = (x: number | null | undefined) =>
  x == null ? '–' : `${Math.round(x * 100)}%`;
export const MAU_CHU: Record<string, string> = {
  tot: '🟢 tiến bộ tốt',
  'chu-y': '🟠 còn mắc',
  'nguy-co': '🔴 ít tiến bộ'
};
