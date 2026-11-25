/**
 * FILE NÀY LÀM GÌ: Cổng kiểm soát truy cập (Next.js Middleware): cho phép ảnh/trang công khai và chuyển hướng người chưa đăng nhập.
 * AI DÙNG: dùng chung
 * ĐỊA CHỈ TRÊN WEB: Chạy trước mọi request (đường dẫn toàn hệ thống)
 * LẤY DỮ LIỆU TỪ: profiles
 * GỌI TỚI: @/lib/gv/lopCuaToi
 */
import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';
import { laQuanTri, laVaiTroGV } from '@/lib/gv/lopCuaToi';

/**
 * Các tiền tố được xem là công khai. Khớp bằng startsWith.
 *
 * KHÔNG BAO GIỜ thêm '/' vào mảng này. Mọi đường dẫn đều bắt đầu bằng '/',
 * nên '/gv/du-lieu'.startsWith('/') là true — thêm một ký tự đó là mở toang
 * toàn bộ hệ thống, kể cả trang xuất dữ liệu học sinh, cho người chưa đăng
 * nhập. Trang chủ được cho qua bằng SO KHỚP CHÍNH XÁC ở dưới.
 */
// '/dung-thu' = bản dùng thử MathFlip cho giám khảo: chỉ dữ liệu mô phỏng nhúng sẵn, không đọc Supabase.
// '/phu-huynh' = cổng công khai cho phụ huynh nhập mã 6 số xem thời lượng học & đặt giới hạn.
const PUBLIC = ['/dang-nhap', '/dung-thu', '/phu-huynh', '/_next', '/favicon.ico', '/api/health', '/gioi-thieu/', '/fonts/', '/manifest.webmanifest', '/sw.js'];

/** Trang chủ giới thiệu: công khai, và chỉ đúng đường dẫn này. */
const TRANG_CHU = '/';

/**
 * Hàm `middleware`: nhận (request), xử lý nghiệp vụ và trả kết quả tương ứng.
 */
export async function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname;
  // Public illustrations must load before authentication (including on the login page).
  // Restrict this exception to the known public image names and directories.
  const publicImage = /^\/(?:hero(?:-ngang(?:-\d+)?)?|vong-lap)\.(?:png|jpe?g|webp)$/i.test(path)
    || /^\/(?:minh-hoa|so-lieu)\/[^/]+\.(?:png|jpe?g|webp|svg)$/i.test(path)
    || /^\/(?:minh-hoa\/nv|tinh-nang\/phu-huynh)\/[^/]+\.(?:png|jpe?g|webp|svg)$/i.test(path);
  // Biểu thức chính quy (regex) kiểm tra hoặc tách chuỗi đúng mẫu dữ liệu
  const fluentImage = /^\/fluent\/[a-z_]+_3d(?:_default)?\.png$/.test(path);
  // Biểu thức chính quy (regex) kiểm tra hoặc tách chuỗi đúng mẫu dữ liệu
  const vuonImage = /^\/vuon\/C(?:[1-9]|10)-[0-4]\.webp$/.test(path);
  if (publicImage || fluentImage || vuonImage) return NextResponse.next();

  let response = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll: () => request.cookies.getAll(),
        setAll: (list: { name: string; value: string; options: CookieOptions }[]) => {
          list.forEach(({ name, value }) => request.cookies.set(name, value));
          response = NextResponse.next({ request });
          list.forEach(({ name, value, options }) => response.cookies.set(name, value, options));
        }
      }
    }
  );

  // Kiểm tra xác thực tài khoản, vai trò giáo viên hoặc điều kiện đồng ý
  const { data: { user } } = await supabase.auth.getUser();

  // Người đã đăng nhập không bao giờ nhìn thấy trang giới thiệu. Chặn ở đây
  // chứ không chặn trong page.tsx: middleware đã gọi getUser() sẵn rồi nên
  // không tốn truy vấn nào thêm, và người học không tải một byte nào của
  // trang giới thiệu. Giáo viên thì để /bai-hoc đẩy tiếp sang /gv — tra bảng
  // profiles ngay tại đây sẽ cộng một vòng mạng vào MỌI request của MỌI người.
  if (user && path === TRANG_CHU) {
    const url = request.nextUrl.clone();
    url.pathname = '/bai-hoc';
    return NextResponse.redirect(url);
  }

  // Trang giới thiệu là một trang tĩnh dựng bằng scroll-craft (public/gioi-thieu),
  // tách hẳn khỏi CSS của ứng dụng. Người chưa đăng nhập mở '/' thì phục vụ trang đó.
  if (!user && path === TRANG_CHU) {
    const url = request.nextUrl.clone();
    url.pathname = '/gioi-thieu/index.html';
    return NextResponse.rewrite(url);
  }

  if (!user && path !== TRANG_CHU && !PUBLIC.some((p) => path.startsWith(p))) {
    const url = request.nextUrl.clone();
    url.pathname = '/dang-nhap';
    return NextResponse.redirect(url);
  }

  // Chặn trang và API quản trị trường với mọi vai trò không phải quản trị
  if (user && (path === '/quan-tri' || path.startsWith('/quan-tri/') || path.startsWith('/api/quan-tri'))) {
    const { data: p } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .maybeSingle();
    if (!laQuanTri(p?.role)) {
      if (path.startsWith('/api/')) {
        return NextResponse.json({ error: 'Chỉ quản trị trường mới được truy cập' }, { status: 403 });
      }
      const url = request.nextUrl.clone();
      // Kiểm tra xác thực tài khoản, vai trò giáo viên hoặc điều kiện đồng ý
      url.pathname = laVaiTroGV(p?.role) ? '/gv' : '/bai-hoc';
      return NextResponse.redirect(url);
    }
  }
  return response;
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)']
};
