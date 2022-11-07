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
            <i class="fas fa-user-alt"></i>&nbsp;{{ $t('common.My account') }}
          </p>
        </header>
        <section class="modal-card-body can-go-dark">
          <div id="auth-container"></div>
        </section>
        <footer class="modal-card-foot" style="justify-content:flex-end">
          <b-button @click="enter_inactive()">
            {{ $t('common.Close') }}
          </b-button>
        </footer>
      </div>
    </b-modal>

    <b-modal :active.sync="displayAccountActionsDialog" :width="640" scroll="keep">
      <div class="modal-card" style="width: auto">
        <header class="modal-card-head">
          <p class="modal-card-title">
            <i class="fas fa-user-alt"></i>&nbsp;{{ $t('common.My account') }}
          </p>
        </header>
        <section class="modal-card-body can-go-dark">
          <div class="columns is-vcentered">
            <div class="column is-narrow is-one-fifth">
              <img
                :src="$store.getters.userPhotoUrl"
                style="border-radius: 50%"
              >
            </div>
            <div class="column">
              <p class="is-size-4">
                {{ $t('profiledropdown.Signed in as', {name: $store.getters.userDisplayName}) }}
              </p>
            </div>
            <div class="column is-narrow">
              <b-button size="is-medium" @click="logOut()">
                {{ $t('profiledropdown.Sign out') }}
              </b-button>
            </div>
          </div>
          <b-button @click="$router.push('/export')">
            {{ $t('profiledropdown.Export my data') }}
          </b-button>
          <b-button type="is-danger" @click="confirmAndDelete()">
            {{ $t('profiledropdown.Delete my account') }}
          </b-button>
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

  export default {
    components: {},
    data() {
      return { fsm: 'inactive' }
    },
    computed: {
      displayLoginDialog: {
        get: function() {
          return this.fsm=='userIsPickingLoginMethod';
        },
        set: function(newValue) {
          if (newValue == false) this.fsm = 'inactive';
        }
      },
      displayAccountActionsDialog: {
        get: function() {
          return this.fsm == 'waitingForUserAccountAction';
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
        if (await this.$store.dispatch('userIsLoggedIn')) {
          this.$emit('stop-wait-animation');
          this.enter_waitingForUserAccountAction();
        }
        else {
          this.$emit('stop-wait-animation');
          this.enter_userIsPickingLoginMethod();
        }
      },
      enter_inactive() {
        this.fsm = 'inactive';
      },
      logOut() {
        this.$store.dispatch('logOut');
        this.enter_inactive();
      },
      confirmAndDelete() {
        this.$buefy.dialog.confirm({
          title: this.$t('profiledropdown.Delete account'),
          message: this.$t('profiledropdown.Are you sure you want to delete your account'),
          cancelText: this.$t('common.Cancel'),
          confirmText: this.$t('common.Delete'),
          type: 'is-danger',
          hasIcon: true,
          onConfirm: () => this.deleteAccount()
        })
      },
      async deleteAccount() {
        this.$emit('start-wait-animation');
        await this.$store.dispatch('deleteAccount');
        this.$store.dispatch('resetWheel');
        const msg = this.$t('profiledropdown.Your account and your saved wheels have been deleted');
        this.$emit('show-snackbar-message', msg);
        this.$emit('stop-wait-animation');
        this.enter_inactive();
      },
      enter_userIsPickingLoginMethod() {
        this.fsm = 'userIsPickingLoginMethod';
        this.$nextTick(async function() {
          try {
            Util.trackEvent('Wheel', `LoginForAccountAttempt`, '');
            await this.$store.dispatch('loginWithUi', 'auth-container');
            Util.trackEvent('Wheel', `LoginForAccountSuccess`, '');
            this.enter_waitingForUserAccountAction();
          }
          catch (ex) {
            Util.trackEvent('Wheel', `LoginForAccountFailure`, ex.toString());
            this.enter_authError(ex);
          }
        })
      },
      async enter_waitingForUserAccountAction() {
        this.fsm = 'waitingForUserAccountAction';
        this.$store.dispatch('logUserActivity');
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
