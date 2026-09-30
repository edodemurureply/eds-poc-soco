import { createOptimizedPicture } from '../../scripts/aem.js';
import { moveInstrumentation } from '../../scripts/scripts.js';

export default function decorate(block) {
  const value = (name) => [...block.children]
    .find((row) => row.firstElementChild?.textContent.trim() === name)?.children[1];
  const image = value('image')?.querySelector('img');
  if (!image) return;

  const decorative = value('isDecorative')?.textContent.trim() === 'true';
  const captionValue = value('caption');
  const caption = captionValue?.textContent.trim();
  const authoredLink = value('link')?.querySelector('a[href]');

  const alt = image.alt || value('imageAlt')?.textContent.trim() || '';
  const picture = createOptimizedPicture(image.src, decorative ? '' : alt);
  const optimizedImage = picture.querySelector('img');
  moveInstrumentation(image, optimizedImage);
  if (image.hasAttribute('width')) optimizedImage.width = image.width;
  if (image.hasAttribute('height')) optimizedImage.height = image.height;
  if (decorative) optimizedImage.setAttribute('role', 'presentation');

  const figure = document.createElement('figure');
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
