/* Minimal .xlsx writer (no dependencies) that exports one parcel as a workbook with LIVE formulas.
 * Sheets: Assumptions (inputs + derived), Model (monthly flows, 361 rows), Summary (max bid etc.).
 * The workbook recalculates on open, so edit any blue input in Excel and everything follows.
 * `node tests/test_xlsx.js` rebuilds it, recalculates with LibreOffice when available and compares with the engine.
 */
(function (root, factory) {
  if (typeof module === "object" && module.exports) module.exports = factory();
  else root.LandLabXlsx = factory();
})(typeof self !== "undefined" ? self : this, function () {
  "use strict";

  var ROWS = 361; // months 0..360 -> sheet rows 2..362
  var LAST = ROWS + 1;
  var S_DEF = 0, S_BOLD = 1, S_INT = 2, S_PCT = 3, S_DEC = 4, S_INPUT = 5, S_INPUT_PCT = 6, S_HEAD = 7;

  var INPUTS = [
    ["land_area", "Land area", "m²", "مساحة الأرض", S_INPUT], ["far", "Floor-area ratio (FAR)", "built m² per land m²", "معامل البناء", S_INPUT],
    ["efficiency", "Sellable efficiency", "% of built area", "كفاءة المساحة البيعية", S_INPUT_PCT], ["price_sqm", "Sale price", "EGP / sellable m²", "سعر البيع", S_INPUT],
    ["cost_sqm", "Build cost", "EGP / built m²", "تكلفة البناء", S_INPUT], ["soft_pct", "Soft costs (design & supervision)", "% of build cost", "تصميم وإشراف", S_INPUT_PCT],
    ["contingency_pct", "Contingency", "% of build cost", "احتياطي", S_INPUT_PCT], ["sales_pct", "Sales & marketing", "% of revenue", "مبيعات وتسويق", S_INPUT_PCT],
    ["overhead_m", "Fixed overhead", "EGP / month", "مصاريف ثابتة", S_INPUT], ["start_delay", "Months until construction starts", "months", "المدة حتى بدء الإنشاء", S_INPUT],
    ["build", "Construction duration", "months", "مدة الإنشاء", S_INPUT], ["launch", "Months until sales launch", "months", "المدة حتى بدء البيع", S_INPUT],
    ["sales_months", "Time to sell everything", "months", "مدة بيع كل الوحدات", S_INPUT], ["plan_down", "Customer down payment", "% of unit price", "مقدم العميل", S_INPUT_PCT],
    ["plan_months", "Customer instalment period", "months", "مدة تقسيط العميل", S_INPUT], ["discount", "Discount rate", "% per year", "معدل الخصم", S_INPUT_PCT],
    ["price_growth", "Price growth", "% per year", "نمو الأسعار", S_INPUT_PCT], ["cost_infl", "Cost inflation", "% per year", "تضخم التكلفة", S_INPUT_PCT],
    ["target_margin", "Target margin", "% of revenue", "هامش الربح المستهدف", S_INPUT_PCT], ["land_mode_n", "Land payment mode (1 = cash, 2 = instalments)", "1 or 2", "طريقة دفع الأرض", S_INPUT],
    ["land_down", "Land down payment", "% of land price", "مقدم الأرض", S_INPUT_PCT], ["land_years", "Land instalment period", "years", "مدة أقساط الأرض", S_INPUT],
    ["land_per_year", "Land payments per year", "1, 2, 4 or 12", "عدد الدفعات في السنة", S_INPUT], ["land_grace_years", "Land grace period", "years", "فترة سماح الأرض", S_INPUT],
    ["asking_price", "Asking price (0 = none)", "EGP total", "السعر المطلوب", S_INPUT]
  ];

  function esc(s) { return String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;"); }
  function colName(i) { var s = ""; i++; while (i > 0) { var m = (i - 1) % 26; s = String.fromCharCode(65 + m) + s; i = Math.floor((i - 1) / 26); } return s; }

  function Sheet(name) { this.name = name; this.cells = {}; this.widths = []; this.freeze = null; }
  Sheet.prototype.set = function (ref, v, style) { this.cells[ref] = { v: v, s: style || 0 }; };
  Sheet.prototype.xml = function (rtl) {
    var byRow = {}, refs = Object.keys(this.cells);
    refs.forEach(function (ref) { var m = /^([A-Z]+)(\d+)$/.exec(ref), r = Number(m[2]); (byRow[r] = byRow[r] || []).push({ ref: ref, col: m[1] }); });
    function colNum(c) { var n = 0; for (var i = 0; i < c.length; i++) n = n * 26 + (c.charCodeAt(i) - 64); return n; }
    var rows = Object.keys(byRow).map(Number).sort(function (a, b) { return a - b; }), self = this, out = [];
    rows.forEach(function (r) {
      var cs = byRow[r].sort(function (a, b) { return colNum(a.col) - colNum(b.col); }).map(function (x) {
        var c = self.cells[x.ref], v = c.v, st = c.s ? ' s="' + c.s + '"' : "";
        if (v && typeof v === "object" && v.f !== undefined) return '<c r="' + x.ref + '"' + st + "><f>" + esc(v.f) + "</f></c>";
        if (typeof v === "number") return '<c r="' + x.ref + '"' + st + "><v>" + v + "</v></c>";
        return '<c r="' + x.ref + '"' + st + ' t="inlineStr"><is><t xml:space="preserve">' + esc(v) + "</t></is></c>";
      }).join("");
      out.push('<row r="' + r + '">' + cs + "</row>");
    });
    var cols = this.widths.map(function (w, i) { return '<col min="' + (i + 1) + '" max="' + (i + 1) + '" width="' + w + '" customWidth="1"/>'; }).join("");
    var pane = this.freeze ? '<pane ySplit="' + this.freeze + '" topLeftCell="A' + (this.freeze + 1) + '" activePane="bottomLeft" state="frozen"/>' : "";
    return '<?xml version="1.0" encoding="UTF-8" standalone="yes"?><worksheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main"><sheetViews><sheetView workbookViewId="0"' + (rtl ? ' rightToLeft="1"' : "") + ">" + pane + "</sheetView></sheetViews>" +
      (cols ? "<cols>" + cols + "</cols>" : "") + "<sheetData>" + out.join("") + "</sheetData></worksheet>";
  };

  var STYLES = '<?xml version="1.0" encoding="UTF-8" standalone="yes"?><styleSheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main">' +
    '<numFmts count="2"><numFmt numFmtId="164" formatCode="0.0%"/><numFmt numFmtId="165" formatCode="0.0000"/></numFmts>' +
    '<fonts count="3"><font><sz val="11"/><name val="Calibri"/></font><font><b/><sz val="11"/><name val="Calibri"/></font><font><sz val="11"/><color rgb="FF0000FF"/><name val="Calibri"/></font></fonts>' +
    '<fills count="4"><fill><patternFill patternType="none"/></fill><fill><patternFill patternType="gray125"/></fill><fill><patternFill patternType="solid"><fgColor rgb="FFFFF6DC"/></patternFill></fill><fill><patternFill patternType="solid"><fgColor rgb="FFE6DFC8"/></patternFill></fill></fills>' +
    '<borders count="1"><border><left/><right/><top/><bottom/><diagonal/></border></borders>' +
    '<cellStyleXfs count="1"><xf numFmtId="0" fontId="0" fillId="0" borderId="0"/></cellStyleXfs>' +
    '<cellXfs count="8"><xf numFmtId="0" fontId="0" fillId="0" borderId="0" xfId="0"/><xf numFmtId="0" fontId="1" fillId="0" borderId="0" xfId="0" applyFont="1"/>' +
    '<xf numFmtId="3" fontId="0" fillId="0" borderId="0" xfId="0" applyNumberFormat="1"/><xf numFmtId="164" fontId="0" fillId="0" borderId="0" xfId="0" applyNumberFormat="1"/>' +
    '<xf numFmtId="165" fontId="0" fillId="0" borderId="0" xfId="0" applyNumberFormat="1"/>' +
    '<xf numFmtId="3" fontId="2" fillId="2" borderId="0" xfId="0" applyNumberFormat="1" applyFont="1" applyFill="1"/><xf numFmtId="164" fontId="2" fillId="2" borderId="0" xfId="0" applyNumberFormat="1" applyFont="1" applyFill="1"/>' +
    '<xf numFmtId="0" fontId="1" fillId="3" borderId="0" xfId="0" applyFont="1" applyFill="1"/></cellXfs><cellStyles count="1"><cellStyle name="Normal" xfId="0" builtinId="0"/></cellStyles></styleSheet>';

  // ---- zip (store, no compression) ----
  var CRC = (function () { var t = [], c, n, k; for (n = 0; n < 256; n++) { c = n; for (k = 0; k < 8; k++) c = c & 1 ? 0xEDB88320 ^ (c >>> 1) : c >>> 1; t[n] = c >>> 0; } return t; })();
  function crc32(b) { var c = 0xFFFFFFFF; for (var i = 0; i < b.length; i++) c = CRC[(c ^ b[i]) & 255] ^ (c >>> 8); return (c ^ 0xFFFFFFFF) >>> 0; }
  function utf8(s) { if (typeof TextEncoder !== "undefined") return new TextEncoder().encode(s); return Uint8Array.from(Buffer.from(s, "utf8")); }
  function zip(files) {
    var chunks = [], central = [], off = 0;
    function u16(n) { return [n & 255, (n >>> 8) & 255]; }
    function u32(n) { return [n & 255, (n >>> 8) & 255, (n >>> 16) & 255, (n >>> 24) & 255]; }
    files.forEach(function (f) {
      var name = utf8(f.name), data = utf8(f.data), crc = crc32(data);
      var head = [0x50, 0x4b, 3, 4].concat(u16(20), u16(0x0800), u16(0), u16(0), u16(0x21), u32(crc), u32(data.length), u32(data.length), u16(name.length), u16(0));
      chunks.push(Uint8Array.from(head), name, data);
      central.push(Uint8Array.from([0x50, 0x4b, 1, 2].concat(u16(20), u16(20), u16(0x0800), u16(0), u16(0), u16(0x21), u32(crc), u32(data.length), u32(data.length), u16(name.length), u16(0), u16(0), u16(0), u16(0), u32(0), u32(off))), name);
      off += head.length + name.length + data.length;
    });
    var cdSize = 0; central.forEach(function (c) { cdSize += c.length; });
    var end = Uint8Array.from([0x50, 0x4b, 5, 6, 0, 0, 0, 0].concat(u16(files.length), u16(files.length), u32(cdSize), u32(off), u16(0)));
    var all = chunks.concat(central, [end]), total = 0; all.forEach(function (c) { total += c.length; });
    var out = new Uint8Array(total), p = 0; all.forEach(function (c) { out.set(c, p); p += c.length; });
    return out;
  }

  /** build(params, opts) -> Uint8Array of the .xlsx. opts.lang "ar"|"en" (adds Arabic labels and RTL view). */
  function build(p, opts) {
    opts = opts || {};
    var ar = opts.lang === "ar", A = new Sheet("Assumptions"), M = new Sheet("Model"), U = new Sheet("Summary"), ref = {};
    A.widths = [46, 18, 24, 30]; M.widths = [6, 9, 9, 10, 14, 14, 12, 14, 12, 10, 10, 10, 14, 14, 14]; U.widths = [52, 22, 40]; M.freeze = 1;
    A.set("A1", "Land Deal Lab — assumptions (blue cells are inputs)" + (ar ? " / الافتراضات (الخانات الزرقاء مدخلات)" : ""), S_HEAD); A.set("B1", "Value", S_HEAD); A.set("C1", "Unit", S_HEAD); A.set("D1", ar ? "بالعربي" : "Arabic", S_HEAD);
    var vals = {}; for (var k in p) vals[k] = p[k]; vals.land_mode_n = p.land_mode === "installments" ? 2 : 1;
    INPUTS.forEach(function (row, i) {
      var r = i + 3, key = row[0]; ref[key] = "Assumptions!$B$" + r;
      A.set("A" + r, row[1]); A.set("B" + r, Number(vals[key]), row[4]); A.set("C" + r, row[2]); A.set("D" + r, row[3]);
    });
    var r0 = INPUTS.length + 4, d = {};
    function der(key, label, f, st) { var r = r0 + Object.keys(d).length; d[key] = "Assumptions!$B$" + r; A.set("A" + r, label); A.set("B" + r, { f: f }, st || S_INT); }
    A.set("A" + (r0 - 1), "Derived (formulas)", S_BOLD);
    der("bua", "Built area (m²)", ref.land_area + "*" + ref.far);
    der("sell", "Sellable area (m²)", "B" + r0 + "*" + ref.efficiency);
    der("total", "Build cost today (EGP)", "B" + r0 + "*" + ref.cost_sqm);
    der("mult", "Soft + contingency multiplier", "1+" + ref.soft_pct + "+" + ref.contingency_pct, S_DEC);
    der("active", "Active months (overhead runs to)", "MAX(" + ref.start_delay + "+" + ref.build + "," + ref.launch + "+" + ref.sales_months + ")");
    der("step", "Months between land payments", "INT(12/" + ref.land_per_year + ")");
    der("nland", "Number of land instalments", ref.land_years + "*" + ref.land_per_year);
    der("gdv", "GDV at today's prices (EGP)", "B" + (r0 + 1) + "*" + ref.price_sqm);

    var hdr = ["t", "Price idx", "Cost idx", "Disc. factor", "Sales booked", "Revenue collected", "Sales cost", "Construction", "Overhead", "x(k)", "x(k-1)", "Land share", "Net before land", "Land payment", "Project net"];
    hdr.forEach(function (h, i) { M.set(colName(i) + "1", h, S_HEAD); });
    var R = ref;
    for (var t = 0; t < ROWS; t++) {
      var r = t + 2, T = "A" + r;
      M.set(T, t);
      M.set("B" + r, { f: "(1+" + R.price_growth + "/12)^" + T }, S_DEC);
      M.set("C" + r, { f: "(1+" + R.cost_infl + "/12)^" + T }, S_DEC);
      M.set("D" + r, { f: "1/(1+" + R.discount + "/12)^" + T }, S_DEC);
      M.set("E" + r, { f: "IF(AND(" + T + ">=" + R.launch + "," + T + "<" + R.launch + "+" + R.sales_months + ")," + d.sell + "*" + R.price_sqm + "/" + R.sales_months + "*B" + r + ",0)" }, S_INT);
      M.set("F" + r, { f: "IF(" + R.plan_months + ">0,E" + r + "*" + R.plan_down + "+(1-" + R.plan_down + ")/" + R.plan_months + "*SUMIFS($E$2:$E$" + LAST + ",$A$2:$A$" + LAST + ',">="&(' + T + "-" + R.plan_months + "),$A$2:$A$" + LAST + ',"<"&' + T + "),E" + r + ")" }, S_INT);
      M.set("G" + r, { f: R.sales_pct + "*E" + r }, S_INT);
      M.set("H" + r, { f: "IF(J" + r + ">0," + d.total + "*" + d.mult + "*C" + r + "*((3*J" + r + "^2-2*J" + r + "^3)-(3*K" + r + "^2-2*K" + r + "^3)),0)" }, S_INT);
      M.set("I" + r, { f: "IF(" + T + "<" + d.active + "," + R.overhead_m + ",0)" }, S_INT);
      M.set("J" + r, { f: "IF(AND(" + T + ">=" + R.start_delay + "," + T + "<" + R.start_delay + "+" + R.build + ")," + "(" + T + "-" + R.start_delay + "+1)/" + R.build + ",0)" }, S_DEC);
      M.set("K" + r, { f: "IF(J" + r + ">0,(" + T + "-" + R.start_delay + ")/" + R.build + ",0)" }, S_DEC);
      var g12 = R.land_grace_years + "*12";
      M.set("L" + r, { f: "IF(" + R.land_mode_n + "=1,IF(" + T + "=0,1,0),IF(" + T + "=0," + R.land_down + ",IF(AND(" + T + ">=" + g12 + "+" + d.step + ",MOD(" + T + "-" + g12 + "," + d.step + ")=0,(" + T + "-" + g12 + ")/" + d.step + "<=" + d.nland + "),(1-" + R.land_down + ")/" + d.nland + ",0)))" }, S_DEC);
      M.set("M" + r, { f: "F" + r + "-G" + r + "-H" + r + "-I" + r }, S_INT);
      M.set("N" + r, { f: "L" + r + "*Summary!$B$11" }, S_INT);
      M.set("O" + r, { f: "M" + r + "-N" + r }, S_INT);
    }
    var rng = function (c) { return "Model!$" + c + "$2:$" + c + "$" + LAST; };
    function pv(c) { return "SUMPRODUCT(" + rng("D") + "," + rng(c) + ")"; }
    U.set("A1", "Summary" + (ar ? " / الملخص" : ""), S_HEAD); U.set("B1", "Value", S_HEAD); U.set("C1", "Meaning", S_HEAD);
    var rows = [
      ["PV of revenue (EGP)", pv("F"), S_INT, "Collected revenue discounted monthly"],
      ["PV of construction + soft + contingency (EGP)", pv("H"), S_INT, ""],
      ["PV of sales & marketing (EGP)", pv("G"), S_INT, ""],
      ["PV of overhead (EGP)", pv("I"), S_INT, ""],
      ["PV of target profit (EGP)", R.target_margin + "*B2", S_INT, "Target margin × PV revenue"],
      ["PV available for land (EGP)", "B2-B3-B4-B5-B6", S_INT, "What is left after costs and target profit"],
      ["PV of 1 EGP of land price", pv("L"), S_DEC, "Under your land payment terms (1 = cash)"],
      ["MAX BID for the land (EGP)", "IF(B7>0,B7/B8,0)", S_INT, "Most you can pay and still hit the target margin"],
      ["Max bid per land m² (EGP)", "B9/" + R.land_area, S_INT, ""],
      ["Land price used below (EGP)", "IF(" + R.asking_price + ">0," + R.asking_price + ",B9)", S_INT, "Asking price if given, otherwise the max bid"],
      ["Margin at that price", "(B2-B3-B4-B5-B11*B8)/B2", S_PCT, "Profit as a share of PV revenue"],
      ["Headroom vs asking price (EGP)", "IF(" + R.asking_price + ">0,B9-" + R.asking_price + ',"n/a")', S_INT, "Positive = asking price is below your max bid"],
      ["Project IRR (annual, simple ×12)", "IFERROR(IRR(" + rng("O") + ",0.01)*12,\"n/a\")", S_PCT, "On project cash flows after land"],
      ["GDV at today's prices (EGP)", d.gdv, S_INT, ""],
      ["Textbook residual without timing (EGP)", d.gdv + "-" + d.total + "*" + d.mult + "-" + R.sales_pct + "*" + d.gdv + "-" + R.target_margin + "*" + d.gdv, S_INT, "Ignores timing and discounting"]
    ];
    // rows: 2 PV revenue, 3 construction, 4 sales cost, 5 overhead, 6 target profit, 7 available for land, 8 land factor, 9 MAX BID,
    // 10 per m2, 11 land price used (referenced by Model!N), 12 margin, 13 headroom, 14 IRR, 15 GDV, 16 textbook residual
    rows.forEach(function (x, i) { var r = i + 2; U.set("A" + r, x[0], r === 9 ? S_BOLD : 0); U.set("B" + r, { f: x[1] }, x[2]); U.set("C" + r, x[3]); });
    U.set("A18", "A learning model with fictional defaults; not valuation or financial advice. Change the blue cells on the Assumptions sheet.", 0);
    var sheets = [A, M, U];
    var wb = '<?xml version="1.0" encoding="UTF-8" standalone="yes"?><workbook xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships"><sheets>' +
      sheets.map(function (s, i) { return '<sheet name="' + s.name + '" sheetId="' + (i + 1) + '" r:id="rId' + (i + 1) + '"/>'; }).join("") + '</sheets><calcPr calcId="191029" fullCalcOnLoad="1"/></workbook>';
    var rels = '<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">' +
      sheets.map(function (s, i) { return '<Relationship Id="rId' + (i + 1) + '" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet" Target="worksheets/sheet' + (i + 1) + '.xml"/>'; }).join("") +
      '<Relationship Id="rId4" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/styles" Target="styles.xml"/></Relationships>';
    var ct = '<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types"><Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/><Default Extension="xml" ContentType="application/xml"/>' +
      '<Override PartName="/xl/workbook.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet.main+xml"/><Override PartName="/xl/styles.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.styles+xml"/>' +
      sheets.map(function (s, i) { return '<Override PartName="/xl/worksheets/sheet' + (i + 1) + '.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml"/>'; }).join("") + "</Types>";
    var root = '<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="xl/workbook.xml"/></Relationships>';
    var files = [{ name: "[Content_Types].xml", data: ct }, { name: "_rels/.rels", data: root }, { name: "xl/workbook.xml", data: wb }, { name: "xl/_rels/workbook.xml.rels", data: rels }, { name: "xl/styles.xml", data: STYLES }];
    sheets.forEach(function (s, i) { files.push({ name: "xl/worksheets/sheet" + (i + 1) + ".xml", data: s.xml(ar) }); });
    return zip(files);
  }

  return { build: build };
});
