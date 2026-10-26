const INDEX_PATH = '/query-index.json';

/**
 * Converte l'href di un link nel path usato dall'indice.
 * Nel canvas di UE i link sono path di authoring (/content/<sito>/<path>.html),
 * nella pagina pubblicata sono gia' path di delivery (/<path>).
 * @param {string} href The raw href
 * @returns {string} The path as it appears in the query index
 */
function toIndexPath(href) {
  const { pathname } = new URL(href, window.location.origin);
  return pathname
    .replace(/^\/content\/[^/]+/, '')
    .replace(/\.html$/, '');
}

/**
 * Ricava un titolo leggibile dal path, per le pagine di cui non sappiamo nulla.
 * @param {string} path The page path
 * @returns {string} A human readable fallback title
 */
function titleFromPath(path) {
  const slug = path.split('/').filter(Boolean).pop() || path;
  const words = slug.replace(/-/g, ' ');
  return words.charAt(0).toUpperCase() + words.slice(1);
}

/**
 * Scarica l'indice una volta sola e lo indicizza per path.
 * Via veloce: una richiesta per tutte le card.
 * @returns {Promise<Map<string, Object>>} Index rows by path, empty if unavailable
 */
async function loadIndex() {
  try {
    const resp = await fetch(INDEX_PATH);
    if (!resp.ok) return new Map();
    const { data } = await resp.json();
    return new Map(data.map((row) => [row.path, row]));
  } catch (error) {
    return new Map();
  }
}

/**
 * Legge i metadati direttamente dall'head della pagina referenziata.
 * Via lenta: una richiesta per card, ma non dipende dalla configurazione
 * dell'indice. Usa l'href autorato cosi' da risolvere sia sul sito pubblicato
 * sia sull'host di authoring dentro Universal Editor.
 * @param {string} href The authored href
 * @returns {Promise<Object|null>} Metadata for the page, or null if unreachable
 */
async function fetchPageMeta(href) {
  try {
    const resp = await fetch(href);
    if (!resp.ok) return null;
    const doc = new DOMParser().parseFromString(await resp.text(), 'text/html');
    const meta = (selector) => doc.querySelector(selector)?.getAttribute('content');
    return {
      title: meta('meta[property="og:title"]') || doc.querySelector('title')?.textContent,
      description: meta('meta[name="description"]'),
    };
  } catch (error) {
    return null;
  }
}

/**
 * Costruisce la card di una singola pagina.
 * @param {HTMLAnchorElement} link The authored link
 * @param {Object} meta The metadata found for the page, if any
 * @returns {HTMLLIElement} The card
 */
function buildCard(link, meta) {
  const href = link.getAttribute('href');
  const card = document.createElement('li');
  card.className = 'related-content-card';

  const anchor = document.createElement('a');
  anchor.href = href;

  const title = document.createElement('span');
  title.className = 'related-content-card-title';
  title.textContent = meta?.title || titleFromPath(toIndexPath(href));
  anchor.append(title);

  if (meta?.description) {
    const description = document.createElement('span');
    description.className = 'related-content-card-description';
    description.textContent = meta.description;
    anchor.append(description);
  }

  card.append(anchor);
  return card;
}

/**
 * loads and decorates the block
 * @param {Element} block The block element
 */
export default async function decorate(block) {
  const [headingRow, linksRow] = block.children;
  const links = [...(linksRow?.querySelectorAll('li a[href]') ?? [])];

  if (!links.length) {
    block.textContent = '';
    return;
  }

  const heading = headingRow?.querySelector(':scope > div');
  if (heading?.textContent.trim()) {
    heading.className = 'related-content-heading';
  } else {
    headingRow?.remove();
  }

  const index = await loadIndex();
  const cards = await Promise.all(links.map(async (link) => {
    const href = link.getAttribute('href');
    const row = index.get(toIndexPath(href));
    const meta = row?.title ? row : await fetchPageMeta(href);
    return buildCard(link, meta ?? row);
  }));

  const list = document.createElement('ul');
  list.className = 'related-content-list';
  list.append(...cards);
  linksRow.replaceChildren(list);
}
