<template>
  <div class="popup-container">
    <header class="popup-header">
      <h1>文本处理器</h1>
      <button class="icon-btn" title="设置" @click="openSettings">设置</button>
    </header>

    <section class="section">
      <div class="section-title">文本</div>
      <textarea
        v-model="inputText"
        placeholder="粘贴或输入要处理的文本"
        rows="5"
      />
      <div class="toolbar">
        <button class="btn primary" :disabled="isBusy || !inputText.trim()" @click="processInput">
          处理
        </button>
        <button class="btn" :disabled="isBusy || !inputText.trim()" @click="translateInput">
          翻译
        </button>
        <button class="btn" :disabled="isBusy" @click="pasteFromClipboard">
          粘贴
        </button>
        <button class="btn" @click="clearInput">
          清空
        </button>
      </div>
    </section>

    <section class="section">
      <div class="section-title">快速处理</div>
      <div class="action-grid">
        <button
          v-for="action in quickActions"
          :key="action.id"
          class="action-btn"
          :disabled="isBusy || !inputText.trim()"
          @click="executeQuickAction(action)"
        >
          {{ action.label }}
        </button>
      </div>
    </section>

    <section class="section">
      <div class="section-title">翻译设置</div>
      <div class="lang-row">
        <select v-model="sourceLang">
          <option v-for="lang in sourceLanguageOptions" :key="lang.value" :value="lang.value">
            {{ lang.label }}
          </option>
        </select>
        <button class="swap-btn" title="交换语言" @click="swapLanguages">⇄</button>
        <select v-model="targetLang">
          <option v-for="lang in targetLanguageOptions" :key="lang.value" :value="lang.value">
            {{ lang.label }}
          </option>
        </select>
      </div>
      <div class="hint">
        当前 API：{{ currentApiTypeLabel }}
      </div>
    </section>

    <section class="section">
      <div class="section-title">图片翻译</div>
      <input type="file" accept="image/*" @change="onImageSelected" />
      <button class="btn" :disabled="isBusy || !imageDataUrl" @click="translateSelectedImage">
        翻译图片
      </button>
      <div v-if="imageFileName" class="hint">{{ imageFileName }}</div>
    </section>

    <section v-if="statusMessage || errorMessage" class="status-section">
      <div :class="['status', errorMessage ? 'error' : '']">
        {{ errorMessage || statusMessage }}
      </div>
    </section>

    <section v-if="resultText" class="section">
      <div class="section-title">结果</div>
      <pre class="result-content">{{ resultText }}</pre>
      <button class="btn success" @click="copyResult">复制结果</button>
    </section>

    <section class="section">
      <div class="section-title">最近记录</div>
      <div v-if="recentHistory.length === 0" class="empty">暂无记录</div>
      <button
        v-for="item in recentHistory"
        :key="item.id"
        class="history-item"
        @click="reuseHistoryItem(item)"
      >
        <span>{{ item.preview }}</span>
        <small>{{ formatTime(item.timestamp) }}</small>
      </button>
    </section>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';

type QuickAction = {
  id: string;
  label: string;
  processors: string[];
};

type HistoryPreview = {
  id: string;
  preview: string;
  timestamp: number;
  text: string;
};

const inputText = ref('');
const resultText = ref('');
const statusMessage = ref('');
const errorMessage = ref('');
const isBusy = ref(false);
const recentHistory = ref<HistoryPreview[]>([]);
const sourceLang = ref('auto');
const targetLang = ref('zh');
const currentApiType = ref('general');
const imageDataUrl = ref('');
const imageFileName = ref('');

const languageOptions = [
  { label: '检测语言', value: 'auto' },
  { label: '中文', value: 'zh' },
  { label: '英语', value: 'en' },
  { label: '日语', value: 'jp' },
  { label: '韩语', value: 'kor' },
  { label: '法语', value: 'fra' },
  { label: '德语', value: 'de' },
  { label: '俄语', value: 'ru' },
  { label: '繁体中文', value: 'cht' },
  { label: '西班牙语', value: 'spa' },
  { label: '葡萄牙语', value: 'pt' },
  { label: '意大利语', value: 'it' },
  { label: '越南语', value: 'vie' },
  { label: '泰语', value: 'th' }
];

const apiTypeLabels: Record<string, string> = {
  general: '通用文本翻译',
  'large-model': '大模型文本翻译',
  domain: '领域文本翻译',
  image: '图片翻译'
};

const sourceLanguageOptions = computed(() => languageOptions);
const targetLanguageOptions = computed(() => languageOptions.filter(option => option.value !== 'auto'));
const currentApiTypeLabel = computed(() => apiTypeLabels[currentApiType.value] || currentApiType.value);

const quickActions: QuickAction[] = [
  {
    id: 'clean-all',
    label: '一键清理',
    processors: [
      'delete-duplicate-newlines',
      'keep-english-word-spaces',
      'delete-reference-badges',
      'delete-footnotes',
      'full-width-to-half-width'
    ]
  },
  {
    id: 'full-to-half',
    label: '全角转半角',
    processors: ['full-width-to-half-width']
  },
  {
    id: 'remove-refs',
    label: '删除引用',
    processors: ['delete-reference-badges', 'delete-footnotes']
  },
  {
    id: 'add-space',
    label: '中英加空格',
    processors: ['add-space-between-chinese-and-english']
  }
];

onMounted(async () => {
  await loadConfig();
  await loadHistory();
});

async function loadConfig() {
  const response = await chrome.runtime.sendMessage({ type: 'GET_CONFIG' });
  const translation = response?.config?.translation;

  if (!translation) {
    return;
  }

  sourceLang.value = translation.defaultSourceLang || 'auto';
  targetLang.value = translation.defaultTargetLang === 'auto' ? 'zh' : translation.defaultTargetLang || 'zh';
  currentApiType.value = translation.apiKeys?.baidu?.apiType || 'general';
}

async function loadHistory() {
  const response = await chrome.runtime.sendMessage({
    type: 'GET_HISTORY',
    limit: 6
  });

  if (response?.history) {
    recentHistory.value = response.history.map((entry: any) => ({
      id: entry.id,
      preview: createPreview(entry.processedText),
      timestamp: entry.timestamp,
      text: entry.processedText
    }));
  }
}

async function processInput() {
  await runTask('正在处理...', async () => {
    const response = await chrome.runtime.sendMessage({
      type: 'PROCESS_TEXT',
      text: inputText.value,
      options: {
        context: { source: 'manual' }
      }
    });

    assertResponse(response);
    resultText.value = response.result.text;
    statusMessage.value = `处理完成，使用 ${response.result.processorsUsed.length} 个处理器`;
  });
}

async function executeQuickAction(action: QuickAction) {
  await runTask('正在处理...', async () => {
    const response = await chrome.runtime.sendMessage({
      type: 'PROCESS_TEXT',
      text: inputText.value,
      options: {
        processors: action.processors,
        context: { source: 'manual' }
      }
    });

    assertResponse(response);
    resultText.value = response.result.text;
    statusMessage.value = `${action.label}完成`;
  });
}

async function translateInput() {
  await runTask('正在翻译...', async () => {
    const response = await chrome.runtime.sendMessage({
      type: 'TRANSLATE_TEXT',
      text: inputText.value,
      from: sourceLang.value,
      to: targetLang.value
    });

    assertResponse(response);
    resultText.value = response.result.text;
    statusMessage.value = response.result.cached ? '翻译完成，来自缓存' : '翻译完成';
  });
}

async function pasteFromClipboard() {
  await runTask('正在读取剪切板...', async () => {
    inputText.value = await navigator.clipboard.readText();
    statusMessage.value = '已粘贴剪切板文本';
  });
}

function clearInput() {
  inputText.value = '';
  resultText.value = '';
  statusMessage.value = '';
  errorMessage.value = '';
}

function swapLanguages() {
  if (sourceLang.value === 'auto') {
    errorMessage.value = '检测语言不能交换到目标语言';
    return;
  }

  const previousSource = sourceLang.value;
  sourceLang.value = targetLang.value;
  targetLang.value = previousSource;

  const previousText = inputText.value;
  inputText.value = resultText.value;
  resultText.value = previousText;
}

async function onImageSelected(event: Event) {
  const file = (event.target as HTMLInputElement).files?.[0];
  if (!file) {
    imageDataUrl.value = '';
    imageFileName.value = '';
    return;
  }

  imageFileName.value = file.name;
  imageDataUrl.value = await fileToDataUrl(file);
}

async function translateSelectedImage() {
  await runTask('正在翻译图片...', async () => {
    const response = await chrome.runtime.sendMessage({
      type: 'TRANSLATE_IMAGE',
      dataUrl: imageDataUrl.value,
      from: sourceLang.value,
      to: targetLang.value
    });

    assertResponse(response);
    resultText.value = response.result.translatedText || response.result.imageUrl || '';
    statusMessage.value = '图片翻译完成';
  });
}

async function copyResult() {
  await navigator.clipboard.writeText(resultText.value);
  statusMessage.value = '结果已复制';
}

function reuseHistoryItem(item: HistoryPreview) {
  inputText.value = item.text;
}

function formatTime(timestamp: number): string {
  return new Date(timestamp).toLocaleString('zh-CN', {
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  });
}

function openSettings() {
  chrome.runtime.openOptionsPage();
}

async function runTask(loadingMessage: string, task: () => Promise<void>) {
  isBusy.value = true;
  statusMessage.value = loadingMessage;
  errorMessage.value = '';

  try {
    await task();
    await loadHistory();
  } catch (error: any) {
    errorMessage.value = error.message || '操作失败';
  } finally {
    isBusy.value = false;
  }
}

function assertResponse(response: any) {
  if (!response?.success) {
    throw new Error(response?.error || '后台处理失败');
  }
}

function createPreview(text: string): string {
  const normalized = String(text || '').replace(/\s+/g, ' ').trim();
  return normalized.length > 42 ? `${normalized.slice(0, 42)}...` : normalized;
}

function fileToDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(new Error('读取图片失败'));
    reader.readAsDataURL(file);
  });
}
</script>

<style scoped>
.popup-container {
  width: 380px;
  padding: 14px;
  box-sizing: border-box;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  color: #1f2933;
}

.popup-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 12px;
}

.popup-header h1 {
  margin: 0;
  font-size: 18px;
  line-height: 1.2;
}

.icon-btn,
.btn,
.action-btn,
.swap-btn,
.history-item {
  border: 1px solid #cfd7e3;
  background: #fff;
  color: #1f2933;
  cursor: pointer;
}

.icon-btn {
  padding: 5px 8px;
  border-radius: 6px;
}

.section {
  margin-top: 12px;
}

.section-title {
  margin-bottom: 6px;
  color: #52606d;
  font-size: 13px;
  font-weight: 600;
}

textarea {
  width: 100%;
  box-sizing: border-box;
  padding: 8px;
  border: 1px solid #cfd7e3;
  border-radius: 6px;
  resize: vertical;
  font-size: 13px;
  line-height: 1.5;
}

.toolbar,
.lang-row {
  display: flex;
  gap: 6px;
  margin-top: 8px;
}

.btn,
.swap-btn {
  padding: 7px 10px;
  border-radius: 6px;
  font-size: 13px;
}

.btn.primary {
  border-color: #1d4ed8;
  background: #1d4ed8;
  color: #fff;
}

.btn.success {
  border-color: #16803c;
  background: #16803c;
  color: #fff;
}

button:disabled {
  cursor: not-allowed;
  opacity: 0.55;
}

.action-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 6px;
}

.action-btn {
  min-height: 34px;
  border-radius: 6px;
  font-size: 13px;
}

.lang-row select {
  flex: 1;
  min-width: 0;
  padding: 7px;
  border: 1px solid #cfd7e3;
  border-radius: 6px;
  background: #fff;
}

.hint,
.empty {
  margin-top: 6px;
  color: #7b8794;
  font-size: 12px;
}

.status-section {
  margin-top: 10px;
}

.status {
  padding: 8px;
  border-radius: 6px;
  background: #eef4ff;
  color: #1d4ed8;
  font-size: 12px;
}

.status.error {
  background: #fff1f2;
  color: #be123c;
}

.result-content {
  max-height: 160px;
  overflow: auto;
  padding: 9px;
  border-radius: 6px;
  background: #f6f8fb;
  white-space: pre-wrap;
  word-break: break-word;
  font-size: 13px;
}

.history-item {
  display: grid;
  gap: 3px;
  width: 100%;
  margin-bottom: 5px;
  padding: 7px;
  border-radius: 6px;
  text-align: left;
}

.history-item small {
  color: #7b8794;
}
</style>
