import { createRouter, createWebHistory } from 'vue-router'

const router = createRouter({
  history: createWebHistory(),
  routes: [],
  scrollBehavior(to, from) {
    if (to === from) return
    return { top: 0 }
  },
})

// Home
router.addRoute({
  path: '/',
  name: 'home',
  component: () => import('./view/index.vue'),
})

// Handle Error
router.addRoute({
  path: '/error',
  name: 'error',
  component: () => import('./view/error.vue'),
})

// 404
router.addRoute({
  path: '/:pathMatch(.*)*',
  name: 'not-found',
  component: () => import('./view/404.vue'),
})

export { router }
