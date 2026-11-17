/* Le logo WIBOCK en 3D : quatre tuiles = Programme, Cycle, Séance, Bloc. */
(function () {
  var stage = document.querySelector(".stage");
  if (!stage) return;
  var canvas = stage.querySelector("canvas");
  var heroCopy = stage.querySelector(".hero-copy");
  var heroMeta = stage.querySelector(".hero-meta");
  var levels = stage.querySelectorAll(".level");
  var ladder = stage.querySelector(".ladder");
  var dots = ladder ? ladder.querySelectorAll("i") : [];

  var renderer;
  try {
    if (!window.THREE) throw new Error("no three");
    renderer = new THREE.WebGLRenderer({ canvas: canvas, antialias: true, alpha: true, powerPreference: "high-performance" });
  } catch (e) {
    stage.classList.add("no-webgl");
    canvas.style.display = "none";
    renderer = null;
  }

  /* ---------- texte piloté par le scroll (marche même sans WebGL) ---------- */
  var BANDS = [[0.17, 0.335], [0.35, 0.515], [0.53, 0.695], [0.71, 0.89]];
  function updateText(p) {
    heroCopy.classList.toggle("gone", p > 0.07);
    heroMeta.classList.toggle("gone", p > 0.07);
    var active = -1;
    BANDS.forEach(function (b, i) {
      var on = p >= b[0] && p < b[1];
      if (on) active = i;
      levels[i].classList.toggle("on", on);
      levels[i].style.setProperty("--k", Math.min(1, Math.max(0, (p - b[0]) / (b[1] - b[0]))).toFixed(3));
    });
    if (ladder) {
      ladder.classList.toggle("on", active >= 0);
      dots.forEach(function (d, i) { d.classList.toggle("on", i <= active); });
    }
  }

  if (!renderer) {
    window.addEventListener("scroll", function () { updateText(WB.progress(stage)); }, { passive: true });
    updateText(0);
    return;
  }

  /* ---------- scène ---------- */
  var DPR = Math.min(window.devicePixelRatio || 1, 2);
  renderer.setPixelRatio(DPR);
  renderer.outputEncoding = THREE.sRGBEncoding;
  renderer.physicallyCorrectLights = true;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.05;

  var scene = new THREE.Scene();
  var camera = new THREE.PerspectiveCamera(32, 1, 0.1, 100);

  /* faux studio pour les reflets */
  (function env() {
    var c = document.createElement("canvas"); c.width = 512; c.height = 256;
    var g = c.getContext("2d");
    var bg = g.createLinearGradient(0, 0, 0, 256);
    bg.addColorStop(0, "#1a1030"); bg.addColorStop(0.5, "#07060b"); bg.addColorStop(1, "#000");
    g.fillStyle = bg; g.fillRect(0, 0, 512, 256);
    g.fillStyle = "#ffffff"; g.fillRect(60, 40, 120, 26);
    g.fillStyle = "#9b74ff"; g.fillRect(300, 60, 160, 50);
    g.fillStyle = "#5e22a6"; g.fillRect(0, 150, 512, 20);
    g.fillStyle = "#cbbaff"; g.fillRect(210, 20, 40, 90);
    var tex = new THREE.CanvasTexture(c);
    tex.mapping = THREE.EquirectangularReflectionMapping;
    tex.encoding = THREE.sRGBEncoding;
    var pm = new THREE.PMREMGenerator(renderer);
    scene.environment = pm.fromEquirectangular(tex).texture;
    tex.dispose(); pm.dispose();
  })();

  scene.add(new THREE.HemisphereLight(0xb9a1ff, 0x050308, 0.35));
  var key = new THREE.DirectionalLight(0xffffff, 1.6); key.position.set(-4, 6, 8); scene.add(key);
  var rim = new THREE.PointLight(0x7b4bf6, 60, 30, 2); rim.position.set(3, -2, -4); scene.add(rim);
  var hand = new THREE.PointLight(0xa98bff, 28, 18, 2); hand.position.set(0, 0, 5); scene.add(hand);

  /* tuile = carré arrondi extrudé, tourné à 45° */
  var S = 1.6, R = 0.34;
  var shape = new THREE.Shape();
  var h = S / 2;
  shape.moveTo(-h + R, -h);
  shape.lineTo(h - R, -h); shape.quadraticCurveTo(h, -h, h, -h + R);
  shape.lineTo(h, h - R); shape.quadraticCurveTo(h, h, h - R, h);
  shape.lineTo(-h + R, h); shape.quadraticCurveTo(-h, h, -h, h - R);
  shape.lineTo(-h, -h + R); shape.quadraticCurveTo(-h, -h, -h + R, -h);
  var geo = new THREE.ExtrudeGeometry(shape, { depth: 0.34, bevelEnabled: true, bevelThickness: 0.07, bevelSize: 0.06, bevelSegments: 5, curveSegments: 14 });
  geo.center();

  var GAP = 0.15, RAD = (S + GAP) / Math.SQRT2;
  var HOME = [[0, RAD], [RAD, 0], [0, -RAD], [-RAD, 0]];
  var base = new THREE.Color("#141119"), violet = new THREE.Color("#7b4bf6");

  var root = new THREE.Group(); scene.add(root);
  var tiles = HOME.map(function (h, i) {
    var mat = new THREE.MeshPhysicalMaterial({ color: base.clone(), metalness: 0.55, roughness: 0.22, clearcoat: 1, clearcoatRoughness: 0.08, envMapIntensity: 1.2, emissive: new THREE.Color(0x000000) });
    var mesh = new THREE.Mesh(geo, mat);
    mesh.rotation.z = Math.PI / 4;
    var pivot = new THREE.Group(); pivot.add(mesh); root.add(pivot);
    return { pivot: pivot, mat: mat, i: i };
  });

  /* poussière */
  var N = 260, pos = new Float32Array(N * 3);
  for (var i = 0; i < N; i++) { pos[i * 3] = (Math.random() - 0.5) * 18; pos[i * 3 + 1] = (Math.random() - 0.5) * 14; pos[i * 3 + 2] = (Math.random() - 0.5) * 10 - 2; }
  var pg = new THREE.BufferGeometry(); pg.setAttribute("position", new THREE.BufferAttribute(pos, 3));
  var dust = new THREE.Points(pg, new THREE.PointsMaterial({ color: 0xb9a1ff, size: 0.028, transparent: true, opacity: 0.55, depthWrite: false }));
  scene.add(dust);

  /* ---------- états ---------- */
  var portrait = true, yOff = 0, xOff = 0;
  function logo(scale, extra) {
    return tiles.map(function (t, i) {
      return { x: HOME[i][0] * scale + xOff, y: HOME[i][1] * scale + yOff, z: 0, rx: 0, ry: 0, rz: 0, s: scale, c: extra && i === 0 ? 0.0 : 0 };
    });
  }
  function focus(f) {
    var others = [0, 1, 2, 3].filter(function (k) { return k !== f; });
    return tiles.map(function (t, i) {
      if (i === f) return { x: portrait ? 0 : 1.9, y: yOff + (portrait ? 0.35 : 0.1), z: 1.4, rx: -0.38, ry: 0.62, rz: 0, s: portrait ? 1.25 : 1.45, c: 1 };
      var j = others.indexOf(i);
      var ang = -Math.PI / 2 + (j - 1) * 0.95 + f * 0.6;
      var rx = portrait ? 2.1 : 3.4, ry = portrait ? 3.0 : 2.4;
      return { x: Math.cos(ang) * rx + (portrait ? 0 : 1.9), y: Math.sin(ang) * ry * -1 + yOff + (portrait ? 0.9 : 0.4), z: -2.8, rx: 0.6 * (j - 1), ry: -0.8 + j * 0.5, rz: j * 0.3, s: 0.5, c: 0.06 };
    });
  }
  function KF() {
    return [
      [0.00, logo(1)], [0.11, logo(1)],
      [0.19, focus(0)], [0.30, focus(0)],
      [0.37, focus(1)], [0.48, focus(1)],
      [0.55, focus(2)], [0.66, focus(2)],
      [0.73, focus(3)], [0.85, focus(3)],
      [0.95, logo(0.8)], [1.00, logo(0.8)]
    ];
  }
  var frames;

  function ease(t) { return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2; }
  function lerp(a, b, t) { return a + (b - a) * t; }
  function sample(p) {
    for (var k = 0; k < frames.length - 1; k++) {
      if (p <= frames[k + 1][0]) {
        var t = ease((p - frames[k][0]) / Math.max(1e-4, frames[k + 1][0] - frames[k][0]));
        var A = frames[k][1], B = frames[k + 1][1];
        return A.map(function (a, i) {
          var b = B[i], o = {};
          for (var key in a) o[key] = lerp(a[key], b[key], t);
          return o;
        });
      }
    }
    return frames[frames.length - 1][1];
  }

  /* ---------- taille ---------- */
  function resize() {
    var w = stage.querySelector(".stage-pin").clientWidth, hgt = stage.querySelector(".stage-pin").clientHeight;
    renderer.setSize(w, hgt, false);
    camera.aspect = w / hgt;
    portrait = camera.aspect < 0.9;
    var tan = Math.tan(THREE.MathUtils.degToRad(camera.fov / 2));
    var needW = portrait ? 6.2 : 9.5;
    camera.position.z = Math.max(12, needW / (2 * tan * camera.aspect));
    yOff = portrait ? 1.15 * (camera.position.z / 12) : 0.25;
    xOff = portrait ? 0 : Math.min(3.7, camera.aspect * 1.85);
    camera.updateProjectionMatrix();
    frames = KF();
  }
  resize();
  window.addEventListener("resize", resize);

  /* ---------- interaction ---------- */
  var px = 0, py = 0, tx = 0, ty = 0;
  window.addEventListener("pointermove", function (e) {
    tx = (e.clientX / window.innerWidth) * 2 - 1;
    ty = (e.clientY / window.innerHeight) * 2 - 1;
  }, { passive: true });

  var visible = true;
  new IntersectionObserver(function (es) { visible = es[0].isIntersecting; }).observe(stage);

  var clock = new THREE.Clock();
  var smoothP = 0;
  function frame() {
    requestAnimationFrame(frame);
    var p = WB.progress(stage);
    updateText(p);
    if (!visible) return;
    var time = clock.getElapsedTime();
    smoothP += (p - smoothP) * (WB.reduce ? 1 : 0.12);
    var st = sample(smoothP);
    var breathe = 1 + Math.sin(time * 1.4) * 0.025 * (1 - Math.min(1, smoothP * 8));

    tiles.forEach(function (t, i) {
      var s = st[i];
      var hx = s.x, hy = s.y;
      if (smoothP < 0.12) { hx = (s.x - xOff) * breathe + xOff; hy = (s.y - yOff) * breathe + yOff; }
      var bob = Math.sin(time * 0.9 + i * 1.7) * 0.06;
      t.pivot.position.set(hx, hy + bob, s.z);
      t.pivot.rotation.set(s.rx + Math.sin(time * 0.6 + i) * 0.05, s.ry + Math.cos(time * 0.5 + i) * 0.05, s.rz);
      t.pivot.scale.setScalar(s.s);
      t.mat.color.copy(base).lerp(violet, s.c);
      t.mat.emissive.copy(violet).multiplyScalar(0.18 * s.c);
    });

    px += (tx - px) * 0.05; py += (ty - py) * 0.05;
    var idle = WB.reduce ? 0 : 1;
    root.rotation.y = px * 0.35 + Math.sin(time * 0.35) * 0.12 * idle;
    root.rotation.x = py * 0.22 + Math.cos(time * 0.3) * 0.06 * idle;
    hand.position.set(px * 6 + xOff, -py * 4 + yOff, 5);
    dust.rotation.y = time * 0.02;
    dust.position.y = Math.sin(time * 0.2) * 0.2;

    renderer.render(scene, camera);
  }
  frame();
})();
