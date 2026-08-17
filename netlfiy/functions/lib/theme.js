// Small color utility — deliberately simple. Ink (near-black) and paper
// (near-white) stay fixed neutrals for reliability across every generated
// site; only the primary/accent brand colors vary per client. This avoids
// the ugly, unpredictable palettes that come from auto-deriving dark/light
// shades from an arbitrary input color.

function hexToRgb(hex) {
  const clean = hex.replace("#", "");
  const full = clean.length === 3 ? clean.split("").map((c) => c + c).join("") : clean;
  const num = parseInt(full, 16);
  return { r: (num >> 16) & 255, g: (num >> 8) & 255, b: num & 255 };
}

function rgbToHex(r, g, b) {
  return "#" + [r, g, b].map((v) => Math.max(0, Math.min(255, Math.round(v))).toString(16).padStart(2, "0")).join("");
}

function mix(hex1, hex2, weight) {
  const c1 = hexToRgb(hex1);
  const c2 = hexToRgb(hex2);
  return rgbToHex(
    c1.r + (c2.r - c1.r) * weight,
    c1.g + (c2.g - c1.g) * weight,
    c1.b + (c2.b - c1.b) * weight
  );
}

function isValidHex(hex) {
  return typeof hex === "string" && /^#[0-9a-fA-F]{3}([0-9a-fA-F]{3})?$/.test(hex);
}

// Light tint of the primary color, used for subtle backgrounds/badges
function tint(hex, weight = 0.9) {
  return mix(hex, "#ffffff", weight);
}

function buildTheme(spec) {
  const primary = isValidHex(spec.primaryColor) ? spec.primaryColor : "#2f5fff";
  const accent = isValidHex(spec.accentColor) ? spec.accentColor : "#ffb338";
  return {
    ink: "#14161f",
    paper: "#f7f7f5",
    paperDim: "#eceee9",
    slate: "#5b616e",
    line: "#e2e4df",
    primary,
    primaryDim: tint(primary, 0.92),
    primaryDark: mix(primary, "#000000", 0.28), // gradient end — richer, not just flat
    accent,
  };
}

module.exports = { buildTheme, mix, tint, isValidHex };
