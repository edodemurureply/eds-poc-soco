export default function decorate(block) {
  [...block.children].forEach((item) => {
    const [messageWrapper, variantWrapper] = item.children;

    const variant = variantWrapper?.textContent.trim() || 'info';
    variantWrapper?.remove();

    item.classList.add('callout-list-item', `callout-list-item-${variant}`);
    messageWrapper.classList.add('callout-list-item-message');
  });
}
