/**
 * FILE NÀY LÀM GÌ: Trang Next.js App Router trong khu vực học tập đã đăng nhập, nạp dữ liệu ban đầu và hiển thị giao diện tương tác.
 * AI DÙNG: học sinh
 * ĐỊA CHỈ TRÊN WEB: /thi-nghiem/[ku]
 * LẤY DỮ LIỆU TỪ: profiles
 * GỌI TỚI: @/lib/supabase/server, @/lib/thiNghiem, @/components/thi-nghiem/ThiNghiem, @/components/DauTrang, @/lib/minhHoa, @/lib/chuDeChuong
 */
import { supabaseServer } from '@/lib/supabase/server';
import { thiNghiemCuaMuc, THI_NGHIEM } from '@/lib/thiNghiem';
import ThiNghiem from '@/components/thi-nghiem/ThiNghiem';
import DauTrang from '@/components/DauTrang';
import { hinhNhanVat } from '@/lib/minhHoa';
import { chuDeChuong } from '@/lib/chuDeChuong';
import type { CSSProperties } from 'react';

export const dynamic = 'force-dynamic';

/** Một thí nghiệm. ?chieu=1: chế độ chiếu lên lớp (chữ to, không ghi kết quả). */
export default async function MotThiNghiem({ params, searchParams }: { params: { ku: string }; searchParams: { chieu?: string } }) {
  const ku = decodeURIComponent(params.ku);
  const tn = thiNghiemCuaMuc(ku);
  if (!tn) return <div className="wrap"><h1>Chưa có thí nghiệm cho mục này</h1><p><a href="/thi-nghiem">← Phòng thí nghiệm</a></p></div>;
  const supabase = supabaseServer();
  // Kiểm tra xác thực tài khoản, vai trò giáo viên hoặc điều kiện đồng ý
  const { data: { user } } = await supabase.auth.getUser();
  // Truy vấn Supabase: đọc dữ liệu từ bảng profiles
  const { data: prof } = user ? await supabase.from('profiles').select('role, student_id').eq('id', user.id).maybeSingle() : { data: null };
  const chieu = searchParams.chieu === '1';
  const i = THI_NGHIEM.findIndex((t) => t.ku === ku);
  const sau = THI_NGHIEM[i + 1];
  const cd = chuDeChuong(ku);
  return (
    <div
      className={chieu ? 'tn-trang tn-trang--chieu' : `wrap tn-trang${cd ? ' trang-chuong' : ''}`}
      style={!chieu && cd ? ({ ['--mau-chuong' as string]: cd.mau } as CSSProperties) : undefined}
    >
      <p className="tn-dieu-huong">
        <a href="/thi-nghiem">← Thử tay</a>
        {!chieu && <> · <a href={`/hoc/${encodeURIComponent(ku)}`}>Mở bài học của mục này</a></>}
        {chieu && sau && <> · <a href={`/thi-nghiem/${encodeURIComponent(sau.ku)}?chieu=1`}>Thí nghiệm tiếp →</a></>}
      </p>
      {!chieu && <DauTrang tieuDe={tn.ten} phu={`🧪 Thử tay · ${ku}`} chuong={ku} nhanVat="bin" hinh={hinhNhanVat('van-dung')} />}
      <ThiNghiem tn={tn} ghi={!!prof?.student_id && !chieu} chieu={chieu} />
    </div>
  );
}
