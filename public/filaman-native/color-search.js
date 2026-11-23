function j(e) {
  if (!e) return "";
  let t = String(e).trim().replace(/^#/, "");
  return !t || ((t.length === 3 || t.length === 4) && (t = t.split("").map((r) => r + r).join("")), !/^[0-9a-fA-F]+$/.test(t) || t.length !== 6 && t.length !== 8) ? "" : `#${t.toUpperCase()}`;
}
function Me(e, t = "#000000") {
  const r = j(e);
  if (!r.startsWith("#")) return t;
  const o = r.slice(1);
  return o.length === 8 ? `#${o.slice(0, 6)}` : r;
}
function Ne(e, t = "transparent") {
  const r = j(e);
  if (!r.startsWith("#")) return t;
  const o = r.slice(1);
  if (o.length === 6) return r;
  const n = parseInt(o.slice(0, 2), 16), l = parseInt(o.slice(2, 4), 16), i = parseInt(o.slice(4, 6), 16), c = Number((parseInt(o.slice(6, 8), 16) / 255).toFixed(3));
  return `rgba(${n}, ${l}, ${i}, ${c})`;
}
function $e(e, t = "transparent") {
  const r = Ne(e, t);
  return [
    `linear-gradient(${r}, ${r})`,
    "conic-gradient(#D1D5DB 25%, #FFFFFF 0 50%, #D1D5DB 0 75%, #FFFFFF 0) 0 / 8px 8px"
  ].join(", ");
}
function He(e) {
  const t = e.hue * Math.PI / 180;
  return { ...e, x: 50 + Math.cos(t) * e.saturation / 2, y: 50 - Math.sin(t) * e.saturation / 2 };
}
const Pe = {
  single: [0],
  complementary: [0, 180],
  triadic: [0, 120, 240],
  analogous: [0, 30, 330],
  "split-complementary": [0, 150, 210]
};
function ge(e) {
  const t = j(e);
  return t ? { hex: t, ...Ie(t), transparent: t.length === 9 && t.slice(-2) !== "FF" } : null;
}
function Ie(e) {
  const t = Number.parseInt(e.slice(1, 3), 16) / 255, r = Number.parseInt(e.slice(3, 5), 16) / 255, o = Number.parseInt(e.slice(5, 7), 16) / 255, n = Math.max(t, r, o), l = Math.min(t, r, o), i = n - l;
  let c = 0;
  return i !== 0 && (n === t ? c = (r - o) / i % 6 : n === r ? c = (o - t) / i + 2 : c = (t - r) / i + 4, c = (c * 60 + 360) % 360), {
    hue: c,
    saturation: n === 0 ? 0 : i / n * 100,
    value: n * 100
  };
}
function qe(e, t) {
  const r = Math.abs(e - t) % 360;
  return Math.min(r, 360 - r);
}
function Re(e, t) {
  const r = document.createElement("div");
  r.className = "fm-header-color-wheel";
  const o = document.createElement("span");
  o.className = "fm-header-color-wheel-surface", o.setAttribute("aria-hidden", "true"), r.appendChild(o);
  for (let a = 0; a < t; a++) {
    const u = document.createElement("span");
    u.className = "fm-header-color-wheel-selection", u.dataset.colorWindow = String(a), u.setAttribute("aria-hidden", "true"), r.appendChild(u);
  }
  const n = document.createElement("div");
  n.className = "fm-header-color-wheel-wrap", n.appendChild(r);
  const l = document.createElementNS(Y, "svg");
  l.classList.add("fm-header-color-markers"), l.setAttribute("viewBox", "0 0 100 100"), l.setAttribute("aria-hidden", "true");
  const i = 4 * Math.SQRT2 / 1.8, c = 4 / 1.8;
  return l.innerHTML = `
    <defs>
      <pattern id="${e}-marker-hatch" width="${i}" height="${i}" patternUnits="userSpaceOnUse">
        <path d="M0 0L${i} ${i}" stroke="white" stroke-opacity="0.13" stroke-width="${1 / 1.8}"/>
        <path d="M0 ${i}L${i} 0" stroke="black" stroke-opacity="0.09" stroke-width="${1 / 1.8}"/>
      </pattern>
      <pattern id="${e}-marker-alpha" width="${2 * c}" height="${2 * c}" patternUnits="userSpaceOnUse">
        <rect width="100%" height="100%" fill="#FFFFFF"/>
        <rect x="${c}" width="${c}" height="${c}" fill="#D1D5DB"/>
        <rect y="${c}" width="${c}" height="${c}" fill="#D1D5DB"/>
      </pattern>
    </defs>
    <g data-color-marker-layer="excluded"></g><g data-color-marker-layer="matching"></g>`, n.appendChild(l), ye.set(l, { id: e }), { wheel: r, wheelWrap: n, markers: l };
}
const Y = "http://www.w3.org/2000/svg", ye = /* @__PURE__ */ new WeakMap();
function Oe(e, t, r, { active: o, neutral: n = !1, neutralSaturation: l = 100, tone: i, referenceHex: c, referenceRing: a }) {
  const u = e.querySelector('[data-color-marker-layer="excluded"]'), s = e.querySelector('[data-color-marker-layer="matching"]'), b = ye.get(e);
  (b.samples !== t || !b.markers) && (b.samples = t, b.neutral = void 0, b.markers = [...t.values()].map((g) => {
    const E = document.createElementNS(Y, "circle");
    E.dataset.colorMarker = g.hex, E.setAttribute("fill", g.hex), E.setAttribute("r", "2.6");
    const w = document.createElementNS(Y, "circle");
    w.classList.add("fm-header-color-marker-hatch"), w.setAttribute("r", "2.6"), w.setAttribute("fill", `url(#${b.id}-marker-hatch)`);
    const N = document.createElementNS(Y, "g");
    if (g.transparent) {
      const k = document.createElementNS(Y, "circle");
      k.classList.add("fm-header-color-marker-backing"), k.setAttribute("r", "2.6"), k.setAttribute("fill", `url(#${b.id}-marker-alpha)`), N.appendChild(k);
    }
    return N.append(E, w), E;
  }), u.replaceChildren(), s.replaceChildren(...b.markers.map((g) => g.parentElement)));
  let m;
  for (const g of b.markers) {
    const E = t.get(g.dataset.colorMarker);
    if (b.neutral !== n) {
      const H = String(n ? 50 + E.value / 2 : E.x), P = String(n ? 50 : E.y);
      for (const h of g.parentElement.children)
        h.setAttribute("cx", H), h.setAttribute("cy", P);
    }
    const w = n && E.saturation > l ? "none" : "";
    g.style.display !== w && (g.style.display = w);
    const N = r(E.hex), k = E.hex === c, F = !o || N !== void 0 || k;
    c !== void 0 && (g.classList.toggle("is-reference", k), g.classList.toggle("is-reference-ring", k && !!a)), g.classList.toggle("is-matching", o && N !== void 0), o && N !== void 0 && N > 0 && i ? g.dataset.colorHarmonyTone = i : delete g.dataset.colorHarmonyTone;
    const p = g.nextElementSibling, d = F || w === "none" ? "none" : "";
    p.style.display !== d && (p.style.display = d);
    const v = g.previousElementSibling;
    if (v) {
      const H = F && w !== "none" && !(k && a) ? "" : "none";
      v.style.display !== H && (v.style.display = H);
    }
    const C = F ? s : u, T = g.parentElement;
    k ? m = T : T.parentNode !== C && C.appendChild(T);
  }
  m && s.lastElementChild !== m && s.appendChild(m), b.neutral = n;
}
function Ve(e, t, r) {
  if (t === 360) return "conic-gradient(transparent, transparent)";
  const o = [];
  for (const i of r) {
    const c = ((90 - e - i) % 360 + 360) % 360;
    o.push([c, Math.min(360, c + t)]), c + t > 360 && o.push([0, c + t - 360]);
  }
  o.sort((i, c) => i[0] - c[0]);
  const n = [];
  let l = 0;
  for (const [i, c] of o)
    i > l && n.push(`#000 ${l}deg ${i}deg`), c > l && n.push(`transparent ${Math.max(l, i)}deg ${c}deg`), l = Math.max(l, c);
  return l < 360 && n.push(`#000 ${l}deg 360deg`), `conic-gradient(${n.join(", ")})`;
}
const ae = { en: { filters: { triadicMarks: "Triadic (2 marks)", colorHarmony: "Color harmony", single: "Single", complementary: "Complementary", triadic: "Triadic", analogous: "Analogous", splitComplementary: "Split complementary", similar: "Similar", referenceColor: "Reference color", selectedRange: "Selected range", triadicRange1: "Triadic range 1", triadicRange2: "Triadic range 2", closestHueFirst: "Closest hue first", apply: "Apply", clear: "Clear", clearFilter: "Clear {label}", selectAll: "Select all", selectNone: "Select none", contains: "Contains", equals: "Equals", startsWith: "Starts with", endsWith: "Ends with", notContains: "Does not contain", notEquals: "Does not equal", greaterThan: "Greater than", atLeast: "At least", lessThan: "Less than", atMost: "At most", between: "Between", on: "On", before: "Before", after: "After", isEmpty: "Is empty", isNotEmpty: "Is not empty", noMatchingOptions: "No matching options", searchOptions: "Search {label} options...", filterValue: "Filter {label}...", filterColumn: "Filter {label}", filterColumnActive: "Filter {label}, active", filterOperator: "{label} filter operator", filterInput: "{label} filter value", upperFilterInput: "{label} upper filter value", colorList: "Color list", colorListLock: "List filter active. Clear it to use the wheel.", clearListFilter: "Clear list filter", clearColorRange: "Clear color range", colorFilter: "Color filter", hueArc: "Hue arc", moveHueArc: "Move hue arc", saturationRange: "Saturation range", colorTolerance: "Color tolerance", valueRange: "Value / darkness range", wheelPreview: "Color wheel preview value", rangeStart: "start", rangeEnd: "end", softBlack: "Black", softWhite: "White", softGrey: "Grey", presetRed: "Red", presetOrange: "Orange", presetYellow: "Yellow", presetGreen: "Green", presetBlue: "Blue", presetIndigo: "Indigo", presetViolet: "Violet", resetRange: "Reset {label}", includeTransparent: "Include transparent hex", sortColumn: "Sort {label}", sortColumnState: "Sort {label}: {state}", ascending: "ascending", descending: "descending", notSorted: "not sorted" }, filaments: { color: "Color", colors: "Colors" } }, de: { filters: { triadicMarks: "Triadisch (2 Markierungen)", colorHarmony: "Farbharmonie", single: "Einzeln", complementary: "Komplementär", triadic: "Triadisch", analogous: "Analog", splitComplementary: "Geteilt komplementär", similar: "Ähnlich", referenceColor: "Referenzfarbe", selectedRange: "Gewählter Bereich", triadicRange1: "Triadischer Bereich 1", triadicRange2: "Triadischer Bereich 2", closestHueFirst: "Ähnlichster Farbton zuerst", apply: "Übernehmen", clear: "Löschen", clearFilter: "{label} löschen", selectAll: "Alle auswählen", selectNone: "Keine auswählen", contains: "Enthält", equals: "Ist gleich", startsWith: "Beginnt mit", endsWith: "Endet mit", notContains: "Enthält nicht", notEquals: "Ist ungleich", greaterThan: "Größer als", atLeast: "Mindestens", lessThan: "Kleiner als", atMost: "Höchstens", between: "Zwischen", on: "Am", before: "Vor", after: "Nach", isEmpty: "Ist leer", isNotEmpty: "Ist nicht leer", noMatchingOptions: "Keine passenden Optionen", searchOptions: "{label}-Optionen durchsuchen...", filterValue: "{label} filtern...", filterColumn: "{label} filtern", filterColumnActive: "{label} filtern, aktiv", filterOperator: "Filteroperator für {label}", filterInput: "Filterwert für {label}", upperFilterInput: "Oberer Filterwert für {label}", colorList: "Farbliste", colorListLock: "Listenfilter aktiv. Für das Farbrad löschen.", clearListFilter: "Listenfilter löschen", clearColorRange: "Farbbereich löschen", colorFilter: "Farbfilter", hueArc: "Farbtonbogen", moveHueArc: "Farbtonbogen verschieben", saturationRange: "Sättigungsbereich", colorTolerance: "Farbtoleranz", valueRange: "Helligkeitsbereich", wheelPreview: "Vorschauwert des Farbrads", rangeStart: "Anfang", rangeEnd: "Ende", softBlack: "Schwarz", softWhite: "Weiß", softGrey: "Grau", presetRed: "Rot", presetOrange: "Orange", presetYellow: "Gelb", presetGreen: "Grün", presetBlue: "Blau", presetIndigo: "Indigo", presetViolet: "Violett", resetRange: "{label} zurücksetzen", includeTransparent: "Transparente Hex-Codes einbeziehen", sortColumn: "{label} sortieren", sortColumnState: "{label} sortieren: {state}", ascending: "aufsteigend", descending: "absteigend", notSorted: "nicht sortiert" }, filaments: { color: "Farbe", colors: "Farben" } }, fr: { filters: { triadicMarks: "Triadique (2 repères)", colorHarmony: "Harmonie des couleurs", single: "Simple", complementary: "Complémentaire", triadic: "Triadique", analogous: "Analogues", splitComplementary: "Complémentaires adjacentes", similar: "Similaires", referenceColor: "Couleur de référence", selectedRange: "Plage sélectionnée", triadicRange1: "Plage triadique 1", triadicRange2: "Plage triadique 2", closestHueFirst: "Teinte la plus proche en premier", apply: "Appliquer", clear: "Effacer", clearFilter: "Effacer {label}", selectAll: "Tout sélectionner", selectNone: "Tout désélectionner", contains: "Contient", equals: "Égal à", startsWith: "Commence par", endsWith: "Se termine par", notContains: "Ne contient pas", notEquals: "Différent de", greaterThan: "Supérieur à", atLeast: "Au moins", lessThan: "Inférieur à", atMost: "Au plus", between: "Entre", on: "Le", before: "Avant", after: "Après", isEmpty: "Est vide", isNotEmpty: "N'est pas vide", noMatchingOptions: "Aucune option correspondante", searchOptions: "Rechercher dans les options {label}…", filterValue: "Filtrer {label}…", filterColumn: "Filtrer {label}", filterColumnActive: "Filtrer {label}, actif", filterOperator: "Opérateur de filtre pour {label}", filterInput: "Valeur de filtre pour {label}", upperFilterInput: "Valeur de filtre supérieure pour {label}", colorList: "Liste de couleurs", colorListLock: "Filtre actif. Effacez-le pour utiliser la roue.", clearListFilter: "Effacer le filtre de liste", clearColorRange: "Effacer la plage de couleurs", colorFilter: "Filtre de couleur", hueArc: "Arc de teinte", moveHueArc: "Déplacer l'arc de teinte", saturationRange: "Plage de saturation", colorTolerance: "Tolérance de couleur", valueRange: "Plage de luminosité", wheelPreview: "Valeur d'aperçu de la roue chromatique", rangeStart: "début", rangeEnd: "fin", softBlack: "Noir", softWhite: "Blanc", softGrey: "Gris", presetRed: "Rouge", presetOrange: "Orange", presetYellow: "Jaune", presetGreen: "Vert", presetBlue: "Bleu", presetIndigo: "Indigo", presetViolet: "Violet", resetRange: "Réinitialiser {label}", includeTransparent: "Inclure les codes hex transparents", sortColumn: "Trier {label}", sortColumnState: "Trier {label} : {state}", ascending: "croissant", descending: "décroissant", notSorted: "non trié" }, filaments: { color: "Couleur", colors: "Couleurs" } } };
let be = "en";
function mt(e) {
  be = e in ae ? e : "en";
}
function y(e, t = {}) {
  const r = (n) => e.split(".").reduce((l, i) => l?.[i], n);
  let o = r(ae[be]) ?? r(ae.en) ?? e;
  for (const [n, l] of Object.entries(t)) o = o.replaceAll("{" + n + "}", String(l));
  return o;
}
function oe(e) {
  if (typeof e == "number") return Number.isFinite(e) ? e : null;
  if (typeof e != "string" || e.trim() === "") return null;
  const t = Number(e);
  return Number.isFinite(t) ? t : null;
}
function De(e, t = null) {
  if (typeof e != "object" || e === null || Array.isArray(e)) {
    const i = oe(e);
    return i === null ? "" : t === null ? String(i) : i.toFixed(t);
  }
  const r = e, o = oe(r.min), n = oe(r.max), l = (i) => t === null ? String(i) : i.toFixed(t);
  return o === null ? n === null ? "" : l(n) : n === null || o === n ? l(o) : `${l(o)}–${l(n)}`;
}
function Be(e) {
  if (e == null) return "";
  if (Array.isArray(e)) return e.map((t) => t !== null && typeof t == "object" ? JSON.stringify(t) : String(t)).join(", ");
  if (typeof e == "object") {
    const t = e;
    return "min" in t || "max" in t ? De(t) : JSON.stringify(e);
  }
  return String(e);
}
function ve(e, t, r) {
  if (e.transparent && !t.includeTransparent) return !1;
  if (t.mode === "none") return e.transparent;
  if (t.mode === "color") return Je(e.hue, t, r) && e.saturation >= Math.min(t.saturationFrom, t.saturationTo) && e.saturation <= Math.max(t.saturationFrom, t.saturationTo) && e.value >= Math.min(t.valueFrom, t.valueTo) && e.value <= Math.max(t.valueFrom, t.valueTo);
  const [o, n] = se(t);
  return e.value >= o && e.value <= n && e.saturation <= te(t);
}
function Z(e) {
  const t = e.getColorHexes?.();
  t && (t.length !== e.options.length || t.some((a, u) => a !== e.options[u].value)) && (e.options = t.map((a) => ({ value: a, label: a, colorHexes: [a] })));
  let r = e.colorCache;
  if (!r || r.options !== e.options) {
    const a = /* @__PURE__ */ new Map();
    for (const u of e.options) for (const s of u.colorHexes || []) {
      const b = ge(s);
      b && !a.has(b.hex) && a.set(b.hex, { ...He(b), sort: pt(b.hex) });
    }
    r = e.colorCache = { options: e.options, samples: a, key: "", matches: /* @__PURE__ */ new Map(), optionsMatched: /* @__PURE__ */ new Map(), matchingHexes: /* @__PURE__ */ new Set() };
  }
  const o = I(e), n = o ? JSON.stringify({ ...o, valuePreview: 0 }) : "none";
  if (r.key === n) return r;
  r.key = n;
  const l = !!o && D(o), i = o ? re(o) : [0], c = l && o.mode === "color" && Q(o) < 360;
  r.matchingHexes.clear();
  for (const a of r.samples.values()) {
    let u = null;
    i.forEach((s, b) => {
      if (l && !ve(a, o, s)) return;
      const m = o ? (o.hueFrom + Q(o) / 2 + s) % 360 : 0, g = c ? qe(a.hue, m) : 0;
      (!u || g < u.distance) && (u = { group: b, hex: a.hex, distance: g, hue: a.hue, brightness: a.value, sort: a.sort });
    }), r.matches.set(a.hex, u), u && r.matchingHexes.add(a.hex);
  }
  for (const a of e.options) {
    let u = null;
    for (const s of a.colorHexes || []) {
      const b = r.matches.get(j(s));
      b && (!u || b.distance < u.distance || b.distance === u.distance && b.group < u.group) && (u = b);
    }
    r.optionsMatched.set(a, u);
  }
  return r;
}
const We = `
  <svg aria-hidden="true" viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
    <path d="M3 5h18l-7 8v5l-4 2v-7L3 5z" />
  </svg>
`, Ke = `
  <svg aria-hidden="true" viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
    <circle cx="12" cy="12" r="3" />
    <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 1 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 1 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 1 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 1 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
  </svg>
`, Ge = `
  <svg aria-hidden="true" viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
    <path d="M20 6v5h-5" />
    <path d="M19 11a8 8 0 1 0 1 5" />
  </svg>
`, je = `
  <svg aria-hidden="true" viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
    <path d="M2 12s3.5-6 10-6 10 6 10 6-3.5 6-10 6S2 12 2 12z" />
    <circle cx="12" cy="12" r="2.5" />
  </svg>
`, ze = `
  <svg aria-hidden="true" viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
    <g class="fm-header-sort-icon-neutral">
      <path d="M8 18V6m0 0-4 4m4-4 4 4" />
      <path d="M16 6v12m0 0-4-4m4 4 4-4" />
    </g>
    <g class="fm-header-sort-icon-asc">
      <path d="M12 19V5m0 0-5 5m5-5 5 5" />
    </g>
    <g class="fm-header-sort-icon-desc">
      <path d="M12 5v14m0 0-5-5m5 5 5-5" />
    </g>
  </svg>
`, we = [
  { value: "contains", labelKey: "filters.contains" },
  { value: "equals", labelKey: "filters.equals" },
  { value: "startsWith", labelKey: "filters.startsWith" },
  { value: "endsWith", labelKey: "filters.endsWith" },
  { value: "notContains", labelKey: "filters.notContains" },
  { value: "isEmpty", labelKey: "filters.isEmpty" },
  { value: "isNotEmpty", labelKey: "filters.isNotEmpty" }
], Ce = [
  { value: "eq", labelKey: "filters.equals" },
  { value: "neq", labelKey: "filters.notEquals" },
  { value: "gt", labelKey: "filters.greaterThan" },
  { value: "gte", labelKey: "filters.atLeast" },
  { value: "lt", labelKey: "filters.lessThan" },
  { value: "lte", labelKey: "filters.atMost" },
  { value: "between", labelKey: "filters.between" },
  { value: "isEmpty", labelKey: "filters.isEmpty" },
  { value: "isNotEmpty", labelKey: "filters.isNotEmpty" }
], Ee = [
  { value: "on", labelKey: "filters.on" },
  { value: "before", labelKey: "filters.before" },
  { value: "after", labelKey: "filters.after" },
  { value: "between", labelKey: "filters.between" },
  { value: "isEmpty", labelKey: "filters.isEmpty" },
  { value: "isNotEmpty", labelKey: "filters.isNotEmpty" }
], Se = {
  black: { saturationTo: 20, valueFrom: 0, valueTo: 15 },
  white: { saturationTo: 10, valueFrom: 85, valueTo: 100 },
  grey: { saturationTo: 10, valueFrom: 35, valueTo: 65 }
}, ie = [
  { key: "red", hueFrom: 320, hueTo: 15, swatch: "#ef4444" },
  { key: "orange", hueFrom: 15, hueTo: 45, swatch: "#f97316" },
  { key: "yellow", hueFrom: 45, hueTo: 90, swatch: "#eab308" },
  { key: "green", hueFrom: 90, hueTo: 180, swatch: "#22c55e" },
  { key: "blue", hueFrom: 180, hueTo: 250, swatch: "#3b82f6" },
  { key: "indigo", hueFrom: 250, hueTo: 270, swatch: "#4f46e5" },
  { key: "violet", hueFrom: 270, hueTo: 320, swatch: "#8b5cf6" }
];
function K(e = "none") {
  return { type: "color", mode: e, hueFrom: 10, hueTo: 45, saturationFrom: 10, saturationTo: 100, valueFrom: 16, valueTo: 100, valuePreview: 100, includeTransparent: !1 };
}
function ne(e) {
  return e.type !== "color" || e.mode === "none" ? "color" : e.mode !== "color" ? e.mode : ie.find((t) => t.hueFrom === e.hueFrom && t.hueTo === e.hueTo)?.key || "color";
}
function G(e) {
  return e === "black" || e === "white" || e === "grey" ? Se[e] : void 0;
}
function se(e) {
  const t = G(e.mode);
  if (!t) return [e.valueFrom, e.valueTo];
  const r = Number.isFinite(e.neutralValueFrom) ? e.neutralValueFrom : t.valueFrom, o = Number.isFinite(e.neutralValueTo) ? e.neutralValueTo : t.valueTo;
  return [Math.min(r, o), Math.max(r, o)];
}
function te(e) {
  const t = G(e.mode);
  if (!t) return e.saturationTo;
  const r = Number.isFinite(e.neutralSaturationTo) ? e.neutralSaturationTo : t.saturationTo;
  return Math.max(0, Math.min(100, r));
}
let _e = 0;
function X(e) {
  return e === "multi" ? { type: e, values: [] } : e === "text" ? { type: e, operator: "contains", value: "" } : e === "number" ? { type: e, operator: "eq", value: "", valueTo: "" } : e === "color" ? K() : { type: e, operator: "on", value: "", valueTo: "" };
}
function D(e) {
  return e ? e.type === "multi" ? e.values.length > 0 : e.type === "color" ? e.mode !== "none" || e.includeTransparent : e.operator === "isEmpty" || e.operator === "isNotEmpty" ? !0 : e.operator === "between" ? e.value !== "" && e.valueTo !== "" : e.value !== "" : !1;
}
function ft(e, t) {
  if (!e || typeof e != "object" || Array.isArray(e)) return {};
  const r = new Map(t.map(({ key: n, type: l }) => [n, l])), o = {};
  return Object.entries(e).forEach(([n, l]) => {
    const i = r.get(n);
    if (!i || !l || typeof l != "object" || Array.isArray(l)) return;
    const c = l;
    if (c.type !== i || i === "multi" && (!("values" in c) || !Array.isArray(c.values) || !c.values.every((s) => typeof s == "string"))) return;
    if (i === "color") {
      const s = c, b = [
        s.hueFrom,
        s.hueTo,
        s.saturationFrom,
        s.saturationTo,
        s.valueFrom,
        s.valueTo,
        s.valuePreview
      ];
      if (!["none", "color", "black", "white", "grey"].includes(String(s.mode)) || typeof s.includeTransparent != "boolean" || !b.every(Number.isFinite)) return;
    }
    if (i !== "multi" && i !== "color" && (!("operator" in c) || !("value" in c) || typeof c.value != "string")) return;
    const a = c.operator, u = t.find((s) => s.key === n)?.numberOperators;
    i === "number" && u && !u.some((s) => s === a) || i === "text" && !we.some(({ value: s }) => s === a) || i === "number" && !Ce.some(({ value: s }) => s === a) || i === "date" && !Ee.some(({ value: s }) => s === a) || (i === "number" || i === "date") && (!("valueTo" in c) || typeof c.valueTo != "string") || D(c) && (o[n] = R(c));
  }), o;
}
function Ue(e) {
  e.panel.classList.remove("open"), e.trigger.setAttribute("aria-expanded", "false");
}
function $(e) {
  return e.def.type === "multi" && e.def.multiDisplay === "colors";
}
function I(e) {
  return e.working.type === "color" ? e.working : e.candidateColor;
}
function V(e) {
  z(e), $(e) && _(e), e.def.type === "color" && e.working.type === "color" && (e.applied = R(e.working), e.appliedColorPreset = e.colorPreset, e.def.onApply(R(e.applied))), q(e);
}
function J(e) {
  const t = e.trigger.getBoundingClientRect(), r = e.colorDisclosure || e.panel.querySelector(".fm-header-filter-disclosure"), o = r?.querySelector(".fm-header-filter-disclosure-panel") || null, n = window.innerWidth >= 744, l = n && r?.open ? o : null;
  e.panel.classList.toggle("fm-header-filter-panel-compact-colors", $(e) && !l), o && !l && (o.style.removeProperty("top"), o.style.removeProperty("max-height"));
  const i = l?.offsetWidth ? l.offsetWidth + 8 : 0, c = window.innerWidth - e.panel.offsetWidth - i - 8, a = Math.max(8, Math.min(t.left <= c ? t.left : t.right - e.panel.offsetWidth, c)), u = $(e) && r?.open && !l ? Math.max(e.panel.offsetHeight, e.panel.scrollHeight) : e.panel.offsetHeight, s = window.innerHeight - 8, b = Math.min(u, s - 8), m = Math.max(8, Math.min(t.bottom + 6, s - b)), g = s - m;
  if (!n && $(e)) {
    const E = e.panel.querySelector(":scope > .fm-header-filter-actions");
    E && e.panel.style.setProperty("--fm-filter-footer-height", `${E.offsetHeight}px`);
  }
  if (e.panel.style.setProperty("--fm-filter-max-height", `${g}px`), e.panel.style.left = `${a}px`, e.panel.style.top = `${m}px`, l) {
    const E = window.innerHeight - 16, w = Math.min(Math.max(l.offsetHeight, l.scrollHeight), E), N = Math.max(8, Math.min(m, window.innerHeight - w - 8));
    l.style.top = `${N - m}px`, l.style.maxHeight = `${E}px`;
  }
}
function Ye(e) {
  e.working = R(e.applied), e.optionSearch = "", $(e) ? (e.candidateColor = K(), e.colorPreset = "color") : e.colorPreset = e.appliedColorPreset, e.panel.classList.add("open"), W(e), e.linkedStates.forEach((r) => {
    r.working = R(r.applied), r.optionSearch = "", W(r);
  }), e.trigger.setAttribute("aria-expanded", "true"), J(e), (e.optionSearchInput || e.valueInput || e.operatorSelect || e.panel.querySelector('[aria-pressed="true"]') || e.panel.querySelector("input:not(:disabled), button"))?.focus();
}
function Xe(e, t, r = {}) {
  const o = document.createElement("div");
  o.className = "fm-header-filter-actions";
  const n = document.createElement("button");
  n.type = "button", n.className = "fm-btn fm-btn-primary fm-header-filter-action", n.textContent = y("filters.apply");
  const l = document.createElement("button");
  l.type = "button", l.className = "fm-btn fm-btn-outline fm-header-filter-action", l.dataset.filterClear = "", l.textContent = r.clearLabel || y($(e) ? "filters.clearListFilter" : "filters.clear"), $(e) && (l.dataset.clearListFilter = "");
  const i = r.showApply ?? e.def.type !== "color";
  i ? o.append(n, l) : o.append(l);
  const c = (s) => {
    if ($(s) && s.working.type === "multi") {
      const b = new Set(s.working.values), m = !!s.candidateColor && D(s.candidateColor), g = m ? Z(s) : void 0, E = b.size > 0 ? m ? s.options.filter((k) => b.has(k.value) && ue(s, k, g)) : [] : m || s.optionSearch.trim() ? ce(s) : [], w = b.size > 0 && !m ? [...b] : E.map((k) => k.value), N = m ? [] : s.working.colorStopIds || [];
      if (g)
        for (const k of E) {
          const F = k.colorStops?.filter((p) => g.matchingHexes.has(j(p.hex))).map((p) => p.id);
          F?.length && N.push([k.value, F]);
        }
      s.working = { type: "multi", values: w, ...N.length ? { colorStopIds: N } : {} };
    }
    s.applied = R(s.working), s.appliedColorPreset = s.colorPreset, s.def.onApply(R(s.applied)), q(s);
  }, a = () => {
    n.disabled || ([e, ...e.linkedStates].forEach(c), t(), $(e) && e.trigger.focus(), q(e));
  }, u = () => {
    if ($(e) && e.working.type === "multi") {
      const s = document.activeElement === l;
      e.working = { type: "multi", values: [] }, e.optionSearch = "", W(e), q(e), s && (e.optionSearchInput || n).focus();
      return;
    }
    e.applied = X(e.def.type), e.working = X(e.def.type), e.colorPreset = "color", e.appliedColorPreset = "color", e.optionSearch = "", e.def.onApply(R(e.applied)), W(e), q(e);
  };
  return n.addEventListener("click", a), l.addEventListener("click", u), e.panel.addEventListener("keydown", (s) => {
    s.key === "Enter" && i && $(e) && s.target === e.optionSearchInput ? (s.preventDefault(), a()) : s.key === "Escape" && (s.preventDefault(), s.stopPropagation(), t(), e.trigger.focus());
  }), { actions: o, clearFilter: u };
}
function ht(e, t) {
  if (!D(t) || !t) return !0;
  if (t.type === "color") return Qe(e, t);
  const r = e == null || e === "" || Array.isArray(e) && e.length === 0;
  if (t.type !== "multi" && t.operator === "isEmpty") return r;
  if (t.type !== "multi" && t.operator === "isNotEmpty") return !r;
  if (t.type === "multi") {
    const i = (r ? [""] : Array.isArray(e) ? e : [e]).map(Be);
    return t.values.some((c) => i.includes(c));
  }
  if (r) return !1;
  if (t.type === "text") {
    const l = String(e ?? "").toLowerCase(), i = t.value.toLowerCase();
    return t.operator === "equals" ? l === i : t.operator === "startsWith" ? l.startsWith(i) : t.operator === "endsWith" ? l.endsWith(i) : t.operator === "notContains" ? !l.includes(i) : l.includes(i);
  }
  if (t.type === "number") {
    const l = Number(e), i = Number(t.value);
    if (!Number.isFinite(l) || !Number.isFinite(i)) return !1;
    if (t.operator === "neq") return l !== i;
    if (t.operator === "gt") return l > i;
    if (t.operator === "gte") return l >= i;
    if (t.operator === "lt") return l < i;
    if (t.operator === "lte") return l <= i;
    if (t.operator === "between") {
      const c = Number(t.valueTo);
      return Number.isFinite(c) && l >= Math.min(i, c) && l <= Math.max(i, c);
    }
    return l === i;
  }
  const o = le(e), n = le(t.value);
  if (!o || !n) return !1;
  if (t.operator === "before") return o < n;
  if (t.operator === "after") return o > n;
  if (t.operator === "between") {
    const l = le(t.valueTo);
    return !!l && o >= (n < l ? n : l) && o <= (n > l ? n : l);
  }
  return o === n;
}
function re(e) {
  const t = e.harmony;
  return [...Pe[e.mode === "color" && (t === "complementary" || t === "triadic") ? t : "single"]];
}
function Q(e) {
  return Math.abs(e.hueTo - e.hueFrom) >= 360 ? 360 : (e.hueTo - e.hueFrom + 360) % 360;
}
function Je(e, t, r) {
  const o = ((t.hueFrom + r) % 360 + 360) % 360;
  return (e - o + 360) % 360 <= Q(t);
}
function Qe(e, t) {
  return (Array.isArray(e) ? e : [e]).some((o) => {
    const n = typeof o == "string" ? ge(o) : null;
    return !!n && re(t).some((l) => ve(n, t, l));
  });
}
function Ze(e) {
  const t = e.mode === "none" || e.mode === "color" || e.mode === "black" || e.mode === "white" || e.mode === "grey" ? e.mode : "none", r = Math.min(e.valueFrom, e.valueTo), o = Math.max(e.valueFrom, e.valueTo), n = Number.isFinite(e.valuePreview) ? e.valuePreview : o, l = Math.max(r, Math.min(o, n)), i = G(t), c = i ? te({ ...e, mode: t }) : void 0, a = i ? Number.isFinite(e.neutralValueFrom) ? e.neutralValueFrom : i.valueFrom : void 0, u = i ? Number.isFinite(e.neutralValueTo) ? e.neutralValueTo : i.valueTo : void 0;
  return {
    type: "color",
    mode: t,
    harmony: e.harmony === "complementary" || e.harmony === "triadic" ? e.harmony : "single",
    hueFrom: e.hueFrom,
    hueTo: e.hueTo,
    saturationFrom: e.saturationFrom,
    saturationTo: e.saturationTo,
    valueFrom: e.valueFrom,
    valueTo: e.valueTo,
    valuePreview: l,
    ...c !== void 0 && a !== void 0 && u !== void 0 ? {
      neutralSaturationTo: c,
      neutralValueFrom: Math.min(a, u),
      neutralValueTo: Math.max(a, u)
    } : {},
    includeTransparent: e.includeTransparent
  };
}
function le(e) {
  if (!e) return "";
  const t = String(e);
  if (/^\d{4}-\d{2}-\d{2}$/.test(t)) return t;
  const r = new Date(t);
  return Number.isNaN(r.getTime()) ? "" : [
    r.getFullYear(),
    String(r.getMonth() + 1).padStart(2, "0"),
    String(r.getDate()).padStart(2, "0")
  ].join("-");
}
function R(e) {
  if (e.type === "multi") {
    const t = new Set(e.values), r = Array.isArray(e.colorStopIds) ? e.colorStopIds.filter((o) => Array.isArray(o) && t.has(o[0]) && Array.isArray(o[1]) && o[1].length && o[1].every((n) => Number.isSafeInteger(n) && n > 0)).map(([o, n]) => [o, [...n]]) : [];
    return { type: "multi", values: [...e.values], ...r.length ? { colorStopIds: r } : {} };
  }
  return e.type === "color" ? Ze(e) : e.type === "text" ? { ...e } : { ...e };
}
function et(e, t) {
  return JSON.stringify(e) === JSON.stringify(t);
}
function B(e) {
  return e.replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;").replaceAll('"', "&quot;").replaceAll("'", "&#039;");
}
function gt(e, t, r) {
  const o = e.querySelector("thead tr");
  if (!o) throw new Error("initHeaderColumnFilters: missing table header row");
  const n = /* @__PURE__ */ new Map(), l = /* @__PURE__ */ new Set();
  tt(o);
  function i(a) {
    const u = [...n.values()].find((s) => s.panel === a);
    u && Ue(u), l.delete(a);
  }
  function c(a) {
    const u = document.activeElement;
    l.forEach((s) => {
      const b = [...n.values()].find((m) => m.panel === s);
      if (b) {
        if (a.type === "filaman:columns-changed" && !b.trigger.getClientRects().length) {
          i(s), s.contains(u) && document.getElementById("btn-columns")?.focus();
          return;
        }
        J(b), a.type === "resize" && $(b) && u instanceof HTMLElement && s.contains(u) && (u.closest(".fm-header-filter-color-option") || u).scrollIntoView({ block: "nearest", inline: "nearest" });
      }
    });
  }
  return t.forEach((a) => {
    const u = a.disclosureOf && n.get(a.disclosureOf) || null;
    if (a.disclosureOf && !u)
      throw new Error(`initHeaderColumnFilters: disclosure parent ${a.disclosureOf} must be defined first`);
    const s = o.querySelector(a.columnSelector);
    if (!s) return;
    u || rt(s, a.label);
    const b = ke(s), m = u ? document.createElement("summary") : document.createElement("button");
    m instanceof HTMLButtonElement && (m.type = "button"), m.className = u ? "fm-header-filter-disclosure-summary" : "fm-header-filter-trigger", m.setAttribute("aria-label", y("filters.filterColumn", { label: a.label })), m.setAttribute("aria-expanded", "false"), u || m.setAttribute("aria-haspopup", "dialog"), m.title = y("filters.filterColumn", { label: a.label }), a.icon === "gear" && (m.dataset.tooltip = m.title), m.innerHTML = `${a.icon === "gear" ? Ke : We}${u ? `<span class="fm-sr-only">${a.label}</span>` : ""}`;
    const g = document.createElement("div");
    g.className = "fm-header-filter-panel", g.id = `fm-header-filter-panel-${_e++}`, g.setAttribute("role", u ? "group" : "dialog"), g.setAttribute("aria-label", y("filters.filterColumn", { label: a.label })), m.setAttribute("aria-controls", g.id);
    const E = a.initialValue?.type === a.type ? R(a.initialValue) : X(a.type), w = {
      def: a,
      options: [...a.options || []],
      applied: R(E),
      working: R(E),
      optionSearch: "",
      optionView: a.multiDisplay === "colors" ? "swatches" : "details",
      colorPreset: ne(E),
      appliedColorPreset: ne(E),
      trigger: m,
      panel: g,
      parentState: u,
      linkedStates: [],
      list: null,
      optionSearchInput: null,
      operatorSelect: null,
      valueInput: null,
      valueToInput: null,
      suggestionList: null,
      candidateColor: a.multiDisplay === "colors" ? K() : null,
      colorDisclosure: null
    };
    a.type === "multi" ? (ot(w), a.multiDisplay === "colors" && lt(w)) : a.type === "color" ? Fe(w) : at(w);
    const N = () => i(u?.panel || g), { actions: k } = Xe(w, N, u ? { showApply: !1, clearLabel: y("filters.clearFilter", { label: a.label }) } : void 0);
    a.multiDisplay === "colors" && nt(k, w), g.appendChild(k);
    const F = a.groupControlId ? document.getElementById(a.groupControlId) : null, p = F?.parentElement;
    if (F && p) {
      m.dataset.groupControl = "", F.hidden = !1;
      const d = () => {
        const v = document.activeElement, C = getComputedStyle(s).display === "none", T = C ? p : g;
        F.parentElement !== T && (T.insertBefore(F, C ? null : k), C && v === m ? F.querySelector("input")?.focus({ preventScroll: !0 }) : v instanceof HTMLElement && F.contains(v) && (C ? v : m).focus({ preventScroll: !0 }));
      };
      e.addEventListener("filaman:columns-changed", d), d();
    }
    if (u) {
      u.linkedStates.push(w), u.panel.classList.add("fm-header-filter-panel-disclosure"), g.classList.add("fm-header-filter-disclosure-panel", "fm-header-linked-filter-panel");
      const d = document.createElement("details");
      d.className = "fm-header-filter-disclosure", d.open = !a.disclosureStorageKey || localStorage.getItem(a.disclosureStorageKey) !== "false", m.setAttribute("aria-expanded", String(d.open)), d.append(m, g), d.addEventListener("toggle", () => {
        m.setAttribute("aria-expanded", String(d.open)), a.disclosureStorageKey && localStorage.setItem(a.disclosureStorageKey, String(d.open)), u.panel.classList.contains("open") && J(u);
      }), u.panel.appendChild(d);
      const v = u.panel.querySelector(".fm-header-filter-actions [data-filter-clear]");
      v && (v.textContent = y("filters.clearFilter", { label: u.def.label })), n.set(a.key, w), W(w), q(w);
      return;
    }
    b.appendChild(m), document.body.appendChild(g), n.set(a.key, w), m.addEventListener("click", (d) => {
      if (d.stopPropagation(), g.classList.contains("open")) {
        i(g);
        return;
      }
      l.forEach(i), Ye(w), l.add(g);
    }), g.addEventListener("click", (d) => d.stopPropagation()), g.addEventListener("dragstart", (d) => d.preventDefault()), W(w), q(w);
  }), document.addEventListener("click", () => l.forEach(i), { signal: r }), window.addEventListener("resize", c, { signal: r }), window.addEventListener("scroll", c, { capture: !0, signal: r }), e.addEventListener("filaman:columns-changed", c, { signal: r }), r?.addEventListener("abort", () => {
    n.forEach(({ panel: a }) => a.remove());
  }, { once: !0 }), {
    setOptions: (a, u) => {
      const s = n.get(a);
      !s || s.def.type !== "multi" && !s.def.autocomplete || (s.options = [...u], W(s), q(s));
    },
    setValue: (a, u) => {
      const s = n.get(a);
      !s || u.type !== s.def.type || (s.applied = R(u), s.working = R(u), s.colorPreset = ne(u), s.appliedColorPreset = s.colorPreset, W(s), q(s));
    },
    getValue: (a) => {
      const u = n.get(a);
      return u ? R(u.applied) : null;
    },
    getActiveCount: () => [...n.values()].filter((a) => D(a.applied)).length,
    resetAll: () => {
      n.forEach((a) => {
        a.applied = X(a.def.type), a.working = X(a.def.type), a.colorPreset = "color", a.appliedColorPreset = "color", a.optionSearch = "", $(a) && (a.candidateColor = K()), W(a), q(a);
      }), l.forEach(i);
    }
  };
}
function ke(e) {
  const t = e.querySelector(":scope > .fm-header-filter-wrap");
  if (t) return t;
  const r = document.createElement("div");
  return r.className = "fm-header-filter-wrap", e.appendChild(r), r;
}
function tt(e) {
  e.querySelectorAll("th[data-sort]").forEach((t) => {
    const r = ke(t);
    if (r.querySelector(".fm-header-sort-trigger")) return;
    const o = t.textContent?.trim() || t.dataset.sort || "", n = document.createElement("button");
    n.type = "button", n.className = "fm-header-sort-trigger", n.dataset.sortLabel = o, n.setAttribute("aria-label", y("filters.sortColumn", { label: o })), n.title = y("filters.sortColumn", { label: o }), n.innerHTML = ze, r.appendChild(n);
  });
}
function yt(e, t, r) {
  e.querySelectorAll("th[data-sort]").forEach((o) => {
    const n = o.querySelector(".fm-header-sort-trigger");
    if (!n) return;
    const l = n.dataset.sortLabel || o.dataset.sort || "", i = o.dataset.sort === t && r !== null, c = y(i ? r === "asc" ? "filters.ascending" : "filters.descending" : "filters.notSorted");
    n.setAttribute("aria-label", y("filters.sortColumnState", { label: l, state: c })), n.title = y("filters.sortColumnState", { label: l, state: c }), n.setAttribute("aria-pressed", String(i)), i ? o.setAttribute("aria-sort", r === "asc" ? "ascending" : "descending") : o.removeAttribute("aria-sort");
  });
}
function rt(e, t) {
  const r = e.getAttribute("data-i18n");
  if (!r) return;
  const o = document.createElement("span");
  o.className = "fm-header-filter-heading", o.setAttribute("data-i18n", r), o.textContent = t, Array.from(e.childNodes).filter((l) => l.nodeType === Node.TEXT_NODE).forEach((l) => l.remove()), e.removeAttribute("data-i18n"), e.insertBefore(o, e.firstChild);
  const n = e.dataset.i18nCompact;
  if (n) {
    o.classList.add("fm-header-filter-heading-full");
    const l = document.createElement("span");
    l.className = "fm-header-filter-heading fm-header-filter-heading-short", l.dataset.i18n = n, l.textContent = y(n), o.after(l);
  }
}
function ot(e) {
  const t = e.def.searchable !== !1, r = document.createElement("input");
  r.className = "fm-input fm-header-filter-search", r.type = "text", r.placeholder = y("filters.searchOptions", { label: e.def.label }), r.setAttribute("aria-label", y("filters.searchOptions", { label: e.def.label }));
  const o = document.createElement("div");
  o.className = "fm-header-filter-selection-actions";
  const n = document.createElement("button");
  n.type = "button", n.className = "fm-btn fm-btn-outline fm-header-filter-action", n.textContent = y("filters.selectAll");
  const l = document.createElement("button");
  l.type = "button", l.className = "fm-btn fm-btn-outline fm-header-filter-action", l.textContent = y("filters.selectNone"), o.appendChild(n), o.appendChild(l);
  const i = document.createElement("div");
  if (i.className = "fm-header-filter-list", t && r.addEventListener("input", () => {
    e.optionSearch = r.value, _(e), $(e) && z(e);
  }), n.addEventListener("click", () => me(e, !0)), l.addEventListener("click", () => me(e, !1)), e.optionSearchInput = t ? r : null, e.list = i, i.addEventListener("change", (c) => {
    if (e.working.type !== "multi" || !(c.target instanceof HTMLInputElement) || !c.target.hasAttribute("data-value")) return;
    const a = new Set(e.working.values), u = c.target.dataset.value || "", s = !c.target.checked && e.working.colorStopIds?.some(([b]) => b === u);
    c.target.checked ? a.add(u) : (a.delete(u), e.working.colorStopIds = e.working.colorStopIds?.filter(([b]) => b !== u)), e.working.values = [...a], $(e) && (s ? _(e) : xe(e), z(e)), q(e);
  }), $(e) && ct(e), t && e.panel.appendChild(r), $(e)) {
    const c = document.createElement("p");
    c.className = "fm-header-color-list-status", c.setAttribute("role", "status"), e.panel.appendChild(c);
  } else e.panel.appendChild(o);
  e.panel.appendChild(i);
}
function nt(e, t) {
  const r = document.createElement("label");
  r.className = "fm-header-filter-grid-toggle";
  const o = document.createElement("input");
  o.type = "checkbox", o.checked = t.optionView === "details", o.setAttribute("role", "switch"), o.setAttribute("aria-label", y("filters.colorList"));
  const n = document.createElement("span");
  n.className = "fm-header-filter-grid-toggle-track", n.setAttribute("aria-hidden", "true");
  const l = document.createElement("span");
  l.textContent = y("filters.colorList"), o.addEventListener("change", () => {
    t.optionView = o.checked ? "details" : "swatches", _(t);
  }), r.appendChild(o), r.appendChild(n), r.appendChild(l), e.appendChild(r);
}
function lt(e) {
  e.panel.classList.add("fm-header-filter-panel-color", "fm-header-filter-panel-disclosure");
  const t = document.createElement("details");
  t.className = "fm-header-filter-disclosure fm-header-color-disclosure", t.open = localStorage.getItem("filaman-color-range-open") !== "false";
  const r = document.createElement("summary");
  r.setAttribute("aria-label", y("filters.colorFilter")), r.title = y("filters.colorFilter"), r.innerHTML = `<span class="fm-header-color-wheel-icon" aria-hidden="true"></span><span class="fm-sr-only">${y("filters.colorFilter")}</span>`, t.appendChild(r), t.addEventListener("toggle", () => {
    localStorage.setItem("filaman-color-range-open", String(t.open)), e.panel.classList.contains("open") && (z(e), J(e));
  }), e.colorDisclosure = t;
  const o = document.createElement("div");
  o.className = "fm-header-filter-disclosure-panel fm-header-color-disclosure-panel", Fe(e, o);
  const n = document.createElement("button");
  n.type = "button", n.className = "fm-btn fm-btn-outline fm-header-filter-action", n.dataset.clearColorRange = "", n.textContent = y("filters.clearColorRange"), n.addEventListener("click", () => {
    const l = document.activeElement === n;
    e.candidateColor = K(), e.colorPreset = "color", V(e), l && (e.optionSearchInput || e.panel.querySelector(".fm-header-filter-actions .fm-btn-primary"))?.focus();
  }), o.appendChild(n), t.appendChild(o), e.panel.appendChild(t);
}
function Fe(e, t = e.panel) {
  const r = $(e) || e.def.type === "color", o = document.createElement("div");
  o.className = "fm-header-color-controls";
  const n = document.createElement("h3");
  n.className = "fm-header-color-title", n.textContent = y("filters.colorFilter"), o.appendChild(n);
  const l = document.createElement("button");
  l.type = "button", l.className = "fm-header-color-default", l.dataset.colorMode = "color", l.setAttribute("aria-pressed", "false"), l.innerHTML = `<span class="fm-header-color-wheel-icon" aria-hidden="true"></span>${y("filaments.color")}`, l.addEventListener("click", () => {
    $(e) ? e.candidateColor = K("color") : e.working = K("color"), e.colorPreset = "color", V(e);
  });
  const i = document.createElement("div");
  i.className = "fm-header-color-neutrals", ["black", "grey", "white"].forEach((p) => {
    const d = document.createElement("button");
    d.type = "button", d.dataset.colorNeutral = p, d.setAttribute("aria-pressed", "false"), d.addEventListener("click", () => {
      const C = I(e);
      if (!C) return;
      const T = Se[p];
      C.mode = p, e.colorPreset = p, C.neutralSaturationTo = T.saturationTo, C.neutralValueFrom = T.valueFrom, C.neutralValueTo = T.valueTo, V(e);
    });
    const v = document.createElement("span");
    v.className = `fm-header-color-neutral-swatch ${p}`, v.setAttribute("aria-hidden", "true"), d.appendChild(v), d.append(y(`filters.soft${p.charAt(0).toUpperCase()}${p.slice(1)}`)), i.appendChild(d);
  }), o.appendChild(i);
  const c = document.createElement("div");
  if (c.className = "fm-header-color-modes", c.appendChild(l), ie.forEach((p) => {
    const d = document.createElement("button");
    d.type = "button", d.dataset.colorPreset = p.key, d.setAttribute("aria-pressed", "false"), d.addEventListener("click", () => {
      const C = I(e);
      C && (Object.assign(C, {
        mode: "color",
        hueFrom: p.hueFrom,
        hueTo: p.hueTo,
        saturationFrom: 10,
        saturationTo: 100,
        valueFrom: 16,
        valueTo: 100,
        valuePreview: 100
      }), e.colorPreset = p.key, V(e));
    });
    const v = document.createElement("span");
    v.className = "fm-header-color-neutral-swatch", v.style.background = p.swatch, v.setAttribute("aria-hidden", "true"), d.appendChild(v), d.append(y(`filters.preset${p.key.charAt(0).toUpperCase()}${p.key.slice(1)}`)), c.appendChild(d);
  }), o.appendChild(c), r) {
    const p = document.createElement("fieldset");
    p.className = "fm-header-color-harmonies";
    const d = document.createElement("legend");
    d.className = "fm-sr-only", d.textContent = y("filters.colorHarmony"), p.appendChild(d);
    for (const v of ["single", "complementary", "triadic"]) {
      const C = document.createElement("label"), T = document.createElement("input");
      if (T.type = "radio", T.name = `${e.panel.id}-harmony`, T.dataset.colorHarmony = v, T.addEventListener("change", () => {
        const H = I(e);
        !H || !T.checked || (H.harmony = v, V(e));
      }), C.appendChild(T), v !== "single") {
        const H = document.createElement("span");
        H.className = "fm-color-harmony-name", H.dataset.colorHarmonyTone = v, H.textContent = y(`filters.${v}`), C.appendChild(H);
      } else C.append(y("filters.single"));
      p.appendChild(C);
    }
    o.appendChild(p);
  }
  const { wheel: a, wheelWrap: u } = Re(e.panel.id, r ? 3 : 1);
  if (a.tabIndex = 0, a.setAttribute("role", "slider"), a.setAttribute("aria-label", y("filters.moveHueArc")), a.setAttribute("aria-valuemin", "0"), a.setAttribute("aria-valuemax", "359"), o.appendChild(u), r) {
    for (const d of [0, 180, 120, 240]) {
      const v = document.createElement("span");
      if (v.className = "fm-header-color-guide", v.dataset.colorGuide = String(d), d !== 0) {
        const C = d === 180 ? "complementary" : "triadic";
        v.dataset.colorHarmonyTone = C, v.title = y(`filters.${C}`), v.setAttribute("aria-label", v.title);
      }
      u.appendChild(v);
    }
    const p = document.createElement("p");
    p.className = "fm-header-color-guide-key", p.id = `${e.panel.id}-guides`, p.innerHTML = `<span><i data-color-harmony-tone="complementary" aria-hidden="true"></i>${B(y("filters.complementary"))}</span><span><i data-color-harmony-tone="triadic" aria-hidden="true"></i><i data-color-harmony-tone="triadic" aria-hidden="true"></i>${B(y("filters.triadicMarks"))}</span>`, o.appendChild(p);
  }
  const s = (p) => {
    const d = I(e);
    !d || Math.abs(d.hueTo - d.hueFrom) >= 360 || (d.hueFrom = ((d.hueFrom + p) % 360 + 360) % 360, d.hueTo = ((d.hueTo + p) % 360 + 360) % 360, e.colorPreset = "color", d.mode = "color", V(e));
  }, b = (p) => {
    const d = I(e);
    if (!d) return;
    const v = Math.abs(d.hueTo - d.hueFrom) >= 360 ? 360 : (d.hueTo - d.hueFrom + 360) % 360;
    v >= 360 ? (d.hueFrom = 0, d.hueTo = 360) : (d.hueFrom = Math.round((p - v / 2 + 360) % 360) % 360, d.hueTo = Math.round((d.hueFrom + v) % 360)), e.colorPreset = "color", d.mode = "color", V(e);
  }, m = (p) => {
    const d = I(e);
    if (!d || d.mode !== "none" && d.mode !== "color") return;
    d.mode === "none" && Object.assign(d, K("color"));
    const v = a.getBoundingClientRect(), C = Math.atan2(p.clientY - (v.top + v.height / 2), p.clientX - (v.left + v.width / 2)) * 180 / Math.PI;
    b((360 - C + 360) % 360);
  };
  let g = !1;
  const E = pe(m);
  a.addEventListener("pointerdown", (p) => {
    if (e.colorDisclosure?.classList.contains("is-locked")) return;
    const d = I(e)?.mode;
    d !== "none" && d !== "color" || (g = !0, a.setPointerCapture?.(p.pointerId), E.start(p));
  }), a.addEventListener("pointermove", (p) => {
    g && E.move(p);
  });
  const w = (p) => {
    g && (g = !1, E.flush(p.type === "pointerup" ? p : void 0));
  };
  a.addEventListener("pointerup", w), a.addEventListener("pointercancel", w), a.addEventListener("keydown", (p) => {
    if (I(e)?.mode !== "color") return;
    const d = p.key === "ArrowLeft" || p.key === "ArrowDown" ? -1 : p.key === "ArrowRight" || p.key === "ArrowUp" ? 1 : 0;
    d && (p.preventDefault(), s(d * (p.shiftKey ? 10 : 1)));
  }), [
    { label: y("filters.hueArc"), from: "hueFrom", to: "hueTo", max: 360, suffix: "°" },
    { label: y("filters.saturationRange"), from: "saturationFrom", to: "saturationTo", max: 100, suffix: "%" },
    { label: y("filters.valueRange"), from: "valueFrom", to: "valueTo", max: 100, suffix: "%" }
  ].forEach((p) => {
    const d = document.createElement("div");
    d.className = "fm-header-color-range";
    const v = document.createElement("div");
    v.className = "fm-header-color-range-heading";
    const C = document.createElement("span");
    C.dataset.colorRangeLabel = p.from, C.textContent = p.label, v.appendChild(C);
    const T = document.createElement("span");
    T.className = "fm-header-color-range-value";
    const H = document.createElement("output");
    H.dataset.colorOutput = p.from, T.appendChild(H);
    const P = document.createElement("button");
    P.type = "button", P.className = "fm-header-color-range-reset", P.dataset.colorRangeReset = p.from, P.title = y("filters.resetRange", { label: p.label }), P.setAttribute("aria-label", P.title), P.innerHTML = Ge, P.addEventListener("click", () => {
      const f = I(e);
      if (!f) return;
      const S = G(f.mode), x = ie.find((M) => M.key === e.colorPreset), L = K("color");
      if (p.from === "hueFrom") {
        if (S) return;
        f.hueFrom = x?.hueFrom ?? L.hueFrom, f.hueTo = x?.hueTo ?? L.hueTo;
      } else p.from === "saturationFrom" ? S ? f.neutralSaturationTo = S.saturationTo : (f.saturationFrom = L.saturationFrom, f.saturationTo = L.saturationTo) : S ? (f.neutralValueFrom = S.valueFrom, f.neutralValueTo = S.valueTo) : (f.valueFrom = L.valueFrom, f.valueTo = L.valueTo, f.valuePreview = L.valuePreview);
      V(e);
    }), T.appendChild(P), v.appendChild(T), d.appendChild(v);
    const h = document.createElement("div");
    if (h.className = "fm-header-color-dual-range", [p.from, p.to].forEach((f, S) => {
      const x = y(S === 0 ? "filters.rangeStart" : "filters.rangeEnd"), L = document.createElement("input");
      L.type = "range", L.min = "0", L.max = String(p.max), L.step = "1", L.dataset.colorField = f, L.setAttribute("aria-label", `${p.label} ${x}`), L.addEventListener("input", () => {
        const M = I(e);
        if (!M) return;
        const A = Number(L.value), O = G(M.mode);
        if (O && p.from === "saturationFrom" && S === 1) {
          M.neutralSaturationTo = A, V(e);
          return;
        }
        if (O && p.from === "valueFrom") {
          const [U, de] = se(M);
          M.neutralValueFrom = S === 0 ? Math.min(A, de) : U, M.neutralValueTo = S === 0 ? de : Math.max(A, U), V(e);
          return;
        }
        const ee = p.from === "hueFrom" && M.hueFrom > M.hueTo;
        M[f] = ee ? S === 0 ? Math.max(A, M[p.to]) : Math.min(A, M[p.from]) : S === 0 ? Math.min(A, M[p.to]) : Math.max(A, M[p.from]), p.from === "valueFrom" && (M.valuePreview = Math.max(M.valueFrom, Math.min(M.valueTo, M.valuePreview))), e.colorPreset = "color", M.mode = "color", V(e);
      }), h.appendChild(L);
    }), p.from === "hueFrom") {
      const f = document.createElement("span");
      f.className = "fm-header-color-range-grab", f.dataset.colorGrab = "hue", f.tabIndex = 0, f.setAttribute("role", "slider"), f.setAttribute("aria-label", y("filters.moveHueArc")), f.setAttribute("aria-valuemin", "0"), f.setAttribute("aria-valuemax", "359"), f.innerHTML = '<span class="fm-header-color-range-grab-dot"></span><span class="fm-header-color-range-grab-dot"></span><span class="fm-header-color-range-grab-dot"></span>';
      let S = !1, x = 0;
      f.addEventListener("pointerdown", (A) => {
        I(e)?.mode === "color" && (S = !0, x = A.clientX, f.setPointerCapture?.(A.pointerId), L.start(A));
      });
      const L = pe((A) => {
        const ee = h.getBoundingClientRect().width - 17;
        if (ee <= 0) return;
        const U = Math.round((A.clientX - x) / ee * 360);
        U && (x = A.clientX, s(U));
      });
      f.addEventListener("pointermove", (A) => {
        S && L.move(A);
      });
      const M = (A) => {
        S && (S = !1, L.flush(A.type === "pointerup" ? A : void 0));
      };
      f.addEventListener("pointerup", M), f.addEventListener("pointercancel", M), f.addEventListener("keydown", (A) => {
        const O = A.key === "ArrowLeft" || A.key === "ArrowDown" ? -1 : A.key === "ArrowRight" || A.key === "ArrowUp" ? 1 : 0;
        !O || I(e)?.mode !== "color" || (A.preventDefault(), s(O * (A.shiftKey ? 10 : 1)));
      }), h.appendChild(f);
    }
    if (p.from === "valueFrom") {
      const f = document.createElement("input");
      f.type = "range", f.min = "0", f.max = "100", f.step = "1", f.className = "fm-header-color-preview-range", f.dataset.colorField = "valuePreview", f.setAttribute("aria-label", y("filters.wheelPreview")), f.addEventListener("input", () => {
        const x = I(e);
        if (!(!x || x.mode !== "color")) {
          x.valuePreview = Math.max(x.valueFrom, Math.min(x.valueTo, Number(f.value))), e.colorPreset = "color", x.mode = "color", f.value = String(x.valuePreview), a.style.setProperty("--color-wheel-darkness", String(1 - x.valuePreview / 100)), S.style.left = Te(x.valuePreview);
          for (const L of c.querySelectorAll("button")) {
            const M = L.dataset.colorMode === "color";
            L.setAttribute("aria-pressed", String(M)), L.classList.toggle("active", M);
          }
          e.working.type === "color" && (e.applied = R(e.working), e.appliedColorPreset = "color"), q(e);
        }
      }), h.appendChild(f);
      const S = document.createElement("span");
      S.className = "fm-header-color-preview-grab", S.setAttribute("aria-hidden", "true"), S.innerHTML = je, h.appendChild(S);
    }
    d.appendChild(h), d.dataset.suffix = p.suffix, o.appendChild(d);
  });
  const k = document.createElement("label");
  k.className = "fm-header-color-transparent";
  const F = document.createElement("input");
  F.type = "checkbox", F.dataset.colorTransparent = "", F.addEventListener("change", () => {
    const p = I(e);
    p && (p.includeTransparent = F.checked, V(e));
  }), k.appendChild(F), k.append(y("filters.includeTransparent")), o.appendChild(k), t.appendChild(o);
}
function Te(e) {
  const t = e / 100;
  return `calc(${(t * 100).toFixed(4)}% + ${(13 * (1 - 2 * t)).toFixed(4)}px)`;
}
function pe(e) {
  let t = null, r = null, o = 0;
  const n = (l) => {
    if (o && cancelAnimationFrame(o), o = 0, l && (t = l), !t) return;
    const i = t;
    t = null, !(i.clientX === r?.clientX && i.clientY === r?.clientY) && (r = i, e(i));
  };
  return {
    start: (l) => {
      r = null, n(l);
    },
    move: (l) => {
      t = l, o || (o = requestAnimationFrame(() => n()));
    },
    flush: n
  };
}
function at(e) {
  const t = document.createElement("div");
  t.className = "fm-header-filter-typed-controls";
  const r = document.createElement("select");
  r.className = "fm-select fm-header-filter-operator", r.setAttribute("aria-label", y("filters.filterOperator", { label: e.def.label }));
  const o = e.def.type === "text" ? we : e.def.type === "number" ? Ce.filter((i) => !e.def.numberOperators || e.def.numberOperators.includes(i.value)) : Ee;
  r.innerHTML = o.map((i) => `<option value="${i.value}">${y(i.labelKey)}</option>`).join("");
  const n = document.createElement("input");
  if (n.className = "fm-input fm-header-filter-value", n.type = e.def.type === "number" ? "number" : e.def.type === "date" ? "date" : "text", e.def.type === "number" && (n.step = e.def.autocomplete ? "1" : "any"), n.placeholder = y("filters.filterValue", { label: e.def.label }), n.setAttribute("aria-label", y("filters.filterInput", { label: e.def.label })), (e.def.type === "text" || e.def.type === "number") && e.def.autocomplete) {
    const i = document.createElement("datalist");
    i.id = `${e.panel.id}-suggestions`, n.setAttribute("list", i.id), e.suggestionList = i, t.appendChild(i);
  }
  const l = document.createElement("input");
  l.className = "fm-input fm-header-filter-value", l.type = e.def.type === "number" ? "number" : "date", e.def.type === "number" && (l.step = e.def.autocomplete ? "1" : "any"), e.suggestionList && l.setAttribute("list", e.suggestionList.id), l.setAttribute("aria-label", y("filters.upperFilterInput", { label: e.def.label })), r.addEventListener("change", () => {
    it(e, r.value), Ae(e), q(e);
  }), n.addEventListener("input", () => {
    e.working.type !== "multi" && e.working.type !== "color" && (e.working.value = n.value), q(e);
  }), l.addEventListener("input", () => {
    (e.working.type === "number" || e.working.type === "date") && (e.working.valueTo = l.value), q(e);
  }), e.operatorSelect = r, e.valueInput = n, e.valueToInput = l, t.appendChild(r), t.appendChild(n), t.appendChild(l), e.panel.appendChild(t);
}
function it(e, t) {
  (e.working.type === "text" || e.working.type === "number" || e.working.type === "date") && (e.working.operator = t);
}
function W(e) {
  if (e.def.type === "multi") {
    e.optionSearchInput && (e.optionSearchInput.value = e.optionSearch), _(e), $(e) && z(e);
    return;
  }
  if (e.def.type === "color") {
    z(e);
    return;
  }
  e.working.type === "multi" || e.working.type === "color" || (e.suggestionList && e.suggestionList.replaceChildren(...e.options.map((t) => {
    const r = document.createElement("option");
    return r.value = t.value, t.label !== t.value && (r.label = t.label), r;
  })), e.operatorSelect && (e.operatorSelect.value = e.working.operator), e.valueInput && (e.valueInput.value = e.working.value), e.valueToInput && (e.working.type === "number" || e.working.type === "date") && (e.valueToInput.value = e.working.valueTo), Ae(e));
}
function z(e) {
  const t = I(e);
  if (!t) return;
  const r = D(t), o = e.optionSearch.trim() !== "" || e.working.type === "multi" && e.working.values.length > 0, n = $(e) && !r && o;
  e.panel.querySelector(".fm-header-color-controls")?.classList.toggle("is-inactive", !r), e.colorDisclosure?.classList.toggle("is-locked", n);
  const i = e.panel.querySelector(".fm-header-color-list-status"), c = n ? y("filters.colorListLock") : "";
  i && i.textContent !== c && (i.textContent = c);
  const a = e.panel.querySelector("[data-clear-color-range]");
  a && (a.disabled = !r);
  const u = e.panel.querySelector("[data-clear-list-filter]");
  u && (u.disabled = !o), e.panel.querySelectorAll("[data-color-mode], [data-color-preset], [data-color-neutral]").forEach((h) => {
    h.disabled = n;
  });
  const s = G(t.mode);
  e.panel.querySelectorAll("[data-color-harmony]").forEach((h) => {
    h.checked = h.dataset.colorHarmony === (s ? "single" : t.harmony || "single"), h.disabled = !!s || n || t.mode === "none";
  });
  const b = te(t), [m, g] = se(t), E = (h) => s ? h === "saturationFrom" ? 0 : h === "saturationTo" ? b : h === "valueFrom" ? m : h === "valueTo" || h === "valuePreview" ? g : t[h] : t[h];
  e.panel.querySelectorAll("[data-color-field]").forEach((h) => {
    const f = h.dataset.colorField;
    h.value = String(E(f));
  }), e.panel.querySelectorAll("[data-color-output]").forEach((h) => {
    const f = h.dataset.colorOutput, S = f.replace("From", "To"), x = h.closest(".fm-header-color-range")?.dataset.suffix || "", L = Number(E(f)), M = Number(E(S));
    h.textContent = `${L}${x}–${M}${x}`;
    const A = h.closest(".fm-header-color-range")?.querySelector(".fm-header-color-dual-range"), O = Number(A?.querySelector("input")?.max) || 100;
    A?.style.setProperty("--color-range-low", `${Math.min(L, M) / O * 100}%`), A?.style.setProperty("--color-range-high", `${Math.max(L, M) / O * 100}%`), A && (A.dataset.wrap = String(f === "hueFrom" && t.hueFrom > t.hueTo));
  }), e.panel.querySelectorAll("[data-color-neutral]").forEach((h) => {
    const f = t.mode === h.dataset.colorNeutral && e.colorPreset === h.dataset.colorNeutral;
    h.setAttribute("aria-pressed", String(f)), h.classList.toggle("active", f);
  });
  const w = t.mode === "color", N = !w || n, k = e.panel.querySelector('[data-color-mode="color"]');
  if (k) {
    const h = w && e.colorPreset === "color";
    k.setAttribute("aria-pressed", String(h)), k.classList.toggle("active", h);
  }
  e.panel.querySelectorAll("[data-color-preset]").forEach((h) => {
    const f = w && e.colorPreset === h.dataset.colorPreset;
    h.setAttribute("aria-pressed", String(f)), h.classList.toggle("active", f);
  });
  const F = y(s ? "filters.colorTolerance" : "filters.saturationRange"), p = e.panel.querySelector('[data-color-range-label="saturationFrom"]');
  p && (p.textContent = F), e.panel.querySelectorAll('[data-color-field="saturationFrom"], [data-color-field="saturationTo"]').forEach((h) => {
    const f = h.dataset.colorField === "saturationFrom" ? y("filters.rangeStart") : y("filters.rangeEnd");
    h.setAttribute("aria-label", `${F} ${f}`);
  }), e.panel.querySelectorAll(".fm-header-color-range").forEach((h) => {
    const f = !!h.querySelector('[data-color-output="valueFrom"]'), S = !!h.querySelector('[data-color-output="saturationFrom"]');
    h.classList.toggle("is-muted", t.mode === "none" || !!s && !f && !S);
  }), e.panel.querySelectorAll("[data-color-field]").forEach((h) => {
    const f = h.dataset.colorField;
    h.disabled = n || t.mode === "none" || !!s && f !== "saturationTo" && f !== "valueFrom" && f !== "valueTo", h.hidden = !!s && f === "valuePreview";
  }), e.panel.querySelectorAll("[data-color-range-reset]").forEach((h) => {
    h.disabled = n, h.hidden = t.mode === "none" || !!s && h.dataset.colorRangeReset === "hueFrom";
  });
  const d = e.panel.querySelector('[data-color-grab="hue"]');
  d && (d.tabIndex = N ? -1 : 0, d.setAttribute("aria-disabled", String(N)));
  const v = e.panel.querySelector("[data-color-transparent]");
  v && (v.checked = t.includeTransparent, v.disabled = n, v.closest(".fm-header-color-transparent")?.classList.toggle(
    "is-muted",
    t.mode === "none" && !t.includeTransparent
  ));
  const C = e.panel.querySelector(".fm-header-color-wheel"), T = Q(t), H = (t.hueFrom + T / 2) % 360;
  if (C) {
    C.style.setProperty("--color-hue-from", s ? "0deg" : `${90 - t.hueTo}deg`), C.style.setProperty("--color-hue-span", s ? "360deg" : `${T}deg`), C.style.setProperty("--color-saturation-inner", `${s ? m : Math.min(t.saturationFrom, t.saturationTo)}%`), C.style.setProperty("--color-saturation-outer", `${s ? g : Math.max(t.saturationFrom, t.saturationTo)}%`), C.style.setProperty("--color-wheel-darkness", s ? "0" : String(1 - t.valuePreview / 100)), C.style.setProperty("--color-neutral-saturation", String(b / 100)), C.style.setProperty("--color-selection-outline", t.mode === "black" ? "rgb(255 255 255 / 70%)" : "rgb(0 0 0 / 65%)"), C.classList.toggle("is-neutral", !!s), s ? C.dataset.neutralMode = t.mode : delete C.dataset.neutralMode, C.classList.toggle("is-muted", N), C.tabIndex = N ? -1 : 0, C.setAttribute("aria-disabled", String(N)), C.setAttribute("aria-valuenow", String(Math.round(s ? g : H))), C.setAttribute("aria-valuetext", s ? `${m}%–${g}%` : `${t.hueFrom}°–${t.hueTo}°`);
    const h = re(t);
    C.querySelectorAll("[data-color-window]").forEach((S, x) => {
      S.hidden = t.mode === "none" || x >= h.length, x > 0 && x < h.length && T < 360 ? S.dataset.colorHarmonyTone = t.harmony : delete S.dataset.colorHarmonyTone, S.style.setProperty("--color-hue-from", s ? "0deg" : `${90 - t.hueTo - (h[x] || 0)}deg`);
    }), C.style.setProperty("--color-hue-mask", Ve(t.hueTo, w ? T : 360, h));
    const f = e.panel.querySelector(".fm-header-color-guide-key");
    if (f) {
      const S = w && T < 360, x = h.length === 1;
      e.panel.querySelectorAll("[data-color-guide]").forEach((A) => {
        const O = Number(A.dataset.colorGuide);
        A.hidden = !S || (x ? O === 0 : !h.includes(O)), A.hidden || A.style.setProperty("--color-guide-angle", `${-(t.hueFrom + T / 2 + O)}deg`);
      });
      const L = !S || !x, M = f.hidden !== L;
      f.hidden = L, f.hidden ? C.removeAttribute("aria-describedby") : C.setAttribute("aria-describedby", f.id), M && e.panel.classList.contains("open") && J(e);
    }
  }
  if (d) {
    const h = H / 360;
    d.style.left = `calc(${(h * 100).toFixed(4)}% + ${(8.5 * (1 - 2 * h)).toFixed(4)}px)`, d.hidden = N || t.hueFrom > t.hueTo, d.setAttribute("aria-valuenow", String(Math.round(H))), d.setAttribute("aria-valuetext", `${t.hueFrom}°–${t.hueTo}°`);
  }
  const P = e.panel.querySelector(".fm-header-color-preview-grab");
  P && (P.style.left = Te(Number(E("valuePreview"))), P.hidden = t.mode === "none" || !!s), st(e, t);
}
function st(e, t) {
  if (!e.panel.classList.contains("open") && !e.panel.closest(".swatch-color-panel") || e.colorDisclosure && !e.colorDisclosure.open) return;
  const r = e.panel.querySelector(".fm-header-color-markers");
  if (!r) return;
  const o = Z(e);
  Oe(r, o.samples, (n) => o.matches.get(n)?.group, {
    active: D(t),
    neutral: !!G(t.mode),
    neutralSaturation: te(t),
    tone: t.harmony
  });
}
function Ae(e) {
  if (e.working.type === "multi" || e.working.type === "color") return;
  const t = e.working.operator === "isEmpty" || e.working.operator === "isNotEmpty", r = e.working.operator === "between";
  e.valueInput && (e.valueInput.style.display = t ? "none" : ""), e.valueToInput && (e.valueToInput.style.display = !t && r ? "" : "none");
}
function ce(e) {
  const t = e.optionSearch.toLowerCase().trim(), r = e.candidateColor && D(e.candidateColor) ? Z(e) : void 0, o = e.options.filter(
    (n) => (!t || n.label.toLowerCase().includes(t)) && ue(e, n, r)
  );
  if (!r && $(e) && e.working.type === "multi" && e.working.values.length) {
    const n = new Set(e.options.map((l) => l.value));
    for (const l of e.working.values) {
      const i = l || y("common.empty");
      !n.has(l) && (!t || i.toLowerCase().includes(t)) && o.push({ value: l, label: i });
    }
  }
  return o;
}
function ue(e, t, r) {
  return !e.candidateColor || !D(e.candidateColor) || !!(r || Z(e)).optionsMatched.get(t);
}
function me(e, t) {
  if (e.working.type !== "multi") return;
  const r = new Set(e.working.values);
  ce(e).forEach((o) => t ? r.add(o.value) : r.delete(o.value)), e.working.values = [...r], _(e), q(e);
}
function _(e) {
  if (!e.list || e.working.type !== "multi") return;
  const t = $(e);
  if (t && !e.panel.classList.contains("open")) return;
  const r = document.activeElement instanceof HTMLInputElement && e.list.contains(document.activeElement) ? document.activeElement : null, o = t ? Z(e) : null, n = I(e), l = !!n && n.mode === "color" && Q(n) < 360, i = ce(e);
  if (o && i.sort((m, g) => {
    const E = o.optionsMatched.get(m), w = o.optionsMatched.get(g);
    if (n && G(n.mode)) return (E?.brightness || 0) - (w?.brightness || 0) || m.label.localeCompare(g.label) || m.value.localeCompare(g.value);
    if (l) return (E?.distance || 0) - (w?.distance || 0) || (E?.hue || 0) - (w?.hue || 0) || m.label.localeCompare(g.label) || m.value.localeCompare(g.value);
    const N = E?.sort || [2, 0, 0, 0], k = w?.sort || [2, 0, 0, 0];
    for (let F = 0; F < N.length; F++)
      if (N[F] !== k[F]) return N[F] - k[F];
    return m.label.localeCompare(g.label) || m.value.localeCompare(g.value);
  }), e.list.classList.toggle("fm-color-groups", t), e.list.classList.toggle("fm-color-grid", t && e.optionView === "swatches"), i.length === 0 && !t) {
    e.list.innerHTML = `<div class="fm-header-filter-empty-text">${B(y("filters.noMatchingOptions"))}</div>`;
    return;
  }
  const c = new Set(e.working.values), a = new Map(e.working.colorStopIds), u = (m) => {
    const g = a.get(m.value);
    if (g) return (m.colorStops || []).filter((w) => g.includes(w.id)).map((w) => w.hex);
    const E = m.colorHexes || [];
    return e.candidateColor && D(e.candidateColor) ? E.filter((w) => o?.matchingHexes.has(j(w))) : E;
  }, s = (m) => !a.has(m.value) && o?.optionsMatched.get(m)?.hex || u(m).map(j).find(Boolean) || "", b = (m) => {
    const g = c.has(m.value) ? "checked" : "";
    if (t && e.optionView === "swatches") {
      const E = s(m), w = E && m.label.toUpperCase() !== E ? ` aria-description="${E}"` : "";
      return `<label class="fm-header-filter-color-option"><input type="checkbox" aria-label="${B(m.label)}"${w} data-value="${B(m.value)}" ${g} />${ut(E)}<span class="fm-color-tile-name">${B(m.label)}</span></label>`;
    }
    return `<label class="fm-header-filter-option"><input type="checkbox" data-value="${B(m.value)}" ${g} />${dt(u(m))}<span>${B(m.label)}</span></label>`;
  };
  if (t) {
    const m = n ? re(n) : [0], g = m.length === 2 ? ["selectedRange", "complementary"] : ["selectedRange", "triadicRange1", "triadicRange2"], E = new Map([...e.list.querySelectorAll(".fm-header-filter-color-option")].map((k) => [k.querySelector("input").dataset.value, k])), w = document.createElement("template"), N = m.map((k, F) => {
      const p = i.filter((S) => (o?.optionsMatched.get(S)?.group || 0) === F), d = F === 0 && l ? `<span class="fm-color-order-caption">${B(y("filters.closestHueFirst"))}</span>` : "", v = B(y(`filters.${g[F]}`)), C = F > 0 ? `<span class="fm-color-harmony-name" data-color-harmony-tone="${m.length === 2 ? "complementary" : "triadic"}">${v}</span>` : v;
      let T = e.list.querySelector(`[data-color-group="${F}"]`);
      T || (T = document.createElement("section"), T.dataset.colorGroup = String(F), T.innerHTML = '<div class="fm-color-group-heading"></div><div></div>');
      const H = T.firstElementChild, P = `<h4>${C}</h4>${d}`;
      H.innerHTML !== P && (H.innerHTML = P);
      const h = T.lastElementChild;
      h.className = e.optionView === "swatches" ? "fm-color-grid" : "";
      const f = p.map((S) => {
        const x = e.optionView === "swatches" ? E.get(S.value) : void 0;
        return x && x.querySelector(".fm-color-tile-name")?.textContent === S.label && x.querySelector("[data-color-hex]")?.dataset.colorHex === s(S) ? (x.querySelector("input").checked = c.has(S.value), x) : (w.innerHTML = b(S), w.content.firstElementChild);
      });
      if (!f.length) {
        const S = h.querySelector(".fm-header-filter-empty-text") || document.createElement("div");
        S.className = "fm-header-filter-empty-text", S.textContent = y("filters.noMatchingOptions"), f.push(S);
      }
      return fe(h, f), T;
    });
    fe(e.list, N), xe(e), e.panel.querySelector(".fm-color-tooltip").hidden = !0, r && document.activeElement !== r && ((r.isConnected ? r : [...e.list.querySelectorAll("input[data-value]")].find((F) => F.dataset.value === r.dataset.value)) || e.optionSearchInput || e.trigger).focus({ preventScroll: !0 });
  } else e.list.innerHTML = i.map(b).join("");
}
function xe(e) {
  const t = e.panel.querySelector(".fm-header-filter-actions .fm-btn-primary");
  if (!t || e.working.type !== "multi") return;
  const r = e.working.values, o = !!e.list?.querySelector("input[data-value]"), n = !!e.candidateColor && D(e.candidateColor);
  t.disabled = n && r.length > 0 ? !e.options.some((l) => r.includes(l.value) && ue(e, l)) : !r.length && (n || !!e.optionSearch.trim()) && !o;
}
function fe(e, t) {
  let r = e.firstChild;
  for (const o of t)
    o === r ? r = r.nextSibling : e.insertBefore(o, r);
  for (; r; ) {
    const o = r;
    r = r.nextSibling, e.removeChild(o);
  }
}
function ct(e) {
  let t = e.panel.querySelector(".fm-color-tooltip");
  t || (t = document.createElement("div"), t.className = "fm-color-tooltip", t.id = `${e.panel.id}-color-tooltip`, t.setAttribute("role", "tooltip"), t.hidden = !0, e.panel.appendChild(t)), t.hidden = !0;
  const r = (l) => l.target instanceof Element ? l.target.closest(".fm-header-filter-color-option") : null, o = (l) => {
    const i = r(l);
    if (!i || l instanceof MouseEvent && l.relatedTarget instanceof Node && i.contains(l.relatedTarget)) return;
    const c = i.getBoundingClientRect(), a = i.querySelector(".fm-color-tile-name"), u = i.querySelector("[data-color-hex]")?.dataset.colorHex || "", s = e.panel.classList.contains("fm-header-filter-panel-compact-colors") || a.scrollHeight > a.clientHeight || a.scrollWidth > a.clientWidth;
    if (t.textContent = s && a.textContent?.toUpperCase() !== u ? [a.textContent, u].filter(Boolean).join(" · ") : u, t.hidden = !t.textContent, t.hidden) return;
    t.style.left = "8px";
    const b = t.offsetWidth / 2;
    t.style.left = `${Math.max(8 + b, Math.min(window.innerWidth - 8 - b, c.left + c.width / 2))}px`, t.style.top = `${Math.max(8 + t.offsetHeight, c.top - 8)}px`;
  }, n = (l) => {
    const i = r(l);
    i && l instanceof MouseEvent && l.relatedTarget instanceof Node && i.contains(l.relatedTarget) || (t.hidden = !0);
  };
  e.list.addEventListener("pointerover", o), e.list.addEventListener("focusin", o), e.list.addEventListener("pointerdown", o), e.list.addEventListener("pointerout", n), e.list.addEventListener("focusout", n);
}
function ut(e) {
  const t = e ? ` style="background:${B($e(e))}"` : "";
  return `<span class="fm-color-swatch" data-color-hex="${e || ""}"${t}>${e ? "" : '<span class="fm-header-filter-empty-swatch">&mdash;</span>'}</span>`;
}
function dt(e) {
  const t = e.map(Le).filter((r) => !!r);
  return t.length === 0 ? "" : `<span class="fm-header-filter-color-dots" aria-hidden="true">${t.map((r) => `<span class="fm-header-filter-color-dot" style="background:${r}"></span>`).join("")}</span>`;
}
function Le(e) {
  return Me(e, "") || null;
}
function pt(e) {
  const t = e ? Le(e) : null;
  if (!t) return [2, 0, 0, 0];
  const r = Number.parseInt(t.slice(1, 3), 16) / 255, o = Number.parseInt(t.slice(3, 5), 16) / 255, n = Number.parseInt(t.slice(5, 7), 16) / 255, l = Math.max(r, o, n), i = Math.min(r, o, n), c = l - i, a = (l + i) / 2, u = c === 0 ? 0 : c / (1 - Math.abs(2 * a - 1));
  let s = 0;
  return c !== 0 && (l === r ? s = (o - n) / c % 6 : l === o ? s = (n - r) / c + 2 : s = (r - o) / c + 4, s = (s * 60 + 360) % 360), u < 0.12 ? [0, 0, Math.round(a * 1e3), 0] : [1, Math.round(s * 10), Math.round(a * 1e3), Math.round(u * 1e3)];
}
function he(e) {
  const t = e.def.type === "multi" && !$(e) && e.applied.type === "multi" && e.options.length > 0 ? e.applied.values.length > 0 && e.applied.values.length < e.options.length : D(e.applied), r = e.def.type === "color" || $(e) ? t : !et(e.applied, e.working);
  return { active: t, pending: r };
}
function q(e) {
  const t = he(e), r = e.linkedStates.map(he), o = t.active || r.some((l) => l.active), n = t.pending || r.some((l) => l.pending);
  e.trigger.classList.toggle("active", o), e.trigger.classList.toggle("pending", n), e.trigger.setAttribute(
    "aria-label",
    y(o ? "filters.filterColumnActive" : "filters.filterColumn", { label: e.def.label })
  ), e.parentState && q(e.parentState);
}
export {
  X as emptyColumnFilter,
  gt as initHeaderColumnFilters,
  D as isColumnFilterActive,
  ht as matchesColumnFilter,
  ft as sanitizeColumnFilters,
  mt as setLang,
  yt as syncHeaderSortButtons
};
