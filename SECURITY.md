# Security policy

## Scope
`land-deal-lab` is a static, browser-only tool. It has no server and does not upload your inputs by default. The only thing saved in the browser is your language choice (`localStorage`). Some pages put your inputs into the URL hash so a result can be shared; anyone with that link, and your browser history, can see them, so treat shared links as containing your data.
The **Send to Cashflow Survival** button also navigates to another GitHub Pages site with your assumptions (price, budget, schedule, overhead, land payment) in the URL query string; they may appear in browser history and server logs.
If an optional AI layer exists, the user pastes their own API key (kept in memory only, never written to storage). Enabling it sends the entered text and computed results to `api.anthropic.com`; leave it off for confidential data.

## Reporting a vulnerability
Please open a private report through GitHub: **Security → Report a vulnerability**.
Do not post exploit details in a public issue. You will get a first reply within 5 working days.

## Data in this repository
All sample data is fictional. Do not commit real customer, finance, HR or credential data. If you find any by mistake, report it as above and it will be removed.
