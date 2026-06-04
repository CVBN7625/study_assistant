<template>
  <div class="history">
    <n-card title="历史记录">
      <n-list>
        <n-list-item v-for="entry in history" :key="entry.id">
          <n-thing>
            <template #header>
              <n-text>{{ entry.processedText.substring(0, 50) }}...</n-text>
            </template>
            <template #description>
              <n-text depth="3">
                {{ new Date(entry.timestamp).toLocaleString('zh-CN') }}
              </n-text>
            </template>
            <template #footer>
              <n-space>
                <n-button size="small" @click="reuseEntry(entry)">重用</n-button>
                <n-button size="small" type="error" @click="deleteEntry(entry)">删除</n-button>
              </n-space>
            </template>
          </n-thing>
        </n-list-item>
      </n-list>

      <n-empty v-if="history.length === 0" description="暂无历史记录" />
    </n-card>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { NCard, NList, NListItem, NThing, NText, NSpace, NButton, NEmpty } from 'naive-ui';
import { HistoryEntry } from '@clipboard-processor/core';
import { TextProcessorCore } from '@clipboard-processor/core';

const router = useRouter();
const history = ref<HistoryEntry[]>([]);

const processorCore = new TextProcessorCore();

onMounted(() => {
  loadHistory();
});

function loadHistory() {
  history.value = processorCore.getHistory();
}

function reuseEntry(entry: HistoryEntry) {
  // 跳转到处理器页面并传递文本
  router.push({
    path: '/processor',
    query: { text: entry.originalText }
  });
}

function deleteEntry(entry: HistoryEntry) {
  processorCore.clearHistory();
  history.value = processorCore.getHistory();
}
</script>

<style scoped>
.history {
  max-width: 800px;
  margin: 0 auto;
  padding: 20px;
}
</style>
