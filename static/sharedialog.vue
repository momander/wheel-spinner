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
    <b-modal :active.sync="showWarning" :width="640" scroll="keep">
      <div class="modal-card" style="width: auto">
        <header class="modal-card-head">
          <p class="modal-card-title">
            <i class="fa fa-share-alt"></i>&nbsp;{{ $t('sharedialog.Shareable link') }}
          </p>
        </header>
        <section class="modal-card-body can-go-dark">
          <p>
            {{ $t('sharedialog.If you continue') }}
            {{ $t('sharedialog.This link will work for anyone') }}
          </p>
          <p style="margin-top:10px">
            {{ $t('sharedialog.We want this website to be safe place for everyone') }}
          </p>
          <p style="margin-top:10px">
            <router-link to="/faq/terms">{{ $t('appInfo.Terms of service') }}</router-link>
          </p>
          <b-button size="is-default" @click="enter_LoadingSharedWheels()" style="margin-top:10px;background-color:#eff5fb; color:#296fa8;">
            {{ $t('sharedialog.See my shared wheels') }}
          </b-button>
        </section>
        <footer class="modal-card-foot" style="justify-content:flex-end">
          <b-button size="is-medium" @click="enter_Inactive()">
            {{ $t('common.Cancel') }}
          </b-button>
          <b-button size="is-medium" type="is-primary" @click="enter_UserIsSettingOptions()" ref="continueButton1">
            {{ $t('common.Continue') }}
          </b-button>
        </footer>
      </div>
    </b-modal>

    <b-modal :active.sync="showSharedWheels" scroll="keep">
      <div class="modal-card" style="width: auto">
        <header class="modal-card-head">
          <p class="modal-card-title">
            <i class="fa fa-share-alt"></i>&nbsp;{{ $t('sharedialog.My shared wheels') }}
          </p>
        </header>
        <section class="modal-card-body can-go-dark">
          <p>
            {{ $t('sharedialog.Only wheels shared after') }}
          </p>
          <br>
          <table class="table can-go-dark">
            <tr v-if="!noSharedWheels">
              <th>{{ $t('common.Wheel title') }}</th>
              <th>{{ $t('sharedialog.Link') }}</th>
              <th></th>
              <th v-if="$mq=='desktop'">{{ $t('sharedialog.Created') }}</th>
              <th>{{ $t('sharedialog.Visits') }}</th>
            </tr>
            <tr v-for="wheel in sharedWheels" :key="wheel.path">
              <td>{{ wheel.config.title }}</td>
              <td style="white-space: nowrap;">
                <a :href="getWheelLink(wheel.path)">
                  {{ wheel.path }}
                </a>
              </td>
              <td>
                <b-button type="is-light" @click="copyToClipboard(getWheelLink(wheel.path))">
                  <i class="far fa-clipboard"></i>
                </b-button>
              </td>
              <td v-if="$mq=='desktop'" style="white-space: nowrap;">
                {{ wheel.created | firestoremilliseconds | timeago }}
              </td>
              <td class="has-text-right">{{ wheel.readCount | localestring }}</td>
              <td>
                <b-button type="is-light" @click="enter_confirmingDelete(wheel.path)">
                  <i class="far fa-trash-alt"></i>
                  <span v-if="$mq=='desktop'">&nbsp;{{ $t('common.Delete') }}</span>
                </b-button>
              </td>
            </tr>
            <tr v-if="noSharedWheels">
              <td>
                {{ $t('sharedialog.No wheels found')}}
              </td>
            </tr>
          </table>
        </section>
        <footer class="modal-card-foot" style="justify-content:flex-end">
          <b-button size="is-medium" @click="enter_Inactive()">
            {{ $t('common.Close') }}
          </b-button>
        </footer>
      </div>
    </b-modal>

    <b-modal :active.sync="showOptions" :width="640" scroll="keep">
      <div class="modal-card" style="width: auto">
        <header class="modal-card-head">
          <p class="modal-card-title">
            <i class="fa fa-share-alt"></i>&nbsp;{{ $t('sharedialog.Shareable link') }}
          </p>
        </header>
        <section class="modal-card-body can-go-dark">
          <div class="field">
            {{ $t('common.Wheel title') }}
          </div>
          <b-input v-model="wheelTitle" ref="wheelTitleField" maxlength="50" @keyup.native.enter="enter_CreatingLink()"></b-input>
          <div class="field">
            <b-checkbox v-model="showTitle">
              {{ $t('sharedialog.Show title to people') }}
            </b-checkbox>
          </div>
          <div class="field">
            {{ $t('sharedialog.What should a person be able to do') }}
          </div>
          <div class="field">
            <b-radio v-model="copyableWheel" :native-value=true>
              {{ $t('sharedialog.They should be able to spin the wheel and') }}
            </b-radio>
          </div>
          <div class="field">
            <b-radio v-model="copyableWheel" :native-value=false>
              {{ $t('sharedialog.They should only be able to spin the wheel') }}
            </b-radio>
          </div>
        </section>
        <footer class="modal-card-foot" style="justify-content:flex-end">
          <b-button size="is-medium" @click="enter_Inactive()">
            {{ $t('common.Cancel') }}
          </b-button>
          <b-button size="is-medium" type="is-primary" @click="enter_CreatingLink()">
            {{ $t('common.Continue') }}
          </b-button>
        </footer>
      </div>
    </b-modal>

    <b-modal :active.sync="showLink" :width="640" scroll="keep">
      <div class="modal-card" style="width: auto">
        <header class="modal-card-head">
          <p class="modal-card-title">
            <i class="fa fa-share-alt"></i>&nbsp;{{ $t('sharedialog.Shareable link') }}
          </p>
        </header>
        <section class="modal-card-body can-go-dark">
          <p>
            {{ $t('sharedialog.Link to this wheel') }}
          </p>
          <div class="columns">
            <div class="column is-8">
              <b-input id="sharableLinkText" v-model="sharableLink"></b-input>
            </div>
            <div class="column">
              <b-button type="is-light" @click="copyLink">
                {{ $t('sharedialog.Copy link') }}
              </b-button>
            </div>
          </div>
          <p>
            {{ $t('sharedialog.This link will work for anyone') }}
          </p>
        </section>
        <footer class="modal-card-foot" style="justify-content:flex-end">
          <b-button size="is-medium" @click="enter_Inactive()">
            {{ $t('common.Close') }}
          </b-button>
        </footer>
      </div>
    </b-modal>
  </div>
</template>

<script>
  import { timeago, firestoremilliseconds, localestring } from './filters.js';
  import * as Locales from './Locales.js';
  import * as Util from './Util.js';
  import { mapGetters } from "vuex";

  export default {
    filters: { timeago, firestoremilliseconds, localestring },
    data() {
      return {
        fsm: 'Inactive', wheelTitle: '', copyableWheel: true, sharableLink: ''
      }
    },
    computed: {
      noSharedWheels() {
        return (this.sharedWheels.length==0);
      },
      showWarning() {
        return this.fsm=='ShowingWarning';
      },
      showTitle: {
        get: function() {
          return this.$store.getters.wheelConfig.showTitle;
        },
        set: function(newValue) {
          this.$store.commit('setShowTitle', newValue);
        }
      },
      showWarning: {
        get: function() {
          return this.fsm=='ShowingWarning';
        },
        set: function(newValue) {
          if (newValue == false) this.fsm = 'Inactive';
        }
      },
      showSharedWheels: {
        get: function() {
          return this.fsm=='ShowingSharedWheels' || this.fsm=='ConfirmingDelete' || this.fsm=='DeletingWheel';
        },
        set: function(newValue) {
          if (newValue == false) this.fsm = 'Inactive';
        }
      },
      showOptions: {
        get: function() {
          return this.fsm=='UserIsSettingOptions';
        },
        set: function(newValue) {
          if (newValue == false) this.fsm = 'Inactive';
        }
      },
      showLink: {
        get: function() {
          return this.fsm=='ShowingLink';
        },
        set: function(newValue) {
          if (newValue == false) this.fsm = 'Inactive';
        }
      },
      ...mapGetters(['sharedWheels', 'wheelConfig'])
    },
    methods: {
      show() {
        const wheelConfig = this.wheelConfig;
        if (wheelConfig.isTooBigForDatabase()) {
          alert(this.$t('sharedialog.Sorry, too many images'));
          return;
        }
        this.wheelTitle = this.$store.getters.wheelTitle;
        this.enter_ShowingWarning();
      },
      enter_ShowingWarning() {
        setTimeout(() => { this.$refs.continueButton1.$el.focus() }, 100);
        this.setState('ShowingWarning');
      },
      async enter_UserIsSettingOptions() {
        setTimeout(() => { this.$refs.wheelTitleField.focus() }, 100);
        this.setState('UserIsSettingOptions');
      },
      async enter_LoadingSharedWheels() {
        Util.trackEvent('Wheel', 'ViewSharedWheelsAttempt', '');
        this.setState('LoadingSharedWheels');
        this.$emit('start-wait-animation');
        // TODO: Catch any exception thrown by 'userIsLoggedIn' and display
        // error message. Example: the user has gone offline.
        if (! await this.$store.dispatch('userIsLoggedIn')) {
          await this.$store.dispatch('loginAnonymously');
        }
        // TODO: Catch any exceptions thrown by 'loadSharedWheels' and display
        // an error message. Example: the user has gone offline.
        await this.$store.dispatch('loadSharedWheels');
        this.setState('ShowingSharedWheels');
        this.$emit('stop-wait-animation');
        Util.trackEvent('Wheel', 'ViewSharedWheelsSuccess', '');
      },
      async enter_CreatingLink() {
        this.setState('CreatingLink');
        try {
          this.$emit('start-wait-animation');
          if (! await this.$store.dispatch('userIsLoggedIn')) {
            await this.$store.dispatch('loginAnonymously');
          }
          this.$store.commit('setWheelTitle', this.wheelTitle);
          const host = window.location.host;
          const locale = this.$i18n.locale;
          const path = await this.$store.dispatch('shareWheel', {
            wheelConfig: this.wheelConfig,
            copyableWheel: this.copyableWheel
          });
          const url = Locales.getAbsoluteUrl(host, locale, path);
          this.sharableLink = 'https://' + url;
          this.$emit('stop-wait-animation');
          this.enter_ShowingLink();
        }
        catch (ex) {
          Util.trackException(ex);
          this.$emit('stop-wait-animation');
          alert(ex);
        }
      },
      enter_confirmingDelete(path) {
        this.fsm = 'ConfirmingDelete';
        this.$buefy.dialog.confirm({
          title: this.$t('opendialog.Delete wheel'),
          message: this.$t('opendialog.Are you sure', {wheelTitle: Util.escapeHtml(path)}),
          cancelText: this.$t('common.Cancel'),
          confirmText: this.$t('common.Delete'),
          type: 'is-danger',
          hasIcon: true,
          onConfirm: () => this.enter_deletingWheel(path),
          onCancel: () => this.setState('ShowingSharedWheels')
        })
      },
      async enter_deletingWheel(path) {
        this.fsm = 'DeletingWheel';
        try {
          this.$emit('start-wait-animation');
          await this.$store.dispatch('deleteSharedWheel', path);
          this.$emit('stop-wait-animation');
          this.setState('ShowingSharedWheels');
        }
        catch (ex) {
          Util.trackException(ex);
          this.$emit('stop-wait-animation');
          this.enter_authError(ex);
        }
      },
      enter_authError(exception) {
        this.fsm = 'authError';
        this.$store.dispatch('logOut');
        this.$emit('auth-error', exception);
        this.enter_Inactive();
      },
      enter_ShowingLink() {
        this.setState('ShowingLink');
      },
      enter_Inactive() {
        this.setState('Inactive');
      },
      copyLink() {
        Util.trackEvent('Wheel', 'CopySharableLink', '');
        const textBox = document.querySelector('#sharableLinkText');
        textBox.select();
        document.execCommand("copy");
        const message = this.$t('sharedialog.Link copied to the clipboard');
        this.$emit('show-snackbar-message', message);
      },
      setState(newState) {
        this.fsm = newState;
      },
      getWheelLink(path) {
        return 'https://' + Locales.getAbsoluteUrl(location.hostname, this.$i18n.locale, path);
      },
      async copyToClipboard(link) {
        await navigator.clipboard.writeText(link);
        const message = this.$t('sharedialog.Link copied to the clipboard');
        this.$emit('show-snackbar-message', message);
      }
    }
    
  }
</script>
