<template>
  <div class="history">
    <!-- 页面标题 -->
    <n-card size="small" class="page-header">
      <n-space justify="space-between" align="center">
        <n-space align="center">
          <n-text strong style="font-size: 18px;">📜 历史记录</n-text>
          <n-text depth="3" style="font-size: 13px;">查看和管理处理过的文本</n-text>
        </n-space>
        <n-space>
          <n-input
            v-model:value="searchQuery"
            placeholder="搜索历史记录..."
            clearable
            style="width: 200px;"
          >
            <template #prefix>
              🔍
            </template>
          </n-input>
          <n-button @click="clearAllHistory" type="error" quaternary :disabled="history.length === 0">
            🗑️ 清空历史
          </n-button>
        </n-space>
      </n-space>
    </n-card>

    <!-- 历史记录列表 -->
    <n-card class="history-list-card">
      <n-list v-if="filteredHistory.length > 0" bordered>
        <n-list-item v-for="entry in filteredHistory" :key="entry.id">
          <n-thing>
            <template #header>
              <n-space align="center" justify="space-between">
                <n-text strong style="max-width: 70%;">
                  {{ truncateText(entry.originalText, 60) }}
                </n-text>
                <n-text depth="3" style="font-size: 12px;">
                  {{ formatTime(entry.timestamp) }}
                </n-text>
              </n-space>
            </template>

            <template #description>
              <n-space vertical>
                <n-text depth="2" style="font-size: 13px; line-height: 1.5;">
                  {{ truncateText(entry.processedText, 120) }}
                </n-text>
                <n-space size="small">
                  <n-tag size="small" type="info">
                    处理器: {{ entry.processorsUsed?.length || 0 }}个
                  </n-tag>
                  <n-tag size="small" type="success">
                    {{ entry.originalText.length }} 字 → {{ entry.processedText.length }} 字
                  </n-tag>
                </n-space>
              </n-space>
            </template>

            <template #footer>
              <n-space justify="end">
                <n-button size="small" quaternary @click="copyToClipboard(entry.processedText)">
                  📋 复制
                </n-button>
                <n-button size="small" quaternary type="primary" @click="reuseEntry(entry)">
                  ↩️ 重用
                </n-button>
                <n-button size="small" quaternary type="error" @click="deleteEntry(entry)">
                  🗑️ 删除
                </n-button>
              </n-space>
            </template>
          </n-thing>
        </n-list-item>
      </n-list>

      <!-- 空状态 -->
      <n-empty v-else description="暂无历史记录" style="padding: 60px 0;">
        <template #extra>
          <n-text depth="3" style="font-size: 13px;">
            处理文本后，历史记录将自动保存在这里
          </n-text>
        </template>
      </n-empty>
    </n-card>

    <!-- 统计信息 -->
    <n-card v-if="history.length > 0" size="small" class="stats-card">
      <n-space justify="center">
        <n-tag type="info" size="medium">
          📊 总记录: {{ history.length }} 条
        </n-tag>
        <n-tag type="success" size="medium">
          ✨ 已筛选: {{ filteredHistory.length }} 条
        </n-tag>
      </n-space>
    </n-card>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import {
  NCard,
  NList,
  NListItem,
  NThing,
  NText,
  NSpace,
  NButton,
  NEmpty,
  NInput,
  NTag,
} from 'naive-ui';
import { HistoryEntry } from '@clipboard-processor/core';
import { TextProcessorCore } from '@clipboard-processor/core';

const router = useRouter();
const history = ref<HistoryEntry[]>([]);
const searchQuery = ref('');

const processorCore = new TextProcessorCore();

onMounted(() => {
  loadHistory();
});

// 过滤后的历史记录
const filteredHistory = computed(() => {
  if (!searchQuery.value.trim()) {
    return history.value;
  }

  const query = searchQuery.value.toLowerCase();
  return history.value.filter(
    entry =>
      entry.originalText.toLowerCase().includes(query) ||
      entry.processedText.toLowerCase().includes(query)
  );
});

function loadHistory() {
  history.value = processorCore.getHistory();
}

function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength) + '...';
}

function formatTime(timestamp: number): string {
  const date = new Date(timestamp);
  const now = new Date();
  const diff = now.getTime() - date.getTime();

  // 小于1分钟
  if (diff < 60000) {
    return '刚刚';
  }
  // 小于1小时
  if (diff < 3600000) {
    return `${Math.floor(diff / 60000)} 分钟前`;
  }
  // 小于24小时
  if (diff < 86400000) {
    return `${Math.floor(diff / 3600000)} 小时前`;
  }
  // 超过24小时
  return date.toLocaleString('zh-CN', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

async function copyToClipboard(text: string) {
  try {
    await navigator.clipboard.writeText(text);
  } catch (err) {
    console.error('复制失败:', err);
  }
}

function reuseEntry(entry: HistoryEntry) {
  router.push({
    path: '/processor',
    query: { text: entry.originalText },
  });
}

function deleteEntry(entry: HistoryEntry) {
  // TODO: 实现单个删除
  processorCore.clearHistory();
  history.value = processorCore.getHistory();
}

function clearAllHistory() {
  if (confirm('确定要清空所有历史记录吗？')) {
    processorCore.clearHistory();
    history.value = [];
  }
}
</script>

<style scoped>
.history {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.page-header {
  background: linear-gradient(135deg, #f5f0e8 0%, #efe8dd 100%);
  border: 1px solid #e0d5c8;
}

.history-list-card {
  background: #ffffff;
}

.stats-card {
  background: linear-gradient(135deg, #f5f0e8 0%, #efe8dd 100%);
  border: 1px solid #e0d5c8;
}

:deep(.n-list-item) {
  padding: 16px;
  transition: background-color 0.2s ease;
}

:deep(.n-list-item:hover) {
  background-color: #f5f0e8;
}

:deep(.n-thing-header) {
  margin-bottom: 8px !important;
}

:deep(.n-thing-description) {
  margin-top: 8px;
}

:deep(.n-thing-footer) {
  margin-top: 12px;
  padding-top: 12px;
  border-top: 1px solid #e8dfd4;
}

:deep(.n-tag) {
  font-weight: 500;
}

.n-button:not(.n-button--disabled):hover {
  transform: translateY(-1px);
  transition: transform 0.2s ease;
}

:deep(.n-input) {
  border-radius: 6px;
}

:deep(.n-input:hover) {
  border-color: #c4956a;
}

:deep(.n-input--focus) {
  border-color: #c4956a;
  box-shadow: 0 0 0 2px rgba(196, 149, 106, 0.2);
}
</style>
