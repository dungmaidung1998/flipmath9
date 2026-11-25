/**
 * FILE NÀY LÀM GÌ: Mô-đun TypeScript/JavaScript hỗ trợ xử lý dữ liệu và nghiệp vụ trong hệ thống FlipMath 9.
 * AI DÙNG: dùng chung
 * LẤY DỮ LIỆU TỪ: không truy vấn bảng trực tiếp
 * GỌI TỚI: ./mau
 */
import type { DangBai } from './mau';

type ChonKetQua = { hoi: string; pa: [string, string, string] };

/**
 * Hàm `chon`: nhận (hoi, a, b, c), xử lý nghiệp vụ và trả kết quả tương ứng.
 */
function chon(hoi: string, a: string, b: string, c: string): ChonKetQua {
  return { hoi, pa: [a, b, c] };
}

export const ketQuaGiai: Record<string, ChonKetQua> = {
  'C1-B1-M1-Q07': chon('Với x = 2, giá trị y nào thoả phương trình?', '5', '3', '8'),
  'C1-B1-M1-Q16': chon('Từ phương trình, khi x = 4 thì y bằng bao nhiêu?', '2', '4', '6'),
  'C1-B3-M1-Q04': chon('Giải hệ, hai đơn giá x và y lần lượt là bao nhiêu?', '8 000 đồng và 5 000 đồng', '5 000 đồng và 8 000 đồng', '13 000 đồng và 3 000 đồng'),
  'C1-B3-M1-Q05': chon('Cộng hai phương trình rồi chia cho 5. Tổng hai đơn giá bằng bao nhiêu?', '13 000 đồng', '3 000 đồng', '65 000 đồng'),
  'C1-B3-M1-Q06': chon('Giải hệ, hai cạnh x và y lần lượt là bao nhiêu?', '12 m và 5 m', '5 m và 12 m', '24 m và 10 m'),
  'C1-B3-M1-Q07': chon('Tìm x và y để chuẩn bị tính diện tích.', '12 m và 5 m', '5 m và 12 m', '17 m và 7 m'),
  'C1-B3-M1-Q16': chon('Giải hệ, hai cạnh ban đầu lần lượt là bao nhiêu?', '14 m và 9 m', '12 m và 12 m', '23 m và 5 m'),
  'C1-B3-M1-Q10': chon('Số nào sau đây có thể là số cây An trồng?', '3', '−3', '3/2'),
  'C1-B3-M1-Q13': chon('Giải hệ, giá một kg táo và một kg cam lần lượt là bao nhiêu?', '40 000 đồng và 30 000 đồng', '30 000 đồng và 40 000 đồng', '70 000 đồng và 35 000 đồng'),
  'C1-B3-M1-Q14': chon('Lấy phương trình sau trừ phương trình đầu. Hiệu x − y bằng bao nhiêu?', '10 000 đồng', '−10 000 đồng', '70 000 đồng'),
  'C1-B3-M1B-Q01': chon('Nếu đi với vận tốc v trong 2 giờ, quãng đường là bao nhiêu?', '2v km', 'v/2 km', '(v + 2) km'),
  'C1-B3-M1B-Q10': chon('Nếu xe chạy 2 giờ thì đã đi được bao xa?', '80 km', '60 km', '20 km'),
  'C1-B3-M1B-Q03': chon('Chia phương trình cho 2. Tổng hai vận tốc là bao nhiêu?', '90 km/h', '180 km/h', '360 km/h'),
  'C1-B3-M1B-Q05': chon('Từ tổng và hiệu, tìm x và y.', 'x = 50, y = 40', 'x = 40, y = 50', 'x = 90, y = 10'),
  'C1-B3-M1B-Q11': chon('Trong 1,5 giờ, mỗi xe đi bao xa?', 'Lần lượt 1,5x và 1,5y km', 'Lần lượt x/1,5 và y/1,5 km', 'Lần lượt x và y km'),
  'C1-B3-M1B-Q13': chon('Nếu x = 60 km/h, phương trình cho giá trị y nào?', '40 km/h', '60 km/h', '80 km/h'),
  'C1-B3-M1B-Q14': chon('Từ tổng và hiệu, tìm x và y.', 'x = 55, y = 45', 'x = 45, y = 55', 'x = 50, y = 50'),
  'C1-B3-M1B-Q06': chon('Giải phương trình để kiểm tra quãng đường AB.', '20 km', '40 km', '81 km'),
  'C1-B3-M1B-Q07': chon('Quy đồng 1/15 + 1/12. Hệ số của x bằng bao nhiêu?', '3/20', '1/27', '1/60'),
  'C1-B3-M1C-Q02': chon('Quy đồng về mẫu số 12. Mỗi vòi đóng góp lần lượt bao nhiêu phần bể trong một giờ?', '3/12 và 2/12', '4/12 và 6/12', '2/12 và 3/12'),
  'C1-B3-M1C-Q03': chon('Trong một giờ, hai vòi cùng chảy được bao nhiêu phần bể?', '5/12 bể', '1/10 bể', '1/24 bể'),
  'C1-B3-M1C-Q08': chon('Giải phương trình và chọn nghiệm dương.', '4 giờ', '6 giờ', '1,2 giờ'),
  'C1-B3-M1C-Q14': chon('Đặt u = 1/x, v = 1/y. Giải hệ tìm u và v.', 'u = 1/10, v = 1/15', 'u = 1/15, v = 1/10', 'u = 1/6, v = 2/5'),
  'C1-B3-M1C-Q15': chon('Lấy phương trình sau trừ hai lần phương trình đầu. Năng suất vòi II bằng bao nhiêu?', '1/15 bể/giờ', '1/10 bể/giờ', '2/5 bể/giờ'),
  'C1-B3-M1C-Q09': chon('Mỗi giờ vòi chảy được bao nhiêu phần bể?', '1/5 bể', '2/5 bể', '5 bể'),
  'C2-B4-M1-Q08': chon('Giải phương trình trước khi áp dụng điều kiện x > 0.', 'x = 5 hoặc x = −8', 'x = 8 hoặc x = −5', 'x = 5 hoặc x = 8'),
  'C2-B5-M1-Q06': chon('Kết hợp với điều kiện tải trọng không âm. Tập giá trị là gì?', '0 ≤ m ≤ 5', '0 ≤ m < 5', 'm ≥ 5'),
  'C2-B5-M1-Q08': chon('Giá trị nào thoả đồng thời hai giới hạn?', '60 km/h', '59 km/h', '101 km/h'),
  'C2-B5-M1-Q15': chon('Trừ 560 ở hai vế. Có thể mang thêm tối đa bao nhiêu kg?', '40 kg', '75 kg', '560 kg'),
  'C2-B6-M1-Q06': chon('Giải bất phương trình với x nguyên không âm. Có thể mua nhiều nhất bao nhiêu cái?', '16 cái', '17 cái', '15 cái'),
  'C2-B6-M1-Q07': chon('Chia hai vế cho 3 000. Cận trên của x trước khi xét tính nguyên là gì?', '50/3', '50/2', '3/50'),
  'C2-B6-M1-Q14': chon('Kết hợp với x nguyên không âm. Có thể mua nhiều nhất bao nhiêu vé?', '6 vé', '7 vé', '5 vé'),
  'C2-B6-M1-Q15': chon('Chia hai vế cho 60 000. Cận trên của x trước khi xét tính nguyên là gì?', '20/3', '20/6', '3/20'),
  'C2-B6-M2-Q16': chon('So sánh giá 31 bút với số tiền còn lại.', '31 bút vượt 25 000 đồng', '31 bút vừa đủ tiền', '31 bút còn dư 25 000 đồng'),
  'C3-B10-M1-Q15': chon('Phép tính nào cho cạnh x?', 'Căn bậc ba của 1 000', 'Căn bậc hai của 1 000', '1 000 chia 3'),
  'C4-B12-M1-Q08': chon('Dùng máy tính ở chế độ DEG. Kết quả trước khi làm tròn đến mét gần giá trị nào?', '51,423 m', '61,284 m', '67,128 m'),
  'C4-B12-M1-Q16': chon('Tính h trước khi cộng độ cao của tay.', 'h ≈ 45,963 m', 'h ≈ 38,567 m', 'h ≈ 71,505 m'),
  'C4-B12-M2-Q07': chon('Rút x từ hệ thức đã chọn.', 'x = 30 / tan 25°', 'x = 30 · tan 25°', 'x = 30 / cos 25°'),
  'C4-B12-M2-Q16': chon('Rút x từ hệ thức đã chọn.', 'x = 35 / tan 60°', 'x = 35 · tan 60°', 'x = 35 · cos 60°'),
  'C4-B12-M2-Q15': chon('Dùng tan 45° = 1 và khử h. Tìm biểu thức của x.', 'x = 20/(√3 − 1)', 'x = 20/(√3 + 1)', 'x = 20√3'),
  'C5-B13-M1-Q16': chon('Sau khi đổi đơn vị, khoảng cách của nhà nào nhỏ hơn bán kính phủ âm?', 'Chỉ nhà An', 'Chỉ nhà Bình', 'Cả hai nhà'),
  'C5-B14-M2-Q05': chon('Hai kim cách nhau bao nhiêu khoảng chia đều?', '3 khoảng', '2 khoảng', '6 khoảng'),
  'C5-B14-M2-Q13': chon('Hai kim cách nhau bao nhiêu khoảng chia đều?', '2 khoảng', '3 khoảng', '4 khoảng'),
  'C5-B15-M1-Q07': chon('Trong 20 phút, kim phút quét được góc bao nhiêu?', '120°', '60°', '20°'),
  'C5-B15-M1-Q16': chon('Trong ba giờ, đầu kim giờ đi được bao nhiêu phần của một vòng tròn?', '1/4 vòng', '1/3 vòng', '3 vòng'),
  'C5-B14-M2-Q08': chon('Một vòng bánh xe chia thành bao nhiêu khoảng giữa các nan?', '12 khoảng', '11 khoảng', '24 khoảng'),
  'C5-B14-M3-Q16': chon('Đi theo cung ngắn từ nan thứ nhất tới nan thứ tư qua mấy khoảng?', '3 khoảng', '4 khoảng', '5 khoảng'),
  'C5-B15-M1-Q06': chon('Đổi đường kính sang mét rồi tính chu vi một vòng.', '2,198 m', '4,396 m', '21,98 m'),
  'C5-B15-M1-Q15': chon('Tính chu vi bánh xe theo mét.', '2,198 m', '1,099 m', '21,98 m'),
  'C5-B16-M1-Q16': chon('Đoạn nào biểu diễn khoảng cách ngắn nhất đến mặt đường?', 'Đoạn từ tâm đến điểm tiếp xúc', 'Đường kính bánh xe', 'Đoạn từ tâm đến mép trái bánh xe'),
  'C5-B16-M2-Q08': chon('Số đo góc giữa bán kính qua tiếp điểm và mặt đường là bao nhiêu?', '90°', '45°', '0°'),
  'C5-B15-M2-Q06': chon('Mặt quạt chiếm bao nhiêu phần hình tròn?', '1/3', '1/2', '2/3'),
  'C5-B15-M2-Q08': chon('Vùng tưới chiếm bao nhiêu phần hình tròn?', '1/4', '1/2', '3/4'),
  'C5-B15-M2-Q16': chon('Diện tích vùng sáng bằng bao nhiêu nếu giữ nguyên π?', '150π m²', '300π m²', '900π m²'),
  'C5-B15-M3-Q08': chon('Hiệu bình phương hai bán kính là bao nhiêu?', '0,09 m²', '0,01 m²', '0,41 m²'),
  'C5-B15-M3-Q14': chon('Hiệu bình phương hai bán kính là bao nhiêu?', '96 m²', '64 m²', '104 m²'),
  'C5-B16-M2-Q15': chon('Khai triển hiệu hai bình phương. Biểu thức gọn của d² là gì nếu R là bán kính và h là chiều cao?', '2Rh + h²', 'h²', 'R² + h²'),
};

/**
 * Hàm `layBuocGiai`: nhận (id, mau), xử lý nghiệp vụ và trả kết quả tương ứng.
 */
export function layBuocGiai(id: string, mau: DangBai) {
  return { ...ketQuaGiai[id], goiY: mau.giai };
}

