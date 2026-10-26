export default function decorate(block) {
  [...block.children].forEach((item) => {
    const [messageWrapper, variantWrapper] = item.children;
    const hasMessage = messageWrapper?.textContent.trim();

    const variant = variantWrapper?.textContent.trim() || 'info';
    variantWrapper?.remove();

    if (!hasMessage) return;

    item.classList.add('callout-list-item', `callout-list-item-${variant}`);
    messageWrapper.classList.add('callout-list-item-message');
  });
}
