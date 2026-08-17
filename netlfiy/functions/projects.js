// A&A Creations — Projects Dashboard API
// Replaces the old Claude-artifact dashboard.html with a real backend on
// your own site — accessible from any browser you're logged into, not
// tied to a Claude session.

const { getStore } = require("@netlify/blobs");

const STORE = "aa-projects";
const KEY = "all-projects";
const VALID_STATUSES = ["Lead", "Audit Sent", "Quoted", "Deposit Paid", "In Progress", "Review", "Delivered", "Fully Paid", "Lost"];

async function loadAll() {
  const store = getStore({ name: STORE, consistency: "strong" });
  const data = await store.get(KEY, { type: "json" });
  return data || [];
}
async function saveAll(projects) {
  const store = getStore({ name: STORE, consistency: "strong" });
  await store.setJSON(KEY, projects);
}

exports.handler = async (event) => {
  const headers = { "Content-Type": "application/json" };

  try {
    if (event.httpMethod === "GET") {
      const projects = await loadAll();
      const active = projects.filter((p) => !["Fully Paid", "Lost"].includes(p.status));
      const stats = {
        total: projects.length,
        activeCount: active.length,
        pipelineValue: active.reduce((s, p) => s + (Number(p.price) || 0), 0),
        paidValue: projects.filter((p) => p.status === "Fully Paid").reduce((s, p) => s + (Number(p.price) || 0), 0),
      };
      return { statusCode: 200, headers, body: JSON.stringify({ projects, stats }) };
    }

    if (event.httpMethod === "POST") {
      const body = JSON.parse(event.body || "{}");
      const projects = await loadAll();

      if (body.id) {
        const idx = projects.findIndex((p) => p.id === body.id);
        if (idx === -1) return { statusCode: 404, headers, body: JSON.stringify({ error: "Project not found" }) };
        if (body.status && !VALID_STATUSES.includes(body.status)) {
          return { statusCode: 400, headers, body: JSON.stringify({ error: `status must be one of: ${VALID_STATUSES.join(", ")}` }) };
        }
        projects[idx] = { ...projects[idx], ...body, updatedAt: new Date().toISOString() };
        await saveAll(projects);
        return { statusCode: 200, headers, body: JSON.stringify({ ok: true, project: projects[idx] }) };
      }

      if (!body.client) {
        return { statusCode: 400, headers, body: JSON.stringify({ error: "client name is required" }) };
      }
      const project = {
        id: `proj_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
        client: body.client,
        contact: body.contact || "",
        package: body.package || "Starter",
        price: body.price || 0,
        status: VALID_STATUSES.includes(body.status) ? body.status : "Lead",
        leadId: body.leadId || null,
        notes: body.notes || "",
        created: body.created || new Date().toISOString().slice(0, 10),
        due: body.due || "",
        createdAt: new Date().toISOString(),
      };
      projects.push(project);
      await saveAll(projects);
      return { statusCode: 200, headers, body: JSON.stringify({ ok: true, project }) };
    }

    if (event.httpMethod === "DELETE") {
      const id = (event.queryStringParameters || {}).id;
      if (!id) return { statusCode: 400, headers, body: JSON.stringify({ error: "id is required" }) };
      const projects = await loadAll();
      const filtered = projects.filter((p) => p.id !== id);
      await saveAll(filtered);
      return { statusCode: 200, headers, body: JSON.stringify({ ok: true, remaining: filtered.length }) };
    }

    return { statusCode: 405, headers, body: JSON.stringify({ error: "Method not allowed" }) };
  } catch (err) {
    return { statusCode: 500, headers, body: JSON.stringify({ error: err.message || String(err) }) };
  }
};
