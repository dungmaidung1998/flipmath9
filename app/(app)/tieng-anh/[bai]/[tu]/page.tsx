/**
 * FILE NÀY LÀM GÌ: Trang Next.js App Router trong khu vực học tập đã đăng nhập, nạp dữ liệu ban đầu và hiển thị giao diện tương tác.
 * AI DÙNG: học sinh
 * ĐỊA CHỈ TRÊN WEB: /tieng-anh/[bai]/[tu]
 * LẤY DỮ LIỆU TỪ: không truy vấn bảng trực tiếp
 * GỌI TỚI: @/lib/supabase/server, @/components/tieng-anh/HocMoiTu, @/components/DauTrang, @/lib/tiengAnhMoiTu
 */
import { notFound, redirect } from 'next/navigation';
import { supabaseServer } from '@/lib/supabase/server';
import HocMoiTu from '@/components/tieng-anh/HocMoiTu';
import DauTrang from '@/components/DauTrang';
import { layBai } from '@/lib/tiengAnhMoiTu';

export const dynamic = 'force-dynamic';

/**
 * Component React `TiengAnhMoiTuPage`: nhận props (thuộc tính truyền vào từ component cha) và dựng giao diện tương ứng.
 */
export default async function TiengAnhMoiTuPage({
  params,
  searchParams
}: {
  params: { bai: string; tu: string };
  searchParams: { nhom?: string };
}) {
  const supabase = supabaseServer();
  // Kiểm tra xác thực tài khoản, vai trò giáo viên hoặc điều kiện đồng ý
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/dang-nhap');

  const baiSo = Number(params.bai);
  const bai = Number.isInteger(baiSo) ? layBai(baiSo) : null;
  if (!bai) notFound();

  return (
    <>
      <div className="wrap" style={{ paddingBottom: 0 }}>
        <DauTrang gon tieuDe={`Bài ${baiSo}: ${bai.tenVi}`} phu={bai.ten} chuong={bai.chuong} tranh="tieng-anh" />
      </div>
      <HocMoiTu
        baiSo={baiSo}
        slugBanDau={decodeURIComponent(params.tu)}
        nhomBanDau={searchParams.nhom}
      />
    </>
  );
}
