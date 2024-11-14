import { createRouter, createWebHistory } from 'vue-router'
import { store } from 'vuex'
import HomeView from '../views/HomeView.vue'
import TestView from '@/views/TestView.vue'

const routes = [
  {
    path: '/',
    name: 'home',
    component: HomeView
  },
  {
    path: '/test',
    name: 'test',
    component: TestView
  }
]

const router = createRouter({
  history: createWebHistory(process.env.BASE_URL),
  routes
})

router.beforeEach((to, from, next) => {
  if (to.meta.requiresAuth && !store.state.isAuthenticated) {
    next({ name: 'Login' });
  } else {
    next();
  }
});

export default router
