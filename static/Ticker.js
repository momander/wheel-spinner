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

// ----------------------------------------------------------------------
// Call setTimestamp() on this object every animation frame. You can then
// call shouldTick() to learn if you should advance the model by 1/60th
// of a seccond. Call shouldTick() repeatedly (and advance the model each
// time) until it returns false.
// ----------------------------------------------------------------------

export default function Ticker() {
  this.lastFrameTimeMs = 0;
  this.delta = 0;
  this.timestep = 1000 / 60;

  this.setTimestamp = function(timestamp) {
    if (this.lastFrameTimeMs == 0) {
      // This is the first frame. We need to run tick once to init.
      this.delta = this.timestep;
    }
    else {
      this.delta += timestamp - this.lastFrameTimeMs;
    }
    this.lastFrameTimeMs = timestamp;
  }

  this.shouldTick = function() {
    var retVal = (this.delta >= this.timestep);
    if (retVal) this.delta -= this.timestep;
    return retVal;
  }

}
