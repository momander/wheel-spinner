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
import Vuex from 'vuex';
Vue.use(Vuex);
import { vuexfireMutations } from 'vuexfire';
import { firestoreAction } from 'vuexfire';
import WheelConfig from '../WheelConfig.js';
import Preferences from '../Preferences.js';
import * as Firebase from '../Firebase.js';
import * as ServerFunctions from './ServerFunctions.js';
import * as Util from '../Util.js';

export default new Vuex.Store({
  state: {
    wheel: {},
    wheelConfig: new WheelConfig(),
    preferences: new Preferences(),
    reviewQueueLength: '',
    appStatus: {
      userIsLoggedIn: false, userPhotoUrl: '', userDisplayName: '', userUid: '',
      idToken: ''
    },
    earningsPerReviewDoc: '', admins: [], user: {}
  },
  getters: {
    darkMode: state => state.preferences.darkMode
  },
  mutations: {
    setWheel(state, newWheel) {
      if (!newWheel) return;
      state.wheel = newWheel;
      state.wheel.reviewStatus = state.wheel.reviewStatus || 'Not reviewed';
      const wheelConfig = new WheelConfig();
      wheelConfig.loadValues(newWheel.config);
      state.wheelConfig = wheelConfig;
    },
    clearWheel(state) {
      state.wheel = {};
      state.wheelConfig = new WheelConfig();
    },
    logInUser(state, payload) {
      state.appStatus.userIsLoggedIn = true;
      state.appStatus.userPhotoUrl = payload.photoUrl;
      state.appStatus.userDisplayName = payload.displayName;
      state.appStatus.userUid = payload.uid;
      state.appStatus.idToken = payload.idToken;
    },
    logOutUser(state) {
      state.appStatus.userIsLoggedIn = false;
      state.appStatus.userPhotoUrl = '';
      state.appStatus.userDisplayName = '';
      state.appStatus.userUid = '';
      state.appStatus.idToken = '';
    },
    setNames(state, names) {
      state.wheelConfig.names = names;
    },
    setReviewQueueLength(state, queueLength) {
      state.reviewQueueLength = queueLength;
    },
    decrementQueueLength(state) {
      if (state.reviewQueueLength) state.reviewQueueLength -= 1;
    },
    toggleDarkMode(state) {
      const newPrefs = state.preferences.clone();
      newPrefs.darkMode = !newPrefs.darkMode;
      state.preferences = newPrefs;
    },
    startWheelSpin() {
    },
    stopWheelSpin() {
    },
    ...vuexfireMutations,
  },
  actions: {
    bindFirestore: firestoreAction(
      ({ bindFirestoreRef, unbindFirestoreRef }) => {
        const db = Firebase.getDb();
        bindFirestoreRef(
          'earningsPerReviewDoc',
          db.doc('settings/EARNINGS_PER_REVIEW')
        );
        bindFirestoreRef(
          'admins',
          db.collection('admins').orderBy('name')
        );
      }
    ),
    bindUser: firestoreAction(
      ({ bindFirestoreRef, unbindFirestoreRef }, uid) => {
        const db = Firebase.getDb();
        bindFirestoreRef('user', db.doc(`admins/${uid}`));
      }
    ),
    async resetSessionReviews(context, uid) {
      await Firebase.resetSessionReviews(uid);
    },
    async updateReviewQueueLength(context) {
      const idToken = context.state.appStatus.idToken;
      try {
        const queueLength = await ServerFunctions.getNumberOfWheelsInReviewQueue(idToken);
        context.commit('setReviewQueueLength', queueLength);
      }
      catch (ex) {
        context.commit('setReviewQueueLength', '');
      }
    },
    async loadWheel(context, path) {
      if (!context.state.appStatus.userIsLoggedIn) return;
      const wheel = await Firebase.getSharedWheel(path);
      context.commit('setWheel', wheel);
    },
    async getNextSharedWheelForReview(context) {
      if (!context.state.appStatus.userIsLoggedIn) return;
      const wheel = await Firebase.getNextSharedWheelForReview();
      context.commit('setWheel', wheel);
    },
    async approveWheel(context) {
      if (!context.state.appStatus.userIsLoggedIn) return;
      if (!context.state.wheel) return;
      if (context.state.wheel.reviewStatus=='Approved') return;
      const uid = context.state.appStatus.userUid;
      await Firebase.approveSharedWheel(context.state.wheel.path, uid);
      context.state.wheel.reviewStatus = 'Approved';
      context.commit('decrementQueueLength');
    },
    async deleteWheel(context) {
      if (!context.state.appStatus.userIsLoggedIn) return;
      if (!context.state.wheel) return;
      const newReview = (context.state.wheel.reviewStatus!='Approved');
      await Firebase.deleteSharedWheel(context.state.wheel.path, newReview);
      context.commit('clearWheel')
      if (newReview) context.commit('decrementQueueLength');
    },
    async translateWheel(context) {
      const entries = context.state.wheelConfig.names
                             .map(entry => Util.extractDisplayText(entry));
      const imageEntries = context.state.wheelConfig.names
                          .map(entry => Util.extractImage(entry));
      const idToken = context.state.appStatus.idToken;
      const trEntries = await ServerFunctions.translate(idToken, entries);
      const newEntries = [];
      for (let i=0; i<trEntries.length; i++) {
        let newEntry = trEntries[i].trim();
        if (imageEntries[i]) {
          newEntry += `<img src="${imageEntries[i]}" style="height:25px" style="font-size: 1rem;">`;
        }
        newEntries.push(newEntry)
      }
      context.commit('setNames', newEntries);
    },
    setAdminsReviewsToZero(context, uid) {
      Firebase.setAdminsWheelsToZero(uid);
    },
    addAdmin(context, {uid, name}) {
      Firebase.addAdmin(uid, name);
    },
    deleteAdmin(context, uid) {
      Firebase.deleteAdmin(uid);
    }
  }
})
