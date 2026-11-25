/**
 * FILE NÀY LÀM GÌ: Trang Next.js App Router trong khu vực học tập đã đăng nhập, nạp dữ liệu ban đầu và hiển thị giao diện tương tác.
 * AI DÙNG: học sinh
 * ĐỊA CHỈ TRÊN WEB: /do-chieu-cao
 * LẤY DỮ LIỆU TỪ: profiles, students, vat_moc, do_chieu_cao
 * GỌI TỚI: @/components/DauTrang, @/components/AnhChuDe, @/components/do-chieu-cao/DoChieuCaoClient, @/lib/supabase/server, @/lib/chuDeChuong, @/lib/gv/lopCuaToi, @/lib/do-chieu-cao/tinh
 */
import { redirect } from 'next/navigation';
import DauTrang from '@/components/DauTrang';
import AnhChuDe from '@/components/AnhChuDe';
import DoChieuCaoClient, { type VatMocItem } from '@/components/do-chieu-cao/DoChieuCaoClient';
import { supabaseAdmin, supabaseServer } from '@/lib/supabase/server';
import { chuDeChuong } from '@/lib/chuDeChuong';
import { laVaiTroGV } from '@/lib/gv/lopCuaToi';
import type { BanGhiDoChieuCao } from '@/lib/do-chieu-cao/tinh';
import type { CSSProperties } from 'react';

export const dynamic = 'force-dynamic';

/**
 * Component React `DoChieuCaoPage`: nhận props (thuộc tính truyền vào từ component cha) và dựng giao diện tương ứng.
 */
export default async function DoChieuCaoPage() {
  const supabase = supabaseServer();
  // Kiểm tra xác thực tài khoản, vai trò giáo viên hoặc điều kiện đồng ý
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/dang-nhap');

  const { data: prof } = await supabase
    .from('profiles')
    .select('student_id, role, class_id')
    .eq('id', user.id)
    .maybeSingle();

  // Kiểm tra xác thực tài khoản, vai trò giáo viên hoặc điều kiện đồng ý
  const laGV = laVaiTroGV(prof?.role);
  const sid = prof?.student_id ?? null;
  const admin = supabaseAdmin();

  let classId = prof?.class_id ?? null;
  if (sid && !classId) {
    const { data: st } = await admin
      .from('students')
      .select('class_id')
      .eq('student_id', sid)
      .maybeSingle();
    classId = st?.class_id ?? null;
  }

  let vatMocsGV: VatMocItem[] = [];
  let lichSu: BanGhiDoChieuCao[] = [];
  try {
    if (classId) {
      const { data: vms } = await admin
        .from('vat_moc')
        .select('id, ten, h_that, cach_do_that')
        .eq('class_id', classId)
        .order('tao_luc', { ascending: false });
      vatMocsGV = (vms ?? []).map((v: any) => ({
        id: String(v.id),
        ten: String(v.ten),
        h_that: v.h_that != null ? Number(v.h_that) : null,
        cach_do_that: v.cach_do_that ?? null,
        anh: /rồng/i.test(String(v.ten)) ? '/do-chieu-cao/vat-cau-rong.webp' : '/do-chieu-cao/vat-cot-co.webp',
        loaiVat: /rồng/i.test(String(v.ten))
          ? 'cau-rong'
          : /cây/i.test(String(v.ten))
            ? 'cay'
            : /đèn/i.test(String(v.ten))
              ? 'tru-den'
              : /toà|tòa|nhà|dãy/i.test(String(v.ten))
                ? 'toa-nha'
                : 'cot-co',
        cachDoGoiY: /rồng|hai điểm|sông/i.test(String(v.ten)) ? 'hai-diem' : 'mot-diem',
      }));
    }
    if (sid) {
      const { data: logs } = await admin
        .from('do_chieu_cao')
        .select('id, ten_vat, cach_do, d, a, alpha1, alpha2, m, h_tinh, h_hs_nhap, hs_dung, nguon_goc, tao_luc')
        .eq('student_id', sid)
        .order('tao_luc', { ascending: false })
        .limit(8);
      lichSu = (logs ?? []) as BanGhiDoChieuCao[];
    }
  } catch {
    /* DB chưa chạy SQL 56 vẫn hiển thị đầy đủ với vật mẫu sẵn */
  }

  const cd = chuDeChuong('C4');

  return (
    <div
      className={cd ? 'wrap trang-chuong' : 'wrap'}
      style={cd ? ({ ['--mau-chuong' as string]: cd.mau } as CSSProperties) : undefined}
    >
      <p style={{ margin: '0 0 8px' }}>
        <a className="action-link" href="/bai-hoc/C4">← Về Chương IV</a>{' '}
        <a className="action-link" href="/hoc/C4-B12-M3">📘 Bài 12: Ứng dụng tam giác vuông</a>
      </p>

      <DauTrang
        tieuDe="Đo chiều cao Đà Nẵng bằng điện thoại"
        phu="Gắn với Bài 11–12 Chương IV: ngắm đỉnh vật thật bằng giác kế, dựng tam giác vuông 3D rồi tự tính chiều cao h."
        chuong="C4"
        nhanVat="bin"
        hinh="/do-chieu-cao/dau-trang.webp"
      />

      <div style={{ margin: '0 0 12px' }}>
        <AnhChuDe
          src="/do-chieu-cao/dau-trang.webp"
          fallback="/chu-de/canh/C4.webp"
          alt="Minh hoạ đo chiều cao ở sân trường Đà Nẵng"
          width={960}
          height={280}
          style={{ width: '100%', maxHeight: 190, objectFit: 'cover', borderRadius: 14, border: '1px solid var(--line)' }}
        />
      </div>

      <DoChieuCaoClient
        vatMocsGV={vatMocsGV}
        lichSuBanDau={lichSu}
        laHocSinh={Boolean(sid) && !laGV}
      />
    </div>
  );
}
