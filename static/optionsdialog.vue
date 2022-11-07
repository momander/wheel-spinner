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
  <b-modal :active.sync="optionsDialogVisible" :width="640" scroll="keep" :full-screen="$mq=='mobile'">
    <div class="modal-card" style="width: auto">
      <section class="modal-card-body can-go-dark">
        <b-tabs v-model="activeTab" type="is-boxed" size="is-small">
          <b-tab-item :label="$t('optionsdialog.During spin')">
            <br/>
            <duringSpinSoundPicker
              :duringSpinSound="wheelConfig.duringSpinSound"
              :duringSpinSoundVolume="wheelConfig.duringSpinSoundVolume"
              v-on:set-during-spin-sound="setDuringSpinSound"
              v-on:set-during-spin-sound-volume="setDuringSpinSoundVolume"
            />
            <hr>
            <b-checkbox v-model="wheelConfig.allowDuplicates">
              {{ $t('optionsdialog.Display duplicates') }}
              <tooltip :title="$t('optionsdialog.Display every entry')"/>
            </b-checkbox>
            <b-checkbox v-model="wheelConfig.slowSpin" style="margin-left:10px">
              {{ $t('optionsdialog.Spin slowly') }}
            </b-checkbox>
            <b-checkbox v-model="wheelConfig.showTitle" style="margin-left:10px">
              {{ $t('optionsdialog.Show title') }}
            </b-checkbox>
            <hr>
            {{ $t('optionsdialog.Spin time (seconds)') }}
            <b-slider v-model="wheelConfig.spinTime" :min="1" :max="60">
              <template v-for="val in [10,20,30,40,50,60]">
                <b-slider-tick :value="val" :key="val">{{ val }}</b-slider-tick>
              </template>
            </b-slider>
            <hr>
            <b>{{ $t('optionsdialog.Max names on wheel') }}</b>
            <tooltip v-if="entriesHaveUnequalWeight" :title="$t('optionsdialog.Disabled because the entries')"/>
            <br>
            <small>
              {{ $t('optionsdialog.All names in the text-box') }}
            </small>
            <b-slider v-model="wheelConfig.maxNames" :min="4" :max="1000" :disabled="entriesHaveUnequalWeight">
              <template v-for="val in [100,200,300,400,500,600,700,800,900,1000]">
                <b-slider-tick :value="val" :key="val">{{ val }}</b-slider-tick>
              </template>
            </b-slider>
          </b-tab-item>
          <b-tab-item :label="$t('optionsdialog.After spin')">
            <br/>
            <afterSpinSoundPicker
              :afterSpinSound="wheelConfig.afterSpinSound"
              :afterSpinSoundVolume="wheelConfig.afterSpinSoundVolume"
              :firstTextOnWheel="firstTextOnWheel"
              v-on:set-after-spin-sound="setAfterSpinSound"
              v-on:set-after-spin-sound-volume="setAfterSpinSoundVolume"
            />
            <hr>
            <b-checkbox v-model="wheelConfig.animateWinner">
              {{ $t('optionsdialog.Animate winning entry') }}
            </b-checkbox>
            <br/><br/>
            <b-checkbox v-model="wheelConfig.launchConfetti">
              {{ $t('optionsdialog.Launch confetti') }}
            </b-checkbox>
            <br/><br/>
            <b-checkbox v-model="wheelConfig.autoRemoveWinner">
              {{ $t('optionsdialog.Auto-remove winner after 5 seconds') }}
            </b-checkbox>
            <br/><br/>
            <div class="columns" style="margin-bottom:0">
              <div class="column is-narrow-desktop">
                <b-checkbox v-model="wheelConfig.displayWinnerDialog">
                  {{ $t('optionsdialog.Display popup with message:') }}
                </b-checkbox>
              </div>
              <div class="column" style="padding:0; margin-top:5px">
                <b-input v-model="wheelConfig.winnerMessage" :disabled="!wheelConfig.displayWinnerDialog" maxlength="100"></b-input>
              </div>
            </div>
            <div style="margin-top: -12px; margin-bottom: 12px">
              <b-checkbox v-model="wheelConfig.displayRemoveButton" :disabled="!wheelConfig.displayWinnerDialog" style="margin-left:25px">
                {{ $t('optionsdialog.Display Remove button') }}
              </b-checkbox>
              <br/>
              <b-checkbox v-if="wheelConfig.isAdvanced" v-model="wheelConfig.displayHideButton" :disabled="!wheelConfig.displayWinnerDialog" style="margin-left:25px">
                {{ $t('optionsdialog.Display Hide button') }}
              </b-checkbox>
            </div>
            <b-checkbox v-model="wheelConfig.playClickWhenWinnerRemoved">
              {{ $t('optionsdialog.Play click sound when the winner is removed') }}
            </b-checkbox>
          </b-tab-item>
          <b-tab-item style="height:500px" :label="$t('optionsdialog.Appearance')">
            <div class="columns is-mobile is-vcentered" v-show="!browserIsIE">
              <div class="column has-text-right">
                {{ $t('optionsdialog.One color') }}
              </div>
              <div class="column is-narrow">
                <img src="/images/color-wheel.png" class="wheel-type-image">
              </div>
              <div class="column is-narrow">
                <b-switch
                  v-model="isImageWheel"
                  passive-type='is-primary'
                  type='is-primary'
                >
                </b-switch>
              </div>
              <div class="column is-narrow" style="margin-left:-20px">
                <img src="/images/chocolate-chip-cookie.jpg" class="wheel-type-image">
              </div>
              <div class="column">
                {{ $t('optionsdialog.Wheel background image') }}
              </div>
            </div>
            <hr>
            <div v-show="wheelConfig.type=='color'">
              <div class="columns" style="margin-bottom:10px">
                <div class="column">
                  <colorThemeSelector :disabled="wheelConfig.isAdvanced"
                    v-on:set-color-theme="setColorTheme"
                    v-show="!browserIsIE"
                  />
                </div>
              </div>
              <div class="columns" style="margin-bottom:0px">
                <div class="column is-one-third">
                  {{ $t('optionsdialog.Customize colors') }}&nbsp;
                  <tooltip :title="$t('optionsdialog.Colors tooltip')"/>
                </div>
                <div class="column">
                  <div class="color-grid">
                    <div v-for="(setting, index) in wheelConfig.colorSettings" :key="index">
                      <b-checkbox v-model="setting.enabled" :disabled="wheelConfig.isAdvanced"></b-checkbox>
                      <input type="color" v-show="setting.enabled" v-model="setting.color" :disabled="wheelConfig.isAdvanced">
                    </div>
                  </div>
                </div>
              </div>
              <hr>
              <wheelCenterImagePicker
                :imageSrc="centerImageSrc"
                :pictureType="wheelConfig.pictureType"
                :galleryPicture="wheelConfig.galleryPicture"
                :customPictureName="wheelConfig.customPictureName"
                :centerText="wheelConfig.centerText"
                :isAdvanced="wheelConfig.isAdvanced"
                v-on:set-center-no-image="setCenterNoImage"
                v-on:set-center-gallery-image="setCenterGalleryImage"
                v-on:set-center-text="setCenterText"
                v-on:set-center-uploaded-image="setCenterUploadedImage"
                v-on:set-color-values="setColorValues"
                v-show="!browserIsIE"
              />
              <div class="columns is-mobile is-vcentered">
                <div class="column is-narrow">
                  {{ $t('optionsdialog.Image size') }}
                </div>
                <div class="column">
                  <b-select v-model="wheelConfig.hubSize">
                    <option
                      v-for="hubSize in hubSizes"
                      :value="hubSize"
                      :key="hubSize">
                      {{ hubSize }}
                    </option>
                  </b-select>
                </div>
              </div>
            </div>
            <div v-show="wheelConfig.type=='image'">
              <wheelBackgroundImagePicker
                :imageSrc="backgroundImageSrc"
                v-on:set-background-gallery-image="setBackgroundGalleryImage"
                v-on:set-background-uploaded-image="setBackgroundUploadedImage"
                v-show="!browserIsIE"
              />
            </div>
            <hr>
            <div class="columns is-mobile is-vcentered">
              <div class="column">
                {{ $t('optionsdialog.Background color') }}
              </div>
              <div class="column">
                <input type="color" v-model="wheelConfig.pageBackgroundColor">
              </div>
              <div class="column">
                <b-checkbox v-model="wheelConfig.drawOutlines">
                  {{ $t('optionsdialog.Contours') }}
                </b-checkbox>
              </div>
            </div>
          </b-tab-item>
        </b-tabs>
      </section>
      <footer class="modal-card-foot" style="justify-content:flex-end">
        <b-button size="is-medium" @click="close()">
          {{ $t('common.Cancel') }}
        </b-button>
        <b-button size="is-medium" type="is-primary" @click="saveOptions">
          {{ $t('common.OK') }}
        </b-button>
      </footer>
    </div>
  </b-modal>
</template>

<script>
  import duringSpinSoundPicker from './duringSpinSoundPicker.vue';
  import afterSpinSoundPicker from './afterSpinSoundPicker.vue';
  import colorThemeSelector from './colorThemeSelector.vue';
  import wheelBackgroundImagePicker from './wheelBackgroundImagePicker.vue';
  import wheelCenterImagePicker from './wheelCenterImagePicker.vue';
  import tooltip from './tooltip.vue';
  import * as hubSizes from './hubSizes.js';
  import * as Audio from './audio.js';
  import * as Util from './Util.js';
  import * as ImageUtil from './ImageUtil.js';
  import './images/color-wheel.png';
  import './images/chocolate-chip-cookie.jpg';

  export default {
    components: {
      duringSpinSoundPicker, afterSpinSoundPicker, colorThemeSelector,
      wheelBackgroundImagePicker, wheelCenterImagePicker, tooltip
    },
    data() {
      return {
        optionsDialogVisible: false, wheelConfig: {}, activeTab: 0,
        colorThemeName: '',
        hubSizes: Object.keys(hubSizes.hubSizes),
        browserIsIE: Util.browserIsIE(navigator.userAgent)
      }
    },
    computed: {
      isImageWheel: {
        get: function() {
          return this.wheelConfig.type == 'image';
        },
        set: function(newValue) {
          if (newValue) {
            this.wheelConfig.type = 'image';
          }
          else {
            this.wheelConfig.type = 'color';
          }
        }
      },
      backgroundImageSrc() {
        if (this.wheelConfig.coverImageType=='gallery') return this.wheelConfig.coverImageName;
        if (this.wheelConfig.coverImageType=='uploaded') return this.wheelConfig.customCoverImageDataUri;
        return '/images/none.png';
      },
      centerImageSrc() {
        if (this.wheelConfig.getWheelImage) {
          return this.wheelConfig.getWheelImage();
        }
      },
      firstTextOnWheel() {
        if (this.wheelConfig.getFirstText) {
          return this.wheelConfig.getFirstText();
        }
      },
      entriesHaveUnequalWeight() {
        if (!this.wheelConfig.entries || this.wheelConfig.entries.length == 0 || !this.wheelConfig.entries[0].weight) return false;
        return !!this.wheelConfig.entries.find(entry => entry.weight != 1);
      }
    },
    methods: {
      show() {
        this.wheelConfig = this.$store.getters.wheelConfig.clone();
        this.optionsDialogVisible = true;
        this.colorThemeName = '';
      },
      setDuringSpinSound(sound) {
        this.wheelConfig.duringSpinSound = sound;
      },
      setDuringSpinSoundVolume(volume) {
        this.wheelConfig.duringSpinSoundVolume = volume;
      },
      setAfterSpinSound(sound) {
        this.wheelConfig.afterSpinSound = sound;
      },
      setAfterSpinSoundVolume(volume) {
        this.wheelConfig.afterSpinSoundVolume = volume;
      },
      setCenterNoImage() {
        this.wheelConfig.pictureType = 'none';
        this.wheelConfig.galleryPicture = '/images/none.png';
        this.wheelConfig.customPictureName = '';
        this.wheelConfig.customPictureDataUri = '';
        this.wheelConfig.centerText = '';
      },
      setCenterGalleryImage(fileName) {
        this.wheelConfig.pictureType = 'gallery';
        this.wheelConfig.galleryPicture = fileName;
        this.wheelConfig.customPictureName = '';
        this.wheelConfig.customPictureDataUri = '';
        this.wheelConfig.centerText = '';
      },
      setCenterText(text) {
        this.wheelConfig.pictureType = 'text';
        this.wheelConfig.galleryPicture = '/images/none.png';
        this.wheelConfig.customPictureName = '';
        this.wheelConfig.customPictureDataUri = '';
        this.wheelConfig.centerText = text;
        this.wheelConfig.customPictureDataUri = ImageUtil.renderText(text);
      },
      setCenterUploadedImage({fileName, dataUri}) {
        this.wheelConfig.pictureType = 'uploaded';
        this.wheelConfig.customPictureName = fileName;
        this.wheelConfig.customPictureDataUri = dataUri;
        this.wheelConfig.centerText = '';
      },
      setBackgroundGalleryImage(fileName) {
        this.wheelConfig.coverImageType = 'gallery';
        this.wheelConfig.coverImageName = fileName;
        this.wheelConfig.customCoverImageDataUri = '';
      },
      setBackgroundUploadedImage({fileName, dataUri}) {
        this.wheelConfig.coverImageName = fileName;
        this.wheelConfig.customCoverImageDataUri = dataUri;
        this.wheelConfig.coverImageType = 'uploaded';
      },
      setColorTheme(payload) {
        this.colorThemeName = payload.name;
        this.wheelConfig.setColorValues(payload.colors);
      },
      setColorValues(colors) {
        this.wheelConfig.setColorValues(colors);
        this.$forceUpdate();
      },
      close() {
        Audio.stopMusicNow();
        Audio.stopAfterSpinSound();
        this.optionsDialogVisible = false;
      },
      saveOptions() {
        Audio.stopMusicNow();
        Audio.stopAfterSpinSound();
        this.$store.commit('setWheelConfig', this.wheelConfig);
        if (this.colorThemeName) {
          Util.trackEvent('Wheel', 'SelectedTheme', this.colorThemeName);
        }
        this.optionsDialogVisible = false;
      }
    }
  }
</script>

<style scoped>
  .color-grid {
    display: grid;
    grid-template-columns: 120px 120px 120px;
    grid-gap: 10px;
  }
  .wheel-type-image {
    height: 50px;
    border-radius: 50%;
    filter: drop-shadow(2px 2px 2px #aaaaaa);
  }
</style>
