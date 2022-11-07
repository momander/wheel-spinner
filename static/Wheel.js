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
import DisplayEntryPicker from './DisplayEntryPicker.js';
import * as Util from './Util.js';
// import store from './store/wheelStore.js';

export default class Wheel {

  constructor() {
    this.angle = 0;
    this.speed = 0;
    this.state = new InitialDemoSpinState(this);
    this.wheelPainter = new WheelPainter();
    this.entryPicker = new DisplayEntryPicker();
    this.doneSpinningCallback = () => {};
    this.nameChangedCallback = () => {};
  }

  setEntries(entries, maxSlices, allowDuplicates) {
    if (!this.state.isSpinning()) {
      const enabledEntries = entries.filter(entry => entry.enabled || !entry.hasOwnProperty('enabled'));
      this.entryPicker.setEntries(enabledEntries, maxSlices, allowDuplicates);
      this.wheelPainter.refresh();
    }
  }

  refresh() {
    this.wheelPainter.refresh();
  }

  configure(wheelConfig, darkMode) {
    if (!this.state.isSpinning()) {
      this.wheelConfig = wheelConfig;
      this.darkMode = darkMode;
      this.wheelPainter.refresh();
    }
  }

  tick() {
    this.state.tick(this);
    this.advance();
    const updated = this.entryPicker.tick(this.getIndexAtPointer());
    if (updated) this.wheelPainter.refresh();
  }

  click(nameChangedCallback, doneSpinningCallback) {
    this.nameChangedCallback = nameChangedCallback;
    this.doneSpinningCallback = doneSpinningCallback;
    this.state.click(this);
  }

  spinIsDone() {
    this.doneSpinningCallback(this.getEntryAtPointer());
  }

  isSpinning() {
    return this.state.isSpinning();
  }

  setRandomPosition() {
    this.angle = Math.random() * 2 * Math.PI;
    this.entryPicker.setRandomPosition();
  }

  advance() {
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

  getIndexAtPointer() {
    return Util.getIndexAtPointer(
      this.entryPicker.getDisplayEntries(),
      this.angle
    );
  }

  getEntryAtPointer() {
    return this.entryPicker.getDisplayEntries()[this.getIndexAtPointer()];
  }

  resetRotation() {
    this.angle = 0;
  }

  getStateTimeLengths() {
    const retVal = { accelerating: 0, decelerating: 0 };
    const spinTicks = this.wheelConfig.spinTime * 60;
    retVal.accelerating = Math.min(60, spinTicks/3);
    retVal.decelerating = spinTicks - retVal.accelerating;
    return retVal;
  }

  draw(context) {
    if (this.wheelConfig && this.state.drawThisFrame()) {
      this.wheelPainter.draw(
        context, this.angle, this.entryPicker.getDisplayEntries(),
        this.entryPicker.getAllEntries(), this.wheelConfig, this.darkMode
      );
    }
  }

}


class InitialDemoSpinState {

  constructor(wheel) {
    wheel.speed = 0.005;
  }

  tick(wheel) {
  }

  click(wheel) {
    wheel.state = new AcceleratingState(wheel);
  }

  isSpinning() {
    return false;
  }

  drawThisFrame() {
    return true;
  }

}


class AcceleratingState {

  constructor(wheel) {
    this.age = 0;
    this.MAX_AGE = wheel.getStateTimeLengths().accelerating;
  }

  tick(wheel) {
    const acceleration = (wheel.wheelConfig.slowSpin ? 0.001 : 0.01);
    wheel.speed += acceleration;
    this.age += 1;
    if (this.age > this.MAX_AGE) {
      wheel.setRandomPosition();
      wheel.state = new DeceleratingState(wheel);
    }
  }

  click(wheel) {
  }

  isSpinning() {
    return true;
  }

  drawThisFrame() {
    return true;
  }

}


class DeceleratingState {

  constructor(wheel) {
    this.age = 0;
    this.MAX_AGE = wheel.getStateTimeLengths().decelerating;
    const decelTicks = this.MAX_AGE;
    const startSpeed = wheel.speed;
    const stopSpeed = 0.00015;
    this.deceleration = Math.exp(Math.log(stopSpeed/startSpeed)/decelTicks);
  }

  tick(wheel) {
    wheel.speed = wheel.speed * this.deceleration;
    this.age += 1;
    if (this.age > this.MAX_AGE) {
      wheel.state = new PostSpinState(wheel);
    }
  }

  click(wheel) {
  }

  isSpinning() {
    return true;
  }

  drawThisFrame() {
    return true;
  }

}


class PostSpinState {

  constructor(wheel) {
    wheel.speed = 0;
    wheel.spinIsDone();
  }

  tick(wheel) {
  }

  click(wheel) {
    wheel.state = new AcceleratingState(wheel);
  }

  isSpinning() {
    return false;
  }

  drawThisFrame() {
    return true;
  }

}
