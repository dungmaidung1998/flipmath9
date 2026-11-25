/**
 * FILE NÀY LÀM GÌ: Trang Next.js App Router trong khu vực học tập đã đăng nhập, nạp dữ liệu ban đầu và hiển thị giao diện tương tác.
 * AI DÙNG: học sinh
 * ĐỊA CHỈ TRÊN WEB: /on-thi-10
 * LẤY DỮ LIỆU TỪ: profiles, knowledge_units, quiz_attempts, mastery_states, students, lich_bai
 * GỌI TỚI: @/lib/cheDo, @/lib/supabase/server, @/components/DauTrang, @/components/on-thi/OnThi10, @/lib/minhHoa, @/lib/lichBai, @/lib/dfle/t9-on-thi-10.js, @/lib/gv/lopCuaToi
 */
import { CHE_DO_KIEM_TRA } from '@/lib/cheDo';
import { supabaseServer } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import DauTrang from '@/components/DauTrang';
import OnThi10, { type KhoaDang } from '@/components/on-thi/OnThi10';
import { hinhNhanVat } from '@/lib/minhHoa';
import { ngayVN } from '@/lib/lichBai';
// @ts-ignore — dùng chung với gói dfle-engine
import { DANG_ON_THI } from '@/lib/dfle/t9-on-thi-10.js';
import { laVaiTroGV } from '@/lib/gv/lopCuaToi';
import KhoaMemQuaTai from '@/components/KhoaMemQuaTai';
import { layCauHinhQuaTaiHieuLuc } from '@/lib/quaTaiMayChu';
import { biKhoaMemBaiMoi, phatHienDauHieuQuaTai, phutHienTaiVN } from '@/lib/quaTai';
import { supabaseAdmin } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';

/**
 * ÔN THI VÀO 10: luyện theo 15 dạng câu đề Đà Nẵng 2026 và làm thử đề có bấm giờ.
 * 23/11/2026: dạng nào chỉ mở khi em ĐÃ HỌC các mục kiến thức của dạng đó:
 * lớp đã học bài đó trên lớp (lịch giao bài) hoặc em đã làm bài của mục đó. Giáo viên xem được hết.
 */
export default async function TrangOnThi10() {
  const supabase = supabaseServer();
  // Kiểm tra xác thực tài khoản, vai trò giáo viên hoặc điều kiện đồng ý
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/dang-nhap');
  // Truy vấn Supabase: đọc dữ liệu từ bảng profiles
  const { data: profile } = await supabase.from('profiles').select('student_id, role').eq('id', user.id).maybeSingle();
  // Kiểm tra xác thực tài khoản, vai trò giáo viên hoặc điều kiện đồng ý
  const laGV = laVaiTroGV(profile?.role);
  const sid = profile?.student_id ?? '';

  // Truy vấn Supabase: đọc dữ liệu từ bảng knowledge_units
  const { data: units } = await supabase.from('knowledge_units').select('ku_id, ku_name, lesson_id');
  const tenKu = new Map((units ?? []).map((u) => [u.ku_id, u.ku_name as string]));
  const daHoc = new Set<string>();
  if (!laGV && sid) {
    const [{ data: lam }, { data: lc }, { data: em }] = await Promise.all([
      supabase.from('quiz_attempts').select('ku_id').eq('student_id', sid),
      supabase.from('mastery_states').select('ku_id').eq('student_id', sid),
      supabase.from('students').select('class_id').eq('student_id', sid).maybeSingle()
    ]);
    for (const r of [...(lam ?? []), ...(lc ?? [])]) daHoc.add(r.ku_id);
    if (em?.class_id) {
      // Truy vấn Supabase: đọc dữ liệu từ bảng lich_bai
      const { data: lich } = await supabase.from('lich_bai').select('lesson_id, ngay_hoc').eq('class_id', em.class_id).then((r) => r, () => ({ data: [] as { lesson_id: string; ngay_hoc: string }[] }));
      // Xử lý mốc ngày giờ theo múi giờ Việt Nam (UTC+7)
      const homNay = ngayVN();
      const baiDaHoc = new Set((lich ?? []).filter((l) => l.ngay_hoc <= homNay).map((l) => l.lesson_id));
      for (const u of units ?? []) if (u.lesson_id && baiDaHoc.has(u.lesson_id)) daHoc.add(u.ku_id);
    }
  }
  const khoa: KhoaDang = {};
  for (const d of DANG_ON_THI as { cau: string; ku: string; kuLienQuan?: string[] }[]) {
    const can = CHE_DO_KIEM_TRA ? [] : [d.ku, ...(d.kuLienQuan ?? [])].filter((k) => !laGV && !daHoc.has(k));
    if (can.length) khoa[d.cau] = can.map((k) => ({ ku: k, ten: tenKu.get(k) ?? k }));
  }

  const choChamVo = !laGV && (process.env.AI_CHAM_VO_BAT ?? 'true').trim().toLowerCase() !== 'false';
  let khoaQuaTai = false;
  let phutGioiHan = 90;
  let khuya = false;
  if (!laGV && sid && !CHE_DO_KIEM_TRA) {
    try {
      const hieuLuc = await layCauHinhQuaTaiHieuLuc(supabaseAdmin(), sid, null);
      phutGioiHan = hieuLuc.cauHinh.phut_ngay;
      const ds = phatHienDauHieuQuaTai(
        {
          phutTrongNgayVN: phutHienTaiVN(),
          phutLienTuc: 0,
          phutTrongNgay: hieuLuc.phutHomNay,
          cauGanDay: [],
          nowMs: Date.now(),
        },
        hieuLuc.cauHinh
      );
      khoaQuaTai = biKhoaMemBaiMoi(ds);
      khuya = ds.includes('khuya');
    } catch { /* bỏ qua */ }
  }

  return (
    <div className="wrap">
      <DauTrang tieuDe="Ôn thi vào lớp 10" phu="Học xong chương nào thì mở khoá dạng câu của chương đó. Luyện từng dạng, rồi làm thử đề." hinh={hinhNhanVat('doc-sach')} />
      {laGV ? (
        <OnThi10 khoa={khoa} choChamVo={choChamVo} />
      ) : (
        <KhoaMemQuaTai khoaBanDau={khoaQuaTai} phutGioiHanBanDau={phutGioiHan} laGioKhuyaBanDau={khuya}>
          <OnThi10 khoa={khoa} choChamVo={choChamVo} />
        </KhoaMemQuaTai>
      )}
    </div>
  );
}
