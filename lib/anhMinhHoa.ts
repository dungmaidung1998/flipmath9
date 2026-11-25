/**
 * FILE NÀY LÀM GÌ: Mô-đun TypeScript/JavaScript hỗ trợ xử lý dữ liệu và nghiệp vụ trong hệ thống FlipMath 9.
 * AI DÙNG: dùng chung
 * LẤY DỮ LIỆU TỪ: không truy vấn bảng trực tiếp
 * GỌI TỚI: không gọi mô-đun nội bộ khác
 */
/**
 * Ảnh minh hoạ cho câu bài toán thực tế (23/11/2026, tạo bằng Codex – OpenAI, đã kê khai).
 * Ảnh ở public/minh-hoa/cau/<tên ảnh>.webp; nhiều câu cùng bối cảnh dùng chung một ảnh.
 * Ảnh không chứa số liệu hay đáp án.
 */
export type Anh = { anh: string; mo: string } | { ve: 'nan-hoa'; n: number; mo: string };
const A = (anh: string, mo: string): Anh => ({ anh, mo });

const VE = A('C1-B1-M1-Q16', 'Gia đình xếp hàng mua vé người lớn và vé trẻ em');
const TAO_CAM = A('C1-B3-M1-Q13', 'Sạp trái cây có táo và cam');
const HAI_XE = A('C1-B3-M1B-Q03', 'Hai ô tô chạy ngược chiều giữa hai thành phố');
const HAI_VOI = A('C1-B3-M1C-Q03', 'Hai vòi nước cùng chảy vào một bể');
const VE_PHIM = A('C2-B6-M1-Q14', 'Bạn Hoa mua vé xem phim');
const DIEU = A('C4-B12-M1-Q08', 'Bạn học sinh thả diều, dây diều tạo góc với phương nằm ngang');
const GOC_HA = A('C4-B12-M2-Q07', 'Người trên nóc toà nhà nhìn xuống ô tô với góc hạ');
const VO_BUT = A('vo-but', 'Quầy bán vở và bút');
const VUON = A('vuon', 'Mảnh vườn hình chữ nhật có hàng rào');
const XE_DAP = A('xe-dap-di-ve', 'Người đi xe đạp từ A đến B rồi quay về');
const MUA_BUT = A('mua-but', 'Bạn học sinh mua bút ở hiệu sách');
const DONG_HO = A('dong-ho', 'Đồng hồ treo tường có kim giờ và kim phút');
const BANH_XE = A('banh-xe-lan', 'Bánh xe lăn trên mặt đường');

export const ANH_MINH_HOA: Record<string, Anh> = {
  // Chương I
  'C1-B1-M1-Q07': VO_BUT,
  'C1-B1-M1-Q16': VE,
  'C1-B3-M1-Q04': VO_BUT, 'C1-B3-M1-Q05': VO_BUT,
  'C1-B3-M1-Q06': VUON, 'C1-B3-M1-Q07': VUON, 'C1-B3-M1-Q16': VUON,
  'C1-B3-M1-Q10': A('trong-cay', 'Bạn An trồng cây'),
  'C1-B3-M1-Q13': TAO_CAM, 'C1-B3-M1-Q14': TAO_CAM,
  'C1-B3-M1B-Q01': A('o-to-mot-xe', 'Ô tô chạy từ thành phố A đến thành phố B'),
  'C1-B3-M1B-Q10': A('o-to-mot-xe', 'Ô tô chạy từ thành phố A đến thành phố B'),
  'C1-B3-M1B-Q03': HAI_XE, 'C1-B3-M1B-Q05': HAI_XE, 'C1-B3-M1B-Q11': HAI_XE, 'C1-B3-M1B-Q13': HAI_XE, 'C1-B3-M1B-Q14': HAI_XE,
  'C1-B3-M1B-Q06': XE_DAP, 'C1-B3-M1B-Q07': XE_DAP,
  'C1-B3-M1C-Q02': HAI_VOI, 'C1-B3-M1C-Q03': HAI_VOI, 'C1-B3-M1C-Q08': HAI_VOI, 'C1-B3-M1C-Q14': HAI_VOI, 'C1-B3-M1C-Q15': HAI_VOI,
  'C1-B3-M1C-Q09': A('mot-voi', 'Một vòi nước chảy vào bể'),
  // Chương II
  'C2-B4-M1-Q08': VUON,
  'C2-B5-M1-Q06': A('xe-tai', 'Xe tải đang xếp hàng'),
  'C2-B5-M1-Q08': A('cao-toc', 'Đường cao tốc có biển báo tốc độ'),
  'C2-B5-M1-Q15': A('C2-B5-M1-Q15', 'Thang máy chở 8 người và thùng hàng'),
  'C2-B6-M1-Q06': MUA_BUT, 'C2-B6-M1-Q07': MUA_BUT,
  'C2-B6-M1-Q14': VE_PHIM, 'C2-B6-M1-Q15': VE_PHIM,
  'C2-B6-M2-Q16': A('ban-phim', 'Bạn Minh mua bàn phím và bút'),
  // Chương III
  'C3-B10-M1-Q15': A('thung-nuoc', 'Thùng nước hình lập phương'),
  // Chương IV
  'C4-B12-M1-Q08': DIEU, 'C4-B12-M1-Q16': DIEU,
  'C4-B12-M2-Q07': GOC_HA, 'C4-B12-M2-Q16': GOC_HA,
  'C4-B12-M2-Q15': A('thap-hai-ban', 'Hai bạn đứng thẳng hàng nhìn lên đỉnh tháp với hai góc nâng khác nhau'),
  // Chương V
  'C5-B13-M1-Q16': A('loa', 'Loa phát thanh và các vòng sóng âm, hai ngôi nhà ở khoảng cách khác nhau'),
  'C5-B14-M2-Q05': DONG_HO, 'C5-B14-M2-Q13': DONG_HO, 'C5-B15-M1-Q07': DONG_HO, 'C5-B15-M1-Q16': DONG_HO,
  'C5-B14-M2-Q08': { ve: 'nan-hoa', n: 12, mo: 'Bánh xe có 12 nan hoa chia đều quanh trục' },
  'C5-B14-M3-Q16': { ve: 'nan-hoa', n: 8, mo: 'Bánh xe có 8 nan hoa chia đều quanh trục, hai nan được tô màu' },
  'C5-B15-M1-Q06': BANH_XE, 'C5-B15-M1-Q15': BANH_XE, 'C5-B16-M1-Q16': BANH_XE, 'C5-B16-M2-Q08': BANH_XE,
  'C5-B15-M2-Q06': A('quat-giay', 'Quạt giấy mở ra thành hình quạt tròn'),
  'C5-B15-M2-Q08': A('C5-B15-M2-Q08', 'Vòi tưới quay, vùng tưới hình quạt'),
  'C5-B15-M2-Q16': A('den-pha', 'Đèn pha chiếu sáng một vùng hình quạt'),
  'C5-B15-M3-Q08': A('ong-cong', 'Ống cống bê tông có mặt cắt hình vành khuyên'),
  'C5-B15-M3-Q14': A('san-tron', 'Sân hình tròn có bồn cây ở giữa'),
  'C5-B16-M2-Q15': A('C5-B16-M2-Q15', 'Tia nhìn từ đỉnh hải đăng tiếp xúc với mặt biển cong'),
  // Bổ sung từ DANH-SACH-24-11.txt
  'C1-B1-M3-Q16': A('lop-hoc-nam-nu', 'Lớp học có học sinh nam và nữ'), 'C1-B3-M1-Q02': A('lop-hoc-nam-nu', 'Lớp học có học sinh nam và nữ'), 'C1-OTC-Q03': A('lop-hoc-nam-nu', 'Lớp học có học sinh nam và nữ'),
  'C1-B3-M1B-Q02': A('ca-no-song-han', 'Ca nô chạy trên sông Hàn'), 'C1-B3-M1B-Q04': A('ca-no-song-han', 'Ca nô chạy trên sông Hàn'), 'C1-B3-M1B-Q08': A('ca-no-song-han', 'Ca nô chạy trên sông Hàn'), 'C1-B3-M1B-Q09': A('ca-no-song-han', 'Ca nô chạy trên sông Hàn'), 'C1-B3-M1B-Q12': A('ca-no-song-han', 'Ca nô chạy trên sông Hàn'), 'C1-B3-M1B-Q15': A('ca-no-song-han', 'Ca nô chạy trên sông Hàn'), 'C1-OTC-Q08': A('ca-no-song-han', 'Ca nô chạy trên sông Hàn'),
  'C1-B3-M1B-Q16': A('di-duong-som-muon', 'Đi đường sớm hoặc muộn'),
  'C1-OTC-Q05': A('mua-but-va-vo', 'Quầy bút và vở'), 'C1-OTC-Q06': A('mua-but-va-vo', 'Quầy bút và vở'),
  'C1-OTC-Q09': A('hai-voi-cung-chay', 'Hai vòi cùng chảy vào bể'),
  'C2-OTC-Q08': A('ve-khu-vui-choi', 'Vé khu vui chơi'),
  'C3-B10-M1-Q07': A('khoi-go-lap-phuong', 'Khối gỗ lập phương'), 'C3-OTC-Q10': A('khoi-go-lap-phuong', 'Khối gỗ lập phương'),
  'C3-B7-M1-Q16': A('tam-kinh-hinh-vuong', 'Tấm kính vuông'),
  'C4-B12-M3-Q04': A('may-tinh-cam-tay', 'Máy tính cầm tay'), 'C4-B12-M3-Q12': A('may-tinh-cam-tay', 'Máy tính cầm tay'),
  'C4-LTC-Q07': A('thang-tua-tuong', 'Thang dựa tường'),
  'C4-OTC-Q08': A('bin-tha-dieu', 'Bin thả diều'),
  'C4-OTC-Q09': A('bong-cot-dien', 'Bóng cột điện'),
  'C5-B17-M1-Q07': A('hai-vong-tron-chong', 'Hai vòng tròn chồng một phần'),
  'C5-B17-M1-Q15': A('hai-banh-rang-an-khop', 'Hai bánh răng ăn khớp'),
  'C5-B17-M2-Q16': A('hai-dong-xu-tiep-xuc', 'Hai đồng xu tiếp xúc ngoài'),
  'C5-OTC-Q08': A('banh-xe-dap-lan', 'Bánh xe đạp lăn'),
};
