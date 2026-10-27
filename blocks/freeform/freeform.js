// Spike: compare a rich-text field on its own RTE filter with a text-area field
export default function decorate(block) {
  // AEM renders data-aue-filter="text" on every rich-text field; point this one at our filter
  const html = block.querySelector('[data-aue-prop="html"]');
  if (html) html.dataset.aueFilter = 'freeform-html';

  [...block.children].forEach((row, i) => {
    // eslint-disable-next-line no-console
    console.log(`[freeform-spike] row ${i} innerHTML:`, row.innerHTML);
    // eslint-disable-next-line no-console
    console.log(`[freeform-spike] row ${i} textContent:`, JSON.stringify(row.textContent));
  });
  // eslint-disable-next-line no-console
  console.log('[freeform-spike] elements:', [...block.querySelectorAll('iframe, script, style')].map((el) => el.tagName));
}
