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
import confetti from 'canvas-confetti';

let end;
let myColors;

export function launch(colors) {
  myColors = colors;
  end = Date.now() + 5 * 1000;
  boom();
}

function boom() {
  const interval = setInterval(function() {
    if (Date.now() > end) {
      return clearInterval(interval);
    }
    confetti({
      startVelocity: 30,
      particleCount: 100,
      spread: 360,
      ticks: 60,
      origin: { x: Math.random(), y: Math.random() - 0.2 },
      colors: myColors
    });
  }, 200);
}
