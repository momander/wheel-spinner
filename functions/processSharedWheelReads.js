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
*/const functions = require('firebase-functions');
const admin = require('firebase-admin');
const express = require('express');
const app = express();
const {PredictionServiceClient} = require('@google-cloud/automl').v1;
const predictClient = new PredictionServiceClient();
const Util = require('./Util.js');

const db = admin.firestore();

app.post('/', async (req, res) => {
  try {
    const readRecords = await getReadRecords(3000);
    const paths = Array.from(new Set(readRecords.map(doc => doc.data().path)));
    console.log(`Found ${readRecords.length} read records with ${paths.length} different paths`);
    const minReadsForWheelReview = await Util.getSetting('MIN_READS_FOR_WHEEL_REVIEW');
    const modelId = await Util.getSettingNoExc('WHEEL_REVIEW_MODEL_ID');
    let ops = [];
    for (let path of paths) {
      const readRecordsForPath = readRecords.filter(doc => doc.data().path==path);
      ops = ops.concat(updateSharedWheel(path, readRecordsForPath, minReadsForWheelReview, modelId));
    }
    await Promise.all(ops);
    await Promise.all(deleteDocs(readRecords));
    res.status(200).json({status: `Processed ${readRecords.length} read records`});
  }
  catch(ex) {
    console.error(ex);
    res.status(500).json({error: ex.toString()});
  }
})
exports.func = () => functions.runWith({memory: '2GB'}).https.onRequest(app);

async function getReadRecords(recordCount) {
  const querySnapshot = await db.collection('shared-wheel-reads')
                                .orderBy('readDate', 'asc')
                                .limit(recordCount)
                                .get();
  return querySnapshot.docs;
}

async function updateSharedWheel(path, readRecords, minReadsForWheelReview, modelId) {
  console.log(`Logging ${readRecords.length} reads for "${path}"`);
  return new Promise(async function(resolve) {
    const ops = [];
    const doc = await db.collection("shared-wheels").doc(path).get();
    if (doc.exists) {
      const wheel = doc.data();
      wheel.lastRead = readRecords.map(rec => rec.data().readDate).sort().reverse()[0];
      wheel.readCount = wheel.readCount + readRecords.length;
      if (shouldPredict(modelId, minReadsForWheelReview, wheel)) {
        wheel.predictedApproval = await predictApproval(modelId, wheel.config.names);
        console.log(`Prediction for "${wheel.path}": ${wheel.predictedApproval}`);
      }
      ops.push(db.collection('shared-wheels').doc(path).set(wheel));
      if (wheel.readCount >= minReadsForWheelReview && !wheel.reviewStatus) {
        console.log(`Writing "${wheel.path}" to review queue`);
        ops.push(db.collection('shared-wheels-review-queue').doc(path).set(wheel));
      }
    }
    resolve(ops);
  });
}

function deleteDocs(docs) {
  console.log(`Deleting ${docs.length} read records`);
  const ops = [];
  docs.forEach(doc => {
    ops.push(doc.ref.delete());
  })
  return ops;
}

function shouldPredict(modelId, minReadsForWheelReview, wheel) {
  return (
    modelId &&
    wheel.readCount >= minReadsForWheelReview &&
    !wheel.hasOwnProperty('predictedApproval') && 
    !wheel.hasOwnProperty('reviewStatus')
  )
}

async function predictApproval(modelId, entries) {
  const request = {
    name: predictClient.modelPath(
            process.env.GCLOUD_PROJECT,
            'us-central1',
            modelId),
    payload: {
      textSnippet: {
        content: entries.map(e => extractText(e)).join('\n'),
        mimeType: 'text/plain'
      }
    },
  };
  try {
    const [response] = await predictClient.predict(request);
    const label = response.payload.filter(label => label.displayName=='good')[0];
    return label.classification.score;
  }
  catch(ex) {
    console.error(ex.toString());
    return -1;
  }
}

function extractText(entry) {
  const deletePatterns = [/<img.*?src="(.*?)".*?>/, /<[^>]*>/g, /&nbsp;/g];
  for (pattern of deletePatterns) {
    entry = entry.replace(pattern, '');
  }
  return entry;
}
