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
    <b-modal :active.sync="carouselDialogVisible">
      <div class="modal-card" style="width: auto">
        <header class="modal-card-head">
          <p class="modal-card-title">
            <i class="fa fa-pen"></i>&nbsp;Edit carousel
          </p>
        </header>
        <section class="modal-card-body can-go-dark">
          <b-select v-model="type" style="margin-bottom:10px">
            <option value="html">
              HTML
            </option>
            <option value="poll">
              Poll
            </option>
          </b-select>
          <div v-if="type=='html'">
            <b-field label="HTML" label-position="on-border">
              <b-input v-model="html" type="textarea"/>
            </b-field>
          </div>
          <div v-if="type=='poll'">
            <b-field label="Title" label-position="on-border">
              <b-input v-model="pollTitle"/>
            </b-field>
            <b-field label="Prompt" label-position="on-border">
              <b-input v-model="pollPrompt"/>
            </b-field>
            <b-field label="Post-vote message" label-position="on-border">
              <b-input v-model="voteMessage"/>
            </b-field>
            <b-input v-for="(option, i) in pollOptions" v-model="pollOptions[i]"
              :key="i" icon-right="close-circle" icon-right-clickable
              @icon-right-click="removePollOption(i)"/>
            <b-button @click="addPollOption()">
              <i class="fa fa-plus"></i>
            </b-button>
          </div>
        </section>
        <footer class="modal-card-foot" style="justify-content:flex-end">
          <b-button @click="hide()">
            Cancel
          </b-button>
          <b-button type="is-primary" @click="saveCarousel()">
            Save
          </b-button>
        </footer>
      </div>
    </b-modal>
  </div>
</template>

<script>
  export default {
    data() {
      return { carouselDialogVisible: false, savedCarousel: {},
        forceUpdateVariable: 0, type: "", html: "", pollTitle: "", pollPrompt: "",
        pollOptions: [], voteMessage: "" }
    },
    methods: {
      show(carousel) {
        this.type = carousel.type;
        this.html = carousel.html;
        this.pollTitle = carousel.pollTitle;
        this.pollPrompt = carousel.pollPrompt;
        this.pollOptions = carousel.pollOptions || [];
        this.voteMessage = carousel.voteMessage;
        this.savedCarousel = carousel;
        this.carouselDialogVisible = true;
      },
      hide() {
        this.carouselDialogVisible = false;
      },
      addPollOption() {
        this.pollOptions.push("");
      },
      removePollOption(index) {
        this.pollOptions.splice(index, 1);
      },
      saveCarousel() {
        Object.assign(this.savedCarousel, {type: this.type, html: this.html,
          pollTitle: this.pollTitle, pollPrompt: this.pollPrompt,
          pollOptions: this.pollOptions, voteMessage: this.voteMessage});
        this.hide();
      }
    }
  }
</script>