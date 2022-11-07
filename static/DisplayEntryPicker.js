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
import CircularArray from './CircularArray.js';
import CircularCounter from './CircularCounter.js';

export default class DisplayEntryPicker {

  constructor() {
    this.allEntries = new CircularArray([]);
    this.maxSlices = 1e6;
    this.prevIndexAtPointer = -1;
    this.displayEntries = new CircularArray([]);
  }

  setEntries(entries, maxSlices, allowDuplicates) {
    this.maxSlices = maxSlices;
    this.allEntries = new CircularArray(Util.dedupeEntries(allowDuplicates, entries));
    if (this.allEntries.length <= maxSlices || this.entriesHaveUnequalWeight(entries)) {
      this.displayEntries = this.allEntries;
    }
    else {
      this.displayEntries = new CircularArray(this.allEntries.slice(0, maxSlices));
    }
  }

  getDisplayEntries() {
    return this.displayEntries.getArray();
  }

  getNumberOfDisplayEntries() {
    return this.getDisplayEntries().length;
  }

  getAllEntries() {
    return this.allEntries.getArray();
  }

  tick(indexAtPointer) {
    if (this.maxSlices >= this.allEntries.length) {
      return false;
    }
    if (indexAtPointer == this.prevIndexAtPointer) {
      return false;
    }
    else {
      const circCounter = new CircularCounter(
        this.prevIndexAtPointer, indexAtPointer, this.displayEntries.length
      );
      while (!circCounter.isDone()) {
        circCounter.increment();
        const i = circCounter.getIndex();
        const insertIndex = Math.floor(i+this.maxSlices/2) % this.maxSlices;
        const entryBeforeInsert = this.displayEntries.getElement(insertIndex-1);
        const entryToInsert = this.allEntries.getNextElement(entryBeforeInsert);
        this.displayEntries.setElement(insertIndex, entryToInsert);
      }
      this.prevIndexAtPointer = indexAtPointer;
      return true;
    }
  }

  entriesHaveUnequalWeight(entries) {
    if (entries.length == 0 || !entries[0].weight) return false;
    return entries.find(entry => entry.weight != 1);
  }

  setRandomPosition() {
    if (this.maxSlices < this.allEntries.length) {
      const startIndex = Util.getRandomInt(0, this.allEntries.length-1);
      this.displayEntries = new CircularArray(
        this.allEntries.slice(startIndex, startIndex+this.maxSlices)
      );
    }
  }

}
