/**
 * FILE NÀY LÀM GÌ: Mô-đun TypeScript/JavaScript hỗ trợ xử lý dữ liệu và nghiệp vụ trong hệ thống FlipMath 9.
 * AI DÙNG: dùng chung
 * LẤY DỮ LIỆU TỪ: không truy vấn bảng trực tiếp
 * GỌI TỚI: không gọi mô-đun nội bộ khác
 */
export const DIA_DANH: Record<string, { mau: string; ten: string; hoi: string; icon: string; chuDe: string; mucTen: [string,string,string,string,string] }> = {
  C1: {mau:"#97421b", ten:'Chợ Hàn', hoi:'Biết tổng số món và tổng tiền, em có tìm được số món của từng loại?', icon:'basket', chuDe:'Giỏ đi chợ', mucTen:['Giỏ trống','Vài món','Giỏ nặng','Đầy giỏ','Giỏ quà']},
  C2: {mau:"#9e382c", ten:'Chợ Cồn', hoi:'Với số tiền mang theo, em mua được nhiều nhất bao nhiêu món quà?', icon:'purse', chuDe:'Cân của bà bán hàng', mucTen:['Cân trống','Lệch nhiều','Gần cân','Thăng bằng','Cân vàng']},
  C3: {mau:"#376960", ten:'Ngũ Hành Sơn', hoi:'Biết diện tích mặt vuông của một phiến đá, em tìm cạnh bằng cách nào?', icon:'brick', chuDe:'Làng đá Non Nước', mucTen:['Đá thô','Đẽo phác','Thành hình','Tượng đá','Tượng ngọc']},
  C4: {mau:"#255f3d", ten:'Cáp treo Bà Nà', hoi:'Biết chiều dài dây và góc nâng, em ước tính độ cao của cabin thế nào?', icon:'tokyo_tower', chuDe:'Cabin lên núi', mucTen:['Ga chân núi','Trụ đầu','Lưng chừng','Gần đỉnh','Đỉnh Bà Nà']},
  C5: {mau:"#943c84", ten:'Vòng quay Sun Wheel', hoi:'Một cabin quay được một phần tư vòng. Cabin đi qua cung dài bao nhiêu?', icon:'bicycle', chuDe:'Góc quay', mucTen:['Chờ lên','90°','180°','270°','Trọn 360°']},
  C6: {mau:"#8a5c00", ten:'Cầu Rồng', hoi:'Vòm Cầu Rồng có phải là một parabol? Em sẽ đo những điểm nào để kiểm tra?', icon:'flashlight', chuDe:'Rồng lớn dần', mucTen:['Trứng rồng','Rồng con','Rồng vươn','Phun lửa','Phun nước']},
  C7: {mau:"#126a95", ten:'Biển Mỹ Khê', hoi:'Em sẽ trình bày lượng khách đi biển theo từng ngày bằng biểu đồ nào?', icon:'water_wave', chuDe:'Lâu đài cát', mucTen:['Cát phẳng','Đắp nền','Xây tường','Lâu đài','Cắm cờ']},
  C8: {mau:"#3f6525", ten:'Bán đảo Sơn Trà', hoi:'Nếu rút ngẫu nhiên một thẻ địa danh, cơ hội rút được thẻ Sơn Trà là bao nhiêu?', icon:'evergreen_tree', chuDe:'Đi tìm voọc chà vá', mucTen:['Bìa rừng','Nghe tiếng','Thấy dấu chân','Gặp voọc','Cả đàn']},
  C9: {mau:"#845108", ten:'Cầu Vàng', hoi:'Nếu ba điểm tựa tạo thành một tam giác, em tìm tâm đường tròn qua cả ba điểm thế nào?', icon:'sun', chuDe:'Dựng cầu', mucTen:['Bãi đất','Bàn tay đá','Nhịp cầu','Cầu xong','Cầu Vàng']},
  C10:{mau:"#813c2f", ten:'Bảo tàng Chăm', hoi:'Trong các hiện vật, em nhận ra hình trụ, hình nón hay hình cầu ở đâu?', icon:'classical_building', chuDe:'Khai quật cổ vật', mucTen:['Lớp đất','Mảnh vỡ','Ghép nửa','Tượng nguyên','Báu vật']},
};

export const anhDiaDanh = (id: string) =>
  DIA_DANH[id] ? `/chu-de/canh/${id}.webp` : '/canh/bai-hoc.webp';

