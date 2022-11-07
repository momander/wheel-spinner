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
const express = require('express');
const cors = require('cors');
const app = express();
app.use(cors({ origin: true }));
const Util = require('./Util.js');

const db = admin.firestore();

app.post('/', async (req, res) => {
  const path = req.body.path;
  try {
    const uid = await Util.getUidFromAuthHeader(req.headers['authorization']);
    await deleteWheel('shared-wheels', path, uid);
    await deleteWheel('shared-wheels-review-queue', path, uid);
    res.status(200).json({ wheels: await getSharedWheels(uid) });
  }
  catch(ex) {
    console.error(ex);
    res.status(500).json({error: ex.toString()});
  }
});
exports.func = () => functions.https.onRequest(app);

async function deleteWheel(collection, path, uid) {
  const querySnap = await db.collection(collection)
    .where('path', '==', path)
    .where('uid', '==', uid)
    .get();
  const batch = db.batch();
  querySnap.forEach(doc => batch.delete(doc.ref));
  await batch.commit();
}

async function getSharedWheels(uid) {
  const querySnap = await db.collection("shared-wheels")
    .where('uid', '==', uid)
    .orderBy('created', 'desc')
    .get();
  return querySnap.docs.map(doc => doc.data());
}
