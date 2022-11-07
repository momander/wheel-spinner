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
import * as FullScreen from '../FullScreen.js';

export default {
  state: {
    fullScreen: false,
    online: true,
  },
  getters: {
    fullScreen: state => state.fullScreen,
    online: state => state.online,
  },
  mutations: {
    enterFullScreen(state) {
      state.fullScreen = true;
      FullScreen.turnOnFullscreen();
    },
    exitFullScreen(state) {
      state.fullScreen = false;
      FullScreen.turnOffFullscreen();
    },
    fullScreenChanged(state) {
      state.fullScreen = FullScreen.fullscreenOn();
    },
    setOnline(state, online) {
      state.online = online;
    },
  }
}
