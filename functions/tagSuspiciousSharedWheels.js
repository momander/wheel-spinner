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
const {BigQuery} = require('@google-cloud/bigquery');
const Util = require('./Util.js');

const db = admin.firestore();

app.post('/', async (req, res) => {
  try {
    const dirtyWords = await Util.getSetting('DIRTY_WORDS');
    const wheelPaths = await getSuspiciousWheelsFromBq(dirtyWords);
    const ops = [];
    for (wheelPath of wheelPaths) {
      ops.push(putWheelInReviewQueue(wheelPath));
    }
    await Promise.all(ops);
    const msg = `Put ${wheelPaths.length} suspicious wheels in the review queue.`
    console.log(msg);
    res.json({status: "Success", message: msg});
  }
  catch(ex) {
    console.error(ex);
    res.status(500).json({error: ex.toString()});
  }
});
exports.func = () => functions.https.onRequest(app);

async function getSuspiciousWheelsFromBq(dirtyWords) {
  const client = new BigQuery();
  const options = {
    query: getQuery(dirtyWords),
    location: 'US',
    params: {},
  };
  const [rows] = await client.query(options);
  return rows;
}

function getQuery(dirtyWords) {
  const dateCutoff = Util.getHoursAgo(24);
  let sqlQuery = `SELECT DISTINCT(path), readCount
                    FROM latest.shared_wheels,
                    UNNEST(config.names) name `;
  for (let i=0; i<dirtyWords.length; i++) {
    const dirtyWord = dirtyWords[i];
    if (i==0) {
      sqlQuery += ' WHERE (';
    }
    else {
      sqlQuery += ' OR ';
    }
    sqlQuery += `REGEXP_CONTAINS(name, r'\\b${dirtyWord}\\b')\n`;
  }
  sqlQuery += `) AND lastRead > cast('${dateCutoff.toISOString().substring(0,10)}' as timestamp)
               AND reviewStatus IS NULL
               ORDER BY 2 DESC LIMIT 100`;
  return sqlQuery;
}

async function putWheelInReviewQueue(wheelPath) {
  const snap = await db.doc(`shared-wheels/${wheelPath}`).get();
  if (snap.exists) {
    const wheel = snap.data();
    if (!wheel.reviewStatus) {
      wheel.reviewStatus = 'Suspicious';
      console.log(`Putting wheel ${wheelPath} in review queue`);
      await db.doc(`shared-wheels-review-queue/${wheelPath}`).set(wheel);
    }
  }
}
