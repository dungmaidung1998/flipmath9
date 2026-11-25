/**
 * FILE NÀY LÀM GÌ: API máy chủ phục vụ giáo viên xử lý dữ liệu lớp học, thống kê hoặc thao tác quản lý trên Supabase.
 * AI DÙNG: máy chủ (API)
 * ĐỊA CHỈ TRÊN WEB: /api/gv/trinh-chieu
 * LẤY DỮ LIỆU TỪ: profiles, phong_trinh_chieu, phong_tra_loi, phong_dap_an, students, questions, question_options, distractor_errors
 * GỌI TỚI: @/lib/supabase/server, @/lib/gv/lopCuaToi, @/lib/gv/xacThucApi, @/lib/tronPhuongAn, @/lib/chapters
 */
import { NextResponse } from 'next/server';
import { randomInt } from 'node:crypto';
import { supabaseAdmin, supabaseServer } from '@/lib/supabase/server';
import { laVaiTroGV } from '@/lib/gv/lopCuaToi';
import { giaoVienCuaLop } from '@/lib/gv/xacThucApi';
import { tronPhuongAn } from '@/lib/tronPhuongAn';
import { chapterOf } from '@/lib/chapters';

export const dynamic = 'force-dynamic';

type CauPhong = {
  chi_so: number;
  question_id: string;
  ku_id: string;
  level: number;
  stem: string;
  hinh?: unknown;
  options: { nhan: string; option_key: string; option_text: string }[];
};

type DapAnPhong = {
  question_id: string;
  ku_id: string;
  correct_option: string;
  correct_nhan: string;
  error_map: Record<string, string>;
};

/**
 * Hàm `tronNgauNhien(ds)`: xử lý dữ liệu đầu vào và trả kết quả.
 */
function tronNgauNhien<T>(ds: T[]): T[] {
  const arr = [...ds];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = randomInt(i + 1);
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

/**
 * Xử lý HTTP GET: kiểm tra đăng nhập/quyền hạn, đọc dữ liệu và trả về JSON cho trình duyệt.
 */
export async function GET(req: Request) {
  const db = supabaseServer();
  // Kiểm tra xác thực tài khoản, vai trò giáo viên hoặc điều kiện đồng ý
  const { data: { user } } = await db.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Chưa đăng nhập' }, { status: 401 });
  // Truy vấn Supabase: đọc dữ liệu từ bảng profiles
  const { data: p } = await db.from('profiles').select('role').eq('id', user.id).maybeSingle();
  // Kiểm tra xác thực tài khoản, vai trò giáo viên hoặc điều kiện đồng ý
  if (!laVaiTroGV(p?.role)) return NextResponse.json({ error: 'Chỉ giáo viên' }, { status: 403 });

  const maPhong = new URL(req.url).searchParams.get('ma')?.trim() ?? '';
  if (!maPhong) return NextResponse.json({ error: 'Thiếu mã phòng' }, { status: 400 });

  const admin = supabaseAdmin();
  const { data: phong, error } = await admin
    .from('phong_trinh_chieu')
    .select('*')
    .eq('ma_phong', maPhong)
    .maybeSingle();
  if (error || !phong) return NextResponse.json({ error: 'Không tìm thấy phòng' }, { status: 404 });

  // Kiểm tra xác thực tài khoản, vai trò giáo viên hoặc điều kiện đồng ý
  const auth = await giaoVienCuaLop(phong.class_id);
  if ('loi' in auth) return auth.loi;

  const [{ data: ansRows }, { data: dapAnRow }, { data: hsRows }] = await Promise.all([
    admin
      .from('phong_tra_loi')
      .select('student_id, chi_so_cau, nhan_hien_thi, is_correct, diem, thoi_gian_ms')
      .eq('ma_phong', maPhong),
    admin.from('phong_dap_an').select('dap_an').eq('ma_phong', maPhong).maybeSingle(),
    admin.from('students').select('student_id, display_name').eq('class_id', phong.class_id),
  ]);

  const tenHS = new Map((hsRows ?? []).map((h) => [h.student_id as string, (h.display_name as string) || h.student_id]));
  const chiSo = Number(phong.chi_so_cau ?? 0);
  const theoCauHienTai = (ansRows ?? []).filter((a) => Number(a.chi_so_cau) === chiSo);

  const phanBo: Record<string, number> = { A: 0, B: 0, C: 0, D: 0 };
  for (const a of theoCauHienTai) {
    if (a.nhan_hien_thi in phanBo) phanBo[a.nhan_hien_thi] += 1;
  }

  // Bảng xếp hạng tổng điểm trong phòng
  const diemTheoHS = new Map<string, { diem: number; dung: number; daTraLoi: number }>();
  for (const a of ansRows ?? []) {
    const cur = diemTheoHS.get(a.student_id) ?? { diem: 0, dung: 0, daTraLoi: 0 };
    cur.diem += Number(a.diem ?? 0);
    if (a.is_correct) cur.dung += 1;
    cur.daTraLoi += 1;
    diemTheoHS.set(a.student_id, cur);
  }
  const bangXepHang = Array.from(diemTheoHS.entries())
    .map(([studentId, st]) => ({
      studentId,
      ten: tenHS.get(studentId) ?? studentId,
      diem: st.diem,
      dung: st.dung,
      daTraLoi: st.daTraLoi,
    }))
    .sort((a, b) => b.diem - a.diem || b.dung - a.dung)
    .slice(0, 12);

  const dapAnList = (dapAnRow?.dap_an ?? []) as DapAnPhong[];
  const dapAnHienTai =
    phong.trang_thai === 'hien-dap-an' || phong.trang_thai === 'ket-thuc'
      ? dapAnList[chiSo]?.correct_nhan ?? null
      : null;

  return NextResponse.json({
    phong,
    soDaTraLoi: theoCauHienTai.length,
    siSoLop: (hsRows ?? []).length,
    phanBo,
    dapAnHienTai,
    bangXepHang,
  });
}

/**
 * Xử lý HTTP POST: kiểm tra đăng nhập/quyền hạn, nhận dữ liệu mới / xử lý và trả về JSON cho trình duyệt.
 */
export async function POST(req: Request) {
  const b = await req.json().catch(() => null);
  const hanhDong = String(b?.hanhDong ?? '');
  const admin = supabaseAdmin();

  if (hanhDong === 'mo-phong') {
    const classId = String(b?.classId ?? '');
    const kuId = String(b?.kuId ?? '');
    // Tính toán, làm tròn hoặc giới hạn giá trị theo công thức
    const soCau = Math.max(3, Math.min(20, Math.round(Number(b?.soCau) || 8)));
    // Tính toán, làm tròn hoặc giới hạn giá trị theo công thức
    const giayMoiCau = Math.max(10, Math.min(180, Math.round(Number(b?.giayMoiCau) || 30)));
    // Kiểm tra xác thực tài khoản, vai trò giáo viên hoặc điều kiện đồng ý
    const auth = await giaoVienCuaLop(classId);
    if ('loi' in auth) return auth.loi;
    if (!kuId) return NextResponse.json({ error: 'Chọn mục kiến thức để trình chiếu.' }, { status: 400 });

    const chuong = chapterOf(kuId) ?? 'C1';
    // Lấy câu trực tiếp của mục; nếu là Luyện tập chung / Ôn tập chương mà ít câu, bổ sung từ các mục trong chương
    let qRows: any[] = [];
    const { data: qDirect } = await admin
      .from('questions')
      .select('question_id, ku_id, level, stem, correct_option, hinh, trang_thai')
      .eq('ku_id', kuId)
      .then(
        (r) => (r.error ? admin.from('questions').select('question_id, ku_id, level, stem, correct_option').eq('ku_id', kuId) : r),
        () => ({ data: [] as any[] })
      );
    qRows = (qDirect ?? []).filter((q: any) => q.trang_thai !== 'can-sua');

    if (qRows.length < soCau) {
      const { data: qChuong } = await admin
        .from('questions')
        .select('question_id, ku_id, level, stem, correct_option, hinh, trang_thai')
        .like('ku_id', `${chuong}-%`)
        .then(
          (r) => (r.error ? admin.from('questions').select('question_id, ku_id, level, stem, correct_option').like('ku_id', `${chuong}-%`) : r),
          () => ({ data: [] as any[] })
        );
      const daCo = new Set(qRows.map((q) => q.question_id));
      const boSung = tronNgauNhien((qChuong ?? []).filter((q: any) => q.trang_thai !== 'can-sua' && !daCo.has(q.question_id)));
      qRows = [...tronNgauNhien(qRows), ...boSung].slice(0, soCau);
    } else {
      qRows = tronNgauNhien(qRows).slice(0, soCau);
    }

    if (!qRows.length) {
      return NextResponse.json({ error: 'Mục này chưa có câu hỏi nào trong ngân hàng.' }, { status: 400 });
    }

    const qids = qRows.map((q) => q.question_id);
    const [{ data: optRows }, { data: distRows }] = await Promise.all([
      admin.from('question_options').select('question_id, option_key, option_text').in('question_id', qids).order('option_key'),
      admin.from('distractor_errors').select('question_id, option_key, error_code').in('question_id', qids),
    ]);

    const optMap = new Map<string, { option_key: string; option_text: string }[]>();
    for (const o of optRows ?? []) {
      const arr = optMap.get(o.question_id) ?? [];
      arr.push({ option_key: o.option_key, option_text: o.option_text });
      optMap.set(o.question_id, arr);
    }
    const errMap = new Map<string, Record<string, string>>();
    for (const d of distRows ?? []) {
      const m = errMap.get(d.question_id) ?? {};
      if (d.error_code) m[d.option_key] = d.error_code;
      errMap.set(d.question_id, m);
    }

    // Tạo mã phòng 6 chữ số duy nhất
    let maPhong = '';
    for (let thu = 0; thu < 8; thu++) {
      const cand = String(randomInt(100000, 1000000));
      // Truy vấn Supabase: đọc dữ liệu từ bảng phong_trinh_chieu
      const { data: tonTai } = await admin.from('phong_trinh_chieu').select('ma_phong').eq('ma_phong', cand).maybeSingle();
      if (!tonTai) {
        maPhong = cand;
        break;
      }
    }
    if (!maPhong) maPhong = String(randomInt(100000, 1000000));

    const cauPhong: CauPhong[] = [];
    const dapAnList: DapAnPhong[] = [];

    qRows.forEach((q, idx) => {
      const pa = tronPhuongAn(optMap.get(q.question_id) ?? [], maPhong, q.question_id);
      const correctNhan = pa.find((o) => o.option_key === q.correct_option)?.nhan ?? 'A';
      cauPhong.push({
        chi_so: idx,
        question_id: q.question_id,
        ku_id: q.ku_id,
        level: Number(q.level ?? 1),
        stem: q.stem,
        hinh: q.hinh ?? null,
        options: pa.map((o) => ({
          nhan: o.nhan,
          option_key: o.option_key,
          option_text: o.option_text,
        })),
      });
      dapAnList.push({
        question_id: q.question_id,
        ku_id: q.ku_id,
        correct_option: q.correct_option,
        correct_nhan: correctNhan,
        error_map: errMap.get(q.question_id) ?? {},
      });
    });

    const { data: phong, error: e1 } = await admin
      .from('phong_trinh_chieu')
      .insert({
        ma_phong: maPhong,
        class_id: classId,
        ku_id: kuId,
        chuong,
        giao_vien: auth.user.id,
        trang_thai: 'cho',
        chi_so_cau: 0,
        giay_moi_cau: giayMoiCau,
        cau_hoi: cauPhong,
      })
      .select('*')
      .single();

    if (e1 || !phong) {
      return NextResponse.json(
        { error: e1?.message ?? 'Không mở được phòng. Kiểm tra đã chạy supabase/53-tinh-nang-khkt.sql chưa.' },
        { status: 500 }
      );
    }

    // Truy vấn Supabase: thêm hoặc cập nhật (upsert) bảng phong_dap_an
    await admin.from('phong_dap_an').upsert({ ma_phong: maPhong, dap_an: dapAnList });
    return NextResponse.json({ ok: true, phong });
  }

  // Các hành động điều khiển phòng
  const maPhong = String(b?.maPhong ?? '').trim();
  if (!maPhong) return NextResponse.json({ error: 'Thiếu mã phòng' }, { status: 400 });

  // Truy vấn Supabase: đọc dữ liệu từ bảng phong_trinh_chieu
  const { data: phong } = await admin.from('phong_trinh_chieu').select('*').eq('ma_phong', maPhong).maybeSingle();
  if (!phong) return NextResponse.json({ error: 'Không tìm thấy phòng' }, { status: 404 });

  // Kiểm tra xác thực tài khoản, vai trò giáo viên hoặc điều kiện đồng ý
  const auth = await giaoVienCuaLop(phong.class_id);
  if ('loi' in auth) return auth.loi;

  const tongCau = Array.isArray(phong.cau_hoi) ? phong.cau_hoi.length : 0;
  const now = new Date().toISOString();
  let patch: Record<string, unknown> = { cap_nhat: now };

  if (hanhDong === 'bat-dau') {
    patch = { ...patch, trang_thai: 'dang-hoi', chi_so_cau: 0, bat_dau_cau_luc: now };
  } else if (hanhDong === 'hien-dap-an') {
    patch = { ...patch, trang_thai: 'hien-dap-an' };
  } else if (hanhDong === 'cau-tiep') {
    const tiep = Number(phong.chi_so_cau ?? 0) + 1;
    if (tiep >= tongCau) {
      patch = { ...patch, trang_thai: 'ket-thuc' };
    } else {
      patch = { ...patch, trang_thai: 'dang-hoi', chi_so_cau: tiep, bat_dau_cau_luc: now };
    }
  } else if (hanhDong === 'ket-thuc') {
    patch = { ...patch, trang_thai: 'ket-thuc' };
  } else {
    return NextResponse.json({ error: 'Hành động không hợp lệ' }, { status: 400 });
  }

  const { data: updated, error: eUpd } = await admin
    .from('phong_trinh_chieu')
    .update(patch)
    .eq('ma_phong', maPhong)
    .select('*')
    .single();
  if (eUpd) return NextResponse.json({ error: eUpd.message }, { status: 400 });

  return NextResponse.json({ ok: true, phong: updated });
}
