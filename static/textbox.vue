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
  <div id="entries" class="textarea can-go-dark basic-editor has-fixed-size" spellcheck="false"
       contentEditable="true" v-on:paste="onPaste" v-on:input="setEntries()"
       v-on:keyup="IE_setEntries"></div>
</template>

<script>
  import * as Util from './Util.js';
  import { mapGetters } from "vuex";

  export default {
    data() {
      return {updateTriggeredByMe: false}
    },
    mounted() {
      // This textbox may have been just created by a v-if and may not get
      // the initial list of entries in watch.
      this.setTextboxContents(this.entries);
    },
    computed: {
      entries() {
        return this.wheelConfig.entries;
      },
      ...mapGetters([
        'wheelConfig', 'wheelIsBusy', 'sheetLinked', 'appInfoVisible'
      ])
    },
    watch: {
      entries(newEntries) {
        if (this.updateTriggeredByMe) {
          this.updateTriggeredByMe = false;
        }
        else {
          this.setTextboxContents(newEntries);
        }
      },
      wheelConfig(newConfig) {
        this.setTextboxContents(newConfig.entries);
      },
      wheelIsBusy(isBusy) {
        const editable = !isBusy;
        const textBoxDiv = document.getElementById('entries');
        textBoxDiv.setAttribute('contenteditable', editable);
      },
      sheetLinked(isLinked) {
        const editable = !isLinked;
        const textBoxDiv = document.getElementById('entries');
        textBoxDiv.setAttribute("contenteditable", editable);
        if (isLinked) {
          textBoxDiv.style.backgroundImage = "url('/images/link.png')";
          textBoxDiv.style.backgroundSize = "100%";
          textBoxDiv.style.backgroundAttachment = "local";
        }
        else {
          textBoxDiv.style.backgroundImage = "";
        }
      }
    },
    methods: {
      setEntries() {
        this.updateTriggeredByMe = true;
        const entries = this.getEntries();
        this.$store.commit('setEntries', entries);
      },
      IE_setEntries() {
        if (Util.browserIsIE()) {
          this.setEntries();
        }
      },
      getEntries() {
        const div = document.getElementById('entries');
        return Util.getEntriesFromHtml(div.innerHTML);
      },
      setTextboxContents(entries) {
        const div = document.getElementById('entries');
        div.innerHTML = entries.map(entry => Util.renderEntry(entry)).join('');
      },
      onPaste(e) {
        // Intercept paste into the text-box. Transform rich text into plain text,
        // unless a data image is being pasted.
        e.preventDefault();
        Util.trackEvent('Wheel', 'PasteIntoTextbox', '');
        if (e.clipboardData) {
          // Modern browsers.
          let html = (e.originalEvent || e).clipboardData.getData('text/html');
          let match = html.match(/(<.*?src="data:image.*?>)/);
          if (match) {
            document.execCommand('insertHtml', false, match[1]);
          }
          else {
            let text = (e.originalEvent || e).clipboardData.getData('text/plain');
            document.execCommand('insertText', false, text);
          }
        }
        else {
          // Internet Explorer.
          const clipboardData = window.clipboardData.getData('text');
          if (clipboardData) {
            this.$store.commit('appendTextEntries', clipboardData.split(/\n/));
          }
        }
      }
    }
  }
</script>

<style scoped>
  .basic-editor {
    flex-grow: 1;
    overflow: auto;
    font-family: BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu',
                 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue',
                 'Helvetica', 'Arial', sans-serif;
    height: 300px;
    max-height: 2000px;
  }
</style>
