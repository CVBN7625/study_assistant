// Background Script - 浏览器插件后台脚本

import { TextProcessorCore } from '@clipboard-processor/core';
import { allProcessors } from '@clipboard-processor/core';

const processorCore = new TextProcessorCore();

// 注册所有处理器
allProcessors.forEach(processor => {
  processorCore.registerProcessor(processor);
});

// 初始化插件
chrome.runtime.onInstalled.addListener(() => {
  // 创建右键菜单
  chrome.contextMenus.create({
    id: 'process-selection',
    title: '处理选中文字',
    contexts: ['selection']
  });

  chrome.contextMenus.create({
    id: 'copy-and-process',
    title: '复制并处理',
    contexts: ['selection']
  });

  console.log('Clipboard Text Processor installed');
});

// 监听右键菜单点击
chrome.contextMenus.onClicked.addListener((info, tab) => {
  if (info.menuItemId === 'process-selection' && info.selectionText) {
    processSelectedText(info.selectionText, tab);
  } else if (info.menuItemId === 'copy-and-process' && info.selectionText) {
    copyAndProcess(info.selectionText, tab);
  }
});

// 监听快捷键
chrome.commands.onCommand.addListener((command) => {
  if (command === 'process-selection') {
    processCurrentSelection();
  } else if (command === 'process-clipboard') {
    processClipboardAndPaste();
  }
});

// 监听来自 content script 和 popup 的消息
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === 'PROCESS_TEXT') {
    const result = processorCore.process(message.text, message.options);
    sendResponse({ success: true, result });
  } else if (message.type === 'GET_CONFIG') {
    sendResponse({ config: processorCore.exportConfig() });
  } else if (message.type === 'GET_HISTORY') {
    const history = processorCore.getHistory(message.limit);
    sendResponse({ history });
  }
  return true;
});

// 处理选中文字
async function processSelectedText(text: string, tab?: chrome.tabs.Tab) {
  const result = processorCore.process(text);

  if (tab?.id) {
    chrome.tabs.sendMessage(tab.id, {
      type: 'REPLACE_SELECTION',
      text: result.text
    });
  }

  // 显示通知
  chrome.notifications.create({
    type: 'basic',
    iconUrl: 'icons/icon-48.png',
    title: '文本处理完成',
    message: `已应用 ${result.processorsUsed.length} 个处理器`
  });
}

// 复制并处理
async function copyAndProcess(text: string, tab?: chrome.tabs.Tab) {
  const result = processorCore.process(text);

  // 写入剪切板
  await navigator.clipboard.writeText(result.text);

  // 显示通知
  chrome.notifications.create({
    type: 'basic',
    iconUrl: 'icons/icon-48.png',
    title: '已复制并处理',
    message: '处理后的文字已复制到剪切板'
  });
}

// 处理当前选中文字
async function processCurrentSelection() {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  if (tab?.id) {
    chrome.tabs.sendMessage(tab.id, { type: 'GET_SELECTION' }, (response) => {
      if (response?.text) {
        processSelectedText(response.text, tab);
      }
    });
  }
}

// 处理剪切板并粘贴
async function processClipboardAndPaste() {
  const text = await navigator.clipboard.readText();
  const result = processorCore.process(text);

  await navigator.clipboard.writeText(result.text);

  // 模拟粘贴
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  if (tab?.id) {
    chrome.tabs.sendMessage(tab.id, { type: 'PASTE' });
  }
}
