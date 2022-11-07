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
  <span>
    <b-navbar type='is-info' style="box-shadow: 0 3px 3px 0 lightgrey">
      <template slot="brand">
        <b-navbar-item style="font-size:24px" @click="$router.push('/')">
          {{toolbarBrand}}
        </b-navbar-item>
      </template>
      <template slot="start">
        <b-taglist attached>
          <b-tag type="is-warning">
            Admin
          </b-tag>
          <b-tag type="is-dark">
            Carousel
          </b-tag>
        </b-taglist>
      </template>
      <template slot="end">
        <b-navbar-item @click="$store.commit('toggleDarkMode')">
          <i class="far fa-moon"></i>&nbsp;Dark mode
        </b-navbar-item>
      </template>
    </b-navbar>
    <section class="section" style="padding-top:1rem; padding-bottom:0; font-family:Quicksand">
      <div class="columns" :key="forceRefreshVariable">
        <div class="column is-3" v-for="(carousel, i) in carousels" :key="i">
          <div class="card can-go-dark" style="margin-top:10px; margin-bottom:10px">
            <div class="card-content" style="padding:10px">
              <div class="content">
                <b-carousel v-model="shownSlide" :arrow="false" :pause-info="false">
                  <b-carousel-item style="height: 150px;">
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
                            type="is-primary" size="is-small" outlined>
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
            </div>
          </div>
          <div style="display:flex">
            <div style="flex:1; display:flex; justify-content:left; margin-right:20px">
              <b-button style="width:100%" v-if="i>0" @click="moveSlideLeft(i)">
                <i class="fa fa-arrow-left"></i>
              </b-button>
            </div>
            <div style="flex:1; display:flex; justify-content:center; margin-right:20px">
              <b-button style="width:100%" type="is-primary" outlined @click="openCarouselDialog(carousels[i])">
                <i class="fa fa-pen"></i>
              </b-button>
            </div>
            <div style="flex:1; display:flex; justify-content:center; margin-right:20px">
              <b-button style="width:100%" type="is-danger" outlined @click="deleteSlide(i)">
                <i class="fa fa-trash"></i>
              </b-button>
            </div>
            <div style="flex:1; display:flex; justify-content:right">
              <b-button style="width:100%" v-if="i<carousels.length-1" @click="moveSlideRight(i)">
                <i class="fa fa-arrow-right"></i>
              </b-button>
            </div>
          </div>
        </div>
      </div>
      <div align="center">
        <b-button type="is-success" outlined style="width:8%; margin-top:30px; margin-right:100px" @click="createNewSlide()">
          <i class="fa fa-plus"></i>
        </b-button>
        <b-button type="is-warning" outlined style="width:8%; margin-top:30px;" @click="updateDatabase()">
          <i class="fas fa-cloud-upload-alt"></i>
        </b-button>
      </div>
    </section>

    <carouseldialog ref="carouseldialog">
    </carouseldialog>

  </span>
</template>

<script>
  import * as Util from '../Util.js';
  import * as Firebase from '../Firebase.js';
  import * as ServerFunctions from '../ServerFunctions.js';
  import carouseldialog from '../carouseldialog.vue';
  import { mapGetters } from "vuex";

  export default {
    components: { carouseldialog },
    data() {
      return {
        toolbarBrand: window.location.host,
        votedInPoll: false,
        shownSlide: 0,
        carousels: [],
        forceRefreshVariable: 0
      };
    },
    computed: {
      ...mapGetters(['darkMode'])
    },
    watch: {
      darkMode() {
        Util.updateColorStyles(this.darkMode, '#000', '#FFF');
      }
    },
    async mounted() {
      Firebase.loadLibraries();
      this.$store.dispatch('loadPreferences');
      this.carousels = await ServerFunctions.getCarousels();
    },
    methods: {
      startWaitAnimation() {
        this.waitAnimation = this.$buefy.loading.open({container: null});
      },
      stopWaitAnimation() {
        this.waitAnimation.close();
      },
      openCarouselDialog(carousel) {
        this.$refs.carouseldialog.show(carousel);
      },
      createNewSlide() {
        this.carousels.push({type: 'html', html: '', pollTitle: '', pollPrompt: '', pollOptions: [], voteMessage: ''});
        this.openCarouselDialog(this.carousels[this.carousels.length - 1]);
      },
      moveSlideLeft(index) {
        const temp = this.carousels[index - 1];
        this.carousels[index - 1] = this.carousels[index];
        this.carousels[index] = temp;
        this.forceRefreshVariable++;
      },
      moveSlideRight(index) {
        const temp = this.carousels[index + 1];
        this.carousels[index + 1] = this.carousels[index];
        this.carousels[index] = temp;
        this.forceRefreshVariable++;
      },
      deleteSlide(index) {
        this.$buefy.dialog.confirm({
          message: 'Delete slide?',
          confirmText: 'Delete',
          type: 'is-danger',
          onConfirm: () => this.carousels.splice(index, 1)
        });
      },
      updateDatabase() {
        this.$buefy.dialog.confirm({
          message: 'Upload carousel to database?',
          confirmText: 'Upload',
          type: 'is-warning',
          onConfirm: async () => {
            try {
              await Firebase.saveCarousel(this.carousels);
              this.carousels = await ServerFunctions.getCarousels();
            }
            catch (ex) {
              this.$buefy.dialog.alert({
                title: 'Error',
                message: ex,
                type: 'is-danger',
                hasIcon: true,
                icon: 'times-circle',
                iconPack: 'fa',
                ariaRole: 'alertdialog',
                ariaModal: true
              })
            }
          }
        });
      }
    }
  }
</script>

<style>
  .can-go-dark {}
</style>