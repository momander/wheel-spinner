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
exports.convertToUid = async function(db, email, uid) {
  console.log(`convertToUid(${email}, ${uid}) called`);
  if (await emailAccountExists(db, email)) {
    const batch = db.batch();
    await createUidAccount(db, uid, batch);
    await moveWheelsToUidAccount(db, email, uid, batch);
    deleteEmailAccount(db, email, batch);
    await batch.commit();
    console.log('    done');
  }
}

async function emailAccountExists(db, email) {
  console.log(`emailAccountExists("${email}") called`);
  if (!email) {
    console.log(`    no need to hit db, returning false`);
    return false;
  }
  console.log(`    accessing db`);
  const account = await db.doc(`accounts/${email}`).get();
  console.log(`    returning ${account.exists}`);
  return account.exists;
}

async function createUidAccount(db, uid, batch) {
  console.log(`createUidAccount("${uid}") called`);
  const docRef = db.doc(`accounts/${uid}`);
  batch.set(docRef, {
    uid: uid,
    lastActive: new Date()
  });
  console.log(`    done`);
}

async function moveWheelsToUidAccount(db, email, uid, batch) {
  console.log(`moveWheelsToUidAccount("${email}", "${uid}") called`);
  const snap = await db.collection(`accounts/${email}/wheels`).get();
  snap.forEach(function(wheelDoc) {
    const wheel = wheelDoc.data();
    const wheelTitle = wheel.config.title;
    const docRef = db.doc(`accounts/${uid}/wheels/${wheelTitle}`);
    console.log(`    batching write: "accounts/${uid}/wheels/${wheelTitle}"`);
    batch.set(docRef, wheel);
    console.log(`    batching delete: "accounts/${email}/wheels/${wheelTitle}"`);
    batch.delete(db.doc(`accounts/${email}/wheels/${wheelTitle}`));
  });
  console.log(`    done`);
}

function deleteEmailAccount(db, email, batch) {
  console.log(`deleteEmailAccount("${email}") called`);
  batch.delete(db.doc(`accounts/${email}`));
  console.log(`    done`);
}
