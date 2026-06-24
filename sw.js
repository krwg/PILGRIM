const CACHE = 'pilgrim-v24';

function basePath() {
  const p = self.location.pathname;
  return p.endsWith('sw.js') ? p.slice(0, -'sw.js'.length) : '/';
}

const ASSETS = [
  'index.html',
  'assets/css/fonts.css',
  'assets/css/style.css',
  'assets/js/app.js',
  'manifest.json',
  'chapters/manifest.json',
  'chapters/ch01.txt',
  'chapters/ch02.txt',
  'assets/img/og-image.svg',
  'assets/img/icon-192.svg',
  'assets/img/annex-a.png',
  'assets/img/B-417.png',
  'assets/img/lutetia.png',
  'assets/img/SNCF.png',
  'assets/img/villascheme.png',
  'assets/img/weber.png',
  'assets/fonts/special-elite-400.woff2',
  'assets/img/paper-texture.svg',
  'assets/fonts/cormorant-400.woff2',
  'assets/fonts/cormorant-600.woff2',
  'assets/fonts/ibm-plex-400.woff2',
].map(p => basePath() + p);

self.addEventListener('message', e => {
  if (e.data?.type === 'SKIP_WAITING') self.skipWaiting();
});

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(ASSETS)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET') return;
  e.respondWith(
    caches.match(e.request).then(cached => {
      const net = fetch(e.request).then(res => {
        if (res.ok && e.request.url.startsWith(self.location.origin)) {
          const clone = res.clone();
          caches.open(CACHE).then(c => c.put(e.request, clone));
        }
        return res;
      }).catch(() => cached);
      return cached || net;
    })
  );
});
