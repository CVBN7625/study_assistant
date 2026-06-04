import { TextProcessor } from '../types';

// 删除重复换行符
export const deleteDuplicateNewlines: TextProcessor = {
  id: 'delete-duplicate-newlines',
  name: '删除重复换行',
  description: '将连续的多个换行符合并为单个换行',
  category: 'cleanup',
  isActive: true,
  priority: 1,
  execute: (text: string) => {
    return text.replace(/[\r\n]+/g, '\n');
  }
};

// 删除重复空格
export const deleteDuplicateSpaces: TextProcessor = {
  id: 'delete-duplicate-spaces',
  name: '删除重复空格',
  description: '将连续的多个空格合并为单个空格',
  category: 'cleanup',
  isActive: true,
  priority: 2,
  execute: (text: string) => {
    return text.replace(/ +/g, ' ');
  }
};

// 删除空格
export const removeSpacesBetweenChinese: TextProcessor = {
  id: 'remove-spaces-between-chinese',
  name: '删除空格',
  description: '删除所有空格（无论中英文间）',
  category: 'cleanup',
  isActive: true,
  priority: 3,
  execute: (text: string) => {
    return text.replace(/\s+/g, '');
  }
};

// 删除多余空白字符
export const deleteExtraWhitespace: TextProcessor = {
  id: 'delete-extra-whitespace',
  name: '删除多余空白',
  description: '删除行首行尾的空白字符',
  category: 'cleanup',
  isActive: true,
  priority: 4,
  execute: (text: string) => {
    return text
      .split('\n')
      .map(line => line.trim())
      .join('\n');
  }
};

// 删除引用角标
export const deleteReferenceBadges: TextProcessor = {
  id: 'delete-reference-badges',
  name: '删除引用角标',
  description: '删除学术引用角标，如 [1], [2, 3], (4-7)',
  category: 'cleanup',
  isActive: true,
  priority: 5,
  execute: (text: string) => {
    text = text.replace(/\[[\d,\-\s]+]/g, '');
    text = text.replace(/【[\d,\-\s]+】/g, '');
    text = text.replace(/\([\d,\-\s]+\)/g, '');
    return text;
  }
};

// 删除脚注标记
export const deleteFootnotes: TextProcessor = {
  id: 'delete-footnotes',
  name: '删除脚注标记',
  description: '删除脚注标记，如 ①, ②, ③',
  category: 'cleanup',
  isActive: true,
  priority: 6,
  execute: (text: string) => {
    return text.replace(/[①②③④⑤⑥⑦⑧⑨⑩⑪⑫⑬⑭⑮⑯⑰⑱⑲⑳]/g, '');
  }
};

// 合并段落中的换行
export const removeLineBreaksInParagraphs: TextProcessor = {
  id: 'remove-line-breaks-in-paragraphs',
  name: '合并段落换行',
  description: '合并段落中的换行，保留段落间的换行',
  category: 'cleanup',
  isActive: true,
  priority: 7,
  execute: (text: string) => {
    // 将连续的换行符合并为两个（段落分隔）
    // 将单个换行符替换为空格
    return text
      .replace(/\n{3,}/g, '\n\n')
      .replace(/([^\n])\n([^\n])/g, '$1 $2');
  }
};

// 删除 HTML 标签
export const stripHtmlTags: TextProcessor = {
  id: 'strip-html-tags',
  name: '删除 HTML 标签',
  description: '删除所有 HTML 标签',
  category: 'cleanup',
  isActive: false,
  priority: 8,
  execute: (text: string) => {
    return text.replace(/<[^>]*>/g, '');
  }
};

// 删除 URL 链接
export const removeUrls: TextProcessor = {
  id: 'remove-urls',
  name: '删除 URL 链接',
  description: '删除所有 URL 链接',
  category: 'cleanup',
  isActive: false,
  priority: 9,
  execute: (text: string) => {
    return text.replace(/https?:\/\/[^\s]+/g, '');
  }
};

// 导出所有清理类处理器
export const cleanupProcessors: TextProcessor[] = [
  deleteDuplicateNewlines,
  deleteDuplicateSpaces,
  removeSpacesBetweenChinese,
  deleteExtraWhitespace,
  deleteReferenceBadges,
  deleteFootnotes,
  removeLineBreaksInParagraphs,
  stripHtmlTags,
  removeUrls
];
