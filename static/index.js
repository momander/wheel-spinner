/*
Copyright 2020 Google LLC

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

    https://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
*/
import Vue from 'vue';
import Buefy from 'buefy';
import VueMq from 'vue-mq';
import store from './store/store.js';
import router from './router.js';
import * as i18nSetup from './i18n-setup.js';
import * as Util from './Util.js';

import 'buefy/dist/buefy.css';

import './images/icon_192.png';
import './images/icon_512.png';
import './images/apple-touch-icon.png';
import './images/favicon-16x16.png';
import './images/favicon-32x32.png';
import './images/favicon.ico';
import './images/link.png';
import './images/user_profile.png';

Util.initTracking();
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/service-worker.js');
  });
}

Vue.use(Buefy, {defaultIconPack: 'fas'});
Vue.use(VueMq, {
  breakpoints: {
    mobile: 900,
    desktop: Infinity,
  }
});

const i18n = i18nSetup.i18n;
i18nSetup.loadLanguage('en').then(() => {
  new Vue({
    router,
    i18n,
    store,
  }).$mount('#app')
})
