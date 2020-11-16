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
export const timeago = (ptime, ctime) => {
  if (!ptime) return ''
  if (!ctime) ctime = Date.now()
  const seconds = Math.floor((ctime - ptime) / 1000);
  const intervals = [
    Math.floor(seconds / 31536000), Math.floor(seconds / 2592000),
    Math.floor(seconds / 604800),   Math.floor(seconds / 86400),
    Math.floor(seconds / 3600),     Math.floor(seconds / 60)
  ];
  const times = ['year', 'month', 'week', 'day', 'hour', 'minute'];
  for (const key in intervals) {
    if (intervals[key] > 1) {
      return intervals[key] + ' ' + times[key] + 's ago';
    }
    else if (intervals[key] === 1) {
      return intervals[key] + ' ' + times[key] + ' ago';
    }
  }
  return 'moments ago';
}

export const firestoremilliseconds = (timestamp) => {
  if (timestamp && timestamp._seconds) return timestamp._seconds * 1000;
  if (timestamp && timestamp.seconds) return timestamp.seconds * 1000;
}

export const dollaramount = (amount) => {
  if (isNumber(amount)) return '$ ' + amount.toFixed(2);
}

export const localestring = (value) => {
  if (value && value.toLocaleString) return value.toLocaleString();
}

export const percent = (value) => {
  if (isNumber(value)) return Math.round(value*100) + ' %';
}

function isNumber(value) {
  return Number.isFinite(value);
}
