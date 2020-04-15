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
export default class CircularArray {

  constructor(array) {
    this.array = array.slice(0);
  }

  getElement(index) {
    while (index<0) {
      index += this.array.length;
    }
    while (index>=this.array.length) {
      index -= this.array.length;
    }
    return this.array[index];
  }

  setElement(index, value) {
    while (index<0) {
      index += this.array.length;
    }
    while (index>=this.array.length) {
      index -= this.array.length;
    }
    this.array[index] = value;
  }

  getArray() {
    return this.array;
  }

}
