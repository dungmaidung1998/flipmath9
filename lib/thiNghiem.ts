/**
 * FILE NÀY LÀM GÌ: Danh mục dữ liệu và câu hỏi khám phá cho các thí nghiệm tương tác Thử tay (Chương I–V).
 * AI DÙNG: dùng chung
 * LẤY DỮ LIỆU TỪ: không truy vấn bảng trực tiếp
 * GỌI TỚI: không gọi mô-đun nội bộ khác
 */
/**
 * PHÒNG THÍ NGHIỆM TOÁN — mỗi mục một thí nghiệm "Thử tay".
 * Mỗi thí nghiệm = một KHUNG dùng chung + cấu hình của mục: học sinh kéo/chỉnh, nhìn kết quả đổi theo,
 * rồi trả lời câu "Em thấy gì?" (một câu trắc nghiệm có giải thích, kèm ô ghi tuỳ chọn).
 * Đã có: chương I, II (14 mục), chương III (căn thức), chương IV (tỉ số lượng giác) — 31 mục.
 * Công thức viết LaTeX trong $...$ (hiển thị bằng MathText).
 */

export type Khung =
  | { loai: 'hinh-vuong'; bac: 2 | 3; min: number; max: number; batDau: number }
  | { loai: 'binh-phuong'; min: number; max: number; batDau: number }
  | { loai: 'dieu-kien'; a: number; b: number; min: number; max: number }
  | { loai: 'nhan-chia'; phep: 'nhan' | 'chia'; a: number; b: number; max: number }
  | { loai: 'tach-thua-so'; so: number[] }
  | { loai: 'dua-vao'; cap: { k: number; m: number }[] }
  | { loai: 'truc-can'; tu: string; mau: string; luaChon: { nhan: string; ketQua: string; huuTi: boolean; nhanXet: string }[] }
  | { loai: 'ghep-buoc'; deBai: string; buoc: string[]; nhieu: string[] }
  | { loai: 'tam-giac'; cheDo: 'ti-so' | 'dac-biet' | 'phu-nhau' | 'canh-huyen' | 'canh-goc-vuong' | 'do-cao'; gocBatDau: number }
  /** Mặt phẳng toạ độ. pt = [a, b, c] nghĩa là ax + by = c. */
  | { loai: 'mat-phang'; cheDo: 'diem' | 'mot-duong' | 'hai-duong'; pt: [number, number, number]; pt2?: [number, number, number];
      /** Hai đường cố định (không kéo hệ số); bấm để hiện lần lượt từng bước giải. */
      buocGiai?: string[] }
  /** Khử ẩn bằng cách nhân hai phương trình rồi cộng/trừ. */
  | { loai: 'cong-dai-so'; pt1: [number, number, number]; pt2: [number, number, number] }
  /** Tình huống thực tế: đoán x, y rồi kiểm tra từng điều kiện a·x + b·y = c. */
  | { loai: 'tinh-huong'; tenX: string; tenY: string; donVi: string; maxX: number; maxY: number; buoc: number;
      dieuKien: { nhan: string; a: number; b: number; c: number }[]; chuyenDong?: { quangDuong: number; gio: number } }
  /** Phương trình tích: các thừa số a·x + b. */
  | { loai: 'tich'; thuaSo: [number, number][]; min: number; max: number }
  /** Phương trình chứa ẩn ở mẫu: (a·x + b)/(c·x + d) = e/(c·x + d). */
  | { loai: 'an-o-mau'; tu: [number, number]; mau: [number, number]; vePhai: number; min: number; max: number }
  /** So sánh hai số với <, >, ≤, ≥. */
  | { loai: 'so-sanh'; a: number; b: number }
  /** Tính chất bất đẳng thức: cộng hoặc nhân hai vế với k. */
  | { loai: 'tinh-chat'; a: number; b: number }
  /** Thử nghiệm bất phương trình a·x + b (dấu) 0 trên trục số. */
  | { loai: 'bpt'; a: number; b: number; dau: '>' | '<' | '≥' | '≤'; min: number; max: number }
  /** Chương V: điểm M so với đường tròn (O; R). */
  | { loai: 'tron-diem'; rMacDau: number; omMacDau: number }
  /** Chương V: tâm đối xứng và vô số trục đối xứng qua tâm O. */
  | { loai: 'tron-doi-xung'; gocBatDau: number }
  /** Chương V: dây và đường kính của đường tròn. */
  | { loai: 'day-cung'; r: number; dMacDau: number }
  /** Chương V: góc ở tâm, số đo cung, độ dài cung, hình quạt và hình vành khuyên. */
  | { loai: 'cung-quat'; cheDo: 'goc-cung' | 'cong-cung' | 'do-dai' | 'hinh-quat' | 'vanh-khuyen'; gocMacDau: number }
  /** Chương V: vị trí đường thẳng với đường tròn, tiếp tuyến và hai tiếp tuyến cắt nhau. */
  | { loai: 'thang-tron'; cheDo: 'vi-tri' | 'tiep-tuyen' | 'hai-tiep-tuyen' }
  /** Chương V: vị trí tương đối của hai đường tròn và hệ thức d với R+r, R-r. */
  | { loai: 'hai-tron'; cheDo: 'so-diem-chung' | 'he-thuc-khoang-cach' };

export type CauHoi = { hoi: string; luaChon: string[]; dung: number; giaiThich: string };

export type ThiNghiem = {
  ku: string;
  ten: string;
  /** Học sinh cần làm gì (một câu). */
  viec: string;
  khung: Khung;
  /** Câu hỏi "Em thấy gì?" sau khi thử. */
  cauHoi: CauHoi;
  /** Gợi ý quan sát hiện dưới khung (tuỳ chọn). */
  goiY?: string;
};

export const THI_NGHIEM: ThiNghiem[] = [
  // ---------------- CHƯƠNG I. PHƯƠNG TRÌNH VÀ HỆ HAI PHƯƠNG TRÌNH BẬC NHẤT HAI ẨN ----------------
  {
    ku: 'C1-B1-M1', ten: 'Đi tìm các nghiệm của $2x + y = 4$',
    viec: 'Kéo $x$ và $y$ để chọn một điểm, bấm "Thử điểm này". Thử thật nhiều điểm rồi xem các điểm nghiệm xếp thành hình gì.',
    khung: { loai: 'mat-phang', cheDo: 'diem', pt: [2, 1, 4] },
    goiY: 'Một cặp $(x; y)$ là nghiệm nếu thay vào thì $2x + y$ đúng bằng $4$.',
    cauHoi: {
      hoi: 'Phương trình $2x + y = 4$ có bao nhiêu nghiệm?',
      luaChon: ['Một nghiệm', 'Hai nghiệm', 'Vô số nghiệm', 'Không có nghiệm'],
      dung: 2,
      giaiThich: 'Chọn $x$ bất kì thì luôn tìm được $y = 4 - 2x$. Vì vậy phương trình bậc nhất hai ẩn có vô số nghiệm, và các điểm nghiệm nằm trên một đường thẳng.'
    }
  },
  {
    ku: 'C1-B1-M2', ten: 'Đường thẳng của phương trình $ax + by = c$',
    viec: 'Kéo $a$, $b$, $c$ và xem đường thẳng biểu diễn tập nghiệm thay đổi. Thử cho $a = 0$, rồi cho $b = 0$.',
    khung: { loai: 'mat-phang', cheDo: 'mot-duong', pt: [1, 2, 4] },
    goiY: 'Khi một hệ số bằng $0$, đường thẳng song song với một trục toạ độ.',
    cauHoi: {
      hoi: 'Tập nghiệm của $0x + 2y = 6$ được biểu diễn bởi',
      luaChon: ['đường thẳng $x = 3$, song song với $Oy$', 'đường thẳng $y = 3$, song song với $Ox$', 'đường thẳng đi qua gốc toạ độ', 'một điểm duy nhất'],
      dung: 1,
      giaiThich: '$0x + 2y = 6 \\Leftrightarrow y = 3$ với mọi $x$. Các điểm có tung độ bằng $3$ tạo thành đường thẳng $y = 3$, song song với trục $Ox$.'
    }
  },
  {
    ku: 'C1-B1-M3', ten: 'Hai đường thẳng gặp nhau mấy lần',
    viec: 'Đường thứ nhất là $x + y = 3$. Kéo hệ số của đường thứ hai, đếm số giao điểm: cắt nhau, song song, hay trùng nhau.',
    khung: { loai: 'mat-phang', cheDo: 'hai-duong', pt: [1, 1, 3], pt2: [1, -1, 1] },
    goiY: 'Mỗi giao điểm của hai đường thẳng là một nghiệm của hệ.',
    cauHoi: {
      hoi: 'Hệ $\\begin{cases} x + y = 3 \\\\ 2x + 2y = 5 \\end{cases}$ có bao nhiêu nghiệm?',
      luaChon: ['Một nghiệm', 'Vô nghiệm', 'Vô số nghiệm', 'Hai nghiệm'],
      dung: 1,
      giaiThich: '$2x + 2y = 5 \\Leftrightarrow x + y = 2{,}5$. Hai đường thẳng $x + y = 3$ và $x + y = 2{,}5$ song song (không có điểm chung), nên hệ vô nghiệm.'
    }
  },
  {
    ku: 'C1-B2-M1', ten: 'Nghiệm của hệ là giao điểm',
    viec: 'Hai đường thẳng là hai phương trình của hệ. Bấm "Bước tiếp" để giải bằng phép thế, rồi so với giao điểm trên hình.',
    khung: { loai: 'mat-phang', cheDo: 'hai-duong', pt: [1, 2, 5], pt2: [3, -1, 1],
      buocGiai: ['\\text{Từ (1): } x = 5 - 2y', '\\text{Thế vào (2): } 3(5 - 2y) - y = 1', '15 - 7y = 1 \\Rightarrow y = 2', 'x = 5 - 2\\cdot 2 = 1 \\Rightarrow \\text{nghiệm } (1; 2)'] },
    goiY: 'Giải bằng phép thế: từ (1) có $x = 5 - 2y$, thay vào (2) phải đặt trong ngoặc: $3(5 - 2y) - y = 1$. Ra đúng giao điểm trên hình.',
    cauHoi: {
      hoi: 'Khi thế $x = 5 - 2y$ vào $3x - y = 1$, viết đúng là',
      luaChon: ['$3\\cdot 5 - 2y - y = 1$', '$3(5 - 2y) - y = 1$', '$5 - 2y - y = 1$', '$3(5 - 2y - y) = 1$'],
      dung: 1,
      giaiThich: '$x$ được thay bằng cả biểu thức $5 - 2y$, nên $3x$ thành $3(5 - 2y) = 15 - 6y$. Quên ngoặc sẽ thành $15 - 2y$, sai.'
    }
  },
  {
    ku: 'C1-B2-M2', ten: 'Nhân hệ số để khử một ẩn',
    viec: 'Chọn số nhân cho từng phương trình rồi chọn cộng hay trừ. Tìm cách làm một ẩn biến mất.',
    khung: { loai: 'cong-dai-so', pt1: [2, 3, 8], pt2: [3, -2, -1] },
    goiY: 'Muốn khử $y$: làm cho hai hệ số của $y$ đối nhau rồi cộng, hoặc bằng nhau rồi trừ.',
    cauHoi: {
      hoi: 'Với hệ $\\begin{cases} 2x + 3y = 8 \\\\ 3x - 2y = -1 \\end{cases}$, để khử $y$ ta có thể',
      luaChon: ['nhân (1) với $2$, (2) với $3$ rồi cộng', 'nhân (1) với $3$, (2) với $2$ rồi cộng', 'cộng thẳng hai phương trình', 'nhân (1) với $2$, (2) với $3$ rồi trừ'],
      dung: 0,
      giaiThich: 'Nhân (1) với $2$: $4x + 6y = 16$; nhân (2) với $3$: $9x - 6y = -3$. Hệ số của $y$ là $6$ và $-6$, đối nhau, nên cộng lại được $13x = 13$, $x = 1$, rồi $y = 2$.'
    }
  },
  {
    ku: 'C1-B3-M1', ten: 'Đoán số học sinh nam, nữ',
    viec: 'Lớp có $40$ học sinh, số nữ nhiều hơn số nam $4$ em. Kéo số nam $x$ và số nữ $y$ cho tới khi cả hai điều kiện cùng đúng.',
    khung: { loai: 'tinh-huong', tenX: 'Số nam $x$', tenY: 'Số nữ $y$', donVi: ' em', maxX: 40, maxY: 40, buoc: 1,
      dieuKien: [{ nhan: 'Cả lớp 40 em: $x + y = 40$', a: 1, b: 1, c: 40 }, { nhan: 'Nữ hơn nam 4 em: $y - x = 4$', a: -1, b: 1, c: 4 }] },
    goiY: 'Mỗi điều kiện của bài toán là một phương trình. Hai điều kiện thành một hệ.',
    cauHoi: {
      hoi: 'Lớp có bao nhiêu học sinh nam?',
      luaChon: ['$16$', '$18$', '$20$', '$22$'],
      dung: 1,
      giaiThich: 'Hệ $\\begin{cases} x + y = 40 \\\\ y - x = 4 \\end{cases}$. Cộng hai phương trình: $2y = 44$, $y = 22$, nên $x = 18$. Lớp có $18$ nam, $22$ nữ.'
    }
  },
  {
    ku: 'C1-B3-M1B', ten: 'Hai xe đi ngược chiều gặp nhau',
    viec: 'Hai xe khởi hành cùng lúc từ $A$ và $B$ cách nhau $180$ km, đi ngược chiều, gặp nhau sau $2$ giờ. Xe từ $A$ nhanh hơn xe từ $B$ là $10$ km/h. Kéo vận tốc hai xe và xem sau $2$ giờ chúng ở đâu.',
    khung: { loai: 'tinh-huong', tenX: 'Vận tốc xe A $x$', tenY: 'Vận tốc xe B $y$', donVi: ' km/h', maxX: 90, maxY: 90, buoc: 5,
      dieuKien: [{ nhan: 'Gặp nhau sau 2 giờ: $2x + 2y = 180$', a: 2, b: 2, c: 180 }, { nhan: 'Xe A nhanh hơn 10 km/h: $x - y = 10$', a: 1, b: -1, c: 10 }],
      chuyenDong: { quangDuong: 180, gio: 2 } },
    goiY: 'Quãng đường $=$ vận tốc $\\times$ thời gian. Hai xe gặp nhau khi tổng quãng đường bằng $AB$.',
    cauHoi: {
      hoi: 'Vận tốc của xe đi từ $A$ là',
      luaChon: ['$40$ km/h', '$45$ km/h', '$50$ km/h', '$55$ km/h'],
      dung: 2,
      giaiThich: '$2x + 2y = 180 \\Leftrightarrow x + y = 90$, kết hợp $x - y = 10$: $2x = 100$, $x = 50$ km/h, $y = 40$ km/h.'
    }
  },
  {
    ku: 'C1-B3-M1C', ten: 'Năng suất của hai tổ',
    viec: 'Tổ I làm $3$ ngày và tổ II làm $2$ ngày được $1300$ sản phẩm; tổ I làm $2$ ngày và tổ II làm $3$ ngày được $1200$ sản phẩm. Kéo số sản phẩm mỗi ngày của từng tổ.',
    khung: { loai: 'tinh-huong', tenX: 'Tổ I mỗi ngày $x$', tenY: 'Tổ II mỗi ngày $y$', donVi: ' sp', maxX: 500, maxY: 500, buoc: 10,
      dieuKien: [{ nhan: '$3x + 2y = 1300$', a: 3, b: 2, c: 1300 }, { nhan: '$2x + 3y = 1200$', a: 2, b: 3, c: 1200 }] },
    goiY: 'Năng suất là số sản phẩm làm được trong một ngày. Số ngày $\\times$ năng suất $=$ số sản phẩm.',
    cauHoi: {
      hoi: 'Mỗi ngày tổ I làm được bao nhiêu sản phẩm?',
      luaChon: ['$200$', '$250$', '$300$', '$350$'],
      dung: 2,
      giaiThich: 'Trừ hai phương trình: $x - y = 100$. Cộng hai phương trình: $5x + 5y = 2500$, tức $x + y = 500$. Suy ra $x = 300$, $y = 200$.'
    }
  },

  // ---------------- CHƯƠNG II. PHƯƠNG TRÌNH VÀ BẤT PHƯƠNG TRÌNH BẬC NHẤT MỘT ẨN ----------------
  {
    ku: 'C2-B4-M1', ten: 'Khi nào một tích bằng 0',
    viec: 'Kéo $x$ và theo dõi giá trị của từng thừa số và của tích $(x - 2)(x + 3)$.',
    khung: { loai: 'tich', thuaSo: [[1, -2], [1, 3]], min: -6, max: 6 },
    goiY: 'Để ý: tích bằng $0$ đúng vào lúc nào?',
    cauHoi: {
      hoi: 'Phương trình $(x - 2)(x + 3) = 0$ có nghiệm là',
      luaChon: ['$x = 2$', '$x = -3$', '$x = 2$ và $x = -3$', '$x = -2$ và $x = 3$'],
      dung: 2,
      giaiThich: 'Tích bằng $0$ khi một trong các thừa số bằng $0$: $x - 2 = 0$ hoặc $x + 3 = 0$, tức $x = 2$ hoặc $x = -3$.'
    }
  },
  {
    ku: 'C2-B4-M2', ten: 'Nghiệm tìm được có dùng được không',
    viec: 'Kéo $x$, tính hai vế của $\\dfrac{x + 1}{x - 1} = \\dfrac{2}{x - 1}$. Để ý chỗ hai vế "bằng nhau" sau khi khử mẫu.',
    khung: { loai: 'an-o-mau', tu: [1, 1], mau: [1, -1], vePhai: 2, min: -4, max: 5 },
    goiY: 'Khử mẫu được $x + 1 = 2$, tức $x = 1$. Nhưng thay $x = 1$ vào phương trình ban đầu thì sao?',
    cauHoi: {
      hoi: 'Phương trình $\\dfrac{x + 1}{x - 1} = \\dfrac{2}{x - 1}$',
      luaChon: ['có nghiệm $x = 1$', 'có nghiệm $x = 2$', 'vô nghiệm', 'có vô số nghiệm'],
      dung: 2,
      giaiThich: 'Điều kiện xác định: $x \\ne 1$. Khử mẫu được $x + 1 = 2$, $x = 1$, không thoả điều kiện nên bị loại. Phương trình vô nghiệm. Luôn đối chiếu với điều kiện xác định ở bước cuối.'
    }
  },
  {
    ku: 'C2-B5-M1', ten: 'Bé hơn, lớn hơn, hay bằng',
    viec: 'Kéo hai số $a$, $b$ trên trục số. Xem bốn khẳng định $a < b$, $a > b$, $a \\le b$, $a \\ge b$ cái nào đúng.',
    khung: { loai: 'so-sanh', a: 2, b: 5 },
    goiY: 'Thử cho $a = b$. Dấu $\\ge$ đọc là "lớn hơn hoặc bằng".',
    cauHoi: {
      hoi: 'Khẳng định $5 \\ge 5$',
      luaChon: ['đúng', 'sai', 'không xác định', 'chỉ đúng khi viết $5 > 5$'],
      dung: 0,
      giaiThich: '$a \\ge b$ nghĩa là $a > b$ HOẶC $a = b$. Vì $5 = 5$ nên $5 \\ge 5$ đúng. "Không nhỏ hơn" cũng là $\\ge$.'
    }
  },
  {
    ku: 'C2-B5-M2', ten: 'Cộng và nhân hai vế với cùng một số',
    viec: 'Bắt đầu với $a < b$. Chọn phép cộng hoặc nhân với $k$, kéo $k$ từ dương sang âm và xem dấu bất đẳng thức.',
    khung: { loai: 'tinh-chat', a: 2, b: 5 },
    goiY: 'Phép nào làm dấu bất đẳng thức đổi chiều?',
    cauHoi: {
      hoi: 'Nếu $a < b$ thì $-2a$ ... $-2b$. Điền dấu đúng.',
      luaChon: ['$<$', '$>$', '$=$', '$\\le$'],
      dung: 1,
      giaiThich: 'Nhân hai vế với số âm thì bất đẳng thức đổi chiều: $a < b \\Rightarrow -2a > -2b$. Ví dụ $2 < 5$ nhưng $-4 > -10$. Cộng với bất kì số nào thì giữ nguyên chiều.'
    }
  },
  {
    ku: 'C2-B6-M1', ten: 'Dò nghiệm của bất phương trình',
    viec: 'Kéo $x$ (hoặc bấm −, +). Điểm là nghiệm tô xanh, không phải tô đỏ. Xem vùng nghiệm của $2x - 6 > 0$.',
    khung: { loai: 'bpt', a: 2, b: -6, dau: '>', min: -2, max: 8 },
    goiY: 'Điểm ranh giới $x = 3$ có thoả mãn không?',
    cauHoi: {
      hoi: 'Tập nghiệm của $2x - 6 > 0$ là',
      luaChon: ['$x > 3$', '$x \\ge 3$', '$x < 3$', '$x > -3$'],
      dung: 0,
      giaiThich: '$2x - 6 > 0 \\Leftrightarrow 2x > 6 \\Leftrightarrow x > 3$. Tại $x = 3$: $2\\cdot3 - 6 = 0$, không lớn hơn $0$, nên $3$ không thuộc tập nghiệm (vẽ ngoặc tròn hoặc chấm rỗng trên trục số).'
    }
  },
  {
    ku: 'C2-B6-M2', ten: 'Bất phương trình có hệ số âm',
    viec: 'Kéo $x$ (hoặc bấm −, +). Điểm xanh là nghiệm. Nghiệm của $-3x + 6 \\le 0$ nằm bên trái hay bên phải số $2$?',
    khung: { loai: 'bpt', a: -3, b: 6, dau: '≤', min: -2, max: 8 },
    goiY: 'Hệ số của $x$ âm nên khi chia hai vế cho $-3$ phải đổi chiều bất đẳng thức.',
    cauHoi: {
      hoi: 'Từ $-3x \\le -6$ suy ra',
      luaChon: ['$x \\le 2$', '$x \\ge 2$', '$x \\le -2$', '$x \\ge -2$'],
      dung: 1,
      giaiThich: 'Chia hai vế cho $-3$ (số âm) phải đổi chiều: $x \\ge \\dfrac{-6}{-3} = 2$. Thử lại: $x = 3$ cho $-9 + 6 = -3 \\le 0$ đúng.'
    }
  },

  // ---------------- CHƯƠNG III. CĂN BẬC HAI VÀ CĂN BẬC BA ----------------
  {
    ku: 'C3-B7-M1', ten: 'Cạnh của hình vuông khi biết diện tích',
    viec: 'Kéo thanh trượt để đổi diện tích hình vuông, đọc độ dài cạnh. Thử kéo xuống số âm.',
    khung: { loai: 'hinh-vuong', bac: 2, min: -25, max: 100, batDau: 49 },
    goiY: 'Cạnh hình vuông là căn bậc hai số học của diện tích. Số nào bình phương lên cũng bằng diện tích?',
    cauHoi: {
      hoi: 'Số $49$ có những căn bậc hai nào?',
      luaChon: ['Chỉ có $7$', '$7$ và $-7$', 'Chỉ có $-7$', 'Không có'],
      dung: 1,
      giaiThich: '$7^2 = 49$ và $(-7)^2 = 49$, nên $49$ có hai căn bậc hai là $7$ và $-7$. Cạnh hình vuông chỉ lấy số dương: $\\sqrt{49} = 7$ (căn bậc hai số học). Số âm không có căn bậc hai vì không số nào bình phương lên ra số âm.'
    }
  },
  {
    ku: 'C3-B7-M2', ten: 'Căn của một bình phương',
    viec: 'Kéo $a$ từ âm sang dương, so sánh ba cột $a$, $a^2$ và $\\sqrt{a^2}$.',
    khung: { loai: 'binh-phuong', min: -6, max: 6, batDau: -3 },
    goiY: 'Để ý khi $a$ âm: $\\sqrt{a^2}$ có bằng $a$ không?',
    cauHoi: {
      hoi: '$\\sqrt{(-3)^2}$ bằng bao nhiêu?',
      luaChon: ['$-3$', '$3$', '$9$', '$\\pm 3$'],
      dung: 1,
      giaiThich: '$(-3)^2 = 9$ và $\\sqrt{9} = 3$. Căn bậc hai số học không bao giờ âm, nên $\\sqrt{A^2} = |A|$, không phải $A$.'
    }
  },
  {
    ku: 'C3-B8-M1', ten: 'Căn của một tích',
    viec: 'Chọn hai số $a$, $b$. So sánh $\\sqrt{a \\cdot b}$ với $\\sqrt a \\cdot \\sqrt b$, rồi so sánh $\\sqrt{a + b}$ với $\\sqrt a + \\sqrt b$.',
    khung: { loai: 'nhan-chia', phep: 'nhan', a: 9, b: 16, max: 100 },
    goiY: 'Thử vài cặp số. Dòng nào luôn bằng nhau, dòng nào hầu như không bằng?',
    cauHoi: {
      hoi: 'Với $a = 9$, $b = 16$, điều nào đúng?',
      luaChon: ['$\\sqrt{9+16} = \\sqrt9 + \\sqrt{16}$', '$\\sqrt{9 \\cdot 16} = \\sqrt9 \\cdot \\sqrt{16}$', 'Cả hai đều đúng', 'Cả hai đều sai'],
      dung: 1,
      giaiThich: '$\\sqrt{9 \\cdot 16} = \\sqrt{144} = 12 = 3 \\cdot 4$. Nhưng $\\sqrt{9+16} = \\sqrt{25} = 5$, còn $\\sqrt9 + \\sqrt{16} = 7$. Căn "tách" được qua phép nhân, KHÔNG tách được qua phép cộng.'
    }
  },
  {
    ku: 'C3-B8-M2', ten: 'Căn của một thương',
    viec: 'Chọn $a$ và $b$, so sánh $\\sqrt{a : b}$ với $\\sqrt a : \\sqrt b$. Thử cho $b = 0$.',
    khung: { loai: 'nhan-chia', phep: 'chia', a: 50, b: 2, max: 100 },
    goiY: 'Chọn $a$, $b$ sao cho $a : b$ là số chính phương sẽ dễ thấy hơn.',
    cauHoi: {
      hoi: 'Tính nhanh $\\dfrac{\\sqrt{50}}{\\sqrt2}$.',
      luaChon: ['$25$', '$5$', '$\\sqrt{48}$', 'Không tính được'],
      dung: 1,
      giaiThich: '$\\dfrac{\\sqrt{50}}{\\sqrt2} = \\sqrt{\\dfrac{50}{2}} = \\sqrt{25} = 5$. Quy tắc dùng được khi $a \\ge 0$ và $b > 0$; $b = 0$ thì phép chia không có nghĩa.'
    }
  },
  {
    ku: 'C3-B9-M1', ten: 'Tách thừa số chính phương ra ngoài dấu căn',
    viec: 'Chọn một số dưới dấu căn, rồi bấm vào thừa số chính phương lớn nhất chia hết số đó để đưa ra ngoài.',
    khung: { loai: 'tach-thua-so', so: [72, 50, 48, 75, 200, 12] },
    goiY: 'Thừa số chính phương: $4, 9, 16, 25, 36, 49, 64, 100, \\dots$ Chọn số lớn nhất thì làm một lần là xong.',
    cauHoi: {
      hoi: 'Viết gọn $\\sqrt{72}$ được',
      luaChon: ['$3\\sqrt8$', '$2\\sqrt{18}$', '$6\\sqrt2$', '$36\\sqrt2$'],
      dung: 2,
      giaiThich: '$72 = 36 \\cdot 2$ nên $\\sqrt{72} = \\sqrt{36}\\cdot\\sqrt2 = 6\\sqrt2$. $3\\sqrt8$ và $2\\sqrt{18}$ cũng bằng $\\sqrt{72}$ nhưng chưa gọn vì dưới căn vẫn còn thừa số chính phương.'
    }
  },
  {
    ku: 'C3-B9-M1B', ten: 'Đưa thừa số vào trong để so sánh',
    viec: 'Bấm "Đưa vào trong" cho từng biểu thức, rồi so sánh hai số dưới dấu căn.',
    khung: { loai: 'dua-vao', cap: [{ k: 3, m: 5 }, { k: 2, m: 11 }, { k: -2, m: 3 }] },
    goiY: 'Với $k \\ge 0$: $k\\sqrt m = \\sqrt{k^2 m}$. Với $k < 0$ thì dấu trừ phải ở lại bên ngoài.',
    cauHoi: {
      hoi: 'So sánh $3\\sqrt5$ và $2\\sqrt{11}$.',
      luaChon: ['$3\\sqrt5 > 2\\sqrt{11}$', '$3\\sqrt5 < 2\\sqrt{11}$', '$3\\sqrt5 = 2\\sqrt{11}$', 'Không so sánh được'],
      dung: 0,
      giaiThich: '$3\\sqrt5 = \\sqrt{9 \\cdot 5} = \\sqrt{45}$ và $2\\sqrt{11} = \\sqrt{4 \\cdot 11} = \\sqrt{44}$. Vì $45 > 44$ nên $3\\sqrt5 > 2\\sqrt{11}$.'
    }
  },
  {
    ku: 'C3-B9-M2', ten: 'Tìm thứ cần nhân để mẫu hết căn',
    viec: 'Thử nhân cả tử và mẫu của $\\dfrac{6}{\\sqrt3}$ với từng biểu thức. Cách nào làm mẫu hết căn?',
    khung: {
      loai: 'truc-can', tu: '6', mau: '\\sqrt3',
      luaChon: [
        { nhan: '\\sqrt3', ketQua: '\\dfrac{6\\sqrt3}{3} = 2\\sqrt3', huuTi: true, nhanXet: 'Mẫu thành $3$, hết căn. Gọn nhất.' },
        { nhan: '3', ketQua: '\\dfrac{18}{3\\sqrt3}', huuTi: false, nhanXet: 'Mẫu vẫn còn $\\sqrt3$.' },
        { nhan: '2\\sqrt3', ketQua: '\\dfrac{12\\sqrt3}{6} = 2\\sqrt3', huuTi: true, nhanXet: 'Cũng hết căn, nhưng phải rút gọn thêm một bước.' },
        { nhan: '\\sqrt6', ketQua: '\\dfrac{6\\sqrt6}{\\sqrt{18}} = \\dfrac{6\\sqrt6}{3\\sqrt2}', huuTi: false, nhanXet: 'Mẫu vẫn còn căn.' }
      ]
    },
    cauHoi: {
      hoi: 'Muốn trục căn thức ở mẫu của $\\dfrac{5}{\\sqrt7}$, nhân cả tử và mẫu với',
      luaChon: ['$5$', '$7$', '$\\sqrt7$', '$\\sqrt5$'],
      dung: 2,
      giaiThich: '$\\dfrac{5}{\\sqrt7} = \\dfrac{5\\sqrt7}{\\sqrt7 \\cdot \\sqrt7} = \\dfrac{5\\sqrt7}{7}$. Nhân với chính căn ở mẫu vì $\\sqrt7\\cdot\\sqrt7 = 7$.'
    }
  },
  {
    ku: 'C3-B9-M2B', ten: 'Biểu thức liên hợp',
    viec: 'Thử nhân cả tử và mẫu của $\\dfrac{2}{\\sqrt5 - \\sqrt3}$ với từng biểu thức. Nhìn xem mẫu còn căn không.',
    khung: {
      loai: 'truc-can', tu: '2', mau: '\\sqrt5 - \\sqrt3',
      luaChon: [
        { nhan: '\\sqrt5 + \\sqrt3', ketQua: '\\dfrac{2(\\sqrt5+\\sqrt3)}{5 - 3} = \\sqrt5 + \\sqrt3', huuTi: true, nhanXet: 'Mẫu $= (\\sqrt5)^2 - (\\sqrt3)^2 = 2$, hết căn.' },
        { nhan: '\\sqrt5 - \\sqrt3', ketQua: '\\dfrac{2(\\sqrt5-\\sqrt3)}{8 - 2\\sqrt{15}}', huuTi: false, nhanXet: 'Mẫu $= (\\sqrt5-\\sqrt3)^2 = 8 - 2\\sqrt{15}$, vẫn còn căn.' },
        { nhan: '\\sqrt5', ketQua: '\\dfrac{2\\sqrt5}{5 - \\sqrt{15}}', huuTi: false, nhanXet: 'Mẫu vẫn còn $\\sqrt{15}$.' },
        { nhan: '\\sqrt3', ketQua: '\\dfrac{2\\sqrt3}{\\sqrt{15} - 3}', huuTi: false, nhanXet: 'Mẫu vẫn còn $\\sqrt{15}$.' }
      ]
    },
    goiY: 'Nhớ hằng đẳng thức $(x - y)(x + y) = x^2 - y^2$.',
    cauHoi: {
      hoi: 'Biểu thức liên hợp của $\\sqrt5 - \\sqrt3$ là',
      luaChon: ['$\\sqrt5 - \\sqrt3$', '$\\sqrt5 + \\sqrt3$', '$\\sqrt3 - \\sqrt5$', '$\\sqrt{15}$'],
      dung: 1,
      giaiThich: '$(\\sqrt5 - \\sqrt3)(\\sqrt5 + \\sqrt3) = 5 - 3 = 2$ không còn căn. Đổi dấu ở giữa là được biểu thức liên hợp.'
    }
  },
  {
    ku: 'C3-B9-M3', ten: 'Đưa về cùng một căn rồi gộp',
    viec: 'Lần lượt đưa thừa số ra ngoài cho $\\sqrt{12}$, $\\sqrt{27}$, $\\sqrt{48}$. Ba kết quả có gì giống nhau?',
    khung: { loai: 'tach-thua-so', so: [12, 27, 48] },
    goiY: 'Các căn giống nhau (cùng số dưới dấu căn) thì cộng, trừ hệ số như cộng, trừ số.',
    cauHoi: {
      hoi: 'Vì sao không được viết $\\sqrt{12} + \\sqrt{27} - \\sqrt{48} = \\sqrt{12 + 27 - 48}$?',
      luaChon: ['Vì $12 + 27 - 48$ âm', 'Vì căn không tách được qua phép cộng, trừ', 'Cả hai lý do trên', 'Viết như vậy là đúng'],
      dung: 2,
      giaiThich: '$12 + 27 - 48 = -9$ nên $\\sqrt{-9}$ không có nghĩa. Mà kể cả khi kết quả dương, $\\sqrt{a} + \\sqrt{b}$ nói chung khác $\\sqrt{a + b}$. Chỉ cộng được các căn đồng dạng: $2\\sqrt3 + 3\\sqrt3 = 5\\sqrt3$.'
    }
  },
  {
    ku: 'C3-B10-M1', ten: 'Cạnh của khối lập phương khi biết thể tích',
    viec: 'Kéo thanh trượt để đổi số $V$, đọc $\\sqrt[3]{V}$. Lần này thử cả số âm.',
    khung: { loai: 'hinh-vuong', bac: 3, min: -64, max: 64, batDau: 27 },
    goiY: 'So với căn bậc hai: căn bậc ba của số âm có tồn tại không?',
    cauHoi: {
      hoi: '$\\sqrt[3]{-27}$ bằng',
      luaChon: ['$3$', '$-3$', 'Không tồn tại', '$-9$'],
      dung: 1,
      giaiThich: '$(-3)^3 = -27$ nên $\\sqrt[3]{-27} = -3$. Khác căn bậc hai, mọi số thực đều có đúng một căn bậc ba; số âm có căn bậc ba âm.'
    }
  },
  {
    ku: 'C3-B10-M2', ten: 'Căn bậc hai và căn bậc ba: khi nào có nghĩa',
    viec: 'Kéo $x$ trên trục số. Xem $\\sqrt{x - 2}$ và $\\sqrt[3]{x - 2}$ có nghĩa ở những vị trí nào.',
    khung: { loai: 'dieu-kien', a: 1, b: -2, min: -4, max: 8 },
    goiY: 'Vùng tô xanh là các giá trị $x$ làm biểu thức có nghĩa.',
    cauHoi: {
      hoi: '$\\sqrt[3]{x - 2}$ có nghĩa khi',
      luaChon: ['$x \\ge 2$', '$x > 2$', 'mọi số thực $x$', '$x \\ne 2$'],
      dung: 2,
      giaiThich: 'Căn bậc ba có nghĩa với mọi biểu thức, nên $\\sqrt[3]{x - 2}$ có nghĩa với mọi $x$. Còn $\\sqrt{x - 2}$ cần $x - 2 \\ge 0$, tức $x \\ge 2$.'
    }
  },

  // ---------------- CHƯƠNG IV. HỆ THỨC LƯỢNG TRONG TAM GIÁC VUÔNG ----------------
  {
    ku: 'C4-B11-M1', ten: 'Tỉ số không đổi khi phóng to tam giác',
    viec: 'Kéo góc $\\alpha$, rồi kéo thanh "Phóng to". Theo dõi độ dài các cạnh và bốn tỉ số.',
    khung: { loai: 'tam-giac', cheDo: 'ti-so', gocBatDau: 35 },
    goiY: 'Khi chỉ phóng to (giữ nguyên góc), cạnh nào đổi, tỉ số nào đổi?',
    cauHoi: {
      hoi: 'Giữ nguyên góc $\\alpha$, phóng to tam giác lên gấp đôi thì $\\sin\\alpha$',
      luaChon: ['tăng gấp đôi', 'giảm một nửa', 'không đổi', 'tăng gấp bốn'],
      dung: 2,
      giaiThich: 'Mọi cạnh cùng tăng gấp đôi nên tỉ số giữa hai cạnh không đổi. Vì vậy tỉ số lượng giác chỉ phụ thuộc vào góc, không phụ thuộc kích thước tam giác.'
    }
  },
  {
    ku: 'C4-B11-M2', ten: 'Các góc đặc biệt 30°, 45°, 60°',
    viec: 'Bấm các nút 30°, 45°, 60° và ghi lại giá trị các tỉ số.',
    khung: { loai: 'tam-giac', cheDo: 'dac-biet', gocBatDau: 30 },
    goiY: 'Góc 30° là nửa tam giác đều; góc 45° là nửa hình vuông.',
    cauHoi: {
      hoi: '$\\sin 30^\\circ$ bằng',
      luaChon: ['$\\dfrac{1}{2}$', '$\\dfrac{\\sqrt3}{2}$', '$\\dfrac{\\sqrt2}{2}$', '$\\sqrt3$'],
      dung: 0,
      giaiThich: 'Trong nửa tam giác đều cạnh $2$: cạnh đối diện góc $30^\\circ$ dài $1$, cạnh huyền dài $2$, nên $\\sin 30^\\circ = \\dfrac12$.'
    }
  },
  {
    ku: 'C4-B11-M3', ten: 'Hai góc phụ nhau',
    viec: 'Kéo góc $\\alpha$. Góc còn lại $\\beta = 90^\\circ - \\alpha$. So sánh các tỉ số của hai góc.',
    khung: { loai: 'tam-giac', cheDo: 'phu-nhau', gocBatDau: 35 },
    goiY: 'Cạnh đối của góc này chính là cạnh kề của góc kia.',
    cauHoi: {
      hoi: '$\\sin 35^\\circ$ bằng',
      luaChon: ['$\\sin 55^\\circ$', '$\\cos 55^\\circ$', '$\\cos 35^\\circ$', '$\\tan 55^\\circ$'],
      dung: 1,
      giaiThich: '$35^\\circ + 55^\\circ = 90^\\circ$ nên hai góc phụ nhau. Sin góc này bằng cos góc kia: $\\sin 35^\\circ = \\cos 55^\\circ$.'
    }
  },
  {
    ku: 'C4-B12-M1', ten: 'Tính cạnh góc vuông từ cạnh huyền',
    viec: 'Kéo cạnh huyền $a$ và góc $B$. Web tính $b = a\\sin B$ và $c = a\\cos B$; đối chiếu với độ dài đo trên hình.',
    khung: { loai: 'tam-giac', cheDo: 'canh-huyen', gocBatDau: 30 },
    cauHoi: {
      hoi: 'Tam giác $ABC$ vuông tại $A$ có cạnh huyền $BC = 10$, $\\hat B = 30^\\circ$. Cạnh $AC$ dài',
      luaChon: ['$5$', '$5\\sqrt3$', '$10\\sqrt3$', '$20$'],
      dung: 0,
      giaiThich: '$AC$ đối diện góc $B$ nên $AC = BC \\cdot \\sin B = 10 \\cdot \\dfrac12 = 5$.'
    }
  },
  {
    ku: 'C4-B12-M2', ten: 'Tính cạnh góc vuông từ cạnh góc vuông kia',
    viec: 'Kéo cạnh $c = AB$ và góc $B$. Web tính $b = c\\tan B$; đối chiếu với độ dài đo trên hình.',
    khung: { loai: 'tam-giac', cheDo: 'canh-goc-vuong', gocBatDau: 45 },
    cauHoi: {
      hoi: 'Tam giác $ABC$ vuông tại $A$ có $AB = 8$, $\\hat B = 45^\\circ$. Cạnh $AC$ dài',
      luaChon: ['$4$', '$8$', '$8\\sqrt2$', '$16$'],
      dung: 1,
      giaiThich: '$AC = AB \\cdot \\tan B = 8 \\cdot \\tan 45^\\circ = 8 \\cdot 1 = 8$.'
    }
  },
  {
    ku: 'C4-B12-M3', ten: 'Đo chiều cao cái cây bằng góc nhìn',
    viec: 'Kéo khoảng cách từ em tới gốc cây và góc nhìn lên ngọn cây. Mắt em cách mặt đất $1{,}5$ m.',
    khung: { loai: 'tam-giac', cheDo: 'do-cao', gocBatDau: 35 },
    goiY: 'Chiều cao cây = chiều cao tới mắt + khoảng cách × tan góc nhìn.',
    cauHoi: {
      hoi: 'Đứng cách gốc cây $20$ m, nhìn ngọn cây với góc $35^\\circ$, mắt cao $1{,}5$ m. Cây cao khoảng',
      luaChon: ['$12{,}9$ m', '$14{,}0$ m', '$15{,}5$ m', '$28{,}6$ m'],
      dung: 2,
      giaiThich: 'Phần trên tầm mắt: $20 \\cdot \\tan 35^\\circ \\approx 20 \\cdot 0{,}700 = 14{,}0$ m. Cộng thêm $1{,}5$ m tới mắt: khoảng $15{,}5$ m. Hay quên cộng chiều cao tới mắt.'
    }
  },
  // =========================================================================
  // CHƯƠNG V · ĐƯỜNG TRÒN (13 mục C5-B13-M1 → C5-B17-M2)
  // =========================================================================
  {
    ku: 'C5-B13-M1', ten: 'Điểm nằm trong, trên hay ngoài đường tròn',
    viec: 'Kéo điểm $M$ lại gần hoặc ra xa tâm $O$, rồi thử đổi bán kính $R$ xem khi nào $M$ nằm trên đường tròn.',
    khung: { loai: 'tron-diem', rMacDau: 4, omMacDau: 2.5 },
    goiY: 'So sánh khoảng cách $OM$ với bán kính $R$ (nhớ đường kính $= 2R$).',
    cauHoi: {
      hoi: 'Đường tròn $(O)$ có đường kính $10\\text{ cm}$, điểm $M$ có $OM = 4\\text{ cm}$. Điểm $M$ nằm:',
      luaChon: ['nằm trong đường tròn', 'trên đường tròn', 'nằm ngoài đường tròn', 'không xác định được'],
      dung: 0,
      giaiThich: 'Đường kính $10\\text{ cm} \\Rightarrow R = 5\\text{ cm}$. Vì $OM = 4 < R = 5$ nên $M$ nằm bên trong đường tròn.'
    }
  },
  {
    ku: 'C5-B13-M2', ten: 'Tâm và trục đối xứng của đường tròn',
    viec: 'Xoay đường thẳng $d$ qua tâm $O$ theo các góc khác nhau rồi bấm lấy điểm đối xứng qua $O$ và qua $d$.',
    khung: { loai: 'tron-doi-xung', gocBatDau: 30 },
    goiY: 'Mọi đường thẳng đi qua tâm $O$ có phải đều chia đường tròn thành hai nửa đối xứng không?',
    cauHoi: {
      hoi: 'Đường tròn có bao nhiêu trục đối xứng?',
      luaChon: ['1', '2', '4', 'Vô số'],
      dung: 3,
      giaiThich: 'Tâm $O$ là tâm đối xứng duy nhất, còn mọi đường thẳng đi qua $O$ đều là trục đối xứng nên có vô số trục đối xứng.'
    }
  },
  {
    ku: 'C5-B14-M1', ten: 'Dây và đường kính — vì sao đường kính dài nhất?',
    viec: 'Kéo dây $AB$ lại gần tâm $O$ (giảm $d = OH$ về $0$) để xem độ dài $AB$ thay đổi thế nào.',
    khung: { loai: 'day-cung', r: 5, dMacDau: 3 },
    goiY: 'Trong tam giác vuông $OHB$, $HB = \\sqrt{R^2 - d^2}$ nên $AB = 2HB$. Khi $d = 0$ thì $AB$ lớn nhất!',
    cauHoi: {
      hoi: 'Cho đường tròn $(O; 5\\text{ cm})$ và dây $AB = 8\\text{ cm}$. Khoảng cách từ $O$ đến dây $AB$ là:',
      luaChon: ['$3\\text{ cm}$', '$4\\text{ cm}$', '$\\sqrt{89}\\text{ cm}$', '$1\\text{ cm}$'],
      dung: 0,
      giaiThich: 'Nửa dây là $HB = 8 : 2 = 4\\text{ cm}$. Theo định lí Pythagore: $d = \\sqrt{5^2 - 4^2} = 3\\text{ cm}$.'
    }
  },
  {
    ku: 'C5-B14-M2', ten: 'Góc ở tâm và cung lớn, cung nhỏ trên Sun Wheel',
    viec: 'Thay đổi số đo góc ở tâm $\\widehat{AOB}$ trên vòng tròn để quan sát cung nhỏ $AB$ và cung lớn $AB$.',
    khung: { loai: 'cung-quat', cheDo: 'goc-cung', gocMacDau: 70 },
    goiY: 'Số đo cung nhỏ bằng góc ở tâm; số đo cung lớn $= 360^\\circ - \\text{sđ cung nhỏ}$.',
    cauHoi: {
      hoi: 'Cho góc ở tâm $\\widehat{AOB} = 70^\\circ$. Số đo cung lớn $\\overset{\\frown}{AB}$ là:',
      luaChon: ['$70^\\circ$', '$110^\\circ$', '$290^\\circ$', '$140^\\circ$'],
      dung: 2,
      giaiThich: 'Cung nhỏ $\\overset{\\frown}{AB} = 70^\\circ \\Rightarrow$ cung lớn $= 360^\\circ - 70^\\circ = 290^\\circ$.'
    }
  },
  {
    ku: 'C5-B14-M3', ten: 'Cộng và so sánh số đo hai cung',
    viec: 'Thay đổi hai cung kề nhau $AB$ và $BC$ để quan sát cách cộng cung thành cung $AC$.',
    khung: { loai: 'cung-quat', cheDo: 'cong-cung', gocMacDau: 50 },
    goiY: 'Khi điểm $B$ nằm trên cung $\\overset{\\frown}{AC}$ thì $\\text{sđ}\\,\\overset{\\frown}{AC} = \\text{sđ}\\,\\overset{\\frown}{AB} + \\text{sđ}\\,\\overset{\\frown}{BC}$.',
    cauHoi: {
      hoi: 'Điểm $C$ nằm trên cung nhỏ $\\overset{\\frown}{AB}$, biết $\\text{sđ}\\,\\overset{\\frown}{AC} = 40^\\circ$, $\\text{sđ}\\,\\overset{\\frown}{CB} = 30^\\circ$. Số đo cung nhỏ $\\overset{\\frown}{AB}$ là:',
      luaChon: ['$10^\\circ$', '$35^\\circ$', '$70^\\circ$', '$290^\\circ$'],
      dung: 2,
      giaiThich: 'Vì $C$ nằm trên cung nhỏ $AB$ nên $\\text{sđ}\\,\\overset{\\frown}{AB} = 40^\\circ + 30^\\circ = 70^\\circ$.'
    }
  },
  {
    ku: 'C5-B15-M1', ten: 'Độ dài cung tròn & Vòng quay Sun Wheel Đà Nẵng',
    viec: 'Chọn góc ở tâm $n$ và bán kính $R$ (hoặc bật chế độ Sun Wheel) để xem độ dài cung $l$ tỉ lệ với $n$ ra sao.',
    khung: { loai: 'cung-quat', cheDo: 'do-dai', gocMacDau: 60 },
    goiY: 'Công thức chuẩn là $l = \\dfrac{\\pi R n}{180}$ (mẫu là $180$, không phải $360$).',
    cauHoi: {
      hoi: 'Độ dài cung $60^\\circ$ của đường tròn bán kính $6\\text{ cm}$ là:',
      luaChon: ['$\\pi\\text{ cm}$', '$2\\pi\\text{ cm}$', '$6\\pi\\text{ cm}$', '$12\\pi\\text{ cm}$'],
      dung: 1,
      giaiThich: 'Áp dụng công thức: $l = \\dfrac{\\pi \\cdot 6 \\cdot 60}{180} = 2\\pi\\text{ cm}$.'
    }
  },
  {
    ku: 'C5-B15-M2', ten: 'Diện tích hình quạt tròn',
    viec: 'Kéo góc $n$ và bán kính $R$ để đối chiếu diện tích phần hình quạt tô màu qua hai công thức.',
    khung: { loai: 'cung-quat', cheDo: 'hinh-quat', gocMacDau: 60 },
    goiY: 'Hình quạt tròn dùng mẫu $360$: $S = \\dfrac{\\pi R^2 n}{360} = \\dfrac{l \\cdot R}{2}$.',
    cauHoi: {
      hoi: 'Diện tích hình quạt tròn bán kính $6\\text{ cm}$, cung $60^\\circ$ là:',
      luaChon: ['$2\\pi\\text{ cm}^2$', '$6\\pi\\text{ cm}^2$', '$12\\pi\\text{ cm}^2$', '$36\\pi\\text{ cm}^2$'],
      dung: 1,
      giaiThich: '$S = \\dfrac{\\pi \\cdot 6^2 \\cdot 60}{360} = 6\\pi\\text{ cm}^2$ (lấy $\\dfrac{1}{6}$ diện tích hình tròn $36\\pi$).'
    }
  },
  {
    ku: 'C5-B15-M3', ten: 'Diện tích hình vành khuyên',
    viec: 'Kéo bán kính ngoài $R$ và trong $r$ để thấy rõ vì sao phải lấy hiệu hai bình phương $R^2 - r^2$.',
    khung: { loai: 'cung-quat', cheDo: 'vanh-khuyen', gocMacDau: 360 },
    goiY: 'Diện tích hình vành khuyên bằng hiệu diện tích hai hình tròn đồng tâm: $\\pi R^2 - \\pi r^2 = \\pi(R^2 - r^2)$.',
    cauHoi: {
      hoi: 'Hình vành khuyên có bán kính ngoài $R = 5\\text{ cm}$, bán kính trong $r = 3\\text{ cm}$ có diện tích:',
      luaChon: ['$4\\pi\\text{ cm}^2$', '$16\\pi\\text{ cm}^2$', '$8\\pi\\text{ cm}^2$', '$34\\pi\\text{ cm}^2$'],
      dung: 1,
      giaiThich: '$S = \\pi(5^2 - 3^2) = \\pi(25 - 9) = 16\\pi\\text{ cm}^2$. Lỗi hay nhầm: $\\pi(5 - 3)^2 = 4\\pi$.'
    }
  },
  {
    ku: 'C5-B16-M1', ten: 'Ba vị trí của đường thẳng và đường tròn',
    viec: 'Kéo đường thẳng $a$ lại gần hoặc ra xa tâm $O$ (đổi khoảng cách $d$) và đếm số giao điểm đỏ/xanh.',
    khung: { loai: 'thang-tron', cheDo: 'vi-tri' },
    goiY: 'So sánh $d$ với $R$: $d < R$ (cắt), $d = R$ (tiếp xúc), $d > R$ (không giao nhau).',
    cauHoi: {
      hoi: 'Cho $(O; 5\\text{ cm})$ và đường thẳng $a$ cách tâm $O$ một khoảng $5\\text{ cm}$. Khẳng định đúng là:',
      luaChon: ['cắt nhau tại 2 điểm', 'tiếp xúc nhau tại 1 điểm', 'không giao nhau', 'trùng với tâm $O$'],
      dung: 1,
      giaiThich: 'Vì $d = R = 5\\text{ cm}$ nên đường thẳng $a$ tiếp xúc với đường tròn (có đúng $1$ điểm chung).'
    }
  },
  {
    ku: 'C5-B16-M2', ten: 'Nhận biết tiếp tuyến và tính độ dài đoạn tiếp tuyến',
    viec: 'Thay đổi bán kính $R$ và khoảng cách $OM$ để quan sát tam giác vuông $OAM$ vuông tại tiếp điểm $A$.',
    khung: { loai: 'thang-tron', cheDo: 'tiep-tuyen' },
    goiY: 'Vì $OA \\perp MA$ tại $A$ nên cạnh huyền là $OM$, do đó $MA^2 = OM^2 - R^2$.',
    cauHoi: {
      hoi: '$MA$ là tiếp tuyến của $(O; 6\\text{ cm})$ tại $A$, biết $OM = 10\\text{ cm}$. Độ dài đoạn $MA$ là:',
      luaChon: ['$4\\text{ cm}$', '$8\\text{ cm}$', '$\\sqrt{136}\\text{ cm}$', '$16\\text{ cm}$'],
      dung: 1,
      giaiThich: 'Tam giác $OAM$ vuông tại $A \\Rightarrow MA = \\sqrt{OM^2 - OA^2} = \\sqrt{10^2 - 6^2} = 8\\text{ cm}$.'
    }
  },
  {
    ku: 'C5-B16-M3', ten: 'Tính chất hai tiếp tuyến cắt nhau',
    viec: 'Thay đổi khoảng cách $OM$ để quan sát hai đoạn tiếp tuyến $MA, MB$ và đường nối $AB$ vuông góc với $OM$.',
    khung: { loai: 'thang-tron', cheDo: 'hai-tiep-tuyen' },
    goiY: 'Hai tiếp tuyến cắt nhau tại $M$ luôn thoả mãn: $MA = MB$, $MO$ là phân giác $\\widehat{AMB}$ và $OM \\perp AB$.',
    cauHoi: {
      hoi: 'Từ điểm $M$ ngoài $(O; 3\\text{ cm})$ kẻ hai tiếp tuyến $MA, MB$ biết $MA = 4\\text{ cm}$. Độ dài $MB$ và $MO$ lần lượt là:',
      luaChon: ['$3\\text{ cm}$ và $5\\text{ cm}$', '$4\\text{ cm}$ và $5\\text{ cm}$', '$4\\text{ cm}$ và $7\\text{ cm}$', '$4\\text{ cm}$ và $\\sqrt{7}\\text{ cm}$'],
      dung: 1,
      giaiThich: 'Theo tính chất hai tiếp tuyến cắt nhau: $MB = MA = 4\\text{ cm}$, và $MO = \\sqrt{3^2 + 4^2} = 5\\text{ cm}$.'
    }
  },
  {
    ku: 'C5-B17-M1', ten: 'Ba vị trí tương đối của hai đường tròn theo số điểm chung',
    viec: 'Kéo tâm $O\'$ dịch chuyển lại gần tâm $O$ để đếm số giao điểm của hai đường tròn.',
    khung: { loai: 'hai-tron', cheDo: 'so-diem-chung' },
    goiY: 'Hai đường tròn phân biệt chỉ có tối đa $2$ điểm chung: cắt nhau ($2$), tiếp xúc ($1$), không giao nhau ($0$).',
    cauHoi: {
      hoi: 'Hai đường tròn $(O)$ và $(O\')$ tiếp xúc nhau tại $A$. Khẳng định nào luôn đúng?',
      luaChon: ['$O, O\', A$ thẳng hàng', '$OA \\perp O\'A$', '$OA = O\'A$', '$A$ là trung điểm $OO\'$'],
      dung: 0,
      giaiThich: 'Khi hai đường tròn tiếp xúc nhau tại $A$ thì tiếp điểm $A$ luôn nằm trên đường nối tâm $OO\'$ (nên $O, O\', A$ thẳng hàng).'
    }
  },
  {
    ku: 'C5-B17-M2', ten: 'So sánh khoảng cách hai tâm $d$ với $R + r$ và $R - r$',
    viec: 'Kéo đường tròn $(O\')$ qua đủ $5$ trường hợp vị trí và đối chiếu giá trị $d$ với $R - r$ và $R + r$.',
    khung: { loai: 'hai-tron', cheDo: 'he-thuc-khoang-cach' },
    goiY: 'Tiếp xúc ngoài: $d = R + r$; tiếp xúc trong: $d = R - r$; cắt nhau: $R - r < d < R + r$.',
    cauHoi: {
      hoi: 'Cho $(O; 5\\text{ cm})$ và $(O\'; 3\\text{ cm})$ có $OO\' = 2\\text{ cm}$. Hai đường tròn ở vị trí:',
      luaChon: ['tiếp xúc ngoài', 'cắt nhau', 'tiếp xúc trong', 'ở ngoài nhau'],
      dung: 2,
      giaiThich: 'Ta có $R - r = 5 - 3 = 2\\text{ cm} = d = OO\'$, nên hai đường tròn tiếp xúc trong.'
    }
  }
];

export const thiNghiemCuaMuc = (ku: string) => THI_NGHIEM.find((t) => t.ku === ku) ?? null;
