/**
 * FILE NÀY LÀM GÌ: Mô-đun TypeScript/JavaScript hỗ trợ xử lý dữ liệu và nghiệp vụ trong hệ thống FlipMath 9.
 * AI DÙNG: dùng chung
 * LẤY DỮ LIỆU TỪ: không truy vấn bảng trực tiếp
 * GỌI TỚI: ./mau
 */
import { bai, buoc, goc, lamTron, so } from './mau';

/**
 * Hàm `dieu`: nhận (day, alpha, tay), xử lý nghiệp vụ và trả kết quả tương ứng.
 */
function dieu(day: number, alpha: number, tay = 0) {
  const caoSoVoiTay = day * Math.sin(goc(alpha));
  const p = 'h = ' + day + ' · sin ' + alpha + '°';
  return bai('Độ cao của diều', tay ? 'H là độ cao so với đất, h là độ cao so với tay' : 'h là độ cao của diều so với tay', 'm', 'Dùng sin = cạnh đối / cạnh huyền',
    ['Dây diều dài ' + day + ' m', 'Góc giữa dây diều và phương ngang là ' + alpha + '°', ...(tay ? ['Tay cách đất ' + so(tay) + ' m'] : [])],
    [buoc(p, p.replace('sin', 'cos'), p.replace('sin', 'tan'), 'Dây diều là cạnh huyền. Độ cao so với tay là cạnh đối, nên sin α = h/' + day + '.', 0, 1),
      ...(tay ? [buoc('H = h + ' + so(tay), 'H = h − ' + so(tay), 'H = h', 'Độ cao từ mặt đất bằng độ cao của tay cộng phần cao hơn tay.', 2)] : [])],
    'Tính h khi máy ở chế độ độ: h ≈ ' + lamTron(caoSoVoiTay, 3) + ' m.' + (tay ? ' Cộng ' + so(tay) + ' m rồi mới làm tròn đến hàng phần mười.' : ' Làm tròn đến mét.'),
    () => lamTron(caoSoVoiTay + tay, tay ? 1 : 0) + ' m');
}

/**
 * Hàm `gocHa`: nhận (cao, alpha, digits), xử lý nghiệp vụ và trả kết quả tương ứng.
 */
function gocHa(cao: number, alpha: number, digits: number) {
  // Tính toán, làm tròn hoặc giới hạn giá trị theo công thức
  const d = cao / Math.tan(goc(alpha));
  const tan = 'tan ' + alpha + '°';
  return bai('Góc hạ từ toà nhà', 'x là khoảng cách ngang từ chân toà nhà tới ô tô', 'm', 'Dùng tan = cạnh đối / cạnh kề',
    ['Độ cao vị trí quan sát là ' + cao + ' m', 'Góc hạ là ' + alpha + '°', 'Mặt đất song song với phương ngang qua người quan sát'],
    [buoc(tan + ' = ' + cao + '/x', tan + ' = x/' + cao, 'sin ' + alpha + '° = ' + cao + '/x',
      'Góc hạ bằng góc nâng ở ô tô. Cạnh đối là chiều cao, cạnh kề là khoảng cách trên mặt đất.', 0, 1, 2)],
    'Suy ra x = ' + cao + ' / ' + tan + ' ≈ ' + lamTron(d, 3) + ' m. Làm tròn theo đề và kiểm tra x > 0.',
    () => lamTron(d, digits) + ' m');
}

export const chuong4 = {
  'C4-B12-M1-Q08': dieu(80, 40),
  'C4-B12-M1-Q16': dieu(60, 50, 1.5),
  'C4-B12-M2-Q07': gocHa(30, 25, 0),
  'C4-B12-M2-Q16': gocHa(35, 60, 1),
  'C4-B12-M2-Q15': bai('Hai góc nâng nhìn tháp', 'h là chiều cao tháp, x là khoảng cách từ bạn gần đến chân tháp', 'm', 'Dùng tan = cạnh đối / cạnh kề',
    ['Hai bạn cách nhau 20 m, cùng phía với chân tháp', 'Bạn gần có góc nâng 45°', 'Bạn xa có góc nâng 30°'],
    [buoc('h = x · tan 45°', 'h = x · sin 45°', 'h = x + tan 45°', 'Cạnh đối là h, cạnh kề của góc 45° là x. Dùng h = cạnh kề × tan góc nâng.', 1),
      buoc('h = (x + 20) · tan 30°', 'h = (x − 20) · tan 30°', 'h = x · tan 30°', 'Bạn xa cách chân tháp x + 20 m vì hai bạn cùng phía và thẳng hàng.', 0, 2)],
    'Vì tan 45° = 1 nên h = x. Từ x = (x + 20) · tan 30° suy ra x = 20/(√3 − 1) m. Làm tròn sau khi tính.',
    () => lamTron(20 * Math.tan(goc(30)) / (Math.tan(goc(45)) - Math.tan(goc(30))), 1) + ' m'),
};

