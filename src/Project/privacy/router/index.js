import { createRouter, createWebHistory } from 'vue-router'
const router = createRouter({
  history: createWebHistory(), // hash模式：createWebHashHistory，history模式：createWebHistory
  routes: [
    {
      path: '/',
      name: 'privacy',
      component: () => import('@Project/privacy/views/index.vue'),
      meta: { title: '隐私协议' }
    }
  ]
})

router.afterEach((to, from, next) => {
  //遍历meta改变title
  if (to.meta.title) {
    document.title = to.meta.title
  }
  window.scrollTo(0, 0)
})
export default router
