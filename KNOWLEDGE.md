# KNOWLEDGE.md — Compendio Conoscenze e Avanzamenti (EDS + Universal Editor)

> File di supporto ad `AGENTS.md`. `AGENTS.md` dice all'agente **come comportarsi** nel progetto;
> questo file tiene traccia di **cosa sappiamo, da dove viene l'informazione, e a che punto siamo**.
> Aggiornalo man mano che si procede (sia da Claude.ai che da Claude Code).
>
> Per il flusso pratico passo-passo (editing, publish, quali URL controllare) vedi `FLOW.md`.

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
| `https://experienceleague.adobe.com/en/docs/experience-manager-cloud-service/content/implementing/developing/universal-editor/field-types` | Field types per i model dei blocchi UE (component values disponibili: text, richtext, select, reference, ecc.) |
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
- [x] Analisi a fondo di `column-stack` vs `custom-columns` (vedi §8 per la conclusione)
- [x] Primo componente semplice creato da zero (block + model piatto) — block `quote` (richtext + text), vedi §9
- [x] Componente con varianti/select — block `callout` (richtext + select variant: info/success/warning)
- [x] Componente con contenuto ripetibile (`container`/block-item) — block `callout-list`, vedi §9-bis
- [ ] Componente annidato/composto (studio già fatto su `column-stack`/`custom-columns` esistenti, vedi §8; manca un componente scritto da zero con questo pattern)

---

## 8. Domande aperte / decisioni da prendere

- [x] `column-stack` vs `custom-columns` — **analizzati entrambi, risposta trovata.** Sono due iterazioni dello stesso obiettivo visivo (scatole annidate di dimensione decrescente), con strategie tecniche opposte:
  - **Nesting nel DOM:** `column-stack` è "finto" (gli item restano fratelli nel DOM, l'effetto scatole-dentro-scatole è ottenuto solo via CSS con `position: absolute` + custom property `--column-depth`); `custom-columns` è "vero" (ogni `single-column` viene annidato realmente dentro il precedente durante la decorazione, con un ciclo che sposta il "parent corrente" a ogni iterazione).
  - **Campo dimensione:** `column-stack` usa un `select` con opzioni fisse (s/m/l/xl); `custom-columns` usa un campo di testo libero, gestito solo con un `.toLowerCase()` — nessuna validazione su refusi, spazi, o valori non previsti (se l'autore sbaglia, semplicemente non viene applicato nessuno stile, senza errore visibile).
  - **Conclusione:** `column-stack` è la versione più matura/robusta (probabilmente la seconda iterazione, con la lezione imparata su cosa non fare); `custom-columns` è il prototipo più fragile. Da preferire `column-stack` come riferimento per pattern futuri di nesting in questo repo; `custom-columns` resta comunque utile come esempio didattico di "nesting reale nel DOM" contro "nesting simulato via CSS".
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

**Workflow di test stabilito (da ripetere per ogni nuovo blocco)** — versione dettagliata con tutti gli URL in `FLOW.md`:
1. Sviluppare il block (json/js/css)
2. Commit + push del branch di lavoro (mai in `main` — vedi nota sotto)
3. Creare/usare una pagina dedicata in Sites Console + Universal Editor
4. Aprire l'editor con `?ref=<branch>` in coda all'URL (altrimenti l'editor legge i componenti/codice da `main` e il nuovo block non compare/non aggiorna). Attenzione: l'URL del **canvas** dell'Universal Editor (quello aperto in modalità "Edit", con vista live della pagina) ha una forma diversa da quello della Sites Console, es.:
   `https://<author-host>/ui#/@<org-slug>/aem/universal-editor/canvas/<author-host>/content/<site>/index/<page>.html?ref=<branch>`
   (il `?ref=` va aggiunto in fondo a **questo** URL, non a quello con `sites.html`)
5. Aggiungere il componente, personalizzare i campi, pubblicare in **Anteprima** (mai "Live")
6. Verificare via `curl <preview-url>/index/<page-name>.md` e `.html`

**Nota sul path delle pagine:** le pagine create in Sites Console sotto la root del sito risultano raggiungibili come `/index/<nome-pagina>` in preview/live (non `/<nome-pagina>` diretto) — es. pagina `test-quote` → `https://<branch>--eds-poc-soco--edodemurureply.aem.page/index/test-quote`.

**Nota sui nomi branch con `/` nell'URL di preview/live:** un subdominio DNS non può contenere `/`, quindi se il nome del branch ha uno slash (es. `feature/ue-tutorial`, come da convenzione adottata in questo repo), Code Sync lo traduce sostituendo `/` con `-` nel subdominio `.aem.page`/`.aem.live`:
`feature/ue-tutorial` → `feature-ue-tutorial` → `https://feature-ue-tutorial--eds-poc-soco--edodemurureply.aem.page/...`

**Testato su:** branch `feature/ue-tutorial`, pagina `test-quote`, pubblicato in anteprima. ✅ Funzionante end-to-end.

**Iterazione 2 — versione "block collection" del quote:** sostituiti `quote.js`/`quote.css` con la versione più raffinata di [adobe/aem-block-collection](https://github.com/adobe/aem-block-collection) (stesso model/json, decorazione diversa):
- `quote.js`: sposta (non ricrea) le celle originali dentro un unico `<blockquote>`, assegnando classi `quote-quotation`/`quote-attribution`; converte eventuali `<em>` nell'attribuzione in `<cite>` (gestione graceful se l'autore non scrive nulla in corsivo)
- `quote.css`: virgolette e trattino tipografici generati via `::before`/`::after` su `:first-child`/`:last-child` dentro `quote-quotation`/`quote-attribution`
- **Punto aperto/da approfondire:** nel markup pubblicato reale (verificato via `curl`) le celle contengono solo testo puro, senza tag `<p>` interno — per le regole CSS standard i selettori `> :first-child::before` richiederebbero un elemento figlio per generare lo pseudo-elemento. Visivamente virgolette/trattino comparivano comunque nel browser: non abbiamo risolto la discrepanza fino in fondo (rimandato, non bloccante)
- Nessuna delle due versioni del JS chiama `moveInstrumentation()` — da verificare se l'editing in-place post-decorazione resta affidabile in UE (rilevante soprattutto per la v2, che sposta nodi esistenti)

**Regola importante:** `CLAUDE.md`, `KNOWLEDGE.md` e `AGENTS.md` non vanno **mai** pushati/mergiati in `main` — restano solo sui branch di lavoro/pratica.

---

## 9-bis. Componente con varianti: block `callout`

Block piatto (non ripetibile) con due campi: `message` (richtext) e `variant` (select: info/success/warning).
`decorate()` legge il testo del secondo child, lo usa per aggiungere una classe `callout-{variant}` al block, poi rimuove il div della variante dal DOM.
Il CSS applica colori diversi per variante tramite selettori `.callout.callout-{variant}`.

Testato su branch `feature/ue-tutorial`, aggiunto ai filtri di `_section.json`.

## 9-ter. Componente ripetibile con item annidati e varianti: block `callout-list`

Primo componente "block dentro un block" scritto da zero (a differenza di `column-stack`/`custom-columns`, che erano già presenti nel repo). Pattern scelto: **container con item ripetibili** (block/item UE standard), stesso approccio usato da `cards`/`card` nel boilerplate — non il nesting reale nel DOM (`custom-columns`) né il nesting via CSS (`column-stack`), giudicati meno adatti per una lista di elementi indipendenti.

Struttura (`blocks/callout-list/_callout-list.json`):
- Definition parent `callout-list`: `resourceType: .../block`, con `filter: "callout-list"` (nessun `model` proprio — il block non ha campi propri, solo item)
- **Correzione dopo primo test in UE:** inizialmente un solo item definition `callout-item` nel filtro → UE non chiedeva nulla e inseriva sempre la variante di default (comportamento corretto ma inatteso: con un solo tipo nel filtro, UE non mostra il picker, lo mostra solo quando ci sono più opzioni tra cui scegliere — stesso motivo per cui dentro una section, con filtro `_section.json` che elenca tanti componenti, l'aggiunta apre un picker). Risolto creando **tre definition item distinte** che condividono lo stesso model `callout-item` ma preset diversi: `callout-item-info`, `callout-item-success`, `callout-item-warning` (titoli "Callout item · Informazione/Successo/Attenzione", ciascuna con `variant` e testo di default coerenti). Tutte e tre elencate nel filtro di `callout-list`, così l'aggiunta di un item ora apre un picker con le 3 varianti.
- **Correzione DRY:** inizialmente i 3 item puntavano a un model separato `callout-item`, con campi identici (`message` + `variant`) a quelli di `callout` — duplicazione pura, segnalata giustamente come code smell (se cambi un campo in uno, dimentichi l'altro). Risolto: i model non sono legati al blocco che li usa, sono referenziati per `id` in un pool globale (`component-models.json`) — qualsiasi definition, di un block o di un block/item, può puntare allo stesso model. È il pattern esplicitamente consigliato dalla doc ufficiale ("*It is possible to use one model for many blocks*"). Ora i 3 item di `callout-list` puntano direttamente a `template.model: "callout"` (lo stesso model del block `callout`), e il model `callout-item` è stato rimosso da `_callout-list.json` (`"models": []`). Un solo campo `message`/`variant` da mantenere, condiviso da 4 definition (`callout` + le 3 varianti item).
- Filter `callout-list` → `["callout-item-info", "callout-item-success", "callout-item-warning"]` (i filtri elencano id di *definition*, non di model — restano invariati anche dopo la deduplicazione del model)

`callout-list.js`: itera `block.children` (ogni child è un item ripetuto), applica la stessa logica di `callout.js` per-item (classe `callout-list-item-{variant}` sul child, rimozione del div variante).

`callout-list.css`: container in `display: flex; flex-direction: column; gap` + stessi colori per variante di `callout.css`, con selettori scoped su `.callout-list-item-*` invece di `.callout-*` (nomi diversi per evitare collisioni con le classi del block `callout`).

**Verifica fatta:** pipeline locale (`aem up --html-folder`) conferma che il markup block/item viene riconosciuto e processato correttamente dal motore Franklin/EDS (struttura a righe → item ripetuti). Verifica visiva/end-to-end in Universal Editor **ancora da fare** — prossimo passo.

Aggiunto `"callout-list"` ai filtri di `_section.json`, rigenerato con `npm run build:json`.

---

## 10. Come usare questo file nel workflow

- **Claude.ai (questo progetto):** teoria, roadmap, decisioni — aggiorna le sezioni 4, 5, 8
- **Claude Code (repo locale):** esplorazione pratica, codice — aggiorna le sezioni 6, 7
- Prima di ogni sessione di lavoro pratico, porta l'ultima versione di questo file in Claude Code come contesto
- Dopo ogni sessione, riporta qui (anche solo a voce, in chat) cosa è stato scoperto/fatto, così l'aggiorniamo insieme

---
*Ultimo aggiornamento: 15 settembre 2026 (aggiunta §9-bis `callout`, §9-ter `callout-list`)*
