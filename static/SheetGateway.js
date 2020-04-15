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
export async function getTitle(sheetId) {
  return gapi.client.sheets.spreadsheets.get({
    spreadsheetId: sheetId
  }).then(function(response) {
    return response.result.properties.title;
  })
}

export async function getTabNames(sheetId) {
  return gapi.client.sheets.spreadsheets.get({
    spreadsheetId: sheetId
  }).then(function(response) {
    return response.result.sheets.map(sheet => sheet.properties.title);
  })
}

export async function getColumns(sheetId, tabName) {
  return gapi.client.sheets.spreadsheets.values.get({
    spreadsheetId: sheetId,
    range: tabName
  }).then(function(response) {
    const columns = [];
    const range = response.result;
    if (range.values && range.values.length > 0) {
      var row = range.values[0];
      var charCode = 65;
      for (var i=0; i<row.length && charCode<91; i++) {
        columns.push({id: String.fromCharCode(charCode), name: row[i]});
        charCode += 1;
      }
    }
    return columns;
  })
}

export async function getEntries(sheetId, tabName, columnId, skipFirstRow) {
  return gapi.client.sheets.spreadsheets.values.get({
    spreadsheetId: sheetId,
    range: tabName + '!' + columnId + ':' + columnId,
  }).then(function(response) {
    const range = response.result;
    const entries = [];
    if (range.values && range.values.length > 0) {
      for (let i=0; i<range.values.length; i++) {
        if (i == 0 && skipFirstRow) {
          // Skip the first row if requested.
        }
        else {
          const row = range.values[i];
          if (typeof row[0] != 'undefined') {
            entries.push(row[0]);
          }
        }
      }
    }
    return entries;
  })
}
