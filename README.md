# ⏱️ Uptime Monitor

**🇬🇧 English** | [🇩🇪 Deutsch](#-deutsch)

A status page for my projects that runs completely on GitHub, no server and no database. GitHub Actions checks every site every 15 minutes, saves the result to a JSON file, and GitHub Pages shows it.

**Live:** https://muhammedfidann06.github.io/uptime-monitor/

## Features

- Green / red status, response time and uptime % for each site
- Timeline of the last 12 hours (48 checks)
- Banner that says which site is down
- Page refreshes itself every minute
- Add a site by editing one JSON file

## How it works

```
GitHub Actions (every 15 min)
  └─ scripts/check.sh   → curl every site in sites.json
       └─ data/history.json  ← new entry is committed
GitHub Pages
  └─ index.html + app.js → reads history.json and draws the page
```

`check.sh` uses `curl` to measure the status code and response time, and `jq` to append the result to `data/history.json`. Only the last 300 checks (about 3 days) are kept so the file stays small. Any 2xx or 3xx response counts as up.

## Add your own sites

Edit `sites.json`:

```json
[
  { "name": "My site", "url": "https://example.com" }
]
```

Then run the workflow once from the **Actions** tab (`Check sites` → `Run workflow`).

## Notes

- GitHub can delay scheduled workflows by a few minutes when it's busy.
- Checks come from GitHub's servers, so a site that blocks data centers may show as down.

---

## 🇩🇪 Deutsch

Eine Statusseite für meine Projekte, die komplett auf GitHub läuft, ohne Server und ohne Datenbank. GitHub Actions prüft jede Seite alle 15 Minuten, speichert das Ergebnis in einer JSON-Datei, und GitHub Pages zeigt es an.

**Live:** https://muhammedfidann06.github.io/uptime-monitor/

### Funktionen

- Grüner / roter Status, Antwortzeit und Verfügbarkeit in % pro Seite
- Zeitleiste der letzten 12 Stunden (48 Prüfungen)
- Banner, das anzeigt, welche Seite nicht erreichbar ist
- Die Seite aktualisiert sich jede Minute selbst
- Neue Seiten über eine JSON-Datei hinzufügen

### Funktionsweise

`check.sh` misst mit `curl` Statuscode und Antwortzeit und hängt das Ergebnis mit `jq` an `data/history.json` an. Es werden nur die letzten 300 Prüfungen (etwa 3 Tage) behalten. Jede 2xx- oder 3xx-Antwort gilt als erreichbar.

### Eigene Seiten hinzufügen

`sites.json` bearbeiten und den Workflow einmal im Tab **Actions** starten (`Check sites` → `Run workflow`).

### Hinweise

- GitHub kann geplante Workflows bei hoher Last um einige Minuten verzögern.
- Die Prüfungen kommen von GitHub-Servern, Seiten, die Rechenzentren blockieren, erscheinen daher evtl. als nicht erreichbar.
