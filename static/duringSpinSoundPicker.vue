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
        <b-select v-model="myDuringSpinSound">
          <template v-for="category in Object.keys(duringSpinSounds)">
            <optgroup :label="translateIfNeeded(category)">
              <template v-for="soundName in Object.keys(duringSpinSounds[category])">
                <option
                  :value="duringSpinSounds[category][soundName].value"
                  :key="duringSpinSounds[category][soundName].value">
                  {{ translateIfNeeded(soundName) }}
                </option>
              </template>
            </optgroup>
          </template>
        </b-select>
      </div>
      <div class="column">
        <b-button @click="playDuringSpinSound" :disabled="!playbackEnabled">
          <i class="fas fa-play"></i>
        </b-button>
        <b-button @click="stopDuringSpinSound" :disabled="!playbackEnabled">
          <i class="fas fa-stop"></i>
        </b-button>
      </div>
    </div>
    <div class="columns is-mobile is-vcentered">
      <div class="column is-2">
        {{ $t('optionsdialog.Volume') }}
      </div>
      <div class="column">
        <b-slider v-model="myDuringSpinSoundVolume" :min="0" :max="100">
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
      'duringSpinSound', 'duringSpinSoundVolume'
    ],
    data() {
      return {
        myDuringSpinSound: this.duringSpinSound,
        myDuringSpinSoundVolume: this.duringSpinSoundVolume,
        duringSpinSounds: Audio.getDuringSpinSounds()
      }
    },
    computed: {
      playbackEnabled() {
        const unplayableSounds = ['no-sound', 'ticking-sound', 'random-music'];
        return !unplayableSounds.includes(this.myDuringSpinSound);
      }
    },
    watch: {
      myDuringSpinSound(newValue) {
        this.$emit('set-during-spin-sound', newValue);
      },
      myDuringSpinSoundVolume(newValue) {
        this.$emit('set-during-spin-sound-volume', newValue);
      }
    },
    methods: {
      translateIfNeeded(message) {
        return message.includes('.') ? this.$t(message) : message;
      },
      playDuringSpinSound() {
        Util.trackEvent('Wheel', 'PlayDuringSpinSoundInOptionsDialog', '');
        Audio.stopMusicNow();
        Audio.startMusic(this.duringSpinSound, this.duringSpinSoundVolume);
      },
      stopDuringSpinSound() {
        Util.trackEvent('Wheel', 'StopDuringSpinSoundInOptionsDialog', '');
        Audio.stopMusicNow();
      },
    }
  }
</script>
