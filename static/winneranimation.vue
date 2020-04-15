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
  <div class="animated-background" ref="overlay">
    <div class="content">
      <p class="animated-text" style="color:#FFFFFF">
        {{ winnerText }}
      </p>
    </div>
  </div>
</template>

<script>
  import * as Util from './Util.js';

  export default {
    data() {
      return {winnerText: ''}
    },
    methods: {
      show(winnerText) {
        const shortWinnerText = Util.extractDisplayText(winnerText, true);
        if (shortWinnerText) {
          this.winnerText = shortWinnerText;
          this.$refs.overlay.style.display = 'block';
          setTimeout(() => {
            this.$refs.overlay.style.display = 'none';
          }, 6000);
        }
      }
    }
  }
</script>

<style scoped>
  .animated-background {
    text-align: center;
    position: fixed;
    display: none;
    width: 100%;
    height: 100%;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-color: rgba(0,0,0,0.7);
    z-index: 45;
    animation-name: fade-animation;
    animation-duration: 6s;
    animation-timing-function: ease-in;
    animation-delay: 0s;
    animation-iteration-count: 1;
    animation-direction: normal;
  }
  @keyframes fade-animation {
    0% {
      opacity: 0.7;
    }
    100% {
      opacity: 0;
    }
  }
  .content {
    margin-left: auto;
    margin-right: auto;
    position: relative;
    top: 50%;
    transform: translateY(-50%);
  }
  .animated-text {
    color: #FFFFFF;
    font-size: 200px;
    font-family: Quicksand;
    animation-name: zoom-animation;
    animation-duration: 6s;
    animation-timing-function: ease-in;
    animation-delay: 0s;
    animation-iteration-count: 1;
    animation-direction: normal;
  }
  @keyframes zoom-animation {
    0% {
      transform: scale(0.03);
    }
    100% {
      transform: scale(5);
      opacity: 0;
    }
  }
</style>
