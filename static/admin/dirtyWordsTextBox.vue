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
  <b-input type="textarea" class="can-go-dark" v-model="formattedDirtyWords"
    rows="20"></b-input>
</template>

<script>
  export default {
    data() {
      return {formattedDirtyWords: ''}
    },
    methods: {
      setWords(words) {
        this.formattedDirtyWords = words.join('\n');
      },
      getWords() {
        // Filter out empty rows.
        return this.formattedDirtyWords.split('\n').filter(w => w);
      },
    }
  }
</script>