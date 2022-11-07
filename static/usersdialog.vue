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
    <b-modal :active.sync="displayMe" :width="640" scroll="keep">
      <div class="modal-card" style="width: auto">
        <header class="modal-card-head">
          <p class="modal-card-title">
            <i class="fas fa-user"></i>&nbsp;Admins
          </p>
        </header>
        <section class="modal-card-body can-go-dark">
          <table class="table can-go-dark">
            <thead>
              <tr>
                <th>Name</th>
                <th>Firestore ID</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="admin in admins" :key="admin.uid">
                <td>{{ admin.name }}</td>
                <td>{{ admin.uid }}</td>
                <td>
                  <b-button type="is-light" @click="removeUser(admin.uid, admin.name)">
                    <i class="fas fa-trash-alt"></i>
                  </b-button>
                </td>
              </tr>
              <tr>
                <td>
                  <b-input v-model="newUserName" placeholder="New admin's name"></b-input>
                </td>
                <td>
                  <b-input v-model="newUserFirestoreId" placeholder="New admin's Firestore ID"></b-input>
                </td>
                <td>
                  <b-button type="is-light" :disabled="!newUserValidInput"
                    @click="addUser()"
                  >
                    <i class="fas fa-plus"></i>
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
  import * as Firebase from './Firebase.js';

  export default {
    data() {
      return {
        displayMe: false, newUserName: '', newUserFirestoreId: '',
        admins: []
      }
    },
    computed: {
      newUserValidInput() {
        return this.newUserName && this.newUserFirestoreId;
      },
    },
    methods: {
      async show() {
        this.displayMe = true;
        this.loadAdmins();
      },
      isShowing() {
        return this.displayMe;
      },
      async loadAdmins() {
        this.admins = await Firebase.getAdmins();
      },
      async removeUser(uid, name) {
        if (confirm(`Are you sure you want to delete ${name}?`)) {
          await Firebase.deleteAdmin(uid);
          this.loadAdmins();
        }
      },
      async addUser() {
        await Firebase.addAdmin(this.newUserFirestoreId, this.newUserName);
        this.newUserName = '';
        this.newUserFirestoreId = '';
        this.loadAdmins();
      },
      close() {
        this.displayMe = false;
      },
    }
  }
</script>
