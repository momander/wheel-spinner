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
  <div id="names" class="textarea can-go-dark" spellcheck="false"
       :style="'height:' + ($store.state.preferences.appInfoVisible ? '380px' : '520px')"
       style="overflow: auto; font-family: BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue', 'Helvetica', 'Arial', sans-serif;"
       contentEditable="true" v-on:paste="onPaste" v-on:input="setNames()"
       v-on:keyup="IE_setNames"></div>
</template>

<script>
  import * as Util from './Util.js';

  export default {
    data() {
      return {updateTriggeredByMe: false}
    },
    computed: {
      names() {
        return this.$store.state.wheelConfig.names;
      },
      wheelConfig() {
        return this.$store.state.wheelConfig;
      },
      wheelSpinning() {
        return this.$store.state.appStatus.wheelSpinning;
      },
      sheetLinked() {
        return this.$store.state.appStatus.sheetLinked;
      },
    },
    watch: {
      names(newValue, oldValue) {
        if (this.updateTriggeredByMe) {
          this.updateTriggeredByMe = false;
        }
        else {
          const div = document.getElementById('names');
          div.innerHTML = newValue.map(name => `<div>${name}</div>`).join('');
        }
      },
      wheelConfig(newValue, oldValue) {
        const div = document.getElementById('names');
        div.innerHTML = newValue.names.map(name => `<div>${name}</div>`).join('');
      },
      wheelSpinning(isSpinning) {
        const editable = !isSpinning;
        const textBoxDiv = document.getElementById('names');
        textBoxDiv.setAttribute('contenteditable', editable);
      },
      sheetLinked(isLinked) {
        const editable = !isLinked;
        const textBoxDiv = document.getElementById('names');
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
      setNames() {
        this.updateTriggeredByMe = true;
        const entries = this.getEntries();
        this.$store.commit('setNames', entries);
      },
      IE_setNames() {
        if (Util.browserIsIE()) {
          this.setNames();
        }
      },
      getEntries() {
        const div = document.getElementById('names');
        const html = div.innerHTML;
        return this.getEntriesFromHtml(html);
      },
      getEntriesFromHtml(html) {
        if (!html) return [];
        let rows = html.split(/<div>|<br>|<p>/);
        let junks = ['</div>', '<br>', '</p>', /<span.*?>/, '</span>'];
        return rows.map(row => {
          let retVal = row;
          junks.forEach(junk => {
            retVal = retVal.replace(junk, '');
          })
          return retVal;
        }).filter(entry => (entry != ''));
      },
      onPaste(e) {
        // Intercept paste into the text-box. Transform rich text into plain text,
        // unless a data image is being pasted.
        e.preventDefault();
        Util.trackEvent('Wheel', 'PasteIntoTextbox', '');
        if (e.clipboardData) {
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
          const clipboardData = window.clipboardData.getData('text');
          if (clipboardData) {
            this.$store.commit('appendNames', clipboardData.split(/\n/));
          }
        }
      }
    }
  }
</script>