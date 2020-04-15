<template>
  <div>
    Firestore ID
    <pre>{{ id }}</pre>
    <hr>
    Saved wheels
    <pre>{{ dump }}</pre>
  </div>
</template>

<script>
  import * as Firebase from './Firebase.js';

  export default {
    data() {
      return {id: '?', dump: '?'}
    },
    async mounted() {
      await Firebase.loadLibraries();
      if (await Firebase.userIsLoggedIn()) {
        const user = await Firebase.getLoggedInUser();
        this.id = user.uid;
        const account = await Firebase.getWheels(user.uid);
        this.dump = JSON.stringify(account, null, 2);
      }
      else {
        this.id = '<Sign-in required>';
        this.dump = '<Sign-in required>';
      }
    }
  }
</script>
