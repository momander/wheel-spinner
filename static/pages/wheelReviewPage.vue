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
  <div style="height: 100%">
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
            Wheel review
          </b-tag>
        </b-taglist>
      </template>
      <template slot="end">
        <b-navbar-item @click="$store.commit('toggleDarkMode')">
          <i class="far fa-moon"></i>&nbsp;Dark mode
        </b-navbar-item>
        <b-navbar-item @click="openUsersDialog()">
          <i class="fas fa-user"></i>&nbsp;Admins
        </b-navbar-item>
        <b-navbar-item @click="openPaymentsDialog()">
          <i class="fas fa-money-check-alt"></i>&nbsp;Earnings
        </b-navbar-item>
        <b-navbar-item @click="openDirtyWordsDialog()">
          <i class="far fa-hand-paper"></i>&nbsp;Banned words
        </b-navbar-item>
      </template>
    </b-navbar>
    <section class="section" style="padding-top:1rem; padding-bottom:0; font-family:Quicksand; height:100%">
      <div class="columns" style="height:100%">
        <div class="column is-6">
          <spinningwheel ref="spinningwheel"
          ></spinningwheel>
        </div>
        <div class="column is-3" style="height:90%; display:flex; flex-direction:column">
          <adminwheeltitle :title="wheelTitle"/>
          <adminwheeldescription v-if="wheelDescription" :description="wheelDescription"/>
          <admintextbox/>
        </div>
        <div class="column is-3">
          <b-field label="Shared wheel link">
            <b-input v-model="linkInTextBox"></b-input>
          </b-field>
          <b-button type="is-info" @click="loadNextSharedWheel">
            <i class="fas fa-chevron-circle-right"></i> Open next
            <span style="font-size:1.2em">Ⓝ</span>
          </b-button>
          <b-button type="is-info" @click="loadSharedWheel">
            <i class="far fa-folder-open"></i> Open
          </b-button>
          <br><br>
          <b-button @click="translateSharedWheel">
            <i class="fas fa-globe-americas"></i> Translate
            <span style="font-size:1.2em">Ⓣ</span>
          </b-button>
          <br><br>
          <b-button type="is-success" @click="approveWheel">
            <i class="far fa-thumbs-up"></i> Approve
            <span style="font-size:1.2em">Ⓐ</span>
          </b-button>
          <b-button type="is-danger" @click="deleteWheel">
            <i class="fas fa-trash-alt"></i> Delete
          </b-button>
          <br><br>
          <table class="table is-bordered can-go-dark">
            <tr>
              <td><b>Wheels in queue</b></td>
              <td colspan="2"><span class="is-pulled-right"><b>
                {{ reviewQueueLength | localestring }}
              </b></span></td>
            </tr>
            <tr>
              <td>Reviewed by me</td>
              <td>
                <span class="is-pulled-right">
                  <b-tooltip label="How many wheels you have reviewed in this session" position="is-left">
                    {{ user.sessionReviews }}
                  </b-tooltip>
                </span>
              </td>
              <td><span class="is-pulled-right">
                <b-tooltip label="How many wheels you have reviewed since the last payment" position="is-left">
                  {{ user.totalReviews }}
                </b-tooltip>
              </span></td>
            </tr>
            <tr>
              <td>Earnings</td>
              <td>
                <b-tooltip label="How much you have earned in this session" position="is-left">
                  {{ user.sessionReviews * earningsPerReview | dollaramount }}
                </b-tooltip>
              </td>
              <td>
                <b-tooltip label="How much you have earned since the last payment" position="is-left">
                  {{ user.totalReviews * earningsPerReview | dollaramount }}
                </b-tooltip>
              </td>
            </tr>
          </table>
          <table class="table is-bordered can-go-dark">
            <tr>
              <td><b>Status</b></td>
              <td><b>{{ wheel.reviewStatus }}</b></td>
            </tr>
            <tr>
              <td>Created</td>
              <td>{{ wheel.created | firestoremilliseconds | timeago }}</td>
            </tr>
            <tr>
              <td>Last viewed</td>
              <td>{{ wheel.lastRead | firestoremilliseconds | timeago }}</td>
            </tr>
            <tr>
              <td>Views</td>
              <td>{{ wheel.readCount | localestring }}</td>
            </tr>
            <tr>
              <td><i class="far fa-thumbs-up"></i> prediction</td>
              <td>{{ wheel.predictedApproval | percent }}</td>
            </tr>
          </table>
        </div>
      </div>
    </section>

    <usersdialog ref="usersdialog"/>
    <paymentsdialog ref="paymentsdialog"/>
    <dirtywordsdialog ref="dirtywordsdialog"/>
  </div>
</template>

<script>
  import spinningwheel from '../spinningwheel.vue';
  import admintextbox from '../admintextbox.vue';
  import adminwheeltitle from '../adminwheeltitle.vue';
  import adminwheeldescription from '../adminwheeldescription.vue';
  import usersdialog from '../usersdialog.vue';
  import paymentsdialog from '../paymentsdialog.vue';
  import dirtywordsdialog from '../dirtywordsdialog.vue';
  import * as Util from '../Util.js';
  import * as Firebase from '../Firebase.js';
  import * as ServerFunctions from '../ServerFunctions.js';
  import WheelConfig from '../WheelConfig.js';
  import { timeago, dollaramount, firestoremilliseconds, localestring, percent } from '../filters.js';
  import { mapGetters } from "vuex";

  export default {
    components: {
      spinningwheel, admintextbox, adminwheeltitle, adminwheeldescription,
      usersdialog, paymentsdialog, dirtywordsdialog
    },
    filters: {
      timeago, dollaramount, firestoremilliseconds, localestring, percent
    },
    data() {
      return {
        linkInTextBox: '', waitAnimation: '',
        toolbarBrand: window.location.host, earningsPerReview: 0,
        reviewQueueLength: '', wheel: {}, user: {}
      };
    },
    computed: {
      wheelTitle() {
        return this.wheelConfig.title;
      },
      wheelDescription() {
        return this.wheelConfig.description;
      },
      pageColor() {
        return this.wheelConfig.pageBackgroundColor;
      },
      dialogIsOpen() {
        return (
          this.$refs.usersdialog.isShowing() ||
          this.$refs.paymentsdialog.isShowing() ||
          this.$refs.dirtywordsdialog.isShowing()
        );
      },
      ...mapGetters(['wheelConfig', 'darkMode'])
    },
    watch: {
      wheelConfig() {
        Util.updateColorStyles(this.darkMode, '#000', this.pageColor);
      },
      darkMode() {
        Util.updateColorStyles(this.darkMode, '#000', this.pageColor);
      },
    },
    async mounted() {
      await this.resetSessionReviews();
      this.$store.dispatch('loadPreferences');
      this.$store.commit('setGrayEmptyWheel');
      this.loadUser();
      this.startQueueLengthUpdates();
      document.addEventListener('keyup', this.onKeyUp);
      this.refreshWheelOnFontLoad();
      this.earningsPerReview = await Firebase.getEarningsPerReview();
    },
    beforeDestroy() {
      document.removeEventListener('keyup', this.onKeyUp);
    },
    methods: {
      async resetSessionReviews() {
        const uid = await Firebase.getUid();
        await Firebase.resetSessionReviews(uid);
      },
      async loadUser() {
        const uid = await Firebase.getUid();
        const admins = await Firebase.getAdmins(uid);
        this.user = admins.find(admin => admin.uid==uid);
      },
      startQueueLengthUpdates() {
        this.updateReviewQueueLength();
        const self = this;
        setInterval(async () => {
          self.updateReviewQueueLength();
        }, 1000*60);
      },
      onKeyUp(event) {
        if (!this.dialogIsOpen) {
          if (event.key == 'n') this.loadNextSharedWheel();
          if (event.key == 'a') this.approveWheel();
          if (event.key == 't') this.translateSharedWheel();
        }
      },
      refreshWheelOnFontLoad() {
        if (document.fonts) {
          const self = this;
          document.fonts.ready.then(function() {
            self.$refs.spinningwheel.refresh();
          })
        }
      },
      async updateReviewQueueLength() {
        const idToken = await Firebase.getUserIdToken();
        const queueLength = await ServerFunctions.getNumberOfWheelsInReviewQueue(idToken);
        this.reviewQueueLength = queueLength;
      },
      async loadSharedWheel() {
        const match = this.linkInTextBox.match(/(\w\w\w\-\w\w\w)/);
        if (match) {
          const path = match[1];
          try {
            this.startWaitAnimation();
            this.wheel = await Firebase.getSharedWheel(path);
            const wheelConfig = new WheelConfig();
            wheelConfig.loadValues(this.wheel.config);
            this.$store.commit('setWheelConfig', wheelConfig);
          }
          catch (ex) {
            alert(ex);
          }
          this.stopWaitAnimation();
        }
      },
      async loadNextSharedWheel() {
        try {
          this.startWaitAnimation();
          this.wheel = await Firebase.getNextSharedWheelForReview();
          const wheelConfig = new WheelConfig();
          wheelConfig.loadValues(this.wheel.config);
          this.$store.commit('setWheelConfig', wheelConfig);
          this.linkInTextBox = this.wheel.path || '';
        }
        catch (ex) {
          alert(ex);
        }
        this.stopWaitAnimation();
      },
      async translateSharedWheel() {
        if (!this.wheel.path) return;
        try {
          this.startWaitAnimation();
          const idToken = await Firebase.getUserIdToken();
          const texts = this.wheelConfig.entries.map(e=>e.text||'');
          const results = await Promise.all([
            ServerFunctions.translate(idToken, [this.wheelTitle]),
            ServerFunctions.translate(idToken, [this.wheelDescription]),
            ServerFunctions.translate(idToken, texts)
          ]);
          this.$store.commit('setWheelTitle', results[0][0]);
          this.$store.commit('setWheelDescription', results[1][0]);
          const trTexts = results[2];
          const newEntries = this.wheelConfig.entries.slice(0);
          for (let i=0; i<trTexts.length; i++) {
            newEntries[i].text = trTexts[i].trim();
          }
          this.$store.commit('setEntries', newEntries);
        }
        catch (ex) {
          console.error(ex);
          alert(ex);
        }
        this.stopWaitAnimation();
      },
      async approveWheel() {
        if (!this.wheel.path) return;
        if (this.wheel.reviewStatus=='Approved') return;
        try {
          this.startWaitAnimation();
          await Firebase.approveSharedWheel(this.wheel.path);
          this.loadUser();
          this.wheel.reviewStatus = 'Approved';
          this.reviewQueueLength -= 1;
        }
        catch(ex) {
          console.error(ex);
          alert(ex);
        }
        this.stopWaitAnimation();
      },
      async deleteWheel() {
        if (!this.wheel.path) return;
        if (confirm('Are you sure you want to delete this wheel?')) {
          try {
            this.startWaitAnimation();
            const newReview = (this.wheel.reviewStatus!='Approved');
            await Firebase.deleteSharedWheel(this.wheel.path, newReview);
            this.$store.commit('setGrayEmptyWheel');
            this.linkInTextBox = '';
            this.reviewQueueLength -= 1;
            this.loadUser();
          }
          catch(ex) {
            console.error(ex);
            alert(ex);
          }
          this.stopWaitAnimation();
        }
      },
      startWaitAnimation() {
        this.waitAnimation = this.$buefy.loading.open({container: null});
      },
      stopWaitAnimation() {
        this.waitAnimation.close();
      },
      openUsersDialog() {
        this.$refs.usersdialog.show();
      },
      openPaymentsDialog() {
        this.$refs.paymentsdialog.show();
      },
      openDirtyWordsDialog() {
        this.$refs.dirtywordsdialog.show();
      },
    }
  }
</script>

<style>
  .can-go-dark {}
</style>
