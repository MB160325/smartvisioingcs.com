/* SMART VISION — Arabic pages: mobile menu, live content from the dashboard, galleries, modals and request forms */
(function () {
  var C = window.SV || {}, live = C.url && C.key && !/YOUR-/.test(C.url), H = { apikey: C.key, Authorization: 'Bearer ' + C.key };
  var $ = function (s, r) { return (r || document).querySelector(s); }, $$ = function (s, r) { return [].slice.call((r || document).querySelectorAll(s)); };
  var esc = function (s) { return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); };
  var get = function (t, o) { return live ? fetch(C.url + '/rest/v1/' + t + '?select=*&published=eq.true&order=' + (o || 'created_at.desc'), { headers: H }).then(function (r) { return r.ok ? r.json() : []; }).catch(function () { return []; }) : Promise.resolve([]); };
  var CATS = { Architecture: 'العمارة', Structure: 'الإنشائي', MEP: 'MEP', 'Site Supervision': 'الإشراف على التنفيذ' };
  var tx = function (r, k) { return r[k + '_ar'] || r[k] || ''; };
  var GEN = /^(architecture|structure|mep|site)\b.*\b(drawing|photo|visual)\b/i;

  /* mobile menu */
  var mb = $('.mb'), nv = $('header nav'); if (mb && nv) mb.onclick = function () { nv.classList.toggle('open'); };

  /* generic modal */
  var md = $('#md');
  function openMd(html) { if (!md) return; $('#mdc').innerHTML = html; md.classList.add('on'); document.body.style.overflow = 'hidden'; }
  function closeMd() { if (md) { md.classList.remove('on'); document.body.style.overflow = ''; } }
  if (md) { md.addEventListener('click', function (e) { if (e.target === md || e.target.closest('.x')) closeMd(); }); document.addEventListener('keydown', function (e) { if (e.key === 'Escape') { closeMd(); var l = $('#alb'); if (l) l.classList.remove('on'); } }); }

  /* modal image slider: arrows + dots + swipe (news with several images) */
  function slide(root, im) {
    if (!root || im.length < 2) return; var img = $('.slm', root), i = 0, dots = $$('.sd i', root);
    var go = function (n) { i = (n + im.length) % im.length; img.src = im[i]; dots.forEach(function (d, k) { d.classList.toggle('on', k === i); }); };
    $('.sbn.p', root).onclick = function () { go(i - 1); }; $('.sbn.n', root).onclick = function () { go(i + 1); };
    var x0 = null; img.ontouchstart = function (e) { x0 = e.touches[0].clientX; }; img.ontouchend = function (e) { if (x0 == null) return; var dx = e.changedTouches[0].clientX - x0; if (Math.abs(dx) > 40) go(i + (dx < 0 ? 1 : -1)); x0 = null; }; go(0);
  }
  function sliderHtml(im) { return '<div class="sl"><img class="slm" src="' + esc(im[0]) + '" alt="">' + (im.length > 1 ? '<button type="button" class="sbn p" aria-label="السابق">›</button><button type="button" class="sbn n" aria-label="التالي">‹</button><div class="sd">' + im.map(function () { return '<i></i>'; }).join('') + '</div>' : '') + '</div>'; }

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
        return '<div class="pc" data-cat="' + esc(p.category) + '" data-imgs="' + esc(JSON.stringify(im)) + '"><img src="' + esc(im[0]) + '" alt="' + esc(tx(p, 'title')) + '" loading="lazy" decoding="async">' + (im.length > 1 ? '<span class="pcn"><i class="fa-regular fa-images"></i> ' + im.length + ' صور</span>' : '') + '<div class="ov"><small>' + esc(CATS[p.category] || p.category) + '</small>' + (!p.title_ar && GEN.test(p.title || '') ? '' : '<b>' + esc(tx(p, 'title')) + '</b>') + '</div></div>';
      }).join(''); bind(); flt();
    });
  }

  /* team / news / partners: Arabic fields from the dashboard. Static Arabic content is the offline fallback;
     when the dashboard holds the imported originals it takes over completely, otherwise new items are added to it. */
  var ex = $('#exec'), mem = $('#members');
  var tcard = function (n, r, b, img, e) { return '<div class="tm' + (e ? ' ex' : '') + '" data-n="' + esc(n) + '" data-r="' + esc(r) + '" data-b="' + esc(b) + '" data-i="' + esc(img) + '"><img src="' + esc(img) + '" alt="' + esc(n) + '" loading="lazy" decoding="async"><div class="bd"><b>' + esc(n) + '</b><span>' + esc(r) + '</span></div></div>'; };
  if (ex || mem) {
    document.addEventListener('click', function (e) { var c = e.target.closest('.tm'); if (!c) return; openMd('<img src="' + esc(c.dataset.i) + '" alt=""><div class="mc"><small>' + esc(c.dataset.r) + '</small><h3>' + esc(c.dataset.n) + '</h3><p>' + esc(c.dataset.b).replace(/\n+/g, '</p><p>') + '</p></div>'); });
    get('team', 'sort.asc,created_at.asc').then(function (rows) {
      if (!rows.length) return; if (rows.some(function (x) { return x.legacy; })) { if (ex) ex.innerHTML = ''; if (mem) mem.innerHTML = ''; }
      rows.forEach(function (m) { var t = m.tier === 'executive', box = t ? ex : mem; if (box) box.insertAdjacentHTML('beforeend', tcard(tx(m, 'name'), tx(m, 'role'), tx(m, 'bio'), m.photo_url, t)); });
    });
  }
  var nl = $('#nlist');
  if (nl) {
    var ncard = function (n) { var d = new Date(n.created_at).toLocaleDateString('ar-EG', { day: 'numeric', month: 'long', year: 'numeric' }), t = tx(n, 'title'), c = tx(n, 'category') || 'أخبار', b = tx(n, 'body'); return '<article class="nc" data-imgs="' + esc(JSON.stringify(n.images && n.images.length ? n.images : [n.image_url])) + '" data-t="' + esc(t) + '" data-c="' + esc(c) + '" data-d="' + esc(d) + '" data-i="' + esc(n.image_url) + '" data-b="' + esc(b) + '"><img src="' + esc(n.image_url) + '" alt="' + esc(t) + '" loading="lazy" decoding="async"><div class="bd"><small>' + esc(c) + '</small><h3>' + esc(t) + '</h3><p>' + esc(b.slice(0, 130)) + '…</p><span class="dt">' + d + '</span></div><span class="rm">اقرأ المقال ←</span></article>'; };
    nl.addEventListener('click', function (e) {
      var c = e.target.closest('.nc'); if (!c) return; var im = []; try { im = JSON.parse(c.dataset.imgs || '[]'); } catch (x) {} if (!im.length) im = [c.dataset.i];
      openMd(sliderHtml(im) + '<div class="mc"><small>' + esc(c.dataset.c) + ' · ' + esc(c.dataset.d) + (im.length > 1 ? ' · ' + im.length + ' صور' : '') + '</small><h3>' + esc(c.dataset.t) + '</h3><p>' + esc(c.dataset.b).replace(/\n+/g, '</p><p>') + '</p></div>'); slide($('#mdc .sl'), im);
    });
    get('news').then(function (rows) { if (!rows.length) return; var L = rows.some(function (x) { return x.legacy; }); if (L) nl.innerHTML = ''; nl.insertAdjacentHTML(L ? 'beforeend' : 'afterbegin', rows.map(ncard).join('')); });
  }
  var pl = $('#ptl');
  if (pl) get('partners', 'sort.asc,created_at.asc').then(function (rows) {
    if (!rows.length) return; if (rows.some(function (x) { return x.legacy; })) pl.innerHTML = '';
    rows.forEach(function (p) { pl.insertAdjacentHTML('beforeend', '<div class="ptc"><div class="lg"><img src="' + esc(p.logo_url) + '" alt="' + esc(tx(p, 'name')) + '" loading="lazy"></div><b>' + esc(tx(p, 'name')) + '</b></div>'); });
  });

  /* request forms (contact, consultation, career) → dashboard + email to admins */
  $$('form.rqf').forEach(function (f) {
    f.addEventListener('submit', function (e) {
      e.preventDefault(); var m = $('.fm', f), b = $('button[type=submit]', f), d = {}; new FormData(f).forEach(function (v, k) { d[k] = String(v).trim(); }); b.disabled = true; m.style.color = '';
      var career = f.dataset.career !== undefined, row, cv = null;
      if (career) { var fi = $('input[type=file]', f); cv = fi && fi.files[0]; if (!cv || !/\.(pdf|docx?)$/i.test(cv.name) || cv.size > 5 * 1024 * 1024) { m.style.color = '#ff8a80'; m.textContent = 'يرجى إرفاق سيرتك الذاتية بصيغة PDF أو Word وبحجم لا يتجاوز 5 ميغابايت.'; b.disabled = false; return; } }
      if (career) row = { kind: 'career', name: (d.first + ' ' + d.last).trim(), email: d.email, phone: d.phone, subject: 'طلب توظيف: ' + (d.position || ''), message: 'الوظيفة المطلوبة: ' + (d.position || '') + '\n\n' + (d.message || '') };
      else row = { kind: d.kind || 'contact', name: d.name, email: d.email, phone: d.phone, subject: d.subject || '', message: d.message };
      var ok = function () { f.reset(); m.style.color = '#7bd88f'; m.textContent = career ? 'تم استلام طلبك وسيرتك الذاتية بنجاح! سيتواصل معك فريق الموارد البشرية إذا توافق ملفك مع الوظيفة.' : 'شكراً لك! تم استلام طلبك وسنتواصل معك قريباً.'; };
      var bad = function () { m.style.color = '#ff8a80'; m.innerHTML = 'تعذر الإرسال الآن. يرجى مراسلتنا على <a href="mailto:info@smartvisiongcs.com?subject=' + encodeURIComponent(row.subject || 'طلب جديد') + '&body=' + encodeURIComponent(row.message + '\n\n' + row.name + ' - ' + row.phone) + '">info@smartvisiongcs.com</a>'; };
      (C.sendRequest ? C.sendRequest(row, cv) : Promise.reject()).then(ok).catch(bad).then(function () { b.disabled = false; });
    });
  });
})();
