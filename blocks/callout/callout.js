export default function decorate(block) {
  const [messageWrapper, variantWrapper] = block.children;

  const variant = variantWrapper?.textContent.trim() || 'info';
  variantWrapper?.remove();

  block.classList.add(`callout-${variant}`);
  messageWrapper.classList.add('callout-message');
}
