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
import WheelConfig from '../static/WheelConfig.js';


describe('WheelConfig', function() {
  describe('#getTexts()', function() {
    it('returns default names', function() {
      const wc = new WheelConfig();
      assert.deepStrictEqual(wc.getTexts(),
        ['Ali', 'Beatriz', 'Charles', 'Diya', 'Eric', 'Fatima', 'Gabriel', 'Hanna']
      );
    })
    it('returns only text entries', function() {
      const wc = new WheelConfig();
      wc.entries[0] = {image: 'xyz'};
      assert.deepStrictEqual(wc.getTexts(),
        ['Beatriz', 'Charles', 'Diya', 'Eric', 'Fatima', 'Gabriel', 'Hanna']
      );
    })
    it('returns only non-empty text entries', function() {
      const wc = new WheelConfig();
      wc.entries[0] = {text: ''};
      assert.deepStrictEqual(wc.getTexts(),
        ['Beatriz', 'Charles', 'Diya', 'Eric', 'Fatima', 'Gabriel', 'Hanna']
      );
    })
  })
  describe('#getFirstText()', function() {
    it('returns the first entry text if first entry has text', function() {
      const wc = new WheelConfig();
      assert.deepStrictEqual(wc.getFirstText(), 'Ali');
    })
    it('returns the second entry text if first entry text is empty', function() {
      const wc = new WheelConfig();
      wc.entries[0] = {text: ''};
      assert.deepStrictEqual(wc.getFirstText(), 'Beatriz');
    })
    it('returns the second entry text if first entry has no text prop', function() {
      const wc = new WheelConfig();
      delete wc.entries[0].text;
      assert.deepStrictEqual(wc.getFirstText(), 'Beatriz');
    })
    it('returns empty string if no entries have text props', function() {
      const wc = new WheelConfig();
      for (const entry of wc.entries) {
        delete entry.text;
      }
      assert.deepStrictEqual(wc.getFirstText(), '');
    })
  })
})
