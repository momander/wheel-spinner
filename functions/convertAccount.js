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
const AccountService = require('./AccountService.js');
const express = require('express');
const cors = require('cors');
const app = express();
app.use(cors({ origin: true }));

app.post('/', async (req, res) => {
  try {
    const token = await admin.auth().verifyIdToken(req.headers['authorization']);
    await AccountService.convertToUid(
      admin.firestore(),
      token.email,
      token.uid
    );
    res.json({status: 'OK'});
  }
  catch(ex) {
    res.status(500).json({error: ex.toString()});
  }
});
exports.func = () => functions.https.onRequest(app);
