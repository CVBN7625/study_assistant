<template>
  <div class="options-container">
    <h1>Clipboard Text Processor - 设置</h1>

    <n-tabs>
      <n-tab-pane name="general" tab="通用设置">
        <n-form label-placement="left" label-width="120">
          <n-form-item label="主题">
            <n-select v-model:value="config.ui.theme" :options="themeOptions" />
          </n-form-item>
          <n-form-item label="语言">
            <n-select v-model:value="config.ui.language" :options="languageOptions" />
          </n-form-item>
          <n-form-item label="显示通知">
            <n-switch v-model:value="config.ui.showNotifications" />
          </n-form-item>
          <n-form-item label="自动处理剪切板">
            <n-switch v-model:value="config.ui.autoProcessClipboard" />
          </n-form-item>
          <n-form-item label="显示浮动菜单">
            <n-switch v-model:value="config.ui.floatingMenuEnabled" />
          </n-form-item>
        </n-form>
      </n-tab-pane>

      <n-tab-pane name="processors" tab="处理器设置">
        <n-list>
          <n-list-item v-for="processor in processors" :key="processor.id">
            <n-thing>
              <template #header>
                <n-checkbox v-model:checked="processor.isActive">
                  {{ processor.name }}
                </n-checkbox>
              </template>
              <template #description>
                {{ processor.description }}
              </template>
            </n-thing>
          </n-list-item>
        </n-list>
      </n-tab-pane>

      <n-tab-pane name="shortcuts" tab="快捷键设置">
        <n-form label-placement="left" label-width="120">
          <n-form-item label="处理选中文字">
            <n-input v-model:value="config.shortcuts.processSelection" />
          </n-form-item>
          <n-form-item label="处理剪切板">
            <n-input v-model:value="config.shortcuts.processClipboard" />
          </n-form-item>
          <n-form-item label="快速清理">
            <n-input v-model:value="config.shortcuts.quickClean" />
          </n-form-item>
        </n-form>
      </n-tab-pane>

      <n-tab-pane name="translation" tab="翻译设置">
        <n-form label-placement="left" label-width="120">
          <n-form-item label="默认翻译引擎">
            <n-select v-model:value="config.translation.defaultEngine" :options="engineOptions" />
          </n-form-item>
          <n-form-item label="源语言">
            <n-select v-model:value="config.translation.defaultSourceLang" :options="languageOptions" />
          </n-form-item>
          <n-form-item label="目标语言">
            <n-select v-model:value="config.translation.defaultTargetLang" :options="languageOptions" />
          </n-form-item>
        </n-form>
      </n-tab-pane>
    </n-tabs>

    <div class="actions">
      <n-button type="primary" @click="saveConfig">保存设置</n-button>
      <n-button @click="resetConfig">重置默认</n-button>
      <n-button @click="exportConfig">导出配置</n-button>
      <n-button @click="importConfig">导入配置</n-button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import {
  NTabs,
  NTabPane,
  NForm,
  NFormItem,
  NSelect,
  NSwitch,
  NList,
  NListItem,
  NThing,
  NCheckbox,
  NInput,
  NButton
} from 'naive-ui';
import { ProcessorConfig } from '@clipboard-processor/core';
import { allProcessors } from '@clipboard-processor/core';

const config = ref<ProcessorConfig>({
  processors: {},
  shortcuts: {
    processSelection: 'Ctrl+Shift+P',
    processClipboard: 'Ctrl+Shift+V',
    quickClean: 'Ctrl+Shift+C'
  },
  translation: {
    defaultEngine: 'baidu',
    apiKeys: {},
    defaultSourceLang: 'auto',
    defaultTargetLang: 'zh'
  },
  ui: {
    theme: 'auto',
    language: 'zh-CN',
    showNotifications: true,
    autoProcessClipboard: false,
    floatingMenuEnabled: true
  }
});

const processors = ref(allProcessors.map(p => ({
  id: p.id,
  name: p.name,
  description: p.description,
  isActive: p.isActive
})));

const themeOptions = [
  { label: '跟随系统', value: 'auto' },
  { label: '浅色', value: 'light' },
  { label: '深色', value: 'dark' }
];

const languageOptions = [
  { label: '中文', value: 'zh-CN' },
  { label: 'English', value: 'en-US' }
];

const engineOptions = [
  { label: '百度翻译', value: 'baidu' },
  { label: '谷歌翻译', value: 'google' },
  { label: 'DeepL', value: 'deepl' }
];

onMounted(() => {
  loadConfig();
});

async function loadConfig() {
  const response = await chrome.runtime.sendMessage({ type: 'GET_CONFIG' });
  if (response.config) {
    config.value = response.config;
  }
}

function saveConfig() {
  chrome.runtime.sendMessage({
    type: 'SAVE_CONFIG',
    config: config.value
  });
  alert('设置已保存');
}

function resetConfig() {
  if (confirm('确定要重置为默认设置吗？')) {
    // 重置为默认配置
    config.value = {
      processors: {},
      shortcuts: {
        processSelection: 'Ctrl+Shift+P',
        processClipboard: 'Ctrl+Shift+V',
        quickClean: 'Ctrl+Shift+C'
      },
      translation: {
        defaultEngine: 'baidu',
        apiKeys: {},
        defaultSourceLang: 'auto',
        defaultTargetLang: 'zh'
      },
      ui: {
        theme: 'auto',
        language: 'zh-CN',
        showNotifications: true,
        autoProcessClipboard: false,
        floatingMenuEnabled: true
      }
    };
  }
}

function exportConfig() {
  const dataStr = JSON.stringify(config.value, null, 2);
  const dataBlob = new Blob([dataStr], { type: 'application/json' });
  const url = URL.createObjectURL(dataBlob);
  const link = document.createElement('a');
  link.href = url;
  link.download = 'clipboard-processor-config.json';
  link.click();
  URL.revokeObjectURL(url);
}

function importConfig() {
  const input = document.createElement('input');
  input.type = 'file';
  input.accept = '.json';
  input.onchange = (e) => {
    const file = (e.target as HTMLInputElement).files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        try {
          const imported = JSON.parse(event.target?.result as string);
          config.value = imported;
          alert('配置已导入');
        } catch (err) {
          alert('配置文件格式错误');
        }
      };
      reader.readAsText(file);
    }
  };
  input.click();
}
</script>

<style scoped>
.options-container {
  max-width: 800px;
  margin: 0 auto;
  padding: 20px;
}

.actions {
  margin-top: 20px;
  display: flex;
  gap: 10px;
}
</style>
