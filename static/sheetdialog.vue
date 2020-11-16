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
            <i class="fa fa-link"></i>&nbsp;{{ $t('common.Link Google Spreadsheet') }}
          </p>
        </header>
        <section class="modal-card-body can-go-dark">
          <p>
            {{ $t('sheetdialog.When you link a spreadsheet') }}
          </p>
          <p style="margin-top:10px">
            {{ $t('sheetdialog.To import sheets') }}
          </p>
        </section>
        <footer class="modal-card-foot" style="justify-content:flex-end">
          <b-button @click="enter_inactive()">
            {{ $t('common.Cancel') }}
          </b-button>
          <input type="image" style="height:40px"
            alt="Sign in with Google"
            src="/images/btn_google_signin_dark_normal_web@2x.png"
            @click="enter_userIsLoggingIn()"
          >
        </footer>
      </div>
    </b-modal>

    <b-modal :active.sync="displaySheetConfigDialog" :width="640" scroll="keep">
      <div class="modal-card" style="width: auto">
        <header class="modal-card-head">
          <p class="modal-card-title">
            <i class="fa fa-link"></i>&nbsp;{{ $t('common.Link Google Spreadsheet') }}
          </p>
          <profiledropdown v-on:log-out="enter_inactive()"></profiledropdown>
        </header>
        <section class="modal-card-body can-go-dark">
          <div class="columns">
            <div class="column is-one-third">
              {{ $t('sheetdialog.Selected spreadsheet') }}
            </div>
            <div class="column">
              <b-input v-model="sheetTitle" disabled></b-input>
            </div>
          </div>
          <div class="columns">
            <div class="column is-one-fifth">
              {{ $t('sheetdialog.Tab') }}
            </div>
            <div class="column">
              <b-select v-model="selectedTab" :placeholder="$t('sheetdialog.Select a tab')" expanded>
                <option v-for="tab in tabs" :value="tab" :key="tab">
                  {{ tab }}
                </option>
              </b-select>
            </div>
          </div>
          <div class="columns">
            <div class="column is-one-fifth">
              {{ $t('sheetdialog.Column') }}
            </div>
            <div class="column">
              <b-select v-model="selectedColumn" :loading="loadingColumns" :placeholder="$t('sheetdialog.Select a column')" expanded>
                <option v-for="col in columns" :value="col.id" :key="col.id">
                  {{ col.name }}
                </option>
              </b-select>
            </div>
          </div>
          <div class="columns">
            <div class="column is-one-fifth">
              {{ $t('sheetdialog.First row') }}
            </div>
            <div class="column">
              <b-checkbox v-model="firstRowIsHeader">
                {{ $t('sheetdialog.Is a header and should not be imported') }}
              </b-checkbox>
            </div>
          </div>
        </section>
        <footer class="modal-card-foot" style="justify-content:flex-end">
          <b-button size="is-medium" @click="enter_inactive()">
            {{ $t('common.Cancel') }}
          </b-button>
          <b-button size="is-medium" :disabled="!linkSheetButtonEnabled" type="is-primary" @click="enter_linkingSheet()">
            {{ $t('sheetdialog.Link sheet') }}
          </b-button>
        </footer>
      </div>
    </b-modal>
  </div>
</template>

<script>
  import * as SheetGateway from './SheetGateway.js';
  import * as Firebase from './Firebase.js';
  import * as SheetPicker from './SheetPicker.js';
  import * as Util from './Util.js';
  import profiledropdown from './profiledropdown.vue';
  import './images/btn_google_signin_dark_normal_web@2x.png';

  export default {
    components: { profiledropdown },
    data() {
      return {
        fsm: 'inactive', sheetTitle: '', sheetId: '',
        tabs: [], selectedTab: null,
        columns: [], selectedColumn: null, loadingColumns: false,
        firstRowIsHeader: true,
        sheetLinkedAtMs: 0, timeoutId: 0
      }
    },
    computed:
    {
      sheetLinked() {
        return this.$store.state.appStatus.sheetLinked;
      },
      displayLoginDialog: {
        get: function() {
          return this.fsm=='userIsPickingLoginMethod';
        },
        set: function(newValue) {
          if (newValue == false) this.fsm = 'inactive';
        }
      },
      displaySheetConfigDialog: {
        get: function() {
          return this.fsm=='userIsPickingTabCol';
        },
        set: function(newValue) {
          if (newValue == false) this.fsm = 'inactive';
        }
      },
      linkSheetButtonEnabled() {
        return (this.selectedTab && this.selectedColumn);
      }
    },
    watch: {
      async selectedTab(newValue) {
        if (newValue) {
          this.loadingColumns = true;
          this.columns = await SheetGateway.getColumns(this.sheetId, this.selectedTab);
          this.loadingColumns = false;
        }
      },
      sheetLinked(linked) {
        if (!linked) {
          clearTimeout(this.timeoutId);
          this.enter_inactive();
        }
      }
    },
    methods: {
      show() {
        this.enter_loadingLibraries();
      },
      enter_inactive() {
        this.setState('inactive');
        this.$store.commit('unlinkSheet');
      },
      async enter_loadingLibraries() {
        this.setState('loadingLibraries');
        this.$emit('start-wait-animation');
        await Firebase.loadLibraries();
        this.$emit('stop-wait-animation');
        this.enter_userIsPickingLoginMethod();
      },
      enter_userIsPickingLoginMethod() {
        this.setState('userIsPickingLoginMethod');
      },
      async enter_userIsLoggingIn() {
        this.setState('userIsLoggingIn');
        try {
          Util.trackEvent('Wheel', 'LoginForSheetAttempt', '');
          const accessToken = await Firebase.logInToSheets(this.$i18n.locale);
          await SheetPicker.load(accessToken);
          const user = await Firebase.getLoggedInUser();
          this.$store.commit('logInUser', {
            photoUrl: user.photoURL, displayName: user.displayName, uid: user.uid
          });
          Util.trackEvent('Wheel', 'LoginForSheetSuccess', '');
          this.enter_userIsPickingSheet();
        }
        catch (ex) {
          Util.trackException(ex);
          Util.trackEvent('Wheel', 'LoginForSheetFailure', ex.toString());
          this.enter_authError(ex);
        }
      },
      async enter_userIsPickingSheet() {
        this.setState('userIsPickingSheet');
        try {
          this.sheetId = await SheetPicker.pickSheet();
          this.sheetTitle = await SheetGateway.getTitle(this.sheetId);
          this.enter_userIsPickingTabCol();
        }
        catch (ex) {
          Util.trackException(ex);
          this.enter_authError(ex);
        }
      },
      async enter_userIsPickingTabCol() {
        this.setState('userIsPickingTabCol');
        this.selectedTab = null;
        this.selectedColumn = null;
        this.tabs = await SheetGateway.getTabNames(this.sheetId);
      },
      enter_linkingSheet() {
        this.setState('linkingSheet');
        Util.trackEvent('Wheel', 'LinkSpreadsheet', '');
        this.$store.commit('linkSheet');
        this.sheetLinkedAtMs = new Date().getTime();
        this.enter_readingSheet();
      },
      async enter_readingSheet() {
        this.setState('readingSheet');
        try {
          const sheetEntries = await SheetGateway.getEntries(this.sheetId,
            this.selectedTab, this.selectedColumn, this.firstRowIsHeader
          );
          const cleanedEntries = sheetEntries.map(x => Util.getHtmlAsText(x));
          const newEntries = Util.getAddedEntries(this.$store.state.wheelConfig.names, cleanedEntries);
          this.notifyUserOfNewEntries(newEntries);
          this.$store.commit('setNames', cleanedEntries);
          this.enter_waitingToReadSheet();
        }
        catch (ex) {
          Util.trackException(ex);
          Util.trackEvent(ex, 'enter_readingSheet()', navigator.userAgent);
          this.enter_authError(ex);
        }
      },
      enter_waitingToReadSheet() {
        this.setState('waitingToReadSheet');
        const self = this;
        this.timeoutId = setTimeout(() => {
          if (!this.linkHasTimedOut()) {
            self.enter_readingSheet();
          }
          else {
            self.enter_inactive();
          }
        }, 5000);
      },
      enter_authError(exception) {
        this.setState('authError');
        Firebase.logOut();
        this.$emit('auth-error', exception);
        this.enter_inactive();
      },
      setState(newState) {
        // console.log(`${this.fsm} => ${newState}`);
        this.fsm = newState;
      },
      linkHasTimedOut() {
        const MAX_LINK_TIME_MS = 3600 * 1000;
        const now = new Date().getTime();
        return ((now - this.sheetLinkedAtMs) > MAX_LINK_TIME_MS);
      },
      notifyUserOfNewEntries(newEntries) {
        if (newEntries.length > 2) {
          const msg = this.$t('sheetdialog.entries added', {count: newEntries.length});
          this.$emit('show-snackbar-message', msg);
        }
        else {
          newEntries.forEach(entry => {
            const msg = this.$t('sheetdialog.added', {entry: Util.getHtmlAsText(entry)});
            this.$emit('show-snackbar-message', msg);
          })
        }
      }
    }
  }
</script>
