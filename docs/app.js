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
 assume: ["الافتراضات", "Assumptions"], hassume: ["كل الفلوس بالجنيه (M = مليون). المدد بالشهور إلا لو مكتوب سنة. النسب بتتكتب كنسبة مئوية. اضغط على (؟) جنب أي خانة لشرح بسيط.", "All money in EGP (M = million). Durations are in months unless it says years. Rates are percentages. Click (?) next to any field for a short explanation."],
 reset: ["رجّع الافتراضي", "Reset"], pdf: ["تقرير PDF", "PDF report"],
 g_project: ["المشروع", "Project"], g_price: ["الأسعار والتكلفة", "Prices & costs"], g_time: ["التوقيت (بالشهور)", "Timing (in months)"],
 g_plan: ["خطة سداد العميل", "Customer payment plan"], g_fin: ["التمويل والمستهدف", "Finance & target"], g_land: ["شروط دفع الأرض (شروطك)", "Land payment (your terms)"],
 land_area: ["مساحة الأرض", "Land area"], far: ["معامل البناء (FAR)", "Floor-area ratio (FAR)"], efficiency: ["كفاءة المساحة البيعية", "Sellable efficiency"],
 price_sqm: ["سعر بيع المتر البيعي", "Sale price per sellable m²"], cost_sqm: ["تكلفة بناء المتر", "Build cost per built m²"], soft_pct: ["تكاليف تصميم وإشراف", "Design & supervision (soft costs)"],
 contingency_pct: ["احتياطي طوارئ", "Contingency"], sales_pct: ["مبيعات وتسويق", "Sales & marketing"], overhead_m: ["مصاريف ثابتة", "Fixed overhead"],
 start_delay: ["المدة حتى بدء الإنشاء", "Time until construction starts"], build: ["مدة الإنشاء", "Construction duration"], launch: ["المدة حتى بدء البيع", "Time until sales launch"], sales_months: ["مدة بيع كل الوحدات", "Time to sell everything"],
 plan_down: ["مقدم العميل", "Customer down payment"], plan_months: ["مدة تقسيط العميل", "Customer instalment period"],
 discount: ["معدل الخصم", "Discount rate"], price_growth: ["نمو الأسعار", "Price growth"], cost_infl: ["تضخم التكلفة", "Cost inflation"], target_margin: ["هامش الربح المستهدف", "Target margin"],
 land_mode: ["طريقة دفع الأرض", "Land payment"], cash: ["كاش", "Cash"], installments: ["أقساط", "Instalments"],
 land_down: ["مقدم الأرض", "Land down payment"], land_years: ["مدة أقساط الأرض", "Land instalment period"], land_per_year: ["عدد الدفعات في السنة", "Payments per year"], land_grace_years: ["فترة سماح الأرض", "Land grace period"],
 s_parcels: ["مقارنة قطع الأراضي", "Compare parcels"], h_parcels: ["اكتب مساحة وسعر كل قطعة. الخانات الفاضية بتاخد قيم الافتراضات.", "Enter each parcel's area and ask. Blank cells use the assumptions."],
 name: ["القطعة", "Parcel"], ask: ["سعر الأرض المطلوب (جنيه)", "Asking price (EGP)"], area: ["المساحة (م²)", "Area (m²)"], sqm: ["سعر البيع (جنيه/م²)", "Sale price (EGP/m²)"], farc: ["معامل البناء (×)", "FAR (×)"],
 rank: ["الترتيب", "Rank"], maxbid: ["أقصى سعر (مليون جنيه)", "Max bid (EGP M)"], maxm2: ["أقصى سعر/م² أرض (جنيه)", "Max bid/land m² (EGP)"], askm2: ["المطلوب/م² أرض (جنيه)", "Ask/land m² (EGP)"], marg: ["هامش عند المطلوب (%)", "Margin at ask (%)"], irr: ["العائد السنوي IRR (%)", "Project IRR (%)"], verdict: ["القرار", "Verdict"],
 within: ["داخل الميزانية", "Within budget"], over: ["أعلى من الحد بـ ", "Over by "], noask: ["بدون سعر مطلوب", "No ask given"], infeasible: ["مش مجدي حتى بسعر أرض صفر", "Not viable even at zero land price"],
 s_break: ["تفكيك أقصى سعر", "Where the bid comes from"], h_break: ["كل الأرقام بالقيمة الحالية (مخصومة شهريا). اختار القطعة:", "All figures are present values (discounted monthly). Pick the parcel:"],
 b_rev: ["إيراد (قيمة حالية)", "Revenue (PV)"], b_con: ["البناء والتصميم والاحتياطي", "Construction, soft & contingency"], b_sales: ["مبيعات وتسويق", "Sales & marketing"], b_over: ["مصاريف ثابتة", "Overhead"],
 b_profit: ["الربح المستهدف", "Target profit"], b_land: ["المتاح للأرض (قيمة حالية)", "Available for land (PV)"],
 static: ["الحساب التقليدي بدون توقيت: ", "Textbook residual without timing: "], timing: ["الحساب مع التوقيت (كاش): ", "Timing-aware (cash): "],
 s_struct: ["أثر هيكل دفع الأرض", "Land payment structure"], h_struct: ["نفس الاقتصاد بالظبط، لكن السعر المعلن اللي تقدر تقبله بيزيد كل ما الدفع يتأجل. ركّز على القيمة الحالية مش الرقم المعلن.", "Same economics, but the headline price you can accept rises as payment is deferred. Judge by present value, not the headline."],
 sname: ["الهيكل", "Structure"], factor: ["قيمة الجنيه الحالية (جنيه)", "PV per 1 EGP (EGP)"], hl: ["أقصى سعر معلن (مليون جنيه)", "Max headline price (EGP M)"],
 st_cash: ["كاش", "Cash"], st_1: ["20% مقدم + 3 سنين سنوي", "20% down + 3y annual"], st_2: ["10% مقدم + 5 سنين نصف سنوي", "10% down + 5y semi-annual"], st_3: ["10% مقدم + 5 سنين نصف سنوي + سنة سماح", "10% + 5y semi-annual + 1y grace"], st_you: ["شروطك (من الجانب)", "Your terms (sidebar)"],
 s_jv: ["صفقة مع صاحب الأرض: كاش ولا حصة ولا مقايضة؟", "Landowner deal: cash, revenue share or barter?"],
 h_jv: ["المالك عنده سعر كاش يرضى بيه. الأداة بتقولك أنهي حصة (من الإيراد أو من المساحة) تساويه، وأقصى حصة تقدر تدفعها وتفضل محقق هدفك.", "The owner has a cash price he would accept. The tool finds the share (of revenue or area) that equals it for him, and the most you can give while still hitting your target."],
 j_owner: ["سعر المالك الكاش (جنيه)", "Owner's cash price (EGP)"], j_share: ["حصة إيراد معروضة (%)", "Offered revenue share (%)"], j_barter: ["حصة مساحة معروضة (%)", "Offered area share (%)"], j_hair: ["خصم قيمة وحدات المالك (%)", "Haircut on owner's units (%)"],
 j_col: ["الخيار", "Option"], j_opv: ["قيمة المالك الحالية (مليون جنيه)", "Owner PV (EGP M)"], j_dp: ["ربح المطور الحالي (مليون جنيه)", "Developer profit PV (EGP M)"], j_dm: ["هامش المطور (%)", "Developer margin (%)"], j_ok: ["يحقق الهدف؟", "Meets target?"],
 j_cash: ["كاش", "Cash"], j_rs: ["حصة إيراد", "Revenue share"], j_ba: ["مقايضة مساحة", "Area barter"],
 zone_s: ["حصة الإيراد", "Revenue share"], zone_b: ["حصة المساحة", "Area share"], z_ok: ["مساحة اتفاق من ", "Zone of agreement: "], z_to: [" إلى ", " to "], z_mid: [" — المنتصف ", " — midpoint "],
 z_no: ["مفيش مساحة اتفاق: المالك محتاج أكتر من اللي تقدر تدفعه وتحقق هدفك.", "No zone of agreement: the owner needs more than you can give and still hit your target."],
 yes: ["نعم", "Yes"], no: ["لا", "No"],
 s_sens: ["الحساسية", "Sensitivity"], h_sens: ["أثر تغيير كل عامل ±20% على أقصى سعر للمتر. الأحمر = السعر بينزل.", "Effect of moving each driver ±20% on the max bid per m². Red = bid falls."],
 hm_t: ["خريطة: أقصى سعر/م² حسب سعر البيع وتكلفة البناء", "Map: max bid/m² by sale price and build cost"], hm_h: ["الأخضر = تقدر تدفع السعر المطلوب. الأحمر = لا.", "Green = you can afford the asking price. Red = you cannot."],
 rows: ["سعر البيع ↓ / تكلفة البناء → (جنيه/م²)", "Sale price ↓ / build cost → (EGP/m²)"],
 foot: ["مفتوح المصدر (MIT). محرك بايثون هو المرجع وهذه الصفحة نسخة JS مطابقة بالاختبارات. أرقام وهمية فقط.", "Open source (MIT). The Python engine is the reference; this page is a JS port verified by tests. Fictional numbers only."],
 bad: ["مدخلات غير صالحة: ", "Invalid input: "], prepared: ["افتراضات التقرير", "Report assumptions"]
};
var DRV = { price_sqm: ["سعر البيع", "Sale price"], cost_sqm: ["تكلفة البناء", "Build cost"], efficiency: ["كفاءة المساحة", "Efficiency"], far: ["معامل البناء", "FAR"], discount: ["معدل الخصم", "Discount rate"],
  sales_months: ["مدة البيع", "Sell-out months"], plan_months: ["تقسيط العميل", "Customer plan months"], target_margin: ["الهامش المستهدف", "Target margin"], build: ["مدة الإنشاء", "Build months"] };
function t(k) { return T[k][lang === "ar" ? 0 : 1]; }
var UNIT = {
 land_area: ["م²", "m²"], far: ["م² مباني لكل 1 م² أرض", "built m² per 1 land m²"], efficiency: ["% من المباني", "% of built area"],
 price_sqm: ["جنيه / م² بيعي", "EGP / sellable m²"], cost_sqm: ["جنيه / م² مباني", "EGP / built m²"], soft_pct: ["% من تكلفة البناء", "% of build cost"],
 contingency_pct: ["% من تكلفة البناء", "% of build cost"], sales_pct: ["% من الإيراد", "% of revenue"], overhead_m: ["جنيه / شهر", "EGP / month"],
 start_delay: ["شهر من النهارده", "months from today"], build: ["شهر (مش سنين)", "months (not years)"], launch: ["شهر من النهارده", "months from today"], sales_months: ["شهر", "months"],
 plan_down: ["% من سعر الوحدة", "% of unit price"], plan_months: ["شهر (أقساط شهرية)", "months (monthly payments)"],
 discount: ["% في السنة", "% per year"], price_growth: ["% في السنة", "% per year"], cost_infl: ["% في السنة", "% per year"], target_margin: ["% من الإيراد", "% of revenue"],
 land_down: ["% من سعر الأرض", "% of land price"], land_years: ["سنة (مش شهور)", "years (not months)"], land_per_year: ["دفعة في السنة", "payments per year"], land_grace_years: ["سنة (مش شهور)", "years (not months)"]
};
var HELP = {
 land_area: ["إجمالي مساحة قطعة الأرض بالمتر المربع زي ما في العقد أو الكروكي.", "Total plot size in square metres, as in the contract or survey."],
 far: ["كام متر مباني مسموح تبنيها على كل متر أرض (من اشتراطات البناء). مثال: 1.2 يعني أرض 1000 م² = 1200 م² مباني.", "Built area allowed per metre of land (from planning rules). Example: 1.2 means a 1,000 m² plot allows 1,200 m² of building."],
 efficiency: ["النسبة اللي بتتباع فعلاً من المباني. الباقي سلالم ومداخل وخدمات. 82% يعني من كل 100 م² مباني، 82 م² للبيع.", "Share of the built area you can actually sell; the rest is stairs, lobbies, services. 82% means 82 of every 100 built m² are sellable."],
 price_sqm: ["سعر بيع المتر البيعي النهارده بالجنيه. الأداة بتزوده تلقائي بنسبة نمو الأسعار لكل شهر بيع.", "Today's sale price per sellable metre in EGP. The tool raises it by the price growth rate for later sales."],
 cost_sqm: ["تكلفة تنفيذ المتر المباني النهارده بالجنيه، من غير الأرض ولا التصميم. بتزيد بتضخم التكلفة.", "Today's construction cost per built metre in EGP, excluding land and design. It rises with cost inflation."],
 soft_pct: ["تكاليف التصميم والإشراف والتراخيص، نسبة بتتضاف فوق تكلفة البناء.", "Design, supervision and permit costs, added on top of the build cost as a percentage."],
 contingency_pct: ["احتياطي للمفاجآت في التنفيذ، نسبة بتتضاف فوق تكلفة البناء.", "Reserve for execution surprises, added on top of the build cost as a percentage."],
 sales_pct: ["عمولات ومصاريف التسويق كنسبة من قيمة كل بيعة.", "Commissions and marketing as a percentage of every sale value."],
 overhead_m: ["مصاريف شركتك الثابتة كل شهر (مرتبات، إيجار، ...) طول فترة المشروع النشطة، بالجنيه.", "Your company's fixed monthly costs (salaries, rent, ...) for the active life of the project, in EGP."],
 start_delay: ["عدد الشهور من النهارده لحد بداية التنفيذ الفعلي (ترخيص، تصميم، حفر).", "Months from today until real construction begins (permits, design, excavation)."],
 build: ["مدة التنفيذ بالشهور. 28 يعني سنتين وأربع شهور. اكتب شهور مش سنين.", "Construction duration in months. 28 means two years and four months. Enter months, not years."],
 launch: ["عدد الشهور من النهارده لحد أول بيع.", "Months from today until the first sale."],
 sales_months: ["المدة اللي هتبيع فيها كل الوحدات بالشهور. المبيعات بتتوزع بالتساوي عليها.", "How many months it takes to sell everything. Sales are spread evenly across it."],
 plan_down: ["اللي العميل بيدفعه وقت الحجز كنسبة من سعر الوحدة.", "What the customer pays at booking, as a percentage of the unit price."],
 plan_months: ["المدة اللي العميل بيقسط فيها الباقي بأقساط شهرية متساوية، بالشهور. صفر يعني دفع كامل.", "How long the customer pays the rest in equal monthly instalments, in months. Zero means paying in full."],
 discount: ["تكلفة فلوسك أو العائد اللي كنت هتاخده في بديل. بيحوّل فلوس المستقبل لقيمتها النهارده. 20% يعني جنيه بعد سنة قيمته حوالي 0.83 جنيه النهارده.", "Your cost of money or the return of the next-best use. It converts future cash into today's value. At 20%, 1 EGP in a year is worth about 0.83 today."],
 price_growth: ["الزيادة المتوقعة في سعر البيع كل سنة. اللي بيتباع متأخر بيتباع بسعر أعلى.", "Expected yearly rise in sale prices. Later sales are made at higher prices."],
 cost_infl: ["الزيادة المتوقعة في تكلفة البناء كل سنة. اللي بيتنفذ متأخر بيتكلف أكتر.", "Expected yearly rise in build cost. Work done later costs more."],
 target_margin: ["الربح اللي عايز تحققه كنسبة من إجمالي الإيراد قبل ما تقبل الصفقة. الأرض بتاخد اللي فاضل بعد التكاليف والربح ده.", "Profit you want as a share of total revenue before accepting the deal. Land gets whatever is left after costs and this profit."],
 land_mode: ["هتدفع ثمن الأرض كاش مرة واحدة ولا بأقساط. التقسيط بيخلي السعر المعلن أعلى لنفس القيمة الفعلية.", "Pay for the land in one cash payment or by instalments. Instalments raise the headline price for the same real value."],
 land_down: ["اللي هتدفعه لصاحب الأرض عند التعاقد كنسبة من سعر الأرض. الباقي أقساط.", "What you pay the landowner at signing, as a percentage of the land price. The rest is paid in instalments."],
 land_years: ["عدد سنين تقسيط باقي ثمن الأرض (سنين مش شهور).", "Years over which the rest of the land price is paid (years, not months)."],
 land_per_year: ["كام دفعة في السنة: 1 سنوي، 2 نصف سنوي، 4 ربع سنوي، 12 شهري.", "Payments per year: 1 annual, 2 semi-annual, 4 quarterly, 12 monthly."],
 land_grace_years: ["سنين من غير أقساط بعد المقدم قبل أول قسط، بالسنين.", "Years after the down payment with no instalments before the first one, in years."],
 name: ["اسم تعريفي للقطعة بس.", "Just a label for the parcel."],
 ask: ["السعر اللي صاحب الأرض طالبه فيها بالجنيه (إجمالي مش للمتر). سيبه فاضي لو لسه مفيش سعر.", "The total price the landowner asks, in EGP (not per metre). Leave blank if there is no ask yet."],
 area: ["مساحة القطعة بالمتر المربع. لو فاضي بياخد مساحة الافتراضات.", "Plot area in m². Blank uses the assumptions value."],
 sqm: ["سعر بيع المتر البيعي في المنطقة دي بالجنيه. لو فاضي بياخد الافتراضات.", "Sale price per sellable m² for this parcel in EGP. Blank uses the assumptions value."],
 farc: ["معامل البناء المسموح للقطعة دي. لو فاضي بياخد الافتراضات.", "Allowed FAR for this parcel. Blank uses the assumptions value."],
 rank: ["ترتيب القطع من الأحسن للأضعف حسب الفرق بين أقصى سعر تقدر تدفعه والسعر المطلوب.", "Parcels ranked from best to weakest by how far the max bid exceeds the asking price."],
 maxbid: ["أقصى سعر تقدر تدفعه في الأرض وتفضل محقق هامش الربح المستهدف. بالمليون جنيه (M).", "The most you can pay for the land and still hit your target margin. In EGP millions (M)."],
 maxm2: ["أقصى سعر مقسوم على مساحة الأرض، بالجنيه لكل م² أرض.", "Max bid divided by land area, in EGP per land m²."],
 askm2: ["السعر المطلوب مقسوم على مساحة الأرض، بالجنيه لكل م² أرض.", "Asking price divided by land area, in EGP per land m²."],
 marg: ["الربح كنسبة من الإيراد لو اشتريت بالسعر المطلوب. قارنه بالهامش المستهدف.", "Profit as a share of revenue if you buy at the asking price. Compare it with your target margin."],
 irr: ["العائد السنوي على تدفقات المشروع لو اشتريت بالسعر المطلوب.", "Yearly return on project cash flows if you buy at the asking price."],
 verdict: ["داخل الميزانية = السعر المطلوب أقل من أقصى سعر. أعلى من الحد = هتخسر من هامشك المستهدف.", "Within budget = the ask is below your max bid. Over = the deal misses your target margin."],
 factor: ["قيمة الجنيه المدفوع بالهيكل ده بالنسبة لجنيه كاش النهارده. أقل من 1 يعني التأجيل بيريحك.", "Present value of 1 EGP of land price under this structure vs 1 EGP cash today. Below 1 means deferral helps you."],
 hl: ["أقصى سعر معلن تقدر تقبله بالهيكل ده. بيزيد مع التأجيل لكن قيمته الحالية ثابتة تقريباً.", "Highest headline price you can accept under this structure. It grows with deferral while its present value stays similar."],
 j_owner: ["السعر الكاش اللي صاحب الأرض هيرضى بيه، بالجنيه. لو فاضي بياخد سعر القطعة المطلوب.", "The cash price the landowner would accept, in EGP. Blank uses the parcel's ask."],
 j_share: ["نسبة من إيراد المبيعات هتديها للمالك بدل الكاش، بالنسبة المئوية.", "Share of sales revenue you would give the owner instead of cash, in percent."],
 j_barter: ["نسبة من المساحة البيعية هتديها للمالك وحدات بدل الكاش، بالنسبة المئوية.", "Share of the sellable area you would give the owner in units instead of cash, in percent."],
 j_hair: ["خصم على قيمة وحدات المالك لو هو هيبيعها بأقل من سعرك (مثلاً لأنه مش هيقدر يسوقها)، بالنسبة المئوية.", "Discount on the value of the owner's units if he would sell below your price (for example no marketing reach), in percent."],
 j_opv: ["قيمة اللي المالك هياخده بالقيمة الحالية بمعدل خصمك، بالمليون جنيه.", "What the owner receives, in present value at your discount rate, in EGP millions."],
 j_dp: ["ربحك بالقيمة الحالية بعد اللي هتديه للمالك، بالمليون جنيه.", "Your profit in present value after paying the owner, in EGP millions."],
 j_dm: ["ربحك كنسبة من الإيراد. لازم يوصل للهامش المستهدف.", "Your profit as a share of revenue. It should reach your target margin."],
 j_ok: ["نعم = الخيار ده بيحقق هامشك المستهدف.", "Yes = this option still meets your target margin."]
};
var tipEl = null, tipBtn = null;
function hideTip() { if (tipEl) { tipEl.remove(); tipEl = null; tipBtn = null; } }
function showTip(btn, text) {
  hideTip(); tipBtn = btn;
  tipEl = el("div", { class: "tip noprint", role: "tooltip", text: text }); document.body.appendChild(tipEl);
  var r = btn.getBoundingClientRect(), w = Math.min(280, window.innerWidth - 16); tipEl.style.width = w + "px";
  var left = Math.max(8, Math.min(window.innerWidth - w - 8, r.left + r.width / 2 - w / 2));
  tipEl.style.left = left + "px"; tipEl.style.top = (r.bottom + window.scrollY + 6) + "px";
}
function qbtn(key) {
  var h = HELP[key]; if (!h) return null;
  var txt = h[lang === "ar" ? 0 : 1], pinned = false;
  var b = el("button", { type: "button", class: "q noprint", "aria-label": lang === "ar" ? "شرح" : "Help" }, [lang === "ar" ? "؟" : "?"]);
  b.onclick = function (e) { e.preventDefault(); e.stopPropagation(); if (tipBtn === b && pinned) { pinned = false; hideTip(); } else { pinned = true; showTip(b, txt); } };
  b.onmouseenter = function () { if (!tipEl) showTip(b, txt); };
  b.onmouseleave = function () { if (!pinned) hideTip(); };
  b.onblur = function () { pinned = false; hideTip(); };
  return b;
}
document.addEventListener("click", function () { hideTip(); });
document.addEventListener("keydown", function (e) { if (e.key === "Escape") hideTip(); });
function unitOf(k) { return UNIT[k] ? UNIT[k][lang === "ar" ? 0 : 1] : ""; }
function lbl(k) { // label + (?) + unit badge
  var kids = [el("b", { class: "lt", text: t(k) }), qbtn(k)];
  if (unitOf(k)) kids.push(el("small", { class: "un", text: unitOf(k) }));
  return el("span", { class: "lb" }, kids);
}
function th(k, cls) { var kids = [t(k)]; var q = qbtn(k); if (q) kids.push(" ", q); return el("th", { class: cls || "" }, kids); }

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
      root.appendChild(el("label", { class: "f" }, [lbl(k), inp]));
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
  var tbl = el("table", {}, [el("tr", {}, ["name", "area", "ask", "sqm", "farc"].map(function (h) { return th(h); }))]);
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

  function jin(key, label) { var inp = el("input", { value: jvIn[key], inputmode: "decimal", oninput: function () { jvIn[key] = inp.value; update(); } }); if (key === "owner") inp.placeholder = "= ask"; return el("label", {}, [el("span", { class: "lb" }, [el("b", { class: "lt", text: label }), qbtn("j_" + key)]), inp]); }
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
    kv.appendChild(el("div", {}, [el("b", {}, [bdi(String(s))]), el("span", { text: t(k) + (unitOf(k) ? " · " + unitOf(k) : "") })]));
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
  var tbl = el("table", {}, [el("tr", {}, ["rank", "name", "maxbid", "maxm2", "askm2", "marg", "irr", "verdict"].map(function (h, i) { return th(h, i > 1 && i < 7 ? "n" : ""); }))]);
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
  var tbl = el("table", {}, [el("tr", {}, [el("th", { text: t("sname") }), th("factor", "n"), th("hl", "n"), th("maxm2", "n"), el("th", { class: "n", text: "Δ vs cash" })])]);
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
    var tbl = el("table", {}, [el("tr", {}, [el("th", { text: t("j_col") }), th("j_opv", "n"), th("j_dp", "n"), th("j_dm", "n"), th("j_ok")])]);
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
