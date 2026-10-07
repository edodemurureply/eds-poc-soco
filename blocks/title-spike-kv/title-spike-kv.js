// Spike: in Universal Editor, flag Title blocks holding an H1 that is not the first on the page.
let observing = false;

function flagExtraH1s() {
  const main = document.querySelector('main');
  if (!main) return;
  const firstH1 = main.querySelector('h1');
  main.querySelectorAll('.title-spike-kv').forEach((block) => {
    const h1 = block.querySelector('h1');
    block.classList.toggle('title-spike-kv-extra-h1', !!h1 && h1 !== firstH1);
  });
}

export default function decorate(block) {
  // data-aue-* attributes exist only in the Universal Editor markup
  if (!block.hasAttribute('data-aue-resource')) return;
  flagExtraH1s();
  if (observing) return;
  observing = true;
  // UE re-renders only the edited block (or the whole main): re-check the page on every change
  new MutationObserver(flagExtraH1s).observe(document.body, { childList: true, subtree: true });
}
