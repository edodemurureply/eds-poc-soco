# Lezioni EDS + Universal Editor

> Conoscenza tecnica riutilizzabile, verificata su questo repo. Leggere solo la sezione che serve.
> Una voce entra qui solo se vale oltre l'esperimento che l'ha prodotta; la storia sta in `experiments-archive.md`.

## Fonti

- Doc ufficiale: https://www.aem.live (preferirla a Experience League per le guide pratiche).
  Pagine chiave: `/developer/component-model-definitions`, `/developer/universal-editor-blocks`,
  `/developer/markup-sections-blocks`, `/developer/keeping-it-100`.
- Field types UE: https://experienceleague.adobe.com/en/docs/experience-manager-cloud-service/content/implementing/developing/universal-editor/field-types
- Prima di scrivere un blocco da zero: https://github.com/adobe/aem-block-collection
- Regole di lint dei model: https://github.com/adobe-rnd/eslint-plugin-xwalk

## Model, definition e filtri

- **I model sono un pool globale referenziato per `id`**: più definition (block o item) possono
  puntare allo stesso model. Non duplicare campi identici tra blocchi.
- **I filtri elencano id di definition, non di model.**
- **UE mostra il picker solo se il filtro ha più di un'opzione.** Con una sola, inserisce quella
  senza chiedere. Per far scegliere una variante: più definition con lo stesso model e preset diversi.
- **Non esiste `minSize` sui container, né validazioni custom prima della pubblicazione**: EDS fa
  solo controlli fissi (permessi, path riservati, immagini, JSON-LD). Un blocco vuoto va gestito in
  `decorate()` (ignorare le righe senza contenuto invece di applicare stili di default).
- **`validation.rootPath`** sui campi `aem-content`: senza, il selettore si apre su `/content` e
  mostra tutti i siti dell'istanza. Il path è scritto a mano: va aggiornato se il sito cambia nome.

## Field e markup

- **Field collapse**: `link` + `linkText` sono due campi per l'autore ma un solo `<a>` nel markup.
  Una voce con testo ma senza link non produce nessun elemento: nel canvas è invisibile, si vede
  solo in Struttura contenuto. Vale per ogni elemento vuoto in UE, non aggirarlo con default finti.
- **Le celle dei blocchi non seguono la convenzione dei bottoni**: `decorateButtons` cerca `p a[href]`
  con grassetto/corsivo autorato, che nelle celle non c'è. I CTA nei blocchi si stilano nel blocco.

## Decorazione

- **`moveInstrumentation()`** serve quando si **creano** elementi nuovi che sostituiscono righe
  autorate (es. `<li>`, `<a>`). Spostando nodi esistenti, gli attributi UE viaggiano da soli.
- **`display: contents`** su un wrapper aggiunto per lo stile: lo toglie dal layout ma lo tiene nel
  DOM, così i figli conservano le proprie `grid-area` (che valgono solo per figli diretti).
- **Header del boilerplate**: su desktop `aria-expanded="true"` sulla nav significa "voci visibili",
  non "menu aperto". Uno stile basato su quell'attributo va neutralizzato nella media query desktop.
- **Nesting**: due strategie viste nel repo. Simulato via CSS (`column-stack`: item fratelli nel DOM,
  `position: absolute` + custom property di profondità, dimensione da `select`) oppure reale nel DOM
  (`custom-columns`: ogni item spostato dentro il precedente, dimensione a testo libero). Preferire
  `column-stack` come riferimento: più robusto, niente testo libero non validato.

## URL e ambienti

- Le pagine create sotto la root del sito rispondono su `/index/<pagina>`, non su `/<pagina>`.
- Nel subdominio `.aem.page`/`.aem.live` lo `/` del branch diventa `-` (`feature/x` → `feature-x`).
- UE legge il codice da GitHub per il branch in `?ref=<branch>`: senza push o senza `?ref=` il blocco
  nuovo non compare. Flusso completo: `FLOW.md`.

## Tooling

- **Errori lint `linebreak-style` (CRLF) su Windows**: `.gitattributes` con `eol=lf` non basta se
  `core.autocrlf=true`. Correzione, solo per questo repo:
  `git config core.autocrlf false`, poi `git rm --cached -r .` e `git reset --hard`.
- `npm run build:json` dopo ogni modifica ai partial `_*.json`; i file aggregati non si editano a mano.
