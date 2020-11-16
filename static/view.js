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
import VueI18n from 'vue-i18n';
import VueMq from 'vue-mq';
import store from './store.js';
import viewapp from './viewapp.vue';
import * as Locales from './Locales.js';
import * as Util from './Util.js';

import 'buefy/dist/buefy.css';

import './images/favicon.png';
import './images/icon_57.png';
import './images/icon_192.png';
import './images/icon_512.png';
import './images/favicon.ico';
import './images/404_cat.png';
import './images/link.png';

Util.initTracking();

Vue.use(Buefy, {defaultIconPack: 'fas'});
Vue.use(VueMq, {
  breakpoints: {
    mobile: 900,
    desktop: Infinity,
  }
});
Vue.use(VueI18n);

const i18n = new VueI18n({
  locale: Locales.getLocale(window.location.hostname, window.location.pathname)
})

loadLocale(i18n.locale).then(() => {
  new Vue({
    i18n,
    el: '#viewapp',
    template: '<viewapp/>',
    store,
    components: { viewapp }
  })
})

function loadLocale(locale) {
  return new Promise(async (resolve) => {
    const file = Locales.getMessagesFileName(locale);
    const messages = (
      await import(/* webpackChunkName: "locale-[request]" */
                   `./locales/${file}`)
    ).default;
    i18n.setLocaleMessage(locale, messages);
    resolve();
  })
}
