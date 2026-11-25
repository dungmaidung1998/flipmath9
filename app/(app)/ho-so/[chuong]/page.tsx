/**
 * FILE NÀY LÀM GÌ: Trang Next.js App Router trong khu vực học tập đã đăng nhập, nạp dữ liệu ban đầu và hiển thị giao diện tương tác.
 * AI DÙNG: học sinh
 * ĐỊA CHỈ TRÊN WEB: /ho-so/[chuong]
 * LẤY DỮ LIỆU TỪ: profiles, students
 * GỌI TỚI: @/lib/supabase/server, @/lib/chapters, @/lib/gv/lopCuaToi, @/components/gv/BoLoc, @/lib/khkt/hoSoChuong, @/components/ho-so/HoSoChuongView
 */
import { notFound, redirect } from 'next/navigation';
import { supabaseAdmin, supabaseServer } from '@/lib/supabase/server';
import { CHAPTERS } from '@/lib/chapters';
import { chonLopTu, laVaiTroGV, lopCuaToi } from '@/lib/gv/lopCuaToi';
import { docCookieLop } from '@/components/gv/BoLoc';
import { napHoSoNhieuHS } from '@/lib/khkt/hoSoChuong';
import HoSoChuongView from '@/components/ho-so/HoSoChuongView';

export const dynamic = 'force-dynamic';

/**
 * Component React `HoSoChuongPage`: nhận props (thuộc tính truyền vào từ component cha) và dựng giao diện tương ứng.
 */
export default async function HoSoChuongPage({
  params,
  searchParams,
}: {
  params: { chuong: string };
  searchParams: { lop?: string; hs?: string; inCaLop?: string };
}) {
  const chuong = decodeURIComponent(params.chuong).toUpperCase();
  if (!CHAPTERS.some((c) => c.id === chuong && c.id !== 'TN')) notFound();

  const db = supabaseServer();
  // Kiểm tra xác thực tài khoản, vai trò giáo viên hoặc điều kiện đồng ý
  const { data: { user } } = await db.auth.getUser();
  if (!user) redirect('/dang-nhap');

  const { data: prof } = await db
    .from('profiles')
    .select('student_id, role')
    .eq('id', user.id)
    .maybeSingle();

  // Kiểm tra xác thực tài khoản, vai trò giáo viên hoặc điều kiện đồng ý
  const laGV = laVaiTroGV(prof?.role);
  const admin = supabaseAdmin();

  if (!laGV) {
    const sid = prof?.student_id;
    if (!sid) redirect('/bai-hoc');
    const items = await napHoSoNhieuHS(admin, [sid], chuong);
    return <HoSoChuongView chuong={chuong} items={items} laGV={false} />;
  }

  const lops = await lopCuaToi(db);
  if (!lops.length) {
    return (
      <div className="mc">
        <h1>Hồ sơ năng lực chương {chuong}</h1>
        <p className="mc-trong">Thầy cô chưa được phân công lớp nào.</p>
      </div>
    );
  }

  const chon = chonLopTu(lops, searchParams.lop, docCookieLop(), false);
  const lopChon = chon.lop?.class_id ?? lops[0].class_id;

  const { data: hsRows } = await admin
    .from('students')
    .select('student_id, display_name')
    .eq('class_id', lopChon)
    .order('student_id');

  const dsHS = (hsRows ?? []).map((h) => ({
    student_id: String(h.student_id),
    ten: String(h.display_name || h.student_id),
  }));

  const inCaLop = searchParams.inCaLop === '1';
  const hsChon =
    searchParams.hs && dsHS.some((h) => h.student_id === searchParams.hs)
      ? searchParams.hs
      : dsHS[0]?.student_id ?? '';

  const targetIds = inCaLop ? dsHS.map((h) => h.student_id) : hsChon ? [hsChon] : [];
  const items = await napHoSoNhieuHS(admin, targetIds, chuong);

  return (
    <HoSoChuongView
      chuong={chuong}
      items={items}
      laGV={true}
      lops={lops}
      lopChon={lopChon}
      dsHS={dsHS}
      hsChon={hsChon}
      inCaLop={inCaLop}
    />
  );
}
