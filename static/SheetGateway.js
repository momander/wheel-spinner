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
  const response = await gapi.client.sheets.spreadsheets.get({
    spreadsheetId: sheetId
  });
  return response.result.properties.title;
}

export async function getTabNames(sheetId) {
  const response = await gapi.client.sheets.spreadsheets.get({
    spreadsheetId: sheetId
  });
  return response.result.sheets.map(sheet => sheet.properties.title);
}

export async function getColumns(sheetId, tabName) {
  const response = await gapi.client.sheets.spreadsheets.values.get({
    spreadsheetId: sheetId,
    range: tabName
  });
  const columns = [];
  const range = response.result;
  if (range.values && range.values.length > 0) {
    const row = skipEmptyRows(range.values)[0];
    for (let i=0; i<row.length && i<27; i++) {
      columns.push({id: String.fromCharCode(i+65), name: row[i]});
    }
  }
  return columns;
}

export async function getEntries(sheetId, tabName, columnId, skipFirstRow) {
  const response = await gapi.client.sheets.spreadsheets.values.get({
    spreadsheetId: sheetId,
    range: tabName + '!' + columnId + ':' + columnId,
  });
  const entries = [];
  if (response.result.values && response.result.values.length>0) {
    const rows = skipEmptyRows(response.result.values);
    for (let i=0; i<rows.length; i++) {
      if (i == 0 && skipFirstRow) {
        // Skip the first row if requested.
      }
      else {
        const row = rows[i];
        if (typeof row[0] != 'undefined') {
          entries.push(row[0]);
        }
      }
    }
  }
  return entries;
}

function skipEmptyRows(sheetRows) {
  return sheetRows.filter(row => row.length>0)
}
