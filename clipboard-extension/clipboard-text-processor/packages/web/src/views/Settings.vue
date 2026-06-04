<template>
  <div class="settings">
    <n-card title="设置">
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
      </n-tabs>

      <n-button type="primary" @click="saveConfig">保存设置</n-button>
    </n-card>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import {
  NCard,
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
  NButton
} from 'naive-ui';
import { allProcessors } from '@clipboard-processor/core';

const config = ref({
  ui: {
    theme: 'auto',
    language: 'zh-CN',
    showNotifications: true,
    autoProcessClipboard: false
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

function saveConfig() {
  alert('设置已保存');
}
</script>

<style scoped>
.settings {
  max-width: 800px;
  margin: 0 auto;
  padding: 20px;
}
</style>
