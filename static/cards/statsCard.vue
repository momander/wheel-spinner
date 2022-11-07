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
  <div class="card">
    <div class="card-header">
      <div class="card-header-title">
        <img src="/images/favicon-32x32.png">
        &nbsp;
        <h4 class="title is-4">
          This year's numbers
        </h4>
      </div>
    </div>
    <div class="card-content">
      <div class="content">
        <yearCounter title="Wheel spins" :increment="spinsPerSecond" :fps="0.333333"/>
        <br>
        <yearCounter title="Hours of spinning" :increment="hoursSpunPerSecond" :fps="hoursSpunPerSecond"/>
      </div>
    </div>
  </div>
</template>

<script>

  import yearCounter from './yearCounter.vue';
  import '../images/favicon-32x32.png';
  import * as ServerFunctions from '../ServerFunctions.js';

  export default {
    components: { yearCounter },
    data() {
      return {
        spinsPerSecond: 22.196,
        hoursSpunPerSecond: 0.061655
      }
    },
    async mounted() {
      const spinStats = await ServerFunctions.getSpinStats();
      if (spinStats.spinsPerSecond) this.spinsPerSecond = spinStats.spinsPerSecond;
      if (spinStats.hoursSpunPerSecond) this.hoursSpunPerSecond = spinStats.hoursSpunPerSecond;
    }
  }

</script>

<style scoped>
  img {
    height: 1.5em;
    vertical-align: baseline;
  }
</style>
