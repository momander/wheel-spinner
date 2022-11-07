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
import duringSpinSounds from './duringSpinSounds.json';

const sounds = {};
let musicPlayingNow;
let musicVolumePercent;
let soundPlayingNow;
if (window.speechSynthesis) {
  window.speechSynthesis.getVoices();
}

const afterSpinSounds = [
  {name: 'sounds.No sound', value: 'no-sound'},
  {name: 'sounds.Applause', value: 'applause-sound', file: '/third_party/soundbible/SMALL_CROWD_APPLAUSE-Yannick_Lemieux-1268806408.mp3'},
  {name: 'sounds.Fanfare', value: 'fanfare-sound', file: '/third_party/freesound/350428__benjaminharveydesign__trumpet-fanfare.mp3'},
  {name: 'sounds.Bell ringing', value: 'bell-sound', file: '/third_party/freesound/370743__podsburgh__winner-metal-bell-ringing-remix.mp3'},
  {name: 'sounds.Cymbals', value: 'cymbal-sound', file: '/third_party/freesound/425432__trivialaccapella__18-crash-hit-soft.mp3'},
  {name: 'sounds.Read out the winning name', value: 'read-winner-sound'},
]

export function getDuringSpinSounds() {
  return duringSpinSounds;
}

export function getAfterSpinSounds() {
  return afterSpinSounds;
}

export function playTick(volumePercent) {
  playSound('/third_party/soundbible/Tick-DeepFrozenApps-397275646.mp3', volumePercent);
}

export function playClick(volumePercent) {
  playSound('/third_party/soundbible/Tick-DeepFrozenApps-397275646.mp3', volumePercent);
}

export async function playAfterSpin(trackName, winningText, volumePercent, locale) {
  if (trackName=='read-winner-sound' || trackName=='read-winner-sound-2') {
    if (window.speechSynthesis && winningText) {
      const utterThis = new SpeechSynthesisUtterance(winningText);
      utterThis.voice = getVoice(trackName, locale);
      utterThis.volume = volumePercent / 100;
      window.speechSynthesis.speak(utterThis);
    }
  }
  else {
    await import(/* webpackChunkName: "howler" */ 'howler');
    const file = afterSpinSounds.find(sound => sound.value==trackName).file;
    if (file) soundPlayingNow = new Howl({ src: [file], autoplay: true, volume: volumePercent / 100 });
  }
}

function getVoice(trackName, language) {
  let voices = window.speechSynthesis.getVoices();
  if (language=='en') language = 'en-US';
  if (language=='es') language = 'es-ES';
  let languageVoices = voices.filter(v=>v.lang.startsWith(language));
  if (trackName=='read-winner-sound' || languageVoices.length < 2) {
    return languageVoices[0];
  }
  else {
    return languageVoices[1];
  }
}

export function stopAfterSpinSound() {
  if (soundPlayingNow) soundPlayingNow.fade(1, 0, 1);
  soundPlayingNow = null;
}

export async function startMusic(trackName, volumePercent) {
  await import(/* webpackChunkName: "howler" */ 'howler');
  if (trackName=='random-music') trackName = getRandomMusicTrackValue();
  if (trackName.startsWith('random:')) trackName = getRandomMusicTrackInGenreValue(trackName);
  const file = getMusicFile(trackName);
  if (file) {
    musicPlayingNow = new Howl({ src: [file], autoplay: true, loop: true, volume: volumePercent / 100 });
    musicVolumePercent = volumePercent;
  }
}

export function fadeMusic() {
  if (musicPlayingNow) musicPlayingNow.fade(musicVolumePercent/100, 0, 1000);
  musicPlayingNow = null;
}

export function stopMusicNow() {
  if (musicPlayingNow) musicPlayingNow.stop();
  musicPlayingNow = null;
}

async function playSound(soundName, volumePercent) {
  await import(/* webpackChunkName: "howler" */ 'howler');
  try {
    if (sounds[soundName]) {
      sounds[soundName].volume(volumePercent / 100);
      sounds[soundName].play();
    }
    else {
      sounds[soundName] = new Howl({src: [soundName], autoplay: true, volume: volumePercent / 100});
    }
  }
  catch (ex) {
    Util.trackException(ex);
  }
}

export function preloadSounds(duringSpinSound, afterSpinSound) {
  try {
    preloadFile(getMusicFile(duringSpinSound));
    if (duringSpinSound == 'ticking-sound') preloadFile('/third_party/soundbible/Tick-DeepFrozenApps-397275646.mp3');
    preloadFile(afterSpinSounds.find(sound => sound.value==afterSpinSound).file);
  }
  catch (ex) {
    Util.trackException(ex);
  }
}

async function preloadFile(file) {
  await import(/* webpackChunkName: "howler" */ 'howler');
  if (file && !sounds[file]) {
    sounds[file] = new Howl({src: [file]});
  }
}

function getMusicFile(soundValue) {
  for (const category of Object.keys(duringSpinSounds)) {
    for (const soundName of Object.keys(duringSpinSounds[category])) {
      const sound = duringSpinSounds[category][soundName];
      if (sound.value == soundValue) {
        return sound.musicFile;
      }
    }
  }
}

function getRandomMusicTrackValue() {
  const allTrackValues = [];
  for (const category of Object.keys(duringSpinSounds)) {
    for (const soundName of Object.keys(duringSpinSounds[category])) {
      const sound = duringSpinSounds[category][soundName];
      if (sound.musicFile) allTrackValues.push(sound.value);
    }
  }
  const trackNumber = Util.getRandomInt(0, allTrackValues.length-1);
  return allTrackValues[trackNumber];
}

function getRandomMusicTrackInGenreValue(trackName) {
  const match = trackName.match(/random: (.*)/);
  const genreName = match ? match[1] : 'xxxxx';
  const trackValuesInGenre = [];
  for (const category of Object.keys(duringSpinSounds)) {
    if (category.includes(genreName)) {
      for (const soundName of Object.keys(duringSpinSounds[category])) {
        const sound = duringSpinSounds[category][soundName];
        if (sound.musicFile) trackValuesInGenre.push(sound.value);
      }
    }
  }
  const trackNumber = Util.getRandomInt(0, trackValuesInGenre.length-1);
  return trackValuesInGenre[trackNumber];
}
