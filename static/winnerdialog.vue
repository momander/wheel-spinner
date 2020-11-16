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
          <span>{{winnerText}}</span>
        </h1>
      </section>
      <footer class="modal-card-foot" style="justify-content:flex-end">
        <b-button size="is-medium" @click="winnerDialogVisible=false">
          {{ $t('common.Close') }}
        </b-button>
        <b-button size="is-medium" v-show="showRemoveButton" type="is-info" ref="removeButton" @click="removeWinner">
          {{ $t('winnerdialog.Remove') }}
        </b-button>
        <b-button size="is-medium" v-show="showRemoveAllButton" type="is-primary" @click="removeWinnerAll">
          {{ $t('winnerdialog.Remove all instances') }}
        </b-button>
      </footer>
    </div>
  </b-modal>
</template>

<script>
  import * as Util from './Util.js';

  export default {
    data() {
      return {
        winnerDialogVisible: false, winnerText: '', winnerImage: '',
        winnerEntry: ''
      }
    },
    computed: {
      winnerMessage() {
        return this.$store.state.wheelConfig.winnerMessage;
      },
      showRemoveButton() {
        return !this.$store.state.wheelConfig.autoRemoveWinner;
      },
      showRemoveAllButton() {
        const wheelConfig = this.$store.state.wheelConfig;
        const winnerInstances = Util.getOccurencesInArray(wheelConfig.names, this.winnerEntry);
        const autoRemoveWinner = wheelConfig.autoRemoveWinner;
        return !autoRemoveWinner && winnerInstances > 1;
      }
    },
    methods: {
      show(winnerEntry) {
        this.winnerEntry = winnerEntry;
        this.winnerText = Util.extractDisplayText(winnerEntry, false);
        this.winnerImage = Util.extractImage(winnerEntry);
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
        this.$emit('remove-name', this.winnerEntry);
        this.winnerDialogVisible = false;
      },
      removeWinnerAll() {
        this.$emit('remove-name-all', this.winnerEntry);
        this.winnerDialogVisible = false;
      }
    }
  }
</script>
