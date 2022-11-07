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
import assert from 'assert';
import * as Filters from '../static/filters.js';


describe('Filters', function() {
  describe('#timeago()', function() {
    it('calculates difference between two times', function() {
      assert.strictEqual(Filters.timeago(new Date(2021, 7, 11, 15, 57, 30, 0),
                                         new Date(2021, 7, 11, 18, 0, 0, 0)),
                                         '2 hours ago');
    })
    it('returns a dash when there is no pastTime', function() {
      assert.strictEqual(Filters.timeago(null,
                                         new Date(2021, 7, 11, 18, 0, 0, 0)),
                                         '-');
    })
  })
  describe('#firestoremilliseconds()', function() {
    it('returns seconds', function() {
      const fs = {seconds: 2};
      assert.strictEqual(Filters.firestoremilliseconds(fs), 2000);
    })
    it('returns _seconds', function() {
      const fs = {_seconds: 3};
      assert.strictEqual(Filters.firestoremilliseconds(fs), 3000);
    })
  })
  describe('#dollaramount()', function() {
    it('formats regular amounts', function() {
      assert.strictEqual(Filters.dollaramount(2), '$ 2.00');
      assert.strictEqual(Filters.dollaramount(2.5), '$ 2.50');
    })
    it('handles non-amounts', function() {
      assert.strictEqual(Filters.dollaramount(), undefined);
      assert.strictEqual(Filters.dollaramount('abc'), undefined);
    })
  })
  describe('#localestring()', function() {
    it('formats numbers', function() {
      assert.strictEqual(Filters.localestring(2), '2');
      assert.strictEqual(Filters.localestring(2500), '2,500');
    })
    it('handles non-numbers', function() {
      assert.strictEqual(Filters.localestring(), undefined);
      assert.strictEqual(Filters.localestring('abc'), 'abc');
    })
    it('handles zero', function() {
      assert.strictEqual(Filters.localestring(0), '0');
    })
  })
  describe('#percent()', function() {
    it('formats numbers', function() {
      assert.strictEqual(Filters.percent(0), '0 %');
      assert.strictEqual(Filters.percent(0.56), '56 %');
      assert.strictEqual(Filters.percent(0.56454), '56 %');
      assert.strictEqual(Filters.percent(1), '100 %');
    })
    it('handles negative numbers', function() {
      assert.strictEqual(Filters.percent(-1), '?');
    })
    it('handles non-numbers', function() {
      assert.strictEqual(Filters.percent('abc'), '?');
      assert.strictEqual(Filters.percent(), '?');
    })
  })
})
