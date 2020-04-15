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
  <b-dropdown position="is-bottom-left" aria-role="list">
    <span slot="trigger" role="button" class="button" style="cursor: pointer">
      <img
        :src="$store.state.appStatus.userPhotoUrl"
        style="height:30px; border-radius: 50%"
      >
      &nbsp;
      <i class="fas fa-caret-down"></i>
    </span>
    <b-dropdown-item disabled aria-role="listitem">
      {{ $t('profiledropdown.Signed in as', {name: $store.state.appStatus.userDisplayName}) }}
    </b-dropdown-item>
    <b-dropdown-item @click="logOut()" aria-role="listitem">
      {{ $t('profiledropdown.Sign out') }}
    </b-dropdown-item>
    <b-dropdown-item has-link aria-role="listitem">
      <a href="/view-account.html">
        {{ $t('profiledropdown.Export my data') }}
      </a>
    </b-dropdown-item>
    <b-dropdown-item @click="confirmAndDelete()" aria-role="listitem">
      {{ $t('profiledropdown.Delete my account') }}
    </b-dropdown-item>
  </b-dropdown>
</template>

<script>
  import * as Firebase from './Firebase.js';

  export default {
    methods: {
      logOut() {
        Firebase.logOut();
        this.$emit('log-out');
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
        await Firebase.deleteAccount(this.$store.state.appStatus.userUid);
        Firebase.logOut();
        const msg = this.$t('profiledropdown.Your account and your saved wheels have been deleted');
        this.$emit('show-snackbar-message', msg);
        this.$emit('stop-wait-animation');
        this.$emit('log-out');
      }
    }
  }
</script>
