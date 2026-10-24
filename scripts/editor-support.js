import {
  decorateBlock, decorateIcons, loadBlock, loadSection, loadSections,
} from './aem.js';
import { decorateButtons, decorateMain } from './scripts.js';
import { attachGlobalLayoutUpdates } from '../global-layout/editor.js';

// Global Layout's update queue replaces the boilerplate content-event handler.
attachGlobalLayoutUpdates({
  decorateBlock,
  decorateIcons,
  loadBlock,
  loadSection,
  loadSections,
  decorateButtons,
  decorateMain,
});
