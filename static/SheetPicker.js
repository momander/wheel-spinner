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
import '@babel/polyfill';


const DISCOVERY_DOCS = ["https://sheets.googleapis.com/$discovery/rest?version=v4"];
const SCOPES = 'https://www.googleapis.com/auth/drive.readonly ' +
               'https://www.googleapis.com/auth/spreadsheets.readonly';

let myAccessToken;

export function load(accessToken) {
  myAccessToken = accessToken;
  return new Promise(function(resolve, reject) {
    gapi.load('auth2:client:picker', function() {
      gapi.client.init({
        apiKey: process.env.FIREBASE_API_KEY,
        discoveryDocs: DISCOVERY_DOCS,
        clientId: process.env.OAUTH_CLIENT_ID,
        scope: SCOPES
      }).then(() => {
        gapi.client.setToken({access_token: myAccessToken});
        resolve();
      })
    });
  })
}

export function pickSheet() {
  return new Promise(function(resolve, reject) {
    const view = new google.picker.DocsView(google.picker.ViewId.SPREADSHEETS);
    const picker = new google.picker.PickerBuilder()
        .enableFeature(google.picker.Feature.NAV_HIDDEN)
        .setAppId(process.env.GCP_APP_ID)
        .setOAuthToken(myAccessToken)
        .addView(view)
        .setDeveloperKey(process.env.FIREBASE_API_KEY)
        .setCallback(function(result) {
          if (result.action == 'cancel') {
            reject('No spreadsheet picked');
          }
          if (result.action == 'picked') {
            if (result.docs.length > 0) {
              const id = result.docs[0].id;
              resolve(id);
            }
          }
        })
        .setTitle('Select a spreadsheet')
        .build();
    picker.setVisible(true);
  })
}
