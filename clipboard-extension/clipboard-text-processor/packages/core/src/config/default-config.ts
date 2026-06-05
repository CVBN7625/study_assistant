import { ProcessorConfig } from '../types';

export const defaultConfig: ProcessorConfig = {
  processors: {
    'delete-duplicate-newlines': { isActive: true, priority: 1 },
    'delete-all-newlines': { isActive: false, priority: 1 },
    'delete-duplicate-spaces': { isActive: false, priority: 2 },
    'remove-spaces-between-chinese': { isActive: false, priority: 3 },
    'keep-english-word-spaces': { isActive: true, priority: 4 },
    'delete-reference-badges': { isActive: true, priority: 5 },
    'delete-footnotes': { isActive: true, priority: 6 },
    'clean-caj-special-characters': { isActive: false, priority: 7 },
    'delete-emoji': { isActive: false, priority: 8 },
    'delete-special-symbols': { isActive: false, priority: 9 },
    'delete-duplicate-punctuation': { isActive: false, priority: 10 },
    'full-width-to-half-width': { isActive: true, priority: 1 },
    'simplified-to-traditional': { isActive: false, priority: 7 },
    'traditional-to-simplified': { isActive: false, priority: 8 },
    'replace-kangxi-radicals': { isActive: false, priority: 9 },
    'add-space-between-chinese-and-english': { isActive: false, priority: 1 },
    'add-space-between-letters-and-numbers': { isActive: false, priority: 2 },
    'add-space-after-punctuation': { isActive: false, priority: 3 }
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
