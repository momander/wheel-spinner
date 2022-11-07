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
import * as FontPicker from './FontPicker.js';
import * as hubSizes from './hubSizes.js';
import * as Util from './Util.js';
import * as ImageUtil from './ImageUtil.js';


export default class WheelPainter {

  constructor() {
    this.imageCache = new ImageCache();
    this.entries = [];
    this.imageDataCache = {};
  }

  draw(context, angle, displayEntries, allEntries, wheelConfig, darkMode) {
    this.angle = angle;
    this.displayEntries = displayEntries;
    this.allEntries = allEntries;
    this.wheelConfig = wheelConfig;
    this.wheelRadius = context.canvas.width * .44;
    this.hubRadius = this.getHubRadius(wheelConfig.type, this.wheelRadius, wheelConfig.hubSize);
    this.backgroundColor = darkMode ? '#000' : wheelConfig.pageBackgroundColor;
    this.drawShadows = Util.colorIsWhite(this.backgroundColor);
    this.drawBackgroundColor(context);
    this.drawWheelShadow(context);
    this.drawCoverImage(context);
    this.drawWheel(context);
    this.drawPointer(context);
    this.drawCenterImage(context);
    this.drawCoverPlate(context);
  }

  getHubRadius(wheelType, wheelRadius, hubSize) {
    if (wheelType=='image') return 0;
    const hubFraction = hubSizes.hubSizes[hubSize] || 0.2;
    return Math.round(hubFraction * wheelRadius);
  }

  refresh() {
    this.wheelImage = null;
    this.pointerImage = null;
    this.coverPlateImage = null;
  }

  drawBackgroundColor(context) {
    if (this.backgroundColor=='#FFFFFF') return;
    context.save();
    context.fillStyle = this.backgroundColor;
    context.fillRect(0, 0, context.canvas.width, context.canvas.height);
    context.restore();
  }

  drawWheelShadow(context) {
    if (!this.drawShadows) return;
    if (!this.wheelShadowImage) {
      this.wheelShadowImage = ImageUtil.createInMemoryImage(context);
      this.drawWheelShadowNoCache(this.wheelShadowImage.getContext("2d"));
    }
    context.drawImage(this.wheelShadowImage, 0, 0);
  }

  drawWheelShadowNoCache(context) {
    const x = context.canvas.width / 2;
    const y = context.canvas.height / 2;
    const gradient = context.createRadialGradient(x, y, this.wheelRadius, x, y+4, this.wheelRadius+8);
    gradient.addColorStop(0, '#bbb');
    gradient.addColorStop(1, '#fff');
    context.fillStyle = gradient;
    context.fillRect(0, 0, context.canvas.width, context.canvas.height);
  }

  drawWheel(context) {
    if (!this.wheelImage) {
      this.wheelImage = ImageUtil.createInMemoryImage(context);
      this.entries = this.displayEntries.slice(0);
      this.drawWheelNoCache(this.wheelImage.getContext("2d"));
    }
    const width = context.canvas.width;
    const height = context.canvas.height;
    context.save();
    context.translate(width / 2, height / 2);
    context.rotate(this.angle);
    context.translate(-width / 2, -height / 2);
    context.drawImage(this.wheelImage, 0, 0);
    context.restore();
  }

  drawWheelNoCache(context) {
    this.drawSlices(context);
    this.drawCenterCircle(context);
  }

  drawCoverImage(context) {
    if (this.wheelConfig.type=='color') return;
    const image = this.imageCache.getImage(this.wheelConfig.getCoverImage());
    if (!image) return;
    context.save();
    context.translate(context.canvas.width/2, context.canvas.height/2);
    context.rotate(this.angle);
    context.beginPath();
    context.arc(0, 0, this.wheelRadius-1, 0, Math.PI*2, true);
    context.clip();
    context.drawImage(image, -this.wheelRadius, -this.wheelRadius, this.wheelRadius*2, this.wheelRadius*2);
    context.restore();
  }

  drawSlices(context) {
    context.save();
    context.translate(context.canvas.width / 2, context.canvas.height / 2);
    const self = this;
    if (this.wheelConfig.isAdvanced) {
      const totalWeight = Util.getTotalWeight(this.entries);
      const radians = [];
      let smallestAngle = 2 * Math.PI;
      this.entries.forEach((entry, index) => {
        radians[index] = 2 * Math.PI * entry.weight / totalWeight;
        if (radians[index] < smallestAngle) smallestAngle = radians[index];
      });
      context.font = FontPicker.getFont(
        context, this.allEntries.map(e=>e.text),
        this.wheelRadius, this.hubRadius, smallestAngle
      );
      this.displayEntries
        .map(function(entry, index) {
          return new PieSlice(
            self.wheelConfig, radians[index], self.wheelRadius, self.hubRadius,
            index, entry, self.getImageFromData(entry.image)
          );
        })
        .forEach((slice, index) => {
          const radiansPerSegment = radians[index] / 2 + radians[index + 1] / 2;
          slice.draw(context);
          context.rotate(-radiansPerSegment);
        });
    }
    else {
      const radiansPerSegment = 2 * Math.PI / this.displayEntries.length;
      context.font = FontPicker.getFont(
        context, this.allEntries.map(e=>e.text),
        this.wheelRadius, this.hubRadius, radiansPerSegment
      );
      this.displayEntries
        .map(function(entry, index) {
          return new PieSlice(
            self.wheelConfig, radiansPerSegment, self.wheelRadius, self.hubRadius,
            index, entry, self.getImageFromData(entry.image)
          );
        })
        .forEach(slice => {
          slice.draw(context);
          context.rotate(-radiansPerSegment);
        });
    }
    context.restore();
  }



  drawCenterCircle(context) {
    if (this.wheelConfig.type=='image') return;
    context.save();
    context.translate(context.canvas.width / 2, context.canvas.height / 2);
    context.fillStyle = 'white';
    context.beginPath();
    context.arc(0, 0, this.hubRadius, 0, Math.PI * 2);
    context.fill();
    if (this.wheelConfig.drawOutlines) {
      context.lineWidth = 2;
      context.strokeStyle = '#333333';
      context.stroke();
    }
    context.restore();
  }

  drawPointer(context) {
    if (!this.pointerImage) {
      this.pointerImage = ImageUtil.createInMemoryImage(context);
      this.drawPointerNoCache(this.pointerImage.getContext("2d"));
    }
    context.drawImage(this.pointerImage, 0, 0);
  }

  drawPointerNoCache(context) {
    context.save();
    context.translate(context.canvas.width / 2, context.canvas.height / 2);
    if (this.drawShadows) {
      context.shadowColor = '#444';
      context.shadowOffsetY = 4;
      context.shadowBlur = 10;
    }
    context.beginPath();
    context.moveTo(this.wheelRadius - 15, 0);
    context.lineTo(this.wheelRadius + 25, -20);
    context.lineTo(this.wheelRadius + 25, 20);
    context.lineTo(this.wheelRadius - 15, 0);
    if (this.wheelConfig.drawOutlines) {
      context.lineWidth = 2;
      context.strokeStyle = '#333333';
      context.stroke();
    }
    context.fillStyle = '#BBB';
    context.fill();
    context.restore();
  }

  drawCoverPlate(context) {
    if (this.displayEntries.length==this.allEntries.length) return;
    if (!this.coverPlateImage && this.displayEntries.length>0) {
      this.coverPlateImage = ImageUtil.createInMemoryImage(context);
      this.drawCoverPlateNoCache(this.coverPlateImage.getContext("2d"));
    }
    if (this.coverPlateImage) {
      context.drawImage(this.coverPlateImage, 0, 0);
    }
  }

  drawCoverPlateNoCache(context) {
    const entriesCount = this.displayEntries.length;
    const radians = Math.max(2*2*Math.PI/entriesCount, Math.PI/4);
    context.save();
    context.translate(context.canvas.width / 2, context.canvas.height / 2);
    context.scale(-1,1);
    context.shadowColor = '#444';
    context.shadowOffsetY = 4;
    context.shadowBlur = 10;
    context.lineWidth = this.wheelRadius - this.hubRadius + 10;
    const image = this.imageCache.getImage('/images/brushed-metal.png');
    context.strokeStyle = context.createPattern(image, 'repeat');
    context.beginPath();
    context.arc(0, 0, (this.wheelRadius+this.hubRadius)/2, -radians/2, radians/2);
    context.stroke();
    context.restore();
  }

  drawCenterImage(context) {
    // The center image is not drawn as part of drawWheelNoCache() because it
    // takes a few ticks to load.
    if (this.wheelConfig.type=='image') return;
    const image = this.imageCache.getImage(this.wheelConfig.getWheelImage());
    if (!image) return;
    context.save();
    context.translate(context.canvas.width/2, context.canvas.height/2);
    context.rotate(this.angle);
    context.beginPath();
    context.arc(0, 0, this.hubRadius-1, 0, Math.PI * 2, true);
    context.clip();
    context.drawImage(image, -this.hubRadius, -this.hubRadius, this.hubRadius*2, this.hubRadius*2);
    context.restore();
  }

  getImageFromData(imageData) {
    if (imageData) {
      if (!this.imageDataCache[imageData]) {
        const image = new Image();
        const self = this;
        image.onload = (function() {
          self.clearCachedWheelImage();
        });
        image.setAttribute('crossOrigin', 'anonymous');
        image.src = imageData;
        this.imageDataCache[imageData] = image;
      }
      return this.imageDataCache[imageData];
    }
  }

  clearCachedWheelImage() {
    this.wheelImage = null;
  }
}