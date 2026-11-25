/**
 * ÔN THI VÀO 10 — luyện theo từng dạng câu của đề tuyển sinh 10 môn Toán Đà Nẵng 2026–2027.
 * Mỗi dạng (1a … 6c) có 4 câu luyện, chấm tự động:
 *   loai 'chon': [đề, [đáp án đúng, sai, sai, sai], lời giải]  (giao diện tự xáo phương án)
 *   loai 'so'  : [đề, đáp số, lời giải]                            (gõ số; chấp nhận dấu phẩy hoặc chấm)
 * Đề thật là tự luận; ở đây tách thành các bước nhỏ chấm được, để em luyện đúng kỹ năng từng ý.
 * Nội dung viết bằng Unicode; web tự đổi sang LaTeX khi hiển thị.
 */
import { DE_DA_NANG_2026 } from './de-thi-da-nang.js';
import { ON_THI_BUOC } from './t9-on-thi-10-buoc.js';

const BANG = 'Biểu đồ cột cho số khách du lịch tại 5 điểm (đơn vị: nghìn lượt): điểm A có 120, điểm B có 85, điểm C có 140, điểm D có 60, điểm E có 95.';

/**
 * ku: mục CHÍNH của ý đề (mở lại khi cần ôn lý thuyết).
 * kuLienQuan: các mục khác cũng dùng trong ý đề này (22/11/2026). Mức nắm của một ý đề = 0,7 × mức mục chính
 * + 0,3 × mức trung bình các mục liên quan (hàm mucYDe bên dưới).
 */
const DANG = {
  '1a': { ten: 'Tính giá trị biểu thức chứa căn', ku: 'C3-B9-M1', meo: 'Đưa thừa số ra ngoài dấu căn để được các căn đồng dạng rồi cộng trừ.' },
  '1b': { ten: 'Đọc biểu đồ, bảng số liệu', ku: 'C7-B22-M2', meo: 'Đọc kỹ đơn vị trên trục; cẩn thận khi đổi nghìn sang triệu.' },
  '1c': { ten: 'Rút gọn biểu thức chứa căn', ku: 'C3-B9-M3', meo: 'Ghi điều kiện xác định trước; phân tích x − 4 = (√x − 2)(√x + 2).' },
  '2a': { ten: 'Đồ thị hàm số y = ax²', ku: 'C6-B18-M2', meo: 'Điểm thuộc đồ thị khi thay hoành độ vào công thức được đúng tung độ.' },
  '2b': { ten: 'Định lí Viète', ku: 'C6-B20-M1', meo: String.raw`$x_1^2+x_2^2=S^2-2P$. Hai nghiệm trái dấu khi $a\cdot c<0$.` },
  '3a': { ten: 'Không gian mẫu', ku: 'C8-B25-M1', meo: 'Liệt kê đủ, không trùng các kết quả có thể xảy ra.' },
  '3b': { ten: 'Xác suất của biến cố', ku: 'C8-B26-M2', meo: 'P = số kết quả thuận lợi : số phần tử không gian mẫu.' },
  '4a': { ten: 'Tỉ số lượng giác trong thực tế', ku: 'C4-B12-M3', kuLienQuan: ['C4-B12-M2', 'C4-B11-M2'], meo: 'Vẽ hình, đánh dấu góc vuông, chọn tỉ số nối cạnh đã biết với cạnh cần tìm.' },
  '4b': { ten: 'Cung tròn, hình quạt', ku: 'C5-B15-M2', meo: 'S quạt = πR²n/360; độ dài cung l = πRn/180.' },
  '4c': { ten: 'Hình trụ trong thực tế', ku: 'C10-B31-M2', meo: 'Ống rỗng: lấy thể tích trụ ngoài trừ trụ trong. Nhớ đổi đường kính ra bán kính.' },
  '5a': { ten: 'Lập phương trình, hệ phương trình', ku: 'C1-B3-M1', meo: 'Đặt ẩn có điều kiện; mỗi câu dữ kiện cho một phương trình.' },
  '5b': { ten: 'Bài toán dẫn đến phương trình bậc hai', ku: 'C6-B21-M1', meo: 'Thời gian = khối lượng : năng suất. Loại nghiệm âm, đối chiếu điều kiện.' },
  '6a': { ten: 'Bốn điểm cùng thuộc một đường tròn', ku: 'C9-B29-M1', kuLienQuan: ['C9-B28-M2'], meo: 'Hai góc vuông cùng nhìn một đoạn, hoặc tứ giác có tổng hai góc đối 180°.' },
  '6b': { ten: 'Góc nội tiếp, tam giác đồng dạng', ku: 'C9-B27-M1', meo: 'Góc nội tiếp bằng nửa số đo cung bị chắn; từ hai góc bằng nhau suy ra đồng dạng.' },
  '6c': { ten: 'Hình học vận dụng cao', ku: 'C9-B27-M1', kuLienQuan: ['C9-B29-M1', 'C4-B12-M1'], meo: 'Kết hợp hệ thức lượng, tỉ số đồng dạng và tỉ số lượng giác.' }
};

/** Tên ngắn của các mục liên quan (hiện ở nút "Ôn thêm" — không nạp cả ngân hàng câu hỏi vào trình duyệt). */
const TEN_MUC = {
  'C4-B12-M2': 'Hệ thức giữa hai cạnh góc vuông', 'C4-B11-M2': 'Tỉ số lượng giác góc đặc biệt',
  'C9-B28-M2': 'Đường tròn ngoại tiếp tam giác vuông', 'C9-B29-M1': 'Tứ giác nội tiếp',
  'C4-B12-M1': 'Hệ thức giữa cạnh góc vuông và cạnh huyền'
};

const CAU = {
  '1a': [
    ['so', 'Tính √9 − √50 + 5√2 + 3.', '6', '√9 = 3; √50 = 5√2. Ta có 3 − 5√2 + 5√2 + 3 = 6.'],
    ['chon', 'Tính √18 + √8 − √2.', ['4√2', '5√2', '√24', '3√2'], '√18 = 3√2; √8 = 2√2. Ta có 3√2 + 2√2 − √2 = 4√2.'],
    ['so', 'Tính √16 + √49 − √81.', '2', '4 + 7 − 9 = 2.'],
    ['chon', 'Tính 2√12 − √27 + √3.', ['2√3', '3√3', '√3', '0'], '2√12 = 4√3; √27 = 3√3. Ta có 4√3 − 3√3 + √3 = 2√3.']
  ],
  '1b': [
    ['so', BANG + ' Có bao nhiêu điểm đón trên 90 nghìn lượt khách?', '3', 'A (120), C (140), E (95): 3 điểm.'],
    ['so', BANG + ' Tổng số khách của 5 điểm là bao nhiêu nghìn lượt?', '500', '120 + 85 + 140 + 60 + 95 = 500.'],
    ['so', BANG + ' Đổi tổng số khách ra triệu lượt.', '0,5', '500 nghìn lượt = 0,5 triệu lượt.'],
    ['so', BANG + ' Điểm đông nhất hơn điểm vắng nhất bao nhiêu nghìn lượt?', '80', 'C đông nhất (140), D vắng nhất (60): 140 − 60 = 80.']
  ],
  '1c': [
    ['chon', 'Với x ≥ 0, x ≠ 4, rút gọn A = 1/(√x − 2) + 1/(√x + 2).', ['2√x/(x − 4)', '2/(x − 4)', '4/(x − 4)', '2√x/(x + 4)'], 'Mẫu chung (√x − 2)(√x + 2) = x − 4. Tử: √x + 2 + √x − 2 = 2√x.'],
    ['chon', 'Với x ≥ 0, x ≠ 4, rút gọn B = (x − 4)/(√x − 2).', ['√x + 2', '√x − 2', 'x + 2', '1'], 'x − 4 = (√x − 2)(√x + 2), chia cho √x − 2 được √x + 2.'],
    ['chon', 'Với x > 0, rút gọn C = (x − √x)/√x.', ['√x − 1', 'x − 1', '√x', '1 − √x'], 'x − √x = √x(√x − 1), chia cho √x được √x − 1.'],
    ['chon', 'Điều kiện xác định của biểu thức 1/(√x − 2) là', ['x ≥ 0 và x ≠ 4', 'x > 0', 'x ≠ 2', 'x ≥ 2'], 'Cần x ≥ 0 để √x có nghĩa và √x − 2 ≠ 0, tức là x ≠ 4.']
  ],
  '2a': [
    ['so', 'Điểm thuộc đồ thị hàm số y = x² có hoành độ √5. Tung độ của điểm đó là bao nhiêu?', '5', 'y = (√5)² = 5.'],
    ['chon', 'Điểm nào thuộc đồ thị hàm số y = x²?', ['(−2; 4)', '(2; −4)', '(4; 2)', '(−2; −4)'], 'Thay x = −2: y = (−2)² = 4.'],
    ['chon', 'Cho điểm C(√5; 5) và gốc toạ độ O. Độ dài OC bằng', ['√30', '√10', '30', '5√2'], 'OC² = (√5)² + 5² = 5 + 25 = 30, nên OC = √30.'],
    ['so', 'Đồ thị hàm số y = 2x² đi qua điểm có hoành độ −1. Tung độ của điểm đó là bao nhiêu?', '2', 'y = 2·(−1)² = 2.']
  ],
  '2b': [
    ['chon', 'Vì sao phương trình x² − 3x − 5 = 0 luôn có hai nghiệm trái dấu?', ['a·c = −5 < 0', 'Δ = 9 > 0', 'b = −3 < 0', 'Tổng hai nghiệm bằng 3'], 'a·c = 1·(−5) < 0 nên phương trình có hai nghiệm trái dấu.'],
    ['so', 'Gọi x1, x2 là hai nghiệm của x² − 3x − 5 = 0. Tính x1·x2.', '−5', 'Theo Viète: P = c/a = −5.'],
    ['so', 'Gọi x1, x2 là hai nghiệm của x² − 3x − 5 = 0. Tính x1² + x2².', '19', 'S = 3, P = −5. x1² + x2² = S² − 2P = 9 + 10 = 19.'],
    ['so', 'Gọi x1, x2 là hai nghiệm của x² − 3x − 5 = 0. Tính x1/x2 + x2/x1 (viết dạng số thập phân).', '−3,8', '(x1² + x2²)/(x1·x2) = 19/(−5) = −3,8.']
  ],
  '3a': [
    ['so', 'Rút ngẫu nhiên một thẻ từ hộp có 10 thẻ đánh số 1, 2, …, 10. Không gian mẫu có bao nhiêu phần tử?', '10', 'Ω = {1; 2; …; 10} có 10 phần tử.'],
    ['so', 'Gieo một con xúc xắc cân đối. Không gian mẫu có bao nhiêu phần tử?', '6', 'Ω = {1; 2; 3; 4; 5; 6}.'],
    ['chon', 'Tung hai đồng xu. Không gian mẫu là', ['{SS; SN; NS; NN}', '{S; N}', '{SS; NN}', '{SS; SN; NN}'], 'Mỗi đồng có 2 mặt nên có 2·2 = 4 kết quả; SN và NS là hai kết quả khác nhau.'],
    ['so', 'Rút một thẻ từ 10 thẻ đánh số 1 đến 10. Có bao nhiêu kết quả thuận lợi cho biến cố "rút được thẻ số chẵn"?', '5', 'Các thẻ 2, 4, 6, 8, 10.']
  ],
  '3b': [
    ['so', 'Rút một thẻ từ 10 thẻ đánh số 1 đến 10. Tính xác suất rút được thẻ chia hết cho 3 (viết dạng số thập phân).', '0,3', 'Thuận lợi: 3, 6, 9. P = 3/10 = 0,3.'],
    ['so', 'Rút một thẻ từ 10 thẻ đánh số 1 đến 10. Tính xác suất để tổng các số trên 9 thẻ còn lại chia hết cho 3 (viết dạng số thập phân).', '0,4', 'Tổng 10 thẻ là 55. Cần 55 − k chia hết cho 3, tức k chia 3 dư 1: k ∈ {1; 4; 7; 10}. P = 4/10 = 0,4.'],
    ['so', 'Gieo một con xúc xắc. Tính xác suất được số chấm là số nguyên tố (viết dạng số thập phân).', '0,5', 'Số nguyên tố: 2, 3, 5. P = 3/6 = 0,5.'],
    ['so', 'Tung hai đồng xu. Tính xác suất cả hai đều ngửa (viết dạng số thập phân).', '0,25', 'Chỉ có NN trong 4 kết quả: P = 1/4 = 0,25.']
  ],
  '4a': [
    ['chon', 'Trong tam giác vuông, tan của một góc nhọn bằng', ['cạnh đối : cạnh kề', 'cạnh kề : cạnh đối', 'cạnh đối : cạnh huyền', 'cạnh kề : cạnh huyền'], 'tan = đối / kề.'],
    ['so', 'Một cái thang dài 4 m dựa vào tường, tạo với mặt đất góc 60°. Chân thang cách tường bao nhiêu mét?', '2', 'Khoảng cách = 4·cos 60° = 4·0,5 = 2 (m).'],
    ['so', 'Từ đỉnh tháp cao 35 m, người quan sát nhìn xuống điểm A trên mặt đất với góc 60° so với phương ngang. Tính khoảng cách từ chân tháp đến A (mét, làm tròn đến hàng phần mười).', '20,2', 'Góc giữa đường nhìn và mặt đất tại A cũng là 60°. Khoảng cách = 35 : tan 60° = 35 : √3 ≈ 20,2 (m).'],
    ['so', 'Bóng của một cây trên mặt đất dài 12 m, tia nắng tạo với mặt đất góc 40°. Tính chiều cao cây (mét, làm tròn đến hàng phần mười).', '10,1', 'Chiều cao = 12·tan 40° ≈ 12·0,839 ≈ 10,1 (m).']
  ],
  '4b': [
    ['chon', 'Diện tích hình quạt tròn bán kính 20 m, góc ở tâm 135° là', ['150π m²', '300π m²', '75π m²', '400π m²'], 'S = π·20²·135/360 = 150π (m²).'],
    ['chon', 'Độ dài cung 60° của đường tròn bán kính 6 cm là', ['2π cm', '6π cm', 'π cm', '12π cm'], 'l = π·6·60/180 = 2π (cm).'],
    ['so', 'Tính diện tích hình quạt bán kính 10 cm, góc ở tâm 90° (cm², lấy π ≈ 3,14, làm tròn đến hàng phần mười).', '78,5', 'S = π·10²·90/360 = 25π ≈ 78,5 (cm²).'],
    ['chon', 'Diện tích hình vành khuyên giới hạn bởi hai đường tròn đồng tâm bán kính 5 cm và 3 cm là', ['16π cm²', '4π cm²', '34π cm²', '2π cm²'], 'S = π(5² − 3²) = 16π (cm²).']
  ],
  '4c': [
    ['chon', 'Thể tích hình trụ có bán kính đáy 2 m, chiều cao 5 m là', ['20π m³', '10π m³', '40π m³', '100π m³'], 'V = π·2²·5 = 20π (m³).'],
    ['chon', 'Một ống cống hình trụ rỗng dài 2 m, đường kính ngoài 1 m, đường kính trong 0,8 m. Thể tích bê tông làm ống là', ['0,18π m³', '0,36π m³', '0,09π m³', '0,72π m³'], 'Bán kính ngoài 0,5 m, trong 0,4 m. V = π(0,5² − 0,4²)·2 = π·0,09·2 = 0,18π (m³).'],
    ['so', 'Hình trụ có thể tích 36π cm³ và bán kính đáy 3 cm. Tính chiều cao (cm).', '4', '36π = π·3²·h nên h = 4 (cm).'],
    ['chon', 'Diện tích xung quanh hình trụ bán kính đáy 3 cm, chiều cao 5 cm là', ['30π cm²', '15π cm²', '45π cm²', '48π cm²'], 'Sxq = 2π·3·5 = 30π (cm²).']
  ],
  '5a': [
    ['so', 'Hiện nay mẹ hơn con 28 tuổi. Ba năm nữa tuổi mẹ gấp 3 lần tuổi con. Tuổi con hiện nay là bao nhiêu?', '11', 'Gọi tuổi con là x thì tuổi mẹ là x + 28. Ta có x + 31 = 3(x + 3), suy ra 2x = 22, x = 11.'],
    ['chon', 'Gọi tuổi bố là x, tuổi con là y. Câu "bố hơn con 30 tuổi" cho phương trình', ['x − y = 30', 'y − x = 30', 'x + y = 30', 'x = 30y'], 'Tuổi bố trừ tuổi con bằng 30.'],
    ['so', 'Tổng tuổi hai anh em là 25, anh hơn em 5 tuổi. Em bao nhiêu tuổi?', '10', 'x + y = 25, x − y = 5 nên x = 15, y = 10.'],
    ['so', 'Hai số có tổng bằng 50 và hiệu bằng 14. Số lớn là bao nhiêu?', '32', 'Số lớn = (50 + 14) : 2 = 32.']
  ],
  '5b': [
    ['chon', 'Một tổ dự định làm 120 sản phẩm. Mỗi ngày làm thêm 2 sản phẩm nên xong sớm 2 ngày. Gọi x là số sản phẩm dự định làm mỗi ngày (x > 0). Phương trình đúng là', ['120/x − 120/(x + 2) = 2', '120/(x + 2) − 120/x = 2', '120/x + 120/(x + 2) = 2', '120x − 120(x + 2) = 2'], 'Thời gian dự định 120/x lớn hơn thời gian thực tế 120/(x + 2) đúng 2 ngày.'],
    ['so', 'Một tổ dự định làm 120 sản phẩm. Mỗi ngày làm thêm 2 sản phẩm nên xong sớm 2 ngày. Hỏi mỗi ngày tổ dự định làm bao nhiêu sản phẩm?', '10', 'Gọi x là số sản phẩm dự định mỗi ngày: 120/x − 120/(x + 2) = 2. Quy đồng được x² + 2x − 120 = 0, nghiệm x = 10 (nhận), x = −12 (loại). Thử lại: 12 ngày và 10 ngày.'],
    ['so', 'Tìm nghiệm dương của phương trình x² − x − 30 = 0.', '6', 'Δ = 1 + 120 = 121. x = (1 + 11)/2 = 6 hoặc x = −5 (loại).'],
    ['so', 'Hai xe đi quãng đường 120 km. Xe thứ hai nhanh hơn xe thứ nhất 10 km/h nên đến sớm hơn 1 giờ. Tính vận tốc xe thứ nhất (km/h).', '30', '120/x − 120/(x + 10) = 1 dẫn đến x² + 10x − 1200 = 0, x = 30 (nhận). Thử lại: 4 giờ và 3 giờ.']
  ],
  '6a': [
    ['chon', 'Tứ giác ABCD có góc ADB = góc ACB = 90°. Bốn điểm A, B, C, D cùng thuộc đường tròn đường kính', ['AB', 'AC', 'BD', 'CD'], 'C và D cùng nhìn AB dưới góc vuông nên cùng thuộc đường tròn đường kính AB.'],
    ['chon', 'Tứ giác nội tiếp đường tròn thì tổng hai góc đối bằng', ['180°', '90°', '360°', '120°'], 'Tính chất tứ giác nội tiếp.'],
    ['chon', 'Tam giác ABC có hai đường cao BE, CF. Bốn điểm B, C, E, F cùng thuộc một đường tròn vì', ['góc BEC = góc BFC = 90°', 'BE = CF', 'góc B = góc C', 'EF song song BC'], 'E và F cùng nhìn BC dưới góc vuông.'],
    ['chon', 'Ở câu trên, tâm đường tròn đi qua B, C, E, F là', ['trung điểm của BC', 'giao điểm của BE và CF', 'trung điểm của EF', 'điểm A'], 'Đường tròn đường kính BC có tâm là trung điểm BC.']
  ],
  '6b': [
    ['so', 'Góc nội tiếp chắn cung có số đo 80°. Số đo góc nội tiếp đó là bao nhiêu độ?', '40', 'Góc nội tiếp bằng nửa số đo cung bị chắn: 80° : 2 = 40°.'],
    ['chon', 'Hai góc nội tiếp cùng chắn một cung thì', ['bằng nhau', 'bù nhau', 'phụ nhau', 'gấp đôi nhau'], 'Hệ quả của định lí góc nội tiếp.'],
    ['chon', 'Hai dây AB và CD cắt nhau tại M nằm trong đường tròn. Đẳng thức đúng là', ['MA·MB = MC·MD', 'MA·MC = MB·MD', 'MA + MB = MC + MD', 'MA·MD = MB·MC'], 'Tam giác MAC đồng dạng tam giác MDB (hai góc nội tiếp cùng chắn cung) nên MA/MD = MC/MB.'],
    ['so', 'Góc nội tiếp chắn nửa đường tròn có số đo bao nhiêu độ?', '90', 'Nửa đường tròn là cung 180°, góc nội tiếp bằng 90°.']
  ],
  '6c': [
    ['chon', 'Tam giác ABC vuông tại A, đường cao AH. Hệ thức đúng là', ['AH² = HB·HC', 'AH² = AB·AC', 'AB² = HB·HC', 'AC² = HB·BC'], 'Tam giác HBA đồng dạng tam giác HAC nên AH² = HB·HC.'],
    ['so', 'Tam giác ABC vuông tại A có AB = 6 cm, AC = 8 cm, đường cao AH. Tính AH (cm).', '4,8', 'BC = 10. AH = AB·AC : BC = 48 : 10 = 4,8 (cm).'],
    ['so', 'Tam giác ABC đồng dạng tam giác DEF theo tỉ số 2 và DE = 3 cm. Tính AB (cm).', '6', 'AB = 2·DE = 6 (cm).'],
    ['so', 'Tam giác vuông có một góc 30° và cạnh huyền 10 cm. Cạnh đối diện góc 30° dài bao nhiêu cm?', '5', 'Cạnh đối = 10·sin 30° = 5 (cm).']
  ]
};

/** Danh sách dạng theo thứ tự đề, kèm mức độ trong đề thật. */
export const DANG_ON_THI = DE_DA_NANG_2026.map((d) => ({
  cau: d.cau, chuong: d.chuong, muc: d.muc, tomTat: d.tomTat, ...DANG[d.cau],
  lienQuan: (DANG[d.cau]?.kuLienQuan ?? []).map((ku) => ({ ku, ten: TEN_MUC[ku] ?? ku })),
  cauHoi: (CAU[d.cau] ?? []).map((c, i) => {
    const id = `${d.cau}-${i + 1}`, b = ON_THI_BUOC[id] ?? {};
    const goc = c[0] === 'chon'
      ? { id, loai: 'chon', de: c[1], phuongAn: c[2], loiGiai: c[3] }
      : { id, loai: 'so', de: c[1], dapAn: c[2], loiGiai: c[3] };
    return { ...goc, ...(b.de ? { de: b.de } : {}), ...(b.pa ? { phuongAn: b.pa } : {}), ...(b.dap ? { dapAn: b.dap } : {}), ...(b.hinh ? { hinh: b.hinh } : {}),
      buoc: b.buoc ?? [], giai: b.giai ?? [] };
  })
}));

/**
 * Mức nắm một ý đề từ mức nắm từng mục (0–1, null = chưa có dữ liệu).
 * Chưa học mục chính → null (ô xám trên bản đồ ôn thi). Mục liên quan chưa có dữ liệu thì bỏ qua.
 */
export function mucYDe(dang, mucTheoKu) {
  const chinh = mucTheoKu[dang.ku];
  if (chinh == null) return null;
  const lq = (dang.kuLienQuan ?? []).map((k) => mucTheoKu[k]).filter((v) => v != null);
  if (!lq.length) return chinh;
  return 0.7 * chinh + 0.3 * (lq.reduce((s, v) => s + v, 0) / lq.length);
}

/** Đề làm thử: mỗi dạng một câu, đúng thứ tự 1a → 6c như đề thật. `hat` để mỗi lần ra đề khác nhau. */
export function deLamThu(hat = Date.now()) {
  let s = hat % 2147483647 || 1;
  const rnd = () => (s = (s * 48271) % 2147483647) / 2147483647;
  return DANG_ON_THI.map((d) => ({ cau: d.cau, ten: d.ten, ...d.cauHoi[Math.floor(rnd() * d.cauHoi.length)] }));
}
