/**
 * FILE NÀY LÀM GÌ: API máy chủ phục vụ giáo viên xử lý dữ liệu lớp học, thống kê hoặc thao tác quản lý trên Supabase.
 * AI DÙNG: máy chủ (API)
 * ĐỊA CHỈ TRÊN WEB: /api/gv/khbd
 * LẤY DỮ LIỆU TỪ: profiles
 * GỌI TỚI: @/lib/supabase/server, @/lib/gv/manChinh, @/lib/gv/lopCuaToi, @/lib/dfle/t9-noi-dung.js
 */
import { NextResponse } from 'next/server';
import { AlignmentType, Document, HeadingLevel, Packer, Paragraph, TextRun } from 'docx';
import { supabaseServer } from '@/lib/supabase/server';
import { napManChinh } from '@/lib/gv/manChinh';
import { laVaiTroGV } from '@/lib/gv/lopCuaToi';
// @ts-ignore
import { UNITS } from '@/lib/dfle/t9-noi-dung.js';

export const dynamic = 'force-dynamic';

/**
 * Xuất kế hoạch bài dạy (Word) theo cấu trúc Phụ lục IV, Công văn 5512:
 * 4 hoạt động Mở đầu – Hình thành kiến thức – Luyện tập – Vận dụng, mỗi hoạt động
 * có a) Mục tiêu b) Nội dung c) Sản phẩm d) Tổ chức thực hiện.
 * Nội dung lấy từ bản gợi ý GV-17 sau khi GV đã chấp nhận / sửa / bỏ.
 * Không ghi tên HS hay lý do xếp nhóm vào văn bản.
 */
const KHUNG: Record<string, { ten5512: string; mucTieu: string; sanPham: string; buoc: string[] }> = {
  'mo-dau': {
    ten5512: 'Mở đầu', mucTieu: 'Sửa lỗi còn mắc sau tiết trước, ôn kiến thức nền cần cho bài, tạo tâm thế vào bài mới.',
    sanPham: 'Câu trả lời của HS; lỗi được chỉ ra và sửa.',
    buoc: ['GV chiếu câu hỏi/tình huống, giao nhiệm vụ cá nhân.', 'HS suy nghĩ, trả lời trên bảng con hoặc giấy.', 'Một số HS trình bày, cả lớp nhận xét.', 'GV chốt cách làm đúng và chỉ ra lỗi cần tránh.']
  },
  'giai-dap': {
    ten5512: 'Hình thành kiến thức (giải đáp và chốt kiến thức)', mucTieu: 'Giải đáp phần HS còn vướng sau khi tự học video; chốt kiến thức trọng tâm của bài.',
    sanPham: 'Kiến thức trọng tâm được HS ghi vào vở; câu hỏi của HS được trả lời.',
    buoc: ['GV nêu các nội dung HS còn vướng (từ dữ liệu chuẩn bị).', 'HS trao đổi cặp đôi, nêu cách hiểu của mình.', 'Đại diện HS trình bày; GV giảng lại đúng phần cần thiết.', 'GV chốt kiến thức, HS ghi vở.']
  },
  'luyen-tap': {
    ten5512: 'Luyện tập', mucTieu: 'Luyện tập phân hoá theo mức độ nắm bài của từng nhóm HS.',
    sanPham: 'Bài làm của các nhóm.',
    buoc: ['GV chia nhóm, phát phiếu theo nhóm.', 'HS làm bài theo nhóm; nhóm khá kèm nhóm cần hỗ trợ; GV hỗ trợ trực tiếp nhóm cần hỗ trợ.', 'Đại diện nhóm trình bày, các nhóm nhận xét chéo.', 'GV nhận xét, chốt phương pháp giải.']
  },
  'van-dung': {
    ten5512: 'Vận dụng', mucTieu: 'Vận dụng kiến thức vào bài toán thực tế, dạng đề thi vào lớp 10.',
    sanPham: 'Lời giải của HS.',
    buoc: ['GV giao bài toán vận dụng.', 'HS làm cá nhân, có thể hoàn thành ở nhà.', 'HS nộp hoặc trình bày ở tiết sau.', 'GV nhận xét, giao nhiệm vụ chuẩn bị bài sau.']
  }
};

const p = (text: string, o: { bold?: boolean; italic?: boolean; indent?: boolean; center?: boolean; size?: number } = {}) =>
  new Paragraph({
    alignment: o.center ? AlignmentType.CENTER : AlignmentType.JUSTIFIED,
    indent: o.indent ? { left: 360 } : undefined,
    spacing: { after: 80, line: 300 },
    children: [new TextRun({ text, bold: o.bold, italics: o.italic, font: 'Times New Roman', size: o.size ?? 26 })]
  });

/**
 * Xử lý HTTP GET: kiểm tra đăng nhập/quyền hạn, đọc dữ liệu và trả về JSON cho trình duyệt.
 */
export async function GET(req: Request) {
  const db = supabaseServer();
  // Kiểm tra xác thực tài khoản, vai trò giáo viên hoặc điều kiện đồng ý
  const { data: { user } } = await db.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Chưa đăng nhập' }, { status: 401 });
  // Truy vấn Supabase: đọc dữ liệu từ bảng profiles
  const { data: prof } = await db.from('profiles').select('role, full_name').eq('id', user.id).maybeSingle();
  // Kiểm tra xác thực tài khoản, vai trò giáo viên hoặc điều kiện đồng ý
  if (!laVaiTroGV(prof?.role)) return NextResponse.json({ error: 'Chỉ giáo viên' }, { status: 403 });
  const u = new URL(req.url);
  const d: any = await napManChinh(db, user.id, { lop: u.searchParams.get('lop') ?? undefined, bai: u.searchParams.get('bai') ?? undefined });
  if (!d.lop) return NextResponse.json({ error: 'Không có lớp' }, { status: 404 });

  const mucTieu = (UNITS as any[]).filter((x) => x.bai === d.bai.id).map((x) => x.mucTieu).filter(Boolean);
  const hd: any[] = d.goiY.hoatDong;
  const ds: Paragraph[] = [
    p(`Trường: ..............................    Tổ: Toán – Tin`, {}),
    p(`Họ và tên giáo viên: ${prof?.full_name ?? '..............................'}`),
    p('KẾ HOẠCH BÀI DẠY', { bold: true, center: true, size: 30 }),
    p(`${d.bai.ten.toUpperCase()}`, { bold: true, center: true }),
    p(`Môn: Toán; lớp: 9 (lớp ${d.lop.class_code}). Thời gian thực hiện: 1 tiết (45 phút)`, { center: true, italic: true }),
    p('I. MỤC TIÊU', { bold: true }),
    p('1. Kiến thức', { bold: true }),
    ...(mucTieu.length ? mucTieu.map((m) => p(`– ${m}`, { indent: true })) : [p('– (Thầy cô bổ sung)', { indent: true })]),
    p('2. Năng lực', { bold: true }),
    p('– Năng lực chung: tự chủ và tự học (tự học video, làm phiếu chuẩn bị trước giờ); giao tiếp và hợp tác (học nhóm, kèm bạn).', { indent: true }),
    p('– Năng lực toán học: tư duy và lập luận toán học; giải quyết vấn đề toán học; giao tiếp toán học.', { indent: true }),
    p('3. Phẩm chất', { bold: true }),
    p('– Chăm chỉ (hoàn thành phần chuẩn bị trước giờ), trung thực (tự đánh giá đúng mức), trách nhiệm (giúp bạn cùng tiến bộ).', { indent: true }),
    p('II. THIẾT BỊ DẠY HỌC VÀ HỌC LIỆU', { bold: true }),
    p('1. Giáo viên: máy chiếu, video bài học trên FlipMath9, phiếu luyện tập theo nhóm, báo cáo dữ liệu chuẩn bị của lớp.', { indent: true }),
    p('2. Học sinh: đã xem video và làm phiếu chuẩn bị trên FlipMath9; vở ghi, bảng con.', { indent: true }),
    p('III. TIẾN TRÌNH DẠY HỌC', { bold: true })
  ];
  hd.forEach((h, i) => {
    const k = KHUNG[h.id];
    if (!k) return;
    ds.push(new Paragraph({ heading: HeadingLevel.HEADING_3, spacing: { before: 160, after: 80 },
      children: [new TextRun({ text: `Hoạt động ${i + 1}: ${k.ten5512} (${h.bo ? 'không tổ chức' : `${h.phut} phút`})`, bold: true, font: 'Times New Roman', size: 26, color: '000000' })] }));
    if (h.bo) { ds.push(p('Giáo viên không tổ chức hoạt động này trong tiết.', { italic: true, indent: true })); return; }
    const noiDung: string[] = h.noiDungSua ? String(h.noiDungSua).split('\n').filter(Boolean) : h.noiDung;
    ds.push(p(`a) Mục tiêu: ${k.mucTieu}`, { indent: true }));
    ds.push(p('b) Nội dung:', { indent: true }));
    for (const x of noiDung) ds.push(p(`– ${x}`, { indent: true }));
    ds.push(p(`c) Sản phẩm: ${k.sanPham}`, { indent: true }));
    ds.push(p('d) Tổ chức thực hiện:', { indent: true }));
    ['Giao nhiệm vụ', 'Thực hiện nhiệm vụ', 'Báo cáo, thảo luận', 'Kết luận, nhận định'].forEach((b, j) => ds.push(p(`Bước ${j + 1}. ${b}: ${k.buoc[j]}`, { indent: true })));
  });
  ds.push(p(`Kế hoạch soạn từ dữ liệu chuẩn bị của ${d.goiY.soDaChuanBi}/${d.goiY.siSo} HS trên FlipMath9, ngày ${new Date().toLocaleDateString('vi-VN', { timeZone: 'Asia/Ho_Chi_Minh' })}.`, { italic: true, size: 22 }));

  const doc = new Document({ sections: [{ properties: { page: { margin: { top: 1134, bottom: 1134, left: 1701, right: 1134 } } }, children: ds }] });
  const buf = await Packer.toBuffer(doc);
  // Biểu thức chính quy (regex) kiểm tra hoặc tách chuỗi đúng mẫu dữ liệu
  const ten = `KHBD-${d.bai.tenNgan.replace(/\s+/g, '')}-${d.lop.class_code}.docx`;
  return new NextResponse(new Uint8Array(buf), {
    headers: {
      'Content-Type': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'Content-Disposition': `attachment; filename="${ten}"; filename*=UTF-8''${encodeURIComponent(ten)}`
    }
  });
}
