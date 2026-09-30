import { createOptimizedPicture } from '../../scripts/aem.js';
import { moveInstrumentation } from '../../scripts/scripts.js';

// Mobile/desktop switch of the on-prem image component (@screen-md-min: 992px).
// Keep in sync with image.css.
const MOBILE_MEDIA = '(max-width: 991px)';

function copyDimensions(from, to) {
  ['width', 'height'].forEach((attr) => {
    if (from.hasAttribute(attr)) to.setAttribute(attr, from.getAttribute(attr));
  });
}

function createMobileSources(image) {
  const { origin, pathname } = new URL(image.src, window.location.href);
  const ext = pathname.split('.').pop();
  return [['webply', 'image/webp'], [ext]].map(([format, type]) => {
    const source = document.createElement('source');
    source.media = MOBILE_MEDIA;
    if (type) source.type = type;
    source.srcset = `${origin}${pathname}?width=1000&format=${format}&optimize=medium`;
    copyDimensions(image, source);
    return source;
  });
}

export default function decorate(block) {
  const value = (name) => [...block.children]
    .find((row) => row.firstElementChild?.textContent.trim() === name)?.children[1];
  const image = value('image')?.querySelector('img');
  if (!image) return;

  const mobileImage = value('mobileImage')?.querySelector('img');
  const decorative = value('isDecorative')?.textContent.trim() === 'true';
  const captionValue = value('caption');
  const caption = captionValue?.textContent.trim();
  const authoredLink = value('link')?.querySelector('a[href]');

  const alt = image.alt || value('imageAlt')?.textContent.trim() || '';
  const picture = createOptimizedPicture(image.src, decorative ? '' : alt);
  if (mobileImage) picture.prepend(...createMobileSources(mobileImage));
  const optimizedImage = picture.querySelector('img');
  moveInstrumentation(image, optimizedImage);
  copyDimensions(image, optimizedImage);
  if (decorative) optimizedImage.setAttribute('role', 'presentation');

  const figure = document.createElement('figure');
  // A decorative image gives the link no accessible name: keep the link only
  // when the caption can name it, otherwise render the image unlinked.
  if (authoredLink && (!decorative || caption)) {
    const link = document.createElement('a');
    link.href = authoredLink.href;
    if (decorative) link.setAttribute('aria-label', caption);
    moveInstrumentation(authoredLink, link);
    link.append(picture);
    figure.append(link);
  } else {
    figure.append(picture);
  }

  if (caption) {
    const figcaption = document.createElement('figcaption');
    moveInstrumentation(captionValue, figcaption);
    const authoredCaption = captionValue.querySelector('p');
    if (authoredCaption) figcaption.append(authoredCaption);
    else figcaption.textContent = caption;
    figure.append(figcaption);
  }

  block.replaceChildren(figure);
}
