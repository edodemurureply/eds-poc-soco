# FLOW.md — Flusso di lavoro: modifica, editing, verifica

> Guida pratica passo-passo per fare una modifica (es. nuovo block) e verificarla,
> con tutti gli URL coinvolti e a cosa serve ciascuno. Vedi anche `KNOWLEDGE.md` §9
> per il log di cosa è stato fatto finora.

---

## URL pronti all'uso (questo progetto, branch `feature/ue-tutorial`)

Sostituisci solo `<pagina>` (es. `test-quote`, `test-callout-list`).
Le pagine sotto la radice del sito stanno in `index/`; `nav` invece sta alla radice.

| Dove | URL |
|---|---|
| **Sviluppo locale** (`aem up` attivo) | `http://localhost:3000/index/<pagina>` |
| **Sites Console** — trovare/creare pagine | `https://author-p42403-e1312991.adobeaemcloud.com/ui#/aem/sites.html/content/eds-poc-soco-2` |
| **Editing in UE** — una pagina normale | `https://author-p42403-e1312991.adobeaemcloud.com/ui#/@aktivereplyemeaptrsd/aem/universal-editor/canvas/author-p42403-e1312991.adobeaemcloud.com/content/eds-poc-soco-2/index/<pagina>.html?ref=feature/ue-tutorial` |
| **Editing in UE** — la navbar | `https://author-p42403-e1312991.adobeaemcloud.com/ui#/@aktivereplyemeaptrsd/aem/universal-editor/canvas/author-p42403-e1312991.adobeaemcloud.com/content/eds-poc-soco-2/nav.html?ref=feature/ue-tutorial` |
| **Preview del branch** (dopo "Pubblica → Anteprima") | `https://feature-ue-tutorial--eds-poc-soco--edodemurureply.aem.page/index/<pagina>` |
| **Live / produzione** (solo dopo merge in `main`) | `https://main--eds-poc-soco--edodemurureply.aem.live/index/<pagina>` |

**Spostarsi tra pagine restando nell'editor:** il canvas di UE è legato a una singola pagina e non ha un navigatore interno. Invece di tornare alla Sites Console, modifica direttamente il percorso dentro l'URL del canvas — la parte `/content/eds-poc-soco-2/<percorso-pagina>.html` — e ricarica.

**Contenuto di test in locale senza toccare AEM:** metti un file in `drafts/` (cartella ignorata da git) e avvia il server con `--html-folder drafts`. Per sovrascrivere una pagina alla radice del sito, come `/nav`, serve anche `--html-mount /`, e il file va chiamato `nav.plain.html`:
```
npx @adobe/aem-cli up --no-open --html-folder drafts --html-mount / --prefer-plain-html
```
⚠️ Da PowerShell, non da Git Bash: quest'ultimo converte lo `/` di `--html-mount` in un percorso Windows e il mount finisce nel posto sbagliato.

**Contenuto del tuo branch invece che di `main` in locale:** di default `aem up` prende i contenuti dal preview di `main`, quindi le pagine pubblicate solo sul tuo branch non si vedono (o si vedono nella versione vecchia). Per puntarlo al tuo branch:
```
npx @adobe/aem-cli up --no-open --url https://feature-ue-tutorial--eds-poc-soco--edodemurureply.aem.page
```
Così hai **codice locale + contenuto del branch**, che è la combinazione giusta per sviluppare dopo aver pubblicato in Anteprima.

---

## 0. Concetti chiave: i 3 "ambienti" diversi

Ci sono **tre posti diversi** dove puoi vedere/testare il sito, e si confondono facilmente
perché sembrano simili ma servono a cose diverse:

| Ambiente | Cosa fa | Dove gira il codice |
|---|---|---|
| **Locale** (`localhost:3000`) | Dev server sul tuo PC | Codice locale (anche non committato) + contenuto già "previewato" dagli autori |
| **Author / Universal Editor** (`adobeaemcloud.com`) | Dove **autori/editi** i contenuti (WYSIWYG) | Legge il codice pubblicato su GitHub per il branch selezionato |
| **Preview / Live** (`.aem.page` / `.aem.live`) | Dove **vedi il risultato finale renderizzato** | Codice + contenuto pubblicati (Anteprima o Live) |

Il punto chiave da ricordare: **editing e verifica avvengono in due posti diversi**, con
due URL completamente diversi, entrambi legati allo stesso branch ma con forma diversa.

---

## 1. Flusso completo, passo per passo

### Passo 1 — Sviluppa la modifica in locale
Modifica/crea i file (es. `blocks/{nome}/_{nome}.json`, `.js`, `.css`).
Se hai toccato i modelli (`_*.json`), rigenera gli aggregati:
```
npm run build:json
```
Verifica localmente con `aem up` attivo su `http://localhost:3000`.

### Passo 2 — Committa e pusha sul branch di lavoro
Il branch **deve** chiamarsi `feature/{nome-feature}` (convenzione del progetto, vedi `AGENTS.md`).
```
git add <file>
git commit -m "..."     # fallo tu, l'agente non committa mai
git push
```
⚠️ Finché non pushi su GitHub, l'Universal Editor **non vede** le tue modifiche:
legge il codice pubblicato su GitHub per quel branch (via AEM Code Sync), non i file locali.

### Passo 3 — Apri la pagina in Universal Editor per editare
Vai sull'URL del **canvas** dell'Universal Editor, che punta all'istanza **author**
(`adobeaemcloud.com`, NON `.aem.page`), con il branch specificato in `?ref=`:

```
https://<author-host>/ui#/@<org-slug>/aem/universal-editor/canvas/<author-host>/content/<sito>/index/<pagina>.html?ref=<branch>
```

Esempio concreto usato finora:
```
https://author-p42403-e1312991.adobeaemcloud.com/ui#/@aktivereplyemeaptrsd/aem/universal-editor/canvas/author-p42403-e1312991.adobeaemcloud.com/content/eds-poc-soco-2/index/test-quote.html?ref=feature/ue-tutorial
```

Note importanti su questo URL:
- Il `?ref=<branch>` è **obbligatorio** per vedere codice/componenti del tuo branch invece che di `main`.
- Questo URL è diverso da quello della **Sites Console** (quello con `sites.html` nel path) — quello serve solo per navigare/creare pagine, non per l'editing WYSIWYG vero e proprio.
- Se la pagina non esiste ancora, creala prima dalla Sites Console, poi apri il canvas UE su quella pagina.

### Passo 4 — Aggiungi/modifica il componente ed edita i campi
Nell'editor, usa "+" per aggiungere il blocco, compila i campi definiti nel model.
Se il componente nuovo non compare nella ricerca "+": molto probabilmente non hai ancora
pushato il branch (torna al Passo 2), oppure l'editor sta ancora leggendo `main`
(manca `?ref=` nell'URL).

### Passo 5 — Pubblica
Dal pulsante "Pubblica", scegli la destinazione:
- **Anteprima** → usa questa **sempre** durante i test/pratica
- **Live** → mai, in questa fase di apprendimento (andrebbe in produzione)

### Passo 6 — Verifica il risultato pubblicato
Ora guarda il contenuto pubblicato tramite l'URL di **delivery/preview** (`.aem.page`),
che è tutt'altra cosa dall'URL author usato al Passo 3:

```
https://<branch>--<repo>--<owner>.aem.page/index/<pagina>
```

⚠️ **Attenzione alla trasformazione del nome branch:** un subdominio DNS non può contenere `/`.
Se il branch si chiama `feature/ue-tutorial` (con lo slash, come da nostra convenzione),
nell'URL diventa `feature-ue-tutorial` (slash → trattino):

```
https://feature-ue-tutorial--eds-poc-soco--edodemurureply.aem.page/index/test-quote
```

⚠️ **Attenzione al path della pagina:** le pagine create alla root del sito in Sites Console
sono raggiungibili come `/index/<nome-pagina>`, non `/<nome-pagina>` diretto.

Puoi verificare con:
```
curl https://<branch-con-trattini>--<repo>--<owner>.aem.page/index/<pagina>          # HTML
curl https://<branch-con-trattini>--<repo>--<owner>.aem.page/index/<pagina>.md       # markdown
curl https://<branch-con-trattini>--<repo>--<owner>.aem.page/index/<pagina>.plain.html  # HTML "grezzo" pre-decorazione
```

Per la versione **live** (produzione, dopo merge in `main`), stesso schema ma dominio `.aem.live`
e branch `main`:
```
https://main--eds-poc-soco--edodemurureply.aem.live/index/<pagina>
```

---

## 2. Riepilogo URL — tabella di riferimento rapido

| Scopo | Dominio | Esempio |
|---|---|---|
| Dev locale | `localhost:3000` | `http://localhost:3000/index/test-quote` |
| Editing WYSIWYG (Universal Editor canvas) | `<author-host>.adobeaemcloud.com` | `.../ui#/@org/aem/universal-editor/canvas/...?ref=<branch>` |
| Navigazione/creazione pagine (Sites Console) | `<author-host>.adobeaemcloud.com` | `.../ui#/aem/sites.html/content/<sito>` |
| Verifica contenuto pubblicato in Anteprima | `<branch>--<repo>--<owner>.aem.page` | `https://feature-ue-tutorial--eds-poc-soco--edodemurureply.aem.page/index/test-quote` |
| Verifica contenuto pubblicato in Live (produzione) | `main--<repo>--<owner>.aem.live` | `https://main--eds-poc-soco--edodemurureply.aem.live/index/test-quote` |

Regola pratica: **author = dove editi**, **`.aem.page`/`.aem.live` = dove verifichi cosa hanno visto/vedranno gli utenti**.

---

## 3. Errori comuni (già incontrati)

- Scrivere lo slash del branch letteralmente nell'URL `.aem.page` (es. `https://feature/ue-tutorial--...`) → URL rotto, il browser interpreta male host/path. Va sostituito con `-`.
- Usare l'URL Sites Console (`sites.html`) invece del canvas per editare → non è la vista di editing corretta.
- Dimenticare `?ref=<branch>` sull'URL del canvas → l'editor mostra `main`, il nuovo componente non appare.
- Aprire `/<pagina>` invece di `/index/<pagina>` sulla preview → 404 "Not Found".
- Pubblicare in "Live" invece che "Anteprima" durante i test → da evitare in questa fase.

---
*Creato: 15 settembre 2026 — vedi `KNOWLEDGE.md` per il log di avanzamento e `AGENTS.md` per le regole del progetto.*
