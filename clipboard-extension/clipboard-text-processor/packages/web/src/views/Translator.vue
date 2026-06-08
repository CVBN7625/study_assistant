<template>
  <div class="translator-page">
    <!-- 语言选择栏 -->
    <n-card size="small" class="language-bar">
      <n-space align="center" justify="space-between">
        <n-select
          v-model:value="sourceLang"
          :options="sourceLanguageOptions"
          style="width: 150px"
        />
        <n-button quaternary @click="swapLanguages" title="交换语言">
          ⇄
        </n-button>
        <n-select
          v-model:value="targetLang"
          :options="targetLanguageOptions"
          style="width: 150px"
        />
      </n-space>
    </n-card>

    <!-- 输入/输出区域 -->
    <n-grid :cols="2" :x-gap="16" style="margin-top: 16px">
      <n-gi>
        <n-card title="输入文本" size="small">
          <n-input
            v-model:value="inputText"
            type="textarea"
            :rows="18"
            placeholder="请输入要翻译的文本..."
          />
          <template #footer>
            <n-space justify="space-between">
              <n-text depth="3">字数: {{ inputText.length }}</n-text>
              <n-space>
                <n-button size="small" @click="pasteFromClipboard">粘贴</n-button>
                <n-button size="small" @click="clearInput">清空</n-button>
              </n-space>
            </n-space>
          </template>
        </n-card>
      </n-gi>

      <n-gi>
        <n-card title="翻译结果" size="small">
          <n-input
            v-model:value="outputText"
            type="textarea"
            :rows="18"
            readonly
            placeholder="翻译结果将显示在这里..."
          />
          <template #footer>
            <n-space justify="space-between">
              <n-text depth="3">字数: {{ outputText.length }}</n-text>
              <n-button size="small" @click="copyResult">复制</n-button>
            </n-space>
          </template>
        </n-card>
      </n-gi>
    </n-grid>

    <!-- 状态栏 -->
    <n-card size="small" style="margin-top: 16px">
      <n-space align="center" justify="space-between">
        <n-space align="center">
          <n-spin v-if="isTranslating" :size="18" />
          <n-alert
            v-if="errorMsg"
            :type="errorMsg.includes('进度') ? 'info' : 'error'"
            size="small"
            closable
            @close="errorMsg = ''"
          >
            {{ errorMsg }}
          </n-alert>
          <n-text v-else depth="3">
            {{ statusMessage }}
          </n-text>
        </n-space>

        <n-space align="center">
          <n-space align="center">
            <n-text>自动翻译</n-text>
            <n-switch
              v-model:value="config.autoTranslate"
              @update:value="saveAutoTranslateSetting"
            />
          </n-space>

          <n-button
            type="primary"
            :loading="isTranslating"
            :disabled="!canTranslate"
            @click="translateText"
          >
            翻译 (Ctrl+Enter)
          </n-button>
        </n-space>
      </n-space>
    </n-card>

    <!-- 翻译历史记录 -->
    <n-card
      v-if="history.length > 0"
      title="翻译历史"
      size="small"
      style="margin-top: 16px"
    >
      <n-collapse>
        <n-collapse-item
          v-for="item in history"
          :key="item.id"
          :title="`${item.sourceText.slice(0, 50)}...`"
          :name="item.id"
        >
          <template #header-extra>
            <n-text depth="3" style="font-size: 12px;">
              {{ formatTime(item.timestamp) }}
            </n-text>
          </template>

          <n-grid :cols="2" :x-gap="16">
            <n-gi>
              <n-text strong>原文：</n-text>
              <n-text>{{ item.sourceText }}</n-text>
            </n-gi>
            <n-gi>
              <n-text strong>译文：</n-text>
              <n-text>{{ item.translatedText }}</n-text>
            </n-gi>
          </n-grid>

          <n-space style="margin-top: 8px;">
            <n-button size="small" @click="reuseHistory(item)">
              重用
            </n-button>
            <n-button size="small" @click="deleteHistory(item.id)">
              删除
            </n-button>
          </n-space>
        </n-collapse-item>
      </n-collapse>

      <template #footer>
        <n-button size="small" @click="clearHistory">
          清空历史记录
        </n-button>
      </template>
    </n-card>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, onUnmounted } from 'vue';
import { useMessage } from 'naive-ui';
import { useTranslator } from '../composables/useTranslator';
import { LANGUAGES } from '../services/translation-service';

const message = useMessage();

// 使用翻译Composable
const {
  inputText,
  outputText,
  sourceLang,
  targetLang,
  isTranslating,
  errorMsg,
  config,
  history,
  statusMessage,
  canTranslate,
  translateText,
  swapLanguages,
  clearInput,
  pasteFromClipboard,
  copyResult,
  reuseHistory,
  deleteHistory,
  clearHistory,
  formatTime,
  saveAutoTranslateSetting
} = useTranslator();

// 源语言选项
const sourceLanguageOptions = computed(() =>
  LANGUAGES.map(lang => ({
    label: lang.label,
    value: lang.code
  }))
);

// 目标语言选项（排除auto）
const targetLanguageOptions = computed(() =>
  LANGUAGES.filter(lang => lang.code !== 'auto').map(lang => ({
    label: lang.label,
    value: lang.code
  }))
);

// 复制结果并显示提示
const handleCopyResult = async () => {
  const success = await copyResult();
  if (success) {
    message.success('已复制到剪贴板');
  }
};

// 监听Ctrl+Enter快捷键
const handleKeydown = (e: KeyboardEvent) => {
  if (e.ctrlKey && e.key === 'Enter') {
    e.preventDefault();
    if (canTranslate.value) {
      translateText();
    }
  }
};

onMounted(() => {
  window.addEventListener('keydown', handleKeydown);
});

onUnmounted(() => {
  window.removeEventListener('keydown', handleKeydown);
});
</script>

<style scoped>
.translator-page {
  padding: 16px;
  max-width: 1200px;
  margin: 0 auto;
}

.language-bar {
  background: linear-gradient(135deg, #f5f0e8 0%, #faf8f5 100%);
}

:deep(.n-card) {
  border-radius: 12px;
  border: 1px solid #e0d5c8;
}

:deep(.n-card-header) {
  background: linear-gradient(135deg, #c4956a 0%, #d4a57a 100%);
  border-radius: 12px 12px 0 0;
  color: white;
  font-weight: 500;
}

:deep(.n-input--textarea) {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'PingFang SC',
    'Hiragino Sans GB', 'Microsoft YaHei', sans-serif;
}

:deep(.n-collapse-item__header) {
  font-size: 14px;
}

:deep(.n-collapse-item__content-wrapper) {
  padding: 12px;
}
</style>
