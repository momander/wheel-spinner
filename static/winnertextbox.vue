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
  <div id="winners" class="textarea can-go-dark winner-textbox" spellcheck="false"/>
</template>

<script>
  import * as Util from './Util.js';
  import { mapGetters } from "vuex";

  export default {
    computed: {
      ...mapGetters(['winners'])
    },
    watch: {
      winners(entries) {
        const div = document.getElementById('winners');
        div.innerHTML = entries.map(entry => Util.renderEntry(entry)).join('');
      }
    }
  }
</script>

<style scoped>
  .winner-textbox {
    flex-grow: 1;
    max-height: 10000px;
    background-color: #EEE;
    overflow: auto;
    font-family: BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu',
                 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue',
                 'Helvetica', 'Arial', sans-serif;
  }
</style>
