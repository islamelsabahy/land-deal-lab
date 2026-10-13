import json, os, subprocess, sys, unittest
sys.path.insert(0, os.path.join(os.path.dirname(__file__), ".."))
from landlab import analyze, compare, jv, land_structures, tornado, bid_map, DEFAULTS
from landlab.engine import _weights, _land_schedule, _params

ROOT = os.path.join(os.path.dirname(__file__), "..")


def close(a, b, tol=1e-9):
    return abs(a - b) <= tol * max(1.0, abs(a), abs(b))


class CoreTests(unittest.TestCase):
    def test_weights_sum_to_one(self):
        self.assertTrue(close(sum(_weights(28)), 1.0))

    def test_static_world_matches_textbook_residual(self):
        # No discounting or growth, everything in one month: PV residual == static residual.
        p = {"discount": 0, "price_growth": 0, "cost_infl": 0, "start_delay": 0, "build": 1, "launch": 0,
             "sales_months": 1, "plan_months": 0, "plan_down": 1, "overhead_m": 0, "asking_price": 0}
        r = analyze(p)
        self.assertTrue(close(r["max_bid"], r["static_residual"]))

    def test_max_bid_hits_target_margin_exactly(self):
        for mode in ({"land_mode": "cash"}, {"land_mode": "installments", "land_down": .1, "land_years": 5, "land_per_year": 2}):
            r0 = analyze(dict(mode, asking_price=0))
            r1 = analyze(dict(mode, asking_price=r0["max_bid"]))
            self.assertTrue(close(r1["margin_at_ask"], DEFAULTS["target_margin"]), mode)
            self.assertTrue(close(r1["headroom"], 0.0, 1e-6))

    def test_installments_raise_headline_price_but_not_pv(self):
        cash = analyze({"asking_price": 0})
        inst = analyze({"asking_price": 0, "land_mode": "installments", "land_down": .2, "land_years": 3})
        self.assertGreater(inst["max_bid"], cash["max_bid"])
        self.assertTrue(close(inst["max_bid"] * inst["land_factor"], cash["max_bid"] * cash["land_factor"]))
        self.assertLess(inst["land_factor"], 1.0)

    def test_longer_land_terms_are_worth_more(self):
        a = analyze({"asking_price": 0, "land_mode": "installments", "land_years": 2})["max_bid"]
        b = analyze({"asking_price": 0, "land_mode": "installments", "land_years": 6})["max_bid"]
        g = analyze({"asking_price": 0, "land_mode": "installments", "land_years": 6, "land_grace_years": 2})["max_bid"]
        self.assertLess(a, b)
        self.assertLess(b, g)

    def test_slower_collection_lowers_bid(self):
        fast = analyze({"asking_price": 0, "plan_months": 12})["max_bid"]
        slow = analyze({"asking_price": 0, "plan_months": 84})["max_bid"]
        self.assertGreater(fast, slow)

    def test_land_schedule_sums_to_one(self):
        for p in (_params({"land_mode": "installments", "land_per_year": 4, "land_years": 3, "land_grace_years": 1}),):
            self.assertTrue(close(sum(f for _, f in _land_schedule(p)), 1.0))

    def test_infeasible_deal_reports_zero_bid(self):
        r = analyze({"cost_sqm": 90000, "asking_price": 0})
        self.assertFalse(r["feasible"])
        self.assertEqual(r["max_bid"], 0.0)

    def test_irr_drops_when_price_rises(self):
        lo = analyze({"asking_price": 150e6})["irr_annual"]
        hi = analyze({"asking_price": 450e6})["irr_annual"]
        self.assertGreater(lo, hi)

    def test_validation(self):
        for bad in ({"efficiency": 1.5}, {"land_area": 0}, {"land_per_year": 3}, {"land_mode": "x"}, {"plan_down": 2},
                    {"target_margin": 1}, {"build": 0}, {"discount": 9}):
            with self.assertRaises(ValueError, msg=str(bad)):
                analyze(bad)


class CompareTests(unittest.TestCase):
    def test_ranking_by_margin_at_ask(self):
        rows = compare([{"name": "A", "asking_price": 500e6}, {"name": "B", "asking_price": 150e6}, {"name": "C", "asking_price": 300e6}])
        self.assertEqual([r["name"] for r in sorted(rows, key=lambda r: r["rank"])], ["B", "C", "A"])

    def test_ranking_without_ask_uses_bid_per_m2(self):
        rows = compare([{"name": "low", "price_sqm": 50000, "asking_price": 0}, {"name": "high", "price_sqm": 80000, "asking_price": 0}])
        self.assertEqual(next(r for r in rows if r["rank"] == 1)["name"], "high")

    def test_shared_params_apply(self):
        rows = compare([{"name": "A"}], shared={"price_sqm": 40000})
        self.assertTrue(close(rows[0]["result"]["max_bid"], analyze({"price_sqm": 40000})["max_bid"]))

    def test_structures(self):
        out = land_structures({}, [{"name": "cash"}, {"name": "inst", "land_mode": "installments"}])
        self.assertLess(out[0]["max_bid"], out[1]["max_bid"])


class JvTests(unittest.TestCase):
    def test_breakeven_share_gives_target_margin(self):
        j = jv({}, 300e6, 0.2, 0.2)
        s = j["share_zone"]["max"]
        j2 = jv({}, 300e6, s, 0.2)
        self.assertTrue(close(j2["share"]["dev_margin"], DEFAULTS["target_margin"]))

    def test_breakeven_barter_gives_target_margin(self):
        j = jv({}, 300e6, 0.2, 0.2)
        y = j["barter_zone"]["max"]
        j2 = jv({}, 300e6, 0.2, y)
        self.assertTrue(close(j2["barter"]["dev_margin"], DEFAULTS["target_margin"]))

    def test_owner_min_gives_owner_same_pv_as_cash(self):
        j = jv({}, 300e6, 0.2, 0.2)
        s, y = j["share_zone"]["min"], j["barter_zone"]["min"]
        j2 = jv({}, 300e6, s, y)
        self.assertTrue(close(j2["share"]["owner_pv"], 300e6, 1e-9))
        self.assertTrue(close(j2["barter"]["owner_pv"], 300e6, 1e-9))

    def test_no_agreement_when_owner_wants_too_much(self):
        j = jv({}, 900e6, 0.2, 0.2)
        self.assertFalse(j["share_zone"]["agree"])
        self.assertIsNone(j["share_zone"]["mid"])

    def test_cash_profit_identity(self):
        j = jv({}, 300e6, 0.2, 0.2)
        self.assertTrue(close(j["cash"]["dev_profit"], j["pv_revenue"] - j["pv_sales_cost"] - j["pv_costs"] - 300e6))

    def test_validation(self):
        for args in ((-1, .2, .2), (1, 1.0, .2), (1, .2, 1.0)):
            with self.assertRaises(ValueError):
                jv({}, *args)


class SensTests(unittest.TestCase):
    def test_tornado_sorted_and_directional(self):
        t = tornado({})
        sw = [r["swing"] for r in t["rows"]]
        self.assertEqual(sw, sorted(sw, reverse=True))
        row = {r["driver"]: r for r in t["rows"]}
        self.assertLess(row["price_sqm"]["bid_low"], row["price_sqm"]["bid_high"])
        self.assertGreater(row["cost_sqm"]["bid_low"], row["cost_sqm"]["bid_high"])

    def test_bid_map_monotone(self):
        m = bid_map({}, [50000, 70000], [14000, 18000])
        self.assertLess(m["grid"][0][0], m["grid"][1][0])
        self.assertGreater(m["grid"][0][0], m["grid"][0][1])


class VectorTests(unittest.TestCase):
    def test_vectors_not_stale(self):
        out = subprocess.run([sys.executable, os.path.join(ROOT, "scripts", "build_vectors.py"), "--check"], capture_output=True, text=True)
        self.assertEqual(out.returncode, 0, out.stdout + out.stderr)


if __name__ == "__main__":
    unittest.main()
