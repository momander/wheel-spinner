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
    <div class="columns is-mobile is-vcentered" style="padding-top:24px; color:#888">
      <div class="column has-text-right is-narrow" style="margin-right:-10px">
        <i class="fas fa-volume-mute" style="font-size:150%"></i>
      </div>
      <div class="column is-narrow">
        <b-switch v-model="sound"></b-switch>
      </div>
      <div class="column is-narrow" style="margin-left:-24px">
        <i class="fas fa-volume-up" style="font-size:150%"></i>
      </div>
    </div>
  </div>
</template>

<script>
  import * as Util from './Util.js';
  import { mapGetters } from "vuex";

  export default {
    data() {
      return {sound: true, duringSpinSoundVolume: 0, afterSpinSoundVolume: 0}
    },
    computed: {
      ...mapGetters([
        'wheelConfig'
      ])
    },
    watch: {
      sound(newValue) {
        if (newValue) {
          Util.trackEvent('Wheel', 'Unmute');
          this.$store.commit('setVolumes', {
            duringSpinSoundVolume: this.duringSpinSoundVolume,
            afterSpinSoundVolume: this.afterSpinSoundVolume
          });
        }
        else {
          Util.trackEvent('Wheel', 'Mute');
          this.duringSpinSoundVolume = this.wheelConfig.duringSpinSoundVolume;
          this.afterSpinSoundVolume = this.wheelConfig.afterSpinSoundVolume;
          this.$store.commit('setVolumes', {
            duringSpinSoundVolume: 0,
            afterSpinSoundVolume: 0
          });
        }
      }
    }
  }
</script>