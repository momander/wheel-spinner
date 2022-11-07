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
import CircularCounter from '../static/CircularCounter.js';


describe('CircularCounter', function() {
  describe('isDone()', function() {
    it('should count up in simple loop', function() {
      const cc = new CircularCounter(3, 6, 10);
      assert.strictEqual(cc.isDone(), false);
      assert.strictEqual(cc.getIndex(), 3);
      cc.increment();
      assert.strictEqual(cc.isDone(), false);
      assert.strictEqual(cc.getIndex(), 4);
      cc.increment();
      cc.increment();
      assert.strictEqual(cc.isDone(), true);
      assert.strictEqual(cc.getIndex(), 6);
    })
    it('should count up and wrap around', function() {
      const cc = new CircularCounter(8, 1, 10);
      assert.strictEqual(cc.isDone(), false);
      assert.strictEqual(cc.getIndex(), 8);
      cc.increment();
      assert.strictEqual(cc.isDone(), false);
      assert.strictEqual(cc.getIndex(), 9);
      cc.increment();
      assert.strictEqual(cc.isDone(), false);
      assert.strictEqual(cc.getIndex(), 0);
      cc.increment();
      assert.strictEqual(cc.isDone(), true);
      assert.strictEqual(cc.getIndex(), 1);
    })
  })
})
