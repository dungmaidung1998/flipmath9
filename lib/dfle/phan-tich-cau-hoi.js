/**
 * PHÂN TÍCH CÂU HỎI VÀ PHƯƠNG ÁN NHIỄU
 * ---------------------------------------------------------------------------
 * Kiểm chứng ngân hàng câu hỏi bằng câu trả lời THẬT của học sinh:
 *   · câu nào quá dễ, quá khó, hay "hỏng" (em giỏi lại sai nhiều hơn em yếu)
 *   · phương án nhiễu nào không ai chọn
 *   · phương án nhiễu nào lại được em giỏi chọn nhiều hơn đáp án — nghi sai đáp án
 *   · mỗi quan niệm sai trong từ điển có thật sự xuất hiện không
 *
 * Chỉ đọc dữ liệu, không sửa gì. Câu nào bị cảnh báo thì GHI LẠI, không sửa
 * giữa đợt thực nghiệm: sửa đề lúc đang đo là đổi chính thứ đang đo.
 *
 * Cách tính dùng phân tích câu hỏi cổ điển (lý thuyết trắc nghiệm cổ điển):
 *   độ khó      p  = tỉ lệ làm đúng
 *   độ phân biệt r  = tương quan điểm-nhị phân giữa đúng/sai ở câu này và
 *                     tỉ lệ đúng CÁC CÂU CÒN LẠI của chính em đó
 * Bỏ chính câu đang xét ra khỏi "năng lực" để câu không tự tương quan với nó.
 */

/** Dưới ngưỡng này thì chỉ số dao động quá mạnh, không kết luận. */
export const SO_LUOT_TOI_THIEU = 20;

export const NGUONG = Object.freeze({
  quaDe: 0.9,
  quaKho: 0.2,
  phanBietYeu: 0.2,
  nhieuKhongHoatDong: 0.05,  // phương án nhiễu dưới 5% số em chọn
  soNguoiChonToiThieu: 5,     // cần ít nhất chừng này em chọn mới so năng lực nhóm
  lechMuc: 0.1                // câu mức thấp khó hơn trung bình mức cao hơn quá 0,1
});

/**
 * @typedef {object} TraLoi
 * @property {string} studentId
 * @property {string} questionId
 * @property {string} kuId
 * @property {number} level
 * @property {string|null} chosen     phương án đã chọn
 * @property {boolean} isCorrect
 * @property {string|null} errorCode
 * @property {number} ts
 */

/** Mỗi (học sinh, câu) chỉ giữ LẦN ĐẦU. Lượt làm lại kéo tỉ lệ đúng lên giả tạo. */
export function lanDau(traLois) {
  const m = new Map();
  for (const t of traLois) {
    const k = t.studentId + '|' + t.questionId;
    const cu = m.get(k);
    if (!cu || t.ts < cu.ts) m.set(k, t);
  }
  return [...m.values()];
}

function pearson(xs, ys) {
  const n = xs.length;
  if (n < 3) return null;
  const mx = xs.reduce((a, b) => a + b, 0) / n;
  const my = ys.reduce((a, b) => a + b, 0) / n;
  let sxy = 0, sxx = 0, syy = 0;
  for (let i = 0; i < n; i++) {
    const dx = xs[i] - mx, dy = ys[i] - my;
    sxy += dx * dy; sxx += dx * dx; syy += dy * dy;
  }
  if (sxx === 0 || syy === 0) return null;
  return sxy / Math.sqrt(sxx * syy);
}

const lamTron = (x, k = 3) => (x === null || x === undefined ? null : Math.round(x * 10 ** k) / 10 ** k);

/**
 * Năng lực "còn lại" của mỗi em ở mỗi câu = tỉ lệ đúng trên mọi câu khác em đã
 * làm (lần đầu). Trả về hàm tra cứu.
 */
function nangLucConLai(dauTien) {
  const tong = new Map();
  for (const t of dauTien) {
    const s = tong.get(t.studentId) ?? { dung: 0, n: 0 };
    s.dung += t.isCorrect ? 1 : 0; s.n += 1;
    tong.set(t.studentId, s);
  }
  return (t) => {
    const s = tong.get(t.studentId);
    const n = s.n - 1;
    return n > 0 ? (s.dung - (t.isCorrect ? 1 : 0)) / n : null;
  };
}

/**
 * @param {TraLoi[]} traLois
 * @param {{ dapAn: Map<string,string>, phuongAn: Map<string,string[]>,
 *           maLoiPhuongAn: Map<string,string>, thongTinCau: Map<string,{kuId:string,level:number}> }} nganHang
 *   dapAn: questionId → phương án đúng
 *   phuongAn: questionId → danh sách phương án (A, B, C, D)
 *   maLoiPhuongAn: 'questionId|option' → mã quan niệm sai đã gắn
 *   thongTinCau: questionId → đơn vị, mức
 */
export function phanTichCauHoi(traLois, nganHang) {
  const dauTien = lanDau(traLois);
  const nangLuc = nangLucConLai(dauTien);
  const theoCau = new Map();
  for (const t of dauTien) {
    if (!theoCau.has(t.questionId)) theoCau.set(t.questionId, []);
    theoCau.get(t.questionId).push(t);
  }

  // ------------------------------------------------------------ từng câu
  const cauHoi = [];
  for (const [qid, info] of nganHang.thongTinCau) {
    const ds = theoCau.get(qid) ?? [];
    const n = ds.length;
    const du = n >= SO_LUOT_TOI_THIEU;
    const p = n ? ds.filter((t) => t.isCorrect).length / n : null;

    const cap = ds.map((t) => [t.isCorrect ? 1 : 0, nangLuc(t)]).filter(([, r]) => r !== null);
    const r = du ? pearson(cap.map((c) => c[0]), cap.map((c) => c[1])) : null;

    // từng phương án
    const phuongAn = (nganHang.phuongAn.get(qid) ?? []).map((opt) => {
      const chon = ds.filter((t) => t.chosen === opt);
      const nl = chon.map(nangLuc).filter((x) => x !== null);
      return {
        phuongAn: opt,
        laDapAn: nganHang.dapAn.get(qid) === opt,
        maLoi: nganHang.maLoiPhuongAn.get(qid + '|' + opt) ?? null,
        soChon: chon.length,
        tiLe: n ? chon.length / n : null,
        nangLucTB: nl.length ? nl.reduce((a, b) => a + b, 0) / nl.length : null
      };
    });

    const dapAnPA = phuongAn.find((x) => x.laDapAn);
    const canhBao = [];
    if (du) {
      if (p > NGUONG.quaDe) canhBao.push('quá dễ');
      if (p < NGUONG.quaKho) canhBao.push('quá khó');
      if (r !== null && r < 0) canhBao.push('HỎNG: em giỏi sai nhiều hơn em yếu');
      else if (r !== null && r < NGUONG.phanBietYeu) canhBao.push('phân biệt yếu');
      for (const pa of phuongAn) {
        if (pa.laDapAn) continue;
        if (pa.tiLe < NGUONG.nhieuKhongHoatDong) canhBao.push(`nhiễu ${pa.phuongAn} không hoạt động`);
        if (pa.soChon >= NGUONG.soNguoiChonToiThieu && dapAnPA?.nangLucTB != null &&
            pa.nangLucTB != null && pa.nangLucTB > dapAnPA.nangLucTB) {
          canhBao.push(`NGHI SAI ĐÁP ÁN: nhóm chọn ${pa.phuongAn} giỏi hơn nhóm chọn đáp án`);
        }
      }
    }

    cauHoi.push({
      questionId: qid, kuId: info.kuId, level: info.level,
      soLuot: n, duDuLieu: du,
      doKho: lamTron(p), doPhanBiet: lamTron(r),
      phuongAn: phuongAn.map((x) => ({ ...x, tiLe: lamTron(x.tiLe), nangLucTB: lamTron(x.nangLucTB) })),
      canhBao
    });
  }

  // --------------------------------------- khớp mức: câu mức thấp khó hơn mức cao
  const theoDonVi = new Map();
  for (const c of cauHoi) if (c.duDuLieu) {
    if (!theoDonVi.has(c.kuId)) theoDonVi.set(c.kuId, []);
    theoDonVi.get(c.kuId).push(c);
  }
  for (const ds of theoDonVi.values()) {
    for (const c of ds) {
      const caoHon = ds.filter((x) => x.level > c.level);
      if (!caoHon.length) continue;
      const tb = caoHon.reduce((a, x) => a + x.doKho, 0) / caoHon.length;
      if (c.doKho < tb - NGUONG.lechMuc) {
        c.canhBao.push(`nghi gán sai mức: khó hơn trung bình các câu mức cao hơn (${lamTron(tb, 2)})`);
      }
    }
  }

  // ------------------------------------------- theo mã quan niệm sai (mọi lượt)
  const theoMa = new Map();
  for (const t of traLois) {
    if (t.isCorrect || !t.errorCode) continue;
    const m = theoMa.get(t.errorCode) ?? { soLan: 0, hocSinh: new Map() };
    m.soLan++;
    m.hocSinh.set(t.studentId, (m.hocSinh.get(t.studentId) ?? 0) + 1);
    theoMa.set(t.errorCode, m);
  }
  const tatCaMa = new Set([...nganHang.maLoiPhuongAn.values()]);
  const quanNiemSai = [...tatCaMa].sort().map((ma) => {
    const m = theoMa.get(ma);
    const soPhuongAn = [...nganHang.maLoiPhuongAn.values()].filter((x) => x === ma).length;
    return {
      maLoi: ma,
      soPhuongAnGan: soPhuongAn,
      soLanChon: m?.soLan ?? 0,
      soHocSinhMac: m ? m.hocSinh.size : 0,
      soHocSinhLapLai: m ? [...m.hocSinh.values()].filter((v) => v >= 2).length : 0
    };
  });

  const soCauDuDuLieu = cauHoi.filter((c) => c.duDuLieu).length;
  return {
    tongQuan: {
      soTraLoi: traLois.length, soTraLoiLanDau: dauTien.length,
      soHocSinh: new Set(dauTien.map((t) => t.studentId)).size,
      soCau: cauHoi.length, soCauDuDuLieu,
      soCauCoCanhBao: cauHoi.filter((c) => c.canhBao.length).length,
      soMaChuaAiMac: quanNiemSai.filter((x) => x.soHocSinhMac === 0).length
    },
    cauHoi,
    quanNiemSai
  };
}
