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
exports.get = async function(db, serverNow, path) {
  if (path.match(/^\w\w\w-\w\w\w$/)) {
    await update(db, serverNow, path);
    let docRef = db.collection("shared-wheels").doc(path);
    let doc = await docRef.get();
    if (doc.exists) {
      return doc.data().config;
    }
  }
  else {
    throw 'Bad path';
  }
}

exports.get2 = async function(db, serverNow, path) {
  let docRef = db.collection("shared-wheels").doc(path);
  let doc = await docRef.get();
  if (doc.exists) {
    if (!isRecent(doc.data().lastRead)) {
      let data = {
        lastRead: serverNow,
        readCount: doc.data().readCount + 1
      };
      await docRef.update(data);
    }
    return {
      wheelConfig: doc.data().config,
      editable: doc.data().editable
    }
  }
  else {
    return {wheelNotFound: true};
  }
}

exports.create = async function(db, serverNow, config, editable=true) {
  const path = await createUniquePath(db);
  config.path = path;
  newWheel = {
    path: path,
    config: config,
    created: serverNow,
    lastRead: null,
    editable: editable,
    readCount: 0
  }
  await db.collection("shared-wheels").doc(path).set(newWheel);
  return path;
}

async function createUniquePath(db) {
  let newPath;
  while (true) {
    newPath = getRandomPath();
    if (await pathIsAvailable(db, newPath)) {
      break;
    }
  }
  return newPath;
}

async function update(db, serverNow, path) {
  let docRef = db.collection("shared-wheels").doc(path);
  let doc = await docRef.get();
  if (doc.exists) {
    let data = {
      lastRead: serverNow,
      readCount: doc.data().readCount + 1
    };
    await docRef.update(data);
  }
}

function getRandomPath() {
  return `${getRandomChars(3)}-${getRandomChars(3)}`;
}

async function pathIsAvailable(db, path) {
  doc = await db.collection('shared-wheels').where("path", "==", path).get();
  return !doc.exists;
}

function getRandomChars(charCount) {
  let retVal = '';
  chars = 'abcdefghjkmnpqrstuvwxyz23456789';
  for (i=0; i<charCount; i++) {
    retVal += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return retVal;
}

function isRecent(timestamp) {
  if (!timestamp) return false;
  const now = new Date();
  const secondsDiff = now.getTime()/1000 - timestamp.seconds;
  return (secondsDiff<3);
}
