-- ============================================================================
-- 58 · KTTX 3 BƯỚC: AI NHÁP → HỌC SINH XÁC NHẬN → GIÁO VIÊN CHỐT BẰNG EXCEL
-- Chạy SAU tệp 57-kttx.sql (KHÔNG sửa tệp 57).
-- Idempotent (chạy lại nhiều lần an toàn, KHÔNG xoá dữ liệu cũ).
--
-- BẢO MẬT & RLS:
--   - Giữ nguyên chính sách RLS từ 57-kttx.sql: học sinh CHỈ có quyền SELECT
--     trên kttx_bai_nop của chính mình, KHÔNG tự UPDATE trực tiếp qua Supabase.
--   - Mọi thao tác học sinh xác nhận / báo sai và giáo viên chốt điểm Excel đều
--     đi qua API máy chủ (/api/kttx và /api/gv/kttx/excel) có kiểm tra quyền.
-- ============================================================================

do $$
begin
  if to_regclass('public.kttx_bai_nop') is null then
    raise exception E'\n\n>>> DỪNG LẠI: Cần chạy 57-kttx.sql TRƯỚC tệp 58. <<<\n';
  end if;
end $$;

begin;

-- 1. Thêm các cột phục vụ bước học sinh xác nhận & giáo viên đối chiếu Excel
alter table public.kttx_bai_nop add column if not exists tong_diem_hs numeric(4,2);
alter table public.kttx_bai_nop add column if not exists diem_cau_hs jsonb;
alter table public.kttx_bai_nop add column if not exists hs_xac_nhan_luc timestamptz;
alter table public.kttx_bai_nop add column if not exists hs_ly_do_bao_sai text;
alter table public.kttx_bai_nop add column if not exists tong_diem_excel numeric(4,2);
alter table public.kttx_bai_nop add column if not exists excel_tai_luc timestamptz;
alter table public.kttx_bai_nop add column if not exists excel_tai_boi uuid references auth.users(id);
alter table public.kttx_bai_nop add column if not exists chua_co_anh boolean not null default false;

-- 2. Cho phép so_trang = 0 khi tạo bản ghi chốt bằng Excel cho học sinh chưa nộp ảnh
alter table public.kttx_bai_nop drop constraint if exists kttx_bai_nop_so_trang_check;
alter table public.kttx_bai_nop add constraint kttx_bai_nop_so_trang_check
  check (so_trang between 0 and 4);

-- 3. Nới bỏ ràng buộc trạng thái cũ, chuyển dữ liệu cũ, đặt ràng buộc trạng thái mới
alter table public.kttx_bai_nop drop constraint if exists kttx_bai_nop_trang_thai_check;

update public.kttx_bai_nop set trang_thai = 'ai-nhap' where trang_thai = 'cho-duyet';
update public.kttx_bai_nop set trang_thai = 'da-chot' where trang_thai = 'da-duyet';

alter table public.kttx_bai_nop alter column trang_thai set default 'ai-nhap';
alter table public.kttx_bai_nop add constraint kttx_bai_nop_trang_thai_check
  check (trang_thai in ('ai-nhap', 'hs-xac-nhan', 'hs-bao-sai', 'da-chot', 'lech', 'tu-choi'));

commit;
