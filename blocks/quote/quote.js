import { createOptimizedPicture } from '../../scripts/aem.js';
import { moveInstrumentation } from '../../scripts/scripts.js';

const HEX_COLOR = /^#[0-9a-f]{6}$/i;

export default function decorate(block) {
  const [contentRow, ...optionRows] = [...block.children];

  // content group: quote paragraph(s) first, attribution as the last paragraph
  const blockquote = document.createElement('blockquote');
  const figure = document.createElement('figure');
  figure.className = 'quote-content';
  figure.append(blockquote);
  const paragraphs = [...(contentRow?.querySelectorAll('p') || [])];
  if (paragraphs.length > 1) {
    const figcaption = document.createElement('figcaption');
    figcaption.className = 'quote-attribution';
    figcaption.append(paragraphs.pop());
    figure.append(figcaption);
  }
  blockquote.append(...paragraphs);

  // optional rows: image and background color, recognized by their content
  let media;
  optionRows.forEach((row) => {
    const img = row.querySelector('picture > img');
    const text = row.textContent.trim();
    if (img) {
      const picture = createOptimizedPicture(img.src, img.alt, false, [
        { media: '(min-width: 900px)', width: '1000' },
        { width: '750' },
      ]);
      moveInstrumentation(img, picture.querySelector('img'));
      media = document.createElement('div');
      media.className = 'quote-image';
      media.append(picture);
      block.classList.add('has-image');
    } else if (HEX_COLOR.test(text)) {
      // authored as plain text, but rendered as an anchor link because of the leading #
      block.style.backgroundColor = text;
      block.classList.add('has-background');
    }
  });

  block.replaceChildren(...[media, figure].filter(Boolean));
}
