# lankanesan.ch

Persönliche Website von Nelson Lankanesan (NLA), Cloud Engineer bei Axians Somnitec AG.

Statische Seite ohne Framework, ohne Build-Schritt und ohne Laufzeit-Abhängigkeiten.
Das Repository ist die Seite: was hier liegt, wird unverändert ausgeliefert.

## Eigenschaften

- Zweisprachig (Deutsch als Standard, Englisch umschaltbar), Auswahl wird im Browser gespeichert
- Helles und dunkles Design, folgt initial der Systemeinstellung
- Responsive ab 320 Pixel Breite
- Barrierearm: Skip-Link, Fokus-Stile, ARIA-Beschriftungen, `prefers-reduced-motion`
- SEO-Basis: Meta-Tags, Open Graph, Twitter Card, JSON-LD (`Person`), `sitemap.xml`, `robots.txt`
- Funktioniert ohne JavaScript (Inhalte bleiben sichtbar, nur Komfortfunktionen entfallen)

## Struktur

```
.
├── index.html                    # Gesamte Seite, Abschnitte in #region-Kommentaren
├── 404.html                      # Fehlerseite
├── CNAME                         # Custom Domain fuer GitHub Pages
├── robots.txt / sitemap.xml      # Suchmaschinen
├── site.webmanifest              # Web App Manifest
├── assets
│   ├── css/style.css             # Design-Tokens und Layout
│   ├── js/i18n.js                # Woerterbuch Deutsch / Englisch
│   ├── js/main.js                # Theme, Sprache, Navigation, Scroll-Verhalten
│   └── img
│       ├── favicon.svg
│       ├── og-image.png          # Vorschaubild fuer Social Media (1200x630)
│       └── og-image.source.html  # Quelle des Vorschaubildes
└── .github/workflows/deploy.yml  # Deployment auf GitHub Pages
```

## Lokal starten

Ein einfacher HTTP-Server genügt. Die Pfade sind absolut (`/assets/...`), daher
funktioniert ein direktes Öffnen der Datei über `file://` nicht vollständig.

```powershell
# Python
python -m http.server 8080

# oder Node
npx serve .
```

Danach `http://localhost:8080` aufrufen.

## Inhalte pflegen

Deutsche Texte stehen direkt im HTML und dienen gleichzeitig als Fallback.
Die englischen Entsprechungen liegen in `assets/js/i18n.js`.

Beim Bearbeiten eines Textes gilt: **beide Stellen anpassen**, sonst springt der
Text beim Sprachwechsel zurück.

```html
<!-- index.html -->
<h3 data-i18n="expertise.c1t">Infrastructure as Code</h3>
```

```javascript
// assets/js/i18n.js
de: { 'expertise.c1t': 'Infrastructure as Code' },
en: { 'expertise.c1t': 'Infrastructure as Code' }
```

Unterstützte Attribute im Markup:

| Attribut         | Wirkung                                                       |
| ---------------- | ------------------------------------------------------------- |
| `data-i18n`      | Ersetzt den Textinhalt                                        |
| `data-i18n-html` | Ersetzt den HTML-Inhalt (nur für eigene Texte mit Markup)     |
| `data-i18n-attr` | Ersetzt Attribute, Format `attribut:schluessel`, kommagetrennt |

## Vor dem ersten Deployment anpassen

Diese Werte sind als Platzhalter gesetzt und sollten geprüft werden:

| Stelle                            | Aktueller Wert                                    |
| --------------------------------- | -------------------------------------------------- |
| `index.html`, Kontakt-Button      | `kontakt@lankanesan.ch`                            |
| `index.html`, LinkedIn-Link       | `https://www.linkedin.com/in/nelson-lankanesan`    |
| `index.html`, GitHub-Link         | `https://github.com/nelsonmalachi`                 |
| `sitemap.xml`, `lastmod`          | Datum der letzten inhaltlichen Änderung            |

Der Abschnitt "Arbeit" beschreibt Themenfelder bewusst allgemein und nennt keine
Kundenprojekte. Konkrete Referenzen können dort ergänzt werden, sobald sie
freigegeben sind.

## Vorschaubild neu erzeugen

`assets/img/og-image.source.html` ist die Quelle des Social-Media-Vorschaubildes.
Nach einer Änderung wird das PNG neu gerendert:

```powershell
# Beispiel mit Chrome oder Edge im Headless-Modus
chrome --headless --disable-gpu --window-size=1200,630 `
       --screenshot="assets/img/og-image.png" `
       "file:///<absoluter-pfad>/assets/img/og-image.source.html"
```

## Deployment

### GitHub Pages (eingerichtet)

`.github/workflows/deploy.yml` veröffentlicht jeden Push auf `main`.

Einmalige Einrichtung:

1. **Settings > Pages > Source** auf `GitHub Actions` stellen.
2. Beim DNS-Anbieter der Domain `lankanesan.ch` setzen:
   - `A`-Records für die Apex-Domain auf `185.199.108.153`, `185.199.109.153`,
     `185.199.110.153`, `185.199.111.153`
   - `CNAME`-Record für `www` auf `nelsonmalachi.github.io`
3. In **Settings > Pages** die Custom Domain eintragen und *Enforce HTTPS* aktivieren.

Die Datei `CNAME` im Repository hält die Domain-Zuordnung über Deployments hinweg fest.

### Alternative Anbieter

Da kein Build nötig ist, funktioniert die Seite bei jedem Static Hosting
unverändert (Vercel, Netlify, Azure Static Web Apps). Als Build-Befehl bleibt das
Feld leer, als Publish-Verzeichnis wird das Repository-Wurzelverzeichnis
angegeben.

## Lizenz

Quellcode zur freien Verwendung. Inhalte, Texte und Bilder bleiben beim Autor.
