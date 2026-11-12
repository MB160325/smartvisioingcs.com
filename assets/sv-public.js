/* SMART VISION — public layer: staff link, live news/projects, request form, chatbot */
(function () {
  var C = window.SV || {}, live = C.url && C.key && !/YOUR-/.test(C.url);
  var H = { apikey: C.key, Authorization: 'Bearer ' + C.key };
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var esc = function (s) { return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); };
  var get = function (t, o) { return fetch(C.url + '/rest/v1/' + t + '?select=*&published=eq.true&order=' + (o || 'created_at.desc'), { headers: H }).then(function (r) { return r.ok ? r.json() : []; }).catch(function () { return []; }); };

  /* ---- Staff login entry (icon only, keeps the header untouched) ---- */
  var ul = $('.nav-links'), isAr = document.documentElement.lang === 'ar';
  if (ul && !isAr) ul.insertAdjacentHTML('beforeend', '<li><a href="' + ((document.querySelector('link[hreflang=ar]') || {}).getAttribute ? document.querySelector('link[hreflang=ar]').getAttribute('href').replace('https://smartvisiongcs.com/', '') : 'ar.html') + '" hreflang="ar" lang="ar" title="النسخة العربية">عربي</a></li>');
  if (ul && !isAr) ul.insertAdjacentHTML('beforeend', '<li><a href="staff-login.html" title="Staff Login" aria-label="Staff Login"><i class="fa-solid fa-user-lock"></i></a></li>');
  var arHref = (document.querySelector('link[hreflang=ar]') || {}).getAttribute ? document.querySelector('link[hreflang=ar]').getAttribute('href').replace('https://smartvisiongcs.com/', '') : 'ar.html';
  if (!isAr) {
    var lst = document.createElement('style');
    lst.textContent = '.svlg{display:none}@media(max-width:900px){.svlg{display:inline-flex;position:fixed;left:14px;bottom:92px;z-index:9000;align-items:center;gap:8px;height:46px;padding:0 18px;border-radius:50px;background:#000;border:1px solid var(--gold-border,#C9A227);color:var(--gold-primary,#D4AF37);font:800 .9rem Cairo,Inter,sans-serif;text-decoration:none;box-shadow:0 8px 24px rgba(0,0,0,.65);animation:svlgi .6s ease-out}.svlg:active{background:var(--gold-primary,#D4AF37);color:#000}}@keyframes svlgi{from{opacity:0;transform:translateY(10px)}}';
    document.head.appendChild(lst);
    document.body.insertAdjacentHTML('beforeend', '<a class="svlg" href="' + arHref + '" hreflang="ar" lang="ar" aria-label="النسخة العربية"><i class="fa-solid fa-globe"></i> عربي</a>');
  }
  var grid = $('.overlay-nav-grid');
  if (grid && !isAr) grid.insertAdjacentHTML('beforeend', '<a href="' + arHref + '" class="overlay-nav-item" style="grid-column:span 2" hreflang="ar" lang="ar"><i class="fa-solid fa-language"></i><span>عربي · العربية</span></a>');
  if (grid) grid.insertAdjacentHTML('beforeend', '<a href="staff-login.html" class="overlay-nav-item" style="grid-column:span 2"><i class="fa-solid fa-user-lock"></i><span>Staff Login</span></a>');

  /* ---- Requests (contact form → Supabase → email to all admins) ---- */
  C.sendRequest = function (row) {
    if (!live) return Promise.reject(new Error('not configured'));
    var id = crypto.randomUUID();
    return fetch(C.url + '/rest/v1/requests', { method: 'POST', headers: Object.assign({ 'Content-Type': 'application/json', Prefer: 'return=minimal' }, H), body: JSON.stringify(Object.assign({ id: id }, row)) })
      .then(function (r) { if (!r.ok) throw new Error('save failed'); fetch(C.url + '/functions/v1/notify-admins', { method: 'POST', headers: Object.assign({ 'Content-Type': 'application/json' }, H), body: JSON.stringify({ id: id }) }).catch(function () {}); });
  };
  var cs = $('.contact-section');
  if (cs) {
    var st = document.createElement('style');
    st.textContent = '.rq{padding:100px 8%;background:var(--bg-rich-dark);position:relative;z-index:2}.rq-box{max-width:820px;margin:0 auto;background:var(--bg-glass-card);border:1px solid var(--gold-alpha);border-radius:16px;padding:44px;position:relative;overflow:hidden}.rq-box:before{content:"";position:absolute;top:0;left:0;width:100%;height:4px;background:var(--grad-gold)}.rq h2{text-align:center;text-transform:uppercase;letter-spacing:4px;margin-bottom:10px;font-size:clamp(1.6rem,3vw,2.4rem)}.rq h2 span{background:var(--grad-gold);-webkit-background-clip:text;-webkit-text-fill-color:transparent}.rq p.sub{text-align:center;color:var(--text-muted);margin-bottom:30px;font-size:.9rem}.rq-row{display:grid;grid-template-columns:1fr 1fr;gap:18px}.rq label{display:block;color:var(--gold-primary);font-size:.72rem;letter-spacing:2px;text-transform:uppercase;font-weight:600;margin:0 0 7px}.rq input,.rq select,.rq textarea{width:100%;background:rgba(0,0,0,.45);border:1px solid rgba(255,255,255,.1);padding:14px 16px;border-radius:8px;color:#fff;font:inherit;margin-bottom:18px;outline:0}.rq textarea{min-height:130px;resize:vertical}.rq input:focus,.rq select:focus,.rq textarea:focus{border-color:var(--gold-primary);box-shadow:0 0 15px rgba(212,175,55,.15)}.rq select option{background:#0a0a0a}.rq button{width:100%;padding:16px;border:0;border-radius:8px;background:var(--grad-gold);color:#000;font:700 .85rem Inter,sans-serif;letter-spacing:2px;text-transform:uppercase;cursor:pointer}.rq button:disabled{opacity:.6}.rq .msg{margin-top:16px;text-align:center;font-size:.9rem;min-height:1.2em}@media(max-width:600px){.rq-row{grid-template-columns:1fr}.rq-box{padding:28px 20px}.rq{padding:70px 5%}}';
    document.head.appendChild(st);
    cs.insertAdjacentHTML('afterend', '<section class="rq" id="request"><div class="rq-box"><h2>Send Us A <span>Request</span></h2><p class="sub">Tell us about your project — our team replies promptly.</p><form id="rqForm"><div class="rq-row"><div><label>Full Name</label><input name="name" required minlength="2" maxlength="120"></div><div><label>Email</label><input name="email" type="email" required maxlength="160"></div></div><div class="rq-row"><div><label>Phone</label><input name="phone" type="tel" maxlength="40"></div><div><label>Request Type</label><select name="kind"><option value="consultation">Engineering Consultation</option><option value="quote">Price Quote</option><option value="partnership">Partnership</option><option value="contact">General Inquiry</option></select></div></div><label>Subject</label><input name="subject" maxlength="160"><label>Message</label><textarea name="message" required maxlength="4000"></textarea><button type="submit">Send Request</button><div class="msg" id="rqMsg"></div></form></div></section>');
    $('#rqForm').addEventListener('submit', function (e) {
      e.preventDefault(); var f = e.target, b = $('button', f), m = $('#rqMsg'), d = {};
      new FormData(f).forEach(function (v, k) { d[k] = String(v).trim(); }); b.disabled = true; m.style.color = '';
      C.sendRequest(d).then(function () { f.reset(); m.style.color = '#7bd88f'; m.textContent = 'Thank you! Your request was received.'; })
        .catch(function () { m.style.color = '#ff8a80'; m.innerHTML = 'Could not send now. Please email <a href="mailto:info@smartvisiongcs.com" style="color:var(--gold-primary)">info@smartvisiongcs.com</a>.'; })
        .then(function () { b.disabled = false; });
    });
  }

  /* ---- helpers: when the dashboard holds imported content, it replaces the static markup ---- */
  var L = function (a) { return a.some(function (x) { return x.legacy; }); };
  var drop = function (sel) { document.querySelectorAll(sel).forEach(function (e) { e.remove(); }); };
  var LZ = ' loading="lazy" decoding="async"';

  /* ---- Live NEWS (newest first, same card design + modal) ---- */
  var ng = $('.news-grid');
  if (ng && live) get('news').then(function (items) {
    if (!items.length) return;
    if (L(items)) drop('.news-grid .news-card:not([data-dyn])');
    var first = ng.firstElementChild;
    items.forEach(function (n) {
      var d = new Date(n.created_at).toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' }).toUpperCase();
      var a = document.createElement('article'); a.className = 'news-card'; a.setAttribute('data-dyn', '1'); a.dataset.imgs = JSON.stringify(n.images && n.images.length ? n.images : [n.image_url]);
      a.innerHTML = '<div class="news-img-wrapper"><img src="' + esc(n.image_url) + '" alt="' + esc(n.title) + '"' + LZ + '><div class="news-date">' + d + '</div></div><div class="news-content"><div class="news-category"><i class="fa-solid fa-newspaper"></i> ' + esc(n.category || 'News') + '</div><h3 class="news-title">' + esc(n.title) + '</h3><p class="news-desc">' + esc((n.body || '').slice(0, 180)) + '</p><div class="news-full-text">' + (n.body || '').split(/\n+/).map(function (p) { return '<p>' + esc(p) + '</p>'; }).join('') + '</div><a href="#" class="read-more-btn">Read Article <i class="fa-solid fa-arrow-right-long"></i></a></div>';
      ng.insertBefore(a, first);
    });
    ng.addEventListener('click', function (e) {
      var b = e.target.closest('.read-more-btn'), c = b && b.closest('[data-dyn]'); if (!c) return; e.preventDefault();
      $('#modalImg').src = $('img', c).src; $('#modalDate').innerText = $('.news-date', c).innerText; $('#modalCategory').innerHTML = $('.news-category', c).innerHTML;
      $('#modalTitle').innerText = $('.news-title', c).innerText; $('#modalFullText').innerHTML = $('.news-full-text', c).innerHTML;
      var im = JSON.parse(c.dataset.imgs || '[]'); if (im.length > 1) { $('#modalFullText').insertAdjacentHTML('beforeend', '<div class="svg-th">' + im.map(function (u) { return '<img src="' + esc(u) + '" style="width:72px;height:54px;object-fit:cover;border-radius:6px;margin:12px 8px 0 0;cursor:pointer;border:1px solid rgba(212,175,55,.35)">'; }).join('') + '</div>'); $('#modalFullText .svg-th').onclick = function (e) { if (e.target.tagName === 'IMG') $('#modalImg').src = e.target.src; }; }
      $('#newsModal').classList.add('active'); document.body.classList.add('modal-open');
    });
  });

  /* ---- Gallery lightbox (one project's own images only) ---- */
  function openGal(im, i) {
    var o = $('#svlb');
    if (!o) {
      var st = document.createElement('style');
      st.textContent = '#svlb{position:fixed;inset:0;background:rgba(0,0,0,.96);z-index:100002;display:none;align-items:center;justify-content:center;flex-direction:column;gap:14px}#svlb.on{display:flex}#svlb .m{max-width:92vw;max-height:70vh;object-fit:contain;border:1px solid rgba(212,175,55,.3)}#svlb button{position:absolute;background:rgba(0,0,0,.65);border:1px solid rgba(212,175,55,.5);color:#D4AF37;width:46px;height:46px;border-radius:50%;font-size:1.2rem;cursor:pointer}#svlb .x{top:20px;right:20px}#svlb .p{left:18px;top:45%}#svlb .n{right:18px;top:45%}#svlb .c{color:#D4AF37;font:600 .8rem Inter,sans-serif;letter-spacing:3px}#svlb .t{display:flex;gap:8px;max-width:92vw;overflow-x:auto;padding:2px}#svlb .t img{width:64px;height:48px;object-fit:cover;border-radius:6px;cursor:pointer;opacity:.5;border:1px solid transparent;flex-shrink:0}#svlb .t img.on{opacity:1;border-color:#D4AF37}';
      document.head.appendChild(st); o = document.createElement('div'); o.id = 'svlb';
      o.innerHTML = '<button class="x">✕</button><button class="p">‹</button><img class="m" alt=""><button class="n">›</button><div class="c"></div><div class="t"></div>'; document.body.appendChild(o);
      o._go = function (n) { o._i = (n + o._im.length) % o._im.length; $('.m', o).src = o._im[o._i]; $('.c', o).textContent = (o._i + 1) + ' / ' + o._im.length; o.querySelectorAll('.t img').forEach(function (t, k) { t.classList.toggle('on', k === o._i); }); };
      $('.x', o).onclick = function () { o.classList.remove('on'); }; $('.p', o).onclick = function () { o._go(o._i - 1); }; $('.n', o).onclick = function () { o._go(o._i + 1); };
      o.addEventListener('click', function (e) { if (e.target === o) o.classList.remove('on'); if (e.target.dataset && e.target.dataset.k) o._go(+e.target.dataset.k); });
      document.addEventListener('keydown', function (e) { if (!o.classList.contains('on')) return; if (e.key === 'Escape') o.classList.remove('on'); if (e.key === 'ArrowRight') o._go(o._i - 1); if (e.key === 'ArrowLeft') o._go(o._i + 1); });
    }
    o._im = im; var multi = im.length > 1;
    $('.t', o).innerHTML = multi ? im.map(function (u, k) { return '<img src="' + esc(u) + '" data-k="' + k + '" alt="">'; }).join('') : '';
    $('.p', o).style.display = $('.n', o).style.display = $('.c', o).style.display = multi ? '' : 'none'; o._go(i); o.classList.add('on');
  }

  /* ---- Live PROJECTS ---- */
  var pg = $('#portfolio-grid');
  if (pg && live) get('projects').then(function (items) {
    if (!items.length) return;
    if (L(items)) drop('#portfolio-grid .project-card:not([data-dyn])');
    if (!$('#svpm')) { var ps = document.createElement('style'); ps.id = 'svpm'; ps.textContent = '.pmeta{display:flex;align-items:center;gap:12px;flex-wrap:wrap;margin-bottom:8px}.pmeta .proj-category{margin:0!important}.pc-n{display:inline-flex;align-items:center;gap:6px;border:1px solid rgba(212,175,55,.45);background:rgba(0,0,0,.45);color:#D4AF37;border-radius:50px;padding:3px 12px;font:600 .66rem Inter,sans-serif;letter-spacing:1.5px;text-transform:uppercase;white-space:nowrap}'; document.head.appendChild(ps); }
    var first = pg.firstElementChild;
    items.forEach(function (p) {
      var im = (p.images && p.images.length ? p.images : [p.image_url]).filter(Boolean);
      var c = document.createElement('div'); c.className = 'project-card in-view'; c.setAttribute('data-dyn', '1'); c.dataset.category = p.category; c._im = im;
      c.innerHTML = '<img src="' + esc(im[0]) + '" alt="' + esc(p.title) + '" class="project-img"' + LZ + '><div class="category-badge">' + esc(p.category) + '</div>' + '<div class="project-info">' + (im.length > 1 ? '<div class="pmeta"><span class="proj-category">' + esc(p.category) + '</span><span class="pc-n"><i class="fa-regular fa-images"></i> ' + im.length + ' PHOTOS</span></div>' : '<span class="proj-category">' + esc(p.category) + '</span>') + (/^(architecture|structure|mep|site)\b.*\b(drawing|photo|visual)\b/i.test(p.title || '') ? '' : '<div class="proj-title">' + esc(p.title) + '</div>') + '</div><div class="view-btn"><i class="fa-solid fa-expand"></i></div>';
      c.addEventListener('click', function () { openGal(im, 0); });
      pg.insertBefore(c, first);
    });
    document.querySelectorAll('.filter-btn[data-filter]').forEach(function (b) {
      b.addEventListener('click', function () {
        var f = b.dataset.filter; pg.querySelectorAll('[data-dyn]').forEach(function (c) { var m = f === 'all' || c.dataset.category === f; c.classList.toggle('is-hidden', !m); c.classList.toggle('in-view', m); });
      });
    });
  });

  /* ---- Live TEAM ---- */
  var ex = $('.executives-row'), dep = $('.department-row');
  if ((ex || dep) && live) get('team', 'sort.asc,created_at.asc').then(function (items) {
    if (!items.length) return;
    if (L(items)) { drop('.executives-row .team-card'); drop('.department-row .team-card-wrap'); }
    items.forEach(function (m) {
      var id = 'dyn' + m.id.replace(/-/g, ''); try { teamDB[id] = { img: m.photo_url, role: m.role || '', name: m.name, desc: m.bio || '' }; } catch (e) {}
      var isE = m.tier === 'executive';
      var card = '<div class="team-card ' + (isE ? 'is-executive' : 'is-member') + '" data-dyn="1" onclick="openBioModal(\'' + id + '\')"><div class="card-photo"><img src="' + esc(m.photo_url) + '" alt="' + esc(m.name) + '"' + LZ + '><span class="card-role-badge">' + esc(m.role) + '</span></div><div class="card-body"><div class="member-name">' + esc(m.name) + '</div><div class="card-action">' + (isE ? 'View Profile' : 'Profile') + '<span class="card-action-arrow"><i class="fa-solid fa-arrow-right"></i></span></div></div></div>';
      if (isE && ex) ex.insertAdjacentHTML('beforeend', card); else if (dep) dep.insertAdjacentHTML('beforeend', '<div class="team-card-wrap">' + card + '</div>');
    });
  });

  /* ---- Live PARTNERS (grid + scrolling strip) ---- */
  var ptg = $('.partners-grid');
  if (ptg && live) get('partners', 'sort.asc,created_at.asc').then(function (items) {
    if (!items.length) return;
    if (L(items)) drop('.partners-grid .partner-card');
    items.forEach(function (p) {
      var n = ptg.querySelectorAll('.partner-card').length + 1;
      ptg.insertAdjacentHTML('beforeend', '<div class="partner-card in-view" data-dyn="1"><span class="partner-number">' + (n < 10 ? '0' : '') + n + '</span><div class="partner-logo-frame"><img src="' + esc(p.logo_url) + '" alt="' + esc(p.name) + '"' + LZ + '></div><h3>' + esc(p.name) + '</h3></div>');
    });
    var tr = $('#marquee-track');
    if (tr && L(items)) { var one = items.map(function (p) { return '<div class="brand-item"><div class="logo-pill"><img src="' + esc(p.logo_url) + '" alt="' + esc(p.name) + '"' + LZ + '></div></div>'; }).join(''); tr.innerHTML = one + one; }
  });

  /* ---- Chatbot: real AI (Supabase edge function "chat") + local multilingual knowledge file (assets/sv-knowledge.json) ---- */
  var wa = 'https://wa.me/' + (C.whatsapp || '201021501250');
  var MENU = ['details', 'services', 'projects', 'team', 'partners', 'contact', 'careers', 'quote'];
  var KB = [], BY = {}, FB = { en: [], ar: [], eg: [] }, STAT = [], DY = { team: [], partners: [], news: [] }, ready = null, hist = [], aiFail = 0, busy = false, opened = false;
  var LG = ['en', 'ar', 'eg'], LN = { en: 'EN', ar: 'فصحى', eg: 'مصري' };
  var lang = (document.documentElement.lang === 'ar' || /^ar/i.test(navigator.language || '')) ? 'ar' : 'en';
  var EGW = {}; 'ايه ازاي عايز عاوز عايزه عاوزه دي ده دا كده كدا فين مش بتاع بتاعك دلوقتي دلوقت ليه كام عشان علشان اهو حاجه بقي بقا لسه برضو برضه اوي احنا انتوا انتو بتعملوا بتشتغلوا بتقدموا ازيك اخبارك معلش طب طيب خلاص يلا ايوه مين'.split(' ').forEach(function (w) { EGW[w] = 1; });
  var MINI = { greet: { a: { en: ['Hello! How can I help you with SMART VISION?'], ar: ['أهلاً بك! كيف يمكنني مساعدتك؟'], eg: ['أهلاً بيك! أقدر أساعدك إزاي؟'] }, f: [] } };
  var ROBOT = '<svg class="rbt" viewBox="0 -8 120 108" aria-hidden="true"><path d="M18 100C18 82 36 76 60 76C84 76 102 82 102 100Z" fill="#262626" stroke="#D4AF37" stroke-width="2"/><rect x="46" y="86" width="28" height="10" rx="3" fill="#161616" stroke="#8B6B15" stroke-width="1.2"/><circle cx="53" cy="91" r="2.2" fill="#FFD54A"/><circle cx="60" cy="91" r="2.2" fill="#8B6B15"/><circle cx="67" cy="91" r="2.2" fill="#8B6B15"/><rect x="52" y="68" width="16" height="10" fill="#3a3a3a"/><g class="hd"><circle cx="27" cy="55" r="4.5" fill="#D4AF37"/><circle cx="93" cy="55" r="4.5" fill="#D4AF37"/><rect x="30" y="34" width="60" height="40" rx="14" fill="#1d1d1d" stroke="#D4AF37" stroke-width="2.5"/><rect x="37" y="43" width="46" height="26" rx="9" fill="#000"/><circle class="ey" cx="50" cy="53" r="5.2"/><circle class="ey" cx="70" cy="53" r="5.2"/><rect class="mb" x="49" y="62" width="4" height="4" rx="1"/><rect class="mb" style="animation-delay:.15s" x="58" y="62" width="4" height="4" rx="1"/><rect class="mb" style="animation-delay:.3s" x="67" y="62" width="4" height="4" rx="1"/><path d="M60 8V0" stroke="#D4AF37" stroke-width="2.2" stroke-linecap="round"/><circle class="an" cx="60" cy="-1" r="3"/><path d="M31 37C31 17 45 8 60 8C75 8 89 17 89 37Z" fill="#D4AF37"/><rect x="54" y="8" width="12" height="29" rx="4" fill="#FFD54A"/><rect x="22" y="33" width="76" height="9" rx="4.5" fill="#B8932A"/><rect x="55" y="17" width="10" height="7" rx="2" fill="#fff" opacity=".85"/></g><g class="gr"><circle cx="104" cy="26" r="7.5" fill="none" stroke="#D4AF37" stroke-width="5" stroke-dasharray="3.1 3.1"/><circle cx="104" cy="26" r="5.4" fill="#D4AF37"/><circle cx="104" cy="26" r="2.2" fill="#0a0a0a"/></g></svg>';
  var T = {
    en: { ph: 'Type your question...', on: 'Online', hd: 'SMART VISION Assistant', nf: 'Just to make sure I understand you — did you mean one of these? 🤔', th: ['Thinking…', 'Checking blueprints…', 'Preparing your answer…'] },
    ar: { ph: 'اكتب سؤالك...', on: 'متصل', hd: 'مساعد SMART VISION', nf: 'للتأكد من فهمي لسؤالك — هل تقصد أحد هذه الأمور؟ 🤔', th: ['أفكر…', 'أراجع المخططات…', 'أجهّز لك الإجابة…'] },
    eg: { ph: 'اكتب سؤالك...', on: 'متصل', hd: 'مساعد SMART VISION', nf: 'عشان أتأكد إني فاهمك صح — تقصد واحدة من دول؟ 🤔', th: ['بفكر…', 'براجع المخططات…', 'بجهّزلك الرد…'] }
  };
  function nz(s) { return String(s).toLowerCase().replace(/[\u064B-\u065F\u0670\u0640]/g, '').replace(/[أإآٱ]/g, 'ا').replace(/ى/g, 'ي').replace(/ة/g, 'ه').replace(/ؤ/g, 'و').replace(/ئ/g, 'ي').replace(/[^\u0600-\u06FFa-z0-9\s]/g, ' ').replace(/(.)\1{2,}/g, '$1$1').replace(/\s+/g, ' ').trim(); }
  function lev(a, b) { var m = a.length, n = b.length; if (Math.abs(m - n) > 2) return 9; var p = [], i, j; for (j = 0; j <= n; j++) p[j] = j; for (i = 1; i <= m; i++) { var pr = p[0]; p[0] = i; for (j = 1; j <= n; j++) { var t = p[j]; p[j] = Math.min(p[j] + 1, p[j - 1] + 1, pr + (a[i - 1] === b[j - 1] ? 0 : 1)); pr = t; } } return p[n]; }
  function tm(t, k) { if (t === k) return 1; var ts = t.replace(/^(وال|بال|كال|فال|لل|ال)/, ''); if (ts === k) return .95; var kl = k.length; if (kl < 4) return 0; if (ts.length >= 4 && ((ts.indexOf(k) === 0 && ts.length <= kl + 4) || (k.indexOf(ts) === 0 && ts.length >= Math.max(5, kl - 1)))) return .85; if (kl < 5 || ts.length < 5) return 0; var d = Math.min(lev(t, k), lev(ts, k)); if (d <= 1) return .8; if (d === 2 && kl >= 7) return .65; return 0; }
  function score(it, full, toks) {
    var s = 0;
    it.nk.forEach(function (k) {
      if (k.indexOf(' ') > -1) {
        if ((' ' + full + ' ').indexOf(' ' + k + ' ') > -1) { s += 2; return; }
        var ws = k.split(' '), sc = ws.map(function (w) { var b = 0; toks.forEach(function (t) { var v = tm(t, w); if (v > b) b = v; }); return b; });
        if (Math.min.apply(null, sc) >= .65) s += 1.4 * sc.reduce(function (a, b) { return a + b; }, 0) / ws.length;
      } else { var b = 0; toks.forEach(function (t) { var v = tm(t, k); if (v > b) b = v; }); s += b; }
    });
    return s * (toks.length > 3 ? (it.w || 1) : 1);
  }
  function understand(q) {
    var full = nz(q), toks = full.split(' ').filter(Boolean);
    var r = KB.map(function (it) { return { it: it, s: score(it, full, toks) }; }).filter(function (x) { return x.s >= .6; }).sort(function (a, b) { return b.s - a.s; });
    if (!r.length) return { t: 'none' };
    var a = r[0], b = r[1];
    if (a.s >= .75 && (!b || a.s >= b.s * 1.35)) return { t: 'hit', it: a.it };
    return { t: 'maybe', o: r.slice(0, 3).map(function (x) { return x.it; }) };
  }
  function detect(q) { if (/[\u0600-\u06FF]/.test(q)) { var eg = nz(q).split(' ').some(function (w) { return EGW[w]; }); return eg ? 'eg' : 'ar'; } return /[a-z]/i.test(q) ? 'en' : lang; }

  /* live data from the dashboard: new team members, partners and news are known to the bot automatically */
  function dyn() {
    if (!live) return Promise.resolve();
    return Promise.all([get('team', 'sort.asc,created_at.asc'), get('partners', 'sort.asc,created_at.asc'), get('news')]).then(function (r) {
      DY.team = r[0] || []; DY.partners = r[1] || []; DY.news = r[2] || [];
      var T0 = DY.team, P0 = DY.partners, N0 = DY.news.slice(0, 3);
      if (T0.length && BY.team) {
        var l = T0.map(function (m) { return '• <b>' + esc(m.name) + '</b>' + (m.role ? ' — ' + esc(m.role) : ''); }).join('<br>');
        BY.team.a = { en: ['Our team (' + T0.length + ' people):<br>' + l + '<br><br>Meet everyone on the <a href="team.html">Team page</a>.'], ar: ['فريق عمل SMART VISION (' + T0.length + '):<br>' + l + '<br><br>تعرّف على الجميع في <a href="team.html">صفحة الفريق</a>.'], eg: ['فريق SMART VISION (' + T0.length + '):<br>' + l + '<br><br>اتعرف على الكل في <a href="team.html">صفحة الفريق</a>.'] };
      }
      if (P0.length && BY.partners) {
        var n = P0.map(function (p) { return esc(p.name); }).join('، ');
        BY.partners.a = { en: ['We work with leading developers and firms including <b>' + n.replace(/، /g, ', ') + '</b>. See them on the <a href="partnerships.html">Partnerships page</a>.'], ar: ['نتشارك مع كبرى شركات التطوير والمكاتب ومنها <b>' + n + '</b>. شاهدهم في <a href="partnerships.html">صفحة الشراكات</a>.'], eg: ['بنشتغل مع كبار شركات التطوير والمكاتب زي <b>' + n + '</b>. شوفهم في <a href="partnerships.html">صفحة الشراكات</a>.'] };
      }
      if (N0.length && BY.news) {
        var d = function (x) { return new Date(x.created_at).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }); };
        var nl = N0.map(function (x) { return '• <b>' + esc(x.title) + '</b> (' + d(x) + ')'; }).join('<br>');
        BY.news.a = { en: ['Our latest news:<br>' + nl + '<br><br>Read more in <a href="news.html">News</a>.'], ar: ['آخر أخبارنا:<br>' + nl + '<br><br>المزيد في <a href="news.html">صفحة الأخبار</a>.'], eg: ['آخر أخبارنا:<br>' + nl + '<br><br>التفاصيل في <a href="news.html">الأخبار</a>.'] };
      }
    }).catch(function () {});
  }
  function person(q) {
    var list = DY.team.length ? DY.team : STAT; if (!list.length) return null;
    var toks = nz(q).split(' ').filter(Boolean), best = null, bs = 0;
    list.forEach(function (m) {
      var c = 0; nz(m.name).split(' ').filter(function (w) { return w.length >= 4 && !/^(دكتور|مهندس|المهندس)$/.test(w); }).forEach(function (w) { if (toks.some(function (t) { return tm(t, w) >= .8; })) c++; });
      if (c > bs) { bs = c; best = m; }
    });
    return bs >= 1 ? best : null;
  }
  function personHtml(m) {
    var bio = String(m.bio || m.desc || '').replace(/\s+/g, ' ').trim(); if (bio.length > 560) bio = bio.slice(0, 557) + '…';
    var h = { en: 'Here\'s a quick profile:', ar: 'إليك نبذة سريعة:', eg: 'دي نبذة سريعة:' }[lang];
    return h + '<br><b>' + esc(m.name) + '</b>' + (m.role ? ' — ' + esc(m.role) : '') + (bio ? '<br>' + esc(bio) : '') + '<br><br><a href="team.html">' + ({ en: 'Team page', ar: 'صفحة الفريق', eg: 'صفحة الفريق' }[lang]) + '</a>';
  }
  function fix(h) {
    h = String(h).replace(/\{\{WA\}\}/g, wa);
    if (document.documentElement.lang === 'ar') h = h.replace(/href=(["'])contact\.html#request/g, 'href=$1ar-contact.html#form').replace(/href=(["'])(about|services|projects|partnerships|team|career|news|contact)\.html/g, 'href=$1ar-$2.html').replace(/href=(["'])index\.html/g, 'href=$1ar.html');
    return h;
  }
  function load() {
    if (!ready) ready = fetch('assets/sv-knowledge.json').then(function (r) { return r.json(); }).then(function (j) { KB = j.intents || []; FB = j.fallback || FB; STAT = j.team || []; }).catch(function () { KB = []; }).then(function () { KB.forEach(function (x) { BY[x.id] = x; x.nk = x.k.map(nz).filter(Boolean); }); if (!BY.greet) BY.greet = MINI.greet; }).then(dyn);
    return ready;
  }
  function pick(arr, o) { var i = Math.floor(Math.random() * arr.length); if (arr.length > 1 && i === o._l) i = (i + 1) % arr.length; o._l = i; return arr[i]; }
  function ans(it) { return fix(pick(it.a[lang] || it.a.ar || it.a.en, it)); }
  function plain(h) { return String(h).replace(/<br>/g, '\n').replace(/<[^>]+>/g, '').replace(/&amp;/g, '&'); }
  /* safe markdown for AI replies */
  function md(t) {
    t = esc(fix(t));
    t = t.replace(/\[([^\]]+)\]\(((?:https?:\/\/|mailto:|tel:)[^)\s]+|[\w\-./#?=&;]+)\)/g, function (m, a, u) { return '<a href="' + u + '"' + (/^https?:/.test(u) ? ' target="_blank" rel="noopener"' : '') + '>' + a + '</a>'; });
    t = t.replace(/\*\*([^*]+)\*\*/g, '<b>$1</b>').replace(/^\s*[-*•]\s+/gm, '• ').replace(/\n/g, '<br>');
    return t;
  }
  function ai() {
    if (!live || C.ai === false || aiFail >= 2) return Promise.reject();
    var ctl = new AbortController(), to = setTimeout(function () { ctl.abort(); }, 16000);
    return fetch(C.url + '/functions/v1/chat', { method: 'POST', headers: Object.assign({ 'Content-Type': 'application/json' }, H), body: JSON.stringify({ messages: hist.slice(-10), lang: lang }), signal: ctl.signal })
      .then(function (r) { clearTimeout(to); if (!r.ok) throw 0; return r.json(); })
      .then(function (j) { if (!j.reply) throw 0; aiFail = 0; return j.reply; })
      .catch(function (e) { clearTimeout(to); aiFail++; throw e; });
  }
  var cst = document.createElement('style');
  cst.textContent = '#svc-btn{position:fixed;right:22px;bottom:22px;width:60px;height:60px;border-radius:50%;border:1px solid var(--gold-border,#C9A227);background:radial-gradient(circle at 30% 25%,#1a1a1a,#000);color:var(--gold-primary,#D4AF37);font-size:1.4rem;cursor:pointer;z-index:9000;box-shadow:0 0 0 0 rgba(212,175,55,.5),0 8px 24px rgba(0,0,0,.6);animation:svp 2.8s infinite;transition:.3s}#svc-btn:hover{background:var(--gold-primary,#D4AF37);color:#000;transform:scale(1.06)}@keyframes svp{70%{box-shadow:0 0 0 16px rgba(212,175,55,0),0 8px 24px rgba(0,0,0,.6)}100%{box-shadow:0 0 0 0 rgba(212,175,55,0),0 8px 24px rgba(0,0,0,.6)}}'
    + '#svc-box{position:fixed;right:22px;bottom:94px;width:372px;max-width:calc(100vw - 28px);height:560px;max-height:calc(100dvh - 130px);background:rgba(8,8,8,.98);border:1px solid var(--gold-alpha,rgba(212,175,55,.3));border-radius:20px;display:none;flex-direction:column;z-index:9000;overflow:hidden;box-shadow:0 24px 60px rgba(0,0,0,.85),0 0 40px rgba(212,175,55,.08);font-family:Inter,Cairo,sans-serif}#svc-box.on{display:flex;animation:svin .35s cubic-bezier(.16,1,.3,1)}@keyframes svin{from{opacity:0;transform:translateY(18px) scale(.97)}}'
    + '.svc-h{padding:12px 14px;background:linear-gradient(110deg,#6f5410,#D4AF37 55%,#f1d46a);color:#000;display:flex;align-items:center;gap:11px}.svc-av{width:52px;height:46px;border-radius:14px;background:#050505;display:flex;align-items:center;justify-content:center;flex-shrink:0;border:2px solid rgba(0,0,0,.3);padding:4px 5px}.svc-h .tt{flex:1;line-height:1.3}.svc-h b{font-size:.88rem;display:block}.svc-h small{font-size:.68rem;display:flex;align-items:center;gap:6px;font-weight:600}.svc-h small:before{content:"";width:7px;height:7px;border-radius:50%;background:#1f9d4a;box-shadow:0 0 6px #1f9d4a}.svc-h button{background:rgba(0,0,0,.14);border:0;min-width:30px;height:30px;border-radius:50px;cursor:pointer;color:#000;font:800 .72rem Cairo,Inter,sans-serif;padding:0 9px}.svc-h button:hover{background:rgba(0,0,0,.3)}'
    + '.rbt{width:100%;height:100%;overflow:visible}.rbt .ey,.rbt .mb,.rbt .an{fill:#FFD54A}.rbt .ey{transform-box:fill-box;transform-origin:center;animation:rbk 4s infinite}@keyframes rbk{0%,92%,100%{transform:scaleY(1)}95%{transform:scaleY(.08)}}.rbt .mb{transform-box:fill-box;transform-origin:50% 100%;animation:rbm .45s ease-in-out infinite alternate;animation-play-state:paused}.go .rbt .mb{animation-play-state:running}@keyframes rbm{from{transform:scaleY(.5)}to{transform:scaleY(1.7)}}.rbt .gr{transform-box:fill-box;transform-origin:center;animation:rbg 2.2s linear infinite;animation-play-state:paused}.go .rbt .gr{animation-play-state:running}@keyframes rbg{to{transform:rotate(360deg)}}.rbt .hd{transform-origin:60px 74px;animation:rbh 1s ease-in-out infinite alternate;animation-play-state:paused}.go .rbt .hd{animation-play-state:running}@keyframes rbh{from{transform:rotate(-3deg)}to{transform:rotate(3deg)}}.rbt .an{animation:rba 1.1s ease-in-out infinite alternate}@keyframes rba{from{opacity:.25}to{opacity:1}}'
    + '#svc-log{flex:1;overflow-y:auto;padding:16px 14px;display:flex;flex-direction:column;gap:12px;scroll-behavior:smooth}#svc-log::-webkit-scrollbar{width:4px}#svc-log::-webkit-scrollbar-thumb{background:rgba(212,175,55,.3);border-radius:4px}.svc-r{display:flex;gap:8px;align-items:flex-end;animation:svm .35s ease-out}.svc-r.u{flex-direction:row-reverse}@keyframes svm{from{opacity:0;transform:translateY(8px)}}.svc-r .a{width:28px;height:24px;border-radius:9px;background:#000;border:1px solid var(--gold-border,#C9A227);display:flex;align-items:center;justify-content:center;flex-shrink:0;padding:2px}'
    + '.svc-m{max-width:82%;padding:11px 14px;border-radius:16px 16px 16px 4px;font-size:.85rem;line-height:1.8;color:#e6e6e6;background:rgba(255,255,255,.07);border:1px solid rgba(255,255,255,.06);word-break:break-word}.svc-m a{color:var(--gold-primary,#D4AF37);text-decoration:underline}.svc-m b{color:#fff}.svc-r.u .svc-m{background:linear-gradient(135deg,#D4AF37,#b8932a);color:#000;border:0;border-radius:16px 16px 4px 16px;font-weight:500}'
    + '.svc-th{display:flex;align-items:center;gap:10px;padding:8px 14px 8px 8px}.svc-th .hz{width:66px;height:58px;flex-shrink:0}.svc-th .sx{font-size:.78rem;color:#cfcfcf;display:flex;flex-direction:column;gap:5px;min-width:96px}.svc-th .sx i{display:flex;gap:4px}.svc-th .sx i b{width:6px;height:6px;border-radius:50%;background:#D4AF37;opacity:.3;animation:svd 1.1s infinite}.svc-th .sx i b:nth-child(2){animation-delay:.18s}.svc-th .sx i b:nth-child(3){animation-delay:.36s}@keyframes svd{30%{opacity:1;transform:translateY(-4px)}}'
    + '.svc-q{display:flex;flex-wrap:wrap;gap:7px;padding:4px 14px 12px;max-height:112px;overflow-y:auto}.svc-q button{background:rgba(212,175,55,.06);border:1px solid var(--gold-alpha,rgba(212,175,55,.35));color:var(--gold-primary,#D4AF37);border-radius:50px;padding:7px 14px;font:600 .74rem Inter,Cairo,sans-serif;cursor:pointer;transition:.2s}.svc-q button:hover{background:var(--gold-primary,#D4AF37);color:#000}'
    + '.svc-f{display:flex;gap:8px;padding:10px 12px;border-top:1px solid rgba(212,175,55,.15);background:#050505}.svc-f input{flex:1;background:rgba(255,255,255,.05);border:1px solid rgba(255,255,255,.08);border-radius:50px;padding:11px 16px;color:#fff;font:inherit;font-size:16px;outline:0}.svc-f input:focus{border-color:var(--gold-primary,#D4AF37)}.svc-f button{width:42px;height:42px;border-radius:50%;border:0;background:linear-gradient(135deg,#D4AF37,#b8932a);color:#000;cursor:pointer;font-size:.95rem;flex-shrink:0}'
    + '@media(max-width:900px){#svc-btn{bottom:92px;right:14px;width:54px;height:54px}#svc-box{right:10px;left:10px;width:auto;max-width:none;bottom:156px;height:min(540px,calc(100dvh - 190px))}}';
  document.head.appendChild(cst);
  var box = document.createElement('div');
  box.innerHTML = '<button id="svc-btn" aria-label="Chat"><i class="fa-solid fa-comments"></i></button><div id="svc-box"><div class="svc-h"><div class="svc-av" id="svc-av">' + ROBOT + '</div><div class="tt"><b id="svc-hd"></b><small id="svc-st"></small></div><button id="svc-lg" title="Language"></button><button id="svc-x" aria-label="Close">✕</button></div><div id="svc-log"></div><div class="svc-q" id="svc-q"></div><form class="svc-f" id="svc-f"><input id="svc-i" autocomplete="off"><button aria-label="Send"><i class="fa-solid fa-paper-plane"></i></button></form></div>';
  document.body.appendChild(box);
  var log = $('#svc-log'), qb = $('#svc-q'), av = $('#svc-av'), tt = null;
  function label(id) { return BY[id].lab[lang === 'en' ? 0 : 1]; }
  function ui() { $('#svc-hd').textContent = T[lang].hd; $('#svc-st').textContent = T[lang].on; $('#svc-i').placeholder = T[lang].ph; $('#svc-lg').textContent = LN[lang]; $('#svc-box').dir = lang === 'en' ? 'ltr' : 'rtl'; }
  function row(html, u) { var r = document.createElement('div'); r.className = 'svc-r' + (u ? ' u' : ''); r.innerHTML = (u ? '' : '<div class="a">' + ROBOT + '</div>') + '<div class="svc-m" dir="auto"></div>'; var m = r.lastChild; if (u) m.textContent = html; else m.innerHTML = html; log.appendChild(r); log.scrollTop = log.scrollHeight; return r; }
  function chips(ids) { qb.innerHTML = ''; ids.filter(function (id) { return BY[id] && BY[id].lab; }).forEach(function (id) { var b = document.createElement('button'); b.type = 'button'; b.textContent = label(id); b.onclick = function () { if (busy) return; send(label(id), BY[id]); }; qb.appendChild(b); }); }
  function bubble() {
    var r = row('', 0), m = r.querySelector('.svc-m'), i = 0; m.style.padding = '0';
    m.innerHTML = '<div class="svc-th go"><div class="hz">' + ROBOT + '</div><div class="sx"><span>' + T[lang].th[0] + '</span><i><b></b><b></b><b></b></i></div></div>';
    r._t = setInterval(function () { i = (i + 1) % 3; var s = m.querySelector('.sx span'); if (s) s.textContent = T[lang].th[i]; }, 1100); return r;
  }
  function reveal(el, html, done) {
    var tk = html.match(/<[^>]+>|[^<\s]+\s*|\s+/g) || [html], i = 0, out = '', step = Math.max(1, Math.ceil(tk.length / 60));
    (function f() { out += tk.slice(i, i + step).join(''); i += step; el.innerHTML = out; log.scrollTop = log.scrollHeight; if (i < tk.length) setTimeout(f, 26); else if (done) done(); })();
  }
  function finish(b, res) {
    clearInterval(b._t); b.remove(); var r = row('', 0);
    reveal(r.querySelector('.svc-m'), res.html, function () {
      hist.push({ role: 'assistant', content: plain(res.html).slice(0, 1200) }); busy = false; av.classList.remove('go'); $('#svc-st').textContent = T[lang].on;
      chips(res.opts || ((res.f && res.f.length) ? res.f : MENU).slice(0, 5));
    });
  }
  function localReply(q, forced) {
    if (forced) return { html: ans(forced), f: forced.f };
    var pm = person(q); if (pm) return { html: personHtml(pm), f: ['team', 'contact'] };
    var r = understand(q);
    if (r.t === 'hit') return { html: ans(r.it), f: r.it.f };
    if (r.t === 'maybe') return { html: T[lang].nf, opts: r.o.map(function (x) { return x.id; }) };
    return { html: fix(pick(FB[lang] && FB[lang].length ? FB[lang] : (FB.ar || ['…']), FB)), f: MENU };
  }
  function send(q, forced) {
    if (busy) return; if (!forced) lang = detect(q); ui(); busy = true; qb.innerHTML = '';
    row(q, 1); hist.push({ role: 'user', content: q }); av.classList.add('go'); $('#svc-st').textContent = '…';
    var b = bubble(), t0 = Date.now();
    load().then(function () {
      var local = localReply(q, forced), p = forced ? Promise.resolve(local) : ai().then(function (t) { var u = understand(q); return { html: md(t), f: u.t === 'hit' ? u.it.f : MENU }; }).catch(function () { return local; });
      p.then(function (res) { setTimeout(function () { finish(b, res); }, Math.max(0, 1100 - (Date.now() - t0))); });
    });
  }
  ui();
  $('#svc-btn').onclick = function () {
    $('#svc-box').classList.toggle('on');
    if (!opened) { opened = true; busy = true; av.classList.add('go'); var b = bubble(); load().then(function () { setTimeout(function () { finish(b, { html: ans(BY.greet), f: MENU }); }, 1100); }); } else $('#svc-i').focus();
  };
  $('#svc-x').onclick = function () { $('#svc-box').classList.remove('on'); };
  $('#svc-lg').onclick = function () { lang = LG[(LG.indexOf(lang) + 1) % 3]; ui(); if (KB.length && !busy) chips(MENU); };
  $('#svc-i').addEventListener('input', function () { av.classList.add('go'); clearTimeout(tt); tt = setTimeout(function () { if (!busy) av.classList.remove('go'); }, 1300); });
  $('#svc-f').onsubmit = function (e) { e.preventDefault(); var i = $('#svc-i'), v = i.value.trim(); if (!v || busy) return; i.value = ''; send(v.slice(0, 600)); };
})();
