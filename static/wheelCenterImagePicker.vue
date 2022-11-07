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
    <div class="columns is-vcentered is-mobile">
      <div class="column is-narrow">
        {{ $t('optionsdialog.Image in the center of the wheel') }}
      </div>
      <div class="column">
        <b-dropdown
            ref="dropDown"
            append-to-body
            aria-role="menu"
            scrollable
            max-height="400"
            trap-focus
            v-model="dropdownItem"
        >
          <template #trigger="{ active }">
            <b-button :icon-right="active ? 'caret-up' : 'caret-down'" style="height:50px">
              <img :src="imageSrc" class="preview-image">
            </b-button>
          </template>
          <b-dropdown-item v-show="!imageSrc.includes('none')" custom value="none" key="none">
            <b-button @click="removeImage">
              <i class="fas fa-ban"></i>
              &nbsp;
              {{ $t('optionsdialog.Remove image') }}
            </b-button>
          </b-dropdown-item>
          <b-dropdown-item separator v-show="!imageSrc.includes('none')"/>
          <b-dropdown-item custom value="upload" key="upload">
            <b-upload ref="upload-button" accept="image/*" v-model="uploadedImage">
              <a class="button">
                <i class="fas fa-upload"></i>
                &nbsp;
                {{ $t('optionsdialog.Upload image') }}
              </a>
            </b-upload>
          </b-dropdown-item>
          <b-dropdown-item separator/>
          <b-dropdown-item custom value="upload" key="text">
            <b-field>
              <b-input
                :placeholder="$t('optionsdialog.Center text')"
                @keyup.native.enter="setText"
                maxlength="20"
                v-model="myCenterText"
              ></b-input>
              <p class="control">
                <b-button class="button is-primary" @click="setText">
                  {{ $t('common.Save') }}
                </b-button>
              </p>
            </b-field>
          </b-dropdown-item>
          <b-dropdown-item separator/>
          <template v-for="pic in galleryPictures">
            <b-dropdown-item :value="pic" :key="pic.fileName">
              <img :src="pic.fileName" class="preview-image">
              &nbsp;
              {{pic.title}}
            </b-dropdown-item>
          </template>
        </b-dropdown>
      </div>
    </div>
  </div>
</template>

<script>
  import * as Util from './Util.js';
  import * as ImageUtil from './ImageUtil.js';
  import galleryImageList from './galleryImageList.js';

  export default {
    props: {
      imageSrc: String,
      centerText: String,
      isAdvanced: Boolean
    },
    data() {
      return {
        dropdownItem: '', myCenterText: this.centerText,
        galleryPictures: galleryImageList.list, uploadedImage: {}
      }
    },
    watch: {
      dropdownItem: function(newValue) {
        if (newValue.fileName) {
          this.myCenterText = '';
          this.$emit('set-center-gallery-image', newValue.fileName);
        }
      },
      uploadedImage: function(newValue) {
        this.$refs.dropDown.toggle();
        this.myCenterText = '';
        var reader = new FileReader();
        const self = this;
        reader.onload = async function(e) {
          Util.trackEvent('Wheel', 'UploadedCustomImage', '');
          const dataUri = await ImageUtil.optimizeCenterImage(e.target.result);
          self.$emit('set-center-uploaded-image', {fileName: newValue.name, dataUri: dataUri});
          self.offerToUpdateWheelColors(newValue.name, dataUri);
        }
        reader.readAsDataURL(newValue);
      }
    },
    methods: {
      removeImage() {
        this.$refs.dropDown.toggle();
        this.myCenterText = '';
        this.$emit('set-center-no-image');
      },
      setText() {
        this.$refs.dropDown.toggle();
        this.$emit('set-center-text', this.myCenterText);
      },
      offerToUpdateWheelColors(fileName, dataUri) {
        if (!this.isAdvanced) {
          this.$buefy.dialog.confirm({
            message: this.$t('optionsdialog.Your image has been uploaded', {fileName: fileName}),
            hasIcon: true,
            icon: 'palette',
            iconPack: 'fa',
            confirmText: this.$t('optionsdialog.Yes'),
            cancelText: this.$t('optionsdialog.No'),
            onConfirm: () => this.setColorsFromCustomPicture(dataUri)
          })
        }
      },
      async setColorsFromCustomPicture(dataUri) {
        Util.trackEvent('Wheel', 'SetColorsFromCustomPicture', '');
        const colors = await ImageUtil.extractColors(dataUri);
        this.$emit('set-color-values', colors);
      }
    }
  }
</script>

<style scoped>
  .preview-image {
    height: 30px;
    vertical-align: middle;
    border-radius: 50%;
  }
</style>
