/* ============================================================
   OHSA — Shared site logic (header, footer, auth, theme, search)
   Include AFTER firebase-config.js on every page.
   Requires a <div id="site-header"></div> and <div id="site-footer"></div>
   ============================================================ */

const NAV_ITEMS = [
  { label: "Home", href: "index.html", icon: "home" },
  { label: "About", href: "about.html", icon: "info" },
  { label: "Our Story", href: "ourstory.html", icon: "auto_stories" },
  { label: "Mission & Vision", href: "mission.html", icon: "flag" },
  { label: "Teachers", href: "headmaster.html", icon: "school" },
  { label: "Executive Committee", href: "executive.html", icon: "groups" },
  { label: "Ex Students", href: "exstudent.html", icon: "diversity_3" },
  { label: "Events", href: "event.html", icon: "event" },
  { label: "Notice Board", href: "notice.html", icon: "campaign" },
  { label: "Membership", href: "membership.html", icon: "card_membership" },
  { label: "Gallery", href: "gallery.html", icon: "photo_library" },
  { label: "Contact", href: "contact.html", icon: "call" },
];

const BOTTOM_NAV = [
  { label: "Home", href: "index.html", icon: "home" },
  { label: "Events", href: "event.html", icon: "event" },
  { label: "Notice", href: "notice.html", icon: "campaign" },
  { label: "Gallery", href: "gallery.html", icon: "photo_library" },
  { label: "Profile", href: "profile.html", icon: "person" },
];

window.SITE = { settings: {}, user: null, userDoc: null, ready: false };

/* ---------------- Theme ---------------- */
function initTheme() {
  const saved = localStorage.getItem("ohsa-theme");
  const prefersDark = window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches;
  if (saved === "dark" || (!saved && prefersDark)) document.documentElement.classList.add("dark");
}
function toggleTheme() {
  document.documentElement.classList.toggle("dark");
  localStorage.setItem("ohsa-theme", document.documentElement.classList.contains("dark") ? "dark" : "light");
  const icon = document.getElementById("theme-icon");
  if (icon) icon.textContent = document.documentElement.classList.contains("dark") ? "light_mode" : "dark_mode";
}
initTheme();

/* ---------------- Helpers ---------------- */
function escapeHtml(s) {
  return String(s == null ? "" : s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
}
function fmtDate(ts) {
  if (!ts) return "";
  const d = ts.toDate ? ts.toDate() : new Date(ts);
  if (isNaN(d)) return "";
  return d.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
}
function timeAgo(ts) {
  if (!ts) return "";
  const d = ts.toDate ? ts.toDate() : new Date(ts);
  const diff = (Date.now() - d.getTime()) / 1000;
  if (diff < 60) return "just now";
  if (diff < 3600) return Math.floor(diff / 60) + "m ago";
  if (diff < 86400) return Math.floor(diff / 3600) + "h ago";
  if (diff < 2592000) return Math.floor(diff / 86400) + "d ago";
  return fmtDate(ts);
}
function showToast(msg, type = "success") {
  let wrap = document.getElementById("toast-wrap");
  if (!wrap) {
    wrap = document.createElement("div");
    wrap.id = "toast-wrap";
    wrap.className = "fixed bottom-20 lg:bottom-6 right-4 z-[300] flex flex-col gap-2";
    document.body.appendChild(wrap);
  }
  const colors = { success: "bg-emerald-600", error: "bg-red-600", info: "bg-accent" };
  const t = document.createElement("div");
  t.className = `${colors[type] || colors.success} text-white px-4 py-3 rounded-xl shadow-lg text-sm fade-in max-w-xs`;
  t.textContent = msg;
  wrap.appendChild(t);
  setTimeout(() => { t.style.transition = "opacity .3s"; t.style.opacity = "0"; setTimeout(() => t.remove(), 300); }, 3200);
}
function animateCounters(root = document) {
  const els = root.querySelectorAll("[data-counter]");
  const io = new IntersectionObserver((entries) => {
    entries.forEach((e) => {
      if (!e.isIntersecting) return;
      const el = e.target;
      const target = parseFloat(el.dataset.counter) || 0;
      let cur = 0;
      const step = Math.max(target / 60, 0.1);
      const tick = () => {
        cur += step;
        if (cur >= target) { el.textContent = target.toLocaleString(); return; }
        el.textContent = Math.floor(cur).toLocaleString();
        requestAnimationFrame(tick);
      };
      tick();
      io.unobserve(el);
    });
  }, { threshold: 0.4 });
  els.forEach((el) => io.observe(el));
}

/* ---------------- Header / Footer templates ---------------- */
function headerTemplate(active) {
  const primary = NAV_ITEMS.slice(0, 3);
  const rest = NAV_ITEMS.slice(3);
  const link = (item) => `<a href="${item.href}" class="hdr-text px-3 py-2 rounded-lg text-sm font-semibold hover:bg-white/10 transition ${active === item.href ? "text-accent-2" : ""}">${item.label}</a>`;
  return `
  <div class="max-w-7xl mx-auto px-4 md:px-6 h-20 flex items-center justify-between">
    <a href="index.html" class="flex items-center gap-3 shrink-0">
      <img id="hdr-logo" src="https://cdn.phototourl.com/free/2026-06-30-ab1ec5e9-69b4-47b3-8bf9-2d6f233e42a5.jpg" class="h-11 w-11 rounded-full object-cover bg-white p-0.5 shadow"/>
      <span id="hdr-sitename" class="hdr-text font-display font-extrabold text-lg md:text-xl leading-tight">Ex-Student Association<br class="hidden md:block"/><span class="text-xs md:text-sm font-semibold opacity-80">Otarhat High School</span></span>
    </a>

    <nav class="hidden lg:flex items-center gap-1">
      ${primary.map(link).join("")}
      <div class="relative group">
        <button class="hdr-text px-3 py-2 rounded-lg text-sm font-semibold hover:bg-white/10 transition flex items-center gap-1">More <span class="material-symbols-rounded text-base">expand_more</span></button>
        <div class="absolute left-0 top-full pt-2 hidden group-hover:block">
          <div class="glass rounded-2xl shadow-xl p-2 w-64 grid grid-cols-1 gap-0.5">
            ${rest.map((i) => `<a href="${i.href}" class="flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-medium text-[var(--text)] hover:bg-black/5 dark:hover:bg-white/10"><span class="material-symbols-rounded text-lg text-accent">${i.icon}</span>${i.label}</a>`).join("")}
          </div>
        </div>
      </div>
    </nav>

    <div class="flex items-center gap-1.5">
      <button onclick="openSearch()" class="hdr-text p-2 rounded-xl hover:bg-white/10" title="Search"><span class="material-symbols-rounded">search</span></button>
      <button onclick="toggleTheme()" class="hdr-text p-2 rounded-xl hover:bg-white/10" title="Toggle theme"><span id="theme-icon" class="material-symbols-rounded">${document.documentElement.classList.contains("dark") ? "light_mode" : "dark_mode"}</span></button>
      <div class="relative">
        <button onclick="toggleDD('notif-dd')" class="hdr-text p-2 rounded-xl hover:bg-white/10 relative" title="Notifications">
          <span class="material-symbols-rounded">notifications</span>
          <span id="notif-dot" class="hidden absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-red-500"></span>
        </button>
        <div id="notif-dd" class="hidden absolute right-0 mt-2 w-80 surface rounded-2xl shadow-2xl p-2 fade-in max-h-96 overflow-y-auto">
          <p class="px-3 py-2 text-xs font-bold text-[var(--muted)] uppercase">Notifications</p>
          <div id="notif-list" class="text-sm"><div class="empty-state py-6 text-xs">Loading…</div></div>
        </div>
      </div>
      <div id="auth-area" class="ml-1"></div>
      <button id="mobile-menu-btn" class="hdr-text p-2 rounded-xl hover:bg-white/10 lg:hidden"><span class="material-symbols-rounded">menu</span></button>
    </div>
  </div>

  <!-- Mobile drawer -->
  <div id="drawer-overlay" class="fixed inset-0 bg-black/60 z-[110] hidden"></div>
  <div id="mobile-drawer" class="fixed top-0 right-0 h-full w-[300px] max-w-[85vw] surface z-[120] shadow-2xl p-5 flex flex-col translate-x-full transition-transform duration-300">
    <div class="flex justify-between items-center mb-6">
      <span class="font-display font-extrabold text-lg">Menu</span>
      <button id="drawer-close" class="p-2 rounded-xl hover:bg-black/5 dark:hover:bg-white/10"><span class="material-symbols-rounded">close</span></button>
    </div>
    <nav class="flex-1 overflow-y-auto flex flex-col gap-1">
      ${NAV_ITEMS.map((i) => `<a href="${i.href}" class="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold hover:bg-black/5 dark:hover:bg-white/10 ${active === i.href ? "text-accent bg-black/5 dark:bg-white/10" : ""}"><span class="material-symbols-rounded text-accent">${i.icon}</span>${i.label}</a>`).join("")}
    </nav>
    <div id="drawer-auth" class="pt-4 mt-4 border-t border-[var(--border)] flex flex-col gap-2"></div>
  </div>`;
}

function footerTemplate() {
  return `
  <div class="max-w-7xl mx-auto px-4 md:px-6 py-14 grid grid-cols-1 md:grid-cols-4 gap-10">
    <div>
      <div class="flex items-center gap-3 mb-4">
        <img id="ftr-logo" src="https://cdn.phototourl.com/free/2026-06-30-ab1ec5e9-69b4-47b3-8bf9-2d6f233e42a5.jpg" class="h-10 w-10 rounded-full object-cover bg-white p-0.5"/>
        <span class="font-display font-extrabold">Ex-Student Association<br/><span class="text-xs opacity-70">Otarhat High School</span></span>
      </div>
      <p id="ftr-text" class="text-sm opacity-70 leading-relaxed">Connecting generations of Otarhat High School alumni through fellowship, service and shared memory.</p>
      <div id="ftr-social" class="flex gap-2 mt-4"></div>
    </div>
    <div>
      <h4 class="font-bold mb-3 text-sm uppercase tracking-wide opacity-70">Quick Links</h4>
      <div class="flex flex-col gap-2 text-sm">
        <a href="about.html" class="opacity-80 hover:opacity-100 hover:text-accent">About</a>
        <a href="ourstory.html" class="opacity-80 hover:opacity-100 hover:text-accent">Our Story</a>
        <a href="executive.html" class="opacity-80 hover:opacity-100 hover:text-accent">Executive Committee</a>
        <a href="membership.html" class="opacity-80 hover:opacity-100 hover:text-accent">Membership</a>
      </div>
    </div>
    <div>
      <h4 class="font-bold mb-3 text-sm uppercase tracking-wide opacity-70">Explore</h4>
      <div class="flex flex-col gap-2 text-sm">
        <a href="event.html" class="opacity-80 hover:opacity-100 hover:text-accent">Events</a>
        <a href="notice.html" class="opacity-80 hover:opacity-100 hover:text-accent">Notice Board</a>
        <a href="gallery.html" class="opacity-80 hover:opacity-100 hover:text-accent">Gallery</a>
        <a href="exstudent.html" class="opacity-80 hover:opacity-100 hover:text-accent">Ex Students</a>
      </div>
    </div>
    <div>
      <h4 class="font-bold mb-3 text-sm uppercase tracking-wide opacity-70">Contact</h4>
      <div class="flex flex-col gap-2 text-sm" id="ftr-contact">
        <a href="contact.html" class="opacity-80 hover:opacity-100 hover:text-accent">Contact Us</a>
      </div>
    </div>
  </div>
  <div class="border-t border-[var(--border)] py-5 text-center text-xs opacity-60">
    <p id="ftr-copy">© <span id="ftr-year"></span> Ex-Student Association, Otarhat High School. All Rights Reserved.</p>
  </div>`;
}

/* ---------------- Boot header/footer ---------------- */
function bootSite(activePage) {
  const h = document.getElementById("site-header");
  const f = document.getElementById("site-footer");
  if (h) h.innerHTML = headerTemplate(activePage);
  if (f) f.innerHTML = footerTemplate();
  document.getElementById("ftr-year") && (document.getElementById("ftr-year").textContent = new Date().getFullYear());

  // scroll effect
  const hdr = document.getElementById("site-header");
  const onScroll = () => { if (!hdr) return; hdr.classList.toggle("scrolled", window.scrollY > 30); };
  window.addEventListener("scroll", onScroll); onScroll();

  // mobile drawer
  const drawer = document.getElementById("mobile-drawer");
  const overlay = document.getElementById("drawer-overlay");
  document.getElementById("mobile-menu-btn")?.addEventListener("click", () => {
    drawer.classList.remove("translate-x-full"); overlay.classList.remove("hidden");
    document.body.style.overflow = "hidden";
  });
  const closeDrawer = () => { drawer.classList.add("translate-x-full"); overlay.classList.add("hidden"); document.body.style.overflow = ""; };
  document.getElementById("drawer-close")?.addEventListener("click", closeDrawer);
  overlay?.addEventListener("click", closeDrawer);

  loadSiteSettings();
  wireAuthUI();
  wireNotifications();
  buildSearchModal();
  buildBottomNav(activePage);
  animateCounters();
}

function toggleDD(id) {
  document.querySelectorAll(".dd-open").forEach((el) => { if (el.id !== id) { el.classList.add("hidden"); el.classList.remove("dd-open"); } });
  const el = document.getElementById(id);
  el.classList.toggle("hidden");
  el.classList.toggle("dd-open");
}
document.addEventListener("click", (e) => {
  document.querySelectorAll(".dd-open").forEach((el) => {
    if (!el.contains(e.target) && !e.target.closest("button[onclick*='toggleDD']")) { el.classList.add("hidden"); el.classList.remove("dd-open"); }
  });
});

/* ---------------- Site settings (siteSettings/main) ---------------- */
function loadSiteSettings() {
  db.collection("siteSettings").doc("main").onSnapshot((doc) => {
    const d = doc.exists ? doc.data() : {};
    SITE.settings = d;
    if (d.siteName) {
      document.querySelectorAll("title").forEach((t) => { if (!t.dataset.locked) t.textContent = t.textContent; });
    }
    if (d.logo) { const a = document.getElementById("hdr-logo"), b = document.getElementById("ftr-logo"); if (a) a.src = d.logo; if (b) b.src = d.logo; }
    if (d.footerText) { const el = document.getElementById("ftr-text"); if (el) el.textContent = d.footerText; }
    const socialWrap = document.getElementById("ftr-social");
    if (socialWrap) {
      socialWrap.innerHTML = "";
      if (d.facebook) socialWrap.innerHTML += `<a href="${d.facebook}" target="_blank" class="w-9 h-9 rounded-full surface flex items-center justify-center hover:text-accent"><span class="material-symbols-rounded text-lg">thumb_up</span></a>`;
      if (d.youtube) socialWrap.innerHTML += `<a href="${d.youtube}" target="_blank" class="w-9 h-9 rounded-full surface flex items-center justify-center hover:text-accent"><span class="material-symbols-rounded text-lg">smart_display</span></a>`;
      if (d.whatsapp) socialWrap.innerHTML += `<a href="https://wa.me/${d.whatsapp}" target="_blank" class="w-9 h-9 rounded-full surface flex items-center justify-center hover:text-accent"><span class="material-symbols-rounded text-lg">chat</span></a>`;
    }
    const contactWrap = document.getElementById("ftr-contact");
    if (contactWrap && (d.contactEmail || d.contactPhone)) {
      contactWrap.innerHTML = `<a href="contact.html" class="opacity-80 hover:opacity-100 hover:text-accent">Contact Us</a>` +
        (d.contactEmail ? `<span class="opacity-80">${escapeHtml(d.contactEmail)}</span>` : "") +
        (d.contactPhone ? `<span class="opacity-80">${escapeHtml(d.contactPhone)}</span>` : "");
    }
    document.dispatchEvent(new CustomEvent("site-settings-ready", { detail: d }));
  });
}

/* ---------------- Auth UI ---------------- */
function wireAuthUI() {
  const area = document.getElementById("auth-area");
  const drawerAuth = document.getElementById("drawer-auth");
  auth.onAuthStateChanged(async (user) => {
    SITE.user = user;
    if (!user) {
      SITE.userDoc = null;
      if (area) area.innerHTML = `<a href="login.html" class="hidden sm:inline-block hdr-text px-4 py-2 rounded-xl btn-grad text-sm font-bold">Login</a>`;
      if (drawerAuth) drawerAuth.innerHTML = `<a href="login.html" class="w-full text-center py-2.5 rounded-xl btn-grad font-bold text-sm">Login</a><a href="register.html" class="w-full text-center py-2.5 rounded-xl btn-outline font-bold text-sm">Register</a>`;
      document.dispatchEvent(new CustomEvent("auth-ready", { detail: null }));
      return;
    }
    let doc;
    try { doc = await db.collection("users").doc(user.uid).get(); } catch (e) { doc = null; }
    const data = doc && doc.exists ? doc.data() : { name: user.email, status: "pending" };
    SITE.userDoc = data;
    const initial = (data.name || user.email || "U")[0].toUpperCase();
    if (area) {
      area.innerHTML = `
        <div class="relative">
          <button onclick="toggleDD('profile-dd')" class="flex items-center gap-2 pl-1 pr-2 py-1 rounded-xl hover:bg-white/10">
            ${data.photo ? `<img src="${data.photo}" class="w-8 h-8 rounded-full object-cover">` : `<div class="w-8 h-8 rounded-full bg-accent text-white flex items-center justify-center font-bold text-sm">${initial}</div>`}
          </button>
          <div id="profile-dd" class="hidden absolute right-0 mt-2 w-56 surface rounded-2xl shadow-2xl p-1.5 fade-in">
            <p class="px-3 py-2 text-xs opacity-60 truncate">${escapeHtml(data.name || user.email)}</p>
            <p class="px-3 pb-2 text-[11px]"><span class="px-2 py-0.5 rounded-full ${statusBadgeClass(data.status)}">${statusLabel(data.status)}</span></p>
            <a href="profile.html" class="w-full text-left px-3 py-2 rounded-xl hover:bg-black/5 dark:hover:bg-white/10 text-sm flex items-center gap-2"><span class="material-symbols-rounded text-lg">badge</span>My Profile</a>
            <a href="membership.html" class="w-full text-left px-3 py-2 rounded-xl hover:bg-black/5 dark:hover:bg-white/10 text-sm flex items-center gap-2"><span class="material-symbols-rounded text-lg">card_membership</span>Membership</a>
            <button onclick="siteLogout()" class="w-full text-left px-3 py-2 rounded-xl hover:bg-red-50 dark:hover:bg-red-500/10 text-sm text-red-600 flex items-center gap-2"><span class="material-symbols-rounded text-lg">logout</span>Logout</button>
          </div>
        </div>`;
    }
    if (drawerAuth) {
      drawerAuth.innerHTML = `<a href="profile.html" class="w-full text-center py-2.5 rounded-xl btn-grad font-bold text-sm">My Profile</a><button onclick="siteLogout()" class="w-full text-center py-2.5 rounded-xl btn-outline font-bold text-sm">Logout</button>`;
    }
    document.dispatchEvent(new CustomEvent("auth-ready", { detail: data }));
  });
}
function siteLogout() { auth.signOut().then(() => { showToast("Logged out"); setTimeout(() => (location.href = "index.html"), 500); }); }
function statusLabel(s) { return { approved: "Approved Member", pending: "Approval Pending", rejected: "Rejected", suspended: "Suspended" }[s] || "Pending"; }
function statusBadgeClass(s) { return { approved: "bg-emerald-100 text-emerald-700", pending: "bg-amber-100 text-amber-700", rejected: "bg-red-100 text-red-700", suspended: "bg-slate-200 text-slate-600" }[s] || "bg-amber-100 text-amber-700"; }

/* ---------------- Notifications (derived, no new collection) ---------------- */
function wireNotifications() {
  const list = [];
  let noticesData = [], eventsData = [];
  const render = () => {
    const combined = [...noticesData.map((n) => ({ type: "notice", ...n })), ...eventsData.map((e) => ({ type: "event", ...e }))]
      .sort((a, b) => (b.createdAt?.toMillis?.() || 0) - (a.createdAt?.toMillis?.() || 0)).slice(0, 8);
    const listEl = document.getElementById("notif-list");
    if (!listEl) return;
    if (!combined.length) { listEl.innerHTML = `<div class="empty-state py-6 text-xs">No notifications yet</div>`; return; }
    listEl.innerHTML = combined.map((n) => `
      <a href="${n.type === "notice" ? "notice.html" : "event.html"}" class="flex gap-2 items-start px-3 py-2.5 rounded-xl hover:bg-black/5 dark:hover:bg-white/10">
        <span class="material-symbols-rounded text-accent mt-0.5 text-lg">${n.type === "notice" ? "campaign" : "event"}</span>
        <span class="flex-1"><span class="block font-semibold text-xs leading-snug">${escapeHtml(n.title)}</span><span class="block text-[11px] opacity-60">${timeAgo(n.createdAt)}</span></span>
      </a>`).join("");
    const lastSeen = parseInt(localStorage.getItem("ohsa-notif-seen") || "0", 10);
    const latest = combined[0]?.createdAt?.toMillis?.() || 0;
    const dot = document.getElementById("notif-dot");
    if (dot) dot.classList.toggle("hidden", latest <= lastSeen);
  };
  db.collection("notices").orderBy("createdAt", "desc").limit(5).onSnapshot((s) => { noticesData = s.docs.map((d) => ({ id: d.id, ...d.data() })); render(); }, () => {});
  db.collection("events").orderBy("createdAt", "desc").limit(5).onSnapshot((s) => { eventsData = s.docs.map((d) => ({ id: d.id, ...d.data() })); render(); }, () => {});
  document.addEventListener("click", (e) => {
    if (e.target.closest("button[onclick*=\"toggleDD('notif-dd')\"]")) {
      localStorage.setItem("ohsa-notif-seen", Date.now().toString());
      setTimeout(() => document.getElementById("notif-dot")?.classList.add("hidden"), 400);
    }
  });
}

/* ---------------- Global search ---------------- */
function buildSearchModal() {
  if (document.getElementById("search-modal")) return;
  const modal = document.createElement("div");
  modal.id = "search-modal";
  modal.className = "hidden fixed inset-0 z-[200] bg-black/60 items-start justify-center pt-24 px-4";
  modal.innerHTML = `
    <div class="surface rounded-2xl w-full max-w-xl shadow-2xl overflow-hidden fade-in">
      <div class="flex items-center gap-2 p-4 border-b border-[var(--border)]">
        <span class="material-symbols-rounded opacity-50">search</span>
        <input id="search-input" placeholder="Search events, notices, teachers, alumni..." class="flex-1 bg-transparent outline-none text-sm"/>
        <button onclick="closeSearch()" class="p-1 rounded-lg hover:bg-black/5 dark:hover:bg-white/10"><span class="material-symbols-rounded">close</span></button>
      </div>
      <div id="search-results" class="max-h-96 overflow-y-auto p-2"><div class="empty-state py-8 text-xs">Type to search across the whole site</div></div>
    </div>`;
  document.body.appendChild(modal);
  let debounce;
  document.getElementById("search-input").addEventListener("input", (e) => {
    clearTimeout(debounce);
    debounce = setTimeout(() => runSearch(e.target.value.trim()), 300);
  });
}
function openSearch() { document.getElementById("search-modal").classList.remove("hidden"); document.getElementById("search-modal").classList.add("flex"); document.getElementById("search-input").focus(); }
function closeSearch() { document.getElementById("search-modal").classList.add("hidden"); document.getElementById("search-modal").classList.remove("flex"); }
async function runSearch(q) {
  const resEl = document.getElementById("search-results");
  if (!q) { resEl.innerHTML = `<div class="empty-state py-8 text-xs">Type to search across the whole site</div>`; return; }
  resEl.innerHTML = `<div class="empty-state py-8 text-xs">Searching…</div>`;
  const lc = q.toLowerCase();
  const tasks = [
    { coll: "events", field: "title", href: "event.html", icon: "event" },
    { coll: "notices", field: "title", href: "notice.html", icon: "campaign" },
    { coll: "teachers", field: "name", href: "headmaster.html", icon: "school" },
    { coll: "executive", field: "name", href: "executive.html", icon: "groups" },
    { coll: "exStudents", field: "name", href: "exstudent.html", icon: "diversity_3" },
  ];
  try {
    const results = [];
    for (const t of tasks) {
      const snap = await db.collection(t.coll).limit(50).get();
      snap.docs.forEach((d) => {
        const v = (d.data()[t.field] || "").toString();
        if (v.toLowerCase().includes(lc)) results.push({ ...t, id: d.id, label: v });
      });
    }
    if (!results.length) { resEl.innerHTML = `<div class="empty-state py-8 text-xs">No results for "${escapeHtml(q)}"</div>`; return; }
    resEl.innerHTML = results.slice(0, 20).map((r) => `
      <a href="${r.href}" class="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-black/5 dark:hover:bg-white/10">
        <span class="material-symbols-rounded text-accent">${r.icon}</span>
        <span class="text-sm font-medium">${escapeHtml(r.label)}</span>
        <span class="ml-auto text-[10px] uppercase opacity-50">${r.coll}</span>
      </a>`).join("");
  } catch (e) { resEl.innerHTML = `<div class="empty-state py-8 text-xs">Search failed. Please check your connection.</div>`; }
}

/* ---------------- Bottom nav (mobile) ---------------- */
function buildBottomNav(active) {
  if (window.innerWidth > 1024 && !("ontouchstart" in window)) { /* still render, css hides on lg+ */ }
  const el = document.createElement("div");
  el.id = "bottom-nav";
  el.className = "lg:hidden glass border-t border-[var(--border)] flex justify-around items-center h-16";
  el.innerHTML = BOTTOM_NAV.map((i) => `
    <a href="${i.href}" class="flex flex-col items-center justify-center gap-0.5 text-[10px] font-semibold opacity-70 ${active === i.href ? "active opacity-100" : ""}">
      <span class="material-symbols-rounded text-xl">${i.icon}</span>${i.label}
    </a>`).join("");
  document.body.appendChild(el);
}

/* ---------------- Auth guard for protected pages ---------------- */
function requireLogin(redirect = "login.html") {
  return new Promise((resolve) => {
    auth.onAuthStateChanged((user) => {
      if (!user) { window.location.href = redirect + "?next=" + encodeURIComponent(location.pathname.split("/").pop()); return; }
      resolve(user);
    });
  });
}