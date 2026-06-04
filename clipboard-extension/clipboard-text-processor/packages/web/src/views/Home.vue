<template>
  <div class="home">
    <n-card title="欢迎使用 Clipboard Text Processor">
      <n-text>
        强大的文本处理工具，自动清理和转换剪切板文字
      </n-text>

      <n-space vertical>
        <n-button type="primary" @click="goToProcessor">
          开始处理文本
        </n-button>
        <n-button @click="goToSettings">
          设置
        </n-button>
        <n-button @click="goToHistory">
          历史记录
        </n-button>
      </n-space>
    </n-card>
  </div>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router';
import { NCard, NText, NButton, NSpace } from 'naive-ui';

const router = useRouter();

function goToProcessor() {
  router.push('/processor');
}

function goToSettings() {
  router.push('/settings');
}

function goToHistory() {
  router.push('/history');
}
</script>

<style scoped>
.home {
  max-width: 600px;
  margin: 0 auto;
  padding: 20px;
}
</style>
