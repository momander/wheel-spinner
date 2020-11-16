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
import 'howler';
import * as Util from './Util.js';

import './third_party/soundbible/SMALL_CROWD_APPLAUSE-Yannick_Lemieux-1268806408.mp3';
import './ding.mp3';
import './third_party/soundbible/Tick-DeepFrozenApps-397275646.mp3';
import './third_party/filmmusic-io/strength-of-the-titans-by-kevin-macleod-from-filmmusic-io.mp3';
import './third_party/filmmusic-io/amazing-plan-by-kevin-macleod-from-filmmusic-io.mp3';
import './third_party/filmmusic-io/life-of-riley-by-kevin-macleod-from-filmmusic-io.mp3';
import './third_party/freesound/350428__benjaminharveydesign__trumpet-fanfare.mp3';
import './third_party/freesound/370743__podsburgh__winner-metal-bell-ringing-remix.mp3';
import './third_party/freesound/425432__trivialaccapella__18-crash-hit-soft.mp3';

const sounds = {};
let musicPlayingNow;
const duringSpinSounds = [
  {name: 'sounds.No sound', value: 'no-sound'},
  {name: 'sounds.Ticking sound', value: 'ticking-sound'},
  {name: 'sounds.Dramatic music', value: 'dramatic-music', musicFile: '/strength-of-the-titans-by-kevin-macleod-from-filmmusic-io.mp3'},
  {name: 'sounds.Piano music', value: 'piano-music', musicFile: '/amazing-plan-by-kevin-macleod-from-filmmusic-io.mp3'},
  {name: 'sounds.Cheerful music', value: 'cheerful-music', musicFile: '/life-of-riley-by-kevin-macleod-from-filmmusic-io.mp3'},
]

const afterSpinSounds = [
  {name: 'sounds.No sound', value: 'no-sound'},
  {name: 'sounds.Applause', value: 'applause-sound', file: '/SMALL_CROWD_APPLAUSE-Yannick_Lemieux-1268806408.mp3'},
  {name: 'sounds.Fanfare', value: 'fanfare-sound', file: '/350428__benjaminharveydesign__trumpet-fanfare.mp3'},
  {name: 'sounds.Bell ringing', value: 'bell-sound', file: '/370743__podsburgh__winner-metal-bell-ringing-remix.mp3'},
  {name: 'sounds.Cymbals', value: 'cymbal-sound', file: '/425432__trivialaccapella__18-crash-hit-soft.mp3'},
  {name: 'sounds.Read out the winning name', value: 'read-winner-sound'},
]

export function getDuringSpinSounds() {
  return duringSpinSounds;
}

export function getAfterSpinSounds() {
  return afterSpinSounds;
}

export function playTick() {
  playSound('/ding.mp3');
}

export function playClick() {
  playSound('/Tick-DeepFrozenApps-397275646.mp3');
}

export function playAfterSpin(trackName, winningEntry) {
  if (trackName=='read-winner-sound') {
    if (window.speechSynthesis) {
      const utterThis = new SpeechSynthesisUtterance(winningEntry);
      window.speechSynthesis.speak(utterThis);
    }
  }
  else {
    const file = afterSpinSounds.find(sound => sound.value==trackName).file;
    if (file) playSound(file);
  }
}

export function startMusic(trackName) {
  const file = duringSpinSounds.find(sound => sound.value==trackName).musicFile;
  if (file) musicPlayingNow = new Howl({ src: [file], autoplay: true });
}

export function stopMusic() {
  if (musicPlayingNow) musicPlayingNow.fade(1, 0, 1000);
  musicPlayingNow = null;
}

function playSound(soundName) {
  try {
    if (sounds[soundName]) {
      sounds[soundName].play();
    }
    else {
      sounds[soundName] = new Howl({src: [soundName], autoplay: true});
    }
  }
  catch (ex) {
    Util.trackException(ex);
  }
}

export function preloadSounds(duringSpinSound, afterSpinSound) {
  try {
    preloadFile(duringSpinSounds.find(sound => sound.value==duringSpinSound).musicFile);
    if (duringSpinSound == 'ticking-sound') preloadFile('/ding.mp3');
    preloadFile(afterSpinSounds.find(sound => sound.value==afterSpinSound).file);
  }
  catch (ex) {
    Util.trackException(ex);
  }
}

function preloadFile(file) {
  if (file && !sounds[file]) {
    sounds[file] = new Howl({src: [file]});
  }
}
