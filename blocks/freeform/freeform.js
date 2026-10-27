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

// after page load Chrome ignores document.write from external scripts (Formstack js.php uses it):
// collect what scripts write, then insert it right after the script that wrote it
let written = '';
function captureWrites() {
  document.write = (...html) => { written += html.join(''); };
  document.writeln = (...html) => { written += `${html.join('')}\n`; };
}

// scripts run after the page is ready, so DOMContentLoaded (and load, once complete) never
// reaches them: call those listeners right away instead of waiting forever
function runReadyListenersNow() {
  [document, window].forEach((target) => {
    if (Object.hasOwn(target, 'addEventListener')) return;
    const add = target.addEventListener.bind(target);
    target.addEventListener = (type, listener, options) => {
      const ready = type === 'DOMContentLoaded'
        || (type === 'load' && document.readyState === 'complete');
      if (!ready || !listener) {
        add(type, listener, options);
        return;
      }
      /* eslint-disable-next-line no-console */
      console.log(`[freeform-spike] ${type} listener called right away`);
      const event = new Event(type);
      queueMicrotask(() => (listener.handleEvent
        ? listener.handleEvent(event)
        : listener.call(target, event)));
    };
  });
}

function insertWritten(script) {
  /* eslint-disable-next-line no-console */
  console.log(`[freeform-spike] document.write captured ${written.length} chars after`, script);
  const template = document.createElement('template');
  template.innerHTML = written;
  written = '';
  const nodes = [...template.content.childNodes];
  script.after(...nodes);
  return nodes.flatMap((node) => {
    if (node.nodeName === 'SCRIPT') return [node];
    return node.querySelectorAll ? [...node.querySelectorAll('script')] : [];
  });
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
  return loaded.then(() => script);
}

function runScripts(scripts) {
  return scripts.reduce((chain, old) => chain.then(async () => {
    const script = await runScript(old);
    if (written) await runScripts(insertWritten(script));
  }), Promise.resolve());
}

export default function decorate(block) {
  const field = block.querySelector('[data-aue-prop="html"]') || block.querySelector(':scope > div > div');
  const inEditor = !!block.querySelector('[data-aue-prop]');
  const source = field ? readSource(field) : '';

  if (!inEditor) {
    block.textContent = '';
    if (!source) return;
    block.innerHTML = source;
    captureWrites();
    runReadyListenersNow();
    runScripts([...block.querySelectorAll('script')]);
    return;
  }

  // Universal Editor: keep the editable field, show a script-free render below it
  // spike: point the field to the toolbar-less RTE filter instead of the default "text"
  if (field && field.dataset.aueFilter) {
    /* eslint-disable-next-line no-console */
    console.log(`[freeform-spike] data-aue-filter ${field.dataset.aueFilter} -> freeform-html`);
    field.dataset.aueFilter = 'freeform-html';
  }
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
