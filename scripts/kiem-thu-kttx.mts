import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import ExcelJS from 'exceljs';
import {
  chuanHoaKetQuaDocKTTX,
  chuanHoaMaLoi,
  chuanHoaTrangThaiKTTX,
  chuyenDeKiemTraSangKhungCau,
  gomNhomLoiKTTX,
  kiemTraChuyenTrangThaiHS,
  kiemTraDiemCauHopLe,
  kiemTraKhopTongDiem,
  lamTronDiem,
  tinhThongKeBaiKTTX,
  tinhThongKeNghienCuuKTTX,
  xacDinhCanKiemTraTay,
  xuatCsvKTTX,
} from '../lib/khkt/kttx.ts';
import {
  chuanHoaTenVN,
  docBangDiemExcel,
  docSoDiemExcel,
  doiChieuBangDiemExcel,
  taoFileMauExcelKTTX,
} from '../lib/khkt/kttxExcel.ts';

// 1. Làm tròn điểm hợp lệ & loại bỏ giá trị âm/NaN
assert.equal(lamTronDiem(7.256), 7.26);
assert.equal(lamTronDiem(-1), null);
assert.equal(lamTronDiem(Number.NaN), null);

// 2. Chuẩn hoá mã lỗi đúng định dạng E-...
assert.equal(chuanHoaMaLoi(' e-can-02 '), 'E-CAN-02');
assert.equal(chuanHoaMaLoi('khong-hop-le'), null);

// 3. Khớp tổng điểm trên bài trong sai số 0.15
const tong1 = kiemTraKhopTongDiem([{ diemDat: 3.5 }, { diemDat: 4.25 }], 7.75);
assert.equal(tong1.khop, true);
assert.equal(tong1.tongTinhDuoc, 7.75);

// 4. Lệch tổng điểm bị phát hiện ngay
const tong2 = kiemTraKhopTongDiem([{ diemDat: 3.5 }, { diemDat: 3.0 }], 7.5);
assert.equal(tong2.khop, false);
assert.equal(tong2.chenhLech, 1);

// 5. Thiếu đối chiếu tổng trên bài vẫn cho khop = true (vì có bài chỉ ghi điểm từng câu)
const tong3 = kiemTraKhopTongDiem([{ diemDat: 8 }], null);
assert.equal(tong3.coTongTrenBai, false);
assert.equal(tong3.khop, true);

// 6. Kiểm tra tay khi AI không tách được câu nào
const ktRong = xacDinhCanKiemTraTay([], null);
assert.equal(ktRong.canKiemTra, true);

// 7. Kiểm tra tay khi có câu độ tin cậy < 0.6
const ktThap = xacDinhCanKiemTraTay(
  [
    {
      soCau: 1,
      noiDungNgan: 'Rút gọn căn',
      kuId: 'C3-B7-M1',
      maLoiGoiY: null,
      diemDat: 2,
      diemToiDa: 2,
      nhanXetGV: '',
      doTinCay: 0.55,
    },
  ],
  2
);
assert.equal(ktThap.canKiemTra, true);
assert.ok(ktThap.lyDo.some((r) => r.includes('0,60')));

// 8. Kiểm tra tay khi điểm đạt > điểm tối đa
const ktVuot = xacDinhCanKiemTraTay(
  [
    {
      soCau: 2,
      noiDungNgan: 'Hệ phương trình',
      kuId: 'C1-B2-M1',
      maLoiGoiY: null,
      diemDat: 3,
      diemToiDa: 2,
      nhanXetGV: '',
      doTinCay: 0.9,
    },
  ],
  3
);
assert.equal(ktVuot.canKiemTra, true);

// 9. Bài rõ chữ, đủ điểm và khớp tổng -> không cần kiểm tra tay
const kqChuan = chuanHoaKetQuaDocKTTX(
  {
    tenBaiGoiY: 'KTTX Chương I',
    ngayThiGoiY: '2026-11-20',
    tongDiemGhiTrenBai: 7.5,
    cacCau: [
      { soCau: 2, diemDat: 2.5, doTinCay: 0.9, maLoiGoiY: 'E-HPT-01', nhanXetGV: 'Sai dấu vế phải' },
      { soCau: 1, diemDat: 5, doTinCay: 0.95, maLoiGoiY: null, nhanXetGV: 'Đúng' },
    ],
  },
  [
    { soCau: 1, kuId: 'C1-B1-M1', diemToiDa: 5, moTa: 'Giải phương trình' },
    { soCau: 2, kuId: 'C1-B2-M2', diemToiDa: 5, errorCode: 'E-HPT-01', moTa: 'Giải hệ' },
  ]
);
assert.equal(kqChuan.cacCau[0].soCau, 1);
assert.equal(kqChuan.tongTinhDuoc, 7.5);
assert.equal(kqChuan.canKiemTraTay, false);

// 10. Gom nhóm lỗi CHỈ lấy câu mất điểm, bỏ qua câu đúng 100% dù khung đề có errorCode mặc định
const nhomLoi = gomNhomLoiKTTX(
  [
    { soCau: 1, noiDungNgan: 'A', kuId: 'C1-B1-M1', maLoiGoiY: 'E-PT-01', diemDat: 5, diemToiDa: 5, nhanXetGV: '', doTinCay: 0.9 },
    { soCau: 2, noiDungNgan: 'B', kuId: 'C1-B2-M2', maLoiGoiY: 'E-HPT-01', diemDat: 2.5, diemToiDa: 5, nhanXetGV: '', doTinCay: 0.9 },
  ],
  [
    { soCau: 1, kuId: 'C1-B1-M1', errorCode: 'E-PT-01', diemToiDa: 5 },
    { soCau: 2, kuId: 'C1-B2-M2', errorCode: 'E-HPT-01', diemToiDa: 5 },
  ]
);
assert.equal(nhomLoi.length, 1);
assert.equal(nhomLoi[0].errorCode, 'E-HPT-01');
assert.deepEqual(nhomLoi[0].soCauList, [2]);

// 11. Nhập khung từ đề kiểm tra (de_kiem_tra.cau_hoi) tổng đúng 10 điểm
const khungDe = chuyenDeKiemTraSangKhungCau([
  { ku_id: 'C1-B1-M1', stem: 'Câu 1', error_by_option: { B: 'E-PT-01' } },
  { ku_id: 'C1-B2-M1', stem: 'Câu 2', error_by_option: { C: 'E-HPT-01' } },
  { ku_id: 'C3-B7-M1', stem: 'Câu 3', error_by_option: { D: 'E-CAN-01' } },
]);
assert.equal(khungDe.length, 3);
assert.equal(Math.round(khungDe.reduce((s, k) => s + k.diemToiDa, 0) * 100) / 100, 10);

// 12. Thống kê lớp: sĩ số, điểm TB, trung vị, top lỗi & tỉ lệ mất điểm theo câu (tương thích cả trạng thái cũ)
const tk = tinhThongKeBaiKTTX(
  [
    {
      student_id: 'HS1',
      trang_thai: 'da-duyet',
      tong_diem: 8,
      can_kiem_tra: false,
      cac_cau: [
        { soCau: 1, noiDungNgan: '', kuId: 'C1-B1-M1', maLoiGoiY: null, diemDat: 5, diemToiDa: 5, nhanXetGV: '', doTinCay: 0.9 },
        { soCau: 2, noiDungNgan: '', kuId: 'C1-B2-M2', maLoiGoiY: 'E-HPT-01', diemDat: 3, diemToiDa: 5, nhanXetGV: '', doTinCay: 0.9 },
      ],
    },
    {
      student_id: 'HS2',
      trang_thai: 'cho-duyet',
      tong_diem: 6,
      can_kiem_tra: true,
      cac_cau: [
        { soCau: 1, noiDungNgan: '', kuId: 'C1-B1-M1', maLoiGoiY: null, diemDat: 5, diemToiDa: 5, nhanXetGV: '', doTinCay: 0.9 },
        { soCau: 2, noiDungNgan: '', kuId: 'C1-B2-M2', maLoiGoiY: 'E-HPT-01', diemDat: 1, diemToiDa: 5, nhanXetGV: '', doTinCay: 0.5 },
      ],
    },
  ],
  4
);
assert.equal(tk.soHsNop, 2);
assert.equal(tk.tiLeNopPct, 50);
assert.equal(tk.choDuyet, 1);
assert.equal(tk.daDuyet, 1);
assert.equal(tk.canKiemTraTay, 1);
assert.equal(tk.diemTB, 7);
assert.equal(tk.diemTrungVi, 7);
assert.equal(tk.topLoi[0].errorCode, 'E-HPT-01');
assert.equal(tk.cauHaySai[0].soCau, 2);
assert.equal(tk.cauHaySai[0].tiLeMatDiemPct, 100);

// 13. Xuất CSV UTF-8 BOM & chặn formula injection
const csv = xuatCsvKTTX('KTTX số 1', [
  {
    student_id: 'HS1',
    ten_hs: '=SUM(A1:A2)',
    trang_thai: 'da-chot',
    tong_diem: 8.5,
    tong_diem_ai: 8.0,
    tong_diem_hs: 8.5,
    tong_diem_excel: 8.5,
    hs_ly_do_bao_sai: '',
    can_kiem_tra: false,
    cac_cau: [{ soCau: 1, noiDungNgan: '', kuId: null, maLoiGoiY: 'E-HPT-01', diemDat: 8.5, diemToiDa: 10, nhanXetGV: '', doTinCay: 0.9 }],
    ngay_nop: '2026-11-25',
  },
]);
assert.ok(csv.startsWith('\uFEFF'));
assert.ok(csv.includes(`'=SUM(A1:A2)`));

// 14 & 15. Xác minh kiến trúc: luồng KTTX chỉ gọi Claude, tuyệt đối không gọi Gemini
const kttxRouteSrc = fs.readFileSync(path.join(process.cwd(), 'app', 'api', 'kttx', 'route.ts'), 'utf8');
assert.ok(!/gemini/i.test(kttxRouteSrc), 'API /api/kttx không được phép nhắc hay gọi Gemini');
const nhaCungCapSrc = fs.readFileSync(path.join(process.cwd(), 'lib', 'ai', 'nhaCungCap.ts'), 'utf8');
const docKttxBlock = nhaCungCapSrc.slice(nhaCungCapSrc.indexOf('export async function docBaiKTTX'));
assert.ok(docKttxBlock.includes('docBaiKTTXClaude'));
assert.ok(!docKttxBlock.includes('Gemini'), 'docBaiKTTX phải dùng riêng Claude API');

// ==================== PHÉP THỬ BỔ SUNG MỤC 5 (EXCEL & LUỒNG 3 BƯỚC) ====================

// 16. Chuẩn hoá tên tiếng Việt (kể cả đ/Đ)
assert.equal(chuanHoaTenVN('  Nguyễn   Đức   Anh  '), 'nguyen duc anh');
assert.equal(chuanHoaTenVN('Trần Thị Đan Vy'), 'tran thi dan vy');

// 17. Đọc điểm Excel hỗ trợ dấu phẩy & từ chối giá trị ngoài thang
assert.deepEqual(docSoDiemExcel('7,5'), { ok: true, diem: 7.5 });
assert.deepEqual(docSoDiemExcel(8.25), { ok: true, diem: 8.25 });
assert.equal(docSoDiemExcel('11,5').ok, false);
assert.equal(docSoDiemExcel('-0,5').ok, false);

// 18. Tạo file mẫu .xlsx và đọc lại hợp lệ
const mauBuf = await taoFileMauExcelKTTX('KTTX Chương I', [
  { student_id: 'HS01', display_name: 'Nguyễn Văn An' },
  { student_id: 'HS02', display_name: 'Trần Đặng Bình' },
]);
const wbCheck = new ExcelJS.Workbook();
await wbCheck.xlsx.load(mauBuf as any);
assert.equal(wbCheck.worksheets[0].getCell('B2').value, 'HS01');
assert.equal(wbCheck.worksheets[0].getCell('D1').value, 'Điểm');

// 19. Đọc file Excel tự tạo có tiêu đề ở dòng 3, dòng trống xen giữa, cột "Mã học sinh" / "Họ tên" / "Điểm KTTX", điểm "7,5"
const wbCustom = new ExcelJS.Workbook();
const wsCustom = wbCustom.addWorksheet('Diem');
wsCustom.addRow(['TRƯỜNG THCS NGUYỄN PHÚ HƯỜNG']);
wsCustom.addRow([]);
wsCustom.addRow(['STT', 'Mã học sinh', 'Họ tên', 'Điểm KTTX']);
wsCustom.addRow([1, 'HS01', 'Bất kỳ tên khác trong Excel', '7,5']);
wsCustom.addRow(['', '', '', '']); // dòng trống
wsCustom.addRow([2, '', 'Trần Đặng Bình', 8.5]); // bỏ trống mã, ghép theo tên có dấu
wsCustom.addRow([3, '', 'le   thi   cuc', '9,25']); // không dấu, nhiều khoảng trắng
wsCustom.addRow([4, 'HS99', 'Học sinh lớp khác', 6]); // không thuộc lớp
const customBuf = Buffer.from(await wbCustom.xlsx.writeBuffer());

const dongDoc = await docBangDiemExcel(customBuf);
assert.equal(dongDoc.length, 4);
assert.equal(dongDoc[0].diem, 7.5);
assert.equal(dongDoc[2].diem, 9.25);

// 20 & 21 & 22 & 23 & 24. Đối chiếu 4 nhóm: ghép mã, ghép tên dấu/không dấu, khớp, lệch, chưa xác nhận/chưa nộp, không ghép được
const dsLop = [
  { student_id: 'HS01', display_name: 'Nguyễn Văn An' },
  { student_id: 'HS02', display_name: 'Trần Đặng Bình' },
  { student_id: 'HS03', display_name: 'Lê Thị Cúc' },
  { student_id: 'HS04', display_name: 'Phạm Minh Dũng' },
];
const baiNop = [
  // HS01: HS đã xác nhận 7.55, Excel 7.5 -> chênh 0.05 <= 0.05 -> Khớp
  { id: 'n1', student_id: 'HS01', trang_thai: 'hs-xac-nhan', tong_diem_ai: 7.0, tong_diem_hs: 7.55 },
  // HS02: HS đã xác nhận 7.0, Excel 8.5 -> Lệch (AI=6.5, HS=7.0, Excel=8.5)
  { id: 'n2', student_id: 'HS02', trang_thai: 'hs-xac-nhan', tong_diem_ai: 6.5, tong_diem_hs: 7.0 },
  // HS03: chưa nộp ảnh nào -> ChuaNopHoacChuaXacNhan (chuaCoAnh=true)
];
const doiChieu = doiChieuBangDiemExcel(dongDoc, dsLop, baiNop);
assert.equal(doiChieu.khop.length, 1);
assert.equal(doiChieu.khop[0].student_id, 'HS01');
assert.equal(doiChieu.lech.length, 1);
assert.equal(doiChieu.lech[0].student_id, 'HS02');
assert.equal(doiChieu.lech[0].diem_ai, 6.5);
assert.equal(doiChieu.lech[0].diem_hs, 7.0);
assert.equal(doiChieu.lech[0].diem_excel, 8.5);
assert.equal(doiChieu.chuaNopHoacChuaXacNhan.length, 1);
assert.equal(doiChieu.chuaNopHoacChuaXacNhan[0].student_id, 'HS03');
assert.equal(doiChieu.chuaNopHoacChuaXacNhan[0].chuaCoAnh, true);
assert.equal(doiChieu.khongGhepDuoc.length, 1);
assert.equal(doiChieu.khongGhepDuoc[0].maHS, 'HS99');

// 25. File quá 60 dòng học sinh -> bị chặn
const wb61 = new ExcelJS.Workbook();
const ws61 = wb61.addWorksheet('Lon');
ws61.addRow(['Mã HS', 'Họ tên', 'Điểm']);
for (let i = 1; i <= 61; i++) ws61.addRow([`HS${i}`, `Học sinh ${i}`, 8]);
const buf61 = Buffer.from(await wb61.xlsx.writeBuffer());
await assert.rejects(() => docBangDiemExcel(buf61), /60/);

// 26. Buffer quá 2 MB -> bị chặn
const bufQuaLon = Buffer.alloc(2 * 1024 * 1024 + 10);
await assert.rejects(() => docBangDiemExcel(bufQuaLon), /2 MB/);

// 27. Chuyển trạng thái không hợp lệ (học sinh sửa bài đã da-chot hoặc da-duyet) -> bị chặn
assert.equal(chuanHoaTrangThaiKTTX('cho-duyet'), 'ai-nhap');
assert.equal(chuanHoaTrangThaiKTTX('da-duyet'), 'da-chot');
assert.equal(kiemTraChuyenTrangThaiHS('da-chot', 'xac-nhan-hs').hopLe, false);
assert.equal(kiemTraChuyenTrangThaiHS('da-duyet', 'cap-nhat-sua').hopLe, false);
assert.equal(kiemTraChuyenTrangThaiHS('hs-xac-nhan', 'xac-nhan-hs').hopLe, true);
assert.equal(kiemTraChuyenTrangThaiHS('ai-nhap', 'bao-sai-hs').hopLe, true);

// 28. Kiểm tra điểm câu vượt quá điểm tối đa -> bị chặn
const kqVuotCau = kiemTraDiemCauHopLe([{ soCau: 1, diemDat: 4.5, diemToiDa: 4 }]);
assert.equal(kqVuotCau.hopLe, false);
const kqDungCau = kiemTraDiemCauHopLe([
  { soCau: 1, diemDat: 4, diemToiDa: 4 },
  { soCau: 2, diemDat: 3.5, diemToiDa: 6 },
]);
assert.equal(kqDungCau.hopLe, true);
assert.equal(kqDungCau.tongTuCong, 7.5);

// 29. 3 chỉ số nghiên cứu KHKT (kèm cỡ mẫu n)
const nc = tinhThongKeNghienCuuKTTX([
  {
    trang_thai: 'da-chot',
    tong_diem_ai: 8.0,
    tong_diem_hs: 8.0,
    tong_diem_excel: 8.0,
    cau_doi_chieu: [
      { diem_ai: 4, diem_chot: 4 },
      { diem_ai: 4, diem_chot: 4 },
    ],
  },
  {
    trang_thai: 'hs-bao-sai',
    tong_diem_ai: 6.0,
    tong_diem_hs: 7.5,
    tong_diem_excel: 7.5,
    hs_ly_do_bao_sai: 'AI cộng thiếu câu 2',
    cau_doi_chieu: [
      { diem_ai: 4, diem_chot: 4 },
      { diem_ai: 2, diem_chot: 3.5 },
    ],
  },
]);
assert.equal(nc.aiTrungExcel.n, 2);
assert.equal(nc.aiTrungExcel.trung, 1);
assert.equal(nc.aiTrungExcel.tiLePct, 50);
assert.equal(nc.aiTrungExcelTheoCau.n, 4);
assert.equal(nc.aiTrungExcelTheoCau.trung, 3);
assert.equal(nc.hsTrungExcel.n, 2);
assert.equal(nc.hsTrungExcel.trung, 2);
assert.equal(nc.hsTrungExcel.tiLePct, 100);
assert.equal(nc.baoSaiDungThat.soBai, 1);
assert.equal(nc.baoSaiDungThat.tongBaoSai, 1);

// 30. Kiểm tra exceljs CHỈ dùng ở máy chủ, không có trong components/
const compKttxDir = path.join(process.cwd(), 'components', 'kttx');
for (const fname of fs.readdirSync(compKttxDir)) {
  if (!fname.endsWith('.ts') && !fname.endsWith('.tsx')) continue;
  const src = fs.readFileSync(path.join(compKttxDir, fname), 'utf8');
  assert.ok(!/from\s+['"]exceljs['"]|kttxExcel/.test(src), `${fname} không được import exceljs xuống trình duyệt`);
}

console.log('kiem-thu-kttx: 30 phép thử đạt.');
