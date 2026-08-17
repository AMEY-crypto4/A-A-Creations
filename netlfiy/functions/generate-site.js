// A&A Creations — Site Generator API
// POST a site-spec JSON, get back a ready-to-deploy zip of a complete
// client website. This is the "enterprise module" endpoint — the actual
// production tool, not a demo.

const JSZip = require("jszip");
const { buildSite } = require("./lib/build-engine");
const { listCategories } = require("./lib/site-templates");

exports.handler = async (event) => {
  const headers = { "Content-Type": "application/json" };

  if (event.httpMethod === "GET") {
    // Lets the frontend populate the category dropdown from the same
    // source of truth the engine uses — no duplicated lists to keep in sync.
    return { statusCode: 200, headers, body: JSON.stringify({ categories: listCategories() }) };
  }

  if (event.httpMethod !== "POST") {
    return { statusCode: 405, headers, body: JSON.stringify({ error: "Method not allowed" }) };
  }

  let spec;
  try {
    spec = JSON.parse(event.body || "{}");
  } catch (e) {
    return { statusCode: 400, headers, body: JSON.stringify({ error: "Invalid JSON body" }) };
  }

  const result = buildSite(spec);
  if (result.errors && result.errors.length) {
    return { statusCode: 400, headers, body: JSON.stringify({ error: result.errors.join("; ") }) };
  }

  // Preview mode: return the generated HTML directly (as JSON) so the
  // frontend can render it in an iframe before committing to a download —
  // uses the exact same engine, so what you preview is what you get.
  const params = event.queryStringParameters || {};
  if (params.preview === "true") {
    return { statusCode: 200, headers, body: JSON.stringify({ files: result.files }) };
  }

  try {
    const zip = new JSZip();
    for (const [filename, content] of Object.entries(result.files)) {
      zip.file(filename, content);
    }
    const zipBuffer = await zip.generateAsync({ type: "nodebuffer", compression: "DEFLATE" });

    return {
      statusCode: 200,
      headers: {
        "Content-Type": "application/zip",
        "Content-Disposition": `attachment; filename="${(spec.businessName || "site").replace(/[^a-z0-9]+/gi, "-").replace(/^-+|-+$/g, "").toLowerCase()}-website.zip"`,
      },
      body: zipBuffer.toString("base64"),
      isBase64Encoded: true,
    };
  } catch (err) {
    return { statusCode: 500, headers, body: JSON.stringify({ error: "Failed to build zip: " + err.message }) };
  }
};
