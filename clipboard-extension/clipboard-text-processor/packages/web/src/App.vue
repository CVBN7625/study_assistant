<template>
  <n-config-provider>
    <n-layout>
      <n-layout-header>
        <h1>Clipboard Text Processor</h1>
      </n-layout-header>
      <n-layout-content>
        <router-view />
      </n-layout-content>
    </n-layout>
  </n-config-provider>
</template>

<script setup lang="ts">
import { NConfigProvider, NLayout, NLayoutHeader, NLayoutContent } from 'naive-ui';
</script>

<style>
body {
  margin: 0;
  padding: 0;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
}
</style>
