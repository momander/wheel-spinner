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
  <div @click="$emit('click')">
    <div v-if="!isTouchScreen" id="instructionsLayer" ref="instructionsLayer">
      <div class="instructionsText" id="topInstruction" style="padding-top: 20%">
        {{ $t('spinningwheel.Click to spin') }}
      </div>
      <div v-if="!isSafari" class="instructionsText" id="bottomInstruction" style="padding-top: 60%">
        {{ $t('spinningwheel.or press ctrl+enter') }}
      </div>
    </div>
    <div v-if="isTouchScreen" id="instructionsLayer" ref="instructionsLayer">
      <div class="instructionsText" id="topInstruction" style="padding-top: 20%">
        {{ $t('spinningwheel.Tap to spin') }}
      </div>
    </div>
  </div>
</template>

<script>
  import * as Util from './Util.js';
  import CircleType from 'circletype';

  export default {
    data() {
      return { isTouchScreen: false }
    },
    mounted() {
      this.isTouchScreen = Util.isTouchScreen();
      this.setupOverlay();
    },
    computed: {
      isSafari() {
        // Sound doesn't play on Safari if you use the keyboard shortcut to spin.
        // Workaround: hide the text "or press ctrl+enter" for Safari users.
        return !!window.safari;
      }
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
        return ['ar', 'bn', 'fa', 'gu', 'he', 'hi', 'ta'].includes(locale);
      },
    }
  }
</script>

<style scoped>
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
