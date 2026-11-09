/* SMART VISION — public layer: staff link, live news/projects, request form, chatbot */
(function () {
  var C = window.SV || {}, live = C.url && C.key && !/YOUR-/.test(C.url);
  var H = { apikey: C.key, Authorization: 'Bearer ' + C.key };
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var esc = function (s) { return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); };
  var get = function (t, o) { return fetch(C.url + '/rest/v1/' + t + '?select=*&published=eq.true&order=' + (o || 'created_at.desc'), { headers: H }).then(function (r) { return r.ok ? r.json() : []; }).catch(function () { return []; }); };

  /* ---- Staff login entry (icon only, keeps the header untouched) ---- */
  var ul = $('.nav-links');
  if (ul) ul.insertAdjacentHTML('beforeend', '<li><a href="staff-login.html" title="Staff Login" aria-label="Staff Login"><i class="fa-solid fa-user-lock"></i></a></li>');
  var grid = $('.overlay-nav-grid');
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

  /* ---- Gallery lightbox ---- */
  function openGal(im, i) {
    var o = $('#svlb');
    if (!o) {
      var st = document.createElement('style');
      st.textContent = '#svlb{position:fixed;inset:0;background:rgba(0,0,0,.95);z-index:100002;display:none;align-items:center;justify-content:center}#svlb.on{display:flex}#svlb img{max-width:92vw;max-height:78vh;object-fit:contain;border:1px solid rgba(212,175,55,.3)}#svlb button{position:absolute;background:rgba(0,0,0,.65);border:1px solid rgba(212,175,55,.5);color:#D4AF37;width:46px;height:46px;border-radius:50%;font-size:1.2rem;cursor:pointer}#svlb .x{top:20px;right:20px}#svlb .p{left:18px;top:50%}#svlb .n{right:18px;top:50%}#svlb .c{position:absolute;bottom:24px;color:#D4AF37;font:600 .8rem Inter,sans-serif;letter-spacing:3px}';
      document.head.appendChild(st); o = document.createElement('div'); o.id = 'svlb';
      o.innerHTML = '<button class="x">✕</button><button class="p">‹</button><img alt=""><button class="n">›</button><div class="c"></div>'; document.body.appendChild(o);
      var go = function (d) { o._i = (o._i + d + o._im.length) % o._im.length; $('img', o).src = o._im[o._i]; $('.c', o).textContent = (o._i + 1) + ' / ' + o._im.length; };
      $('.x', o).onclick = function () { o.classList.remove('on'); }; $('.p', o).onclick = function () { go(-1); }; $('.n', o).onclick = function () { go(1); };
      o.addEventListener('click', function (e) { if (e.target === o) o.classList.remove('on'); });
      document.addEventListener('keydown', function (e) { if (!o.classList.contains('on')) return; if (e.key === 'Escape') o.classList.remove('on'); if (e.key === 'ArrowRight') go(-1); if (e.key === 'ArrowLeft') go(1); });
    }
    o._im = im; o._i = i; $('img', o).src = im[i]; $('.c', o).textContent = (i + 1) + ' / ' + im.length;
    $('.p', o).style.display = $('.n', o).style.display = im.length > 1 ? '' : 'none'; o.classList.add('on');
  }

  /* ---- Live PROJECTS ---- */
  var pg = $('#portfolio-grid');
  if (pg && live) get('projects').then(function (items) {
    if (!items.length) return;
    if (L(items)) drop('#portfolio-grid .project-card:not([data-dyn])');
    var first = pg.firstElementChild;
    items.forEach(function (p) {
      var im = (p.images && p.images.length ? p.images : [p.image_url]).filter(Boolean);
      var c = document.createElement('div'); c.className = 'project-card in-view'; c.setAttribute('data-dyn', '1'); c.dataset.category = p.category; c._im = im;
      c.innerHTML = '<img src="' + esc(im[0]) + '" alt="' + esc(p.title) + '" class="project-img"' + LZ + '><div class="category-badge">' + esc(p.category) + '</div>' + (im.length > 1 ? '<div style="position:absolute;top:14px;left:14px;z-index:3;background:rgba(0,0,0,.7);border:1px solid rgba(212,175,55,.5);color:#D4AF37;border-radius:20px;padding:3px 10px;font:600 .7rem Inter,sans-serif"><i class="fa-regular fa-images"></i> ' + im.length + '</div>' : '') + '<div class="project-info"><span class="proj-category">' + esc(p.category) + '</span></div><div class="view-btn"><i class="fa-solid fa-expand"></i></div>';
      c.addEventListener('click', function () {
        var all = [], at = 0;
        pg.querySelectorAll('.project-card[data-dyn]:not(.is-hidden)').forEach(function (k) { if (k === c) at = all.length; (k._im || []).forEach(function (u) { all.push(u); }); });
        openGal(all, at);
      });
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
  var KB = [], BY = {}, FB = { en: [], ar: [], eg: [] }, ready = null, hist = [], aiFail = 0, busy = false, opened = false;
  var LG = ['en', 'ar', 'eg'], LN = { en: 'EN', ar: 'فصحى', eg: 'مصري' };
  var lang = /^ar/i.test(navigator.language || '') ? 'ar' : 'en';
  var EGW = {}; 'ايه ازاي عايز عاوز عايزه عاوزه دي ده دا كده كدا فين مش بتاع بتاعك دلوقتي دلوقت ليه كام عشان علشان اهو حاجه بقي بقا لسه برضو برضه اوي احنا انتوا انتو بتعملوا بتشتغلوا بتقدموا ازيك اخبارك معلش طب طيب خلاص يلا ايوه مين'.split(' ').forEach(function (w) { EGW[w] = 1; });
  var MINI = { greet: { a: { en: ['Hello! How can I help you with SMART VISION?'], ar: ['أهلاً بك! كيف يمكنني مساعدتك؟'], eg: ['أهلاً بيك! أقدر أساعدك إزاي؟'] }, f: [] } };
  var HORSE = '<svg class="hs" viewBox="0 0 150 100" aria-hidden="true"><path class="gd" d="M6 94H144"/><g class="hb"><g class="lg a"><path d="M52 56L44 70L50 82L45 90"/></g><g class="lg b"><path d="M58 56L62 70L56 82L61 90"/></g><path class="tl" d="M39 40C26 36 16 44 17 62C22 54 27 52 36 52Z"/><path class="bd" d="M38 44C34 34 48 29 66 30C84 30 94 32 102 38C106 46 100 56 88 57L52 58C42 58 40 52 38 44Z"/><path class="nk" d="M96 36L108 14C112 9 120 8 128 11L142 22C144 26 142 29 138 29L128 27L120 30L112 50L100 52Z"/><path class="ea" d="M113 11L116 3L120 10Z"/><path class="mn" d="M99 33C101 22 106 15 112 11M95 38C96 28 100 21 106 15"/><circle cx="127" cy="17" r="1.8"/><g class="lg c"><path d="M92 56L104 64L101 78L108 88"/></g><g class="lg d"><path d="M86 56L88 70L96 78L94 90"/></g></g></svg>';
  var T = {
    en: { ph: 'Type your question...', on: 'Online', hd: 'SMART VISION Assistant', nf: 'Just to make sure I understand you — did you mean one of these? 🤔', th: ['Thinking…', 'Checking our company info…', 'Preparing your answer…'] },
    ar: { ph: 'اكتب سؤالك...', on: 'متصل', hd: 'مساعد SMART VISION', nf: 'للتأكد من فهمي لسؤالك — هل تقصد أحد هذه الأمور؟ 🤔', th: ['أفكر…', 'أراجع معلومات الشركة…', 'أجهّز لك الإجابة…'] },
    eg: { ph: 'اكتب سؤالك...', on: 'متصل', hd: 'مساعد SMART VISION', nf: 'عشان أتأكد إني فاهمك صح — تقصد واحدة من دول؟ 🤔', th: ['بفكر…', 'براجع معلومات الشركة…', 'بجهّزلك الرد…'] }
  };
  function nz(s) { return String(s).toLowerCase().replace(/[\u064B-\u065F\u0670\u0640]/g, '').replace(/[أإآٱ]/g, 'ا').replace(/ى/g, 'ي').replace(/ة/g, 'ه').replace(/ؤ/g, 'و').replace(/ئ/g, 'ي').replace(/[^\u0600-\u06FFa-z0-9\s]/g, ' ').replace(/(.)\1{2,}/g, '$1$1').replace(/\s+/g, ' ').trim(); }
  function lev(a, b) { var m = a.length, n = b.length; if (Math.abs(m - n) > 2) return 9; var p = [], i, j; for (j = 0; j <= n; j++) p[j] = j; for (i = 1; i <= m; i++) { var pr = p[0]; p[0] = i; for (j = 1; j <= n; j++) { var t = p[j]; p[j] = Math.min(p[j] + 1, p[j - 1] + 1, pr + (a[i - 1] === b[j - 1] ? 0 : 1)); pr = t; } } return p[n]; }
  function tm(t, k) { if (t === k) return 1; var ts = t.replace(/^(وال|بال|كال|فال|لل|ال)/, ''); if (ts === k) return .95; var kl = k.length; if (kl < 4) return 0; if (ts.length >= 4 && (ts.indexOf(k) === 0 || k.indexOf(ts) === 0)) return .85; var d = Math.min(lev(t, k), lev(ts, k)); if (d <= 1) return .8; if (d === 2 && kl >= 7) return .65; return 0; }
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
  function fix(h) { return String(h).replace(/\{\{WA\}\}/g, wa); }
  function load() {
    if (!ready) ready = fetch('assets/sv-knowledge.json').then(function (r) { return r.json(); }).then(function (j) { KB = j.intents || []; FB = j.fallback || FB; }).catch(function () { KB = []; }).then(function () { KB.forEach(function (x) { BY[x.id] = x; x.nk = x.k.map(nz).filter(Boolean); }); if (!BY.greet) BY.greet = MINI.greet; });
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
    + '.hs{width:100%;height:100%;overflow:visible}.hs .bd,.hs .nk{fill:#E2BC48}.hs .tl,.hs .ea{fill:#B8932A}.hs .mn{fill:none;stroke:#7a5c10;stroke-width:3.2;stroke-linecap:round}.hs circle{fill:#000}.hs .lg path{fill:none;stroke:#E2BC48;stroke-width:4.2;stroke-linecap:round;stroke-linejoin:round}.hs .lg.b path,.hs .lg.d path{stroke:#9c7d22}.hs .gd{fill:none;stroke:rgba(212,175,55,.35);stroke-width:2;stroke-dasharray:8 10}'
    + '.hs .lg,.hs .hb,.hs .tl,.hs .gd{animation-play-state:paused}.go .hs .lg,.go .hs .hb,.go .hs .tl,.go .hs .gd{animation-play-state:running}.hs .lg{animation:svl .42s ease-in-out infinite alternate}.hs .lg.a{transform-origin:52px 56px}.hs .lg.b{transform-origin:58px 56px;animation-direction:alternate-reverse}.hs .lg.c{transform-origin:92px 56px;animation-direction:alternate-reverse}.hs .lg.d{transform-origin:86px 56px}.hs .hb{animation:svb .21s ease-in-out infinite alternate}.hs .tl{transform-origin:39px 42px;animation:svt .42s ease-in-out infinite alternate}.hs .gd{animation:svg .42s linear infinite}@keyframes svl{from{transform:rotate(-27deg)}to{transform:rotate(27deg)}}@keyframes svb{from{transform:translateY(0)}to{transform:translateY(-2.5px)}}@keyframes svt{from{transform:rotate(-7deg)}to{transform:rotate(9deg)}}@keyframes svg{to{stroke-dashoffset:-18}}'
    + '#svc-log{flex:1;overflow-y:auto;padding:16px 14px;display:flex;flex-direction:column;gap:12px;scroll-behavior:smooth}#svc-log::-webkit-scrollbar{width:4px}#svc-log::-webkit-scrollbar-thumb{background:rgba(212,175,55,.3);border-radius:4px}.svc-r{display:flex;gap:8px;align-items:flex-end;animation:svm .35s ease-out}.svc-r.u{flex-direction:row-reverse}@keyframes svm{from{opacity:0;transform:translateY(8px)}}.svc-r .a{width:28px;height:24px;border-radius:9px;background:#000;border:1px solid var(--gold-border,#C9A227);display:flex;align-items:center;justify-content:center;flex-shrink:0;padding:2px}'
    + '.svc-m{max-width:82%;padding:11px 14px;border-radius:16px 16px 16px 4px;font-size:.85rem;line-height:1.8;color:#e6e6e6;background:rgba(255,255,255,.07);border:1px solid rgba(255,255,255,.06);word-break:break-word}.svc-m a{color:var(--gold-primary,#D4AF37);text-decoration:underline}.svc-m b{color:#fff}.svc-r.u .svc-m{background:linear-gradient(135deg,#D4AF37,#b8932a);color:#000;border:0;border-radius:16px 16px 4px 16px;font-weight:500}'
    + '.svc-th{display:flex;align-items:center;gap:10px;padding:8px 14px 8px 8px}.svc-th .hz{width:78px;height:52px;flex-shrink:0}.svc-th .sx{font-size:.78rem;color:#cfcfcf;display:flex;flex-direction:column;gap:5px;min-width:96px}.svc-th .sx i{display:flex;gap:4px}.svc-th .sx i b{width:6px;height:6px;border-radius:50%;background:#D4AF37;opacity:.3;animation:svd 1.1s infinite}.svc-th .sx i b:nth-child(2){animation-delay:.18s}.svc-th .sx i b:nth-child(3){animation-delay:.36s}@keyframes svd{30%{opacity:1;transform:translateY(-4px)}}'
    + '.svc-q{display:flex;flex-wrap:wrap;gap:7px;padding:4px 14px 12px;max-height:112px;overflow-y:auto}.svc-q button{background:rgba(212,175,55,.06);border:1px solid var(--gold-alpha,rgba(212,175,55,.35));color:var(--gold-primary,#D4AF37);border-radius:50px;padding:7px 14px;font:600 .74rem Inter,Cairo,sans-serif;cursor:pointer;transition:.2s}.svc-q button:hover{background:var(--gold-primary,#D4AF37);color:#000}'
    + '.svc-f{display:flex;gap:8px;padding:10px 12px;border-top:1px solid rgba(212,175,55,.15);background:#050505}.svc-f input{flex:1;background:rgba(255,255,255,.05);border:1px solid rgba(255,255,255,.08);border-radius:50px;padding:11px 16px;color:#fff;font:inherit;font-size:16px;outline:0}.svc-f input:focus{border-color:var(--gold-primary,#D4AF37)}.svc-f button{width:42px;height:42px;border-radius:50%;border:0;background:linear-gradient(135deg,#D4AF37,#b8932a);color:#000;cursor:pointer;font-size:.95rem;flex-shrink:0}'
    + '@media(max-width:900px){#svc-btn{bottom:92px;right:14px;width:54px;height:54px}#svc-box{right:10px;left:10px;width:auto;max-width:none;bottom:156px;height:min(540px,calc(100dvh - 190px))}}';
  document.head.appendChild(cst);
  var box = document.createElement('div');
  box.innerHTML = '<button id="svc-btn" aria-label="Chat"><i class="fa-solid fa-comments"></i></button><div id="svc-box"><div class="svc-h"><div class="svc-av" id="svc-av">' + HORSE + '</div><div class="tt"><b id="svc-hd"></b><small id="svc-st"></small></div><button id="svc-lg" title="Language"></button><button id="svc-x" aria-label="Close">✕</button></div><div id="svc-log"></div><div class="svc-q" id="svc-q"></div><form class="svc-f" id="svc-f"><input id="svc-i" autocomplete="off"><button aria-label="Send"><i class="fa-solid fa-paper-plane"></i></button></form></div>';
  document.body.appendChild(box);
  var log = $('#svc-log'), qb = $('#svc-q'), av = $('#svc-av'), tt = null;
  function label(id) { return BY[id].lab[lang === 'en' ? 0 : 1]; }
  function ui() { $('#svc-hd').textContent = T[lang].hd; $('#svc-st').textContent = T[lang].on; $('#svc-i').placeholder = T[lang].ph; $('#svc-lg').textContent = LN[lang]; $('#svc-box').dir = lang === 'en' ? 'ltr' : 'rtl'; }
  function row(html, u) { var r = document.createElement('div'); r.className = 'svc-r' + (u ? ' u' : ''); r.innerHTML = (u ? '' : '<div class="a">' + HORSE + '</div>') + '<div class="svc-m" dir="auto"></div>'; var m = r.lastChild; if (u) m.textContent = html; else m.innerHTML = html; log.appendChild(r); log.scrollTop = log.scrollHeight; return r; }
  function chips(ids) { qb.innerHTML = ''; ids.filter(function (id) { return BY[id] && BY[id].lab; }).forEach(function (id) { var b = document.createElement('button'); b.type = 'button'; b.textContent = label(id); b.onclick = function () { if (busy) return; send(label(id), BY[id]); }; qb.appendChild(b); }); }
  function bubble() {
    var r = row('', 0), m = r.querySelector('.svc-m'), i = 0; m.style.padding = '0';
    m.innerHTML = '<div class="svc-th go"><div class="hz">' + HORSE + '</div><div class="sx"><span>' + T[lang].th[0] + '</span><i><b></b><b></b><b></b></i></div></div>';
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
