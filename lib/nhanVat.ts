/**
 * FILE NÀY LÀM GÌ: Mô-đun TypeScript/JavaScript hỗ trợ xử lý dữ liệu và nghiệp vụ trong hệ thống FlipMath 9.
 * AI DÙNG: dùng chung
 * LẤY DỮ LIỆU TỪ: không truy vấn bảng trực tiếp
 * GỌI TỚI: ./chuDeChuong
 */
import { maChuong } from './chuDeChuong';

export const NHAN_VAT = {
  bin: { ten: 'Bin', tinhCach: 'Nhanh nhảu, đôi khi tính hơi vội.' },
  na: { ten: 'Na', tinhCach: 'Cẩn thận và hay kiểm tra điều kiện.' },
} as const;

type Loi = { ai: keyof typeof NHAN_VAT; anh: string; noi: string };
export const LOI_NHAN_VAT = {
  chao: { ai:'bin', anh:'chao', noi:'Chào em! Mình cùng chuẩn bị bài mới nhé.' },
  soat: { ai:'na', anh:'kinh-lup', noi:'Đọc lại chỗ từng nhầm trước khi chọn đáp án nhé.' },
  game: { ai:'bin', anh:'di-hoc', noi:'Mình làm nóng bằng một lượt ôn kiến thức nền!' },
  video: { ai:'bin', anh:'xem-video', noi:'Khi thấy một cách làm mới, thử dừng video và tự nhắc lại.' },
  'tong-hop': { ai:'na', anh:'doc-sach', noi:'Đọc lại quy tắc từng bài, tự làm ví dụ trước khi mở xem.' },
  'ghi-vo': { ai:'na', anh:'doc-sach', noi:'Ghi công thức cùng điều kiện áp dụng và một ví dụ.' },
  'thu-tay': { ai:'bin', anh:'chi-bang', noi:'Đổi từng giá trị rồi nhìn xem hình thay đổi ra sao.' },
  sheet: { ai:'na', anh:'doc-sach', noi:'Đọc yêu cầu trước, làm từng ý theo thứ tự.' },
  quiz: { ai:'na', anh:'goi-y', noi:'Đọc kỹ đề, để ý đơn vị và điều kiện trước khi nộp.' },
  completion: { ai:'bin', anh:'cam-co', noi:'Đã tới đích! Em thử kể lại một điều vừa học nhé.' },
  xong: { ai:'bin', anh:'cam-co', noi:'Đã tới đích! Em thử kể lại một điều vừa học nhé.' },
  sai: { ai:'na', anh:'kinh-lup', noi:'Xem bước đầu tiên khác với cách làm của em rồi thử lại.' },
  saiNhieu: { ai:'na', anh:'dong-vien', noi:'Mình làm chậm lại nhé. Thử một ví dụ đơn giản trước.' },
  chuoi: { ai:'na', anh:'reo-ho', noi:'Ba câu đúng liên tiếp! Giữ nhịp và tiếp tục đọc kỹ đề nhé.' },
  gameXong: { ai:'bin', anh:'cup', noi:'Kết thúc lượt ôn! Em xem lại chỗ mình còn phân vân nhé.' },
  goiY: { ai:'na', anh:'goi-y', noi:'Xem gợi ý nhỏ rồi tự làm tiếp từng bước nhé.' },
  nghiMat: { ai:'na', anh:'nghi-mat', noi:'Rời mắt khỏi màn hình và nhìn xa khoảng 6 mét trong 20 giây nhé.' },
  onThi: { ai:'bin', anh:'cup', noi:'Chọn dạng em muốn luyện, hoặc thử một đề để biết mình cần ôn gì.' },
  vuon: { ai:'na', anh:'goi-y', noi:'Mỗi hình là một mục kiến thức. Chạm vào hình để vào học.' },
  tienDo: { ai:'bin', anh:'cam-co', noi:'Ghé từng địa danh để xem em đã học đến mức nào.' },
} satisfies Record<string, Loi>;

export type TinhHuongChuong = 'chao' | 'sai' | 'saiNhieu' | 'chuoi' | 'gameXong' | 'video' | 'xong' | 'goiY';

export const LOI_THEO_CHUONG: Record<string, Record<TinhHuongChuong, string>> = {
  C1: {
    chao: 'Chào em! Hôm nay mình cùng đi chợ Hàn xếp đầy giỏ nhé.',
    sai: 'Món này nhầm giá rồi, mình kiểm tra lại từ bước đầu nhé.',
    saiNhieu: 'Đừng vội nhé! Mình chọn từng món đơn giản bỏ giỏ trước nào.',
    chuoi: 'Ba món liên tiếp vào giỏ rồi! Giữ vững phong độ nhé.',
    gameXong: 'Giỏ khởi động đã sẵn sàng! Mình xem lại chỗ còn phân vân nhé.',
    video: 'Dừng video khi gặp cách giải mới để nhớ bỏ giỏ kiến thức nhé.',
    xong: 'Tuyệt vời! Giỏ đi chợ đã đầy, em kể lại điều vừa học nhé.',
    goiY: 'Xem gợi ý nhỏ để tìm đúng món hàng còn thiếu nhé.',
  },
  C2: {
    chao: 'Chào em! Ghé chợ Cồn đặt quả cân giữ thăng bằng nhé.',
    sai: 'Đĩa cân bị lệch rồi, xem lại bước đầu tiên nhé.',
    saiNhieu: 'Mình đặt từng quả cân nhỏ trước cho thăng bằng trở lại nhé.',
    chuoi: 'Ba quả cân chuẩn xác liên tiếp! Cân đang thăng bằng đẹp lắm.',
    gameXong: 'Xong lượt cân nháp rồi! Xem lại chỗ cân còn chao đảo nhé.',
    video: 'Xem kỹ cách giữ cân hai vế rồi tự nhắc lại nhé.',
    xong: 'Cân vàng thăng bằng hoàn hảo! Em thử nhắc lại điều vừa học.',
    goiY: 'Mở gợi ý để chọn quả cân vừa vặn với hai đĩa nhé.',
  },
  C3: {
    chao: 'Chào em! Vào xưởng đá Non Nước cùng đục tượng ngọc nhé.',
    sai: 'Nhát đục hơi lệch rồi, soi kỹ đề rồi đục lại nhé.',
    saiNhieu: 'Chậm lại một nhịp nhé! Mình đẽo phác từng nét đơn giản trước.',
    chuoi: 'Ba nhát đục chuẩn xác liên tiếp! Khối đá đang thành hình rồi.',
    gameXong: 'Đã khởi động xong xưởng đá! Xem lại vết đẽo còn băn khoăn nhé.',
    video: 'Dừng video ở chỗ biến đổi căn để tự tay đẽo thử nhé.',
    xong: 'Tượng ngọc hoàn thành rồi! Em kể lại bí quyết vừa học nhé.',
    goiY: 'Xem gợi ý để chọn đúng nhát đục mở đường cho khối đá.',
  },
  C4: {
    chao: 'Chào em! Lên cabin cáp treo Bà Nà vượt từng trụ cáp nhé.',
    sai: 'Cabin hơi chững lại, kiểm tra góc và cạnh ngay bước đầu nhé.',
    saiNhieu: 'Hít thở đều nhé! Mình đi qua từng trụ cáp dễ trước nào.',
    chuoi: 'Qua ba trụ cáp liền mạch! Cabin đang lên rất vững vàng.',
    gameXong: 'Vừa qua trạm khởi động! Xem lại trụ cáp em còn phân vân nhé.',
    video: 'Dừng video khi thấy công thức góc để tự nhẩm lại nhé.',
    xong: 'Lên tới đỉnh Bà Nà cắm cờ rồi! Kể lại điều vừa học nhé.',
    goiY: 'Mở gợi ý để đưa cabin qua trụ cáp tiếp theo an toàn.',
  },
  C5: {
    chao: 'Chào em! Lên vòng quay Sun Wheel chinh phục trọn góc quay nhé.',
    sai: 'Góc quay hơi lệch rồi, kiểm tra lại tâm và cung tròn nhé.',
    saiNhieu: 'Đừng vội nhé! Mình quay từ góc nhỏ trước rồi tăng dần.',
    chuoi: 'Ba góc quay chuẩn liên tiếp! Vòng quay đang lên cao rất đẹp.',
    gameXong: 'Xong vòng quay làm nóng! Em kiểm tra lại chỗ còn ngập ngừng nhé.',
    video: 'Dừng video ở chỗ tính cung tròn để tự ghi nhớ nhé.',
    xong: 'Trọn một vòng quay rực rỡ! Em xứng đáng nhận vé VIP rồi.',
    goiY: 'Xem gợi ý nhỏ để tìm đúng số đo góc quay nhé.',
  },
  C6: {
    chao: 'Chào em! Ghé Cầu Rồng chăm chú rồng lớn dần từng bước nhé.',
    sai: 'Bữa này chưa hợp khẩu vị rồng, thử kiểm tra lại dấu nhé.',
    saiNhieu: 'Chậm lại chút nhé! Cho rồng ăn từng bữa nhỏ dễ trước nào.',
    chuoi: 'Ba bữa liên tiếp thật ngon! Rồng đang vươn mình mạnh mẽ rồi.',
    gameXong: 'Khởi động xong rồi! Xem lại chỗ còn vướng để rồng mau lớn nhé.',
    video: 'Dừng video ở đoạn parabol và Vi-ét để tự thử lại nhé.',
    xong: 'Rồng phun nước rực rỡ rồi! Em nhắc lại một điều vừa học nhé.',
    goiY: 'Mở gợi ý để chọn đúng bữa ăn giúp rồng mau lớn.',
  },
  C7: {
    chao: 'Chào em! Ra biển Mỹ Khê đắp lâu đài cát từ từng xô nhé.',
    sai: 'Xô cát này hơi ướt, kiểm tra lại số liệu và tần số nhé.',
    saiNhieu: 'Bình tĩnh nhé! Đắp nền từng xô cát nhỏ cho thật chắc đã.',
    chuoi: 'Ba xô cát liên tiếp thật chuẩn! Tường lâu đài cao hẳn lên rồi.',
    gameXong: 'Đã xong lượt đắp nền! Em xem lại bảng số liệu còn phân vân nhé.',
    video: 'Dừng video khi gặp biểu đồ mới để tự đọc số liệu nhé.',
    xong: 'Lâu đài cát cắm cờ rồi! Em kể lại điều vừa học nhé.',
    goiY: 'Xem gợi ý để đắp thêm một xô cát thật chắc tay.',
  },
  C8: {
    chao: 'Chào em! Vào rừng Sơn Trà đi từng chặng tìm đàn voọc nhé.',
    sai: 'Nhầm dấu chân rồi, đọc kỹ các kết quả có thể nhé.',
    saiNhieu: 'Mình bước chậm lại nhé! Đếm từng trường hợp đơn giản trước nào.',
    chuoi: 'Qua ba chặng rừng thật nhanh! Đàn voọc ở ngay phía trước rồi.',
    gameXong: 'Hết chặng mở đường rồi! Xem lại chặng còn băn khoăn nhé.',
    video: 'Dừng video ở chỗ tính xác suất để tự đếm lại mẫu nhé.',
    xong: 'Gặp cả đàn voọc rồi! Em thử kể lại một điều vừa học.',
    goiY: 'Mở gợi ý để tìm đúng dấu chân trên chặng rừng này.',
  },
  C9: {
    chao: 'Chào em! Cùng dựng từng nhịp Cầu Vàng trên bàn tay đá nhé.',
    sai: 'Nhịp cầu chưa khớp rồi, kiểm tra lại góc nội tiếp nhé.',
    saiNhieu: 'Thật bình tĩnh nhé! Mình nối từng nhịp đơn giản trước đã.',
    chuoi: 'Nối liền ba nhịp cầu rồi! Cầu Vàng đang dần hoàn thiện.',
    gameXong: 'Khởi động xong nhịp đầu! Xem lại chỗ nối còn phân vân nhé.',
    video: 'Dừng video ở phần tứ giác nội tiếp để tự vẽ hình nhé.',
    xong: 'Cầu Vàng lung linh rồi! Em hãy kể lại điều vừa học nhé.',
    goiY: 'Xem gợi ý nhỏ để lắp đúng nhịp cầu tiếp theo nhé.',
  },
  C10: {
    chao: 'Chào em! Tới Bảo tàng Chăm bóc từng lớp đất tìm cổ vật nhé.',
    sai: 'Lớp đất này hơi lệch công thức, kiểm tra lại bán kính nhé.',
    saiNhieu: 'Nhẹ tay thôi nhé! Mình quét từng lớp đất dễ trước nào.',
    chuoi: 'Bóc chuẩn ba lớp đất liên tiếp! Cổ vật sắp lộ diện rồi.',
    gameXong: 'Xong lượt thăm dò! Em kiểm tra lại kích thước còn phân vân nhé.',
    video: 'Dừng video khi thấy hình trụ, nón, cầu để tự ghi công thức nhé.',
    xong: 'Báu vật vào tủ kính rồi! Em kể lại điều vừa học nhé.',
    goiY: 'Mở gợi ý để bóc đúng lớp đất quanh cổ vật nhé.',
  },
};

export const LOI_CO_VU_CAU_HOI = [
  'Giữ nhịp nhé, em đang tiến lên từng câu!',
  'Hít thở nhẹ rồi đọc kỹ câu tiếp theo nhé.',
  'Tiếp tục nào, mình cùng đi đến đích!',
];
export const LOI_CAU_CUOI = 'Câu cuối rồi! Đọc kỹ và rà soát trước khi nộp nhé.';

export type LoiNhanVat = keyof typeof LOI_NHAN_VAT;

/** Lấy lời thoại theo chương (nếu có trong 8 tình huống × 10 chương); không có thì dùng câu chung. */
export function loiTheoChuong(loi: LoiNhanVat, chuong?: string | null): string {
  const c = maChuong(chuong);
  const khoa: TinhHuongChuong | null =
    loi === 'completion' ? 'xong'
    : (loi === 'chao' || loi === 'sai' || loi === 'saiNhieu' || loi === 'chuoi' || loi === 'gameXong' || loi === 'video' || loi === 'xong' || loi === 'goiY')
      ? loi
      : null;
  if (c && khoa && LOI_THEO_CHUONG[c]?.[khoa]) {
    return LOI_THEO_CHUONG[c][khoa];
  }
  return LOI_NHAN_VAT[loi].noi;
}
