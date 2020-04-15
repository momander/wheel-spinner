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
export async function optimizeSliceImage(dataUrl) {
  return new Promise(function(resolve, reject) {
    const image = new Image();
    image.onload = function() {
      const canvas = createProportionalCanvas(image.width, image.height, 200);
      drawStretched(canvas, image);
      resolve(getOptimizedDataUrl(canvas, dataUrl));
    }
    image.src = dataUrl;
  })
}

export async function optimizeCenterImage(dataUrl) {
  return new Promise(function(resolve, reject) {
    const image = new Image();
    image.onload = function() {
      const canvas = createSquareCanvas(370);
      if (!topLeftIsWhiteOrTransparent(image)) {
        drawStretched(canvas, image, 'blur(4px)');
      }
      drawProportionalOnSquareCanvas(canvas, image);
      resolve(getOptimizedDataUrl(canvas));
    }
    image.src = dataUrl;
  })
}

export function createInMemoryImage(width, height) {
  const tempCanvas = document.createElement('canvas');
  tempCanvas.width = width;
  tempCanvas.height = height;
  return tempCanvas;
}

export function getTopLeftColor(image) {
  let context = document.createElement('canvas').getContext('2d');
  context.drawImage(image, 0, 0);
  let data = context.getImageData(0, 0, 1, 1).data;
  if (meantToBeWhite(data[0], data[1], data[2])) {
    return '#FFFFFFFF';
  }
  else {
    return getHexColor(data[0], data[1], data[2], data[3]);
  }
}

export function isTransparent(rgbaColor) {
  let retVal = false;
  let match = rgbaColor.match(/#\w\w\w\w\w\w(\w\w)/);
  if (match) {
    retVal = (match[1] == '00');
  }
  return retVal;
}

export async function extractColors(dataUri) {
  const Vibrant = (await import(/* webpackChunkName: "vibrant" */ 'node-vibrant')).default;
  const img = new Image();
  img.src = dataUri;
  return new Promise(function(resolve, reject) {
    img.onload = async function() {
      const v = new Vibrant(img);
      const palette = await v.getPalette();
      resolve([
        palette.Vibrant.hex,
        palette.LightVibrant.hex,
        palette.DarkVibrant.hex,
        palette.Muted.hex,
        palette.LightMuted.hex,
        palette.DarkMuted.hex
      ]);
    }
  })
}

function createProportionalCanvas(imageWidth, imageHeight, maxSide) {
  let xScale = maxSide / imageWidth;
  let yScale = maxSide / imageHeight;
  let scale = Math.max(xScale, yScale);
  const canvas = document.createElement('canvas');
  canvas.width = imageWidth * scale;
  canvas.height = imageHeight * scale;
  return canvas;
}

function createSquareCanvas(side) {
  const canvas = document.createElement('canvas');
  canvas.width = side;
  canvas.height = side;
  return canvas;
}

function topLeftIsWhiteOrTransparent(image) {
  const hexColor = getTopLeftColor(image);
  return (hexColor=='#FFFFFFFF' || hexColor.slice(7)=='FF');
}

function topLeftIsTransparent(context) {
  let data = context.getImageData(0, 0, 1, 1).data;
  return (data[3] < 5);
}

function meantToBeWhite(r, g, b) {
  // An edge effect and slight transparence probably made the
  // color slightly off-white.
  return (r==g && r==b && r>230);
}

function getHexColor(r, g, b, a) {
  return `#${hex(r)}${hex(g)}${hex(b)}${hex(a)}`;
}

const hex = d => Number(d).toString(16).padStart(2, '0');

function drawStretched(canvas, image, filter) {
  const context = canvas.getContext('2d');
  context.save();
  if (filter) context.filter = filter;
  // Draw image with full bleed to reduce edge artifacts.
  context.drawImage(image, -2, -2, canvas.width+4, canvas.height+4);
  context.restore();
}

function drawProportionalOnSquareCanvas(canvas, image) {
  const canvasWidth = canvas.width;
  const scale = canvasWidth / Math.max(image.width, image.height);
  const width = image.width * scale;
  const x = (canvasWidth - width) / 2;
  const height = image.height * scale;
  const y = (canvasWidth - height) / 2;
  const context = canvas.getContext('2d');
  context.drawImage(image, x, y, width, height);
}

function getOptimizedDataUrl(canvas, originalDataUrl) {
  let newDataUrl;
  if (topLeftIsTransparent(canvas.getContext("2d"))) {
    newDataUrl = canvas.toDataURL('image/png');
  }
  else {
    newDataUrl = canvas.toDataURL('image/jpeg', 0.5);
  }
  if (originalDataUrl && originalDataUrl.length<newDataUrl.length) {
    return originalDataUrl;
  }
  else {
    return newDataUrl;
  }
}
