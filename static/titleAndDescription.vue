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
    <h3 class="subtitle is-3" style="margin-bottom:1rem">{{ wheelTitle }}
      <span v-if="editable" class="is-size-5" style="color:#CCC">
        <b-tooltip :label="$t('common.Edit title and description')" type="is-light" position="is-right">
          <i class="fas fa-edit clickable-icon" @click="$emit('editTitleAndDescription')"></i>
        </b-tooltip>
      </span>
    </h3>
    <p>
      {{ wheelDescription }}
    </p>
    <br/>
  </div>
</template>

<script>
  import * as Util from './Util.js';
  import { mapGetters } from "vuex";

  export default {
    props: {
      editable: Boolean
    },
    computed: {
      wheelTitle() {
        return this.wheelConfig.title;
      },
      wheelDescription() {
        return this.wheelConfig.description;
      },
      ...mapGetters([
        'wheelConfig'
      ])
    },
    methods: {
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
</style>