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
  <b-tabs v-model="activeTab" type="is-boxed" size="is-small" style="height:100%">
    <b-tab-item class="my-tab-item">
      <template #header>
        <span>
          {{ $t('nameTabs.Entries') }}
          <counter-tag :number="$store.getters.entryCount"/>
        </span>
      </template>
      <textboxbuttons
        v-on:reset-wheel-rotation="$emit('reset-wheel-rotation')"
      ></textboxbuttons>
      <textbox v-if="!wheelIsAdvanced"></textbox>
      <advancedsliceeditor v-if="wheelIsAdvanced"></advancedsliceeditor>
      <app-info></app-info>
    </b-tab-item>
    <b-tab-item class="my-tab-item">
      <template #header>
        <span>
          {{ $t('nameTabs.Results') }}
          <counter-tag :number="$store.getters.winnerCount"/>
        </span>
      </template>
      <b-field grouped group-multiline>
        <p class="control">
          <b-button size="is-small" type="is-light" @click="sortWinners">
            <i class="fas fa-sort-alpha-up"></i>&nbsp;{{ $t('textboxbuttons.Sort') }}
          </b-button>
        </p>
        <p class="control">
          <b-button size="is-small" type="is-light" @click="clearWinners">
            <i class="fas fa-times"></i>&nbsp;{{ $t('nameTabs.Clear the list') }}
          </b-button>
        </p>
      </b-field>
      <winnertextbox/>
    </b-tab-item>
    <b-tab-item class="my-tab-item">
      <template #header>
        <span>
          {{ $t('nameTabs.Hide') }}
        </span>
      </template>
    </b-tab-item>
  </b-tabs>
</template>

<script>
  import * as Util from './Util.js';
  import counterTag from './counterTag.vue';
  import textboxbuttons from './textboxbuttons.vue';
  import textbox from './textbox.vue';
  import advancedsliceeditor from './advancedSliceEditor.vue';
  import appInfo from './appInfo.vue';
  import winnertextbox from './winnertextbox.vue';
  import { mapGetters } from "vuex";

  export default {
    components: {
      counterTag, textboxbuttons, textbox, advancedsliceeditor, appInfo, winnertextbox
    },
    data() {
      return { activeTab: 0 }
    },
    watch: {
      activeTab(newValue) {
        Util.trackEvent('Wheel', 'ChangeTab', newValue);
      }
    },
    computed: {
      wheelIsAdvanced() {
        return this.wheelConfig.isAdvanced;
      },
      ...mapGetters([
        'wheelConfig'
      ])
    },
    methods: {
      clearWinners() {
        Util.trackEvent('Wheel', 'ClearResults', '');
        this.$store.commit('clearWinners');
      },
      sortWinners() {
        Util.trackEvent('Wheel', 'SortResults', '');
        this.$store.commit('sortWinners');
      }
    }
  }
</script>

<style>
  section {
    height: 100%;
  }
  .my-tab-item {
    flex-grow: 1;
    margin-bottom: 38px;
    display: flex;
    flex-direction: column;
  }
</style>
