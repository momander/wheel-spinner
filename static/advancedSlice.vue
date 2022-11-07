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
  <div class="card can-go-dark">
    <div class="card-content" style="padding: 12px 12px 0px 12px">
      <div class="columns is-mobile" style="margin-bottom:0">
        <div class="column is-narrow" :style="entry.enabled?'':'opacity:0.4'">
          <div class="v-centered">
            <i v-if="i>0" class="fas fa-arrow-up clickable-icon"
              @click="moveEntry(i, -1)">
            </i>
            <br v-if="i>0"/>
            <i v-if="i<entries.length-1" @click="moveEntry(i, 1)"
              class="fas fa-arrow-down clickable-icon">
            </i>
          </div>
        </div>
        <div class="column" style="padding: 0"
          :style="entry.enabled?'':'opacity:0.4'">
          <div class="columns is-mobile"
            style="padding-left: 0; padding-right: 6px; margin: 12px 0 0 0">
            <div class="column"
              style="padding: 0 8px 0 8px; margin-bottom: 12px">
              <b-input v-model="entry.text" :disabled="wheelIsBusy"
                ref="textbox" @input="updateEntryText(i, entry.text)"/>
            </div>
            <div class="column is-narrow" style="padding: 2px 8px 0 8px"
              v-if="wheelConfig.type == 'color'">
              <input type="color" v-model="entry.color" :disabled="wheelIsBusy"
                @change="updateEntryColor(i, entry.color)"/>
            </div>
          </div>
          <div v-if="entry.image" style="padding: 0 8px 0 8px;">
            <img :src="entry.image" :alt="$t('advancededitor.Image attached')"
              style="border-radius: 4px; max-height: 40px"/>
            <i class="fas fa-times clickable-icon"
              style="padding-top: 2px; vertical-align: top"
              @click="removeImageFromEntry(i)"></i>
          </div>
          <transition name="slide">
            <div v-if="expanded" style="padding: 0 0 8px 8px; width:170px">
              <b-select v-model="sound" icon-pack="fas" icon="volume-up"
                size="is-small" :disabled="wheelIsBusy">
                <option value="">
                  {{ $t('advancededitor.Inherit from wheel') }}
                </option>
                <option v-for="sound in afterSpinSounds" :value="sound.value"
                  :key="sound.value">
                  {{ $t(sound.name) }}
                </option>
              </b-select>
              <b-input v-if="wheelConfig.displayWinnerDialog" v-model="message"
                :placeholder="$t('advancededitor.Popup message')"
                size="is-small" style="margin-top:8px" :disabled="wheelIsBusy">
              </b-input>
              <div class="columns is-mobile is-vcentered">
                <div class="column is-9" style="margin-top:8px">
                  <b-field>
                    <b-numberinput v-model="weight" size="is-small"
                      icon-pack="fas" icon="balance-scale-left"
                      :disabled="wheelIsBusy" min="1" max="999"
                      controls-rounded controls-position="compact">
                    </b-numberinput>
                  </b-field>
                </div>
                <div class="column is-narrow"
                  style="margin-top:8px; font-size:14px">
                  {{ odds }}%
                </div>
              </div>
            </div>
          </transition>
        </div>
        <div class="column is-narrow" style="padding: 0; margin: 12px 0 0 0"
          :style="entry.enabled?'':'opacity:0.4'">
          <b-tooltip :label="$t('advancededitor.Duplicate')" type="is-light"
            position="is-left">
            <i class="far fa-clone clickable-icon" @click="duplicateEntry(i)">
            </i>
          </b-tooltip>
          <br/>
          <b-tooltip :label="$t('textboxbuttons.Add image')" type="is-light"
            position="is-left">
            <b-upload accept="image/*" v-model="uploadedImage"
              :disabled="wheelIsBusy">
              <i class="far fa-image clickable-icon"
                @click="attachImageToEntry(i)">
              </i>
            </b-upload>
          </b-tooltip>
        </div>
        <div class="column is-narrow">
          <i class="fas fa-times clickable-icon" @click="removeEntry(i)"
            style="font-size: 125%; padding-top: 2px"
            :style="entry.enabled?'':'opacity:0.4'">
          </i>
          <br/>
          <b-tooltip  type="is-light" position="is-left"
            :label="entry.enabled ? $t('advancededitor.Shown on the wheel') : $t('advancededitor.Not shown on the wheel')">
            <b-checkbox size="is-small" v-model="entry.enabled"
              @input="toggleEntryEnabled()" :disabled="wheelIsBusy"
              style="margin-right:-10px"/>
          </b-tooltip>
        </div>
      </div>
      <div class="has-text-centered"
        :style="(entry.enabled?'':'opacity:0.4;') + (expanded ? 'margin-top:-6px': 'margin-top:-20px')">
        <i @click="toggleExpanded()"
          :class="'fas clickable-icon stretched fa-angle-' + (expanded ? 'up' : 'down')">
        </i>
      </div>
    </div>
  </div>
</template>

<script>
  import * as Util from './Util.js';
  import * as Audio from './audio.js';
  import * as ImageUtil from './ImageUtil.js';
  import { mapGetters } from "vuex";

  export default {
    props: {
      entry: Object,
      i: Number
    },
    data() {
      return {
        uploadedImage: {}, entryImageIndex: null, expanded: false,
        afterSpinSounds: Audio.getAfterSpinSounds()
      }
    },
    watch: {
      uploadedImage: function(file) {
        Util.trackEvent('Wheel', 'AttachImageToEntry');
        const reader = new FileReader();
        const self = this;
        reader.onload = async function(e) {
          const dataUri = await ImageUtil.optimizeSliceImage(e.target.result);
          self.$store.dispatch('attachImageToEntry', {imageData: dataUri, index: self.entryImageIndex});
        }
        reader.readAsDataURL(file);
      }
    },
    computed: {
      entries() {
        return this.wheelConfig.entries;
      },
      sound: {
        get() {
          return this.entry.sound || '';
        },
        set(newValue) {
          Util.trackEvent('Wheel', 'SetAdvancedEntrySound', newValue);
          this.$store.commit('setEntrySound', {index: this.i, sound: newValue});
        }
      },
      message: {
        get() {
          return this.entry.message || '';
        },
        set(newValue) {
          this.$store.commit('setEntryMessage', {index: this.i, message: newValue});
        }
      },
      weight: {
        get() {
          return this.entry.weight;
        },
        set(newValue) {
          this.$store.commit('setEntryWeight', {index: this.i, weight: newValue});
        }
      },
      odds() {
        if (!this.entry.enabled) return 0;
        let entries = this.entries;
        if (!this.wheelConfig.allowDuplicates) {
          if (Util.entryIsDuplicate(this.entries, this.entry)) return 0;
          entries = Util.dedupeEntries(false, this.entries);
        }
        const totalWeight = Util.getTotalWeight(entries);
        return +(100 * this.entry.weight / totalWeight).toFixed(1); // The + removes unnecessary .0s
      },
      ...mapGetters([
        'wheelConfig', 'wheelIsBusy', 'sheetLinked', 'appInfoVisible'
      ])
    },
    methods: {
      focus() {
        this.$refs.textbox.focus();
      },
      toggleExpanded() {
        this.expanded = !this.expanded;
        Util.trackEvent('Wheel', 'ToggleAdvancedExpanded', this.expanded);
      },
      updateEntryText(i, text) {
        this.$store.commit('setEntryText', {index: i, text: text});
      },
      updateEntryColor(i, color) {
        this.$store.commit('setEntryColor', {index: i, color: color});
      },
      updateEntryWeight(i, weight) {
        this.$store.commit('setEntryWeight', {index: i, weight: weight});
      },
      toggleEntryEnabled() {
        Util.trackEvent('Wheel', 'ToggleEntryEnabled');
        this.$store.commit('refreshEntries');
      },
      removeEntry(index) {
        if (!this.wheelIsBusy) {
          Util.trackEvent('Wheel', 'RemoveAdvancedEntry');
          this.$store.commit('removeEntryByIndex', index);
        }
      },
      moveEntry(i, direction) {
        if (!this.wheelIsBusy) {
          Util.trackEvent('Wheel', 'MoveAdvancedEntry', direction);
          this.$store.commit('moveEntry', {index: i, direction: direction});
        }
      },
      duplicateEntry(i) {
        if (!this.wheelIsBusy) {
          Util.trackEvent('Wheel', 'DuplicateEntry');
          this.$store.commit('duplicateEntry', i);
        }
      },
      attachImageToEntry(i) {
        if (!this.wheelIsBusy) this.entryImageIndex = i;
      },
      removeImageFromEntry(i) {
        if (!this.wheelIsBusy) this.$store.commit('removeImageFromEntry', i);
      },
    }
  }
</script>

<style scoped>
  .clickable-icon {
    cursor: pointer;
    color: #CCC;
  }
  .clickable-icon:hover {
    color: #999;
  }
  .stretched {
    transform: scale(1.8, 1.2);
  }
  .v-centered {
    position: relative;
    top: 50%;
    -ms-transform: translateY(-50%);
    transform: translateY(-50%);
  }
  .slide-enter-active {
    transition-duration: 0.3s;
    transition-timing-function: ease-out;
  }
  .slide-leave-active {
    transition-duration: 0.3s;
    transition-timing-function: ease-out;
  }
</style>