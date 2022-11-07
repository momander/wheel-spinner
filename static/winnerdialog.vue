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
  <b-modal :active.sync="winnerDialogVisible" :width="640" scroll="keep">
    <div class="modal-card" style="width: auto">
      <header class="modal-card-head">
        <div class="modal-card-title" style="width:100%">
          <h5 class="modal-title">
            {{winnerMessage}}
          </h5>
        </div>
      </header>
      <section class="modal-card-body can-go-dark">
        <h1 class="title">
          <img v-if="winnerImage" :src="winnerImage" style="height:200px;vertical-align:middle">
          <span v-if="winnerTextIsLink">
            <a target="_new" :href="winnerText">
              {{winnerText}}
            </a>
          </span>
          <span v-if="!winnerTextIsLink">
            {{winnerText}}
          </span>
        </h1>
      </section>
      <footer class="modal-card-foot" style="justify-content:flex-end">
        <b-field grouped group-multiline>
          <p class="control">
            <b-button size="is-medium" @click="winnerDialogVisible=false">
              {{ $t('common.Close') }}
            </b-button>
          </p>
          <p class="control" v-show="showRemoveButton">
            <b-button size="is-medium" type="is-info" ref="removeButton" @click="removeWinner">
              {{ $t('winnerdialog.Remove') }}
            </b-button>
          </p>
          <p class="control" v-show="showRemoveAllButton">
            <b-button size="is-medium" type="is-primary" @click="removeWinnerAll">
              {{ $t('winnerdialog.Remove all instances') }}
            </b-button>
          </p>
          <p class="control" v-show="showHideButton">
            <b-button size="is-medium" type="is-primary" @click="hideWinner">
              {{ $t('winnerdialog.Hide') }}
            </b-button>
          </p>
        </b-field>
      </footer>
    </div>
  </b-modal>
</template>

<script>
  import * as Util from './Util.js';
  import { mapGetters } from "vuex";

  export default {
    data() {
      return {
        winnerDialogVisible: false, winnerText: '', winnerImage: '',
        winnerEntry: ''
      }
    },
    computed: {
      winnerMessage() {
        return this.winnerEntry.message || this.wheelConfig.winnerMessage;
      },
      winnerTextIsLink() {
        const re = /https?:\/\//;
        return re.test(this.winnerText);
      },
      showRemoveButton() {
        return this.wheelConfig.displayRemoveButton &&
              !this.wheelConfig.autoRemoveWinner;
      },
      showRemoveAllButton() {
        const winnerInstances = Util.getOccurences(
          this.wheelConfig.getTexts(), this.winnerText
        );
        const displayRemoveButton = this.wheelConfig.displayRemoveButton;
        const autoRemoveWinner = this.wheelConfig.autoRemoveWinner;
        return displayRemoveButton && !autoRemoveWinner && winnerInstances > 1;
      },
      showHideButton() {
        return this.wheelConfig.isAdvanced &&
              !this.wheelIsShared &&
               this.wheelConfig.displayHideButton &&
              !this.wheelConfig.autoRemoveWinner;
      },
      ...mapGetters(['wheelConfig', 'wheelIsShared'])
    },
    methods: {
      show(winnerEntry) {
        this.winnerEntry = winnerEntry;
        this.winnerText = winnerEntry.text;
        this.winnerImage = winnerEntry.image
        this.winnerDialogVisible = true;
        this.setFocusOnRemoveButton();
      },
      setFocusOnRemoveButton() {
        this.$nextTick(() => {
          setTimeout(() => {
            if (this.$refs.removeButton) this.$refs.removeButton.$el.focus()
          }, 100)
        });
      },
      close() {
        this.winnerDialogVisible = false;
      },
      removeWinner() {
        this.$emit('remove-entry', this.winnerEntry);
        this.winnerDialogVisible = false;
      },
      removeWinnerAll() {
        this.$emit('remove-entry-all', this.winnerEntry);
        this.winnerDialogVisible = false;
      },
      hideWinner() {
        this.$emit('hide-entry', this.winnerEntry);
        this.winnerDialogVisible = false;
      }
    }
  }
</script>
