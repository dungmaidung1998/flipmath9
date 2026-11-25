/**
 * FILE NÀY LÀM GÌ: Mô-đun TypeScript/JavaScript hỗ trợ xử lý dữ liệu và nghiệp vụ trong hệ thống FlipMath 9.
 * AI DÙNG: dùng chung
 * LẤY DỮ LIỆU TỪ: không truy vấn bảng trực tiếp
 * GỌI TỚI: không gọi mô-đun nội bộ khác
 */
/**
 * HÀNG ĐỢI BÀI LÀM KHI MẤT MẠNG (IndexedDB, bọc try/catch an toàn).
 * Mỗi bài nộp có `clientSubmissionId` duy nhất để máy chủ không bao giờ ghi trùng.
 */

const DB_NAME = 'flipmath9_offline';
const DB_VERSION = 1;
const STORE = 'pending_submissions';

export type BaiNopOffline = {
  clientSubmissionId: string;
  kuId: string;
  mode: 'chuan-bi' | 'van-dung';
  timeOnTaskSec: number;
  answers: { questionId: string; option: string | null; answerTimeSec: number | null }[];
  createdAt: number;
  /** Mã tài khoản đã làm bài. Chỉ gửi lại khi CHÍNH tài khoản này đang đăng nhập (máy dùng chung). */
  owner?: string;
};

/** Bài chờ quá 7 ngày thì bỏ, tránh gửi bài cũ khi đề đã đổi. */
const HAN_GIU_MS = 7 * 86400_000;

/** Lấy mã tài khoản đang đăng nhập từ phiên lưu sẵn trên máy (không cần mạng). */
async function maNguoiDung(): Promise<string | null> {
  try {
    const { supabaseBrowser } = await import('@/lib/supabase/client');
    const { data } = await supabaseBrowser().auth.getSession();
    return data.session?.user?.id ?? null;
  } catch {
    return null;
  }
}

/**
 * Hàm `taoMaLuotLam`: nhận (không tham số), xử lý nghiệp vụ và trả kết quả tương ứng.
 */
export function taoMaLuotLam(): string {
  try {
    if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
      return `sub_${crypto.randomUUID()}`;
    }
  } catch {
    /* fallback bên dưới */
  }
  return `sub_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 10)}`;
}

/**
 * Hàm `moDB`: nhận (không tham số), xử lý nghiệp vụ và trả kết quả tương ứng.
 */
function moDB(): Promise<IDBDatabase | null> {
  return new Promise((resolve) => {
    try {
      if (typeof window === 'undefined' || !('indexedDB' in window)) {
        resolve(null);
        return;
      }
      const req = window.indexedDB.open(DB_NAME, DB_VERSION);
      req.onupgradeneeded = () => {
        try {
          const db = req.result;
          if (!db.objectStoreNames.contains(STORE)) {
            db.createObjectStore(STORE, { keyPath: 'clientSubmissionId' });
          }
        } catch {
          /* bỏ qua */
        }
      };
      req.onsuccess = () => resolve(req.result);
      req.onerror = () => resolve(null);
    } catch {
      resolve(null);
    }
  });
}

/**
 * Hàm `luuBaiOffline`: nhận (item), xử lý nghiệp vụ và trả kết quả tương ứng.
 */
export async function luuBaiOffline(item: BaiNopOffline): Promise<boolean> {
  try {
    // Gắn chủ bài làm để học sinh khác dùng chung máy không gửi nhầm bài này dưới tài khoản của mình
    const owner = item.owner ?? (await maNguoiDung());
    if (!owner) return false;
    item = { ...item, owner };
    const db = await moDB();
    if (!db) return false;
    return await new Promise<boolean>((resolve) => {
      try {
        const tx = db.transaction(STORE, 'readwrite');
        tx.objectStore(STORE).put(item);
        tx.oncomplete = () => {
          db.close();
          resolve(true);
        };
        tx.onerror = () => {
          db.close();
          resolve(false);
        };
      } catch {
        resolve(false);
      }
    });
  } catch {
    return false;
  }
}

/**
 * Hàm `layDanhSachCho`: nhận (không tham số), xử lý nghiệp vụ và trả kết quả tương ứng.
 */
export async function layDanhSachCho(): Promise<BaiNopOffline[]> {
  try {
    const db = await moDB();
    if (!db) return [];
    return await new Promise<BaiNopOffline[]>((resolve) => {
      try {
        const tx = db.transaction(STORE, 'readonly');
        const req = tx.objectStore(STORE).getAll();
        req.onsuccess = () => {
          db.close();
          const list = Array.isArray(req.result) ? req.result : [];
          resolve(list.sort((a, b) => a.createdAt - b.createdAt));
        };
        req.onerror = () => {
          db.close();
          resolve([]);
        };
      } catch {
        resolve([]);
      }
    });
  } catch {
    return [];
  }
}

/**
 * Hàm `xoaBaiOffline`: nhận (clientSubmissionId), xử lý nghiệp vụ và trả kết quả tương ứng.
 */
export async function xoaBaiOffline(clientSubmissionId: string): Promise<void> {
  try {
    const db = await moDB();
    if (!db) return;
    await new Promise<void>((resolve) => {
      try {
        const tx = db.transaction(STORE, 'readwrite');
        tx.objectStore(STORE).delete(clientSubmissionId);
        tx.oncomplete = () => {
          db.close();
          resolve();
        };
        tx.onerror = () => {
          db.close();
          resolve();
        };
      } catch {
        resolve();
      }
    });
  } catch {
    /* bỏ qua */
  }
}

/**
 * Hàm `demBaiChoGui`: nhận (không tham số), xử lý nghiệp vụ và trả kết quả tương ứng.
 */
export async function demBaiChoGui(): Promise<number> {
  const list = await layDanhSachCho();
  return list.length;
}

/**
 * Hàm `dongBoHangDoi`: nhận (không tham số), xử lý nghiệp vụ và trả kết quả tương ứng.
 */
export async function dongBoHangDoi(): Promise<{ daGui: number; conLai: number }> {
  try {
    if (typeof navigator !== 'undefined' && !navigator.onLine) {
      return { daGui: 0, conLai: await demBaiChoGui() };
    }
    const toi = await maNguoiDung();
    if (!toi) return { daGui: 0, conLai: 0 };
    const tatCa = await layDanhSachCho();
    // Bỏ bài quá hạn giữ; chỉ gửi bài của chính người đang đăng nhập, bài của bạn khác để nguyên chờ bạn đó
    for (const it of tatCa) if (Date.now() - it.createdAt > HAN_GIU_MS || !it.owner) await xoaBaiOffline(it.clientSubmissionId);
    const items = tatCa.filter((it) => it.owner === toi && Date.now() - it.createdAt <= HAN_GIU_MS);
    let daGui = 0;
    for (const item of items) {
      try {
        const { owner: _chu, ...goi } = item;
        const res = await fetch('/api/quiz/submit', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(goi),
        });
        // Đã ghi thành công, trùng lặp hoặc lỗi dữ liệu vĩnh viễn (400/403/423) → bỏ khỏi hàng đợi để khỏi kẹt mãi
        if (res.ok || res.status === 400 || res.status === 403 || res.status === 423) {
          await xoaBaiOffline(item.clientSubmissionId);
          if (res.ok) daGui++;
        }
      } catch {
        // Vẫn mất mạng → dừng vòng lặp giữ phần còn lại
        break;
      }
    }
    const conLai = (await layDanhSachCho()).filter((it) => it.owner === toi).length;
    return { daGui, conLai };
  } catch {
    return { daGui: 0, conLai: 0 };
  }
}
