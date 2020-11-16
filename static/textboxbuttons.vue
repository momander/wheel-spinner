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
    <b-button size="is-small" type="is-light" :disabled="buttonsDisabled" @click="shuffle">
      <i class="fas fa-random"></i>&nbsp;{{ $t('textboxbuttons.Shuffle') }}
    </b-button>
    <b-button size="is-small" type="is-light" :disabled="buttonsDisabled" @click="sort">
      <i class="fas fa-sort-alpha-up"></i>&nbsp;{{ $t('textboxbuttons.Sort') }}
    </b-button>
    <b-upload accept="image/*" multiple v-model="uploadedImage" :disabled="buttonsDisabled">
      <a class="button is-small is-light" :disabled="buttonsDisabled">
        <i class="far fa-image"></i>&nbsp;{{ $t('textboxbuttons.Add image') }}
      </a>
    </b-upload>
  </span>
</template>

<script>
  import * as Util from './Util.js';
  import * as ImageUtil from './ImageUtil.js';

  export default {
    data() {
      return {uploadedImage: []}
    },
    watch: {
      uploadedImage: function(files) {
        if (files.length == 0) return;
        Util.trackEvent('Wheel', 'UploadPieSliceImage', files.length);
        for (const file of files) {
          const reader = new FileReader();
          const self = this;
          reader.onload = async function(e) {
            const dataUri = await ImageUtil.optimizeSliceImage(e.target.result);
            const imageTag = `<img src="${dataUri}" style="height:25px" style="font-size: 1rem;">`;
            self.$store.commit('appendNames', [imageTag]);
          }
          reader.readAsDataURL(file);
        }
        this.uploadedImage = [];
      }
    },
    computed: {
      buttonsDisabled() {
        const appStatus = this.$store.state.appStatus;
        return appStatus.sheetLinked || appStatus.wheelSpinning;
      }
    },
    methods: {
      shuffle() {
        Util.trackEvent('Wheel', 'ShuffleNames', '');
        this.$store.commit('shuffleNames');
      },
      sort() {
        Util.trackEvent('Wheel', 'SortNames', '');
        this.$store.commit('sortNames');
      },
    }
  }
</script>
