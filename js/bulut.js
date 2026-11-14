/* Tasarım Stüdyosu — telefon önizlemesi için tarayıcı içi sunucu.
   Python sunucusu olmadan çalışır: /api/* istekleri burada karşılanır,
   veriler bu tarayıcının IndexedDB'sinde tutulur (yalnız bu cihazda kalır).
   Yalnız telefon önizleme derlemesine girer; kullanıcı paketine girmez. */
(function () {
  'use strict';
  window.TS_CLOUD = true;
  window.TS_ONIZLEME = true;

  // ------------------------------------------------------------ depo (IndexedDB, olmazsa bellek)
  const mem = new Map();
  let dbp = null;
  function db() {
    if (dbp) return dbp;
    dbp = new Promise((res) => {
      try {
        const r = indexedDB.open('ts-onizleme', 1);
        r.onupgradeneeded = () => r.result.createObjectStore('kv');
        r.onsuccess = () => res(r.result);
        r.onerror = () => res(null);
      } catch (e) { res(null); }
    });
    return dbp;
  }
  async function tx(mode, fn) {
    const d = await db();
    if (!d) return fn(null);
    return new Promise((res, rej) => {
      try {
        const t = d.transaction('kv', mode), st = t.objectStore('kv');
        const out = fn(st);
        t.oncomplete = () => res(typeof IDBRequest !== 'undefined' && out instanceof IDBRequest ? out.result : out);
        t.onerror = () => rej(t.error);
      } catch (e) { rej(e); }
    });
  }
  const K = {
    async get(k, d) {
      const dbh = await db();
      if (!dbh) return mem.has(k) ? JSON.parse(mem.get(k)) : d;
      const v = await tx('readonly', (st) => st.get(k));
      return v === undefined ? d : v;
    },
    async set(k, v) {
      const dbh = await db();
      if (!dbh) { mem.set(k, JSON.stringify(v)); return; }
      await tx('readwrite', (st) => st.put(v, k));
    },
    async del(k) {
      const dbh = await db();
      if (!dbh) { mem.delete(k); return; }
      await tx('readwrite', (st) => st.delete(k));
    },
    async list(prefix) {
      const dbh = await db();
      if (!dbh) return [...mem.keys()].filter((k) => k.startsWith(prefix)).map((k) => JSON.parse(mem.get(k)));
      return new Promise((res) => {
        const out = [];
        const t = dbh.transaction('kv', 'readonly');
        const range = IDBKeyRange.bound(prefix, prefix + '￿');
        const c = t.objectStore('kv').openCursor(range);
        c.onsuccess = () => { const cur = c.result; if (cur) { out.push(cur.value); cur.continue(); } else res(out); };
        c.onerror = () => res(out);
      });
    },
  };

  const uid = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
  const now = () => Date.now() / 1000;
  const pick = (o, keys) => { const r = {}; keys.forEach((k) => { if (o[k] !== undefined) r[k] = o[k]; }); return r; };
  const LISTKEYS = ['id', 'name', 'width', 'height', 'updated', 'created', 'thumb', 'format', 'owner'];
  const sunucuGerek = (ne) => { throw new Error(ne + ' telefon önizlemesinde çalışmaz; bilgisayardaki Stüdyo\'da dene.'); };

  const DEF_SETTINGS = { provider: 'local', anthropic_model: 'claude-sonnet-5-5', ai_mode: 'smart', img_provider: 'none', img_quality: 'medium', img_enhance: true, fonts_auto: false, backup_dir: '', backup_daily: false, pin: '' };

  async function sha(data) {
    try {
      const b = new TextEncoder().encode(data.slice(0, 200000) + data.length);
      const h = await crypto.subtle.digest('SHA-1', b);
      return [...new Uint8Array(h)].slice(0, 8).map((x) => x.toString(16).padStart(2, '0')).join('');
    } catch (e) { return uid(); }
  }

  // ------------------------------------------------------------ uç noktalar
  async function handle(path, method, body) {
    const p = path.split('?')[0];
    const seg = p.split('/');
    if (method === 'GET') {
      if (p === 'ping') return { ok: true, pin: false, version: (window.TS_SURUM || 'önizleme'), cloud: true };
      if (p === 'me') return { users: false, user: null, role: 'admin' };
      if (p === 'projects') return (await K.list('p:')).map((d) => pick(d, LISTKEYS)).sort((a, b) => (b.updated || 0) - (a.updated || 0));
      if (p === 'templates') return (await K.list('t:')).map((d) => pick(d, LISTKEYS.concat('slots'))).sort((a, b) => (b.updated || 0) - (a.updated || 0));
      if (seg[0] === 'projects' && seg[1]) { const d = await K.get('p:' + seg[1]); if (!d) throw new Error('Proje bulunamadı'); return d; }
      if (seg[0] === 'templates' && seg[1]) { const d = await K.get('t:' + seg[1]); if (!d) throw new Error('Şablon bulunamadı'); return d; }
      if (p === 'trash') {
        const lst = await K.list('x:'), keep = [];
        for (const d of lst) { if (now() - (d.deleted || now()) > 30 * 86400) await K.del('x:' + d.id); else keep.push(pick(d, ['id', 'name', 'width', 'height', 'thumb', 'deleted'])); }
        return keep.sort((a, b) => (b.deleted || 0) - (a.deleted || 0));
      }
      if (p === 'uploads') return (await K.list('u:')).sort((a, b) => (b.t || 0) - (a.t || 0)).map((u) => ({ url: u.url, name: u.name }));
      if (p === 'fonts') return K.get('fonts', []);
      if (p === 'brand') return K.get('brand', { enabled: false, colors: [] });
      if (p === 'requests') return K.get('requests', []);
      if (seg[0] === 'history') return K.get('h:' + seg[1], []);
      if (p === 'fontlib') return { downloaded: {}, status: {}, total: 0 };
      if (p === 'stock') return { photos: [], noKey: true };
      if (p === 'settings') { const s = Object.assign({}, DEF_SETTINGS, await K.get('settings', {})); s.has_anthropic_key = false; s.has_pexels_key = false; return s; }
      if (p === 'system') return { version: window.TS_SURUM || '', python: '-', os: 'Telefon önizlemesi (tarayıcı)', python_ok: true, data_writable: true, data_dir: 'Bu tarayıcı', provider: 'local', has_key: false, projects: (await K.list('p:')).length, uploads: (await K.list('u:')).length, fonts: 0 };
      if (p === 'info') return { port: 0, ips: [], https: false, urls: [], https_urls: [] };
      if (p === 'users') return [];
      if (p === 'backup-json') return backupJson();
      if (p === 'kampanya') sunucuGerek('Kampanya sayfası yayını');
      if (seg[0] === 'job') throw new Error('İş bulunamadı');
      throw new Error('Önizlemede yok: ' + p);
    }
    if (method === 'DELETE') {
      if (seg[0] === 'projects' && seg[1]) {
        const d = await K.get('p:' + seg[1]);
        if (d) { d.deleted = now(); await K.set('x:' + d.id, d); await K.del('p:' + seg[1]); }
        await K.del('h:' + seg[1]);
        return { ok: true };
      }
      if (seg[0] === 'templates' && seg[1]) { await K.del('t:' + seg[1]); return { ok: true }; }
      if (seg[0] === 'uploads' && seg[1]) { await K.del('u:' + seg[1]); return { ok: true }; }
      if (seg[0] === 'fonts' && seg[1]) { const f = (await K.get('fonts', [])).filter((x) => x.file !== seg[1]); await K.set('fonts', f); return { ok: true }; }
      return { ok: true };
    }
    // POST
    body = body || {};
    if (p === 'projects' || p === 'templates') {
      const pre = p === 'projects' ? 'p:' : 't:';
      const d = body;
      if (!d.id) { d.id = uid(); d.created = now(); }
      d.updated = now();
      await K.set(pre + d.id, d);
      return { ok: true, id: d.id, updated: d.updated };
    }
    if (p === 'upload') {
      const data = String(body.data || '');
      if (!/^data:image\//.test(data)) throw new Error('Sadece görsel dosyaları yüklenebilir');
      const name = (await sha(data)) + '.' + ((data.match(/^data:image\/([\w+]+)/) || [])[1] || 'png').replace('jpeg', 'jpg').replace('svg+xml', 'svg');
      await K.set('u:' + name, { url: data, name, t: Date.now() });
      return { url: data };
    }
    if (p === 'trash') {
      const d = await K.get('x:' + body.id);
      if (!d) throw new Error('Bulunamadı');
      await K.del('x:' + body.id);
      if (body.action === 'purge') return { ok: true };
      delete d.deleted; d.updated = now();
      await K.set('p:' + d.id, d);
      return { ok: true, id: d.id };
    }
    if (p === 'settings') { const s = Object.assign(await K.get('settings', {}), body); await K.set('settings', s); return Object.assign({}, DEF_SETTINGS, s); }
    if (p === 'brand') { const b = Object.assign(await K.get('brand', { enabled: false, colors: [] }), body); await K.set('brand', b); return b; }
    if (seg[0] === 'history') {
      let lst = await K.get('h:' + seg[1], []);
      const snap = body.snapshot;
      if (!snap || typeof snap.design !== 'object') throw new Error('Sürüm geçersiz');
      lst.unshift({ id: uid(), t: Math.floor(now()), label: String(snap.label || '').slice(0, 80), auto: !!snap.auto, thumb: String(snap.thumb || '').slice(0, 200000), design: snap.design });
      lst = lst.filter((x) => !x.auto).slice(0, 30).concat(lst.filter((x) => x.auto).slice(0, 20)).sort((a, b) => b.t - a.t);
      await K.set('h:' + seg[1], lst);
      return { ok: true, id: lst[0].id, count: lst.length };
    }
    if (p === 'requests') {
      let lst = await K.get('requests', []);
      if (body.id && body.status) { lst.forEach((r) => { if (r.id === body.id) r.status = body.status; }); await K.set('requests', lst); return lst; }
      const title = String(body.title || '').trim();
      if (!title) throw new Error('Ne istediğini kısaca yaz');
      const item = { id: uid(), client: body.client || '', name: body.name || '', title, detail: body.detail || '', due: body.due || '', files: [], status: 'new', at: Date.now() };
      lst.unshift(item); await K.set('requests', lst.slice(0, 500));
      return item;
    }
    if (p === 'font-upload') {
      const fam = String(body.family || body.name || 'Yazı tipi').replace(/\.(ttf|otf|woff2?)$/i, '');
      const f = { family: fam, weight: body.weight || 400, style: body.style === 'italic' ? 'italic' : 'normal', url: body.data, file: body.name || fam };
      const lst = (await K.get('fonts', [])).filter((x) => x.file !== f.file); lst.push(f); await K.set('fonts', lst);
      return f;
    }
    if (p === 'restore-json') return restoreJson(body.backup || {});
    if (p === 'fontlib') return { family: body.family, faces: [] };
    if (p === 'kampanya') sunucuGerek('Kampanya sayfası yayını');
    if (p === 'test-ai') return { ok: false, message: 'Telefon önizlemesinde yapay zeka bağlı değil.' };
    if (p === 'generate') {
      // yerel motor (yerel-motor.js): server.py'deki motorun birebir JavaScript karşılığı
      if (!window.YerelMotor) sunucuGerek('Yazarak hazırlama');
      const yeniden = /(benzer|çok değiştirme|profesyonel|yeniden tasarla|güzelleştir|modernleştir|yenile|taslak|aynı kals|bu (tasarım|çalışma|etiket|afiş|görsel|ambalaj)|çalışmayı|etiketi)/;
      if (body.reference && (body.mode === 'redesign' || yeniden.test(String(body.prompt || '').toLowerCase())))
        throw new Error('Yeniden tasarım için yapay zeka gerekiyor (taslaktaki yazıların okunması lazım); bilgisayardaki Stüdyo’da dene.');
      const b = await K.get('brand', null);
      const brand = body.useBrand !== false && b && b.enabled ? b : null;
      const [designs, reply] = window.YerelMotor.generate(String(body.prompt || ''), body.design || null, body.palette || [], body.reference || null, body.count || 1, brand);
      return { design: designs[0], designs, reply, provider: 'local', note: null };
    }
    if (['image-gen', 'test-image', 'ai-text', 'product-id', 'font-match', 'label-check', 'decompose', 'detect-text', 'layer-command', 'social-pack'].includes(p)) sunucuGerek('Yapay zeka özellikleri');
    if (['parse-table', 'table-template', 'adapt'].includes(p)) sunucuGerek('Bu işlem');
    if (['restore', 'backup-now', 'stock-get', 'users', 'login', 'logout', 'setup-admin', 'update'].includes(p)) sunucuGerek('Bu işlem');
    throw new Error('Önizlemede yok: ' + p);
  }

  async function backupJson() {
    return { app: 'tasarim-studyosu', v: 1, t: Date.now(), projects: await K.list('p:'), templates: await K.list('t:'), uploads: await K.list('u:'), fonts: await K.get('fonts', []), brand: await K.get('brand', {}), requests: await K.get('requests', []) };
  }
  async function restoreJson(b) {
    let n = 0;
    for (const d of b.projects || []) if (d && d.id) { await K.set('p:' + d.id, d); n++; }
    for (const d of b.templates || []) if (d && d.id) { await K.set('t:' + d.id, d); n++; }
    for (const u of b.uploads || []) if (u && u.name) { await K.set('u:' + u.name, u); n++; }
    if (b.fonts) await K.set('fonts', b.fonts);
    if (b.brand) await K.set('brand', b.brand);
    if (b.requests) await K.set('requests', b.requests);
    return { ok: true, files: n };
  }

  // ------------------------------------------------------------ indirme
  async function download(blob, name) {
    try {
      const dl = window.claude && window.claude.use ? await window.claude.use('downloads') : null;
      if (dl) {
        const buf = new Uint8Array(await blob.arrayBuffer());
        await dl.save({ filename: name, data: buf });
        return true;
      }
    } catch (e) {
      if (window.toast) window.toast('İndirme yapılmadı: ' + (e && e.message || e), true);
      return false;
    }
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob); a.download = name;
    document.body.appendChild(a); a.click(); a.remove();
    setTimeout(() => URL.revokeObjectURL(a.href), 4000);
    return true;
  }

  window.Cloud = {
    api(path, opts = {}) { return handle(path, opts.method || (opts.body ? 'POST' : 'GET'), opts.body); },
    download,
    store: K,
  };

  // Uygulama bazı yerlerde fetch('/api/...') kullanıyor: onları da buraya yönlendir.
  const ofetch = window.fetch.bind(window);
  window.fetch = function (input, init) {
    const u = typeof input === 'string' ? input : (input && input.url) || '';
    const m = u.match(/^(?:https?:\/\/[^/]+)?\/api\/(.+)$/);
    if (!m) return ofetch(input, init);
    const method = (init && init.method) || 'GET';
    let body = null;
    try { body = init && init.body ? JSON.parse(init.body) : null; } catch (e) { body = null; }
    return handle(m[1], method, body).then(
      (j) => new Response(JSON.stringify(j), { status: 200, headers: { 'Content-Type': 'application/json' } }),
      (e) => new Response(JSON.stringify({ error: e.message }), { status: 400, headers: { 'Content-Type': 'application/json' } }),
    );
  };
})();
