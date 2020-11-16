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
    <admintoolbar
      v-on:log-in="logIn"
      v-on:log-out="logOut"
      v-on:open-users-dialog="openUsersDialog()"
      v-on:open-payments-dialog="openPaymentsDialog()"
      v-on:open-dirtywords-dialog="openDirtyWordsDialog()"
    ></admintoolbar>
    <section class="section" style="padding-top:1rem; padding-bottom:0; font-family:Quicksand">
      <div class="columns">
        <div class="column is-6">
          <spinningwheel ref="spinningwheel"
          ></spinningwheel>
        </div>
        <div class="column is-3">
          <textbox></textbox>
        </div>
        <div class="column is-3">
          <b-field label="Shared wheel link">
            <b-input v-model="linkInTextBox"></b-input>
          </b-field>
          <b-button type="is-info" @click="loadSharedWheel" :disabled="!userIsLoggedIn">
            <i class="far fa-folder-open"></i> Open
          </b-button>
          <b-button type="is-info" @click="loadNextSharedWheel" :disabled="!userIsLoggedIn">
            <i class="fas fa-chevron-circle-right"></i> Open next
            <span style="font-size:0.7em">(Ctrl N)</span>
          </b-button>
          <br><br>
          <b-button @click="translateSharedWheel" :disabled="!userIsLoggedIn">
            <i class="fas fa-globe-americas"></i> Translate
            <span style="font-size:0.7em">(Ctrl T)</span>
          </b-button>
          <b-button @click="searchFacebook" :disabled="!userIsLoggedIn">
            <i class="fab fa-facebook-square"></i> Search
          </b-button>
          <br><br>
          <b-button type="is-success" @click="approveWheel" :disabled="!userIsLoggedIn">
            <i class="far fa-thumbs-up"></i> Approve
            <span style="font-size:0.7em">(Ctrl A)</span>
          </b-button>
          <b-button type="is-danger" @click="deleteWheel" :disabled="!userIsLoggedIn">
            <i class="fas fa-trash-alt"></i> Delete
          </b-button>
          <br><br>
          <table class="table is-bordered can-go-dark">
            <tr>
              <td><b>Wheels in queue</b></td>
              <td colspan="2"><span class="is-pulled-right"><b>
                {{ $store.state.reviewQueueLength | localestring }}
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
  </span>
</template>

<script>
  import admintoolbar from './admintoolbar.vue';
  import spinningwheel from '../spinningwheel.vue';
  import textbox from './textbox.vue';
  import usersdialog from './usersdialog.vue';
  import paymentsdialog from './paymentsdialog.vue';
  import dirtywordsdialog from './dirtywordsdialog.vue';
  import * as Util from '../Util.js';
  import * as Firebase from '../Firebase.js';
  import { timeago, dollaramount, firestoremilliseconds, localestring, percent } from './filters.js';

  export default {
    components: {
      admintoolbar, spinningwheel, textbox, usersdialog, paymentsdialog,
      dirtywordsdialog
    },
    filters: {
      timeago, dollaramount, firestoremilliseconds, localestring, percent
    },
    data() {
      return {
        linkInTextBox: '', waitAnimation: ''
      };
    },
    computed: {
      wheel() {
        return this.$store.state.wheel;
      },
      earningsPerReview() {
        return this.$store.state.earningsPerReviewDoc.value;
      },
      user() {
        return this.$store.state.user;
      },
      darkMode() {
        return this.$store.getters.darkMode;
      },
      userIsLoggedIn() {
        return this.$store.state.appStatus.userIsLoggedIn;
      },
      preferences() {
        return this.$store.state.preferences;
      },
      darkMode() {
        return this.$store.getters.darkMode
      },
      pageColor() {
        return this.$store.state.wheelConfig.pageBackgroundColor
      }
    },
    watch: {
      wheelConfig() {
        Util.updateColorStyles(this.darkMode, '#000', this.pageColor);
      },
      preferences() {
        Util.updateColorStyles(this.darkMode, '#000', this.pageColor);
      },
    },
    mounted() {
      this.refreshWheelOnFontLoad();
      Firebase.loadLibraries();
      const self = this;
      document.addEventListener('keyup', event => {
        if (event.ctrlKey) {
          if (event.key == 'n') self.loadNextSharedWheel();
          if (event.key == 'a') self.approveWheel();
          if (event.key == 't') self.translateSharedWheel();
        }
      });
    },
    methods: {
      async logIn() {
        const user = await Firebase.logIn('Google', 'en');
        this.$store.dispatch('bindFirestore');
        const idToken = await user.getIdToken();
        this.$store.commit('logInUser', {
          photoUrl: user.photoURL, displayName: user.displayName, uid: user.uid,
          idToken: idToken
        });
        this.$store.dispatch('bindUser', user.uid);
        this.$store.dispatch('resetSessionReviews', user.uid);
        const self = this;
        setInterval(async () => {
          // Refresh ID token.
          const idToken = await user.getIdToken(true);
          self.$store.commit('logInUser', {
            photoUrl: user.photoURL, displayName: user.displayName, uid: user.uid,
            idToken: idToken
          });
        }, 1000*60*55);
        setInterval(async () => {
          self.$store.dispatch('updateReviewQueueLength');
        }, 1000*60);
        this.$store.dispatch('updateReviewQueueLength');
      },
      logOut() {
        Firebase.logOut();
        this.$store.commit('logOutUser');
      },
      refreshWheelOnFontLoad() {
        if (document.fonts) {
          const self = this;
          document.fonts.ready.then(function() {
            self.$refs.spinningwheel.refresh();
          })
        }
      },
      async loadSharedWheel() {
        const match = this.linkInTextBox.match(/(\w\w\w\-\w\w\w)/);
        if (match) {
          const path = match[1];
          try {
            this.startWaitAnimation();
            await this.$store.dispatch('loadWheel', path);
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
          await this.$store.dispatch('getNextSharedWheelForReview');
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
          await this.$store.dispatch('translateWheel');
        }
        catch (ex) {
          alert(ex);
        }
        this.stopWaitAnimation();
      },
      searchFacebook() {
        const searchTerm = 'wheelofnames ' + this.wheel.path;
        window.open('https://www.facebook.com/search/top/?q=' + searchTerm);
      },
      async approveWheel() {
        if (!this.wheel.path) return;
        try {
          this.startWaitAnimation();
          await this.$store.dispatch('approveWheel');
        }
        catch(ex) {
          alert(ex);
        }
        this.stopWaitAnimation();
      },
      async deleteWheel() {
        if (!this.wheel.path) return;
        if (confirm('Are you sure you want to delete this wheel?')) {
          try {
            this.startWaitAnimation();
            await this.$store.dispatch('deleteWheel');
            this.linkInTextBox = '';
          }
          catch(ex) {
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
      getElementsByClassName(classNames) {
        const retVal = [];
        for (const className of classNames) {
          for (const el of document.getElementsByClassName(className)) {
            retVal.push(el);
          }
        }
        return retVal;
      }
    }
  }
</script>

<style>
  .can-go-dark {}
</style>
