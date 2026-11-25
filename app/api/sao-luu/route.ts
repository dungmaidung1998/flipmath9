/**
 * FILE NÀY LÀM GÌ: API máy chủ tiếp nhận yêu cầu từ trình duyệt, kiểm tra quyền và làm việc với cơ sở dữ liệu Supabase / AI.
 * AI DÙNG: máy chủ (API)
 * ĐỊA CHỈ TRÊN WEB: /api/sao-luu
 * LẤY DỮ LIỆU TỪ: profiles, students, quiz_attempts
 * GỌI TỚI: @/lib/supabase/server, @/lib/zip, @/lib/gv/lopCuaToi, @/lib/dfle/ngay.js
 */
import { NextResponse } from 'next/server';
import { supabaseServer, supabaseAdmin } from '@/lib/supabase/server';
import { createHash } from 'node:crypto';
import { taoZip } from '@/lib/zip';
import { laVaiTroGV, lopCuaToi } from '@/lib/gv/lopCuaToi';
// @ts-ignore — dùng chung cách tính ngày với gói dfle-engine
import { homNayVN } from '@/lib/dfle/ngay.js';

export const dynamic = 'force-dynamic';
export const maxDuration = 60;

/**
 * GÓI SAO LƯU DỮ LIỆU NGHIÊN CỨU
 *
 * Chỉ xuất dữ liệu của các lớp trong lopCuaToi(db) (phân cấp trường → GV → lớp → HS).
 * KHÔNG CÓ HỌ TÊN TRONG GÓI NÀY. Cột display_name và full_name bị loại bỏ có chủ ý.
 */

type PhamVi = 'lop' | 'hs' | 'luot' | 'chung';

const BANG: { ten: string; cot?: string; thuTu?: string; ghiChu?: string; phamVi: PhamVi }[] = [
  { ten: 'classes',            thuTu: 'class_id',   phamVi: 'lop' },
  { ten: 'students',
    cot: 'student_id, class_id, gender, baseline_math, device_type, internet_access, consent_status',
    thuTu: 'student_id',
    ghiChu: 'đã bỏ cột display_name',
    phamVi: 'lop' },
  { ten: 'profiles',
    cot: 'id, role, student_id, class_id',
    thuTu: 'student_id',
    ghiChu: 'đã bỏ cột full_name',
    phamVi: 'lop' },
  { ten: 'knowledge_units',    thuTu: 'ku_id',      phamVi: 'chung' },
  { ten: 'contents',           thuTu: 'content_id', phamVi: 'chung' },
  { ten: 'questions',          thuTu: 'question_id', phamVi: 'chung' },
  { ten: 'question_options',   thuTu: 'question_id', phamVi: 'chung' },
  { ten: 'distractor_errors',  thuTu: 'question_id', phamVi: 'chung' },
  { ten: 'error_dictionary',   thuTu: 'error_code', phamVi: 'chung' },
  { ten: 'error_hints',        thuTu: 'error_code', phamVi: 'chung' },
  { ten: 'micro_lessons',      thuTu: 'id',         phamVi: 'chung' },
  { ten: 'week_plan',          thuTu: 'class_id',   phamVi: 'lop' },
  // ---- dữ liệu thu được trong đợt thực nghiệm: lọc theo các lớp trong lopCuaToi
  { ten: 'learning_events',    thuTu: 'ts',         phamVi: 'hs' },
  { ten: 'video_seconds',      thuTu: 'student_id', phamVi: 'hs' },
  { ten: 'quiz_attempts',      thuTu: 'student_id', phamVi: 'hs' },
  { ten: 'quiz_answers',       thuTu: 'attempt_id', phamVi: 'luot' },
  { ten: 'quiz_locks',         thuTu: 'student_id', phamVi: 'hs' },
  { ten: 'assessments',        thuTu: 'student_id', phamVi: 'hs' },
  { ten: 'mastery_states',     thuTu: 'student_id', phamVi: 'hs' },
  { ten: 'mastery_history',    thuTu: 'student_id', phamVi: 'hs' },
  { ten: 'recommendations',    thuTu: 'created_at', phamVi: 'hs' },
  { ten: 'measurements',       thuTu: 'student_id', phamVi: 'hs' },
  { ten: 'hint_requests',      thuTu: 'student_id', phamVi: 'hs' },
  { ten: 'micro_lesson_events',thuTu: 'student_id', phamVi: 'hs' },
  { ten: 'lesson_log',         thuTu: 'class_id',   phamVi: 'lop' },
  { ten: 'student_xp',         thuTu: 'student_id', phamVi: 'hs' },
  { ten: 'xp_log',             thuTu: 'student_id', phamVi: 'hs' },
  { ten: 'student_badges',     thuTu: 'student_id', phamVi: 'hs' },
  { ten: 'dashboard_views',    thuTu: 'id',         phamVi: 'lop' },
  { ten: 'nhat_ky_nghien_cuu', thuTu: 'ngay',       phamVi: 'chung' }
];

const TRANG = 1000;
const LO_IN = 250;

const o = (v: unknown) => {
  if (v === null || v === undefined) return '';
  const s = typeof v === 'object' ? JSON.stringify(v) : String(v);
  // Biểu thức chính quy (regex) kiểm tra hoặc tách chuỗi đúng mẫu dữ liệu
  return /[",\n\r]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
};

/** Tiêu đề lấy hợp của khoá mọi dòng — cột chỉ xuất hiện ở dòng sau cũng không mất. */
function sangCsv(ds: any[]): string {
  if (!ds.length) return '﻿\n';
  const cot: string[] = [];
  for (const d of ds) for (const k of Object.keys(d)) if (!cot.includes(k)) cot.push(k);
  return '﻿' + [cot.join(','), ...ds.map((d) => cot.map((k) => o(d[k])).join(','))].join('\n') + '\n';
}

/**
 * Xử lý HTTP GET: kiểm tra đăng nhập/quyền hạn, đọc dữ liệu và trả về JSON cho trình duyệt.
 */
export async function GET() {
  const db = supabaseServer();
  // Kiểm tra xác thực tài khoản, vai trò giáo viên hoặc điều kiện đồng ý
  const { data: { user } } = await db.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Chưa đăng nhập.' }, { status: 401 });
  // Truy vấn Supabase: đọc dữ liệu từ bảng profiles
  const { data: hoSo } = await db.from('profiles').select('role').eq('id', user.id).maybeSingle();
  // Kiểm tra xác thực tài khoản, vai trò giáo viên hoặc điều kiện đồng ý
  if (!laVaiTroGV(hoSo?.role)) {
    return NextResponse.json({ error: 'Chỉ giáo viên mới tải được gói sao lưu.' }, { status: 403 });
  }

  const lops = await lopCuaToi(db);
  const allowedClassIds = lops.map((l) => l.class_id);

  const sd = supabaseAdmin();
  // Đọc danh sách học sinh và attempt_id thuộc phạm vi lopCuaToi trước khi xuất
  const allowedStudentIds: string[] = [];
  for (let i = 0; i < allowedClassIds.length; i += LO_IN) {
    const lo = allowedClassIds.slice(i, i + LO_IN);
    for (let tu = 0; ; tu += TRANG) {
      // Truy vấn Supabase: đọc dữ liệu từ bảng students
      const { data, error } = await sd.from('students').select('student_id').in('class_id', lo).order('student_id').range(tu, tu + TRANG - 1);
      if (error || !data?.length) break;
      allowedStudentIds.push(...data.map((s) => String(s.student_id)));
      if (data.length < TRANG) break;
    }
  }

  const allowedAttemptIds: number[] = [];
  for (let i = 0; i < allowedStudentIds.length; i += LO_IN) {
    const lo = allowedStudentIds.slice(i, i + LO_IN);
    for (let tu = 0; ; tu += TRANG) {
      // Truy vấn Supabase: đọc dữ liệu từ bảng quiz_attempts
      const { data, error } = await sd.from('quiz_attempts').select('attempt_id').in('student_id', lo).order('attempt_id').range(tu, tu + TRANG - 1);
      if (error || !data?.length) break;
      allowedAttemptIds.push(...data.map((a) => Number(a.attempt_id)));
      if (data.length < TRANG) break;
    }
  }

  const luc = new Date();
  // Xử lý mốc ngày giờ theo múi giờ Việt Nam (UTC+7)
  const ngay = homNayVN();
  const goc = `sao-luu-${ngay}`;

  const muc: { ten: string; noiDung: string | Uint8Array }[] = [];
  const bangKe: string[] = [];

  for (const b of BANG) {
    const ds: any[] = [];
    let loi = '';
    const locTheo = b.phamVi === 'lop'
      ? { cot: 'class_id', ids: allowedClassIds }
      : b.phamVi === 'hs'
        ? { cot: 'student_id', ids: allowedStudentIds }
        : b.phamVi === 'luot'
          ? { cot: 'attempt_id', ids: allowedAttemptIds }
          : null;

    if (locTheo && !locTheo.ids.length) {
      muc.push({ ten: `${goc}/${b.ten}.csv`, noiDung: sangCsv([]) });
      bangKe.push(`${b.ten.padEnd(22)} ${String(0).padStart(7)} dòng` + (b.ghiChu ? `   (${b.ghiChu})` : ''));
      continue;
    }

    const nhomIds = locTheo
      ? Array.from({ length: Math.ceil(locTheo.ids.length / LO_IN) }, (_, k) => locTheo.ids.slice(k * LO_IN, (k + 1) * LO_IN))
      : [null];

    for (const lo of nhomIds) {
      for (let tu = 0; ; tu += TRANG) {
        let q = sd.from(b.ten).select(b.cot ?? '*').range(tu, tu + TRANG - 1);
        if (locTheo && lo) q = q.in(locTheo.cot, lo);
        if (b.thuTu) q = q.order(b.thuTu, { ascending: true, nullsFirst: true });
        const { data, error } = await q;
        if (error) { loi = error.message; break; }
        if (!data?.length) break;
        ds.push(...data);
        if (data.length < TRANG) break;
      }
      if (loi) break;
    }

    if (loi) {
      bangKe.push(`${b.ten.padEnd(22)} BỎ QUA — ${loi}`);
      continue;
    }
    muc.push({ ten: `${goc}/${b.ten}.csv`, noiDung: sangCsv(ds) });
    bangKe.push(`${b.ten.padEnd(22)} ${String(ds.length).padStart(7)} dòng`
      + (b.ghiChu ? `   (${b.ghiChu})` : ''));
  }

  // ---- mã băm SHA-256 từng tệp, tính trên đúng byte đã đưa vào gói
  const bam = muc.map((m) => {
    const du = typeof m.noiDung === 'string' ? Buffer.from(m.noiDung, 'utf8') : Buffer.from(m.noiDung);
    return `${createHash('sha256').update(du).digest('hex')}  ${m.ten.slice(goc.length + 1)}`;
  });

  const gioVN = luc.toLocaleString('vi-VN', { timeZone: 'Asia/Ho_Chi_Minh' });

  muc.push({ ten: `${goc}/MA-BAM.txt`, noiDung:
`Mã băm SHA-256 của từng tệp trong gói này
Xuất lúc ${gioVN} (giờ Việt Nam)

Kiểm tra lại về sau:
  Windows PowerShell:  Get-FileHash .\\<tên tệp>.csv -Algorithm SHA256
  Linux / macOS:       sha256sum <tên tệp>.csv
  Kiểm tra cả gói:     sha256sum -c MA-BAM.txt

Mã băm khớp nghĩa là tệp không bị sửa một byte nào kể từ lúc xuất.
Hãy sao mấy dòng dưới đây vào sổ nhật ký nghiên cứu ngay hôm nay — mã băm chỉ có
giá trị làm chứng khi nó được ghi lại vào đúng ngày xuất dữ liệu.

${bam.join('\n')}
` });

  muc.push({ ten: `${goc}/THONG-TIN.txt`, noiDung:
`GÓI SAO LƯU DỮ LIỆU NGHIÊN CỨU
Dự án: hệ thống lớp học đảo ngược thích ứng — Toán 9 (FlipMath9)

Xuất lúc      ${gioVN} (giờ Việt Nam)
Người xuất    ${user.email ?? user.id}
Phạm vi lớp   ${allowedClassIds.join(', ') || '(trống)'}
Số tệp CSV    ${muc.length}

CẤT Ở ĐÂU
  Giải nén vào 03-Du-lieu-goc/ và giữ nguyên tên thư mục ${goc} — tên mang ngày
  xuất, nhờ vậy nhiều gói của nhiều tuần nằm cạnh nhau mà không ghi đè lẫn nhau.
  Giữ thêm một bản ở nơi khác máy này: ổ ngoài, hoặc thư mục đồng bộ lên mạng.
  Một bản sao lưu nằm cùng ổ với dữ liệu gốc thì không phải là bản sao lưu.

KHÔNG CÓ HỌ TÊN HỌC SINH TRONG GÓI NÀY
  Khoá của mọi bảng là mã nghiên cứu. Cột display_name của bảng students và cột
  full_name của bảng profiles đã được loại bỏ khi xuất. Bảng nối mã nghiên cứu
  với họ tên do người hướng dẫn giữ ngoài hệ thống, không nằm ở đây, và không
  bao giờ được cất cùng gói này.

ĐỌC TỆP CSV
  Mỗi tệp mở bằng Excel được, đã có dấu BOM nên chữ Việt hiện đúng, không cần
  đặt lại bảng mã. Ô trống nghĩa là CHƯA ĐO ĐƯỢC, không phải bằng không — đừng
  thay ô trống bằng số 0 khi phân tích.

  Gói này chỉ gồm các lớp thầy cô được phân quyền, bao gồm cả lớp DEMO nếu được gán
  và cả học sinh chưa đồng thuận tham gia. KHÔNG dùng trực tiếp để phân tích.
  Tệp dùng cho phân tích lấy ở /api/xuat-du-lieu — tệp đó chỉ chứa lớp TN và DC,
  và chỉ học sinh có consent_status = 'dong-y'.

SỐ DÒNG TỪNG BẢNG LÚC XUẤT
${bangKe.map((d) => '  ' + d).join('\n')}

Số dòng tuần này ít hơn tuần trước là dấu hiệu có gì đó đã bị xoá — mở
/gv/tu-kiem-tra và tìm cho ra nguyên nhân trước khi chạy tiếp.
` });

  const zip = taoZip(muc, luc);

  return new NextResponse(Buffer.from(zip), {
    headers: {
      'Content-Type': 'application/zip',
      'Content-Disposition': `attachment; filename="${goc}.zip"`,
      'Content-Length': String(zip.length),
      'Cache-Control': 'no-store'
    }
  });
}
