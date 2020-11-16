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
  <div class="container" style="text-align: center">
    <canvas id="wheelCanvas" style="width:100%" @click="spin()" width="700" height="700">
    </canvas>
    <div v-if="!isTouchScreen" id="instructionsLayer" ref="instructionsLayer" @click="spin()">
      <div class="instructionsText" id="topInstruction" style="padding-top: 20%">
        {{ $t('spinningwheel.Click to spin') }}
      </div>
      <div class="instructionsText" id="bottomInstruction" style="padding-top: 60%">
        {{ $t('spinningwheel.or press ctrl+enter') }}
      </div>
    </div>
    <div v-if="isTouchScreen" id="instructionsLayer" ref="instructionsLayer" @click="spin()">
      <div class="instructionsText" id="topInstruction" style="padding-top: 20%">
        {{ $t('spinningwheel.Tap to spin') }}
      </div>
    </div>
  </div>
</template>

<script>
  import Wheel from './Wheel.js';
  import * as Util from './Util.js';
  import Ticker from './Ticker.js';
  import CircleType from 'circletype';
  import * as Locales from './Locales.js';

  export default {
    data() {
      return {
        myWheel: new Wheel(), myTicker: new Ticker(),
        isTouchScreen: Util.isTouchScreen()
      }
    },
    mounted() {
      this.myWheel = new Wheel();
      this.tick(0);
      this.setupOverlay();
      this.startKeyListener();
    },
    computed: {
      wheelConfig() {
        return this.$store.state.wheelConfig;
      },
      names() {
        return this.$store.state.wheelConfig.names;
      },
      preferences() {
        return this.$store.state.preferences
      },
      hasEntries() {
        return (this.$store.state.wheelConfig.names.length>0);
      }
    },
    watch: {
      wheelConfig(newValue, oldValue) {
        this.configureWheel();
      },
      preferences(newValue) {
        this.configureWheel();
      },
      names(newValue, oldValue) {
        this.myWheel.setNames(newValue, this.wheelConfig.maxNames,
                              this.wheelConfig.allowDuplicates);
      },
    },
    methods: {
      setupOverlay() {
        const side = document.getElementById('wheelCanvas').offsetWidth;
        const fontSize = `${Math.round(side/20)}px`;
        document.getElementById('instructionsLayer').style.fontSize = fontSize;
        if (this.cantBeDisplayedInCircleType(this.$i18n.locale)) return;
        const radius = side / 3;
        new CircleType(document.getElementById('topInstruction'))
          .radius(radius);
        if (document.getElementById('bottomInstruction')) {
          new CircleType(document.getElementById('bottomInstruction'))
            .radius(radius).dir(-1);
        }
      },
      cantBeDisplayedInCircleType(locale) {
        return ['ar', 'bn', 'fa', 'gu', 'he', 'hi'].includes(locale);
      },
      startKeyListener() {
        if (!Util.isTouchScreen()) {
          const self = this;
          document.addEventListener('keyup', event => {
            if (event.key == 'Enter' && event.ctrlKey) {
              self.spin();
            }
          });
        }
      },
      spin() {
        if (this.myWheel.isSpinning()) return;
        if (!this.hasEntries) return;
        this.trackInGoogleAnalytics();
        this.$refs.instructionsLayer.style.display = 'none';
        this.$store.commit('startWheelSpin');
        this.$emit('wheel-started');
        this.myWheel.click(this.onNameChanged, this.onStopWheelSpin);
      },
      onNameChanged() {
        this.$emit('name-changed');
      },
      onStopWheelSpin(winningEntry) {
        this.$store.commit('stopWheelSpin');
        this.$emit('wheel-stopped', winningEntry);
      },
      trackInGoogleAnalytics() {
        const defaultNames = this.wheelConfig.getDefaultNames();
        if (!Util.arraysEqual(this.names, defaultNames)) {
          const label = this.$store.state.version;
          Util.trackEvent('Wheel', 'SpinWithCustomNames', label);
        }
        else {
          Util.trackEvent('Wheel', 'SpinWithDefaultNames', '');
        }
      },
      tick(ms) {
        this.myTicker.setTimestamp(ms);
        while (this.myTicker.shouldTick()) {
          this.myWheel.tick();
        }
        const context = document.getElementById('wheelCanvas').getContext('2d');
        this.myWheel.draw(context);
        requestAnimationFrame(this.tick);
      },
      resetRotation() {
        this.myWheel.resetRotation();
      },
      refresh() {
        this.myWheel.refresh();
      },
      configureWheel() {
        this.myWheel.configure(
          this.$store.state.wheelConfig.getCoalescedColors(),
          this.$store.state.wheelConfig.getWheelImage(),
          this.$store.state.wheelConfig.spinTime,
          this.$store.state.wheelConfig.slowSpin,
          this.$store.state.wheelConfig.hubSize,
          this.$store.getters.darkMode ? 
            '#000' : this.$store.state.wheelConfig.pageBackgroundColor
        );
      },
    }
  }
</script>

<style scoped>
  .container {
    position: relative;
  }
  .instructionsText {
    width: 100%;
    height: 100%;            
    position: absolute;
    top: 0;
    left: 0;
    color: #FFF;
    text-shadow: 0px 0px 10px #000000;
    background-color: #00000000;
    font-family: sans-serif;
    font-weight: 800;
  }
</style>
