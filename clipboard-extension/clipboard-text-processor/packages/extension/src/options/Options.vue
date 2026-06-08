<template>
  <main class="options-container">
    <h1>Clipboard Text Processor - 设置</h1>

    <n-tabs>
      <n-tab-pane name="general" tab="通用设置">
        <n-form label-placement="left" label-width="140">
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
        <n-alert type="info" class="section-tip">
          启用“翻译文本”处理器后，右键“处理选中文字”和弹窗“处理文本”会进入真实翻译流程。
        </n-alert>
        <n-list>
          <n-list-item v-for="processor in processors" :key="processor.id">
            <n-thing>
              <template #header>
                <n-checkbox
                  v-model:checked="processor.isActive"
                  @update:checked="checked => onProcessorToggle(processor, checked)"
                >
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
        <n-form label-placement="left" label-width="140">
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
        <n-form label-placement="left" label-width="150">
          <n-form-item label="默认翻译引擎">
            <n-select v-model:value="config.translation.defaultEngine" :options="engineOptions" />
          </n-form-item>
          <n-form-item label="API 类型">
            <n-select v-model:value="translationApiType" :options="translationApiOptions" />
          </n-form-item>
          <n-form-item label="百度 APP ID">
            <n-input
              v-model:value="baiduApiConfig.appId"
              type="password"
              placeholder="开发者信息页面中的 APP ID"
              show-password-on="click"
            />
          </n-form-item>
          <n-form-item v-if="needsSecretKey" label="百度 Secret Key">
            <n-input
              v-model:value="baiduApiConfig.secretKey"
              type="password"
              placeholder="开发者信息页面中的密钥"
              show-password-on="click"
            />
          </n-form-item>
          <n-form-item v-if="translationApiType === 'domain'" label="翻译领域">
            <n-select v-model:value="baiduApiConfig.domain" :options="fieldDomainOptions" />
          </n-form-item>

          <template v-if="translationApiType === 'large-model'">
            <n-form-item label="鉴权方式">
              <n-select v-model:value="baiduApiConfig.largeModelAuthMode" :options="largeModelAuthModeOptions" />
            </n-form-item>
            <n-form-item v-if="baiduApiConfig.largeModelAuthMode === 'api-key'" label="大模型 API Key">
              <n-input
                v-model:value="baiduApiConfig.largeModelApiKey"
                type="password"
                placeholder="API Key 管理页面创建的 Key"
                show-password-on="click"
              />
            </n-form-item>
            <n-form-item label="请求地址">
              <n-input
                v-model:value="baiduApiConfig.largeModelEndpoint"
                placeholder="https://fanyi-api.baidu.com/ait/api/aiTextTranslate"
              />
            </n-form-item>
            <n-form-item label="模型类型">
              <n-select v-model:value="baiduApiConfig.largeModelModelType" :options="largeModelModelTypeOptions" />
            </n-form-item>
            <n-form-item label="翻译指令">
              <n-input
                v-model:value="baiduApiConfig.largeModelReference"
                type="textarea"
                placeholder="可选，如：使用学术风格来翻译"
                :autosize="{ minRows: 2, maxRows: 4 }"
              />
            </n-form-item>
            <n-form-item label="启用术语库">
              <n-switch v-model:value="baiduApiConfig.largeModelNeedIntervene" />
            </n-form-item>
            <n-form-item label="标签保持">
              <n-switch v-model:value="baiduApiConfig.largeModelTagHandling" />
            </n-form-item>
            <n-form-item v-if="baiduApiConfig.largeModelTagHandling" label="忽略标签">
              <n-input
                v-model:value="baiduApiConfig.largeModelIgnoreTags"
                placeholder="最多 20 个，逗号分隔，如 name,address"
              />
            </n-form-item>
          </template>

          <template v-if="translationApiType === 'image'">
            <n-form-item label="图片接口地址">
              <n-input v-model:value="baiduApiConfig.imageEndpoint" placeholder="留空使用百度默认图片翻译接口" />
            </n-form-item>
            <n-form-item label="图片 CUID">
              <n-input v-model:value="baiduApiConfig.imageCuid" placeholder="留空时自动生成" />
            </n-form-item>
            <n-form-item label="图片 MAC">
              <n-input v-model:value="baiduApiConfig.imageMac" placeholder="留空时使用默认值" />
            </n-form-item>
            <n-form-item label="图片外部用量">
              <n-input-number v-model:value="baiduApiConfig.imageQuotaBaseline" :min="0" :precision="0" />
            </n-form-item>
          </template>

          <n-form-item v-if="translationApiType !== 'image'" label="文本外部用量">
            <n-input-number v-model:value="baiduApiConfig.quotaBaseline" :min="0" :precision="0" />
          </n-form-item>
          <n-form-item label="启用缓存">
            <n-switch v-model:value="config.translation.cacheEnabled" />
          </n-form-item>
          <n-form-item label="自动翻译">
            <n-switch v-model:value="config.translation.autoTranslate" />
          </n-form-item>
          <n-form-item label="源语言">
            <n-select v-model:value="config.translation.defaultSourceLang" :options="translationSourceLanguageOptions" />
          </n-form-item>
          <n-form-item label="目标语言">
            <n-select v-model:value="config.translation.defaultTargetLang" :options="translationTargetLanguageOptions" />
          </n-form-item>
          <n-form-item>
            <n-alert type="info">
              通用、领域、图片翻译使用 APP ID + Secret Key；大模型文本翻译默认使用 APP ID + Bearer API Key。
              所有凭据只保存在当前浏览器扩展存储中，发布版不会内置任何密钥。插件会按本地记录在免费额度 95% 时停止调用。
            </n-alert>
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
  </main>
</template>

<script setup lang="ts">
import { computed, ref, onMounted } from 'vue';
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
  NAlert,
  NCheckbox,
  NInput,
  NInputNumber,
  NButton
} from 'naive-ui';
import type { ProcessorConfig } from '@clipboard-processor/core';
import { allProcessors } from '@clipboard-processor/core';

type TranslationApiType = 'general' | 'large-model' | 'domain' | 'image';

type ProcessorOption = {
  id: string;
  name: string;
  description: string;
  isActive: boolean;
  priority: number;
};

const LARGE_MODEL_ENDPOINT = 'https://fanyi-api.baidu.com/ait/api/aiTextTranslate';

const exclusiveProcessorGroups = [
  {
    ids: ['delete-duplicate-newlines', 'delete-all-newlines'],
    preferredId: 'delete-duplicate-newlines'
  },
  {
    ids: ['remove-spaces-between-chinese', 'keep-english-word-spaces', 'delete-duplicate-spaces'],
    preferredId: 'keep-english-word-spaces'
  }
];

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
    defaultTargetLang: 'zh',
    autoTranslate: true,
    cacheEnabled: true,
    quotaBaseline: 0
  },
  ui: {
    theme: 'auto',
    language: 'zh-CN',
    showNotifications: true,
    autoProcessClipboard: false,
    floatingMenuEnabled: true
  }
});

const processors = ref<ProcessorOption[]>(allProcessors.map(p => ({
  id: p.id,
  name: p.name,
  description: p.description,
  isActive: p.isActive,
  priority: p.priority
})));

const baiduApiConfig = ref({
  appId: '',
  secretKey: '',
  domain: 'academic',
  quotaBaseline: 0,
  largeModelApiKey: '',
  largeModelEndpoint: LARGE_MODEL_ENDPOINT,
  largeModelModel: 'llm',
  largeModelAuthMode: 'api-key' as 'api-key' | 'sign',
  largeModelModelType: 'llm' as 'llm' | 'nmt',
  largeModelReference: '',
  largeModelNeedIntervene: false,
  largeModelTagHandling: false,
  largeModelIgnoreTags: '',
  largeModelRequestMode: 'baidu-translate' as 'baidu-translate' | 'openai-compatible',
  imageEndpoint: '',
  imageCuid: '',
  imageMac: '',
  imageQuotaBaseline: 0
});

const translationApiType = ref<TranslationApiType>('general');

const needsSecretKey = computed(() =>
  translationApiType.value !== 'large-model' || baiduApiConfig.value.largeModelAuthMode === 'sign'
);

const themeOptions = [
  { label: '跟随系统', value: 'auto' },
  { label: '浅色', value: 'light' },
  { label: '深色', value: 'dark' }
];

const languageOptions = [
  { label: '中文', value: 'zh-CN' },
  { label: 'English', value: 'en-US' }
];

const translationSourceLanguageOptions = [
  { label: '检测语言', value: 'auto' },
  { label: '中文', value: 'zh' },
  { label: '英语', value: 'en' },
  { label: '日语', value: 'jp' },
  { label: '韩语', value: 'kor' },
  { label: '法语', value: 'fra' },
  { label: '德语', value: 'de' },
  { label: '俄语', value: 'ru' },
  { label: '繁体中文', value: 'cht' },
  { label: '西班牙语', value: 'spa' },
  { label: '葡萄牙语', value: 'pt' },
  { label: '意大利语', value: 'it' },
  { label: '越南语', value: 'vie' },
  { label: '泰语', value: 'th' }
];

const translationTargetLanguageOptions = translationSourceLanguageOptions.filter(
  option => option.value !== 'auto'
);

const translationApiOptions = [
  { label: '通用文本翻译 API（免费额度 100万字符）', value: 'general' },
  { label: '大模型文本翻译 API（免费额度 100万字符）', value: 'large-model' },
  { label: '领域文本翻译 API（免费额度 50万字符）', value: 'domain' },
  { label: '图片翻译 API（免费额度 1000次）', value: 'image' }
];

const fieldDomainOptions = [
  { label: '学术论文 / academic', value: 'academic' },
  { label: '生物医药 / medicine', value: 'medicine' },
  { label: '金融财经 / finance', value: 'finance' },
  { label: '信息技术 / it', value: 'it' },
  { label: '机械制造 / machinery', value: 'machinery' },
  { label: '电子科技 / electronics', value: 'electronics' },
  { label: '水利机械 / mechanics', value: 'mechanics' },
  { label: '网络文学 / novel', value: 'novel' },
  { label: '新闻资讯 / news', value: 'news' },
  { label: '人文社科 / wiki', value: 'wiki' },
  { label: '航空航天 / aerospace', value: 'aerospace' },
  { label: '法律法规 / law', value: 'law' },
  { label: '合同 / contract', value: 'contract' }
];

const largeModelAuthModeOptions = [
  { label: 'API Key 鉴权（推荐）', value: 'api-key' },
  { label: 'Sign 鉴权', value: 'sign' }
];

const largeModelModelTypeOptions = [
  { label: '大模型翻译 / llm', value: 'llm' },
  { label: '机器翻译 / nmt', value: 'nmt' }
];

const engineOptions = [
  { label: '百度翻译', value: 'baidu' },
  { label: '谷歌翻译（未实现）', value: 'google' },
  { label: 'DeepL（未实现）', value: 'deepl' }
];

onMounted(() => {
  loadConfig();
});

async function loadConfig() {
  const response = await chrome.runtime.sendMessage({ type: 'GET_CONFIG' });
  if (!response?.config) {
    return;
  }

  config.value = normalizeConfig(response.config);
  loadBaiduConfig(config.value);
  applyConfigToProcessors();
}

function saveConfig() {
  syncProcessorConfig();
  syncBaiduApiConfig();
  chrome.runtime.sendMessage({
    type: 'SAVE_CONFIG',
    config: config.value
  });
  alert('设置已保存');
}

function resetConfig() {
  if (!confirm('确定要重置为默认设置吗？')) {
    return;
  }

  config.value = normalizeConfig({
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
      defaultTargetLang: 'zh',
      autoTranslate: true,
      cacheEnabled: true,
      quotaBaseline: 0
    },
    ui: {
      theme: 'auto',
      language: 'zh-CN',
      showNotifications: true,
      autoProcessClipboard: false,
      floatingMenuEnabled: true
    }
  });
  processors.value = allProcessors.map(p => ({
    id: p.id,
    name: p.name,
    description: p.description,
    isActive: p.isActive,
    priority: p.priority
  }));
  loadBaiduConfig(config.value);
  normalizeExclusiveProcessors();
}

function normalizeConfig(rawConfig: ProcessorConfig): ProcessorConfig {
  return {
    ...rawConfig,
    translation: {
      ...rawConfig.translation,
      autoTranslate: rawConfig.translation.autoTranslate ?? true,
      cacheEnabled: rawConfig.translation.cacheEnabled ?? true,
      quotaBaseline: rawConfig.translation.quotaBaseline ?? 0
    }
  };
}

function loadBaiduConfig(currentConfig: ProcessorConfig) {
  const baidu = currentConfig.translation.apiKeys.baidu;
  baiduApiConfig.value = {
    appId: baidu?.appId || '',
    secretKey: baidu?.secretKey || '',
    domain: baidu?.domain || 'academic',
    quotaBaseline: Number(baidu?.quotaBaseline ?? currentConfig.translation.quotaBaseline ?? 0),
    largeModelApiKey: baidu?.largeModelApiKey || '',
    largeModelEndpoint: baidu?.largeModelEndpoint || LARGE_MODEL_ENDPOINT,
    largeModelModel: baidu?.largeModelModel || 'llm',
    largeModelAuthMode: baidu?.largeModelAuthMode || 'api-key',
    largeModelModelType: baidu?.largeModelModelType || 'llm',
    largeModelReference: baidu?.largeModelReference || '',
    largeModelNeedIntervene: Boolean(baidu?.largeModelNeedIntervene),
    largeModelTagHandling: Boolean(baidu?.largeModelTagHandling),
    largeModelIgnoreTags: baidu?.largeModelIgnoreTags || '',
    largeModelRequestMode: baidu?.largeModelRequestMode || 'baidu-translate',
    imageEndpoint: baidu?.imageEndpoint || '',
    imageCuid: baidu?.imageCuid || '',
    imageMac: baidu?.imageMac || '',
    imageQuotaBaseline: Number(baidu?.imageQuotaBaseline ?? 0)
  };
  translationApiType.value = baidu?.apiType || 'general';
}

function applyConfigToProcessors() {
  processors.value.forEach(processor => {
    const saved = config.value.processors[processor.id];
    if (saved) {
      processor.isActive = saved.isActive;
      processor.priority = saved.priority;
    }
  });
  normalizeExclusiveProcessors();
}

function syncProcessorConfig() {
  config.value.processors = processors.value.reduce<ProcessorConfig['processors']>((processorConfig, processor) => {
    processorConfig[processor.id] = {
      isActive: processor.isActive,
      priority: processor.priority
    };
    return processorConfig;
  }, {});
}

function syncBaiduApiConfig() {
  config.value.translation.apiKeys = {
    ...config.value.translation.apiKeys,
    baidu: {
      appId: baiduApiConfig.value.appId.trim(),
      secretKey: baiduApiConfig.value.secretKey.trim(),
      apiType: translationApiType.value,
      domain: baiduApiConfig.value.domain,
      quotaBaseline: baiduApiConfig.value.quotaBaseline,
      largeModelApiKey: baiduApiConfig.value.largeModelApiKey.trim(),
      largeModelEndpoint: (baiduApiConfig.value.largeModelEndpoint || LARGE_MODEL_ENDPOINT).trim(),
      largeModelModel: baiduApiConfig.value.largeModelModel.trim(),
      largeModelAuthMode: baiduApiConfig.value.largeModelAuthMode,
      largeModelModelType: baiduApiConfig.value.largeModelModelType,
      largeModelReference: baiduApiConfig.value.largeModelReference.trim(),
      largeModelNeedIntervene: baiduApiConfig.value.largeModelNeedIntervene,
      largeModelTagHandling: baiduApiConfig.value.largeModelTagHandling,
      largeModelIgnoreTags: baiduApiConfig.value.largeModelIgnoreTags.trim(),
      largeModelRequestMode: baiduApiConfig.value.largeModelRequestMode,
      imageEndpoint: baiduApiConfig.value.imageEndpoint.trim(),
      imageCuid: baiduApiConfig.value.imageCuid.trim(),
      imageMac: baiduApiConfig.value.imageMac.trim(),
      imageQuotaBaseline: baiduApiConfig.value.imageQuotaBaseline
    }
  };

  config.value.translation.quotaBaseline = baiduApiConfig.value.quotaBaseline;

  if (config.value.translation.defaultTargetLang === 'auto') {
    config.value.translation.defaultTargetLang = 'zh';
  }
}

function normalizeExclusiveProcessors() {
  exclusiveProcessorGroups.forEach(group => {
    const activeProcessors = processors.value.filter(processor =>
      group.ids.includes(processor.id) && processor.isActive
    );
    if (activeProcessors.length <= 1) return;

    const preferredActiveProcessor = activeProcessors.find(processor => processor.id === group.preferredId);
    const processorIdToKeep = preferredActiveProcessor?.id ?? activeProcessors[0].id;
    processors.value.forEach(processor => {
      if (group.ids.includes(processor.id) && processor.id !== processorIdToKeep) {
        processor.isActive = false;
      }
    });
  });
}

function onProcessorToggle(processor: ProcessorOption, checked: boolean) {
  processor.isActive = checked;

  const exclusiveGroup = exclusiveProcessorGroups.find(group => group.ids.includes(processor.id));
  if (!checked || !exclusiveGroup) return;

  processors.value.forEach(otherProcessor => {
    if (exclusiveGroup.ids.includes(otherProcessor.id) && otherProcessor.id !== processor.id) {
      otherProcessor.isActive = false;
    }
  });
}

function exportConfig() {
  syncProcessorConfig();
  syncBaiduApiConfig();
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
  input.onchange = (event) => {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (!file) {
      return;
    }

    const reader = new FileReader();
    reader.onload = (loadEvent) => {
      try {
        const imported = JSON.parse(loadEvent.target?.result as string);
        config.value = normalizeConfig(imported);
        loadBaiduConfig(config.value);
        applyConfigToProcessors();
        alert('配置已导入');
      } catch {
        alert('配置文件格式错误');
      }
    };
    reader.readAsText(file);
  };
  input.click();
}
</script>

<style scoped>
.options-container {
  max-width: 900px;
  margin: 0 auto;
  padding: 20px;
}

.section-tip {
  margin-bottom: 12px;
}

.actions {
  margin-top: 20px;
  display: flex;
  gap: 10px;
}
</style>
