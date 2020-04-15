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
import 'whatwg-fetch';

export async function createSharedWheel(editable, wheelConfig) {
  const payload = {editable: editable, wheelConfig: wheelConfig.getValues()};
  const url = process.env.FUNCTION_PREFIX + '/createSharedWheel2';
  const response = await fetch(url, {
    method: 'POST',
    mode: 'cors',
    headers: {'Content-Type': 'application/json'},
    body: JSON.stringify(payload)
  });
  const respObj = await response.json();
  return respObj.path;
}

export async function getSharedWheel(path) {
  const url = process.env.FUNCTION_PREFIX + `/getSharedWheel2/${path}`;
  const response = await fetch(url, {
    method: 'GET',
    mode: 'cors'
  });
  const respObj = await response.json();
  return respObj.wheelConfig;
}

export async function fetchSocialMediaUsers(searchTerm) {
  const url = process.env.FUNCTION_PREFIX +
    `/getTwitterUserNames2/${encodeURIComponent(searchTerm)}`;
  const response = await fetch(url, {
    method: 'GET',
    mode: 'cors'
  });
  const respObj = await response.json();
  return respObj;
}
