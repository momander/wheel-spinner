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
import * as Locales from './Locales.js';

export default class Path {

  constructor(location) {
    this.protocol = location.protocol;
    this.host = location.host;
    this.locale = Locales.getLocale(location.host, location.pathname);
    const match = location.pathname.match(/\w\w\w-\w\w\w/);
    this.sharedWheel = match ? match[0].toLowerCase() : '';
  }

  setPathPrefix(prefix) {
    this.prefix = prefix;
  }

  getAbsoluteUrl() {
    return [
      this.protocol, '/', this.host, this.prefix,
      Locales.getDomainLocale(this.host)==this.locale ? '' : this.locale,
      this.sharedWheel
    ].filter(x => x).join('/').replace('///', '//') + '/';
  }

  getAbsoluteLocalizedRootUrl() {
    return [
      this.protocol, '/', this.host,
      Locales.getDomainLocale(this.host)==this.locale ? '' : this.locale
    ].filter(x => x).join('/').replace('///', '//') + '/';
  }

}
