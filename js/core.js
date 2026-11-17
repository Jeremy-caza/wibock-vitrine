/* Comportements communs : nav, menu, curseur, transitions, apparitions, tickers. */
(function () {
  var html = document.documentElement;
  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  WB.reduce = reduce;

  /* ---- marks ---- */
  document.querySelectorAll("[data-mark]").forEach(function (el) {
    el.innerHTML = WB.mark(el.getAttribute("data-mark") || "currentColor", el.getAttribute("data-hole") || "#060509");
  });

  /* ---- split words ---- */
  var n = 0;
  function split(node) {
    Array.prototype.slice.call(node.childNodes).forEach(function (c) {
      if (c.nodeType === 3) {
        var frag = document.createDocumentFragment();
        c.textContent.split(/(\s+)/).forEach(function (part) {
          if (!part) return;
          if (/^\s+$/.test(part)) { frag.appendChild(document.createTextNode(" ")); return; }
          var w = document.createElement("span"); w.className = "w";
          var i = document.createElement("i"); i.style.setProperty("--i", n++); i.textContent = part;
          w.appendChild(i); frag.appendChild(w);
        });
        c.parentNode.replaceChild(frag, c);
      } else if (c.nodeType === 1 && c.tagName !== "BR") split(c);
    });
  }
  document.querySelectorAll("[data-split]").forEach(function (el) { n = 0; split(el); el.classList.add("rv-split"); });

  /* ---- reveal ---- */
  var io = new IntersectionObserver(function (es) {
    es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add("in"); io.unobserve(e.target); } });
  }, { rootMargin: "0px 0px -8% 0px", threshold: 0.12 });
  WB.observe = function (root) {
    (root || document).querySelectorAll(".rv, .rv-split, [data-in]").forEach(function (el) { io.observe(el); });
  };
  WB.observe();

  /* ---- nav ---- */
  var nav = document.querySelector(".nav");
  var lastY = window.scrollY;
  function onScrollNav() {
    var y = window.scrollY;
    if (!nav) return;
    nav.classList.toggle("solid", y > 40);
    if (!html.classList.contains("menu-open")) nav.classList.toggle("hide", y > lastY + 4 && y > 200);
    if (y < lastY - 4) nav.classList.remove("hide");
    lastY = y;
  }
  window.addEventListener("scroll", onScrollNav, { passive: true });
  onScrollNav();
  var burger = document.querySelector(".burger");
  if (burger) burger.addEventListener("click", function () {
    var open = html.classList.toggle("menu-open");
    burger.setAttribute("aria-expanded", open);
  });

  /* ---- cursor ---- */
  if (window.matchMedia("(hover: hover) and (pointer: fine)").matches && !reduce) {
    var cur = document.createElement("div");
    cur.className = "cursor";
    cur.innerHTML = "<span></span><span></span><span></span><span></span>";
    document.body.appendChild(cur);
    html.classList.add("has-cursor");
    var mx = -100, my = -100, cx = -100, cy = -100;
    window.addEventListener("pointermove", function (e) { mx = e.clientX; my = e.clientY; }, { passive: true });
    window.addEventListener("pointerdown", function () { cur.classList.add("down"); });
    window.addEventListener("pointerup", function () { cur.classList.remove("down"); });
    document.addEventListener("pointerover", function (e) {
      cur.classList.toggle("hot", !!e.target.closest("a, button, input, .tiles > div"));
    });
    document.addEventListener("pointerleave", function () { mx = my = -100; });
    (function loop() {
      cx += (mx - cx) * 0.22; cy += (my - cy) * 0.22;
      cur.style.transform = "translate3d(" + cx + "px," + cy + "px,0)";
      requestAnimationFrame(loop);
    })();
  }

  /* ---- page transitions ---- */
  var veil = document.createElement("div");
  veil.className = "veil";
  for (var k = 0; k < 6; k++) { var s = document.createElement("i"); s.style.setProperty("--i", k); veil.appendChild(s); }
  document.body.appendChild(veil);
  function reveal() {
    veil.classList.add("cover", "leave");
    void veil.offsetWidth;
    html.classList.remove("vt");
    requestAnimationFrame(function () { requestAnimationFrame(function () { veil.classList.remove("cover"); }); });
  }
  if (html.classList.contains("vt")) reveal();
  setTimeout(function () { html.classList.remove("vt"); }, 1500);
  window.addEventListener("pageshow", function (e) { if (e.persisted) { veil.classList.remove("cover"); html.classList.remove("vt", "menu-open"); } });

  document.addEventListener("click", function (e) {
    var a = e.target.closest("a[href]");
    if (!a || e.defaultPrevented || e.metaKey || e.ctrlKey || e.shiftKey || a.target === "_blank") return;
    var href = a.getAttribute("href");
    if (!href || href.charAt(0) === "#" || /^(mailto|tel|https?):/.test(href)) {
      if (href && href.charAt(0) === "#") {
        e.preventDefault();
        html.classList.remove("menu-open");
        var t = document.querySelector(href);
        if (t) t.scrollIntoView({ behavior: reduce ? "auto" : "smooth" });
      }
      return;
    }
    e.preventDefault();
    if (reduce) { location.href = href; return; }
    try { sessionStorage.setItem("wbvt", "1"); } catch (err) {}
    veil.classList.remove("leave");
    veil.classList.add("cover");
    setTimeout(function () { location.href = href; }, 620);
  });

  /* ---- tickers (vitesse liée au scroll) ---- */
  var tracks = Array.prototype.slice.call(document.querySelectorAll(".track"));
  if (tracks.length) {
    tracks.forEach(function (t) { t.innerHTML += t.innerHTML; t._x = 0; });
    var vel = 0, prevY = window.scrollY, last = performance.now();
    (function tick(now) {
      var dt = Math.min(64, now - last); last = now;
      var y = window.scrollY; vel += ((y - prevY) - vel) * 0.1; prevY = y;
      tracks.forEach(function (t) {
        var dir = t.classList.contains("b") ? 1 : -1;
        var w = t.scrollWidth / 2;
        if (!w) return;
        t._x += dir * (reduce ? 0 : (0.04 * dt + Math.abs(vel) * 0.5));
        if (t._x <= -w) t._x += w;
        if (t._x > 0) t._x -= w;
        t.style.transform = "translate3d(" + t._x + "px,0,0)";
      });
      requestAnimationFrame(tick);
    })(last);
  }

  /* ---- utilitaire : progression d'une section épinglée ---- */
  WB.progress = function (el) {
    var r = el.getBoundingClientRect();
    var total = r.height - window.innerHeight;
    return total > 0 ? Math.min(1, Math.max(0, -r.top / total)) : 0;
  };
})();
