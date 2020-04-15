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
import * as FirebaseAuth from './FirebaseAuth.js';
import * as Firestore from './Firestore.js';
import * as Locales from './Locales.js';

let firebase;

export async function loadLibraries() {
  if (!firebase) {
    firebase = await importFirebaseLibs();
    initializeFirebase(firebase);
    enableOfflinePersistence(firebase);
  }
}

export async function userIsLoggedIn() {
  return await FirebaseAuth.userIsLoggedIn(firebase.auth());
}

export async function getLoggedInUser() {
  return await FirebaseAuth.getLoggedInUser(firebase.auth());
}

export async function logIn(providerName, locale) {
  const auth = firebase.auth();
  auth.languageCode = Locales.getLoginLocale(providerName, locale);
  const provider = getProvider(providerName);
  return await FirebaseAuth.logIn(auth, provider);
}

export async function logInToSheets(locale) {
  const auth = firebase.auth();
  auth.languageCode = Locales.getLoginLocale('Google', locale);
  const provider = getProvider('Google');
  return await FirebaseAuth.logInToSheets(auth, provider);
}

export function logOut() {
  firebase.auth().signOut();
}

export function logUserActivity(uid) {
  const serverNow = firebase.firestore.FieldValue.serverTimestamp();
  return Firestore.logUserActivity(firebase.firestore(), serverNow, uid);
}

export async function getWheels(uid) {
  return Firestore.getWheels(firebase.firestore(), uid);
}

export async function logWheelRead(uid, wheelTitle) {
  const serverNow = firebase.firestore.FieldValue.serverTimestamp();
  await Firestore.logWheelRead(firebase.firestore(), serverNow, uid, wheelTitle);
}

export async function deleteWheel(uid, wheelTitle) {
  await Firestore.deleteWheel(firebase.firestore(), uid, wheelTitle);
}

export async function saveWheel(uid, config) {
  const serverNow = firebase.firestore.FieldValue.serverTimestamp();
  await Firestore.saveWheel(firebase.firestore(), serverNow, uid, config);
}

export async function deleteAccount(uid) {
  await Firestore.deleteAccount(firebase.firestore(), uid);
}

async function importFirebaseLibs() {
  const fb = await import(/* webpackChunkName: "firebase" */ 'firebase/app');
  await import(/* webpackChunkName: "firebase" */ 'firebase/auth');
  await import(/* webpackChunkName: "firebase" */ 'firebase/firestore');
  return fb;
}

function initializeFirebase(firebase) {
  const firebaseConfig = {
    apiKey: process.env.FIREBASE_API_KEY,
    authDomain: process.env.FIREBASE_AUTH_DOMAIN,
    databaseURL: process.env.FIREBASE_DATABASE_URL,
    projectId: process.env.FIREBASE_PROJECT_ID,
    timestampsInSnapshots: true
  };
  firebase.initializeApp(firebaseConfig);  
}

function enableOfflinePersistence(firebase) {
  const db = firebase.firestore();
  if (Util.browserCanHandlePersistance(navigator.userAgent)) {
    try {
      db.enablePersistence({synchronizeTabs:true})
    }
    catch (ex) {
    }
  }
}

function getProvider(providerName) {
  const providers = {
    'google':   new firebase.auth.GoogleAuthProvider(),
    'facebook': new firebase.auth.FacebookAuthProvider(),
    'twitter':  new firebase.auth.TwitterAuthProvider(),
  };
  return providers[providerName.toLowerCase()] || providers['google'];
}
