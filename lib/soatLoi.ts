/**
 * ============================================================================
 * THUẬT TOÁN SOÁT LỖI CŨ & ÔN LỖI NGẮT QUÃNG (SPACED REPETITION)
 * ============================================================================
 * Tệp mã nguồn: code/web/lib/soatLoi.ts
 * Vai trò: Giúp học sinh biến "sai sót thành bài học nhớ lâu":
 *   - Khi làm sai, hệ thống ghi vào "Sổ lỗi" của học sinh.
 *   - Lỗi được theo dõi qua 4 trạng thái sư phạm: Cần sửa -> Chờ ôn 1 -> Chờ ôn 2 -> Đã nhớ.
 *   - Mỗi ngày học sinh vào mục Soát lỗi cũ, website tự động chọn tối đa 5 mã lỗi quan trọng nhất.
 *   - Giao câu hỏi mới cùng dạng lỗi, tuyệt đối không hỏi lại đúng câu cũ để tránh học vẹt.
 */

// Định nghĩa 4 trạng thái của một lỗi trong chu trình ghi nhớ
export type TrangThai = 'can-sua' | 'cho-on-1' | 'cho-on-2' | 'da-nho';

// Phân loại nhiệm vụ câu hỏi: 'sua' = câu sửa lỗi ban đầu; 'on-1' = ôn sau 3 ngày; 'on-2' = ôn sau 7 ngày
export type LoaiCau = 'sua' | 'on-1' | 'on-2';

// Cấu trúc dữ liệu ghi nhận thông tin một lỗi của học sinh trong sổ lỗi
export type LoiHS = {
  error_code: string;       // Mã lỗi chuẩn (Ví dụ: 'E-CBH-04' - Bỏ quên dấu giá trị tuyệt đối khi khai căn)
  trang_thai: TrangThai;    // Trạng thái hiện tại trong 4 trạng thái
  han_on: string | null;    // Ngày đến hạn ôn tiếp theo (định dạng YYYY-MM-DD, null nếu đang ở 'can-sua' hoặc 'da-nho')
  so_lan_sai: number;       // Tổng số lần học sinh từng chọn phương án mắc lỗi này
  tai_phat: number;         // Số lần lỗi này bị mắc lại sau khi tưởng như đã thuộc (tái phát)
  lan_sai_cuoi: string;     // Thời điểm gần nhất học sinh mắc lỗi này (dạng chuỗi ISO ngày giờ)
  ku_goc: string | null;    // Mã bài học/đơn vị kiến thức ban đầu phát hiện ra lỗi này
  chu_ky_tu: string;        // Thời điểm bắt đầu chu kỳ khắc phục lỗi hiện tại
};

// Cấu trúc câu hỏi trong ngân hàng đề
export type CauNganHang = { 
  question_id: string;      // Mã định danh duy nhất của câu hỏi
  level: number;            // Mức độ câu hỏi (1: Nhận biết, 2: Thông hiểu, 3: Vận dụng, 4: Vận dụng cao)
  ma: string[]              // Danh sách các mã lỗi được cài cắm ở các phương án nhiễu của câu hỏi này
};

// Cấu trúc câu hỏi được phát ra cho học sinh làm bài soát lỗi
export type CauPhat = { 
  question_id: string;      // Mã câu hỏi được giao
  error_code: string;       // Mã lỗi đang được kiểm tra ở câu này
  loai: LoaiCau             // Nhiệm vụ câu hỏi: sửa lỗi hay ôn tập lần 1 hay ôn tập lần 2
};

// CÁC HẰNG SỐ CỦA THUẬT TOÁN (Được thiết lập dựa trên nghiên cứu khoa học về đường cong lãng quên Ebbinghaus):
export const TOI_DA_MA = 5;   // Mỗi lượt soát lỗi chỉ giao tối đa 5 mã lỗi (để học sinh không bị quá tải)
export const TOI_DA_ON = 3;   // Trong đó ưu tiên tối đa 3 mã lỗi đã đến hạn ôn giãn cách
export const NGAY_ON_1 = 3;   // Khoảng cách ôn lần 1: Sau 3 ngày kể từ khi sửa đúng
export const NGAY_ON_2 = 7;   // Khoảng cách ôn lần 2: Sau 7 ngày kể từ khi ôn lần 1 đúng

// Độ lệch múi giờ Việt Nam: GMT+7 (7 giờ x 3600 giây x 1000 mili-giây)
const VN = 7 * 3600_000;

/** Hàm lấy ngày hiện tại theo giờ Việt Nam dạng chuỗi 'YYYY-MM-DD' */
export function ngayVN(t: number | string | Date = Date.now()): string { 
  return new Date(new Date(t).getTime() + VN).toISOString().slice(0, 10); 
}

/** Hàm cộng thêm n ngày vào một ngày cụ thể (ví dụ: '2026-11-24' + 3 ngày = '2026-11-27') */
export function congNgay(ngay: string, n: number): string { 
  return new Date(Date.parse(ngay + 'T00:00:00Z') + n * 86400_000).toISOString().slice(0, 10); 
}

/**
 * [SỐ HIỆU TT-05: CHỌN MÃ LỖI CHO LƯỢT SOÁT HÔM NAY - TỐI ĐA 5 MÃ]
 * ---------------------------------------------------------------------------
 * Ý tưởng sư phạm: Mỗi ngày mở website, em chỉ cần giải quyết tối đa 5 mã lỗi:
 *   1. Ưu tiên hàng đầu (Tối đa 3 suất): Các lỗi đã ĐẾN HẠN ÔN (Chờ ôn 1, Chờ ôn 2 mà han_on <= hôm nay).
 *      - Lỗi nào quá hạn lâu nhất thì xếp trước (hạn cũ nhất trước).
 *      - Nếu cùng hạn thì lỗi nào từng sai nhiều lần hơn được ưu tiên trước.
 *   2. Các suất còn lại (tối đa 5 - số lỗi ôn): Dành cho các lỗi "CẦN SỬA".
 *      - Ưu tiên lỗi của bài học liền trước mà em vừa học (để củng cố kịp thời).
 *      - Sau đó nhân số lần sai với HỆ SỐ TƯƠI MỚI THEO THỜI GIAN:
 *        + Sai trong vòng 7 ngày gần đây: Hệ số 1.0 (Lỗi còn nóng hổi, ưu tiên cao nhất).
 *        + Sai từ 8 đến 21 ngày trước: Hệ số 0.7 (Lỗi trung bình).
 *        + Sai quá 21 ngày: Hệ số 0.4 (Lỗi đã cũ, giảm ưu tiên).
 * 
 * @param ds: Danh sách toàn bộ các lỗi đang có trong Sổ lỗi của học sinh
 * @param homNay: Ngày hôm nay (theo giờ VN, dạng 'YYYY-MM-DD')
 * @param kuTruoc: Mã bài học liền trước trong chương trình (nếu có)
 * @param now: Thời điểm hiện tại tính bằng mili-giây
 * @returns Danh sách các mã lỗi được chọn kèm phân loại nhiệm vụ ('on-1', 'on-2', hoặc 'sua')
 */
export function chonLoi(
  ds: LoiHS[], 
  homNay: string, 
  kuTruoc: string | null = null, 
  now = Date.now()
): { ma: LoiHS; loai: LoaiCau }[] {
  // Dòng 1: Lọc ra các lỗi đang ở trạng thái 'cho-on-1' hoặc 'cho-on-2' mà ngày hẹn ôn đã đến hoặc đã qua
  const on = ds.filter((l) => (l.trang_thai === 'cho-on-1' || l.trang_thai === 'cho-on-2') && l.han_on != null && l.han_on <= homNay)
    // Dòng 2: Sắp xếp các lỗi đến hạn: Hạn cũ nhất xếp trước -> Số lần sai nhiều hơn xếp trước -> Theo mã lỗi A-Z
    .sort((a, b) => a.han_on!.localeCompare(b.han_on!) || b.so_lan_sai - a.so_lan_sai || a.error_code.localeCompare(b.error_code))
    // Dòng 3: Chỉ lấy tối đa 3 mã lỗi ôn (hằng số TOI_DA_ON = 3)
    .slice(0, TOI_DA_ON);

  // Dòng 4: Hàm tính hệ số thời gian (càng gần đây càng quan trọng: <= 7 ngày là 1.0; 8-21 ngày là 0.7; > 21 ngày là 0.4)
  const heSo = (l: LoiHS) => { 
    const d = (now - Date.parse(l.lan_sai_cuoi)) / 86400_000; 
    return d <= 7 ? 1 : d <= 21 ? 0.7 : 0.4; 
  };

  // Dòng 5: Lọc các lỗi đang ở trạng thái 'can-sua'
  const sua = ds.filter((l) => l.trang_thai === 'can-sua')
    // Dòng 6: Sắp xếp lỗi cần sửa: Lỗi thuộc bài vừa học đứng đầu -> Điểm ưu tiên (số_lần_sai * hệ_số_thời_gian) -> Theo mã A-Z
    .sort((a, b) => Number(b.ku_goc === kuTruoc && !!kuTruoc) - Number(a.ku_goc === kuTruoc && !!kuTruoc)
      || b.so_lan_sai * heSo(b) - a.so_lan_sai * heSo(a) || a.error_code.localeCompare(b.error_code))
    // Dòng 7: Lấy các suất còn lại để tổng số lỗi không vượt quá 5 mã
    .slice(0, TOI_DA_MA - on.length);

  // Dòng 8: Ghép hai danh sách lại và gán nhãn loại câu tương ứng ('on-1', 'on-2', 'sua')
  return [
    ...on.map((ma) => ({ ma, loai: (ma.trang_thai === 'cho-on-1' ? 'on-1' : 'on-2') as LoaiCau })),
    ...sua.map((ma) => ({ ma, loai: 'sua' as LoaiCau }))
  ];
}

/**
 * [SỐ HIỆU TT-06: CHỌN CÂU HỎI NGÂN HÀNG - CHỐNG HỌC VẸT]
 * ---------------------------------------------------------------------------
 * Ý tưởng sư phạm: Chọn câu hỏi thực tế trong kho để giao cho học sinh làm:
 *   - Lỗi "Cần sửa": Giao 2 câu hỏi khác nhau cùng chứa mã lỗi này.
 *   - Lỗi "Chờ ôn 1" hoặc "Chờ ôn 2": Giao 1 câu hỏi mới.
 *   - QUY TẮC CHỐNG HỌC VẸT:
 *     + Tuyệt đối không chọn lại câu hỏi em đã làm trong chu kỳ soát lỗi này (`daDung`).
 *     + Ưu tiên câu em CHƯA TỪNG SAI bao giờ (để kiểm tra xem em có thật sự hiểu bản chất khi gặp câu mới lạ hay không).
 *     + Nếu kho câu hỏi bị thiếu, ghi nhận vào danh sách `thieu` để giáo viên bổ sung ngân hàng đề.
 * 
 * @param chon: Danh sách các mã lỗi đã được chọn ở TT-05
 * @param nganHang: Toàn bộ kho câu hỏi của chương trình
 * @param daDung: Bảng ghi nhận những câu hỏi đã từng phát cho từng mã lỗi trong chu kỳ này
 * @param tungSai: Tập hợp tất cả các câu hỏi mà học sinh từng làm sai trước đây
 * @returns { cau: danh sách câu hỏi được phát, thieu: danh sách mã lỗi bị thiếu câu trong kho }
 */
export function chonCau(
  chon: { ma: LoiHS; loai: LoaiCau }[], 
  nganHang: CauNganHang[], 
  daDung: Record<string, string[]>, 
  tungSai: Set<string>
): { cau: CauPhat[]; thieu: string[] } {
  // Dòng 1: Khởi tạo mảng câu hỏi sẽ phát, danh sách mã thiếu câu, và tập các câu đã lấy trong lượt này
  const cau: CauPhat[] = [], thieu: string[] = [], daLay = new Set<string>();

  // Dòng 2: Lần lượt xét từng mã lỗi trong danh sách đã chọn
  for (const { ma, loai } of chon) {
    // Dòng 3: Nếu là câu sửa lỗi thì cần 2 câu (can = 2), nếu là câu ôn giãn cách thì cần 1 câu (can = 1)
    const can = loai === 'sua' ? 2 : 1;

    // Dòng 4: Lấy tập hợp các câu hỏi đã phát cho mã lỗi này trong chu kỳ hiện tại (tránh lặp câu)
    const dung = new Set(daDung[ma.error_code] ?? []);

    // Dòng 5: Tìm các câu hỏi ứng viên trong ngân hàng thỏa mãn:
    //         - Có chứa mã lỗi này ở phương án nhiễu
    //         - Chưa từng phát trong chu kỳ hiện tại
    //         - Chưa bị lấy trùng bởi một mã lỗi khác trong cùng lượt này
    const ung = nganHang.filter((q) => q.ma.includes(ma.error_code) && !dung.has(q.question_id) && !daLay.has(q.question_id))
      // Dòng 6: Sắp xếp câu ứng viên: Ưu tiên câu học sinh CHƯA TỪNG SAI trước -> Mức độ dễ trước (level 1->4) -> Mã câu A-Z
      .sort((a, b) => Number(tungSai.has(a.question_id)) - Number(tungSai.has(b.question_id)) || a.level - b.level || a.question_id.localeCompare(b.question_id));

    // Dòng 7: Cắt lấy đúng số lượng câu cần thiết (1 hoặc 2 câu)
    const lay = ung.slice(0, can);

    // Dòng 8: Nếu không tìm thấy câu nào phù hợp trong kho, đưa mã lỗi vào danh sách "thiếu" để báo thầy cô
    if (!lay.length) { thieu.push(ma.error_code); continue; }

    // Dòng 9: Thêm các câu đã chọn vào danh sách phát và đánh dấu để không bị trùng
    for (const q of lay) { 
      daLay.add(q.question_id); 
      cau.push({ question_id: q.question_id, error_code: ma.error_code, loai }); 
    }
  }

  // Dòng 10: Trả về kết quả gồm các câu hỏi đã chuẩn bị xong và các mã lỗi cần thầy cô bổ sung đề
  return { cau, thieu };
}

// Cấu trúc kết quả đánh giá sau khi học sinh nộp bài soát lỗi
export type KetQuaMa = { 
  error_code: string; 
  loai: LoaiCau; 
  dung: number; 
  tong: number; 
  danhGia: 'da-khac-phuc' | 'dang-sua' | 'con-mac'; 
  trangThaiMoi: TrangThai; 
  hanMoi: string | null; 
};

/**
 * [SỐ HIỆU TT-03: CHUYỂN TRẠNG THÁI VÀ HẸN GIỜ ÔN GIÃN CÁCH (STATE MACHINE)]
 * ---------------------------------------------------------------------------
 * Ý tưởng sư phạm: Đây là trái tim của thuật toán ôn giãn cách:
 *   - Lỗi 'sua' (cần làm đúng cả 2/2 câu):
 *     + Đúng hết -> Lên 'cho-on-1', đặt hẹn sau 3 NGÀY (NGAY_ON_1).
 *     + Chưa đúng hết -> Vẫn ở 'can-sua', chưa được hẹn ngày ôn.
 *   - Lỗi 'on-1' (ôn lần 1 sau 3 ngày):
 *     + Đúng câu ôn -> Lên 'cho-on-2', đặt hẹn sau 7 NGÀY (NGAY_ON_2) tính từ hôm nay.
 *     + Sai câu ôn -> Kéo tụt lại về 'cho-on-1', hẹn ngay NGÀY HÔM SAU (+1 ngày) để ôn lại ngay khi còn nóng!
 *   - Lỗi 'on-2' (ôn lần 2 sau 7 ngày):
 *     + Đúng câu ôn -> Đạt danh hiệu 'da-nho' (Đã nhớ sau 2 lần ôn), đóng mục lỗi!
 *     + Sai câu ôn -> Kéo tụt lại về 'cho-on-1', hẹn ngay NGÀY HÔM SAU (+1 ngày).
 * 
 * @param error_code: Mã lỗi đang xét
 * @param loai: Nhiệm vụ của câu hỏi ('sua', 'on-1', hay 'on-2')
 * @param dung: Số câu học sinh đã trả lời đúng
 * @param tong: Tổng số câu được giao cho mã lỗi này (1 hoặc 2)
 * @param homNay: Ngày làm bài thực tế của học sinh
 * @returns Trạng thái mới, hạn ôn mới và lời đánh giá sư phạm
 */
export function chuyenTrangThai(
  error_code: string, 
  loai: LoaiCau, 
  dung: number, 
  tong: number, 
  homNay: string
): KetQuaMa {
  // Dòng 1: Kiểm tra xem học sinh có làm đúng toàn bộ số câu được giao hay không
  const het = dung === tong && tong > 0;

  // Dòng 2: Phân loại đánh giá: 'da-khac-phuc' (đúng hết), 'dang-sua' (đúng một phần), 'con-mac' (sai hết)
  const danhGia = het ? 'da-khac-phuc' : dung > 0 ? 'dang-sua' : 'con-mac';

  // Dòng 3: Khai báo biến lưu trạng thái mới và ngày hẹn ôn mới
  let trangThaiMoi: TrangThai, hanMoi: string | null;

  // Dòng 4: Xét trường hợp là câu "Sửa lỗi" ban đầu
  if (loai === 'sua') { 
    trangThaiMoi = het ? 'cho-on-1' : 'can-sua'; 
    hanMoi = het ? congNgay(homNay, NGAY_ON_1) : null; // Đúng hết: hẹn sau 3 ngày; Chưa đúng: chưa hẹn
  } 
  // Dòng 5: Xét trường hợp là câu "Ôn lần 1"
  else if (loai === 'on-1') { 
    trangThaiMoi = het ? 'cho-on-2' : 'cho-on-1'; 
    hanMoi = het ? congNgay(homNay, NGAY_ON_2) : congNgay(homNay, 1); // Đúng: hẹn sau 7 ngày; Sai: hẹn ngày mai ôn lại ngay
  } 
  // Dòng 6: Xét trường hợp là câu "Ôn lần 2"
  else { 
    trangThaiMoi = het ? 'da-nho' : 'cho-on-1'; 
    hanMoi = het ? null : congNgay(homNay, 1); // Đúng: đóng mục lỗi (da-nho); Sai: kéo tụt về ôn 1, hẹn ngày mai
  }

  // Dòng 7: Trả về kết quả hoàn chỉnh để máy chủ cập nhật vào Sổ lỗi của học sinh
  return { error_code, loai, dung, tong, danhGia, trangThaiMoi, hanMoi };
}

/**
 * [SỐ HIỆU TT-04: GHI NHẬN TÁI PHÁT LỖI CŨ KHI LÀM BÀI HỌC THƯỜNG]
 * ---------------------------------------------------------------------------
 * Ý tưởng sư phạm: Khi học sinh đang làm một bài tập bình thường trên lớp:
 *   - Nếu em chọn phương án sai có mã lỗi mà em CHƯA TỪNG MẮC: Tạo mới lỗi ở trạng thái 'can-sua'.
 *   - Nếu em chọn mã lỗi mà em ĐÃ TỪNG ĐẠT 'da-nho': Đây là hiện tượng TÁI PHÁT (quên kiến thức cũ).
 *     Hệ thống tự động kích hoạt lại lỗi về trạng thái 'can-sua', tăng số lần tái phát +1 để thầy cô lưu ý.
 * 
 * @param cu: Dữ liệu lỗi cũ của học sinh trong cơ sở dữ liệu (nếu có)
 * @param soLan: Số lần vừa chọn phương án sai này (mặc định là 1)
 */
export function saiLai(
  cu: Pick<LoiHS, 'trang_thai' | 'so_lan_sai' | 'tai_phat'> | null, 
  soLan = 1
) {
  // Dòng 1: Nếu học sinh chưa từng mắc lỗi này bao giờ, mở mục mới ở trạng thái 'can-sua'
  if (!cu) return { trang_thai: 'can-sua' as TrangThai, so_lan_sai: soLan, tai_phat: 0, moChuKy: true };

  // Dòng 2: Kiểm tra xem lỗi này trước đó đã từng được công nhận là 'da-nho' hay chưa
  const taiPhat = cu.trang_thai === 'da-nho';

  // Dòng 3: Mở lại trạng thái 'can-sua', cộng dồn số lần sai và tăng số lần tái phát nếu có
  return { 
    trang_thai: 'can-sua' as TrangThai, 
    so_lan_sai: cu.so_lan_sai + soLan, 
    tai_phat: cu.tai_phat + (taiPhat ? 1 : 0), 
    moChuKy: cu.trang_thai !== 'can-sua' 
  };
}

// Bảng từ điển hiển thị giao diện thân thiện với học sinh
export const TEN_TRANG_THAI: Record<TrangThai, { ten: string; bieuTuong: string; mau: string; nen: string }> = {
  'can-sua': { ten: 'Cần sửa', bieuTuong: '🪤', mau: '#b3261e', nen: '#fde7e5' },
  'cho-on-1': { ten: 'Chờ ôn lần 1', bieuTuong: '⏳', mau: '#9a5b00', nen: '#ffecd2' },
  'cho-on-2': { ten: 'Chờ ôn lần 2', bieuTuong: '⏳', mau: '#17579c', nen: '#e2eefb' },
  'da-nho': { ten: 'Đã nhớ sau hai lần ôn', bieuTuong: '✅', mau: '#1e7a4b', nen: '#e3f6ea' }
};

export const TEN_DANH_GIA = { 
  'da-khac-phuc': '✅ Đã khắc phục', 
  'dang-sua': '🟡 Đang sửa', 
  'con-mac': '🔴 Còn mắc' 
} as const;
