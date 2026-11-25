/**
 * TOÁN TIẾNG ANH — NỘI DUNG MỞ RỘNG (24/11/2026, Claude viết, chờ giáo viên duyệt)
 * TU[en]: thêm cho từng thuật ngữ (khoá = tiếng Anh viết thường)
 *   dn   : định nghĩa tiếng Anh đơn giản (≤ 12 từ)
 *   de   : câu lệnh kiểu đề thi có dùng từ này
 *   nhan : chia âm tiết, âm nhấn viết HOA
 *   la / khong : ví dụ "đúng là" / "không phải" (thẻ Frayer), công thức viết Unicode
 * DE_NHAM: từ nhiều nghĩa (nhóm F).
 * NHOM: nhóm B (đọc công thức), C (từ lệnh), D (mẫu câu lời giải), E (từ khoá bài toán), G (tiếng Anh trong lớp).
 * Hiện có: đủ thuật ngữ Chương I (mẫu). Các chương sau viết tiếp khi thầy duyệt mẫu.
 */
const T = (dn, de, nhan, la, khong) => ({ dn, de, nhan, la, khong });

export const TU = {
  // ================= CHƯƠNG I =================
  'equation': T('A statement that two expressions are equal.', 'Solve the equation 2x + 3 = 11.', 'e-QUA-tion', '2x + 3 = 11', '2x + 3 (no equals sign)'),
  'linear equation': T('An equation where each variable has power 1.', 'Which of the following is a linear equation?', 'LIN-e-ar e-QUA-tion', '3x − 2 = 7', 'x² + 1 = 5'),
  'linear equation in two variables': T('An equation of the form ax + by = c.', 'Write a linear equation in two variables for the shopping bill.', 'LIN-e-ar e-QUA-tion in TWO VAR-i-a-bles', '2x + 5y = 40', 'xy = 6'),
  'variable': T('A letter that stands for a number that can change.', 'Let x be the variable for the number of tickets.', 'VAR-i-a-ble', 'x, y, t', '7, π'),
  'coefficient': T('The number multiplied by a variable.', 'State the coefficient of y in 3x − 4y = 7.', 'co-ef-FI-cient', '−4 in −4y', 'the 7 in 3x − 4y = 7'),
  'constant': T('A number that does not change.', 'Identify the constant term in 5x + 2y = 9.', 'CON-stant', '9', '5x'),
  'solution': T('A value that makes the equation true.', 'Check whether (1; 3) is a solution of x + y = 4.', 'so-LU-tion', '(1; 3) for x + y = 4', '(2; 3) for x + y = 4'),
  'system of equations': T('Two or more equations solved together.', 'Solve the system of equations x + y = 5, x − y = 1.', 'SYS-tem of e-QUA-tions', 'x + y = 5 and x − y = 1', 'only x + y = 5'),
  'system of linear equations': T('A system where every equation is linear.', 'Solve the system of linear equations by elimination.', 'SYS-tem of LIN-e-ar e-QUA-tions', '2x + y = 7 and x − y = 2', 'x² + y = 3 and x − y = 1'),
  'unknown': T('A quantity we have to find.', 'Choose a suitable unknown and state its condition.', 'un-KNOWN', 'the price of one mango', 'the given total 50 000 dong'),
  'pair of numbers': T('Two numbers written together in order.', 'Find the pair of numbers (x; y) that satisfies both equations.', 'PAIR of NUM-bers', '(2; 1)', '2 + 1'),
  'ordered pair': T('A pair (x; y) where the order matters.', 'Plot the ordered pair (3; −1).', 'OR-dered PAIR', '(3; −1) ≠ (−1; 3)', '{3; −1} (order not shown)'),
  'coordinate plane': T('A flat surface with an x-axis and a y-axis.', 'Draw the line on the coordinate plane.', 'co-OR-di-nate PLANE', 'Oxy with two axes', 'a number line'),
  'axis': T('One of the two number lines on a graph.', 'Find where the line crosses the x-axis.', 'AX-is', 'Ox, Oy', 'the line y = x + 1'),
  'origin': T('The point (0; 0) where the axes meet.', 'Does the line pass through the origin?', 'OR-i-gin', 'O(0; 0)', '(1; 0)'),
  'straight line': T('A line that does not bend.', 'Show that the solutions lie on a straight line.', 'STRAIGHT LINE', 'y = 2x + 1', 'y = x²'),
  'intersection': T('The point where two lines meet.', 'Find the intersection of the two lines.', 'in-ter-SEC-tion', 'the point (2; 3) on both lines', 'a point on only one line'),
  'point of intersection': T('The point that lies on both lines.', 'Find the coordinates of the point of intersection.', 'POINT of in-ter-SEC-tion', '(1; 2)', 'a point on only one line'),
  'parallel': T('Never meeting, always the same distance apart.', 'Explain why the two lines are parallel.', 'PAR-al-lel', 'y = 2x + 1 and y = 2x − 3', 'y = 2x and y = −x'),
  'coincident': T('Lying exactly on top of each other.', 'Show that the two lines are coincident.', 'co-IN-ci-dent', 'x + y = 2 and 2x + 2y = 4', 'x + y = 2 and x + y = 3'),
  'infinitely many': T('More than any number you can count.', 'How many solutions does x + y = 3 have?', 'IN-fi-nite-ly MAN-y', 'all points on a line', 'exactly two'),
  'infinitely many solutions': T('Every point on the line is a solution.', 'Show that the system has infinitely many solutions.', 'IN-fi-nite-ly MAN-y so-LU-tions', 'coincident lines', 'crossing lines'),
  'unique': T('Only one.', 'Prove that the system has a unique solution.', 'u-NIQUE', 'one crossing point', 'two crossing points'),
  'unique solution': T('Exactly one solution.', 'Find the value of m so the system has a unique solution.', 'u-NIQUE so-LU-tion', 'lines that cross once', 'parallel lines'),
  'no solution': T('No value makes the equation true.', 'Explain why the system has no solution.', 'NO so-LU-tion', 'parallel lines', 'crossing lines'),
  'represent': T('To show or stand for something.', 'Represent the solutions on the coordinate plane.', 'rep-re-SENT', 'x represents the number of pens', ''),
  'substitution method': T('Solve one equation for a variable, then put it in the other.', 'Solve the system using the substitution method.', 'sub-sti-TU-tion METH-od', 'y = 5 − x, then 2x + (5 − x) = 7', 'adding the two equations'),
  'substitute': T('To put a value in place of a variable.', 'Substitute x = 2 into the second equation.', 'SUB-sti-tute', 'x = 2 ⇒ 2·2 + y = 7', ''),
  'elimination method': T('Add or subtract equations to remove one variable.', 'Solve the system by the elimination method.', 'e-lim-i-NA-tion METH-od', '(x + y) + (x − y) = 2x', 'y = 5 − x'),
  'add side by side': T('Add the left sides and the right sides.', 'Add the two equations side by side.', 'ADD SIDE by SIDE', '(x + y) + (x − y) = 5 + 1', ''),
  'common solution': T('A solution that works for every equation.', 'Find the common solution of the two equations.', 'COM-mon so-LU-tion', '(3; 2) for both', 'a solution of one only'),
  'general solution': T('A formula giving all solutions.', 'Write the general solution of x − 2y = 4.', 'GEN-er-al so-LU-tion', '(2y + 4; y), y ∈ ℝ', '(4; 0) only'),
  'intercept': T('Where a line crosses an axis.', 'Find the x-intercept and the y-intercept of the line.', 'IN-ter-cept', '(0; 3) on Oy', '(1; 5)'),
  'word problem': T('A math problem written in words.', 'Solve the word problem by setting up a system of equations.', 'WORD PROB-lem', '"Lan buys 3 pens and 2 books…"', 'Solve 2x = 6.'),
  'set up': T('To write the equations from the story.', 'Set up a system of equations for the problem.', 'SET UP', 'x + y = 20 from "20 animals"', ''),
  'condition': T('A rule the answer must follow.', 'State the condition for the unknown.', 'con-DI-tion', 'x ∈ ℕ*, x < 20', ''),
  'express': T('To write one quantity using another.', 'Express y in terms of x.', 'ex-PRESS', 'y = 5 − x', ''),
  'quantity': T('An amount that can be counted or measured.', 'Which quantities are unknown in this problem?', 'QUAN-ti-ty', 'time, speed, distance', 'the word "fast"'),
  'relationship': T('How two quantities are connected.', 'Describe the relationship between speed and time.', 're-LA-tion-ship', 'distance = speed × time', ''),
  'solve': T('To find the value of the unknown.', 'Solve for x and y.', 'SOLVE', 'x = 2, y = 3', ''),
  'speed': T('Distance travelled per unit of time.', 'Find the speed of the car in km/h.', 'SPEED', '40 km/h', '40 km'),
  'productivity': T('Amount of work done per day or hour.', 'Calculate the daily productivity of each team.', 'pro-duc-TIV-i-ty', '15 products per day', '15 products'),
  'downstream': T('Moving in the same direction as the water.', 'Find the speed of the boat travelling downstream.', 'DOWN-stream', 'v + v(water)', 'v − v(water)'),
  'upstream': T('Moving against the direction of the water.', 'How long does the boat take to go upstream?', 'UP-stream', 'v − v(water)', 'v + v(water)'),
  'work together': T('Do one job at the same time as a team.', 'If they work together, how many days will they need?', 'WORK to-GETH-er', '1/x + 1/y of the job per day', ''),
  'exceed the target': T('Do more than the plan.', 'The factory exceeded the target by 15%. Find the actual output.', 'ex-CEED the TAR-get', '115% of the plan', '90% of the plan')
};

/** Từ nhiều nghĩa trong Toán (nhóm F) — dùng cho khung "Dễ nhầm" ở mọi chương. */
export const DE_NHAM = {
  'tangent': 'tangent = tiếp tuyến (đường thẳng chạm đường tròn) · tan = tang của góc nhọn',
  'root': 'root = nghiệm của phương trình · square root = căn bậc hai',
  'power': 'power = luỹ thừa (2³) · power = công suất (điện)',
  'degree': 'degree = độ (góc 30°) · degree = bậc của đa thức',
  'base': 'base = cơ số (2 trong 2³) · base = cạnh đáy / mặt đáy',
  'product': 'product = tích (kết quả phép nhân) · product = sản phẩm (năng suất)',
  'mean': 'mean = số trung bình cộng · mean = "có nghĩa là"',
  'volume': 'volume = thể tích · volume = âm lượng',
  'solution': 'solution = nghiệm · solution = lời giải',
  'unknown': 'unknown = ẩn số · unknown = chưa biết (tính từ)',
  'odd': 'odd number = số lẻ · odd = kì lạ',
  'even': 'even number = số chẵn · even = thậm chí',
  'table': 'table = bảng số liệu · table = cái bàn',
  'face': 'face = mặt (của hình khối) · face = khuôn mặt',
  'right': 'right angle = góc vuông · right = bên phải / đúng',
  'plane': 'plane = mặt phẳng · plane = máy bay',
  'chord': 'chord = dây cung · chord = hợp âm',
  'area': 'area = diện tích · area = khu vực',
  'expression': 'expression = biểu thức · expression = nét mặt',
  'identity': 'identity = hằng đẳng thức · identity = danh tính',
  'radical': 'radical = căn thức · radical = cấp tiến',
  'range': 'range = khoảng biến thiên · range = dãy (núi)',
  'interest': 'interest = tiền lãi · interest = sở thích',
  'event': 'event = biến cố (xác suất) · event = sự kiện',
  'sector': 'sector = hình quạt tròn · sector = ngành, lĩnh vực'
};

/** Các nhóm nội dung mới. Mỗi mục: [tiếng Anh hoặc công thức, nghĩa/cách đọc, ví dụ/ghi chú]. */
export const NHOM = {
  // B. Đọc công thức thành lời: [công thức, cách đọc tiếng Anh, nghĩa tiếng Việt]
  docCongThuc: [
    ['x²', 'x squared', 'x bình phương'], ['x³', 'x cubed', 'x lập phương'], ['xⁿ', 'x to the power of n', 'x mũ n'],
    ['√x', 'the square root of x', 'căn bậc hai của x'], ['∛x', 'the cube root of x', 'căn bậc ba của x'],
    ['x₁', 'x sub one', 'x một'], ['a/b', 'a over b', 'a phần b'], ['3/4', 'three quarters', 'ba phần tư'],
    ['1/2', 'one half', 'một phần hai'], ['2/3', 'two thirds', 'hai phần ba'], ['0,5', 'zero point five', 'không phẩy năm'],
    ['−3', 'negative three', 'âm ba'], ['a + b', 'a plus b', 'a cộng b'], ['a − b', 'a minus b', 'a trừ b'],
    ['a·b', 'a times b', 'a nhân b'], ['a : b', 'a divided by b', 'a chia b'], ['=', 'equals', 'bằng'],
    ['≠', 'is not equal to', 'khác'], ['<', 'is less than', 'nhỏ hơn'], ['>', 'is greater than', 'lớn hơn'],
    ['≤', 'is less than or equal to', 'nhỏ hơn hoặc bằng'], ['≥', 'is greater than or equal to', 'lớn hơn hoặc bằng'],
    ['≈', 'is approximately equal to', 'xấp xỉ'], ['±', 'plus or minus', 'cộng trừ'], ['|x|', 'the absolute value of x', 'giá trị tuyệt đối của x'],
    ['(a + b)²', 'a plus b, all squared', 'bình phương của tổng a và b'], ['a² − b²', 'a squared minus b squared', 'a bình phương trừ b bình phương'],
    ['x ∈ ℝ', 'x belongs to the set of real numbers', 'x thuộc tập số thực'], ['x ∉ ℕ', 'x does not belong to N', 'x không thuộc ℕ'],
    ['⇒', 'implies', 'suy ra'], ['⇔', 'is equivalent to', 'tương đương'], ['30°', 'thirty degrees', 'ba mươi độ'],
    ['sin 30°', 'sine of thirty degrees', 'sin ba mươi độ'], ['tan α', 'tangent of alpha', 'tang anpha'], ['Δ', 'delta', 'đenta'],
    ['π', 'pi', 'pi'], ['πr²', 'pi r squared', 'pi nhân r bình phương'], ['y = ax²', 'y equals a x squared', 'y bằng a x bình phương'],
    ['(2; 3)', 'the point two, three', 'điểm hai, ba'], ['AB', 'segment A B', 'đoạn AB'], ['∠ABC', 'angle A B C', 'góc ABC'],
    ['AB ∥ CD', 'A B is parallel to C D', 'AB song song CD'], ['AB ⊥ CD', 'A B is perpendicular to C D', 'AB vuông góc CD'],
    ['△ABC ∽ △DEF', 'triangle A B C is similar to triangle D E F', 'tam giác ABC đồng dạng tam giác DEF'],
    ['P(A)', 'the probability of A', 'xác suất của A'], ['n(Ω)', 'the number of outcomes in the sample space', 'số phần tử không gian mẫu'],
    ['10%', 'ten percent', 'mười phần trăm'], ['1 000 000', 'one million', 'một triệu'], ['2,5 km', 'two point five kilometres', 'hai phẩy năm ki-lô-mét'],
    ['cm²', 'square centimetres', 'xăng-ti-mét vuông'], ['cm³', 'cubic centimetres', 'xăng-ti-mét khối'], ['km/h', 'kilometres per hour', 'ki-lô-mét trên giờ']
  ],
  // C. Từ lệnh trong đề: [từ lệnh, nghĩa, câu ví dụ]
  tuLenh: [
    ['calculate', 'tính', 'Calculate √50 − √18.'], ['evaluate', 'tính giá trị', 'Evaluate A when x = 4.'], ['simplify', 'rút gọn', 'Simplify the expression.'],
    ['solve', 'giải', 'Solve the equation.'], ['find', 'tìm', 'Find the value of m.'], ['show that', 'chứng tỏ rằng', 'Show that Δ > 0 for all m.'],
    ['prove', 'chứng minh', 'Prove that ABCD is a cyclic quadrilateral.'], ['explain', 'giải thích', 'Explain your answer.'], ['justify', 'nêu căn cứ', 'Justify your choice.'],
    ['estimate', 'ước lượng', 'Estimate the height of the tower.'], ['round to', 'làm tròn đến', 'Round to one decimal place.'], ['express … in terms of …', 'biểu thị … theo …', 'Express y in terms of x.'],
    ['state', 'nêu, phát biểu', 'State the condition of x.'], ['draw', 'vẽ', 'Draw the graph of y = x².'], ['plot', 'biểu diễn (điểm)', 'Plot the points on the plane.'],
    ['determine', 'xác định', 'Determine whether the point lies on the graph.'], ['compare', 'so sánh', 'Compare √5 and 2.'], ['list', 'liệt kê', 'List all outcomes.'],
    ['describe', 'mô tả', 'Describe the shape of the graph.'], ['construct', 'dựng (hình)', 'Construct the circumscribed circle.'], ['verify', 'kiểm tra lại', 'Verify your solution.'],
    ['deduce', 'suy ra', 'Deduce that AB = AC.'], ['hence', 'từ đó', 'Hence find the area.'], ['given that', 'biết rằng', 'Given that x = 2, find y.'],
    ['correct to', 'chính xác đến', 'Give your answer correct to 2 decimal places.'], ['in its simplest form', 'ở dạng tối giản', 'Write the fraction in its simplest form.'],
    ['which of the following', 'điều nào sau đây', 'Which of the following is a solution?'], ['true or false', 'đúng hay sai', 'True or false: √9 = ±3.'],
    ['complete the table', 'hoàn thành bảng', 'Complete the table of values.'], ['interpret', 'giải thích ý nghĩa', 'Interpret the result in context.']
  ],
  // D. Mẫu câu trình bày lời giải: [tiếng Anh, tiếng Việt, ví dụ]
  mauCau: [
    ['Let x be …', 'Gọi x là …', 'Let x be the number of oranges.'], ['Condition: …', 'Điều kiện: …', 'Condition: x ∈ ℕ*, x < 20.'],
    ['According to the problem, …', 'Theo đề bài, …', 'According to the problem, x + y = 20.'], ['So we have the equation …', 'Ta có phương trình …', 'So we have the equation 2x + 4y = 56.'],
    ['From (1), we get …', 'Từ (1) suy ra …', 'From (1), we get y = 20 − x.'], ['Substitute … into …', 'Thế … vào …', 'Substitute y = 20 − x into (2).'],
    ['Adding the two equations, we get …', 'Cộng hai phương trình ta được …', 'Adding the two equations, we get 2x = 12.'],
    ['Subtracting (2) from (1), …', 'Lấy (1) trừ (2), …', 'Subtracting (2) from (1), we get 3y = 9.'], ['Therefore …', 'Do đó …', 'Therefore x = 6.'],
    ['This value satisfies the condition.', 'Giá trị này thoả mãn điều kiện.', 'x = 6 satisfies the condition.'],
    ['This value is rejected because …', 'Loại vì …', 'x = −2 is rejected because x > 0.'], ['Hence the answer is …', 'Vậy …', 'Hence there are 6 chickens.'],
    ['We know that …', 'Ta biết rằng …', 'We know that the sum of the angles is 180°.'], ['Applying …, we have …', 'Áp dụng …, ta có …', 'Applying Pythagoras\' theorem, we have BC² = 100.'],
    ['Since …, it follows that …', 'Vì … nên …', 'Since a·c < 0, it follows that the equation has two roots.'], ['By Vieta\'s theorem, …', 'Theo định lí Viète, …', 'By Vieta\'s theorem, x₁ + x₂ = 3.'],
    ['The discriminant is …', 'Biệt thức là …', 'The discriminant is Δ = 49.'], ['The equation has two distinct roots.', 'Phương trình có hai nghiệm phân biệt.', ''],
    ['The equation has a double root.', 'Phương trình có nghiệm kép.', ''], ['The equation has no real roots.', 'Phương trình vô nghiệm.', ''],
    ['Consider triangle ABC …', 'Xét tam giác ABC …', 'Consider triangle ABC, right-angled at A.'], ['Thus triangle ABC is similar to triangle DEF (AA).', 'Vậy △ABC ∽ △DEF (g.g).', ''],
    ['… are concyclic.', '… cùng thuộc một đường tròn.', 'A, B, C, D are concyclic.'], ['The sample space is …', 'Không gian mẫu là …', 'The sample space is {1; 2; 3; 4; 5; 6}.'],
    ['The favourable outcomes are …', 'Các kết quả thuận lợi là …', 'The favourable outcomes are 2, 4, 6.'], ['The probability is …', 'Xác suất là …', 'The probability is 3/6 = 0.5.'],
    ['Rounded to one decimal place, …', 'Làm tròn đến hàng phần mười, …', 'Rounded to one decimal place, h ≈ 10.1 m.'],
    ['Check: …', 'Thử lại: …', 'Check: 6 + 14 = 20 ✓.'], ['In conclusion, …', 'Kết luận, …', 'In conclusion, the speed is 30 km/h.'],
    ['It is given that …', 'Theo giả thiết, …', 'It is given that AB = AC.'], ['We need to prove that …', 'Ta cần chứng minh …', 'We need to prove that MA·MB = MC·MD.'],
    ['On the other hand, …', 'Mặt khác, …', ''], ['Similarly, …', 'Tương tự, …', 'Similarly, ∠BFC = 90°.'], ['Note that …', 'Chú ý rằng …', 'Note that x ≠ 0.'],
    ['Multiply both sides by …', 'Nhân hai vế với …', 'Multiply both sides by 6.'], ['Divide both sides by …', 'Chia hai vế cho …', 'Divide both sides by −2 and reverse the sign.'],
    ['Factorise the left-hand side.', 'Phân tích vế trái thành nhân tử.', ''], ['Rationalise the denominator.', 'Trục căn thức ở mẫu.', ''],
    ['As a result, …', 'Kết quả là, …', ''], ['Without loss of generality, …', 'Không mất tính tổng quát, …', '']
  ],
  // E. Từ khoá bài toán có lời văn → phép toán: [từ khoá, nghĩa, phép toán]
  tuKhoa: [
    ['sum, total, altogether', 'tổng, tất cả', '+'], ['more than, increased by', 'nhiều hơn, tăng thêm', '+'], ['difference, less than, decreased by', 'hiệu, ít hơn, giảm', '−'],
    ['product, times, of', 'tích, lần, của', '×'], ['twice, double', 'gấp đôi', '× 2'], ['triple, three times', 'gấp ba', '× 3'], ['half of', 'một nửa', '÷ 2'],
    ['per, each, every', 'mỗi', '÷'], ['quotient, divided by, shared equally', 'thương, chia đều', '÷'], ['ratio of a to b', 'tỉ số của a và b', 'a : b'],
    ['at least, no less than, minimum', 'ít nhất, tối thiểu', '≥'], ['at most, no more than, maximum', 'nhiều nhất, tối đa', '≤'], ['exceeds', 'vượt quá', '>'],
    ['is, was, will be, equals, gives', 'là, bằng', '='], ['percent of', 'phần trăm của', '× p/100'], ['increase by 10%', 'tăng 10%', '× 1,1'], ['decrease by 20%', 'giảm 20%', '× 0,8'],
    ['consecutive numbers', 'các số liên tiếp', 'n, n + 1'], ['even number', 'số chẵn', '2k'], ['odd number', 'số lẻ', '2k + 1'],
    ['the square of a number', 'bình phương một số', 'x²'], ['the sum of the squares', 'tổng các bình phương', 'x² + y²'], ['the square of the sum', 'bình phương của tổng', '(x + y)²'],
    ['in … hours', 'trong … giờ', 'distance = speed × time'], ['completes the job in x days', 'làm xong việc trong x ngày', '1/x of the job per day'],
    ['downstream / upstream', 'xuôi / ngược dòng', 'v ± v(water)'], ['ahead of schedule', 'sớm hơn dự định', 'planned time − actual time'], ['behind schedule', 'chậm hơn dự định', 'actual time − planned time'],
    ['interest rate', 'lãi suất', 'money × (1 + r)'], ['discount', 'giảm giá', 'price × (1 − d)'], ['profit', 'tiền lãi', 'selling price − cost'], ['average', 'trung bình', 'sum ÷ count'],
    ['remaining, the rest', 'còn lại', 'total − part'], ['in total', 'tổng cộng', '+'], ['between … and …', 'giữa … và …', 'a < x < b'],
    ['at the same time', 'cùng lúc', 'same time t'], ['meet each other', 'gặp nhau', 'd₁ + d₂ = d'], ['catch up with', 'đuổi kịp', 'd₁ − d₂ = gap'], ['reversed digits', 'đổi chỗ hai chữ số', '10a + b → 10b + a'],
    ['how many … left', 'còn lại bao nhiêu', 'total − used']
  ],
  // G. Tiếng Anh trong lớp học: [tiếng Anh, tiếng Việt]
  trongLop: [
    ['Can you repeat that, please?', 'Thầy/cô nhắc lại được không ạ?'], ['Could you explain step 2 again?', 'Thầy/cô giải thích lại bước 2 được không ạ?'],
    ['I got a different answer.', 'Em ra kết quả khác ạ.'], ['I don\'t understand this part.', 'Em chưa hiểu chỗ này.'], ['How do you say "nghiệm" in English?', '"Nghiệm" tiếng Anh nói thế nào ạ?'],
    ['May I use a calculator?', 'Em dùng máy tính được không ạ?'], ['Is my answer correct?', 'Kết quả của em đúng không ạ?'], ['I think the answer is …', 'Em nghĩ đáp án là …'],
    ['Let me check my work.', 'Để em kiểm tra lại bài.'], ['I made a mistake in this line.', 'Em sai ở dòng này.'], ['Can I go to the board?', 'Em lên bảng được không ạ?'],
    ['Which page are we on?', 'Mình đang ở trang nào ạ?'], ['Can we work in pairs?', 'Bọn em làm theo cặp được không ạ?'], ['I agree with Lan because …', 'Em đồng ý với Lan vì …'],
    ['I disagree, because …', 'Em không đồng ý, vì …'], ['What does this symbol mean?', 'Kí hiệu này nghĩa là gì ạ?'], ['How many decimal places?', 'Làm tròn mấy chữ số thập phân ạ?'],
    ['Is there another way to solve it?', 'Có cách giải khác không ạ?'], ['Can you give me a hint?', 'Cho em gợi ý được không ạ?'], ['I have finished.', 'Em làm xong rồi ạ.'],
    ['Open your books to page 20.', 'Mở sách trang 20.'], ['Work in groups of four.', 'Làm việc nhóm bốn người.'], ['Show your working.', 'Trình bày lời giải.'],
    ['Check your answer.', 'Kiểm tra lại đáp án.'], ['Copy the rule into your notebook.', 'Chép quy tắc vào vở.'], ['Time is up.', 'Hết giờ.'],
    ['Well done!', 'Làm tốt lắm!'], ['Almost there!', 'Gần đúng rồi!'], ['Try again.', 'Thử lại nhé.'], ['Swap papers with your partner.', 'Đổi bài với bạn bên cạnh.']
  ]
};

/** Phần mở rộng của một thuật ngữ (không phân biệt hoa thường). */
export const moRongTu = (en) => TU[String(en).toLowerCase()] ?? null;
export const deNham = (en) => DE_NHAM[String(en).toLowerCase()] ?? null;
