import { ProcessorConfig } from '../types';

export const defaultConfig: ProcessorConfig = {
  processors: {
    'delete-duplicate-newlines': { isActive: true, priority: 1 },
    'delete-duplicate-spaces': { isActive: true, priority: 2 },
    'remove-spaces-between-chinese': { isActive: true, priority: 3 },
    'delete-extra-whitespace': { isActive: true, priority: 4 },
    'delete-reference-badges': { isActive: true, priority: 5 },
    'delete-footnotes': { isActive: true, priority: 6 },
    'full-width-to-half-width': { isActive: true, priority: 1 },
    'add-space-between-chinese-and-english': { isActive: true, priority: 1 }
  },
  shortcuts: {
    processSelection: 'Ctrl+Shift+P',
    processClipboard: 'Ctrl+Shift+V',
    quickClean: 'Ctrl+Shift+C'
  },
  translation: {
    defaultEngine: 'baidu',
    apiKeys: {},
    defaultSourceLang: 'auto',
    defaultTargetLang: 'zh'
  },
  ui: {
    theme: 'auto',
    language: 'zh-CN',
    showNotifications: true,
    autoProcessClipboard: false,
    floatingMenuEnabled: true
  }
};
