type ContentMessage =
  | { type: 'GET_SELECTION' }
  | { type: 'REPLACE_SELECTION'; text: string }
  | { type: 'PASTE_TEXT'; text: string }
  | { type: 'WRITE_CLIPBOARD'; text: string }
  | { type: 'FETCH_IMAGE_AS_DATA_URL'; srcUrl: string };

chrome.runtime.onMessage.addListener((message: ContentMessage, sender, sendResponse) => {
  void handleMessage(message)
    .then(result => sendResponse(result))
    .catch(error => sendResponse({ success: false, error: error instanceof Error ? error.message : String(error) }));

  return true;
});

async function handleMessage(message: ContentMessage): Promise<any> {
  switch (message.type) {
    case 'GET_SELECTION':
      return { text: getSelectedText() };
    case 'REPLACE_SELECTION':
      replaceSelection(message.text);
      return { success: true };
    case 'PASTE_TEXT':
      pasteText(message.text);
      return { success: true };
    case 'WRITE_CLIPBOARD':
      await navigator.clipboard.writeText(message.text);
      return { success: true };
    case 'FETCH_IMAGE_AS_DATA_URL':
      return await fetchImageAsDataUrl(message.srcUrl);
    default:
      return { success: false, error: '未知消息类型' };
  }
}

function getSelectedText(): string {
  const activeElement = document.activeElement;

  if (isTextInput(activeElement)) {
    const start = activeElement.selectionStart ?? 0;
    const end = activeElement.selectionEnd ?? 0;
    return activeElement.value.slice(start, end);
  }

  return window.getSelection()?.toString() || '';
}

function replaceSelection(newText: string): void {
  const activeElement = document.activeElement;

  if (isTextInput(activeElement)) {
    replaceInputSelection(activeElement, newText);
    return;
  }

  const selection = window.getSelection();
  if (!selection || selection.rangeCount === 0) {
    return;
  }

  const range = selection.getRangeAt(0);
  range.deleteContents();
  range.insertNode(document.createTextNode(newText));
  selection.removeAllRanges();
}

function pasteText(text: string): void {
  const activeElement = document.activeElement;

  if (isTextInput(activeElement)) {
    replaceInputSelection(activeElement, text);
    return;
  }

  document.execCommand('insertText', false, text);
}

function replaceInputSelection(element: HTMLInputElement | HTMLTextAreaElement, newText: string): void {
  const start = element.selectionStart ?? element.value.length;
  const end = element.selectionEnd ?? element.value.length;
  const before = element.value.slice(0, start);
  const after = element.value.slice(end);

  element.value = `${before}${newText}${after}`;
  const caret = before.length + newText.length;
  element.setSelectionRange(caret, caret);
  element.dispatchEvent(new InputEvent('input', { bubbles: true, inputType: 'insertText', data: newText }));
  element.dispatchEvent(new Event('change', { bubbles: true }));
}

function isTextInput(element: Element | null): element is HTMLInputElement | HTMLTextAreaElement {
  return element instanceof HTMLTextAreaElement ||
    (element instanceof HTMLInputElement && !['button', 'checkbox', 'file', 'radio', 'submit'].includes(element.type));
}

async function fetchImageAsDataUrl(srcUrl: string): Promise<string> {
  const absoluteUrl = new URL(srcUrl, window.location.href).href;
  const response = await fetch(absoluteUrl, {
    mode: 'cors',
    credentials: 'omit'
  });

  if (!response.ok) {
    throw new Error(`读取图片失败: ${response.status}`);
  }

  const blob = await response.blob();
  return blobToDataUrl(blob);
}

function blobToDataUrl(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(new Error('图片数据转换失败'));
    reader.readAsDataURL(blob);
  });
}

console.log('Clipboard Text Processor content script loaded');
