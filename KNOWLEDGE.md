# KNOWLEDGE.md — Compendio Conoscenze e Avanzamenti (EDS + Universal Editor)

> File di supporto ad `AGENTS.md`. `AGENTS.md` dice all'agente **come comportarsi** nel progetto;
> questo file tiene traccia di **cosa sappiamo, da dove viene l'informazione, e a che punto siamo**.
> Aggiornalo man mano che si procede (sia da Claude.ai che da Claude Code).

---

## 1. Obiettivo

Fase di **studio**: familiarizzare con Adobe Edge Delivery Services (EDS) + Universal Editor (UE)
facendo test pratici di creazione componenti su un repo di prova, con complessità crescente:

1. Componenti semplici (block singolo, model piatto)
2. Componenti con varianti/select
3. Componenti con contenuto ripetibile (`container`, `multi: true`)
4. Componenti annidati/composti (vedi i due esperimenti già presenti nel repo, §6)

Non è (per ora) legato a un progetto cliente specifico — è il repo di test creato da un collega
con la stessa struttura di un progetto reale, per fare pratica libera.

---

## 2. Ambiente di sviluppo

- **Windows 11 nativo** (⚠️ NON WSL) — PowerShell come shell
- Node.js v24, npm 11
- Estensione Chrome AEM Sidekick installata
- Account GitHub dedicato separato da personale/altri progetti
- Repo già clonato in locale, accesso completo confermato (repo + Author Universal Editor)

---

## 3. Fonti ufficiali della documentazione

| Fonte | Uso |
|---|---|
| `https://www.aem.live/` | Documentazione ufficiale EDS (ex Helix/Franklin). Fonte primaria — preferita a Experience League per guide pratiche |
| `https://www.aem.live/developer/tutorial` | Tutorial ufficiale document-based |
| `https://www.aem.live/developer/ue-tutorial` | Tutorial Universal Editor |
| `https://www.aem.live/developer/markup-sections-blocks` | Struttura markup sezioni/blocchi |
| `https://www.aem.live/developer/markup-reference` | Reference markup |
| `https://www.aem.live/developer/component-model-definitions` | Best practice modellazione contenuti (definitions/models/filters) |
| `https://www.aem.live/developer/keeping-it-100` | Performance best practices (Lighthouse 100) |
| `https://www.aem.live/developer/anatomy-of-a-project` | Struttura di un progetto EDS |
| `https://www.aem.live/docs/davidsmodel` | "David's Model" — principi guida |
| `https://github.com/adobe-rnd/aem-boilerplate-xwalk/` | Boilerplate xwalk/UE su cui è basato questo repo |
| `https://github.com/adobe/aem-block-collection` | Block collection estesa — controllare sempre prima di scrivere un blocco da zero |
| `https://github.com/adobe-rnd/eslint-plugin-xwalk` | Regole di lint applicate ai component model (xwalk) |
| `experienceleague.adobe.com/.../universal-editor/field-types` | Field types per i model dei blocchi UE |
| Ricerca full-text doc ufficiale: `curl -s https://www.aem.live/docpages-index.json \| jq -r '.data[] \| select(.content \| test("KEYWORD"; "i")) \| "\(.path): \(.title)"'` | Utile da Claude Code per cercare rapidamente nella doc |

**Nota:** materiali AEM GEEKS (progetto Claude.ai separato "AEM_OLD") validi per concetti architetturali generali ma datati (~3 anni) — per dettagli tecnici/procedurali verificare sempre sul web.

---

## 4. Due paradigmi — cosa cambia

| Aspetto | Document-based (`adobe/aem-boilerplate`) | Universal Editor / xwalk (`aem-boilerplate-xwalk`) — QUESTO REPO |
|---|---|---|
| Authoring | Word/Google Docs/`da.live` | Universal Editor (WYSIWYG) |
| Config modello blocco | Non esiste (struttura implicita dalla tabella) | `blocks/{blockname}/_{blockname}.json` (definitions+model+filter parziali per blocco) |
| Config modello pagina/sezione | — | `models/` in root |
| File aggregati | — | `component-definitions.json`, `component-models.json`, `component-filters.json` (generati con `npm run build:json`, NON editare a mano se esistono i parziali) |
| `fstab.yaml` | Storico, non più presente nei boilerplate attuali document-based | Presente e usato: punta all'author AEMaaCS |
| Runtime JS (`decorate()`, three-phase loading) | **Identico** in entrambi i paradigmi | **Identico** in entrambi i paradigmi |
| Content di test senza CMS | — | Cartella `drafts/` in root + `--html-folder drafts` su `aem up`, file `.html`/`.plain.html` con markup aem-conforme |

**Analogia utile (Vue/React):**
- `decorate(block)` ≈ `mounted()` / `useEffect()` che opera sul DOM già renderizzato
- Document-based ≈ `Object.keys()` dinamico (struttura implicita)
- Universal Editor ≈ TypeScript interfaces / JSON Schema che alimenta un form generator

---

## 5. Terminologia UE (component-definition)

Vedi file dedicato `UE_terminologia_component-definition.md` per il dettaglio di:
- `component-definition.json` → Definitions (cosa esiste)
- `component-models.json` → Models (che campi sono editabili)
- `component-filters.json` → Filters (cosa è droppabile dove)
- Gerarchia: **Section** → **Block** → **Block-item** (item ripetibile dentro un campo `container`, `multi: true`)

---

## 6. Stato attuale del repo di test (fotografia dell'esplorazione)

> Nessuna modifica al codice fatta finora — solo esplorazione informativa.

**Config generale**
- `package.json` ancora nominato `@adobe/aem-boilerplate` (non rinominato per il progetto di test)
- Nessuna dipendenza runtime — puro JS vanilla
- `README.md` ancora quello del template, non personalizzato
- `fstab.yaml` punta all'author AEMaaCS `edodemurureply/eds-poc-soco`
- `.hlxignore` esclude i file `_*` (frammenti dei modelli) e altri file non pubblicabili

**Blocks (`blocks/`)**
- Base boilerplate: `article`, `cards`, `columns`, `footer`, `fragment`, `header`, `hero`
- Due block custom recenti (ultimi commit del collega), sembrano due iterazioni dello stesso concetto:
  - **`column-stack`**: stack di colonne annidate (`nested-column`), con `title` e `size` (s/m/l/xl) configurabili tramite select fissa — più strutturato
  - **`custom-columns`**: colonna container + catena di `single-column` annidate telescopicamente l'una dentro l'altra, `size` a testo libero — più sperimentale

**Models (`models/`)**
- Modelli base standard: `_button`, `_image`, `_page`, `_section`, `_text`, `_title`
- Una cartella custom (`custom-section` o simile) per il layout a colonne custom

**Scripts (`scripts/`)**
- File standard (`aem.js`, `scripts.js`, `delayed.js`, `editor-support*.js`)
- `dompurify.min.js` — probabilmente per sanitizzare contenuto nel block `article`

**Struttura contenuti in Universal Editor**
- Pagina → Sezioni (standard o layout a colonne custom) → Blocchi → (card, nested-column, single-column)

---

## 7. Avanzamento test componenti

- [x] Repo clonato in locale (Windows, PowerShell)
- [x] Accesso completo confermato (repo + Author Universal Editor)
- [x] Esplorazione struttura repo (fatta — vedi §6)
- [x] Primo giro `aem up` locale
- [ ] Analisi a fondo di `column-stack` vs `custom-columns` (capire pro/contro delle due iterazioni)
- [x] Primo componente semplice creato da zero (block + model piatto) — block `quote` (richtext + text), vedi §10
- [ ] Componente con varianti/select
- [ ] Componente con contenuto ripetibile (`container`, `multi: true`)
- [ ] Componente annidato/composto

---

## 8. Domande aperte / decisioni da prendere

- [ ] `column-stack` e `custom-columns` sono due esperimenti da confrontare/consolidare, o vanno tenuti entrambi come pattern diversi?
- [ ] Perché `dompurify.min.js` nel block `article` — che tipo di contenuto HTML "libero" gestisce?
- [ ] Verificare se `npm run build:json` è configurato/funzionante nel repo di test

---

## 9. Primo componente pratico: block `quote`

Seguito il tutorial ufficiale [Creating Blocks for Universal Editor](https://www.aem.live/developer/universal-editor-blocks), adattato al pattern a frammenti di questo repo (invece di editare a mano i file `component-*.json` aggregati in root):

- `blocks/quote/_quote.json` — definition + model (campi `quote` richtext, `author` text) + filters vuoti
- `blocks/quote/quote.js` — decorate: avvolge il testo in un `<blockquote>`
- `blocks/quote/quote.css` — sfondo grigio, stile citazione con lineetta decorativa sotto l'autore
- Aggiunto `"quote"` alla lista componenti permessi in `models/_section.json` (filtro della section standard)
- Rigenerato con `npm run build:json`

**Workflow di test stabilito (da ripetere per ogni nuovo blocco):**
1. Sviluppare il block (json/js/css)
2. Commit + push del branch di lavoro (mai in `main` — vedi nota sotto)
3. Creare/usare una pagina dedicata in Sites Console + Universal Editor
4. Aprire l'editor con `?ref=<branch>` in coda all'URL (altrimenti l'editor legge i componenti da `main` e il nuovo block non compare nella ricerca "+")
5. Aggiungere il componente, personalizzare i campi, pubblicare in **Anteprima** (mai "Live")
6. Verificare via `curl <preview-url>/index/<page-name>.md` e `.html`

**Nota sul path delle pagine:** le pagine create in Sites Console sotto la root del sito risultano raggiungibili come `/index/<nome-pagina>` in preview/live (non `/<nome-pagina>` diretto) — es. pagina `test-quote` → `https://<branch>--eds-poc-soco--edodemurureply.aem.page/index/test-quote`.

**Testato su:** branch `feature/ue-tutorial`, pagina `test-quote`, pubblicato in anteprima. ✅ Funzionante end-to-end.

**Regola importante:** `CLAUDE.md`, `KNOWLEDGE.md` e `AGENTS.md` non vanno **mai** pushati/mergiati in `main` — restano solo sui branch di lavoro/pratica.

---

## 10. Come usare questo file nel workflow

- **Claude.ai (questo progetto):** teoria, roadmap, decisioni — aggiorna le sezioni 4, 5, 8
- **Claude Code (repo locale):** esplorazione pratica, codice — aggiorna le sezioni 6, 7
- Prima di ogni sessione di lavoro pratico, porta l'ultima versione di questo file in Claude Code come contesto
- Dopo ogni sessione, riporta qui (anche solo a voce, in chat) cosa è stato scoperto/fatto, così l'aggiorniamo insieme

---
*Ultimo aggiornamento: 15 settembre 2026*
