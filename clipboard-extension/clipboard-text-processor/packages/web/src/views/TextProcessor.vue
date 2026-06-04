<template>
  <div class="text-processor">
    <n-grid :cols="3" :x-gap="12">
      <!-- 输入区域 -->
      <n-gi>
        <n-card title="输入文本">
          <n-input
            v-model:value="inputText"
            type="textarea"
            placeholder="在这里输入或粘贴要处理的文字..."
            :rows="15"
          />
          <n-space>
            <n-button @click="pasteFromClipboard">
              📋 从剪切板粘贴
            </n-button>
            <n-button @click="clearInput">
              🗑️ 清空
            </n-button>
          </n-space>
        </n-card>
      </n-gi>

      <!-- 处理器面板 -->
      <n-gi>
        <n-card title="处理器">
          <n-scrollbar style="max-height: 400px;">
            <n-space vertical>
              <n-card
                v-for="category in processorCategories"
                :key="category.id"
                :title="category.name"
                size="small"
              >
                <n-space vertical>
                  <n-checkbox
                    v-for="processor in category.processors"
                    :key="processor.id"
                    v-model:checked="processor.isActive"
                    @change="onProcessorToggle(processor)"
                  >
                    {{ processor.name }}
                  </n-checkbox>
                </n-space>
              </n-card>
            </n-space>
          </n-scrollbar>
          <n-button type="primary" @click="processText" block>
            🚀 处理文本
          </n-button>
        </n-card>
      </n-gi>

      <!-- 输出区域 -->
      <n-gi>
        <n-card title="处理结果">
          <n-input
            v-model:value="outputText"
            type="textarea"
            placeholder="处理结果将在这里显示..."
            :rows="15"
            readonly
          />
          <n-space>
            <n-button type="success" @click="copyOutput">
              ✅ 复制结果
            </n-button>
            <n-button @click="replaceInput">
              ↩️ 替换输入
            </n-button>
          </n-space>
        </n-card>
      </n-gi>
    </n-grid>

    <n-card v-if="processingStats" title="处理统计">
      <n-text>处理时间: {{ processingStats.time }}ms</n-text>
      <n-text>应用处理器: {{ processingStats.processorsUsed }}个</n-text>
    </n-card>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, reactive } from 'vue';
import { NGrid, NGi, NCard, NInput, NButton, NSpace, NCheckbox, NScrollbar, NText } from 'naive-ui';
import { TextProcessorCore } from '@clipboard-processor/core';
import { allProcessors as rawAllProcessors } from '@clipboard-processor/core';

const inputText = ref('');
const outputText = ref('');
const processingStats = ref<{ time: number; processorsUsed: number } | null>(null);

const processorCore = new TextProcessorCore();

// ✅ 将 allProcessors 转换为响应式的数组
const allProcessors = reactive(rawAllProcessors.map(p => ({ ...p })));

// 注册所有处理器
allProcessors.forEach(processor => {
  processorCore.registerProcessor(processor);
});

const processorCategories = computed(() => {
  const categories = [
    { id: 'cleanup', name: '清理类', processors: [] as any[] },
    { id: 'conversion', name: '转换类', processors: [] as any[] },
    { id: 'enhancement', name: '增强类', processors: [] as any[] }
  ];

  allProcessors.forEach(processor => {
    const category = categories.find(c => c.id === processor.category);
    if (category) {
      // ✅ 直接使用原始处理器对象，而不是创建新对象
      category.processors.push(processor);
    }
  });

  return categories;
});

async function pasteFromClipboard() {
  try {
    const text = await navigator.clipboard.readText();
    inputText.value = text;
  } catch (err) {
    console.error('读取剪切板失败:', err);
  }
}

function clearInput() {
  inputText.value = '';
  outputText.value = '';
  processingStats.value = null;
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
    processorsUsed: result.processorsUsed.length
  };
}

async function copyOutput() {
  try {
    await navigator.clipboard.writeText(outputText.value);
    alert('已复制到剪切板');
  } catch (err) {
    console.error('复制失败:', err);
  }
}

function replaceInput() {
  inputText.value = outputText.value;
  outputText.value = '';
  processingStats.value = null;
}

function onProcessorToggle(processor: any) {
  const p = processorCore.getProcessor(processor.id);
  if (p) {
    p.isActive = processor.isActive;
  }
}
</script>

<style scoped>
.text-processor {
  padding: 20px;
}
</style>
