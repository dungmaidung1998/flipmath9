/**
 * FILE NÀY LÀM GÌ: Dựng mô hình 3D tam giác vuông đo chiều cao ngoài thực tế bằng Three.js.
 * AI DÙNG: dùng chung
 * LẤY DỮ LIỆU TỪ: không truy vấn bảng trực tiếp
 * GỌI TỚI: ./tinh
 */
import * as THREE from 'three';
import {
  khoangCachGanHaiDiem,
  dinhDangSoVN,
  type CachDoChieuCao,
} from './tinh';

export type DuLieuCanh3D = {
  cachDo: CachDoChieuCao;
  d: number;
  a?: number;
  alpha1: number;
  alpha2?: number;
  m: number;
  h: number;
  /** Chỉ hiện kết quả h và tô cạnh đối (đỏ nhạt) / cạnh kề (xanh nhạt) sau khi HS đã nộp bài. */
  daNop: boolean;
  loaiVat?: 'cot-co' | 'cay' | 'tru-den' | 'toa-nha' | 'cau-rong';
};

/**
 * Hàm `taoNhanSprite`: nhận (text, bg, fg), xử lý nghiệp vụ và trả kết quả tương ứng.
 */
function taoNhanSprite(text: string, bg = '#ffffff', fg = '#182345'): THREE.Sprite {
  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 72;
  const ctx = canvas.getContext('2d');
  if (ctx) {
    ctx.fillStyle = bg;
    ctx.strokeStyle = '#cbd5e1';
    ctx.lineWidth = 3;
    const r = 16;
    ctx.beginPath();
    ctx.roundRect(6, 6, canvas.width - 12, canvas.height - 12, r);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = fg;
    ctx.font = 'bold 28px system-ui, -apple-system, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(text, canvas.width / 2, canvas.height / 2 + 1);
  }
  const tex = new THREE.CanvasTexture(canvas);
  tex.needsUpdate = true;
  const mat = new THREE.SpriteMaterial({ map: tex, depthTest: false });
  const sp = new THREE.Sprite(mat);
  sp.scale.set(2.8, 0.78, 1);
  return sp;
}

/**
 * Hàm `taoDuongNetDut`: nhận (a, b, mau), xử lý nghiệp vụ và trả kết quả tương ứng.
 */
function taoDuongNetDut(a: THREE.Vector3, b: THREE.Vector3, mau: number): THREE.Line {
  const geom = new THREE.BufferGeometry().setFromPoints([a, b]);
  const mat = new THREE.LineDashedMaterial({ color: mau, dashSize: 0.35, gapSize: 0.22 });
  const line = new THREE.Line(geom, mat);
  line.computeLineDistances();
  return line;
}

/**
 * Hàm `taoDoanThang`: nhận (a, b, mau, banKinh), xử lý nghiệp vụ và trả kết quả tương ứng.
 */
function taoDoanThang(a: THREE.Vector3, b: THREE.Vector3, mau: number, banKinh = 0.045): THREE.Mesh {
  const dir = new THREE.Vector3().subVectors(b, a);
  // Tính toán, làm tròn hoặc giới hạn giá trị theo công thức
  const len = Math.max(0.05, dir.length());
  const geom = new THREE.CylinderGeometry(banKinh, banKinh, len, 10);
  const mat = new THREE.MeshStandardMaterial({ color: mau, roughness: 0.5 });
  const mesh = new THREE.Mesh(geom, mat);
  mesh.position.copy(a).add(b).multiplyScalar(0.5);
  mesh.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), dir.normalize());
  return mesh;
}

/**
 * Dựng nhóm mô hình 3D tam giác vuông đo chiều cao Đà Nẵng.
 * Toàn bộ kích thước quy về tỉ lệ vừa khung nhìn (~12–16 đơn vị).
 */
export function taoCanhDoChieuCao(input: DuLieuCanh3D): {
  group: THREE.Group;
  camPos: THREE.Vector3;
  target: THREE.Vector3;
} {
  const group = new THREE.Group();
  const RAD = Math.PI / 180;

  const d1 =
    input.cachDo === 'mot-diem'
      ? Math.max(1, input.d)
      : Math.max(1, khoangCachGanHaiDiem(input.a ?? 10, input.alpha1, input.alpha2 ?? 20));
  // Tính toán, làm tròn hoặc giới hạn giá trị theo công thức
  const aVal = input.cachDo === 'hai-diem' ? Math.max(1, input.a ?? 10) : 0;
  const tongNgang = d1 + aVal;
  // Tính toán, làm tròn hoặc giới hạn giá trị theo công thức
  const maxSpan = Math.max(tongNgang, input.h, 4);
  const scale = 12 / maxSpan;

  const X_VAT = (tongNgang / 2) * scale;
  const X_A = X_VAT - d1 * scale;
  const X_B = X_VAT - tongNgang * scale;
  // Tính toán, làm tròn hoặc giới hạn giá trị theo công thức
  const H_PX = Math.max(0.8, input.h * scale);
  // Tính toán, làm tròn hoặc giới hạn giá trị theo công thức
  const M_PX = Math.max(0.35, input.m * scale);

  // 1. Mặt đất (và dải sông Hàn khi đo 2 điểm không tới chân vật)
  const groundGeom = new THREE.PlaneGeometry(24, 14);
  const groundMat = new THREE.MeshStandardMaterial({ color: 0xe6f4ea, roughness: 0.95 });
  const ground = new THREE.Mesh(groundGeom, groundMat);
  ground.rotation.x = -Math.PI / 2;
  ground.receiveShadow = true;
  group.add(ground);

  const grid = new THREE.GridHelper(22, 22, 0xb8d4c2, 0xd8ece0);
  grid.position.y = 0.01;
  group.add(grid);

  if (input.cachDo === 'hai-diem') {
    // Tính toán, làm tròn hoặc giới hạn giá trị theo công thức
    const riverW = Math.max(1.2, d1 * scale * 0.65);
    const river = new THREE.Mesh(
      new THREE.PlaneGeometry(riverW, 13.6),
      new THREE.MeshStandardMaterial({ color: 0x7ec8e3, roughness: 0.35 })
    );
    river.rotation.x = -Math.PI / 2;
    river.position.set(X_A + (X_VAT - X_A) * 0.5, 0.02, 0);
    group.add(river);
  }

  // 2. Người đo (khối đơn giản cao m)
  const themNguoi = (xPos: number, chon: boolean) => {
    // Tính toán, làm tròn hoặc giới hạn giá trị theo công thức
    const bodyH = Math.max(0.25, M_PX * 0.78);
    const body = new THREE.Mesh(
      new THREE.CylinderGeometry(0.16, 0.2, bodyH, 12),
      new THREE.MeshStandardMaterial({ color: chon ? 0x2563eb : 0x64748b, roughness: 0.6 })
    );
    body.position.set(xPos, bodyH / 2, 0);
    group.add(body);

    // Tính toán, làm tròn hoặc giới hạn giá trị theo công thức
    const headR = Math.min(0.22, Math.max(0.12, M_PX * 0.14));
    const head = new THREE.Mesh(
      new THREE.SphereGeometry(headR, 14, 12),
      new THREE.MeshStandardMaterial({ color: chon ? 0xfbbf24 : 0x94a3b8, roughness: 0.5 })
    );
    head.position.set(xPos, M_PX, 0);
    group.add(head);
  };

  themNguoi(X_A, true);
  if (input.cachDo === 'hai-diem') {
    themNguoi(X_B, false);
  }

  // 3. Vật cần đo (cao h)
  const loai = input.loaiVat ?? 'cot-co';
  if (loai === 'cay') {
    const trunk = new THREE.Mesh(
      new THREE.CylinderGeometry(0.18, 0.28, H_PX * 0.65, 12),
      new THREE.MeshStandardMaterial({ color: 0x7c4a2d, roughness: 0.85 })
    );
    trunk.position.set(X_VAT, (H_PX * 0.65) / 2, 0);
    group.add(trunk);

    // Tính toán, làm tròn hoặc giới hạn giá trị theo công thức
    const crownR = Math.max(0.6, H_PX * 0.28);
    const crown = new THREE.Mesh(
      new THREE.SphereGeometry(crownR, 16, 14),
      new THREE.MeshStandardMaterial({ color: 0x2f9e44, roughness: 0.75 })
    );
    // Tính toán, làm tròn hoặc giới hạn giá trị theo công thức
    crown.position.set(X_VAT, Math.max(crownR, H_PX - crownR), 0);
    group.add(crown);
  } else if (loai === 'toa-nha') {
    const bldg = new THREE.Mesh(
      new THREE.BoxGeometry(1.4, H_PX, 1.4),
      new THREE.MeshStandardMaterial({ color: 0x94a3b8, roughness: 0.6 })
    );
    bldg.position.set(X_VAT, H_PX / 2, 0);
    group.add(bldg);
  } else if (loai === 'cau-rong') {
    const pier = new THREE.Mesh(
      new THREE.BoxGeometry(0.9, H_PX * 0.72, 0.9),
      new THREE.MeshStandardMaterial({ color: 0xeab308, roughness: 0.45 })
    );
    pier.position.set(X_VAT, (H_PX * 0.72) / 2, 0);
    group.add(pier);
    const arch = new THREE.Mesh(
      new THREE.BoxGeometry(0.55, H_PX * 0.28, 0.55),
      new THREE.MeshStandardMaterial({ color: 0xf59e0b, roughness: 0.4 })
    );
    arch.position.set(X_VAT, H_PX * 0.86, 0);
    group.add(arch);
  } else {
    // Cột cờ / trụ đèn mặc định
    const pole = new THREE.Mesh(
      new THREE.CylinderGeometry(0.11, 0.16, H_PX, 14),
      new THREE.MeshStandardMaterial({ color: 0x475569, roughness: 0.4 })
    );
    pole.position.set(X_VAT, H_PX / 2, 0);
    group.add(pole);

    const flag = new THREE.Mesh(
      new THREE.BoxGeometry(0.95, 0.58, 0.06),
      new THREE.MeshStandardMaterial({ color: 0xdc2626, roughness: 0.6 })
    );
    // Tính toán, làm tròn hoặc giới hạn giá trị theo công thức
    flag.position.set(X_VAT + 0.48, Math.max(0.4, H_PX - 0.32), 0);
    group.add(flag);
  }

  // 4. Tam giác vuông: mắt -> chân đường ngang (tại chân/thân vật) -> đỉnh vật
  const matA = new THREE.Vector3(X_A, M_PX, 0.25);
  const chanNgang = new THREE.Vector3(X_VAT, M_PX, 0.25);
  const dinhVat = new THREE.Vector3(X_VAT, H_PX, 0.25);

  const mauKe = input.daNop ? 0x3b82f6 : 0x64748b; // xanh nhạt sau khi nộp
  const mauDoi = input.daNop ? 0xf87171 : 0x475569; // đỏ nhạt sau khi nộp

  // Cạnh kề (đường ngang tầm mắt)
  group.add(taoDoanThang(matA, chanNgang, mauKe, input.daNop ? 0.06 : 0.035));
  // Cạnh đối (từ ngang tầm mắt lên đỉnh)
  group.add(taoDoanThang(chanNgang, dinhVat, mauDoi, input.daNop ? 0.06 : 0.035));
  // Tia ngắm từ mắt A tới đỉnh
  group.add(taoDuongNetDut(matA, dinhVat, 0x1d4ed8));

  // Đánh dấu góc vuông tại chanNgang
  const sq = Math.min(0.5, d1 * scale * 0.15, (H_PX - M_PX) * 0.25);
  if (sq > 0.1) {
    const rightPts = [
      new THREE.Vector3(X_VAT - sq, M_PX, 0.25),
      new THREE.Vector3(X_VAT - sq, M_PX + sq, 0.25),
      new THREE.Vector3(X_VAT, M_PX + sq, 0.25),
    ];
    group.add(
      new THREE.Line(
        new THREE.BufferGeometry().setFromPoints(rightPts),
        new THREE.LineBasicMaterial({ color: 0x0f172a })
      )
    );
  }

  if (input.cachDo === 'hai-diem') {
    const matB = new THREE.Vector3(X_B, M_PX, 0.25);
    group.add(taoDoanThang(matB, matA, mauKe, input.daNop ? 0.055 : 0.03));
    group.add(taoDuongNetDut(matB, dinhVat, 0xea580c));
  }

  // 5. Nhãn trực quan (chỉ hiện giá trị h sau khi đã nộp để không lộ đáp án)
  const spAlpha = taoNhanSprite(
    input.cachDo === 'hai-diem' ? `α₁=${dinhDangSoVN(input.alpha1, 1)}°` : `α=${dinhDangSoVN(input.alpha1, 1)}°`,
    '#eff6ff',
    '#1d4ed8'
  );
  // Tính toán, làm tròn hoặc giới hạn giá trị theo công thức
  spAlpha.position.set(X_A + Math.min(2.2, d1 * scale * 0.35), M_PX + 0.7, 0.45);
  group.add(spAlpha);

  if (input.cachDo === 'hai-diem') {
    const spA = taoNhanSprite(`a = ${dinhDangSoVN(aVal, 1)} m`, '#fff7ed', '#c2410c');
    spA.position.set((X_A + X_B) / 2, M_PX - 0.35, 0.45);
    group.add(spA);

    const spAlpha2 = taoNhanSprite(`α₂=${dinhDangSoVN(input.alpha2 ?? 0, 1)}°`, '#fff7ed', '#c2410c');
    spAlpha2.position.set(X_B + 1.1, M_PX + 0.7, 0.45);
    group.add(spAlpha2);
  } else {
    const spD = taoNhanSprite(`d = ${dinhDangSoVN(input.d, 1)} m`, '#eff6ff', '#1e40af');
    // Tính toán, làm tròn hoặc giới hạn giá trị theo công thức
    spD.position.set((X_A + X_VAT) / 2, Math.max(0.45, M_PX - 0.35), 0.45);
    group.add(spD);
  }

  const spH = taoNhanSprite(
    input.daNop ? `h = ${dinhDangSoVN(input.h, 2)} m` : 'h = ? m',
    input.daNop ? '#fef2f2' : '#f8fafc',
    input.daNop ? '#b91c1c' : '#334155'
  );
  spH.position.set(X_VAT + 1.5, H_PX * 0.55, 0.45);
  group.add(spH);

  // Vòng cung góc α₁ nhẹ trên mặt phẳng z=0.25
  const rArc = Math.min(1.4, d1 * scale * 0.35);
  const arcPts: THREE.Vector3[] = [];
  const rad1 = input.alpha1 * RAD;
  for (let k = 0; k <= 12; k++) {
    const ang = (k / 12) * rad1;
    arcPts.push(new THREE.Vector3(X_A + rArc * Math.cos(ang), M_PX + rArc * Math.sin(ang), 0.25));
  }
  group.add(
    new THREE.Line(
      new THREE.BufferGeometry().setFromPoints(arcPts),
      new THREE.LineBasicMaterial({ color: 0x1d4ed8 })
    )
  );

  // Tính toán, làm tròn hoặc giới hạn giá trị theo công thức
  const midH = Math.max(2, H_PX * 0.45);
  // Tính toán, làm tròn hoặc giới hạn giá trị theo công thức
  const camPos = new THREE.Vector3(0, midH + 3.5, Math.max(13, H_PX * 1.45));
  const target = new THREE.Vector3(0, midH * 0.85, 0);
  return { group, camPos, target };
}
