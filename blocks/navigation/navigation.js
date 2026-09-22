/**
 * Il blocco navigation non ha una decorazione propria: le sue righe vengono
 * lette e ricostruite da blocks/header/header.js, che le inserisce nell'header
 * di ogni pagina. Questo file esiste perche' EDS carica sempre
 * blocks/<name>/<name>.js per ogni blocco presente nel contenuto.
 * @param {Element} block The block element
 */
export default function decorate(block) {
  block.dataset.consumedBy = 'header';
}
