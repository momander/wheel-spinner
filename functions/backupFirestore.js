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
const firestore = require('@google-cloud/firestore');
const client = new firestore.v1.FirestoreAdminClient();
const {Storage} = require('@google-cloud/storage');
const express = require('express');
const cors = require('cors');
const app = express();
app.use(cors({ origin: true }));

app.post('/', async (req, res) => {
  try {
    const projectId = process.env.GCP_PROJECT || process.env.GCLOUD_PROJECT;
    await deleteBucket(`${projectId}-backup`, 'bq-export');
    const databaseName = client.databasePath(projectId, '(default)');
    console.log('databaseName', databaseName);
    const exportJobs = getExportJobs();
    const retVal = [];
    for (const job of exportJobs) {
      retVal.push(await startExportJobs(databaseName, job));
    }
    res.json({status: 'success', jobs: retVal});
  }
  catch(ex) {
    console.error(ex);
    res.status(500).json({error: ex.toString()});
  }
});
exports.func = () => functions.https.onRequest(app);

async function deleteBucket(bucket, subdir) {
  const storage = new Storage();
  console.log(`Looking for files in "${bucket}/${subdir}"`);
  const response = await storage.bucket(bucket).getFiles({autoPaginate: false, directory: subdir});
  const files = response[0];
  console.log(`Found ${files.length} files`);
  const ops = [];
  for (file of files) {
    console.log(`Deleting ${file.name}`);
    ops.push(file.delete());
  }
  await Promise.all(ops);
}

async function startExportJobs(databaseName, job) {
  const response = await client.exportDocuments({
    name: databaseName,
    outputUriPrefix: job.outputUriPrefix,
    collectionIds: job.collectionIds
  })
  return response[0].name;
}

function getExportJobs() {
  return [
    {
      outputUriPrefix: `gs://${process.env.GCLOUD_PROJECT}-backup`,
      collectionIds: []
    },
    {
      outputUriPrefix: `gs://${process.env.GCLOUD_PROJECT}-backup/bq-export/accounts`,
      collectionIds: ['accounts']
    },
    {
      outputUriPrefix: `gs://${process.env.GCLOUD_PROJECT}-backup/bq-export/wheels`,
      collectionIds: ['wheels']
    },
    {
      outputUriPrefix: `gs://${process.env.GCLOUD_PROJECT}-backup/bq-export/shared-wheels`,
      collectionIds: ['shared-wheels']
    },
    {
      outputUriPrefix: `gs://${process.env.GCLOUD_PROJECT}-backup/bq-export/shared-wheels-rejected`,
      collectionIds: ['shared-wheels-rejected']
    },
  ]
}
