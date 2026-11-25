'use client';

/**
 * FILE NÀY LÀM GÌ: Giao diện 4 bước đo chiều cao 3D + AR (có chế độ thanh trượt dự phòng) và bảng thống kê giáo viên.
 * AI DÙNG: học sinh
 * LẤY DỮ LIỆU TỪ: không truy vấn bảng trực tiếp
 * GỌI TỚI: @/components/QuestionFigure, @/lib/do-chieu-cao/canh3d, @/lib/do-chieu-cao/tinh
 */
import { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import QuestionFigure from '@/components/QuestionFigure';
import { taoCanhDoChieuCao, type DuLieuCanh3D } from '@/lib/do-chieu-cao/canh3d';
import { dinhDangSoVN } from '@/lib/do-chieu-cao/tinh';

/**
 * Component React `hoTroWebGL`: nhận props (thuộc tính truyền vào từ component cha) và dựng giao diện tương ứng.
 */
function hoTroWebGL(): boolean {
  try {
    const canvas = document.createElement('canvas');
    return Boolean(
      window.WebGLRenderingContext &&
        (canvas.getContext('webgl') || canvas.getContext('experimental-webgl'))
    );
  } catch {
    return false;
  }
}

/**
 * Hiển thị cảnh 3D minh hoạ tam giác vuông đo chiều cao bằng three.js (chỉ nạp động ở trình duyệt).
 * Nếu thiết bị không hỗ trợ WebGL thì chuyển sang hình SVG tam giác vuông tĩnh (không lộ đáp án khi chưa nộp).
 */
export default function Canh3D({ duLieu }: { duLieu: DuLieuCanh3D }) {
  const hostRef = useRef<HTMLDivElement>(null);
  const ctrlRef = useRef<OrbitControls | null>(null);
  const camRef = useRef<THREE.PerspectiveCamera | null>(null);
  const camInitRef = useRef<{ pos: THREE.Vector3; target: THREE.Vector3 } | null>(null);
  const [khongWebGL, setKhongWebGL] = useState(false);

  useEffect(() => {
    const el = hostRef.current;
    if (!el) return;
    if (!hoTroWebGL()) {
      setKhongWebGL(true);
      return;
    }

    let renderer: THREE.WebGLRenderer | null = null;
    try {
      renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false });
    } catch {
      setKhongWebGL(true);
      return;
    }

    // Tính toán, làm tròn hoặc giới hạn giá trị theo công thức
    const w = Math.max(280, el.clientWidth || 350);
    const h = 290;
    renderer.setSize(w, h);
    // Tính toán, làm tròn hoặc giới hạn giá trị theo công thức
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.setClearColor(0xf4f9ff, 1);
    el.innerHTML = '';
    el.appendChild(renderer.domElement);

    const scene = new THREE.Scene();
    scene.add(new THREE.AmbientLight(0xffffff, 0.85));
    const sun = new THREE.DirectionalLight(0xffffff, 0.9);
    sun.position.set(8, 16, 10);
    scene.add(sun);

    const built = taoCanhDoChieuCao(duLieu);
    scene.add(built.group);

    const camera = new THREE.PerspectiveCamera(45, w / h, 0.1, 120);
    camera.position.copy(built.camPos);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.08;
    controls.target.copy(built.target);
    controls.update();

    ctrlRef.current = controls;
    camRef.current = camera;
    camInitRef.current = { pos: built.camPos.clone(), target: built.target.clone() };

    let raf = 0;
    const renderLoop = () => {
      raf = window.requestAnimationFrame(renderLoop);
      controls.update();
      renderer?.render(scene, camera);
    };
    renderLoop();

    const onResize = () => {
      if (!hostRef.current || !renderer) return;
      // Tính toán, làm tròn hoặc giới hạn giá trị theo công thức
      const nw = Math.max(260, hostRef.current.clientWidth || 340);
      camera.aspect = nw / h;
      camera.updateProjectionMatrix();
      renderer.setSize(nw, h);
    };
    window.addEventListener('resize', onResize);

    return () => {
      window.cancelAnimationFrame(raf);
      window.removeEventListener('resize', onResize);
      controls.dispose();
      renderer?.dispose();
      el.innerHTML = '';
    };
  }, [duLieu]);

  if (khongWebGL) {
    return (
      <div className="dcc-svg-fallback">
        <QuestionFigure
          hinh={{
            loai: 'tam-giac-vuong',
            chuong: 'C4',
            moTa: 'Sơ đồ tam giác vuông đo chiều cao',
            dinh: ['H', 'A', 'M'],
            canh: {
              ngang: duLieu.cachDo === 'mot-diem' ? `d = ${dinhDangSoVN(duLieu.d, 1)} m` : 'khoảng cách',
              tren: duLieu.daNop ? `h ≈ ${dinhDangSoVN(duLieu.h, 2)} m` : 'h = ? m',
            },
            goc: { phai: `${dinhDangSoVN(duLieu.alpha1, 1)}°` },
            tyLe: { gocPhai: duLieu.alpha1 },
          }}
        />
      </div>
    );
  }

  return (
    <div className="dcc-3d-khung">
      <div
        ref={hostRef}
        className="dcc-3d-canvas"
        role="img"
        aria-label="Mô hình 3D tam giác vuông đo chiều cao — xoay và phóng to thu nhỏ"
      />
      <div className="dcc-3d-thanh">
        <span className="dcc-phu">
          {duLieu.daNop
            ? '🔴 Cạnh đối (phần cần đo) · 🔵 Cạnh kề (khoảng cách ngang)'
            : 'Kéo để xoay mô hình 3D · Chụm hai ngón hoặc cuộn chuột để phóng to/thu nhỏ'}
        </span>
        <button
          type="button"
          className="nho phu"
          onClick={() => {
            if (camRef.current && ctrlRef.current && camInitRef.current) {
              camRef.current.position.copy(camInitRef.current.pos);
              ctrlRef.current.target.copy(camInitRef.current.target);
              ctrlRef.current.update();
            }
          }}
        >
          ↺ Về góc nhìn ban đầu
        </button>
      </div>
    </div>
  );
}
