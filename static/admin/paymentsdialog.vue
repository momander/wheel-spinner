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
    <b-modal :active.sync="displayPaymentsDialog" :width="640" scroll="keep">
      <div class="modal-card" style="width: auto">
        <header class="modal-card-head">
          <p class="modal-card-title">
            <i class="fas fa-money-check-alt"></i>&nbsp;Earnings
          </p>
        </header>
        <section class="modal-card-body can-go-dark">
          <table class="table can-go-dark">
            <thead>
              <tr>
                <th>Name</th>
                <th style="text-align:right;">Reviews</th>
                <th style="text-align:right;">Earnings</th>
                <th>Last review</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="admin in admins" :key="admin.uid">
                <td>{{ admin.name }}</td>
                <td style="text-align:right;">
                  {{ admin.totalReviews }}
                </td>
                <td style="text-align:right;">
                  {{ admin.totalReviews * earningsPerReview | dollaramount }}
                </td>
                <td>{{ admin.lastReview | firestoremilliseconds | timeago }}</td>
                <td>
                  <b-button type="is-light" @click="resetAdminsWheels(admin.uid, admin.name)">
                    <i class="fas fa-times"></i>&nbsp;Reset
                  </b-button>
                </td>
              </tr>
            </tbody>
          </table>
        </section>
        <footer class="modal-card-foot" style="justify-content:flex-end">
          <b-button @click="close()">
            Close
          </b-button>
        </footer>
      </div>
    </b-modal>
  </div>
</template>

<script>
  import { timeago, firestoremilliseconds, dollaramount } from './filters.js';

  export default {
    filters: { timeago, firestoremilliseconds, dollaramount },
    data() {
      return {
        displayPaymentsDialog: false
      }
    },
    computed: {
      earningsPerReview() {
        return this.$store.state.earningsPerReviewDoc.value;
      },
      admins() {
        return this.$store.state.admins;
      },
    },
    methods: {
      async show() {
        this.displayPaymentsDialog = true;
      },
      async resetAdminsWheels(uid, name) {
        if (confirm(`Are you sure you want to reset ${name}'s earnings to zero?`)) {
          this.$store.dispatch('setAdminsReviewsToZero', uid);
        }
      },
      close() {
        this.displayPaymentsDialog = false;
      },
      getEarnings(reviews) {
        return (reviews * this.earningsPerReview).toFixed(2)
      }
    }
  }
</script>
