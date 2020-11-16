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
import ImageCache from './ImageCache.js';
import PieSlice from './PieSlice.js';
import * as FontMeasurer from './FontMeasurer.js';
import * as hubSizes from './hubSizes.js';
import * as Util from './Util.js';
import * as ImageUtil from './ImageUtil.js';


export default class WheelPainter {

  constructor() {
    this.imageCache = new ImageCache();
    this.names = [];
    this.wheelImages = {};
  }

  draw(context, angle, names, colors, centerImage, hubSize, backgroundColor) {
    const wheelRadius = context.canvas.width * .44;
    const hubRadius = this.getHubRadius(wheelRadius, hubSize);
    const drawShadows = Util.colorIsWhite(backgroundColor);
    this.drawBackgroundColor(context, backgroundColor);
    this.drawWheelShadow(context, wheelRadius, drawShadows);
    if (names.includes('')) this.drawHat(context, wheelRadius, hubRadius);
    this.drawWheel(context, wheelRadius, angle, names, colors, hubRadius);
    this.drawPointer(context, wheelRadius, drawShadows);
    this.drawHub(context, angle, centerImage, hubRadius);
  }

  getHubRadius(wheelRadius, hubSize) {
    const hubFraction = hubSizes.hubSizes[hubSize] || 0.2;
    return Math.round(hubFraction * wheelRadius);
  }

  refresh() {
    this.wheelImage = null;
    this.pointerImage = null;
  }

  drawBackgroundColor(context, backgroundColor) {
    if (backgroundColor=='#FFFFFF') return;
    context.save();
    context.fillStyle = backgroundColor;
    context.fillRect(0, 0, context.canvas.width, context.canvas.height);
    context.restore();
  }

  drawWheelShadow(context, wheelRadius, drawShadows) {
    if (!drawShadows) return;
    if (!this.wheelShadowImage) {
      this.wheelShadowImage = ImageUtil.createInMemoryImage(context.canvas.width, context.canvas.height);
      this.drawWheelShadowNoCache(this.wheelShadowImage.getContext("2d"), wheelRadius);
    }
    context.drawImage(this.wheelShadowImage, 0, 0);
  }

  drawWheel(context, wheelRadius, angle, names, colors, hubRadius) {
    if (!this.wheelImage) {
      this.wheelImage = ImageUtil.createInMemoryImage(context.canvas.width, context.canvas.height);
      this.drawWheelNoCache(this.wheelImage.getContext("2d"), wheelRadius, names, colors, hubRadius);
      this.names = names.slice(0);
    }
    var width = context.canvas.width;
    var height = context.canvas.height;
    context.save();
    context.translate(width / 2, height / 2);
    context.rotate(angle);
    context.translate(-width / 2, -height / 2);
    context.drawImage(this.wheelImage, 0, 0);
    context.restore();
  }

  drawHat(context, wheelRadius, hubRadius) {
    const image = this.imageCache.getImage('images/hat-with-names.png');
    const scale = (wheelRadius - hubRadius) / image.width;
    const x = context.canvas.width / 2 - wheelRadius;
    const height = image.height * scale;
    const y = (context.canvas.height - height) / 2;
    const width = wheelRadius - hubRadius;
    context.drawImage(image, x, y, width, height);
  }

  drawPointer(context, wheelRadius, drawShadows) {
    if (!this.pointerImage) {
      this.pointerImage = ImageUtil.createInMemoryImage(context.canvas.width, context.canvas.height);
      this.drawPointerNoCache(this.pointerImage.getContext("2d"), wheelRadius, drawShadows);
    }
    context.drawImage(this.pointerImage, 0, 0);
  }

  drawWheelShadowNoCache(context, wheelRadius) {
    var x = context.canvas.width / 2;
    var y = context.canvas.height / 2;
    var gradient = context.createRadialGradient(x, y, wheelRadius, x, y+4, wheelRadius+8);
    gradient.addColorStop(0, '#bbb');
    gradient.addColorStop(1, '#fff');
    context.fillStyle = gradient;
    context.fillRect(0, 0, context.canvas.width, context.canvas.height);
  }

  drawWheelNoCache(context, wheelRadius, names, colors, hubRadius) {
    context.save();
    context.translate(context.canvas.width / 2, context.canvas.height / 2);
    var radiansPerSegment = 2 * Math.PI / names.length;
    const self = this;
    let slices = names.map(function(entry, index) {
      const color = colors[index % colors.length];
      const displayText = Util.extractDisplayText(entry, true);
      const imageData = Util.extractImage(entry);
      const image = self.getWheelImage(imageData);
      return new PieSlice(radiansPerSegment, wheelRadius, hubRadius, color, displayText, image);
    });
    if (slices.length > 0) {
      context.font = this.getSmallestFont(context, slices, wheelRadius, hubRadius);
      slices.forEach(slice => {
        slice.draw(context);
        context.rotate(-radiansPerSegment);
      });
    }
    context.restore();
    context.save();
    context.translate(context.canvas.width / 2, context.canvas.height / 2);
    this.drawCenterCircle(context, hubRadius);
    context.restore();
  }

  getSmallestFont(context, slices, wheelRadius, hubRadius) {
    let minFontSize = 200;
    let fontName = 'Quicksand, sans-serif';
    slices.forEach(slice => {
      let fontSize = FontMeasurer.getFontSize(context, slice.displayText,
                              slices.length, fontName, wheelRadius, hubRadius);
      if (fontSize < minFontSize) {
        minFontSize = fontSize;
      }
    })
    return minFontSize + 'px ' + fontName;
  }

  drawCenterCircle(context, hubRadius) {
    context.fillStyle = 'white';
    context.beginPath();
    context.arc(0, 0, hubRadius, 0, Math.PI * 2);
    context.fill();
    context.lineWidth = 2;
    context.strokeStyle = '#333333';
    context.stroke();
  }

  drawPointerNoCache(context, wheelRadius, drawShadows) {
    context.save();
    context.translate(context.canvas.width / 2, context.canvas.height / 2);
    if (drawShadows) {
      context.shadowColor = '#444';
      context.shadowOffsetY = 4;
      context.shadowBlur = 10;
    }
    context.beginPath();
    context.moveTo(wheelRadius - 15, 0);
    context.lineTo(wheelRadius + 25, -20);
    context.lineTo(wheelRadius + 25, 20);
    context.lineTo(wheelRadius - 15, 0);
    context.lineWidth = 2;
    context.strokeStyle = '#333333';
    context.stroke();
    context.fillStyle = 'lightgray';
    context.fill();
    context.restore();
  }

  drawHub(context, angle, centerImage, hubRadius) {
    var image = this.imageCache.getImage(centerImage);
    if (image) {
      context.save();
      context.translate(context.canvas.width / 2, context.canvas.height / 2);
      context.rotate(angle);
      context.beginPath();
      context.arc(0, 0, hubRadius-1, 0, Math.PI * 2, true);
      context.clip();
      context.drawImage(image, -hubRadius, -hubRadius, hubRadius*2, hubRadius*2);
      context.restore();
    }
  }

  getWheelImage(imageData) {
    if (imageData) {
      if (!this.wheelImages[imageData]) {
        const image = new Image();
        const self = this;
        image.onload = (function() {
          self.wheelImage = null;
        })
        image.setAttribute('crossOrigin', 'anonymous');
        image.src = imageData;
        this.wheelImages[imageData] = image;
      }
      return this.wheelImages[imageData];
    }
  }

}
