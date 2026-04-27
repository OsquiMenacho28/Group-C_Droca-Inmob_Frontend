import { createApp } from 'vue';
import { createPinia } from 'pinia';
import './style.css';
import App from './App.vue';
import { router } from './router';
import 'flowbite';
import i18n from '@/locales/i18n';
import { setGlobalZodErrorMap } from '@/utils/zodErrorMap';

const app = createApp(App);
const pinia = createPinia();

setGlobalZodErrorMap();

app.use(pinia).use(router).use(i18n).mount('#app');
