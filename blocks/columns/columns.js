import restoreNestedBlocks from '../../scripts/nested-blocks.js';

export default async function decorate(block) {
  const cols = [...block.firstElementChild.children];
  block.classList.add(`columns-${cols.length}-cols`);

  // POC: rebuild the key-value blocks authored inside the cells
  const cells = [...block.children].flatMap((row) => [...row.children]);
  await Promise.all(cells.map((cell) => restoreNestedBlocks(cell, 'column')));

  // setup image columns
  [...block.children].forEach((row) => {
    [...row.children].forEach((col) => {
      const pic = col.querySelector('picture');
      if (pic) {
        const picWrapper = pic.closest('div');
        if (picWrapper && picWrapper.children.length === 1) {
          // picture is only content in column
          picWrapper.classList.add('columns-img-col');
        }
      }
    });
  });
}
