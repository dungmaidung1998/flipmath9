/**
 * FILE NÀY LÀM GÌ: Trang giao diện dành cho giáo viên trong khu vực đã đăng nhập, tổng hợp số liệu lớp và hỗ trợ điều chỉnh dạy học.
 * AI DÙNG: giáo viên
 * ĐỊA CHỈ TRÊN WEB: /gv/lich-bai
 * LẤY DỮ LIỆU TỪ: profiles, knowledge_units, lich_bai, class_content
 * GỌI TỚI: @/lib/supabase/server, @/lib/chapters, @/components/gv/LichBaiEditor, @/components/gv/NoiDungLopEditor, @/lib/lichBai, @/components/gv/BoLoc, @/lib/gv/lopCuaToi
 */
import { supabaseServer } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { CHAPTERS, chapterOf } from '@/lib/chapters';
import LichBaiEditor from '@/components/gv/LichBaiEditor';
import NoiDungLopEditor, { type MucLop } from '@/components/gv/NoiDungLopEditor';
import type { Lich } from '@/lib/lichBai';
import { docCookieLop } from '@/components/gv/BoLoc';
import { chonLopTu, laVaiTroGV, lopCuaToi, nhanTruongLop, tenHienThiLop } from '@/lib/gv/lopCuaToi';

export const dynamic = 'force-dynamic';

/** GV-03 Lịch dạy & giao bài + Bật/tắt nội dung theo lớp (class_content). */
export default async function LichBai({ searchParams }: { searchParams: { lop?: string; chuong?: string } }) {
  const db = supabaseServer();
  // Kiểm tra xác thực tài khoản, vai trò giáo viên hoặc điều kiện đồng ý
  const { data: { user } } = await db.auth.getUser();
  if (!user) redirect('/dang-nhap');
  // Truy vấn Supabase: đọc dữ liệu từ bảng profiles
  const { data: profile } = await db.from('profiles').select('role').eq('id', user.id).maybeSingle();
  // Kiểm tra xác thực tài khoản, vai trò giáo viên hoặc điều kiện đồng ý
  if (!laVaiTroGV(profile?.role)) redirect('/');

  const lops = await lopCuaToi(db);
  const lop = chonLopTu(lops, searchParams.lop, docCookieLop(), false).lop;
  if (!lop) return <div className="wrap"><h1>Lịch giao bài</h1><p className="hint">Thầy cô chưa có lớp nào.</p></div>;
  const chuong = CHAPTERS.find((c) => c.id === searchParams.chuong) ?? CHAPTERS[0];

  const [{ data: units }, { data: lich, error }, ccRes] = await Promise.all([
    db.from('knowledge_units').select('ku_id, ku_name, lesson_id, order_index').order('order_index'),
    db.from('lich_bai').select('lesson_id, ngay_mo, han_chuan_bi, ngay_hoc').eq('class_id', lop.class_id),
    db.from('class_content').select('ku_id, dao_nguoc, an, an_game, an_video').eq('class_id', lop.class_id)
      .then((r: any) => r, () => ({ data: null, error: { message: 'missing' } }))
  ]);

  const bai: { lesson_id: string; soMuc: number }[] = [];
  const mucChuong: typeof units = [];
  for (const u of units ?? []) {
    if (chapterOf(u.ku_id) !== chuong.id) continue;
    mucChuong.push(u);
    if (!u.lesson_id) continue;
    const c = bai.find((b) => b.lesson_id === u.lesson_id);
    if (c) c.soMuc++; else bai.push({ lesson_id: u.lesson_id, soMuc: 1 });
  }

  const ccMap = new Map<string, any>((ccRes.data ?? []).map((r: any) => [r.ku_id, r]));
  const mucLop: MucLop[] = mucChuong.map((u) => {
    const cc = ccMap.get(u.ku_id);
    return {
      ku_id: u.ku_id,
      ku_name: u.ku_name,
      lesson_id: u.lesson_id ?? null,
      dao_nguoc: !!cc?.dao_nguoc,
      an: !!cc?.an,
      an_game: !!cc?.an_game,
      an_video: !!cc?.an_video
    };
  });

  return (
    <div className="wrap">
      <h1>Lịch dạy và giao bài</h1>
      <p className="sub">Lớp {tenHienThiLop(lop)} · {chuong.label}. Học sinh thấy bài 🔒 trước ngày mở; quá hạn chuẩn bị vẫn làm được nhưng bị ghi &ldquo;nộp trễ&rdquo;.</p>
      {/* Khối giao diện: Biểu mẫu nhập liệu */}
      <form className="hd-loc" method="get">
        <label>Lớp<select name="lop" defaultValue={lop.class_id}>{lops.map((l) => <option key={l.class_id} value={l.class_id}>{nhanTruongLop(l)}</option>)}</select></label>
        <label>Chương<select name="chuong" defaultValue={chuong.id}>{CHAPTERS.map((c) => <option key={c.id} value={c.id}>{c.label}</option>)}</select></label>
        <button type="submit">Xem</button>
      </form>
      {error
        ? <p role="alert" className="banner">Chưa đọc được lịch giao bài. Thầy cô kiểm tra đã chạy tệp <code>43-lich-giao-bai.sql</code> trong Supabase chưa.</p>
        : <LichBaiEditor key={lop.class_id + chuong.id} lop={lop.class_id} bai={bai} coSan={((lich ?? []) as Lich[]).filter((l) => bai.some((b) => b.lesson_id === l.lesson_id))} />}

      <NoiDungLopEditor
        key={'cc-' + lop.class_id + chuong.id}
        lop={lop.class_id}
        tenLop={tenHienThiLop(lop)}
        mucBanDau={mucLop}
        chuaCoBang={!!ccRes.error}
      />
    </div>
  );
}
