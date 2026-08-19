// A&A Creations — Review Response Templates API
// Backed by Netlify Blobs. Ships with a solid default library (editable in
// the UI) plus lets you save your own custom templates per platform/scenario.

const { getStore } = require("@netlify/blobs");

const STORE = "aa-review-templates";
const KEY = "custom-templates";

async function loadCustom() {
  const store = getStore({ name: STORE, consistency: "strong" });
  const data = await store.get(KEY, { type: "json" });
  return data || [];
}
async function saveCustom(templates) {
  const store = getStore({ name: STORE, consistency: "strong" });
  await store.setJSON(KEY, templates);
}

exports.handler = async (event) => {
  const headers = { "Content-Type": "application/json" };

  try {
    if (event.httpMethod === "GET") {
      const templates = await loadCustom();
      return { statusCode: 200, headers, body: JSON.stringify({ templates }) };
    }

    if (event.httpMethod === "POST") {
      const body = JSON.parse(event.body || "{}");
      if (!body.platform || !body.scenario || !body.text) {
        return { statusCode: 400, headers, body: JSON.stringify({ error: "platform, scenario, and text are required" }) };
      }
      const templates = await loadCustom();
      const template = {
        id: `tmpl_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
        platform: body.platform,
        scenario: body.scenario,
        text: body.text,
        createdAt: new Date().toISOString(),
      };
      templates.push(template);
      await saveCustom(templates);
      return { statusCode: 200, headers, body: JSON.stringify({ ok: true, template }) };
    }

    if (event.httpMethod === "DELETE") {
      const id = (event.queryStringParameters || {}).id;
      if (!id) return { statusCode: 400, headers, body: JSON.stringify({ error: "id is required" }) };
      const templates = await loadCustom();
      const filtered = templates.filter((t) => t.id !== id);
      await saveCustom(filtered);
      return { statusCode: 200, headers, body: JSON.stringify({ ok: true, remaining: filtered.length }) };
    }

    return { statusCode: 405, headers, body: JSON.stringify({ error: "Method not allowed" }) };
  } catch (err) {
    return { statusCode: 500, headers, body: JSON.stringify({ error: err.message || String(err) }) };
  }
};
