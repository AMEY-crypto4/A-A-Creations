// A&A Creations — Internal Admin Shell
// Injects a collapsible left sidebar into any internal tool page once its
// passcode gate is passed. Works by polling for #toolScreen becoming
// visible, so it drops into every existing page without touching their
// gate logic. One file to update, five pages benefit.

(function () {
  const NAV_ITEMS = [
    { href: "internal-dashboard.html", label: "Dashboard", icon: "🏠" },
    { href: "leads-tool.html", label: "Lead Finder", icon: "🔍" },
    { href: "site-builder.html", label: "Site Builder", icon: "⚡" },
    { href: "invoices.html", label: "Invoicing", icon: "🧾" },
    { href: "projects.html", label: "Projects", icon: "📊" },
    { href: "qr-tool.html", label: "QR Generator", icon: "▦" },
    { href: "logo-generator.html", label: "Logo Generator", icon: "🎨" },
    { href: "competitor-snapshot.html", label: "Competitor Snapshot", icon: "🔬" },
    { href: "review-templates.html", label: "Review Templates", icon: "💬" },
  ];

  function currentPage() {
    return window.location.pathname.split("/").pop() || "internal-dashboard.html";
  }

  function buildSidebarHTML() {
    const page = currentPage();
    const collapsed = localStorage.getItem("aa_sidebar_collapsed") === "1";
    const links = NAV_ITEMS.map(
      (item) => `
      <a href="${item.href}" class="aa-sb-link ${item.href === page ? "active" : ""}">
        <span class="aa-sb-icon">${item.icon}</span><span class="aa-sb-label">${item.label}</span>
      </a>`
    ).join("");
    return `
      <div class="aa-sidebar ${collapsed ? "collapsed" : ""}" id="aaSidebar">
        <div class="aa-sb-top">
          <button class="aa-sb-toggle" id="aaSidebarToggle" aria-label="Toggle menu">☰</button>
          <span class="aa-sb-brand">A&amp;A Internal</span>
        </div>
        <nav class="aa-sb-nav">${links}</nav>
        <div class="aa-sb-bottom">
          <a href="index.html" class="aa-sb-link"><span class="aa-sb-icon">↩</span><span class="aa-sb-label">Public Site</span></a>
        </div>
      </div>
      <button class="aa-sb-mobile-toggle" id="aaMobileToggle" aria-label="Open menu">☰</button>
      <div class="aa-sb-overlay" id="aaSbOverlay"></div>
    `;
  }

  function injectStyles() {
    const style = document.createElement("style");
    style.textContent = `
      .aa-sidebar{position:fixed;top:0;left:0;bottom:0;width:220px;background:#14161f;color:#fff;z-index:200;transition:width .25s ease;overflow-y:auto;display:flex;flex-direction:column;font-family:'Fredoka',sans-serif;}
      .aa-sidebar.collapsed{width:64px;}
      .aa-sb-top{display:flex;align-items:center;gap:10px;padding:18px 16px;border-bottom:1px solid #2a2d38;flex-shrink:0;}
      .aa-sb-toggle{background:none;border:none;color:#fff;font-size:18px;cursor:pointer;padding:4px;flex-shrink:0;}
      .aa-sb-brand{font-weight:700;font-size:14px;white-space:nowrap;overflow:hidden;}
      .aa-sidebar.collapsed .aa-sb-brand{display:none;}
      .aa-sb-nav{display:flex;flex-direction:column;padding:12px 8px;gap:2px;flex:1;}
      .aa-sb-bottom{padding:12px 8px;border-top:1px solid #2a2d38;}
      .aa-sb-link{display:flex;align-items:center;gap:12px;padding:11px 12px;border-radius:8px;color:#aab0c0;text-decoration:none;font-size:14px;white-space:nowrap;}
      .aa-sb-link:hover{background:#1f222c;color:#fff;}
      .aa-sb-link.active{background:#2f5fff;color:#fff;}
      .aa-sb-icon{font-size:16px;flex-shrink:0;width:20px;text-align:center;}
      .aa-sidebar.collapsed .aa-sb-label{display:none;}
      .aa-sb-mobile-toggle{display:none;position:fixed;top:16px;left:16px;z-index:201;background:#14161f;color:#fff;border:none;width:40px;height:40px;border-radius:8px;font-size:18px;cursor:pointer;}
      .aa-sb-overlay{display:none;position:fixed;inset:0;background:rgba(0,0,0,.4);z-index:199;}
      body.aa-has-sidebar .tool-wrap{margin-left:220px;transition:margin-left .25s ease;max-width:calc(1200px + 220px);}
      body.aa-has-sidebar.aa-sidebar-collapsed .tool-wrap{margin-left:64px;}
      @media (max-width:900px){
        .aa-sidebar{transform:translateX(-100%);transition:transform .25s ease;width:230px !important;}
        .aa-sidebar.mobile-open{transform:translateX(0);}
        .aa-sidebar.mobile-open ~ .aa-sb-overlay{display:block;}
        .aa-sb-mobile-toggle{display:block;}
        body.aa-has-sidebar .tool-wrap{margin-left:0 !important;padding-top:64px;}
      }
    `;
    document.head.appendChild(style);
  }

  function initAdminShell() {
    if (document.getElementById("aaSidebar")) return;
    injectStyles();
    const root = document.createElement("div");
    root.innerHTML = buildSidebarHTML();
    document.body.insertBefore(root, document.body.firstChild);
    document.body.classList.add("aa-has-sidebar");
    if (localStorage.getItem("aa_sidebar_collapsed") === "1") document.body.classList.add("aa-sidebar-collapsed");

    document.getElementById("aaSidebarToggle").addEventListener("click", () => {
      const sb = document.getElementById("aaSidebar");
      sb.classList.toggle("collapsed");
      document.body.classList.toggle("aa-sidebar-collapsed");
      localStorage.setItem("aa_sidebar_collapsed", sb.classList.contains("collapsed") ? "1" : "0");
    });
    document.getElementById("aaMobileToggle").addEventListener("click", () => {
      document.getElementById("aaSidebar").classList.toggle("mobile-open");
    });
    document.getElementById("aaSbOverlay").addEventListener("click", () => {
      document.getElementById("aaSidebar").classList.remove("mobile-open");
    });
  }

  window.initAdminShell = initAdminShell;

  const poller = setInterval(() => {
    const screen = document.getElementById("toolScreen");
    if (screen && getComputedStyle(screen).display !== "none") {
      initAdminShell();
      clearInterval(poller);
    }
  }, 150);
  setTimeout(() => clearInterval(poller), 30000); // stop polling after 30s if gate never passes
})();
