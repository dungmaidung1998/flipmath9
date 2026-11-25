/**
 * FILE NÀY LÀM GÌ: Tệp dữ liệu tĩnh chứa danh sách mục kiến thức, lỗi sai thường gặp hoặc nội dung bài học Toán 9.
 * AI DÙNG: dùng chung
 * LẤY DỮ LIỆU TỪ: không truy vấn bảng trực tiếp
 * GỌI TỚI: không gọi mô-đun nội bộ khác
 * CẤU TRÚC DỮ LIỆU: mảng các đối tượng bài/mục kiến thức Toán 9 (ví dụ { id, bai, muc, name, ... }).
 */
/**
 * TOÁN TIẾNG ANH THEO BÀI — gõ lại từ bộ "Teaching Mathematics in English – Grade 9" (Thiết kế bởi NCE).
 * Mỗi bài: 15 thẻ từ (đúng thứ tự trong tài liệu) + truyện tranh "Math class in English" (ảnh gốc + lời thoại).
 * Mỗi thẻ: en, loai (loại từ), ipa (phiên âm), vi (nghĩa), cau (câu giải thích tiếng Anh, công thức trong $...$),
 * hinh (công thức/hình minh hoạ của thẻ, LaTeX, có thể trống).
 * Chỗ tài liệu gốc viết sai đã được sửa (ghi ở trường sua để giáo viên biết).
 */
const W = (en, loai, ipa, vi, cau, hinh = '', sua = '') => ({ en, loai, ipa, vi, cau, hinh, ...(sua ? { sua } : {}) });
const GV = 'Teacher', HS = 'Student';
const L = (khung, ai, en) => ({ khung, ai, en });

export const TIENG_ANH_BAI = {
  7: {
    ten: 'Square roots and quadratic radicals', tenVi: 'Căn bậc hai và căn thức bậc hai',
    tu: [
      W('square root', 'noun', '/ˈskweər ruːt/', 'căn bậc hai', 'A positive number $x$ has two square roots, which are opposite in sign.', '49 \\to +7,\\ -7'),
      W('arithmetic square root', 'noun phrase', '/ˌærɪθˈmetɪk ˈskweər ruːt/', 'căn bậc hai số học', 'The arithmetic square root of 81 is written as $\\sqrt{81}$, which equals 9.', '\\sqrt{81} \\to 9'),
      W('quadratic radical', 'noun phrase', '/kwɒˈdrætɪk ˈrædɪkəl/', 'căn thức bậc hai', 'An algebraic expression containing a variable under a square root is a quadratic radical.', '\\sqrt{A}'),
      W('radicand', 'noun', '/ˈrædɪkænd/', 'biểu thức dưới dấu căn / biểu thức lấy căn', 'In the radical expression $\\sqrt{2x+1}$, the polynomial $2x+1$ is the radicand.', '\\sqrt{2x+1}'),
      W('defined condition', 'noun phrase', '/dɪˈfaɪnd kənˈdɪʃən/', 'điều kiện xác định', 'To find the defined condition of the radical $\\sqrt{2x+1}$, we set the radicand $2x+1 \\ge 0$.', '2x+1 \\ge 0'),
      W('non-negative', 'adjective', '/ˌnɒnˈneɡətɪv/', 'không âm ($\\ge 0$)', 'The radicand under a square root must always be a non-negative value.', '0,\\ 1,\\ 2,\\ 3,\\ \\dots'),
      W('absolute value', 'noun phrase', '/ˈæbsəluːt ˈvæljuː/', 'giá trị tuyệt đối', 'Using the identity $\\sqrt{a^2} = |a|$, we can write the output in terms of its absolute value.', '|-a| \\to a'),
      W('identity', 'noun', '/aɪˈdentəti/', 'hằng đẳng thức', 'The mathematical identity $\\sqrt{A^2} = |A|$ is used to simplify quadratic radicals.', '\\sqrt{A^2} = |A|'),
      W('simplify', 'verb', '/ˈsɪmplɪfaɪ/', 'rút gọn', 'We can simplify the expression $\\sqrt{x^2-4x+4}$ when we know the value of $x$ is less than 2.', '\\sqrt{x^2-4x+4} = |x-2|'),
      W('square root extraction', 'noun phrase', '/ˈskweər ruːt ɪkˈstrækʃən/', 'khai phương / phép khai căn bậc hai', 'The mathematical process of finding the arithmetic square root of a number is called square root extraction.', '144 \\to 12'),
      W('multiplication', 'noun', '/ˌmʌltɪplɪˈkeɪʃən/', 'phép nhân', 'We can use multiplication properties to write $\\sqrt{a}\\cdot\\sqrt{b}$ as $\\sqrt{ab}$.', '\\sqrt{a}\\cdot\\sqrt{b} = \\sqrt{ab}'),
      W('division', 'noun', '/dɪˈvɪʒən/', 'phép chia', 'The division property allows us to write the quotient of two square roots as the root of the quotient.', '\\dfrac{\\sqrt{a}}{\\sqrt{b}} = \\sqrt{\\dfrac{a}{b}}'),
      W('conjugate expression', 'noun phrase', '/ˈkɒndʒəɡət ɪkˈspreʃən/', 'biểu thức liên hợp', 'To clear the radical from the denominator, we multiply the fraction by its conjugate expression.', '\\sqrt{a}-b \\ \\text{và}\\ \\sqrt{a}+b'),
      W('hypotenuse', 'noun', '/haɪˈpɒtənjuːz/', 'cạnh huyền', 'In right triangle $ABC$ with the right angle at $C$, we express the length of the hypotenuse as a quadratic radical: $AB = \\sqrt{AC^2 + BC^2}$.', 'AB = \\sqrt{AC^2 + BC^2}', 'Tài liệu gốc ghi BC = √(AB² + AC²) trong khi góc vuông ở C; đã sửa thành AB = √(AC² + BC²).'),
      W('kinetic energy', 'noun phrase', '/kɪˈnetɪk ˈenədʒi/', 'động năng', 'In physics, flying speed is calculated using kinetic energy: $v = \\sqrt{2E/m}$.', 'v = \\sqrt{\\dfrac{2E}{m}}')
    ],
    truyen: [
      L(1, GV, 'Class, the distance of a falling object is $S = 4.9t^2$. How do we calculate the time $t$ to reach the ground?'),
      L(1, HS, 'We can set up the equation: $122.5 = 4.9t^2$!'),
      L(2, GV, 'Excellent! Now we have $t^2 = 25$. How do we find the value of time $t$?'),
      L(2, HS, 'We must perform square root extraction. Since time $t$ must be positive, we find the arithmetic square root!'),
      L(3, GV, 'Brilliant! $\\sqrt{25}$ equals 5. So, what is our final answer?'),
      L(3, HS, 'The object hits the ground after exactly 5 seconds!')
    ],
    meo: 'Master these terms to understand and solve problems involving square roots and quadratic radicals in mathematics and real-life situations.'
  },
  8: {
    ten: 'Square root extraction with multiplication and division', tenVi: 'Khai căn bậc hai với phép nhân và phép chia',
    tu: [
      W('square root', 'noun', '/ˈskweər ruːt/', 'căn bậc hai', 'The square root of 81 is 9 because 9 squared equals 81.', '\\sqrt{81} = 9'),
      W('square root extraction', 'noun phrase', '/ˈskweər ruːt ɪkˈstrækʃən/', 'phép khai căn bậc hai', 'Square root extraction is the inverse operation of squaring a non-negative number.', '\\sqrt{a^2} = |a|'),
      W('multiplication', 'noun', '/ˌmʌltɪplɪˈkeɪʃən/', 'phép nhân', 'We can extract the square root of a product by performing multiplication after extracting each root.', ''),
      W('division', 'noun', '/dɪˈvɪʒən/', 'phép chia', 'The rule for the square root of a quotient relates square root extraction to division.', ''),
      W('product', 'noun', '/ˈprɒdʌkt/', 'tích', 'For non-negative expressions $A$ and $B$, the square root of their product is $\\sqrt{AB}$.', '\\sqrt{AB}'),
      W('quotient', 'noun', '/ˈkwəʊʃənt/', 'thương', 'The square root of the quotient $\\frac{A}{B}$ is equal to the quotient of the square roots of $A$ and $B$.', '\\sqrt{\\dfrac{A}{B}}'),
      W('non-negative expression', 'noun phrase', '/ˌnɒnˈneɡətɪv ɪkˈspreʃən/', 'biểu thức không âm', 'The product rule $\\sqrt{A}\\cdot\\sqrt{B} = \\sqrt{AB}$ is valid only when $A$ and $B$ are non-negative expressions.', 'A \\ge 0,\\ B \\ge 0'),
      W('simplify', 'verb', '/ˈsɪmplɪfaɪ/', 'rút gọn', 'We can simplify the expression $\\sqrt{5x}\\cdot\\sqrt{20x}$ into $10x$ for any non-negative $x$.', '\\sqrt{5x}\\cdot\\sqrt{20x} = 10x'),
      W('factor', 'noun', '/ˈfæktər/', 'thừa số / nhân tử', 'To extract the square root, we can write the radicand as a product of prime factors.', '180 = 2\\cdot2\\cdot3\\cdot3\\cdot5'),
      W('radicand', 'noun', '/ˈrædɪkænd/', 'biểu thức dưới dấu căn / số lấy căn', 'In the radical expression $\\sqrt{25a^2b^2}$, the product $25a^2b^2$ is the radicand.', '\\sqrt{25a^2b^2}'),
      W('decimal fraction', 'noun phrase', '/ˈdesɪməl ˈfrækʃən/', 'phân số thập phân', 'To calculate $\\sqrt{1.69}$, we first write 1.69 as a decimal fraction: $\\frac{169}{100}$.', '1{,}69 \\to \\dfrac{169}{100}'),
      W('ratio', 'noun', '/ˈreɪʃiəʊ/', 'tỉ số', 'Find the ratio between the new voltage and the original voltage in the circuit.', ''),
      W('power', 'noun', '/ˈpaʊər/', 'công suất', 'In a direct current circuit, the electrical power $P$ is measured in Watts (W).', ''),
      W('voltage', 'noun', '/ˈvəʊltɪdʒ/', 'hiệu điện thế', 'We can calculate the voltage $U$ in volts (V) using the formula $U = \\sqrt{PR}$.', 'U = \\sqrt{PR}'),
      W('resistance', 'noun', '/rɪˈzɪstəns/', 'điện trở', 'The electrical resistance $R$ of the conductor is measured in Ohms.', '')
    ],
    truyen: [
      L(1, GV, 'Class! If power $P$ increases 8 times and resistance $R$ decreases 2 times, what is the new voltage $U\'$?'),
      L(1, HS, 'The new voltage expression must be $U\' = \\sqrt{8P\\cdot\\frac{R}{2}}$.'),
      L(2, GV, 'Correct! Now let\'s simplify the radicand inside. What do we get?'),
      L(2, HS, '8 divided by 2 is 4, so the radicand becomes $4PR$. Thus, $U\' = \\sqrt{4PR}$.'),
      L(3, GV, 'Excellent! How do we extract the square root of this product?'),
      L(3, HS, 'We separate it: $U\' = \\sqrt{4}\\cdot\\sqrt{PR} = 2\\sqrt{PR}$. The voltage doubles!')
    ],
    meo: 'Remember: $\\sqrt{a}\\cdot\\sqrt{b} = \\sqrt{ab}$ and $\\frac{\\sqrt{a}}{\\sqrt{b}} = \\sqrt{\\frac{a}{b}}$ $(b > 0)$.'
  },
  9: {
    ten: 'Simple transformations and simplification of radical expressions', tenVi: 'Biến đổi đơn giản và rút gọn biểu thức chứa căn thức bậc hai',
    tu: [
      W('simple transformation', 'noun phrase', '/ˈsɪmpəl ˌtrænsfəˈmeɪʃən/', 'phép biến đổi đơn giản', 'Performing simple transformations helps us simplify algebraic terms with square roots.', '\\sqrt{12}+\\sqrt{27} = 2\\sqrt3+3\\sqrt3'),
      W('simplification', 'noun', '/ˌsɪmplɪfɪˈkeɪʃən/', 'phép rút gọn / sự rút gọn', 'The simplification of radical expressions makes further equations easier to solve.', '2\\sqrt5+3\\sqrt{20}-\\sqrt{45} = 5\\sqrt5'),
      W('take factors out of a radical', 'verb phrase', '/teɪk ˈfæktəz aʊt əv ə ˈrædɪkəl/', 'đưa thừa số ra ngoài dấu căn', 'We can take factors out of a radical by writing the expression as $\\sqrt{a^2\\cdot b} = |a|\\sqrt{b}$.', '\\sqrt{a^2 b} \\to |a|\\sqrt{b}'),
      W('bring factors into a radical', 'verb phrase', '/brɪŋ ˈfæktəz ˈɪntuː ə ˈrædɪkəl/', 'đưa thừa số vào trong dấu căn', 'When you bring factors into a radical, remember that $a\\sqrt{b} = \\sqrt{a^2b}$ only if $a$ is non-negative; if $a$ is negative, $a\\sqrt{b} = -\\sqrt{a^2b}$.', 'a\\sqrt{b} \\to \\sqrt{a^2 b}\\ (a \\ge 0)', 'Tài liệu gốc ghi "a√b = √(a²b) nếu a âm" là sai; đã sửa: chỉ đúng khi a ≥ 0, còn a < 0 thì a√b = −√(a²b).'),
      W('rationalize the denominator', 'verb phrase', '/ˈræʃənəlaɪz ðə dɪˈnɒmɪneɪtər/', 'trục căn thức ở mẫu', 'Multiply both the numerator and denominator by the conjugate to rationalize the denominator.', '\\dfrac{2}{\\sqrt3-1} = \\sqrt3+1'),
      W('conjugate expression', 'noun phrase', '/ˈkɒndʒəɡət ɪkˈspreʃən/', 'biểu thức liên hợp', 'The conjugate expression of $\\sqrt{a}+b$ is $\\sqrt{a}-b$, which helps us remove radicals.', '\\sqrt{a}+b \\ \\text{và}\\ \\sqrt{a}-b'),
      W('radicand', 'noun', '/ˈrædɪkænd/', 'biểu thức lấy căn / biểu thức dưới dấu căn', 'In the term $\\sqrt{x^2+1}$, the algebraic expression $x^2+1$ is the radicand.', '\\sqrt{x^2+1}'),
      W('similar radicals', 'noun phrase', '/ˈsɪmɪlər ˈrædɪkəlz/', 'các căn thức đồng dạng', 'We can add or subtract similar radicals, such as $3\\sqrt2$ and $5\\sqrt2$, to get $8\\sqrt2$.', '3\\sqrt2+5\\sqrt2 = 8\\sqrt2'),
      W('absolute value', 'noun phrase', '/ˈæbsəluːt ˈvæljuː/', 'giá trị tuyệt đối', 'The identity $\\sqrt{a^2} = |a|$ ensures we use the absolute value to preserve positive results.', '|-a| \\to |a|'),
      W('eliminate', 'verb', '/ɪˈlɪmɪneɪt/', 'khử / triệt tiêu / loại bỏ', 'Our primary goal when transforming algebraic fractions is to simplify and eliminate radical terms.', '\\sqrt8 \\to 2\\sqrt2'),
      W('multiply both the numerator and the denominator', 'verb phrase', '/ˈmʌltɪplaɪ bəʊθ ðə ˈnjuːməreɪtər ənd ðə dɪˈnɒmɪneɪtər/', 'nhân cả tử và mẫu', 'To rationalize $\\frac{2}{\\sqrt3}$, multiply both the numerator and the denominator by $\\sqrt3$.', '\\dfrac{2}{\\sqrt3} = \\dfrac{2\\sqrt3}{3}'),
      W('non-negative expression', 'noun phrase', '/ˌnɒnˈneɡətɪv ɪkˈspreʃən/', 'biểu thức không âm', 'The equation $\\sqrt{A^2B} = A\\sqrt{B}$ holds true only when $A$ and $B$ are non-negative expressions.', 'A \\ge 0,\\ B \\ge 0', 'Tài liệu gốc chỉ nêu điều kiện B ≥ 0; đẳng thức √(A²B) = A√B còn cần A ≥ 0.'),
      W('defined condition', 'noun phrase', '/dɪˈfaɪnd kənˈdɪʃən/', 'điều kiện xác định (ĐKXĐ)', 'Before simplifying any algebraic expression, always state its defined condition.', '\\text{ĐKXĐ: } x \\ge 0,\\ x \\ne 1'),
      W('simplify', 'verb', '/ˈsɪmplɪfaɪ/', 'rút gọn / thu gọn', 'We simplify the radical sum: $2\\sqrt3 - \\sqrt{75} + 3\\sqrt{27}$.', '2\\sqrt3-5\\sqrt3+9\\sqrt3 = 6\\sqrt3'),
      W('identity', 'noun', '/aɪˈdentəti/', 'hằng đẳng thức', 'We can factor polynomials under radicals using the difference of squares identity.', 'a^2-b^2 = (a-b)(a+b)')
    ],
    truyen: [
      L(1, GV, 'Class, how can we simplify this radical expression under the defined condition $x > 1$? $P = \\frac{x^2-1}{\\sqrt{x}-1}$'),
      L(1, HS, 'We can rationalize the denominator by multiplying both top and bottom by the conjugate!'),
      L(2, GV, 'That works! But is there a faster way using factorization identities on the numerator?'),
      L(2, HS, 'Yes! $x^2-1 = (x-1)(x+1)$, and we can further write $x-1 = (\\sqrt{x}-1)(\\sqrt{x}+1)$!'),
      L(3, GV, 'Brilliant! Now we can easily eliminate the common factor. What is our final simplified expression?'),
      L(3, HS, 'The factor $(\\sqrt{x}-1)$ cancels out, leaving us with the neat simplified form: $P = (x+1)(\\sqrt{x}+1)$!')
    ],
    meo: ''
  },
  10: {
    ten: 'Cube roots and cubic radicals', tenVi: 'Căn bậc ba và căn thức bậc ba',
    tu: [
      W('cube root', 'noun', '/ˈkjuːb ruːt/', 'căn bậc ba', 'The cube root of a number $a$ is a number $x$ such that $x^3 = a$.', '\\sqrt[3]{8} = 2'),
      W('cubic radical', 'noun phrase', '/ˈkjuːbɪk ˈrædɪkəl/', 'căn thức bậc ba', 'A cubic radical is an algebraic expression of the form $\\sqrt[3]{A}$.', '\\sqrt[3]{A}'),
      W('index', 'noun', '/ˈɪndeks/', 'chỉ số (của căn)', 'In the symbol $\\sqrt[3]{a}$, the number 3 is called the index of the radical.', '\\sqrt[3]{a}'),
      W('cube root extraction', 'noun phrase', '/ˈkjuːb ruːt ɪkˈstrækʃən/', 'phép khai căn bậc ba', 'The mathematical operation of finding the cube root of a number is called cube root extraction.', '64 \\to 4'),
      W('volume', 'noun', '/ˈvɒljuːm/', 'thể tích', 'If $V$ is the volume of a cube with edge $x$, then we can write $V = x^3$.', 'V = x^3'),
      W('cube', 'noun', '/kjuːb/', 'hình lập phương / lập phương (lũy thừa 3)', 'To find the edge length of a cube, we calculate the cube root of its volume.', ''),
      W('edge', 'noun', '/edʒ/', 'cạnh (của hình khối)', 'Let $x$ represent the length of an edge of a cardboard box.', ''),
      W('algebraic expression', 'noun phrase', '/ˌældʒɪˈbreɪɪk ɪkˈspreʃən/', 'biểu thức đại số', 'In the cubic radical $\\sqrt[3]{A}$, $A$ represents an algebraic expression.', '3x^2-5y+7'),
      W('value', 'noun', '/ˈvæljuː/', 'giá trị', 'Calculate the value of the cubic radical at $x = 60$.', ''),
      W('simplify', 'verb', '/ˈsɪmplɪfaɪ/', 'rút gọn', 'Simplify the expression by rewriting the polynomial under the radical.', '\\sqrt[3]{x^3+3x^2+3x+1} = \\sqrt[3]{(x+1)^3}'),
      W('identity', 'noun', '/aɪˈdentəti/', 'hằng đẳng thức', 'We can simplify the cubic radical using the identity $\\sqrt[3]{A^3} = A$.', '\\sqrt[3]{A^3} = A'),
      W('cube of a sum', 'noun phrase', '/kjuːb əv ə sʌm/', 'lập phương của một tổng', 'Use the cube of a sum formula to factor the polynomial: $x^3+3x^2+3x+1 = (x+1)^3$.', '(a+b)^3 = a^3+3a^2b+3ab^2+b^3'),
      W('cube of a difference', 'noun phrase', '/kjuːb əv ə ˈdɪfərəns/', 'lập phương của một hiệu', 'The expression $x^3-3x^2+3x-1$ can be rewritten as the cube of a difference: $(x-1)^3$.', '(a-b)^3 = a^3-3a^2b+3ab^2-b^3'),
      W('real number', 'noun phrase', '/ˈrɪəl ˈnʌmbər/', 'số thực', 'Unlike square roots, every real number has a unique cube root.', ''),
      W('unique', 'adjective', '/juːˈniːk/', 'duy nhất', 'Every real number has a unique cube root, whether it is positive, zero, or negative.', '')
    ],
    truyen: [
      L(1, GV, 'Class, we need to make a cardboard cube box with no lid having a volume of 216 dm³. How do we find its edge length $x$?'),
      L(1, HS, 'Since $V = x^3$, we can write the equation: $x^3 = 216$!'),
      L(2, GV, 'Perfect! Now we find its unique cube root.'),
      L(2, HS, 'We extract the cube root: $x = \\sqrt[3]{216}$. Since $6^3 = 216$, the edge length is exactly 6 dm!'),
      L(3, GV, 'Great job! Since the box has no lid, it has only 5 faces. What is the total area of cardboard needed?'),
      L(3, HS, 'Each face is a square of area $6^2 = 36$ dm². Thus, the total area is $5 \\times 36 = 180$ dm²!')
    ],
    meo: ''
  },
  11: {
    ten: 'Trigonometric ratios of an acute angle', tenVi: 'Tỉ số lượng giác của góc nhọn',
    tu: [
      W('acute angle', 'noun phrase', '/əˈkjuːt ˈæŋɡəl/', 'góc nhọn', 'In a right-angled triangle, the two non-right angles are always acute angles.', ''),
      W('opposite side', 'noun phrase', '/ˈɒpəzɪt saɪd/', 'cạnh đối', 'In triangle $ABC$ right-angled at $A$, side $AC$ is the opposite side of angle $B$.', ''),
      W('adjacent side', 'noun phrase', '/əˈdʒeɪsənt saɪd/', 'cạnh kề', 'Side $AB$ is the adjacent side of the acute angle $B$ in the right triangle $ABC$.', ''),
      W('hypotenuse', 'noun', '/haɪˈpɒtənjuːz/', 'cạnh huyền', 'The hypotenuse is always the longest side of a right-angled triangle and lies opposite the right angle.', ''),
      W('trigonometric ratio', 'noun phrase', '/ˌtrɪɡənəˈmetrɪk ˈreɪʃiəʊ/', 'tỉ số lượng giác', 'The trigonometric ratios of an acute angle depend only on the measure of the angle, not the size of the triangle.', '\\sin\\alpha=\\tfrac{\\text{opposite}}{\\text{hypotenuse}},\\ \\cos\\alpha=\\tfrac{\\text{adjacent}}{\\text{hypotenuse}}'),
      W('sine', 'noun', '/saɪn/', 'sin', 'The sine of angle $\\alpha$ is defined as the ratio of the opposite side to the hypotenuse.', '\\triangle ABC \\text{ vuông tại } A:\\ \\sin B = \\dfrac{AC}{BC}'),
      W('cosine', 'noun', '/ˈkəʊsaɪn/', 'côsin', 'The cosine of an acute angle is the ratio of its adjacent side to the hypotenuse.', '\\cos B = \\dfrac{AB}{BC}'),
      W('tangent', 'noun', '/ˈtændʒənt/', 'tang', 'The tangent of angle $B$ is the ratio of the opposite side to the adjacent side.', '\\tan B = \\dfrac{AC}{AB}'),
      W('cotangent', 'noun', '/ˌkəʊˈtændʒənt/', 'côtang', 'The cotangent of an angle is the reciprocal of its tangent.', '\\cot\\alpha = \\dfrac{1}{\\tan\\alpha}'),
      W('complementary angles', 'noun phrase', '/ˌkɒmplɪˈmentəri ˈæŋɡəlz/', 'các góc phụ nhau', 'If two angles are complementary angles, the sine of one angle equals the cosine of the other.', '\\alpha+\\beta = 90^\\circ'),
      W('trigonometric value', 'noun phrase', '/ˌtrɪɡənəˈmetrɪk ˈvæljuː/', 'giá trị lượng giác', 'We can find the exact trigonometric value of special angles such as 30, 45, or 60 degrees.', '\\sin30^\\circ=\\tfrac12,\\ \\sin45^\\circ=\\tfrac{\\sqrt2}{2},\\ \\sin60^\\circ=\\tfrac{\\sqrt3}{2}'),
      W('degree', 'noun', '/dɪˈɡriː/', 'độ (đơn vị đo góc)', 'An acute angle has a measure greater than 0 degrees but less than 90 degrees.', '30^\\circ'),
      W('minute', 'noun', '/ˈmɪnɪt/', 'phút (đơn vị đo góc)', 'There are exactly 60 minutes in one degree of an angle, used for precise measurements.', "32^\\circ15'"),
      W('second', 'noun', '/ˈsekənd/', 'giây (đơn vị đo góc)', 'One minute of an angle is further subdivided into 60 seconds.', "18^\\circ44'51''"),
      W('slope angle', 'noun phrase', '/sləʊp ˈæŋɡəl/', 'góc dốc', 'We can calculate the slope angle of the road ramp to see if it is safe for wheelchair users.', '')
    ],
    truyen: [
      L(1, GV, 'Class, our building has a wheelchair ramp that is 4 m long and 0.4 m high. What is the sine of its slope angle $\\alpha$?'),
      L(1, HS, 'Since sine is opposite divided by hypotenuse, $\\sin\\alpha = 0.4 / 4 = 0.1$!'),
      L(2, GV, 'Excellent! Now, how can we find the measure of the slope angle $\\alpha$ in degrees and minutes?'),
      L(2, HS, "We can use our handheld calculator to find the angle when $\\sin\\alpha = 0.1$. We get $\\alpha \\approx 5^\\circ44'$!"),
      L(3, GV, 'Brilliant! Standard building regulations require the wheelchair slope angle to be less than 6°. Is our ramp safe?'),
      L(3, HS, "Yes, Ms. Alice! Since $5^\\circ44' < 6^\\circ$, our ramp is perfectly safe and complies with the rules!")
    ],
    meo: 'Master these terms to understand and solve problems involving trigonometric ratios in mathematics and real-life situations.'
  },
  12: {
    ten: 'Relations between sides and angles in a right triangle', tenVi: 'Một số hệ thức giữa cạnh, góc trong tam giác vuông và ứng dụng',
    tu: [
      W('right triangle', 'noun', '/raɪt ˈtraɪæŋɡəl/', 'tam giác vuông', 'In a right triangle, the relationships between the sides and angles are defined by trigonometric ratios.', ''),
      W('hypotenuse', 'noun', '/haɪˈpɒtənjuːz/', 'cạnh huyền', 'According to right triangle properties, each leg is equal to the hypotenuse multiplied by the sine of the opposite angle.', ''),
      W('opposite side', 'noun phrase', '/ˈɒpəzɪt saɪd/', 'cạnh đối', 'For the acute angle $B$, the opposite side is $AC$, which can be found using the formula $b = a\\cdot\\sin B$.', 'b = a\\cdot\\sin B'),
      W('adjacent side', 'noun phrase', '/əˈdʒeɪsənt saɪd/', 'cạnh kề', 'For the acute angle $B$, the adjacent side is $AB$, which can be calculated using the formula $c = a\\cdot\\cos B$.', 'c = a\\cdot\\cos B'),
      W('acute angle', 'noun phrase', '/əˈkjuːt ˈæŋɡəl/', 'góc nhọn', 'The angle of elevation of the plane\'s ascent is an acute angle measuring thirty degrees.', '30^\\circ'),
      W('relation', 'noun', '/rɪˈleɪʃən/', 'hệ thức', 'We use the mathematical relations in a right triangle to calculate heights and distances without direct measurement.', ''),
      W('sine', 'noun', '/saɪn/', 'sin', 'To find side $b$, multiply the hypotenuse $a$ by the sine of the opposite angle $B$.', 'b = a\\cdot\\sin B'),
      W('cosine', 'noun', '/ˈkəʊsaɪn/', 'côsin', 'To find side $c$, multiply the hypotenuse $a$ by the cosine of the adjacent angle $B$.', 'c = a\\cdot\\cos B'),
      W('tangent', 'noun', '/ˈtændʒənt/', 'tang', 'Each leg is equal to the other leg multiplied by the tangent of the opposite angle.', 'b = c\\cdot\\tan B'),
      W('cotangent', 'noun', '/ˌkəʊˈtændʒənt/', 'côtang', 'Each leg is equal to the other leg multiplied by the cotangent of the adjacent angle.', 'c = b\\cdot\\cot B'),
      W('solve a right triangle', 'verb phrase', '/sɒlv ə raɪt ˈtraɪæŋɡəl/', 'giải tam giác vuông', 'To solve a right triangle means to find all its unknown sides and angles when two elements are given.', ''),
      W('clinometer', 'noun', '/klaɪˈnɒmɪtər/', 'giác kế', 'The surveyor placed the clinometer vertically at point $M$ to measure the angle of elevation of the tower.', ''),
      W('angle of elevation', 'noun phrase', '/ˈæŋɡəl əv ˌelɪˈveɪʃən/', 'góc nâng / góc nghiêng', 'The sun\'s rays strike the ground at an angle of elevation of approximately thirty-four degrees.', '34^\\circ'),
      W('shadow', 'noun', '/ˈʃædəʊ/', 'bóng / bóng nắng', 'The shadow of a tower on the ground is 8.6 meters long when the elevation angle is 34 degrees.', ''),
      W('line of sight', 'noun phrase', '/laɪn əv saɪt/', 'đường ngắm / hướng nhìn', 'Rotate the sighting tube of the clinometer so that the top of the castle is along your line of sight.', '')
    ],
    truyen: [
      L(1, GV, 'Class, the shadow of a tower is 8.6 meters long, and the angle of elevation of the sun is 34°. How do we find its height?'),
      L(1, HS, 'We can model this as a right triangle with an adjacent side of 8.6 m and an acute angle of 34°!'),
      L(2, GV, 'Exactly! Which relation between sides and angles should we use to find the opposite side?'),
      L(2, HS, 'We use the tangent formula: opposite side equals adjacent side times tangent, so $h = 8.6\\cdot\\tan 34^\\circ$.'),
      L(3, GV, 'Perfect! Since $\\tan 34^\\circ$ is approximately 0.6745, what is our final height?'),
      L(3, HS, 'The height of the tower is $8.6\\cdot 0.6745$, which is approximately 5.8 meters, rounded to 6 meters!')
    ],
    meo: 'Remember: $b = a\\cdot\\sin B$, $c = a\\cdot\\cos B$, $b = c\\cdot\\tan B$, $c = b\\cdot\\cot B$.'
  },
  1: {
    ten: 'Concept of equations and systems of two linear equations in two variables', tenVi: 'Khái niệm phương trình và hệ hai phương trình bậc nhất hai ẩn',
    tu: [
      W('equation', 'noun', '/ɪˈkweɪʒən/', 'phương trình', 'The equation $x + y = 17$ represents the total number of fruits.', 'x + y = 17'),
      W('linear equation', 'noun phrase', '/ˈlɪniər ɪˈkweɪʒən/', 'phương trình bậc nhất', 'A linear equation in two variables has the general form $ax + by = c$.', 'ax + by = c'),
      W('variable', 'noun', '/ˈveəriəbəl/', 'biến số / ẩn số', 'In the equation $2x - y = 3$, $x$ and $y$ are the variables.', 'x,\\ y'),
      W('coefficient', 'noun', '/ˌkəʊɪˈfɪʃənt/', 'hệ số', 'The coefficient of $x$ in the expression $4x + 3y$ is 4.', '\\boxed{4}x + 3y'),
      W('constant', 'noun', '/ˈkɒnstənt/', 'hằng số', 'In $ax + by = c$, the letters $a$, $b$, and $c$ represent constants.', ''),
      W('solution', 'noun', '/səˈluːʃən/', 'nghiệm', 'The pair $(2; -1)$ is a solution of the equation $4x + 3y = 5$.', '(2; -1)'),
      W('system of equations', 'noun phrase', '/ˈsɪstəm əv ɪˈkweɪʒənz/', 'hệ phương trình', 'Solve the system of equations $x + y = 17$ and $10x + 3y = 100$.', '\\begin{cases} x + y = 17 \\\\ 10x + 3y = 100 \\end{cases}'),
      W('unknown', 'noun', '/ʌnˈnəʊn/', 'đại lượng chưa biết / ẩn', 'We use $x$ and $y$ to represent the unknowns in this word problem.', ''),
      W('pair of numbers', 'noun phrase', '/peər əv ˈnʌmbəz/', 'cặp số', 'Each solution of a two-variable equation is represented as a pair of numbers $(x; y)$.', '(x; y)'),
      W('coordinate plane', 'noun phrase', '/kəʊˈɔːdɪnət pleɪn/', 'mặt phẳng toạ độ', 'We plot the system of equations on a 2D coordinate plane.', ''),
      W('axis', 'noun (plural: axes)', '/ˈæksɪs/', 'trục toạ độ', 'The vertical axis is the y-axis, and the horizontal axis is the x-axis.', ''),
      W('origin', 'noun', '/ˈɒrɪdʒɪn/', 'gốc toạ độ', 'The origin $O$ has the coordinates $(0; 0)$ in the Cartesian plane.', 'O(0; 0)'),
      W('straight line', 'noun phrase', '/streɪt laɪn/', 'đường thẳng', 'The graph of the linear equation $x + 2y = 3$ is a straight line.', ''),
      W('intersection', 'noun', '/ˌɪntəˈsekʃən/', 'giao điểm', 'The intersection of the two lines represents the unique solution of the system.', ''),
      W('parallel', 'adjective', '/ˈpærəlel/', 'song song', 'Parallel lines never intersect, representing a system with no solution.', ''),
      W('coincident', 'adjective', '/kəʊˈɪnsɪdənt/', 'trùng nhau', 'If two lines are coincident, they have infinitely many points in common.', ''),
      W('infinitely many', 'adjective phrase', '/ˈɪnfɪnətli ˈmeni/', 'vô số', 'The equation $x + 2y = 5$ has infinitely many solutions.', ''),
      W('unique', 'adjective', '/juːˈniːk/', 'duy nhất', 'A system of intersecting lines has a unique solution.', ''),
      W('no solution', 'phrase', '/nəʊ səˈluːʃən/', 'vô nghiệm', 'The system of parallel lines has no solution.', ''),
      W('represent', 'verb', '/ˌreprɪˈzent/', 'biểu diễn / biểu thị', 'We can geometrically represent each solution as a point in the coordinate plane.', 'ax + by = c')
    ],
    truyen: [
      L(1, GV, 'Class, let\'s represent the ancient puzzle of 17 cam and quýt using variables $x$ and $y$. ($x$: number of oranges, $y$: number of mandarins)'),
      L(1, HS, 'We can write our first linear equation: $x + y = 17$!'),
      L(2, GV, 'Excellent! Now, if we divide mandarins into 3 pieces and oranges into 10, how do we write the second equation?'),
      L(2, HS, 'We get $10x + 3y = 100$!'),
      L(3, GV, 'Correct! Now we have a system of equations. How do we find the solution geometrically?'),
      L(3, HS, 'We plot both lines on the coordinate plane. Their intersection is the unique solution!'),
      L(4, HS, 'The intersection point is $(7; 10)$. That pair of numbers is the unique solution!'),
      L(4, GV, 'Perfect! That means there are exactly 7 cams and 10 quýts. Great job, class!')
    ],
    meo: ''
  },
  2: {
    ten: 'Solving systems of two linear equations in two variables', tenVi: 'Giải hệ hai phương trình bậc nhất hai ẩn',
    tu: [
      W('system of linear equations', 'noun', '/ˈsɪstəm əv ˈlɪniər ɪˈkweɪʒənz/', 'hệ phương trình bậc nhất', 'Solve the system of linear equations: $\\{x + y = 3;\\ 2x - 3y = 1\\}$.', '\\begin{cases} x + y = 3 \\\\ 2x - 3y = 1 \\end{cases}'),
      W('linear equation', 'noun', '/ˈlɪniər ɪˈkweɪʒən/', 'phương trình bậc nhất', 'A linear equation in two variables has the general form $ax + by = c$.', 'ax + by = c'),
      W('variable', 'noun', '/ˈveəriəbəl/', 'ẩn số / biến số', 'In the system of equations, $x$ and $y$ are the variables to be found.', 'x,\\ y'),
      W('coefficient', 'noun', '/ˌkəʊɪˈfɪʃənt/', 'hệ số', 'In the equation $5x - 7y = 9$, the coefficient of $x$ is 5 and of $y$ is $-7$.', '5x - 7y = 9'),
      W('constant', 'noun', '/ˈkɒnstənt/', 'hằng số / số hạng tự do', 'In the linear equation $ax + by = c$, the term $c$ is the constant.', ''),
      W('substitution method', 'noun', '/ˌsʌbstɪˈtjuːʃən ˈmeθəd/', 'phương pháp thế', 'Express $x$ from the first equation, then use the substitution method to solve.', 'y = 3 - x'),
      W('elimination method', 'noun', '/ɪˌlɪmɪˈneɪʃən ˈmeθəd/', 'phương pháp cộng đại số', 'We use the elimination method to eliminate $y$ by adding the two equations.', '(x + 2y) + (2x - 2y) = 5 + 1 \\Rightarrow 3x = 6'),
      W('solution', 'noun', '/səˈluːʃən/', 'nghiệm', 'The ordered pair $(2, 1)$ is the solution to the system.', 'x = 2,\\ y = 1'),
      W('unique solution', 'noun phrase', '/juːˈniːk səˈluːʃən/', 'nghiệm duy nhất', 'If the two lines intersect at exactly one point, the system has a unique solution.', ''),
      W('infinitely many solutions', 'noun phrase', '/ˈɪnfɪnətli ˈmeni səˈluːʃənz/', 'vô số nghiệm', 'When two linear equations represent the same line, the system has infinitely many solutions.', ''),
      W('no solution', 'noun phrase', '/nəʊ səˈluːʃən/', 'vô nghiệm', 'Since the parallel lines never meet, the system of equations has no solution.', ''),
      W('substitute', 'verb', '/ˈsʌbstɪtjuːt/', 'thế vào / thay thế', 'Substitute $y = 1$ into the equation to calculate the value of $x$.', '')
    ],
    truyen: [
      L(1, GV, 'Can we solve this system of equations using the substitution method? $x + y = 3$, $2x - 3y = 1$'),
      L(1, HS, 'Yes! We can express $y$ as $3 - x$ first!'),
      L(2, GV, 'Excellent! Now we substitute it into the second equation: $2x - 3(3 - x) = 1$.'),
      L(2, HS, 'Wow, now it becomes a basic linear equation with only one variable!'),
      L(3, GV, 'Correct! What is the unique solution of this system?'),
      L(3, HS, 'The unique solution is the ordered pair $(2, 1)$!')
    ],
    meo: ''
  },
  3: {
    ten: 'Solving word problems by setting up a system of equations', tenVi: 'Giải bài toán bằng cách lập hệ phương trình',
    tu: [
      W('word problem', 'noun phrase', '/ˈwɜːd ˌprɒbləm/', 'bài toán có lời văn / bài toán thực tế', 'We will learn how to solve a word problem by setting up a system of equations.', ''),
      W('set up', 'phrasal verb', '/set ʌp/', 'thiết lập / lập', 'The first step is to set up a system of equations representing the relationship between the quantities.', ''),
      W('variable', 'noun', '/ˈveəriəbəl/', 'ẩn số / biến số', 'Let $x$ and $y$ be the variables representing the unknown quantities of copper and zinc.', 'x,\\ y'),
      W('unknown', 'noun', '/ʌnˈnəʊn/', 'đại lượng chưa biết / ẩn', 'We choose two variables to represent the two unknowns in the problem.', ''),
      W('condition', 'noun', '/kənˈdɪʃən/', 'điều kiện', 'We must find a suitable condition for the variables, such as $x$ and $y$ being positive integers.', 'x,\\ y \\in \\mathbb{N}^*'),
      W('express', 'verb', '/ɪkˈspres/', 'biểu thị / biểu diễn', 'Express the total volume of the alloy in terms of $x$ and $y$.', 'x + y'),
      W('quantity', 'noun', '/ˈkwɒntəti/', 'đại lượng', 'We represent the unknown quantities in the word problem using variables.', ''),
      W('relationship', 'noun', '/rɪˈleɪʃənʃɪp/', 'mối quan hệ', 'Set up equations to show the relationship between the variables.', ''),
      W('system of equations', 'noun phrase', '/ˈsɪstəm əv ɪˈkweɪʒənz/', 'hệ phương trình', 'Solve the system of equations to find the values of both unknowns.', '\\begin{cases} 2x + y = 25 \\\\ 3x - 2y = 7 \\end{cases}'),
      W('solve', 'verb', '/sɒlv/', 'giải', 'Solve the system to get the values of $x$ and $y$.', '')
    ],
    truyen: [
      L(1, GV, 'At the market, 3 oranges and 2 mangoes cost 46,000 dong, and 1 orange and 3 mangoes cost 48,000 dong. How do we start?'),
      L(1, HS, 'Let $x$ and $y$ be the prices of one orange and one mango, in thousand dong, with $x > 0$ and $y > 0$!'),
      L(2, GV, 'Good! Now set up the system of equations.'),
      L(2, HS, '$3x + 2y = 46$ and $x + 3y = 48$. By substitution, $x = 48 - 3y$, so $7y = 98$!'),
      L(3, GV, 'Excellent! So what are the prices? Do they satisfy the condition?'),
      L(3, HS, '$y = 14$ and $x = 6$, both positive. An orange costs 6,000 dong and a mango costs 14,000 dong!')
    ],
    meo: 'Use these key words to understand and solve word problems by setting up a system of equations.'
  },
  4: {
    ten: 'Equations reducible to a linear equation in one variable', tenVi: 'Phương trình quy về phương trình bậc nhất một ẩn',
    tu: [
      W('reducible equation', 'noun phrase', '/rɪˈdjuːsəbəl ɪˈkweɪʒən/', 'phương trình quy về được', 'We can transform complex equations into a reducible equation of first degree.', 'ax + b = 0'),
      W('product equation', 'noun phrase', '/ˈprɒdʌkt ɪˈkweɪʒən/', 'phương trình tích', 'The equation $(2x+1)(3x-1) = 0$ is a product equation.', '(2x+1)(3x-1) = 0'),
      W('equation with variables in the denominator', 'noun phrase', '/ɪˈkweɪʒən wɪð ˈveəriəbəlz ɪn ðə dɪˈnɒmɪneɪtər/', 'phương trình chứa ẩn ở mẫu', 'We must find the domain of an equation with variables in the denominator.', '\\dfrac{2x+3}{x-1} + \\dfrac{1}{x^2+1} = 0'),
      W('defined condition', 'noun phrase', '/dɪˈfaɪnd kənˈdɪʃən/', 'điều kiện xác định (ĐKXĐ)', 'The defined condition of the equation $\\frac{5x}{x-1} = 0$ is $x$ is not equal to 1.', 'x \\ne 1'),
      W('factor', 'noun', '/ˈfæktər/', 'nhân tử', 'In the product equation, we set each factor equal to zero.', '2x+1,\\ 3x-1'),
      W('factorization', 'noun', '/ˌfæktəraɪˈzeɪʃən/', 'phân tích thành nhân tử', 'Use factorization to convert $x^2 - x = 0$ into $x(x-1) = 0$.', 'x^2 - x = x(x-1)'),
      W('denominator', 'noun', '/dɪˈnɒmɪneɪtər/', 'mẫu thức / mẫu số', 'To solve a fractional equation, find the common denominator of all terms.', '\\dfrac{3x+2}{x^2-4}'),
      W('numerator', 'noun', '/ˈnjuːməreɪtər/', 'tử thức / tử số', 'After clearing the denominator, we equate the numerator to zero.', '\\dfrac{3x+2}{x^2-4}'),
      W('common denominator', 'noun phrase', '/ˈkɒmən dɪˈnɒmɪneɪtər/', 'mẫu thức chung', 'The common denominator of $\\frac{1}{x-1}$ and $\\frac{x}{x+1}$ is $(x-1)(x+1)$.', '(x-1)(x+1)'),
      W('clear denominators', 'verb phrase', '/klɪər dɪˈnɒmɪneɪtərz/', 'khử mẫu', 'Multiply both sides by the common denominator to clear denominators.', ''),
      W('extraneous solution', 'noun phrase', '/ɪkˈstreɪniəs səˈluːʃən/', 'nghiệm ngoại lai (loại)', 'The value $x = 1$ is an extraneous solution because it does not satisfy the defined condition $x \\ne 1$.', 'x = 0{,}5\\ \\checkmark \\quad x = 1\\ \\times', 'Tài liệu gốc ghi "x = 2 là nghiệm ngoại lai" trong khi hình minh hoạ loại x = 1 (vi phạm x ≠ 1); đã sửa thành x = 1.'),
      W('solution', 'noun', '/səˈluːʃən/', 'nghiệm', 'The equation has two solutions: $x = -2$ and $x = 1$.', '\\{-2;\\ 1\\}'),
      W('no solution', 'phrase', '/nəʊ səˈluːʃən/', 'vô nghiệm', 'Because the candidate value is rejected, the equation has no solution.', '\\varnothing'),
      W('simplify', 'verb', '/ˈsɪmplɪfaɪ/', 'thu gọn', 'We can simplify the equation by combining like terms.', ''),
      W('value', 'noun', '/ˈvæljuː/', 'giá trị', 'Substitute the value of $x$ back into the equation to check your solution.', 'x = 3:\\ 2x + 1 = 7')
    ],
    truyen: [
      L(1, GV, 'Class, what is our first step in solving this equation with variables in the denominator? $\\frac{1}{x-1} - \\frac{4x}{x^3-1} = \\frac{x}{x^2+x+1}$'),
      L(1, HS, 'We must find the defined condition first to avoid dividing by zero!'),
      L(2, GV, 'Perfect! Since $x^3 - 1 = (x-1)(x^2+x+1)$, our defined condition is indeed $x$ is not equal to 1. Now, what\'s next?'),
      L(2, HS, 'We find the common denominator and then clear denominators!'),
      L(3, GV, 'Excellent! We get $x = 1$ or $x = 0.5$. But wait, is $x = 1$ a valid solution?'),
      L(3, HS, 'No! It violates our defined condition, so $x = 1$ is an extraneous solution. The unique solution is $x = 0.5$!')
    ],
    suaTruyen: 'Khi khử mẫu, phương trình trở thành $x^2 - 3x + 1 = x^2 - x$, tức $-2x = -1$, chỉ ra $x = 0{,}5$ (không ra $x = 1$ như tranh). Kết luận nghiệm duy nhất $x = 0{,}5$ vẫn đúng.',
    meo: ''
  },
  5: {
    ten: 'Inequalities and their properties', tenVi: 'Bất đẳng thức và tính chất',
    tu: [
      W('inequality', 'noun', '/ˌɪnɪˈkwɒləti/', 'bất đẳng thức', 'An inequality is a statement comparing two mathematical expressions.', '3x + 5 > 12'),
      W('left-hand side (LHS)', 'noun phrase', '/left hænd saɪd/', 'vế trái', 'In the inequality $3x + 5 > 12$, the left-hand side is $3x + 5$.', '\\boxed{3x+5} > 12'),
      W('right-hand side (RHS)', 'noun phrase', '/raɪt hænd saɪd/', 'vế phải', 'In the inequality $a^2 + 1 > 0$, the right-hand side is 0.', 'a^2 + 1 > \\boxed{0}'),
      W('greater than', 'prepositional phrase', '/ˈɡreɪtər ðæn/', 'lớn hơn', 'The mathematical statement $2024 > 1954$ shows that 2024 is greater than 1954.', '2024 > 1954'),
      W('less than', 'prepositional phrase', '/les ðæn/', 'nhỏ hơn', 'The comparison $-34.22 < -27$ shows that $-34.22$ is less than $-27$.', '-34{,}22 < -27'),
      W('greater than or equal to', 'phrase', '/ˈɡreɪtər ðæn ɔːr ˈiːkwəl tuː/', 'lớn hơn hoặc bằng', 'To operate an electric motorbike, your age $x$ must be greater than or equal to 16, written as $x \\ge 16$.', 'x \\ge 16'),
      W('less than or equal to', 'phrase', '/les ðæn ɔːr ˈiːkwəl tuː/', 'nhỏ hơn hoặc bằng', 'A bus can carry a maximum of 45 people, meaning the number of passengers $y$ is less than or equal to 45.', 'y \\le 45'),
      W('same direction', 'noun phrase', '/seɪm dəˈrekʃən/', 'cùng chiều', 'The inequalities $1 < 2$ and $-3 < -2$ are in the same direction.', '1 < 2,\\ -3 < -2'),
      W('opposite direction', 'noun phrase', '/ˈɒpəzɪt dəˈrekʃən/', 'ngược chiều', 'The inequalities $1 < 2$ and $-2 > -3$ are in the opposite direction.', '1 < 2,\\ -2 > -3'),
      W('transitive property', 'noun phrase', '/ˈtrænzətɪv ˈprɒpəti/', 'tính chất bắc cầu', 'By the transitive property, if $a < b$ and $b < c$, then we can conclude that $a < c$.', 'a < b,\\ b < c \\Rightarrow a < c'),
      W('addition property', 'noun phrase', '/əˈdɪʃən ˈprɒpəti/', 'tính chất liên quan đến phép cộng', 'Adding the same number to both sides of an inequality preserves its direction.', 'a < b \\Rightarrow a + c < b + c'),
      W('multiplication property', 'noun phrase', '/ˌmʌltɪplɪˈkeɪʃən ˈprɒpəti/', 'tính chất liên quan đến phép nhân', 'According to the multiplication property, multiplying an inequality by a negative number reverses its sign.', 'a < b,\\ k > 0 \\Rightarrow a\\cdot(-k) > b\\cdot(-k)'),
      W('positive number', 'noun phrase', '/ˈpɒzətɪv ˈnʌmbər/', 'số dương', 'If you multiply an inequality by a positive number, the direction remains unchanged.', ''),
      W('negative number', 'noun phrase', '/ˈneɡətɪv ˈnʌmbər/', 'số âm', 'Be careful when multiplying an inequality by a negative number as you must flip the inequality sign.', ''),
      W('number line', 'noun phrase', '/ˈnʌmbər laɪn/', 'trục số', 'On a number line, a smaller number always lies to the left of a larger number.', '')
    ],
    truyen: [
      L(1, GV, 'How can we write an inequality to find the maximum number of students who can join? (Sponsor fund: 30,000,000 VND; fixed cost: 17,000,000 VND; food cost per student: 150,000 VND)'),
      L(1, HS, 'We can represent the total cost as $17{,}000{,}000 + 150{,}000x$, which must be less than or equal to 30,000,000!'),
      L(2, GV, 'Using the addition property, we subtract 17 from both sides to get $0.15x \\le 13$. What is the next step?'),
      L(2, HS, 'We divide both sides by the positive number 0.15 without changing the direction of the inequality!'),
      L(3, GV, 'Excellent calculation! Since $x$ must be an integer, what is our final answer?'),
      L(3, HS, 'The maximum number of students who can join the field trip is exactly 86!')
    ],
    meo: ''
  },
  6: {
    ten: 'Linear inequalities in one variable', tenVi: 'Bất phương trình bậc nhất một ẩn',
    tu: [
      W('linear inequality in one variable', 'noun phrase', '/ˈlɪniər ˌɪnɪˈkwɒləti ɪn wʌn ˈveəriəbəl/', 'bất phương trình bậc nhất một ẩn', 'An inequality of the form $ax + b < 0$ is a linear inequality in one variable.', 'ax + b < 0'),
      W('variable', 'noun', '/ˈveəriəbəl/', 'ẩn số / biến số', 'In the inequality $7x + 18 \\le 100$, the letter $x$ is the variable.', ''),
      W('left-hand side', 'noun phrase', '/left hænd saɪd/', 'vế trái', 'The left-hand side of the inequality $3x + 8 < 20$ is the algebraic expression $3x + 8$.', '\\boxed{3x+8} < 20'),
      W('right-hand side', 'noun phrase', '/raɪt hænd saɪd/', 'vế phải', 'The right-hand side of $7x + 18 \\le 100$ is the constant value 100.', '3x + 8 < \\boxed{20}'),
      W('solution of an inequality', 'noun phrase', '/səˈluːʃən əv ən ˌɪnɪˈkwɒləti/', 'nghiệm của bất phương trình', 'Since the value $x = 2$ makes the inequality true, it is a solution of the inequality.', ''),
      W('solve', 'verb', '/sɒlv/', 'giải (bất phương trình)', 'To solve an inequality means to find the set of all its solutions.', ''),
      W('properties of inequalities', 'noun phrase', '/ˈprɒpətiz əv ˌɪnɪˈkwɒlətiz/', 'tính chất của bất đẳng thức', 'We apply the properties of inequalities to perform step-by-step transformations.', ''),
      W('add to both sides', 'verb phrase', '/æd tuː bəʊθ saɪdz/', 'cộng vào hai vế', 'Add $-18$ to both sides of the inequality to isolate the term containing the variable.', '7x + 18 \\le 100 \\Rightarrow 7x \\le 82'),
      W('multiply both sides', 'verb phrase', '/ˈmʌltɪplaɪ bəʊθ saɪdz/', 'nhân cả hai vế', 'If we multiply both sides of an inequality by a positive number, the direction remains unchanged.', ''),
      W('divide both sides', 'verb phrase', '/dɪˈvaɪd bəʊθ saɪdz/', 'chia cả hai vế', 'Divide both sides of $7x \\le 82$ by 7 to find the range of $x$.', 'x \\le \\dfrac{82}{7}'),
      W('coefficient', 'noun', '/ˌkəʊɪˈfɪʃənt/', 'hệ số', 'In the inequality $-2x - 4 > 0$, the coefficient of the variable is $-2$.', '-2x - 4 > 0'),
      W('reverse the inequality sign', 'verb phrase', '/rɪˈvɜːs ði ˌɪnɪˈkwɒləti saɪn/', 'đổi chiều dấu bất đẳng thức', 'When we multiply or divide by a negative number, we must reverse the inequality sign.', '< \\ \\to\\ >'),
      W('simplify', 'verb', '/ˈsɪmplɪfaɪ/', 'thu gọn / rút gọn', 'Simplify the expressions on each side before solving the inequality.', '3x + 2 + 5x - 4 + 7 = 8x + 5'),
      W('interest rate', 'noun phrase', '/ˈɪntrəst reɪt/', 'lãi suất', 'An annual interest rate of 7.4% is applied to her savings deposit.', ''),
      W('payload', 'noun', '/ˈpeɪləʊd/', 'trọng tải', 'The total payload of the truck must not exceed 5.25 tonnes.', '\\le 5{,}25\\ \\text{t}')
    ],
    truyen: [
      L(1, GV, 'Class, Thanh has 100,000 VND. She buys an 18,000 VND pen and $x$ notebooks (7,000 VND each). How do we write this mathematically?'),
      L(1, HS, 'The total cost must be less than or equal to 100,000, so we set up: $7x + 18 \\le 100$!'),
      L(2, GV, 'Excellent! Now we solve it. First, add $-18$ to both sides, and then we divide both sides by the coefficient 7.'),
      L(2, HS, 'We get $x \\le \\frac{82}{7}$, which is approximately 11.7!'),
      L(3, GV, 'Perfect! Since the number of notebooks must be a natural number, what is the maximum number of notebooks she can buy?'),
      L(3, HS, 'She can buy a maximum of 11 notebooks!')
    ],
    meo: ''
  },
  // ================= CHƯƠNG V — ĐƯỜNG TRÒN (Claude viết 25/11/2026, nội dung tự soạn, chờ giáo viên duyệt) =================
  13: {
    ten: 'Introduction to circles', tenVi: 'Mở đầu về đường tròn', chuong: 'C5',
    tu: [
      W('circle', 'noun', '/ˈsɜːkəl/', 'đường tròn', 'A circle with centre $O$ and radius $R$ is the set of all points at distance $R$ from $O$, written $(O; R)$.', '(O;\\,R)'),
      W('centre', 'noun', '/ˈsentə(r)/', 'tâm', 'Every point of the circle is the same distance from its centre. (American English: center.)', 'O'),
      W('radius', 'noun', '/ˈreɪdiəs/', 'bán kính', 'The radius is the distance from the centre to any point on the circle. The plural is radii.', 'OA = R'),
      W('diameter', 'noun', '/daɪˈæmɪtə(r)/', 'đường kính', 'A diameter is a chord through the centre; its length is twice the radius.', 'd = 2R'),
      W('compass', 'noun', '/ˈkʌmpəs/', 'com-pa', 'Use a compass to draw a circle with radius 3 cm.', ''),
      W('lie on the circle', 'verb phrase', '/laɪ ɒn ðə ˈsɜːkəl/', 'nằm trên đường tròn', 'Point $M$ lies on the circle $(O; R)$ if $OM = R$.', 'OM = R'),
      W('inside the circle', 'prepositional phrase', '/ɪnˈsaɪd ðə ˈsɜːkəl/', 'nằm trong đường tròn', 'Point $M$ is inside the circle if $OM < R$.', 'OM < R'),
      W('outside the circle', 'prepositional phrase', '/aʊtˈsaɪd ðə ˈsɜːkəl/', 'nằm ngoài đường tròn', 'Point $M$ is outside the circle if $OM > R$.', 'OM > R'),
      W('distance from the centre', 'noun phrase', '/ˈdɪstəns frəm ðə ˈsentə(r)/', 'khoảng cách đến tâm', 'Compare the distance from the centre with the radius to find the position of a point.', 'OM\\ \\text{vs}\\ R'),
      W('disc', 'noun', '/dɪsk/', 'hình tròn', 'A circle is only the curved line, but a disc is the circle together with all points inside it.', ''),
      W('symmetric', 'adjective', '/sɪˈmetrɪk/', 'đối xứng', 'A circle is symmetric about its centre and about every diameter.', ''),
      W('centre of symmetry', 'noun phrase', '/ˈsentə(r) əv ˈsɪmətri/', 'tâm đối xứng', 'The centre of a circle is its centre of symmetry.', ''),
      W('axis of symmetry', 'noun phrase', '/ˈæksɪs əv ˈsɪmətri/', 'trục đối xứng', 'Every diameter is an axis of symmetry of the circle, so a circle has infinitely many axes of symmetry.', ''),
      W('symmetric point', 'noun phrase', '/sɪˈmetrɪk pɔɪnt/', 'điểm đối xứng', 'If $A$ lies on the circle, the point symmetric to $A$ about $O$ also lies on the circle.', "OA = OA' = R"),
      W('draw', 'verb', '/drɔː/', 'vẽ', 'Draw the circle $(O; 2\\ \\text{cm})$ and mark a point $A$ on it.', '')
    ],
    truyen: [
      L(1, GV, 'A Ferris wheel has a diameter of 100 m. What is its radius?'),
      L(1, HS, 'The radius is half the diameter, so the radius is 50 m!'),
      L(2, GV, 'Good! Cabin $C$ is 50 m from the centre $O$. Where is point $C$?'),
      L(2, HS, 'Since $OC$ equals the radius, point $C$ lies on the circle!'),
      L(3, GV, 'And point $M$ with $OM = 30$ m?'),
      L(3, HS, 'Since $OM$ is less than the radius, $M$ is inside the circle!')
    ],
    meo: 'Compare OM with R: OM < R inside, OM = R on the circle, OM > R outside.'
  },
  14: {
    ten: 'Arcs and chords of a circle', tenVi: 'Cung và dây của một đường tròn', chuong: 'C5',
    tu: [
      W('chord', 'noun', '/kɔːd/', 'dây (dây cung)', 'A chord is a segment joining two points on the circle.', 'AB'),
      W('longest chord', 'noun phrase', '/ˈlɒŋɡɪst kɔːd/', 'dây lớn nhất', 'The diameter is the longest chord of a circle.', 'AB \\le 2R'),
      W('perpendicular', 'adjective', '/ˌpɜːpənˈdɪkjələ(r)/', 'vuông góc', 'A diameter perpendicular to a chord passes through the midpoint of that chord.', 'OH \\perp AB'),
      W('midpoint', 'noun', '/ˈmɪdpɔɪnt/', 'trung điểm', 'If $OH \\perp AB$, then $H$ is the midpoint of the chord $AB$.', 'HA = HB'),
      W('bisect', 'verb', '/baɪˈsekt/', 'chia đôi', 'The perpendicular from the centre bisects the chord.', ''),
      W('arc', 'noun', '/ɑːk/', 'cung', 'Two points $A$ and $B$ on a circle divide it into two arcs.', '\\overset{\\frown}{AB}'),
      W('endpoint', 'noun', '/ˈendpɔɪnt/', 'điểm mút', 'Points $A$ and $B$ are the endpoints of arc $AB$.', ''),
      W('minor arc', 'noun phrase', '/ˈmaɪnə(r) ɑːk/', 'cung nhỏ', 'The minor arc is the shorter of the two arcs.', ''),
      W('major arc', 'noun phrase', '/ˈmeɪdʒə(r) ɑːk/', 'cung lớn', 'The major arc is the longer of the two arcs.', ''),
      W('semicircle', 'noun', '/ˈsemisɜːkəl/', 'nửa đường tròn', 'A diameter divides the circle into two semicircles; each one measures 180°.', '180^\\circ'),
      W('central angle', 'noun phrase', '/ˈsentrəl ˈæŋɡəl/', 'góc ở tâm', 'An angle whose vertex is the centre of the circle is a central angle.', '\\widehat{AOB}'),
      W('subtend', 'verb', '/səbˈtend/', 'chắn', 'The central angle $AOB$ subtends the minor arc $AB$.', ''),
      W('measure of an arc', 'noun phrase', '/ˈmeʒə(r) əv ən ɑːk/', 'số đo cung', 'The measure of a minor arc equals the measure of its central angle.', '\\text{sđ}\\,\\overset{\\frown}{AB} = \\widehat{AOB}'),
      W('degree', 'noun', '/dɪˈɡriː/', 'độ', 'A whole circle measures 360 degrees.', '360^\\circ'),
      W('equal arcs', 'noun phrase', '/ˈiːkwəl ɑːks/', 'hai cung bằng nhau', 'In the same circle, two arcs are equal if they have the same measure.', '')
    ],
    truyen: [
      L(1, GV, 'In a circle of radius 5 cm, which chord is the longest?'),
      L(1, HS, 'The diameter! It is 10 cm long.'),
      L(2, GV, 'Now chord $AB = 8$ cm. We draw $OH$ perpendicular to $AB$. What do we know about $H$?'),
      L(2, HS, '$H$ is the midpoint of $AB$, so $AH = 4$ cm!'),
      L(3, GV, 'Great! So how far is the centre $O$ from the chord $AB$?'),
      L(3, HS, 'By Pythagoras, $OH = \\sqrt{5^2 - 4^2} = 3$ cm!')
    ],
    meo: 'Minor arc = central angle; major arc = 360° minus the minor arc.'
  },
  15: {
    ten: 'Arc length. Area of a sector and an annulus', tenVi: 'Độ dài của cung tròn. Diện tích hình quạt tròn và hình vành khuyên', chuong: 'C5',
    tu: [
      W('circumference', 'noun', '/səˈkʌmfərəns/', 'độ dài đường tròn (chu vi)', 'The circumference of a circle with radius $R$ is $C = 2\\pi R$.', 'C = 2\\pi R'),
      W('pi', 'noun', '/paɪ/', 'số pi', 'Pi is the ratio of the circumference to the diameter, about 3.14.', '\\pi \\approx 3{,}14'),
      W('arc length', 'noun phrase', '/ɑːk leŋθ/', 'độ dài cung tròn', 'The arc length of an arc of $n^\\circ$ is $l = \\dfrac{\\pi R n}{180}$.', 'l = \\dfrac{\\pi R n}{180}'),
      W('sector', 'noun', '/ˈsektə(r)/', 'hình quạt tròn', 'A sector is the part of a disc between two radii and an arc.', ''),
      W('area of a sector', 'noun phrase', '/ˈeəriə əv ə ˈsektə(r)/', 'diện tích hình quạt tròn', 'The area of a sector of $n^\\circ$ is $S = \\dfrac{\\pi R^2 n}{360}$.', 'S = \\dfrac{\\pi R^2 n}{360}'),
      W('annulus', 'noun', '/ˈænjələs/', 'hình vành khuyên', 'An annulus is the region between two concentric circles.', ''),
      W('outer radius', 'noun phrase', '/ˈaʊtə(r) ˈreɪdiəs/', 'bán kính ngoài', 'In an annulus, $R$ is the outer radius.', 'R'),
      W('inner radius', 'noun phrase', '/ˈɪnə(r) ˈreɪdiəs/', 'bán kính trong', 'In an annulus, $r$ is the inner radius and $r < R$.', 'r < R'),
      W('area of an annulus', 'noun phrase', '/ˈeəriə əv ən ˈænjələs/', 'diện tích hình vành khuyên', 'The area of an annulus is $S = \\pi (R^2 - r^2)$.', 'S = \\pi(R^2 - r^2)'),
      W('formula', 'noun', '/ˈfɔːmjələ/', 'công thức', 'Write the formula first, then substitute the values.', ''),
      W('approximately', 'adverb', '/əˈprɒksɪmətli/', 'xấp xỉ', 'The arc length is approximately 6.28 cm.', '\\approx'),
      W('round to', 'verb phrase', '/raʊnd tuː/', 'làm tròn đến', 'Round your answer to two decimal places.', '6{,}2832 \\approx 6{,}28'),
      W('square centimetre', 'noun phrase', '/skweə(r) ˈsentɪmiːtə(r)/', 'xăng-ti-mét vuông', 'Area is measured in square centimetres (cm²).', '\\text{cm}^2'),
      W('proportional', 'adjective', '/prəˈpɔːʃənəl/', 'tỉ lệ thuận', 'The arc length is proportional to the measure of the arc.', ''),
      W('revolution', 'noun', '/ˌrevəˈluːʃən/', 'vòng quay', 'After one revolution, a wheel rolls a distance equal to its circumference.', '')
    ],
    truyen: [
      L(1, GV, 'A cabin on a wheel of radius 6 m turns through 60°. How far does it travel?'),
      L(1, HS, 'We use the arc length formula: $l = \\frac{\\pi \\cdot 6 \\cdot 60}{180} = 2\\pi$ m!'),
      L(2, GV, 'Good! And the area of the sector it sweeps?'),
      L(2, HS, '$S = \\frac{\\pi \\cdot 6^2 \\cdot 60}{360} = 6\\pi$, approximately 18.85 m²!'),
      L(3, GV, 'Last one: a ring has outer radius 6 m and inner radius 4 m. Its area?'),
      L(3, HS, 'It is an annulus: $S = \\pi(36 - 16) = 20\\pi$ m²!')
    ],
    meo: 'Arc length divides by 180; sector area divides by 360.'
  },
  16: {
    ten: 'Relative positions of a line and a circle', tenVi: 'Vị trí tương đối của đường thẳng và đường tròn', chuong: 'C5',
    tu: [
      W('relative position', 'noun phrase', '/ˈrelətɪv pəˈzɪʃən/', 'vị trí tương đối', 'There are three relative positions of a line and a circle.', ''),
      W('distance from the centre to the line', 'noun phrase', '/ˈdɪstəns frəm ðə ˈsentə(r) tuː ðə laɪn/', 'khoảng cách từ tâm đến đường thẳng', 'Let $d$ be the distance from the centre to the line and compare $d$ with $R$.', 'd = OH'),
      W('common point', 'noun phrase', '/ˈkɒmən pɔɪnt/', 'điểm chung', 'A line and a circle can have two, one or no common points.', ''),
      W('intersect', 'verb', '/ˌɪntəˈsekt/', 'cắt nhau', 'If $d < R$, the line and the circle intersect at two points.', 'd < R'),
      W('secant', 'noun', '/ˈsiːkənt/', 'cát tuyến', 'A line that cuts a circle at two points is a secant.', ''),
      W('tangent line', 'noun phrase', '/ˈtændʒənt laɪn/', 'tiếp tuyến', 'If $d = R$, the line touches the circle at exactly one point; it is a tangent line.', 'd = R'),
      W('point of tangency', 'noun phrase', '/pɔɪnt əv ˈtændʒənsi/', 'tiếp điểm', 'The only common point of a tangent line and a circle is the point of tangency.', ''),
      W('touch', 'verb', '/tʌtʃ/', 'tiếp xúc', 'A tangent line touches the circle but does not cross it.', ''),
      W('do not intersect', 'verb phrase', '/duː nɒt ˌɪntəˈsekt/', 'không giao nhau', 'If $d > R$, the line and the circle do not intersect.', 'd > R'),
      W('perpendicular to the radius', 'phrase', '/ˌpɜːpənˈdɪkjələ(r) tuː ðə ˈreɪdiəs/', 'vuông góc với bán kính', 'A tangent line is perpendicular to the radius at the point of tangency.', 'a \\perp OA'),
      W('external point', 'noun phrase', '/ɪkˈstɜːnəl pɔɪnt/', 'điểm nằm ngoài', 'From an external point $M$ we can draw two tangent lines to a circle.', ''),
      W('tangent segment', 'noun phrase', '/ˈtændʒənt ˈseɡmənt/', 'đoạn tiếp tuyến', 'The two tangent segments from an external point are equal.', 'MA = MB'),
      W('angle bisector', 'noun phrase', '/ˈæŋɡəl baɪˈsektə(r)/', 'tia phân giác', 'The line $MO$ is the angle bisector of angle $AMB$.', '\\widehat{AMO} = \\widehat{BMO}'),
      W('prove', 'verb', '/pruːv/', 'chứng minh', 'Prove that line $a$ is a tangent line by showing $a \\perp OA$ at $A$.', ''),
      W('sign', 'noun', '/saɪn/', 'dấu hiệu', 'A useful sign of a tangent line: it passes through a point of the circle and is perpendicular to the radius there.', '')
    ],
    truyen: [
      L(1, GV, 'Circle $(O; 5$ cm$)$ and the distance from $O$ to line $a$ is 3 cm. What is their relative position?'),
      L(1, HS, 'Since $d < R$, line $a$ is a secant: two common points!'),
      L(2, GV, 'And if the distance is 5 cm?'),
      L(2, HS, 'Then $d = R$, so line $a$ is a tangent line with one point of tangency!'),
      L(3, GV, 'From an external point $M$ we draw two tangents $MA$ and $MB$. What can we say?'),
      L(3, HS, '$MA = MB$, and $MO$ is the angle bisector of angle $AMB$!')
    ],
    meo: 'Compare d with R: d < R secant, d = R tangent, d > R no common point.'
  },
  17: {
    ten: 'Relative positions of two circles', tenVi: 'Vị trí tương đối của hai đường tròn', chuong: 'C5',
    tu: [
      W('line of centres', 'noun phrase', '/laɪn əv ˈsentəz/', 'đường nối tâm', 'The line through $O$ and $O\'$ is the line of centres; it is an axis of symmetry of both circles.', "OO'"),
      W('distance between the centres', 'noun phrase', '/ˈdɪstəns bɪˈtwiːn ðə ˈsentəz/', 'khoảng cách hai tâm', 'Let $d = OO\'$ be the distance between the centres.', "d = OO'"),
      W('sum of the radii', 'noun phrase', '/sʌm əv ðə ˈreɪdiaɪ/', 'tổng hai bán kính', 'Compare $d$ with the sum of the radii $R + r$.', 'R + r'),
      W('difference of the radii', 'noun phrase', '/ˈdɪfrəns əv ðə ˈreɪdiaɪ/', 'hiệu hai bán kính', 'Compare $d$ with the difference of the radii $R - r$ (with $R \\ge r$).', 'R - r'),
      W('intersecting circles', 'noun phrase', '/ˌɪntəˈsektɪŋ ˈsɜːkəlz/', 'hai đường tròn cắt nhau', 'Two circles intersect at two points when $R - r < d < R + r$.', "R - r < d < R + r"),
      W('common chord', 'noun phrase', '/ˈkɒmən kɔːd/', 'dây chung', 'The common chord of two intersecting circles is perpendicular to the line of centres.', "AB \\perp OO'"),
      W('tangent circles', 'noun phrase', '/ˈtændʒənt ˈsɜːkəlz/', 'hai đường tròn tiếp xúc', 'Tangent circles have exactly one common point.', ''),
      W('externally tangent', 'adjective phrase', '/ɪkˈstɜːnəli ˈtændʒənt/', 'tiếp xúc ngoài', 'Two circles are externally tangent when $d = R + r$.', 'd = R + r'),
      W('internally tangent', 'adjective phrase', '/ɪnˈtɜːnəli ˈtændʒənt/', 'tiếp xúc trong', 'Two circles are internally tangent when $d = R - r > 0$.', 'd = R - r'),
      W('non-intersecting circles', 'noun phrase', '/ˌnɒn ɪntəˈsektɪŋ ˈsɜːkəlz/', 'hai đường tròn không giao nhau', 'Non-intersecting circles have no common point.', ''),
      W('outside each other', 'prepositional phrase', '/aʊtˈsaɪd iːtʃ ˈʌðə(r)/', 'ở ngoài nhau', 'Two circles lie outside each other when $d > R + r$.', 'd > R + r'),
      W('one inside the other', 'phrase', '/wʌn ɪnˈsaɪd ði ˈʌðə(r)/', 'đựng nhau', 'The smaller circle lies inside the larger one when $d < R - r$.', 'd < R - r'),
      W('concentric circles', 'noun phrase', '/kənˈsentrɪk ˈsɜːkəlz/', 'hai đường tròn đồng tâm', 'Concentric circles have the same centre, so $d = 0$.', 'd = 0'),
      W('common tangent', 'noun phrase', '/ˈkɒmən ˈtændʒənt/', 'tiếp tuyến chung', 'A common tangent is a line tangent to both circles.', ''),
      W('overlap', 'verb', '/ˌəʊvəˈlæp/', 'chồng lên nhau', 'When two circles intersect, their discs overlap.', '')
    ],
    truyen: [
      L(1, GV, 'Two circles have radii 5 cm and 3 cm, and $OO\' = 8$ cm. What is their relative position?'),
      L(1, HS, 'Since $d = R + r = 8$, the two circles are externally tangent!'),
      L(2, GV, 'Good! What if $OO\' = 2$ cm?'),
      L(2, HS, 'Then $d = R - r = 2$, so they are internally tangent!'),
      L(3, GV, 'And if $OO\' = 4$ cm?'),
      L(3, HS, 'Since $2 < 4 < 8$, the circles intersect at two points and have a common chord!')
    ],
    meo: 'Compare d with R + r and R − r to name the position of two circles.'
  }
};

export const BAI_TIENG_ANH = Object.keys(TIENG_ANH_BAI).map(Number).sort((a, b) => a - b);
export const tiengAnhCuaBai = (bai) => TIENG_ANH_BAI[bai] ?? null;
/** Mục C3-B9-M2 → bài 9. */
export const baiCuaMuc = (ku) => { const m = /-B(\d+)-/.exec(ku ?? ''); return m ? Number(m[1]) : null; };
export const anhTruyen = (bai) => `/tieng-anh/l${String(bai).padStart(2, '0')}.webp`;
