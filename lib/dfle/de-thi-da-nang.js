/**
 * Ý đề tuyển sinh 10 môn Toán Đà Nẵng 2026–2027 (đề chính thức), chép gọn từ
 * content/exam/danang-2026.yaml để GV-17 chọn câu Vận dụng theo chương.
 * Sửa đề → sửa cả hai nơi.
 */
export const DE_DA_NANG_2026 = [
  { cau: '1a', chuong: 3, chuDe: 'tinh-gia-tri-bieu-thuc-can', muc: 1, tomTat: 'Tính √9 − √50 + 5√2 + 3 (đưa thừa số ra ngoài dấu căn)' },
  { cau: '1b', chuong: 7, chuDe: 'doc-bieu-do', muc: 1, tomTat: 'Đọc biểu đồ cột ngang doanh thu du lịch 12 địa phương, đếm, tính tổng, đổi đơn vị' },
  { cau: '1c', chuong: 3, chuDe: 'rut-gon-bieu-thuc', muc: 2, tomTat: 'Rút gọn biểu thức chứa căn có 3 phân thức, mẫu chung x − 4' },
  { cau: '2a', chuong: 6, chuDe: 'do-thi-y-ax2', muc: 2, tomTat: 'Vẽ đồ thị y = x²; tìm điểm có hoành độ √5; tính độ dài OC' },
  { cau: '2b', chuong: 6, chuDe: 'vi-et', muc: 3, tomTat: 'Chứng minh PT bậc hai có 2 nghiệm trái dấu, tính x1/x2 + x2/x1 bằng Vi-ét' },
  { cau: '3a', chuong: 8, chuDe: 'khong-gian-mau', muc: 1, tomTat: 'Mô tả không gian mẫu khi rút 1 thẻ từ 10 thẻ đánh số 1–10' },
  { cau: '3b', chuong: 8, chuDe: 'xac-suat-bien-co', muc: 3, tomTat: 'Xác suất để tổng 9 thẻ còn lại chia hết cho 3' },
  { cau: '4a', chuong: 4, chuDe: 'ti-so-luong-giac-thuc-te', muc: 2, tomTat: 'Góc nhìn xuống 60° từ độ cao 35 m, tính khoảng cách' },
  { cau: '4b', chuong: 5, chuDe: 'dien-tich-hinh-quat', muc: 2, tomTat: 'Diện tích hình quạt bán kính 20 m, góc ở tâm 135°' },
  { cau: '4c', chuong: 10, chuDe: 'the-tich-hinh-tru', muc: 3, tomTat: 'Thể tích bê tông ống cống hình trụ rỗng' },
  { cau: '5a', chuong: 2, chuDe: 'lap-pt-hpt', muc: 2, tomTat: 'Bài toán tuổi – lập phương trình hoặc hệ phương trình' },
  { cau: '5b', chuong: 6, chuDe: 'lap-pt-bac-hai', muc: 3, tomTat: 'Bài toán năng suất – lập phương trình chứa ẩn ở mẫu dẫn tới PT bậc hai' },
  { cau: '6a', chuong: 9, chuDe: 'bon-diem-cung-thuoc-duong-tron', muc: 2, tomTat: 'Chứng minh 4 điểm cùng thuộc một đường tròn' },
  { cau: '6b', chuong: 9, chuDe: 'goc-noi-tiep-dong-dang', muc: 3, tomTat: 'Chứng minh đẳng thức góc và đẳng thức tích (góc nội tiếp, đồng dạng)' },
  { cau: '6c', chuong: 9, chuDe: 'hinh-van-dung-cao', muc: 4, tomTat: 'Chứng minh hai đoạn bằng nhau (đồng dạng + tỉ số lượng giác)' }
];

/** Chọn ý đề cùng chương; bài càng về sau càng chọn ý mức cao hơn. */
export function yDeTheoChuong(chuong, viTriTrongChuong = 0) {
  const ds = DE_DA_NANG_2026.filter((d) => d.chuong === chuong).sort((a, b) => a.muc - b.muc);
  if (!ds.length) return null;
  const y = ds[Math.min(ds.length - 1, viTriTrongChuong)];
  return { cau: `Câu ${y.cau} Đà Nẵng 2026`, tomTat: y.tomTat };
}
