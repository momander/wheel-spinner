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
  <span>
    <loading-screen v-show="loading"></loading-screen>
    <toolbar
      v-on:show-snackbar-message="showSnackbarMessage"
      v-on:reset-wheel="resetWheel()"
      v-on:open-open-dialog="openOpenDialog()"
      v-on:open-save-dialog="openSaveDialog()"
      v-on:open-share-dialog="openShareDialog()"
      v-on:open-customize-dialog="openCustomizeDialog()"
      v-on:open-twitter-dialog="openTwitterDialog()"
      v-on:open-sheet-dialog="openSheetDialog()"
      v-on:set-locale="setLocale"
    ></toolbar>
    <section class="section" style="padding-top:1rem; padding-bottom:0">
      <div class="columns" v-bind:class="{ 'is-centered': $store.state.appStatus.fullScreen }">
        <div class="column is-3" v-show="!$store.state.appStatus.fullScreen">
        </div>
        <div class="column is-6" v-bind:class="{ 'is-7': $store.state.appStatus.fullScreen }">
          <spinningwheel ref="spinningwheel"
            v-on:wheel-started="wheelStarted"
            v-on:name-changed="nameChanged"
            v-on:wheel-stopped="wheelStopped"
          ></spinningwheel>
        </div>
        <div class="column is-3" v-show="!$store.state.appStatus.fullScreen">
          <span style="font-family:Quicksand">
            {{ $t('app.Enter names here') }}
          </span>
          <br/>
          <textboxbuttons></textboxbuttons>
          <textbox></textbox>
          <entry-counter></entry-counter>
          <app-info
            v-on:open-options-dialog="openOptionsDialog()"
          ></app-info>
        </div>
      </div>
    </section>

    <opendialog
      ref="opendialog"
      v-on:show-snackbar-message="showSnackbarMessage"
      v-on:start-wait-animation="startWaitAnimation"
      v-on:stop-wait-animation="stopWaitAnimation"
      v-on:auth-error="authError"
      v-on:reset-wheel-rotation="resetWheelRotation"
    ></opendialog>
    <savedialog
      ref="savedialog"
      v-on:show-snackbar-message="showSnackbarMessage"
      v-on:start-wait-animation="startWaitAnimation"
      v-on:stop-wait-animation="stopWaitAnimation"
      v-on:auth-error="authError"
    ></savedialog>
    <optionsdialog ref="optionsdialog"
      v-on:show-snackbar-message="showSnackbarMessage"
    ></optionsdialog>
    <sharedialog
      ref="sharedialog"
      v-on:show-snackbar-message="showSnackbarMessage"
      v-on:start-wait-animation="startWaitAnimation"
      v-on:stop-wait-animation="stopWaitAnimation"
    ></sharedialog>
    <twitterdialog
      ref="twitterdialog"
      v-on:show-snackbar-message="showSnackbarMessage"
      v-on:start-wait-animation="startWaitAnimation"
      v-on:stop-wait-animation="stopWaitAnimation"
    ></twitterdialog>
    <sheetdialog
      ref="sheetdialog"
      v-on:show-snackbar-message="showSnackbarMessage"
      v-on:auth-error="authError"
    ></sheetdialog>
    <winnerdialog
      ref="winnerdialog"
      v-on:remove-name="removeName"
      v-on:remove-name-all="removeNameAll"
    ></winnerdialog>

    <winneranimation ref="winneranimation">
    </winneranimation>
  </span>
</template>

<script>
  import loadingScreen from './loadingScreen.vue';
  import toolbar from './toolbar.vue';
  import spinningwheel from './spinningwheel.vue';
  import textboxbuttons from './textboxbuttons.vue';
  import textbox from './textbox.vue';
  import appInfo from './appInfo.vue';
  import opendialog from './opendialog.vue';
  import savedialog from './savedialog.vue';
  import optionsdialog from './optionsdialog.vue';
  import sharedialog from './sharedialog.vue';
  import twitterdialog from './twitterdialog.vue';
  import sheetdialog from './sheetdialog.vue';
  import winnerdialog from './winnerdialog.vue';
  import winneranimation from './winneranimation.vue';
  import entryCounter from './entry-counter.vue';
  import * as ConfettiLauncher from './ConfettiLauncher.js';
  import * as Util from './Util.js';
  import * as FullScreen from './FullScreen.js';
  import WheelConfig from './WheelConfig.js';
  import Preferences from './Preferences.js';
  import PageReloader from './PageReloader.js';
  import * as ServerFunctions from './ServerFunctions.js';
  import * as Audio from './audio.js';
  import * as Locales from './Locales.js';
  import * as WheelConfigLoader from './WheelConfigLoader.js';

  export default {
    components: {
      loadingScreen, toolbar, textboxbuttons, textbox, spinningwheel, appInfo,
      opendialog, winnerdialog, savedialog, optionsdialog, sharedialog,
      twitterdialog, sheetdialog, winneranimation, entryCounter
    },
    async mounted() {
      let result = '';
      try {
        result = await WheelConfigLoader.load(window.location);
      }
      catch(ex) {
        Util.trackException(ex);
        alert(ex);
      }
      if (result.redirectUrl) {
        window.location.replace(result.redirectUrl);
      }
      else {
        const wheelConfig = new WheelConfig(this.$t('common.We have a winner!'));
        wheelConfig.loadJson(localStorage.getItem('LastWheelConfig'));
        if (result.wheelConfig) {
          wheelConfig.loadValues(result.wheelConfig);
          ServerFunctions.logSharedWheelRead(result.sharedWheelPath);
        }
        this.$store.commit('setWheelConfig', wheelConfig);
        this.setDocLangProperties();
        this.loadPreferences();
        this.startFullscreenDetection();
        this.startOnlineDetection();
        this.startVisibilityDetection();
        this.displayLanguageTip();
        this.refreshWheelOnFontLoad();
        this.loading = false;
      }
    },
    data() {
      return {waitAnimation: {}, loading: true};
    },
    computed: {
      names() {
        return this.$store.state.wheelConfig.names
      },
      wheelConfig() {
        return this.$store.state.wheelConfig
      },
      preferences() {
        return this.$store.state.preferences
      },
      fullScreen() {
        return this.$store.state.appStatus.fullScreen
      },
      wheelSpinning() {
        return this.$store.state.appStatus.wheelSpinning
      },
      darkMode() {
        return this.$store.getters.darkMode
      },
      pageColor() {
        return this.$store.state.wheelConfig.pageBackgroundColor
      }
    },
    watch: {
      wheelConfig(newValue, oldValue) {
        Util.updateColorStyles(this.darkMode, '#777', this.pageColor);
        localStorage.setItem('LastWheelConfig', this.$store.state.wheelConfig.getJson());
        Audio.preloadSounds(newValue.duringSpinSound, newValue.afterSpinSound);
      },
      names(newValue, oldValue) {
        localStorage.setItem('LastWheelConfig', this.$store.state.wheelConfig.getJson());
      },
      preferences(newValue) {
        Util.updateColorStyles(this.darkMode, '#777', this.pageColor);
        localStorage.setItem('Preferences', newValue.getJson());
      },
      fullScreen(newValue, oldValue) {
        if (newValue) {
          Util.trackEvent('Wheel', 'EnterFullscreen', '');
          FullScreen.turnOnFullscreen();
        }
        if (!newValue) {
          Util.trackEvent('Wheel', 'ExitFullscreen', '');
          FullScreen.turnOffFullscreen();
        }
      },
    },
    methods: {
      startFullscreenDetection() {
        const self = this;
        document.addEventListener('fullscreenchange', event => {
          if (FullScreen.fullscreenOn()) {
            self.$store.commit('enterFullScreen');
          }
          else {
            self.$store.commit('exitFullScreen');
          }
        })      
      },
      startOnlineDetection() {
        this.$store.commit('setOnline', navigator.onLine);
        const self = this;
        window.addEventListener('online', event => {
          self.$store.commit('setOnline', navigator.onLine);
        });
        window.addEventListener('offline', event => {
          self.$store.commit('setOnline', navigator.onLine);
        });
      },
      startVisibilityDetection() {
        const reloader = new PageReloader();
        document.addEventListener("visibilitychange", function() {
          reloader.reloadOutdatedPage(document.hidden);
        })
      },
      displayLanguageTip() {
        const tipLocale = Locales.getLangTipLocale(this.$i18n.locale, navigator.languages);
        if (tipLocale) {
          setTimeout(async() => {
            const file = Locales.getMessagesFileName(tipLocale);
            const messages = (
              await import(/* webpackChunkName: "locale-[request]" */
                          `./locales/${file}`)
            ).default;
            const msg = messages['app']['Click the Language menu'];
            this.showSnackbarMessage(msg);
          }, 3000);
        }
      },
      loadPreferences() {
        const prefs = new Preferences();
        prefs.loadJson(localStorage.getItem('Preferences'));
        this.$store.commit('setPreferences', prefs);
      },
      setDocLangProperties() {
        document.documentElement.setAttribute('lang', this.$i18n.locale);
        document.title = 'Wheel-spinner | ' + this.$t('app.Random name picker');
        const desc = this.$t('app.Free and easy to use');
        document.querySelector('meta[name="description"]').setAttribute("content", desc);
      },
      refreshWheelOnFontLoad() {
        if (document.fonts) {
          const self = this;
          document.fonts.ready.then(function() {
            self.$refs.spinningwheel.refresh();
          })
        }
      },
      resetWheel() {
        const wheelConfig = new WheelConfig(this.$t('common.We have a winner!'));
        this.$store.commit('setWheelConfig', wheelConfig);
        this.showSnackbarMessage(this.$t('app.Loaded default names and options'));
      },
      openOpenDialog() {
        Util.trackEvent('Wheel', 'ShowOpenDialog', '');
        this.$refs.opendialog.show();
      },
      openSaveDialog() {
        Util.trackEvent('Wheel', 'ShowSaveDialog', '');
        this.$refs.savedialog.show();
      },
      openShareDialog() {
        Util.trackEvent('Wheel', 'GetSharableLink', '');
        this.$refs.sharedialog.show();
      },
      openCustomizeDialog() {
        Util.trackEvent('Wheel', 'ShowCustomizeDialog', '');
        this.$refs.optionsdialog.show();
      },
      openTwitterDialog() {
        Util.trackEvent('Wheel', 'ShowSocialMediaDialog', '');
        this.$refs.twitterdialog.show();
      },
      openSheetDialog() {
        Util.trackEvent('Wheel', 'ShowSpreadsheetDialog', '');
        this.$refs.sheetdialog.show();
      },
      setLocale(locale) {
        window.location.replace(Locales.getRelativeUrl(window.location.hostname, locale));
      },
      nameChanged() {
        const state = this.$store.state;
        if (state.appStatus.wheelSpinning && state.wheelConfig.shouldPlayTicks()) {
          Audio.playTick();
        }
      },
      wheelStarted() {
        Audio.startMusic(this.wheelConfig.duringSpinSound);
      },
      wheelStopped(winningEntry) {
        Audio.stopMusic();
        if (this.wheelConfig.animateWinner) {
          this.$refs.winneranimation.show(winningEntry);
        }
        if (this.wheelConfig.launchConfetti) {
          ConfettiLauncher.launch(this.wheelConfig.getCoalescedColors());
        }
        if (this.wheelConfig.displayWinnerDialog) {
          this.$refs.winnerdialog.show(winningEntry);
        }
        if (this.wheelConfig.autoRemoveWinner) {
          setTimeout(_ => this.removeName(winningEntry), 5000);
        }
        Audio.playAfterSpin(this.wheelConfig.afterSpinSound, Util.extractDisplayText(winningEntry));
      },
      showSnackbarMessage(msg) {
        this.$buefy.toast.open({message: msg, duration: 6000});
      },
      startWaitAnimation() {
        this.waitAnimation = this.$buefy.loading.open({container: null});
      },
      stopWaitAnimation() {
        this.waitAnimation.close();
      },
      removeName(name) {
        if (this.$store.state.wheelConfig.playClickWhenWinnerRemoved) {
          Audio.playClick();
        }
        this.$store.commit('removeName', name);
        const msg = this.$t('app.Removed', {name: Util.extractDisplayText(name, true)});
        this.showSnackbarMessage(msg);
      },
      removeNameAll(name) {
        if (this.$store.state.wheelConfig.playClickWhenWinnerRemoved) {
          Audio.playClick();
        }
        this.$store.commit('removeNameAll', name);
        const msg = this.$t('app.Removed', {name: Util.extractDisplayText(name, true)});
        this.showSnackbarMessage(msg);
      },
      authError(ex) {
        const msg = this.$t('app.authError', {error: ex.toString()});
        Util.trackEvent('AuthError', ex.toString(), navigator.userAgent);
        this.$buefy.dialog.alert({
          title: this.$t('app.Error'),
          message: msg,
          type: 'is-danger',
          hasIcon: true,
          ariaRole: 'alertdialog',
          ariaModal: true,
          onConfirm: () => location.reload(true)
        })
      },
      resetWheelRotation() {
        this.$refs.spinningwheel.resetRotation();
      }
    }
  }
</script>

<style>
  .can-go-dark {}
</style>
