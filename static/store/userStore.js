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
import * as ServerFunctions from '../ServerFunctions.js';
import * as Firebase from '../Firebase.js';

export default {
  state: {
    userPhotoUrl: '',
    userDisplayName: '',
    savedWheels: [],
    sharedWheels: []
  },
  getters: {
    userPhotoUrl: state => state.userPhotoUrl,
    userDisplayName: state => state.userDisplayName,
    savedWheels: state => state.savedWheels,
    sharedWheels: state => state.sharedWheels,
  },
  mutations: {
    setUserPhotoUrl(state, userPhotoUrl) {
      state.userPhotoUrl = userPhotoUrl || '/images/user_profile.png';
    },
    setUserDisplayName(state, userDisplayName) {
      state.userDisplayName = userDisplayName;
    },
    setSavedWheels(state, savedWheels) {
      state.savedWheels = savedWheels;
    },
    setSharedWheels(state, sharedWheels) {
      state.sharedWheels = sharedWheels;
    },
    clearUser(state) {
      state.userPhotoUrl = '';
      state.userDisplayName = '';
      state.savedWheels = [];
      state.sharedWheels = [];
    },
  },
  actions: {
    async userIsLoggedIn({state, commit, rootState}) {
      await Firebase.loadLibraries();
      const loggedIn = await Firebase.userIsLoggedIn();
      if (loggedIn) {
        const user = await Firebase.getLoggedInUser();
        commit('setUserPhotoUrl', user.photoURL);
        commit('setUserDisplayName', user.displayName);  
      }
      return loggedIn;
    },
    async logOut({state, commit, rootState}) {
      Firebase.logOut();
      commit('clearUser');
    },
    async deleteAccount({state, commit, rootState}) {
      const idToken = await Firebase.getUserIdToken();
      await ServerFunctions.deleteAccount(idToken);
      Firebase.logOut();
      commit('clearUser');
    },
    async loginAnonymously(context) {
      await Firebase.logInAnonymously();
    },
    async loginWithUi({state, commit, rootState}, elementName) {
      const anonymousTokenId = await Firebase.getAnonymousTokenId();
      const user = await Firebase.loadAuthUserInterface(elementName);
      commit('setUserPhotoUrl', user.photoURL);
      commit('setUserDisplayName', user.displayName);
      await ServerFunctions.convertAccount(
        anonymousTokenId, await Firebase.getUserIdToken()
      );
    },
    async logInToSheets({state, commit, rootState}, locale) {
      await Firebase.loadLibraries();
      const anonymousTokenId = await Firebase.getAnonymousTokenId();
      const accessToken = await Firebase.logInToSheets(locale);
      const user = await Firebase.getLoggedInUser();
      commit('setUserPhotoUrl', user.photoURL);
      commit('setUserDisplayName', user.displayName);
      await ServerFunctions.convertAccount(
        anonymousTokenId, await Firebase.getUserIdToken()
      );
      return accessToken;
    },
    async logUserActivity() {
      await Firebase.logUserActivity();
    },
    async getUid() {
      return await Firebase.getUid();
    },
    async loadSavedWheels(context) {
      const wheels = await Firebase.getWheels();
      context.commit('setSavedWheels', wheels);
      Firebase.logUserActivity();
    },
    async logWheelRead(context, wheelTitle) {
      await Firebase.logWheelRead(wheelTitle);
    },
    async deleteSavedWheel(context, wheelTitle) {
      await Firebase.deleteSavedWheel(wheelTitle);
    },
    async saveWheel(context, wheelConfig) {
      await Firebase.saveWheel(wheelConfig.getValues());
    },
    async loadSharedWheels(context) {
      const idToken = await Firebase.getUserIdToken();
      const wheels = await ServerFunctions.getSharedWheels(idToken);
      context.commit('setSharedWheels', wheels);
      Firebase.logUserActivity();
    },
    async shareWheel(context, {wheelConfig, copyableWheel}) {
      const idToken = await Firebase.getUserIdToken();
      return await ServerFunctions.createSharedWheel(
        copyableWheel, wheelConfig, idToken
      );
    },
    async deleteSharedWheel(context, path) {
      const idToken = await Firebase.getUserIdToken();
      const wheels = await ServerFunctions.deleteSharedWheel(idToken, path);
      context.commit('setSharedWheels', wheels);
    }
  }
}
