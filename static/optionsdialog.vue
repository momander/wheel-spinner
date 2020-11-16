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
            <div class="columns">
              <div class="column is-2">
                {{ $t('optionsdialog.Sound') }}
              </div>
              <div class="column">
                <b-select v-model="wheelConfig.duringSpinSound">
                  <option
                    v-for="sound in duringSpinSounds"
                    :value="sound.value"
                    :key="sound.value">
                    {{ $t(sound.name) }}
                  </option>
                </b-select>
              </div>
            </div>
            <br/>
            <b-checkbox v-model="wheelConfig.allowDuplicates">
              {{ $t('optionsdialog.Allow duplicates on wheel') }}
            </b-checkbox>
            <b-checkbox v-model="wheelConfig.slowSpin">
              {{ $t('optionsdialog.Spin slowly') }}
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
            <br>
            <small>
              {{ $t('optionsdialog.All names in the text-box') }}
            </small>
            <b-slider v-model="wheelConfig.maxNames" :min="4" :max="500">
              <template v-for="val in [50,100,150,200,250,300,350,400,450,500]">
                <b-slider-tick :value="val" :key="val">{{ val }}</b-slider-tick>
              </template>
            </b-slider>
          </b-tab-item>
          <b-tab-item :label="$t('optionsdialog.After spin')">
            <br/>
            <div class="columns">
              <div class="column is-2">
                {{ $t('optionsdialog.Sound') }}
              </div>
              <div class="column">
                <b-select v-model="wheelConfig.afterSpinSound">
                  <option
                    v-for="sound in afterSpinSounds"
                    :value="sound.value"
                    :key="sound.value">
                    {{ $t(sound.name) }}
                  </option>
                </b-select>
              </div>
            </div>
            <br/>
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
            <b-checkbox v-model="wheelConfig.displayWinnerDialog">
              {{ $t('optionsdialog.Display popup with message:') }}
            </b-checkbox>
            <b-input v-model="wheelConfig.winnerMessage" :disabled="!wheelConfig.displayWinnerDialog" style="margin-left:25px" maxlength="100"></b-input>
            <b-checkbox v-model="wheelConfig.playClickWhenWinnerRemoved">
              {{ $t('optionsdialog.Play click sound when the winner is removed') }}
            </b-checkbox>
          </b-tab-item>
          <b-tab-item :label="$t('optionsdialog.Colors')">
            <br/>
            <div class="columns" style="margin-bottom:10px">
              <div class="column is-one-third">
                {{ $t('optionsdialog.Apply a theme') }}
              </div>
              <div class="column">
                <b-field grouped>
                  <b-select v-model="colorThemeCategory" :placeholder="$t('optionsdialog.Pick category')" expanded>
                    <option
                      v-for="categoryName in Object.keys(colorThemeCategories)"
                      :value="categoryName"
                      :key="categoryName">
                      {{ categoryName }}
                    </option>
                  </b-select>
                  <b-select v-model="colorTheme" :placeholder="$t('optionsdialog.Pick theme')" expanded>
                    <option
                      v-for="themeName in Object.keys(colorThemes)"
                      :value="themeName"
                      :key="themeName">
                      {{ themeName }}
                    </option>
                  </b-select>
                </b-field>
              </div>
            </div>
            <hr>
            <div class="columns" style="margin-bottom:10px">
              <div class="column is-one-third">
                {{ $t('optionsdialog.Customize colors') }}
              </div>
              <div class="column">
                <div class="color-grid">
                  <div v-for="(setting, index) in wheelConfig.colorSettings" :key="index">
                    <b-checkbox v-model="setting.enabled"></b-checkbox>
                    <input type="color" v-model="setting.color">
                  </div>
                </div>
              </div>
            </div>
            <hr>
            <div class="columns" style="margin-bottom:10px">
              <div class="column is-one-third">
                {{ $t('optionsdialog.Background color') }}
              </div>
              <div class="column">
                <div class="color-grid">
                  <input type="color" v-model="wheelConfig.pageBackgroundColor">
                </div>
              </div>
            </div>

          </b-tab-item>
          <b-tab-item :label="$t('optionsdialog.Image')">
            <br/>
            <div class="columns">
              <div class="column is-half">
                {{ $t('optionsdialog.Image in the center of the wheel') }}
              </div>
              <div class="column">
                <b-select v-model="wheelConfig.pictureType" expanded>
                  <option value="none">{{ $t('optionsdialog.None') }}</option>
                  <option value="gallery">{{ $t('optionsdialog.From Gallery') }}</option>
                  <option value="uploaded">{{ $t('optionsdialog.Custom') }}</option>
                </b-select>
              </div>
            </div>
            <b-select :placeholder="$t('optionsdialog.Select a gallery picture')" v-model="wheelConfig.galleryPicture" v-show="wheelConfig.pictureType=='gallery'" expanded>
              <option
                v-for="pic in galleryPictures"
                :value="pic.fileName"
                :key="pic.fileName">
                {{ pic.title }}
              </option>
            </b-select>
            <b-input v-model="wheelConfig.customPictureName" disabled v-show="wheelConfig.pictureType=='uploaded'"></b-input>
            <br/>
            <b-field class="file" v-show="wheelConfig.pictureType=='uploaded'">
              <br/><br/>
              <b-upload accept="image/*" v-model="uploadedImage">
                <a class="button">
                  <i class="fas fa-upload"></i>
                  &nbsp;
                  {{ $t('optionsdialog.Upload image') }}
                </a>
              </b-upload>
            </b-field>
            <div class="columns">
              <div class="column is-one-third">
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
          </b-tab-item>
        </b-tabs>
      </section>
      <footer class="modal-card-foot" style="justify-content:flex-end">
        <b-button size="is-medium" @click="optionsDialogVisible=false">
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
  import galleryImageList from './galleryImageList.js';
  import colorThemeList from './colorThemeList.js';
  import * as hubSizes from './hubSizes.js';
  import * as Audio from './audio.js';
  import * as Util from './Util.js';
  import * as ImageUtil from './ImageUtil.js';

  export default {
    data() {
      return {
        optionsDialogVisible: false, wheelConfig: {}, activeTab: 0,
        galleryPictures: galleryImageList.list,
        colorThemeCategories: colorThemeList.list,
        colorThemeCategory: null, colorThemes: [], colorTheme: null,
        uploadedImage: {}, duringSpinSounds: Audio.getDuringSpinSounds(),
        afterSpinSounds: Audio.getAfterSpinSounds(),
        hubSizes: Object.keys(hubSizes.hubSizes)
      }
    },
    computed: {
      pictureType() {
        return this.wheelConfig.pictureType;
      },
      galleryPicture() {
        return this.wheelConfig.galleryPicture;
      },
      customPictureName() {
        return this.wheelConfig.customPictureName;
      }
    },
    watch: {
      pictureType: function(newValue) {
        if (newValue != 'gallery') {
          this.wheelConfig.galleryPicture = 'images/none.png';
        }
        if (newValue != 'uploaded') {
          this.wheelConfig.customPictureName = '';
          this.wheelConfig.customPictureDataUri = '';
        }
      },
      uploadedImage: function(newValue) {
        var reader = new FileReader();
        const self = this;
        reader.onload = async function(e) {
          Util.trackEvent('Wheel', 'UploadedCustomImage', '');
          const dataUri = await ImageUtil.optimizeCenterImage(e.target.result);
          self.wheelConfig.setCustomPicture(newValue.name, dataUri);
          self.$buefy.dialog.confirm({
            message: self.$t('optionsdialog.Your image has been uploaded', {fileName: newValue.name}),
            hasIcon: true,
            icon: 'palette',
            iconPack: 'fa',
            confirmText: self.$t('optionsdialog.Yes'),
            cancelText: self.$t('optionsdialog.No'),
            onConfirm: () => self.setColorsFromCustomPicture()
          })
        }
        reader.readAsDataURL(newValue);
      },
      colorThemeCategory: function(newValue) {
        if (newValue) {
          this.colorThemes = this.colorThemeCategories[newValue];
          this.colorTheme = null;
        }
      },
      colorTheme: function(newValue) {
        if (newValue) {
          Util.trackEvent('Wheel', 'SetColorTheme', newValue);
          for (let i=0; i<this.wheelConfig.colorSettings.length; i++) {
            this.wheelConfig.colorSettings[i] = {color: '#000000', enabled: false};
          }
          const colors = this.colorThemes[newValue];
          for (let i=0; i<colors.length; i++) {
            this.wheelConfig.colorSettings[i] = {color: colors[i], enabled: true};
          }
        }
      }
    },
    methods: {
      show() {
        this.wheelConfig = this.$store.state.wheelConfig.clone();
        this.colorThemeCategory = null;
        this.colorTheme = null;
        this.optionsDialogVisible = true;
      },
      async setColorsFromCustomPicture() {
        Util.trackEvent('Wheel', 'SetColorsFromCustomPicture', '');
        const colors = await ImageUtil.extractColors(this.wheelConfig.customPictureDataUri);
        for (let i=0; i<colors.length; i++) {
          this.wheelConfig.colorSettings[i] = {color: colors[i], enabled: true};
        }
        this.$forceUpdate();
      },
      saveOptions() {
        this.$store.commit('setWheelConfig', this.wheelConfig);
        this.optionsDialogVisible = false;
      },
    }
  }
</script>

<style scoped>
  .color-grid {
    display: grid;
    grid-template-columns: 100px 100px 100px;
    grid-gap: 20px;
  }
</style>
