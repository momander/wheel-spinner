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
          <div id="auth-container"></div>
        </section>
        <footer class="modal-card-foot" style="justify-content:flex-end">
          <b-button @click="enter_inactive()">
            {{ $t('common.Cancel') }}
          </b-button>
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
              <b-input v-model="saveAsName" @keyup.native.enter="enter_savingWheel" ref="saveAsField" required maxlength="50"></b-input>
            </div>
          </div>
          <div class="columns">
            <div class="column is-one-third">
              {{ $t('savedialog.Your existing wheels') }}
            </div>
            <div class="column">
              <b-select :placeholder="$t('savedialog.Select a wheel')" v-model="existingWheelTitle" expanded>
                <option
                  v-for="wheel in savedWheels"
                  :value="wheel.title"
                  :key="wheel.title">
                  {{ wheel.title }}
                </option>
              </b-select>
            </div>
          </div>
          <p>{{ $t('savedialog.You will always be able to access') }}</p>
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
  import * as Util from './Util.js';
  import WheelConfig from './WheelConfig.js';
  import profiledropdown from './profiledropdown.vue';
  import { mapGetters } from "vuex";

  export default {
    components: { profiledropdown },
    data() {
      return {
        fsm: 'inactive', saveAsName: '', existingWheelTitle: null
      }
    },
    computed: {
      saveAsNameIsValid() {
        return this.saveAsName.length > 0;
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
      ...mapGetters([
        'savedWheels', 'wheelConfig', 'wheelTitle'
      ])
    },
    watch: {
      existingWheelTitle(newValue, oldValue) {
        this.saveAsName = newValue || '';
      }
    },
    methods: {
      async show() {
        if (this.wheelConfig.isTooBigForDatabase()) {
          Util.trackEvent('Wheel', 'WheelTooBigForDatabase', '');
          alert(this.$t('savedialog.Sorry, too many images'));
          return;
        }
        this.saveAsName = this.wheelTitle;
        this.enter_loadingLibraries();
      },
      async enter_loadingLibraries() {
        this.fsm = 'loadingLibraries';
        try {
          this.$emit('start-wait-animation');
          const userIsLoggedIn = await this.$store.dispatch('userIsLoggedIn');
          if (userIsLoggedIn) {
            this.enter_loadingWheels();
          }
          else {
            this.enter_userIsPickingLoginMethod();
          }
        }
        catch(ex) {
          this.enter_authError(ex);
        }
        finally {
          this.$emit('stop-wait-animation');
        }
      },
      enter_inactive() {
        this.fsm = 'inactive';
      },
      async enter_userIsPickingLoginMethod() {
        this.fsm = 'userIsPickingLoginMethod';
        this.$nextTick(async function() {
          try {
            Util.displayWindowsRtWarning();
            Util.trackEvent('Wheel', `LoginForSaveAttempt`, '');
            await this.$store.dispatch('loginWithUi', 'auth-container');
            Util.trackEvent('Wheel', `LoginForSaveSuccess`, '');
            this.enter_loadingWheels();
          }
          catch (ex) {
            Util.trackEvent('Wheel', `LoginForSaveFailure`, ex.toString());
            this.enter_authError(ex);
          }
        })
      },
      async enter_loadingWheels() {
        this.fsm = 'loadingWheels';
        this.$store.dispatch('loadSavedWheels');
        this.existingWheelTitle = null;
        this.saveAsName = this.wheelConfig.title || 'My wheel';
        setTimeout(() => { this.$refs.saveAsField.focus() }, 100);
        this.enter_userIsEnteringName();
      },
      enter_userIsEnteringName() {
        this.fsm = 'userIsEnteringName';
      },
      async enter_savingWheel() {
        this.fsm = 'savingWheel';
        this.$store.commit('setWheelTitle', this.saveAsName);
        try {
          this.$emit('start-wait-animation');
          await this.$store.dispatch('saveWheel', this.wheelConfig);
          this.$emit('stop-wait-animation');
          const message = this.$t('savedialog.Wheel saved successfully',
              {wheelTitle: Util.removeHtml(this.saveAsName)}
          );
          this.$emit('show-snackbar-message', message);
          this.$emit('reset-address-bar');
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
        this.$store.dispatch('logOut');
        this.$emit('auth-error', exception);
        this.enter_inactive();
      }
    }
  }
</script>
