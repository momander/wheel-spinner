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
import * as Util from './Util.js';

export function logUserActivity(db, serverNow, uid) {
  return db.doc(`accounts/${uid}`).set({
    uid: uid,
    lastActive: serverNow
  })
}

export async function getWheels(db, uid) {
  const snap = await db.collection(`accounts/${uid}/wheels`).get();
  const wheels = [];
  snap.forEach(function(doc) {
    wheels.push(doc.data().config);
  });
  return wheels.sort((a, b) =>
    a.title.localeCompare(b.title, 'en', { numeric: true, sensitivity: 'base' })
  );
}

export async function setAdminsWheelsToZero(db, adminsUid) {
  await db.doc(`admins/${adminsUid}`).update({
    totalReviews: 0,
    sessionReviews: 0
  });
}

export async function logWheelRead(db, serverNow, uid, wheelTitle) {
  const title = Util.sanitizeWheelTitle(wheelTitle);
  let docRef = db.doc(`accounts/${uid}/wheels/${title}`);
  let doc = await docRef.get();
  if (doc.exists) {
    let wheelData = doc.data();
    let data = {
      lastRead: serverNow,
      readCount: wheelData.readCount + 1,
    };
    await docRef.update(data);
  }
}

export async function deleteWheel(db, uid, wheelTitle) {
  const title = Util.sanitizeWheelTitle(wheelTitle);
  await db.doc(`accounts/${uid}/wheels/${title}`).delete();
}

export async function saveWheel(db, serverNow, uid, config) {
  // First create an account if there isn't one.
  await logUserActivity(db, serverNow, uid);
  config.title = Util.sanitizeWheelTitle(config.title);
  if (await wheelExists(db, uid, config.title)) {
    updateWheel(db, serverNow, uid, config);
  }
  else {
    createNewWheel(db, serverNow, uid, config);
  }
}

export async function deleteAccount(db, uid) {
  const batch = db.batch();
  const snap = await db.collection(`accounts/${uid}/wheels`).get();
  snap.forEach(function(doc) {
    batch.delete(doc.ref);
  })
  const doc = await db.doc(`accounts/${uid}`).get();
  batch.delete(doc.ref);
  await batch.commit();
}

export async function getDirtyWords(db) {
  const docSnapshot = await db.doc("settings/DIRTY_WORDS").get();
  return docSnapshot.data().value.sort();
}

export async function setDirtyWords(db, words) {
  const formattedWords = words.map(w => w.toLowerCase()).sort();
  await db.doc("settings/DIRTY_WORDS").set({value: formattedWords});
}

export async function deleteAdmin(db, uid) {
  await db.doc(`admins/${uid}`).delete();
}

export async function addAdmin(db, uid, name) {
  await db.doc(`admins/${uid}`).set({
    uid: uid,
    name: name,
  });
}

export async function approveSharedWheel(db, increment, path, uid) {
  const batch = db.batch();
  batch.update(db.doc(`shared-wheels/${path}`), {reviewStatus: 'Approved'});
  batch.delete(db.doc(`shared-wheels-review-queue/${path}`));
  batch.update(db.doc(`admins/${uid}`), {
    totalReviews: increment,
    sessionReviews: increment,
    lastReview: new Date()
  });
  await batch.commit();
}

export async function deleteSharedWheel(db, increment, path, uid) {
  const wheelDoc = await db.doc(`shared-wheels/${path}`).get();
  let wheel;
  if (wheelDoc.exists) wheel = wheelDoc.data();
  await Promise.all([
    db.doc(`shared-wheels/${path}`).delete(),
    db.doc(`shared-wheels-review-queue/${path}`).delete(),
    db.doc(`shared-wheels-rejected/${path}`).set(wheel),
    db.doc(`admins/${uid}`).update({totalReviews: increment}),
    db.doc(`admins/${uid}`).update({sessionReviews: increment}),
    db.doc(`admins/${uid}`).update({lastReview: new Date()}),
  ])
}

export async function resetSessionReviews(db, uid) {
  await db.doc(`admins/${uid}`).update({sessionReviews: 0});
}

export async function getSharedWheel(db, path) {
  const doc = await db.doc(`shared-wheels/${path}`).get();
  if (doc.exists) {
    return doc.data();
  }
}

export async function getNextSharedWheelForReview(db) {
  let wheel;
  if (Math.random() < 0.1) {
    const querySnapshot = await db.collection('shared-wheels-review-queue')
                                  .where('reviewStatus', '==', 'Suspicious')
                                  .limit(1)
                                  .get();
    if (querySnapshot.size>0) {
      wheel = querySnapshot.docs[0].data();
    }
  }
  if (!wheel && Math.random() < 0.5) {
    const querySnapshot = await db.collection('shared-wheels-review-queue')
                                  .where('predictedApproval', '<', 0.7)
                                  .orderBy('predictedApproval', 'asc')
                                  .limit(1)
                                  .get();
    if (querySnapshot.size>0) {
      wheel = querySnapshot.docs[0].data();
    }
  }
  if (!wheel) {
    const querySnapshot = await db.collection('shared-wheels-review-queue')
                                  .orderBy('lastRead', 'desc')
                                  .limit(1)
                                  .get();
    if (querySnapshot.size>0) {
      wheel = querySnapshot.docs[0].data();
    }
  }
  return wheel;
}

async function wheelExists(db, uid, title) {
  const doc = await db.doc(`accounts/${uid}/wheels/${title}`).get();
  return doc.exists;
}

async function updateWheel(db, serverNow, uid, config) {
  const docRef = await db.doc(`accounts/${uid}/wheels/${config.title}`);
  const data = {
    config: config,
    lastWrite: serverNow,
  };
  await docRef.update(data);
}

async function createNewWheel(db, serverNow, uid, config) {
  const data = {
    config: config,
    created: serverNow,
    lastRead: null,
    lastWrite: serverNow,
    readCount: 0,
  };
  const docRef = await db.doc(`accounts/${uid}/wheels/${config.title}`);
  await docRef.set(data);
}
