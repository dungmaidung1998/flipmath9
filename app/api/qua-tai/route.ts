/**
 * FILE NÀY LÀM GÌ: API kiểm tra trạng thái quá tải, khoá mềm bài mới và ghi nhận sự kiện hành vi học tập.
 * AI DÙNG: máy chủ (API)
 * ĐỊA CHỈ TRÊN WEB: /api/qua-tai
 * LẤY DỮ LIỆU TỪ: profiles, learning_events
 * GỌI TỚI: @/lib/supabase/server, @/lib/quaTaiMayChu, @/lib/quaTai
 */
import { NextResponse } from 'next/server';
import { supabaseAdmin, supabaseServer } from '@/lib/supabase/server';
import { layCauHinhQuaTaiHieuLuc } from '@/lib/quaTaiMayChu';
import {
  biKhoaMemBaiMoi,
  phatHienDauHieuQuaTai,
  phutHienTaiVN,
  type LoaiDauHieuQuaTai,
} from '@/lib/quaTai';

export const dynamic = 'force-dynamic';

const LOAI_HOP_LE = new Set<LoaiDauHieuQuaTai>([
  'khuya',
  'lien-tuc',
  'sai-lien-tiep',
  'don-dap',
  'vuot-ngay',
]);

/**
 * Xử lý HTTP GET: kiểm tra đăng nhập/quyền hạn, đọc dữ liệu và trả về JSON cho trình duyệt.
 */
export async function GET() {
  const db = supabaseServer();
  // Kiểm tra xác thực tài khoản, vai trò giáo viên hoặc điều kiện đồng ý
  const { data: { user } } = await db.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Chưa đăng nhập' }, { status: 401 });

  const { data: prof } = await db
    .from('profiles')
    .select('student_id, class_id')
    .eq('id', user.id)
    .maybeSingle();

  if (!prof?.student_id) {
    return NextResponse.json({ laHocSinh: false, cauHinh: null, biKhoaMem: false, dauHieu: [] });
  }

  const admin = supabaseAdmin();
  const { cauHinh, phutHomNay } = await layCauHinhQuaTaiHieuLuc(admin, prof.student_id, prof.class_id);
  const dauHieu = phatHienDauHieuQuaTai(
    {
      phutTrongNgayVN: phutHienTaiVN(),
      phutLienTuc: 0,
      phutTrongNgay: phutHomNay,
      cauGanDay: [],
      nowMs: Date.now(),
    },
    cauHinh
  );

  return NextResponse.json({
    laHocSinh: true,
    cauHinh,
    phutHomNay,
    dauHieu,
    biKhoaMem: biKhoaMemBaiMoi(dauHieu),
  });
}

/**
 * Xử lý HTTP POST: kiểm tra đăng nhập/quyền hạn, nhận dữ liệu mới / xử lý và trả về JSON cho trình duyệt.
 */
export async function POST(req: Request) {
  const db = supabaseServer();
  // Kiểm tra xác thực tài khoản, vai trò giáo viên hoặc điều kiện đồng ý
  const { data: { user } } = await db.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Chưa đăng nhập' }, { status: 401 });

  const { data: prof } = await db
    .from('profiles')
    .select('student_id')
    .eq('id', user.id)
    .maybeSingle();

  if (!prof?.student_id) return NextResponse.json({ ok: true, skipped: true });

  const b = await req.json().catch(() => null);
  const loai = b?.loai as LoaiDauHieuQuaTai;
  if (!LOAI_HOP_LE.has(loai)) {
    return NextResponse.json({ error: 'Loại dấu hiệu không hợp lệ.' }, { status: 400 });
  }

  const admin = supabaseAdmin();
  // Chỉ lưu loại dấu hiệu hành vi, không lưu suy đoán cảm xúc
  await admin
    .from('learning_events')
    .insert({
      student_id: prof.student_id,
      ku_id: null,
      event_type: 'qua_tai',
      payload: { loai },
    })
    .then(() => {}, () => {});

  return NextResponse.json({ ok: true });
}
