<template>
  <div class="popup-container">
    <header class="popup-header">
      <h1>📋 文本处理器</h1>
      <button @click="openSettings" class="settings-btn">⚙️</button>
    </header>

    <div class="quick-actions">
      <h2>快速操作</h2>
      <div class="action-grid">
        <button
          v-for="action in quickActions"
          :key="action.id"
          @click="executeQuickAction(action)"
          class="action-btn"
        >
          <span class="action-icon">{{ action.icon }}</span>
          <span class="action-label">{{ action.label }}</span>
        </button>
      </div>
    </div>

    <div class="clipboard-section">
      <h2>剪切板处理</h2>
      <textarea
        v-model="clipboardText"
        placeholder="粘贴文字到这里处理..."
        rows="4"
      ></textarea>
      <div class="clipboard-actions">
        <button @click="pasteAndProcess" class="btn btn-primary">
          📋 粘贴并处理
        </button>
        <button @click="clearClipboard" class="btn btn-secondary">
          🗑️ 清空
        </button>
      </div>
    </div>

    <div class="result-section" v-if="processedText">
      <h2>处理结果</h2>
      <div class="result-content">
        <pre>{{ processedText }}</pre>
      </div>
      <div class="result-actions">
        <button @click="copyResult" class="btn btn-success">
          ✅ 复制结果
        </button>
      </div>
    </div>

    <div class="history-section">
      <h2>最近处理</h2>
      <div class="history-list">
        <div
          v-for="item in recentHistory"
          :key="item.id"
          class="history-item"
          @click="reuseHistoryItem(item)"
        >
          <div class="history-preview">{{ item.preview }}</div>
          <div class="history-time">{{ formatTime(item.timestamp) }}</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';

const clipboardText = ref('');
const processedText = ref('');
const recentHistory = ref<any[]>([]);

const quickActions = [
  { id: 'clean-all', icon: '🧹', label: '一键清理' },
  { id: 'full-to-half', icon: '↔️', label: '全角转半角' },
  { id: 'remove-refs', icon: '📚', label: '删除引用' },
  { id: 'add-space', icon: '␣', label: '中英加空格' }
];

onMounted(() => {
  loadHistory();
});

async function pasteAndProcess() {
  try {
    const text = await navigator.clipboard.readText();
    clipboardText.value = text;
    await processText(text);
  } catch (err) {
    console.error('读取剪切板失败:', err);
  }
}

async function processText(text: string) {
  const response = await chrome.runtime.sendMessage({
    type: 'PROCESS_TEXT',
    text,
    options: { category: 'all' }
  });

  if (response.success) {
    processedText.value = response.result.text;
    addToHistory(text, response.result.text);
  }
}

async function copyResult() {
  try {
    await navigator.clipboard.writeText(processedText.value);
    showNotification('已复制到剪切板');
  } catch (err) {
    console.error('复制失败:', err);
  }
}

async function loadHistory() {
  const response = await chrome.runtime.sendMessage({
    type: 'GET_HISTORY',
    limit: 5
  });

  if (response.history) {
    recentHistory.value = response.history.map((entry: any) => ({
      id: entry.id,
      preview: entry.processedText.substring(0, 50) + '...',
      timestamp: entry.timestamp
    }));
  }
}

function addToHistory(original: string, processed: string) {
  recentHistory.value.unshift({
    id: Date.now().toString(),
    preview: processed.substring(0, 50) + '...',
    timestamp: Date.now()
  });

  if (recentHistory.value.length > 5) {
    recentHistory.value.pop();
  }
}

function reuseHistoryItem(item: any) {
  clipboardText.value = item.preview;
  processText(item.preview);
}

function formatTime(timestamp: number): string {
  return new Date(timestamp).toLocaleString('zh-CN');
}

function openSettings() {
  chrome.runtime.openOptionsPage();
}

function showNotification(message: string) {
  // 简单的通知显示
  alert(message);
}
</script>

<style scoped>
.popup-container {
  width: 360px;
  padding: 16px;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
}

.popup-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.popup-header h1 {
  margin: 0;
  font-size: 20px;
}

.settings-btn {
  background: none;
  border: none;
  font-size: 20px;
  cursor: pointer;
}

.quick-actions {
  margin-bottom: 16px;
}

.quick-actions h2 {
  font-size: 14px;
  margin: 0 0 8px 0;
  color: #666;
}

.action-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 8px;
}

.action-btn {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 12px;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  background: white;
  cursor: pointer;
  transition: all 0.2s;
}

.action-btn:hover {
  background: #f5f5f5;
  border-color: #007bff;
}

.action-icon {
  font-size: 24px;
  margin-bottom: 4px;
}

.action-label {
  font-size: 12px;
}

.clipboard-section {
  margin-bottom: 16px;
}

.clipboard-section h2 {
  font-size: 14px;
  margin: 0 0 8px 0;
  color: #666;
}

textarea {
  width: 100%;
  padding: 8px;
  border: 1px solid #ddd;
  border-radius: 4px;
  resize: vertical;
  font-size: 14px;
}

.clipboard-actions {
  display: flex;
  gap: 8px;
  margin-top: 8px;
}

.btn {
  padding: 8px 16px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
}

.btn-primary {
  background: #007bff;
  color: white;
}

.btn-secondary {
  background: #6c757d;
  color: white;
}

.btn-success {
  background: #28a745;
  color: white;
}

.result-section {
  margin-bottom: 16px;
}

.result-section h2 {
  font-size: 14px;
  margin: 0 0 8px 0;
  color: #666;
}

.result-content {
  background: #f5f5f5;
  padding: 12px;
  border-radius: 4px;
  margin-bottom: 8px;
}

.result-content pre {
  margin: 0;
  white-space: pre-wrap;
  word-break: break-all;
  font-size: 14px;
}

.result-actions {
  display: flex;
  gap: 8px;
}

.history-section h2 {
  font-size: 14px;
  margin: 0 0 8px 0;
  color: #666;
}

.history-list {
  max-height: 200px;
  overflow-y: auto;
}

.history-item {
  padding: 8px;
  border-bottom: 1px solid #eee;
  cursor: pointer;
}

.history-item:hover {
  background: #f5f5f5;
}

.history-preview {
  font-size: 12px;
  color: #333;
  margin-bottom: 4px;
}

.history-time {
  font-size: 10px;
  color: #999;
}
</style>
