// Spike: render pasted HTML; scripts run on preview/live only, never in Universal Editor

// a paste is stored as one <p> per line, the code escaped as text: rebuild it line by line
function readSource(field) {
  /* eslint-disable no-console */
  console.log('[freeform-spike] readSource field.innerHTML:', field.innerHTML);
  const lines = field.children.length
    ? [...field.children].map((el) => el.textContent)
    : [field.textContent];
  console.log('[freeform-spike] readSource lines:', lines);
  const source = lines.join('\n').trim();
  console.log(`[freeform-spike] readSource source:\n${source}`);
  /* eslint-enable no-console */
  return source;
}

// scripts set through innerHTML never run: recreate each, in order, waiting for external ones
function runScript(old) {
  const script = document.createElement('script');
  [...old.attributes].forEach(({ name, value }) => script.setAttribute(name, value));
  script.textContent = old.textContent;
  const loaded = script.src
    ? new Promise((resolve) => {
      script.addEventListener('load', resolve);
      script.addEventListener('error', resolve);
    })
    : Promise.resolve();
  old.replaceWith(script);
  return loaded;
}

function runScripts(container) {
  return [...container.querySelectorAll('script')]
    .reduce((chain, old) => chain.then(() => runScript(old)), Promise.resolve());
}

export default function decorate(block) {
  const field = block.querySelector('[data-aue-prop="html"]') || block.querySelector(':scope > div > div');
  const inEditor = !!block.querySelector('[data-aue-prop]');
  const source = field ? readSource(field) : '';

  if (!inEditor) {
    block.textContent = '';
    if (!source) return;
    block.innerHTML = source;
    runScripts(block);
    return;
  }

  // Universal Editor: keep the editable field, show a script-free render below it
  const label = document.createElement('p');
  label.className = 'freeform-label';
  label.textContent = source ? 'Freeform · Scripts run on preview' : 'Freeform · paste HTML in the HTML field';
  block.prepend(label);
  if (!source) return;
  const render = document.createElement('div');
  render.className = 'freeform-render';
  render.innerHTML = source;
  render.querySelectorAll('script').forEach((script) => script.remove());
  block.append(render);
}
