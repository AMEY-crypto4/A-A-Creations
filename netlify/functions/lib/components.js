// A&A Creations — Site Generator: Component Library
// Pure functions: (spec, theme, category) -> HTML string. No client-specific
// logic lives here beyond what's passed in — this is what makes the engine
// reusable across every category and tier.

function esc(str) {
  if (str === undefined || str === null) return "";
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function baseStyles(theme) {
  return `
  :root{
    --ink:${theme.ink}; --paper:${theme.paper}; --paper-dim:${theme.paperDim};
    --slate:${theme.slate}; --line:${theme.line};
    --primary:${theme.primary}; --primary-dim:${theme.primaryDim}; --primary-dark:${theme.primaryDark}; --accent:${theme.accent};
  }
  *{box-sizing:border-box;}
  body{margin:0;background:var(--paper);color:var(--ink);font-family:'Inter',sans-serif;line-height:1.6;overflow-x:hidden;}
  h1,h2,h3{font-family:'Poppins',sans-serif;margin:0;letter-spacing:-0.01em;}
  a{color:inherit;}
  img{max-width:100%;display:block;}
  .wrap{max-width:1140px;margin:0 auto;padding:0 24px;}
  .btn{display:inline-flex;align-items:center;gap:8px;padding:13px 26px;border-radius:8px;font-family:'Poppins',sans-serif;font-weight:600;font-size:15px;text-decoration:none;cursor:pointer;border:none;transition:transform .2s ease, box-shadow .2s ease;}
  .btn:hover{transform:translateY(-2px);}
  .btn-primary{background:linear-gradient(135deg, var(--primary) 0%, var(--primary-dark) 100%);color:#fff;box-shadow:0 8px 20px -4px color-mix(in srgb, var(--primary) 45%, transparent);}
  .btn-primary:hover{box-shadow:0 12px 28px -4px color-mix(in srgb, var(--primary) 55%, transparent);}
  .btn-ghost{background:#fff;color:var(--ink);border:1.5px solid var(--line);}

  nav{position:sticky;top:0;z-index:50;background:rgba(255,255,255,0.92);backdrop-filter:blur(8px);border-bottom:1px solid var(--line);transition:box-shadow .3s ease;}
  nav.nav-scrolled{box-shadow:0 4px 20px rgba(0,0,0,.06);}
  nav .wrap{display:flex;align-items:center;justify-content:space-between;padding:16px 24px;}
  .logo{font-family:'Poppins',sans-serif;font-weight:700;font-size:19px;}
  .navlinks{display:flex;gap:28px;font-size:14px;font-weight:500;}
  .navlinks a{text-decoration:none;opacity:.85;transition:opacity .2s ease;}
  .navlinks a:hover{opacity:1;}
  @media (max-width:800px){.navlinks{display:none;}}

  .hero{
    padding:72px 0 56px;position:relative;overflow:hidden;
    background:radial-gradient(circle at 15% 20%, var(--primary-dim) 0%, transparent 45%),
               radial-gradient(circle at 85% 0%, color-mix(in srgb, var(--accent) 18%, transparent) 0%, transparent 40%),
               var(--paper);
  }
  .hero .wrap{position:relative;z-index:1;}
  .hero h1{font-size:clamp(30px,4.6vw,50px);line-height:1.08;max-width:760px;}
  .hero p.lede{font-size:17px;color:var(--slate);max-width:540px;margin-top:18px;}
  .hero .actions{display:flex;gap:14px;margin-top:28px;flex-wrap:wrap;}

  .trust-strip{border-top:1px solid var(--line);border-bottom:1px solid var(--line);padding:20px 0;background:#fff;}
  .trust-grid{display:flex;justify-content:center;gap:36px;flex-wrap:wrap;}
  .trust-item{font-size:13.5px;font-weight:600;display:flex;align-items:center;gap:8px;}
  .trust-item::before{content:"✓";width:18px;height:18px;border-radius:50%;background:linear-gradient(135deg, var(--primary), var(--primary-dark));color:#fff;font-size:10px;display:flex;align-items:center;justify-content:center;flex-shrink:0;}

  .section{padding:80px 0;}
  .section-tight{padding:60px 0;}
  .section-head{max-width:600px;margin:0 auto 44px;text-align:center;}
  .section-head h2{font-size:clamp(26px,3.2vw,36px);}
  .section-head p{color:var(--slate);margin-top:12px;font-size:16px;}

  .services-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:22px;}
  .service-card{background:#fff;border:1px solid var(--line);border-radius:14px;padding:28px;transition:transform .25s ease, box-shadow .25s ease, border-color .25s ease;}
  .service-card:hover{transform:translateY(-5px);box-shadow:0 16px 32px -12px rgba(20,22,31,.15);border-color:var(--primary);}
  .service-card h3{font-size:18px;margin-bottom:10px;}
  .service-card p{font-size:14px;color:var(--slate);margin:0;}
  @media (max-width:800px){.services-grid{grid-template-columns:1fr;}}

  .gallery-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:16px;}
  .gallery-item{aspect-ratio:4/3;background:linear-gradient(135deg, var(--primary-dim), var(--paper-dim));border-radius:12px;display:flex;align-items:center;justify-content:center;color:var(--slate);font-size:12px;text-transform:uppercase;letter-spacing:0.4px;overflow:hidden;transition:transform .3s ease;}
  .gallery-item:hover{transform:scale(1.03);}
  @media (max-width:800px){.gallery-grid{grid-template-columns:1fr 1fr;}}

  .testimonial-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:22px;}
  .testimonial-card{background:#fff;border:1px solid var(--line);border-radius:14px;padding:26px;position:relative;transition:transform .25s ease, box-shadow .25s ease;}
  .testimonial-card:hover{transform:translateY(-4px);box-shadow:0 14px 28px -10px rgba(20,22,31,.12);}
  .testimonial-card::before{content:"\\201C";position:absolute;top:14px;right:20px;font-family:Georgia,serif;font-size:48px;color:var(--primary-dim);line-height:1;}
  .testimonial-card p.quote{font-size:14.5px;font-style:italic;margin:0 0 14px;position:relative;z-index:1;}
  .testimonial-card .author{font-weight:600;font-size:13.5px;color:var(--primary-dark);}
  @media (max-width:800px){.testimonial-grid{grid-template-columns:1fr;}}

  .cta-band{
    background:linear-gradient(150deg, var(--ink) 0%, color-mix(in srgb, var(--primary) 22%, var(--ink)) 100%);
    color:#fff;border-radius:22px;padding:56px 40px;text-align:center;position:relative;overflow:hidden;
  }
  .cta-band h2{font-size:clamp(24px,3vw,32px);color:#fff;}
  .cta-band p{color:#aab0c0;margin-top:10px;}
  .cta-form{display:flex;gap:10px;flex-wrap:wrap;justify-content:center;margin-top:24px;}
  .cta-form input{background:rgba(255,255,255,.08);border:1px solid rgba(255,255,255,.18);color:#fff;padding:13px 16px;border-radius:8px;font-family:'Inter',sans-serif;font-size:14px;min-width:200px;}
  .cta-form input::placeholder{color:rgba(255,255,255,.55);}

  .whatsapp-fab{position:fixed;bottom:20px;right:20px;width:54px;height:54px;border-radius:50%;background:#25D366;display:flex;align-items:center;justify-content:center;box-shadow:0 8px 22px rgba(37,211,102,.4);z-index:80;transition:transform .2s ease;}
  .whatsapp-fab:hover{transform:scale(1.08);}
  .whatsapp-fab svg{width:26px;height:26px;color:#fff;}

  footer{padding:40px 0;border-top:1px solid var(--line);background:#fff;}
  .footer-grid{display:flex;justify-content:space-between;flex-wrap:wrap;gap:20px;font-size:13.5px;color:var(--slate);}

  .reveal{opacity:0;transform:translateY(20px);transition:opacity .7s ease, transform .7s ease;}
  .reveal.is-visible{opacity:1;transform:translateY(0);}
  @media (prefers-reduced-motion: reduce){
    .reveal{opacity:1;transform:none;transition:none;}
  }
  `;
}

function navHtml(spec, pages) {
  const links = pages.map((p) => `<a href="${p.file}">${esc(p.label)}</a>`).join("\n      ");
  const contactPage = pages[pages.length - 1];
  return `<nav>
  <div class="wrap">
    <a href="index.html" class="logo">${esc(spec.businessName)}</a>
    <div class="navlinks">
      ${links}
    </div>
    <a href="${contactPage.file}" class="btn btn-primary" style="padding:10px 20px;font-size:14px;">Contact Us</a>
  </div>
</nav>`;
}

function heroHtml(spec) {
  const cat = spec.category_data;
  return `<header class="hero">
  <div class="wrap">
    <h1>${esc(spec.content.tagline)}</h1>
    <p class="lede">${esc(spec.content.about)}</p>
    <div class="actions">
      <a href="#contact" class="btn btn-primary">${esc(cat.heroCtaText)}</a>
      <a href="#services" class="btn btn-ghost">${esc(cat.secondaryCtaText)}</a>
    </div>
  </div>
</header>`;
}

function trustStripHtml(spec) {
  const points = spec.category_data.trustPoints || [];
  return `<div class="trust-strip">
  <div class="wrap trust-grid">
    ${points.map((p) => `<div class="trust-item">${esc(p)}</div>`).join("\n    ")}
  </div>
</div>`;
}

function servicesHtml(spec) {
  const cat = spec.category_data;
  const services = (spec.content.services && spec.content.services.length ? spec.content.services : cat.defaultServices);
  return `<section class="section reveal" id="services">
  <div class="wrap">
    <div class="section-head">
      <h2>${esc(cat.servicesLabel)}</h2>
      <p>${esc(cat.servicesIntro)}</p>
    </div>
    <div class="services-grid">
      ${services.map((s) => `<div class="service-card"><h3>${esc(s.name)}</h3><p>${esc(s.description)}</p></div>`).join("\n      ")}
    </div>
  </div>
</section>`;
}

function galleryHtml(spec) {
  const cat = spec.category_data;
  const items = spec.content.gallery || [];
  if (!items.length) return ""; // never show "Photo 1" placeholders to real visitors
  return `<section class="section section-tight reveal" style="background:var(--paper-dim);">
  <div class="wrap">
    <div class="section-head"><h2>${esc(cat.galleryLabel)}</h2></div>
    <div class="gallery-grid">
      ${items.slice(0, 6).map((label) => `<div class="gallery-item">${esc(typeof label === "string" ? label : "Photo")}</div>`).join("\n      ")}
    </div>
  </div>
</section>`;
}

function testimonialsHtml(spec) {
  const cat = spec.category_data;
  const testimonials = spec.content.testimonials || [];
  if (!testimonials.length) return ""; // never show real customers a "add a real quote" placeholder
  return `<section class="section reveal">
  <div class="wrap">
    <div class="section-head"><h2>${esc(cat.testimonialIntro)}</h2></div>
    <div class="testimonial-grid">
      ${testimonials.map((t) => `<div class="testimonial-card"><p class="quote">${esc(t.quote)}</p><div class="author">— ${esc(t.author)}</div></div>`).join("\n      ")}
    </div>
  </div>
</section>`;
}

function contactHtml(spec) {
  const cat = spec.category_data;
  const whatsapp = (spec.contact.whatsapp || "").replace(/[^0-9]/g, "");
  return `<section class="section reveal" id="contact">
  <div class="wrap">
    <div class="cta-band">
      <h2>${esc(cat.contactHeading)}</h2>
      <p>${esc(cat.contactSub)}</p>
      <form class="cta-form" name="contact-request" method="POST" data-netlify="true" netlify-honeypot="bot-field">
        <input type="hidden" name="form-name" value="contact-request">
        <p style="position:absolute;left:-9999px;" aria-hidden="true"><label>Don't fill this out: <input name="bot-field"></label></p>
        <input type="text" name="name" placeholder="${esc(cat.formFields[0])}" required>
        <input type="text" name="phone" placeholder="${esc(cat.formFields[1])}" required>
        <input type="text" name="message" placeholder="${esc(cat.formFields[2])}">
        <button type="submit" class="btn btn-primary">Send</button>
      </form>
    </div>
  </div>
</section>`;
}

function whatsappFab(spec) {
  const whatsapp = (spec.contact.whatsapp || "").replace(/[^0-9]/g, "");
  if (!whatsapp) return "";
  return `<a href="https://wa.me/${whatsapp}?text=${encodeURIComponent("Hi " + spec.businessName + ", I'd like to know more")}" class="whatsapp-fab" target="_blank" rel="noopener" aria-label="Chat on WhatsApp">
  <svg viewBox="0 0 24 24" fill="currentColor"><path d="M17.6 6.32A7.85 7.85 0 0 0 12.05 4a7.94 7.94 0 0 0-6.9 11.9L4 20l4.2-1.1a7.9 7.9 0 0 0 3.85 1h0a7.94 7.94 0 0 0 7.94-7.94 7.9 7.9 0 0 0-2.4-5.64zm-5.55 12.2h0a6.6 6.6 0 0 1-3.36-.92l-.24-.14-2.5.66.67-2.44-.16-.25a6.6 6.6 0 1 1 12.24-3.5 6.56 6.56 0 0 1-6.65 6.6zm3.6-4.94c-.2-.1-1.17-.58-1.35-.64-.18-.07-.31-.1-.45.1-.13.2-.51.64-.62.77-.11.13-.23.14-.42.05a5.4 5.4 0 0 1-1.6-.98 5.98 5.98 0 0 1-1.1-1.37c-.12-.2 0-.3.09-.4.1-.1.2-.24.3-.36.1-.12.13-.2.2-.34.06-.13.03-.25-.02-.35-.05-.1-.45-1.07-.61-1.47-.16-.38-.33-.33-.45-.34h-.38c-.13 0-.35.05-.53.25-.18.2-.7.68-.7 1.66s.72 1.93.82 2.06c.1.13 1.4 2.15 3.4 3 .48.2.85.33 1.14.42.48.15.92.13 1.26.08.39-.06 1.17-.48 1.34-.94.16-.46.16-.86.11-.94-.05-.08-.18-.13-.38-.23z"/></svg>
</a>`;
}

function footerHtml(spec) {
  return `<footer>
  <div class="wrap footer-grid">
    <div><b style="color:var(--ink);">${esc(spec.businessName)}</b><br>${esc(spec.contact.address || "")}</div>
    <div>${esc(spec.contact.phone || "")}<br>${esc(spec.contact.email || "")}</div>
    <div>© ${new Date().getFullYear()} ${esc(spec.businessName)}. All rights reserved.</div>
  </div>
</footer>`;
}

function schemaScript(spec) {
  const whatsapp = (spec.contact.whatsapp || "").replace(/[^0-9]/g, "");
  const schema = {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    name: spec.businessName,
    description: spec.content.about || spec.content.tagline || `${spec.businessName} — ${spec.category_data.label}`,
  };
  if (spec.contact.phone) schema.telephone = spec.contact.phone;
  if (spec.contact.email) schema.email = spec.contact.email;
  if (spec.contact.address) {
    schema.address = { "@type": "PostalAddress", streetAddress: spec.contact.address };
  }
  if (whatsapp) schema.sameAs = [`https://wa.me/${whatsapp}`];
  return `<script type="application/ld+json">${JSON.stringify(schema)}</script>`;
}

function animationScript() {
  return `<script src="https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.5/gsap.min.js"></script>
<script src="https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.5/ScrollTrigger.min.js"></script>
<script>
(function(){
  if (typeof gsap === "undefined") return;
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
  gsap.registerPlugin(ScrollTrigger);
  document.addEventListener("DOMContentLoaded", function(){
    document.querySelectorAll(".reveal").forEach(function(el){
      gsap.fromTo(el, {opacity:0, y:24}, {opacity:1, y:0, duration:0.7, ease:"power3.out",
        scrollTrigger:{trigger:el, start:"top 88%"}});
    });
    document.querySelectorAll(".services-grid, .testimonial-grid, .gallery-grid").forEach(function(grid){
      var cards = grid.children;
      if (!cards.length) return;
      gsap.fromTo(cards, {opacity:0, y:20}, {opacity:1, y:0, duration:0.5, ease:"power2.out", stagger:0.08,
        scrollTrigger:{trigger:grid, start:"top 88%"}});
    });
    var nav = document.querySelector("nav");
    if (nav) {
      ScrollTrigger.create({start:"top -60", end:99999, toggleClass:{className:"nav-scrolled", targets:nav}});
    }
  });
})();
</script>`;
}

function pageShell({ title, description, theme, bodyHtml, spec, filename }) {
  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>${esc(title)}</title>
<meta name="description" content="${esc(description)}">
<meta property="og:title" content="${esc(title)}">
<meta property="og:description" content="${esc(description)}">
<meta property="og:type" content="business.business">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link href="https://fonts.googleapis.com/css2?family=Poppins:wght@600;700&family=Inter:wght@400;500;600&display=swap" rel="stylesheet">
<style>${baseStyles(theme)}</style>
${schemaScript(spec)}
</head>
<body>
${bodyHtml}
${whatsappFab(spec)}
${animationScript()}
</body>
</html>`;
}

module.exports = {
  esc, navHtml, heroHtml, trustStripHtml, servicesHtml, galleryHtml,
  testimonialsHtml, contactHtml, footerHtml, pageShell, whatsappFab,
};
