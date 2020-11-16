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
    <section class="section" style="padding-top:1rem; padding-left:1rem">
      <div class="columns">
        <div class="column is-3" style="font-family:Quicksand">
          <b-button id="createYourOwnLink" tag="a" href="/">
            <i class="fas fa-pencil-alt"></i>&nbsp;{{ $t('app.Create your own') }}
          </b-button>
        </div>
        <div class="column is-7">
          <spinningwheel ref="spinningwheel"
            v-on:wheel-started="wheelStarted"
            v-on:name-changed="nameChanged"
            v-on:wheel-stopped="wheelStopped"
          ></spinningwheel>
        </div>
      </div>
    </section>

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
  import spinningwheel from './spinningwheel.vue';
  import winnerdialog from './winnerdialog.vue';
  import winneranimation from './winneranimation.vue';
  import * as ConfettiLauncher from './ConfettiLauncher.js';
  import * as Util from './Util.js';
  import WheelConfig from './WheelConfig.js';
  import * as ServerFunctions from './ServerFunctions.js';
  import * as Audio from './audio.js';
  import * as WheelConfigLoader from './WheelConfigLoader.js';
  import Path from './Path.js';

  export default {
    components: {
      loadingScreen, spinningwheel, winnerdialog, winneranimation
    },
    async mounted() {
      const wheelConfig = new WheelConfig(this.$t('common.We have a winner!'));
      try {
        const result = await WheelConfigLoader.load(window.location);
        wheelConfig.loadValues(result.wheelConfig);
        ServerFunctions.logSharedWheelRead(result.sharedWheelPath);
      }
      catch(ex) {
        Util.trackEvent(ex);
        alert(ex);
      }
      const path = new Path(window.location);
      document.getElementById('createYourOwnLink').href = path.getAbsoluteLocalizedRootUrl();
      this.$store.commit('setWheelConfig', wheelConfig);
      document.documentElement.style.backgroundColor = wheelConfig.pageBackgroundColor;
      document.body.style.backgroundColor = wheelConfig.pageBackgroundColor;
      Audio.preloadSounds(wheelConfig.duringSpinSound, wheelConfig.afterSpinSound);
      this.setDocLangProperties();
      this.refreshWheelOnFontLoad();
      this.loading = false;
    },
    data() {
      return {
        waitAnimation: {}, loading: true
      };
    },
    computed: {
      wheelConfig() {
        return this.$store.state.wheelConfig
      },
      wheelSpinning() {
        return this.$store.state.appStatus.wheelSpinning
      }
    },
    methods: {
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
      }
    }
  }
</script>
