// A&A Creations — Lead Finder (serverless version)
// Runs server-side on Netlify so the Google Places API key stays secret.
// Mirrors the logic in lead_finder.py, but parallelized to fit Netlify's
// ~10 second function timeout on the free tier.
// Results are also persisted into Netlify Blobs so leads accumulate across
// searches instead of disappearing when you close the page.

const { getStore } = require("@netlify/blobs");

const LEADS_STORE = "aa-leads";
const LEADS_KEY = "all-leads";

async function loadAllLeads() {
  const store = getStore({ name: LEADS_STORE, consistency: "strong" });
  const data = await store.get(LEADS_KEY, { type: "json" });
  return data || [];
}

async function saveAllLeads(leads) {
  const store = getStore({ name: LEADS_STORE, consistency: "strong" });
  await store.setJSON(LEADS_KEY, leads);
}

// Merge freshly-found leads into the persistent store.
// - New leads are added with status "New"
// - Leads seen before are refreshed (score/signals/website) but KEEP their
//   existing status — a repeat search should never un-mark a lead you
//   already contacted back to "New"
async function mergeIntoStore(freshLeads) {
  const existing = await loadAllLeads();
  const byId = new Map(existing.map((l) => [l.id, l]));
  const now = new Date().toISOString();

  for (const lead of freshLeads) {
    const prior = byId.get(lead.id);
    if (prior) {
      byId.set(lead.id, { ...prior, ...lead, status: prior.status, lastSeenAt: now });
    } else {
      byId.set(lead.id, { ...lead, status: "New", foundAt: now, lastSeenAt: now });
    }
  }

  const merged = Array.from(byId.values());
  await saveAllLeads(merged);
  return merged;
}


const PLATFORM_MAP = [
  [["restaurant", "cafe", "coffee", "bakery", "food", "dining", "dhaba", "bar"], "Zomato, Swiggy, Google Business"],
  [["hotel", "lodge", "resort", "guest house", "homestay", "hostel"], "MakeMyTrip, Goibibo, Booking.com, Google Business"],
  [["salon", "spa", "beauty", "parlour", "parlor"], "Urban Company, Justdial, Google Business"],
  [["plumber", "electrician", "carpenter", "repair", "home service", "handyman", "ac service", "pest control"], "Urban Company, Justdial, Sulekha"],
  [["doctor", "clinic", "dentist", "physio", "hospital", "diagnostic"], "Practo, Justdial, Google Business"],
  [["gym", "fitness", "yoga", "trainer"], "Justdial, Google Business, Instagram"],
  [["retail", "boutique", "shop", "store", "clothing", "jewellery", "jewelry"], "Instagram Shop, WhatsApp Catalog, Google Business"],
  [["school", "tutor", "coaching", "institute", "academy"], "Justdial, Google Business, UrbanPro"],
];

function suggestPlatforms(query) {
  const q = query.toLowerCase();
  for (const [keywords, platforms] of PLATFORM_MAP) {
    if (keywords.some((k) => q.includes(k))) return platforms;
  }
  return "Justdial, IndiaMART, Google Business";
}

const FREE_BUILDER_DOMAINS = [
  "wixsite.com", "weebly.com", "business.site", "sites.google.com",
  "godaddysites.com", "square.site", "webs.com", "yolasite.com",
  "jimdofree.com", "webnode.com", "strikingly.com", "carrd.co",
  "blogspot.com", "wordpress.com",
];

const USER_AGENT = "AA-Creations-LeadFinder/1.0 (+contact: hello@aacreations.com)";

// Fetch with a hard timeout so one slow/dead site can't blow the whole function's budget
async function fetchWithTimeout(url, options = {}, timeoutMs = 4000) {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const res = await fetch(url, { ...options, signal: controller.signal });
    return res;
  } finally {
    clearTimeout(id);
  }
}

async function analyzeWebsite(url) {
  const signals = [];
  let score = 0;

  if (!url) {
    return { score: 0, signals: ["no website listed — hot lead for a full build or platform onboarding"] };
  }

  let parsed;
  try {
    parsed = new URL(url);
  } catch {
    return { score: 20, signals: ["invalid/malformed website URL on listing"] };
  }

  const domain = parsed.hostname.toLowerCase();
  for (const builder of FREE_BUILDER_DOMAINS) {
    if (domain.includes(builder)) {
      score += 25;
      signals.push(`hosted on free builder (${builder})`);
      break;
    }
  }
  if (parsed.protocol !== "https:") {
    score += 15;
    signals.push("no SSL (http:// only)");
  }

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

  if (!htmlLower.includes('name="viewport"') && !htmlLower.includes("name='viewport'")) {
    score += 20;
    signals.push("no mobile viewport meta tag (likely not mobile-friendly)");
  }
  const tableCount = (htmlLower.match(/<table/g) || []).length;
  if (tableCount >= 3) {
    score += 15;
    signals.push(`table-based layout detected (${tableCount} <table> tags)`);
  }
  const internalLinks = (htmlLower.match(/href=['"](?:\.\/|\/(?!\/)|#)/g) || []).length;
  if (internalLinks <= 3) {
    score += 15;
    signals.push("very few internal links (likely a single-page site)");
  }
  const textOnly = html.replace(/<[^>]+>/g, " ");
  const wordCount = textOnly.split(/\s+/).filter(Boolean).length;
  if (wordCount < 150) {
    score += 10;
    signals.push(`very little content (${wordCount} words on homepage)`);
  }
  const yearMatches = [...htmlLower.matchAll(/(?:©|copyright)\D{0,6}(20\d{2})/g)].map((m) => parseInt(m[1]));
  if (yearMatches.length) {
    const oldest = Math.min(...yearMatches);
    if (oldest <= 2019) {
      score += 10;
      signals.push(`footer copyright year is ${oldest}`);
    }
  }
  if (!htmlLower.includes('rel="icon"') && !htmlLower.includes('rel="shortcut icon"')) {
    score += 5;
    signals.push("no favicon set");
  }
  if (htmlLower.includes("<frameset") || htmlLower.includes(".swf")) {
    score += 20;
    signals.push("uses frames or Flash — very outdated");
  }

  return { score: Math.min(score, 100), signals };
}

async function googleTextSearch(query, location, apiKey, maxResults) {
  const url = `https://maps.googleapis.com/maps/api/place/textsearch/json?query=${encodeURIComponent(query + " in " + location)}&key=${apiKey}`;
  const resp = await fetchWithTimeout(url, {}, 5000);
  const data = await resp.json();
  if (data.status !== "OK" && data.status !== "ZERO_RESULTS") {
    throw new Error(`Google API status: ${data.status} — ${data.error_message || ""}`);
  }
  return (data.results || []).slice(0, maxResults);
}

async function getPlaceDetails(placeId, apiKey) {
  const fields = "formatted_phone_number,website,name,formatted_address,rating,user_ratings_total";
  const url = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${placeId}&fields=${fields}&key=${apiKey}`;
  const resp = await fetchWithTimeout(url, {}, 4000);
  const data = await resp.json();
  return data.result || {};
}

exports.handler = async (event) => {
  const headers = { "Content-Type": "application/json" };

  const apiKey = process.env.GOOGLE_PLACES_API_KEY;
  if (!apiKey) {
    return { statusCode: 500, headers, body: JSON.stringify({ error: "GOOGLE_PLACES_API_KEY is not set on this Netlify site. Add it under Site settings -> Environment variables, then redeploy." }) };
  }

  const params = event.queryStringParameters || {};
  const query = (params.query || "").trim();
  const location = (params.location || "Mumbai, India").trim();
  const maxResults = Math.min(parseInt(params.max_results || "15", 10), 20); // capped for function timeout safety

  if (!query) {
    return { statusCode: 400, headers, body: JSON.stringify({ error: "Missing 'query' parameter." }) };
  }

  try {
    const places = await googleTextSearch(query, location, apiKey, maxResults);

    const platforms = suggestPlatforms(query);

    const detailResults = await Promise.all(
      places.map((p) => getPlaceDetails(p.place_id, apiKey).catch(() => ({})))
    );

    const leads = await Promise.all(
      detailResults.map(async (details, i) => {
        const place = places[i];
        const name = details.name || place.name || "Unknown";
        const website = details.website || "";
        const { score, signals } = await analyzeWebsite(website);
        return {
          id: place.place_id,
          name,
          category: query,
          address: details.formatted_address || place.formatted_address || "",
          phone: details.formatted_phone_number || "",
          website,
          rating: details.rating || null,
          reviewCount: details.user_ratings_total || null,
          score,
          signals,
          suggestedPlatforms: website ? "" : platforms,
        };
      })
    );

    leads.sort((a, b) => b.score - a.score);

    // Persist into the accumulating database — failures here shouldn't break
    // the search response itself, just log and continue.
    let storedCount = leads.length;
    try {
      const merged = await mergeIntoStore(leads);
      storedCount = merged.length;
    } catch (storeErr) {
      console.error("Failed to save to Netlify Blobs store:", storeErr.message);
    }

    return { statusCode: 200, headers, body: JSON.stringify({ leads, count: leads.length, totalStored: storedCount }) };
  } catch (err) {
    return { statusCode: 500, headers, body: JSON.stringify({ error: err.message || String(err) }) };
  }
};
