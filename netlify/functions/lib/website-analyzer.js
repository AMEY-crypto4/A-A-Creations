// A&A Creations — Website Analyzer
// The same outdated-website scoring logic used by the Lead Finder, extracted
// so it can be reused by any tool that needs to score a single URL on
// demand (Competitor Snapshot) without duplicating — and re-testing —
// the same logic twice.

const FREE_BUILDER_DOMAINS = ["wixsite.com", "weebly.com", "business.site", "sites.google.com", "godaddysites.com", "square.site", "webs.com", "yolasite.com", "jimdofree.com", "webnode.com", "strikingly.com", "carrd.co", "blogspot.com", "wordpress.com"];
const USER_AGENT = "AA-Creations-WebsiteAnalyzer/1.0 (+contact: aacreations114119201@gmail.com)";

async function fetchWithTimeout(url, options = {}, timeoutMs = 4000) {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeoutMs);
  try {
    return await fetch(url, { ...options, signal: controller.signal });
  } finally {
    clearTimeout(id);
  }
}

async function analyzeWebsite(url) {
  const signals = [];
  let score = 0;
  if (!url) return { score: 0, signals: ["no website listed — hot lead for a full build or platform onboarding"] };

  let parsed;
  try { parsed = new URL(url); } catch { return { score: 20, signals: ["invalid/malformed website URL on listing"] }; }

  const domain = parsed.hostname.toLowerCase();
  for (const builder of FREE_BUILDER_DOMAINS) {
    if (domain.includes(builder)) { score += 25; signals.push(`hosted on free builder (${builder})`); break; }
  }
  if (parsed.protocol !== "https:") { score += 15; signals.push("no SSL (http:// only)"); }

  let html = "";
  try {
    const resp = await fetchWithTimeout(url, { headers: { "User-Agent": USER_AGENT } }, 4000);
    html = await resp.text();
  } catch (e) {
    signals.push("site did not load in time — possibly dead/slow/expired domain");
    score += 20;
    return { score: Math.min(score, 100), signals };
  }

  const htmlLower = html.toLowerCase();
  if (!htmlLower.includes('name="viewport"') && !htmlLower.includes("name='viewport'")) { score += 20; signals.push("no mobile viewport meta tag (likely not mobile-friendly)"); }
  const tableCount = (htmlLower.match(/<table/g) || []).length;
  if (tableCount >= 3) { score += 15; signals.push(`table-based layout detected (${tableCount} <table> tags)`); }
  const internalLinks = (htmlLower.match(/href=['"](?:\.\/|\/(?!\/)|#)/g) || []).length;
  if (internalLinks <= 3) { score += 15; signals.push("very few internal links (likely a single-page site)"); }
  const textOnly = html.replace(/<[^>]+>/g, " ");
  const wordCount = textOnly.split(/\s+/).filter(Boolean).length;
  if (wordCount < 150) { score += 10; signals.push(`very little content (${wordCount} words on homepage)`); }
  const yearMatches = [...htmlLower.matchAll(/(?:©|copyright)\D{0,6}(20\d{2})/g)].map((m) => parseInt(m[1]));
  if (yearMatches.length) {
    const oldest = Math.min(...yearMatches);
    if (oldest <= 2019) { score += 10; signals.push(`footer copyright year is ${oldest}`); }
  }
  if (!htmlLower.includes('rel="icon"') && !htmlLower.includes('rel="shortcut icon"')) { score += 5; signals.push("no favicon set"); }
  if (htmlLower.includes("<frameset") || htmlLower.includes(".swf")) { score += 20; signals.push("uses frames or Flash — very outdated"); }

  return { score: Math.min(score, 100), signals };
}

module.exports = { analyzeWebsite, fetchWithTimeout, FREE_BUILDER_DOMAINS, USER_AGENT };
