"""Generate tests/vectors.json from the Python reference (--check detects drift)."""
import json, os, sys
sys.path.insert(0, os.path.join(os.path.dirname(__file__), ".."))
from landlab import analyze, compare, jv, land_structures, tornado, bid_map

PATH = os.path.join(os.path.dirname(__file__), "..", "tests", "vectors.json")


def build():
    scenarios = [
        {"name": "defaults", "p": {}},
        {"name": "no-ask", "p": {"asking_price": 0}},
        {"name": "installments", "p": {"asking_price": 0, "land_mode": "installments", "land_down": 0.1, "land_years": 5, "land_per_year": 2, "land_grace_years": 1}},
        {"name": "monthly-land", "p": {"land_mode": "installments", "land_per_year": 12, "land_years": 2}},
        {"name": "static-world", "p": {"discount": 0, "price_growth": 0, "cost_infl": 0, "start_delay": 0, "build": 1, "launch": 0,
                                       "sales_months": 1, "plan_months": 0, "plan_down": 1, "overhead_m": 0, "asking_price": 0}},
        {"name": "infeasible", "p": {"cost_sqm": 90000}},
        {"name": "long-plan", "p": {"plan_months": 120, "plan_down": 0.05, "sales_months": 60}},
        {"name": "negative-rates", "p": {"discount": 0.05, "price_growth": 0.2, "cost_infl": -0.02}},
    ]
    analyses = [dict(s, out=analyze(s["p"])) for s in scenarios]
    parcels = [{"name": "A", "asking_price": 500e6, "land_area": 25000, "price_sqm": 60000},
               {"name": "B", "asking_price": 150e6, "land_area": 10000},
               {"name": "C", "asking_price": 0, "far": 1.5}]
    comp = {"parcels": parcels, "shared": {"discount": 0.22}, "out": compare(parcels, {"discount": 0.22})}
    structs = [{"name": "cash"}, {"name": "20/3y", "land_mode": "installments"},
               {"name": "10/5y semi", "land_mode": "installments", "land_down": 0.1, "land_years": 5, "land_per_year": 2}]
    ls = {"structures": structs, "out": land_structures({}, structs)}
    jvs = [{"owner": 300e6, "share": 0.3, "barter": 0.3, "haircut": 0.0},
           {"owner": 900e6, "share": 0.1, "barter": 0.1, "haircut": 0.1},
           {"owner": 0, "share": 0.0, "barter": 0.0, "haircut": 0.0}]
    jout = [dict(a, out=jv({}, a["owner"], a["share"], a["barter"], a["haircut"])) for a in jvs]
    torn = {"out": tornado({})}
    bm = {"prices": [55000, 68000, 80000], "costs": [14000, 16000, 20000], "out": bid_map({}, [55000, 68000, 80000], [14000, 16000, 20000])}
    return {"analyze": analyses, "compare": comp, "structures": ls, "jv": jout, "tornado": torn, "bid_map": bm}


def main():
    text = json.dumps(build(), indent=1, sort_keys=True) + "\n"
    if "--check" in sys.argv:
        with open(PATH, encoding="utf-8") as f:
            if f.read() != text:
                print("tests/vectors.json is stale; run scripts/build_vectors.py")
                sys.exit(1)
        print("vectors up to date")
        return
    with open(PATH, "w", encoding="utf-8") as f:
        f.write(text)
    print("wrote", PATH)


if __name__ == "__main__":
    main()
