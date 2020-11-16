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

app.get('/', async (req, res) => {
  const db = admin.firestore();
  let deletions = 0;
  while (true) {
    const querySnapshot = await getAccounts(db, getDaysAgo(180));
    await deleteAccountsAndWheels(db, querySnapshot);
    deletions += querySnapshot.size;
    if (querySnapshot.size==0 || deletions>=300) break;
  }
  const msg = `${deletions} accounts deleted`;
  console.log(msg);
  res.json({status: msg});
});
exports.func = () => functions.runWith({timeoutSeconds: 540}).https.onRequest(app);

function getDaysAgo(days) {
  return new Date(new Date() - 1000 * 3600 * 24 * days);
}

async function getAccounts(db, cutoffDate) {
  console.log(`Getting accounts last active before "${cutoffDate}"`);
  return await db.collection("accounts")
                 .where("lastActive", "<", cutoffDate)
                 .orderBy("lastActive", "asc")
                 .limit(100)
                 .get();
}

async function deleteAccountsAndWheels(db, querySnapshot) {
  for (let accountDoc of querySnapshot.docs) {
    const batch = db.batch();
    const snap = await db.collection(`${accountDoc.ref.path}/wheels`).get();
    snap.forEach(function(doc) {
      batch.delete(doc.ref);
    })
    batch.delete(accountDoc.ref);
    await batch.commit();
  }
}
