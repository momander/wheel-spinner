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
  <div class="card can-go-dark" style="margin-top:10px; border-radius:5px">
    <div class="card-content" style="padding:10px">
      <div class="content">
        <div v-if="appInfoVisible">
          <b-button @click="toggleVisibility" type="is-light" pack="fas"
            icon-left="chevron-circle-down" size="is-small" style="float:right; margin-top:-1px; border-radius:7px">
          </b-button>
          <span style="color:#999">
            {{ $t('appInfo.Version') }} {{ version }}
            <router-link to="/faq/changelog">
              <b-tag type="is-light is-rounded" rounded v-if="!userHasSeenCurrentVersion">
                New!
              </b-tag>
            </router-link>
          </span>
          <span style="float:right;margin-right:10px">
            <router-link to="/faq/changelog">
              Changelog
            </router-link>
          </span>
          <hr style="margin-top:0.5em">
          <b-carousel v-model="shownSlide" :interval="15000" :arrow="false" :pause-info="false">
            <b-carousel-item style="height: 150px;" v-for="(carousel, i) in carousels" :key="i">
              <section class="is-medium is-white">
                <div v-if="carousel.type=='html'" class="has-text-centered">
                  <span v-html="carousel.html"></span>
                </div>
                <div v-if="carousel.type=='poll'" class="has-text-centered">
                  <div v-if="!votedInPoll">
                    <p>
                      {{ carousel.pollPrompt }}
                    </p>
                    <b-button v-for="(option, j) in carousel.pollOptions" :key="j"
                      type="is-primary" size="is-small" outlined
                      @click="submitPollResponse(carousel.pollTitle, option, i)">
                      {{ option }}
                    </b-button>
                  </div>
                  <div v-else>
                    <p>
                      {{ carousel.voteMessage }}
                    </p>
                  </div>
                </div>
              </section>
            </b-carousel-item>
          </b-carousel>
        </div>
        <div v-else>
          <b-button @click="toggleVisibility" type="is-light" pack="fas" icon-left="chevron-circle-up" size="is-small" style="float:right;margin-top: -1px; border-radius:7px"></b-button>
          <span style="color:#999">
            {{ $t('appInfo.Version') }} {{ version }}
            <router-link to="/faq/changelog">
              <b-tag type="is-light is-rounded" rounded v-if="!userHasSeenCurrentVersion">
                New!
              </b-tag>
            </router-link>
          </span>
          <span style="float:right;margin-right:10px">
            <router-link to="/faq/changelog">
              Changelog
            </router-link>
          </span>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
  import * as Util from './Util.js';
  import * as ServerFunctions from './ServerFunctions.js';
  import { mapGetters } from "vuex";

  export default {
    async mounted() {
      this.carousels = await ServerFunctions.getCarousels();
    },
    data() {
      return {
        votedInPoll: false,
        shownSlide: 0,
        carousels: []
      }
    },
    computed: {
      ...mapGetters([
        'appInfoVisible', 'version', 'userHasSeenCurrentVersion'
      ])
    },
    methods: {
      toggleVisibility() {
        Util.trackEvent('Wheel', 'ToggleAppInfoVisibility', '');
        this.$store.commit('toggleAppInfoVisibility');
      },
      submitPollResponse(pollTitle, response, carouselIndex) {
        Util.trackEvent('Wheel', `${pollTitle}Poll`, `${response}`);
        this.votedInPoll = true;
      }
    }
  }
</script>
