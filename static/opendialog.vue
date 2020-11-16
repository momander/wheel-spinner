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
            <i class="fa fa-folder-open"></i>&nbsp;{{ $t('opendialog.Open wheel') }}
          </p>
        </header>
        <section class="modal-card-body can-go-dark">
          <p>
            {{ $t('opendialog.To open wheels') }}
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

    <b-modal :active.sync="displayWheelDialog" :width="640" scroll="keep">
      <div class="modal-card" style="width: auto">
        <header class="modal-card-head">
          <p class="modal-card-title">
            <i class="fa fa-folder-open"></i>&nbsp;{{ $t('opendialog.Open wheel') }}
          </p>
          <profiledropdown
            v-on:log-out="enter_inactive()"
            v-on:start-wait-animation="$emit('start-wait-animation')"
            v-on:stop-wait-animation="$emit('stop-wait-animation')"
            v-on:show-snackbar-message="(msg) => $emit('show-snackbar-message', msg)"
          ></profiledropdown>
        </header>
        <section class="modal-card-body can-go-dark">
          <table class="table can-go-dark">
            <tr v-for="wheel in wheels" :key="wheel.title">
              <td>{{ wheel.title }}</td>
              <td>
                <b-button type="is-light" @click="enter_openingWheel(wheel.title)">
                  <i class="far fa-folder-open"></i>&nbsp;{{ $t('common.Open') }}
                </b-button>
              </td>
              <td v-if="$store.state.appStatus.online">
                <b-button type="is-light" @click="enter_confirmingDelete(wheel.title)">
                  <i class="far fa-trash-alt"></i>&nbsp;{{ $t('common.Delete') }}
                </b-button>
              </td>
            </tr>
            <tr v-if="noSavedWheels">
              <td>
                {{ $t('opendialog.No wheels found')}}
              </td>
            </tr>
          </table>
        </section>
        <footer class="modal-card-foot" style="justify-content:flex-end">
          <b-button size="is-medium" @click="enter_inactive()">
            {{ $t('common.Close') }}
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
        wheels: [], fsm: 'inactive'
      }
    },
    computed: {
      noSavedWheels() {
        return (this.wheels.length==0);
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
      displayWheelDialog: {
        get: function() {
          const states = ['userIsPickingWheel', 'confirmingDelete', 'deletingWheel'];
          return states.includes(this.fsm);
        },
        set: function(newValue) {
          if (newValue == false) this.fsm = 'inactive';
        }
      },
    },
    methods: {
      async show() {
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
          Util.trackEvent('Wheel', `LoginForOpenAttempt-${providerName}`, '');
          this.$emit('start-wait-animation');
          const user = await Firebase.logIn(providerName, this.$i18n.locale);
          this.$store.commit('logInUser', {
            photoUrl: user.photoURL, displayName: user.displayName, uid: user.uid
          });
          await ServerFunctions.convertAccount(await user.getIdToken());
          this.$emit('stop-wait-animation');
          Util.trackEvent('Wheel', `LoginForOpenSuccess-${providerName}`, '');
          this.enter_loadingWheels();
        }
        catch (ex) {
          this.$emit('stop-wait-animation');
          Util.trackException(ex, {op: `LoginForOpenFailure-${providerName}`});
          Util.trackEvent('Wheel', `LoginForOpenFailure-${providerName}`, ex.toString());
          this.enter_authError(ex);
        }
      },
      enter_userIsPickingWheel() {
        this.fsm = 'userIsPickingWheel';
      },
      async enter_loadingWheels() {
        this.fsm = 'loadingWheels';
        this.$emit('start-wait-animation');
        this.wheels = await Firebase.getWheels(this.uid);
        this.$emit('stop-wait-animation');
        Firebase.logUserActivity(this.uid);
        this.enter_userIsPickingWheel();
      },
      enter_openingWheel(wheelTitle) {
        this.fsm = 'openingWheel';
        Firebase.logWheelRead(this.uid, wheelTitle);
        const result = this.wheels.find(wheel => wheel.title==wheelTitle);
        const wheelConfig = new WheelConfig(this.$t('common.We have a winner!'));
        wheelConfig.loadValues(result);
        this.$store.commit('setWheelConfig', wheelConfig);
        this.$emit('reset-wheel-rotation');
        this.enter_inactive();
      },
      enter_confirmingDelete(wheelTitle) {
        this.fsm = 'confirmingDelete';
        this.$buefy.dialog.confirm({
          title: this.$t('opendialog.Delete wheel'),
          message: this.$t('opendialog.Are you sure', {wheelTitle: Util.getHtmlAsText(wheelTitle)}),
          cancelText: this.$t('common.Cancel'),
          confirmText: this.$t('common.Delete'),
          type: 'is-danger',
          hasIcon: true,
          onConfirm: () => this.enter_deletingWheel(wheelTitle),
          onCancel: () => this.enter_userIsPickingWheel()
        })
      },
      enter_authError(exception) {
        this.fsm = 'authError';
        Firebase.logOut();
        this.$store.commit('logOutUser');
        this.$emit('auth-error', exception);
        this.enter_inactive();
      },
      async enter_deletingWheel(wheelTitle) {
        this.fsm = 'deletingWheel';
        try {
          this.$emit('start-wait-animation');
          await Firebase.deleteWheel(this.uid, wheelTitle);
          this.wheels = await Firebase.getWheels(this.uid);
          this.$emit('stop-wait-animation');
          this.enter_userIsPickingWheel();
        }
        catch (ex) {
          Util.trackException(ex);
          this.$emit('stop-wait-animation');
          this.enter_authError(ex);
        }
      },
    }
  }
</script>
