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
    <wheelOverlayText
      v-if="displayOverlayText"
      v-on:click="spin()"
    />
  </div>
</template>

<script>
  import Wheel from './Wheel.js';
  import wheelOverlayText from './wheelOverlayText.vue';
  import * as Util from './Util.js';
  import Ticker from './Ticker.js';
  import { mapGetters } from "vuex";

  export default {
    components: { wheelOverlayText },
    data() {
      return {
        myWheel: {}, myTicker: new Ticker(), displayOverlayText: true, animationFrameID: undefined
      }
    },
    mounted() {
      this.myWheel = new Wheel();
      this.myWheel.configure(this.wheelConfig, this.darkMode);
      this.myWheel.setEntries(this.wheelConfig.entries, this.wheelConfig.maxNames,
                                this.wheelConfig.allowDuplicates);
      this.tick(0);
      this.startKeyListener();
    },
    destroyed() {
      window.cancelAnimationFrame(this.animationFrameID);
      this.animationFrameID = undefined;
    },
    computed: {
      entries() {
        return this.wheelConfig.entries;
      },
      hasEntries() {
        return this.entries.length>0;
      },
      locale() {
        return this.$i18n.locale;
      },
      ...mapGetters(['wheelConfig', 'darkMode', 'version', 'wheelIsBusy'])
    },
    watch: {
      wheelConfig(newValue, oldValue) {
        this.myWheel.configure(this.wheelConfig, this.darkMode);
      },
      darkMode() {
        this.myWheel.configure(this.wheelConfig, this.darkMode);
      },
      entries(newValue, oldValue) {
        this.myWheel.setEntries(newValue, this.wheelConfig.maxNames,
                                this.wheelConfig.allowDuplicates);
      },
      locale(newValue, oldValue) {
        this.destroyAndRecreateOverlayText();
      }
    },
    methods: {
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
      destroyAndRecreateOverlayText() {
        this.displayOverlayText = false;
        this.$nextTick(() => this.displayOverlayText = true);
      },
      spin() {
        if (!this.hasEntries) return;
        if (this.wheelIsBusy) return;
        this.$store.commit('setWheelBusy', true);
        this.displayOverlayText = false;
        this.trackInGoogleAnalytics();
        this.$emit('wheel-started');
        this.myWheel.click(this.onNameChanged, this.onStopWheelSpin);
      },
      onNameChanged() {
        this.$emit('name-changed');
      },
      onStopWheelSpin(winningEntry) {
        this.$store.commit('setWheelBusy', false);
        this.$emit('wheel-stopped', winningEntry);
      },
      trackInGoogleAnalytics() {
        const label = this.version;
        if (this.wheelConfig.hasOnlyDefaultEntries()) {
          Util.trackEvent('Wheel', 'SpinWithDefaultNames', label);
        }
        else {
          Util.trackEvent('Wheel', 'SpinWithCustomNames', label);
        }
      },
      tick(ms) {
        const canvas = document.getElementById('wheelCanvas');
        if (canvas) {
          this.myTicker.setTimestamp(ms);
          while (this.myTicker.shouldTick()) {
            this.myWheel.tick();
          }
          const context = canvas.getContext('2d');
          this.myWheel.draw(context);
        }
        this.animationFrameID = requestAnimationFrame(this.tick);
      },
      resetRotation() {
        this.myWheel.resetRotation();
      },
      refresh() {
        this.myWheel.refresh();
      },
    }
  }
</script>

<style scoped>
  .container {
    position: relative;
  }
</style>
