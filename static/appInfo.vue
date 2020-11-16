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
  <div class="card can-go-dark" style="margin-top:10px">
    <div class="card-content" style="padding:10px">
      <div class="content">
        <div v-if="appInfoVisible">
          <b-button @click="toggleVisibility" type="is-light" pack="fas" icon-left="chevron-circle-down" size="is-small" style="float:right;margin-left:10px"></b-button>
          {{ $t('appInfo.The entries you make') }}
          <hr style="margin:5px;">
          <span style="color:#999">{{ $t('appInfo.Version') }} {{ version }}</span>
        </div>
        <div v-else>
          <b-button @click="toggleVisibility" type="is-light" pack="fas" icon-left="chevron-circle-up" size="is-small" style="float:right;margin-top:-5px"></b-button>
          <span style="color:#999">{{ $t('appInfo.Version') }} {{ version }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
  import * as Util from './Util.js';

  export default {
    computed: {
      appInfoVisible() {
        return this.$store.state.preferences.appInfoVisible
      },
      version() {
        return this.$store.state.version
      }
    },
    methods: {
      toggleVisibility() {
        Util.trackEvent('Wheel', 'ToggleAppInfoVisibility', '');
        this.$store.commit('toggleAppInfoVisibility');
      }
    }
  }
</script>
