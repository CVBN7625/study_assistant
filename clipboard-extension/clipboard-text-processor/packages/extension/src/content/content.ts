// Content Script - 在网页中运行

// 监听来自 background 的消息
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === 'GET_SELECTION') {
    const selection = window.getSelection();
    const text = selection?.toString() || '';
    sendResponse({ text });
  } else if (message.type === 'REPLACE_SELECTION') {
    replaceSelection(message.text);
    sendResponse({ success: true });
  } else if (message.type === 'PASTE') {
    document.execCommand('paste');
    sendResponse({ success: true });
  }
  return true;
});

// 替换选中文字
function replaceSelection(newText: string) {
  const selection = window.getSelection();
  if (!selection || selection.rangeCount === 0) return;

  const range = selection.getRangeAt(0);
  range.deleteContents();
  range.insertNode(document.createTextNode(newText));

  // 清除选择
  selection.removeAllRanges();
}

// 监听选中文字变化
document.addEventListener('mouseup', () => {
  const selection = window.getSelection();
  if (selection && selection.toString().trim()) {
    // 可以在这里显示浮动菜单
    console.log('Selected text:', selection.toString());
  }
});

console.log('Clipboard Text Processor content script loaded');
