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
  <div>
    <div class="columns is-mobile is-vcentered">
      <div class="column is-2">
        {{ $t('optionsdialog.Sound') }}
      </div>
      <div class="column is-half is-half-mobile">
        <b-select v-model="myAfterSpinSound">
          <option
            v-for="sound in afterSpinSounds"
            :value="sound.value"
            :key="sound.value">
            {{ $t(sound.name) }}
          </option>
        </b-select>
      </div>
      <div class="column">
        <b-button @click="playAfterSpinSound" :disabled="!playbackEnabled">
          <i class="fas fa-play"></i>
        </b-button>
        <b-button @click="stopAfterSpinSound" :disabled="!playbackEnabled">
          <i class="fas fa-stop"></i>
        </b-button>
      </div>
    </div>
    <div class="columns is-mobile is-vcentered">
      <div class="column is-2">
        {{ $t('optionsdialog.Volume') }}
      </div>
      <div class="column">
        <b-slider v-model="myAfterSpinSoundVolume" :min="0" :max="100">
          <template v-for="val in [0,50,100]">
            <b-slider-tick :value="val" :key="val">{{ val }}</b-slider-tick>
          </template>
        </b-slider>
      </div>
    </div>
  </div>
</template>

<script>
  import * as Util from './Util.js';
  import * as Audio from './audio.js';

  export default {
    props: [
      'afterSpinSound', 'afterSpinSoundVolume', 'firstTextOnWheel'
    ],
    data() {
      return {
        myAfterSpinSound: this.afterSpinSound,
        myAfterSpinSoundVolume: this.afterSpinSoundVolume,
        afterSpinSounds: Audio.getAfterSpinSounds()
      }
    },
    computed: {
      playbackEnabled() {
        return this.myAfterSpinSound!='no-sound';
      }
    },
    watch: {
      myAfterSpinSound(newValue) {
        this.$emit('set-after-spin-sound', newValue);
      },
      myAfterSpinSoundVolume(newValue) {
        this.$emit('set-after-spin-sound-volume', newValue);
      }
    },
    methods: {
      playAfterSpinSound() {
        Util.trackEvent('Wheel', 'PlayAfterSpinSoundInOptionsDialog', '');
        Audio.stopAfterSpinSound();
        Audio.playAfterSpin(
          this.myAfterSpinSound,
          this.firstTextOnWheel,
          this.myAfterSpinSoundVolume,
          this.$i18n.locale
        );
      },
      stopAfterSpinSound() {
        Util.trackEvent('Wheel', 'StopAfterSpinSoundInOptionsDialog', '');
        Audio.stopAfterSpinSound();
      }
    }
  }
</script>
