/**
 * Versione diagnostica: non decora, ispeziona.
 * Serve a vedere che cosa arriva davvero in decorate() prima di scrivere il blocco.
 * @param {Element} block The block element
 */
export default function decorate(block) {
  const log = (...args) => console.log('[related-content]', ...args);

  log('markup ricevuto:', block.outerHTML);
  log('numero di righe:', block.children.length);

  [...block.children].forEach((row, i) => {
    log(`riga ${i} — celle: ${row.children.length} — testo:`, row.textContent.trim().slice(0, 60));
  });

  const links = [...block.querySelectorAll('li a[href]')];
  log('link trovati:', links.length, links.map((a) => a.getAttribute('href')));

  log('attributi di instrumentation:', block.dataset.aueResource ? 'presenti (siamo in UE)' : 'assenti (pagina normale)');
}
