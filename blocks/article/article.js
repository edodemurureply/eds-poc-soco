import { createOptimizedPicture, getMetadata } from '../../scripts/aem.js';

/**
 * Article block - Option B, the shell page whose body is fetched client-side.
 *
 * The page shipped by AEM carries only an empty <div class="article"> plus its head metadata.
 * This block parses the URL, fetches the article JSON from ArticleJsonServlet, and builds the
 * DOM the ported CSS expects.
 *
 * DOM parity is the goal (brief 6.2, acceptance criterion A4). Every class name below is taken
 * from the HTL the source renders today, so blocks/article/article.css - which is compiled from
 * that same component LESS - attaches without modification:
 *
 *   .article-category-container .tag-*   articleCategory.html
 *   h1.cmp-title__text / p.cmp-subtitle  articletitle.html
 *   .article--author-section             articleAuthor.html
 *   .article--publishedDate-section      articlePublishDate.html
 *   .articleimage .cmp-image             articleimage.html
 *   .articlecontentfragment              articlecontentfragment.html
 *
 * Structured data (R5) is out of scope for the POC: the block injects no JSON-LD, and the
 * endpoint returns none.
 */

/** Default endpoint. Overridable per page so the POC can be pointed at another environment. */
const DEFAULT_ENDPOINT = 'https://publish-p42403-e1312991.adobeaemcloud.com/bin/southern/global/article.json';

/** Default article-base page, whose basePageSearchPaths drive the fragment lookup (R2). */
const DEFAULT_BASE_PATH = '/content/eds-poc-soco-2/newsroom/article-base';

/**
 * Splits the path into category and slug.
 *
 * Tolerates both forms deliberately: the CDN request transformation strips .html before the
 * request reaches the origin, but the block should not break if it ever sees the extension -
 * for instance when the page is opened directly on the preview host, where no transformation
 * runs.
 *
 * @param {string} pathname e.g. /newsroom/financials/southern-company-reports-...-earnings.html
 * @returns {{category: string, slug: string}|null} null when the path has no slug segment
 */
export function parseArticlePath(pathname) {
  const segments = pathname.split('/').filter(Boolean);
  if (segments.length < 2) return null;

  const slug = segments[segments.length - 1].replace(/\.html$/, '');
  const category = segments[segments.length - 2];

  if (!slug) return null;
  return { category, slug };
}

/** Reads a page-level override, falling back to the default. */
function config(name, fallback) {
  const value = getMetadata(name);
  return value && value.trim() ? value.trim() : fallback;
}

function el(tag, className, text) {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (text) node.textContent = text;
  return node;
}

/**
 * Renders the visible error state.
 *
 * Brief 6.3 is explicit that today's behaviour must not be reproduced: a missing article either
 * 302s to a 404 page or renders an apology string with HTTP 200. This is loud, it names the slug
 * that failed, and it does not pretend to be an article.
 */
function renderError(block, slug, detail) {
  const box = el('div', 'article-error');
  box.append(el('h2', null, 'This article could not be loaded'));
  box.append(el('p', null, detail));

  const ref = el('p');
  ref.append(document.createTextNode('Requested article: '));
  ref.append(el('code', null, slug || '(none)'));
  box.append(ref);

  block.replaceChildren(box);
  block.dataset.state = 'error';
}

/** Category chips. R9's tag- classes go on the container, exactly as articleCategory.html does. */
function renderCategories(article) {
  const tags = article.tags || [];
  if (!tags.length) return null;

  const container = el('div', `article-category-container ${article.tagClasses || ''}`.trim());
  tags.forEach((title) => {
    const link = el('a', 'c-article-clickable', title);
    // The category segment is decorative in the source too: resolution is by fragment node name,
    // never by category. The link mirrors the URL shape rather than driving anything.
    link.href = `/newsroom/${title.toLowerCase().replace(/ /g, '-')}`;
    container.append(link);
  });
  return container;
}

/** Headline and subtitle, matching articletitle.html. */
function renderTitle(article) {
  const wrapper = el('div', 'cmp-title');
  wrapper.append(el('h1', 'cmp-title__text', article.title));
  if (article.subtitle) wrapper.append(el('p', 'cmp-subtitle', article.subtitle));
  return wrapper;
}

/** Author and publish date, matching articleAuthor.html and articlePublishDate.html. */
function renderByline(article) {
  const fragment = document.createDocumentFragment();

  if (article.author) {
    const section = el('div', 'article--author-section');
    const author = el('div', 'article--author');
    if (article.authorLink) {
      const link = el('a', 'article--author-link', article.author);
      link.href = article.authorLink;
      link.setAttribute('aria-label', article.author);
      author.append(link);
    } else {
      author.textContent = article.author;
    }
    section.append(author);
    fragment.append(section);
  }

  if (article.publishDate) {
    const section = el('div', 'article--publishedDate-section');
    const date = el('div', 'article--pubishedDate-date');
    const parsed = new Date(article.publishDate);
    // The class name carries the source's typo (pubishedDate). Kept so the ported CSS matches.
    date.textContent = Number.isNaN(parsed.getTime())
      ? article.publishDate
      : parsed.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
    if (!Number.isNaN(parsed.getTime())) date.setAttribute('datetime', article.publishDate);
    section.append(date);
    fragment.append(section);
  }

  return fragment;
}

/** Hero image, matching articleimage.html but using EDS optimised picture markup. */
function renderHeroImage(article) {
  if (!article.promoImage) return null;

  const wrapper = el('div', 'articleimage');
  const inner = el('div', 'cmp-image');
  const picture = createOptimizedPicture(article.promoImage, article.promoImageAlt || '', true, [
    { media: '(min-width: 768px)', width: '711' },
    { width: '335' },
  ]);
  picture.querySelector('img').className = 'cmp-image__image';
  inner.append(picture);
  wrapper.append(inner);
  return wrapper;
}

/**
 * The article body.
 *
 * innerHTML is intentional and matches today's context="unsafe"
 * (articlecontentfragment.html:25) - the body is trusted author HTML by design. Brief 6.2 asks
 * that sanitisation not be added silently, because it would change rendering.
 */
function renderBody(article) {
  const wrapper = el('div', 'articlecontentfragment');
  wrapper.innerHTML = article.body || '';
  return wrapper;
}

function setMeta(selector, attribute, value, create) {
  if (!value) return;
  // Only fill gaps. A tag the generated page already shipped is the one crawlers actually saw,
  // so it must win over anything computed here (brief 6.1 step 5).
  if (document.head.querySelector(selector)) return;
  const tag = create();
  tag.setAttribute(attribute, value);
  document.head.append(tag);
}

/** Tops up head tags the generated shell page did not carry. Never overwrites. */
function topUpHeadTags(article) {
  const canonical = article.canonicalUrlOverride || article.canonicalUrl;
  const suppressed = String(article.disableCanonicalUrlTag).toLowerCase() === 'true';

  if (canonical && !suppressed) {
    setMeta('link[rel="canonical"]', 'href', canonical, () => {
      const link = document.createElement('link');
      link.rel = 'canonical';
      return link;
    });
  }

  const meta = (selector, key, keyAttr, value) => setMeta(selector, 'content', value, () => {
    const tag = document.createElement('meta');
    tag.setAttribute(keyAttr, key);
    return tag;
  });

  meta('meta[name="description"]', 'description', 'name', article.shortDescription);
  meta('meta[property="og:title"]', 'og:title', 'property', article.title);
  meta('meta[property="og:description"]', 'og:description', 'property', article.shortDescription);
  meta('meta[property="og:url"]', 'og:url', 'property', canonical);
  meta('meta[property="og:image"]', 'og:image', 'property', article.promoImage);
  meta('meta[name="twitter:title"]', 'twitter:title', 'name', article.title);
  meta('meta[name="twitter:description"]', 'twitter:description', 'name', article.shortDescription);
  meta('meta[name="twitter:image"]', 'twitter:image', 'name', article.promoImage);
}

function render(block, article) {
  const parts = document.createDocumentFragment();

  const categories = renderCategories(article);
  if (categories) parts.append(categories);

  parts.append(renderTitle(article));
  parts.append(renderByline(article));

  const hero = renderHeroImage(article);
  if (hero) parts.append(hero);

  parts.append(renderBody(article));

  block.replaceChildren(parts);
  block.dataset.state = 'loaded';

  topUpHeadTags(article);
}

export default async function decorate(block) {
  block.dataset.state = 'loading';

  const parsed = parseArticlePath(window.location.pathname);
  if (!parsed) {
    renderError(block, null, 'The URL does not contain an article slug.');
    return;
  }

  const endpoint = config('article-endpoint', DEFAULT_ENDPOINT);
  const basePath = config('article-base-path', DEFAULT_BASE_PATH);
  const url = `${endpoint}?name=${encodeURIComponent(parsed.slug)}&base=${encodeURIComponent(basePath)}`;

  let response;
  try {
    response = await fetch(url);
  } catch (error) {
    // Fail loudly (brief 6.1 step 2). A cross-origin failure surfaces here with an opaque
    // message, so the endpoint is named to make it diagnosable.
    // eslint-disable-next-line no-console
    console.error(`[article] request to ${url} failed`, error);
    renderError(block, parsed.slug, 'The article service could not be reached.');
    return;
  }

  if (!response.ok) {
    // eslint-disable-next-line no-console
    console.error(`[article] ${url} returned HTTP ${response.status}`);
    renderError(
      block,
      parsed.slug,
      response.status === 404
        ? 'No article exists at this address.'
        : `The article service returned an error (HTTP ${response.status}).`,
    );
    return;
  }

  let article;
  try {
    article = await response.json();
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error(`[article] ${url} did not return valid JSON`, error);
    renderError(block, parsed.slug, 'The article service returned an unreadable response.');
    return;
  }

  render(block, article);
}
