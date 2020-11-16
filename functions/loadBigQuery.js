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
const express = require('express');
const cors = require('cors');
const app = express();
app.use(cors({ origin: true }));
const {BigQuery} = require('@google-cloud/bigquery');
const {Storage} = require('@google-cloud/storage');


app.post('/', async (req, res) => {
  try {
    const projectId = process.env.GCP_PROJECT || process.env.GCLOUD_PROJECT;
    const jobs = startLoadingBigQueryFromBucket(projectId);
    res.json({status: "Success", message: `Started ${jobs} jobs`});
  }
  catch(ex) {
    console.error(ex);
    res.status(500).json({error: ex.toString()});
  }
});
exports.func = () => functions.https.onRequest(app);

function startLoadingBigQueryFromBucket(projectId) {
  const storage = new Storage();
  const bq = new BigQuery();
  const kinds = ['accounts', 'wheels', 'shared-wheels', 'shared-wheels-rejected'];
  let jobs = 0;
  for (const kind of kinds) {
    const bucket = storage.bucket(`gs://${projectId}-backup/bq-export/${kind}/all_namespaces/kind_${kind}`);
    const file = bucket.file(`all_namespaces_kind_${kind}.export_metadata`);
    const metadata = {
      sourceFormat: 'DATASTORE_BACKUP',
      writeDisposition: 'WRITE_TRUNCATE',
      location: 'US'
    };
    const tableName = kind.replace(/\-/g, '_');
    bq.dataset('latest').table(tableName).createLoadJob(file, metadata);
    jobs += 1;
  }
  return jobs;
}
