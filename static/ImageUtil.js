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
      resolve(getOptimizedDataUrl(canvas, dataUrl, 0.5));
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
      drawProportionalOnSquareCanvas(canvas, image, true);
      resolve(getOptimizedDataUrl(canvas, null, 0.5));
    }
    image.src = dataUrl;
  })
}

export async function optimizeCoverImage(dataUrl) {
  return new Promise(function(resolve, reject) {
    const image = new Image();
    image.onload = function() {
      const canvas = createSquareCanvas(700);
      drawProportionalOnSquareCanvas(canvas, image, false);
      resolve(getOptimizedDataUrl(canvas, null, 0.7));
    }
    image.src = dataUrl;
  })
}

export function createInMemoryImage(context) {
  const tempCanvas = document.createElement('canvas');
  tempCanvas.width = context.canvas.width;
  tempCanvas.height = context.canvas.height;
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

export function renderText(text) {
  const canvasSize = 300;
  const canvas = createSquareCanvas(canvasSize);
  const context = canvas.getContext('2d');
  context.fillStyle = 'white';
  context.fillRect(0, 0, canvasSize, canvasSize);
  context.fillStyle = 'black';
  context.textBaseline = 'middle';
  context.textAlign = 'center';
  const maxWidth = canvasSize * 0.9;
  setLargestFittingFont(context, text, maxWidth);
  context.fillText(text, canvasSize/2, canvasSize/2, maxWidth);
  const newDataUrl = canvas.toDataURL('image/webp', 0.5);
  return newDataUrl;
}

export function getImageFromData(imageData) {
  if (imageData) {
    return new Promise(async function(resolve) {
      const image = new Image();
      image.setAttribute('crossOrigin', 'anonymous');
      image.onload = (function() {
        resolve(image);
      });
      image.src = imageData;
    });
  }
}

export function topLeftIsFullyTransparent(image) {
  const hexColor = getTopLeftColor(image);
  return (hexColor.slice(7)=='00');
}

function setLargestFittingFont(context, text, maxWidth) {
  for (let fontSize=Math.round(maxWidth/2); fontSize>=maxWidth/20; fontSize--) {
    context.font = `${fontSize}px Quicksand, sans-serif`;
    const textSize = context.measureText(text);
    if (textSize.width <= maxWidth) break;
  }
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

function drawProportionalOnSquareCanvas(canvas, image, letterboxed) {
  const canvasWidth = canvas.width;
  let scale = canvasWidth / Math.min(image.width, image.height);
  if (letterboxed) {
    scale = canvasWidth / Math.max(image.width, image.height);
  }
  const width = image.width * scale;
  const x = (canvasWidth - width) / 2;
  const height = image.height * scale;
  const y = (canvasWidth - height) / 2;
  const context = canvas.getContext('2d');
  context.drawImage(image, x, y, width, height);
}

function getOptimizedDataUrl(canvas, originalDataUrl, jpegCompressionFactor) {
  let newDataUrl;
  if (topLeftIsTransparent(canvas.getContext("2d"))) {
    newDataUrl = canvas.toDataURL('image/webp', 0.5);
  }
  else {
    newDataUrl = canvas.toDataURL('image/jpeg', jpegCompressionFactor);
  }
  if (originalDataUrl && originalDataUrl.length<newDataUrl.length) {
    return originalDataUrl;
  }
  else {
    return newDataUrl;
  }
}