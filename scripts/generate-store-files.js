/**
 * Builds the one-file download pages for the extensions: each opens in any
 * browser and sends the visitor to the Chrome Web Store listing. For stores
 * that can only deliver a file. Output goes to promo/store-files/, which the
 * deploy workflow does not publish, and nothing on the site links to it.
 *
 *   cd tools && npm run store-files
 */
const fs=require('fs'),path=require('path');
const ROOT=path.resolve(__dirname,'..');
const OUT=path.join(ROOT,'promo','store-files');
fs.mkdirSync(OUT,{recursive:true});
const EXT=[
 {k:'webinspect',n:'WebInspect',id:'mpeiggffhbfefciphcnabijnmiajcljk',a:'#a78bfa',b:'#8b5cf6',rgb:'167, 139, 250',t:'Understand any website at a glance. Technology, SEO, accessibility, performance, mobile readiness and security, all checked in your browser.'},
 {k:'webguard',n:'WebGuard',id:'hgckccgcmbclkjhdccnphbpbljlcdimd',a:'#38bdf8',b:'#0ea5e9',rgb:'56, 189, 248',t:'Spot the fake before you type. Checks the page you are on for the signs of phishing and warns you before you share sensitive details.'},
 {k:'siteextract',n:'SiteExtract',id:'napeljfpcmnpphenaajmjpblidjnghfb',a:'#fb923c',b:'#f97316',rgb:'251, 146, 60',t:'Turn the page you are viewing into a clean, editable starter project: HTML, CSS, images, fonts and design tokens in one ZIP.'},
 {k:'shopinspect',n:'ShopInspect',id:'ldkkldeeepomlnpccmmjglopfoghhbjj',a:'#2dd4bf',b:'#14b8a6',rgb:'45, 212, 191',t:'Inspect a product before you buy it. Whether the discount adds up, what buyers complained about, who is selling it and what the listing leaves out.'}
];
const icon=k=>'data:image/png;base64,'+fs.readFileSync(path.join(ROOT,'assets',k,'icon-128.png')).toString('base64');
const store=e=>`https://chromewebstore.google.com/detail/${e.k}-by-elevven11/${e.id}?utm_source=anvilstore`;
const vars=e=>e?`--accent:${e.a};--accent2:${e.b};--rgb:${e.rgb};`:'';
const css=`
:root{color-scheme:dark;--bg:#0b0a10;--bg2:#131019;--text:#f7f3ec;--muted:#a79f95;--line:rgba(247,243,236,.1);--dots:rgba(247,243,236,.09);--accent:#86efac;--accent2:#22c55e;--rgb:134,239,172;--on:#0b0a10;--card:linear-gradient(145deg,rgba(19,16,25,.8),rgba(28,24,38,.5));--shadow:0 8px 32px rgba(0,0,0,.37);--link:var(--accent)}
@media (prefers-color-scheme:light){:root{color-scheme:light;--bg:#f4f1ea;--bg2:#eae6db;--text:#14121a;--muted:#5d564b;--line:rgba(20,18,26,.12);--dots:rgba(20,18,26,.07);--card:linear-gradient(145deg,rgba(255,255,255,.85),rgba(234,230,219,.6));--shadow:0 8px 32px rgba(20,18,26,.1);--link:#14121a}}
*{box-sizing:border-box;margin:0;padding:0}
body{min-height:100vh;display:flex;flex-direction:column;align-items:center;padding:32px 20px;background:var(--bg);background-image:radial-gradient(var(--dots) 1.5px,transparent 1.5px);background-size:28px 28px;color:var(--text);font:16px/1.6 Outfit,system-ui,-apple-system,"Segoe UI",Roboto,sans-serif;-webkit-font-smoothing:antialiased}
.wrap{width:100%;max-width:560px}
.brand{display:block;text-align:center;margin:8px 0 28px;font-size:1.25rem;font-weight:800;letter-spacing:.5px;text-decoration:none;background:linear-gradient(135deg,#86efac,#22c55e);-webkit-background-clip:text;background-clip:text;-webkit-text-fill-color:transparent}
.card{position:relative;background:var(--card);border:1px solid var(--line);border-radius:16px;padding:32px;box-shadow:var(--shadow);overflow:hidden}
.card::before{content:"";position:absolute;inset:0 0 auto 0;height:3px;background:linear-gradient(90deg,var(--accent),var(--accent2))}
.card+.card{margin-top:20px}
.tag{display:inline-block;margin-bottom:16px;font-size:.75rem;font-weight:700;letter-spacing:2px;text-transform:uppercase;color:var(--link)}
.row{display:flex;gap:16px;align-items:center;margin-bottom:12px}
img{width:64px;height:64px;flex-shrink:0;border-radius:14px}
h1,h2{font-weight:800;line-height:1.2}
h1{font-size:1.9rem}
h2{font-size:1.4rem}
p{color:var(--muted)}
.lead{margin:0 0 24px}
.btn{display:inline-block;padding:14px 28px;border-radius:30px;background:linear-gradient(135deg,var(--accent),var(--accent2));color:var(--on);font-weight:700;text-decoration:none;box-shadow:0 0 15px rgba(var(--rgb),.35);transition:transform .2s ease,box-shadow .2s ease}
.btn:hover{transform:translateY(-2px);box-shadow:0 0 25px rgba(var(--rgb),.6)}
a:focus-visible{outline:2px solid var(--text);outline-offset:3px}
.meta{margin-top:20px;font-size:.9rem;color:var(--muted)}
.meta a{color:var(--text);text-decoration-color:rgba(var(--rgb),.7);text-underline-offset:3px}
.foot{margin-top:28px;text-align:center;font-size:.85rem;color:var(--muted)}
.foot a{color:var(--text)}
@media (max-width:480px){.card{padding:24px}h1{font-size:1.6rem}.btn{display:block;text-align:center}}
`;
const page=(title,vs,body)=>`<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${title}</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Outfit:wght@400;600;700;800&display=swap">
<style>${css}</style>
</head>
<body style="${vs}">
<div class="wrap">
<a class="brand" href="https://elevven11studio.github.io/">ELEVVEN11 STUDIO</a>
${body}
<p class="foot">Free. Works in Chrome, Edge, Brave and Opera.</p>
</div>
</body>
</html>
`;
const one=e=>page(`${e.n} by Elevven11 Studio`,vars(e),`<main class="card">
<span class="tag">Chrome extension</span>
<div class="row"><img src="${icon(e.k)}" alt="" width="64" height="64"><h1>${e.n}</h1></div>
<p class="lead">${e.t}</p>
<a class="btn" href="${store(e)}">Add to Chrome</a>
<p class="meta"><a href="https://elevven11studio.github.io/${e.k}/">Learn more</a> &nbsp;·&nbsp; <a href="https://elevven11studio.github.io/${e.k}/privacy/">Privacy</a></p>
</main>`);
for(const e of EXT) fs.writeFileSync(path.join(OUT,`Get-${e.n}.html`),one(e));
const all=page('Free extensions by Elevven11 Studio','',EXT.map(e=>`<section class="card" style="${vars(e)}">
<div class="row"><img src="${icon(e.k)}" alt="" width="64" height="64"><h2>${e.n}</h2></div>
<p class="lead">${e.t}</p>
<a class="btn" href="${store(e)}">Add to Chrome</a>
</section>`).join('\n')+`\n<p class="foot"><a href="https://elevven11studio.github.io/extensions/">See all extensions</a></p>`);
fs.writeFileSync(path.join(OUT,'Elevven11-Free-Extensions.html'),all);
console.log(fs.readdirSync(OUT).join(', '));
