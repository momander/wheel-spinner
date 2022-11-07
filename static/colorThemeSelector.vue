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
  <b-dropdown
      append-to-body
      aria-role="menu"
      scrollable
      max-height="400"
      trap-focus
      v-model="colorTheme"
  >
    <template #trigger="{ active }">
        <b-button
            :label="$t('optionsdialog.Apply a theme')"
            type="is-primary"
            :icon-right="active ? 'caret-up' : 'caret-down'"
            :disabled="disabled"/>
    </template>
    <template v-for="themeCategoryName in Object.keys(colorThemeCategories)">
      <b-dropdown-item :key="themeCategoryName">
        <b>{{themeCategoryName}}</b>
      </b-dropdown-item>
      <template v-for="themeName in Object.keys(colorThemeCategories[themeCategoryName])">
        <b-dropdown-item :key="themeName" :value="themeCategoryName+', '+themeName">
          &nbsp;&nbsp;{{themeName}}
          <template v-for="color in colorThemeCategories[themeCategoryName][themeName]">
            <svg width="12" height="12" style="margin-left:5px">
              <rect width="12" height="12" :style="'fill:'+color+';stroke-width:1;stroke:rgb(0,0,0)'" />
            </svg>
          </template>
        </b-dropdown-item>
      </template>
      <b-dropdown-item separator/>
    </template>
  </b-dropdown>
</template>

<script>
  import colorThemeList from './colorThemeList.js';

  export default {
    props: {
      disabled: Boolean
    },
    data() {
      return {
        colorThemeCategories: colorThemeList.list, colorTheme: null
      }
    },
    watch: {
      colorTheme: function(newValue) {
        if (!newValue) return;
        const parts = newValue.split(',');
        if (parts.length==2) {
          const categoryName = parts[0].trim();
          const name = parts[1].trim();
          const colors = this.colorThemeCategories[categoryName][name];
          const payload = {name: newValue, colors: colors};
          this.$emit('set-color-theme', payload);
        }
      }
    }
  }
</script>
