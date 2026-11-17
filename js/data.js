/* Contenu de démonstration (coachs et programmes fictifs). */
window.WB = window.WB || {};

WB.programs = [
  { id: "saison-neige", title: "Saison Neige", sport: "Ski alpin", cat: "neige", motif: "peaks",
    coach: "Léa Marchand", role: "Prépa physique ski, ex-équipe régionale", ini: "LM",
    a: "#7b4bf6", b: "#1a0f3d", price: 49, unit: "mois", weeks: 12, perWeek: 5, athletes: 38, level: "Compétition",
    pitch: "Douze semaines pour arriver en novembre avec des cuisses qui ne lâchent pas." },
  { id: "sub-3h", title: "Sub 3h", sport: "Marathon", cat: "endurance", motif: "lines",
    coach: "Karim Benali", role: "Coach running, 2h31 au marathon", ini: "KB",
    a: "#e64bd8", b: "#2a0b2c", price: 89, unit: "programme", weeks: 16, perWeek: 5, athletes: 112, level: "Confirmé",
    pitch: "Seize semaines, quatre cycles, un seul objectif affiché sur la montre." },
  { id: "engine", title: "Engine", sport: "Hyrox / CrossFit", cat: "hybride", motif: "bars",
    coach: "Tom Rivière", role: "Head coach box, juge Hyrox", ini: "TR",
    a: "#2f55f3", b: "#080d2b", price: 35, unit: "mois", weeks: 0, perWeek: 6, athletes: 204, level: "Tous niveaux",
    pitch: "EMOM, AMRAP, for time. Le moteur se construit séance après séance." },
  { id: "prehab", title: "Prehab", sport: "Mobilité", cat: "sante", motif: "rings",
    coach: "Inès Duval", role: "Kiné du sport", ini: "ID",
    a: "#4fc3e8", b: "#06202b", price: 19, unit: "mois", weeks: 0, perWeek: 3, athletes: 87, level: "Tous niveaux",
    pitch: "Vingt minutes, trois fois par semaine. Les hanches et le dos disent merci." },
  { id: "pre-saison-rugby", title: "Pré-saison", sport: "Rugby", cat: "collectif", motif: "pitch",
    coach: "Mathis Etcheverry", role: "Prépa physique Fédérale 1", ini: "ME",
    a: "#c6ff4a", b: "#14200a", price: 69, unit: "programme", weeks: 8, perWeek: 4, athletes: 56, level: "Club",
    pitch: "Huit semaines pour encaisser les contacts dès la première journée." },
  { id: "force", title: "Fondations", sport: "Force", cat: "force", motif: "plates",
    coach: "Sarah Koné", role: "Haltérophile, coach force", ini: "SK",
    a: "#ff7a45", b: "#2a1006", price: 29, unit: "mois", weeks: 0, perWeek: 4, athletes: 143, level: "Débutant",
    pitch: "Squat, tirage, développé. Les bases, programmées proprement." },
  { id: "vertical", title: "Vertical", sport: "Trail", cat: "endurance", motif: "peaks",
    coach: "Hugo Pelletier", role: "Traileur, finisher UTMB", ini: "HP",
    a: "#9d7bff", b: "#0f0b22", price: 59, unit: "programme", weeks: 10, perWeek: 5, athletes: 71, level: "Confirmé",
    pitch: "Du dénivelé, de la force excentrique et des descentes qui ne font plus peur." },
  { id: "explosif-u17", title: "Explosif", sport: "Football U17", cat: "collectif", motif: "pitch",
    coach: "Yanis Morel", role: "Prépa centre de formation", ini: "YM",
    a: "#ffffff", b: "#141218", price: 39, unit: "mois", weeks: 0, perWeek: 3, athletes: 64, level: "Académie",
    pitch: "Vitesse, appuis, prévention. Ce qu'un centre de formation fait, en poche." }
];

WB.byId = function (id) {
  return WB.programs.find(function (p) { return p.id === id; }) || WB.programs[0];
};

WB.cats = [
  ["all", "Tout"], ["neige", "Neige"], ["endurance", "Endurance"], ["hybride", "Hybride"],
  ["force", "Force"], ["collectif", "Sports co"], ["sante", "Mobilité"]
];

WB.mark = function (fill, hole) {
  var r = 26.9, s = 34;
  var t = "";
  [[0, -r], [r, 0], [0, r], [-r, 0]].forEach(function (p) {
    t += '<rect x="' + (p[0] - s / 2) + '" y="' + (p[1] - s / 2) + '" width="' + s + '" height="' + s +
      '" rx="7" transform="rotate(45 ' + p[0] + ' ' + p[1] + ')"/>';
  });
  return '<svg viewBox="-52 -52 104 104" fill="' + (fill || "currentColor") + '" aria-hidden="true"><g>' + t +
    '</g><circle r="8.2" fill="' + (hole || "#060509") + '"/></svg>';
};

/* Couvertures génératives : pas de photo, donc rien qui casse. */
WB.cover = function (p, opt) {
  opt = opt || {};
  var W = 400, H = 440, a = p.a, b = p.b, id = "g" + p.id.replace(/[^a-z0-9]/gi, "") + (opt.k || "");
  var dark = a === "#ffffff" || a === "#c6ff4a";
  var m = "";
  var i;
  if (p.motif === "peaks") {
    for (i = 0; i < 5; i++) {
      var y = 250 + i * 34, pts = "-10," + (H + 10) + " ";
      for (var x = -10; x <= W + 20; x += 40) {
        var h = Math.abs(Math.sin((x + i * 57) * 0.021) * 120 + Math.cos((x * 0.05) + i) * 30);
        pts += x + "," + (y - h * (1 - i * 0.15)) + " ";
      }
      pts += (W + 20) + "," + (H + 10);
      m += '<polygon points="' + pts + '" fill="' + (i === 0 ? a : b) + '" opacity="' + (i === 0 ? 0.9 : 0.85) + '" stroke="' + a + '" stroke-opacity=".5"/>';
    }
  } else if (p.motif === "lines") {
    for (i = 0; i < 26; i++) {
      var yy = 30 + i * 16, len = 120 + ((i * 97) % 240);
      m += '<rect x="' + (W - len - ((i * 53) % 90)) + '" y="' + yy + '" width="' + len + '" height="' + (i % 4 === 0 ? 6 : 2) + '" rx="3" fill="' + a + '" opacity="' + (0.25 + (i % 5) * 0.15) + '" transform="skewX(-20)"/>';
    }
  } else if (p.motif === "bars") {
    for (i = 0; i < 18; i++) {
      var bh = 60 + Math.abs(Math.sin(i * 1.7) * 230);
      m += '<rect x="' + (14 + i * 22) + '" y="' + (H - bh - 30) + '" width="14" height="' + bh + '" rx="7" fill="' + a + '" opacity="' + (i % 3 === 0 ? 1 : 0.4) + '"/>';
    }
  } else if (p.motif === "rings") {
    for (i = 0; i < 9; i++) {
      m += '<circle cx="290" cy="170" r="' + (20 + i * 28) + '" fill="none" stroke="' + a + '" stroke-width="' + (i === 3 ? 10 : 1.5) + '" opacity="' + (1 - i * 0.09) + '"/>';
    }
  } else if (p.motif === "pitch") {
    m += '<g fill="none" stroke="' + a + '" stroke-width="2" opacity=".7" transform="rotate(-14 200 220)">' +
      '<rect x="40" y="-40" width="320" height="520" rx="4"/><line x1="40" y1="220" x2="360" y2="220"/>' +
      '<circle cx="200" cy="220" r="56"/><rect x="120" y="-40" width="160" height="90"/><rect x="120" y="390" width="160" height="90"/></g>' +
      '<circle cx="200" cy="220" r="8" fill="' + a + '"/>';
  } else if (p.motif === "plates") {
    [[110, 300, 120], [300, 150, 90], [330, 360, 60]].forEach(function (c) {
      m += '<circle cx="' + c[0] + '" cy="' + c[1] + '" r="' + c[2] + '" fill="none" stroke="' + a + '" stroke-width="' + c[2] * 0.42 + '" opacity=".85"/>' +
        '<circle cx="' + c[0] + '" cy="' + c[1] + '" r="' + c[2] * 0.12 + '" fill="' + a + '"/>';
    });
  }
  var word = p.sport.split(" ")[0].toUpperCase();
  return '<svg viewBox="0 0 ' + W + ' ' + H + '" preserveAspectRatio="xMidYMid slice" xmlns="http://www.w3.org/2000/svg">' +
    '<defs><radialGradient id="' + id + '" cx="30%" cy="20%" r="90%"><stop offset="0" stop-color="' + a + '" stop-opacity=".55"/>' +
    '<stop offset=".55" stop-color="' + b + '"/><stop offset="1" stop-color="#060509"/></radialGradient></defs>' +
    '<rect width="' + W + '" height="' + H + '" fill="url(#' + id + ')"/>' + m +
    '<text x="-6" y="' + (H - 18) + '" font-family="Saira, sans-serif" font-style="italic" font-weight="800" font-size="104" fill="none" stroke="' +
    (dark ? "#060509" : "#fff") + '" stroke-opacity=".55" stroke-width="1.4" letter-spacing="-2">' + word + '</text></svg>';
};

WB.avatar = function (p) {
  return 'style="background:linear-gradient(135deg,' + p.a + ',' + p.b + ');' + (p.a === "#ffffff" || p.a === "#c6ff4a" ? "color:#060509" : "") + '"';
};

WB.card = function (p, k) {
  var arrow = '<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 8h10M9 4l4 4-4 4"/></svg>';
  return '<a class="card rv" data-cat="' + p.cat + '" href="programme.html?id=' + p.id + '">' +
    '<div class="cv">' + WB.cover(p, { k: k }) + '<span class="badge">' + p.sport + '</span></div>' +
    '<div class="body"><h3 class="d">' + p.title + '</h3>' +
    '<div class="who"><span class="av" ' + WB.avatar(p) + '>' + p.ini + '</span>' + p.coach + '</div>' +
    '<div class="foot"><span class="price">' + p.price + ' €<small>/ ' + p.unit + '</small></span><span class="go">' + arrow + '</span></div></div></a>';
};
