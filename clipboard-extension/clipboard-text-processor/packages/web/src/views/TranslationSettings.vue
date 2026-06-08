<template>
  <n-card title="翻译配置" size="small">
    <n-form :model="config" label-placement="left" label-width="120">
      <!-- 百度翻译配置 -->
      <n-divider>百度翻译</n-divider>
      <n-form-item label="APP ID">
        <n-input
          v-model:value="config.baiduAppId"
          type="password"
          placeholder="请输入百度翻译APP ID"
          show-password-on="click"
        />
      </n-form-item>
      <n-form-item label="Secret Key">
        <n-input
          v-model:value="config.baiduSecretKey"
          type="password"
          placeholder="请输入百度翻译Secret Key"
          show-password-on="click"
        />
      </n-form-item>

      <!-- 语言配置 -->
      <n-divider>语言设置</n-divider>
      <n-form-item label="默认源语言">
        <n-select
          v-model:value="config.defaultSourceLang"
          :options="sourceLanguageOptions"
        />
      </n-form-item>
      <n-form-item label="默认目标语言">
        <n-select
          v-model:value="config.defaultTargetLang"
          :options="targetLanguageOptions"
        />
      </n-form-item>

      <!-- 自动翻译配置 -->
      <n-divider>翻译模式</n-divider>
      <n-form-item label="自动翻译">
        <n-switch v-model:value="config.autoTranslate" />
        <n-text depth="3" style="margin-left: 8px;">
          输入时自动触发翻译（500ms防抖）
        </n-text>
      </n-form-item>

      <n-form-item>
        <n-space>
          <n-button type="primary" @click="handleSaveConfig">
            保存配置
          </n-button>
          <n-button @click="handleResetConfig">
            重置默认
          </n-button>
        </n-space>
      </n-form-item>

      <n-alert type="info" style="margin-top: 16px;">
        <template #header>获取API Key</template>
        访问
        <n-a href="https://fanyi-api.baidu.com" target="_blank">
          百度翻译开放平台
        </n-a>
        注册账号并开通翻译API服务，获取APP ID和密钥。
        <br />
        <n-text type="warning">
          API Key保存在本地浏览器中，请勿在公共设备上使用。
        </n-text>
      </n-alert>
    </n-form>
  </n-card>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useMessage } from 'naive-ui';
import { useTranslator } from '../composables/useTranslator';
import { LANGUAGES } from '../services/translation-service';

const message = useMessage();

// 使用翻译Composable
const {
  config,
  updateConfig,
  resetConfig: resetToDefault
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

// 保存配置
const handleSaveConfig = () => {
  updateConfig(config);
  message.success('配置已保存');
};

// 重置配置
const handleResetConfig = () => {
  resetToDefault();
  message.info('已重置为默认配置');
};
</script>
