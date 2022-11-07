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
  <b-field grouped group-multiline>
    <p class="control">
      <b-button size="is-small" type="is-light" :disabled="buttonsDisabled" @click="shuffle">
        <i class="fas fa-random"></i>&nbsp;{{ $t('textboxbuttons.Shuffle') }}
      </b-button>
    </p>
    <p class="control">
      <b-button size="is-small" type="is-light" :disabled="buttonsDisabled" @click="sort">
        <i class="fas fa-sort-alpha-up"></i>&nbsp;{{ $t('textboxbuttons.Sort') }}
      </b-button>
    </p>
    <p class="control" style="margin-top:-1px">
      <b-upload accept="image/*" multiple v-model="uploadedImage" :disabled="buttonsDisabled">
        <a class="button is-small is-light" :disabled="buttonsDisabled">
          <i class="far fa-image"></i>&nbsp;{{ $t('textboxbuttons.Add image') }}
        </a>
      </b-upload>
    </p>
    <p class="control">
      <b-checkbox size="is-small" :disabled="buttonsDisabled"
        v-if="displayAdvancedCheckbox" v-model="wheelIsAdvanced"
        :key="updateAdvancedCheckbox"
      >
        {{ $t('textboxbuttons.Advanced') }}
      </b-checkbox>
    </p>
  </b-field>
</template>

<script>
  import * as Util from './Util.js';
  import * as ImageUtil from './ImageUtil.js';
  import { mapGetters } from "vuex";

  export default {
    data() {
      return {uploadedImage: [], updateAdvancedCheckbox: 0}
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
            self.$store.dispatch('appendImageEntry', dataUri);
          }
          reader.readAsDataURL(file);
        }
        this.uploadedImage = [];
      }
    },
    computed: {
      buttonsDisabled() {
        return this.sheetLinked || this.wheelIsBusy;
      },
      wheelIsAdvanced: {
        get: function() {
          return this.$store.getters.wheelIsAdvanced;
        },
        set: function(newValue) {
          if (!newValue) {
            this.$buefy.dialog.confirm({
              title: this.$t('textboxbuttons.Revert from advanced'),
              message: this.$t('textboxbuttons.Reverting will reset'),
              cancelText: this.$t('common.Cancel'),
              confirmText: this.$t('common.Continue'),
              type: 'is-warning',
              hasIcon: true,
              onConfirm: () => {
                this.$store.dispatch('setAdvanced', newValue);
                Util.trackEvent('Wheel', 'RevertFromAdvanced');
              },
              onCancel: () => this.updateAdvancedCheckbox++
            })
          }
          else {
            this.$store.dispatch('setAdvanced', newValue);
            Util.trackEvent('Wheel', 'ConvertToAdvanced');
          }
        }
      },
      displayAdvancedCheckbox() {
        return !Util.browserIsIE();
      },
      ...mapGetters(['sheetLinked', 'wheelIsBusy', 'wheelType'])
    },
    methods: {
      shuffle() {
        Util.trackEvent('Wheel', 'ShuffleEntries', '');
        this.$store.commit('shuffleEntries');
      },
      sort() {
        Util.trackEvent('Wheel', 'SortEntries', '');
        this.$store.commit('sortEntries');
      },
    }
  }
</script>
