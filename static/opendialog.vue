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
          <div id="auth-container"></div>
        </section>
        <footer class="modal-card-foot" style="justify-content:flex-end">
          <b-button @click="enter_inactive()">
            {{ $t('common.Cancel') }}
          </b-button>
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
            <tr v-for="wheel in savedWheels" :key="wheel.title">
              <td>{{ wheel.title }}</td>
              <td>
                <b-button type="is-light" @click="enter_openingWheel(wheel.title)">
                  <i class="far fa-folder-open"></i>&nbsp;{{ $t('common.Open') }}
                </b-button>
              </td>
              <td v-if="online">
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
  import * as Util from './Util.js';
  import profiledropdown from './profiledropdown.vue';
  import { mapGetters } from "vuex";

  export default {
    components: { profiledropdown },
    data() {
      return { fsm: 'inactive' }
    },
    computed: {
      noSavedWheels() {
        return (this.savedWheels.length==0);
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
      ...mapGetters(['savedWheels', 'online'])
    },
    methods: {
      async show() {
        this.enter_loadingLibraries();
      },
      async enter_loadingLibraries() {
        this.fsm = 'loadingLibraries';
        this.$emit('start-wait-animation');
        let userIsLoggedIn;
        try {
          userIsLoggedIn = await this.$store.dispatch('userIsLoggedIn');
        }
        catch(ex) {
          this.enter_authError(ex);
        }
        finally {
          this.$emit('stop-wait-animation');
        }
        if (userIsLoggedIn) {
          this.enter_loadingWheels();
        }
        else {
          this.enter_userIsPickingLoginMethod();
        }
      },
      enter_inactive() {
        this.fsm = 'inactive';
      },
      enter_userIsPickingLoginMethod() {
        this.fsm = 'userIsPickingLoginMethod';
        this.$nextTick(async function() {
          try {
            Util.displayWindowsRtWarning();
            Util.trackEvent('Wheel', `LoginForOpenAttempt`, '');
            await this.$store.dispatch('loginWithUi', 'auth-container');
            Util.trackEvent('Wheel', `LoginForOpenSuccess`, '');
            this.enter_loadingWheels();
          }
          catch (ex) {
            Util.trackEvent('Wheel', `LoginForOpenFailure`, ex.toString());
            this.enter_authError(ex);
          }
        })
      },
      enter_userIsPickingWheel() {
        this.fsm = 'userIsPickingWheel';
      },
      async enter_loadingWheels() {
        this.fsm = 'loadingWheels';
        this.$emit('start-wait-animation');
        try {
          await this.$store.dispatch('loadSavedWheels');
        }
        catch(ex) {
          this.enter_authError(ex);
        }
        finally {
          this.$emit('stop-wait-animation');
        }
        this.enter_userIsPickingWheel();
      },
      enter_openingWheel(wheelTitle) {
        this.fsm = 'openingWheel';
        const wheel = this.savedWheels.find(w => w.title==wheelTitle);
        this.$store.dispatch('logWheelRead', wheelTitle);
        this.$store.commit('setWheelConfig', wheel);
        this.$store.commit('clearWinners');
        this.$emit('reset-wheel-rotation');
        this.$emit('reset-address-bar');
        this.enter_inactive();
      },
      enter_confirmingDelete(wheelTitle) {
        this.fsm = 'confirmingDelete';
        this.$buefy.dialog.confirm({
          title: this.$t('opendialog.Delete wheel'),
          message: this.$t('opendialog.Are you sure', {wheelTitle: Util.escapeHtml(wheelTitle)}),
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
        this.$store.dispatch('logOut');
        this.$emit('auth-error', exception);
        this.enter_inactive();
      },
      async enter_deletingWheel(wheelTitle) {
        this.fsm = 'deletingWheel';
        try {
          this.$emit('start-wait-animation');
          await this.$store.dispatch('deleteSavedWheel', wheelTitle);
          await this.$store.dispatch('loadSavedWheels');
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
