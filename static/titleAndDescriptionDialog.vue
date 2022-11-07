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
  <b-modal :active.sync="displayTitleAndDescriptionDialog" :width="640" scroll="keep">
    <div class="modal-card" style="width: auto">
      <header class="modal-card-head">
        <p class="modal-card-title">
          <i class="fas fa-edit"></i>&nbsp;{{ $t('common.Edit title and description') }}
        </p>
      </header>
      <section class="modal-card-body can-go-dark">
        <b-field :label="$t('common.Wheel title')" style="margin-bottom:0">
          <b-input
            v-model="wheelTitle"
            ref="wheelTitleInput"
            @keydown.native.enter="enterPressed"
            maxlength="50"
          ></b-input>
        </b-field>
        <b-field :label="$t('common.Wheel description')" style="margin-bottom:0">
          <b-input
            type="textarea"
            v-model="wheelDescription"
            @keydown.native.enter="enterPressed"
            maxlength="200"
            custom-class="has-fixed-size"
          ></b-input>
        </b-field>
      </section>
      <footer class="modal-card-foot" style="justify-content:flex-end">
        <b-button size="is-medium" @click="close()">
          {{ $t('common.Cancel') }}
        </b-button>
        <b-button size="is-medium" type="is-primary" @click="setTitleAndDescription()">
          {{ $t('common.OK') }}
        </b-button>
      </footer>
    </div>
  </b-modal>
</template>

<script>
  import { mapGetters } from "vuex";

  export default {
    data() {
      return {
        displayTitleAndDescriptionDialog: false,
        wheelTitle: '', wheelDescription: ''
      }
    },
    computed: {
      ...mapGetters([
        'wheelConfig'
      ])
    },
    methods: {
      show() {
        this.wheelTitle = this.wheelConfig.title;
        this.wheelDescription = this.wheelConfig.description;
        this.displayTitleAndDescriptionDialog = true;
        setTimeout(() => { this.$refs.wheelTitleInput.focus() }, 100);
      },
      enterPressed(e) {
        e.preventDefault();
        this.setTitleAndDescription();
      },
      setTitleAndDescription() {
        this.$emit('setTitleAndDescription', {
          title: this.wheelTitle,
          description: this.wheelDescription
        });
        this.close();
      },
      close() {
        this.displayTitleAndDescriptionDialog = false;
        this.wheelTitle = '';
        this.wheelDescription = '';
      }
    }    
  }
</script>
