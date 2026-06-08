<template>
  <div class="image-translator-page">
    <n-card size="small" class="page-header">
      <n-space align="center" justify="space-between">
        <n-space vertical :size="2">
          <n-text strong style="font-size: 18px;">图片翻译</n-text>
          <n-text depth="3" style="font-size: 13px;">
            使用百度图片翻译 API，对图片文字进行 OCR、翻译和译文回填
          </n-text>
        </n-space>
        <n-tag :type="quotaStats.stopped ? 'error' : 'success'">
          {{ quotaStats.used }} / {{ quotaStats.freeLimit }} 次
        </n-tag>
      </n-space>
    </n-card>

    <n-grid :cols="2" :x-gap="16" responsive="screen">
      <n-gi>
        <n-card title="图片" size="small">
          <div
            class="drop-zone"
            :class="{ 'has-preview': previewUrl }"
            @dragover.prevent
            @drop.prevent="handleDrop"
          >
            <img v-if="previewUrl" :src="previewUrl" alt="待翻译图片预览" />
            <div v-else class="drop-empty">
              <n-text strong>拖入图片或点击选择</n-text>
              <n-text depth="3">JPG、PNG、BMP、WebP，最大 {{ maxSizeLabel }}</n-text>
            </div>
            <input
              class="file-input"
              type="file"
              accept="image/png,image/jpeg,image/bmp,image/webp"
              @change="handleFileChange"
            />
          </div>

          <template #footer>
            <n-space justify="space-between" align="center">
              <n-text depth="3">
                {{ selectedFile ? `${selectedFile.name} · ${formatFileSize(selectedFile.size)}` : '未选择图片' }}
              </n-text>
              <n-space>
                <n-button size="small" @click="clearFile">清空</n-button>
                <n-button
                  type="primary"
                  :loading="isTranslating"
                  :disabled="!canTranslate"
                  @click="translateSelectedImage"
                >
                  翻译图片
                </n-button>
              </n-space>
            </n-space>
          </template>
        </n-card>
      </n-gi>

      <n-gi>
        <n-card title="结果" size="small">
          <n-alert v-if="errorMsg" type="error" closable @close="errorMsg = ''">
            {{ errorMsg }}
          </n-alert>

          <n-empty v-if="!result && !isTranslating" description="翻译结果将显示在这里" />
          <n-spin v-if="isTranslating" class="result-spin" />

          <n-space v-if="result" vertical>
            <n-space align="center">
              <n-tag type="info">{{ result.from }} → {{ result.to }}</n-tag>
              <n-text depth="3">耗时 {{ (result.duration / 1000).toFixed(1) }}s</n-text>
            </n-space>

            <n-form label-placement="top">
              <n-form-item label="识别文本">
                <n-input
                  :value="result.sourceText"
                  type="textarea"
                  :rows="6"
                  readonly
                  placeholder="未返回识别文本"
                />
              </n-form-item>
              <n-form-item label="翻译文本">
                <n-input
                  :value="result.translatedText"
                  type="textarea"
                  :rows="8"
                  readonly
                  placeholder="未返回翻译文本"
                />
              </n-form-item>
            </n-form>

            <n-button size="small" :disabled="!result.translatedText" @click="handleCopyText">
              复制译文
            </n-button>
          </n-space>
        </n-card>
      </n-gi>
    </n-grid>

    <n-card v-if="result?.imageUrl" title="译文回填图" size="small">
      <img class="translated-image" :src="result.imageUrl" alt="译文回填图" />
    </n-card>

    <n-card title="图片翻译设置" size="small">
      <n-form :model="config" label-placement="left" label-width="130">
        <n-grid :cols="2" :x-gap="20" responsive="screen">
          <n-gi>
            <n-form-item label="源语言">
              <n-select v-model:value="sourceLang" :options="sourceLanguageOptions" />
            </n-form-item>
          </n-gi>
          <n-gi>
            <n-form-item label="目标语言">
              <n-select v-model:value="targetLang" :options="targetLanguageOptions" />
            </n-form-item>
          </n-gi>
          <n-gi>
            <n-form-item label="APP ID">
              <n-input
                v-model:value="config.baiduAppId"
                type="password"
                show-password-on="click"
                placeholder="百度翻译 APP ID"
                @blur="handleSaveConfig"
              />
            </n-form-item>
          </n-gi>
          <n-gi>
            <n-form-item label="Secret Key">
              <n-input
                v-model:value="config.baiduSecretKey"
                type="password"
                show-password-on="click"
                placeholder="百度翻译开发者密钥"
                @blur="handleSaveConfig"
              />
            </n-form-item>
          </n-gi>
          <n-gi>
            <n-form-item label="请求地址">
              <n-input
                v-model:value="config.endpoint"
                placeholder="留空使用默认图片翻译端点"
                @blur="handleSaveConfig"
              />
            </n-form-item>
          </n-gi>
          <n-gi>
            <n-form-item label="CUID">
              <n-input
                v-model:value="config.cuid"
                placeholder="留空时自动生成"
                @blur="handleSaveConfig"
              />
            </n-form-item>
          </n-gi>
          <n-gi>
            <n-form-item label="MAC">
              <n-input
                v-model:value="config.mac"
                placeholder="留空时使用默认值"
                @blur="handleSaveConfig"
              />
            </n-form-item>
          </n-gi>
          <n-gi>
            <n-form-item label="译文回填">
              <n-switch v-model:value="config.paste" @update:value="handleSaveConfig" />
            </n-form-item>
          </n-gi>
          <n-gi>
            <n-form-item label="控制台已用">
              <n-input-number
                v-model:value="config.quotaBaseline"
                :min="0"
                :precision="0"
                @update:value="handleSaveConfig"
              />
            </n-form-item>
          </n-gi>
        </n-grid>

        <n-space align="center">
          <n-tag :type="quotaStats.stopped ? 'error' : 'success'">
            本月记录 {{ quotaStats.used }} / {{ quotaStats.freeLimit }} 次
          </n-tag>
          <n-tag type="warning">95% 停止线：{{ quotaStats.stopAt }} 次</n-tag>
          <n-button size="small" @click="handleResetQuota">重置本地图片额度记录</n-button>
        </n-space>
      </n-form>
    </n-card>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import {
  NAlert,
  NButton,
  NCard,
  NEmpty,
  NForm,
  NFormItem,
  NGi,
  NGrid,
  NInput,
  NInputNumber,
  NSelect,
  NSpace,
  NSpin,
  NSwitch,
  NTag,
  NText,
  useMessage
} from 'naive-ui';
import { useImageTranslator } from '../composables/useImageTranslator';
import {
  IMAGE_TRANSLATION_LANGUAGES,
  type ImageTranslationLanguageCode
} from '../services/image-translation-service';

const message = useMessage();

const {
  config,
  sourceLang,
  targetLang,
  selectedFile,
  previewUrl,
  result,
  isTranslating,
  errorMsg,
  quotaStats,
  canTranslate,
  maxSizeLabel,
  updateConfig,
  resetQuotaUsage,
  selectFile,
  clearFile,
  translateSelectedImage,
  copyTranslatedText
} = useImageTranslator();

const sourceLanguageOptions = computed(() =>
  IMAGE_TRANSLATION_LANGUAGES.map(lang => ({
    label: lang.label,
    value: lang.code
  }))
);

const targetLanguageOptions = computed(() =>
  IMAGE_TRANSLATION_LANGUAGES.filter(lang => lang.code !== 'auto').map(lang => ({
    label: lang.label,
    value: lang.code as Exclude<ImageTranslationLanguageCode, 'auto'>
  }))
);

function handleFileChange(event: Event) {
  const file = (event.target as HTMLInputElement).files?.[0] || null;
  selectFile(file);
}

function handleDrop(event: DragEvent) {
  const file = event.dataTransfer?.files?.[0] || null;
  selectFile(file);
}

function handleSaveConfig() {
  updateConfig(config);
}

function handleResetQuota() {
  resetQuotaUsage();
  message.info('图片翻译本地额度记录已重置');
}

async function handleCopyText() {
  const success = await copyTranslatedText();
  if (success) {
    message.success('已复制译文');
  }
}

function formatFileSize(size: number) {
  if (size < 1024) {
    return `${size} B`;
  }

  if (size < 1024 * 1024) {
    return `${(size / 1024).toFixed(1)} KB`;
  }

  return `${(size / 1024 / 1024).toFixed(1)} MB`;
}
</script>

<style scoped>
.image-translator-page {
  display: flex;
  flex-direction: column;
  gap: 16px;
  padding: 16px;
  max-width: 1200px;
  margin: 0 auto;
}

.page-header {
  background: linear-gradient(135deg, #f5f0e8 0%, #faf8f5 100%);
}

.drop-zone {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 360px;
  border: 1px dashed #c4b5a0;
  border-radius: 8px;
  overflow: hidden;
  background: #faf8f5;
}

.drop-zone.has-preview {
  background: #fff;
}

.drop-zone img,
.translated-image {
  width: 100%;
  max-height: 520px;
  object-fit: contain;
  display: block;
}

.drop-empty {
  display: flex;
  flex-direction: column;
  gap: 8px;
  align-items: center;
}

.file-input {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  opacity: 0;
  cursor: pointer;
}

.result-spin {
  display: flex;
  justify-content: center;
  padding: 80px 0;
}

:deep(.n-card) {
  border-radius: 8px;
}
</style>
