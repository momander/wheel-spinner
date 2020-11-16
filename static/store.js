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
import Vuex from 'vuex'
Vue.use(Vuex);
import WheelConfig from './WheelConfig.js';
import Preferences from './Preferences.js';
import * as Util from './Util.js';

export default new Vuex.Store({
  state: {
    wheelConfig: new WheelConfig(),
    preferences: new Preferences(),
    appStatus: {
      fullScreen: false, online: true, wheelSpinning: false, sheetLinked: false,
      userIsLoggedIn: false, userPhotoUrl: '', userDisplayName: '', userUid: '',
      darkMode: false
    },
    version: '2'
  },
  getters: {
    entryCount: state => {
      return state.wheelConfig.names.length;
    },
    darkMode: state => state.preferences.darkMode
  },
  mutations: {
    setWheelConfig(state, newWheelConfig) {
      state.wheelConfig = newWheelConfig;
    },
    setWheelTitle(state, title) {
      const clone = state.wheelConfig.clone();
      clone.title = title;
      state.wheelConfig = clone;
    },
    setNames(state, names) {
      state.wheelConfig.names = names;
    },
    shuffleNames(state) {
      state.wheelConfig.names = Util.shuffleArray(state.wheelConfig.names);
    },
    sortNames(state) {
      state.wheelConfig.names = Util.sortWheelEntries(state.wheelConfig.names);
    },
    appendNames(state, names) {
      const newNames = state.wheelConfig.names.concat(names);
      state.wheelConfig.names = newNames;
    },
    removeName(state, name) {
      const newNames = state.wheelConfig.names.slice(0);
      newNames.splice(newNames.indexOf(name), 1);
      state.wheelConfig.names = newNames;
      state.appStatus.sheetLinked = false;
    },
    removeNameAll(state, name) {
      state.wheelConfig.names = state.wheelConfig.names.filter(entry => {
        return (entry != name)
      })
      state.appStatus.sheetLinked = false;
    },
    enterFullScreen(state) {
      state.appStatus.fullScreen = true;
    },
    exitFullScreen(state) {
      state.appStatus.fullScreen = false;
    },
    setOnline(state, online) {
      state.appStatus.online = online;
    },
    startWheelSpin(state) {
      state.appStatus.wheelSpinning = true;
    },
    stopWheelSpin(state) {
      state.appStatus.wheelSpinning = false;
    },
    linkSheet(state) {
      state.appStatus.sheetLinked = true;
    },
    unlinkSheet(state) {
      state.appStatus.sheetLinked = false;
    },
    logInUser(state, payload) {
      state.appStatus.userIsLoggedIn = true;
      state.appStatus.userPhotoUrl = payload.photoUrl;
      state.appStatus.userDisplayName = payload.displayName;
      state.appStatus.userUid = payload.uid;
    },
    logOutUser(state) {
      state.appStatus.userIsLoggedIn = false;
      state.appStatus.userPhotoUrl = '';
      state.appStatus.userDisplayName = '';
      state.appStatus.userUid = '';
    },
    setPreferences(state, newPrefs) {
      state.preferences = newPrefs;
    },
    toggleAppInfoVisibility(state) {
      const newPrefs = state.preferences.clone();
      newPrefs.appInfoVisible = !newPrefs.appInfoVisible;
      state.preferences = newPrefs;
    },
    toggleDarkMode(state) {
      const newPrefs = state.preferences.clone();
      newPrefs.darkMode = !newPrefs.darkMode;
      state.preferences = newPrefs;
    },
  }
})
