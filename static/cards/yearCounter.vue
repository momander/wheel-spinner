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
  <div style="height:4em">
    {{ title }}
    <transition name="fade" mode="in-out">
      <p v-if="displayFirstDiv" class="is-size-2" style="position:absolute">
        {{ formattedNumber }}
      </p>
    </transition>
    <transition name="fade" mode="in-out">
      <p v-if="!displayFirstDiv" class="is-size-2" style="position:absolute">
        {{ formattedNumber }}
      </p>
    </transition>
  </div>
</template>

<script>

  export default {
    props: {
      title: String,
      increment: Number,
      fps: Number
    },
    data() {
      return {
        number: 0, formattedNumber: '', displayFirstDiv: true
      }
    },
    mounted() {
      this.increaseNumber();
    },
    methods: {
      increaseNumber() {
        const startOfYear = new Date(new Date().getFullYear(), 0, 1);
        const now = new Date();
        this.number = (now-startOfYear) / 1000 * this.increment;
        this.formattedNumber = Math.round(this.number).toLocaleString();
        this.displayFirstDiv = !this.displayFirstDiv;
        const self = this;
        setTimeout(self.increaseNumber, 1000 / this.fps);
      }
    }
  }

</script>

<style scoped>
  .fade-leave-active {
    transition: opacity 0.5s ease-in;
  }
  .fade-enter-active {
    transition: opacity 0.5s;
  }
  .fade-enter, .fade-leave-to {
    opacity: 0.0;
  }
  .fade-leave, .fade-enter-to {
    opacity: 1.0;
  }
</style>
