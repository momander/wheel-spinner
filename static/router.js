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
import VueRouter from 'vue-router';
import wheelPage from './pages/wheelPage.vue';
const exportPage = () => import(/* webpackChunkName: "exportPage" */'./pages/exportPage.vue');
const faqPage = () => import(/* webpackChunkName: "faqPage" */'./pages/faqPage.vue');
const privacyPolicyPage = () => import(/* webpackChunkName: "privacyPolicyPage" */'./pages/privacyPolicyPage.vue');
const translationsPage = () => import(/* webpackChunkName: "translationsPage" */'./pages/translationsPage.vue');
const wheelReviewPage = () => import(/* webpackChunkName: "wheelReviewPage" */'./pages/wheelReviewPage.vue');
const carouselPage = () => import(/* webpackChunkName: "carouselPage" */'./pages/carouselPage.vue');
const notFoundPage = () => import(/* webpackChunkName: "notFoundPage" */'./pages/notFoundPage.vue');
import * as Firebase from './Firebase.js';
import * as ServerFunctions from './ServerFunctions.js';

Vue.use(VueRouter);

const router = new VueRouter({
  mode: 'history',
  routes: [
    {
      path: '/faq.html',
      component: faqPage
    },
    {
      path: '/faq/:section?',
      component: faqPage
    },
    {
      path: '/:lang([a-z][a-z])?/:sharedWheelPath(\\w\\w\\w\-\\w\\w\\w)?',
      component: wheelPage
    },
    {
      path: '/:lang([a-z][a-z]-[A-Z][A-Z])?/:sharedWheelPath(\\w\\w\\w\-\\w\\w\\w)?',
      component: wheelPage
    },
    {
      // Three-letter lang codes don't work with "?" (optional marker).
      path: '/:lang([a-z][a-z][a-z])',
      component: wheelPage
    },
    {
      // Three-letter lang codes don't work with "?" (optional marker).
      path: '/:lang([a-z][a-z][a-z])/:sharedWheelPath(\\w\\w\\w\-\\w\\w\\w)?',
      component: wheelPage
    },
    {
      path: '/view/:lang([a-z][a-z])?/:sharedWheelPath(\\w\\w\\w\-\\w\\w\\w)',
      component: wheelPage
    },
    {
      path: '/view/:lang([a-z][a-z]-[A-Z][A-Z])?/:sharedWheelPath(\\w\\w\\w\-\\w\\w\\w)',
      component: wheelPage
    },
    {
      // Three-letter lang codes don't work with "?" (optional marker).
      path: '/view/:lang([a-z][a-z][a-z])/:sharedWheelPath(\\w\\w\\w\-\\w\\w\\w)',
      component: wheelPage
    },
    {
      path: '/privacy-policy(.html)?',
      component: privacyPolicyPage
    },
    {
      path: '/export',
      component: exportPage
    },
    {
      path: '/translate(.html)?',
      component: translationsPage
    },
    {
      path: '/admin.html',
      component: wheelReviewPage,
      meta: {adminOnly: true}
    },
    {
      path: '/carousel.html',
      component: carouselPage,
      meta: {adminOnly: true}
    },
    {
      path: '/robots.txt',
      component: wheelPage
    },
    {
      path: '/*',
      component: notFoundPage
    }
  ]
});

router.beforeEach(async(to, from, next) => {
  const adminOnly = to.matched[0].meta.adminOnly;
  if (adminOnly) {
    await Firebase.loadLibraries();
    const idToken = await Firebase.getUserIdToken();
    const userIsAdmin = await ServerFunctions.userIsAdmin(idToken);
    if (userIsAdmin) {
      next();
    }
    else {
      alert('Please log in as an admin user.');
      next(false);
    }
  }
  else {
    next();
  }
});

router.afterEach((to, from) => {
});

export default router;
