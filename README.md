# FlipMath9 🔄9️⃣ — Mã nguồn

**Website lớp học đảo ngược hỗ trợ học Toán 9 song ngữ Việt – Anh, ôn thi vào lớp 10 (TP Đà Nẵng).**
Dự án Khoa học kỹ thuật — lĩnh vực Công nghệ thông tin.

Kho này công khai để **các em học sinh đọc và tìm hiểu code**. Các em có thể xem trực tiếp trên GitHub, không cần cài đặt gì.

---

## Website được làm bằng gì?

| Thành phần | Công nghệ | Vai trò |
|---|---|---|
| Khung web | [Next.js 14](https://nextjs.org) + React 18 | Tạo các trang và API |
| Ngôn ngữ | TypeScript (`.ts`, `.tsx`) | JavaScript có kiểu dữ liệu, ít lỗi hơn |
| Cơ sở dữ liệu | [Supabase](https://supabase.com) (PostgreSQL) | Lưu tài khoản, bài học, kết quả, lỗi sai |
| Công thức Toán | KaTeX | Hiển thị công thức đẹp như sách |
| Hình 3D | three.js | Cảnh 3D, đo chiều cao bằng điện thoại |
| Xuất file | docx, exceljs | Xuất phiếu Word, bảng điểm Excel |

## Bản đồ thư mục — nên đọc từ đâu?

```
app/                  ← CÁC TRANG WEB (mỗi thư mục = một đường dẫn)
  (cong-khai)/        ← trang ai cũng vào được: trang chủ, đăng nhập, dùng thử
  (app)/              ← trang sau khi đăng nhập
    hoc/              ← học bài
    bai-hoc/          ← nội dung từng bài
    kien-thuc-nen/    ← trò chơi ôn kiến thức nền
    so-loi/           ← sổ lỗi sai của em
    on-thi-10/        ← ôn thi vào 10
    tieng-anh/        ← học song ngữ
    do-chieu-cao/     ← đo chiều cao bằng điện thoại (Chương IV)
    gv/               ← trang dành cho giáo viên
  api/                ← "phía máy chủ": nhận và trả dữ liệu cho trang web
components/           ← CÁC KHỐI GIAO DIỆN dùng lại nhiều lần (nút, trò chơi, câu hỏi…)
lib/                  ← THUẬT TOÁN & XỬ LÝ (chấm điểm, chọn câu hỏi thích ứng, gợi ý…)
supabase/             ← CÁC FILE SQL tạo bảng cơ sở dữ liệu (đánh số theo thứ tự chạy)
public/               ← hình ảnh, phông chữ
middleware.ts         ← kiểm tra đăng nhập trước khi vào trang
```

**Gợi ý đường đọc cho người mới:**

1. `app/layout.tsx` — khung chung của mọi trang.
2. `app/(cong-khai)/` — trang chủ và trang đăng nhập (dễ đọc nhất).
3. Một trò chơi trong `components/`, ví dụ `FractionRace.tsx` hoặc `NumberLineGame.tsx`.
4. `lib/adaptive.ts` — thuật toán chọn câu hỏi theo trình độ của em.
5. `supabase/01-schema.sql` — xem dữ liệu được tổ chức thành các bảng như thế nào.

> Mẹo: trên GitHub, bấm phím **`.`** (dấu chấm) khi đang xem kho để mở trình đọc code giống VS Code ngay trong trình duyệt. Bấm **`t`** để tìm file theo tên.

## Muốn chạy thử trên máy mình?

Cần cài [Node.js](https://nodejs.org) (bản 20 trở lên).

```bash
npm install
cp .env.example .env.local   # rồi điền khoá Supabase của riêng em
npm run dev                  # mở http://localhost:3000
```

Web cần một dự án Supabase riêng để chạy đầy đủ (chạy lần lượt các file trong `supabase/`). Khoá bí mật của website thật **không có** trong kho này.

## Quy ước

- Kho chỉ để **đọc và học**. Muốn góp ý hoặc báo lỗi, các em mở mục **Issues** hoặc báo trực tiếp thầy.
- Không đưa mật khẩu, khoá API hay dữ liệu cá nhân của bạn học lên GitHub.
