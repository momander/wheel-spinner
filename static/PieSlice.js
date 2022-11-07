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
import * as ImageUtil from './ImageUtil.js';

export default class PieSlice {

  constructor(wheelConfig, radians, wheelRadius, hubRadius, index, entry, image) {
    this.wheelConfig = wheelConfig;
    this.radians = radians;
    this.wheelRadius = wheelRadius;
    this.hubRadius = hubRadius;
    this.displayText = Util.shortenText(entry.text);
    this.customBackgoundColor = entry.color;
    this.image = image;
    const colors = this.wheelConfig.getCoalescedColors();
    this.color = colors[index % colors.length];
    this.wheelImages = {};
  }

  draw(context) {
    if (!this.displayText && !this.image && !this.customBackgoundColor) return;
    context.save();
    if (this.wheelConfig.type=='image') {
      this.drawImageWheelSlice(context);
    }
    if (this.wheelConfig.type=='color') {
      if (this.image) {
        const topLeftColor = ImageUtil.getTopLeftColor(this.image);
        if (ImageUtil.isTransparent(topLeftColor)) {
          this.drawColorWheelWithTransparentImage(context);
        }
        else {
          this.drawColorWheelWithRegularImage(context);
        }
      }
      else {
        this.drawColorWheelWithNoImage(context);
      }
    }
    context.restore();
  }

  drawImageWheelSlice(context) {
    drawImage(context, this.radians/2, this.wheelRadius, this.hubRadius, this.image);
    const textColor = {fill: 'white', outline: 'black'};
    drawText(context, this.wheelRadius, this.displayText, textColor);
    drawBorder(context, this.wheelConfig.drawOutlines, this.wheelRadius, this.radians);
  }

  drawColorWheelWithNoImage(context) {
    let textColor;
    if (this.customBackgoundColor) {
      drawBackColor(context, this.wheelRadius, this.radians, this.customBackgoundColor);
      textColor = {fill: getTextColor(this.customBackgoundColor), outline: ''};
    }
    else {
      drawBackColor(context, this.wheelRadius, this.radians, this.color);
      textColor = {fill: getTextColor(this.color), outline: ''};
    }
    drawText(context, this.wheelRadius, this.displayText, textColor);
    drawBorder(context, this.wheelConfig.drawOutlines, this.wheelRadius, this.radians);
  }

  drawColorWheelWithTransparentImage(context) {
    if (this.customBackgoundColor) {
      drawBackColor(context, this.wheelRadius, this.radians, this.customBackgoundColor);
    }
    else {
      drawBackColor(context, this.wheelRadius, this.radians, this.color);
    }
    drawImage(context, this.radians/2, this.wheelRadius, this.hubRadius, this.image);
    const textColor = {fill: 'white', outline: 'black'};
    drawText(context, this.wheelRadius, this.displayText, textColor);
    drawBorder(context, this.wheelConfig.drawOutlines, this.wheelRadius, this.radians);
  }

  drawColorWheelWithRegularImage(context) {
    if (this.customBackgoundColor) {
      drawBackColor(context, this.wheelRadius, this.radians, this.customBackgoundColor);
    }
    else {
      const imgBgColor = ImageUtil.getTopLeftColor(this.image);
      drawBackColor(context, this.wheelRadius, this.radians, imgBgColor);
    }
    drawImage(context, this.radians/2, this.wheelRadius, this.hubRadius, this.image);
    const textColor = {fill: 'white', outline: 'black'};
    drawText(context, this.wheelRadius, this.displayText, textColor);
    drawBorder(context, this.wheelConfig.drawOutlines, this.wheelRadius, this.radians);
  }

}

function drawBackColor(context, radius, radians, color) {
  context.beginPath();
  context.moveTo(0, 0);
  context.arc(0, 0, radius, -radians/2, radians/2);
  context.lineTo(0, 0);
  context.fillStyle = color;
  context.fill();
}

function drawTriangleBackColor(context, radius, radians, color) {
  context.beginPath();
  context.moveTo(0, 0);
  context.lineTo(radius*Math.cos(radians/2), -(radius*Math.sin(radians/2)));
  context.lineTo(radius*Math.cos(radians/2), radius*Math.sin(radians/2));
  context.lineTo(0, 0);
  context.fillStyle = color;
  context.fill();
}

function drawText(context, radius, displayText, textColor) {
  context.lineJoin = 'round';
  context.textBaseline = 'middle';
  context.textAlign = 'end';
  if (textColor.outline) {
    context.lineWidth = 4;
    context.strokeStyle = textColor.outline;
    context.strokeText(` ${displayText} `, radius, 0);
  }
  context.fillStyle = textColor.fill;
  context.fillText(` ${displayText} `, radius, 0);
}

function drawBorder(context, drawOutlines, radius, radians) {
  if (!drawOutlines) return;
  context.beginPath();
  context.moveTo(0, 0);
  context.arc(0, 0, radius, -radians/2, radians/2);
  context.lineTo(0, 0);
  context.lineWidth = 1;
  context.strokeStyle = '#333333';
  context.stroke();
}

function drawImage(context, a, r, b, image) {
  if (!image) return;
  let p = getImagePos(a, r, b, image.height/image.width);
  context.drawImage(image, p.x, p.y, p.w, p.h);
}

function getImagePos(a, r, b, imageRatio) {
  let w, h;
  for (w=r; w>0; w--) {
    h = w * imageRatio;
    if (Util.boxFits(a, r, b, w, h)) {
      break;
    }
  }
  return {
    x: Math.max(h*Math.cos(a)/(2*Math.sin(a)), b),
    y: -h/2,
    w: w,
    h: h
  }
}

function getTextColor(bgColor) {
  if (!bgColor) return '#000000';
  let color = (bgColor.charAt(0) === '#') ? bgColor.substring(1, 7) : bgColor;
  let r = parseInt(color.substring(0, 2), 16);
  let g = parseInt(color.substring(2, 4), 16);
  let b = parseInt(color.substring(4, 6), 16);
  let uicolors = [r / 255, g / 255, b / 255];
  let c = uicolors.map((col) => {
    if (col <= 0.03928) {
      return col / 12.92;
    }
    return Math.pow((col + 0.055) / 1.055, 2.4);
  });
  let L = (0.2126 * c[0]) + (0.7152 * c[1]) + (0.0722 * c[2]);
  if (L > 0.179) {
    return '#000000';
  }
  else 
  {
    return '#FFFFFF';
  }
}
