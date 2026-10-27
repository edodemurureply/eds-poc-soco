// Spike: log what the block receives (escaped text or real tags)
export default function decorate(block) {
  // eslint-disable-next-line no-console
  console.log('[freeform-spike] innerHTML:', block.innerHTML);
  // eslint-disable-next-line no-console
  console.log('[freeform-spike] elements:', [...block.querySelectorAll('iframe, script, style')].map((el) => el.tagName));
}
