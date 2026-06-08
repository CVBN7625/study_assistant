<template>
  <div class="settings">
    <!-- 页面标题 -->
    <n-card size="small" class="page-header">
      <n-space align="center">
        <n-text strong style="font-size: 18px;">⚙️ 应用设置</n-text>
        <n-text depth="3" style="font-size: 13px;">配置和个性化你的文本处理器</n-text>
      </n-space>
    </n-card>

    <!-- 设置内容 -->
    <n-card class="settings-card">
      <n-tabs type="line" animated>
        <n-tab-pane name="general" tab="🎨 通用设置">
          <div class="tab-content">
            <n-form label-placement="left" label-width="140" :model="config">
              <n-grid :cols="2" :x-gap="24">
                <n-gi>
                  <n-form-item label="主题模式">
                    <n-select
                      v-model:value="config.ui.theme"
                      :options="themeOptions"
                      placeholder="选择主题"
                    />
                  </n-form-item>
                </n-gi>
                <n-gi>
                  <n-form-item label="界面语言">
                    <n-select
                      v-model:value="config.ui.language"
                      :options="languageOptions"
                      placeholder="选择语言"
                    />
                  </n-form-item>
                </n-gi>
              </n-grid>

              <n-divider />

              <n-grid :cols="2" :x-gap="24">
                <n-gi>
                  <n-form-item label="显示通知">
                    <n-switch v-model:value="config.ui.showNotifications" />
                  </n-form-item>
                </n-gi>
                <n-gi>
                  <n-form-item label="自动处理剪切板">
                    <n-switch v-model:value="config.ui.autoProcessClipboard" />
                    <n-text depth="3" style="font-size: 12px; margin-left: 8px;">
                      启用后自动监控剪切板变化
                    </n-text>
                  </n-form-item>
                </n-gi>
              </n-grid>
            </n-form>
          </div>
        </n-tab-pane>

        <n-tab-pane name="processors" tab="🔧 处理器设置">
          <div class="tab-content">
            <n-alert type="info" style="margin-bottom: 16px;">
              选择默认启用的处理器。这些处理器将在处理文本时自动应用。
            </n-alert>

            <n-list bordered>
              <n-list-item v-for="processor in processors" :key="processor.id">
                <n-thing>
                  <template #header>
                    <n-space align="center">
                      <n-checkbox v-model:checked="processor.isActive">
                        <n-text strong>{{ processor.name }}</n-text>
                      </n-checkbox>
                    </n-space>
                  </template>
                  <template #description>
                    <n-text depth="3" style="font-size: 13px;">
                      {{ processor.description }}
                    </n-text>
                  </template>
                </n-thing>
              </n-list-item>
            </n-list>
          </div>
        </n-tab-pane>

        <n-tab-pane name="shortcuts" tab="⌨️ 快捷键">
          <div class="tab-content">
            <n-alert type="warning" style="margin-bottom: 16px;">
              快捷键设置功能开发中...
            </n-alert>

            <n-list bordered>
              <n-list-item>
                <n-thing>
                  <template #header>
                    <n-text strong>处理文本</n-text>
                  </template>
                  <template #description>
                    <n-tag size="small" type="info">Ctrl + Enter</n-tag>
                  </template>
                </n-thing>
              </n-list-item>
              <n-list-item>
                <n-thing>
                  <template #header>
                    <n-text strong>清空输入</n-text>
                  </template>
                  <template #description>
                    <n-tag size="small" type="info">Ctrl + Shift + Delete</n-tag>
                  </template>
                </n-thing>
              </n-list-item>
              <n-list-item>
                <n-thing>
                  <template #header>
                    <n-text strong>复制结果</n-text>
                  </template>
                  <template #description>
                    <n-tag size="small" type="info">Ctrl + Shift + C</n-tag>
                  </template>
                </n-thing>
              </n-list-item>
            </n-list>
          </div>
        </n-tab-pane>

        <n-tab-pane name="translation" tab="🌐 翻译配置">
          <div class="tab-content">
            <translation-settings />
          </div>
        </n-tab-pane>
      </n-tabs>

      <!-- 底部操作栏 -->
      <n-divider />
      <n-space justify="end">
        <n-button @click="resetConfig">
          🔄 重置默认
        </n-button>
        <n-button type="primary" @click="saveConfig" strong>
          💾 保存设置
        </n-button>
      </n-space>
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
  NButton,
  NSpace,
  NText,
  NDivider,
  NGrid,
  NGi,
  NAlert,
  NTag,
} from 'naive-ui';
import { allProcessors } from '@clipboard-processor/core';
import TranslationSettings from './TranslationSettings.vue';

const config = ref({
  ui: {
    theme: 'auto',
    language: 'zh-CN',
    showNotifications: true,
    autoProcessClipboard: false,
  },
});

const processors = ref(
  allProcessors.map(p => ({
    id: p.id,
    name: p.name,
    description: p.description,
    isActive: p.isActive,
  }))
);

const themeOptions = [
  { label: '跟随系统', value: 'auto' },
  { label: '浅色模式', value: 'light' },
  { label: '深色模式', value: 'dark' },
];

const languageOptions = [
  { label: '中文 (简体)', value: 'zh-CN' },
  { label: 'English', value: 'en-US' },
];

function saveConfig() {
  // TODO: 保存到本地存储
  alert('设置已保存');
}

function resetConfig() {
  if (confirm('确定要重置所有设置吗？')) {
    config.value = {
      ui: {
        theme: 'auto',
        language: 'zh-CN',
        showNotifications: true,
        autoProcessClipboard: false,
      },
    };
  }
}
</script>

<style scoped>
.settings {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.page-header {
  background: linear-gradient(135deg, #f5f0e8 0%, #efe8dd 100%);
  border: 1px solid #e0d5c8;
}

.settings-card {
  background: #ffffff;
}

.tab-content {
  padding: 20px 0;
}

:deep(.n-tabs .n-tabs-tab) {
  font-weight: 500;
  color: #5a4d3f;
}

:deep(.n-tabs .n-tabs-tab--active) {
  color: #c4956a;
  font-weight: 600;
}

:deep(.n-tabs .n-tabs-bar) {
  background-color: #c4956a;
}

:deep(.n-form-item-label) {
  color: #5a4d3f;
  font-weight: 500;
}

:deep(.n-list-item) {
  padding: 12px 16px;
  transition: background-color 0.2s ease;
}

:deep(.n-list-item:hover) {
  background-color: #f5f0e8;
}

:deep(.n-divider) {
  border-color: #e0d5c8;
}

:deep(.n-alert) {
  border-radius: 8px;
}

.n-button:not(.n-button--disabled):hover {
  transform: translateY(-1px);
  transition: transform 0.2s ease;
}
</style>
