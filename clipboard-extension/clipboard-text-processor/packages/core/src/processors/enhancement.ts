import { TextProcessor } from '../types';

// 添加段落缩进
export const addParagraphIndent: TextProcessor = {
  id: 'add-paragraph-indent',
  name: '添加段落缩进',
  description: '为每个段落添加两个空格的缩进',
  category: 'enhancement',
  isActive: false,
  priority: 1,
  execute: (text: string) => {
    return text
      .split('\n\n')
      .map(paragraph => '  ' + paragraph.trim())
      .join('\n\n');
  }
};

// 导出所有增强类处理器
export const enhancementProcessors: TextProcessor[] = [
  addParagraphIndent
];
