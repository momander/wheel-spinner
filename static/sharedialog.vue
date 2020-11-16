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
        </section>
        <footer class="modal-card-foot" style="justify-content:flex-end">
          <b-button size="is-medium" @click="enter_Inactive()">
            {{ $t('common.Cancel') }}
          </b-button>
          <b-button size="is-medium" type="is-primary" @click="enter_UserIsSettingOptions()">
            {{ $t('sharedialog.Continue') }}
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
            {{ $t('sharedialog.What should a person be able to do') }}
          </div>
          <div class="field">
            <b-radio v-model="editableWheel" :native-value=false>
              {{ $t('sharedialog.They should only be able to spin the wheel') }}
            </b-radio>
          </div>
          <div class="field">
            <b-radio v-model="editableWheel" :native-value=true>
              {{ $t('sharedialog.They should be able to spin the wheel and') }}
            </b-radio>
          </div>
        </section>
        <footer class="modal-card-foot" style="justify-content:flex-end">
          <b-button size="is-medium" @click="enter_Inactive()">
            {{ $t('common.Cancel') }}
          </b-button>
          <b-button size="is-medium" type="is-primary" @click="enter_CreatingLink()">
            {{ $t('sharedialog.Continue') }}
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
          <p style="color:#BBB">
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
  import * as ServerFunctions from './ServerFunctions.js';
  import * as Locales from './Locales.js';
  import * as Util from './Util.js';

  export default {
    data() {
      return {
        fsm: 'Inactive', editableWheel: false, sharableLink: ''
      }
    },
    computed: {
      showWarning() {
        return this.fsm=='ShowingWarning';
      },
      showOptions() {
        return this.fsm=='UserIsSettingOptions';
      },
      showLink() {
        return this.fsm=='ShowingLink';
      }
    },
    methods: {
      show() {
        const wheelConfig = this.$store.state.wheelConfig;
        if (wheelConfig.isTooBigForDatabase()) {
          alert(this.$t('sharedialog.Sorry, too many images'));
          return;
        }
        this.enter_ShowingWarning();
      },
      enter_ShowingWarning() {
        this.setState('ShowingWarning');
      },
      enter_UserIsSettingOptions() {
        this.setState('UserIsSettingOptions');
      },
      async enter_CreatingLink() {
        this.setState('CreatingLink');
        const wheelConfig = this.$store.state.wheelConfig;
        try {
          this.$emit('start-wait-animation');
          const path = await ServerFunctions.createSharedWheel(this.editableWheel, wheelConfig);
          this.sharableLink = 'https://' + Locales.getAbsoluteUrl(
                                window.location.host, this.$i18n.locale, path);
          this.enter_ShowingLink();
        }
        catch (ex) {
          Util.trackException(ex);
          alert(ex);
        }
        finally {
          this.$emit('stop-wait-animation');
        }
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
        // console.log(`${this.fsm} => ${newState}`);
        this.fsm = newState;
      }
    }
    
  }
</script>
