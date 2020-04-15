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
export default class PageReloader {

  constructor() {
    this.pageLoadedTs = this.getNowTimestamp();
  }

  reloadOutdatedPage(pageHidden) {
    if (pageHidden) {
      const nowTs = this.getNowTimestamp();
      const TWO_DAYS = 1000 * 3600 * 24 * 2;
      if (nowTs - this.pageLoadedTs > TWO_DAYS) {
        location.reload(true);
      }
    }
  }

  getNowTimestamp() {
    return new Date().getTime();
  }
  
}
