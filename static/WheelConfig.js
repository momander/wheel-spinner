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

export default function WheelConfig(winnerMessage) {
  this.title = '';
  this.names = [
    'Hamburger', 'Lasagna', 'Fish and chips', 'فلافل - Falafel',
    '炒麵 - Chow mein', 'Tortilla española', 'Crêpes', 'Pierogi', 'Feijoada',
    'ผัดไทย - Pad thai', 'Döner kebab', 'Phở'
  ];
    this.colorSettings = [
    {color: '#3369E8', enabled: true},
    {color: '#D50F25', enabled: true},
    {color: '#EEB211', enabled: true},
    {color: '#009925', enabled: true},
    {color: '#000000', enabled: false},
    {color: '#000000', enabled: false},
  ];
  this.pageBackgroundColor = '#FFFFFF';
  this.pictureType = 'none';
  this.galleryPicture = 'images/none.png';
  this.customPictureName = '';
  this.customPictureDataUri = '';
  this.allowDuplicates = true;
  this.duringSpinSound = 'ticking-sound';
  this.afterSpinSound = 'applause-sound';
  this.maxNames = 500;
  this.spinTime = 10;
  this.playCheers = true;
  this.launchConfetti = true;
  this.animateWinner = false;
  this.autoRemoveWinner = false;
  this.displayWinnerDialog = true;
  this.winnerMessage = winnerMessage || 'We have a winner!';
  this.playClickWhenWinnerRemoved = false;
  this.hubSize = 'S';
  this.slowSpin = false;

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
    const clone = new WheelConfig();
    clone.loadValues(this.getValues());
    return clone;
  }

  this.getDefaultColorSettings = function() {
    return new WheelConfig().colorSettings;
  }

  this.getDefaultNames = function() {
    return new WheelConfig().names;
  }

  this.setCustomPicture = function(name, dataUri) {
    this.customPictureName = name;
    this.customPictureDataUri = dataUri;
    this.pictureType = 'uploaded';
  }
  
  this.getWheelImage = function() {
    if (this.pictureType == 'none') {
      return null;
    }
    if (this.pictureType == 'gallery') {
      if (this.galleryPicture) {
        return this.galleryPicture;
      }
    }
    if (this.pictureType == 'uploaded') {
      if (this.customPictureDataUri) {
        return this.customPictureDataUri;
      }
    }
    return null;
  }

  this.shouldPlayTicks = function() {
    return (this.duringSpinSound=='ticking-sound');
  }

  this.setColors = function(colorValues, enabledValues) {
    for (var i=0; i<6; i++) {
      this.colorSettings[i] = {color: colorValues[i], enabled: enabledValues[i]};
    }
  }

  this.getCoalescedColors = function() {
    var retVal = [];
    for (var i=0; i<6; i++) {
      if (this.colorSettings[i].enabled) {
        retVal.push(this.colorSettings[i].color);
      }
    }
    if (retVal.length == 0) {
      retVal.push('#CCCCCC');
    }
    return retVal;
  }

  this.isTooBigForDatabase = function() {
    return (this.getJson().length > 990000);
  }

  this.copyPropertiesFrom = function(obj) {
    Object.assign(this, JSON.parse(JSON.stringify(obj)));
    this.convertOldData();
  }

  this.convertOldData = function() {
    if (Array.isArray(this.names)) {
      this.names = this.names.map(
        // Convert old height metric to new height metric.
        name => name.replace(/height="25"/, 'style="height:25px"')
      );
      // Remove any entries that are unprintable characters.
      this.names = this.names.filter(name => name.trim());
    }
    if (Array.isArray(this.entries)) {
      // Convert from new "entries" format to old "names" format.
      this.names = this.entries.map(entry => {
        let retVal = '';
        if (entry.image) {
          retVal += `<img src="${entry.image}" style="height:25px;font-size:1rem;">`;
        }
        if (entry.text) {
          retVal += Util.escapeHtml(entry.text);
        }
        return retVal;
      });
      delete this.entries;
    }
    this.maxNames = parseInt(this.maxNames);
    this.spinTime = parseInt(this.spinTime);
    if (this.playTicks===false) {
      this.duringSpinSound = 'no-sound';
    }
    delete this.playTicks;
    if (this.playCheers===false) {
      this.afterSpinSound = 'no-sound';
    }
    delete this.playCheers;
  }

}
