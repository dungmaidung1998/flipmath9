/**
 * FILE NÀY LÀM GÌ: Trang công khai (cho phép mở không cần tài khoản) kèm xử lý giới hạn dữ liệu an toàn riêng tư.
 * AI DÙNG: công khai / phụ huynh
 * ĐỊA CHỈ TRÊN WEB: /dang-nhap
 * LẤY DỮ LIỆU TỪ: schools
 * GỌI TỚI: @/lib/supabase/server, @/components/TheDangNhap
 */
import { supabaseServer } from '@/lib/supabase/server';
import TheDangNhap, { type TruongChon } from '@/components/TheDangNhap';

export const dynamic = 'force-dynamic';

const MAC_DINH: TruongChon[] = [
  { school_id: 'NPH', ten: 'THCS Nguyễn Phú Hường', tinh: 'Đà Nẵng', ma_dang_nhap: 'NPH' }
];

/**
 * Trang đăng nhập riêng: đọc danh sách trường công khai (bảng schools) rồi truyền vào <TheDangNhap />.
 */
export default async function DangNhap() {
  let truong: TruongChon[] = MAC_DINH;
  try {
    const db = supabaseServer();
    const { data, error } = await db
      .from('schools')
      .select('school_id, ten, tinh, ma_dang_nhap')
      .order('ten');
    if (!error && data?.length) {
      truong = data as TruongChon[];
    }
  } catch {
    truong = MAC_DINH;
  }

  return (
    <div className="khung-dang-nhap">
      <a className="dn-hieu" href="/">Flip<span>Math9</span></a>
      <p className="ten-he-thong">Lớp học đảo ngược Toán 9</p>
      <img className="dn-hinh" src="/gioi-thieu/anh/hai-ban.webp" width={520} height={390}
           alt="Hai bạn học sinh mặc áo trắng, quàng khăn đỏ, vẫy tay chào." />
      <TheDangNhap truong={truong} />
      <p className="dn-ve"><a href="/">Xem giới thiệu FlipMath9</a></p>
    </div>
  );
}
