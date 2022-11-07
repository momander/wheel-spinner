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
import Vue from 'vue'
import VueI18n from 'vue-i18n'
import * as Locales from './Locales.js';

Vue.use(VueI18n)

export const i18n = new VueI18n({
  locale: 'en',
})

export async function loadLanguage(lang) {
  if (!lang) return;
  const file = Locales.getMessagesFileName(lang);
  const messages = (
    await import(/* webpackChunkName: "locale-[request]" */
                 `./locales/${file}`)
  ).default;
  i18n.setLocaleMessage(lang, messages);
  i18n.locale = lang
}
