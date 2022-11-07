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
  <section class="section">
    <div class="columns">
      <div class="column">
        <whatIsItForCard/>
        &nbsp;
        <sustainabilityCard/>
      </div>
      <div class="column">
        <howToUseCard/>
        &nbsp;
        <statsCard/>
      </div>
      <div class="column">
        <isMyDataPrivateCard/>
        &nbsp;
        <canTheWheelBeRiggedCard/>
      </div>
    </div>
  </section>
</template>

<script>

  import howToUseCard from './howToUseCard.vue';
  import isMyDataPrivateCard from './isMyDataPrivateCard.vue';
  import whatIsItForCard from './whatIsItForCard.vue';
  import statsCard from './statsCard.vue';
  import canTheWheelBeRiggedCard from './canTheWheelBeRiggedCard.vue';
  import sustainabilityCard from './sustainabilityCard.vue';

  export default {
    components: {
      howToUseCard, isMyDataPrivateCard, whatIsItForCard, statsCard,
      canTheWheelBeRiggedCard, sustainabilityCard
    }
  }

</script>