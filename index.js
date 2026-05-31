// ── TRENDING STRIP ──
async function loadStrip(type, containerId) {
  const blocked = type === "movie" ? BLOCKED_MOVIES : BLOCKED_SHOWS;
  const ep = type === "movie" ? "movie/popular" : "tv/popular";
  try {
    const data = await cachedFetch(`${BASE}/${ep}?api_key=${API_KEY}&language=en-US&page=1`);
    const list = (data.results || []).filter(x => !blocked.has(x.id)).slice(0, 10);
    const wrap = document.getElementById(containerId);
    list.forEach((item, i) => {
      const title = item.title || item.name;
      const url   = type === "movie" ? `player.html?id=${item.id}` : `players.html?id=${item.id}`;
      const card  = document.createElement("div");
      card.className = "t-card";
      if (item.poster_path) {
        const img = document.createElement("img");
        img.src = IMG + item.poster_path;
        img.alt = title; img.loading = "lazy";
        img.onerror = () => {
          const ph = document.createElement("div");
          ph.className = "t-ph"; ph.innerHTML = '<i class="fas fa-film"></i>';
          img.replaceWith(ph);
        };
        card.appendChild(img);
      } else {
        const ph = document.createElement("div");
        ph.className = "t-ph"; ph.innerHTML = '<i class="fas fa-film"></i>';
        card.appendChild(ph);
      }
      const num = document.createElement("div");
      num.className = "t-num"; num.textContent = i + 1;
      const lbl = document.createElement("div");
      lbl.className = "t-lbl"; lbl.textContent = title;
      card.appendChild(num); card.appendChild(lbl);
      card.addEventListener("click",       () => location.href = url);
      card.addEventListener("contextmenu", e  => showCtx(e, { ...item, type }));
      wrap.appendChild(card);
    });
  } catch (e) { console.error(e); }
}

// ── CONTINUE WATCHING ──
(function() {
  const items = RW.get();
  if (!items.length) return;
  const statsRow = document.querySelector(".stats-row");
  if (!statsRow) return;
  const sec = document.createElement("div");
  sec.innerHTML = `
    <div class="section-header" style="margin-top:4px;">
      <h2 class="section-title">Continue <span>Watching</span></h2>
    </div>
    <div class="t-strip" id="rwStrip"></div>`;
  statsRow.insertAdjacentElement("afterend", sec);
  const strip = document.getElementById("rwStrip");
  items.forEach(item => {
    const url  = item.type === "movie" ? `player.html?id=${item.id}` : `players.html?id=${item.id}`;
    const card = document.createElement("div");
    card.className = "t-card";
    if (item.poster_path) {
      const img = document.createElement("img");
      img.src = IMG + item.poster_path; img.alt = item.title; img.loading = "lazy";
      card.appendChild(img);
    } else {
      const ph = document.createElement("div");
      ph.className = "t-ph"; ph.innerHTML = '<i class="fas fa-film"></i>';
      card.appendChild(ph);
    }
    const lbl = document.createElement("div");
    lbl.className = "t-lbl"; lbl.textContent = item.title;
    card.appendChild(lbl);
    card.addEventListener("click",       () => location.href = url);
    card.addEventListener("contextmenu", e  => showCtx(e, { ...item }));
    strip.appendChild(card);
  });
})();

loadStrip("movie", "tMovies");
loadStrip("tv",    "tShows");

// ── FAQ ──
const FAQS = [
  { q: "Is Dashtube completely free?",          a: "Yes — 100% free. No account, no credit card, no subscription. Just browse and watch." },
  { q: "Do I need to create an account?",       a: "No registration needed. Find something you like and start watching immediately." },
  { q: "What video quality is available?",      a: "Dashtube streams in HD where available, depending on the server and your internet speed." },
  { q: "Why is a movie not playing?",           a: "Try switching to a different server using the server buttons on the player page." },
  { q: "Can I save movies to watch later?",     a: "Yes — right-click any poster to add it to your Watchlist. It's saved locally in your browser." },
  { q: "How do I watch TV show episodes?",      a: "Click any TV show poster, then select the season and episode on the player page." },
  { q: "Why are some movies unavailable?",      a: "Content may be region-restricted or temporarily down. Try switching servers or check back later." },
  { q: "Does Dashtube work on mobile?",         a: "Absolutely. Dashtube is fully optimised for mobile browsers — no app needed." },
];
const fWrap = document.getElementById("faqWrap");
FAQS.forEach(f => {
  const item = document.createElement("div");
  item.className = "faq-item";
  item.innerHTML = `<button class="faq-q">${f.q}<i class="fas fa-chevron-down"></i></button>
    <div class="faq-body"><div class="faq-body-inner">${f.a}</div></div>`;
  item.querySelector(".faq-q").addEventListener("click", () => {
    const open = item.classList.contains("open");
    document.querySelectorAll(".faq-item.open").forEach(i => i.classList.remove("open"));
    if (!open) item.classList.add("open");
  });
  fWrap.appendChild(item);
});
