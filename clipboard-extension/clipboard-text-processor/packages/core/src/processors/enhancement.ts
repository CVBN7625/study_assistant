import { TextProcessor } from '../types';

// 中英文间添加空格
export const addSpaceBetweenChineseAndEnglish: TextProcessor = {
  id: 'add-space-between-chinese-and-english',
  name: '中英文间添加空格',
  description: '在中文字符和英文字母之间添加空格',
  category: 'enhancement',
  isActive: false,
  priority: 1,
  execute: (text: string) => {
    return text
      .replace(/([\u4e00-\u9fff])([A-Za-z])/g, '$1 $2')
      .replace(/([A-Za-z])([\u4e00-\u9fff])/g, '$1 $2');
  }
};

// 字母与数字间添加空格
export const addSpaceBetweenLettersAndNumbers: TextProcessor = {
  id: 'add-space-between-letters-and-numbers',
  name: '字母与数字间添加空格',
  description: '在英文字母和数字之间添加空格',
  category: 'enhancement',
  isActive: false,
  priority: 2,
  execute: (text: string) => {
    return text
      .replace(/([A-Za-z])(\d)/g, '$1 $2')
      .replace(/(\d)([A-Za-z])/g, '$1 $2');
  }
};

// 标点后添加空格
export const addSpaceAfterPunctuation: TextProcessor = {
  id: 'add-space-after-punctuation',
  name: '标点后添加空格',
  description: '在英文标点符号后添加空格',
  category: 'enhancement',
  isActive: false,
  priority: 3,
  execute: (text: string) => {
    return text.replace(/([,.?:;])([^\s,.?:;])/g, '$1 $2');
  }
};

// 添加段落缩进
export const addParagraphIndent: TextProcessor = {
  id: 'add-paragraph-indent',
  name: '添加段落缩进',
  description: '为每个段落添加两个空格的缩进',
  category: 'enhancement',
  isActive: false,
  priority: 4,
  execute: (text: string) => {
    return text
      .split('\n\n')
      .map(paragraph => '  ' + paragraph.trim())
      .join('\n\n');
  }
};

// 导出所有增强类处理器
export const enhancementProcessors: TextProcessor[] = [
  addSpaceBetweenChineseAndEnglish,
  addSpaceBetweenLettersAndNumbers,
  addSpaceAfterPunctuation,
  addParagraphIndent
];
