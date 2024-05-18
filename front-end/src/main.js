import { createApp } from 'vue'
import { createRouter, createWebHistory } from 'vue-router'
import App from './App.vue'
import LandingPage from './components/LandingPage.vue'
import LoginForm from './components/LoginForm.vue'
import Registerpage from './components/Registerpage.vue'
import './assets/main.css'

const router = createRouter({ 
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
  {
    path: '/',
    redirect:'/login'
  },
    {
      path: '/login',
      name: 'LoginForm',
      component: LoginForm
    },
    {
      path: '/register',
      name: 'RegisterForm',
      component: Registerpage
    },
    {
      path: '/landingpage',
      name: 'LandingPage',
      component: LandingPage
    }
  ]
})


createApp(App).use(router).mount('#app');

