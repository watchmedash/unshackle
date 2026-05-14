const http = require('http');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const { URL } = require('url');

const PORT = 7736;
const DATA_FILE = path.join(__dirname, 'data', 'properties.json');
const SESSIONS_FILE = path.join(__dirname, 'data', 'sessions.json');
const UPLOADS_DIR = path.join(__dirname, 'public', 'uploads', 'properties');

// ─── Ensure dirs & data files exist ─────────────────────────────────────────
[path.join(__dirname, 'data'), UPLOADS_DIR].forEach(d => {
  if (!fs.existsSync(d)) fs.mkdirSync(d, { recursive: true });
});

if (!fs.existsSync(DATA_FILE)) {
  const seed = {
    properties: [
      {
        id: 'p1', title: 'Luxury Penthouse in Al Majaz', type: 'Apartment', status: 'For Sale',
        price: 2800000, currency: 'AED', bedrooms: 4, bathrooms: 3, area: 320, areaUnit: 'sqm',
        location: 'Al Majaz, Sharjah', description: 'Stunning penthouse with panoramic views of Khalid Lagoon. Floor-to-ceiling windows, premium finishes, and a private terrace make this an unmatched luxury offering in the heart of Sharjah.',
        features: ['Private Terrace', 'Lagoon View', 'Smart Home', 'Covered Parking', 'Gym Access', 'Swimming Pool'],
        images: [], videos: [], featured: true, createdAt: new Date().toISOString()
      },
      {
        id: 'p2', title: 'Modern Villa in Hoshi', type: 'Villa', status: 'For Sale',
        price: 4500000, currency: 'AED', bedrooms: 5, bathrooms: 6, area: 650, areaUnit: 'sqm',
        location: 'Hoshi, Sharjah', description: 'Expansive family villa with private garden, swimming pool, and maid room. Located in a peaceful gated community with 24-hour security and easy highway access.',
        features: ['Private Pool', 'Garden', 'Maid Room', 'Driver Room', 'Smart Home', '3-Car Garage'],
        images: [], videos: [], featured: true, createdAt: new Date().toISOString()
      },
      {
        id: 'p3', title: 'Studio Apartment in Al Nahda', type: 'Apartment', status: 'For Rent',
        price: 28000, currency: 'AED/yr', bedrooms: 0, bathrooms: 1, area: 45, areaUnit: 'sqm',
        location: 'Al Nahda, Sharjah', description: 'Well-maintained studio apartment ideal for professionals. Close to major supermarkets, public transport, and the Sharjah-Dubai border. Fully fitted kitchen.',
        features: ['Fitted Kitchen', 'Built-in Wardrobes', 'Covered Parking', 'Security'],
        images: [], videos: [], featured: false, createdAt: new Date().toISOString()
      },
      {
        id: 'p4', title: 'Waterfront Office in Al Khan', type: 'Commercial', status: 'For Rent',
        price: 95000, currency: 'AED/yr', bedrooms: null, bathrooms: 2, area: 180, areaUnit: 'sqm',
        location: 'Al Khan, Sharjah', description: 'Premium Grade-A office space with stunning lagoon views. Open plan layout with private meeting rooms, reception area, and ample parking for staff and clients.',
        features: ['Lagoon View', 'Meeting Rooms', 'Reception', 'Pantry', 'Parking', 'Central AC'],
        images: [], videos: [], featured: false, createdAt: new Date().toISOString()
      }
    ],
    settings: { companyName: 'Art Real Estate', phone: '+971 5 5176 1111', email: 'info@artrealstate.ae', whatsapp: '+971551761111' },
    enquiries: []
  };
  fs.writeFileSync(DATA_FILE, JSON.stringify(seed, null, 2));
}

if (!fs.existsSync(SESSIONS_FILE)) fs.writeFileSync(SESSIONS_FILE, JSON.stringify({}));

// ─── Admin credentials (simple hash) ────────────────────────────────────────
const ADMIN_USER = 'admin';
const ADMIN_PASS_HASH = crypto.createHash('sha256').update('pogisidash').digest('hex');

// ─── Helpers ─────────────────────────────────────────────────────────────────
function readData() { return JSON.parse(fs.readFileSync(DATA_FILE, 'utf8')); }
function writeData(d) { fs.writeFileSync(DATA_FILE, JSON.stringify(d, null, 2)); }
function readSessions() { try { return JSON.parse(fs.readFileSync(SESSIONS_FILE, 'utf8')); } catch { return {}; } }
function writeSessions(s) { fs.writeFileSync(SESSIONS_FILE, JSON.stringify(s)); }
function uid() { return crypto.randomUUID ? crypto.randomUUID() : crypto.randomBytes(16).toString('hex'); }

function getSession(req) {
  const cookies = parseCookies(req);
  const sid = cookies['art_sid'];
  if (!sid) return null;
  const sessions = readSessions();
  const session = sessions[sid];
  if (!session) return null;
  if (Date.now() > session.expires) { delete sessions[sid]; writeSessions(sessions); return null; }
  return session;
}

function createSession() {
  const sid = uid();
  const sessions = readSessions();
  sessions[sid] = { admin: true, expires: Date.now() + 24 * 60 * 60 * 1000 };
  writeSessions(sessions);
  return sid;
}

function destroySession(req) {
  const cookies = parseCookies(req);
  const sid = cookies['art_sid'];
  if (sid) { const s = readSessions(); delete s[sid]; writeSessions(s); }
}

function parseCookies(req) {
  const list = {};
  const header = req.headers.cookie || '';
  header.split(';').forEach(c => {
    const [k, ...v] = c.trim().split('=');
    if (k) list[k.trim()] = decodeURIComponent(v.join('='));
  });
  return list;
}

function serveStatic(res, filePath) {
  const ext = path.extname(filePath).toLowerCase();
  const mimeTypes = {
    '.html': 'text/html', '.css': 'text/css', '.js': 'application/javascript',
    '.png': 'image/png', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg',
    '.gif': 'image/gif', '.webp': 'image/webp', '.svg': 'image/svg+xml',
    '.ico': 'image/x-icon', '.mp4': 'video/mp4', '.webm': 'video/webm',
    '.mov': 'video/quicktime', '.json': 'application/json'
  };
  const mime = mimeTypes[ext] || 'application/octet-stream';
  if (!fs.existsSync(filePath)) { res.writeHead(404); res.end('Not found'); return; }
  
  // Support range requests for videos
  const stat = fs.statSync(filePath);
  if (mime.startsWith('video/') && req) {
    // handled separately
  }
  res.writeHead(200, { 'Content-Type': mime, 'Content-Length': stat.size });
  fs.createReadStream(filePath).pipe(res);
}

function parseBody(req) {
  return new Promise((resolve, reject) => {
    let body = '';
    req.on('data', d => body += d);
    req.on('end', () => {
      try {
        const ct = req.headers['content-type'] || '';
        if (ct.includes('application/json')) resolve(JSON.parse(body));
        else resolve(parseUrlEncoded(body));
      } catch { resolve({}); }
    });
    req.on('error', reject);
  });
}

function parseUrlEncoded(str) {
  const obj = {};
  str.split('&').forEach(pair => {
    const [k, ...v] = pair.split('=');
    if (k) obj[decodeURIComponent(k.replace(/\+/g, ' '))] = decodeURIComponent(v.join('=').replace(/\+/g, ' '));
  });
  return obj;
}

// ─── Multipart parser ─────────────────────────────────────────────────────────
function parseMultipart(req) {
  return new Promise((resolve, reject) => {
    const ct = req.headers['content-type'] || '';
    const boundaryMatch = ct.match(/boundary=(.+)/);
    if (!boundaryMatch) return resolve({ fields: {}, files: [] });
    const boundary = '--' + boundaryMatch[1];
    const chunks = [];
    req.on('data', d => chunks.push(d));
    req.on('end', () => {
      const buf = Buffer.concat(chunks);
      const fields = {};
      const files = [];
      const bBuf = Buffer.from(boundary);
      const parts = splitBuffer(buf, bBuf);
      parts.forEach(part => {
        if (!part || part.length < 4) return;
        const headerEnd = indexOfSequence(part, Buffer.from('\r\n\r\n'));
        if (headerEnd === -1) return;
        const headerStr = part.slice(0, headerEnd).toString('utf8');
        const bodyBuf = part.slice(headerEnd + 4);
        const trimmedBody = bodyBuf.slice(0, bodyBuf.length - 2); // remove trailing \r\n
        const nameMatch = headerStr.match(/name="([^"]+)"/);
        const filenameMatch = headerStr.match(/filename="([^"]+)"/);
        const ctMatch = headerStr.match(/Content-Type: (.+)/i);
        if (!nameMatch) return;
        const fieldName = nameMatch[1];
        if (filenameMatch && filenameMatch[1]) {
          const originalName = filenameMatch[1];
          const ext = path.extname(originalName);
          const saveName = uid() + ext;
          const savePath = path.join(UPLOADS_DIR, saveName);
          fs.writeFileSync(savePath, trimmedBody);
          files.push({ fieldname: fieldName, originalname: originalName, filename: saveName, path: savePath, mimetype: (ctMatch ? ctMatch[1].trim() : 'application/octet-stream'), size: trimmedBody.length });
        } else {
          fields[fieldName] = trimmedBody.toString('utf8');
        }
      });
      resolve({ fields, files });
    });
    req.on('error', reject);
  });
}

function splitBuffer(buf, delimiter) {
  const parts = [];
  let start = 0;
  while (true) {
    const idx = indexOfSequence(buf, delimiter, start);
    if (idx === -1) break;
    parts.push(buf.slice(start, idx));
    start = idx + delimiter.length;
    // skip \r\n after boundary
    if (buf[start] === 13 && buf[start + 1] === 10) start += 2;
    else if (buf[start] === 45 && buf[start + 1] === 45) break; // --
  }
  return parts;
}

function indexOfSequence(buf, seq, start = 0) {
  for (let i = start; i <= buf.length - seq.length; i++) {
    let found = true;
    for (let j = 0; j < seq.length; j++) {
      if (buf[i + j] !== seq[j]) { found = false; break; }
    }
    if (found) return i;
  }
  return -1;
}

// ─── HTML Templates ──────────────────────────────────────────────────────────
function layout(title, body, isAdmin = false) {
  const data = readData();
  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>${title} | Art Real Estate</title>
<link rel="icon" type="image/png" href="/images/logo.png">
<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.0/css/all.min.css">
<link href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@300;400;500;600;700&family=DM+Sans:wght@300;400;500;600&display=swap" rel="stylesheet">
<link rel="stylesheet" href="/css/main.css">
<link href="https://fonts.googleapis.com/css2?family=Cairo:wght@300;400;600;700&display=swap" rel="stylesheet">
</head>
<body>
<nav class="navbar" id="navbar">
  <div class="nav-container">
    <a href="/" class="nav-logo">
      <img src="/images/logo.png" alt="Art Real Estate" class="logo-img">
      <span class="logo-text">Art Real Estate</span>
    </a>
    <div class="nav-links" id="navLinks">
      <a href="/" class="nav-link"><i class="fa-solid fa-house"></i> <span data-i18n="nav_home"><span data-i18n="nav_home">Home</span></span></a>
      <a href="/properties" class="nav-link"><i class="fa-solid fa-building"></i> <span data-i18n="nav_properties">Properties</span></a>
      <a href="/properties?status=For+Sale" class="nav-link"><i class="fa-solid fa-tag"></i> <span data-i18n="nav_buy">Buy</span></a>
      <a href="/properties?status=For+Rent" class="nav-link"><i class="fa-solid fa-key"></i> <span data-i18n="nav_rent">Rent</span></a>
      <a href="/contact" class="nav-link"><i class="fa-solid fa-envelope"></i> <span data-i18n="nav_contact">Contact</span></a>
      ${isAdmin ? '<a href="/admin" class="nav-link nav-admin"><i class="fa-solid fa-shield-halved"></i> Admin</a>' : ''}
      <button class="lang-toggle-mobile" id="langToggleMobile" aria-label="Toggle language">
        <i class="fa-solid fa-language"></i>
        <span class="lang-en">العربية</span>
        <span class="lang-ar">English</span>
      </button>
    </div>
    <button class="lang-toggle" id="langToggle" aria-label="Toggle language">
      <span class="lang-en">AR</span>
      <span class="lang-ar">EN</span>
    </button>
    <button class="burger" id="burger" aria-label="Menu">
      <span></span><span></span><span></span>
    </button>
  </div>
</nav>
${body}
<footer class="footer">
  <div class="footer-container">
    <div class="footer-brand">
      <img src="/images/logo.png" alt="Art Real Estate" class="footer-logo">
      <p class="footer-tagline" data-i18n="footer_tagline">Your trusted real estate partner in Sharjah</p>
      <div class="footer-social">
        <a href="#" aria-label="Facebook"><i class="fa-brands fa-facebook"></i></a>
        <a href="#" aria-label="Instagram"><i class="fa-brands fa-instagram"></i></a>
        <a href="#" aria-label="LinkedIn"><i class="fa-brands fa-linkedin"></i></a>
        <a href="https://wa.me/${data.settings.whatsapp}" aria-label="WhatsApp"><i class="fa-brands fa-whatsapp"></i></a>
      </div>
    </div>
    <div class="footer-col">
      <h4 data-i18n="footer_quick_links">Quick Links</h4>
      <a href="/properties?status=For+Sale"><span data-i18n="footer_for_sale">Properties for Sale</span></a>
      <a href="/properties?status=For+Rent"><span data-i18n="footer_for_rent">Properties for Rent</span></a>
      <a href="/properties?type=Villa"><span data-i18n="footer_villas">Villas</span></a>
      <a href="/properties?type=Apartment"><span data-i18n="footer_apartments">Apartments</span></a>
      <a href="/properties?type=Commercial"><span data-i18n="footer_commercial">Commercial</span></a>
    </div>
    <div class="footer-col">
      <h4 data-i18n="footer_contact_us">Contact Us</h4>
      <p><i class="fa-solid fa-location-dot"></i> <span data-i18n="footer_location">Muwaileh Sharjah, UAE</span></p>
      <p><i class="fa-solid fa-phone"></i> ${data.settings.phone}</p>
      <p><i class="fa-solid fa-envelope"></i> ${data.settings.email}</p>
    </div>
  </div>
  <div class="footer-bottom">
    <p>&copy; ${new Date().getFullYear()} Art Real Estate. <span data-i18n="footer_rights">All rights reserved.</span></p>
  </div>
</footer>
<script src="/js/i18n.js"></script>
<script src="/js/main.js"></script>
</body>
</html>`;
}

function adminLayout(title, body) {
  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>${title} | Admin - Art Real Estate</title>
<link rel="icon" type="image/png" href="/images/logo.png">
<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.0/css/all.min.css">
<link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600&display=swap" rel="stylesheet">
<link rel="stylesheet" href="/css/admin.css">
</head>
<body class="admin-body">
<div class="admin-wrapper">
  <aside class="admin-sidebar" id="adminSidebar">
    <div class="sidebar-header">
      <img src="/images/logo.png" alt="Art Real Estate" class="sidebar-logo">
      <span>Admin Panel</span>
      <button class="sidebar-close" id="sidebarClose"><i class="fa-solid fa-xmark"></i></button>
    </div>
    <nav class="sidebar-nav">
      <a href="/admin" class="sidebar-link"><i class="fa-solid fa-gauge"></i> Dashboard</a>
      <a href="/admin/properties" class="sidebar-link"><i class="fa-solid fa-building"></i> Properties</a>
      <a href="/admin/properties/new" class="sidebar-link"><i class="fa-solid fa-plus"></i> Add Property</a>
      <a href="/admin/enquiries" class="sidebar-link sidebar-enquiries"><i class="fa-solid fa-inbox"></i> Enquiries <span class="sidebar-badge" id="unreadBadge"></span></a>
      <a href="/admin/settings" class="sidebar-link"><i class="fa-solid fa-gear"></i> Settings</a>
    </nav>
    <div class="sidebar-footer">
      <a href="/" class="sidebar-link" target="_blank"><i class="fa-solid fa-arrow-up-right-from-square"></i> View Site</a>
      <a href="/admin/logout" class="sidebar-link sidebar-logout"><i class="fa-solid fa-right-from-bracket"></i> Logout</a>
    </div>
  </aside>
  <div class="admin-main">
    <header class="admin-header">
      <button class="burger-admin" id="burgerAdmin"><i class="fa-solid fa-bars"></i></button>
      <h1 class="admin-page-title">${title}</h1>
      <div class="admin-header-right">
        <span class="admin-user"><i class="fa-solid fa-user-shield"></i> Administrator</span>
      </div>
    </header>
    <div class="admin-content">
      ${body}
    </div>
  </div>
</div>
<script src="/js/admin.js"></script>
</body>
</html>`;
}

// ─── Page renderers ───────────────────────────────────────────────────────────
function homePage() {
  const data = readData();
  const featured = data.properties.filter(p => p.featured).slice(0, 3);
  const stats = [
    { icon: 'fa-building', value: data.properties.length + '+', label: 'Properties', i18n: 'stat_properties' },
    { icon: 'fa-handshake', value: '500+', label: 'Happy Clients', i18n: 'stat_clients' },
    { icon: 'fa-award', value: '10+', label: 'Years Experience', i18n: 'stat_experience' },
    { icon: 'fa-map-location-dot', value: 'Sharjah', label: 'Prime Location', i18n: 'stat_location' },
  ];
  return layout('Home', `
<section class="hero">
  <div class="hero-bg"></div>
  <div class="hero-overlay"></div>
  <div class="hero-content">
    <div class="hero-badge"><i class="fa-solid fa-star"></i> <span data-i18n="hero_badge">Sharjah's Premier Real Estate</span></div>
    <h1 class="hero-title" data-i18n="hero_title">Find Your <span class="hero-accent" data-i18n="hero_title_accent">Perfect</span><br><span data-i18n="hero_title_2">Property in Sharjah</span></h1>
    <p class="hero-sub" data-i18n="hero_sub">Discover exceptional homes, villas, and commercial spaces across Sharjah's most desirable locations.</p>
    <div class="hero-search">
      <form action="/properties" method="GET" class="search-form">
        <div class="search-fields">
          <div class="search-field">
            <label><i class="fa-solid fa-magnifying-glass"></i></label>
            <input type="text" name="q" placeholder="Search by location, title..." data-i18n-placeholder="search_placeholder">
          </div>
          <div class="search-divider"></div>
          <div class="search-field">
            <label><i class="fa-solid fa-tag"></i></label>
            <select name="status">
              <option value="" data-i18n="search_buy_rent">Buy or Rent</option>
              <option value="For Sale">For Sale</option>
              <option value="For Rent">For Rent</option>
            </select>
          </div>
          <div class="search-divider"></div>
          <div class="search-field">
            <label><i class="fa-solid fa-building"></i></label>
            <select name="type">
              <option value="" data-i18n="search_prop_type">Property Type</option>
              <option value="Apartment">Apartment</option>
              <option value="Villa">Villa</option>
              <option value="Commercial"><span data-i18n="footer_commercial">Commercial</span></option>
              <option value="Townhouse">Townhouse</option>
            </select>
          </div>
          <button type="submit" class="search-btn" data-i18n="search_btn">Search</button>
        </div>
      </form>
    </div>
  </div>
  <div class="hero-scroll"><i class="fa-solid fa-chevron-down"></i></div>
</section>

<section class="stats-bar">
  <div class="container">
    <div class="stats-grid">
      ${stats.map(s => `
      <div class="stat-item">
        <i class="fa-solid ${s.icon}"></i>
        <div>
          <div class="stat-value">${s.value}</div>
          <div class="stat-label" data-i18n="${s.i18n}">${s.label}</div>
        </div>
      </div>`).join('')}
    </div>
  </div>
</section>

<section class="featured-section">
  <div class="container">
    <div class="section-header">
      <span class="section-badge" data-i18n="featured_badge">Handpicked</span>
      <h2 class="section-title" data-i18n="featured_title">Featured Properties</h2>
      <p class="section-sub" data-i18n="featured_sub">Explore our curated selection of premium properties across Sharjah</p>
    </div>
    <div class="properties-grid">
      ${featured.map(p => propertyCard(p)).join('')}
    </div>
    <div class="section-cta">
      <a href="/properties" class="btn-primary" data-i18n="view_all_btn"><i class="fa-solid fa-building"></i> <span data-i18n="view_all_btn">View All Properties</span></a>
    </div>
  </div>
</section>

<section class="why-section">
  <div class="container">
    <div class="why-grid">
      <div class="why-content">
        <span class="section-badge" data-i18n="why_badge">Why Choose Us</span>
        <h2 class="section-title" data-i18n="why_title">Sharjah Real Estate Specialists</h2>
        <p data-i18n="why_desc">With over a decade of experience in Sharjah's dynamic property market, Art Real Estate delivers unparalleled service and expertise to buyers, sellers, and investors.</p>
        <div class="why-features">
          <div class="why-feature"><i class="fa-solid fa-circle-check"></i><div><strong data-i18n="why_f1_title">Expert Local Knowledge</strong><p data-i18n="why_f1_desc">Deep understanding of Sharjah's neighborhoods and market trends</p></div></div>
          <div class="why-feature"><i class="fa-solid fa-circle-check"></i><div><strong data-i18n="why_f2_title">Transparent Transactions</strong><p data-i18n="why_f2_desc">Clear, honest guidance throughout your property journey</p></div></div>
          <div class="why-feature"><i class="fa-solid fa-circle-check"></i><div><strong data-i18n="why_f3_title">Premium Portfolio</strong><p data-i18n="why_f3_desc">Carefully curated selection of residential and commercial properties</p></div></div>
          <div class="why-feature"><i class="fa-solid fa-circle-check"></i><div><strong data-i18n="why_f4_title">After-Sale Support</strong><p data-i18n="why_f4_desc">We remain your partner long after the deal is done</p></div></div>
        </div>
        <a href="/contact" class="btn-primary" data-i18n="why_cta">Get in Touch</a>
      </div>
      <div class="why-visual">
        <div class="why-card why-card-1">
          <i class="fa-solid fa-house-chimney"></i>
          <div>
            <strong>500+</strong>
            <span>Properties Sold</span>
          </div>
        </div>
        <div class="why-card why-card-2">
          <i class="fa-solid fa-medal"></i>
          <div>
            <strong>Top Rated</strong>
            <span>Agency in Sharjah</span>
          </div>
        </div>
        <div class="why-bg-shape"></div>
      </div>
    </div>
  </div>
</section>

<section class="cta-section">
  <div class="container">
    <div class="cta-box">
      <div class="cta-content">
        <h2 data-i18n="cta_title">Ready to Find Your Dream Property?</h2>
        <p data-i18n="cta_sub">Contact our expert team today for a free consultation</p>
        <div class="cta-buttons">
          <a href="tel:${data.settings.phone}" class="btn-white" data-i18n="cta_call"><i class="fa-solid fa-phone"></i> <span data-i18n="cta_call">Call Us</span></a>
          <a href="https://wa.me/${data.settings.whatsapp}" class="btn-outline-white"><i class="fa-brands fa-whatsapp"></i> WhatsApp</a>
        </div>
      </div>
    </div>
  </div>
</section>
`);
}

function imgSrc(img) {
  return img && img.startsWith('http') ? img : `/uploads/properties/${img}`;
}

function propertyCard(p) {
  const img = p.images && p.images.length > 0 ? imgSrc(p.images[0]) : '/images/placeholder.svg';
  const price = typeof p.price === 'number' ? 'AED ' + p.price.toLocaleString() : p.price;
  return `
<div class="property-card" onclick="window.location='/property/${p.id}'">
  <div class="card-media">
    <img src="${img}" alt="${p.title}" loading="lazy">
    <div class="card-badges">
      <span class="badge badge-status ${p.status === 'For Sale' ? 'badge-sale' : 'badge-rent'}">${p.status}</span>
      <span class="badge badge-type">${p.type}</span>
    </div>
    ${p.images && p.images.length > 1 ? `<span class="card-media-count"><i class="fa-solid fa-images"></i> ${p.images.length}</span>` : ''}
    ${p.videos && p.videos.length > 0 ? `<span class="card-video-badge"><i class="fa-solid fa-video"></i></span>` : ''}
  </div>
  <div class="card-body">
    <div class="card-price">${price} <span>${p.currency && p.currency.includes('/') ? p.currency.split('/')[1] : ''}</span></div>
    <h3 class="card-title">${p.title}</h3>
    <p class="card-location"><i class="fa-solid fa-location-dot"></i> ${p.location}</p>
    <div class="card-features">
      ${p.bedrooms !== null && p.bedrooms !== undefined ? `<span><i class="fa-solid fa-bed"></i> ${p.bedrooms === 0 ? 'Studio' : p.bedrooms + ' Beds'}</span>` : ''}
      <span><i class="fa-solid fa-bath"></i> ${p.bathrooms} Bath${p.bathrooms !== 1 ? 's' : ''}</span>
      <span><i class="fa-solid fa-vector-square"></i> ${p.area} ${p.areaUnit}</span>
    </div>
  </div>
</div>`;
}

function propertiesPage(req) {
  const urlObj = new URL('http://x' + req.url);
  const q = urlObj.searchParams.get('q') || '';
  const status = urlObj.searchParams.get('status') || '';
  const type = urlObj.searchParams.get('type') || '';
  const data = readData();
  let props = data.properties;
  if (q) props = props.filter(p => p.title.toLowerCase().includes(q.toLowerCase()) || p.location.toLowerCase().includes(q.toLowerCase()));
  if (status) props = props.filter(p => p.status === status);
  if (type) props = props.filter(p => p.type === type);

  return layout('Properties', `
<div class="page-header">
  <div class="container">
    <h1 data-i18n="props_title">Properties</h1>
    <p data-i18n="props_sub">Explore our full portfolio of properties across Sharjah</p>
  </div>
</div>
<section class="properties-page">
  <div class="container">
    <div class="filter-bar">
      <form action="/properties" method="GET" class="filter-form">
        <input type="text" name="q" value="${q}" placeholder="Search properties..." data-i18n-placeholder="filter_search" class="filter-input">
        <select name="status" class="filter-select">
          <option value="" data-i18n="filter_all">All Listings</option>
          <option value="For Sale" ${status === 'For Sale' ? 'selected' : ''}>For Sale</option>
          <option value="For Rent" ${status === 'For Rent' ? 'selected' : ''}>For Rent</option>
        </select>
        <select name="type" class="filter-select">
          <option value="" data-i18n="filter_all_types">All Types</option>
          <option value="Apartment" ${type === 'Apartment' ? 'selected' : ''}>Apartment</option>
          <option value="Villa" ${type === 'Villa' ? 'selected' : ''}>Villa</option>
          <option value="Townhouse" ${type === 'Townhouse' ? 'selected' : ''}>Townhouse</option>
          <option value="Commercial" ${type === 'Commercial' ? 'selected' : ''}><span data-i18n="footer_commercial">Commercial</span></option>
        </select>
        <button type="submit" class="btn-primary" data-i18n="filter_btn"><span data-i18n="filter_btn">Filter</span></button>
        <a href="/properties" class="btn-ghost"><span data-i18n="filter_clear">Clear</span></a>
      </form>
      <div class="results-count">${props.length} propert${props.length === 1 ? 'y' : 'ies'} found</div>
    </div>
    ${props.length === 0 ? `<div class="empty-state"><i class="fa-solid fa-building-circle-xmark"></i><h3>No properties found</h3><p>Try adjusting your search filters</p></div>` : ''}
    <div class="properties-grid">
      ${props.map(p => propertyCard(p)).join('')}
    </div>
  </div>
</section>
`);
}

function propertyDetailPage(prop) {
  const price = typeof prop.price === 'number' ? 'AED ' + prop.price.toLocaleString() : prop.price;
  const mainImg = prop.images && prop.images.length > 0 ? imgSrc(prop.images[0]) : '/images/placeholder.svg';
  const data = readData();
  return layout(prop.title, `
<div class="property-detail">
  <div class="container">
    <div class="breadcrumb">
      <a href="/"><span data-i18n="nav_home">Home</span></a> <i class="fa-solid fa-chevron-right"></i>
      <a href="/properties">Properties</a> <i class="fa-solid fa-chevron-right"></i>
      <span>${prop.title}</span>
    </div>

    <div class="detail-header">
      <div>
        <div class="detail-badges">
          <span class="badge badge-status ${prop.status === 'For Sale' ? 'badge-sale' : 'badge-rent'}">${prop.status}</span>
          <span class="badge badge-type">${prop.type}</span>
        </div>
        <h1 class="detail-title">${prop.title}</h1>
        <p class="detail-location"><i class="fa-solid fa-location-dot"></i> ${prop.location}</p>
      </div>
      <div class="detail-price-box">
        <div class="detail-price">${price}</div>
        <div class="detail-currency">${prop.currency || 'AED'}</div>
      </div>
    </div>

    <!-- Gallery -->
    ${prop.images && prop.images.length > 0 ? `
    <div class="gallery">
      <div class="gallery-main">
        <img src="${imgSrc(prop.images[0])}" alt="${prop.title}" id="galleryMain" onclick="openLightbox(0)">
        <div class="gallery-count"><i class="fa-solid fa-images"></i> ${prop.images.length} Photos</div>
      </div>
      ${prop.images.length > 1 ? `
      <div class="gallery-thumbs">
        ${prop.images.slice(0, 5).map((img, i) => `
          <div class="gallery-thumb ${i === 0 ? 'active' : ''}" onclick="switchImage(${i})">
            <img src="${imgSrc(img)}" alt="Photo ${i+1}">
            ${i === 4 && prop.images.length > 5 ? `<div class="thumb-more">+${prop.images.length - 5}</div>` : ''}
          </div>`).join('')}
      </div>` : ''}
    </div>` : `<div class="gallery gallery-placeholder"><i class="fa-solid fa-image"></i><span>No photos available</span></div>`}

    <!-- Lightbox -->
    <div class="lightbox" id="lightbox" onclick="closeLightbox()">
      <button class="lightbox-close" onclick="closeLightbox()"><i class="fa-solid fa-xmark"></i></button>
      <button class="lightbox-prev" onclick="event.stopPropagation();lightboxNav(-1)"><i class="fa-solid fa-chevron-left"></i></button>
      <img src="" id="lightboxImg" onclick="event.stopPropagation()">
      <button class="lightbox-next" onclick="event.stopPropagation();lightboxNav(1)"><i class="fa-solid fa-chevron-right"></i></button>
    </div>

    <div class="detail-body">
      <div class="detail-main">
        <!-- Overview -->
        <div class="detail-section">
          <h2 data-i18n="detail_overview">Overview</h2>
          <div class="overview-grid">
            ${prop.bedrooms !== null && prop.bedrooms !== undefined ? `<div class="overview-item"><i class="fa-solid fa-bed"></i><div><span>${prop.bedrooms === 0 ? 'Studio' : prop.bedrooms}</span><label data-i18n="detail_beds">Bedrooms</label></div></div>` : ''}
            <div class="overview-item"><i class="fa-solid fa-bath"></i><div><span>${prop.bathrooms}</span><label data-i18n="detail_baths">Bathrooms</label></div></div>
            <div class="overview-item"><i class="fa-solid fa-vector-square"></i><div><span>${prop.area} ${prop.areaUnit}</span><label data-i18n="detail_area">Area</label></div></div>
            <div class="overview-item"><i class="fa-solid fa-building"></i><div><span>${prop.type}</span><label data-i18n="detail_type">Type</label></div></div>
          </div>
        </div>

        <!-- Description -->
        <div class="detail-section">
          <h2 data-i18n="detail_desc">Description</h2>
          <p class="detail-desc">${prop.description}</p>
        </div>

        <!-- Features -->
        ${prop.features && prop.features.length > 0 ? `
        <div class="detail-section">
          <h2 data-i18n="detail_features">Features & Amenities</h2>
          <div class="features-grid">
            ${prop.features.map(f => `<div class="feature-item"><i class="fa-solid fa-circle-check"></i> ${f}</div>`).join('')}
          </div>
        </div>` : ''}

        <!-- Videos -->
        ${prop.videos && prop.videos.length > 0 ? `
        <div class="detail-section">
          <h2 data-i18n="detail_videos">Property Videos</h2>
          <div class="videos-grid">
            ${prop.videos.map(v => `
            <div class="video-wrapper">
              <video controls preload="metadata">
                <source src="/uploads/properties/${v}" type="video/mp4">
                Your browser does not support video playback.
              </video>
            </div>`).join('')}
          </div>
        </div>` : ''}
      </div>

      <!-- Sidebar -->
      <aside class="detail-sidebar">
        <div class="contact-card">
          <h3 data-i18n="detail_interested">Interested in this property?</h3>
          <p data-i18n="detail_contact_desc">Contact our team for more information or to schedule a viewing.</p>
          <a href="tel:${data.settings.phone}" class="btn-primary btn-block"><i class="fa-solid fa-phone"></i> <span data-i18n="detail_call">Call Now</span></a>
          <a href="https://wa.me/${data.settings.whatsapp}?text=I'm interested in ${encodeURIComponent(prop.title)}" class="btn-whatsapp btn-block"><i class="fa-brands fa-whatsapp"></i> WhatsApp</a>
          <a href="/contact?ref=${prop.id}" class="btn-ghost btn-block"><i class="fa-solid fa-envelope"></i> <span data-i18n="detail_enquiry">Send Enquiry</span></a>
        </div>
        <div class="ref-card">
          <p><strong>Reference:</strong> ${prop.id.toUpperCase()}</p>
          <p><strong>Listed:</strong> ${new Date(prop.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
        </div>
      </aside>
    </div>
  </div>
</div>
<script>
const images = ${JSON.stringify(prop.images || [])};
let lightboxIdx = 0;
function imgSrc(img) { return img && img.startsWith('http') ? img : '/uploads/properties/' + img; }
function switchImage(i) {
  lightboxIdx = i;
  document.getElementById('galleryMain').src = imgSrc(images[i]);
  document.querySelectorAll('.gallery-thumb').forEach((t,ti) => t.classList.toggle('active', ti===i));
}
function openLightbox(i) {
  lightboxIdx = i;
  document.getElementById('lightboxImg').src = imgSrc(images[i]);
  document.getElementById('lightbox').classList.add('open');
  document.body.style.overflow = 'hidden';
}
function closeLightbox() {
  document.getElementById('lightbox').classList.remove('open');
  document.body.style.overflow = '';
}
function lightboxNav(dir) {
  lightboxIdx = (lightboxIdx + dir + images.length) % images.length;
  document.getElementById('lightboxImg').src = imgSrc(images[lightboxIdx]);
}
document.addEventListener('keydown', e => {
  if (e.key === 'Escape') closeLightbox();
  if (e.key === 'ArrowLeft') lightboxNav(-1);
  if (e.key === 'ArrowRight') lightboxNav(1);
});
</script>
`);
}

function contactPage(ref, sent = false) {
  const data = readData();
  const prop = ref ? data.properties.find(p => p.id === ref) : null;
  const defaultMsg = prop ? `I am interested in the property: ${prop.title}` : '';
  return layout('Contact Us', `
<div class="page-header">
  <div class="container">
    <h1 data-i18n="contact_title">Contact Us</h1>
    <p data-i18n="contact_sub">We'd love to hear from you</p>
  </div>
</div>
<section class="contact-section">
  <div class="container">
    ${sent ? `
    <div class="enquiry-success">
      <i class="fa-solid fa-circle-check"></i>
      <div>
        <strong data-i18n="success_title">Message sent successfully!</strong>
        <p data-i18n="success_desc">Thank you for reaching out. Our team will get back to you within 24 hours.</p>
      </div>
    </div>` : ''}
    <div class="contact-grid">
      <div class="contact-info">
        <h2 data-i18n="contact_h2">Get in Touch</h2>
        <p data-i18n="contact_desc">Whether you're looking to buy, sell, or rent, our team of experts is ready to assist you every step of the way.</p>
        <div class="contact-items">
          <div class="contact-item"><i class="fa-solid fa-location-dot"></i><div><strong data-i18n="contact_office">Office</strong><span>Muwaileh Sharjah, UAE</span></div></div>
          <div class="contact-item"><i class="fa-solid fa-phone"></i><div><strong data-i18n="contact_phone">Phone</strong><span>${data.settings.phone}</span></div></div>
          <div class="contact-item"><i class="fa-solid fa-envelope"></i><div><strong data-i18n="contact_email_label">Email</strong><span>${data.settings.email}</span></div></div>
          <div class="contact-item"><i class="fa-brands fa-whatsapp"></i><div><strong data-i18n="contact_whatsapp">WhatsApp</strong><span>${data.settings.whatsapp}</span></div></div>
        </div>
        <div class="contact-hours">
          <h4><i class="fa-solid fa-clock"></i> <span data-i18n="contact_hours">Working Hours</span></h4>
          <p data-i18n="contact_hours_1">Saturday - Thursday: 10:00 AM - 6:00 PM</p>
          <p data-i18n="contact_hours_2">Friday: Close</p>
        </div>
      </div>
      <div class="contact-form-wrap">
        <form class="contact-form" action="/contact" method="POST">
          ${ref ? `<input type="hidden" name="ref" value="${ref}">` : ''}
          ${prop ? `<div class="form-ref-banner"><i class="fa-solid fa-building"></i> Enquiring about: <strong>${prop.title}</strong></div>` : ''}
          <div class="form-row">
            <div class="form-group"><label data-i18n="form_name">Full Name</label><input type="text" name="name" required placeholder="Your name" data-i18n-placeholder="form_name_ph"></div>
            <div class="form-group"><label data-i18n="form_email">Email</label><input type="email" name="email" required placeholder="your@email.com"></div>
          </div>
          <div class="form-group"><label data-i18n="form_phone">Phone</label><input type="tel" name="phone" placeholder="+971 ..."></div>
          <div class="form-group"><label data-i18n="form_message">Message</label><textarea name="message" rows="5" required placeholder="Tell us what you're looking for..." data-i18n-placeholder="form_msg_ph">${defaultMsg}</textarea></div>
          <button type="submit" class="btn-primary btn-block" data-i18n="form_send"><i class="fa-solid fa-paper-plane"></i> <span data-i18n="form_send">Send Message</span></button>
        </form>
      </div>
    </div>
    <div class="map-wrap">
      <h2 class="map-title"><i class="fa-solid fa-location-dot"></i> <span data-i18n="contact_find_us">Find Us</span></h2>
      <div class="map-frame">
        <iframe
          src="https://www.google.com/maps?q=25.298144,55.459884&output=embed"
          width="100%" height="420" style="border:0;" allowfullscreen="" loading="lazy"
          referrerpolicy="no-referrer-when-downgrade" title="Office Location">
        </iframe>
      </div>
    </div>
  </div>
</section>
`);
}

// ─── ADMIN PAGES ──────────────────────────────────────────────────────────────
function adminDashboard() {
  const data = readData();
  const forSale = data.properties.filter(p => p.status === 'For Sale').length;
  const forRent = data.properties.filter(p => p.status === 'For Rent').length;
  return adminLayout('Dashboard', `
<div class="dash-stats">
  <div class="dash-stat">
    <i class="fa-solid fa-building"></i>
    <div><strong>${data.properties.length}</strong><span>Total Properties</span></div>
  </div>
  <div class="dash-stat">
    <i class="fa-solid fa-tag"></i>
    <div><strong>${forSale}</strong><span>For Sale</span></div>
  </div>
  <div class="dash-stat">
    <i class="fa-solid fa-key"></i>
    <div><strong>${forRent}</strong><span>For Rent</span></div>
  </div>
  <div class="dash-stat">
    <i class="fa-solid fa-star"></i>
    <div><strong>${data.properties.filter(p => p.featured).length}</strong><span>Featured</span></div>
  </div>
  <div class="dash-stat dash-stat-enquiry">
    <i class="fa-solid fa-inbox"></i>
    <div><strong>${(data.enquiries||[]).filter(e=>!e.read).length}</strong><span>Unread Enquiries</span></div>
  </div>
</div>
<div class="dash-section">
  <div class="dash-section-header">
    <h2>Recent Properties</h2>
    <a href="/admin/properties/new" class="btn-primary btn-sm"><i class="fa-solid fa-plus"></i> Add New</a>
  </div>
  <div class="admin-table-wrap">
    <table class="admin-table">
      <thead><tr><th>Title</th><th>Type</th><th>Status</th><th>Price</th><th>Featured</th><th>Actions</th></tr></thead>
      <tbody>
        ${data.properties.map(p => `
        <tr>
          <td><strong>${p.title}</strong><br><small>${p.location}</small></td>
          <td>${p.type}</td>
          <td><span class="badge ${p.status === 'For Sale' ? 'badge-sale' : 'badge-rent'}">${p.status}</span></td>
          <td>AED ${typeof p.price === 'number' ? p.price.toLocaleString() : p.price}</td>
          <td>${p.featured ? '<i class="fa-solid fa-star" style="color:var(--primary)"></i>' : '<i class="fa-regular fa-star"></i>'}</td>
          <td class="table-actions">
            <a href="/admin/properties/edit/${p.id}" class="btn-icon" title="Edit"><i class="fa-solid fa-pen"></i></a>
            <a href="/property/${p.id}" target="_blank" class="btn-icon" title="View"><i class="fa-solid fa-eye"></i></a>
            <button onclick="deleteProperty('${p.id}')" class="btn-icon btn-danger" title="Delete"><i class="fa-solid fa-trash"></i></button>
          </td>
        </tr>`).join('')}
      </tbody>
    </table>
  </div>
</div>

<div class="dash-section" style="margin-top:20px">
  <div class="dash-section-header">
    <h2>Recent Enquiries</h2>
    <a href="/admin/enquiries" class="btn-primary btn-sm"><i class="fa-solid fa-inbox"></i> View All</a>
  </div>
  ${(data.enquiries||[]).length === 0 ? '<p style="color:var(--text-light);padding:16px 0">No enquiries yet.</p>' : `
  <div class="admin-table-wrap">
    <table class="admin-table">
      <thead><tr><th></th><th>Name</th><th>Email</th><th>Property</th><th>Date</th><th>Actions</th></tr></thead>
      <tbody>
        ${(data.enquiries||[]).slice(0,5).map(e => `
        <tr class="${e.read ? '' : 'row-unread'}">
          <td>${!e.read ? '<span class="unread-dot"></span>' : ''}</td>
          <td><strong>${escHtml(e.name)}</strong></td>
          <td><a href="mailto:${escHtml(e.email)}">${escHtml(e.email)}</a></td>
          <td>${e.propertyTitle ? escHtml(e.propertyTitle) : '<span style="color:var(--gray-3)">General</span>'}</td>
          <td style="white-space:nowrap;font-size:0.8rem">${new Date(e.createdAt).toLocaleDateString('en-GB',{day:'numeric',month:'short',year:'numeric'})}</td>
          <td class="table-actions">
            <a href="/admin/enquiries" class="btn-icon" title="View"><i class="fa-solid fa-eye"></i></a>
            <button onclick="deleteEnquiry('${e.id}')" class="btn-icon btn-danger" title="Delete"><i class="fa-solid fa-trash"></i></button>
          </td>
        </tr>`).join('')}
      </tbody>
    </table>
  </div>`}
</div>
`);
}

function adminPropertiesList() {
  const data = readData();
  return adminLayout('Properties', `
<div class="dash-section-header">
  <h2>All Properties</h2>
  <a href="/admin/properties/new" class="btn-primary"><i class="fa-solid fa-plus"></i> Add Property</a>
</div>
<div class="admin-table-wrap">
  <table class="admin-table">
    <thead><tr><th>Photo</th><th>Title</th><th>Type</th><th>Status</th><th>Price (AED)</th><th>Media</th><th>Featured</th><th>Actions</th></tr></thead>
    <tbody>
      ${data.properties.map(p => {
        const img = p.images && p.images.length > 0 ? imgSrc(p.images[0]) : '/images/placeholder.svg';
        return `
        <tr>
          <td><img src="${img}" class="table-thumb" alt="${p.title}"></td>
          <td><strong>${p.title}</strong><br><small>${p.location}</small></td>
          <td>${p.type}</td>
          <td><span class="badge ${p.status === 'For Sale' ? 'badge-sale' : 'badge-rent'}">${p.status}</span></td>
          <td>${typeof p.price === 'number' ? p.price.toLocaleString() : p.price}</td>
          <td><i class="fa-solid fa-images"></i> ${(p.images||[]).length} &nbsp;<i class="fa-solid fa-video"></i> ${(p.videos||[]).length}</td>
          <td>${p.featured ? '<i class="fa-solid fa-star" style="color:var(--primary)"></i>' : ''}</td>
          <td class="table-actions">
            <a href="/admin/properties/edit/${p.id}" class="btn-icon"><i class="fa-solid fa-pen"></i></a>
            <a href="/property/${p.id}" target="_blank" class="btn-icon"><i class="fa-solid fa-eye"></i></a>
            <button onclick="deleteProperty('${p.id}')" class="btn-icon btn-danger"><i class="fa-solid fa-trash"></i></button>
          </td>
        </tr>`;
      }).join('')}
    </tbody>
  </table>
</div>
`);
}

function propertyForm(prop = null) {
  const isEdit = !!prop;
  const p = prop || { title:'', type:'Apartment', status:'For Sale', price:'', currency:'AED', bedrooms:'', bathrooms:'', area:'', areaUnit:'sqm', location:'', description:'', features:[], images:[], videos:[], featured:false };
  const featuresStr = Array.isArray(p.features) ? p.features.join(', ') : (p.features || '');
  return adminLayout(isEdit ? 'Edit Property' : 'Add Property', `
<div class="form-page">
  <form id="propertyForm" enctype="multipart/form-data" method="POST" action="${isEdit ? '/admin/properties/edit/' + p.id : '/admin/properties/new'}">
    <div class="form-grid">
      <div class="form-main">
        <div class="form-card">
          <h3>Basic Information</h3>
          <div class="form-group"><label>Property Title *</label><input type="text" name="title" value="${p.title}" required placeholder="e.g. Luxury Penthouse in Al Majaz"></div>
          <div class="form-row">
            <div class="form-group"><label>Property Type *</label>
              <select name="type" required>
                ${['Apartment','Villa','Townhouse','Commercial','Land','Penthouse'].map(t => `<option value="${t}" ${p.type===t?'selected':''}>${t}</option>`).join('')}
              </select>
            </div>
            <div class="form-group"><label>Status *</label>
              <select name="status" required>
                <option value="For Sale" ${p.status==='For Sale'?'selected':''}>For Sale</option>
                <option value="For Rent" ${p.status==='For Rent'?'selected':''}>For Rent</option>
                <option value="Sold" ${p.status==='Sold'?'selected':''}>Sold</option>
                <option value="Rented" ${p.status==='Rented'?'selected':''}>Rented</option>
              </select>
            </div>
          </div>
          <div class="form-row">
            <div class="form-group"><label>Price *</label><input type="number" name="price" value="${p.price}" required placeholder="e.g. 1500000"></div>
            <div class="form-group"><label>Currency</label>
              <select name="currency">
                <option value="AED" ${p.currency==='AED'?'selected':''}>AED</option>
                <option value="AED/yr" ${p.currency==='AED/yr'?'selected':''}>AED/year</option>
                <option value="AED/mo" ${p.currency==='AED/mo'?'selected':''}>AED/month</option>
              </select>
            </div>
          </div>
          <div class="form-group"><label>Location *</label><input type="text" name="location" value="${p.location}" required placeholder="e.g. Al Majaz, Sharjah"></div>
          <div class="form-group"><label>Description *</label><textarea name="description" rows="5" required placeholder="Describe the property...">${p.description}</textarea></div>
        </div>

        <div class="form-card">
          <h3>Property Details</h3>
          <div class="form-row">
            <div class="form-group"><label data-i18n="detail_beds">Bedrooms</label><input type="number" name="bedrooms" value="${p.bedrooms !== null && p.bedrooms !== undefined ? p.bedrooms : ''}" placeholder="0 = Studio"></div>
            <div class="form-group"><label data-i18n="detail_baths">Bathrooms</label><input type="number" name="bathrooms" value="${p.bathrooms || ''}"></div>
          </div>
          <div class="form-row">
            <div class="form-group"><label data-i18n="detail_area">Area</label><input type="number" name="area" value="${p.area || ''}"></div>
            <div class="form-group"><label>Area Unit</label>
              <select name="areaUnit">
                <option value="sqm" ${p.areaUnit==='sqm'?'selected':''}>sqm</option>
                <option value="sqft" ${p.areaUnit==='sqft'?'selected':''}>sqft</option>
              </select>
            </div>
          </div>
          <div class="form-group"><label>Features / Amenities (comma-separated)</label><input type="text" name="features" value="${featuresStr}" placeholder="Pool, Gym, Parking, Sea View..."></div>
          <div class="form-check"><label><input type="checkbox" name="featured" value="1" ${p.featured?'checked':''}> Feature this property on homepage</label></div>
        </div>

        <!-- Image Upload -->
        <div class="form-card">
          <h3><i class="fa-solid fa-images"></i> Property Images</h3>
          ${isEdit && p.images && p.images.length > 0 ? `
          <div class="media-current">
            <p class="media-label">Current Images</p>
            <div class="media-grid" id="currentImages">
              ${p.images.map((img, i) => `
              <div class="media-item" id="imgItem_${i}">
                <img src="${imgSrc(img)}" alt="Image ${i+1}">
                <button type="button" class="media-remove" onclick="removeMedia('image', '${img}', 'imgItem_${i}')"><i class="fa-solid fa-xmark"></i></button>
                ${i === 0 ? '<span class="media-main-badge">Main</span>' : ''}
              </div>`).join('')}
            </div>
          </div>` : ''}
          <div class="upload-zone" id="imageDropZone">
            <i class="fa-solid fa-cloud-arrow-up"></i>
            <p>Drag & drop images here or <span class="upload-link">browse</span></p>
            <small>JPG, PNG, WEBP supported. First image will be the main photo.</small>
            <input type="file" name="images" id="imageInput" multiple accept="image/*" class="upload-input">
          </div>
          <div class="upload-preview" id="imagePreview"></div>
        </div>

        <!-- Video Upload -->
        <div class="form-card">
          <h3><i class="fa-solid fa-video"></i> Property Videos</h3>
          ${isEdit && p.videos && p.videos.length > 0 ? `
          <div class="media-current">
            <p class="media-label">Current Videos</p>
            <div class="media-grid" id="currentVideos">
              ${p.videos.map((v, i) => `
              <div class="media-item media-item-video" id="vidItem_${i}">
                <video src="/uploads/properties/${v}" controls></video>
                <button type="button" class="media-remove" onclick="removeMedia('video', '${v}', 'vidItem_${i}')"><i class="fa-solid fa-xmark"></i></button>
              </div>`).join('')}
            </div>
          </div>` : ''}
          <div class="upload-zone" id="videoDropZone">
            <i class="fa-solid fa-video"></i>
            <p>Drag & drop videos here or <span class="upload-link">browse</span></p>
            <small>MP4, WEBM, MOV supported.</small>
            <input type="file" name="videos" id="videoInput" multiple accept="video/*" class="upload-input">
          </div>
          <div class="upload-preview" id="videoPreview"></div>
        </div>

        <input type="hidden" name="removedImages" id="removedImages" value="">
        <input type="hidden" name="removedVideos" id="removedVideos" value="">
      </div>

      <div class="form-sidebar">
        <div class="form-card form-actions">
          <button type="submit" class="btn-primary btn-block"><i class="fa-solid fa-floppy-disk"></i> ${isEdit ? 'Update Property' : 'Save Property'}</button>
          <a href="/admin/properties" class="btn-ghost btn-block">Cancel</a>
        </div>
        ${isEdit ? `<div class="form-card"><h4>Property ID</h4><code>${p.id}</code></div>` : ''}
      </div>
    </div>
  </form>
</div>
`);
}

function adminSettings() {
  const data = readData();
  const s = data.settings;
  return adminLayout('Settings', `
<div class="form-page">
  <form method="POST" action="/admin/settings">
    <div class="form-card">
      <h3>Company Information</h3>
      <div class="form-group"><label>Company Name</label><input type="text" name="companyName" value="${s.companyName || ''}"></div>
      <div class="form-group"><label data-i18n="form_phone">Phone</label><input type="text" name="phone" value="${s.phone || ''}"></div>
      <div class="form-group"><label data-i18n="form_email">Email</label><input type="email" name="email" value="${s.email || ''}"></div>
      <div class="form-group"><label>WhatsApp Number (with country code)</label><input type="text" name="whatsapp" value="${s.whatsapp || ''}" placeholder="+971500000000"></div>
      <button type="submit" class="btn-primary"><i class="fa-solid fa-floppy-disk"></i> Save Settings</button>
    </div>
  </form>
</div>
`);
}

function loginPage(error = '') {
  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width,initial-scale=1.0">
<title>Admin Login | Art Real Estate</title>
<link rel="icon" type="image/png" href="/images/logo.png">
<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.0/css/all.min.css">
<link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600&display=swap" rel="stylesheet">
<link rel="stylesheet" href="/css/admin.css">
</head>
<body class="login-body">
<div class="login-box">
  <div class="login-logo">
    <img src="/images/logo.png" alt="Art Real Estate">
    <h2>Admin Login</h2>
    <p>Art Real Estate Management</p>
  </div>
  ${error ? `<div class="alert alert-error"><i class="fa-solid fa-circle-exclamation"></i> ${error}</div>` : ''}
  <form method="POST" action="/admin/login">
    <div class="form-group"><label>Username</label><div class="input-icon"><i class="fa-solid fa-user"></i><input type="text" name="username" required autofocus></div></div>
    <div class="form-group"><label>Password</label><div class="input-icon"><i class="fa-solid fa-lock"></i><input type="password" name="password" required></div></div>
    <button type="submit" class="btn-primary btn-block"><i class="fa-solid fa-right-to-bracket"></i> Login</button>
  </form>
  <p class="login-back"><a href="/"><i class="fa-solid fa-arrow-left"></i> Back to site</a></p>
</div>
</body>
</html>`;
}

function adminEnquiries() {
  const data = readData();
  const enquiries = data.enquiries || [];
  const unread = enquiries.filter(e => !e.read).length;

  function renderCard(e) {
    const dateStr = new Date(e.createdAt).toLocaleString('en-GB', { day:'numeric', month:'short', year:'numeric', hour:'2-digit', minute:'2-digit' });
    const subj = e.propertyTitle ? 'Your enquiry about ' + e.propertyTitle : 'Your enquiry';
    const phone = e.phone ? e.phone.replace(/[^0-9]/g, '') : '';
    const waLink = phone ? 'https://wa.me/' + phone : '';
    const emailSubject = encodeURIComponent(subj);

    let card = '<div class="eq-card' + (e.read ? '' : ' eq-unread') + '" id="eq_' + e.id + '">';

    // Header strip
    card += '<div class="eq-header">';
    card += '<div class="eq-header-left">';
    if (!e.read) card += '<span class="eq-dot"></span>';
    card += '<div class="eq-avatar">' + escHtml(e.name.charAt(0).toUpperCase()) + '</div>';
    card += '<div class="eq-identity"><span class="eq-name">' + escHtml(e.name) + '</span>';
    if (e.propertyTitle) {
      card += '<span class="eq-prop-tag"><i class="fa-solid fa-building"></i> ' + escHtml(e.propertyTitle) + '</span>';
    }
    card += '</div></div>';
    card += '<div class="eq-header-right">';
    card += '<span class="eq-date"><i class="fa-regular fa-calendar"></i> ' + dateStr + '</span>';
    if (!e.read) {
      card += '<button class="eq-btn eq-btn-read" data-id="' + e.id + '" title="Mark as read"><i class="fa-solid fa-check-double"></i> Mark Read</button>';
    } else {
      card += '<span class="eq-read-badge"><i class="fa-solid fa-check-double"></i> Read</span>';
    }
    card += '<button class="eq-btn eq-btn-delete" data-id="' + e.id + '" title="Delete"><i class="fa-solid fa-trash"></i></button>';
    card += '</div></div>';

    // Contact info row
    card += '<div class="eq-contacts">';
    if (e.email) card += '<a href="mailto:' + escHtml(e.email) + '" class="eq-contact-pill"><i class="fa-solid fa-envelope"></i>' + escHtml(e.email) + '</a>';
    if (e.phone) card += '<a href="tel:' + escHtml(e.phone) + '" class="eq-contact-pill"><i class="fa-solid fa-phone"></i>' + escHtml(e.phone) + '</a>';
    card += '</div>';

    // Message bubble
    card += '<div class="eq-body"><div class="eq-message">' + escHtml(e.message) + '</div></div>';

    // Action buttons
    card += '<div class="eq-footer">';
    if (e.email) card += '<a href="mailto:' + escHtml(e.email) + '?subject=' + emailSubject + '" class="eq-action-btn eq-action-email"><i class="fa-solid fa-reply"></i> Reply by Email</a>';
    if (waLink) card += '<a href="' + waLink + '" target="_blank" class="eq-action-btn eq-action-wa"><i class="fa-brands fa-whatsapp"></i> WhatsApp</a>';
    if (e.propertyTitle) card += '<a href="/property/' + e.propertyRef + '" target="_blank" class="eq-action-btn eq-action-view"><i class="fa-solid fa-eye"></i> View Property</a>';
    card += '</div>';

    card += '</div>';
    return card;
  }

  let body = '';
  body += '<div class="eq-page-header">';
  body += '<div class="eq-page-title">';
  body += '<h2>Enquiries</h2>';
  if (unread > 0) body += '<span class="eq-count-badge">' + unread + ' unread</span>';
  body += '</div>';
  body += '<div class="eq-page-stats">';
  body += '<div class="eq-stat"><i class="fa-solid fa-inbox"></i><strong>' + enquiries.length + '</strong><span>Total</span></div>';
  body += '<div class="eq-stat eq-stat-unread"><i class="fa-solid fa-circle-dot"></i><strong>' + unread + '</strong><span>Unread</span></div>';
  body += '<div class="eq-stat"><i class="fa-solid fa-check-double"></i><strong>' + (enquiries.length - unread) + '</strong><span>Read</span></div>';
  body += '</div></div>';

  if (enquiries.length === 0) {
    body += '<div class="eq-empty"><div class="eq-empty-icon"><i class="fa-solid fa-inbox"></i></div><h3>No enquiries yet</h3><p>When visitors submit the contact form, their messages will appear here.</p></div>';
  } else {
    body += '<div class="eq-list">';
    enquiries.forEach(e => { body += renderCard(e); });
    body += '</div>';
  }

  return adminLayout('Enquiries', body);
}

function escHtml(str) {
  return String(str || '').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}

// ─── Router ───────────────────────────────────────────────────────────────────
async function handleRequest(req, res) {
  const urlObj = new URL('http://localhost' + req.url);
  const pathname = urlObj.pathname;
  const method = req.method;

  // Static files
  if (pathname.startsWith('/css/') || pathname.startsWith('/js/') || pathname.startsWith('/images/') || pathname.startsWith('/uploads/')) {
    const filePath = path.join(__dirname, 'public', pathname);
    if (!fs.existsSync(filePath)) {
      res.writeHead(404); res.end('Not found'); return;
    }
    const ext = path.extname(filePath).toLowerCase();
    const mimeTypes = { '.html':'text/html','.css':'text/css','.js':'application/javascript','.png':'image/png','.jpg':'image/jpeg','.jpeg':'image/jpeg','.gif':'image/gif','.webp':'image/webp','.svg':'image/svg+xml','.ico':'image/x-icon','.mp4':'video/mp4','.webm':'video/webm','.mov':'video/quicktime' };
    const mime = mimeTypes[ext] || 'application/octet-stream';
    const stat = fs.statSync(filePath);

    // Range requests for video
    if (mime.startsWith('video/') && req.headers.range) {
      const range = req.headers.range;
      const parts = range.replace(/bytes=/, '').split('-');
      const start = parseInt(parts[0], 10);
      const end = parts[1] ? parseInt(parts[1], 10) : stat.size - 1;
      const chunksize = end - start + 1;
      res.writeHead(206, { 'Content-Range': `bytes ${start}-${end}/${stat.size}`, 'Accept-Ranges': 'bytes', 'Content-Length': chunksize, 'Content-Type': mime });
      fs.createReadStream(filePath, { start, end }).pipe(res);
      return;
    }

    res.writeHead(200, { 'Content-Type': mime, 'Content-Length': stat.size, 'Cache-Control': 'public, max-age=3600' });
    fs.createReadStream(filePath).pipe(res);
    return;
  }

  const session = getSession(req);
  const isAdmin = session && session.admin;

  function send(html, status = 200) {
    res.writeHead(status, { 'Content-Type': 'text/html; charset=utf-8' });
    res.end(html);
  }

  function redirect(url) {
    res.writeHead(302, { Location: url }); res.end();
  }

  function requireAdmin() {
    if (!isAdmin) { redirect('/admin/login'); return false; }
    return true;
  }

  // ── Public routes ──
  if (pathname === '/' && method === 'GET') return send(homePage());
  if (pathname === '/properties' && method === 'GET') return send(propertiesPage(req));
  if (pathname.startsWith('/property/') && method === 'GET') {
    const id = pathname.split('/property/')[1];
    const data = readData();
    const prop = data.properties.find(p => p.id === id);
    if (!prop) return send('<h1>Not found</h1>', 404);
    return send(propertyDetailPage(prop));
  }
  if (pathname === '/contact' && method === 'GET') {
    const ref = urlObj.searchParams.get('ref') || '';
    const sent = urlObj.searchParams.get('sent') === '1';
    return send(contactPage(ref, sent));
  }
  if (pathname === '/contact' && method === 'POST') {
    const body = await parseBody(req);
    const data = readData();
    if (!data.enquiries) data.enquiries = [];
    const prop = body.ref ? data.properties.find(p => p.id === body.ref) : null;
    data.enquiries.unshift({
      id: 'e' + Date.now(),
      name: (body.name || '').trim(),
      email: (body.email || '').trim(),
      phone: (body.phone || '').trim(),
      message: (body.message || '').trim(),
      propertyRef: body.ref || null,
      propertyTitle: prop ? prop.title : null,
      read: false,
      createdAt: new Date().toISOString()
    });
    writeData(data);
    return redirect('/contact?sent=1');
  }

  // ── Admin routes ──
  if (pathname === '/admin/login' && method === 'GET') return send(loginPage());
  if (pathname === '/admin/login' && method === 'POST') {
    const body = await parseBody(req);
    const passHash = crypto.createHash('sha256').update(body.password || '').digest('hex');
    if (body.username === ADMIN_USER && passHash === ADMIN_PASS_HASH) {
      const sid = createSession();
      res.writeHead(302, { 'Set-Cookie': `art_sid=${sid}; Path=/; HttpOnly; Max-Age=86400`, Location: '/admin' });
      res.end(); return;
    }
    return send(loginPage('Invalid username or password.'));
  }
  if (pathname === '/admin/logout') {
    destroySession(req);
    res.writeHead(302, { 'Set-Cookie': 'art_sid=; Path=/; Max-Age=0', Location: '/admin/login' });
    res.end(); return;
  }

  if (!pathname.startsWith('/admin')) {
    res.writeHead(404); res.end('Page not found'); return;
  }

  if (!requireAdmin()) return;

  if (pathname === '/admin' && method === 'GET') return send(adminDashboard());
  if (pathname === '/admin/properties' && method === 'GET') return send(adminPropertiesList());
  if (pathname === '/admin/properties/new' && method === 'GET') return send(propertyForm());
  if (pathname.startsWith('/admin/properties/edit/') && method === 'GET') {
    const id = pathname.split('/admin/properties/edit/')[1];
    const data = readData();
    const prop = data.properties.find(p => p.id === id);
    if (!prop) return redirect('/admin/properties');
    return send(propertyForm(prop));
  }
  if (pathname === '/admin/properties/new' && method === 'POST') {
    const { fields, files } = await parseMultipart(req);
    const data = readData();
    const images = files.filter(f => f.fieldname === 'images').map(f => f.filename);
    const videos = files.filter(f => f.fieldname === 'videos').map(f => f.filename);
    const newProp = {
      id: 'p' + Date.now(),
      title: fields.title || '',
      type: fields.type || 'Apartment',
      status: fields.status || 'For Sale',
      price: parseFloat(fields.price) || 0,
      currency: fields.currency || 'AED',
      bedrooms: fields.bedrooms !== '' ? parseInt(fields.bedrooms) : null,
      bathrooms: parseInt(fields.bathrooms) || 0,
      area: parseFloat(fields.area) || 0,
      areaUnit: fields.areaUnit || 'sqm',
      location: fields.location || '',
      description: fields.description || '',
      features: (fields.features || '').split(',').map(f => f.trim()).filter(Boolean),
      images, videos,
      featured: fields.featured === '1',
      createdAt: new Date().toISOString()
    };
    data.properties.unshift(newProp);
    writeData(data);
    return redirect('/admin/properties');
  }
  if (pathname.startsWith('/admin/properties/edit/') && method === 'POST') {
    const id = pathname.split('/admin/properties/edit/')[1];
    const { fields, files } = await parseMultipart(req);
    const data = readData();
    const idx = data.properties.findIndex(p => p.id === id);
    if (idx === -1) return redirect('/admin/properties');
    const prop = data.properties[idx];

    // Handle removed media
    const removedImages = (fields.removedImages || '').split(',').filter(Boolean);
    const removedVideos = (fields.removedVideos || '').split(',').filter(Boolean);
    removedImages.forEach(img => {
      const fp = path.join(UPLOADS_DIR, img);
      if (fs.existsSync(fp)) fs.unlinkSync(fp);
    });
    removedVideos.forEach(v => {
      const fp = path.join(UPLOADS_DIR, v);
      if (fs.existsSync(fp)) fs.unlinkSync(fp);
    });

    const newImages = files.filter(f => f.fieldname === 'images').map(f => f.filename);
    const newVideos = files.filter(f => f.fieldname === 'videos').map(f => f.filename);
    const existingImages = (prop.images || []).filter(img => !removedImages.includes(img));
    const existingVideos = (prop.videos || []).filter(v => !removedVideos.includes(v));

    data.properties[idx] = {
      ...prop,
      title: fields.title || prop.title,
      type: fields.type || prop.type,
      status: fields.status || prop.status,
      price: parseFloat(fields.price) || prop.price,
      currency: fields.currency || prop.currency,
      bedrooms: fields.bedrooms !== '' ? parseInt(fields.bedrooms) : prop.bedrooms,
      bathrooms: parseInt(fields.bathrooms) || prop.bathrooms,
      area: parseFloat(fields.area) || prop.area,
      areaUnit: fields.areaUnit || prop.areaUnit,
      location: fields.location || prop.location,
      description: fields.description || prop.description,
      features: (fields.features || '').split(',').map(f => f.trim()).filter(Boolean),
      images: [...existingImages, ...newImages],
      videos: [...existingVideos, ...newVideos],
      featured: fields.featured === '1',
    };
    writeData(data);
    return redirect('/admin/properties');
  }

  // Delete property (AJAX)
  if (pathname.startsWith('/admin/properties/delete/') && method === 'POST') {
    const id = pathname.split('/admin/properties/delete/')[1];
    const data = readData();
    const prop = data.properties.find(p => p.id === id);
    if (prop) {
      // Clean up files
      [...(prop.images || []), ...(prop.videos || [])].forEach(f => {
        const fp = path.join(UPLOADS_DIR, f);
        if (fs.existsSync(fp)) fs.unlinkSync(fp);
      });
      data.properties = data.properties.filter(p => p.id !== id);
      writeData(data);
    }
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ ok: true })); return;
  }

  if (pathname === '/admin/enquiries' && method === 'GET') return send(adminEnquiries());
  if (pathname === '/admin/enquiries/count' && method === 'GET') {
    const data = readData();
    const count = (data.enquiries || []).filter(e => !e.read).length;
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ count })); return;
  }

  // Mark enquiry as read
  if (pathname.startsWith('/admin/enquiries/read/') && method === 'POST') {
    const id = pathname.split('/admin/enquiries/read/')[1];
    const data = readData();
    if (!data.enquiries) data.enquiries = [];
    const eq = data.enquiries.find(e => e.id === id);
    if (eq) { eq.read = true; writeData(data); }
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ ok: true })); return;
  }

  // Delete enquiry
  if (pathname.startsWith('/admin/enquiries/delete/') && method === 'POST') {
    const id = pathname.split('/admin/enquiries/delete/')[1];
    const data = readData();
    if (!data.enquiries) data.enquiries = [];
    data.enquiries = data.enquiries.filter(e => e.id !== id);
    writeData(data);
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ ok: true })); return;
  }

  if (pathname === '/admin/settings' && method === 'GET') return send(adminSettings());
  if (pathname === '/admin/settings' && method === 'POST') {
    const body = await parseBody(req);
    const data = readData();
    data.settings = { ...data.settings, ...body };
    writeData(data);
    return redirect('/admin/settings');
  }

  res.writeHead(404); res.end('Not found');
}

http.createServer((req, res) => {
  handleRequest(req, res).catch(err => {
    console.error(err);
    res.writeHead(500); res.end('Server error: ' + err.message);
  });
}).listen(PORT, () => console.log(`Art Real Estate running on http://localhost:${PORT}`));
