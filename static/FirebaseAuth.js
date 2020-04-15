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
export async function userIsLoggedIn(auth) {
  const user = await getLoggedInUser(auth);
  return !!user;
}

export async function getLoggedInUser(auth) {
  if (auth.currentUser) {
    return auth.currentUser;
  }
  else {
    return new Promise(function(resolve) {
      auth.onAuthStateChanged(function(user) {
        resolve(user);
      })
    })
  }
}

export async function logIn(auth, provider) {
  provider.setCustomParameters({ prompt: 'select_account' });
  await auth.signInWithPopup(provider);
  return auth.currentUser;
}

export async function logInToSheets(auth, provider) {
  provider.addScope('https://www.googleapis.com/auth/drive.readonly');
  provider.addScope('https://www.googleapis.com/auth/spreadsheets.readonly');
  provider.setCustomParameters({ prompt: 'select_account' });
  const result = await auth.signInWithPopup(provider);
  return result.credential.accessToken;
}
