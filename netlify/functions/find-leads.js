// A&A Creations — Lead Finder (Google Places API)
// Runs server-side on Netlify so the Google Places API key stays secret.
// Set GOOGLE_PLACES_API_KEY under Site configuration -> Environment variables.

const { getStore } = require("@netlify/blobs");
const { analyzeWebsite, fetchWithTimeout } = require("./lib/website-analyzer");

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
    return { statusCode: 500, headers, body: JSON.stringify({ error: "GOOGLE_PLACES_API_KEY is not set on this Netlify site. Add it under Site configuration -> Environment variables, then redeploy." }) };
  }

  const params = event.queryStringParameters || {};
  const query = (params.query || "").trim();
  const location = (params.location || "Mumbai, India").trim();
  const maxResults = Math.min(parseInt(params.max_results || "15", 10), 20);

  if (!query) {
    return { statusCode: 400, headers, body: JSON.stringify({ error: "Missing 'query' parameter." }) };
  }

  try {
    const places = await googleTextSearch(query, location, apiKey, maxResults);
    const platforms = suggestPlatforms(query);

    const detailResults = await Promise.all(places.map((p) => getPlaceDetails(p.place_id, apiKey).catch(() => ({}))));

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
