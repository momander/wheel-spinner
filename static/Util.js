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
import "core-js/stable";
import "regenerator-runtime/runtime";


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

export function extractText(entry) {
  if (entry) {
    let match = entry.match(/<img.*?src="(.*?)".*?>/);
    if (match) {
      entry = entry.replace(match[0], '');
    }
  }
  let retVal = '';
  if (entry) {
    retVal = unescapeHtml(entry);
  }
  return retVal;
}

export function shortenText(text) {
  let retVal = '';
  if (text) {
    retVal = text;
    const MAX_LENGTH = 18;
    if (retVal.length > MAX_LENGTH) {
      retVal = retVal.substring(0, MAX_LENGTH-1) + '…';
    }
  }
  return retVal;
}

export function dedupeEntries(allowDuplicates, entries) {
  if (allowDuplicates) {
    return entries;
  }
  else {
    const entriesSeen = [];
    const dedupedEntries = [];
    for (let entry of entries) {
      const serializedEntry = serializeTextAndImage(entry);
      if (!entriesSeen.includes(serializedEntry)) {
        entriesSeen.push(serializedEntry);
        dedupedEntries.push(entry);
      }
    }
    return dedupedEntries;
  }
}

function serializeTextAndImage(entry) {
  const entryCopy = {};
  if (entry.text) entryCopy.text = entry.text;
  if (entry.image) entryCopy.image = entry.image;
  return JSON.stringify(entryCopy);
}

export function entryIsDuplicate(entries, entry) {
  const indexes = [];
  for (let i = 0; i < entries.length; i++) {
    if (serializeTextAndImage(entry) == serializeTextAndImage(entries[i])) {
      indexes.push(i);
    }
    if (entry.id == entries[i].id) {
      return indexes[0] != i;
    }
  }
  return false;
}

export function getEntriesFromHtml(html) {
  if (!html) return [];
  let rows = html.split(/<div>|<\/div>|<br>|<p>/);
  let junks = [
    /<div.*?>/g, '</div>', /<p.*?>/g, '</p>', /<span.*?>/g, '</span>',
    /<!--.*?>/g, /<br.*?>/g
  ];
  return rows.map(row => {
    let rowHtml = row;
    junks.forEach(junk => {
      rowHtml = rowHtml.replace(junk, '');
    })
    return createEntry(extractText(rowHtml), extractImage(rowHtml));
  }).filter(entry => (entry.text || entry.image));
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

export function createEntry(text, image, color, weight, sound) {
  const entry = {};
  if (text) entry.text = text;
  if (image) entry.image = image;
  if (color) entry.color = color;
  if (weight) entry.weight = weight;
  if (sound) entry.sound = sound;
  return entry;
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

export function getOccurences(allTexts, text) {
  if (!text) return 0;
  return allTexts.reduce(function(accumulator, currentValue) {
    return accumulator + (currentValue.trim() == text.trim() ? 1 : 0);
  }, 0)
}

export function browserIsIE() {
  return !!window.document.documentMode;
}

export function browserIsIeOnWindowsRtTablet(userAgent) {
  if (!userAgent) return false;
  const re = new RegExp('Trident.*Tablet PC.*rv.11');
  return !!userAgent.match(re);
}

export function browserIsIEOrOldEdge(userAgent) {
  if (!userAgent) return false;
  const re = new RegExp(' MSIE \\d|Trident\/|Edge\/');
  return !!userAgent.match(re);
}

export function platformSupportsFlags(navigator) {
  const windows = navigator.platform && navigator.platform.includes('Win');
  return !windows;
}

export function sortWheelEntries(entries) {
  return entries.slice(0).sort((a, b) => {
    const stringA = a.text || '';
    const stringB = b.text || '';
    return stringA.localeCompare(stringB, 'en', { numeric: true, sensitivity: 'base' });
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

export function getAddedTextEntries(oldEntries, newEntries) {
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
  // TODO: Log a Google Analytics event here?
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

export function unescapeHtml(unsafe) {
  return unsafe
       .replace(/&amp;/g, '&')
       .replace(/&lt;/g, '<')
       .replace(/&gt;/g, '>')
       .replace(/&quot;/g, '"')
       .replace(/&#039;/g, '\'')
       .replace(/&nbsp;/g, ' ');
}

export function removeHtml(unsafe) {
  return unsafe.replace(/<.*?>/g, "");
}

export function colorIsWhite(color) {
  if (!color) return true;
  return (color.toLowerCase() == '#ffffff');
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

export function getRandomChars(charCount) {
  let retVal = '';
  const chars = 'abcdefghjkmnpqrstuvwxyz23456789';
  for (let i=0; i<charCount; i++) {
    retVal += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return retVal;
}

export function addIdsIfNotThere(entries) {
  if (!entries || !entries.map) return [];
  return entries.map(entry => {
    entry.id = entry.id || getRandomChars(10);
    return entry;
  });
}

export function renderEntry(entry) {
  let retVal = '<div>';
  if (entry) {
    if (entry.image) {
      retVal += `<img src="${entry.image}" style="height:25px" style="font-size:1rem;">`;
    }
    if (entry.text) {
      retVal += escapeHtml(entry.text);
    }
  }
  retVal += '</div>';
  return retVal;
}

export function getRandomInt(min, max) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min + 1) + min);
}

export function getNonEnglishLocale(locale) {
  return locale == 'en' ? '' : locale;
}

export function displayWindowsRtWarning() {
  if (browserIsIeOnWindowsRtTablet(navigator.userAgent)) {
    trackEvent('Wheel', 'DisplayWindowsRtWarning', navigator.userAgent);
    const warning = 'It looks like you are using Internet Explorer on a ' +
                    'Windows RT Tablet PC. You may not be able to open or ' +
                    'save wheels from this device due to a bug. We realize ' +
                    'this is frustrating and we apologize. Please use ' +
                    'another device if possible.';
    alert(warning);
  }
}

export function getFeedbackFormUrl(userAgent, websiteVersion) {
  return '';
}

export function getTotalWeight(entries) {
  let totalWeight = 0;
  entries.forEach(entry => {
    if (entry.weight) {
      if (entry.enabled==true || !entry.hasOwnProperty('enabled')) {
        totalWeight += entry.weight;
      }
    }
  });
  return totalWeight;
}

export function getIndexAtPointer(entries, angle) {
  let index = 0;
  if (entries.length==0) return 0;
  if (entries[0].weight) {
    const totalWeight = getTotalWeight(entries);
    const radians = entries.map(e => 2 * Math.PI * e.weight / totalWeight);
    const endRadians = [];
    index = 0;
    let endAngle = radians[0] / 2;
    entries.forEach((entry, index) => {
      endRadians.push(endAngle);
      endAngle += radians[index+1];
    });
    index = 0;
    while (true) {
      if (angle<endRadians[index]) break;
      index++;
      if (index>endRadians.length-1) break;
    }
  }
  else {
    const radiansPerSegment = 2 * Math.PI / entries.length;
    index = Math.round(angle / radiansPerSegment);
  }
  if (index >= entries.length) index = 0;
  return index;
}
