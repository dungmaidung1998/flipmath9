/**
 * NỘI DUNG TOÁN 9 — CHƯƠNG VII. TẦN SỐ VÀ TẦN SỐ TƯƠNG ĐỐI (Kết nối tri thức)
 * BẢN NHÁP do trợ lý AI soạn theo SGK Toán 9 tập hai (Bài 22–24) — giáo viên duyệt trước khi dùng.
 * Bảng, biểu đồ được mô tả bằng lời trong đề (giá trị: tần số).
 */
const SEC = { 1: 45, 2: 60, 3: 90, 4: 120 };
const B22 = 'Bài 22. Bảng tần số và biểu đồ tần số';
const B23 = 'Bài 23. Bảng tần số tương đối và biểu đồ tần số tương đối';
const B24 = 'Bài 24. Bảng tần số, tần số tương đối ghép nhóm và biểu đồ';
const U = (id, bai, muc, name, order, prerequisite, mucTieu, extra = {}) => ({ id, bai, muc, name, order, prerequisite, mucTieu, ...extra });

export const UNITS = [
  U('C7-B22-M1', B22, 'Mục 1', 'Tần số và bảng tần số', 100, null,
    'Xác định tần số của mỗi giá trị, lập bảng tần số; biết tổng các tần số bằng cỡ mẫu.'),
  U('C7-B22-M2', B22, 'Mục 2', 'Biểu đồ tần số', 101, 'C7-B22-M1',
    'Đọc và vẽ biểu đồ cột, biểu đồ đoạn thẳng biểu diễn bảng tần số; rút ra nhận xét từ biểu đồ.'),
  U('C7-B23-M1', B23, 'Mục 1', 'Tần số tương đối và bảng tần số tương đối', 102, 'C7-B22-M1',
    'Tính tần số tương đối f = m/N·100%; lập bảng tần số tương đối; dùng tỉ lệ để so sánh hai mẫu có cỡ khác nhau.'),
  U('C7-B23-M2', B23, 'Mục 2', 'Biểu đồ tần số tương đối', 103, 'C7-B23-M1',
    'Đọc và vẽ biểu đồ hình quạt tròn (góc ở tâm = f·360°) và biểu đồ cột tần số tương đối.'),
  U('C7-B24-M1', B24, 'Mục 1', 'Mẫu số liệu ghép nhóm', 104, 'C7-B22-M1',
    'Hiểu nhóm [a; b) gồm a ≤ x < b, độ dài nhóm, giá trị đại diện; chia số liệu thành các nhóm.'),
  U('C7-B24-M2', B24, 'Mục 2', 'Tần số ghép nhóm và bảng tần số ghép nhóm', 105, 'C7-B24-M1',
    'Đếm tần số của mỗi nhóm, lập bảng tần số ghép nhóm; ước lượng số trung bình bằng giá trị đại diện.'),
  U('C7-B24-M3', B24, 'Mục 3', 'Tần số tương đối ghép nhóm', 106, 'C7-B24-M2',
    'Tính tần số tương đối của mỗi nhóm, lập bảng tần số tương đối ghép nhóm và trả lời câu hỏi thực tế.'),
  U('C7-B24-M4', B24, 'Mục 4', 'Biểu đồ tần số tương đối ghép nhóm', 107, 'C7-B24-M3',
    'Đọc và vẽ biểu đồ cột (các cột liền nhau) và biểu đồ đoạn thẳng (qua giá trị đại diện) tần số tương đối ghép nhóm.')
];

const E = (code, ku, role, cluster, ten, tieuDe, phut, misconception, viDu) =>
  ({ code, ku, role, cluster, ten, tieuDe, phut, misconception, viDu, remediation: 'VBH-' + code.slice(2) });
const LOI = [
  E('E-TS-01', 'C7-B22-M1', 'root', 'Tần số', 'Nhầm giá trị với tần số, đếm tần số sai', 'Tần số là số lần giá trị xuất hiện; tổng tần số = N', 5,
    'Nhầm giá trị với tần số, đếm thiếu hoặc thừa, cộng các giá trị thay cho các tần số khi tìm cỡ mẫu', 'Giá trị 7 xuất hiện 4 lần nhưng ghi tần số là 7'),
  E('E-TS-02', 'C7-B22-M2', 'leaf', 'Tần số', 'Đọc, chọn biểu đồ tần số sai', 'Chiều cao cột (điểm) là tần số; trục ngang là giá trị', 5,
    'Đọc biểu đồ nhầm trục, kết luận theo vị trí cột thay vì chiều cao, hoặc chọn loại biểu đồ không phù hợp', 'Cột điểm 9 ở xa nhất nên điểm 9 nhiều bạn nhất'),
  E('E-TSTD-01', 'C7-B23-M1', 'mediating', 'Tần số tương đối', 'Tính tần số tương đối sai', 'f = m/N · 100%; tổng các f = 100%', 5,
    'Tính tần số tương đối bằng N/m, viết thẳng tần số thành phần trăm, hoặc so sánh hai mẫu cỡ khác nhau bằng tần số', 'Lớp 40 bạn, 10 bạn thích bóng đá: tần số tương đối 10%'),
  E('E-TSTD-02', 'C7-B23-M2', 'leaf', 'Tần số tương đối', 'Tính góc, đọc biểu đồ quạt sai', 'Góc ở tâm = f · 360°', 5,
    'Lấy góc ở tâm bằng chính số phần trăm, nhân với 180°, hoặc đọc phần trăm thành số người', 'Hình quạt 25% có góc 25°'),
  E('E-GN-01', 'C7-B24-M1', 'root', 'Ghép nhóm', 'Xếp giá trị biên vào nhóm sai', 'Nhóm [a; b) lấy a, không lấy b', 5,
    'Xếp giá trị bằng đầu mút phải vào nhóm [a; b), đếm một giá trị vào hai nhóm, hoặc tính độ dài nhóm sai', '160 thuộc nhóm [155; 160)'),
  E('E-GN-02', 'C7-B24-M2', 'mediating', 'Ghép nhóm', 'Tính tần số, giá trị đại diện của nhóm sai', 'Tần số nhóm = số giá trị trong nhóm; đại diện = trung điểm', 6,
    'Đếm tần số nhóm sai, cộng sai tỉ lệ các nhóm, hoặc ước lượng trung bình mà không dùng giá trị đại diện và tần số', 'Trung bình = trung bình cộng các giá trị đại diện, không nhân tần số'),
  E('E-GN-03', 'C7-B24-M4', 'leaf', 'Ghép nhóm', 'Đọc, vẽ biểu đồ ghép nhóm sai', 'Cột liền nhau; đường gấp khúc qua giá trị đại diện', 5,
    'Vẽ cột tách rời, đặt điểm của biểu đồ đoạn thẳng ở đầu mút nhóm, hoặc so sánh hai mẫu cỡ khác nhau bằng tần số', 'Đặt điểm của nhóm [0; 10) tại hoành độ 0')
];
export const ERRORS = LOI.map(({ code, ku, misconception, viDu, remediation }) => ({ code, ku, misconception, viDu, remediation }));
export const REMEDIATION = Object.fromEntries(LOI.map((e) => [e.remediation, { ku: e.ku, title: e.tieuDe, minutes: e.phut }]));

const Q = (id, level, stem, [A, B, C, D], err, hinh) =>
  ({ id, ku: id.replace(/-Q\d+$/, ''), level, sec: SEC[level], stem, opts: { A, B, C, D }, correct: 'A', err, ...(hinh ? { hinh } : {}) });
const e3 = (c) => ({ B: c, C: c, D: c });
const BD = 'Biểu đồ cột cho biết điểm kiểm tra của một nhóm: điểm 6 có 3 bạn, điểm 7 có 8 bạn, điểm 8 có 6 bạn, điểm 9 có 3 bạn.';
const GN = 'Điểm thi (thang 10) của 20 bạn: [5; 6) có 3 bạn; [6; 7) có 5 bạn; [7; 8) có 7 bạn; [8; 9) có 4 bạn; [9; 10] có 1 bạn.';
const TL = 'Bảng tần số tương đối ghép nhóm: [0; 2) chiếm 15%; [2; 4) chiếm 40%; [4; 6) chiếm 35%; [6; 8) chiếm 10%.';
const DT = 'Thời gian dùng điện thoại mỗi ngày của 60 học sinh: [0; 1) giờ có 9 bạn; [1; 2) có 24 bạn; [2; 3) có 18 bạn; [3; 4) có 9 bạn.';

export const QUESTIONS = [
  // ---------- C7-B22-M1
  Q('C7-B22-M1-Q01', 1, 'Điểm kiểm tra của 10 bạn: 7; 8; 7; 9; 6; 7; 8; 9; 7; 10. Tần số của giá trị 7 là:', ['4', '7', '28', '10'], e3('E-TS-01')),
  Q('C7-B22-M1-Q02', 1, 'Trong một bảng tần số, tổng các tần số bằng:', ['cỡ mẫu N', 'số giá trị khác nhau', '100', 'giá trị lớn nhất'], e3('E-TS-01')),
  Q('C7-B22-M1-Q03', 2, 'Số con của 12 gia đình: 1; 2; 2; 3; 1; 2; 0; 2; 1; 3; 2; 1. Với các giá trị 0; 1; 2; 3, các tần số tương ứng là:', ['1; 4; 5; 2', '1; 3; 5; 3', '0; 4; 6; 2', '1; 4; 4; 3'], e3('E-TS-01')),
  Q('C7-B22-M1-Q04', 2, 'Bảng tần số cỡ giày của một nhóm bạn: cỡ 36, 37, 38, 39 có tần số lần lượt 3, 7, 6, 4. Số bạn được khảo sát là:', ['20', '4', '150', '7'], e3('E-TS-01')),
  Q('C7-B22-M1-Q05', 3, 'Bảng tần số cỡ giày: cỡ 36, 37, 38, 39 có tần số lần lượt 3, 7, 6, 4. Cỡ giày có nhiều bạn đi nhất là:', ['37', '39', '7', '36'], e3('E-TS-01')),
  Q('C7-B22-M1-Q06', 3, 'Một mẫu có 30 số liệu, bảng tần số có các tần số 5; 8; x; 7. Giá trị của x là:', ['10', '30', '20', '7'], e3('E-TS-01')),
  Q('C7-B22-M1-Q07', 4, 'Số lỗi chính tả của 20 học sinh: 6 bạn không có lỗi, 7 bạn 1 lỗi, 4 bạn 2 lỗi, 3 bạn 3 lỗi. Tổng số lỗi của cả nhóm là:', ['24', '20', '6', '10'], e3('E-TS-01')),
  Q('C7-B22-M1-Q08', 4, 'Số lỗi chính tả của 20 học sinh: 6 bạn không có lỗi, 7 bạn 1 lỗi, 4 bạn 2 lỗi, 3 bạn 3 lỗi. Số bạn mắc ít nhất 2 lỗi là:', ['7', '4', '14', '3'], e3('E-TS-01')),

  // ---------- C7-B22-M2
  Q('C7-B22-M2-Q01', 1, 'Trong biểu đồ cột biểu diễn bảng tần số, chiều cao mỗi cột biểu thị:', ['tần số của giá trị', 'giá trị', 'cỡ mẫu', 'tần số tương đối'], e3('E-TS-02')),
  Q('C7-B22-M2-Q02', 1, 'Biểu đồ đoạn thẳng biểu diễn bảng tần số có trục nằm ngang ghi:', ['các giá trị', 'các tần số', 'cỡ mẫu', 'các phần trăm'], e3('E-TS-02')),
  Q('C7-B22-M2-Q03', 2, `${BD} Số bạn đạt điểm 8 là:`, ['6', '8', '3', '20'], e3('E-TS-02')),
  Q('C7-B22-M2-Q04', 2, `${BD} Số học sinh được khảo sát là:`, ['20', '30', '4', '8'], { B: 'E-TS-01', C: 'E-TS-01', D: 'E-TS-02' }),
  Q('C7-B22-M2-Q05', 3, `${BD} Số bạn đạt từ 8 điểm trở lên là:`, ['9', '6', '17', '3'], e3('E-TS-02')),
  Q('C7-B22-M2-Q06', 3, 'Muốn biểu diễn sự thay đổi nhiệt độ theo các giờ trong ngày, nên dùng:', ['biểu đồ đoạn thẳng', 'biểu đồ hình quạt tròn', 'bảng tần số tương đối', 'biểu đồ tranh'], e3('E-TS-02')),
  Q('C7-B22-M2-Q07', 4, `${BD} Điểm trung bình của nhóm là:`, ['7,45', '7,5', '5', '29,8'], { B: 'E-TS-02', C: 'E-TS-01', D: 'E-TS-01' }),
  Q('C7-B22-M2-Q08', 4, `${BD} Bạn An kết luận "điểm 9 có nhiều bạn đạt nhất vì cột điểm 9 nằm xa nhất bên phải". Nhận xét đúng là:`, ['An sai: điểm 7 có nhiều bạn nhất vì cột điểm 7 cao nhất', 'An đúng', 'An sai: điểm 6 có nhiều bạn nhất', 'An sai: điểm 8 có nhiều bạn nhất'], e3('E-TS-02')),

  // ---------- C7-B23-M1
  Q('C7-B23-M1-Q01', 1, 'Trong mẫu có cỡ N, giá trị x có tần số m. Tần số tương đối của x là:', ['m/N · 100%', 'N/m · 100%', 'm · N %', 'm %'], e3('E-TSTD-01')),
  Q('C7-B23-M1-Q02', 1, 'Tổng các tần số tương đối trong một bảng tần số tương đối bằng:', ['100%', 'N', '1%', 'số giá trị khác nhau'], e3('E-TSTD-01')),
  Q('C7-B23-M1-Q03', 2, 'Lớp có 40 học sinh, trong đó 10 bạn thích bóng đá. Tần số tương đối của "thích bóng đá" là:', ['25%', '10%', '40%', '4%'], e3('E-TSTD-01')),
  Q('C7-B23-M1-Q04', 2, 'Mẫu có cỡ 50, giá trị A có tần số 12. Tần số tương đối của A là:', ['24%', '12%', '38%', '4,17%'], e3('E-TSTD-01')),
  Q('C7-B23-M1-Q05', 3, 'Bảng tần số tương đối có các tần số tương đối 20%; 35%; x%; 15%. Giá trị của x là:', ['30', '70', '100', '15'], e3('E-TSTD-01')),
  Q('C7-B23-M1-Q06', 3, 'Mẫu có cỡ 40, giá trị B có tần số tương đối 15%. Tần số của B là:', ['6', '15', '600', '2,67'], e3('E-TSTD-01')),
  Q('C7-B23-M1-Q07', 4, 'Khảo sát 200 người, có 35% chọn phương án X. Số người chọn phương án X là:', ['70', '35', '165', '57'], e3('E-TSTD-01')),
  Q('C7-B23-M1-Q08', 4, 'Lớp A có 12 trên 40 bạn đạt loại giỏi, lớp B có 10 trên 30 bạn đạt loại giỏi. Lớp có tỉ lệ học sinh giỏi cao hơn là:', ['lớp B (khoảng 33,3%)', 'lớp A vì có 12 bạn', 'hai lớp bằng nhau', 'lớp A (30%)'], e3('E-TSTD-01')),

  // ---------- C7-B23-M2
  Q('C7-B23-M2-Q01', 1, 'Trong biểu đồ hình quạt tròn, hình quạt biểu diễn tần số tương đối f% có góc ở tâm bằng:', ['f% · 360°', 'f°', 'f% · 180°', '360° : f'], e3('E-TSTD-02')),
  Q('C7-B23-M2-Q02', 1, 'Trong biểu đồ hình quạt tròn, cả hình tròn biểu diễn:', ['100%', 'cỡ mẫu N', '360 người', '50%'], e3('E-TSTD-02')),
  Q('C7-B23-M2-Q03', 2, 'Một hình quạt biểu diễn 25%. Góc ở tâm của hình quạt là:', ['90°', '25°', '45°', '100°'], e3('E-TSTD-02')),
  Q('C7-B23-M2-Q04', 2, 'Một hình quạt có góc ở tâm 72°. Tần số tương đối tương ứng là:', ['20%', '72%', '36%', '7,2%'], e3('E-TSTD-02')),
  Q('C7-B23-M2-Q05', 3, 'Biểu đồ quạt về phương tiện đến trường của 400 học sinh: xe đạp 45%, đi bộ 25%, xe buýt 30%. Số học sinh đi xe buýt là:', ['120', '30', '300', '75'], e3('E-TSTD-02')),
  Q('C7-B23-M2-Q06', 3, 'Biểu đồ quạt về phương tiện đến trường: xe đạp 45%, đi bộ 25%, xe buýt 30%. Góc ở tâm của hình quạt "đi bộ" là:', ['90°', '25°', '45°', '100°'], e3('E-TSTD-02')),
  Q('C7-B23-M2-Q07', 4, 'Muốn so sánh tỉ lệ các phần trong một tổng thể, loại biểu đồ phù hợp nhất là:', ['biểu đồ hình quạt tròn', 'biểu đồ đoạn thẳng', 'biểu đồ tranh', 'bảng tần số'], e3('E-TSTD-02')),
  Q('C7-B23-M2-Q08', 4, 'Biểu đồ cột tần số tương đối có bốn cột 10%, 30%, 40% và x%. Bạn Hùng nói x = 30. Nhận xét đúng là:', ['Hùng sai, x = 20', 'Hùng đúng', 'Hùng sai, x = 40', 'Hùng sai, x = 100'], e3('E-TSTD-01')),

  // ---------- C7-B24-M1
  Q('C7-B24-M1-Q01', 1, 'Nhóm số liệu [a; b) gồm các giá trị x thoả mãn:', ['a ≤ x < b', 'a < x ≤ b', 'a ≤ x ≤ b', 'a < x < b'], e3('E-GN-01')),
  Q('C7-B24-M1-Q02', 1, 'Độ dài của nhóm [150; 155) là:', ['5', '155', '150', '305'], e3('E-GN-01')),
  Q('C7-B24-M1-Q03', 2, 'Chiều cao 160 cm thuộc nhóm nào trong các nhóm [150; 155), [155; 160), [160; 165)?', ['[160; 165)', '[155; 160)', 'Thuộc cả hai nhóm [155; 160) và [160; 165)', 'Không thuộc nhóm nào'], e3('E-GN-01')),
  Q('C7-B24-M1-Q04', 2, 'Khi nào nên ghép nhóm số liệu?', ['Khi số liệu có nhiều giá trị khác nhau, trải trên một khoảng rộng', 'Khi mẫu chỉ có 3 giá trị', 'Khi số liệu là tên người', 'Không bao giờ cần ghép nhóm'], e3('E-GN-01')),
  Q('C7-B24-M1-Q05', 3, 'Giá trị đại diện của nhóm [20; 30) là:', ['25', '20', '30', '10'], e3('E-GN-01')),
  Q('C7-B24-M1-Q06', 3, 'Cân nặng (kg) được chia thành các nhóm [40; 45), [45; 50), [50; 55). Một bạn nặng 45 kg được xếp vào nhóm:', ['[45; 50)', '[40; 45)', 'cả hai nhóm [40; 45) và [45; 50)', '[50; 55)'], e3('E-GN-01')),
  Q('C7-B24-M1-Q07', 4, 'Thời gian chạy của 30 học sinh nằm trong khoảng từ 12,0 đến 17,9 giây. Chia thành 6 nhóm có độ dài bằng nhau, bắt đầu từ 12. Các nhóm là:', ['[12; 13), [13; 14), …, [17; 18)', '[12; 13], [13; 14], …, [17; 18]', 'chỉ một nhóm [12; 18)', '[12; 14), [14; 16), [16; 18)'], e3('E-GN-01')),
  Q('C7-B24-M1-Q08', 4, 'Số liệu: 151; 158; 160; 155; 162; 149; 165. Số giá trị thuộc nhóm [155; 160) là:', ['2', '3', '1', '4'], e3('E-GN-01')),

  // ---------- C7-B24-M2
  Q('C7-B24-M2-Q01', 1, 'Tần số của nhóm [a; b) là:', ['số giá trị của mẫu thuộc nhóm đó', 'độ dài của nhóm', 'giá trị đại diện của nhóm', 'hiệu b − a'], e3('E-GN-02')),
  Q('C7-B24-M2-Q02', 1, 'Bảng tần số ghép nhóm: [0; 10) có 5 giá trị; [10; 20) có 12; [20; 30) có 8. Cỡ mẫu là:', ['25', '3', '30', '12'], e3('E-GN-02')),
  Q('C7-B24-M2-Q03', 2, `${GN} Nhóm có tần số lớn nhất là:`, ['[7; 8)', '[9; 10]', '[5; 6)', '7'], e3('E-GN-02')),
  Q('C7-B24-M2-Q04', 2, `${GN} Số bạn đạt từ 8 điểm trở lên là:`, ['5', '4', '12', '1'], e3('E-GN-02')),
  Q('C7-B24-M2-Q05', 3, 'Số liệu: 12; 15; 18; 21; 22; 25; 27; 29; 31; 34. Tần số của nhóm [20; 30) là:', ['5', '4', '6', '3'], e3('E-GN-02')),
  Q('C7-B24-M2-Q06', 3, 'Bảng tần số ghép nhóm có 4 nhóm với tần số 6; 10; x; 4 và cỡ mẫu 30. Giá trị của x là:', ['10', '30', '20', '4'], e3('E-GN-02')),
  Q('C7-B24-M2-Q07', 4, `${GN} Điểm trung bình ước lượng (dùng giá trị đại diện của mỗi nhóm) là:`, ['7,25', '7,5', '145', '7'], e3('E-GN-02')),
  Q('C7-B24-M2-Q08', 4, 'Khi lập bảng ghép nhóm, bạn Minh đếm giá trị 30 vào cả nhóm [20; 30) và nhóm [30; 40). Hậu quả là:', ['tổng các tần số lớn hơn cỡ mẫu', 'không ảnh hưởng gì', 'tổng các tần số nhỏ hơn cỡ mẫu', 'độ dài các nhóm thay đổi'], e3('E-GN-01')),

  // ---------- C7-B24-M3
  Q('C7-B24-M3-Q01', 1, 'Nhóm có tần số m trong mẫu cỡ N thì tần số tương đối của nhóm là:', ['m/N · 100%', 'N/m · 100%', 'm %', 'm chia độ dài nhóm (%)'], e3('E-TSTD-01')),
  Q('C7-B24-M3-Q02', 1, 'Nhóm [10; 20) có tần số 8 trong mẫu cỡ 40. Tần số tương đối của nhóm là:', ['20%', '8%', '40%', '5%'], e3('E-TSTD-01')),
  Q('C7-B24-M3-Q03', 2, 'Bảng tần số tương đối ghép nhóm: [0; 2) chiếm 15%; [2; 4) chiếm 40%; [4; 6) chiếm x%; [6; 8) chiếm 10%. Giá trị của x là:', ['35', '65', '100', '25'], e3('E-TSTD-01')),
  Q('C7-B24-M3-Q04', 2, 'Khảo sát thời gian ngủ của 50 học sinh, nhóm [7; 8) giờ có 20 bạn. Tần số tương đối của nhóm là:', ['40%', '20%', '70%', '2,5%'], e3('E-TSTD-01')),
  Q('C7-B24-M3-Q05', 3, 'Mẫu có cỡ 80, nhóm chiều cao [150; 160) cm có tần số tương đối 25%. Số học sinh thuộc nhóm này là:', ['20', '25', '320', '55'], e3('E-TSTD-01')),
  Q('C7-B24-M3-Q06', 3, `${TL} Tỉ lệ số liệu nhỏ hơn 4 là:`, ['55%', '40%', '15%', '90%'], e3('E-GN-02')),
  Q('C7-B24-M3-Q07', 4, `${DT} Tần số tương đối của nhóm [2; 3) là:`, ['30%', '18%', '40%', '15%'], e3('E-TSTD-01')),
  Q('C7-B24-M3-Q08', 4, `${DT} Tỉ lệ học sinh dùng điện thoại từ 2 giờ trở lên mỗi ngày là:`, ['45%', '30%', '15%', '27%'], { B: 'E-GN-02', C: 'E-GN-02', D: 'E-TSTD-01' }),

  // ---------- C7-B24-M4
  Q('C7-B24-M4-Q01', 1, 'Trong biểu đồ cột tần số tương đối ghép nhóm, các cột:', ['đặt liền nhau, mỗi cột ứng với một nhóm', 'đặt cách nhau, mỗi cột ứng với một giá trị', 'là các hình quạt', 'là các điểm rời nhau'], e3('E-GN-03')),
  Q('C7-B24-M4-Q02', 1, 'Trong biểu đồ đoạn thẳng tần số tương đối ghép nhóm, mỗi điểm có hoành độ là:', ['giá trị đại diện (trung điểm) của nhóm', 'đầu mút trái của nhóm', 'đầu mút phải của nhóm', 'tần số của nhóm'], e3('E-GN-03')),
  Q('C7-B24-M4-Q03', 2, 'Trong biểu đồ cột ghép nhóm, cột ứng với nhóm [160; 170) cao 30%. Ý nghĩa của cột là:', ['30% số liệu nằm trong khoảng từ 160 đến dưới 170', 'có 30 số liệu bằng 160', '30% số liệu bằng 170', 'nhóm có độ dài 30'], e3('E-GN-03')),
  Q('C7-B24-M4-Q04', 2, 'Vẽ biểu đồ đoạn thẳng ghép nhóm với các nhóm [0; 10), [10; 20), [20; 30). Các điểm được đặt tại hoành độ:', ['5; 15; 25', '0; 10; 20', '10; 20; 30', '0; 15; 30'], e3('E-GN-03')),
  Q('C7-B24-M4-Q05', 3, `${TL} Nhóm có nhiều số liệu nhất là:`, ['[2; 4)', '[6; 8)', '[4; 6)', '[0; 2)'], e3('E-GN-03')),
  Q('C7-B24-M4-Q06', 3, `${TL} Nếu cỡ mẫu là 200 thì số số liệu thuộc nhóm [4; 6) là:`, ['70', '35', '80', '165'], { B: 'E-TSTD-01', C: 'E-GN-03', D: 'E-GN-03' }),
  Q('C7-B24-M4-Q07', 4, 'Một biểu đồ cột tần số tương đối ghép nhóm có các cột tách rời nhau và một cột ghi 120%. Nhận xét đúng là:', ['Biểu đồ sai: các cột phải liền nhau và không nhóm nào vượt quá 100%', 'Biểu đồ đúng', 'Biểu đồ chỉ sai vì các cột tách rời', 'Biểu đồ chỉ sai vì có cột 120%'], e3('E-GN-03')),
  Q('C7-B24-M4-Q08', 4, 'Để so sánh phân bố chiều cao của hai lớp có sĩ số khác nhau, nên dùng:', ['biểu đồ tần số tương đối ghép nhóm của từng lớp', 'biểu đồ tần số ghép nhóm (số bạn) của từng lớp', 'chỉ so sánh chiều cao lớn nhất', 'biểu đồ tranh'], e3('E-GN-03'))
];

export const HINTS = {
  'E-TS-01': ['Con số em ghi là giá trị (điểm, cỡ giày) hay là số lần giá trị đó xuất hiện?', 'Tần số của một giá trị là số lần giá trị đó xuất hiện trong mẫu. Tổng các tần số bằng cỡ mẫu N (không phải tổng các giá trị). Đếm bằng cách gạch từng số liệu.', 'Ví dụ: 7; 8; 7; 9; 6; 7; 8; 9; 7; 10 có giá trị 7 xuất hiện 4 lần nên tần số của 7 là 4.'],
  'E-TS-02': ['Trục nào ghi giá trị, trục nào ghi tần số? Em đang nhìn chiều cao cột hay vị trí cột?', 'Trục ngang: các giá trị; trục đứng: tần số. Chiều cao cột (hoặc tung độ của điểm) cho biết tần số. Biểu đồ đoạn thẳng hợp với số liệu thay đổi theo thời gian.', 'Ví dụ: cột điểm 7 cao 8 nên có 8 bạn đạt điểm 7, nhiều nhất trong nhóm.'],
  'E-TSTD-01': ['Tần số tương đối là tần số chia cho số nào? Em đã nhân 100% chưa?', 'f = m/N · 100% (m là tần số, N là cỡ mẫu). Tổng các tần số tương đối bằng 100%. Ngược lại: m = f · N. So sánh hai mẫu cỡ khác nhau thì dùng tần số tương đối.', 'Ví dụ: 10 trên 40 bạn: f = 10/40 · 100% = 25%; 35% của 200 người là 70 người.'],
  'E-TSTD-02': ['Cả hình tròn là 360°. Vậy 1% ứng với bao nhiêu độ?', 'Góc ở tâm của hình quạt = f · 360° (với f viết dạng phần trăm). Ngược lại f = góc : 360° · 100%. Số người = f · N.', 'Ví dụ: 25% ứng với 25% · 360° = 90°; góc 72° ứng với 72/360 = 20%.'],
  'E-GN-01': ['Nhóm [a; b) có chứa đầu mút a không? Có chứa đầu mút b không?', 'Nhóm [a; b) gồm các x với a ≤ x < b: lấy a, không lấy b. Mỗi giá trị chỉ thuộc đúng một nhóm. Độ dài nhóm là b − a; giá trị đại diện là (a + b)/2.', 'Ví dụ: 160 thuộc nhóm [160; 165), không thuộc [155; 160); nhóm [20; 30) có đại diện 25.'],
  'E-GN-02': ['Em đã đếm đúng các số liệu nằm trong nhóm chưa? Khi tính trung bình, mỗi giá trị đại diện được nhân với gì?', 'Tần số nhóm = số số liệu thuộc nhóm. Trung bình ước lượng = (tổng của giá trị đại diện × tần số) : N. Tỉ lệ của nhiều nhóm thì cộng các tần số tương đối.', 'Ví dụ: nhóm [5; 6) đại diện 5,5 có 3 bạn, … tổng 145 : 20 = 7,25.'],
  'E-GN-03': ['Các cột của biểu đồ ghép nhóm có khoảng cách không? Điểm của đường gấp khúc đặt ở đâu trong nhóm?', 'Biểu đồ cột ghép nhóm: các cột liền nhau, đáy là nhóm. Biểu đồ đoạn thẳng: nối các điểm (giá trị đại diện; tần số tương đối). Mỗi cột không vượt 100%; tổng các cột là 100%.', 'Ví dụ: nhóm [0; 10), [10; 20), [20; 30) có điểm đặt tại hoành độ 5; 15; 25.']
};

const V = (dan, quyTac, viDu, tuLam) => ({ dan, quyTac, viDu: viDu.map(([de, giai]) => ({ de, giai })), tuLam: tuLam.map(([de, dapAn, giaiThich]) => ({ de, dapAn, giaiThich })) });
export const VI_BAI_HOC = {
  'VBH-TS-01': V('Giá trị là "cái được đo", tần số là "đếm được bao nhiêu lần". Hai thứ nằm ở hai dòng khác nhau của bảng.',
    'Tần số của giá trị x = số lần x xuất hiện. Tổng các tần số = cỡ mẫu N.',
    [['7; 8; 7; 9; 6; 7; 8; 9; 7; 10: tần số của 7?', 'Cách nghĩ sai: 7. Cách đúng: 7 xuất hiện 4 lần, tần số là 4.'],
     ['Cỡ giày 36–39 có tần số 3, 7, 6, 4: số bạn?', 'Cộng tần số: 3 + 7 + 6 + 4 = 20 (không cộng 36 + 37 + 38 + 39).']],
    [['Tần số 5; 8; x; 7, N = 30: x?', '10', '30 − 20.'],
     ['0 lỗi: 6; 1 lỗi: 7; 2: 4; 3: 3. Tổng số lỗi?', '24', '0·6 + 1·7 + 2·4 + 3·3.']]),
  'VBH-TS-02': V('Biểu đồ "nói" bằng chiều cao, không phải bằng vị trí.',
    'Trục ngang: giá trị; trục đứng: tần số. Cột cao nhất là giá trị có tần số lớn nhất. Số liệu thay đổi theo thời gian dùng biểu đồ đoạn thẳng.',
    [['Cột điểm 9 nằm xa nhất bên phải, điểm 9 nhiều bạn nhất?', 'Cách nghĩ sai: đúng. Cách đúng: xem chiều cao: cột điểm 7 cao 8 là cao nhất.'],
     ['Điểm 6: 3, 7: 8, 8: 6, 9: 3. Từ 8 trở lên?', '6 + 3 = 9 bạn.']],
    [['Nhiệt độ theo giờ dùng biểu đồ gì?', 'Đoạn thẳng', 'Theo thời gian.'],
     ['Chiều cao cột biểu thị gì?', 'Tần số', 'Trục đứng.']]),
  'VBH-TSTD-01': V('Tần số tương đối trả lời câu hỏi "bao nhiêu phần trăm", để so sánh công bằng giữa các mẫu.',
    'f = m/N · 100%; tổng các f = 100%; ngược lại m = f · N.',
    [['10 trên 40 bạn thích bóng đá.', 'Cách nghĩ sai: 10%. Cách đúng: 10/40 · 100% = 25%.'],
     ['Lớp A 12/40 giỏi, lớp B 10/30 giỏi.', 'A: 30%, B ≈ 33,3%: lớp B tỉ lệ cao hơn dù ít bạn hơn.']],
    [['12 trong 50?', '24%', '12/50.'],
     ['15% của 40?', '6', '0,15 · 40.']]),
  'VBH-TSTD-02': V('Biểu đồ quạt: cả hình tròn là 100% và cũng là 360°.',
    'Góc ở tâm = f · 360°. f = góc/360° · 100%. Số đối tượng = f · N.',
    [['Quạt 25% có góc bao nhiêu?', 'Cách nghĩ sai: 25°. Cách đúng: 25% · 360° = 90°.'],
     ['Góc 72° ứng với bao nhiêu phần trăm?', '72/360 = 20%.']],
    [['30% của 400 học sinh?', '120', '0,3 · 400.'],
     ['10% có góc?', '36°', '0,1 · 360°.']]),
  'VBH-GN-01': V('Nhóm [a; b) có "cửa trái mở, cửa phải đóng": nhận a, không nhận b.',
    '[a; b) gồm a ≤ x < b. Mỗi số liệu thuộc đúng một nhóm. Độ dài nhóm b − a; giá trị đại diện (a + b)/2.',
    [['160 thuộc [155; 160) hay [160; 165)?', 'Cách nghĩ sai: [155; 160). Cách đúng: [155; 160) không lấy 160, nên 160 thuộc [160; 165).'],
     ['Đại diện của [20; 30)?', '(20 + 30)/2 = 25.']],
    [['45 kg thuộc [40; 45) hay [45; 50)?', '[45; 50)', 'Lấy đầu mút trái.'],
     ['Độ dài [150; 155)?', '5', '155 − 150.']]),
  'VBH-GN-02': V('Có bảng ghép nhóm rồi, mọi câu hỏi "bao nhiêu", "trung bình" đều tính từ tần số và giá trị đại diện.',
    'Tần số nhóm = số số liệu trong nhóm. Trung bình ước lượng = Σ(đại diện × tần số) : N. Tỉ lệ nhiều nhóm = cộng các tần số tương đối.',
    [['[5; 6): 3, [6; 7): 5, [7; 8): 7, [8; 9): 4, [9; 10]: 1. Trung bình?', 'Cách nghĩ sai: (5,5 + 6,5 + 7,5 + 8,5 + 9,5) : 5 = 7,5. Cách đúng: (16,5 + 32,5 + 52,5 + 34 + 9,5) : 20 = 7,25.'],
     ['Tỉ lệ số liệu nhỏ hơn 4 khi [0; 2) 15%, [2; 4) 40%?', '15% + 40% = 55%.']],
    [['12; 15; 18; 21; 22; 25; 27; 29; 31; 34: tần số [20; 30)?', '5', '21, 22, 25, 27, 29.'],
     ['Tần số 6; 10; x; 4, N = 30: x?', '10', '30 − 20.']]),
  'VBH-GN-03': V('Biểu đồ ghép nhóm khác biểu đồ thường ở hai chi tiết: cột liền nhau, điểm đặt ở giữa nhóm.',
    'Biểu đồ cột ghép nhóm: các cột liền nhau, mỗi cột là một nhóm. Biểu đồ đoạn thẳng: điểm (giá trị đại diện; tần số tương đối). Tổng các cột tần số tương đối là 100%.',
    [['Đặt điểm của nhóm [0; 10) tại đâu?', 'Cách nghĩ sai: hoành độ 0. Cách đúng: hoành độ 5 (trung điểm).'],
     ['So sánh hai lớp sĩ số khác nhau.', 'Dùng tần số tương đối, không dùng số bạn.']],
    [['Cột [160; 170) cao 30% nghĩa là?', '30% số liệu từ 160 đến dưới 170', 'Tần số tương đối.'],
     ['Cột ghi 120% có hợp lí?', 'Không', 'Không vượt 100%.']])
};

export const ERROR_NODES = LOI.map((e) => ({ id: e.code, name: e.ten, role: e.role, kuId: e.ku, cluster: e.cluster }));
export const CAUSAL_EDGES = [
  { from: 'E-TS-01', to: 'E-TS-02', weight: 0.6, reason: 'Nhầm giá trị với tần số nên đọc biểu đồ sai trục' },
  { from: 'E-TS-01', to: 'E-TSTD-01', weight: 0.6, reason: 'Đếm tần số, cỡ mẫu sai nên tỉ lệ sai' },
  { from: 'E-TSTD-01', to: 'E-TSTD-02', weight: 0.6, reason: 'Tính phần trăm sai nên góc hình quạt sai' },
  { from: 'E-GN-01', to: 'E-GN-02', weight: 0.65, reason: 'Xếp giá trị biên sai nên tần số nhóm sai' },
  { from: 'E-TSTD-01', to: 'E-GN-02', weight: 0.4, reason: 'Tính tỉ lệ sai nên tần số tương đối ghép nhóm sai' },
  { from: 'E-GN-02', to: 'E-GN-03', weight: 0.5, reason: 'Bảng ghép nhóm sai nên biểu đồ sai' },
  { from: 'E-TS-02', to: 'E-GN-03', weight: 0.4, reason: 'Đọc biểu đồ nhầm trục nên đọc biểu đồ ghép nhóm sai' }
];
export const ROOT_ERROR_IDS = ['E-TS-01', 'E-GN-01'];

const NHAP = 'Bản nháp do trợ lý AI soạn theo từ điển mã lỗi — giáo viên cần duyệt, sửa trước khi dùng';
const A = (id, ten, errorCodes, nhom, hinhThuc, mucNhanThuc, phut, moTa, hocLieu) => ({ id, ten, errorCodes, nhom, hinhThuc, mucNhanThuc, phut, moTa, hocLieu, trangThai: 'nhap', nguon: NHAP });
export const ACTIVITIES = [
  A('HD-TS-01', 'Kiểm đếm số liệu của lớp', ['E-TS-01', 'E-TS-02'], ['loi'], 'ca-lop', 1, [8, 10],
    'Cả lớp ghi cỡ giày (hoặc số anh chị em) lên giấy ghi chú, dán lên bảng theo cột giá trị để thành biểu đồ cột sống; học sinh lập bảng tần số và kiểm tra tổng tần số bằng sĩ số.', 'Giấy ghi chú, bảng'),
  A('HD-TSTD-01', 'Từ số bạn sang phần trăm, sang độ', ['E-TSTD-01', 'E-TSTD-02'], ['loi'], 'nhom-dong-chat', 2, [10, 12],
    'Nhóm chuyển bảng tần số của lớp sang tần số tương đối, tính góc ở tâm rồi vẽ biểu đồ quạt bằng thước đo góc; kiểm tra tổng 100% và 360°.', 'Thước đo góc, compa, phiếu'),
  A('HD-GN-01', 'Cửa trái mở, cửa phải đóng', ['E-GN-01', 'E-GN-02'], ['loi'], 'nhom-dong-chat', 2, [8, 10],
    'Nhóm nhận 30 thẻ chiều cao (có nhiều giá trị đúng bằng đầu mút), xếp vào các hộp nhóm [a; b), lập bảng tần số ghép nhóm và ước lượng chiều cao trung bình.', '30 thẻ số liệu, 5 hộp nhóm'),
  A('HD-GN-02', 'Biểu đồ liền cột', ['E-GN-03'], ['loi'], 'ca-nhan', 2, [6, 8],
    'Học sinh vẽ biểu đồ cột và biểu đồ đoạn thẳng tần số tương đối ghép nhóm từ một bảng cho sẵn, rồi tìm 3 lỗi trong một biểu đồ vẽ sai (cột tách rời, điểm đặt ở đầu mút, tổng khác 100%).', 'Giấy kẻ ô, biểu đồ có lỗi'),
  A('HD-C7-MR', 'Khảo sát thời gian dùng điện thoại', [], ['san-sang'], 'nhom-dong-chat', 4, [15, 20],
    'Nhóm khảo sát (ẩn danh) thời gian dùng điện thoại mỗi ngày của các bạn, ghép nhóm, vẽ biểu đồ tần số tương đối và đưa ra một lời khuyên dựa trên số liệu.', 'Phiếu khảo sát ẩn danh')
];
