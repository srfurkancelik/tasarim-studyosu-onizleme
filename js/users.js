/* Tasarım Stüdyosu — kullanıcılar ve roller.
   Yönetici (admin): her şeyi görür. Kullanıcı: Bağış · Kampanya bölümünü (Ramazan, Kurban, talebe,
   kumanya, aşure, hicri takvim, bağış kartları, teşekkür/kesim kartları, bağış QR) göremez; yalnızca kendi projelerini görür.
   Bilgisayar sürümünde giriş sunucuda (şifreler tuzlanıp PBKDF2 ile saklanır); çevrimiçi sürümde sayfanın sahibi yöneticidir. */
(function () {
  const U = (window.Users = { role: 'admin', me: null, enabled: false });
  const $ = (s, r = document) => r.querySelector(s), $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const esc = (s) => String(s == null ? '' : s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const CHARITY = 'Bağış · Kampanya';
  U.isAdmin = () => U.role === 'admin';

  async function post(path, body) {
    const r = await fetch('/api/' + path, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body || {}) });
    const j = await r.json().catch(() => ({}));
    if (!r.ok || j.error) throw new Error(j.error || 'Sunucu hatası ' + r.status);
    return j;
  }

  // ---------------------------------------------------------------- giriş ekranı
  U.loginScreen = function (setup) {
    return new Promise(() => {
      const ov = document.createElement('div'); ov.className = 'login-ov';
      ov.innerHTML = `<form class="login-card" autocomplete="on">
        <span class="m-logo"><i></i><i></i><i></i></span>
        <h1>${setup ? 'Yönetici hesabı oluştur' : 'Tasarım Stüdyosu'}</h1>
        <p class="muted">${setup ? 'Bu hesap her şeyi görür ve kullanıcıları yönetir.' : 'Devam etmek için giriş yap'}</p>
        ${setup ? '<label class="field"><span>Adın</span><input class="inp" name="name" autocomplete="name"></label>' : ''}
        <label class="field"><span>Kullanıcı adı</span><input class="inp" name="username" autocomplete="username" autocapitalize="none" spellcheck="false" required></label>
        <label class="field"><span>Şifre</span><input class="inp" name="password" type="password" autocomplete="${setup ? 'new-password' : 'current-password'}" required minlength="${setup ? 6 : 1}"></label>
        <div class="login-err" id="lgErr"></div>
        <button class="btn primary" type="submit" style="width:100%">${setup ? 'Oluştur ve giriş yap' : 'Giriş yap'}</button>
      </form>`;
      document.body.appendChild(ov);
      setTimeout(() => $('input[name="' + (setup ? 'name' : 'username') + '"]', ov).focus(), 50);
      $('form', ov).onsubmit = async (e) => {
        e.preventDefault();
        const f = new FormData(e.target), btn = $('button', ov);
        btn.disabled = true; $('#lgErr', ov).textContent = '';
        try { await post(setup ? 'setup-admin' : 'login', Object.fromEntries(f)); location.reload(); }
        catch (er) { $('#lgErr', ov).textContent = er.message; btn.disabled = false; }
      };
    });
  };
  U.logout = async function () { try { await post('logout'); } catch (e) {} location.reload(); };

  // ---------------------------------------------------------------- başlangıç
  U.init = async function () {
    if (window.TS_CLOUD) {
      // çevrimiçi sürüm: sayfanın sahibi yönetici, paylaşılan kişiler kullanıcı
      try {
        const user = await Promise.race([window.claude && window.claude.use ? window.claude.use('user') : null, new Promise((r) => setTimeout(() => r(null), 4000))]);
        U.role = user && typeof user.isOwner === 'function' && !user.isOwner() ? 'user' : 'admin';
        U.cloud = true;
      } catch (e) { U.role = 'admin'; }
    } else {
      let me = null;
      try { me = await fetch('/api/me').then((r) => r.json()); } catch (e) {}
      if (me) {
        U.enabled = !!me.users;
        if (U.enabled && !me.user) { await U.loginScreen(false); return false; }
        U.me = me.user; U.role = me.role || 'admin';
      }
    }
    document.documentElement.classList.toggle('role-user', !U.isAdmin());
    document.documentElement.classList.toggle('role-admin', U.isAdmin());
    if (!U.isAdmin()) U.restrict();
    return true;
  };

  // ---------------------------------------------------------------- kullanıcıdan gizle
  U.allowed = (t) => U.isAdmin() || !t || t.cat !== CHARITY;
  U.restrict = function () {
    const L = window.Library;
    if (L) {
      for (let i = L.templates.length - 1; i >= 0; i--) if (L.templates[i].cat === CHARITY) L.templates.splice(i, 1);
      L.cats = L.cats.filter((c) => c !== CHARITY);
    }
    if (window.Coach && Array.isArray(window.Coach.BLOCKS)) for (let i = window.Coach.BLOCKS.length - 1; i >= 0; i--) if (/Bağış/.test(window.Coach.BLOCKS[i].cat || '')) window.Coach.BLOCKS.splice(i, 1);
    if (window.P5 && window.P5._specialBase) window.P5.specialDays = window.P5._specialBase;
    if (window.P7) {
      const no = () => window.App.toast('Bu bölüm yalnızca yönetici içindir', true);
      ['campaignKit', 'calendar', 'thanks', 'addDonate', 'progress'].forEach((k) => { if (window.P7[k]) window.P7[k] = no; });
      window.P7.nextFor = () => null;
      window.P7.hijriEvents = () => [];
    }
    if (window.P8) { window.P8.qrBadge = () => window.App.toast('Bu bölüm yalnızca yönetici içindir', true); window.P8.ics = window.P8.qrBadge; }
    if (window.Food) { if (window.Food.SAMPLES) Object.keys(window.Food.SAMPLES).forEach((k) => delete window.Food.SAMPLES[k]); }
  };

  // ---------------------------------------------------------------- Ayarlar → Kullanıcılar
  U.settingsCard = function () {
    if (U.cloud) return `<section class="card set-users"><h3>Kullanıcılar</h3><p class="muted" style="font-size:13px">${U.isAdmin() ? 'Bu sayfanın sahibi olarak <b>yöneticisin</b>: Bağış · Kampanya bölümünü yalnızca sen görürsün. Sayfayı paylaştığın kişiler <b>kullanıcı</b> olarak girer; bağış, kampanya, talebe ve kurban tasarımlarını görmezler.' : 'Bu sayfaya <b>kullanıcı</b> olarak giriyorsun.'}</p></section>`;
    if (!U.enabled) return `<section class="card set-users"><h3>Kullanıcılar</h3><p class="muted" style="font-size:13px">Şu an uygulamayı herkes yönetici olarak kullanıyor. Kullanıcı sistemi açılınca giriş zorunlu olur; <b>yönetici</b> her şeyi görür, <b>kullanıcılar</b> Bağış · Kampanya bölümünü (Ramazan, Kurban, talebe, kumanya, aşure, hicri takvim, bağış kartları) göremez ve yalnızca kendi projelerini görür.</p><button class="btn primary" id="usSetup">Yönetici hesabı oluştur</button></section>`;
    return `<section class="card set-users"><div class="us-head"><h3>Kullanıcılar</h3><span class="muted" style="font-size:13px">Giriş: <b>${esc(U.me && U.me.name)}</b> · ${U.isAdmin() ? 'Yönetici' : 'Kullanıcı'}</span><span style="flex:1"></span><button class="btn sm" id="usPw">Şifremi değiştir</button><button class="btn sm ghost" id="usOut">Çıkış yap</button></div>
      ${U.isAdmin() ? `<div class="us-list" id="usList"><span class="muted">yükleniyor…</span></div><button class="btn sm primary" id="usAdd" style="margin-top:10px">+ Kullanıcı ekle</button>` : '<p class="muted" style="font-size:13px">Kullanıcıları yalnızca yönetici yönetir.</p>'}</section>`;
  };
  U.bindSettings = function (page) {
    const A = window.App;
    const s = $('#usSetup', page); if (s) s.onclick = () => U.loginScreen(true);
    const o = $('#usOut', page); if (o) o.onclick = () => U.logout();
    const pw = $('#usPw', page);
    if (pw) pw.onclick = () => A.dialog(`<div class="d-body"><h3>Şifremi değiştir</h3><label class="field"><span>Mevcut şifre</span><input class="inp" type="password" id="pwO" autocomplete="current-password"></label><label class="field"><span>Yeni şifre (en az 6)</span><input class="inp" type="password" id="pwN" autocomplete="new-password"></label></div><div class="d-foot"><button class="btn ghost" data-close>Vazgeç</button><button class="btn primary" id="pwOk">Değiştir</button></div>`, {
      onOpen: (box, close) => { $('#pwOk', box).onclick = async () => { try { await post('users', { action: 'password', old: $('#pwO', box).value, password: $('#pwN', box).value }); close(null); A.toast('Şifre değişti'); } catch (e) { A.toast(e.message, true); } }; },
    });
    const list = $('#usList', page); if (!list) return;
    const draw = async () => {
      let us = []; try { us = await A.api('users'); } catch (e) { list.textContent = e.message; return; }
      list.innerHTML = us.map((u) => `<div class="us-row" data-id="${u.id}"><span class="us-av">${esc((u.name || u.username)[0] || '?').toUpperCase()}</span><div><b>${esc(u.name)}</b><small>@${esc(u.username)}</small></div><span class="us-role ${u.role}">${u.role === 'admin' ? 'Yönetici' : 'Kullanıcı'}</span><button class="btn sm ghost" data-ed>Düzenle</button>${U.me && U.me.id === u.id ? '' : '<button class="btn sm ghost" data-del>Sil</button>'}</div>`).join('');
      $$('.us-row', list).forEach((row) => {
        const u = us.find((x) => x.id === row.dataset.id);
        const d = $('[data-del]', row); if (d) d.onclick = async () => { if (!(await A.confirmBox('Kullanıcı silinsin mi?', `${u.name} (@${u.username}) silinir; projeleri yöneticide kalır.`, 'Sil'))) return; try { await fetch('/api/users/' + u.id, { method: 'DELETE' }).then((r) => r.json()).then((j) => { if (j.error) throw new Error(j.error); }); draw(); } catch (e) { A.toast(e.message, true); } };
        $('[data-ed]', row).onclick = () => edit(u);
      });
    };
    const edit = (u) => A.dialog(`<div class="d-body"><h3>${u ? 'Kullanıcıyı düzenle' : 'Kullanıcı ekle'}</h3>
      <label class="field"><span>Ad</span><input class="inp" id="ueN" value="${esc(u ? u.name : '')}"></label>
      <label class="field"><span>Kullanıcı adı</span><input class="inp" id="ueU" value="${esc(u ? u.username : '')}" ${u ? 'disabled' : ''} autocapitalize="none" spellcheck="false"></label>
      <label class="field"><span>${u ? 'Yeni şifre (boş bırakırsan değişmez)' : 'Şifre (en az 6)'}</span><input class="inp" type="password" id="ueP" autocomplete="new-password"></label>
      <div class="field"><span>Rol</span><div class="seg" id="ueR"><button data-r="user" class="${!u || u.role !== 'admin' ? 'on' : ''}">Kullanıcı</button><button data-r="admin" class="${u && u.role === 'admin' ? 'on' : ''}">Yönetici</button></div></div>
      <p class="muted" style="font-size:12px;margin:6px 0 0"><b>Kullanıcı</b>: Bağış · Kampanya bölümünü (bağış, kampanya, talebe, kurban) göremez, yalnızca kendi projelerini görür. <b>Yönetici</b>: her şeyi görür.</p></div>
      <div class="d-foot"><button class="btn ghost" data-close>Vazgeç</button><button class="btn primary" id="ueOk">Kaydet</button></div>`, {
      onOpen: (box, close) => {
        let role = u && u.role === 'admin' ? 'admin' : 'user';
        $$('#ueR button', box).forEach((b) => (b.onclick = () => { role = b.dataset.r; $$('#ueR button', box).forEach((x) => x.classList.toggle('on', x === b)); }));
        $('#ueOk', box).onclick = async () => { try { await A.api('users', { body: { id: u && u.id, name: $('#ueN', box).value, username: $('#ueU', box).value, password: $('#ueP', box).value, role } }); close(null); A.toast(u ? 'Kaydedildi' : 'Kullanıcı eklendi'); draw(); } catch (e) { A.toast(e.message, true); } };
      },
    });
    $('#usAdd', page).onclick = () => edit(null);
    draw();
  };
})();
