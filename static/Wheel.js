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
import WheelPainter from './WheelPainter.js';
import DisplayNamePicker from './DisplayNamePicker.js';

export default function Wheel() {
  this.colors = [];
  this.angle = 0;
  this.speed = 0.005;
  this.stopSpeed = 0.0001;
  this.acceleration = 0.01;
  this.deceleration = 0;
  this.nameLastTick = '';
  this.state = new NotSpunState();
  this.wheelPainter = new WheelPainter();
  this.namePicker = new DisplayNamePicker();
  this.doneSpinningCallback = () => {};
  this.nameChangedCallback = () => {};

  this.setNames = function(names, maxSlices, allowDuplicates) {
    if (this.state.editAllowed()) {
      this.namePicker.setNames(names, maxSlices, allowDuplicates);
      this.wheelPainter.refresh();
    }
  }

  this.refresh = function() {
    this.wheelPainter.refresh();
  }

  this.configure = function(colors, centerImage, spinTime, slowSpin, hubSize, pageBackgroundColor) {
    if (this.state.editAllowed()) {
      this.colors = colors;
      this.centerImage = centerImage;
      this.spinTime = spinTime;
      this.acceleration = (slowSpin ? 0.001 : 0.01);
      this.hubSize = hubSize;
      this.pageBackgroundColor = pageBackgroundColor;
      this.wheelPainter.refresh();
    }
  }

  this.tick = function() {
    this.state.tick(this);
    const updated = this.namePicker.tick(this.getIndexAtPointer());
    if (updated) this.wheelPainter.refresh();
  }

  this.click = function(nameChangedCallback, doneSpinningCallback) {
    this.nameChangedCallback = nameChangedCallback;
    this.doneSpinningCallback = doneSpinningCallback;
    this.state.click(this);
  }

  this.spinIsDone = function() {
    this.doneSpinningCallback(this.getNameAtPointer());
  }

  this.isSpinning = function() {
    return this.state.isSpinning();
  }

  this.setRandomAngle = function() {
    this.angle = Math.random() * 2 * Math.PI;
  }

  this.advance = function() {
    this.indexFromLastTick = this.indexFromThisTick;
    this.indexFromThisTick = this.getIndexAtPointer();
    if (this.indexFromThisTick != this.indexFromLastTick) {
      this.nameChangedCallback();
    }
    this.angle += this.speed;
    if (this.angle > Math.PI * 2) {
      this.angle -= Math.PI * 2;
    }
  }

  this.getIndexAtPointer = function() {
    const numberOfNames = this.namePicker.getNumberOfDisplayNames();
    var radiansPerSegment = 2 * Math.PI / numberOfNames;
    var index = this.angle / radiansPerSegment;
    index = Math.round(index);
    if (index >= numberOfNames) {
      index = 0;
    }
    return index;
  }

  this.getNameAtPointer = function() {
    return this.namePicker.getDisplayNames()[this.getIndexAtPointer()];
  }

  this.resetRotation = function() {
    this.angle = 0;
  }

  this.calculateDeceleration = function() {
    var decelTicks = (this.spinTime - 1) * 60;
    var startSpeed = 60 * this.acceleration;
    this.deceleration = Math.exp(Math.log(this.stopSpeed/startSpeed)/decelTicks);
  }

  this.accelerate = function() {
    this.speed += this.acceleration;
  }

  this.decelerate = function() {
    this.speed = this.speed * this.deceleration;
  }

  this.isBelowStopSpeed = function() {
    return (this.speed < this.stopSpeed);
  }

  this.draw = function(context) {
    this.wheelPainter.draw(context, this.angle, this.namePicker.getDisplayNames(),
                          this.colors, this.centerImage, this.hubSize,
                          this.pageBackgroundColor);
  }

}




function NotSpunState() {

  this.tick = function(wheel) {
    wheel.advance();
  }

  this.click = function(wheel) {
    wheel.calculateDeceleration();
    wheel.state = new AcceleratingState();
  }

  this.editAllowed = function() {
    return true;
  }

  this.isSpinning = function() {
    return false;
  }

}


function AcceleratingState() {
  this.ticks = 0;
  this.MAX_AGE = 60;

  this.tick = function(wheel) {
    wheel.accelerate();
    wheel.advance();
    this.ticks += 1;
    if (this.ticks > this.MAX_AGE) {
      wheel.setRandomAngle();
      wheel.state = new SpinningState();
    }
  }

  this.click = function(wheel) {
  }

  this.editAllowed = function() {
    return false;
  }

  this.isSpinning = function() {
    return true;
  }

}


function SpinningState() {

  this.tick = function(wheel) {
    wheel.decelerate();
    wheel.advance();
    if (wheel.isBelowStopSpeed()) {
      wheel.speed = 0;
      wheel.state = new OpenForEditState();
      wheel.spinIsDone();
    }
  }

  this.click = function(wheel) {
  }

  this.editAllowed = function() {
    return false;
  }

  this.isSpinning = function() {
    return true;
  }

}


function OpenForEditState() {

  this.tick = function(wheel) {
  }

  this.click = function(wheel) {
    wheel.calculateDeceleration();
    wheel.state = new AcceleratingState();
  }

  this.editAllowed = function() {
    return true;
  }

  this.isSpinning = function() {
    return false;
  }

}

