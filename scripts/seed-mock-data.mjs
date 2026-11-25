/**
 * DFLE-M7 · SCRIPT NẠP 40 HỌC SINH MÔ PHỎNG QUA SUPABASE API
 * ---------------------------------------------------------------------------
 * Chạy bằng lệnh: node scripts/seed-mock-data.mjs
 *
 * Tự động đọc NEXT_PUBLIC_SUPABASE_URL và SUPABASE_SERVICE_ROLE_KEY từ .env.local.
 * Nạp đầy đủ 40 học sinh vào Supabase:
 *   - auth.users (mật khẩu HocSinh@123 để đăng nhập thử trực tiếp)
 *   - students, profiles
 *   - mastery_states (40 HS x 14 KU)
 *   - quiz_attempts & quiz_answers (kèm mã lỗi E-DN-02, E-CT-01, E-DN-01)
 *   - recommendations (R06, R05, R04, R03, R02, R01)
 *   - learning_events & micro_lesson_events
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createClient } from '@supabase/supabase-js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Đọc .env.local
const envPath = path.resolve(__dirname, '../.env.local');
if (fs.existsSync(envPath)) {
  const lines = fs.readFileSync(envPath, 'utf8').split('\n');
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const [key, ...vals] = trimmed.split('=');
    if (key && vals.length) {
      process.env[key.trim()] = vals.join('=').trim();
    }
  }
}

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const domain = process.env.NEXT_PUBLIC_STUDENT_EMAIL_DOMAIN || 'hs.dfle.local';

if (!supabaseUrl || !serviceKey) {
  console.error('❌ Thiếu NEXT_PUBLIC_SUPABASE_URL hoặc SUPABASE_SERVICE_ROLE_KEY trong .env.local');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, serviceKey, {
  auth: { autoRefreshToken: false, persistSession: false }
});

const STUDENTS = [
  { id: 'hs001', name: 'Nguyễn Minh An',   gender: 'nam', base: 9.5, group: 1, score: 10.0, time: 420 },
  { id: 'hs002', name: 'Trần Bảo Anh',     gender: 'nu',  base: 9.5, group: 1, score: 10.0, time: 390 },
  { id: 'hs003', name: 'Lê Hoàng Bách',    gender: 'nam', base: 9.0, group: 1, score: 9.5,  time: 450 },
  { id: 'hs004', name: 'Phạm Quỳnh Chi',   gender: 'nu',  base: 9.0, group: 1, score: 9.5,  time: 410 },
  { id: 'hs005', name: 'Đỗ Tiến Dũng',     gender: 'nam', base: 8.5, group: 1, score: 9.0,  time: 480 },
  { id: 'hs006', name: 'Vũ Thu Giang',     gender: 'nu',  base: 8.5, group: 1, score: 9.0,  time: 430 },
  { id: 'hs007', name: 'Ngô Gia Huy',      gender: 'nam', base: 8.5, group: 1, score: 9.0,  time: 510 },
  { id: 'hs008', name: 'Hoàng Thảo Linh',  gender: 'nu',  base: 8.5, group: 1, score: 9.0,  time: 460 },
  { id: 'hs009', name: 'Bùi Quang Minh',   gender: 'nam', base: 8.0, group: 2, score: 8.5,  time: 520 },
  { id: 'hs010', name: 'Đặng Yến Nhi',     gender: 'nu',  base: 8.0, group: 2, score: 8.5,  time: 490 },
  { id: 'hs011', name: 'Dương Tuấn Kiệt',  gender: 'nam', base: 8.0, group: 2, score: 8.0,  time: 540 },
  { id: 'hs012', name: 'Hà Trúc Mai',      gender: 'nu',  base: 7.5, group: 2, score: 8.0,  time: 510 },
  { id: 'hs013', name: 'Hồ Đăng Khoa',     gender: 'nam', base: 7.5, group: 2, score: 8.0,  time: 480 },
  { id: 'hs014', name: 'Khổng Tú Oanh',    gender: 'nu',  base: 7.5, group: 2, score: 7.5,  time: 560 },
  { id: 'hs015', name: 'Lưu Hải Nam',      gender: 'nam', base: 7.5, group: 2, score: 7.5,  time: 530 },
  { id: 'hs016', name: 'Mai Phương Nga',   gender: 'nu',  base: 7.0, group: 2, score: 7.5,  time: 495 },
  { id: 'hs017', name: 'Nghiêm Xuân Phúc', gender: 'nam', base: 7.0, group: 2, score: 7.0,  time: 600 },
  { id: 'hs018', name: 'Phan Khánh Ngọc',  gender: 'nu',  base: 7.0, group: 2, score: 7.0,  time: 580 },
  { id: 'hs019', name: 'Quách Thái Sơn',   gender: 'nam', base: 7.0, group: 2, score: 7.0,  time: 510 },
  { id: 'hs020', name: 'Tạ Thảo Nguyên',   gender: 'nu',  base: 6.5, group: 2, score: 7.0,  time: 540 },
  { id: 'hs021', name: 'Tiêu Vĩnh Phát',   gender: 'nam', base: 6.5, group: 2, score: 6.5,  time: 620 },
  { id: 'hs022', name: 'Trịnh Cẩm Tú',     gender: 'nu',  base: 6.5, group: 2, score: 6.5,  time: 590 },
  { id: 'hs023', name: 'Ung Hoài Thu',     gender: 'nu',  base: 6.5, group: 2, score: 6.5,  time: 610 },
  { id: 'hs024', name: 'Vương Quốc Bảo',   gender: 'nam', base: 6.5, group: 2, score: 6.5,  time: 630 },
  { id: 'hs025', name: 'Đoàn Minh Khang',  gender: 'nam', base: 6.0, group: 2, score: 6.5,  time: 570 },
  { id: 'hs026', name: 'Lương Ánh Dương',  gender: 'nu',  base: 6.0, group: 2, score: 6.5,  time: 605 },
  { id: 'hs027', name: 'Cao Văn Hùng',     gender: 'nam', base: 5.5, group: 3, score: 5.5,  time: 680 },
  { id: 'hs028', name: 'Châu Kim Liên',    gender: 'nu',  base: 5.0, group: 3, score: 5.0,  time: 720 },
  { id: 'hs029', name: 'Đỗ Mạnh Cường',    gender: 'nam', base: 5.0, group: 3, score: 5.0,  time: 650 },
  { id: 'hs030', name: 'Giang Hoài Nam',   gender: 'nam', base: 4.5, group: 3, score: 4.5,  time: 710 },
  { id: 'hs031', name: 'Huỳnh Tấn Đạt',    gender: 'nam', base: 4.5, group: 3, score: 4.5,  time: 690 },
  { id: 'hs032', name: 'Lâm Mỹ Duyên',     gender: 'nu',  base: 4.0, group: 3, score: 4.0,  time: 750 },
  { id: 'hs033', name: 'Mạc Đăng Khoa',    gender: 'nam', base: 4.0, group: 3, score: 4.0,  time: 780 },
  { id: 'hs034', name: 'Ninh Hồng Nhung',  gender: 'nu',  base: 4.0, group: 3, score: 3.5,  time: 810 },
  { id: 'hs035', name: 'Tôn Thất Bình',    gender: 'nam', base: 3.5, group: 3, score: 3.5,  time: 760 },
  { id: 'hs036', name: 'Vi Nhật Long',     gender: 'nam', base: 3.5, group: 3, score: 3.5,  time: 830 },
  { id: 'hs037', name: 'Lâm Chí Thiện',    gender: 'nam', base: 3.0, group: 4, score: 2.0,  time: 32 },  // R04 đoán mò
  { id: 'hs038', name: 'Tạ Đức Trọng',     gender: 'nam', base: 3.5, group: 4, score: 2.5,  time: 700 }, // R01 xem thụ động
  { id: 'hs039', name: 'Vòng Chí Hào',     gender: 'nam', base: 3.0, group: 4, score: null, time: 0 },   // R07 vắng
  { id: 'hs040', name: 'Mã Gia Hân',       gender: 'nu',  base: 3.0, group: 4, score: null, time: 0 }    // Chưa nộp bài
];

const KUS = [
  'C1-B1-M1', 'C1-B1-M1B', 'C1-B1-M2', 'C1-B2-M1', 'C1-B2-M2',
  'C1-B2-M3', 'C1-LTC1', 'C1-B3-M1', 'C1-B3-M2', 'C1-B3-M3',
  'C1-B4-M1', 'C1-B4-M2', 'C1-LTC2', 'C1-CUOI'
];

async function main() {
  console.log('🚀 Bắt đầu nạp 40 học sinh mô phỏng vào Supabase...');

  // 1. Tìm hoặc tạo lớp 7A1
  let classId = '7A1';
  let teacherId = null;

  const { data: cls } = await supabase.from('classes').select('class_id, teacher_id').eq('class_code', '7A1').maybeSingle();
  if (cls) {
    classId = cls.class_id;
    teacherId = cls.teacher_id;
  } else {
    const { data: anyCls } = await supabase.from('classes').select('class_id, teacher_id').not('teacher_id', 'is', null).limit(1).maybeSingle();
    if (anyCls) {
      classId = anyCls.class_id;
      teacherId = anyCls.teacher_id;
    } else {
      const { data: prof } = await supabase.from('profiles').select('id').eq('role', 'giao-vien').limit(1).maybeSingle();
      teacherId = prof?.id ?? null;
      await supabase.from('classes').upsert({
        class_id: '7A1',
        class_code: '7A1',
        grade: 7,
        arm: 'TN',
        teacher_id: teacherId
      });
    }
  }

  console.log(`📍 Lớp mục tiêu: ${classId} (Giáo viên UID: ${teacherId || 'chưa gán'})`);

  // 2. Kế hoạch tuần
  for (let w = 1; w <= 4; w++) {
    await supabase.from('week_plan').upsert({ class_id: classId, tuan: w, so_tiet_ke_hoach: 3 });
  }

  // 3. Nạp danh sách học sinh vào bảng students
  console.log('👥 Đang nạp danh sách 40 học sinh...');
  for (const s of STUDENTS) {
    await supabase.from('students').upsert({
      student_id: s.id,
      class_id: classId,
      display_name: s.name,
      gender: s.gender,
      baseline_math: s.base,
      consent_status: s.id === 'hs040' ? 'chua' : 'dong-y'
    });

    // Tuỳ chọn tạo Auth User để giáo viên có thể đăng nhập thử góc nhìn học sinh
    const email = `${s.id}@7a1.${domain}`;
    try {
      const { data: authUser } = await supabase.auth.admin.createUser({
        email,
        password: 'HocSinh@123',
        email_confirm: true,
        user_metadata: { role: 'hoc-sinh', class_id: classId }
      });
      if (authUser?.user) {
        await supabase.from('profiles').upsert({
          id: authUser.user.id,
          role: 'hoc-sinh',
          student_id: s.id,
          class_id: classId,
          full_name: s.name
        });
      }
    } catch {
      // Bỏ qua nếu user đã tồn tại trong Auth
    }
  }

  // 4. Nạp Mastery States (40 HS x 14 KU)
  console.log('🗺️ Đang nạp ma trận Mastery (Class Heatmap 40x14)...');
  const masteryRows = [];
  for (const s of STUDENTS) {
    for (let idx = 0; idx < KUS.length; idx++) {
      const ku = KUS[idx];
      let level = 0;
      if (s.group === 1) {
        level = idx <= 4 ? 3 : idx <= 7 ? 2 : 1;
      } else if (s.group === 2) {
        level = idx <= 2 ? (['hs009','hs010','hs011','hs012'].includes(s.id) ? 3 : 2) :
                (ku === 'C1-B2-M1' || ku === 'C1-B2-M2') ? 2 :
                idx <= 6 ? 1 : 0;
      } else if (s.group === 3) {
        if (['hs029','hs032','hs034','hs035','hs036'].includes(s.id) && ku === 'C1-B2-M1') {
          level = 0; // Hổng tiên quyết R05
        } else if (idx <= 2) {
          level = 1;
        } else if (ku === 'C1-B2-M2') {
          level = ['hs027','hs028','hs030','hs031'].includes(s.id) ? 1 : 0;
        } else {
          level = 0;
        }
      } else {
        level = idx <= 1 ? 1 : 0;
      }

      masteryRows.push({
        student_id: s.id,
        ku_id: ku,
        mastery_level: level,
        updated_at: new Date(Date.now() - idx * 86400000).toISOString()
      });
    }
  }

  for (let i = 0; i < masteryRows.length; i += 100) {
    await supabase.from('mastery_states').upsert(masteryRows.slice(i, i + 100));
  }

  // 5. Nạp Quiz Attempts & Answers cho C1-B2-M2
  console.log('📝 Đang nạp bài làm Quiz chuẩn bị và vận dụng...');
  for (const s of STUDENTS) {
    if (s.score === null) continue; // Chưa nộp bài

    const isGroup1 = s.group === 1;
    const isGroup2 = s.group === 2;
    const isGroup3 = s.group === 3;
    const isGuessing = s.id === 'hs037';

    // Pre-test attempt
    const { data: att } = await supabase.from('quiz_attempts').insert({
      student_id: s.id,
      ku_id: 'C1-B2-M2',
      attempt_no: 1,
      score: s.score,
      time_on_task_sec: s.time,
      started_at: new Date(Date.now() - 18 * 3600000).toISOString(),
      submitted_at: new Date(Date.now() - 17 * 3600000).toISOString(),
      kind: 'chuan-bi'
    }).select('attempt_id').single();

    if (att?.attempt_id) {
      const err = (s.id.charCodeAt(4) % 2 === 0) ? 'E-DN-02' : 'E-DN-01';
      const answers = [
        {
          attempt_id: att.attempt_id,
          question_id: 'C1-B2-M2-Q01',
          chosen_option: isGroup3 ? 'B' : 'A',
          is_correct: !isGroup3,
          error_code: isGroup3 ? 'E-DN-01' : null,
          answer_time_sec: 50
        },
        {
          attempt_id: att.attempt_id,
          question_id: 'C1-B2-M2-Q02',
          chosen_option: (s.score <= 7.0) ? 'B' : 'A',
          is_correct: s.score > 7.0,
          error_code: s.score <= 7.0 ? 'E-DN-01' : null,
          answer_time_sec: 65
        },
        {
          attempt_id: att.attempt_id,
          question_id: 'C1-B2-M2-Q03',
          chosen_option: (s.score < 8.5 && err === 'E-DN-02') || isGroup3 ? 'B' : 'A',
          is_correct: !( (s.score < 8.5 && err === 'E-DN-02') || isGroup3 ),
          error_code: ((s.score < 8.5 && err === 'E-DN-02') || isGroup3) ? 'E-DN-02' : null,
          answer_time_sec: 80
        },
        {
          attempt_id: att.attempt_id,
          question_id: 'C1-B2-M2-Q04',
          chosen_option: (s.score < 5.0) ? 'B' : 'A',
          is_correct: s.score >= 5.0,
          error_code: s.score < 5.0 ? 'E-DN-01' : null,
          answer_time_sec: 90
        },
        {
          attempt_id: att.attempt_id,
          question_id: 'C1-B2-M2-Q05',
          chosen_option: (s.score <= 7.5) ? 'B' : 'A',
          is_correct: s.score > 7.5,
          error_code: s.score <= 7.5 ? 'E-DN-01' : null,
          answer_time_sec: 120
        }
      ];
      await supabase.from('quiz_answers').upsert(answers);
    }
  }

  // 6. Nạp Khuyến nghị & Hiệu quả can thiệp T6
  console.log('🎯 Đang nạp các khuyến nghị sư phạm (R01..R06)...');
  // R06 cho nhóm 1
  for (let i = 0; i < 8; i++) {
    await supabase.from('recommendations').insert({
      student_id: STUDENTS[i].id,
      ku_id: 'C1-B2-M2',
      trigger_rule: 'R06',
      diagnosis: 'Đã làm chủ kiến thức C1-B2-M2 (điểm >= 9.0). Đề xuất làm hạt nhân hỗ trợ nhóm.',
      action: 'Giao nhiệm vụ trưởng nhóm tương trợ Jigsaw trong tiết học trên lớp.',
      accepted: true
    });
  }

  // R03 cho hs028, hs033
  for (const sid of ['hs028', 'hs033']) {
    await supabase.from('recommendations').insert({
      student_id: sid,
      ku_id: 'C1-B2-M2',
      trigger_rule: 'R03',
      diagnosis: 'Quan niệm sai lặp lại: Đặt dấu ngoặc có dấu trừ đằng trước không đổi dấu (E-DN-02)',
      action: 'Giao vi bài học sửa lỗi VBH-DN-02',
      recommended_content: 'VBH-DN-02',
      accepted: true,
      pre_score: 4.5,
      post_score: 7.5
    });
  }

  // R05 cho 5 em hổng tiên quyết
  for (const sid of ['hs029','hs032','hs034','hs035','hs036']) {
    await supabase.from('recommendations').insert({
      student_id: sid,
      ku_id: 'C1-B2-M2',
      trigger_rule: 'R05',
      diagnosis: 'Hổng kiến thức nền tiên quyết: Chưa thành thạo cộng trừ phân số khác mẫu (C1-B2-M1)',
      action: 'Giao vi bài học ôn tập tiên quyết VBH-CT-01',
      recommended_content: 'VBH-CT-01',
      accepted: true,
      pre_score: 4.0,
      post_score: 6.5
    });
  }

  // R04 cho hs037
  await supabase.from('recommendations').insert({
    student_id: 'hs037',
    ku_id: 'C1-B2-M2',
    trigger_rule: 'R04',
    diagnosis: 'Làm bài trong 32 giây (dưới 1/3 thời gian chuẩn), điểm thấp (2.0/10). Nghi đoán mò.',
    action: 'Khoá làm lại tạm thời, yêu cầu xem lại video bài học trước khi mở khoá.',
    accepted: true,
    pre_score: 2.0
  });

  // R01 cho hs038
  await supabase.from('recommendations').insert({
    student_id: 'hs038',
    ku_id: 'C1-B2-M2',
    trigger_rule: 'R01',
    diagnosis: 'Đã xem 100% thời lượng video bài học nhưng quiz chuẩn bị chỉ đạt 2.5/10. Xem thụ động.',
    action: 'Giao vi bài học chẩn đoán khái niệm VBH-DN-01',
    recommended_content: 'VBH-DN-01',
    accepted: true,
    pre_score: 2.5,
    post_score: 5.5
  });

  // 7. Nạp Sự kiện học tập cho Chỉ số LES
  console.log('📊 Đang nạp sự kiện học tập (video_active, assignment_submit)...');
  const events = [];
  for (let i = 0; i < 36; i++) {
    const sid = STUDENTS[i].id;
    // Video
    events.push({
      student_id: sid,
      ku_id: 'C1-B2-M2',
      event_type: 'video_active',
      duration_active_sec: i < 8 ? 520 : i < 26 ? 450 : 380,
      ts: new Date(Date.now() - 86400000).toISOString()
    });
    // Nộp bài 3 ngày
    for (let d = 1; d <= 3; d++) {
      events.push({
        student_id: sid,
        ku_id: 'C1-B2-M2',
        event_type: 'assignment_submit',
        ts: new Date(Date.now() - d * 2 * 86400000).toISOString()
      });
    }
  }
  for (let i = 0; i < events.length; i += 100) {
    await supabase.from('learning_events').insert(events.slice(i, i + 100));
  }

  console.log('✅ HOÀN TẤT NẠP 40 HỌC SINH MÔ PHỎNG THÀNH CÔNG!');
  console.log('👉 Bây giờ bạn có thể tải lại trang /gv, /gv/chuan-bi, /gv/chia-nhom, /gv/phan-tich để thấy số liệu.');
}

main().catch(console.error);
