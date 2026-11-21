const TICKS = 48; // last 12 hours
const REFRESH = 60 * 1000;

const banner = document.getElementById("banner");
const container = document.getElementById("sites");
const updated = document.getElementById("updated");

async function load() {
  try {
    const [sites, history] = await Promise.all([
      getJson("sites.json"),
      getJson("data/history.json"),
    ]);
    render(sites, history);
  } catch {
    banner.className = "banner";
    banner.textContent = "Couldn't load status data.";
  }
}

async function getJson(path) {
  // GitHub Pages caches files for a few minutes, the query string skips that
  const res = await fetch(`${path}?t=${Date.now()}`);
  if (!res.ok) throw new Error(path);
  return res.json();
}

function render(sites, history) {
  container.innerHTML = "";

  if (history.length === 0) {
    banner.className = "banner";
    banner.textContent = "Waiting for the first check...";
    return;
  }

  const latest = history[history.length - 1];
  const down = sites.filter((s) => latest.sites[s.name] && !latest.sites[s.name].up);

  if (down.length === 0) {
    banner.className = "banner ok";
    banner.textContent = "✅ All systems operational";
  } else {
    banner.className = "banner bad";
    banner.textContent = `⚠️ ${down.map((s) => s.name).join(", ")} ${down.length === 1 ? "is" : "are"} down`;
  }

  for (const site of sites) {
    container.appendChild(siteCard(site, history));
  }

  updated.textContent = `Last check ${timeAgo(new Date(latest.time))}`;
}

function siteCard(site, history) {
  const checks = history.map((h) => h.sites[site.name]).filter(Boolean);
  const current = checks[checks.length - 1];
  const upCount = checks.filter((c) => c.up).length;
  const uptime = checks.length ? ((upCount / checks.length) * 100).toFixed(2) : "–";

  const card = document.createElement("div");
  card.className = "site";
  card.innerHTML = `
    <div class="site-head">
      <span class="dot"></span>
      <span class="site-name"><a target="_blank" rel="noopener"></a></span>
      <span class="site-meta"></span>
    </div>
    <div class="timeline"></div>
    <div class="timeline-labels"><span>12h ago</span><span>now</span></div>
  `;

  const link = card.querySelector("a");
  link.href = site.url;
  link.textContent = site.name;

  if (current) {
    card.querySelector(".dot").classList.add(current.up ? "up" : "down");
    card.querySelector(".site-meta").textContent = current.up
      ? `${current.ms} ms · ${uptime}% uptime`
      : `HTTP ${current.code || "timeout"} · ${uptime}% uptime`;
  }

  const timeline = card.querySelector(".timeline");
  const recent = history.slice(-TICKS);

  for (let i = 0; i < TICKS - recent.length; i++) {
    timeline.appendChild(tick("empty", "no data"));
  }
  for (const h of recent) {
    const c = h.sites[site.name];
    if (!c) {
      timeline.appendChild(tick("empty", "no data"));
    } else {
      const when = new Date(h.time).toLocaleString();
      timeline.appendChild(tick(c.up ? "" : "down", `${when} · ${c.up ? c.ms + " ms" : "down"}`));
    }
  }

  return card;
}

function tick(cls, title) {
  const el = document.createElement("div");
  el.className = `tick ${cls}`.trim();
  el.title = title;
  return el;
}

function timeAgo(date) {
  const min = Math.round((Date.now() - date) / 60000);
  if (min < 1) return "just now";
  if (min < 60) return `${min} min ago`;
  const h = Math.round(min / 60);
  return `${h} hour${h === 1 ? "" : "s"} ago`;
}

load();
setInterval(load, REFRESH);
