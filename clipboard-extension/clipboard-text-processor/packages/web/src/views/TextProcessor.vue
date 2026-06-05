<template>
  <div class="text-processor">
    <!-- 顶部工具栏 -->
    <n-card size="small" class="toolbar-card">
      <n-space justify="space-between" align="center">
        <n-space>
          <n-button @click="pasteFromClipboard" quaternary>
            <template #icon>
              <span>📋</span>
            </template>
            从剪切板粘贴
          </n-button>
          <n-button @click="clearInput" quaternary type="error">
            <template #icon>
              <span>🗑️</span>
            </template>
            清空
          </n-button>
          <n-button @click="copyOutput" quaternary type="success" :disabled="!outputText">
            <template #icon>
              <span>✅</span>
            </template>
            复制结果
          </n-button>
          <n-button @click="replaceInput" quaternary :disabled="!outputText">
            <template #icon>
              <span>↩️</span>
            </template>
            替换输入
          </n-button>
        </n-space>

        <n-space align="center">
          <!-- 自动处理开关 -->
          <n-space align="center" class="auto-process-switch">
            <n-text depth="3" style="font-size: 13px;">自动处理：</n-text>
            <n-switch
              v-model:value="autoProcessEnabled"
              @update:value="onAutoProcessToggle"
            >
              <template #checked>
                <span style="font-size: 11px;">开启</span>
              </template>
              <template #unchecked>
                <span style="font-size: 11px;">关闭</span>
              </template>
            </n-switch>
          </n-space>

          <n-button
            type="primary"
            @click="processText"
            :disabled="!inputText.trim()"
            strong
            size="large"
          >
            🚀 处理文本
          </n-button>
        </n-space>
      </n-space>
    </n-card>

    <!-- 自动处理状态提示 -->
    <n-card v-if="autoProcessEnabled" size="small" class="auto-process-hint">
      <n-space align="center" justify="center">
        <n-text depth="3" style="font-size: 12px;">
          ✨ 已启用自动处理模式 - 输入或粘贴文本后将自动处理并复制到剪切板
        </n-text>
      </n-space>
    </n-card>

    <!-- 主内容区：输入和输出 -->
    <n-grid :cols="2" :x-gap="16" class="main-content">
      <!-- 输入区域 -->
      <n-gi>
        <n-card title="📥 输入文本" size="small" class="input-card">
          <n-input
            v-model:value="inputText"
            type="textarea"
            placeholder="在这里输入或粘贴要处理的文字...&#10;&#10;支持从 PDF、学术论文、网页等复制的文本，自动清理格式问题。"
            :rows="22"
            :style="{ fontSize: '14px', lineHeight: '1.6' }"
          />
        </n-card>
      </n-gi>

      <!-- 输出区域 -->
      <n-gi>
        <n-card title="📤 处理结果" size="small" class="output-card">
          <n-input
            v-model:value="outputText"
            type="textarea"
            placeholder="处理结果将在这里显示...&#10;&#10;点击「处理文本」按钮开始处理。"
            :rows="22"
            readonly
            :style="{ fontSize: '14px', lineHeight: '1.6' }"
          />
        </n-card>
      </n-gi>
    </n-grid>

    <!-- 处理器配置区 -->
    <n-card title="⚙️ 处理器配置" size="small" class="processors-card">
      <n-collapse :default-expanded-names="['processors']">
        <n-collapse-item title="展开处理器列表" name="processors">
          <n-grid :cols="3" :x-gap="16" :y-gap="16">
            <n-gi v-for="category in processorCategories" :key="category.id">
              <n-card :title="category.name" size="small" class="category-card">
                <n-space vertical>
                  <template v-for="processor in category.processors" :key="processor.id">
                    <!-- 互斥处理器带提示 -->
                    <n-tooltip v-if="isInExclusiveGroup(processor.id)" trigger="hover">
                      <template #trigger>
                        <n-checkbox
                          v-model:checked="processor.isActive"
                          @change="onProcessorToggle(processor)"
                        >
                          <n-text>{{ processor.name }}</n-text>
                        </n-checkbox>
                      </template>
                      此选项与「{{ getExclusivePartnerName(processor.id) }}」互斥
                    </n-tooltip>
                    <!-- 普通处理器 -->
                    <n-checkbox
                      v-else
                      v-model:checked="processor.isActive"
                      @change="onProcessorToggle(processor)"
                    >
                      <n-text>{{ processor.name }}</n-text>
                    </n-checkbox>
                  </template>
                </n-space>
              </n-card>
            </n-gi>
          </n-grid>
        </n-collapse-item>
      </n-collapse>
    </n-card>

    <!-- 处理统计 -->
    <n-card v-if="processingStats" size="small" class="stats-card">
      <n-space justify="center">
        <n-tag type="info" size="medium">
          ⏱️ 处理时间: {{ processingStats.time }}ms
        </n-tag>
        <n-tag type="success" size="medium">
          ✨ 应用处理器: {{ processingStats.processorsUsed }}个
        </n-tag>
      </n-space>
    </n-card>

    <!-- Toast 提示 -->
    <div v-if="showToast" class="toast" :class="toastType">
      {{ toastMessage }}
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, reactive, watch } from 'vue';
import {
  NGrid,
  NGi,
  NCard,
  NInput,
  NButton,
  NSpace,
  NCheckbox,
  NText,
  NTag,
  NCollapse,
  NCollapseItem,
  NSwitch,
  NTooltip,
} from 'naive-ui';
import { TextProcessorCore } from '@clipboard-processor/core';
import { allProcessors as rawAllProcessors } from '@clipboard-processor/core';

const inputText = ref('');
const outputText = ref('');
const processingStats = ref<{ time: number; processorsUsed: number } | null>(null);

// 自动处理相关
const autoProcessEnabled = ref(true); // 默认启用
const autoProcessTimer = ref<number | null>(null);
const DEBOUNCE_DELAY = 500; // 500ms 防抖延迟

// Toast 提示相关
const showToast = ref(false);
const toastMessage = ref('');
const toastType = ref<'success' | 'error' | 'info'>('success');
let toastTimer: number | null = null;

const processorCore = new TextProcessorCore();

// ✅ 将 allProcessors 转换为响应式的数组
const allProcessors = reactive(rawAllProcessors.map(p => ({ ...p })));

// 注册所有处理器
allProcessors.forEach(processor => {
  processorCore.registerProcessor(processor);
});

// 互斥处理器配置
const exclusiveGroups: Record<string, string[]> = {
  newlineProcessing: ['delete-duplicate-newlines', 'delete-all-newlines'],
  spaceProcessing: ['remove-spaces-between-chinese', 'keep-english-word-spaces', 'delete-duplicate-spaces']
};

// 检查处理器是否在互斥组中
function isInExclusiveGroup(processorId: string): boolean {
  return Object.values(exclusiveGroups).some(group => group.includes(processorId));
}

// 获取互斥伙伴的名称
function getExclusivePartnerName(processorId: string): string {
  for (const processorIds of Object.values(exclusiveGroups)) {
    if (processorIds.includes(processorId)) {
      const partnerId = processorIds.find(id => id !== processorId);
      if (partnerId) {
        const partner = allProcessors.find(p => p.id === partnerId);
        return partner ? partner.name : '';
      }
    }
  }
  return '';
}

const processorCategories = computed(() => {
  const categories = [
    { id: 'cleanup', name: '🧹 清理类', processors: [] as any[] },
    { id: 'conversion', name: '🔄 转换类', processors: [] as any[] },
    { id: 'enhancement', name: '✨ 增强类', processors: [] as any[] },
  ];

  allProcessors.forEach(processor => {
    const category = categories.find(c => c.id === processor.category);
    if (category) {
      category.processors.push(processor);
    }
  });

  return categories;
});

// 监听输入文本变化
watch(inputText, (newValue, oldValue) => {
  // 如果自动处理未启用，不处理
  if (!autoProcessEnabled.value) {
    return;
  }

  // 如果文本为空，清空输出
  if (!newValue.trim()) {
    outputText.value = '';
    processingStats.value = null;
    return;
  }

  // 如果文本没有变化，不处理
  if (newValue === oldValue) {
    return;
  }

  // 清除之前的定时器
  if (autoProcessTimer.value) {
    clearTimeout(autoProcessTimer.value);
  }

  // 设置新的定时器（500ms 防抖）
  autoProcessTimer.value = window.setTimeout(() => {
    processAndCopy();
  }, DEBOUNCE_DELAY);
});

// 自动处理并复制
async function processAndCopy() {
  if (!inputText.value.trim()) {
    return;
  }

  try {
    // 处理文本
    const startTime = performance.now();
    const result = processorCore.process(inputText.value);
    const endTime = performance.now();

    outputText.value = result.text;
    processingStats.value = {
      time: Math.round(endTime - startTime),
      processorsUsed: result.processorsUsed.length,
    };

    // 自动复制到剪切板
    await navigator.clipboard.writeText(outputText.value);

    // 显示成功提示
    showToastMessage('✅ 已复制到剪切板', 'success');
  } catch (err) {
    console.error('自动处理失败:', err);
    showToastMessage('❌ 处理失败', 'error');
  }
}

// 显示 Toast 提示
function showToastMessage(message: string, type: 'success' | 'error' | 'info') {
  // 清除之前的定时器
  if (toastTimer) {
    clearTimeout(toastTimer);
  }

  toastMessage.value = message;
  toastType.value = type;
  showToast.value = true;

  // 2秒后自动隐藏
  toastTimer = window.setTimeout(() => {
    showToast.value = false;
  }, 2000);
}

// 自动处理开关切换
function onAutoProcessToggle(enabled: boolean) {
  if (enabled) {
    showToastMessage('✅ 已启用自动处理', 'info');
  } else {
    showToastMessage('⚠️ 已关闭自动处理', 'info');
    // 清除定时器
    if (autoProcessTimer.value) {
      clearTimeout(autoProcessTimer.value);
      autoProcessTimer.value = null;
    }
  }
}

async function pasteFromClipboard() {
  try {
    const text = await navigator.clipboard.readText();
    inputText.value = text;
    // 注意：watch 会自动触发处理
  } catch (err) {
    console.error('读取剪切板失败:', err);
    showToastMessage('❌ 读取剪切板失败', 'error');
  }
}

function clearInput() {
  inputText.value = '';
  outputText.value = '';
  processingStats.value = null;

  // 清除自动处理定时器
  if (autoProcessTimer.value) {
    clearTimeout(autoProcessTimer.value);
    autoProcessTimer.value = null;
  }
}

function processText() {
  if (!inputText.value.trim()) {
    return;
  }

  const startTime = performance.now();
  const result = processorCore.process(inputText.value);
  const endTime = performance.now();

  outputText.value = result.text;
  processingStats.value = {
    time: Math.round(endTime - startTime),
    processorsUsed: result.processorsUsed.length,
  };
}

async function copyOutput() {
  try {
    await navigator.clipboard.writeText(outputText.value);
    showToastMessage('✅ 已复制到剪切板', 'success');
  } catch (err) {
    console.error('复制失败:', err);
    showToastMessage('❌ 复制失败', 'error');
  }
}

function replaceInput() {
  inputText.value = outputText.value;
  outputText.value = '';
  processingStats.value = null;
}

function onProcessorToggle(processor: any) {
  // 检查是否属于互斥组
  for (const processorIds of Object.values(exclusiveGroups)) {
    if (processorIds.includes(processor.id) && processor.isActive) {
      // 如果启用了某个互斥组的处理器，禁用同组的其他处理器
      allProcessors.forEach(p => {
        if (processorIds.includes(p.id) && p.id !== processor.id) {
          p.isActive = false;
          // 同步到核心引擎
          const coreProcessor = processorCore.getProcessor(p.id);
          if (coreProcessor) {
            coreProcessor.isActive = false;
          }
        }
      });
    }
  }

  // 同步当前处理器状态到核心引擎
  const coreProcessor = processorCore.getProcessor(processor.id);
  if (coreProcessor) {
    coreProcessor.isActive = processor.isActive;
  }
}
</script>

<style scoped>
.text-processor {
  display: flex;
  flex-direction: column;
  gap: 16px;
  position: relative;
}

.toolbar-card {
  background: linear-gradient(135deg, #f5f0e8 0%, #efe8dd 100%);
  border: 1px solid #e0d5c8;
}

.auto-process-hint {
  background: linear-gradient(135deg, #e8f5e9 0%, #f1f8e9 100%);
  border: 1px solid #c8e6c9;
  padding: 8px 0;
}

.auto-process-switch {
  padding: 4px 8px;
  background: rgba(255, 255, 255, 0.6);
  border-radius: 6px;
  border: 1px solid #e0d5c8;
}

.main-content {
  margin-top: 0;
}

.input-card,
.output-card {
  height: 100%;
}

.input-card :deep(.n-card-header) {
  border-bottom: 2px solid #c4956a;
  padding-bottom: 12px;
}

.output-card :deep(.n-card-header) {
  border-bottom: 2px solid #6b8e4e;
  padding-bottom: 12px;
}

.processors-card {
  background: #ffffff;
}

.category-card {
  background: #faf8f5;
  border: 1px solid #e8dfd4;
}

.category-card :deep(.n-card-header) {
  font-size: 14px;
  font-weight: 600;
  color: #5a4d3f;
}

.stats-card {
  background: linear-gradient(135deg, #f5f0e8 0%, #efe8dd 100%);
  border: 1px solid #e0d5c8;
}

/* 优化文本区域样式 */
:deep(.n-input) {
  border-radius: 8px;
  transition: all 0.2s ease;
}

:deep(.n-input:hover) {
  border-color: #c4956a;
}

:deep(.n-input--focus) {
  border-color: #c4956a;
  box-shadow: 0 0 0 2px rgba(196, 149, 106, 0.2);
}

/* 优化卡片标题 */
:deep(.n-card-header__main) {
  font-weight: 600;
  color: #3d3229;
}

/* 优化复选框样式 */
:deep(.n-checkbox) {
  margin-bottom: 8px;
}

:deep(.n-checkbox:hover .n-checkbox__label) {
  color: #c4956a;
}

/* 按钮悬停效果 */
.n-button:not(.n-button--disabled):hover {
  transform: translateY(-1px);
  transition: transform 0.2s ease;
}

/* 统计标签样式 */
.n-tag {
  font-weight: 500;
}

/* Toast 提示样式 */
.toast {
  position: fixed;
  top: 20px;
  right: 20px;
  padding: 12px 24px;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 500;
  z-index: 1000;
  animation: slideIn 0.3s ease, fadeOut 0.3s ease 1.7s;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.toast.success {
  background: linear-gradient(135deg, #66bb6a 0%, #4caf50 100%);
  color: white;
}

.toast.error {
  background: linear-gradient(135deg, #ef5350 0%, #f44336 100%);
  color: white;
}

.toast.info {
  background: linear-gradient(135deg, #42a5f5 0%, #2196f3 100%);
  color: white;
}

@keyframes slideIn {
  from {
    transform: translateX(100%);
    opacity: 0;
  }
  to {
    transform: translateX(0);
    opacity: 1;
  }
}

@keyframes fadeOut {
  from {
    opacity: 1;
  }
  to {
    opacity: 0;
  }
}
</style>
