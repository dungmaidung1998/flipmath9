/**
 * FILE NÀY LÀM GÌ: API máy chủ tiếp nhận yêu cầu từ trình duyệt, kiểm tra quyền và làm việc với cơ sở dữ liệu Supabase / AI.
 * AI DÙNG: máy chủ (API)
 * ĐỊA CHỈ TRÊN WEB: /api/nhat-ky/xuat
 * LẤY DỮ LIỆU TỪ: profiles, nhat_ky_nghien_cuu
 * GỌI TỚI: @/lib/supabase/server, @/lib/dfle/ngay.js, @/lib/gv/lopCuaToi
 */
import { NextResponse } from 'next/server';
import { supabaseServer } from '@/lib/supabase/server';
import { homNayVN } from '@/lib/dfle/ngay.js';
import { laVaiTroGV } from '@/lib/gv/lopCuaToi';

export const dynamic = 'force-dynamic';

/**
 * XUẤT SỔ NHẬT KÝ NGHIÊN CỨU để nộp kèm hồ sơ.
 *
 *   /api/nhat-ky/xuat              → Markdown (mở bằng Word, in ra PDF)
 *   /api/nhat-ky/xuat?dinh-dang=csv → CSV
 *
 * Giữ nguyên cả mục đã bị đính chính lẫn mục đính chính nó — không lọc bớt.
 * Một sổ nhật ký chỉ có giá trị khi nó cho thấy cả những chỗ đã sửa.
 */

const ngayGio = (iso: string) =>
  new Date(iso).toLocaleString('vi-VN', { timeZone: 'Asia/Ho_Chi_Minh' });

const o = (v: any) => {
  if (v === null || v === undefined) return '';
  const s = String(v);
  // Biểu thức chính quy (regex) kiểm tra hoặc tách chuỗi đúng mẫu dữ liệu
  return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
};

/**
 * Xử lý HTTP GET: kiểm tra đăng nhập/quyền hạn, đọc dữ liệu và trả về JSON cho trình duyệt.
 */
export async function GET(req: Request) {
  const db = supabaseServer();
  // Kiểm tra xác thực tài khoản, vai trò giáo viên hoặc điều kiện đồng ý
  const { data: { user } } = await db.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Chưa đăng nhập.' }, { status: 401 });

  // Truy vấn Supabase: đọc dữ liệu từ bảng profiles
  const { data: hoSo } = await db.from('profiles').select('role').eq('id', user.id).maybeSingle();
  // Kiểm tra xác thực tài khoản, vai trò giáo viên hoặc điều kiện đồng ý
  if (!laVaiTroGV(hoSo?.role) && hoSo?.role !== 'hoc-sinh-nckh') {
    return NextResponse.json({ error: 'Không có quyền.' }, { status: 403 });
  }

  const { data, error } = await db
    .from('nhat_ky_nghien_cuu').select('*')
    .order('ngay', { ascending: true }).order('ghi_luc', { ascending: true });
  if (error) return NextResponse.json({ error: error.message }, { status: 503 });

  const ds = data ?? [];
  // Xử lý mốc ngày giờ theo múi giờ Việt Nam (UTC+7)
  const ngay = homNayVN();
  const csv = new URL(req.url).searchParams.get('dinh-dang') === 'csv';

  if (csv) {
    const cot = ['ngay_lam_viec', 'gio_ghi', 'nguoi_ghi', 'vai_tro', 'cong_viec', 'phuong_phap',
                 'ket_qua', 'ai_lam_phan_nao', 'cong_cu_ai', 'dinh_chinh_cho', 'ly_do_dinh_chinh',
                 'gio_xac_nhan'];
    const than = '﻿' + [cot.join(','), ...ds.map((m: any) => [
      m.ngay, m.ghi_luc, m.tac_gia_ten, m.tac_gia_vai, m.cong_viec, m.phuong_phap, m.ket_qua,
      m.vai_tro, m.cong_cu_ai, m.thay_cho, m.ly_do_sua, m.xac_nhan_luc
    ].map(o).join(','))].join('\n') + '\n';
    return new NextResponse(than, {
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': `attachment; filename="nhat-ky-nghien-cuu-${ngay}.csv"`,
        'Cache-Control': 'no-store'
      }
    });
  }

  const dong: string[] = [
    '# Sổ nhật ký nghiên cứu',
    '',
    `Xuất ngày ${new Date().toLocaleString('vi-VN', { timeZone: 'Asia/Ho_Chi_Minh' })} · ${ds.length} mục.`,
    '',
    'Mỗi mục ghi hai mốc thời gian: **ngày làm việc** do người ghi khai, và **giờ ghi** do',
    'máy chủ đóng khi mục được lưu. Mục đã ghi không sửa và không xoá được; chỗ nào cần',
    'đính chính thì có một mục mới nêu rõ lý do, và mục cũ vẫn giữ nguyên trong sổ.',
    ''
  ];

  for (const m of ds as any[]) {
    dong.push(`## ${new Date(m.ngay + 'T00:00:00').toLocaleDateString('vi-VN')} — ${m.tac_gia_ten}`
      + (laVaiTroGV(m.tac_gia_vai) ? ' (giáo viên hướng dẫn)' : ''));
    dong.push('');
    dong.push(`*Ghi lúc ${ngayGio(m.ghi_luc)}`
      + (m.xac_nhan_luc ? ` · giáo viên xác nhận lúc ${ngayGio(m.xac_nhan_luc)}` : ' · chưa xác nhận') + '*');
    dong.push('');
    if (m.thay_cho) { dong.push(`> **Đính chính.** ${m.ly_do_sua}`); dong.push(''); }
    dong.push(`**Đã làm:** ${m.cong_viec}`);
    if (m.phuong_phap) dong.push(`\n**Cách làm:** ${m.phuong_phap}`);
    if (m.ket_qua) dong.push(`\n**Kết quả:** ${m.ket_qua}`);
    if (m.vai_tro) dong.push(`\n**Ai làm phần nào:** ${m.vai_tro}`);
    if (m.cong_cu_ai) dong.push(`\n**Công cụ AI:** ${m.cong_cu_ai}`);
    dong.push('');
  }

  return new NextResponse(dong.join('\n'), {
    headers: {
      'Content-Type': 'text/markdown; charset=utf-8',
      'Content-Disposition': `attachment; filename="nhat-ky-nghien-cuu-${ngay}.md"`,
      'Cache-Control': 'no-store'
    }
  });
}
