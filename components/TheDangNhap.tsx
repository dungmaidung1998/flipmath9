'use client';
/**
 * FILE NÀY LÀM GÌ: Component React giao diện hiển thị và xử lý tương tác của người dùng trên trình duyệt.
 * AI DÙNG: học sinh
 * LẤY DỮ LIỆU TỪ: schools, profiles
 * GỌI TỚI: @/lib/supabase/client, @/lib/gv/lopCuaToi
 */
import { useEffect, useState } from 'react';
import { supabaseBrowser } from '@/lib/supabase/client';
import { laQuanTri, laVaiTroGV } from '@/lib/gv/lopCuaToi';

const DOMAIN = process.env.NEXT_PUBLIC_STUDENT_EMAIL_DOMAIN ?? 'hs.dfle.local';

export type TruongChon = {
  school_id: string;
  ten: string;
  tinh?: string | null;
  ma_dang_nhap?: string | null;
};

const TRUONG_MAC_DINH: TruongChon[] = [
  { school_id: 'NPH', ten: 'THCS Nguyễn Phú Hường', tinh: 'Đà Nẵng', ma_dang_nhap: 'NPH' }
];

/**
 * THẺ ĐĂNG NHẬP — CHỌN TRƯỜNG → CHỌN VAI TRÒ (Học sinh / Giáo viên / Quản trị) → ĐĂNG NHẬP.
 * Không đổi cách xác thực Supabase hiện có.
 */
export default function TheDangNhap({
  gon = false,
  truong
}: {
  gon?: boolean;
  truong?: TruongChon[];
}) {
  const [dsTruong, setDsTruong] = useState<TruongChon[]>(
    truong && truong.length ? truong : TRUONG_MAC_DINH
  );
  const [maTruong, setMaTruong] = useState<string>(
    (truong && truong[0]?.school_id) || TRUONG_MAC_DINH[0].school_id
  );
  const [vaiTro, setVaiTro] = useState<'hs' | 'gv' | 'qt'>('hs');
  const [maLop, setMaLop] = useState('');
  const [maHs, setMaHs] = useState('');
  const [email, setEmail] = useState('');
  const [matKhau, setMatKhau] = useState('');
  const [hienMatKhau, setHienMatKhau] = useState(false);
  const [loi, setLoi] = useState<{ viet: string; goc: string } | null>(null);
  const [dangChay, setDangChay] = useState(false);

  useEffect(() => {
    try {
      const luu = localStorage.getItem('f9-truong');
      if (luu) setMaTruong(luu);
    } catch { /* bỏ qua */ }
    if (truong && truong.length) return;
    supabaseBrowser()
      .from('schools')
      .select('school_id, ten, tinh, ma_dang_nhap')
      .order('ten')
      .then(({ data, error }) => {
        if (!error && data && data.length) {
          setDsTruong(data as TruongChon[]);
          setMaTruong((prev) =>
            data.some((s: any) => s.school_id === prev) ? prev : data[0].school_id
          );
        }
      }, () => {});
  }, [truong]);

  const doiTruong = (val: string) => {
    setMaTruong(val);
    try { localStorage.setItem('f9-truong', val); } catch { /* bỏ qua */ }
  };

  async function guiDi(e: React.FormEvent) {
    e.preventDefault();
    setLoi(null);
    setDangChay(true);

    // Không thu thập email cá nhân của người chưa thành niên: email nội bộ
    // được ghép từ hai mã do giáo viên cấp.
    const dinhDanh =
      vaiTro === 'hs'
        ? `${maHs.trim().toLowerCase()}@${maLop.trim().toLowerCase().replace(/[\/ ]+/g, '-')}.${DOMAIN}`
        : email.trim();

    const sb = supabaseBrowser();
    const { data, error } = await sb.auth.signInWithPassword({
      email: dinhDanh,
      password: matKhau
    });

    if (error) {
      setDangChay(false);
      const m = (error.message || '').toLowerCase();
      const viet =
        m.includes('invalid login') || m.includes('invalid_credentials')
          ? vaiTro === 'hs'
            ? 'Sai mã lớp, mã học sinh hoặc mật khẩu. Ba thứ này ghép thành một tài khoản — sai một là không vào được.'
            : 'Sai email hoặc mật khẩu.'
          : m.includes('email not confirmed')
            ? 'Tài khoản chưa được xác nhận. Quản trị viên vào Supabase → Authentication → Users, mở tài khoản này và bấm Confirm email.'
            : m.includes('api key') || m.includes('failed to fetch') || m.includes('networkerror')
              ? 'Không kết nối được tới máy chủ. Nhiều khả năng tệp .env.local sai khoá, hoặc đã sửa .env.local mà chưa khởi động lại npm run dev.'
              : m.includes('too many') || m.includes('rate limit')
                ? 'Thử quá nhiều lần trong thời gian ngắn. Đợi một phút rồi thử lại.'
                : 'Không đăng nhập được.';
      setLoi({ viet, goc: error.message });
      return;
    }

    let dich = vaiTro === 'hs' ? '/bai-hoc' : vaiTro === 'qt' ? '/quan-tri' : '/gv';
    try {
      if (data?.user?.id) {
        const { data: prof } = await sb
          .from('profiles')
          .select('role')
          .eq('id', data.user.id)
          .maybeSingle();
        if (prof?.role) {
          if (laQuanTri(prof.role)) {
            dich = vaiTro === 'qt' ? '/quan-tri' : '/gv';
          // Kiểm tra xác thực tài khoản, vai trò giáo viên hoặc điều kiện đồng ý
          } else if (laVaiTroGV(prof.role)) {
            dich = '/gv';
          } else {
            dich = '/bai-hoc';
          }
        }
      }
    } catch { /* dùng đích mặc định theo nút đã chọn */ }

    setDangChay(false);
    window.location.href = dich;
  }

  return (
    <div className={'the-dang-nhap' + (gon ? ' gon' : '')}>
      <h2>Đăng nhập</h2>

      <label htmlFor="chon-truong">1. Chọn trường</label>
      <select
        id="chon-truong"
        className="dn-truong"
        value={maTruong}
        onChange={(e) => doiTruong(e.target.value)}
      >
        {dsTruong.map((t) => (
          <option key={t.school_id} value={t.school_id}>
            {t.ten}{t.tinh ? ` · ${t.tinh}` : ''}
          </option>
        ))}
      </select>

      <label className="dn-nhan-vai">2. Chọn vai trò</label>
      <div className="chon-vai-tro" role="group" aria-label="Chọn vai trò">
        <button
          type="button"
          aria-pressed={vaiTro === 'hs'}
          onClick={() => { setVaiTro('hs'); setLoi(null); }}
        >
          Học sinh
        </button>
        <button
          type="button"
          aria-pressed={vaiTro === 'gv'}
          onClick={() => { setVaiTro('gv'); setLoi(null); }}
        >
          Giáo viên
        </button>
        <button
          type="button"
          aria-pressed={vaiTro === 'qt'}
          onClick={() => { setVaiTro('qt'); setLoi(null); }}
        >
          Quản trị
        </button>
      </div>

      {/* Khối giao diện: Biểu mẫu nhập liệu */}
      <form onSubmit={guiDi}>
        {vaiTro === 'hs' ? (
          <>
            <label htmlFor="ma-lop">Mã lớp</label>
            <input id="ma-lop" value={maLop} onChange={(e) => setMaLop(e.target.value)}
                   placeholder="9A1" autoComplete="off" required />
            <label htmlFor="ma-hs">Mã học sinh</label>
            <input id="ma-hs" value={maHs} onChange={(e) => setMaHs(e.target.value)}
                   placeholder="9a1-01" autoComplete="username" required />
          </>
        ) : (
          <>
            <label htmlFor="email-gv">
              {vaiTro === 'qt' ? 'Email quản trị trường' : 'Email giáo viên'}
            </label>
            <input id="email-gv" type="email" value={email} onChange={(e) => setEmail(e.target.value)}
                   autoComplete="username" required />
          </>
        )}

        <label htmlFor="mat-khau">Mật khẩu</label>
        <div className="o-mat-khau">
          <input id="mat-khau" type={hienMatKhau ? 'text' : 'password'} value={matKhau}
                 onChange={(e) => setMatKhau(e.target.value)}
                 autoComplete="current-password" required />
          <button type="button" onClick={() => setHienMatKhau((v) => !v)}
                  aria-label={hienMatKhau ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}>
            {hienMatKhau ? 'Ẩn' : 'Hiện'}
          </button>
        </div>

        <button className="primary nut-vao" disabled={dangChay}>
          {dangChay ? 'Đang kiểm tra…' : 'Đăng nhập'}
        </button>

        {loi && (
          <div className="err" role="alert">
            {loi.viet}
            <details>
              <summary>Chi tiết kỹ thuật</summary>
              <code>{loi.goc}</code>
            </details>
          </div>
        )}
      </form>

      <p className="hint">
        {vaiTro === 'hs'
          ? 'Mã lớp và mã học sinh do thầy cô cấp. Quên mật khẩu thì báo thầy cô cấp lại — hệ thống không thu email của học sinh nên không tự đặt lại được.'
          : vaiTro === 'qt'
            ? 'Dành cho Ban giám hiệu / Tổ trưởng chuyên môn được cấp quyền quản trị trường.'
            : 'Tài khoản giáo viên do người quản trị tạo.'}
      </p>
    </div>
  );
}
