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
export default function Preferences() {
  this.appInfoVisible = true;
  this.darkMode = false;

  this.loadJson = function(jsonString) {
    let obj = JSON.parse(jsonString);
    this.copyPropertiesFrom(obj);
  }

  this.getJson = function() {
    var keys = Object.keys(this);
    var retVal = {};
    keys.forEach(key => {
      retVal[key] = this[key];
    });
    return JSON.stringify(retVal);
  }

  this.getValues = function() {
    return JSON.parse(this.getJson());
  }

  this.loadValues = function(values) {
    this.copyPropertiesFrom(values);
  }

  this.clone = function() {
    const clone = new Preferences();
    clone.loadValues(this.getValues());
    return clone;
  }

  this.copyPropertiesFrom = function(obj) {
    Object.assign(this, JSON.parse(JSON.stringify(obj)));
  }

}
