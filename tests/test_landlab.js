"use strict";
const assert = require("assert");
const L = require("../docs/landlab.js");
const V = require("./vectors.json");

function close(a, b, path) {
  if (typeof a === "number" && typeof b === "number") {
    assert.ok(Math.abs(a - b) <= 1e-9 * Math.max(1, Math.abs(a), Math.abs(b)), `${path}: ${a} vs ${b}`);
  } else if (Array.isArray(a)) {
    assert.ok(Array.isArray(b) && a.length === b.length, `${path}: length`);
    a.forEach((x, i) => close(x, b[i], `${path}[${i}]`));
  } else if (a && typeof a === "object") {
    assert.deepStrictEqual(Object.keys(a).sort(), Object.keys(b).sort(), `${path}: keys`);
    Object.keys(a).forEach(k => close(a[k], b[k], `${path}.${k}`));
  } else assert.strictEqual(a, b, path);
}
let n = 0;
V.analyze.forEach(s => { close(L.analyze(s.p), s.out, "analyze:" + s.name); n++; });
close(L.compare(V.compare.parcels, V.compare.shared), V.compare.out, "compare"); n++;
close(L.landStructures({}, V.structures.structures), V.structures.out, "structures"); n++;
V.jv.forEach((j, i) => { close(L.jv({}, j.owner, j.share, j.barter, j.haircut), j.out, "jv" + i); n++; });
close(L.tornado({}), V.tornado.out, "tornado"); n++;
close(L.bidMap({}, V.bid_map.prices, V.bid_map.costs), V.bid_map.out, "bid_map"); n++;
["efficiency", "land_per_year"].forEach(k => assert.throws(() => L.analyze({ [k]: k === "efficiency" ? 2 : 3 })));
assert.throws(() => L.analyze({ land_mode: "x" })); n++;
console.log(`ok: ${n} vector groups match the Python reference`);
