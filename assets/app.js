(function () {
  var W = window.WEDDING;
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var esc = function (s) { return String(s).replace(/[&<>"']/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]; }); };
  document.documentElement.classList.add("js");

  // Personal greeting. Preview: ?to=Name&seats=2. Production: ?i=TOKEN resolved by the backend.
  var params = new URLSearchParams(location.search);
  var guest = params.get("to");
  var seats = parseInt(params.get("seats") || W.rsvp.defaultSeats, 10);
  if (!(seats > 0)) seats = W.rsvp.defaultSeats;
  var greeting = $("#greeting");
  if (guest) {
    $("#dear").textContent = "Dear " + guest + ",";
    $("#seats").textContent = "we have reserved " + seats + (seats === 1 ? " seat" : " seats") + " in your honour.";
    greeting.hidden = false;
    $("#name-field").hidden = true;
    $("#name").required = false;
  }

  // Countdown
  var target = new Date(W.date + "T" + W.ceremonyStart + ":00" + W.timezoneOffset).getTime();
  function pad(n) { return (n < 10 ? "0" : "") + n; }
  function tick() {
    var d = target - Date.now();
    if (d <= 0) { $("#countdown").innerHTML = '<p class="lede">Today is the day.</p>'; return; }
    var s = Math.floor(d / 1000);
    $("#c-d").textContent = Math.floor(s / 86400);
    $("#c-h").textContent = pad(Math.floor(s % 86400 / 3600));
    $("#c-m").textContent = pad(Math.floor(s % 3600 / 60));
    $("#c-s").textContent = pad(s % 60);
  }
  tick(); setInterval(tick, 1000);

  // Calendar link (Google Calendar)
  var start = W.date.replace(/-/g, "") + "T" + W.ceremonyStart.replace(":", "") + "00";
  var end = W.date.replace(/-/g, "") + "T220000";
  var cal = "https://calendar.google.com/calendar/render?action=TEMPLATE"
    + "&text=" + encodeURIComponent("Wedding of " + W.couple.short)
    + "&dates=" + start + "/" + end + "&ctz=Asia/Manila"
    + "&details=" + encodeURIComponent("Ceremony " + W.ceremony.time + " at " + W.ceremony.name + ". Reception " + W.reception.time + " at " + W.reception.name + ". " + W.site)
    + "&location=" + encodeURIComponent(W.ceremony.name + ", " + W.ceremony.address);
  $("#cal-link").href = cal;

  // Program
  $("#program").innerHTML = W.program.map(function (p) {
    return "<li><span class=\"t\">" + esc(p.time) + "</span><span><span class=\"title\">" + esc(p.title) + "</span>" + (p.note ? "<br><span class=\"n\">" + esc(p.note) + "</span>" : "") + "</span></li>";
  }).join("");

  // Dress code swatches
  $("#swatches").innerHTML = W.dressCode.palette.map(function (c) {
    return "<div class=\"swatch\"><i style=\"background:" + esc(c.hex) + "\"></i>" + esc(c.name) + "</div>";
  }).join("");

  // Entourage
  if (W.entourage && W.entourage.length) {
    $("#roles").innerHTML = W.entourage.map(function (r) {
      return "<div class=\"role\"><h3>" + esc(r.role) + "</h3><p>" + r.names.map(esc).join("<br>") + "</p></div>";
    }).join("");
    $("#entourage").hidden = false;
  }

  // Story
  $("#story").innerHTML = W.story.map(function (s) {
    return "<article>" + (s.year ? "<span class=\"y\">" + esc(s.year) + "</span>" : "") + "<h3>" + esc(s.title) + "</h3><p>" + esc(s.text) + "</p></article>";
  }).join("");

  // FAQ
  $("#faq").innerHTML = W.faq.map(function (f) {
    return "<details><summary>" + esc(f.q) + "</summary><p>" + esc(f.a) + "</p></details>";
  }).join("");

  // RSVP
  var sel = $("#seats-sel");
  for (var i = 1; i <= seats; i++) { var o = document.createElement("option"); o.value = i; o.textContent = i; sel.appendChild(o); }
  sel.value = seats;
  var dl = new Date(W.rsvp.deadline + "T23:59:59" + W.timezoneOffset);
  $("#deadline").textContent = "Kindly reply by " + dl.toLocaleDateString("en-PH", { day: "numeric", month: "long", year: "numeric" }) + ".";
  var form = $("#rsvp-form");
  if (Date.now() > dl.getTime()) {
    form.hidden = true; $("#rsvp-closed").hidden = false;
  }
  form.addEventListener("submit", function (e) {
    e.preventDefault();
    var data = new FormData(form);
    if (data.get("website")) return; // honeypot
    var answer = data.get("answer");
    if (!answer) { $("#rsvp-status").textContent = "Please choose Yes or No."; return; }
    var payload = {
      token: params.get("i") || "", name: guest || data.get("name") || "", answer: answer,
      seats: answer === "YES" ? data.get("seats") : 0, names: data.get("names") || "", message: data.get("message") || ""
    };
    $("#rsvp-status").textContent = "Sending…";
    var done = function () {
      form.hidden = true;
      $("#rsvp-done").hidden = false;
      $("#done-text").textContent = answer === "YES"
        ? "We can't wait to celebrate with you."
        : "We'll miss you, and we understand. Thank you for letting us know.";
    };
    if (W.rsvp.mode === "demo" || !W.rsvp.endpoint) { setTimeout(done, 500); return; }
    fetch(W.rsvp.endpoint, { method: "POST", headers: { "Content-Type": "text/plain;charset=utf-8" }, body: JSON.stringify(payload) })
      .then(function (r) { return r.json(); })
      .then(function (r) { if (r && r.ok) done(); else $("#rsvp-status").textContent = (r && r.error) || "Something went wrong. Please try again."; })
      .catch(function () { $("#rsvp-status").textContent = "We couldn't reach the server. Please check your connection and try again."; });
  });
  document.querySelectorAll("input[name=answer]").forEach(function (r) {
    r.addEventListener("change", function () { $("#yes-fields").hidden = r.value !== "YES"; });
  });

  // Reveal on scroll
  if ("IntersectionObserver" in window) {
    var io = new IntersectionObserver(function (es) { es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add("in"); io.unobserve(e.target); } }); }, { rootMargin: "0px 0px -8% 0px" });
    document.querySelectorAll(".reveal").forEach(function (el) { io.observe(el); });
  } else {
    document.querySelectorAll(".reveal").forEach(function (el) { el.classList.add("in"); });
  }
})();
