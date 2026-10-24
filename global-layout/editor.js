// Optional editor entry point; public pages need only index.js and section.css.
export { initGlobalLayoutEditor, refreshGlobalLayoutEditor } from './runtime/editor.js';
export { default as attachGlobalLayoutUpdates } from './runtime/updates.js';
export { decorateRichtext } from './runtime/richtext.js';
