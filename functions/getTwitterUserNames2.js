/*
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
*/
const functions = require('firebase-functions');
const admin = require('firebase-admin');
const TwitterService = require('./TwitterService.js');
const express = require('express');
const cors = require('cors');
const app = express();
app.use(cors({ origin: true }));

app.get('/:searchTerm', async (req, res) => {
  try {
    const users = await TwitterService.getTwitterUserNames(
      await getSetting('TWITTER_APP_KEY'),
      await getSetting('TWITTER_APP_SECRET'),
      await getSetting('TWITTER_BEARER_TOKEN'),
      req.params.searchTerm
    );
    res.json(users);
  }
  catch(ex) {
    res.status(500).json({error: ex});
  }
});
exports.func = () => functions.https.onRequest(app);

async function getSetting(key) {
  let db = admin.firestore();
  let doc = await db.collection("settings").doc(key).get();
  if (doc.exists && doc.data().value) {
    return doc.data().value;
  }
  else {
    throw `Settings key "${key}" not found in database`;
  }
}
