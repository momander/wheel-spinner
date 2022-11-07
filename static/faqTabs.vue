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
  <b-tabs vertical type="is-boxed" v-model="activeTab">
    <b-tab-item label="Welcome">
      <div class="content">
        ...
      </div>
    </b-tab-item>
    <b-tab-item label="Ads">
      <div class="content">
        ...
      </div>
    </b-tab-item>
    <b-tab-item label="Behavior">
      <div class="content">
        ...
      </div>
    </b-tab-item>
    <b-tab-item label="Business">
      <div class="content">
        ...
      </div>
    </b-tab-item>
    <b-tab-item label="Changelog">
      <div class="content">
        ...
      </div>
    </b-tab-item>
    <b-tab-item label="Constraints">
      <div class="content">
        ...
      </div>
    </b-tab-item>
    <b-tab-item label="Credits">
      <div class="content">
        ...
      </div>
    </b-tab-item>
    <b-tab-item label="Embed">
      <div class="content">
        ...
      </div>
    </b-tab-item>
    <b-tab-item label="How to">
      <div class="content">
        ...
      </div>
    </b-tab-item>
    <b-tab-item label="Randomness">
      <div class="content">
        ...
      </div>
    </b-tab-item>
    <b-tab-item label="Saving">
      <div class="content">
        ...
      </div>
    </b-tab-item>
    <b-tab-item label="Sharing">
      <div class="content">
        ...
      </div>
    </b-tab-item>
    <b-tab-item label="Sound">
      <div class="content">
        ...
      </div>
    </b-tab-item>
    <b-tab-item label="Sustainability">
      ...
    </b-tab-item>
    <b-tab-item label="Terms">
      <div class="content">
        ...
      </div>
    </b-tab-item>
  </b-tabs>
</template>

<script>
  import heroNumber from './heroNumber.vue';

  export default {
    components: { heroNumber },
    data() {
      return {
        activeTabInternal: 0,
        tabs: [
          {name: 'welcome',         pos: 0},
          {name: 'ads',             pos: 1},
          {name: 'behavior',        pos: 2},
          {name: 'business',        pos: 3},
          {name: 'changelog',       pos: 4},
          {name: 'constraints',     pos: 5},
          {name: 'credits',         pos: 6},
          {name: 'embed',           pos: 7},
          {name: 'how-to',          pos: 8},
          {name: 'randomness',      pos: 9},
          {name: 'saving',          pos: 10},
          {name: 'sharing',         pos: 11},
          {name: 'sound',           pos: 12},
          {name: 'sustainability',  pos: 13},
          {name: 'terms',           pos: 14},
        ],
        changelog: [
          {version: '...', date: '...', text: '...'},
        ]
      }
    },
    computed: {
      activeTab: {
        get: function() {
          return this.activeTabInternal;
        },
        set: function(newValue) {
          const tab = this.tabs.find(t => t.pos==newValue);
          if (tab) {
            this.$router.push(`/faq/${tab.name}`);
            this.activeTabInternal = newValue;
          }
        }
      }
    },
    mounted() {
      const tab = this.tabs.find(t => t.name==this.$route.params.section);
      this.activeTabInternal = tab ? tab.pos : 0;
    }
  }
</script>

<style scoped>
  .hero-numbers-grid {
    display: grid;
    grid-template-columns: 200px 200px;
    grid-gap: 30px;
  }
</style>
