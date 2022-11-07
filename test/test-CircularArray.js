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
import CircularArray from '../static/CircularArray.js';


describe('CircularArray', function() {
  describe('#getElement()', function() {
    it('elements should be unchanged when in range', function() {
      const ca = new CircularArray(['A', 'B', 'C', 'D']);
      assert.strictEqual(ca.getElement(0), 'A');
      assert.strictEqual(ca.getElement(1), 'B');
      assert.strictEqual(ca.getElement(2), 'C');
      assert.strictEqual(ca.getElement(3), 'D');
    })
    it('upper wrap-around', function() {
      const ca = new CircularArray(['A', 'B', 'C', 'D']);
      assert.strictEqual(ca.getElement(4), 'A');
      assert.strictEqual(ca.getElement(5), 'B');
      assert.strictEqual(ca.getElement(6), 'C');
      assert.strictEqual(ca.getElement(7), 'D');
    })
    it('lower wrap-around', function() {
      const ca = new CircularArray(['A', 'B', 'C', 'D']);
      assert.strictEqual(ca.getElement(-4), 'A');
      assert.strictEqual(ca.getElement(-3), 'B');
      assert.strictEqual(ca.getElement(-2), 'C');
      assert.strictEqual(ca.getElement(-1), 'D');
    })
  })
  describe('#setElement()', function() {
    it('setting element within range', function() {
      const ca = new CircularArray(['A', 'B', 'C', 'D']);
      ca.setElement(2, 'c');
      assert.strictEqual(ca.getElement(2), 'c');
    })
    it('setting element above range', function() {
      const ca = new CircularArray(['A', 'B', 'C', 'D']);
      ca.setElement(5, 'b');
      assert.strictEqual(ca.getElement(1), 'b');
    })
    it('setting element under range', function() {
      const ca = new CircularArray(['A', 'B', 'C', 'D']);
      ca.setElement(-2, 'c');
      assert.strictEqual(ca.getElement(2), 'c');
    })
  })
  describe('#slice()', function() {
    it('getting elements within range', function() {
      const ca = new CircularArray(['A', 'B', 'C', 'D']);
      assert.deepStrictEqual(ca.slice(1, 3), ['B', 'C']);
    })
    it('getting elements beyond upper bound', function() {
      const ca = new CircularArray(['A', 'B', 'C', 'D']);
      assert.deepStrictEqual(ca.slice(3, 7), ['D', 'A', 'B', 'C']);
    })
  })
  describe('#getNextElement()', function() {
    it('get element within range', function() {
      const ca = new CircularArray(['A', 'B', 'C', 'D']);
      assert.strictEqual(ca.getNextElement('B'), 'C');
    })
    it('get element after the last element', function() {
      const ca = new CircularArray(['A', 'B', 'C', 'D']);
      assert.strictEqual(ca.getNextElement('D'), 'A');
    })
    it('get right element after an element has been replaced', function() {
      const ca = new CircularArray(['A', 'B', 'C', 'D']);
      ca.setElement(1, 'b');
      assert.strictEqual(ca.getNextElement('A'), 'b');
      assert.strictEqual(ca.getNextElement('b'), 'C');
    })
  })
})
