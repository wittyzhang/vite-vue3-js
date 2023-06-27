import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import '@/assets/index.scss'
import 'vant/es/toast/style';
// import http from '@/utils/request.js'

const app = createApp(App)
app.use(router).mount('#app')
