// Copyright 2020 Google LLC

// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at

//     https://www.apache.org/licenses/LICENSE-2.0

// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

const {BigQuery} = require('@google-cloud/bigquery');
const fs = require('fs');

writeGoodAndBadWheels();

async function writeGoodAndBadWheels() {
  const badWheels = await getBadWheels();
  writeWheels('bad', badWheels);
  console.log(`Wrote ${badWheels.length} bad wheels.`);
  const goodWheels = await getGoodWheels();
  writeWheels('good', goodWheels);
  console.log(`Wrote ${goodWheels.length} good wheels.`);
}

async function getBadWheels() {
  const sql = `SELECT path, config.names
               FROM latest.shared_wheels_rejected`;
  const client = new BigQuery();
  const options = { query: sql, location: 'US', params: {} };
  const [rows] = await client.query(options);
  return rows.map(r => { return {path: r.path, entries: r.names.map(n => extractText(n)) } })
}

async function getGoodWheels() {
  const sql = `SELECT path, config.names
               FROM latest.shared_wheels
               WHERE reviewStatus='Approved'`;
  const client = new BigQuery();
  const options = { query: sql, location: 'US', params: {} };
  let [rows] = await client.query(options);
  return rows.map(r => { return {path: r.path, entries: r.names.map(n => extractText(n)) } })
}

function writeWheels(directory, wheels) {
  if (!fs.existsSync(directory)) fs.mkdirSync(directory);
  for (wheel of wheels) {
    const entries = wheel.entries.join('\n');
    fs.writeFile(`${directory}/${wheel.path}.txt`, entries, function(err) {});
  }
}

function extractText(entry) {
  const deletePatterns = [/<img.*?src="(.*?)".*?>/, /<[^>]*>/g, /&nbsp;/g];
  for (pattern of deletePatterns) {
    entry = entry.replace(pattern, '');
  }
  return entry;
}
