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
  try {
    if (await containsDirtyWords(req.body.wheelConfig.names)) {
      res.status(451).json({error: 'Please try something more family-friendly.'});
      return;
    }
    const path = await createSharedWheel(
      req.body.wheelConfig,
      req.body.editable
    );
    res.json({path: path});
  }
  catch(ex) {
    console.error(ex);
    res.status(500).json({error: ex.toString()});
  }
});
exports.func = () => functions.https.onRequest(app);

async function containsDirtyWords(entries) {
  let dirtyWords = [];
  try {
    dirtyWords = await Util.getSetting('DIRTY_WORDS');
  }
  catch(ex) {
    console.error(ex);
  }
  return entries.some(entry => {
    const textEntry = extractText(entry).toLowerCase().replace(/&nbsp;/g, ' ');
    const wordBreaks = /[,.:;!\/\?\-\+"\[\]\(\)_#=]/g;
    const wordsInEntry = textEntry.replace(wordBreaks, ' ').split(' ');
    return dirtyWords.some(dirtyWord => {
      return wordsInEntry.some(wordInEntry => wordInEntry==dirtyWord)
    })
  })
}

async function createSharedWheel(config, editable=true) {
  const path = await createUniquePath();
  config.path = path;
  newWheel = {
    path: path,
    config: config,
    created: admin.firestore.FieldValue.serverTimestamp(),
    lastRead: null,
    editable: editable,
    readCount: 0
  }
  await db.collection("shared-wheels").doc(path).set(newWheel);
  return path;
}

async function createUniquePath() {
  let newPath;
  while (true) {
    newPath = getRandomPath();
    if (await pathIsAvailable(newPath)) {
      break;
    }
  }
  return newPath;
}

function getRandomPath() {
  return `${getRandomChars(3)}-${getRandomChars(3)}`;
}

async function pathIsAvailable(path) {
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

function extractText(entry) {
  const match = entry.match(/<img.*?src="(.*?)".*?>/);
  if (match) {
    entry = entry.replace(match[0], ' ');
  }
  return entry;
}
