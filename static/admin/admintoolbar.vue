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
  <b-navbar type='is-info' style="box-shadow: 0 3px 3px 0 lightgrey">
    <template slot="brand">
      <b-navbar-item style="font-size:24px" href="/">
        {{toolbarBrand}}
      </b-navbar-item>
    </template>
    <template slot="start">
      <b-tag type="is-warning" style="margin-top:1.2em">
        Admin
      </b-tag>
    </template>
    <template slot="end">
      <b-navbar-item @click="$store.commit('toggleDarkMode')">
        <i class="far fa-moon"></i>&nbsp;Dark mode
      </b-navbar-item>
      <b-navbar-item v-show="loggedIn" @click="$emit('open-users-dialog')">
        <i class="fas fa-user"></i>&nbsp;Admins
      </b-navbar-item>
      <b-navbar-item v-show="loggedIn" @click="$emit('open-payments-dialog')">
        <i class="fas fa-money-check-alt"></i>&nbsp;Earnings
      </b-navbar-item>
      <b-navbar-item v-show="loggedIn" @click="$emit('open-dirtywords-dialog')">
        <i class="far fa-hand-paper"></i>&nbsp;Banned words
      </b-navbar-item>
      <b-navbar-item v-show="loggedIn">
        <img
          :src="$store.state.appStatus.userPhotoUrl"
          style="height:30px; border-radius: 50%"
        >
        &nbsp;
        {{ $store.state.appStatus.userDisplayName }}
      </b-navbar-item>
      <b-navbar-item v-show="!this.loggedIn" @click="$emit('log-in')">
        <i class="fas fa-sign-in-alt"></i>&nbsp;Log in
      </b-navbar-item>
      <b-navbar-item v-show="this.loggedIn" @click="$emit('log-out')">
        <i class="fas fa-sign-out-alt"></i>&nbsp;Log out
      </b-navbar-item>
    </template>
  </b-navbar>
</template>

<script>
  import * as Util from '../Util.js';

  export default {
    data() {
      return {
        toolbarBrand: window.location.host
      };
    },
    computed: {
      loggedIn() {
        return this.$store.state.appStatus.userIsLoggedIn;
      }
    },
    watch: {
    },
  }
</script>
