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
    <b-modal :active.sync="displayLoginDialog" :width="640" scroll="keep">
      <div class="modal-card" style="width: auto">
        <header class="modal-card-head">
          <p class="modal-card-title">
            <i class="fa fa-save"></i>&nbsp;{{ $t('savedialog.Save wheel') }}
          </p>
        </header>
        <section class="modal-card-body can-go-dark">
          <p>
            {{ $t('savedialog.To save wheels') }}
          </p>
        </section>
        <footer class="modal-card-foot" style="justify-content:flex-end">
          <b-button @click="enter_inactive()">
            {{ $t('common.Cancel') }}
          </b-button>
          <input type="image" style="height:40px; margin-right:10px"
            alt="Sign in with Google"
            src="/images/btn_google_signin_dark_normal_web@2x.png"
            @click="enter_userIsLoggingIn('Google')"
          >
          <input type="image"
            alt="Sign in with Twitter"
            src="/images/sign-in-with-twitter-gray.png.img.fullhd.medium.png"
            @click="enter_userIsLoggingIn('Twitter')"
          >
        </footer>
      </div>
    </b-modal>

    <b-modal :active.sync="displaySaveDialog" :width="640" scroll="keep">
      <div class="modal-card" style="width: auto">
        <header class="modal-card-head">
          <p class="modal-card-title">
            <i class="fa fa-save"></i>&nbsp;{{ $t('savedialog.Save wheel') }}
          </p>
          <profiledropdown
            v-on:log-out="enter_inactive()"
            v-on:start-wait-animation="$emit('start-wait-animation')"
            v-on:stop-wait-animation="$emit('stop-wait-animation')"
            v-on:show-snackbar-message="(msg) => $emit('show-snackbar-message', msg)"
          ></profiledropdown>
        </header>
        <section class="modal-card-body can-go-dark">
          <div class="columns">
            <div class="column is-one-third">
              {{ $t('savedialog.Save as') }}
            </div>
            <div class="column">
              <b-input v-model="saveAsName" @keyup.native.enter="enter_savingWheel" ref="saveAsField" required maxlength="100"></b-input>
            </div>
          </div>
          <div class="columns">
            <div class="column is-one-third">
              {{ $t('savedialog.Your existing wheels') }}
            </div>
            <div class="column">
              <b-select :placeholder="$t('savedialog.Select a wheel')" v-model="existingWheelTitle" expanded>
                <option
                  v-for="wheel in wheels"
                  :value="wheel.title"
                  :key="wheel.title">
                  {{ wheel.title }}
                </option>
              </b-select>
            </div>
          </div>
        </section>
        <footer class="modal-card-foot" style="justify-content:flex-end">
          <b-button size="is-medium" @click="enter_inactive()">
            {{ $t('common.Cancel') }}
          </b-button>
          <b-button size="is-medium" type="is-primary" :disabled="!saveAsNameIsValid" @click="enter_savingWheel()">
            {{ $t('common.Save') }}
          </b-button>
        </footer>
      </div>
    </b-modal>
  </div>    
</template>

<script>
  import * as Firebase from './Firebase.js';
  import * as Util from './Util.js';
  import WheelConfig from './WheelConfig.js';
  import profiledropdown from './profiledropdown.vue';
  import * as ServerFunctions from './ServerFunctions.js';
  import './images/btn_google_signin_dark_normal_web@2x.png';
  import './images/sign-in-with-twitter-gray.png.img.fullhd.medium.png';

  export default {
    components: { profiledropdown },
    data() {
      return {
        wheels: [], fsm: 'inactive', saveAsName: '', existingWheelTitle: null
      }
    },
    computed: {
      saveAsNameIsValid() {
        return this.saveAsName.length > 0;
      },
      uid() {
        return this.$store.state.appStatus.userUid
      },
      displayLoginDialog: {
        get: function() {
          return this.fsm=='userIsPickingLoginMethod';
        },
        set: function(newValue) {
          if (newValue == false) this.fsm = 'inactive';
        }
      },
      displaySaveDialog: {
        get: function() {
          return this.fsm=='userIsEnteringName';
        },
        set: function(newValue) {
          if (newValue == false) this.fsm = 'inactive';
        }
      },
    },
    watch: {
      existingWheelTitle(newValue, oldValue) {
        this.saveAsName = newValue || '';
      }
    },
    methods: {
      async show() {
        if (this.$store.state.wheelConfig.isTooBigForDatabase()) {
          alert(this.$t('savedialog.Sorry, too many images'));
          return;
        }
        this.enter_loadingLibraries();
      },
      async enter_loadingLibraries() {
        this.fsm = 'loadingLibraries';
        this.$emit('start-wait-animation');
        await Firebase.loadLibraries();
        if (await Firebase.userIsLoggedIn()) {
          const user = await Firebase.getLoggedInUser();
          this.$store.commit('logInUser', {
            photoUrl: user.photoURL, displayName: user.displayName, uid: user.uid
          });
          this.$emit('stop-wait-animation');
          this.enter_loadingWheels();
        }
        else {
          this.$emit('stop-wait-animation');
          this.enter_userIsPickingLoginMethod();
        }
      },
      enter_inactive() {
        this.fsm = 'inactive';
      },
      enter_userIsPickingLoginMethod() {
        this.fsm = 'userIsPickingLoginMethod';
      },
      async enter_userIsLoggingIn(providerName) {
        this.fsm = 'userIsLoggingIn';
        try {
          Util.trackEvent('Wheel', `LoginForSaveAttempt-${providerName}`, '');
          this.$emit('start-wait-animation');
          const user = await Firebase.logIn(providerName, this.$i18n.locale);
          this.$store.commit('logInUser', {
            photoUrl: user.photoURL, displayName: user.displayName, uid: user.uid
          });
          await ServerFunctions.convertAccount(await user.getIdToken());
          this.$emit('stop-wait-animation');
          Util.trackEvent('Wheel', `LoginForSaveSuccess-${providerName}`, '');
          this.enter_loadingWheels();
        }
        catch (ex) {
          this.$emit('stop-wait-animation');
          Util.trackException(ex, {op: `LoginForSaveFailure-${providerName}`});
          Util.trackEvent('Wheel', `LoginForSaveFailure-${providerName}`, ex.toString());
          this.enter_authError(ex);
        }
      },
      async enter_loadingWheels() {
        this.fsm = 'loadingWheels';
        this.$emit('start-wait-animation');
        this.wheels = [''].concat(await Firebase.getWheels(this.uid));
        this.$emit('stop-wait-animation');
        this.existingWheelTitle = null;
        this.saveAsName = this.$store.state.wheelConfig.title;
        Firebase.logUserActivity(this.uid);
        setTimeout(() => { this.$refs.saveAsField.focus() }, 100);
        this.enter_userIsEnteringName();
      },
      enter_userIsEnteringName() {
        this.fsm = 'userIsEnteringName';
      },
      async enter_savingWheel() {
        this.fsm = 'savingWheel';
        this.$store.commit('setWheelTitle', this.saveAsName);
        const saveValues = this.$store.state.wheelConfig.getValues();
        try {
          this.$emit('start-wait-animation');
          await Firebase.saveWheel(this.uid, saveValues);
          this.$emit('stop-wait-animation');
          const message = this.$t('savedialog.Wheel saved successfully',
              {wheelTitle: Util.getHtmlAsText(this.saveAsName)}
          );
          this.$emit('show-snackbar-message', message);
          this.enter_inactive();
        }
        catch(ex) {
          this.$emit('stop-wait-animation');
          Util.trackException(ex);
          this.enter_authError(ex);
        }
      },
      enter_authError(exception) {
        this.fsm = 'authError';
        Firebase.logOut();
        this.$store.commit('logOutUser');
        this.$emit('auth-error', exception);
        this.enter_inactive();
      }
    }
  }
</script>
