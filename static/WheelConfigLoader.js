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
import Path from './Path.js';
import * as ServerFunctions from './ServerFunctions.js';

export async function load(windowLocation) {
  let wheelConfig;
  let redirectUrl;
  const path = new Path(windowLocation);
  if (path.sharedWheel) {
    const result = await ServerFunctions.getSharedWheel(path.sharedWheel);
    if (result.editable==false) {
      path.setPathPrefix('view');
      redirectUrl = path.getAbsoluteUrl();
    }
    if (!result.wheelConfig) {
      throw `Wheel "${path.sharedWheel}" not found!`
    }
    wheelConfig = result.wheelConfig;
  }
  return {
    redirectUrl: redirectUrl,
    wheelConfig: wheelConfig,
    sharedWheelPath: path.sharedWheel
  };
}
