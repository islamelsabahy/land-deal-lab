(function () {
"use strict";
var L = window.LandLab, D = L.DEFAULTS;
var lang = "ar";
try { var sv = localStorage.getItem("ldl_lang"); if (sv === "en" || sv === "ar") lang = sv; } catch (e) {}

var T = {
 kick: ["مختبر صفقات الأراضي", "LAND DEAL LAB"],
 ttl: ["أقصى سعر تدفعه في الأرض — وبأي هيكل دفع", "What can you pay for the land, and under which structure?"],
 sub: ["بيحسب أقصى سعر للأرض مع توقيت الإيراد والتكلفة (مش بس المعادلة الجامدة)، ويقارن قطع أراضي، ويوريك أثر التقسيط على سعر الأرض، ويقارن كاش مقابل حصة إيراد مقابل مقايضة وحدات مع صاحب الأرض.", "Computes the most you can pay for land with timing of revenue and cost (not just the textbook residual), ranks parcels, shows what instalments do to the headline price, and compares cash vs revenue share vs unit barter with the landowner."],
 warn: ["أداة تعليمية بأرقام وهمية، مش استشارة مالية أو قانونية أو تقييم عقاري. النموذج مبسط (بدون ضرائب أو تمويل بنكي أو تغيير تخطيط). راجع شروط التخصيص والعقد الفعلية.", "Educational tool with fictional numbers; not financial, legal or valuation advice. Simplified model (no taxes, bank debt or planning changes). Check the real allocation terms and contract."],
 assume: ["الافتراضات", "Assumptions"], hassume: ["كل الأرقام بالجنيه. النسب بتتكتب كنسبة مئوية.", "All money in EGP. Rates are percentages."],
 reset: ["رجّع الافتراضي", "Reset"], pdf: ["تقرير PDF", "PDF report"],
 g_project: ["المشروع", "Project"], g_price: ["الأسعار والتكلفة", "Prices & costs"], g_time: ["التوقيت (شهور)", "Timing (months)"],
 g_plan: ["خطة سداد العميل", "Customer payment plan"], g_fin: ["التمويل والمستهدف", "Finance & target"], g_land: ["شروط دفع الأرض (شروطك)", "Land payment (your terms)"],
 land_area: ["مساحة الأرض (م²)", "Land area (m²)"], far: ["معامل البناء (م² بناء لكل م² أرض)", "FAR (built m² per land m²)"], efficiency: ["كفاءة المساحة البيعية %", "Sellable efficiency %"],
 price_sqm: ["سعر البيع / م² بيعي", "Sale price / sellable m²"], cost_sqm: ["تكلفة البناء / م² بناء", "Build cost / built m²"], soft_pct: ["تكاليف تصميم وإشراف %", "Soft costs %"],
 contingency_pct: ["احتياطي %", "Contingency %"], sales_pct: ["مبيعات وتسويق %", "Sales & marketing %"], overhead_m: ["مصاريف ثابتة شهريا", "Monthly overhead"],
 start_delay: ["شهور حتى بدء الإنشاء", "Months to construction start"], build: ["مدة الإنشاء", "Build months"], launch: ["شهور حتى بدء البيع", "Months to sales launch"], sales_months: ["مدة بيع كل الوحدات", "Months to sell out"],
 plan_down: ["مقدم العميل %", "Customer down payment %"], plan_months: ["شهور تقسيط العميل", "Customer instalment months"],
 discount: ["معدل الخصم السنوي %", "Discount rate (annual) %"], price_growth: ["نمو الأسعار السنوي %", "Price growth (annual) %"], cost_infl: ["تضخم التكلفة السنوي %", "Cost inflation (annual) %"], target_margin: ["هامش الربح المستهدف %", "Target margin %"],
 land_mode: ["طريقة دفع الأرض", "Land payment"], cash: ["كاش", "Cash"], installments: ["أقساط", "Instalments"],
 land_down: ["مقدم الأرض %", "Land down payment %"], land_years: ["سنوات الأقساط", "Instalment years"], land_per_year: ["دفعات في السنة", "Payments per year"], land_grace_years: ["سنوات سماح", "Grace years"],
 s_parcels: ["مقارنة قطع الأراضي", "Compare parcels"], h_parcels: ["اكتب مساحة وسعر كل قطعة. الخانات الفاضية بتاخد قيم الافتراضات.", "Enter each parcel's area and ask. Blank cells use the assumptions."],
 name: ["القطعة", "Parcel"], ask: ["سعر الأرض المطلوب", "Asking price"], area: ["المساحة م²", "Area m²"], sqm: ["سعر البيع/م²", "Sale price/m²"], farc: ["معامل البناء", "FAR"],
 rank: ["الترتيب", "Rank"], maxbid: ["أقصى سعر", "Max bid"], maxm2: ["أقصى سعر/م²", "Max bid/m²"], askm2: ["المطلوب/م²", "Ask/m²"], marg: ["هامش عند المطلوب", "Margin at ask"], irr: ["العائد السنوي (IRR)", "Project IRR"], verdict: ["القرار", "Verdict"],
 within: ["داخل الميزانية", "Within budget"], over: ["أعلى من الحد بـ ", "Over by "], noask: ["بدون سعر مطلوب", "No ask given"], infeasible: ["مش مجدي حتى بسعر أرض صفر", "Not viable even at zero land price"],
 s_break: ["تفكيك أقصى سعر", "Where the bid comes from"], h_break: ["كل الأرقام بالقيمة الحالية (مخصومة شهريا). اختار القطعة:", "All figures are present values (discounted monthly). Pick the parcel:"],
 b_rev: ["إيراد (قيمة حالية)", "Revenue (PV)"], b_con: ["البناء والتصميم والاحتياطي", "Construction, soft & contingency"], b_sales: ["مبيعات وتسويق", "Sales & marketing"], b_over: ["مصاريف ثابتة", "Overhead"],
 b_profit: ["الربح المستهدف", "Target profit"], b_land: ["المتاح للأرض (قيمة حالية)", "Available for land (PV)"],
 static: ["الحساب التقليدي بدون توقيت: ", "Textbook residual without timing: "], timing: ["الحساب مع التوقيت (كاش): ", "Timing-aware (cash): "],
 s_struct: ["أثر هيكل دفع الأرض", "Land payment structure"], h_struct: ["نفس الاقتصاد بالظبط، لكن السعر المعلن اللي تقدر تقبله بيزيد كل ما الدفع يتأجل. ركّز على القيمة الحالية مش الرقم المعلن.", "Same economics, but the headline price you can accept rises as payment is deferred. Judge by present value, not the headline."],
 sname: ["الهيكل", "Structure"], factor: ["قيمة الجنيه الحالية", "PV per 1 EGP"], hl: ["أقصى سعر معلن", "Max headline price"],
 st_cash: ["كاش", "Cash"], st_1: ["20% مقدم + 3 سنين سنوي", "20% down + 3y annual"], st_2: ["10% مقدم + 5 سنين نصف سنوي", "10% down + 5y semi-annual"], st_3: ["10% مقدم + 5 سنين نصف سنوي + سنة سماح", "10% + 5y semi-annual + 1y grace"], st_you: ["شروطك (من الجانب)", "Your terms (sidebar)"],
 s_jv: ["صفقة مع صاحب الأرض: كاش ولا حصة ولا مقايضة؟", "Landowner deal: cash, revenue share or barter?"],
 h_jv: ["المالك عنده سعر كاش يرضى بيه. الأداة بتقولك أنهي حصة (من الإيراد أو من المساحة) تساويه، وأقصى حصة تقدر تدفعها وتفضل محقق هدفك.", "The owner has a cash price he would accept. The tool finds the share (of revenue or area) that equals it for him, and the most you can give while still hitting your target."],
 j_owner: ["سعر المالك الكاش", "Owner's cash price"], j_share: ["حصة إيراد معروضة %", "Offered revenue share %"], j_barter: ["حصة مساحة معروضة %", "Offered area share %"], j_hair: ["خصم قيمة وحدات المالك %", "Haircut on owner's units %"],
 j_col: ["الخيار", "Option"], j_opv: ["قيمة المالك (حالية)", "Owner PV"], j_dp: ["ربح المطور (حالي)", "Developer profit (PV)"], j_dm: ["هامش المطور", "Developer margin"], j_ok: ["يحقق الهدف؟", "Meets target?"],
 j_cash: ["كاش", "Cash"], j_rs: ["حصة إيراد", "Revenue share"], j_ba: ["مقايضة مساحة", "Area barter"],
 zone_s: ["حصة الإيراد", "Revenue share"], zone_b: ["حصة المساحة", "Area share"], z_ok: ["مساحة اتفاق من ", "Zone of agreement: "], z_to: [" إلى ", " to "], z_mid: [" — المنتصف ", " — midpoint "],
 z_no: ["مفيش مساحة اتفاق: المالك محتاج أكتر من اللي تقدر تدفعه وتحقق هدفك.", "No zone of agreement: the owner needs more than you can give and still hit your target."],
 yes: ["نعم", "Yes"], no: ["لا", "No"],
 s_sens: ["الحساسية", "Sensitivity"], h_sens: ["أثر تغيير كل عامل ±20% على أقصى سعر للمتر. الأحمر = السعر بينزل.", "Effect of moving each driver ±20% on the max bid per m². Red = bid falls."],
 hm_t: ["خريطة: أقصى سعر/م² حسب سعر البيع وتكلفة البناء", "Map: max bid/m² by sale price and build cost"], hm_h: ["الأخضر = تقدر تدفع السعر المطلوب. الأحمر = لا.", "Green = you can afford the asking price. Red = you cannot."],
 rows: ["سعر البيع ↓ / تكلفة البناء →", "Sale price ↓ / build cost →"],
 foot: ["مفتوح المصدر (MIT). محرك بايثون هو المرجع وهذه الصفحة نسخة JS مطابقة بالاختبارات. أرقام وهمية فقط.", "Open source (MIT). The Python engine is the reference; this page is a JS port verified by tests. Fictional numbers only."],
 bad: ["مدخلات غير صالحة: ", "Invalid input: "], prepared: ["افتراضات التقرير", "Report assumptions"]
};
var DRV = { price_sqm: ["سعر البيع", "Sale price"], cost_sqm: ["تكلفة البناء", "Build cost"], efficiency: ["كفاءة المساحة", "Efficiency"], far: ["معامل البناء", "FAR"], discount: ["معدل الخصم", "Discount rate"],
  sales_months: ["مدة البيع", "Sell-out months"], plan_months: ["تقسيط العميل", "Customer plan months"], target_margin: ["الهامش المستهدف", "Target margin"], build: ["مدة الإنشاء", "Build months"] };
function t(k) { return T[k][lang === "ar" ? 0 : 1]; }

var FIELDS = [
 ["g_project", [["land_area", "n"], ["far", "n"], ["efficiency", "p"]]],
 ["g_price", [["price_sqm", "n"], ["cost_sqm", "n"], ["soft_pct", "p"], ["contingency_pct", "p"], ["sales_pct", "p"], ["overhead_m", "n"]]],
 ["g_time", [["start_delay", "n"], ["build", "n"], ["launch", "n"], ["sales_months", "n"]]],
 ["g_plan", [["plan_down", "p"], ["plan_months", "n"]]],
 ["g_fin", [["discount", "p"], ["price_growth", "p"], ["cost_infl", "p"], ["target_margin", "p"]]],
 ["g_land", [["land_mode", "m"], ["land_down", "p"], ["land_years", "n"], ["land_per_year", "y"], ["land_grace_years", "n"]]]
];
var g = {};
function resetG() { g = {}; for (var k in D) g[k] = D[k]; g.asking_price = 0; }
resetG();
var parcels = [
 { name: "A", land_area: "20000", asking_price: "300000000", price_sqm: "", far: "" },
 { name: "B", land_area: "12000", asking_price: "220000000", price_sqm: "72000", far: "" },
 { name: "C", land_area: "30000", asking_price: "380000000", price_sqm: "62000", far: "1" }
];
var sel = 0, jvIn = { owner: "", share: "30", barter: "30", hair: "0" };

var $ = function (id) { return document.getElementById(id); };
function el(tag, attrs, kids) {
  var e = document.createElement(tag);
  Object.keys(attrs || {}).forEach(function (k) { var v = attrs[k];
    if (k === "class") e.className = v; else if (k === "text") e.textContent = v; else if (k.slice(0, 2) === "on") e[k] = v;
    else if (v !== false && v != null) e.setAttribute(k, v === true ? "" : v); });
  (kids || []).forEach(function (c) { if (c != null) e.appendChild(typeof c === "string" ? document.createTextNode(c) : c); });
  return e;
}
function bdi(s) { return el("bdi", { dir: "ltr", text: s }); }
function num(v) { var n = Number(String(v).replace(/,/g, "").trim()); return n; }
function ci(x) { return Math.round(x).toLocaleString("en-US"); }
function cM(x) { return (x / 1e6).toLocaleString("en-US", { maximumFractionDigits: 1 }) + "M"; }
function cp(x, d) { return (x * 100).toFixed(d === undefined ? 1 : d) + "%"; }
function css(parts) { return parts; }

/* ---------- sidebar ---------- */
function buildFields() {
  var root = $("fields"); root.textContent = "";
  FIELDS.forEach(function (grp) {
    root.appendChild(el("div", { class: "grp", text: t(grp[0]) }));
    grp[1].forEach(function (f) {
      var k = f[0], kind = f[1], inp;
      if (kind === "m") {
        inp = el("select", { onchange: function () { g.land_mode = inp.value; update(); } }, [el("option", { value: "cash", text: t("cash") }), el("option", { value: "installments", text: t("installments") })]);
        inp.value = g.land_mode;
      } else if (kind === "y") {
        inp = el("select", { onchange: function () { g.land_per_year = Number(inp.value); update(); } }, [1, 2, 4, 12].map(function (n) { return el("option", { value: n, text: String(n) }); }));
        inp.value = String(g.land_per_year);
      } else {
        inp = el("input", { inputmode: "decimal", value: kind === "p" ? String(+(g[k] * 100).toFixed(4)) : String(g[k]), oninput: function () {
          var v = num(inp.value); if (v === v) g[k] = kind === "p" ? v / 100 : v; update(); } });
      }
      root.appendChild(el("label", { class: "f" }, [el("span", { text: t(k) }), inp]));
    });
  });
}

/* ---------- main structure (built once per language) ---------- */
var C = {};
function section(id, title, hint, extra) {
  var c = el("section", { class: "card", id: id }, [el("h2", { text: title }), hint ? el("p", { class: "hint", text: hint }) : null]);
  (extra || []).forEach(function (x) { c.appendChild(x); });
  return c;
}
function buildMain() {
  var out = $("out"); out.textContent = "";
  C.assume = el("div", { class: "po card" });
  out.appendChild(C.assume);

  C.parcelIn = el("div", { class: "tw" }); C.parcelOut = el("div", { class: "tw" });
  var tbl = el("table", {}, [el("tr", {}, [t("name"), t("area"), t("ask"), t("sqm"), t("farc")].map(function (h) { return el("th", { text: h }); }))]);
  parcels.forEach(function (pc, i) {
    function cell(key, w) { var inp = el("input", { value: pc[key], inputmode: key === "name" ? "text" : "decimal", style: "text-align:" + (key === "name" ? "start" : "end") + ";" + (w ? "min-width:" + w : ""), oninput: function () { pc[key] = inp.value; update(); } }); if (key === "price_sqm") inp.placeholder = ci(g.price_sqm); if (key === "far") inp.placeholder = String(g.far); if (key === "land_area") inp.placeholder = ci(g.land_area); return el("td", {}, [inp]); }
    tbl.appendChild(el("tr", { class: "noprint-ok" }, [cell("name", "70px"), cell("land_area", "90px"), cell("asking_price", "120px"), cell("price_sqm", "90px"), cell("far", "60px")]));
  });
  C.parcelIn.appendChild(tbl);
  out.appendChild(section("sp", t("s_parcels"), t("h_parcels"), [C.parcelIn, el("div", { style: "height:10px" }), C.parcelOut]));

  C.sel = el("select", { onchange: function () { sel = Number(C.sel.value); update(); } }, parcels.map(function (_, i) { return el("option", { value: i, text: parcels[i].name || "#" + (i + 1) }); }));
  C.sel.value = String(sel);
  C.breakOut = el("div");
  out.appendChild(section("sb", t("s_break"), t("h_break"), [el("div", { class: "noprint", style: "max-width:200px;margin-bottom:8px" }, [C.sel]), C.breakOut]));

  C.structOut = el("div", { class: "tw" });
  out.appendChild(section("ss", t("s_struct"), t("h_struct"), [C.structOut]));

  function jin(key, label) { var inp = el("input", { value: jvIn[key], inputmode: "decimal", oninput: function () { jvIn[key] = inp.value; update(); } }); if (key === "owner") inp.placeholder = "= ask"; return el("label", {}, [label, inp]); }
  C.jvOut = el("div");
  out.appendChild(section("sj", t("s_jv"), t("h_jv"), [el("div", { class: "inl noprint" }, [jin("owner", t("j_owner")), jin("share", t("j_share")), jin("barter", t("j_barter")), jin("hair", t("j_hair"))]), C.jvOut]));

  C.sensOut = el("div"); C.heatOut = el("div", { class: "tw" });
  out.appendChild(section("sx", t("s_sens"), t("h_sens"), [C.sensOut, el("h2", { text: t("hm_t"), style: "margin-top:14px" }), el("p", { class: "hint", text: t("hm_h") }), C.heatOut]));
}

/* ---------- compute + render ---------- */
function parcelParams(i) {
  var pc = parcels[i], d = {}, k;
  for (k in g) d[k] = g[k];
  ["land_area", "price_sqm", "far"].forEach(function (key) { var v = num(pc[key]); if (pc[key] !== "" && v === v) d[key] = v; });
  var a = num(pc.asking_price); d.asking_price = pc.asking_price !== "" && a === a ? a : 0;
  return d;
}
function err(node, e) { node.textContent = ""; node.appendChild(el("div", { class: "err", text: t("bad") + e.message })); }
var pending = null;
function update() { clearTimeout(pending); pending = setTimeout(render, 120); }

function render() {
  var res;
  try {
    res = parcels.map(function (_, i) { return L.analyze(parcelParams(i)); });
    renderAssumptions(); renderParcels(res); renderBreakdown(res[sel] ? sel : 0); renderStructures(); renderJv(); renderSens();
  } catch (e) { err(C.parcelOut, e); }
}

function renderAssumptions() {
  C.assume.textContent = "";
  C.assume.appendChild(el("h2", { text: t("prepared") }));
  var kv = el("div", { class: "kv" });
  FIELDS.forEach(function (grp) { grp[1].forEach(function (f) {
    var k = f[0], v = g[k], s = f[1] === "p" ? cp(v, 1) : k === "land_mode" ? t(v) : ci(v);
    kv.appendChild(el("div", {}, [el("b", {}, [bdi(String(s))]), el("span", { text: t(k) })]));
  }); });
  C.assume.appendChild(kv);
}

function verdictChip(r) {
  if (!r.feasible) return el("span", { class: "chip bad", text: t("infeasible") });
  if (r.margin_at_ask === null) return el("span", { class: "chip mid", text: t("noask") });
  if (r.headroom >= 0) return el("span", { class: "chip good", text: t("within") });
  return el("span", { class: "chip bad" }, [t("over"), bdi(cM(-r.headroom))]);
}
function renderParcels(res) {
  var rows = parcels.map(function (pc, i) { var d = parcelParams(i); return { i: i, name: pc.name || "#" + (i + 1), d: d, r: res[i] }; });
  var cmp = L.compare(parcels.map(function (pc, i) { var d = parcelParams(i); d.name = pc.name; return d; }));
  rows.forEach(function (x, i) { x.rank = cmp[i].rank; });
  rows.sort(function (a, b) { return a.rank - b.rank; });
  var tbl = el("table", {}, [el("tr", {}, [t("rank"), t("name"), t("maxbid"), t("maxm2"), t("askm2"), t("marg"), t("irr"), t("verdict")].map(function (h, i) { return el("th", { class: i > 1 && i < 7 ? "n" : "", text: h }); }))]);
  rows.forEach(function (x) {
    var r = x.r, askm2 = x.d.asking_price > 0 ? ci(x.d.asking_price / x.d.land_area) : "–";
    tbl.appendChild(el("tr", {}, [el("td", { text: String(x.rank) }), el("td", { text: x.name }), el("td", { class: "n", text: cM(r.max_bid) }), el("td", { class: "n", text: ci(r.max_bid_per_m2) }),
      el("td", { class: "n", text: askm2 }), el("td", { class: "n", text: r.margin_at_ask === null ? "–" : cp(r.margin_at_ask) }), el("td", { class: "n", text: r.irr_annual === null ? "–" : cp(r.irr_annual) }), el("td", {}, [verdictChip(r)])]));
  });
  C.parcelOut.textContent = ""; C.parcelOut.appendChild(tbl);
}

function renderBreakdown(i) {
  var d = parcelParams(i), r = L.analyze(d), W = 760, rowH = 30, top = 6, scale = (W - 330) / r.pv_revenue, x0 = 250, y = top, s = "";
  var steps = [[t("b_rev"), r.pv_revenue, 0, "#1d4e6b"], [t("b_con"), r.pv_construction, null, "#c2542d"], [t("b_sales"), r.pv_sales_cost, null, "#c2542d"], [t("b_over"), r.pv_overhead, null, "#c2542d"],
    [t("b_profit"), r.pv_target_profit, null, "#b08a2e"], [t("b_land"), Math.max(0, r.pv_land_allowed), 0, "#2f7d58"]];
  var run = r.pv_revenue;
  steps.forEach(function (st, idx) {
    var start, w = st[1] * scale;
    if (idx === 0 || idx === steps.length - 1) { start = 0; }
    else { run -= st[1]; start = run * scale; }
    s += "<text x='4' y='" + (y + 18) + "' style='font-family:var(--sans)'></text>";
    s += "<rect x='" + (x0 + start) + "' y='" + (y + 4) + "' width='" + Math.max(w, 1) + "' height='" + (rowH - 10) + "' fill='" + st[3] + "' rx='2'/>";
    y += rowH;
  });
  var svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
  svg.setAttribute("viewBox", "0 0 " + W + " " + (y + 4));
  svg.innerHTML = s;
  // labels as real text nodes (textContent only)
  y = top;
  steps.forEach(function (st) {
    var lt = document.createElementNS("http://www.w3.org/2000/svg", "text");
    lt.setAttribute("x", 4); lt.setAttribute("y", y + 19); lt.setAttribute("style", "font-family:var(--sans);font-size:12px"); lt.textContent = st[0]; svg.appendChild(lt);
    var vt = document.createElementNS("http://www.w3.org/2000/svg", "text");
    vt.setAttribute("x", W - 4); vt.setAttribute("y", y + 19); vt.setAttribute("text-anchor", "end"); vt.textContent = cM(st[1]); svg.appendChild(vt);
    y += rowH;
  });
  C.breakOut.textContent = "";
  C.breakOut.appendChild(el("div", { class: "kv" }, [
    kv(cM(r.max_bid), t("maxbid")), kv(ci(r.max_bid_per_m2), t("maxm2")), kv(r.irr_annual === null ? "–" : cp(r.irr_annual), t("irr")), kv(cM(r.gdv_today), "GDV")]));
  C.breakOut.appendChild(svg);
  var cashR = L.analyze(Object.assign({}, d, { land_mode: "cash" }));
  C.breakOut.appendChild(el("p", { class: "hint", style: "margin-top:8px" }, [t("static"), bdi(cM(r.static_residual)), " · ", t("timing"), bdi(cM(cashR.max_bid))]));
}
function kv(v, label) { return el("div", {}, [el("b", {}, [bdi(String(v))]), el("span", { text: label })]); }

function renderStructures() {
  var d = parcelParams(sel);
  var list = [{ name: t("st_cash") }, { name: t("st_1"), land_mode: "installments", land_down: 0.2, land_years: 3, land_per_year: 1, land_grace_years: 0 },
    { name: t("st_2"), land_mode: "installments", land_down: 0.1, land_years: 5, land_per_year: 2, land_grace_years: 0 },
    { name: t("st_3"), land_mode: "installments", land_down: 0.1, land_years: 5, land_per_year: 2, land_grace_years: 1 },
    { name: t("st_you"), land_mode: g.land_mode, land_down: g.land_down, land_years: g.land_years, land_per_year: g.land_per_year, land_grace_years: g.land_grace_years }];
  var r = L.landStructures(Object.assign({}, d, { asking_price: 0 }), list), base = r[0].max_bid || 1;
  var tbl = el("table", {}, [el("tr", {}, [el("th", { text: t("sname") }), el("th", { class: "n", text: t("factor") }), el("th", { class: "n", text: t("hl") }), el("th", { class: "n", text: t("maxm2") }), el("th", { class: "n", text: "Δ vs cash" })])]);
  r.forEach(function (x) { tbl.appendChild(el("tr", {}, [el("td", { text: x.name }), el("td", { class: "n", text: x.land_factor.toFixed(3) }), el("td", { class: "n", text: cM(x.max_bid) }), el("td", { class: "n", text: ci(x.max_bid_per_m2) }), el("td", { class: "n", text: (x.max_bid / base >= 1 ? "+" : "") + cp(x.max_bid / base - 1, 0) })])); });
  C.structOut.textContent = ""; C.structOut.appendChild(tbl);
}

function zoneBar(zone, offered, label) {
  var box = el("div", { style: "margin:10px 0" }, [el("b", { text: label })]);
  var bar = el("div", { class: "zone" });
  var lo = zone.min, hi = zone.max;
  if (zone.agree) bar.appendChild(el("i", { style: "left:" + Math.max(0, lo * 100) + "%;width:" + Math.max(0.5, (Math.min(1, hi) - Math.max(0, lo)) * 100) + "%" }));
  if (offered >= 0 && offered <= 1) bar.appendChild(el("u", { style: "left:" + offered * 100 + "%" }));
  box.appendChild(bar);
  box.appendChild(el("div", { class: "hint" }, zone.agree ? [t("z_ok"), bdi(cp(lo, 1)), t("z_to"), bdi(cp(hi, 1)), t("z_mid"), bdi(cp(zone.mid, 1))] : [t("z_no")]));
  return box;
}
function renderJv() {
  C.jvOut.textContent = "";
  try {
    var d = parcelParams(sel), ownerRaw = jvIn.owner === "" ? d.asking_price : num(jvIn.owner);
    var sh = num(jvIn.share) / 100, ba = num(jvIn.barter) / 100, hc = num(jvIn.hair) / 100;
    var j = L.jv(d, ownerRaw, sh, ba, hc), target = d.target_margin;
    var tbl = el("table", {}, [el("tr", {}, [el("th", { text: t("j_col") }), el("th", { class: "n", text: t("j_opv") }), el("th", { class: "n", text: t("j_dp") }), el("th", { class: "n", text: t("j_dm") }), el("th", { text: t("j_ok") })])]);
    [[t("j_cash"), j.cash], [t("j_rs") + " " + cp(sh, 0), j.share], [t("j_ba") + " " + cp(ba, 0), j.barter]].forEach(function (x) {
      var ok = x[1].dev_margin >= target - 1e-12;
      tbl.appendChild(el("tr", {}, [el("td", { text: x[0] }), el("td", { class: "n", text: cM(x[1].owner_pv) }), el("td", { class: "n", text: cM(x[1].dev_profit) }), el("td", { class: "n", text: cp(x[1].dev_margin) }),
        el("td", {}, [el("span", { class: "chip " + (ok ? "good" : "bad"), text: ok ? t("yes") : t("no") })])]));
    });
    C.jvOut.appendChild(el("div", { class: "tw" }, [tbl]));
    C.jvOut.appendChild(zoneBar(j.share_zone, sh, t("zone_s")));
    C.jvOut.appendChild(zoneBar(j.barter_zone, ba, t("zone_b")));
  } catch (e) { err(C.jvOut, e); }
}

function drivLabel(k) { return DRV[k][lang === "ar" ? 0 : 1]; }
function renderSens() {
  var d = parcelParams(sel), tn = L.tornado(Object.assign({}, d, { asking_price: 0 }));
  var W = 760, rowH = 30, top = 6, mid = 470, sc = Math.max(1, Math.max.apply(null, tn.rows.map(function (r) { return Math.max(Math.abs(r.bid_low - tn.base), Math.abs(r.bid_high - tn.base)); }))), half = 190;
  var svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
  svg.setAttribute("viewBox", "0 0 " + W + " " + (top + tn.rows.length * rowH + 6));
  function mk(n, a, txt) { var e = document.createElementNS("http://www.w3.org/2000/svg", n); Object.keys(a).forEach(function (k) { e.setAttribute(k, a[k]); }); if (txt !== undefined) e.textContent = txt; svg.appendChild(e); }
  tn.rows.forEach(function (r, i) {
    var y = top + i * rowH;
    mk("text", { x: 4, y: y + 19, style: "font-family:var(--sans);font-size:12px" }, drivLabel(r.driver));
    [r.bid_low, r.bid_high].forEach(function (v) { var dl = v - tn.base, w = Math.abs(dl) / sc * half; mk("rect", { x: dl >= 0 ? mid : mid - w, y: y + 5, width: Math.max(w, 1), height: rowH - 12, fill: dl >= 0 ? "#2f7d58" : "#b3261e", rx: 2 }); });
    mk("text", { x: W - 4, y: y + 19, "text-anchor": "end" }, ci(r.bid_low) + " → " + ci(r.bid_high));
  });
  mk("line", { x1: mid, x2: mid, y1: 2, y2: top + tn.rows.length * rowH, stroke: "#18232e" });
  C.sensOut.textContent = ""; C.sensOut.appendChild(svg);

  var f = [0.8, 0.9, 1, 1.1, 1.2], prices = f.map(function (x) { return Math.round(d.price_sqm * x); }), costs = f.map(function (x) { return Math.round(d.cost_sqm * x); });
  var hm = L.bidMap(Object.assign({}, d, { asking_price: 0 }), prices, costs), ask = d.asking_price > 0 ? d.asking_price / d.land_area : 0;
  var mx = Math.max.apply(null, [].concat.apply([], hm.grid)) || 1;
  var tbl = el("table", { class: "heat" }, [el("tr", {}, [el("th", { text: t("rows") })].concat(costs.map(function (c) { return el("th", { class: "n", text: ci(c) }); })))]);
  hm.grid.forEach(function (row, i) {
    tbl.appendChild(el("tr", {}, [el("th", { class: "n", text: ci(prices[i]) })].concat(row.map(function (v) {
      var col = ask > 0 ? (v >= ask ? "hsl(145,45%," + (82 - Math.min(30, (v / ask - 1) * 60)) + "%)" : "hsl(5,60%," + (82 - Math.min(30, (1 - v / ask) * 60)) + "%)") : "hsl(205,40%," + (92 - v / mx * 35) + "%)";
      return el("td", { style: "background:" + col, text: ci(v) });
    }))));
  });
  C.heatOut.textContent = ""; C.heatOut.appendChild(tbl);
}

/* ---------- chrome ---------- */
function chrome() {
  document.documentElement.lang = lang; document.documentElement.dir = lang === "ar" ? "rtl" : "ltr";
  $("lang").textContent = lang === "ar" ? "EN" : "عربي";
  $("kick").textContent = t("kick"); $("ttl").textContent = t("ttl"); $("sub").textContent = t("sub"); $("warn").textContent = t("warn");
  $("t_assume").textContent = t("assume"); $("h_assume").textContent = t("hassume"); $("reset").textContent = t("reset"); $("pdf").textContent = t("pdf"); $("foot").textContent = t("foot");
  document.title = lang === "ar" ? "مختبر صفقات الأراضي" : "Land Deal Lab";
}
function init() { chrome(); buildFields(); buildMain(); render(); }
$("lang").onclick = function () { lang = lang === "ar" ? "en" : "ar"; try { localStorage.setItem("ldl_lang", lang); } catch (e) {} init(); };
$("reset").onclick = function () { resetG(); init(); };
var old;
$("pdf").onclick = function () { old = document.title; document.title = "land-deal-lab-" + new Date().toISOString().slice(0, 10); window.print(); };
window.addEventListener("afterprint", function () { if (old) document.title = old; });
init();
})();
