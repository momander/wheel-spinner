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
const admin = require('firebase-admin');


exports.isAdmin = async function(req) {
  try {
    const token = await admin.auth().verifyIdToken(req.headers['authorization']);
    const snap = await admin.firestore().doc(`admins/${token.uid}`).get();
    return snap.exists;
  }
  catch(ex) {
    console.error(ex);
    return false;
  }
}

exports.getUser = async function(req) {
  try {
    const token = await admin.auth().verifyIdToken(req.headers['authorization']);
    return {uid: token.uid, name: token.name};
  }
  catch(ex) {
    console.error(ex);
    return '';
  }
}

exports.getSetting = async function getSetting(key) {
  let doc = await admin.firestore().collection("settings").doc(key).get();
  if (doc.exists && doc.data().value) {
    return doc.data().value;
  }
  else {
    throw `Settings key "${key}" not found in database`;
  }
}

exports.getSettingNoExc = async function getSetting(key) {
  let doc = await admin.firestore().collection("settings").doc(key).get();
  if (doc.exists && doc.data().value) {
    return doc.data().value;
  }
  else {
    return '';
  }
}

exports.getHoursAgo = function(hours) {
  return new Date(new Date() - 1000 * 3600 * hours);
}

exports.getRandomInt = function(min, max) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min + 1)) + min;
}
