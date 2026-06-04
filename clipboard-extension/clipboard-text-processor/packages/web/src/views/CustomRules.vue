# 自定义规则页面
<template>
  <div class="custom-rules">
    <n-card title="自定义规则">
      <n-button type="primary" @click="addRule">添加规则</n-button>

      <n-list>
        <n-list-item v-for="rule in rules" :key="rule.id">
          <n-thing>
            <template #header>
              <n-checkbox v-model:checked="rule.isActive">
                {{ rule.name }}
              </n-checkbox>
            </template>
            <template #description>
              <n-text>{{ rule.description }}</n-text>
            </template>
            <template #footer>
              <n-space>
                <n-button size="small" @click="editRule(rule)">编辑</n-button>
                <n-button size="small" type="error" @click="deleteRule(rule)">删除</n-button>
              </n-space>
            </template>
          </n-thing>
        </n-list-item>
      </n-list>

      <n-empty v-if="rules.length === 0" description="暂无自定义规则" />
    </n-card>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import {
  NCard,
  NButton,
  NList,
  NListItem,
  NThing,
  NCheckbox,
  NText,
  NSpace,
  NEmpty
} from 'naive-ui';
import { CustomRule } from '@clipboard-processor/core';

const rules = ref<CustomRule[]>([]);

function addRule() {
  // TODO: 打开添加规则对话框
  alert('添加规则功能开发中');
}

function editRule(rule: CustomRule) {
  // TODO: 打开编辑规则对话框
  alert('编辑规则功能开发中');
}

function deleteRule(rule: CustomRule) {
  rules.value = rules.value.filter(r => r.id !== rule.id);
}
</script>

<style scoped>
.custom-rules {
  max-width: 800px;
  margin: 0 auto;
  padding: 20px;
}
</style>
