# Tạo cơ sở dữ liệu cho FlipMath9

FlipMath9 dùng một **dự án Supabase riêng**, không dùng chung với MathFlip Toán 7.

## Dự án đang chạy (đã khởi tạo trước đây)

Chỉ cần chạy thêm, theo thứ tự, trong **SQL Editor** (mỗi tệp một lần, dán toàn bộ rồi bấm **Run**):

1. `41-man-chinh-giao-vien.sql` — bảng cho 3 màn chính của giáo viên (nếu chưa chạy).
2. `40a-noi-dung-toan-9-tap-1.sql` — nội dung Chương I–V (Toán 9 tập một).
3. `40b-noi-dung-toan-9-tap-2.sql` — nội dung Chương VI–X (Toán 9 tập hai).

Kết quả cuối mỗi tệp 40a, 40b hiện số câu hỏi theo chương, đủ 10 chương: `C1 | 64` … `C10 | 48` (tổng 656 câu).

## Dự án Supabase mới (lần đầu)

1. Vào supabase.com, bấm **New project**, đặt tên `flipmath9`, chọn vùng Singapore.
2. Mở **SQL Editor**, chạy lần lượt:
   - `00-FLIPMATH9-KHOI-TAO.sql` (cấu trúc, xoá nội dung Toán 7 mẫu, bảng màn chính giáo viên);
   - `40a-noi-dung-toan-9-tap-1.sql`;
   - `40b-noi-dung-toan-9-tap-2.sql`.
3. Vào **Authentication → Users** tạo tài khoản giáo viên (tích **Auto Confirm User**), rồi sửa và chạy `11-tao-tai-khoan-giao-vien.sql` để gắn tài khoản với lớp.
4. Vào **Project Settings → API Keys** lấy URL, **Publishable key** và **Secret key**, điền vào `.env.local` của thư mục `code\web`, rồi chạy `TRIEN-KHAI-VERCEL.bat`.
   - Dự án Supabase mới không nhận khoá kiểu cũ `eyJ…`; dùng khoá `sb_publishable_…` và `sb_secret_…`.

Tệp 39 (nằm trong tệp 00) có chốt an toàn: nếu cơ sở dữ liệu đã có học sinh hoặc bài làm thì tự dừng. Vì vậy chạy nhầm lên dự án MathFlip Toán 7 cũng không xoá được gì.

## Khi sửa hoặc thêm nội dung Toán 9

Claude sinh lại tệp nội dung trong thư mục `dfle-engine`:

```
node cli/emit-toan-9.js C1,C2,C3,C4,C5 > ../web/supabase/40a-noi-dung-toan-9-tap-1.sql
node cli/emit-toan-9.js C6,C7,C8,C9,C10 > ../web/supabase/40b-noi-dung-toan-9-tap-2.sql
```

- Chỉ cần chạy lại tệp có chương bị sửa.
- Chạy lại nhiều lần vẫn an toàn.
- Link video giáo viên đã tự sửa ở trang Nội dung được giữ nguyên.

## Các tệp khác trong thư mục này

Các tệp 01–38 là của MathFlip Toán 7, giữ lại để tham khảo cấu trúc. Riêng các tệp 33, 34, 37, 38 là nội dung Toán 7, **không chạy** trên FlipMath9.
