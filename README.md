# Land Deal Lab

**What is the most you can pay for a plot of land, and under which payment structure?**
A residual land valuation workbench for real estate developers evaluating a single parcel or a land bank. Python reference engine (stdlib only) + a bilingual (Arabic RTL / English) browser app that runs fully offline.

**Live app:** enable GitHub Pages (branch `main`, folder `/docs`).

## What it does
- **Max bid**: discounts revenue (customer payment plan, price growth) and costs (build, soft, contingency, sales, overhead, cost inflation) monthly, subtracts the target margin, and solves the land price in closed form. Shows the textbook static residual next to the timing-aware figure.
- **Payment structure**: the same economics let you accept a higher headline price if you pay later. Compares cash, instalments and grace periods by present value.
- **Parcel ranking**: compare several parcels by max bid, margin at the asking price, project IRR and a within-budget verdict.
- **Landowner deal**: cash vs revenue share vs area barter, with the zone of agreement between what the owner needs and what you can give.
- **Sensitivity**: tornado of max bid per m² and a sale price x build cost heatmap.
- **PDF report** via print, with assumptions included.

## Connected tools
- **Excel (live formulas):** the "Excel" button downloads the selected parcel as a workbook (blue cells are inputs, everything recalculates in Excel). `node tests/test_xlsx.js` rebuilds it, recalculates it in LibreOffice when available, and compares with the engine.
- **Cashflow Survival:** the "Send to Cashflow Survival" button opens [developer-cashflow-survival](https://github.com/islamelsabahy/developer-cashflow-survival) with this parcel's price, cost, timing, payment plan and upfront land payment filled in, to test whether the project survives its cash profile.

## Run
```bash
python -m unittest discover -s tests      # Python engine
node tests/test_landlab.js                # JS port vs Python vectors
python scripts/build_vectors.py --check   # detect vector drift
cd docs && python -m http.server 8000     # open http://localhost:8000
```

```python
from landlab import DEFAULTS, analyze
r = analyze(dict(DEFAULTS, asking_price=300_000_000))
print(r["max_bid"], r["margin_at_ask"], r["irr_annual"])
```

## Design notes
- Python and JS use identical arithmetic (only + - * / and sqrt); `tests/vectors.json` is generated from Python and replayed in Node (1e-9 relative tolerance). CI enforces parity.
- No dependencies, no network, no analytics. DOM is built with `textContent` only.

## Disclaimer
Educational tool with **fictional default numbers**. Not financial, legal, tax or valuation advice. The model ignores taxes, bank debt, planning changes and contract risk. Verify real allocation terms and contracts with qualified professionals.

MIT licensed.

---

# مختبر صفقات الأراضي (عربي)

**أقصى سعر تقدر تدفعه في الأرض، وبأي هيكل دفع؟** أداة تقييم متبقٍّ للأرض لمطوّر عقاري عنده قطعة أو أكتر. محرك بايثون مرجعي + تطبيق ويب ثنائي اللغة (عربي RTL / إنجليزي) بيشتغل أوفلاين.

- **أقصى سعر**: خصم شهري للإيراد والتكلفة بتوقيتهم، مع الهامش المستهدف، ومقارنة بالحساب التقليدي.
- **هيكل دفع الأرض**: كاش مقابل أقساط وسماح بالقيمة الحالية.
- **ترتيب القطع**: أقصى سعر، هامش عند السعر المطلوب، IRR، وقرار.
- **صفقة المالك**: كاش مقابل حصة إيراد مقابل مقايضة مساحة، ومنطقة الاتفاق.
- **الحساسية** وخريطة سعر البيع × تكلفة البناء، وتقرير PDF.

**تنبيه:** أرقام افتراضية وهمية، للتعليم فقط، مش استشارة مالية أو قانونية أو تقييم عقاري.

## Limitations
- Demonstration tool built on **fictional sample data**. Outputs are decision support, not legal, tax or investment advice.
- Results depend on the assumptions you enter; check them against your own numbers before relying on them.
- Local by default: calculations run in your browser and nothing is sent to a server. The one exception is the **“Send to Cashflow Survival”** button: it opens the Cashflow Survival page with your sale price, budget, schedule and other assumptions in the link's query string, so they can appear in browser history and in that site's server logs. Use it only with figures you are comfortable sharing. Where a page offers an **optional AI mode**, turning it on sends the text/data you entered (and the computed results it needs) to `api.anthropic.com` using your own API key. Do not enable it with confidential customer, inventory or finance data. See [SECURITY.md](SECURITY.md).
