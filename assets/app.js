(function () {
  var W = window.WEDDING;
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  var esc = function (s) { return String(s).replace(/[&<>"']/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]; }); };
  var reduce = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  document.documentElement.classList.remove("no-js");

  /* ---------- Content from config ---------- */
  var params = new URLSearchParams(location.search);
  var guest = params.get("to");
  var seats = parseInt(params.get("seats") || W.rsvp.defaultSeats, 10);
  if (!(seats > 0)) seats = W.rsvp.defaultSeats;
  if (guest) {
    $("#dear").textContent = "Dear " + guest + ",";
    $("#seats").textContent = "we have reserved " + seats + (seats === 1 ? " seat" : " seats") + " in your honour.";
    $("#greeting").hidden = false;
    $("#name-field").hidden = true;
    $("#name").required = false;
  }

  $("#program").innerHTML = '<span class="tl-fill" id="tl-fill"></span>' + W.program.map(function (p) {
    return '<div class="tl-item"><span class="t">' + esc(p.time) + '</span><span class="title">' + esc(p.title) + '</span>' + (p.note ? '<span class="n">' + esc(p.note) + '</span>' : '') + '</div>';
  }).join("");
  $("#swatches").innerHTML = W.dressCode.palette.map(function (c, i) {
    return '<div class="swatch" style="--i:' + i + '"><i style="background:' + esc(c.hex) + '"></i>' + esc(c.name) + '</div>';
  }).join("");
  if (W.entourage && W.entourage.length) {
    $("#roles").innerHTML = W.entourage.map(function (r, i) {
      return '<div class="role" style="--i:' + i + '"><h3>' + esc(r.role) + '</h3><p>' + r.names.map(esc).join("<br>") + '</p></div>';
    }).join("");
    $("#entourage").hidden = false;
  }
  $("#story").innerHTML = W.story.map(function (s, i) {
    return '<article style="--i:' + i + '">' + (s.year ? '<span class="y">' + esc(s.year) + '</span>' : '') + '<h3>' + esc(s.title) + '</h3><p>' + esc(s.text) + '</p></article>';
  }).join("");
  $("#faq").innerHTML = W.faq.map(function (f) {
    return '<details><summary>' + esc(f.q) + '</summary><p>' + esc(f.a) + '</p></details>';
  }).join("");

  // Calendar link
  var start = W.date.replace(/-/g, "") + "T" + W.ceremonyStart.replace(":", "") + "00";
  var end = W.date.replace(/-/g, "") + "T220000";
  $("#cal-link").href = "https://calendar.google.com/calendar/render?action=TEMPLATE"
    + "&text=" + encodeURIComponent("Wedding of " + W.couple.short)
    + "&dates=" + start + "/" + end + "&ctz=Asia/Manila"
    + "&details=" + encodeURIComponent("Ceremony " + W.ceremony.time + " at " + W.ceremony.name + ". Reception " + W.reception.time + " at " + W.reception.name + ". " + W.site)
    + "&location=" + encodeURIComponent(W.ceremony.name + ", " + W.ceremony.address);

  /* ---------- Countdown ---------- */
  var target = new Date(W.date + "T" + W.ceremonyStart + ":00" + W.timezoneOffset).getTime();
  var counted = false;
  function pad(n) { return (n < 10 ? "0" : "") + n; }
  function tick() {
    var d = target - Date.now();
    if (d <= 0) { $("#countdown").innerHTML = '<p class="lede">Today is the day.</p>'; return; }
    var s = Math.floor(d / 1000);
    if (counted) $("#c-d").textContent = Math.floor(s / 86400);
    $("#c-h").textContent = pad(Math.floor(s % 86400 / 3600));
    $("#c-m").textContent = pad(Math.floor(s % 3600 / 60));
    $("#c-s").textContent = pad(s % 60);
  }
  function countUp() {
    if (counted) return; counted = true;
    var days = Math.floor((target - Date.now()) / 86400000);
    if (reduce) { $("#c-d").textContent = days; return; }
    var t0 = performance.now();
    (function step(t) {
      var k = Math.min(1, (t - t0) / 1400); k = 1 - Math.pow(1 - k, 3);
      $("#c-d").textContent = Math.round(days * k);
      if (k < 1) requestAnimationFrame(step);
    })(t0);
  }
  tick(); setInterval(tick, 1000);

  /* ---------- Envelope intro ---------- */
  var intro = $("#intro"), hero = $("#cover");
  document.body.classList.add("locked");
  function openInvite() {
    intro.classList.add("opening");
    var delay = reduce ? 300 : 1500;
    setTimeout(function () { hero.classList.add("ready"); }, reduce ? 50 : 1300);
    setTimeout(function () {
      document.body.classList.remove("locked");
      intro.classList.add("gone");
      startDust();
      update();
    }, delay + (reduce ? 100 : 900));
  }
  $("#open-btn").addEventListener("click", openInvite);

  /* ---------- Gold dust ---------- */
  var canvas = $("#dust"), ctx = canvas.getContext("2d"), motes = [], dpr = Math.min(2, window.devicePixelRatio || 1), running = false, lastY = 0;
  function resize() { canvas.width = innerWidth * dpr; canvas.height = innerHeight * dpr; ctx.setTransform(dpr, 0, 0, dpr, 0, 0); }
  function mote() { return { x: Math.random() * innerWidth, y: Math.random() * innerHeight, r: 0.8 + Math.random() * 2.2, a: 0.15 + Math.random() * 0.35, vy: 0.08 + Math.random() * 0.25, vx: (Math.random() - 0.5) * 0.15, ph: Math.random() * 6.28 }; }
  function startDust() {
    if (reduce || running) return;
    running = true; resize();
    var n = innerWidth < 500 ? 36 : 60;
    for (var i = 0; i < n; i++) motes.push(mote());
    (function frame(t) {
      if (document.hidden) { requestAnimationFrame(frame); return; }
      ctx.clearRect(0, 0, innerWidth, innerHeight);
      var dy = (window.scrollY - lastY) * 0.25; lastY = window.scrollY;
      for (var i = 0; i < motes.length; i++) {
        var m = motes[i];
        m.y -= m.vy + dy * 0.5; m.x += m.vx + Math.sin(t / 1800 + m.ph) * 0.12;
        if (m.y < -10) { m.y = innerHeight + 10; m.x = Math.random() * innerWidth; }
        if (m.y > innerHeight + 10) { m.y = -10; }
        if (m.x < -10) m.x = innerWidth + 10; if (m.x > innerWidth + 10) m.x = -10;
        var tw = 0.6 + 0.4 * Math.sin(t / 900 + m.ph);
        ctx.beginPath(); ctx.arc(m.x, m.y, m.r, 0, 6.283);
        ctx.fillStyle = "rgba(184,150,62," + (m.a * tw).toFixed(3) + ")"; ctx.fill();
      }
      requestAnimationFrame(frame);
    })(0);
  }
  window.addEventListener("resize", function () { if (running) resize(); });

  /* ---------- Scroll choreography ---------- */
  var progress = $("#progress"), fab = $("#fab"), rsvpSec = $("#rsvp"), tl = $("#program"), tlFill, tlItems = [], parallax = $$("[data-parallax]");
  var ticking = false;
  function update() {
    ticking = false;
    var y = window.scrollY, vh = innerHeight, docH = document.documentElement.scrollHeight - vh;
    progress.style.transform = "scaleX(" + (docH > 0 ? Math.min(1, y / docH) : 0) + ")";
    // floating RSVP button
    var heroB = hero.getBoundingClientRect().bottom, rr = rsvpSec.getBoundingClientRect();
    var rsvpVisible = rr.top < vh * 0.85 && rr.bottom > vh * 0.15;
    fab.classList.toggle("show", heroB < 0 && !rsvpVisible && $("#rsvp-done").hidden);
    if (reduce) return;
    // timeline draws itself
    if (!tlFill) { tlFill = $("#tl-fill"); tlItems = $$(".tl-item"); }
    var tr = tl.getBoundingClientRect();
    var p = Math.max(0, Math.min(1, (vh * 0.72 - tr.top) / tr.height));
    tlFill.style.transform = "scaleY(" + p + ")";
    var lineEnd = tr.top + tr.height * p;
    for (var i = 0; i < tlItems.length; i++) tlItems[i].classList.toggle("lit", tlItems[i].getBoundingClientRect().top + 12 <= lineEnd);
    // parallax
    for (var j = 0; j < parallax.length; j++) {
      var el = parallax[j], r = el.getBoundingClientRect();
      if (r.bottom < 0 || r.top > vh) continue;
      var off = ((r.top + r.height / 2) - vh / 2) * parseFloat(el.getAttribute("data-parallax"));
      el.style.transform = "translateY(" + off.toFixed(1) + "px)";
    }
  }
  function onScroll() { if (!ticking) { ticking = true; requestAnimationFrame(update); } }
  window.addEventListener("scroll", onScroll, { passive: true });
  window.addEventListener("resize", onScroll);

  if ("IntersectionObserver" in window) {
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (e) {
        if (!e.isIntersecting) return;
        e.target.classList.add("in");
        if (e.target.id === "countdown-section") countUp();
        io.unobserve(e.target);
      });
    }, { rootMargin: "0px 0px -12% 0px", threshold: 0.08 });
    $$(".reveal").forEach(function (el) { io.observe(el); });
  } else {
    $$(".reveal").forEach(function (el) { el.classList.add("in"); }); countUp();
  }

  /* ---------- RSVP ---------- */
  var sel = $("#seats-sel");
  for (var i = 1; i <= seats; i++) { var o = document.createElement("option"); o.value = i; o.textContent = i; sel.appendChild(o); }
  sel.value = seats;
  var dl = new Date(W.rsvp.deadline + "T23:59:59" + W.timezoneOffset);
  $("#deadline").textContent = "Kindly reply by " + dl.toLocaleDateString("en-PH", { day: "numeric", month: "long", year: "numeric" }) + ".";
  var form = $("#rsvp-form");
  if (Date.now() > dl.getTime()) { form.hidden = true; $("#rsvp-closed").hidden = false; }
  $$("input[name=answer]").forEach(function (r) {
    r.addEventListener("change", function () { $("#yes-fields").hidden = r.value !== "YES"; });
  });
  form.addEventListener("submit", function (e) {
    e.preventDefault();
    var data = new FormData(form);
    if (data.get("website")) return;
    var answer = data.get("answer");
    if (!answer) { $("#rsvp-status").textContent = "Please choose one of the two answers."; return; }
    if (!guest && !String(data.get("name") || "").trim()) { $("#rsvp-status").textContent = "Please tell us your name."; $("#name").focus(); return; }
    var payload = { token: params.get("i") || "", name: guest || data.get("name") || "", answer: answer, seats: answer === "YES" ? data.get("seats") : 0, names: data.get("names") || "", message: data.get("message") || "" };
    $("#rsvp-status").textContent = "Sending…";
    var done = function () {
      form.hidden = true; $("#rsvp-done").hidden = false; fab.classList.remove("show");
      $("#done-text").textContent = answer === "YES" ? "We can't wait to celebrate with you." : "We'll miss you, and we understand. Thank you for letting us know.";
    };
    if (W.rsvp.mode === "demo" || !W.rsvp.endpoint) { setTimeout(done, 600); return; }
    fetch(W.rsvp.endpoint, { method: "POST", headers: { "Content-Type": "text/plain;charset=utf-8" }, body: JSON.stringify(payload) })
      .then(function (r) { return r.json(); })
      .then(function (r) { if (r && r.ok) done(); else $("#rsvp-status").textContent = (r && r.error) || "Something went wrong. Please try again."; })
      .catch(function () { $("#rsvp-status").textContent = "We couldn't reach the server. Please check your connection and try again."; });
  });
})();
