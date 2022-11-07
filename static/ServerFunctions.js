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
import * as Util from './Util.js';

export async function createSharedWheel(copyable, wheelConfig, idToken) {
  const payload = {copyable: copyable, wheelConfig: wheelConfig.getValues()};
  const url = process.env.FUNCTION_PREFIX + '/createSharedWheel3';
  const request = {
    method: 'POST',
    mode: 'cors',
    headers: {'Content-Type': 'application/json'},
    body: JSON.stringify(payload)
  };
  if (idToken) {
    request.headers['authorization'] = idToken;
  }
  const response = await fetch(url, request);
  const respObj = await response.json();
  if (respObj.hasOwnProperty('error')) throw respObj.error;
  return respObj.path;
}

export async function logSharedWheelRead(path) {
  if (!path) return;
  const payload = {path: path};
  const url = process.env.FUNCTION_PREFIX + '/logSharedWheelRead';
  const response = await fetch(url, {
    method: 'POST',
    mode: 'cors',
    headers: {'Content-Type': 'application/json'},
    body: JSON.stringify(payload)
  });
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

export async function getSharedWheels(idToken) {
  const url = process.env.FUNCTION_PREFIX + `/getSharedWheels`;
  const response = await fetch(url, {
    method: 'GET',
    mode: 'cors',
    headers: {'authorization': idToken, 'Content-Type': 'application/json'}
  });
  const respObj = await response.json();
  return respObj.wheels;
}

export async function deleteSharedWheel(idToken, path) {
  const payload = {path: path};
  const url = process.env.FUNCTION_PREFIX + `/deleteSharedWheel`;
  const response = await fetch(url, {
    method: 'POST',
    mode: 'cors',
    headers: {'authorization': idToken, 'Content-Type': 'application/json'},
    body: JSON.stringify(payload)
  });
  const respObj = await response.json();
  return respObj.wheels;
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

export async function convertAccount(oldIdToken, newIdToken) {
  const payload = {oldIdToken: oldIdToken};
  const url = process.env.FUNCTION_PREFIX + '/convertAccount';
  try {
    const response = await fetch(url, {
      method: 'POST',
      mode: 'cors',
      headers: {'authorization': newIdToken, 'Content-Type': 'application/json'},
      body: JSON.stringify(payload)
    });
    await response.json();
  }
  catch(ex) {
    Util.trackException(ex);
  }
}

export async function deleteAccount(idToken) {
  const url = process.env.FUNCTION_PREFIX + '/deleteAccount';
  try {
    const response = await fetch(url, {
      method: 'POST',
      mode: 'cors',
      headers: {'authorization': idToken, 'Content-Type': 'application/json'}
    });
    await response.json();
  }
  catch(ex) {
    Util.trackException(ex);
  }
}

export async function getCarousels() {
  try {
    const url = process.env.FUNCTION_PREFIX + `/getCarousels`;
    const response = await fetch(url, {
      method: 'GET'
    });
    const respObj = await response.json();
    return respObj;
  }
  catch(ex) {
    Util.trackException(ex);
    return [''];
  }
}

export async function getNumberOfWheelsInReviewQueue(idToken) {
  const url = process.env.FUNCTION_PREFIX + '/getNumberOfWheelsInReviewQueue';
  const response = await fetch(url, {
    method: 'GET',
    mode: 'cors',
    headers: {'authorization': idToken}
  });
  if (response.status == 403) throw 'Please log in as an admin user';
  const respObj = await response.json();
  if (respObj.error) throw respObj.error;
  return respObj.wheelsInReviewQueue;
}

export async function translate(idToken, entries) {
  const url = process.env.FUNCTION_PREFIX + '/translate';
  const response = await fetch(url, {
    method: 'POST',
    mode: 'cors',
    headers: new Headers({
      'Content-Type': 'application/json',
      'authorization': idToken
    }),
    body: JSON.stringify({text: entries})
  });
  if (response.status == 403) throw 'Please log in as an admin user';
  const resp = await response.json();
  return resp.translations;
}

export async function userIsAdmin(idToken) {
  const url = process.env.FUNCTION_PREFIX + '/userIsAdmin';
  const response = await fetch(url, {
    method: 'GET',
    mode: 'cors',
    headers: {'authorization': idToken}
  });
  const respObj = await response.json();
  return respObj.userIsAdmin;
}

export async function getSpinStats() {
  try {
    const url = process.env.FUNCTION_PREFIX + `/getSpinStats`;
    const response = await fetch(url, {
      method: 'GET'
    });
    const respObj = await response.json();
    return respObj;
  }
  catch(ex) {
    Util.trackException(ex);
    return {};
  }
}
