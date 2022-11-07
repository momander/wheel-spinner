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
  <div style="flex-grow: 1; display: flex; flex-direction: column">
    <div style="overflow: auto; border-radius: 10px; border-color: #dbdbdb; border-style: solid; flex-grow: 1; height: 300px">
      <template v-for="(entry, i) in entries">
        <advancedSlice :ref="'entry' + i" :entry="entry" :i="i"/>
      </template>
    </div>
    <b-button type="is-primary" style="width:100%; margin-top:8px;" @click="addEntry()" :disabled="wheelIsBusy">
      {{ $t('advancededitor.Add entry') }}
    </b-button>
  </div>
</template>

<script>
  import * as Util from './Util.js';
  import * as ImageUtil from './ImageUtil.js';
  import advancedSlice from './advancedSlice.vue';
  import { mapGetters } from "vuex";

  export default {
    components: {
      advancedSlice
    },
    data() {
      return { uploadedImage: {}, entryImageIndex: null }
    },
    watch: {
      uploadedImage: function(file) {
        Util.trackEvent('Wheel', 'AttachImageToEntry');
        const reader = new FileReader();
        const self = this;
        reader.onload = async function(e) {
          const dataUri = await ImageUtil.optimizeSliceImage(e.target.result);
          self.$store.dispatch('attachImageToEntry', {imageData: dataUri, index: self.entryImageIndex});
        }
        reader.readAsDataURL(file);
      }
    },
    computed: {
      entries() {
        return this.wheelConfig.entries;
      },
      ...mapGetters([
        'wheelConfig', 'wheelIsBusy', 'sheetLinked', 'appInfoVisible'
      ])
    },
    methods: {
      addEntry() {
        Util.trackEvent('Wheel', 'AddAdvancedEntry');
        this.$store.commit('appendEntry', {text: '', color: '#CCCCCC', weight: 1, enabled: true});
        this.focusLastEntry();
      },
      focusLastEntry() {
        setTimeout(() => { this.$refs['entry' + (this.entries.length - 1)][0].focus() }, 100);
      },
    }
  }
</script>
