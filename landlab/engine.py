"""Land deal engine (educational, fictional-data only).

Everything is monthly. The Python code is the reference; docs/landlab.js must match it.
Only + - * / are used on floats (no pow/exp/log, no sum()), so IEEE doubles agree in Python and
JavaScript. Discount rate and growth rates are nominal annual, divided by 12 per month.

Idea: the *price you can pay* for land depends on WHEN money moves. We discount revenue,
construction and costs month by month, keep a target margin of the discounted revenue, and
solve (closed form) for the present value left over for land. A land-payment structure then
converts that present value into a headline price: paying in instalments lets the headline
price be higher for the same economics.
"""

DEFAULTS = {
    "land_area": 20000.0,      # m2
    "far": 1.2,                # built-up area per m2 of land
    "efficiency": 0.82,        # sellable share of built-up area
    "price_sqm": 68000.0,      # sale price per sellable m2 (today's money)
    "cost_sqm": 16000.0,       # construction cost per built-up m2 (today's money)
    "soft_pct": 0.08,          # design/supervision/permits, share of construction
    "contingency_pct": 0.05,   # share of construction
    "sales_pct": 0.03,         # sales and marketing, share of sales value
    "overhead_m": 400000.0,    # fixed monthly overhead while active
    "target_margin": 0.20,     # target profit as share of discounted revenue
    "discount": 0.20,          # nominal annual discount rate
    "price_growth": 0.14,      # nominal annual price growth
    "cost_infl": 0.14,         # nominal annual construction-cost inflation
    "start_delay": 9,          # months from purchase to construction start
    "build": 28,               # construction months
    "launch": 3,               # months from purchase to first sales
    "sales_months": 30,        # months over which the sellable area is sold
    "plan_down": 0.20,         # customer down payment (share of price, paid at sale)
    "plan_months": 36,         # customer instalment months after sale
    "land_mode": "cash",       # "cash" or "installments"
    "land_down": 0.20,         # land: share paid at purchase (installments mode)
    "land_years": 3,           # land: years of instalments
    "land_per_year": 1,        # land: payments per year (1, 2, 4 or 12)
    "land_grace_years": 0,     # land: years before the first instalment
    "asking_price": 300000000.0,  # total nominal land price being asked (0 = none)
}

_INT = ("start_delay", "build", "launch", "sales_months", "plan_months", "land_years", "land_per_year",
        "land_grace_years")


def _params(d):
    p = dict(DEFAULTS)
    for k, v in (d or {}).items():
        if k in DEFAULTS:
            p[k] = v
    for k in DEFAULTS:
        if k == "land_mode":
            if p[k] not in ("cash", "installments"):
                raise ValueError("land_mode must be cash or installments")
        elif k in _INT:
            p[k] = int(p[k])
        else:
            p[k] = float(p[k])

    def bad(m):
        raise ValueError(m)
    for k in ("land_area", "far", "efficiency", "price_sqm", "cost_sqm"):
        if not p[k] > 0:
            bad(k + " must be > 0")
    if p["efficiency"] > 1:
        bad("efficiency must be <= 1")
    for k in ("soft_pct", "contingency_pct", "sales_pct", "overhead_m", "asking_price"):
        if p[k] < 0:
            bad(k + " must be >= 0")
    if not 0 <= p["target_margin"] < 1:
        bad("target_margin must be 0..1")
    for k in ("discount", "price_growth", "cost_infl"):
        if not -0.5 <= p[k] <= 5:
            bad(k + " out of range")
    if not 0 <= p["plan_down"] <= 1:
        bad("plan_down must be 0..1")
    if not 0 <= p["land_down"] <= 1:
        bad("land_down must be 0..1")
    if not (0 <= p["start_delay"] <= 120 and 1 <= p["build"] <= 120 and 0 <= p["launch"] <= 240
            and 1 <= p["sales_months"] <= 240 and 0 <= p["plan_months"] <= 240):
        bad("timing out of range")
    if p["land_per_year"] not in (1, 2, 4, 12):
        bad("land_per_year must be 1, 2, 4 or 12")
    if not (1 <= p["land_years"] <= 20 and 0 <= p["land_grace_years"] <= 10):
        bad("land years out of range")
    return p


def _weights(n):
    """S-curve construction spend (smoothstep differences), sums to 1."""
    def s(x):
        return 3.0 * x * x - 2.0 * x * x * x
    return [s(k / n) - s((k - 1) / n) for k in range(1, n + 1)]


def _growth(rate, n):
    out = [1.0]
    f = 1.0 + rate / 12.0
    for _ in range(n):
        out.append(out[-1] * f)
    return out


def _discount(rate, n):
    out = [1.0]
    f = 1.0 + rate / 12.0
    for _ in range(n):
        out.append(out[-1] / f)
    return out


def _land_schedule(p):
    """[(month, fraction of nominal land price)]"""
    if p["land_mode"] == "cash":
        return [(0, 1.0)]
    out = [(0, p["land_down"])]
    n = p["land_years"] * p["land_per_year"]
    each = (1.0 - p["land_down"]) / n
    step = 12 // p["land_per_year"]
    for j in range(1, n + 1):
        out.append((p["land_grace_years"] * 12 + j * step, each))
    return out


def _horizon(p):
    sched_end = max(m for m, _ in _land_schedule(p))
    return max(p["start_delay"] + p["build"], p["launch"] + p["sales_months"] + p["plan_months"], sched_end) + 1


def _flows(p, T):
    bua = p["land_area"] * p["far"]
    sell = bua * p["efficiency"]
    pidx = _growth(p["price_growth"], T)
    cidx = _growth(p["cost_infl"], T)
    rev = [0.0] * (T + 1)
    salescost = [0.0] * (T + 1)
    constr = [0.0] * (T + 1)
    over = [0.0] * (T + 1)
    for m in range(p["launch"], p["launch"] + p["sales_months"]):
        sale = sell * p["price_sqm"] / p["sales_months"] * pidx[m]
        rev[m] += sale * p["plan_down"]
        rest = sale * (1.0 - p["plan_down"])
        if p["plan_months"] > 0:
            each = rest / p["plan_months"]
            for j in range(1, p["plan_months"] + 1):
                rev[m + j] += each
        else:
            rev[m] += rest
        salescost[m] += p["sales_pct"] * sale
    total = bua * p["cost_sqm"]
    w = _weights(p["build"])
    mult = 1.0 + p["soft_pct"] + p["contingency_pct"]
    for k in range(1, p["build"] + 1):
        t = p["start_delay"] + k - 1
        constr[t] += total * w[k - 1] * cidx[t] * mult
    active_end = max(p["start_delay"] + p["build"], p["launch"] + p["sales_months"])
    for t in range(0, active_end):
        over[t] = p["overhead_m"]
    return {"bua": bua, "sell": sell, "pidx": pidx, "cidx": cidx, "rev": rev, "salescost": salescost,
            "constr": constr, "over": over}


def _pv(arr, df):
    acc = 0.0
    for t in range(len(arr)):
        acc += arr[t] * df[t]
    return acc


def _land_factor(p, df):
    acc = 0.0
    for m, frac in _land_schedule(p):
        acc += frac * df[m]
    return acc


def _irr_monthly(flows):
    def npv(rate):
        d = 1.0
        acc = 0.0
        step = 1.0 + rate
        for x in flows:
            acc += x * d
            d = d / step
        return acc
    lo, hi = -0.5, 1.0
    flo, fhi = npv(lo), npv(hi)
    if flo == 0.0:
        return lo
    if fhi == 0.0:
        return hi
    if (flo > 0) == (fhi > 0):
        return None
    for _ in range(200):
        mid = (lo + hi) / 2.0
        fm = npv(mid)
        if (fm > 0) == (flo > 0):
            lo, flo = mid, fm
        else:
            hi = mid
    return (lo + hi) / 2.0


def analyze(params):
    p = _params(params)
    T = _horizon(p)
    f = _flows(p, T)
    df = _discount(p["discount"], T + 1)
    pv_rev = _pv(f["rev"], df)
    pv_sales = _pv(f["salescost"], df)
    pv_con = _pv(f["constr"], df)
    pv_over = _pv(f["over"], df)
    pv_costs = pv_sales + pv_con + pv_over
    target = p["target_margin"] * pv_rev
    pv_land_allowed = pv_rev - pv_costs - target
    lf = _land_factor(p, df)
    max_bid = pv_land_allowed / lf if pv_land_allowed > 0 else 0.0
    gdv = f["sell"] * p["price_sqm"]
    static_costs = f["bua"] * p["cost_sqm"] * (1.0 + p["soft_pct"] + p["contingency_pct"]) + p["sales_pct"] * gdv
    static_residual = gdv - static_costs - p["target_margin"] * gdv
    out = {
        "bua": f["bua"], "sellable": f["sell"], "gdv_today": gdv,
        "pv_revenue": pv_rev, "pv_construction": pv_con, "pv_sales_cost": pv_sales, "pv_overhead": pv_over,
        "pv_target_profit": target, "pv_land_allowed": pv_land_allowed, "land_factor": lf,
        "max_bid": max_bid, "max_bid_per_m2": max_bid / p["land_area"],
        "static_residual": static_residual, "feasible": pv_land_allowed > 0,
    }
    price = p["asking_price"] if p["asking_price"] > 0 else max_bid
    land_pv = price * lf
    out["margin_at_ask"] = None
    out["headroom"] = None
    if p["asking_price"] > 0:
        out["margin_at_ask"] = (pv_rev - pv_costs - land_pv) / pv_rev
        out["headroom"] = max_bid - p["asking_price"]
    flows = []
    land_pay = [0.0] * (T + 1)
    for m, frac in _land_schedule(p):
        land_pay[m] += price * frac
    for t in range(T + 1):
        flows.append(f["rev"][t] - f["salescost"][t] - f["constr"][t] - f["over"][t] - land_pay[t])
    irr = _irr_monthly(flows)
    out["irr_annual"] = None if irr is None else irr * 12.0
    out["irr_at"] = price
    return out


def compare(parcels, shared=None):
    """parcels: [{"name":..., overrides...}]. Ranks by margin at ask (if asked) else max bid per m2."""
    rows = []
    for i, pc in enumerate(parcels):
        d = dict(shared or {})
        for k, v in pc.items():
            if k != "name":
                d[k] = v
        r = analyze(d)
        rows.append({"name": pc.get("name", "Parcel " + str(i + 1)), "land_area": float(d.get("land_area", DEFAULTS["land_area"])),
                     "asking_price": float(d.get("asking_price", 0.0)), "result": r})
    ranked = sorted(range(len(rows)), key=lambda i: (
        0 if rows[i]["result"]["margin_at_ask"] is not None else 1,
        -(rows[i]["result"]["margin_at_ask"] if rows[i]["result"]["margin_at_ask"] is not None
          else rows[i]["result"]["max_bid_per_m2"]), i))
    for rank, i in enumerate(ranked, 1):
        rows[i]["rank"] = rank
    return rows


def land_structures(params, structures):
    """Headline price you could pay under each structure for the same economics.
    structures: [{"name","land_mode","land_down","land_years","land_per_year","land_grace_years"}]"""
    base = _params(params)
    out = []
    for s in structures:
        d = dict(base)
        for k in ("land_mode", "land_down", "land_years", "land_per_year", "land_grace_years"):
            if k in s:
                d[k] = s[k]
        r = analyze(d)
        out.append({"name": s.get("name", ""), "land_factor": r["land_factor"], "max_bid": r["max_bid"],
                    "max_bid_per_m2": r["max_bid_per_m2"]})
    return out


def jv(params, owner_cash_price, share, barter, barter_haircut=0.0):
    """Landowner deal comparator. Owner's reservation = owner_cash_price paid in cash at month 0.

    cash:   developer pays owner_cash_price at month 0.
    share:  owner receives `share` of every revenue receipt (no land cash).
    barter: owner receives `barter` of the sellable area at completion (no land cash).
    All values are present values at the purchase date with the same discount rate.
    """
    p = _params(params)
    if not 0 <= share < 1 or not 0 <= barter < 1 or owner_cash_price < 0 or not 0 <= barter_haircut < 1:
        raise ValueError("bad jv inputs")
    T = _horizon(p)
    f = _flows(p, T)
    df = _discount(p["discount"], T + 1)
    R = _pv(f["rev"], df)
    S = _pv(f["salescost"], df)
    C = _pv(f["constr"], df) + _pv(f["over"], df)
    tgt = p["target_margin"] * R
    Tc = p["start_delay"] + p["build"]
    unit_value = f["sell"] * p["price_sqm"] * f["pidx"][Tc] * df[Tc] * (1.0 - barter_haircut)

    dev_cash = R - S - C - owner_cash_price
    dev_share = (1.0 - share) * R - S - C
    dev_barter = (1.0 - barter) * (R - S) - C
    s_dev_max = 1.0 - (S + C) / R - p["target_margin"]
    y_dev_max = 1.0 - (tgt + C) / (R - S) if R - S > 0 else 0.0
    s_owner_min = owner_cash_price / R
    y_owner_min = owner_cash_price / unit_value if unit_value > 0 else None
    def zone(lo, hi):
        if lo is None:
            return {"min": None, "max": hi, "agree": False, "mid": None}
        ok = lo <= hi
        return {"min": lo, "max": hi, "agree": ok, "mid": (lo + hi) / 2.0 if ok else None}
    return {
        "pv_revenue": R, "pv_sales_cost": S, "pv_costs": C, "pv_target_profit": tgt, "barter_unit_value": unit_value,
        "cash": {"owner_pv": owner_cash_price, "dev_profit": dev_cash, "dev_margin": dev_cash / R},
        "share": {"share": share, "owner_pv": share * R, "dev_profit": dev_share, "dev_margin": dev_share / R},
        "barter": {"barter": barter, "owner_pv": barter * unit_value, "dev_profit": dev_barter, "dev_margin": dev_barter / R},
        "share_zone": zone(s_owner_min, s_dev_max), "barter_zone": zone(y_owner_min, y_dev_max),
    }


TORNADO_DRIVERS = ("price_sqm", "cost_sqm", "efficiency", "far", "discount", "sales_months", "plan_months",
                   "target_margin", "build")


def tornado(params, swing=0.2):
    """Effect on max bid (per m2 of land) of moving each driver by -/+swing."""
    p = _params(params)
    base = analyze(p)["max_bid_per_m2"]
    rows = []
    for k in TORNADO_DRIVERS:
        v = p[k]
        lo_v, hi_v = v * (1.0 - swing), v * (1.0 + swing)
        if k in _INT:
            lo_v, hi_v = max(1, int(lo_v + 0.5)), max(1, int(hi_v + 0.5))
        if k == "efficiency":
            hi_v = min(hi_v, 1.0)
        a = dict(p); a[k] = lo_v
        b = dict(p); b[k] = hi_v
        lo = analyze(a)["max_bid_per_m2"]
        hi = analyze(b)["max_bid_per_m2"]
        rows.append({"driver": k, "low_value": lo_v, "high_value": hi_v, "bid_low": lo, "bid_high": hi,
                     "swing": abs(hi - lo)})
    rows.sort(key=lambda r: (-r["swing"], r["driver"]))
    return {"base": base, "rows": rows}


def bid_map(params, prices, costs):
    """Max bid per m2 of land over a grid of sale price (rows) x construction cost (columns)."""
    p = _params(params)
    grid = []
    for pr in prices:
        row = []
        for c in costs:
            d = dict(p); d["price_sqm"] = pr; d["cost_sqm"] = c
            row.append(analyze(d)["max_bid_per_m2"])
        grid.append(row)
    return {"prices": list(prices), "costs": list(costs), "grid": grid}
