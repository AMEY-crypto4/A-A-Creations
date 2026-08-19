// A&A Creations — Leads Database API
// Backed by Netlify Blobs. Serves the accumulated lead list built up by
// find-leads.js across every search you've ever run, and lets you update
// a lead's status (New / Contacted / Interested / Converted / Not Interested)
// or delete one, without ever losing the rest of the database.

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

const VALID_STATUSES = ["New", "Contacted", "Interested", "Converted", "Not Interested"];

exports.handler = async (event) => {
  const headers = { "Content-Type": "application/json" };

  try {
    if (event.httpMethod === "GET") {
      const leads = await loadAllLeads();
      const params = event.queryStringParameters || {};
      let filtered = leads;

      if (params.category) {
        filtered = filtered.filter(
          (l) => l.category.toLowerCase() === params.category.toLowerCase()
        );
      }
      if (params.status) {
        filtered = filtered.filter((l) => l.status === params.status);
      }
      if (params.no_website === "true") {
        filtered = filtered.filter((l) => !l.website);
      }
      if (params.min_score) {
        const min = parseInt(params.min_score, 10);
        filtered = filtered.filter((l) => l.score >= min);
      }

      filtered.sort((a, b) => b.score - a.score);

      const categories = [...new Set(leads.map((l) => l.category))];
      const stats = {
        total: leads.length,
        noWebsite: leads.filter((l) => !l.website).length,
        byStatus: VALID_STATUSES.reduce((acc, s) => {
          acc[s] = leads.filter((l) => l.status === s).length;
          return acc;
        }, {}),
        categories,
      };

      return { statusCode: 200, headers, body: JSON.stringify({ leads: filtered, stats }) };
    }

    if (event.httpMethod === "POST") {
      const body = JSON.parse(event.body || "{}");
      const { id, status } = body;

      if (!id || !status) {
        return { statusCode: 400, headers, body: JSON.stringify({ error: "id and status are required" }) };
      }
      if (!VALID_STATUSES.includes(status)) {
        return { statusCode: 400, headers, body: JSON.stringify({ error: `status must be one of: ${VALID_STATUSES.join(", ")}` }) };
      }

      const leads = await loadAllLeads();
      const idx = leads.findIndex((l) => l.id === id);
      if (idx === -1) {
        return { statusCode: 404, headers, body: JSON.stringify({ error: "Lead not found" }) };
      }
      leads[idx].status = status;
      leads[idx].statusUpdatedAt = new Date().toISOString();
      await saveAllLeads(leads);

      return { statusCode: 200, headers, body: JSON.stringify({ ok: true, lead: leads[idx] }) };
    }

    if (event.httpMethod === "DELETE") {
      const params = event.queryStringParameters || {};
      const id = params.id;
      if (!id) {
        return { statusCode: 400, headers, body: JSON.stringify({ error: "id query parameter is required" }) };
      }
      const leads = await loadAllLeads();
      const filtered = leads.filter((l) => l.id !== id);
      await saveAllLeads(filtered);
      return { statusCode: 200, headers, body: JSON.stringify({ ok: true, remaining: filtered.length }) };
    }

    return { statusCode: 405, headers, body: JSON.stringify({ error: "Method not allowed" }) };
  } catch (err) {
    return { statusCode: 500, headers, body: JSON.stringify({ error: err.message || String(err) }) };
  }
};
