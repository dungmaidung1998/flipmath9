/* FlipMath9 · điều khiển riêng của trang giới thiệu.
   Bộ máy scrollcraft lo phần ghim, gợi chữ, quét, đếm số. Tệp này lo:
   1) vạch chia hai bên theo tiến độ cuộn (--chia),
   2) chuyển cảnh mỗi bên, chiều sâu các lớp ảnh ở cảnh đầu,
   3) nước đi riêng của trang: đáp án sai được gọi tên và bay lên bảng của cô. */
(function () {
  'use strict';
  var inst = window.ScrollCraft ? ScrollCraft.mount(document.body) : null;
  var act = document.querySelector('.hai-ben');
  if (!act) return;
  var stage = act.querySelector('.san-khau');
  var benCu = stage.querySelector('.ben--cu');
  var benMoi = stage.querySelector('.ben--moi');
  var reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  var nho = matchMedia('(max-width: 760px)');
  var minPointer = matchMedia('(hover: hover) and (pointer: fine)');

  // Vị trí vạch chia (%) theo tiến độ cuộn p của cả màn.
  var MOC_RONG = [[0, 50], [0.12, 50], [0.18, 32], [0.5, 32], [0.55, 50], [0.7, 50], [0.74, 38], [0.86, 38], [0.9, 0], [1, 0]];
  var thap = innerHeight < 720;
  var MOC_HEP = [[0, 46], [0.12, 46], [0.18, thap ? 18 : 24], [0.5, thap ? 18 : 24], [0.55, 46], [0.7, 46], [0.74, 28], [0.86, 28], [0.9, 0], [1, 0]];
  // Cửa sổ hiện của từng cảnh, mỗi bên.
  var CANH = {
    cu: { toi: [[0, 0.165]], giay: [[0.165, 0.535], [0.72, 1.01]], lop: [[0.535, 0.72]] },
    moi: { toi: [[0, 0.165]], giay: [[0.165, 0.535], [0.72, 0.875]], lop: [[0.535, 0.72]], san: [[0.875, 1.01]] }
  };
  var LUC = [[0.16, 'Tối hôm trước'], [0.535, 'Lúc làm phiếu chuẩn bị'], [0.72, 'Sáng hôm sau'], [0.88, 'Cả năm học'], [2, '']];

  var clamp = function (x) { return x < 0 ? 0 : x > 1 ? 1 : x; };
  var muot = function (t) { return t * t * (3 - 2 * t); };
  function noi(moc, p) {
    for (var i = 1; i < moc.length; i++) {
      if (p <= moc[i][0]) {
        var a = moc[i - 1], b = moc[i];
        var t = clamp((p - a[0]) / ((b[0] - a[0]) || 1));
        if (reduce) t = t < 0.5 ? 0 : 1;
        return a[1] + (b[1] - a[1]) * muot(t);
      }
    }
    return moc[moc.length - 1][1];
  }
  function doHien(p, cua, w) {
    var vao = cua[0] <= 0 ? 1 : clamp((p - cua[0] + w / 2) / w);
    var ra = cua[1] >= 1 ? 1 : clamp((cua[1] + w / 2 - p) / w);
    var o = Math.min(vao, ra);
    return reduce ? (o >= 0.5 ? 1 : 0) : o;
  }

  var canhEls = {
    cu: benCu.querySelectorAll('.ben__canh'),
    moi: benMoi.querySelectorAll('.ben__canh')
  };
  var cueEls = stage.querySelectorAll('[data-sc-cue]');
  var lucEl = document.getElementById('vach-luc');
  var lucCu = '';
  var mx = 0, mxDich = 0;
  if (minPointer.matches && !reduce) {
    window.addEventListener('pointermove', function (e) { mxDich = (e.clientX / innerWidth - 0.5) * 2; }, { passive: true });
  }

  var p = 0, daChon = false;
  function khung() {
    var v = parseFloat(act.style.getPropertyValue('--sc-p'));
    if (!isNaN(v)) p = v;
    var chia = noi(nho.matches ? MOC_HEP : MOC_RONG, p);
    stage.style.setProperty('--chia', chia.toFixed(2));
    stage.style.setProperty('--vach-hien', clamp(chia / 8).toFixed(3));
    benCu.style.setProperty('--tam', (chia / 2).toFixed(2));
    benMoi.style.setProperty('--tam', (chia + (100 - chia) / 2).toFixed(2));
    stage.style.setProperty('--dh', reduce ? '0' : clamp(p / 0.16).toFixed(3));
    mx += (mxDich - mx) * 0.08;
    stage.style.setProperty('--mx', mx.toFixed(3));

    ['cu', 'moi'].forEach(function (ben) {
      Array.prototype.forEach.call(canhEls[ben], function (el) {
        var ds = CANH[ben][el.getAttribute('data-canh')];
        if (!ds) return;
        var o = 0;
        for (var k = 0; k < ds.length; k++) o = Math.max(o, doHien(p, ds[k], 0.03));
        el.style.opacity = o.toFixed(3);
      });
    });

    for (var i = 0; i < LUC.length; i++) {
      if (p < LUC[i][0]) { if (lucCu !== LUC[i][1]) { lucCu = LUC[i][1]; lucEl.textContent = lucCu; } break; }
    }

    // Khối chữ đang mờ thì không nhận chuột, để không che nút của chặng đang hiện.
    for (var j = 0; j < cueEls.length; j++) {
      var o = parseFloat(cueEls[j].style.opacity || '0');
      cueEls[j].classList.toggle('tat', o < 0.5);
    }

    // Người xem cuộn qua mà chưa bấm: trang tự chọn một ví dụ để đỉnh vẫn diễn ra.
    if (!daChon && p > 0.3 && p < 0.48) chon(dapAn[0], true);
    requestAnimationFrame(khung);
  }

  /* ------------------------------------------------- nước đi riêng -- */
  // Dữ liệu thật trong ngân hàng câu hỏi (dfle-engine/src/t9-chuong2.js).
  var LOI = {
    'E-BPT-02': {
      ten: 'Giải bất phương trình sai chiều, sai dấu',
      goiY: [
        'Khi chia hai vế cho một số âm, chiều bất phương trình có giữ nguyên không?',
        'Chuyển vế thì đổi dấu hạng tử. Nhân, chia hai vế cho số dương thì giữ chiều; cho số âm thì đổi chiều.'
      ]
    }
  };
  var dapAn = stage.querySelectorAll('.dap-an');
  var phanHoi = document.getElementById('phan-hoi');
  var bang = document.getElementById('bang-co');
  var toGiay = stage.querySelector('.to-giay');
  var cuChon = document.getElementById('cu-chon');
  var cuX = document.getElementById('cu-x');
  var cuLoi = document.getElementById('cu-loi');
  var dem = {};

  function chon(btn, viDu) {
    daChon = true;
    Array.prototype.forEach.call(dapAn, function (b) { b.setAttribute('aria-pressed', 'false'); b.classList.remove('dung', 'sai'); });
    btn.setAttribute('aria-pressed', 'true');
    var dung = btn.getAttribute('data-dung') === '1';
    var chu = btn.textContent;
    btn.classList.add(dung ? 'dung' : 'sai');

    // Bên cũ: cùng một lựa chọn, chỉ nhận về một dấu.
    toGiay.classList.remove('da-cham', 'chim');
    void toGiay.offsetWidth;
    cuChon.textContent = chu;
    cuX.textContent = dung ? '✓' : '✗';
    cuX.style.color = dung ? '#1E6B43' : '#CF2E26';
    toGiay.classList.add('da-cham');
    if (!dung) setTimeout(function () { toGiay.classList.add('chim'); }, 40);
    cuLoi.textContent = dung
      ? 'Đúng thì được dấu tích. Hiểu thật hay đoán trúng, không ai biết.'
      : 'Sai thì chỉ có một dấu gạch đỏ. Sai vì sao, đợi đến buổi chữa bài.';

    if (dung) {
      phanHoi.innerHTML = '<p class="dung-roi">Đúng rồi. Chia hai vế cho −2, một số âm, nên đổi chiều: −2x &gt; 6 ⇔ x &lt; −3.</p>';
      return;
    }
    var ma = btn.getAttribute('data-ma');
    var loi = LOI[ma];
    phanHoi.innerHTML =
      (viDu ? '<p class="vi-du">Ví dụ: một bạn chọn ' + chu + '. Bạn cũng có thể tự chọn.</p>' : '') +
      '<p class="loi-ten"><span class="loi-ma">' + ma + '</span><span class="loi-mo-ta">' + loi.ten + '</span></p>' +
      '<p class="goi-y"><b>Gợi ý 1.</b> ' + loi.goiY[0] + '</p>' +
      '<button type="button" class="nut-goi-y">Xem gợi ý 2</button>' +
      '<p class="goi-y goi-y--2" hidden><b>Gợi ý 2.</b> ' + loi.goiY[1] + '</p>';
    bay(btn, ma);
  }

  function veBang() {
    var ma = Object.keys(dem);
    if (!ma.length) return;
    bang.innerHTML = ma.map(function (k) {
      return '<li class="moi"><span>' + k + '</span><b>' + dem[k] + '</b><small>' + LOI[k].ten + '</small></li>';
    }).join('');
  }

  function bay(btn, ma) {
    var cong = function () { dem[ma] = (dem[ma] || 0) + 1; veBang(); };
    var a = btn.getBoundingClientRect(), b = bang.getBoundingClientRect();
    if (reduce || !btn.animate || b.width === 0) { cong(); return; }
    var giay = document.createElement('div');
    giay.className = 'giay-nho';
    giay.textContent = ma;
    document.body.appendChild(giay);
    var x0 = a.left + a.width / 2 - 40, y0 = a.top + a.height / 2 - 14;
    var x1 = b.left + 16, y1 = b.top + 44;
    var xm = (x0 + x1) / 2, ym = Math.min(y0, y1) - 70;
    var anim = giay.animate([
      { transform: 'translate(' + x0 + 'px,' + y0 + 'px) rotate(-6deg) scale(.95)', opacity: 0 },
      { transform: 'translate(' + x0 + 'px,' + (y0 - 10) + 'px) rotate(-6deg) scale(1)', opacity: 1, offset: 0.12 },
      { transform: 'translate(' + xm + 'px,' + ym + 'px) rotate(7deg) scale(1.06)', opacity: 1, offset: 0.55 },
      { transform: 'translate(' + x1 + 'px,' + y1 + 'px) rotate(0deg) scale(.96)', opacity: 1 }
    ], { duration: 820, easing: 'cubic-bezier(0.23, 1, 0.32, 1)' });
    anim.onfinish = function () { giay.remove(); cong(); };
  }

  Array.prototype.forEach.call(dapAn, function (b) {
    b.setAttribute('aria-pressed', 'false');
    b.addEventListener('click', function () { chon(b, false); });
  });
  phanHoi.addEventListener('click', function (e) {
    var nut = e.target.closest('.nut-goi-y');
    if (!nut) return;
    var g = phanHoi.querySelector('.goi-y--2');
    if (g) { g.hidden = false; nut.remove(); }
  });

  // Bàn phím: vào một khối của chặng nào thì cuộn tới chặng đó.
  stage.addEventListener('focusin', function (e) {
    var khoi = e.target.closest('[data-buoc]');
    if (!khoi) return;
    var buoc = parseFloat(khoi.getAttribute('data-buoc'));
    var top = act.getBoundingClientRect().top + scrollY;
    var dich = top + buoc * (act.offsetHeight - innerHeight);
    if (Math.abs(scrollY - dich) > innerHeight * 0.3) window.scrollTo({ top: dich, behavior: reduce ? 'auto' : 'smooth' });
  });

  requestAnimationFrame(khung);
})();
