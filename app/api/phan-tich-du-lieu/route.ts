/**
 * FILE NÀY LÀM GÌ: API máy chủ tiếp nhận yêu cầu từ trình duyệt, kiểm tra quyền và làm việc với cơ sở dữ liệu Supabase / AI.
 * AI DÙNG: máy chủ (API)
 * ĐỊA CHỈ TRÊN WEB: /api/phan-tich-du-lieu
 * LẤY DỮ LIỆU TỪ: profiles
 * GỌI TỚI: @/lib/supabase/server, @/lib/phanTichTinh, @/lib/dfle/ngay.js, @/lib/gv/lopCuaToi
 */
import { NextResponse } from 'next/server';
import { supabaseServer } from '@/lib/supabase/server';
import { tinhPhanTich } from '@/lib/phanTichTinh';
import { homNayVN } from '@/lib/dfle/ngay.js';
import { laVaiTroGV } from '@/lib/gv/lopCuaToi';

export const dynamic = 'force-dynamic';

/**
 * XUẤT CSV CHO TRANG /gv/phan-tich
 *
 * Số liệu tính bằng đúng một hàm với trang web (lib/phanTichTinh.ts), nên tệp
 * tải về và bảng trên màn hình không bao giờ lệch nhau.
 *
 * Tệp KHÔNG chứa họ tên học sinh — chỉ mã nghiên cứu, đúng như tệp xuất dữ liệu
 * nghiên cứu. Bảng nối mã ↔ họ tên giữ ngoài hệ thống.
 *
 * Đây là dữ liệu phân tích thuật toán, không phải kết quả thực nghiệm. Con số ở
 * đây chỉ nói bộ máy chạy thế nào, chưa nói mô hình dạy học có tác dụng hay không.
 */

const LOAI = ['bkt', 'so-sanh', 'cau-hoi', 'phuong-an', 'quan-niem-sai'] as const;

const o = (v: any) => {
  if (v === null || v === undefined) return '';
  const s = String(v);
  // Biểu thức chính quy (regex) kiểm tra hoặc tách chuỗi đúng mẫu dữ liệu
  return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
};
const toCsv = (cot: string[], dong: any[][]) =>
  '﻿' + [cot.join(','), ...dong.map((d) => d.map(o).join(','))].join('\n') + '\n';

/**
 * Xử lý HTTP GET: kiểm tra đăng nhập/quyền hạn, đọc dữ liệu và trả về JSON cho trình duyệt.
 */
export async function GET(req: Request) {
  const supabase = supabaseServer();
  // Kiểm tra xác thực tài khoản, vai trò giáo viên hoặc điều kiện đồng ý
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Chưa đăng nhập.' }, { status: 401 });
  // Truy vấn Supabase: đọc dữ liệu từ bảng profiles
  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).maybeSingle();
  // Kiểm tra xác thực tài khoản, vai trò giáo viên hoặc điều kiện đồng ý
  if (!laVaiTroGV(profile?.role)) {
    return NextResponse.json({ error: 'Chỉ giáo viên được truy cập.' }, { status: 403 });
  }

  const sp = new URL(req.url).searchParams;
  const kind = sp.get('kind') ?? 'bkt';
  const lop = sp.get('lop');
  if (!LOAI.includes(kind as any)) {
    return NextResponse.json({ error: `kind phải là một trong: ${LOAI.join(', ')}` }, { status: 400 });
  }

  let r: Awaited<ReturnType<typeof tinhPhanTich>>;
  try {
    r = await tinhPhanTich(supabase, lop);
  } catch (e: any) {
    return NextResponse.json({ error: e?.message ?? 'Không đọc được dữ liệu.' }, { status: 503 });
  }

  // Xử lý mốc ngày giờ theo múi giờ Việt Nam (UTC+7)
  const ngay = homNayVN();
  let ten = '', than = '';

  if (kind === 'bkt') {
    ten = `bkt-trang-thai-${ngay}.csv`;
    than = toCsv(
      ['student_id', 'ku_id', 'so_cau', 'bkt_p_nam', 'bkt_da_nam', 'mastery_v2', 'v2_ti_le_dung'],
      r.trangThai.map((t) => [t.studentId, t.kuId, t.soCau, t.pNam, t.bktDaNam ? 1 : 0,
        t.masteryV2 === null ? '' : t.masteryV2, t.tiLeDungV2])
    );
  }

  if (kind === 'so-sanh') {
    ten = `bkt-so-sanh-${ngay}.csv`;
    const s = r.soSanh, m = r.soSanhMacDinh;
    const dong: any[][] = s && m ? [
      ['BKT tham so uoc luong', s.bkt.auc, s.bkt.logLoss, s.soDuDoan, s.soHocSinh],
      ['BKT tham so mac dinh', m.bkt.auc, m.bkt.logLoss, m.soDuDoan, m.soHocSinh],
      ['Mastery v2', s.masteryV2.auc, s.masteryV2.logLoss, s.soDuDoan, s.soHocSinh]
    ] : [];
    than = toCsv(['phuong_an', 'auc', 'log_loss', 'so_du_doan', 'so_hoc_sinh'], dong)
      + '\n' + toCsv(['tham_so', 'gia_tri'],
        Object.entries(r.thamSo).map(([k, v]) => [k, v])
          .concat([['uoc_luong_tu_du_lieu', r.thamSoLaUocLuong ? 1 : 0], ['nguong_da_nam', r.nguongDaNam]]));
  }

  if (kind === 'cau-hoi') {
    ten = `phan-tich-cau-hoi-${ngay}.csv`;
    than = toCsv(
      ['question_id', 'ku_id', 'level', 'so_luot', 'du_du_lieu', 'do_kho', 'do_phan_biet', 'canh_bao'],
      r.cauHoi.cauHoi.map((c: any) => [c.questionId, c.kuId, c.level, c.soLuot, c.duDuLieu ? 1 : 0,
        c.doKho, c.doPhanBiet, c.canhBao.join(' | ')])
    );
  }

  if (kind === 'phuong-an') {
    ten = `phan-tich-phuong-an-${ngay}.csv`;
    than = toCsv(
      ['question_id', 'ku_id', 'level', 'phuong_an', 'la_dap_an', 'ma_loi', 'so_chon', 'ti_le', 'nang_luc_tb_nhom_chon'],
      r.cauHoi.cauHoi.flatMap((c: any) => c.phuongAn.map((p: any) =>
        [c.questionId, c.kuId, c.level, p.phuongAn, p.laDapAn ? 1 : 0, p.maLoi, p.soChon, p.tiLe, p.nangLucTB]))
    );
  }

  if (kind === 'quan-niem-sai') {
    ten = `quan-niem-sai-${ngay}.csv`;
    than = toCsv(
      ['ma_loi', 'so_phuong_an_gan', 'so_lan_chon', 'so_hoc_sinh_mac', 'so_hoc_sinh_lap_lai'],
      r.cauHoi.quanNiemSai.map((q: any) => [q.maLoi, q.soPhuongAnGan, q.soLanChon, q.soHocSinhMac, q.soHocSinhLapLai])
    );
  }

  return new NextResponse(than, {
    headers: {
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': `attachment; filename="${ten}"`,
      'Cache-Control': 'no-store'
    }
  });
}
