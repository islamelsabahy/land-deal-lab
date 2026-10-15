"use strict";
// Builds the workbook for several parameter sets, recalculates it with LibreOffice (skipped if unavailable) and compares with the engine.
const fs = require("fs"), os = require("os"), path = require("path"), cp = require("child_process");
const L = require("../docs/landlab.js"), X = require("../docs/xlsx.js");
const have = cp.spawnSync("sh", ["-c", "command -v soffice"]).status === 0;
const cases = [
  {},
  { asking_price: 250e6 },
  { land_mode: "installments", land_down: 0.1, land_years: 5, land_per_year: 2, land_grace_years: 1 },
  { plan_months: 0, build: 18, launch: 0, price_growth: 0.1, cost_infl: 0.2, far: 1.5 },
];
let n = 0;
cases.forEach((c, i) => {
  const p = Object.assign({}, L.DEFAULTS, c), bytes = X.build(p, { lang: "en" });
  if (bytes[0] !== 0x50 || bytes[1] !== 0x4b) throw new Error("not a zip");
  if (!have) { console.log("soffice not found: structure only for case " + i); return; }
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), "ldlx-")), f = path.join(dir, "m.xlsx");
  fs.writeFileSync(f, Buffer.from(bytes));
  const r = cp.spawnSync("soffice", ["--headless", "--convert-to", "csv:Text - txt - csv (StarCalc):44,34,76,1,,0,false,true,false,false,false,3", "--outdir", dir, f], { encoding: "utf8" });
  const csv = path.join(dir, "m-Summary.csv");
  if (!fs.existsSync(csv)) throw new Error("no summary csv: " + r.stderr + r.stdout);
  const rows = fs.readFileSync(csv, "utf8").split(/\r?\n/).map((l) => l.split(","));
  const val = (row) => Number(String(rows[row - 1][1]).replace(/[^0-9.\-eE]/g, ""));
  const e = L.analyze(p), tol = (a, b, t) => Math.abs(a - b) <= t * Math.max(1, Math.abs(b));
  const got = { max: val(9), pvrev: val(2), con: val(3), lf: val(8) };
  if (!tol(got.max, e.max_bid, 1e-6) || !tol(got.pvrev, e.pv_revenue, 1e-6) || !tol(got.con, e.pv_construction, 1e-6)) throw new Error("case " + i + " mismatch " + JSON.stringify(got) + " vs " + e.max_bid + " " + e.pv_revenue + " " + e.pv_construction);
  n++;
});
console.log(have ? "ok: " + n + " workbooks recalculated in LibreOffice and match the engine" : "ok (structure only)");
