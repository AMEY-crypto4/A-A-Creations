const fs = require('fs');
const path = require('path');

const DIR = __dirname;

const TOOLS = [
  {id:'jig-starter-kit', title:'A&A Creations', cat:'core', icon:'🏠', blurb:'Freelance pitch page — live demo tools, pricing, outreach scripts.'},
  {id:'jig-console', title:'A&A Console', cat:'core', icon:'🧭', blurb:'Quote calculator, lead tracker, client relationship view, AI review replies.'},
  {id:'aa-invoice', title:'A&A Invoice', cat:'core', icon:'🧾', blurb:'Line items, saved clients, invoice history, print-to-PDF.'},
  {id:'aa-proposal', title:'A&A Proposal', cat:'core', icon:'📄', blurb:'Scope, timeline, pricing tiers, FAQ, case studies, print-to-PDF.'},
  {id:'aa-agreement', title:'A&A Agreement', cat:'core', icon:'📜', blurb:'13-clause service agreement generator, print-to-PDF.'},

  {id:'resume-studio', title:'Resume Studio', cat:'career', icon:'📄', blurb:'Resume tailoring, cover letters, LinkedIn content, interview prep.'},
  {id:'study-guide-studio', title:'Study Guide Studio', cat:'career', icon:'📚', blurb:'Summarizer, flashcards, quizzes, lesson plans, study schedule.'},
  {id:'client-onboarding-studio', title:'Client Onboarding Studio', cat:'career', icon:'🤝', blurb:'Welcome emails, intake forms, timelines, new-client FAQ.'},

  {id:'copywriting-studio', title:'Copywriting Studio', cat:'marketing', icon:'✍️', blurb:'Landing pages, ad copy, email campaigns, product descriptions.'},
  {id:'local-seo-studio', title:'Local SEO Studio', cat:'marketing', icon:'📍', blurb:'Google Business posts, area pages, content calendar, FAQ, reviews.'},
  {id:'email-flow-studio', title:'Email Flow Studio', cat:'marketing', icon:'✉️', blurb:'Welcome, cart recovery, win-back sequences, segmentation, subject lines.'},
  {id:'creator-management-studio', title:'Creator Management Studio', cat:'marketing', icon:'✨', blurb:'Content calendar, caption batches, engagement replies, brand pitches.'},
  {id:'podcast-clip-studio', title:'Podcast Clip Studio', cat:'marketing', icon:'🎙️', blurb:'Highlight finder, clip captions, title/hook lab.'},
  {id:'caption-subtitle-studio', title:'Caption Subtitle Studio', cat:'marketing', icon:'💬', blurb:'Transcript cleanup, SRT formatter, social caption chunking.'},
  {id:'ad-performance-studio', title:'Ad Performance Studio', cat:'marketing', icon:'📊', blurb:'Real CTR/CPC/CPA/ROAS calculator plus AI diagnosis.'},

  {id:'automation-blueprint-studio', title:'Automation Blueprint Studio', cat:'consulting', icon:'⚙️', blurb:'Process audit, automation recipes, real ROI calculator, client report.'},
  {id:'prompt-consultancy-studio', title:'Prompt Consultancy Studio', cat:'consulting', icon:'🔮', blurb:'Prompt auditor, structured prompt builder, prompt library generator.'},
  {id:'pricing-strategy-studio', title:'Pricing Strategy Studio', cat:'consulting', icon:'💲', blurb:'Competitor position, pricing model, price-increase calculator, tiers.'},
  {id:'analytics-insights-studio', title:'Analytics Insights Studio', cat:'consulting', icon:'📈', blurb:'Traffic reports, funnel calculator, month-over-month comparison.'},
  {id:'data-quality-studio', title:'Data Quality Studio', cat:'consulting', icon:'🧹', blurb:'Data quality audit plus a real Python cleaning script generator.'},
  {id:'contract-scanner-studio', title:'Contract Scanner Studio', cat:'consulting', icon:'📑', blurb:'Contract red-flag scanner, ranked by severity.'},
  {id:'shopify-blueprint-studio', title:'Shopify Blueprint Studio', cat:'consulting', icon:'🛍️', blurb:'Store audit prioritized by impact, app-category recommender.'},
  {id:'grant-writing-studio', title:'Grant Writing Studio', cat:'consulting', icon:'📋', blurb:'Fit checker, needs statement, narrative, budget, outcomes, LOI.'},

  {id:'travel-planner-studio', title:'Travel Planner Studio', cat:'lifestyle', icon:'✈️', blurb:'Itinerary builder, packing list, budget allocator, local tips.'},
  {id:'meal-plan-studio', title:'Meal Plan Studio', cat:'lifestyle', icon:'🍴', blurb:'Weekly meal plans, recipe expander, grocery list.'},
  {id:'personal-shopper-studio', title:'Personal Shopper Studio', cat:'lifestyle', icon:'🎁', blurb:'Gift finder, style capsule builder, registry list, budget allocator.'},
  {id:'budget-planner-studio', title:'Budget Planner Studio', cat:'lifestyle', icon:'💵', blurb:'Real 50/30/20 budget builder plus spending suggestions.'},
  {id:'property-valuation-studio', title:'Property Valuation Studio', cat:'lifestyle', icon:'🏠', blurb:'Comps-based $/sqft calculator plus AI market commentary.'},
  {id:'translation-studio', title:'Translation Studio', cat:'lifestyle', icon:'🌐', blurb:'Draft translation, back-translation QA check, tone notes.'},
  {id:'ebook-publishing-studio', title:'E-book Publishing Studio', cat:'lifestyle', icon:'📖', blurb:'Niche validator, outline builder, chapter drafter, KDP checklist.'},

  {id:'image-brief-studio', title:'Image Brief Studio', cat:'creative', icon:'🎨', blurb:'Prompts for avatars, POD, NFT, staging, game assets, interiors, maps.'},
  {id:'audio-brief-studio', title:'Audio Brief Studio', cat:'creative', icon:'🎵', blurb:'Music briefs, voiceover scripts, sound design, audiobook narration.'},
  {id:'video-brief-studio', title:'Video Brief Studio', cat:'creative', icon:'🎬', blurb:'Faceless scripts, spokesperson scripts, VFX, color grade, restoration.'},
];

const CATEGORIES = [
  {id:'core', name:'Core Business Suite'},
  {id:'career', name:'Career & Client Ops'},
  {id:'marketing', name:'Marketing & Content'},
  {id:'consulting', name:'Consulting & Analytics'},
  {id:'lifestyle', name:'Lifestyle & Personal Services'},
  {id:'creative', name:'Creative Direction Briefs'},
];

const BUNDLES = [
  {id:'local', name:'Local Service Business', audience:'cleaners, contractors, home-service shops', price:'$299 one-time or $49/mo', tools:['jig-starter-kit','jig-console','aa-invoice','aa-proposal','aa-agreement','local-seo-studio','client-onboarding-studio']},
  {id:'career', name:'Freelancer Career Starter', audience:'job seekers, new freelancers', price:'$79 one-time', tools:['resume-studio','client-onboarding-studio','budget-planner-studio']},
  {id:'creator', name:'Content Creator & Podcaster', audience:'YouTubers, podcasters, influencers', price:'$199 one-time or $29/mo', tools:['copywriting-studio','creator-management-studio','podcast-clip-studio','caption-subtitle-studio','video-brief-studio','audio-brief-studio','image-brief-studio']},
  {id:'marketing', name:'Marketing Freelancer / Agency', audience:'ad managers, SEO freelancers', price:'$249 one-time or $39/mo', tools:['copywriting-studio','email-flow-studio','ad-performance-studio','local-seo-studio','pricing-strategy-studio','analytics-insights-studio']},
  {id:'consultant', name:'Business Consultant / Analyst', audience:'ops & data consultants', price:'$299 one-time or $49/mo', tools:['automation-blueprint-studio','prompt-consultancy-studio','pricing-strategy-studio','contract-scanner-studio','analytics-insights-studio','data-quality-studio','shopify-blueprint-studio','grant-writing-studio']},
  {id:'lifestyle', name:'Lifestyle & Concierge Services', audience:'personal assistants, planners', price:'$149 one-time', tools:['travel-planner-studio','meal-plan-studio','personal-shopper-studio','ebook-publishing-studio','translation-studio']},
];

function esc(s){ return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;'); }
function escAttr(s){ return String(s).replace(/&/g,'&amp;').replace(/"/g,'&quot;'); }

// ---------- read + sanitize each tool's source ----------
let embeddedBlocks = '';
let missing = [];
for(const t of TOOLS){
  const file = path.join(DIR, t.id + '.html');
  if(!fs.existsSync(file)){ missing.push(t.id); continue; }
  let raw = fs.readFileSync(file, 'utf8');
  // prevent the embedded </script> from closing our wrapper script tag
  raw = raw.replace(/<\/script/gi, '@@ENDSCRIPT@@');
  embeddedBlocks += `<script type="text/plain" id="src-${t.id}">${raw}</script>\n`;
}
if(missing.length){ console.error('MISSING FILES:', missing); process.exit(1); }

const toolsJson = JSON.stringify(TOOLS);
const categoriesJson = JSON.stringify(CATEGORIES);
const bundlesJson = JSON.stringify(BUNDLES);

const shell = `<title>A&amp;A Creations Suite</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,600;9..144,700;9..144,800&family=Work+Sans:wght@400;500;600;700&family=IBM+Plex+Mono:wght@400;500;600&display=swap" rel="stylesheet">
<style>
:root{
  --paper:oklch(0.97 0.006 250); --paper-raised:oklch(0.995 0.003 250);
  --sidebar:oklch(0.2 0.02 250); --sidebar-ink:oklch(0.96 0.006 250); --sidebar-dim:oklch(0.68 0.02 250); --sidebar-line:oklch(0.32 0.025 250);
  --ink:oklch(0.2 0.02 250); --ink-dim:oklch(0.46 0.015 250);
  --line:oklch(0.87 0.008 250); --line-strong:oklch(0.72 0.015 250);
  --accent:oklch(0.6 0.15 55); --accent-soft:oklch(0.6 0.15 55 / 0.12); --accent-ink:oklch(0.18 0.03 55);
  --good:oklch(0.5 0.12 150); --good-soft:oklch(0.5 0.12 150 / 0.13);
  --shadow:0 1px 2px oklch(0.2 0.02 250 / 0.08);
}
@media (prefers-color-scheme: dark){
  :root:not([data-theme="light"]){
    --paper:oklch(0.14 0.016 250); --paper-raised:oklch(0.19 0.018 250);
    --sidebar:oklch(0.1 0.014 250); --sidebar-ink:oklch(0.94 0.006 250); --sidebar-dim:oklch(0.6 0.018 250); --sidebar-line:oklch(0.24 0.02 250);
    --ink:oklch(0.94 0.008 250); --ink-dim:oklch(0.68 0.014 250);
    --line:oklch(0.32 0.02 250); --line-strong:oklch(0.42 0.026 250);
    --accent:oklch(0.72 0.14 55); --accent-soft:oklch(0.72 0.14 55 / 0.16); --accent-ink:oklch(0.16 0.03 55);
    --good:oklch(0.7 0.12 150); --good-soft:oklch(0.7 0.12 150 / 0.16);
    --shadow:0 1px 3px oklch(0 0 0 / 0.4);
  }
}
:root[data-theme="dark"]{
  --paper:oklch(0.14 0.016 250); --paper-raised:oklch(0.19 0.018 250);
  --sidebar:oklch(0.1 0.014 250); --sidebar-ink:oklch(0.94 0.006 250); --sidebar-dim:oklch(0.6 0.018 250); --sidebar-line:oklch(0.24 0.02 250);
  --ink:oklch(0.94 0.008 250); --ink-dim:oklch(0.68 0.014 250);
  --line:oklch(0.32 0.02 250); --line-strong:oklch(0.42 0.026 250);
  --accent:oklch(0.72 0.14 55); --accent-soft:oklch(0.72 0.14 55 / 0.16); --accent-ink:oklch(0.16 0.03 55);
  --good:oklch(0.7 0.12 150); --good-soft:oklch(0.7 0.12 150 / 0.16);
  --shadow:0 1px 3px oklch(0 0 0 / 0.4);
}
*{box-sizing:border-box}
body{margin:0;background:var(--paper);color:var(--ink);font-family:'Work Sans',system-ui,sans-serif;height:100vh;overflow:hidden}
h1,h2,h3{font-family:'Fraunces',georgia,serif;font-weight:700;margin:0;text-wrap:balance}
.mono{font-family:'IBM Plex Mono',monospace}
a{color:inherit}

.app{display:flex;height:100vh}

/* sidebar */
.sidebar{width:280px;flex-shrink:0;background:var(--sidebar);color:var(--sidebar-ink);display:flex;flex-direction:column;height:100vh}
.sidebar-brand{padding:18px 18px 14px;border-bottom:1px solid var(--sidebar-line);flex-shrink:0}
.sidebar-brand .mark{display:flex;align-items:center;gap:9px;margin-bottom:4px}
.sidebar-brand .mark span.box{width:28px;height:28px;background:var(--accent);color:var(--accent-ink);border-radius:6px;display:flex;align-items:center;justify-content:center;font-family:'Fraunces',serif;font-weight:700;font-size:14px}
.sidebar-brand .name{font-family:'Fraunces',serif;font-weight:700;font-size:16.5px}
.sidebar-brand .sub{font-size:10.5px;color:var(--sidebar-dim);font-family:'IBM Plex Mono',monospace;text-transform:uppercase;letter-spacing:.05em}

.bundle-select{padding:12px 14px;border-bottom:1px solid var(--sidebar-line);flex-shrink:0}
.bundle-select label{display:block;font-size:10px;text-transform:uppercase;letter-spacing:.05em;color:var(--sidebar-dim);margin-bottom:6px;font-weight:600}
.bundle-select select{width:100%;font-family:'Work Sans',sans-serif;font-size:12.5px;padding:8px 9px;border-radius:6px;border:1px solid var(--sidebar-line);background:oklch(0.22 0.02 250 / 0.5);color:var(--sidebar-ink)}
:root[data-theme="light"] .bundle-select select, :root:not([data-theme="dark"]) .bundle-select select{background:oklch(0.28 0.02 250)}
.bundle-note{font-size:10.5px;color:var(--sidebar-dim);margin-top:6px;line-height:1.5}

.nav-scroll{flex:1;overflow-y:auto;padding:10px 8px}
.nav-cat{font-size:10px;text-transform:uppercase;letter-spacing:.06em;color:var(--sidebar-dim);font-weight:700;padding:12px 10px 4px}
.nav-item{display:flex;align-items:center;gap:9px;width:100%;text-align:left;padding:8px 10px;border-radius:7px;background:none;border:0;color:var(--sidebar-ink);font-family:'Work Sans',sans-serif;font-size:12.5px;cursor:pointer;line-height:1.3}
.nav-item:hover{background:oklch(1 0 0 / 0.06)}
.nav-item.active{background:var(--accent);color:var(--accent-ink);font-weight:600}
.nav-item .ic{font-size:14px;flex-shrink:0}

.sidebar-foot{padding:12px 14px;border-top:1px solid var(--sidebar-line);font-size:10.5px;color:var(--sidebar-dim);flex-shrink:0;line-height:1.6}
.sidebar-foot .home-link{display:block;margin-bottom:8px;color:var(--sidebar-ink);font-weight:600;font-size:12px;cursor:pointer;text-decoration:none}
.sidebar-foot .home-link:hover{color:var(--accent)}

/* main */
.main{flex:1;display:flex;flex-direction:column;height:100vh;min-width:0}
.topbar{display:flex;align-items:center;justify-content:space-between;padding:14px 22px;border-bottom:1px solid var(--line);background:var(--paper-raised);flex-shrink:0}
.topbar h2{font-size:17px}
.topbar .desc{font-size:12px;color:var(--ink-dim);margin-top:2px}
.bundle-banner{display:none;align-items:center;gap:10px;padding:8px 22px;background:var(--accent-soft);font-size:12px;color:var(--accent-ink);flex-shrink:0}
.bundle-banner.show{display:flex}
.bundle-banner button{font-family:'Work Sans',sans-serif;font-size:11px;font-weight:600;padding:4px 10px;border-radius:14px;border:1px solid var(--accent);background:none;color:inherit;cursor:pointer}

.frame-wrap{flex:1;position:relative;background:var(--paper)}
iframe{position:absolute;inset:0;width:100%;height:100%;border:0}

/* dashboard/home */
.home{flex:1;overflow-y:auto;padding:36px 40px 60px}
.home-hero{max-width:760px;margin-bottom:8px}
.home-hero h1{font-size:clamp(28px,3.6vw,40px);line-height:1.05}
.home-hero p{font-size:14.5px;color:var(--ink-dim);margin-top:12px;line-height:1.6;max-width:64ch}
.home-stats{display:flex;gap:28px;margin:22px 0 38px;flex-wrap:wrap}
.home-stat .n{font-family:'IBM Plex Mono',monospace;font-size:26px;font-weight:600;color:var(--accent)}
.home-stat .l{font-size:11px;color:var(--ink-dim);text-transform:uppercase;letter-spacing:.05em;margin-top:2px}

.section-title{font-size:12px;text-transform:uppercase;letter-spacing:.06em;color:var(--ink-dim);font-family:'IBM Plex Mono',monospace;font-weight:600;margin:34px 0 16px;padding-bottom:8px;border-bottom:1px solid var(--line)}
.bundle-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(280px,1fr));gap:16px}
.bundle-card{background:var(--paper-raised);border:1px solid var(--line);border-radius:12px;padding:20px;box-shadow:var(--shadow);cursor:pointer;transition:transform .15s ease,box-shadow .15s ease}
.bundle-card:hover{transform:translateY(-2px);box-shadow:0 8px 20px oklch(0.2 0.03 250/0.12)}
.bundle-card h3{font-size:16px;margin-bottom:4px}
.bundle-card .audience{font-size:11.5px;color:var(--ink-dim);margin-bottom:10px}
.bundle-card .price{font-family:'IBM Plex Mono',monospace;font-size:13px;color:var(--accent);font-weight:600;margin-bottom:10px}
.bundle-card .count{font-size:11px;color:var(--ink-dim)}

.tool-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(230px,1fr));gap:12px}
.tool-card{display:flex;gap:11px;align-items:flex-start;background:var(--paper-raised);border:1px solid var(--line);border-radius:10px;padding:14px;cursor:pointer;transition:border-color .15s ease}
.tool-card:hover{border-color:var(--accent)}
.tool-card .ic{font-size:19px;flex-shrink:0}
.tool-card h4{font-size:13.5px;font-family:'Work Sans',sans-serif;font-weight:700;margin-bottom:3px}
.tool-card p{font-size:11.5px;color:var(--ink-dim);line-height:1.45;margin:0}

@media(max-width:820px){
  .sidebar{position:fixed;left:-280px;top:0;z-index:20;transition:left .2s ease;box-shadow:0 0 30px oklch(0 0 0/0.3)}
  .sidebar.open{left:0}
  .menu-btn{display:flex !important}
}
.menu-btn{display:none;align-items:center;justify-content:center;width:34px;height:34px;border-radius:7px;border:1px solid var(--line-strong);background:var(--paper-raised);color:var(--ink);cursor:pointer;font-size:16px;margin-right:10px}
</style>

<div class="app">
  <nav class="sidebar" id="sidebar">
    <div class="sidebar-brand">
      <div class="mark"><span class="box">A&amp;A</span><span class="name">A&amp;A Creations Suite</span></div>
      <div class="sub">33 tools · one product</div>
    </div>
    <div class="bundle-select">
      <label>Preview as a package</label>
      <select id="bundlePicker" onchange="onBundlePick(this.value)">
        <option value="">All 33 tools</option>
      </select>
      <div class="bundle-note" id="bundleNote"></div>
    </div>
    <div class="nav-scroll" id="navScroll"></div>
    <div class="sidebar-foot">
      <span class="home-link" onclick="goHome()">← Dashboard</span>
      A&amp;A Creations · 8454021541
    </div>
  </nav>

  <div class="main">
    <div class="topbar">
      <div style="display:flex;align-items:center">
        <button class="menu-btn" id="menuBtn" onclick="toggleSidebar()">☰</button>
        <div>
          <h2 id="topTitle">Dashboard</h2>
          <div class="desc" id="topDesc">Your full product, all in one place.</div>
        </div>
      </div>
    </div>
    <div class="bundle-banner" id="bundleBanner">
      <span id="bundleBannerText"></span>
      <button onclick="clearBundle()">Show all 33</button>
    </div>

    <div class="home" id="homeView">
      <div class="home-hero">
        <h1>Everything you built, in one product.</h1>
        <p>33 comprehensive tools, bundled behind one dashboard. Use the whole suite yourself, or pick a package below to show a smaller, relevant slice to a specific kind of client — each package is just a filtered view into the same underlying tools, so there's nothing extra to build or maintain per customer.</p>
      </div>
      <div class="home-stats">
        <div class="home-stat"><div class="n">33</div><div class="l">Tools</div></div>
        <div class="home-stat"><div class="n">6</div><div class="l">Sellable packages</div></div>
        <div class="home-stat"><div class="n">44/50</div><div class="l">Ledger ideas covered</div></div>
      </div>

      <div class="section-title">Packages to sell</div>
      <div class="bundle-grid" id="bundleGrid"></div>

      <div class="section-title">All tools</div>
      <div class="tool-grid" id="allToolsGrid"></div>
    </div>

    <div class="frame-wrap" id="frameWrap" style="display:none">
      <iframe id="toolFrame" title="Tool"></iframe>
    </div>
  </div>
</div>

<script>
const TOOLS = ${toolsJson};
const CATEGORIES = ${categoriesJson};
const BUNDLES = ${bundlesJson};

const toolMap = {};
TOOLS.forEach(t => toolMap[t.id] = t);

let activeBundle = null;
let activeTool = null;

function visibleToolIds(){
  if(!activeBundle) return TOOLS.map(t => t.id);
  const b = BUNDLES.find(b => b.id === activeBundle);
  return b ? b.tools : TOOLS.map(t => t.id);
}

function renderBundlePicker(){
  const sel = document.getElementById('bundlePicker');
  BUNDLES.forEach(b => {
    const opt = document.createElement('option');
    opt.value = b.id;
    opt.textContent = b.name + ' (' + b.tools.length + ')';
    sel.appendChild(opt);
  });
}

function renderNav(){
  const wrap = document.getElementById('navScroll');
  wrap.innerHTML = '';
  const visible = new Set(visibleToolIds());
  CATEGORIES.forEach(cat => {
    const toolsInCat = TOOLS.filter(t => t.cat === cat.id && visible.has(t.id));
    if(!toolsInCat.length) return;
    const h = document.createElement('div');
    h.className = 'nav-cat';
    h.textContent = cat.name;
    wrap.appendChild(h);
    toolsInCat.forEach(t => {
      const btn = document.createElement('button');
      btn.className = 'nav-item' + (activeTool === t.id ? ' active' : '');
      btn.innerHTML = '<span class="ic">' + t.icon + '</span><span>' + escapeHtml(t.title) + '</span>';
      btn.onclick = () => selectTool(t.id);
      wrap.appendChild(btn);
    });
  });
}

function escapeHtml(s){ return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;'); }

function renderHome(){
  const bGrid = document.getElementById('bundleGrid');
  bGrid.innerHTML = BUNDLES.map(b => \`
    <div class="bundle-card" onclick="onBundlePick('\${b.id}')">
      <h3>\${escapeHtml(b.name)}</h3>
      <div class="audience">For \${escapeHtml(b.audience)}</div>
      <div class="price">\${escapeHtml(b.price)}</div>
      <div class="count">\${b.tools.length} tools included</div>
    </div>
  \`).join('');

  const tGrid = document.getElementById('allToolsGrid');
  tGrid.innerHTML = TOOLS.map(t => \`
    <div class="tool-card" onclick="selectTool('\${t.id}')">
      <span class="ic">\${t.icon}</span>
      <div><h4>\${escapeHtml(t.title)}</h4><p>\${escapeHtml(t.blurb)}</p></div>
    </div>
  \`).join('');
}

function onBundlePick(id){
  activeBundle = id || null;
  document.getElementById('bundlePicker').value = id || '';
  const banner = document.getElementById('bundleBanner');
  const note = document.getElementById('bundleNote');
  if(activeBundle){
    const b = BUNDLES.find(x => x.id === activeBundle);
    banner.classList.add('show');
    document.getElementById('bundleBannerText').textContent = 'Previewing package: ' + b.name + ' — showing ' + b.tools.length + ' of 33 tools, as a customer of this package would see it.';
    note.textContent = 'For ' + b.audience + '.';
  } else {
    banner.classList.remove('show');
    note.textContent = '';
  }
  renderNav();
  // if current tool isn't in the new filtered set, go home
  if(activeTool && !visibleToolIds().includes(activeTool)){
    goHome();
  }
}
function clearBundle(){ onBundlePick(''); }

function goHome(){
  activeTool = null;
  document.getElementById('homeView').style.display = 'block';
  document.getElementById('frameWrap').style.display = 'none';
  document.getElementById('topTitle').textContent = 'Dashboard';
  document.getElementById('topDesc').textContent = 'Your full product, all in one place.';
  document.getElementById('toolFrame').srcdoc = '';
  renderNav();
  closeSidebarMobile();
}

function getToolSource(id){
  const el = document.getElementById('src-' + id);
  if(!el) return '<p style="font-family:sans-serif;padding:40px">Tool source not found.</p>';
  return el.textContent.split('@@ENDSCRIPT@@').join('<' + '/script');
}

function selectTool(id){
  const t = toolMap[id];
  if(!t) return;
  activeTool = id;
  document.getElementById('homeView').style.display = 'none';
  document.getElementById('frameWrap').style.display = 'block';
  document.getElementById('topTitle').textContent = t.icon + '  ' + t.title;
  document.getElementById('topDesc').textContent = t.blurb;
  document.getElementById('toolFrame').srcdoc = getToolSource(id);
  renderNav();
  closeSidebarMobile();
  window.scrollTo(0,0);
}

function toggleSidebar(){ document.getElementById('sidebar').classList.toggle('open'); }
function closeSidebarMobile(){ if(window.innerWidth <= 820) document.getElementById('sidebar').classList.remove('open'); }

renderBundlePicker();
renderNav();
renderHome();
</script>

${embeddedBlocks}`;

fs.writeFileSync(path.join(DIR, 'aa-product-hub.html'), shell, 'utf8');
console.log('Built aa-product-hub.html —', TOOLS.length, 'tools embedded, size:', (shell.length/1024).toFixed(0) + 'KB');
