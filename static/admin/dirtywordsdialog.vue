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
    <b-modal :active.sync="displayMe" :width="640" scroll="keep">
      <div class="modal-card" style="width: auto">
        <header class="modal-card-head">
          <p class="modal-card-title">
            <i class="far fa-hand-paper"></i>&nbsp;Banned words
          </p>
        </header>
        <section class="modal-card-body can-go-dark">
          <dirtyWordsTextBox style="width:50%" ref="dirtyWordsTextBox"/>
        </section>
        <footer class="modal-card-foot" style="justify-content: flex-end">
          <b-button type="is-info" @click="save()"> Save </b-button>
          <b-button @click="close()"> Close </b-button>
        </footer>
      </div>
    </b-modal>
  </div>
</template>

<script>
import dirtyWordsTextBox from './dirtyWordsTextBox.vue';
import * as Firebase from "../Firebase.js";

export default {
  components: { dirtyWordsTextBox },
  data() {
    return {
      displayMe: false,
    };
  },
  methods: {
    async show() {
      this.displayMe = true;
      this.$nextTick(async () => {
        this.$refs.dirtyWordsTextBox.setWords(await Firebase.getDirtyWords());
      })
    },
    close() {
      this.displayMe = false;
    },
    save() {
      Firebase.setDirtyWords(this.$refs.dirtyWordsTextBox.getWords());
      this.displayMe = false;
    },
  },
};
</script>
