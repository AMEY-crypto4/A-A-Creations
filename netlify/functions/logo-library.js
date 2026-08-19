// A&A Creations — Logo Library API
// Backed by Netlify Blobs. Saves logos generated in the Logo Generator tool
// so they're not lost when the tab closes — a real library you can revisit
// per client, not just a one-off generator.

const { getStore } = require("@netlify/blobs");

const STORE = "aa-logos";
const KEY = "all-logos";

async function loadAll() {
  const store = getStore({ name: STORE, consistency: "strong" });
  const data = await store.get(KEY, { type: "json" });
  return data || [];
}
async function saveAll(logos) {
  const store = getStore({ name: STORE, consistency: "strong" });
  await store.setJSON(KEY, logos);
}

exports.handler = async (event) => {
  const headers = { "Content-Type": "application/json" };

  try {
    if (event.httpMethod === "GET") {
      const logos = await loadAll();
      logos.sort((a, b) => (b.createdAt || "").localeCompare(a.createdAt || ""));
      return { statusCode: 200, headers, body: JSON.stringify({ logos }) };
    }

    if (event.httpMethod === "POST") {
      const body = JSON.parse(event.body || "{}");
      if (!body.businessName || !body.svg) {
        return { statusCode: 400, headers, body: JSON.stringify({ error: "businessName and svg are required" }) };
      }
      const logos = await loadAll();
      const logo = {
        id: `logo_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
        businessName: body.businessName,
        style: body.style || "",
        primaryColor: body.primaryColor || "",
        accentColor: body.accentColor || "",
        svg: body.svg,
        leadId: body.leadId || null,
        createdAt: new Date().toISOString(),
      };
      logos.push(logo);
      await saveAll(logos);
      return { statusCode: 200, headers, body: JSON.stringify({ ok: true, logo }) };
    }

    if (event.httpMethod === "DELETE") {
      const id = (event.queryStringParameters || {}).id;
      if (!id) return { statusCode: 400, headers, body: JSON.stringify({ error: "id is required" }) };
      const logos = await loadAll();
      const filtered = logos.filter((l) => l.id !== id);
      await saveAll(filtered);
      return { statusCode: 200, headers, body: JSON.stringify({ ok: true, remaining: filtered.length }) };
    }

    return { statusCode: 405, headers, body: JSON.stringify({ error: "Method not allowed" }) };
  } catch (err) {
    return { statusCode: 500, headers, body: JSON.stringify({ error: err.message || String(err) }) };
  }
};
