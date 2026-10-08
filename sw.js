/* =========================================================================
   EL LÁTIGO · Service Worker
   - Permite instalar la app en el celular (ícono en la pantalla de inicio).
   - "Red primero": con internet SIEMPRE carga la versión más nueva de la web,
     así cada mejora que subas aparece sola, sin reinstalar nada.
   - Sin internet, abre la última versión guardada.
   - Nunca toca las llamadas a Google Sheets (eso lo maneja la app).
   Si cambias este archivo, sube el número de VERSION.
   ========================================================================= */
const VERSION = 'latigo-v2.4.0';
const BASICOS = ['./', './manifest.webmanifest', './img/icon-192.png', './img/logo-header.png', './img/logo-emblema.jpg'];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(VERSION).then(c => c.addAll(BASICOS)).catch(() => {}).then(() => self.skipWaiting()));
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys()
      .then(ks => Promise.all(ks.filter(k => /^latigo-v/.test(k) && k !== VERSION).map(k => caches.delete(k))))   // no borra fotos ni lo compartido
      .then(() => self.clients.claim())
  );
});

// Recibir lo que se comparte a la app (chat exportado de WhatsApp, capturas, texto) — Android con la app instalada
self.addEventListener('fetch', e => {
  const req = e.request, url = new URL(req.url);
  if (req.method !== 'POST' || url.origin !== self.location.origin || !/\/compartir\/?$/.test(url.pathname)) return;
  e.respondWith((async () => {
    try {
      const fd = await req.formData(), c = await caches.open('latigo-share');
      await Promise.all((await c.keys()).map(k => c.delete(k)));
      const base = self.registration.scope, meta = { title: fd.get('title') || '', text: fd.get('text') || '', url: fd.get('url') || '', files: [] };
      const files = fd.getAll('files').filter(f => f && typeof f === 'object');
      for (let i = 0; i < files.length; i++) {
        const f = files[i], key = new URL('__share/' + i, base).href;
        await c.put(key, new Response(f, { headers: { 'Content-Type': f.type || 'application/octet-stream' } }));
        meta.files.push({ key, name: f.name || ('archivo-' + i), type: f.type || '' });
      }
      await c.put(new URL('__share/meta', base).href, new Response(JSON.stringify(meta), { headers: { 'Content-Type': 'application/json' } }));
    } catch (err) {}
    return Response.redirect(new URL('./?compartido=1', self.registration.scope).href, 303);
  })());
});

self.addEventListener('fetch', e => {
  const req = e.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);
  if (/script\.google(usercontent)?\.com$/.test(url.hostname)) return;   // base de datos: siempre directo

  // Librerías y tipografías externas: caché primero (no cambian)
  if (url.origin !== self.location.origin) {
    e.respondWith(
      caches.match(req).then(hit => hit || fetch(req).then(res => {
        const copy = res.clone(); caches.open(VERSION).then(c => c.put(req, copy)); return res;
      }))
    );
    return;
  }

  // Archivos propios: red primero (siempre lo más nuevo), caché si no hay internet
  e.respondWith(
    fetch(req).then(res => {
      if (res.ok && !res.redirected) { const copy = res.clone(); caches.open(VERSION).then(c => c.put(req, copy)); }
      return res;
    }).catch(() =>
      caches.match(req, { ignoreSearch: req.mode === 'navigate' })
        .then(hit => hit || (req.mode === 'navigate' ? caches.match('./') : undefined))
    )
  );
});
