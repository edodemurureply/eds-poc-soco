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
 * Returns an instrumented property element when available.
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
 * Expected markup:
 *
 * <div>
 *   <div><p>custom-columns-size</p></div>
 *   <div><p>XL</p></div>
 * </div>
 *
 * @param {Element} block Custom Columns block.
 * @param {string} propertyName Property name.
 * @returns {Element|null} Matching key-value row.
 */
function getKeyValueRow(block, propertyName) {
  return [...block.children].find((row) => {
    const keyElement = row.firstElementChild;
    return getValue(keyElement) === propertyName;
  }) || null;
}

/**
 * Returns the Custom Columns size configuration.
 *
 * @param {Element} block Custom Columns block.
 * @returns {{
 *   row: Element|null,
 *   valueElement: Element|null,
 *   value: string
 * }}
 */
function getCustomColumnsSize(block) {
  const row = getKeyValueRow(
    block,
    'custom-columns-size',
  );

  if (!row) {
    return {
      row: null,
      valueElement: null,
      value: '',
    };
  }

  /*
   * key-value markup:
   *
   * children[0] -> custom-columns-size
   * children[1] -> XL
   */
  const fallbackValueElement = row.children[1] || null;

  const valueElement = getPropertyElement(
    row,
    'custom-columns-size',
    fallbackValueElement,
  );

  return {
    row,
    valueElement,
    value: getValue(valueElement),
  };
}

/**
 * Returns all Single Column block/items.
 *
 * @param {Element} block Custom Columns block.
 * @param {Element|null} configRow Custom Columns configuration row.
 * @returns {Element[]} Single Column rows.
 */
function getSingleColumnRows(block, configRow) {
  const rows = [...block.children].filter(
    (row) => row !== configRow,
  );

  const instrumentedRows = rows.filter(
    (row) => row.dataset.aueComponent === 'single-column',
  );

  return instrumentedRows.length
    ? instrumentedRows
    : rows;
}

/**
 * Decorates a Single Column block/item.
 *
 * Original markup:
 *
 * <div>
 *   <div><p>L</p></div>
 * </div>
 *
 * Result:
 *
 * <div class="single-column single-column-L">
 *   <div class="single-column-value">L</div>
 * </div>
 *
 * @param {Element} row Original Single Column row.
 * @returns {Element} Decorated Single Column.
 */
function decorateSingleColumn(row) {
  const fallbackValueElement = row.firstElementChild;

  const valueElement = getPropertyElement(
    row,
    'single-column-size',
    fallbackValueElement,
  );

  const value = getValue(valueElement);

  const column = document.createElement('div');
  column.classList.add('single-column');

  if (value) {
    column.classList.add(`single-column-${value.toLowerCase()}`);
  }

  moveInstrumentation(row, column);

  const valueContainer = document.createElement('div');
  valueContainer.classList.add('single-column-value');
  valueContainer.textContent = value;

  if (valueElement) {
    moveInstrumentation(valueElement, valueContainer);
  }

  column.append(valueContainer);

  return column;
}

/**
 * Decorates the Custom Columns block.
 *
 * Original markup:
 *
 * custom-columns
 * ├── custom-columns-size | XL
 * ├── L
 * ├── M
 * └── S
 *
 * Result:
 *
 * custom-columns
 * └── container-column-XL
 *     ├── XL
 *     ├── single-column-L
 *     ├── single-column-M
 *     └── single-column-S
 *
 * @param {Element} block Custom Columns block.
 */
export default function decorate(block) {
  const {
    row: configRow,
    valueElement: configValueElement,
    value: customColumnsSize,
  } = getCustomColumnsSize(block);

  const containerColumn = document.createElement('div');
  containerColumn.classList.add('container-column');

  if (customColumnsSize) {
    containerColumn.classList.add(
      `container-column-${customColumnsSize.toLowerCase()}`,
    );
  }

  if (configRow) {
    moveInstrumentation(
      configRow,
      containerColumn,
    );
  }

  const containerValue = document.createElement('div');
  containerValue.classList.add('container-column-value');
  containerValue.textContent = customColumnsSize;

  if (configValueElement) {
    moveInstrumentation(
      configValueElement,
      containerValue,
    );
  }

  containerColumn.append(containerValue);

  const singleColumnRows = getSingleColumnRows(
    block,
    configRow,
  );

  let currentParent = containerColumn;

  singleColumnRows.forEach((row) => {
    const column = decorateSingleColumn(row);

    currentParent.append(column);

    currentParent = column;
  });

  block.replaceChildren(containerColumn);
}
