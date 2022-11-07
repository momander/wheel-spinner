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
export default {
  state: {
    version: '190',
    appInfoVisible: true,
    darkMode: false,
    latestSeenVersion: 0,
    userHasSeenCurrentVersion: false
  },
  getters: {
    version: state => state.version,
    darkMode: state => state.darkMode,
    appInfoVisible: state => state.appInfoVisible,
    userHasSeenCurrentVersion: state => state.userHasSeenCurrentVersion
  },
  mutations: {
    setDurablePrefs(state, {appInfoVisible, darkMode, latestSeenVersion}) {
      state.appInfoVisible = appInfoVisible;
      state.darkMode = darkMode;
      state.latestSeenVersion = latestSeenVersion;
      savePrefsToLocalStorage(state);
    },
    setLatestSeenVersion(state, latestSeenVersion) {
      state.latestSeenVersion = latestSeenVersion;
      savePrefsToLocalStorage(state);
    },
    setUserHasSeenCurrentVersion(state, userHasSeenCurrentVersion) {
      state.userHasSeenCurrentVersion = userHasSeenCurrentVersion;
    },
    toggleAppInfoVisibility(state) {
      state.appInfoVisible = !state.appInfoVisible;
      savePrefsToLocalStorage(state);
    },
    toggleDarkMode(state) {
      state.darkMode = !state.darkMode;
      savePrefsToLocalStorage(state);
    },
  },
  actions: {
    loadPreferences({state, commit}) {
      try {
        const prefs = JSON.parse(localStorage.getItem('Preferences'));
        commit('setDurablePrefs', {
          appInfoVisible: prefs.appInfoVisible,
          darkMode: prefs.darkMode,
          latestSeenVersion: prefs.latestSeenVersion
        });
      }
      catch {
      };
      const appVersion = state.version;
      commit('setUserHasSeenCurrentVersion', appVersion==state.latestSeenVersion);
      commit('setLatestSeenVersion', appVersion);
    }
  }
}

function savePrefsToLocalStorage(state) {
  const prefs = {
    appInfoVisible: state.appInfoVisible,
    darkMode: state.darkMode,
    latestSeenVersion: state.latestSeenVersion
  };
  localStorage.setItem('Preferences', JSON.stringify(prefs));
}
