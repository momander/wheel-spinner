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

let getHtmlAsTextCache = {};

export function getHtmlAsText(html) {
  if (!(html in getHtmlAsTextCache)) {
    let retVal;
    try {
      let doc = new DOMParser().parseFromString(html, "text/html");
      retVal = doc.documentElement.textContent;
    }
    catch (e) {
      let replacements = [
        ['&amp;', '&'],
        ['&nbsp;', ' '],
        ['&lt;', '<'],
        ['&gt;', '>'],
      ]
      retVal = html;
      replacements.forEach(element => {
        let re = new RegExp(element[0], 'g');
        retVal = retVal.replace(re, element[1]);
      });
    }
    getHtmlAsTextCache[html] = retVal;
  }
  return getHtmlAsTextCache[html];
}

export function browserCanHandlePersistance(userAgent) {
  // Exclude iOS 12.2 due to a bug in that OS:
  // https://github.com/firebase/firebase-js-sdk/issues/1670
  return (userAgent.indexOf('OS 12_2 like Mac OS X') == -1);
}

export function arraysEqual(a, b) {
  if (a === b) return true;
  if (a == null || b == null) return false;
  if (a.length != b.length) return false;
  for (var i = 0; i < a.length; ++i) {
    if (a[i] !== b[i]) return false;
  }
  return true;
}

export function boxFits(a, r, b, w, h) {
  let d = Math.sqrt(Math.pow(r,2)-Math.pow(h/2,2)) -
          Math.max(h*Math.cos(a)/(2*Math.sin(a)), b);
  return d >= w;
}

export function extractDisplayText(entry, shorten) {
  if (entry) {
    let match = entry.match(/<img.*?src="(.*?)".*?>/);
    if (match) {
      entry = entry.replace(match[0], '');
    }
  }
  let displayText = '';
  if (entry) {
    displayText = getHtmlAsText(entry);
    if (shorten) {
      const MAX_LENGTH = 18;
      if (displayText.length > MAX_LENGTH) {
        displayText = displayText.substring(0, MAX_LENGTH-1) + '…';
      }
    }
    // Add font-proportional space between name and edges of wheel.
    displayText = ' ' + displayText + ' ';
  }
  return displayText;
}

export function extractImage(entry) {
  let imageData = '';
  if (entry) {
    let match = entry.match(/<img.*?src="(.*?)".*?>/);
    if (match) {
      imageData = match[1];
    }
  }
  return imageData;
}

export function shuffleArray(inputArray) {
  const array = inputArray.slice(0);
  for (var i = array.length - 1; i > 0; i--) {
    var j = Math.floor(Math.random() * (i + 1));
    var temp = array[i];
    array[i] = array[j];
    array[j] = temp;
  }
  return array;
}

export function getOccurencesInArray(array, entry) {
  return array.reduce(function(accumulator, currentValue) {
    return accumulator + (currentValue == entry ? 1 : 0);
  }, 0)
}

export function browserIsIE() {
  return !!window.document.documentMode;
}

export function browserIsIEOrOldEdge(userAgent) {
  if (!userAgent) return false;
  const re = new RegExp(' MSIE \\d|Trident\/|Edge\/');
  return !!userAgent.match(re);
}

export function sortWheelEntries(entries) {
  return entries.slice(0).sort((a, b) => {
    return a.localeCompare(b, 'en', { numeric: true, sensitivity: 'base' });
  })
}

export function isTouchScreen() {
  const retVal = 'ontouchstart' in window ||
    window.DocumentTouch && document instanceof window.DocumentTouch ||
    navigator.maxTouchPoints > 0 ||
    window.navigator.msMaxTouchPoints > 0;
  return retVal;
}

export function sanitizeWheelTitle(title) {
  let retVal = title;
  retVal = retVal.replace(/\//g, '\\');
  if (retVal == '..') retVal = '.. ';
  if (retVal == '.') retVal = '. ';
  if (retVal == '') retVal = '?';
  if (retVal.length > 100) {
    retVal = retVal.substring(0, 97) + '...';
  }
  return retVal;
}

export function getAddedEntries(oldEntries, newEntries) {
  if (!oldEntries) oldEntries = [];
  if (!newEntries) newEntries = [];
  return newEntries.filter(x => !oldEntries.includes(x));
}

export function initTracking() {
  window.onerror = function(message, source, lineno, colno, error) {
    try {
      if (error) message = error.toString();
      trackEvent('window.onerror', message, navigator.userAgent);
    }
    catch (ex) {
      console.error(ex);
    }
  }
}

export function trackEvent(eventCategory, eventAction, eventLabel) {
  if (location.host.startsWith('localhost')) return;
  if (typeof ga !== 'undefined') {
    ga('send', 'event', eventCategory, eventAction, eventLabel);
  }
}

export function trackException(exception, extraData) {
  console.error(exception);
}

export function escapeHtml(unsafe) {
  return unsafe
       .replace(/&/g, "&amp;")
       .replace(/</g, "&lt;")
       .replace(/>/g, "&gt;")
       .replace(/"/g, "&quot;")
       .replace(/'/g, "&#039;");
}

export function colorIsWhite(color) {
  if (!color) return true;
  return (color.toLowerCase() == '#ffffff');
}

export function getElementsByClassName(classNames) {
  const retVal = [];
  for (const className of classNames) {
    for (const el of document.getElementsByClassName(className)) {
      retVal.push(el);
    }
  }
  return retVal;
}

export function updateColorStyles(darkMode, darkModeColor, pageColor) {
  const sheet = [...document.styleSheets].find(
    sheet => sheet.href &&
    (sheet.href.includes('index.css') || sheet.href.includes('admin.css'))
  );
  const rule = [...sheet.rules].find(rule => rule.selectorText=='.can-go-dark');
  if (darkMode) {
    rule.style.color = '#fff';
    rule.style.backgroundColor = darkModeColor;
    document.documentElement.style.backgroundColor = '#000';
    document.body.style.backgroundColor = '#000';
  }
  else {
    rule.style.color = '';
    rule.style.backgroundColor = '';
    document.documentElement.style.backgroundColor = pageColor;
    document.body.style.backgroundColor = pageColor;
  }
}
