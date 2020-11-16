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
  <b-modal :active.sync="twitterDialogVisible" :width="640" scroll="keep">
    <div class="modal-card" style="width: auto">
      <header class="modal-card-head">
        <p class="modal-card-title">
          <i class="fab fa-twitter"></i>&nbsp;{{ $t('common.Import Twitter users') }}
        </p>
      </header>
      <section class="modal-card-body can-go-dark">
        <b-field>
          <b-input :placeholder="$t('twitterdialog.Hashtag, like #gdg')" v-model="searchTerm" @keyup.native.enter="getTwitterUsers" ref="searchTermField"></b-input>
        </b-field>
        <p style="color:#999" v-html="$t('twitterdialog.This search will fetch')">
        </p>
      </section>
      <footer class="modal-card-foot" style="justify-content:flex-end">
        <b-button size="is-medium" @click="twitterDialogVisible=false">
          {{ $t('common.Cancel') }}
        </b-button>
        <b-button size="is-medium" type="is-primary" :disabled="searchTerm==''" @click="getTwitterUsers">
          {{ $t('common.OK') }}
        </b-button>
      </footer>
    </div>
  </b-modal>
</template>

<script>
  import * as ServerFunctions from './ServerFunctions.js';
  import * as Util from './Util.js';

  export default {
    data() {
      return {twitterDialogVisible: false, searchTerm: ''}
    },
    methods: {
      show() {
        this.twitterDialogVisible = true;
        setTimeout(() => { this.$refs.searchTermField.focus() }, 100);
      },
      async getTwitterUsers() {
        this.twitterDialogVisible = false;
        Util.trackEvent('Wheel', 'GetSocialMediaUsers', this.searchTerm);
        try {
          this.$emit('start-wait-animation');
          const users = await ServerFunctions.fetchSocialMediaUsers(this.searchTerm);
          if (users) {
            this.$store.commit('setNames', users);
            this.$store.commit('setWheelTitle', '');
            const message = this.$t(
              'twitterdialog.Found Twitter users',
              {userCount: users.length, term: this.searchTerm}
            );
            this.$emit('show-snackbar-message', message);
          }
        }
        catch (ex) {
          Util.trackException(ex);
          alert(ex);
        }
        finally {
          this.$emit('stop-wait-animation');
        }
      }
    }
  }
</script>
