import { moveInstrumentation } from '../../scripts/scripts.js';

/**
 * Returns the trimmed text content of an element.
 *
 * @param {Element|null} element Element containing the value.
 * @returns {string} Trimmed text value.
 */
function getValue(element) {
  return element?.textContent?.trim() || '';
}

/**
 * Returns an instrumented property when available.
 * Falls back to the provided element on published pages.
 *
 * @param {Element} element Element containing the property.
 * @param {string} propertyName Property name.
 * @param {Element|null} fallback Fallback element.
 * @returns {Element|null} Property element.
 */
function getPropertyElement(element, propertyName, fallback = null) {
  return element.querySelector(`[data-aue-prop="${propertyName}"]`)
    || fallback;
}

/**
 * Finds a key-value row by property name.
 *
 * @param {Element} block Block element.
 * @param {string} propertyName Property name.
 * @returns {Element|null} Matching row.
 */
function getKeyValueRow(block, propertyName) {
  return [...block.children].find((row) => {
    const key = getValue(row.firstElementChild);

    return key === propertyName;
  }) || null;
}

/**
 * Returns a key-value property configuration.
 *
 * @param {Element} block Block element.
 * @param {string} propertyName Property name.
 * @returns {{
 *   row: Element|null,
 *   valueElement: Element|null,
 *   value: string
 * }}
 */
function getKeyValueProperty(block, propertyName) {
  const row = getKeyValueRow(block, propertyName);

  if (!row) {
    return {
      row: null,
      valueElement: null,
      value: '',
    };
  }

  const fallbackValueElement = row.children[1] || null;

  const valueElement = getPropertyElement(
    row,
    propertyName,
    fallbackValueElement,
  );

  return {
    row,
    valueElement,
    value: getValue(valueElement),
  };
}

/**
 * Returns all Nested Column block/items.
 *
 * In Universal Editor, instrumentation is preferred.
 * On published pages, every row that is not part of the
 * Column Stack key-value configuration is considered an item.
 *
 * @param {Element} block Column Stack block.
 * @param {Element[]} configRows Configuration rows.
 * @returns {Element[]} Nested Column rows.
 */
function getNestedColumnRows(block, configRows) {
  const rows = [...block.children].filter(
    (row) => !configRows.includes(row),
  );

  const instrumentedRows = rows.filter(
    (row) => row.dataset.aueComponent === 'nested-column',
  );

  return instrumentedRows.length
    ? instrumentedRows
    : rows;
}

/**
 * Decorates a Nested Column block/item.
 *
 * @param {Element} row Original block/item row.
 * @param {number} depth Visual nesting depth.
 * @returns {Element} Decorated Nested Column.
 */
function decorateNestedColumn(row, depth) {
  /*
   * Published block/item markup:
   *
   * children[0] -> title
   * children[1] -> size
   */
  const fallbackTitleElement = row.children[0] || null;
  const fallbackSizeElement = row.children[1] || null;

  const titleElement = getPropertyElement(
    row,
    'nested-column-title',
    fallbackTitleElement,
  );

  const sizeElement = getPropertyElement(
    row,
    'nested-column-size',
    fallbackSizeElement,
  );

  const title = getValue(titleElement);
  const size = getValue(sizeElement);

  const column = document.createElement('div');
  column.classList.add('nested-column');

  if (size) {
    column.classList.add(`nested-column-${size}`);
  }

  /*
   * Each block/item remains a sibling from the Universal Editor
   * point of view. Only the visual depth is exposed to CSS.
   */
  column.style.setProperty(
    '--column-depth',
    depth,
  );

  /*
   * Move block/item instrumentation to the new visual element.
   */
  moveInstrumentation(row, column);

  const titleContainer = document.createElement('div');
  titleContainer.classList.add('nested-column-title');
  titleContainer.textContent = title;

  if (titleElement) {
    moveInstrumentation(
      titleElement,
      titleContainer,
    );
  }

  column.append(titleContainer);

  return column;
}

/**
 * Decorates the Column Stack block.
 *
 * @param {Element} block Column Stack block.
 */
export default function decorate(block) {
  /*
   * ----------------------------------------------------------
   * COLUMN STACK PROPERTIES
   * ----------------------------------------------------------
   */

  const titleConfig = getKeyValueProperty(
    block,
    'column-stack-title',
  );

  const sizeConfig = getKeyValueProperty(
    block,
    'column-stack-size',
  );

  const stack = document.createElement('div');
  stack.classList.add('column-stack-container');

  if (sizeConfig.value) {
    stack.classList.add(
      `column-stack-${sizeConfig.value}`,
    );
  }

  /*
   * The block itself already owns the block-level instrumentation.
   * We do not need to move it.
   */

  const title = document.createElement('div');
  title.classList.add('column-stack-title');
  title.textContent = titleConfig.value;

  if (titleConfig.valueElement) {
    moveInstrumentation(
      titleConfig.valueElement,
      title,
    );
  }

  stack.append(title);

  /*
   * ----------------------------------------------------------
   * NESTED COLUMN ITEMS
   * ----------------------------------------------------------
   */

  const configRows = [
    titleConfig.row,
    sizeConfig.row,
  ].filter(Boolean);

  const nestedColumnRows = getNestedColumnRows(
    block,
    configRows,
  );

  nestedColumnRows.forEach((row, index) => {
    const column = decorateNestedColumn(
      row,
      index + 1,
    );

    stack.append(column);
  });

  block.replaceChildren(stack);
}
