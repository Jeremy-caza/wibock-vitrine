/* Page d'accueil coachs. */
(function () {
  function clamp(v, a, b) { return Math.min(b, Math.max(a, v)); }
  function lerp(a, b, t) { return a + (b - a) * t; }
  function seg(p, a, b) { return clamp((p - a) / (b - a), 0, 1); }
  function ease(t) { return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2; }

  /* ---------- téléphone 3D ---------- */
  var ath = document.getElementById("athlete");
  var rig = ath.querySelector(".rig");
  var screens = ath.querySelectorAll("[data-screen]");
  var heads = ath.querySelectorAll("[data-state]");
  var chips = ath.querySelectorAll(".chip3d");
  var state = -1, sp = 0;

  function phone(time) {
    var p = WB.progress(ath);
    sp += (p - sp) * (WB.reduce ? 1 : 0.1);
    var q = sp;
    var ry = lerp(-68, -18, ease(seg(q, 0, 0.22)));
    ry = lerp(ry, 0, ease(seg(q, 0.22, 0.4)));
    ry += 360 * ease(seg(q, 0.44, 0.76));
    ry += 14 * ease(seg(q, 0.82, 1));
    var rx = lerp(14, 4, ease(seg(q, 0, 0.4))) - 8 * ease(seg(q, 0.82, 1));
    var sc = lerp(0.86, 1, ease(seg(q, 0, 0.3)));
    var wob = WB.reduce ? 0 : Math.sin(time / 1400) * 2.2;
    rig.style.transform = "rotateX(" + (rx + wob * 0.4).toFixed(2) + "deg) rotateY(" + (ry + wob).toFixed(2) + "deg) scale(" + sc.toFixed(3) + ")";

    var s = q > 0.6 ? 1 : 0;
    if (s !== state) {
      state = s;
      screens.forEach(function (im, i) { im.classList.toggle("off", i !== s); });
      heads.forEach(function (h, i) { h.classList.toggle("off", i !== s); });
    }
    var spin = q > 0.45 && q < 0.75;
    chips.forEach(function (c) { c.style.opacity = spin ? 0 : 1; });
  }

  /* ---------- web app inclinée ---------- */
  var browser = document.getElementById("browser");
  var shot = browser.querySelector(".screen"), shotImg = shot.querySelector("img");
  function tilt() {
    var r = browser.getBoundingClientRect(), vh = window.innerHeight;
    var t = ease(clamp((vh - r.top) / (vh * 0.85), 0, 1));
    browser.style.transform = "rotateX(" + (42 * (1 - t)).toFixed(2) + "deg) scale(" + (0.86 + 0.14 * t).toFixed(3) + ")";
    /* mobile : le cadre reste fixe, la caméra glisse dans l'écran */
    var over = shotImg.offsetWidth - shot.clientWidth;
    if (over > 4) {
      var t2 = clamp((vh * 0.9 - r.top) / (vh * 1.1), 0, 1);
      shotImg.style.transform = "translate3d(" + (-over * ease(t2)).toFixed(1) + "px,0,0)";
    } else shotImg.style.transform = "";
    browser.style.opacity = (0.3 + 0.7 * t).toFixed(3);
  }

  (function loop(time) {
    phone(time || 0);
    tilt();
    requestAnimationFrame(loop);
  })();

  /* ---------- bibliothèque ---------- */
  var ex = [
    ["Back Squat", "Polyarticulaire"], ["Wall Soleus Iso Hold", "Prehab"], ["Ski Erg", "Cardio"], ["Hang Power Clean", "Haltéro"],
    ["Lateral Mini-Band Walk", "Activation"], ["Nordic Curl", "Ischios"], ["Single Leg Hip Thrust", "Fessiers"], ["Sled Push", "Cardio"],
    ["Bulgarian Split Squat", "Unilatéral"], ["Copenhagen Plank", "Adducteurs"], ["Box Jump", "Pliométrie"], ["Front Squat", "Polyarticulaire"],
    ["Pull-up", "Poids du corps"], ["90/90 Hip Switch", "Mobilité"], ["Romanian Deadlift", "Chaîne post."], ["Row", "Cardio"],
    ["Handstand Push-up", "Gymnastique"], ["Pallof Press", "Gainage"], ["Tibialis Raise", "Prehab"], ["Wall Ball", "Hybride"],
    ["Bench Press DB", "Polyarticulaire"], ["Cohérence cardiaque", "Récupération"], ["Depth Jump", "Pliométrie"], ["Farmer Carry", "Grip"],
    ["Bike", "Cardio"], ["Thoracic Rotation", "Mobilité"], ["Power Snatch", "Haltéro"], ["Sissy Squat", "Quadriceps"],
    ["Burpee Broad Jump", "Hybride"], ["Dead Bug", "Gainage"], ["Calf Raise Iso", "Prehab"], ["Push Press", "Haltéro"]
  ];
  var cols = document.getElementById("libcols");
  var html = "";
  for (var c = 0; c < 3; c++) {
    var items = "";
    for (var k = 0; k < 10; k++) {
      var e = ex[(c * 11 + k) % ex.length];
      items += '<span' + ((k + c) % 7 === 3 ? ' class="hl"' : "") + ">" + e[0] + "<small>" + e[1] + "</small></span>";
    }
    html += '<div class="lib-col">' + items + items + "</div>";
  }
  cols.innerHTML = html;

  /* ---------- anneau 92 / 8 ---------- */
  var ring = document.getElementById("ring");
  var C = 2 * Math.PI * 88, gap = 7;
  var coach = ring.querySelector(".c-coach"), us = ring.querySelector(".c-us");
  var L1 = 0.92 * C - gap, L2 = 0.08 * C - gap, start2 = 0.92 * C + gap / 2;
  coach.style.strokeDasharray = L1 + " " + C; coach.style.strokeDashoffset = L1;
  us.style.strokeDasharray = L2 + " " + C; us.style.strokeDashoffset = -start2 + L2;
  new IntersectionObserver(function (es, o) {
    if (!es[0].isIntersecting) return;
    coach.style.strokeDashoffset = 0;
    us.style.strokeDashoffset = -start2;
    o.disconnect();
  }, { threshold: 0.4 }).observe(ring);

  /* ---------- calcul ---------- */
  var range = document.getElementById("ath");
  var fmt = new Intl.NumberFormat("fr-FR", { maximumFractionDigits: 0 });
  function calc() {
    var n = +range.value, total = n * 39;
    document.getElementById("athOut").textContent = n;
    document.getElementById("you").textContent = fmt.format(total * 0.92) + " €";
    document.getElementById("us").textContent = fmt.format(total * 0.08) + " €";
    range.style.setProperty("--p", ((n - 1) / 299 * 100) + "%");
  }
  range.addEventListener("input", calc);
  calc();

  /* ---------- rail marketplace ---------- */
  var rail = document.getElementById("rail");
  rail.innerHTML = WB.programs.map(function (p, i) { return WB.card(p, "h" + i); }).join("");
  WB.observe(rail);
})();
