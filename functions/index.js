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
const admin = require('firebase-admin');
admin.initializeApp();

exports.createSharedWheel2 = require('./createSharedWheel2.js').func();
exports.getSharedWheel2 = require('./getSharedWheel2.js').func();
exports.logSharedWheelRead = require('./logSharedWheelRead.js').func();
exports.processSharedWheelReads = require('./processSharedWheelReads.js').func();
exports.getTwitterUserNames2 = require('./getTwitterUserNames2.js').func();
exports.convertAccount = require('./convertAccount.js').func();
exports.deleteInactiveAccounts = require('./deleteInactiveAccounts.js').func();
exports.deleteUnusedSharedWheels = require('./deleteUnusedSharedWheels.js').func();
exports.deleteUsedSharedWheels = require('./deleteUsedSharedWheels.js').func();
exports.deleteOldWheelsFromReviewQueue = require('./deleteOldWheelsFromReviewQueue.js').func();
exports.getNumberOfWheelsInReviewQueue = require('./getNumberOfWheelsInReviewQueue.js').func();
exports.translate = require('./translate.js').func();
exports.tagSuspiciousSharedWheels = require('./tagSuspiciousSharedWheels.js').func();
exports.backupFirestore = require('./backupFirestore.js').func();
exports.loadBigQuery = require('./loadBigQuery.js').func();
