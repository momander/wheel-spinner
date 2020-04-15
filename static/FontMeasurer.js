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
import * as Util from './Util.js';

export function getFontSize(context, displayText, sliceCount, fontName, wheelRadius, hubRadius) {
  return bisectSearch(context, wheelRadius, hubRadius, fontName, sliceCount,
    displayText, 10, 200);
}

function bisectSearch(context, wheelRadius, hubRadius, fontName, slices, text, min, max) {
  let fontSize;
  while (true) {
    fontSize = Math.round((min + max) / 2);
    let font = fontSize + 'px ' + fontName;
    if (textFits(context, wheelRadius, hubRadius, Math.PI/slices, text, font, fontSize)) {
      min = fontSize;
    }
    else {
      max = fontSize;
    }
    if (Math.abs(max-min)<2) {
      break;
    }
  }
  return fontSize;
}

function textFits(context, r, b, a, text, font, h) {
  if (!text) return true;
  context.font = font;
  let w = context.measureText(text).width;
  return Util.boxFits(a, r, b, w, h);
}
