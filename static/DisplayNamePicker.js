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
import CircularArray from './CircularArray.js';
import NameHat from './NameHat.js';
import * as Util from './Util.js';

export default class DisplayNamePicker {

  constructor() {
    this.hat = new NameHat();
    this.namesOnWheel = [];
    this.allNamesFitOnWheel = true;
    this.filledSlices = 0;
  }

  setNames(textboxNames, maxSlices, allowDuplicates) {
    if (!allowDuplicates) {
      // Remove duplicates.
      textboxNames = [...new Set(textboxNames)];
    }
    if (textboxNames.length <= maxSlices) {
      this.allNamesFitOnWheel = true;
      this.namesOnWheel = textboxNames;
    }
    else {
      this.allNamesFitOnWheel = false;
      this.filledSlices = Math.round(maxSlices * 0.66);
      this.hat.empty();
      textboxNames.forEach(name => {
        if (!this.namesOnWheel.includes(name)) {
          this.hat.addName(name);
        }
      })
      // Remove names from the wheel that are not in the textbox.
      this.namesOnWheel = this.namesOnWheel.filter(name => {
        return name == '' || textboxNames.includes(name);
      });
      this.namesOnWheel = this.adjustLength(this.namesOnWheel, maxSlices);
    }
  }

  getDisplayNames() {
    return this.namesOnWheel;
  }

  getNumberOfDisplayNames() {
    return this.namesOnWheel.length;
  }

  tick(indexAtPointer) {
    let updated = false;
    if (!this.allNamesFitOnWheel) {
      const startEmptyIndex = indexAtPointer + Math.ceil(this.filledSlices / 2);
      const startFilledIndex = indexAtPointer + this.namesOnWheel.length - Math.floor(this.filledSlices / 2);
      const circDisplayNames = new CircularArray(this.namesOnWheel);
      for (var i=indexAtPointer; i<indexAtPointer+this.namesOnWheel.length; i++) {
        if (i<startEmptyIndex && !circDisplayNames.getElement(i)) {
          circDisplayNames.setElement(i, this.hat.pullRandomName());
        }
        if (i>=startEmptyIndex && i<startFilledIndex && circDisplayNames.getElement(i)) {
          this.hat.addName(circDisplayNames.getElement(i));
          circDisplayNames.setElement(i, '');
        }
        if (i>startFilledIndex && !circDisplayNames.getElement(i)) {
          circDisplayNames.setElement(i, this.hat.pullRandomName());
        }
      }
      const newNames = circDisplayNames.getArray();
      updated = !Util.arraysEqual(this.namesOnWheel, newNames);
      this.namesOnWheel = newNames;
    }
    return updated;
  }

  adjustLength(displayNames, maxSlices) {
    while (displayNames.length < maxSlices) {
      displayNames.push('');
    }
    while (displayNames.length > maxSlices) {
      const lastName = displayNames[displayNames.length-1];
      if (lastName) {
        this.hat.addName(lastName);
      }
      displayNames = displayNames.slice(0, displayNames.length-1);
    }
    return displayNames;
  }

}
