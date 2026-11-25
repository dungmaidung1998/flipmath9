/**
 * FILE NÀY LÀM GÌ: Trang Next.js App Router trong khu vực học tập đã đăng nhập, nạp dữ liệu ban đầu và hiển thị giao diện tương tác.
 * AI DÙNG: học sinh
 * ĐỊA CHỈ TRÊN WEB: /tieng-anh
 * LẤY DỮ LIỆU TỪ: không truy vấn bảng trực tiếp
 * GỌI TỚI: @/lib/supabase/server, @/components/DauTrang, @/components/tieng-anh/ToanTiengAnh, @/components/tieng-anh/HocMoiTu, @/lib/minhHoa, @/lib/tiengAnhMoiTu
 */
import { supabaseServer } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import DauTrang from '@/components/DauTrang';
import ToanTiengAnh from '@/components/tieng-anh/ToanTiengAnh';
import HocMoiTu from '@/components/tieng-anh/HocMoiTu';
import { hinhNhanVat } from '@/lib/minhHoa';
import { BAI_CO_HINH } from '@/lib/tiengAnhMoiTu';

export const dynamic = 'force-dynamic';

/** TOÁN TIẾNG ANH: mặc định mở giao diện mỗi từ một màn hình (Chương I–IV: Bài 1–12); giữ ?xem=tat-ca cho danh sách đầy đủ. */
export default async function TrangTiengAnh({
  searchParams
}: {
  searchParams?: { bai?: string; xem?: string; tu?: string; nhom?: string };
}) {
  const supabase = supabaseServer();
  // Kiểm tra xác thực tài khoản, vai trò giáo viên hoặc điều kiện đồng ý
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/dang-nhap');

  const baiSo = Number(searchParams?.bai);
  const laBaiCoHinh =
    !searchParams?.xem &&
    (!searchParams?.bai || (Number.isInteger(baiSo) && (BAI_CO_HINH as readonly number[]).includes(baiSo)));

  if (laBaiCoHinh) {
    return (
      <HocMoiTu
        baiSo={Number.isInteger(baiSo) ? baiSo : 1}
        slugBanDau={searchParams?.tu}
        nhomBanDau={searchParams?.nhom}
      />
    );
  }

  const batDau = searchParams?.bai
    ? (/^\d+$/.test(searchParams.bai) ? 'b' + searchParams.bai : searchParams.bai)
    : undefined;

  return (
    <div className="wrap">
      <DauTrang tieuDe="Toán tiếng Anh" phu="Chọn bài, bấm 🔊 để nghe từ và câu, xem truyện tranh, rồi thử Luyện nghe." hinh={hinhNhanVat('chao')}>
        <p style={{ marginTop: 8 }}>
          <a className="button" href="/tieng-anh">📖 Học mỗi từ một trang (Chương I–IV)</a>
        </p>
      </DauTrang>
      <ToanTiengAnh batDau={batDau} />
    </div>
  );
}
