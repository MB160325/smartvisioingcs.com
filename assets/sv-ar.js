/* SMART VISION — Arabic pages: mobile menu, live content from the dashboard, galleries, modals and request forms */
(function () {
  var C = window.SV || {}, live = C.url && C.key && !/YOUR-/.test(C.url), H = { apikey: C.key, Authorization: 'Bearer ' + C.key };
  var $ = function (s, r) { return (r || document).querySelector(s); }, $$ = function (s, r) { return [].slice.call((r || document).querySelectorAll(s)); };
  var esc = function (s) { return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); };
  var get = function (t, o) { return live ? fetch(C.url + '/rest/v1/' + t + '?select=*&published=eq.true&order=' + (o || 'created_at.desc'), { headers: H }).then(function (r) { return r.ok ? r.json() : []; }).catch(function () { return []; }) : Promise.resolve([]); };
  var CATS = { Architecture: 'العمارة', Structure: 'الإنشائي', MEP: 'MEP', 'Site Supervision': 'الإشراف على التنفيذ' };
  var GEN = /^(architecture|structure|mep|site)\b.*\b(drawing|photo|visual)\b/i;

  /* mobile menu */
  var mb = $('.mb'), nv = $('header nav'); if (mb && nv) mb.onclick = function () { nv.classList.toggle('open'); };

  /* generic modal */
  var md = $('#md');
  function openMd(html) { if (!md) return; $('#mdc').innerHTML = html; md.classList.add('on'); document.body.style.overflow = 'hidden'; }
  function closeMd() { if (md) { md.classList.remove('on'); document.body.style.overflow = ''; } }
  if (md) { md.addEventListener('click', function (e) { if (e.target === md || e.target.closest('.x')) closeMd(); }); document.addEventListener('keydown', function (e) { if (e.key === 'Escape') { closeMd(); var l = $('#alb'); if (l) l.classList.remove('on'); } }); }

  /* project gallery (only the clicked project's own images) */
  function openGal(im, i) {
    var o = $('#alb'); if (!o) { o = document.createElement('div'); o.id = 'alb'; o.className = 'alb'; o.innerHTML = '<button class="x">✕</button><button class="p">›</button><img class="m" alt=""><button class="n">‹</button><div class="c"></div><div class="t"></div>'; document.body.appendChild(o);
      o._go = function (n) { o._i = (n + o._im.length) % o._im.length; $('.m', o).src = o._im[o._i]; $('.c', o).textContent = (o._i + 1) + ' / ' + o._im.length; $$('.t img', o).forEach(function (t, k) { t.classList.toggle('on', k === o._i); }); };
      $('.x', o).onclick = function () { o.classList.remove('on'); }; $('.p', o).onclick = function () { o._go(o._i - 1); }; $('.n', o).onclick = function () { o._go(o._i + 1); };
      o.addEventListener('click', function (e) { if (e.target === o) o.classList.remove('on'); if (e.target.dataset && e.target.dataset.k) o._go(+e.target.dataset.k); });
      document.addEventListener('keydown', function (e) { if (!o.classList.contains('on')) return; if (e.key === 'ArrowRight') o._go(o._i - 1); if (e.key === 'ArrowLeft') o._go(o._i + 1); }); }
    o._im = im; var multi = im.length > 1; $('.t', o).innerHTML = multi ? im.map(function (u, k) { return '<img src="' + esc(u) + '" data-k="' + k + '" alt="">'; }).join('') : '';
    $('.p', o).style.display = $('.n', o).style.display = $('.c', o).style.display = multi ? '' : 'none'; o._go(i); o.classList.add('on');
  }

  /* projects: static cards work offline; dashboard projects replace them when available */
  var grid = $('#pgrid');
  if (grid) {
    var cur = 'all';
    var bind = function () { $$('.pc', grid).forEach(function (c) { if (c._b) return; c._b = 1; c.onclick = function () { openGal(JSON.parse(c.dataset.imgs), 0); }; }); };
    var flt = function () { $$('.pc', grid).forEach(function (c) { c.classList.toggle('h', !(cur === 'all' || c.dataset.cat === cur)); }); };
    $$('.flt button').forEach(function (b) { b.onclick = function () { cur = b.dataset.f; $$('.flt button').forEach(function (x) { x.classList.toggle('on', x === b); }); flt(); }; });
    bind();
    get('projects').then(function (rows) {
      if (!rows.length) return;
      grid.innerHTML = rows.map(function (p) {
        var im = (p.images && p.images.length ? p.images : [p.image_url]).filter(Boolean); if (!im.length) return '';
        return '<div class="pc" data-cat="' + esc(p.category) + '" data-imgs="' + esc(JSON.stringify(im)) + '"><img src="' + esc(im[0]) + '" alt="' + esc(p.title) + '" loading="lazy" decoding="async">' + (im.length > 1 ? '<span class="pcn"><i class="fa-regular fa-images"></i> ' + im.length + ' صور</span>' : '') + '<div class="ov"><small>' + esc(CATS[p.category] || p.category) + '</small>' + (GEN.test(p.title || '') ? '' : '<b>' + esc(p.title) + '</b>') + '</div></div>';
      }).join(''); bind(); flt();
    });
  }

  /* team: Arabic static cards + members added from the dashboard */
  var ex = $('#exec'), mem = $('#members');
  var tcard = function (n, r, b, img, e) { return '<div class="tm' + (e ? ' ex' : '') + '" data-n="' + esc(n) + '" data-r="' + esc(r) + '" data-b="' + esc(b) + '" data-i="' + esc(img) + '"><img src="' + esc(img) + '" alt="' + esc(n) + '" loading="lazy" decoding="async"><div class="bd"><b>' + esc(n) + '</b><span>' + esc(r) + '</span></div></div>'; };
  if (ex || mem) {
    document.addEventListener('click', function (e) { var c = e.target.closest('.tm'); if (!c) return; openMd('<img src="' + esc(c.dataset.i) + '" alt=""><div class="mc"><small>' + esc(c.dataset.r) + '</small><h3>' + esc(c.dataset.n) + '</h3><p>' + esc(c.dataset.b).replace(/\n+/g, '</p><p>') + '</p></div>'); });
    get('team', 'sort.asc,created_at.asc').then(function (rows) { rows.filter(function (x) { return !x.legacy; }).forEach(function (m) { var t = m.tier === 'executive', box = t ? ex : mem; if (box) box.insertAdjacentHTML('beforeend', tcard(m.name, m.role || '', m.bio || '', m.photo_url, t)); }); });
  }

  /* news: Arabic static articles + articles published from the dashboard */
  var nl = $('#nlist');
  if (nl) {
    var ncard = function (n) { var d = new Date(n.created_at).toLocaleDateString('ar-EG', { day: 'numeric', month: 'long', year: 'numeric' }); return '<article class="nc" data-t="' + esc(n.title) + '" data-c="' + esc(n.category || 'أخبار') + '" data-d="' + esc(d) + '" data-i="' + esc(n.image_url) + '" data-b="' + esc(n.body || '') + '"><img src="' + esc(n.image_url) + '" alt="' + esc(n.title) + '" loading="lazy" decoding="async"><div class="bd"><small>' + esc(n.category || 'أخبار') + '</small><h3>' + esc(n.title) + '</h3><p>' + esc((n.body || '').slice(0, 130)) + '…</p><span class="dt">' + d + '</span></div><span class="rm">اقرأ المقال ←</span></article>'; };
    nl.addEventListener('click', function (e) { var c = e.target.closest('.nc'); if (!c) return; openMd('<img src="' + esc(c.dataset.i) + '" alt=""><div class="mc"><small>' + esc(c.dataset.c) + ' · ' + esc(c.dataset.d) + '</small><h3>' + esc(c.dataset.t) + '</h3><p>' + esc(c.dataset.b).replace(/\n+/g, '</p><p>') + '</p></div>'); });
    get('news').then(function (rows) { var fresh = rows.filter(function (x) { return !x.legacy; }); if (fresh.length) nl.insertAdjacentHTML('afterbegin', fresh.map(ncard).join('')); });
  }

  /* partners added from the dashboard */
  var pl = $('#ptl');
  if (pl) get('partners', 'sort.asc,created_at.asc').then(function (rows) { rows.filter(function (x) { return !x.legacy; }).forEach(function (p) { pl.insertAdjacentHTML('beforeend', '<div class="ptc"><div class="lg"><img src="' + esc(p.logo_url) + '" alt="' + esc(p.name) + '" loading="lazy"></div><b>' + esc(p.name) + '</b></div>'); }); });

  /* request forms (contact, consultation, career) → dashboard + email to admins */
  $$('form.rqf').forEach(function (f) {
    f.addEventListener('submit', function (e) {
      e.preventDefault(); var m = $('.fm', f), b = $('button[type=submit]', f), d = {}; new FormData(f).forEach(function (v, k) { d[k] = String(v).trim(); }); b.disabled = true; m.style.color = '';
      var career = f.dataset.career !== undefined, row;
      if (career) row = { kind: 'career', name: (d.first + ' ' + d.last).trim(), email: d.email, phone: d.phone, subject: 'طلب توظيف: ' + (d.position || ''), message: 'الوظيفة المطلوبة: ' + (d.position || '') + '\n\n' + (d.message || '') };
      else row = { kind: d.kind || 'contact', name: d.name, email: d.email, phone: d.phone, subject: d.subject || '', message: d.message };
      var ok = function () { f.reset(); m.style.color = '#7bd88f'; m.textContent = career ? 'تم استلام طلبك بنجاح! يرجى إرسال سيرتك الذاتية (PDF) إلى info@smartvisiongcs.com وسيتواصل معك فريق الموارد البشرية.' : 'شكراً لك! تم استلام طلبك وسنتواصل معك قريباً.'; };
      var bad = function () { m.style.color = '#ff8a80'; m.innerHTML = 'تعذر الإرسال الآن. يرجى مراسلتنا على <a href="mailto:info@smartvisiongcs.com?subject=' + encodeURIComponent(row.subject || 'طلب جديد') + '&body=' + encodeURIComponent(row.message + '\n\n' + row.name + ' - ' + row.phone) + '">info@smartvisiongcs.com</a>'; };
      (C.sendRequest ? C.sendRequest(row) : Promise.reject()).then(ok).catch(bad).then(function () { b.disabled = false; });
    });
  });
})();
