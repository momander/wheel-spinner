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

const resultCache = {};

export function getFont(context, texts, wheelRadius, hubRadius, smallestAngle) {
  const cachedResult = getCachedResult(texts, wheelRadius, hubRadius, smallestAngle);
  if (cachedResult) {
    return cachedResult;
  }
  let minFontSize = 200;
  let fontName = 'Quicksand, sans-serif';
  texts.forEach(text => {
    let fontSize = getFontSize(
      context, text, fontName, wheelRadius, hubRadius, smallestAngle
    );
    if (fontSize < minFontSize) {
      minFontSize = fontSize;
    }
  })
  const font = minFontSize + 'px ' + fontName;
  cacheResult(texts, wheelRadius, hubRadius, smallestAngle, font);
  return font;
}

function getFontSize(context, displayText, fontName, wheelRadius, hubRadius, smallestAngle) {
  return bisectSearch(context, wheelRadius, hubRadius, smallestAngle, fontName,
    displayText, 10, 200);
}

function bisectSearch(context, wheelRadius, hubRadius, smallestAngle, fontName, text, min, max) {
  let fontSize;
  while (true) {
    fontSize = Math.round((min + max) / 2);
    let font = fontSize + 'px ' + fontName;
    if (textFits(context, wheelRadius, hubRadius, smallestAngle / 2, text, font, fontSize)) {
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
  let w = context.measureText(` ${Util.shortenText(text)} `).width;
  return Util.boxFits(a, r, b, w, h);
}

function getCachedResult(texts, wheelRadius, hubRadius, smallestAngle) {
  const key = getCacheKey(texts, wheelRadius, hubRadius, smallestAngle);
  return resultCache[key];
}

function cacheResult(texts, wheelRadius, hubRadius, smallestAngle, font) {
  const key = getCacheKey(texts, wheelRadius, hubRadius, smallestAngle);
  return resultCache[key] = font;
}

function getCacheKey(texts, wheelRadius, hubRadius, smallestAngle) {
  const array = {
    texts: texts,
    wheelRadius: wheelRadius,
    hubRadius: hubRadius,
    smallestAngle: smallestAngle
  };
  return JSON.stringify(array);
}
