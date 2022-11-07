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
  <div>
    <simpletoolbar></simpletoolbar>
    <br/>
    <div class="columns">
      <div class="column is-one-fifth">
      </div>
      <div class="column is-three-fifths">
        <fix-translation-card></fix-translation-card>
        <hr>
        <add-translation-card></add-translation-card>
        <hr>
        <translators-card></translators-card>
      </div>
      <div class="column is-one-fifth">
      </div>
    </div>
  </div>
</template>

<script>
  import simpletoolbar from '../simpletoolbar.vue';
  import fixTranslationCard from '../cards/fixTranslationCard.vue';
  import addTranslationCard from '../cards/addTranslationCard.vue';
  import translatorsCard from '../cards/translatorsCard.vue';
  
  export default {
    components: {
      simpletoolbar, fixTranslationCard, addTranslationCard, translatorsCard
    },
    mounted() {
      document.title = 'Translations';
    }
  }
</script>
