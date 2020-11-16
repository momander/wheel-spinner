<!--
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
-->
<template>
  <b-navbar type='is-info' style="box-shadow: 0 3px 3px 0 lightgrey">
    <template slot="brand">
      <b-navbar-item style="font-size:24px" href="/">
        {{toolbarBrand}}
      </b-navbar-item>
    </template>
    <template slot="start">
      <b-tag type="is-warning" style="margin-top:1.2em" v-show="!$store.state.appStatus.online">
        {{ $t('toolbar.Offline mode') }}
      </b-tag>
    </template>
    <template slot="end">
      <b-navbar-item v-show="newButtonVisible" href="#" @click="$emit('reset-wheel')">
        <i class="fas fa-file fa-fw"></i>&nbsp;{{ $t('toolbar.New') }}
      </b-navbar-item>
      <b-navbar-item v-show="openButtonVisible" href="#" @click="$emit('open-open-dialog')">
        <i class="fa fa-folder-open fa-fw"></i>&nbsp;{{ $t('common.Open') }}
      </b-navbar-item>
      <b-navbar-item v-show="saveButtonVisible" href="#" @click="$emit('open-save-dialog')">
        <i class="fa fa-save fa-fw"></i>&nbsp;{{ $t('common.Save') }}
      </b-navbar-item>
      <b-navbar-item v-show="shareButtonVisible" href="#" @click="$emit('open-share-dialog')">
        <i class="fa fa-share-alt fa-fw"></i>&nbsp;{{ $t('toolbar.Share') }}
      </b-navbar-item>
      <b-navbar-item v-show="optionsButtonVisible" href="#" @click="$emit('open-customize-dialog')">
        <i class="fas fa-palette fa-fw"></i>&nbsp;{{ $t('common.Customize') }}
      </b-navbar-item>
      <b-navbar-item v-if="!browserIsIEOrOldEdge" v-show="optionsButtonVisible" href="#" @click="toggleDarkMode()">
        <i class="fas fa-moon"></i>&nbsp;{{ $t('toolbar.Dark mode') }}
      </b-navbar-item>
      <b-navbar-item v-show="fullscreenButtonVisible" href="#" @click="$store.commit('enterFullScreen')">
        <i class="fa fa-expand fa-fw"></i>&nbsp;{{ $t('toolbar.Fullscreen') }}
      </b-navbar-item>
      <b-navbar-item v-show="exitFullscreenButtonVisible" href="#" @click="$store.commit('exitFullScreen')">
        <i class="fa fa-compress fa-fw"></i>&nbsp;{{ $t('toolbar.Exit fullscreen') }}
      </b-navbar-item>
      <b-navbar-item v-show="unlinkSheetButtonVisible" href="#" @click="$store.commit('unlinkSheet')">
        <i class="fa fa-unlink fa-fw"></i>&nbsp;{{ $t('toolbar.Unlink Google Spreadsheet') }}
      </b-navbar-item>
      <b-navbar-dropdown v-show="moreVisible" :label="$t('toolbar.More')" :right="true">
        <b-navbar-item href="#" v-show="importVisible" @click="$emit('open-twitter-dialog')">
          <i class="fab fa-twitter fa-fw"></i>&nbsp;{{ $t('common.Import Twitter users') }}
        </b-navbar-item>
        <b-navbar-item href="#" v-show="importVisible" @click="$emit('open-sheet-dialog')">
          <i class="fa fa-link fa-fw"></i>&nbsp;{{ $t('common.Link Google Spreadsheet') }}
        </b-navbar-item>
      </b-navbar-dropdown>
      <b-navbar-dropdown v-if="$mq=='mobile'" :label="$t('toolbar.Language')">
        <b-navbar-item href="#" v-for="locale in locales" :key="locale.name"
          @click="$emit('set-locale', locale.name)">
            {{ locale.humanName }}
        </b-navbar-item>
      </b-navbar-dropdown>
      <b-navbar-item v-if="$mq!='mobile'" v-show="languageVisible" tag="div" href="#">
        <b-select v-model="locale">
          <option
            v-for="locale in locales"
            :value="locale.name"
            :key="locale.name">
            {{ locale.humanName }}
          </option>
        </b-select>
      </b-navbar-item>
    </template>
  </b-navbar>
</template>

<script>
  import * as Util from './Util.js';
  import * as Locales from './Locales.js';

  export default {
    data() {
      return {
        toolbarBrand: window.location.host,
        browserIsIEOrOldEdge: Util.browserIsIEOrOldEdge(navigator.userAgent),
        locale: this.$i18n.locale, locales: Locales.getNamesForAll()
      };
    },
    computed: {
      newButtonVisible: function() {
        const appStatus = this.$store.state.appStatus;
        return (!appStatus.fullScreen && !appStatus.sheetLinked && !appStatus.wheelSpinning);
      },
      openButtonVisible: function() {
        const appStatus = this.$store.state.appStatus;
        return !appStatus.fullScreen && !appStatus.sheetLinked && !appStatus.wheelSpinning;
      },
      saveButtonVisible: function() {
        const appStatus = this.$store.state.appStatus;
        return appStatus.online && !appStatus.fullScreen && !appStatus.wheelSpinning;
      },
      shareButtonVisible: function() {
        const appStatus = this.$store.state.appStatus;
        return appStatus.online && !appStatus.fullScreen && !appStatus.wheelSpinning;
      },
      optionsButtonVisible: function() {
        const appStatus = this.$store.state.appStatus;
        return !this.$store.state.appStatus.fullScreen && !appStatus.wheelSpinning;
      },
      fullscreenButtonVisible: function() {
        const appStatus = this.$store.state.appStatus;
        return !appStatus.fullScreen && !appStatus.wheelSpinning;
      },
      exitFullscreenButtonVisible: function() {
        return this.$store.state.appStatus.fullScreen;
      },
      moreVisible: function() {
        const appStatus = this.$store.state.appStatus;
        return appStatus.online && !appStatus.fullScreen &&
               !appStatus.wheelSpinning;
      },
      importVisible: function() {
        const appStatus = this.$store.state.appStatus;
        return appStatus.online && !appStatus.fullScreen &&
               !appStatus.sheetLinked && !appStatus.wheelSpinning;
      },
      unlinkSheetButtonVisible: function() {
        const appStatus = this.$store.state.appStatus;
        return appStatus.sheetLinked && !appStatus.fullScreen && !appStatus.wheelSpinning;
      },
      languageVisible: function() {
        const appStatus = this.$store.state.appStatus;
        return appStatus.online && !appStatus.fullScreen && !appStatus.wheelSpinning;
      },
      faqbuttonVisible: function() {
        const appStatus = this.$store.state.appStatus;
        return !appStatus.fullScreen && !appStatus.wheelSpinning;
      },
    },
    watch: {
      locale(newValue) {
        this.$emit('set-locale', newValue);
      }
    },
    methods: {
      toggleDarkMode() {
        Util.trackEvent('Wheel', 'ToggleDarkMode', '');
        this.$store.commit('toggleDarkMode');
      }
    }
  }
</script>
