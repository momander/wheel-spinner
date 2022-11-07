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
  <div id="entries" class="textarea can-go-dark"
       style="flex-grow: 1; overflow: auto; font-family: BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue', 'Helvetica', 'Arial', sans-serif;"
       ></div>
</template>

<script>
  import * as Util from './Util.js';

  export default {
    data() {
      return {xxx: ''}
    },
    computed: {
      entries() {
        return this.$store.getters.wheelConfig.entries;
      },
      wheelConfig() {
        return this.$store.getters.wheelConfig;
      },
    },
    watch: {
      entries(newEntries, oldEntries) {
        this.setTextboxContents(newEntries);
      },
      wheelConfig(newValue, oldValue) {
        this.setTextboxContents(newValue.entries);
      },
    },
    methods: {
      setTextboxContents(entries) {
        const div = document.getElementById('entries');
        div.innerHTML = entries.map(entry => Util.renderEntry(entry)).join('');
      },
    }
  }
</script>