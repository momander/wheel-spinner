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
    <div>
      <p class="is-size-2 has-text-centered" style="color:#34a853">
        {{ header }}
      </p>
      <p class="has-text-centered">
        {{ description }}
      </p>
    </div>
  </div>
</template>

<script>

  export default {
    props: {
      header: String,
      description: String
    },
  }

</script>

<style scoped>
</style>
