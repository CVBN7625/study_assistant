<template>
  <n-config-provider :theme-overrides="themeOverrides">
    <n-layout has-sider style="height: 100vh">
      <!-- 左侧边栏 -->
      <n-layout-sider
        bordered
        content-style="padding: 20px 16px;"
        :native-scrollbar="false"
        width="240px"
        :style="{ background: '#f5f0e8' }"
      >
        <div class="logo">
          <h2>📋 Clipboard Text Processor</h2>
          <p class="subtitle">智能文本处理器</p>
        </div>

        <n-menu
          v-model:value="currentRoute"
          :options="menuOptions"
          @update:value="handleMenuClick"
          :indent="24"
        />
      </n-layout-sider>

      <!-- 主内容区 -->
      <n-layout-content
        content-style="padding: 24px;"
        :style="{ background: '#faf8f5' }"
      >
        <router-view />
      </n-layout-content>
    </n-layout>
  </n-config-provider>
</template>

<script setup lang="ts">
import { computed, h } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import {
  NConfigProvider,
  NLayout,
  NLayoutSider,
  NLayoutContent,
  NMenu,
  NIcon,
  type GlobalThemeOverrides
} from 'naive-ui';

const router = useRouter();
const route = useRoute();

const currentRoute = computed(() => route.path);

// 米黄色简洁风格主题覆盖
const themeOverrides: GlobalThemeOverrides = {
  common: {
    primaryColor: '#c4956a',
    primaryColorHover: '#d4a57a',
    primaryColorPressed: '#b48a5a',
    primaryColorSuppl: '#c4956a',
    infoColor: '#8b7355',
    successColor: '#6b8e4e',
    warningColor: '#c4956a',
    errorColor: '#c75450',
    textColorBase: '#3d3229',
    textColor1: '#3d3229',
    textColor2: '#5a4d3f',
    textColor3: '#8b7e6f',
    dividerColor: '#e8dfd4',
    borderColor: '#e0d5c8',
    inputColor: '#ffffff',
    inputColorDisabled: '#f5f0e8',
    bodyColor: '#faf8f5',
    cardColor: '#ffffff',
    modalColor: '#ffffff',
    popoverColor: '#ffffff',
    tableColor: '#ffffff',
    tableColorHover: '#f5f0e8',
    hoverColor: '#f5f0e8',
    pressedColor: '#efe8dd',
  },
  Card: {
    borderColor: '#e0d5c8',
    borderRadius: '12px',
  },
  Button: {
    borderRadiusMedium: '8px',
    borderRadiusSmall: '6px',
    fontWeight: '500',
  },
  Input: {
    borderRadius: '8px',
    borderHover: '#c4956a',
    borderFocus: '#c4956a',
    boxShadowFocus: '0 0 0 2px rgba(196, 149, 106, 0.2)',
  },
  Menu: {
    borderRadius: '8px',
    itemColorActive: '#e8dfd4',
    itemColorActiveHover: '#e0d5c8',
    itemColorHover: '#efe8dd',
    itemTextColorActive: '#3d3229',
    itemTextColorHover: '#3d3229',
    itemIconColorActive: '#c4956a',
    itemIconColorHover: '#c4956a',
  },
  Checkbox: {
    borderRadius: '4px',
    colorChecked: '#c4956a',
    borderChecked: '#c4956a',
  },
};

const menuOptions = [
  {
    label: '文本处理器',
    key: '/processor',
    icon: () => h(NIcon, null, { default: () => '📝' }),
  },
  {
    label: '翻译',
    key: '/translator',
    icon: () => h(NIcon, null, { default: () => '🌐' }),
  },
  {
    label: '设置',
    key: '/settings',
    icon: () => h(NIcon, null, { default: () => '⚙️' }),
  },
  {
    label: '历史记录',
    key: '/history',
    icon: () => h(NIcon, null, { default: () => '📜' }),
  },
  {
    label: '自定义规则',
    key: '/custom-rules',
    icon: () => h(NIcon, null, { default: () => '📐' }),
  },
];

function handleMenuClick(key: string) {
  router.push(key);
}
</script>

<style>
* {
  box-sizing: border-box;
}

body {
  margin: 0;
  padding: 0;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'PingFang SC',
    'Hiragino Sans GB', 'Microsoft YaHei', sans-serif;
  background-color: #faf8f5;
  color: #3d3229;
}

.logo {
  text-align: center;
  margin-bottom: 28px;
  padding-bottom: 20px;
  border-bottom: 1px solid #e0d5c8;
}

.logo h2 {
  margin: 0 0 6px 0;
  font-size: 16px;
  font-weight: 600;
  color: #3d3229;
  letter-spacing: -0.5px;
}

.logo .subtitle {
  margin: 0;
  font-size: 12px;
  color: #8b7e6f;
  font-weight: 400;
}

/* 自定义滚动条样式 */
::-webkit-scrollbar {
  width: 6px;
  height: 6px;
}

::-webkit-scrollbar-track {
  background: #f5f0e8;
  border-radius: 3px;
}

::-webkit-scrollbar-thumb {
  background: #c4b5a0;
  border-radius: 3px;
}

::-webkit-scrollbar-thumb:hover {
  background: #b8a890;
}

/* 优化卡片阴影 */
.n-card {
  box-shadow: 0 1px 3px rgba(61, 50, 41, 0.08),
              0 1px 2px rgba(61, 50, 41, 0.06) !important;
}

.n-card:hover {
  box-shadow: 0 4px 6px rgba(61, 50, 41, 0.1),
              0 2px 4px rgba(61, 50, 41, 0.06) !important;
}
</style>
