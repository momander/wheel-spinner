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
import WheelConfig from '../WheelConfig.js';
import * as Util from '../Util.js';
import * as ImageUtil from '../ImageUtil.js';
import * as ServerFunctions from '../ServerFunctions.js';

export default {
  state: {
    wheelConfig: new WheelConfig(),
    sheetLinked: false,
    wheelIsBusy: false,
    winners: [],
    path: '',
    copyable: false
  },
  getters: {
    wheelType: state => state.wheelConfig.type,
    entries: state => state.wheelConfig.entries,
    entryCount: state => state.wheelConfig.entries.length,
    winners: state => state.winners,
    winnerCount: state => state.winners.length,
    wheelConfig: state => state.wheelConfig,
    sheetLinked: state => state.sheetLinked,
    wheelIsBusy: state => state.wheelIsBusy,
    wheelIsShared: state => !!state.path,
    wheelIsCopyable: state => state.copyable,
    wheelIsAdvanced: state => state.wheelConfig.isAdvanced,
    wheelTitle: state => state.wheelConfig.title,
  },
  mutations: {
    setWheelConfig(state, newWheelConfig) {
      const wheelConfig = new WheelConfig();
      wheelConfig.loadValues(newWheelConfig);
      wheelConfig.entries = Util.addIdsIfNotThere(wheelConfig.entries);
      state.wheelConfig = wheelConfig;
      if (!state.path) saveWheelToLocalStorage(state.wheelConfig);
    },
    setGrayEmptyWheel(state) {
      const clone = state.wheelConfig.clone();
      clone.entries = Util.addIdsIfNotThere([{test: ' '}]);
      clone.title = '';
      clone.setColorValues(['#bbb']);
      state.wheelConfig = clone;
    },
    setWheelTitle(state, title) {
      const clone = state.wheelConfig.clone();
      clone.title = title;
      state.wheelConfig = clone;
      if (!state.path) saveWheelToLocalStorage(state.wheelConfig);
    },
    setWheelDescription(state, description) {
      const clone = state.wheelConfig.clone();
      clone.description = description;
      state.wheelConfig = clone;
      if (!state.path) saveWheelToLocalStorage(state.wheelConfig);
    },
    setShowTitle(state, newValue) {
      state.wheelConfig.showTitle = newValue;
      if (!state.path) saveWheelToLocalStorage(state.wheelConfig);
    },
    setEntries(state, entries) {
      state.wheelConfig.entries = Util.addIdsIfNotThere(entries);
      if (!state.path) saveWheelToLocalStorage(state.wheelConfig);
    },
    shuffleEntries(state) {
      state.wheelConfig.entries = Util.shuffleArray(state.wheelConfig.entries);
      if (!state.path) saveWheelToLocalStorage(state.wheelConfig);
    },
    sortEntries(state) {
      state.wheelConfig.entries = Util.sortWheelEntries(state.wheelConfig.entries);
      if (!state.path) saveWheelToLocalStorage(state.wheelConfig);
    },
    appendEntry(state, entry) {
      const newEntries = state.wheelConfig.entries.slice(0);
      newEntries.push(entry);
      state.wheelConfig.entries = Util.addIdsIfNotThere(newEntries);
      if (!state.path) saveWheelToLocalStorage(state.wheelConfig);
    },
    setEntryText(state, {index, text}) {
      const newEntries = state.wheelConfig.entries.slice(0);
      newEntries[index].text = text;
      state.wheelConfig.entries = Util.addIdsIfNotThere(newEntries);
      if (!state.path) saveWheelToLocalStorage(state.wheelConfig);
    },
    setEntryColor(state, {index, color}) {
      const newEntries = state.wheelConfig.entries.slice(0);
      newEntries[index].color = color;
      state.wheelConfig.entries = Util.addIdsIfNotThere(newEntries);
      if (!state.path) saveWheelToLocalStorage(state.wheelConfig);
    },
    setEntrySound(state, {index, sound}) {
      const newEntries = state.wheelConfig.entries.slice(0);
      if (sound) {
        newEntries[index].sound = sound;
      }
      else {
        delete newEntries[index].sound;
      }
      state.wheelConfig.entries = Util.addIdsIfNotThere(newEntries);
      if (!state.path) saveWheelToLocalStorage(state.wheelConfig);
    },
    setEntryMessage(state, {index, message}) {
      const newEntries = state.wheelConfig.entries.slice(0);
      if (message) {
        newEntries[index].message = message;
      }
      else {
        delete newEntries[index].message;
      }
      state.wheelConfig.entries = Util.addIdsIfNotThere(newEntries);
      if (!state.path) saveWheelToLocalStorage(state.wheelConfig);
    },
    setEntryWeight(state, {index, weight}) {
      const newEntries = state.wheelConfig.entries.slice(0);
      newEntries[index].weight = weight;
      state.wheelConfig.entries = Util.addIdsIfNotThere(newEntries);
      if (!state.path) saveWheelToLocalStorage(state.wheelConfig);
    },
    refreshEntries(state) {
      const newEntries = state.wheelConfig.entries.slice(0);
      state.wheelConfig.entries = Util.addIdsIfNotThere(newEntries);
      if (!state.path) saveWheelToLocalStorage(state.wheelConfig);
    },
    setTextEntries(state, texts) {
      const newEntries = texts.map(t => { return {text: t} });
      state.wheelConfig.entries = Util.addIdsIfNotThere(newEntries);
      if (!state.path) saveWheelToLocalStorage(state.wheelConfig);
    },
    appendTextEntries(state, texts) {
      const newEntries = state.wheelConfig.entries.concat(
        texts.map(t => { return {text: t} })
      );
      state.wheelConfig.entries = Util.addIdsIfNotThere(newEntries);
      if (!state.path) saveWheelToLocalStorage(state.wheelConfig);
    },
    removeEntryByIndex(state, index) {
      const newEntries = state.wheelConfig.entries.slice(0);
      newEntries.splice(index, 1);
      state.wheelConfig.entries = newEntries;
      state.sheetLinked = false;
      if (!state.path) saveWheelToLocalStorage(state.wheelConfig);
    },
    removeEntry(state, entry) {
      const newEntries = state.wheelConfig.entries.slice(0);
      newEntries.splice(newEntries.findIndex(e => e.id==entry.id), 1);
      state.wheelConfig.entries = newEntries;
      state.sheetLinked = false;
      if (!state.path) saveWheelToLocalStorage(state.wheelConfig);
    },
    removeEntryAll(state, entry) {
      state.wheelConfig.entries = state.wheelConfig.entries.filter(e => {
        if (e.text) {
          return (e.text.trim() != entry.text.trim());
        }
        else {
          return true;
        }
      })
      state.sheetLinked = false;
      if (!state.path) saveWheelToLocalStorage(state.wheelConfig);
    },
    hideEntry(state, entry) {
      entry.enabled = false;
      const newEntries = state.wheelConfig.entries.slice(0);
      state.wheelConfig.entries = newEntries;
      if (!state.path) saveWheelToLocalStorage(state.wheelConfig);
    },
    moveEntry(state, {index, direction}) {
      const newEntries = state.wheelConfig.entries.slice(0);
      const temp = newEntries[index];
      newEntries[index] = newEntries[index + direction];
      newEntries[index + direction] = temp;
      state.wheelConfig.entries = Util.addIdsIfNotThere(newEntries);
      if (!state.path) saveWheelToLocalStorage(state.wheelConfig);
    },
    duplicateEntry(state, index) {
      const sourceEntry = state.wheelConfig.entries[index];
      const newEntry = Object.assign({}, sourceEntry);
      const newEntries = state.wheelConfig.entries.slice(0);
      newEntries.splice(index+1, 0, newEntry);
      state.wheelConfig.entries = Util.addIdsIfNotThere(newEntries);
      if (!state.path) saveWheelToLocalStorage(state.wheelConfig);
    },
    removeImageFromEntry(state, index) {
      const newEntries = state.wheelConfig.entries.slice(0);
      delete newEntries[index].image;
      state.wheelConfig.entries = newEntries;
      if (!state.path) saveWheelToLocalStorage(state.wheelConfig);
    },
    setWheelBusy(state, busy) {
      state.wheelIsBusy = busy;
    },
    linkSheet(state) {
      state.sheetLinked = true;
    },
    unlinkSheet(state) {
      state.sheetLinked = false;
    },
    setPath(state, path) {
      state.path = path;
    },
    setUnshared(state) {
      state.path = '';
      saveWheelToLocalStorage(state.wheelConfig);
    },
    setCopyable(state, {copyable, editable}) {
      if (typeof editable != 'undefined') {
        state.copyable = editable;
      }
      if (typeof copyable != 'undefined') {
        state.copyable = copyable;
      }
    },
    addWinner(state, winner) {
      const newWinners = state.winners.slice(0);
      newWinners.push(winner);
      state.winners = newWinners;
    },
    sortWinners(state) {
      state.winners = Util.sortWheelEntries(state.winners);
    },
    clearWinners(state) {
      state.winners = [];
    },
    setVolumes(state, {duringSpinSoundVolume, afterSpinSoundVolume}) {
      state.wheelConfig.duringSpinSoundVolume = duringSpinSoundVolume;
      state.wheelConfig.afterSpinSoundVolume = afterSpinSoundVolume;
    },
  },
  actions: {
    async loadInitialWheel(context, sharedWheelPath) {
      const winnerMessage = context.state.$t('common.We have a winner!');
      if (sharedWheelPath) {
        context.commit('setPath', sharedWheelPath);
        context.commit('setGrayEmptyWheel');
        const result = await ServerFunctions.getSharedWheel(sharedWheelPath);
        if (!result.wheelConfig) {
          context.commit('setWheelConfig', new WheelConfig(winnerMessage));
          context.commit('setUnshared');
          throw `Wheel "${sharedWheelPath}" not found!`
        }
        else {
          context.commit('setCopyable', {copyable: result.copyable, editable: result.editable});
          ServerFunctions.logSharedWheelRead(result.wheelConfig.path);
          const wheelConfig = new WheelConfig(winnerMessage);
          wheelConfig.loadValues(result.wheelConfig);
          context.commit('setWheelConfig', wheelConfig);
        }
      }
      else {
        const wheelConfig = new WheelConfig(winnerMessage);
        wheelConfig.loadJson(localStorage.getItem('LastWheelConfig'));
        context.commit('setWheelConfig', wheelConfig);
      }
    },
    resetWheel(context) {
      const wheelConfig = new WheelConfig(context.state.$t('common.We have a winner!'));
      context.commit('setWheelConfig', wheelConfig);
      context.commit('clearWinners');
    },
    async fetchSocialMediaUsers(context, searchTerm) {
      const users = await ServerFunctions.fetchSocialMediaUsers(searchTerm);
      context.commit('setTextEntries', users);
      context.commit('setWheelTitle', '');
      context.commit('setWheelDescription', '');
    },
    async appendImageEntry(context, imageData) {
      const newEntries = context.state.wheelConfig.entries.slice(0);
      let imageEntry;
      if (context.state.wheelConfig.isAdvanced) {
        let color = '#CCCCCC';
        const image = await ImageUtil.getImageFromData(imageData);
        const transparent = ImageUtil.topLeftIsFullyTransparent(image);
        if (!transparent) {
          color = ImageUtil.getTopLeftColor(image).slice(0, 7);
        }
        imageEntry = {text: '', image: imageData, color: color, weight: 1, enabled: true};
      } else {
        imageEntry = {text: '', image: imageData};
      }
      newEntries.push(imageEntry);
      context.state.wheelConfig.entries = Util.addIdsIfNotThere(newEntries);
      if (!context.state.wheelIsShared) saveWheelToLocalStorage(context.state.wheelConfig);
    },
    async attachImageToEntry(context, {imageData, index}) {
      const newEntries = context.state.wheelConfig.entries.slice(0);
      const image = await ImageUtil.getImageFromData(imageData);
      const transparent = ImageUtil.topLeftIsFullyTransparent(image);
      if (!transparent) {
        const color = ImageUtil.getTopLeftColor(image).slice(0, 7);
        newEntries[index].color = color;
      }
      newEntries[index].image = imageData;
      context.state.wheelConfig.entries = Util.addIdsIfNotThere(newEntries);
      if (!context.state.wheelIsShared) saveWheelToLocalStorage(context.state.wheelConfig);
    },
    async setAdvanced(context, advanced) {
      let clone = context.state.wheelConfig.clone();
      clone.isAdvanced = advanced;
      if (advanced) {
        const colors = clone.getCoalescedColors();
        for (let i=0; i<clone.entries.length; i++) {
          const entry = clone.entries[i];
          if (entry.image) {
            const image = await ImageUtil.getImageFromData(entry.image);
            if (!ImageUtil.topLeftIsFullyTransparent(image)) {
              entry.color = ImageUtil.getTopLeftColor(image).slice(0, 7);
            }
            else {
              entry.color = colors[i % colors.length];
            }
          }
          else {
            entry.color = colors[i % colors.length];
          }
          entry.weight = 1;
          entry.enabled = true;
        }
      }
      else {
        clone.entries.forEach(entry => {
          delete entry.color;
          delete entry.weight;
          delete entry.enabled;
          delete entry.sound;
          delete entry.message;
        });
        clone.entries = clone.entries.filter(entry => entry.text || entry.image);
      }
      context.commit('setWheelConfig', clone);
    }
  }
}

function saveWheelToLocalStorage(wheelConfig) {
  localStorage.setItem('LastWheelConfig', wheelConfig.getJson());
}
