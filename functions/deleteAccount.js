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
const Util = require('./Util.js');

app.post('/', async (req, res) => {
  try {
    const uid = await Util.getUidFromAuthHeader(req.headers['authorization']);
    if (!uid) throw 'Invalid idToken';
    const db = admin.firestore();
    Promise.all([
      deleteAccount(db, uid),
      deleteSharedWheels(db, uid)
    ])
    res.json({status: 'OK'});
  }
  catch(ex) {
    console.log(ex);
    res.status(500).json({error: ex.toString()});
  }
});
exports.func = () => functions.https.onRequest(app);

async function deleteAccount(db, uid) {
  const batch = db.batch();
  const querySnap = await db.collection(`accounts/${uid}/wheels`).get();
  querySnap.forEach(doc => batch.delete(doc.ref))
  const accountDoc = await db.doc(`accounts/${uid}`).get();
  batch.delete(accountDoc.ref);
  await batch.commit();
}

async function deleteSharedWheels(db, uid) {
  const batch = db.batch();
  const querySnap1 = await db.collection('shared-wheels')
                             .where('uid', '==', uid)
                             .get();
  querySnap1.forEach(doc => batch.delete(doc.ref));
  const querySnap2 = await db.collection('shared-wheels-review-queue')
                             .where('uid', '==', uid)
                             .get();
  querySnap2.forEach(doc => batch.delete(doc.ref));
  await batch.commit();
}
