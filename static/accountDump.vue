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
    Firestore ID
    <pre>{{ id }}</pre>
    <hr>
    Wheels
    <pre>{{ dump }}</pre>
  </div>
</template>

<script>
  export default {
    data() {
      return {id: 'Loading...', dump: 'Loading...'};
    },
    async mounted() {
      if (await this.$store.dispatch('userIsLoggedIn')) {
        this.id = await this.$store.dispatch('getUid');
        await this.$store.dispatch('loadSavedWheels');
        await this.$store.dispatch('loadSharedWheels');
        const wheels = {
          savedWheels: this.$store.getters.savedWheels,
          sharedWheels: this.$store.getters.sharedWheels
        }
        this.dump = JSON.stringify(wheels, null, 2);
      }
      else {
        this.id = '<Sign-in required>';
        this.dump = '<Sign-in required>';
      }
    }
  }
</script>
