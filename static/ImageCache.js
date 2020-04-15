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
import './images/none.png';
import './third_party/publicdomainvectors/camera.png';
import './third_party/publicdomainvectors/cat.png';
import './third_party/publicdomainvectors/dog.png';
import './third_party/publicdomainvectors/dollar-sign.png';
import './third_party/publicdomainvectors/dragon.png';

export default function ImageCache() {
  this.images = new Object();
  this.emptyImage = new Image();
  // This dataUrl is a 1x1 transparent image.
  this.emptyImage.src = 'data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw==';

  this.addImage = function(imageName) {
    this.images[imageName] = new Image();
    this.images[imageName].src = imageName;
  }

  this.getImage = function(imageName) {
    if (imageName in this.images) {
      // Do nothing.
    }
    else {
      if (imageName) this.addImage(imageName);
    }
    if (this.images[imageName] && this.images[imageName].naturalHeight > 0) {
      return this.images[imageName];
    }
    else {
      // If the image is broken, return an empty image instead,
      // to prevent Javascript errors when attempting to draw it.
      return this.emptyImage;
    }
  };

}
