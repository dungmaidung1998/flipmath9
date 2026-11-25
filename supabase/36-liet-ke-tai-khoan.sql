-- ===========================================================================
-- MATHFLIP / DFLE-M7 · LIỆT KÊ TÀI KHOẢN ĐANG CÓ (CHỈ ĐỌC, KHÔNG SỬA GÌ)
-- Dán vào Supabase › SQL Editor › Run.
-- Mật khẩu KHÔNG xem được: Supabase chỉ lưu bản băm. Ai quên mật khẩu thì đặt lại
-- (học sinh: trang "Tài khoản học sinh" trong ứng dụng; giáo viên: Authentication › Users).
-- ===========================================================================
select
  p.role                                   as vai_tro,
  c.class_code                             as ma_lop,
  case when p.role = 'hoc-sinh' then split_part(u.email, '@', 1) else u.email end
                                           as ma_dang_nhap,
  coalesce(p.full_name, s.display_name)    as ten_hien_thi,
  s.consent_status                         as dong_thuan,
  case when split_part(u.email, '@', 1) ~ '^hs0[0-9]{2}$' then 'MÔ PHỎNG — không phát cho HS thật'
       else '' end                         as ghi_chu,
  to_char(u.last_sign_in_at at time zone 'Asia/Ho_Chi_Minh', 'DD/MM/YYYY HH24:MI') as lan_dang_nhap_cuoi
from auth.users u
join profiles p      on p.id = u.id
left join classes c  on c.class_id = p.class_id
left join students s on s.student_id = p.student_id
order by p.role desc, c.class_code, ma_dang_nhap;
