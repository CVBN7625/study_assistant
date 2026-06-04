import { createRouter, createWebHistory } from 'vue-router';

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/',
      name: 'Home',
      component: () => import('@/views/Home.vue')
    },
    {
      path: '/processor',
      name: 'Processor',
      component: () => import('@/views/TextProcessor.vue')
    },
    {
      path: '/settings',
      name: 'Settings',
      component: () => import('@/views/Settings.vue')
    },
    {
      path: '/history',
      name: 'History',
      component: () => import('@/views/History.vue')
    },
    {
      path: '/custom-rules',
      name: 'CustomRules',
      component: () => import('@/views/CustomRules.vue')
    }
  ]
});

export default router;
