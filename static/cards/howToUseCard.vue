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
          How to use the wheel spinner
        </h4>
      </div>
    </div>
    <div class="card-content">
      <div class="content">
        <p>
          It's easy: type in your entries in the textbox to the right of the
          wheel, then click the wheel to spin it and get a random winner.
          To make the wheel your own by customizing the colors, sounds, and spin
          time, click
          <span class="tag is-info"><i class="fas fa-palette"></i>&nbsp;Customize</span>
          at the top of the page.
        </p>
      </div>
    </div>
  </div>
</template>

<script>
  import '../images/favicon-32x32.png';

  export default {
  }
</script>

<style scoped>
  img {
    height: 1.5em;
    vertical-align: baseline;
  }
</style>
