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
    <div class="columns is-mobile is-vcentered">
      <div class="column is-narrow">
        {{ $t('optionsdialog.Wheel background image') }}
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
          <b-dropdown-item custom value="upload" key="upload">
            <b-upload ref="upload-button" accept="image/*" v-model="uploadedCoverImage">
              <a class="button">
                <i class="fas fa-upload"></i>
                &nbsp;
                {{ $t('optionsdialog.Upload image') }}
              </a>
            </b-upload>
          </b-dropdown-item>
          <template v-for="pic in coverImages">
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
  import coverImageList from './coverImageList.js';
  import * as Util from './Util.js';
  import * as ImageUtil from './ImageUtil.js';

  export default {
    props: ['imageSrc'],
    data() {
      return {
        dropdownItem: '',
        coverImages: coverImageList.list, uploadedCoverImage: {}
      }
    },
    watch: {
      dropdownItem: function(newValue) {
        this.$emit('set-background-gallery-image', newValue.fileName);
      },
      uploadedCoverImage: function(newValue) {
        this.$refs.dropDown.toggle();
        const reader = new FileReader();
        const self = this;
        reader.onload = async function(e) {
          Util.trackEvent('Wheel', 'UploadedCustomImage', '');
          const dataUri = await ImageUtil.optimizeCoverImage(e.target.result);
          self.$emit('set-background-uploaded-image', {
            fileName: newValue.name,
            dataUri: dataUri
          });
        }
        reader.readAsDataURL(newValue);
      },
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
