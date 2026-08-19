// A&A Creations — Competitor Snapshot API
// Scores a single URL on demand, using the exact same tested logic as the
// Lead Finder. Built for sales conversations: "here's what your competitor
// is doing that you're not" — no search, no storage, just point at a URL.

const { analyzeWebsite } = require("./lib/website-analyzer");

exports.handler = async (event) => {
  const headers = { "Content-Type": "application/json" };

  const params = event.queryStringParameters || {};
  let url = (params.url || "").trim();

  if (!url) {
    return { statusCode: 400, headers, body: JSON.stringify({ error: "Missing 'url' parameter." }) };
  }
  if (!/^https?:\/\//i.test(url)) {
    url = "https://" + url;
  }

  try {
    const { score, signals } = await analyzeWebsite(url);
    let verdict;
    if (score >= 60) verdict = "Seriously outdated — a clear, easy pitch";
    else if (score >= 35) verdict = "Showing real age — worth a conversation";
    else if (score >= 15) verdict = "Mostly solid, a few gaps";
    else verdict = "Genuinely well put together";

    return { statusCode: 200, headers, body: JSON.stringify({ url, score, signals, verdict }) };
  } catch (err) {
    return { statusCode: 500, headers, body: JSON.stringify({ error: err.message || String(err) }) };
  }
};
