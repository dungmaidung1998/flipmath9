/**
 * BA MÀN CHÍNH CỦA GIÁO VIÊN — SCREENS GV-15, GV-16, GV-17.
 *
 * Toàn bộ là hàm thuần: nhận dữ liệu đã nạp sẵn, trả kết quả để vẽ. Không đọc
 * cơ sở dữ liệu, không đọc đồng hồ (ngày "hôm nay" truyền vào từ ngoài), nên
 * kiểm thử được bằng số liệu cố định.
 *
 * Quy tắc chung (SCREENS Phần C): mỗi khối tối đa 5 dòng hiển thị, 3 màu
 * trạng thái: 'tot' 🟢 · 'chu-y' 🟠 · 'nguy-co' 🔴.
 */

export const SO_DONG_HIEN = 5;

/** Ngưỡng mặc định. Giáo viên chỉnh ở Cài đặt lớp (GV-13); giá trị lưu ghi đè lên đây. */
export const NGUONG_MAC_DINH = Object.freeze({
  // GV-15
  tienBoRo: 0.8,          // HS khắc phục ≥ 80% lỗi → 🚀
  coTienBo: 0.4,          // 40–79% → ➡ ; dưới 40% hoặc tái phạm → ⚠
  giamTot: 0.6,           // số HS mắc giảm ≥ 60% → 🟢
  giamChuY: 0.3,          // giảm 30–59% → 🟠 ; dưới 30% → 🔴
  tiLeDaiDien: 0.5,       // dưới 50% HS làm soát → băng vàng
  // GV-16 khối B
  soKyNangHong: 3,
  tiLeNenBaiSapDay: 0.5,
  // GV-16 khối C
  videoToiThieu: 0.5,
  soBaiChuaLam: 2,
  giayMoiCau: 15,
  diemDoanBua: 5,
  soNgayVang: 3,
  soNgayXet: 14,
  // GV-17
  diemNhomSao: 8,
  diemNhomMam: 5,
  tiLeHongMoDau: 0.3,
  tiLeCauSai: 0.4,
  tiLeDaChuanBi: 0.5
});

/** Gộp ngưỡng giáo viên đã lưu với mặc định; bỏ qua giá trị không phải số. */
export function hopNhatNguong(daLuu) {
  const kq = { ...NGUONG_MAC_DINH };
  for (const [k, v] of Object.entries(daLuu ?? {})) {
    if (k in kq && typeof v === 'number' && Number.isFinite(v)) kq[k] = v;
  }
  return kq;
}

/* ------------------------------------------------------------------ GV-15 */

/**
 * Trạng thái một lỗi của một HS sau tiết, từ các câu soát (câu có phương án sai
 * gắn đúng mã lỗi đó), theo thời gian tăng dần.
 * Xét 2 câu gần nhất: đúng cả 2 → khắc phục; đúng 1 → đang sửa; sai cả → còn mắc.
 * Đã từng đúng rồi lại chọn đúng phương án lỗi ấy → tái phạm (tính là còn mắc).
 * @param {{dung:boolean, chonLoi?:boolean}[]} cau
 * @returns {'khac-phuc'|'dang-sua'|'con-mac'|null}
 */
export function trangThaiLoi(cau) {
  if (!cau?.length) return null;
  const cuoi = cau.slice(-2);
  const soDung = cuoi.filter((c) => c.dung).length;
  if (soDung === cuoi.length && cuoi.length >= 2) return 'khac-phuc';
  if (soDung > 0) return 'dang-sua';
  return 'con-mac';
}

function taiPham(cau) {
  let daDung = false;
  for (const c of cau) {
    if (c.dung) daDung = true;
    else if (daDung && c.chonLoi) return true;
  }
  return false;
}

function mauGiam(truoc, sau, n) {
  if (!truoc) return 'tot';
  const giam = (truoc - sau) / truoc;
  if (giam >= n.giamTot) return 'tot';
  if (giam >= n.giamChuY) return 'chu-y';
  return 'nguy-co';
}

/**
 * GV-15 Tiến bộ sau tiết trước.
 * @param {object} p
 * @param {{id:string, ten:string}[]} p.hocSinh
 * @param {{sid:string, code:string}[]} p.loiTruoc   lỗi HS mắc ở bài trước (mỗi cặp một lần)
 * @param {{sid:string, code:string, dung:boolean, chonLoi?:boolean, ts:string}[]} p.bangChungSau
 *        câu soát làm SAU tiết dạy bài trước, mỗi dòng ứng với một mã lỗi được câu đó kiểm tra
 * @param {Record<string,string>} [p.tenLoi]
 * @param {number|null} [p.tiLeLanTruoc]   tỉ lệ khắc phục lần soát trước (để vẽ ▲▼)
 * @param {object} [p.nguong]
 */
export function tinhTienBo({ hocSinh, loiTruoc, bangChungSau, tenLoi = {}, tiLeLanTruoc = null, nguong }) {
  const n = hopNhatNguong(nguong);
  const ten = new Map(hocSinh.map((h) => [h.id, h.ten]));
  const cauTheoCap = new Map();
  for (const b of [...bangChungSau].sort((a, b) => String(a.ts).localeCompare(String(b.ts)))) {
    const k = `${b.sid}|${b.code}`;
    if (!cauTheoCap.has(k)) cauTheoCap.set(k, []);
    cauTheoCap.get(k).push(b);
  }

  const capDaXet = new Set();
  const theoHS = new Map();   // sid → {xet, khacPhuc, taiPham}
  const theoLoi = new Map();  // code → {truoc:Set, conMac:Set, dangSua:Set, khacPhuc:Set}
  for (const { sid, code } of loiTruoc) {
    const k = `${sid}|${code}`;
    if (capDaXet.has(k) || !ten.has(sid)) continue;
    capDaXet.add(k);
    const cau = cauTheoCap.get(k) ?? [];
    const tt = trangThaiLoi(cau);
    if (!tt) continue;
    const tp = taiPham(cau);
    const trangThai = tp ? 'con-mac' : tt;
    const hs = theoHS.get(sid) ?? { xet: 0, khacPhuc: 0, taiPham: false };
    hs.xet += 1;
    if (trangThai === 'khac-phuc') hs.khacPhuc += 1;
    if (tp) hs.taiPham = true;
    theoHS.set(sid, hs);
    const l = theoLoi.get(code) ?? { truoc: new Set(), conMac: new Set(), dangSua: new Set(), khacPhuc: new Set() };
    l.truoc.add(sid);
    if (trangThai === 'con-mac') l.conMac.add(sid);
    else if (trangThai === 'dang-sua') l.dangSua.add(sid);
    else l.khacPhuc.add(sid);
    theoLoi.set(code, l);
  }

  // HS có lỗi ở bài trước nhưng chưa có câu soát nào → "chưa làm soát lỗi cũ".
  const coLoiTruoc = new Set(loiTruoc.map((l) => l.sid).filter((s) => ten.has(s)));
  const chuaSoat = [...coLoiTruoc].filter((s) => !theoHS.has(s));

  let tong = 0, khac = 0;
  for (const h of theoHS.values()) { tong += h.xet; khac += h.khacPhuc; }
  const tiLe = tong ? khac / tong : null;

  const loi = [...theoLoi.entries()].map(([code, l]) => {
    const sauSet = new Set([...l.conMac, ...l.dangSua]);
    return {
      code,
      ten: tenLoi[code] ?? code,
      truoc: l.truoc.size,
      sau: sauSet.size,
      mau: mauGiam(l.truoc.size, sauSet.size, n),
      hsConMac: [...sauSet].map((id) => ({ id, ten: ten.get(id) ?? id, trangThai: l.conMac.has(id) ? 'con-mac' : 'dang-sua' }))
    };
  }).sort((a, b) => b.sau - a.sau || b.truoc - a.truoc || a.code.localeCompare(b.code));

  const nhom = { ro: [], co: [], chua: [] };
  for (const [sid, h] of theoHS) {
    const r = h.xet ? h.khacPhuc / h.xet : 0;
    const muc = { id: sid, ten: ten.get(sid) ?? sid, tiLe: r, taiPham: h.taiPham };
    if (h.taiPham || r < n.coTienBo) nhom.chua.push(muc);
    else if (r >= n.tienBoRo) nhom.ro.push(muc);
    else nhom.co.push(muc);
  }
  for (const k of Object.keys(nhom)) nhom[k].sort((a, b) => a.tiLe - b.tiLe || a.ten.localeCompare(b.ten, 'vi'));

  const daSoat = theoHS.size;
  const coSo = daSoat + chuaSoat.length;
  return {
    tiLe,
    tiLeLanTruoc,
    chenhLech: tiLe != null && tiLeLanTruoc != null ? Math.round((tiLe - tiLeLanTruoc) * 100) : null,
    daSoat,
    chuaSoat: chuaSoat.map((id) => ({ id, ten: ten.get(id) ?? id })),
    coSo,
    duDaiDien: coSo === 0 ? true : daSoat / coSo >= n.tiLeDaiDien,
    loi,
    nhom,
    soLoiConMac: loi.filter((l) => l.sau > 0).length
  };
}

/* ------------------------------------------------------------------ GV-16 */

const THU_TU_DAU_HIEU = ['video', 'chuaLam', 'doanBua', 'vang'];

/**
 * Các dấu hiệu "học chưa chăm" của một HS. Trả [] nếu không có dấu hiệu nào.
 * @param {{videoPct:number|null, soBaiChuaLam:number, giayMoiCau:number|null,
 *          diemTB:number|null, soNgayVang:number|null, coBaiMo:boolean}} h
 */
export function dauHieuChuaCham(h, nguong) {
  const n = hopNhatNguong(nguong);
  const ds = [];
  if (h.videoPct != null && h.videoPct < n.videoToiThieu) {
    ds.push({ loai: 'video', giaTri: h.videoPct, nhan: `video ${Math.round(h.videoPct * 100)}%` });
  }
  if ((h.soBaiChuaLam ?? 0) >= n.soBaiChuaLam) {
    ds.push({ loai: 'chuaLam', giaTri: h.soBaiChuaLam, nhan: `chưa làm ${h.soBaiChuaLam} bài` });
  }
  if (h.giayMoiCau != null && h.diemTB != null && h.giayMoiCau < n.giayMoiCau && h.diemTB < n.diemDoanBua) {
    ds.push({ loai: 'doanBua', giaTri: h.giayMoiCau, nhan: `phiếu ${Math.round(h.giayMoiCau)}"/câu, ${h.diemTB.toFixed(1).replace('.', ',')} điểm` });
  }
  if (h.coBaiMo && h.soNgayVang != null && h.soNgayVang >= n.soNgayVang) {
    ds.push({ loai: 'vang', giaTri: h.soNgayVang, nhan: `${h.soNgayVang} ngày chưa vào web` });
  }
  return ds.sort((a, b) => THU_TU_DAU_HIEU.indexOf(a.loai) - THU_TU_DAU_HIEU.indexOf(b.loai));
}

/** Lời nhắc mặc định, viết theo dấu hiệu nặng nhất. GV sửa được trước khi gửi. */
export function loiNhacMacDinh(dauHieu, tenBai) {
  const bai = tenBai ? ` ${tenBai}` : '';
  switch (dauHieu?.loai) {
    case 'video': return `Thầy/cô thấy em chưa xem hết video${bai}, em xem nốt nhé!`;
    case 'chuaLam': return 'Em còn vài bài chuẩn bị chưa làm, em dành chút thời gian hoàn thành nhé!';
    case 'doanBua': return 'Em làm phiếu hơi nhanh, lần sau em đọc kĩ từng câu rồi hãy chọn nhé!';
    case 'vang': return `Mấy hôm nay em chưa vào học${bai}. Em vào xem bài mới nhé!`;
    default: return 'Thầy/cô nhắc em hoàn thành phần chuẩn bị trước giờ học nhé!';
  }
}

/**
 * GV-16 Thống kê cần chú ý — 3 khối.
 * @param {object} p
 * @param {{id:string, ten:string}[]} p.hocSinh
 * @param {{sid:string, code:string}[]} p.loiTrongPhamVi   mọi lần mắc lỗi trong phạm vi (có thể lặp)
 * @param {{id:string, ten:string, soBaiDung:number}[]} p.kyNangNen  kỹ năng nền của chương
 * @param {string[]} p.nenBaiSapDay   id kỹ năng nền của bài sắp dạy
 * @param {{sid:string, kn:string}[]} p.hong   cặp HS – kỹ năng nền ở mức Hổng
 * @param {Record<string, object>} p.hocTap   sid → số liệu học tập (xem dauHieuChuaCham)
 * @param {string[]} [p.boQua]   HS giáo viên đã bấm "Bỏ qua lần này"
 */
export function tinhCanChuY({ hocSinh, loiTrongPhamVi, kyNangNen, nenBaiSapDay, hong, hocTap, tenLoi = {}, boQua = [], nguong }) {
  const n = hopNhatNguong(nguong);
  const ten = new Map(hocSinh.map((h) => [h.id, h.ten]));

  // A — đếm theo số HS, không theo số lượt
  const hsTheoLoi = new Map();
  for (const { sid, code } of loiTrongPhamVi) {
    if (!ten.has(sid) || !code) continue;
    if (!hsTheoLoi.has(code)) hsTheoLoi.set(code, new Set());
    hsTheoLoi.get(code).add(sid);
  }
  const A = [...hsTheoLoi.entries()]
    .map(([code, s]) => ({ code, ten: tenLoi[code] ?? code, soHS: s.size, hs: [...s].map((id) => ({ id, ten: ten.get(id) ?? id })) }))
    .sort((a, b) => b.soHS - a.soHS || a.code.localeCompare(b.code));

  // B — hổng nền
  const kn = new Map(kyNangNen.map((k) => [k.id, k]));
  const hongTheoHS = new Map();
  for (const { sid, kn: k } of hong) {
    if (!ten.has(sid) || !kn.has(k)) continue;
    if (!hongTheoHS.has(sid)) hongTheoHS.set(sid, new Set());
    hongTheoHS.get(sid).add(k);
  }
  const nenBai = new Set(nenBaiSapDay.filter((k) => kn.has(k)));
  const B = [];
  for (const [sid, ks] of hongTheoHS) {
    const hongBai = [...ks].filter((k) => nenBai.has(k)).length;
    const theoChuong = ks.size >= n.soKyNangHong;
    const theoBai = nenBai.size > 0 && hongBai / nenBai.size >= n.tiLeNenBaiSapDay;
    if (!theoChuong && !theoBai) continue;
    const quanTrong = [...ks].map((k) => kn.get(k)).sort((a, b) => b.soBaiDung - a.soBaiDung || a.ten.localeCompare(b.ten, 'vi'));
    B.push({ id: sid, ten: ten.get(sid) ?? sid, soHong: ks.size, hongBai, kyNang: quanTrong.slice(0, 2).map((k) => k.ten), tatCa: quanTrong.map((k) => k.ten) });
  }

  // C — học chưa chăm
  const bo = new Set(boQua);
  const C = [];
  for (const h of hocSinh) {
    if (bo.has(h.id) || !hocTap[h.id]) continue;
    const dh = dauHieuChuaCham(hocTap[h.id], n);
    if (dh.length) C.push({ id: h.id, ten: h.ten, dauHieu: dh, nangNhat: dh[0] });
  }

  // HS ở cả B và C → ⚠, lên đầu cả hai khối
  const trongB = new Set(B.map((b) => b.id));
  const ca2 = new Set(C.filter((c) => trongB.has(c.id)).map((c) => c.id));
  for (const b of B) b.ca2 = ca2.has(b.id);
  for (const c of C) c.ca2 = ca2.has(c.id);
  B.sort((a, b) => Number(b.ca2) - Number(a.ca2) || b.soHong - a.soHong || a.ten.localeCompare(b.ten, 'vi'));
  C.sort((a, b) => Number(b.ca2) - Number(a.ca2) || b.dauHieu.length - a.dauHieu.length
    || THU_TU_DAU_HIEU.indexOf(a.nangNhat.loai) - THU_TU_DAU_HIEU.indexOf(b.nangNhat.loai)
    || (a.nangNhat.loai === 'video' ? a.nangNhat.giaTri - b.nangNhat.giaTri : b.nangNhat.giaTri - a.nangNhat.giaTri)
    || a.ten.localeCompare(b.ten, 'vi'));

  // tỉ lệ lớp hổng từng kỹ năng nền (dùng ở GV-17)
  const siSo = hocSinh.length || 1;
  const tiLeHong = kyNangNen.map((k) => ({
    id: k.id, ten: k.ten,
    tiLe: hong.filter((x) => x.kn === k.id && ten.has(x.sid)).length / siSo,
    cuaBaiSapDay: nenBai.has(k.id)
  })).sort((a, b) => b.tiLe - a.tiLe);

  return { A, B, C, ca2: [...ca2], tiLeHong };
}

/* ------------------------------------------------------------------ GV-17 */

export const TONG_PHUT = 45;

const KHUNG = {
  'mo-dau': { ten: 'Mở đầu', min: 5, max: 8, phut: 7 },
  'giai-dap': { ten: 'Giải đáp & chốt kiến thức', min: 8, max: 12, phut: 10 },
  'luyen-tap': { ten: 'Luyện tập phân hoá', min: 15, max: 20, phut: 20 },
  'van-dung': { ten: 'Vận dụng & giao nhiệm vụ', min: 5, max: 8, phut: 8 }
};

const pt = (x) => `${Math.round(x * 100)}%`;

function nhomPhanHoa({ hocSinh, diemPhieu, B, hongAny, n }) {
  const trongB = new Set(B.map((b) => b.id));
  const sao = [], choi = [], mam = [];
  for (const h of hocSinh) {
    const d = diemPhieu[h.id];
    const muc = { id: h.id, ten: h.ten, diem: d ?? null };
    if (trongB.has(h.id) || (d != null && d < n.diemNhomMam)) mam.push(muc);
    else if (d != null && d >= n.diemNhomSao && !hongAny.has(h.id)) sao.push(muc);
    else choi.push(muc);
  }
  const theoDiem = (a, b) => (b.diem ?? -1) - (a.diem ?? -1) || a.ten.localeCompare(b.ten, 'vi');
  sao.sort(theoDiem); choi.sort(theoDiem); mam.sort((a, b) => -theoDiem(a, b));
  const ghepCap = mam.length && sao.length ? mam.map((m, i) => ({ kem: sao[i % sao.length], duocKem: m })) : [];
  return { sao, choi, mam, ghepCap };
}

/**
 * GV-17 Gợi ý 4 hoạt động cho tiết dạy bài mới (bản theo quy tắc, chưa dùng AI).
 * @param {object} p
 * @param {ReturnType<typeof tinhTienBo>} p.tienBo
 * @param {ReturnType<typeof tinhCanChuY>} p.canChuY
 * @param {{id:string, ten:string}[]} p.hocSinh
 * @param {number} p.soDaChuanBi
 * @param {Record<string, number>} p.diemPhieu   sid → điểm phiếu bài sắp dạy (thang 10)
 * @param {{so:number, ma:string, tiLeSai:number, noiDung:string}[]} p.cauSai
 * @param {{muc:string, tu:number, den:number, soHS:number}[]} p.doanXemLai
 * @param {string[]} p.cauHoiHS
 * @param {{cau:string, tomTat:string}|null} p.deThi
 * @param {{ten:string, mo?:string|null, han?:string|null}|null} p.baiSau
 * @param {string[]} [p.loiDuaVao]   mã lỗi GV bấm "Đưa vào tiết dạy" ở GV-15
 * @param {Record<string,string>} [p.tenLoi]
 * @param {string} p.tenBai
 */
export function goiYTiet(p) {
  const n = hopNhatNguong(p.nguong);
  const { tienBo, canChuY, hocSinh } = p;
  const siSo = hocSinh.length;
  const tenLoi = p.tenLoi ?? {};
  const daChuanBi = siSo ? p.soDaChuanBi / siSo : 0;
  const canhBao = [];
  if (siSo && daChuanBi < n.tiLeDaChuanBi) {
    canhBao.push(`Mới ${p.soDaChuanBi}/${siSo} HS chuẩn bị bài (dưới ${pt(n.tiLeDaChuanBi)}).`);
  }

  // ① Mở đầu
  const loiConMac = tienBo?.loi?.filter((l) => l.sau > 0) ?? [];
  const daChon = (p.loiDuaVao ?? []).map((code) => loiConMac.find((l) => l.code === code)
    ?? { code, ten: tenLoi[code] ?? code, sau: null });
  const loiMoDau = daChon.length ? daChon : loiConMac.slice(0, 1);
  const nenYeu = (canChuY?.tiLeHong ?? []).filter((k) => k.cuaBaiSapDay && k.tiLe >= n.tiLeHongMoDau).slice(0, 1);
  const moDau = { noiDung: [], viSao: [] };
  if (siSo && daChuanBi < n.tiLeDaChuanBi) {
    moDau.noiDung.push('Cho HS chưa chuẩn bị xem nhanh tóm tắt video 5 phút, HS đã chuẩn bị làm 2 câu khởi động.');
    moDau.viSao.push(`chỉ ${p.soDaChuanBi}/${siSo} HS đã chuẩn bị`);
  }
  for (const l of loiMoDau) {
    moDau.noiDung.push(`Chữa nhanh lỗi "${l.ten}" bằng 1 câu đúng/sai trên bảng.`);
    moDau.viSao.push(l.sau != null ? `${l.sau} HS còn mắc sau soát lỗi${daChon.includes(l) ? ' · GV chọn đưa vào tiết' : ' · lỗi còn mắc nhiều nhất'}` : 'GV chọn đưa vào tiết');
  }
  for (const k of nenYeu) {
    moDau.noiDung.push(`Ôn nhanh "${k.ten}".`);
    moDau.viSao.push(`${pt(k.tiLe)} lớp hổng · kiến thức nền của bài`);
  }
  if (!moDau.noiDung.length) {
    moDau.noiDung.push(`Câu hỏi khởi động gắn tình huống thực tế dẫn vào ${p.tenBai}.`);
    moDau.viSao.push('chưa có lỗi còn mắc hay kiến thức nền yếu nổi bật');
  }

  // ② Giải đáp & chốt kiến thức — không giảng lại toàn bài
  const giaiDap = { noiDung: [], viSao: [] };
  const doan = (p.doanXemLai ?? []).slice(0, 1);
  for (const d of doan) {
    giaiDap.noiDung.push(`Giảng lại đoạn ${phutGiay(d.tu)}–${phutGiay(d.den)} video "${d.muc}".`);
    giaiDap.viSao.push(`${d.soHS} HS xem lại đoạn này`);
  }
  const sai = (p.cauSai ?? []).filter((c) => c.tiLeSai > n.tiLeCauSai).sort((a, b) => b.tiLeSai - a.tiLeSai).slice(0, 2);
  for (const c of sai) {
    giaiDap.noiDung.push(`Chữa câu ${c.so} phiếu ${c.ma}: ${c.noiDung}`);
    giaiDap.viSao.push(`câu ${c.so} sai ${pt(c.tiLeSai)}`);
  }
  const cauHoi = [...new Set((p.cauHoiHS ?? []).map((s) => s.trim()).filter(Boolean))].slice(0, 3);
  if (cauHoi.length) {
    giaiDap.noiDung.push(`Trả lời ${cauHoi.length} câu hỏi HS gửi: ${cauHoi.map((c) => `"${c}"`).join('; ')}.`);
    giaiDap.viSao.push(`${(p.cauHoiHS ?? []).length} câu hỏi HS mang lên lớp`);
  }
  if (!giaiDap.noiDung.length) {
    giaiDap.noiDung.push('Chốt quy tắc chính của bài bằng 1 ví dụ mẫu, HS tự nêu lại.');
    giaiDap.viSao.push('chưa có câu phiếu sai trên ' + pt(n.tiLeCauSai) + ' hay đoạn video xem lại nhiều');
  }

  // ③ Luyện tập phân hoá
  const hongAny = new Set((canChuY?.B ?? []).map((b) => b.id));
  const nhom = nhomPhanHoa({ hocSinh, diemPhieu: p.diemPhieu ?? {}, B: canChuY?.B ?? [], hongAny, n });
  const luyenTap = {
    noiDung: [
      `Nhóm ⭐ (${nhom.sao.length} HS): câu cấp Đại Thụ – Đỉnh Sao, dạng đề Đà Nẵng${nhom.ghepCap.length ? ' + làm "trợ giảng" cho nhóm 🌱' : ''}.`,
      `Nhóm 🌿 (${nhom.choi.length} HS): câu cấp Chồi Xanh → Đại Thụ.`,
      `Nhóm 🌱 (${nhom.mam.length} HS): GV kèm, phiếu có bước gợi ý.`
    ],
    viSao: [`⭐ phiếu ≥ ${n.diemNhomSao} và không hổng nền · 🌱 hổng nền hoặc phiếu < ${n.diemNhomMam}`]
  };

  // ④ Vận dụng & giao nhiệm vụ
  const vanDung = { noiDung: [], viSao: [] };
  if (p.deThi) {
    vanDung.noiDung.push(`Câu dạng đề thi vào 10 (${p.deThi.cau}): ${p.deThi.tomTat}.`);
    vanDung.viSao.push('ý đề thi Đà Nẵng cùng chủ đề với bài');
  } else {
    vanDung.noiDung.push('1 bài toán thực tế vận dụng kiến thức vừa học.');
  }
  if (p.baiSau) {
    const moc = [p.baiSau.mo && `mở ${p.baiSau.mo}`, p.baiSau.han && `hạn ${p.baiSau.han}`].filter(Boolean).join(', ');
    vanDung.noiDung.push(`Dặn: chuẩn bị ${p.baiSau.ten}${moc ? ` (${moc})` : ''}.`);
  }
  const canNhac = canChuY?.C ?? [];
  if (canNhac.length) {
    vanDung.noiDung.push(`Nhắc riêng ${canNhac.length} HS hoàn thành phần chuẩn bị.`);
    vanDung.viSao.push(`${canNhac.length} HS có dấu hiệu chưa chăm (chỉ GV thấy)`);
  }

  const noiDung = { 'mo-dau': moDau, 'giai-dap': giaiDap, 'luyen-tap': luyenTap, 'van-dung': vanDung };
  const hoatDong = Object.entries(KHUNG).map(([id, k]) => ({
    id, ten: k.ten, phut: k.phut, min: k.min, max: k.max,
    noiDung: noiDung[id].noiDung, viSao: noiDung[id].viSao, trangThai: 'goi-y'
  }));
  return { hoatDong, nhom, canhBao, siSo, soDaChuanBi: p.soDaChuanBi };
}

function phutGiay(s) {
  const t = Math.max(0, Math.round(s));
  return `${Math.floor(t / 60)}:${String(t % 60).padStart(2, '0')}`;
}

/**
 * Cân lại thời lượng cho đủ tổng 45'. Hoạt động bị bỏ không tính; hoạt động GV
 * đã tự sửa số phút (coDinh) giữ nguyên; phần còn lại chia theo tỉ lệ thời lượng
 * gợi ý, trong khoảng [min, max]. Thừa/thiếu sau cùng dồn vào hoạt động còn
 * nhiều chỗ nhất (ưu tiên Luyện tập).
 * @param {{id:string, phut:number, min:number, max:number, bo?:boolean, coDinh?:boolean}[]} ds
 */
export function canLaiThoiGian(ds, tong = TONG_PHUT) {
  const kq = ds.map((h) => ({ ...h }));
  const dung = kq.filter((h) => !h.bo);
  const coDinh = dung.filter((h) => h.coDinh);
  const tuDo = dung.filter((h) => !h.coDinh);
  for (const h of kq) if (h.bo) h.phut = 0;
  const conLai = tong - coDinh.reduce((s, h) => s + h.phut, 0);
  if (!tuDo.length) return { ds: kq, tong: tong - conLai, lech: conLai };
  const goc = tuDo.reduce((s, h) => s + (h.phutGoiY ?? h.phut ?? 1), 0) || 1;
  for (const h of tuDo) {
    const w = (h.phutGoiY ?? h.phut ?? 1) / goc;
    h.phut = Math.max(1, Math.round(conLai * w));
  }
  // kẹp vào [min, max] rồi dồn phần lệch
  for (const h of tuDo) h.phut = Math.min(h.max, Math.max(h.min, h.phut));
  let lech = conLai - tuDo.reduce((s, h) => s + h.phut, 0);
  const uuTien = [...tuDo].sort((a, b) => (b.id === 'luyen-tap') - (a.id === 'luyen-tap') || (b.max - b.min) - (a.max - a.min));
  for (const h of uuTien) {
    if (!lech) break;
    if (lech > 0) { const them = Math.min(lech, h.max - h.phut); h.phut += them; lech -= them; }
    else { const bot = Math.min(-lech, h.phut - h.min); h.phut -= bot; lech += bot; }
  }
  // vẫn lệch (vd. GV bỏ 2 hoạt động) → vượt khoảng gợi ý ở Luyện tập/hoạt động đầu
  if (lech) {
    const h = uuTien[0];
    h.phut = Math.max(1, h.phut + lech);
    lech = 0;
  }
  const tongMoi = dung.reduce((s, h) => s + h.phut, 0);
  return { ds: kq, tong: tongMoi, lech: tong - tongMoi };
}

/* ------------------------------------------------------- tiện ích dùng chung */

/**
 * Kỹ năng nền tạm tính khi chưa có danh mục NEN-*: mỗi mục (đơn vị kiến thức)
 * đã học trước bài sắp dạy trong cùng chương là một "kỹ năng nền".
 * soBaiDung = số mục sau nó (tới hết chương) phụ thuộc vào nó qua chuỗi tiên quyết.
 * @param {{ku_id:string, ku_name:string, lesson_id:string, order:number, prerequisite:string|null}[]} units  cùng chương, đã sắp
 * @param {string} baiSapDay   lesson_id
 */
export function kyNangNenTamTinh(units, baiSapDay) {
  const thuTu = [...units].sort((a, b) => a.order - b.order);
  const dauBai = thuTu.findIndex((u) => u.lesson_id === baiSapDay);
  const truoc = dauBai < 0 ? [] : thuTu.slice(0, dauBai);
  const cha = new Map(thuTu.map((u) => [u.ku_id, u.prerequisite]));
  const toTien = (id) => { const s = new Set(); let x = cha.get(id); while (x && !s.has(x)) { s.add(x); x = cha.get(x); } return s; };
  const kyNang = truoc.map((u) => ({
    id: u.ku_id,
    ten: u.ku_name.replace(/^Mục \d+\.\s*/, ''),
    soBaiDung: thuTu.filter((v) => v.order > u.order && toTien(v.ku_id).has(u.ku_id)).length
  }));
  const nenBai = new Set();
  for (const u of thuTu.filter((u) => u.lesson_id === baiSapDay)) {
    for (const t of toTien(u.ku_id)) if (truoc.some((x) => x.ku_id === t)) nenBai.add(t);
  }
  // Bài đầu chương: nền là mục liền trước nếu có trong danh sách
  return { kyNang, nenBaiSapDay: [...nenBai] };
}

/**
 * Đoạn video bị xem lại nhiều: gom các lần tua lùi theo cửa sổ 30 giây,
 * đếm số HS khác nhau, trả đoạn đông nhất trước.
 * @param {{sid:string, muc:string, tu:number, den:number}[]} lanTuaLai  (tu < den: đoạn được xem lại)
 */
export function doanXemLaiNhieu(lanTuaLai, cuaSo = 30) {
  const nhom = new Map();
  for (const x of lanTuaLai) {
    if (!(x.den > x.tu)) continue;
    const dau = Math.floor(x.tu / cuaSo) * cuaSo;
    const k = `${x.muc}|${dau}`;
    const g = nhom.get(k) ?? { muc: x.muc, tu: dau, den: dau + cuaSo, hs: new Set() };
    g.den = Math.max(g.den, Math.min(x.den, dau + 3 * cuaSo));
    g.hs.add(x.sid);
    nhom.set(k, g);
  }
  return [...nhom.values()].map((g) => ({ muc: g.muc, tu: g.tu, den: g.den, soHS: g.hs.size }))
    .filter((g) => g.soHS >= 2)
    .sort((a, b) => b.soHS - a.soHS || a.tu - b.tu);
}
