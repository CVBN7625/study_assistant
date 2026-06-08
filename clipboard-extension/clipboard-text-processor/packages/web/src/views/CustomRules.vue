<template>
  <div class="custom-rules">
    <!-- 页面标题 -->
    <n-card size="small" class="page-header">
      <n-space justify="space-between" align="center">
        <n-space align="center">
          <n-text strong style="font-size: 18px;">📐 自定义规则</n-text>
          <n-text depth="3" style="font-size: 13px;">创建和管理自定义文本处理规则</n-text>
        </n-space>
        <n-button type="primary" @click="addRule" strong>
          ➕ 添加规则
        </n-button>
      </n-space>
    </n-card>

    <!-- 规则列表 -->
    <n-card class="rules-list-card">
      <n-list v-if="rules.length > 0" bordered>
        <n-list-item v-for="rule in rules" :key="rule.id">
          <n-thing>
            <template #header>
              <n-space align="center" justify="space-between">
                <n-space align="center">
                  <n-checkbox v-model:checked="rule.isActive">
                    <n-text strong>{{ rule.name }}</n-text>
                  </n-checkbox>
                  <n-tag
                    :type="rule.isActive ? 'success' : 'default'"
                    size="small"
                  >
                    {{ rule.isActive ? '已启用' : '已禁用' }}
                  </n-tag>
                </n-space>
                <n-text depth="3" style="font-size: 12px;">
                  创建于 {{ formatDate(rule.createdAt) }}
                </n-text>
              </n-space>
            </template>

            <template #description>
              <n-space vertical>
                <n-text depth="2" style="font-size: 13px; line-height: 1.5;">
                  {{ rule.description }}
                </n-text>
                <n-space size="small">
                  <n-tag size="small" type="info">
                    类型: {{ getRuleTypeLabel(rule.type) }}
                  </n-tag>
                  <n-tag size="small" type="warning">
                    优先级: {{ rule.priority }}
                  </n-tag>
                </n-space>
              </n-space>
            </template>

            <template #footer>
              <n-space justify="end">
                <n-button size="small" quaternary @click="duplicateRule(rule)">
                  📋 复制
                </n-button>
                <n-button size="small" quaternary type="primary" @click="editRule(rule)">
                  ✏️ 编辑
                </n-button>
                <n-button size="small" quaternary type="error" @click="deleteRule(rule)">
                  🗑️ 删除
                </n-button>
              </n-space>
            </template>
          </n-thing>
        </n-list-item>
      </n-list>

      <!-- 空状态 -->
      <n-empty v-else description="暂无自定义规则" style="padding: 60px 0;">
        <template #extra>
          <n-space vertical align="center">
            <n-text depth="3" style="font-size: 13px;">
              创建自定义规则来满足特定的文本处理需求
            </n-text>
            <n-button type="primary" @click="addRule">
              ➕ 创建第一条规则
            </n-button>
          </n-space>
        </template>
      </n-empty>
    </n-card>

    <!-- 使用说明 -->
    <n-card size="small" class="help-card">
      <n-collapse>
        <n-collapse-item title="📖 使用说明" name="help">
          <n-space vertical>
            <n-text strong>规则类型：</n-text>
            <n-list>
              <n-list-item>
                <n-text>• <n-text strong>正则替换</n-text>：使用正则表达式进行文本替换</n-text>
              </n-list-item>
              <n-list-item>
                <n-text>• <n-text strong>文本替换</n-text>：简单的文本查找和替换</n-text>
              </n-list-item>
              <n-list-item>
                <n-text>• <n-text strong>删除匹配</n-text>：删除匹配的文本内容</n-text>
              </n-list-item>
            </n-list>

            <n-divider />

            <n-text strong>优先级说明：</n-text>
            <n-text depth="3" style="font-size: 13px;">
              优先级数字越小，规则越先执行。建议将常用规则设置为较高优先级（较小的数字）。
            </n-text>
          </n-space>
        </n-collapse-item>
      </n-collapse>
    </n-card>

    <!-- 统计信息 -->
    <n-card v-if="rules.length > 0" size="small" class="stats-card">
      <n-space justify="center">
        <n-tag type="info" size="medium">
          📊 总规则: {{ rules.length }} 条
        </n-tag>
        <n-tag type="success" size="medium">
          ✅ 已启用: {{ enabledRulesCount }} 条
        </n-tag>
        <n-tag type="warning" size="medium">
          ⚠️ 已禁用: {{ disabledRulesCount }} 条
        </n-tag>
      </n-space>
    </n-card>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import {
  NCard,
  NButton,
  NList,
  NListItem,
  NThing,
  NCheckbox,
  NText,
  NSpace,
  NEmpty,
  NTag,
  NCollapse,
  NCollapseItem,
  NDivider,
} from 'naive-ui';
import { CustomRule } from '@clipboard-processor/core';

const rules = ref<CustomRule[]>([]);

// 统计信息
const enabledRulesCount = computed(() => rules.value.filter(r => r.isActive).length);
const disabledRulesCount = computed(() => rules.value.filter(r => !r.isActive).length);

function getRuleTypeLabel(type: string): string {
  const labels: Record<string, string> = {
    regex: '正则替换',
    text: '文本替换',
    delete: '删除匹配',
  };
  return labels[type] || type;
}

function formatDate(timestamp: number): string {
  if (!timestamp) return '未知';
  return new Date(timestamp).toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

function addRule() {
  // TODO: 打开添加规则对话框
  alert('添加规则功能开发中');
}

function editRule(rule: CustomRule) {
  // TODO: 打开编辑规则对话框
  alert('编辑规则功能开发中');
}

function duplicateRule(rule: CustomRule) {
  const newRule: CustomRule = {
    ...rule,
    id: `rule-${Date.now()}`,
    name: `${rule.name} (副本)`,
    createdAt: Date.now(),
  };
  rules.value.push(newRule);
}

function deleteRule(rule: CustomRule) {
  if (confirm(`确定要删除规则「${rule.name}」吗？`)) {
    rules.value = rules.value.filter(r => r.id !== rule.id);
  }
}
</script>

<style scoped>
.custom-rules {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.page-header {
  background: linear-gradient(135deg, #f5f0e8 0%, #efe8dd 100%);
  border: 1px solid #e0d5c8;
}

.rules-list-card {
  background: #ffffff;
}

.help-card {
  background: #faf8f5;
  border: 1px solid #e8dfd4;
}

.stats-card {
  background: linear-gradient(135deg, #f5f0e8 0%, #efe8dd 100%);
  border: 1px solid #e0d5c8;
}

:deep(.n-list-item) {
  padding: 16px;
  transition: background-color 0.2s ease;
}

:deep(.n-list-item:hover) {
  background-color: #f5f0e8;
}

:deep(.n-thing-header) {
  margin-bottom: 8px !important;
}

:deep(.n-thing-description) {
  margin-top: 8px;
}

:deep(.n-thing-footer) {
  margin-top: 12px;
  padding-top: 12px;
  border-top: 1px solid #e8dfd4;
}

:deep(.n-tag) {
  font-weight: 500;
}

.n-button:not(.n-button--disabled):hover {
  transform: translateY(-1px);
  transition: transform 0.2s ease;
}

:deep(.n-collapse) {
  border: none;
}

:deep(.n-collapse-item__header) {
  font-weight: 600;
  color: #5a4d3f;
}

:deep(.n-collapse-item__content-inner) {
  padding: 16px 0;
}

:deep(.n-divider) {
  border-color: #e0d5c8;
}
</style>
