const CACHE_STATIC = 'flipmath9-static-v1';
const CACHE_PAGES = 'flipmath9-pages-v1';

const STATIC_PREFIXES = [
  '/_next/static/',
  '/fonts/',
  '/chu-de/',
  '/vuon/',
  '/minh-hoa/',
  '/fluent/',
  '/tom-tat/',
  '/tro-choi/',
];

const STUDENT_PAGE_PREFIXES = [
  '/bai-hoc',
  '/hoc/',
  '/so-loi',
  '/tien-do',
  '/phieu/',
  '/on-thi-10',
  '/de-kiem-tra',
  '/kien-thuc-nen',
  '/ho-so/',
];

self.addEventListener('install', (event) => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_STATIC).then((cache) => cache.addAll(['/fonts/fonts.css']).catch(() => {}))
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys
          .filter((k) => k !== CACHE_STATIC && k !== CACHE_PAGES)
          .map((k) => caches.delete(k))
      )
    ).then(() => self.clients.claim())
  );
});

function isStaticAsset(url) {
  if (url.origin !== self.location.origin) {
    return url.href.includes('katex');
  }
  return (
    STATIC_PREFIXES.some((p) => url.pathname.startsWith(p)) ||
    /\.(?:woff2?|ttf|css|webp|png|jpe?g|svg)$/i.test(url.pathname)
  );
}

function isStudentPage(url) {
  if (url.origin !== self.location.origin) return false;
  return STUDENT_PAGE_PREFIXES.some((p) => url.pathname === p || url.pathname.startsWith(p));
}

self.addEventListener('fetch', (event) => {
  const req = event.request;
  if (req.method !== 'GET') return;

  const url = new URL(req.url);
  if (url.pathname.startsWith('/api/') || url.pathname.startsWith('/dang-nhap')) return;

  // Tài nguyên tĩnh (CSS, JS, font, hình minh hoạ, KaTeX): cache-first / stale-while-revalidate
  if (isStaticAsset(url)) {
    event.respondWith(
      caches.open(CACHE_STATIC).then(async (cache) => {
        const cached = await cache.match(req);
        const netPromise = fetch(req)
          .then((res) => {
            if (res && res.ok) cache.put(req, res.clone());
            return res;
          })
          .catch(() => null);
        return cached || (await netPromise) || new Response('', { status: 504 });
      })
    );
    return;
  }

  // Các trang học sinh đã mở: network-first, mất mạng thì đọc bản cache gần nhất
  if (req.mode === 'navigate' && isStudentPage(url)) {
    event.respondWith(
      caches.open(CACHE_PAGES).then(async (cache) => {
        try {
          const res = await fetch(req);
          // Không lưu trang bị chuyển hướng (ví dụ về trang đăng nhập). Trang đã lưu bị xoá khi đăng xuất (SignOut.tsx).
          const khongLuu = res.redirected;
          if (res && res.ok && !khongLuu) cache.put(req, res.clone());
          return res;
        } catch {
          const cached = await cache.match(req);
          if (cached) return cached;
          return new Response(
            '<!doctype html><html lang="vi"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Đang ngoại tuyến</title><body style="font-family:sans-serif;padding:24px;max-width:520px;margin:auto"><h1>📡 Đang mất mạng</h1><p>Trang này chưa được lưu sẵn trên máy. Em có thể mở lại các bài đã xem trước đó hoặc chờ có mạng lại.</p><p><a href="/bai-hoc">Quay lại trang Bài học</a></p></body></html>',
            { status: 503, headers: { 'Content-Type': 'text/html; charset=utf-8' } }
          );
        }
      })
    );
  }
});
