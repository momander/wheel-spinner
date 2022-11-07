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
      <b-tag type="is-warning" style="margin-top:1.2em" v-show="!online">
        {{ $t('toolbar.Offline mode') }}
      </b-tag>
    </template>
    <template slot="end">
      <b-navbar-item v-show="newButtonVisible" @click="$emit('reset-wheel')">
        <i class="fas fa-file fa-fw"></i>&nbsp;{{ $t('toolbar.New') }}
      </b-navbar-item>
      <b-navbar-item v-show="openButtonVisible" @click="$emit('open-open-dialog')">
        <i class="fa fa-folder-open fa-fw"></i>&nbsp;{{ $t('common.Open') }}
      </b-navbar-item>
      <b-navbar-item v-show="saveButtonVisible" @click="$emit('open-save-dialog')">
        <i class="fa fa-save fa-fw"></i>&nbsp;{{ $t('common.Save') }}
      </b-navbar-item>
      <b-navbar-item v-show="shareButtonVisible" @click="$emit('open-share-dialog')">
        <i class="fa fa-share-alt fa-fw"></i>&nbsp;{{ $t('toolbar.Share') }}
      </b-navbar-item>
      <b-navbar-item v-show="optionsButtonVisible" @click="$emit('open-customize-dialog')">
        <i class="fas fa-palette fa-fw"></i>&nbsp;{{ $t('common.Customize') }}
      </b-navbar-item>
      <b-navbar-item v-show="fullscreenButtonVisible" @click="enterFullScreen()">
        <i class="fa fa-expand fa-fw"></i>&nbsp;{{ $t('toolbar.Fullscreen') }}
      </b-navbar-item>
      <b-navbar-item v-show="exitFullscreenButtonVisible" @click="exitFullScreen()">
        <i class="fa fa-compress fa-fw"></i>&nbsp;{{ $t('toolbar.Exit fullscreen') }}
      </b-navbar-item>
      <b-navbar-item v-show="unlinkSheetButtonVisible" @click="$store.commit('unlinkSheet')">
        <i class="fa fa-unlink fa-fw"></i>&nbsp;{{ $t('toolbar.Unlink Google Spreadsheet') }}
      </b-navbar-item>
      <template v-if="browserIsIEOrOldEdge">
        <b-navbar-item v-show="feedbackbuttonVisible" @click="openFeedbackForm">
          <i class="fa fa-comment fa-fw"></i>&nbsp;{{ $t('toolbar.Feedback') }}
        </b-navbar-item>
      </template>
      <template v-else>
        <b-navbar-dropdown v-show="moreVisible" :label="$t('toolbar.More')" :right="true">
          <b-navbar-item v-show="feedbackbuttonVisible" @click="openFeedbackForm">
            <i class="fa fa-comment fa-fw"></i>&nbsp;{{ $t('toolbar.Feedback') }}
          </b-navbar-item>
          <b-navbar-item v-show="faqbuttonVisible" @click="$router.push('/faq')">
            <i class="fa fa-question-circle fa-fw"></i>&nbsp;{{ $t('toolbar.FAQ') }}
          </b-navbar-item>
          <b-navbar-item v-show="feedbackbuttonVisible" @click="$router.push('/privacy-policy')">
            <i class="fas fa-user-secret fa-fw"></i>&nbsp;{{ $t('common.Privacy policy') }}
          </b-navbar-item>
          <b-navbar-item v-show="feedbackbuttonVisible" @click="$router.push('/faq/terms')">
            <i class="fas fa-balance-scale fa-fw"></i>&nbsp;{{ $t('appInfo.Terms of service') }}
          </b-navbar-item>
          <b-navbar-item>
          </b-navbar-item>
          <b-navbar-item v-show="importVisible" @click="$emit('open-twitter-dialog')">
            <i class="fab fa-twitter fa-fw"></i>&nbsp;{{ $t('common.Import Twitter users') }}
          </b-navbar-item>
          <b-navbar-item v-show="importVisible" @click="$emit('open-sheet-dialog')">
            <i class="fa fa-link fa-fw"></i>&nbsp;{{ $t('common.Link Google Spreadsheet') }}
          </b-navbar-item>
          <b-navbar-item v-if="!browserIsIEOrOldEdge" v-show="optionsButtonVisible" @click="toggleDarkMode()">
            <i class="fas fa-moon fa-fw"></i>&nbsp;{{ $t('toolbar.Dark mode') }}
          </b-navbar-item>
          <b-navbar-item>
          </b-navbar-item>
          <b-navbar-item @click="$emit('open-account-dialog')">
            <i class="fas fa-user-alt fa-fw"></i>&nbsp;{{ $t('common.My account') }}
          </b-navbar-item>
        </b-navbar-dropdown>
      <b-navbar-dropdown v-if="$mq=='mobile'" :label="$t('toolbar.Language')">
        <b-navbar-item v-for="locale in locales" :key="locale.name"
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
          <option value='add-your-language'>
            {{ $t('toolbar.Add your language') }}
          </option>
        </b-select>
      </b-navbar-item>
      </template>
    </template>
  </b-navbar>
</template>

<script>
  import * as Util from './Util.js';
  import * as Locales from './Locales.js';
  import { mapGetters } from "vuex";

  export default {
    data() {
      return {
        toolbarBrand: window.location.host,
        browserIsIEOrOldEdge: Util.browserIsIEOrOldEdge(navigator.userAgent),
        locales: Locales.getNamesForAll(Util.platformSupportsFlags(navigator))
      };
    },
    computed: {
      locale: {
        get: function () {
          return this.$i18n.locale;
        },
        set: function(newValue) {
          if (newValue == 'add-your-language') {
            this.$router.push('/translate.html');
          }
          else {
            this.$emit('set-locale', newValue);
          }
        }
      },
      newButtonVisible: function() {
        return (!this.fullScreen && !this.sheetLinked && !this.wheelIsBusy);
      },
      openButtonVisible: function() {
        return !this.fullScreen && !this.sheetLinked && !this.wheelIsBusy;
      },
      saveButtonVisible: function() {
        return this.online && !this.fullScreen && !this.wheelIsBusy;
      },
      shareButtonVisible: function() {
        return this.online && !this.fullScreen && !this.wheelIsBusy;
      },
      optionsButtonVisible: function() {
        return !this.fullScreen && !this.wheelIsBusy;
      },
      fullscreenButtonVisible: function() {
        return !this.fullScreen && !this.wheelIsBusy;
      },
      exitFullscreenButtonVisible: function() {
        return this.fullScreen;
      },
      moreVisible: function() {
        return this.online && !this.fullScreen && !this.wheelIsBusy;
      },
      importVisible: function() {
        return this.online && !this.fullScreen &&
               !this.sheetLinked && !this.wheelIsBusy;
      },
      unlinkSheetButtonVisible: function() {
        return this.sheetLinked && !this.fullScreen && !this.wheelIsBusy;
      },
      languageVisible: function() {
        return this.online && !this.fullScreen && !this.wheelIsBusy;
      },
      faqbuttonVisible: function() {
        return !this.fullScreen && !this.wheelIsBusy;
      },
      feedbackbuttonVisible: function() {
        return this.online && !this.fullScreen && !this.wheelIsBusy;
      },
      ...mapGetters([
        'online', 'wheelIsBusy', 'fullScreen', 'sheetLinked', 'version'
      ])
    },
    methods: {
      enterFullScreen() {
        Util.trackEvent('Wheel', 'EnterFullscreen', '');
        this.$store.commit('enterFullScreen');
      },
      exitFullScreen() {
        Util.trackEvent('Wheel', 'ExitFullscreen', '');
        this.$store.commit('exitFullScreen');
      },
      toggleDarkMode() {
        Util.trackEvent('Wheel', 'ToggleDarkMode', '');
        this.$store.commit('toggleDarkMode');
      },
      openFeedbackForm() {
        const url = Util.getFeedbackFormUrl(navigator.userAgent, this.version);
        window.open(url, '_new');
      }
    }
  }
</script>
