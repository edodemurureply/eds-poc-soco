import { decorateBlock, loadBlock, toClassName } from './aem.js';

// POC: a key-value block authored inside a container cell is published
// flattened, as <p>key</p><p>value</p> pairs with no block wrapper.
// The UE configuration tells which blocks a cell accepts and their field
// names, so the block can be rebuilt and decorated as usual.
// In UE the author markup keeps the nested block intact, but decorateBlocks()
// only handles section-level blocks, so it is decorated here.

const registry = {};

async function fetchJson(name) {
  const resp = await fetch(`${window.hlx.codeBasePath}/${name}`);
  return resp.ok ? resp.json() : [];
}

/**
 * Builds the key-value blocks a filter accepts: [{ name, fields }].
 * @param {string} filterId the UE filter of the container cell
 */
async function loadRegistry(filterId) {
  const [definitions, models, filters] = await Promise.all([
    fetchJson('component-definition.json'),
    fetchJson('component-models.json'),
    fetchJson('component-filters.json'),
  ]);
  const allowed = filters.find((f) => f.id === filterId)?.components || [];
  const components = definitions.groups?.flatMap((g) => g.components) || [];
  return allowed.map((id) => {
    const template = components.find((c) => c.id === id)?.plugins?.xwalk?.page?.template;
    if (!template?.['key-value']) return null;
    const fields = models.find((m) => m.id === template.model)?.fields || [];
    return { name: toClassName(template.name), fields: fields.map((f) => f.name) };
  }).filter(Boolean);
}

/**
 * Splits the cell children into runs of key/value pairs, one per block.
 * A run ends when the next key is not a field of the same block or repeats.
 */
function findRuns(cell, blocks) {
  const runs = [];
  let run;
  const children = [...cell.children];
  for (let i = 0; i < children.length; i += 1) {
    const key = children[i].tagName === 'P' ? children[i].textContent.trim() : '';
    const value = children[i + 1];
    const sameBlock = run && run.block.fields.includes(key) && !run.keys.includes(key);
    if (value && sameBlock) {
      run.keys.push(key);
      run.rows.push([children[i], value]);
      i += 1;
    } else {
      const block = value && blocks.find((b) => b.fields.includes(key));
      if (block) {
        run = { block, keys: [key], rows: [[children[i], value]] };
        runs.push(run);
        i += 1;
      } else {
        run = null;
      }
    }
  }
  return runs;
}

function buildBlock(run) {
  const block = document.createElement('div');
  block.className = run.block.name;
  run.rows.forEach(([key, value]) => {
    const row = document.createElement('div');
    const keyCell = document.createElement('div');
    const valueCell = document.createElement('div');
    keyCell.textContent = key.textContent.trim();
    // a single <p> value is unwrapped, as in a regular key-value cell
    if (value.tagName === 'P') {
      valueCell.append(...value.childNodes);
      value.remove();
    } else {
      valueCell.append(value);
    }
    row.append(keyCell, valueCell);
    block.append(row);
  });
  return block;
}

/**
 * Rebuilds (published markup) or finds (UE markup) the key-value blocks of a
 * container cell, then decorates and loads them.
 * @param {Element} cell the container cell
 * @param {string} filterId the UE filter of the cell
 */
export default async function restoreNestedBlocks(cell, filterId) {
  if (!registry[filterId]) registry[filterId] = loadRegistry(filterId);
  const blocks = await registry[filterId];
  const names = blocks.map((b) => b.name);
  const intact = [...cell.querySelectorAll('div[class]')]
    .filter((el) => names.includes(el.classList[0]) && !el.dataset.blockStatus);
  const rebuilt = findRuns(cell, blocks).map((run) => {
    const wrapper = document.createElement('div');
    run.rows[0][0].before(wrapper);
    const block = buildBlock(run);
    run.rows.forEach(([key]) => key.remove());
    wrapper.append(block);
    return block;
  });
  await Promise.all([...intact, ...rebuilt].map((block) => {
    decorateBlock(block);
    return loadBlock(block);
  }));
}
