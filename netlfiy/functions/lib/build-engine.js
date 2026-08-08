// A&A Creations — Site Generator: Build Engine
// Given a validated site-spec, returns { "index.html": "...", ... } —
// a plain object mapping filenames to file contents, ready to be zipped
// or written to disk. No Netlify-specific code here, so this is testable
// in complete isolation from the serverless environment.

const { getCategory } = require("./site-templates");
const { buildTheme } = require("./theme");
const C = require("./components");

const REQUIRED_FIELDS = ["businessName", "category", "package"];

function validateSpec(spec) {
  const errors = [];
  for (const field of REQUIRED_FIELDS) {
    if (!spec[field]) errors.push(`Missing required field: ${field}`);
  }
  if (spec.package && !["starter", "growth", "custom"].includes(spec.package)) {
    errors.push(`package must be one of: starter, growth, custom (got "${spec.package}")`);
  }
  return errors;
}

function normalizeSpec(rawSpec) {
  const spec = JSON.parse(JSON.stringify(rawSpec)); // deep clone, defensive
  spec.content = spec.content || {};
  spec.content.tagline = spec.content.tagline || `Welcome to ${spec.businessName}`;
  spec.content.about = spec.content.about || "Tell your customers what makes your business worth choosing, right here.";
  spec.content.services = spec.content.services || [];
  spec.content.gallery = spec.content.gallery || [];
  spec.content.testimonials = spec.content.testimonials || [];
  spec.contact = spec.contact || {};
  spec.addons = spec.addons || [];
  spec.category_data = getCategory(spec.category);
  return spec;
}

function buildIndexPage(spec, theme, pages) {
  const cat = spec.category_data;
  const isStarter = spec.package === "starter";

  let body = `${C.navHtml(spec, pages)}
${C.heroHtml(spec)}
${C.trustStripHtml(spec)}
${C.servicesHtml(spec)}`;

  if (!isStarter) {
    body += `\n${C.testimonialsHtml(spec)}`;
  }
  body += `\n${C.contactHtml(spec)}\n${C.footerHtml(spec)}`;

  return C.pageShell({
    title: `${spec.businessName} — ${cat.label}`,
    description: spec.content.tagline,
    theme,
    bodyHtml: body,
    spec,
  });
}

function buildServicesPage(spec, theme, pages) {
  const body = `${C.navHtml(spec, pages)}
${C.servicesHtml(spec)}
${C.galleryHtml(spec)}
${C.footerHtml(spec)}`;
  return C.pageShell({
    title: `Services — ${spec.businessName}`,
    description: spec.category_data.servicesIntro,
    theme,
    bodyHtml: body,
    spec,
  });
}

function buildContactPage(spec, theme, pages) {
  const body = `${C.navHtml(spec, pages)}
${C.contactHtml(spec)}
${C.footerHtml(spec)}`;
  return C.pageShell({
    title: `Contact — ${spec.businessName}`,
    description: spec.category_data.contactSub,
    theme,
    bodyHtml: body,
    spec,
  });
}

function buildGalleryPage(spec, theme, pages) {
  const body = `${C.navHtml(spec, pages)}
${C.galleryHtml(spec)}
${C.testimonialsHtml(spec)}
${C.footerHtml(spec)}`;
  return C.pageShell({
    title: `${spec.category_data.galleryLabel} — ${spec.businessName}`,
    description: spec.category_data.galleryLabel,
    theme,
    bodyHtml: body,
    spec,
  });
}

function buildSite(rawSpec) {
  const errors = validateSpec(rawSpec);
  if (errors.length) {
    return { errors };
  }

  const spec = normalizeSpec(rawSpec);
  const theme = buildTheme(spec);
  const files = {};

  if (spec.package === "starter") {
    // Single page — everything on index.html via anchors
    const pages = [{ file: "index.html", label: "Home" }, { file: "index.html#services", label: spec.category_data.servicesLabel }, { file: "index.html#contact", label: "Contact" }];
    files["index.html"] = buildIndexPage(spec, theme, pages);
  } else if (spec.package === "growth") {
    const pages = [
      { file: "index.html", label: "Home" },
      { file: "services.html", label: spec.category_data.servicesLabel },
      { file: "contact.html", label: "Contact" },
    ];
    files["index.html"] = buildIndexPage(spec, theme, pages);
    files["services.html"] = buildServicesPage(spec, theme, pages);
    files["contact.html"] = buildContactPage(spec, theme, pages);
  } else {
    // custom — growth + a dedicated gallery page; booking/payments are
    // noted as CTA/section hooks, not live integrations (those need
    // wiring to whichever provider the client picks, same as any add-on)
    const pages = [
      { file: "index.html", label: "Home" },
      { file: "services.html", label: spec.category_data.servicesLabel },
      { file: "gallery.html", label: spec.category_data.galleryLabel },
      { file: "contact.html", label: "Contact" },
    ];
    files["index.html"] = buildIndexPage(spec, theme, pages);
    files["services.html"] = buildServicesPage(spec, theme, pages);
    files["gallery.html"] = buildGalleryPage(spec, theme, pages);
    files["contact.html"] = buildContactPage(spec, theme, pages);
  }

  files["robots.txt"] = "User-agent: *\nAllow: /\n";

  return { files, errors: [] };
}

module.exports = { buildSite, validateSpec, normalizeSpec };
