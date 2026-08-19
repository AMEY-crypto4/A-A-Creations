// A&A Creations — Logo Generator Engine
// Pure functions: (spec) -> SVG string. Works in browser (window.LogoGen)
// and in Node (module.exports) so the exact same logic can be unit tested
// before it ever touches a real client's name.

(function (root, factory) {
  if (typeof module === "object" && module.exports) {
    module.exports = factory();
  } else {
    root.LogoGen = factory();
  }
})(typeof self !== "undefined" ? self : this, function () {

  function esc(str) {
    if (str === undefined || str === null) return "";
    return String(str).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
  }

  function getInitials(name) {
    const words = (name || "").trim().split(/\s+/).filter(Boolean);
    if (!words.length) return "A";
    if (words.length === 1) return words[0].slice(0, 2).toUpperCase();
    return (words[0][0] + words[1][0]).toUpperCase();
  }

  function firstLetter(name) {
    const trimmed = (name || "").trim();
    return trimmed ? trimmed[0].toUpperCase() : "A";
  }

  // Simple deterministic hash so "regenerate" style variety is stable per
  // name rather than random-every-time (useful for reproducing a chosen logo)
  function hashStr(str) {
    let h = 0;
    for (let i = 0; i < str.length; i++) {
      h = (h << 5) - h + str.charCodeAt(i);
      h |= 0;
    }
    return Math.abs(h);
  }

  const STYLES = {
    // 1. Monogram badge — initials in a rounded square, gradient fill
    "monogram-square": (spec) => {
      const initials = getInitials(spec.businessName);
      return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
  <defs><linearGradient id="g1" x1="0%" y1="100%" x2="100%" y2="0%">
    <stop offset="0%" stop-color="${spec.primaryColor}"/><stop offset="100%" stop-color="${spec.accentColor}"/>
  </linearGradient></defs>
  <rect width="100" height="100" rx="22" fill="url(#g1)"/>
  <text x="50" y="66" font-family="'Poppins',Arial,sans-serif" font-weight="700" font-size="38" fill="#ffffff" text-anchor="middle">${esc(initials)}</text>
</svg>`;
    },

    // 2. Monogram circle — initials in a circular badge, ink background, gradient text
    "monogram-circle": (spec) => {
      const initials = getInitials(spec.businessName);
      return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
  <defs><linearGradient id="g2" x1="0%" y1="100%" x2="100%" y2="0%">
    <stop offset="0%" stop-color="${spec.primaryColor}"/><stop offset="100%" stop-color="${spec.accentColor}"/>
  </linearGradient></defs>
  <circle cx="50" cy="50" r="50" fill="#14161f"/>
  <text x="50" y="65" font-family="Georgia,serif" font-weight="700" font-size="40" fill="url(#g2)" text-anchor="middle">${esc(initials)}</text>
</svg>`;
    },

    // 3. Dropcap — single big first-letter mark, serif, gradient (A&A's own style)
    "dropcap": (spec) => {
      const letter = firstLetter(spec.businessName);
      return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
  <defs><linearGradient id="g3" x1="0%" y1="100%" x2="100%" y2="0%">
    <stop offset="0%" stop-color="${spec.primaryColor}"/><stop offset="100%" stop-color="${spec.accentColor}"/>
  </linearGradient></defs>
  <rect width="100" height="100" rx="22" fill="#14161f"/>
  <text x="50" y="74" font-family="Georgia,serif" font-weight="700" font-size="66" fill="url(#g3)" text-anchor="middle">${esc(letter)}</text>
</svg>`;
    },

    // 4. Interlocking rings — abstract, no letters
    "interlock": (spec) => {
      return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
  <defs>
    <linearGradient id="g4a" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="${spec.primaryColor}"/><stop offset="100%" stop-color="${spec.primaryColor}" stop-opacity="0.7"/></linearGradient>
    <linearGradient id="g4b" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="${spec.accentColor}" stop-opacity="0.7"/><stop offset="100%" stop-color="${spec.accentColor}"/></linearGradient>
  </defs>
  <rect width="100" height="100" rx="22" fill="#14161f"/>
  <circle cx="40" cy="50" r="19" fill="none" stroke="url(#g4a)" stroke-width="7"/>
  <circle cx="60" cy="50" r="19" fill="none" stroke="url(#g4b)" stroke-width="7"/>
</svg>`;
    },

    // 5. Growth spiral — abstract, deterministic variety based on name hash
    "spiral": (spec) => {
      const h = hashStr(spec.businessName || "A");
      const dir = h % 2 === 0 ? 1 : -1;
      return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
  <defs><linearGradient id="g5" x1="0%" y1="100%" x2="100%" y2="0%">
    <stop offset="0%" stop-color="${spec.primaryColor}"/><stop offset="100%" stop-color="${spec.accentColor}"/>
  </linearGradient></defs>
  <rect width="100" height="100" rx="22" fill="#14161f"/>
  <path d="M50 50
           a 4 4 0 0 ${dir > 0 ? 1 : 0} 4 -4
           a 9 9 0 0 ${dir > 0 ? 1 : 0} 9 9
           a 14 14 0 0 ${dir > 0 ? 1 : 0} -14 14
           a 19 19 0 0 ${dir > 0 ? 1 : 0} -19 -19
           a 24 24 0 0 ${dir > 0 ? 1 : 0} 24 -24"
        fill="none" stroke="url(#g5)" stroke-width="6.5" stroke-linecap="round"/>
</svg>`;
    },

    // 6. Hexagon emblem — initials inside a hexagon, "seal" feel
    "hexagon": (spec) => {
      const initials = getInitials(spec.businessName);
      return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
  <defs><linearGradient id="g6" x1="0%" y1="100%" x2="100%" y2="0%">
    <stop offset="0%" stop-color="${spec.primaryColor}"/><stop offset="100%" stop-color="${spec.accentColor}"/>
  </linearGradient></defs>
  <polygon points="50,4 93,27 93,73 50,96 7,73 7,27" fill="url(#g6)"/>
  <polygon points="50,14 85,32 85,68 50,86 15,68 15,32" fill="#14161f"/>
  <text x="50" y="63" font-family="'Poppins',Arial,sans-serif" font-weight="700" font-size="30" fill="#ffffff" text-anchor="middle">${esc(initials)}</text>
</svg>`;
    },
  };

  function listStyles() {
    return Object.keys(STYLES);
  }

  function isValidHex(hex) {
    return typeof hex === "string" && /^#[0-9a-fA-F]{6}$/.test(hex);
  }

  function generate(spec) {
    const businessName = (spec.businessName || "").trim();
    if (!businessName) {
      return { error: "businessName is required" };
    }
    const clean = {
      businessName,
      primaryColor: isValidHex(spec.primaryColor) ? spec.primaryColor : "#2f5fff",
      accentColor: isValidHex(spec.accentColor) ? spec.accentColor : "#ffb338",
    };
    const results = {};
    for (const style of listStyles()) {
      results[style] = STYLES[style](clean);
    }
    return { results, spec: clean };
  }

  function generateOne(style, spec) {
    if (!STYLES[style]) return { error: `Unknown style: ${style}` };
    const businessName = (spec.businessName || "").trim();
    if (!businessName) return { error: "businessName is required" };
    const clean = {
      businessName,
      primaryColor: isValidHex(spec.primaryColor) ? spec.primaryColor : "#2f5fff",
      accentColor: isValidHex(spec.accentColor) ? spec.accentColor : "#ffb338",
    };
    return { svg: STYLES[style](clean) };
  }

  return { generate, generateOne, listStyles, getInitials, firstLetter, isValidHex };
});
