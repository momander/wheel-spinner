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
  <div id="names" class="textarea can-go-dark"
       style="height:680px; max-height:680px; overflow: auto; font-family: BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue', 'Helvetica', 'Arial', sans-serif;"
       ></div>
</template>

<script>
  import * as Util from '../Util.js';

  export default {
    data() {
      return {xxx: ''}
    },
    computed: {
      names() {
        return this.$store.state.wheelConfig.names;
      },
      wheelConfig() {
        return this.$store.state.wheelConfig;
      },
    },
    watch: {
      names(newValue, oldValue) {
        const div = document.getElementById('names');
        div.innerHTML = newValue.map(name => `<div>${name}</div>`).join('');
      },
      wheelConfig(newValue, oldValue) {
        const div = document.getElementById('names');
        div.innerHTML = newValue.names.map(name => `<div>${name}</div>`).join('');
      },
    },
    methods: {
    }
  }
</script>