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
import * as Util from '../static/Util.js';


describe('Util', function() {
  describe('#sanitizeWheelTitle()', function() {
    it('should shorten long titles', function() {
      const longTitle =  'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Praesent mollis velit at neque feugiat, sed lacinia est feugiat.';
      const shortTitle = 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Praesent mollis velit at neque feugiat, ...';
      assert.deepEqual(Util.sanitizeWheelTitle(longTitle), shortTitle);
    })
    it('should leave short titles unchanged', function() {
      assert.deepEqual(Util.sanitizeWheelTitle('My wheel.'), 'My wheel.');
    })
    it('should add space to single dot', function() {
      assert.deepEqual(Util.sanitizeWheelTitle('.'), '. ');
    })
    it('should add space to double dots', function() {
      assert.deepEqual(Util.sanitizeWheelTitle('..'), '.. ');
    })
    it('should return ? if title is empty', function() {
      assert.deepEqual(Util.sanitizeWheelTitle(''), '?');
    })
    it('should replace / with \\', function() {
      assert.deepEqual(Util.sanitizeWheelTitle('Yes/No/Maybe'), 'Yes\\No\\Maybe');
    })
  })
  describe('#browserIsIEOrOldEdge()', function() {
    it('should detect IE', function() {
      const ie1 = 'Mozilla/5.0 (Windows NT 6.1; WOW64; Trident/7.0; rv:11.0) like Gecko';
      assert.equal(true, Util.browserIsIEOrOldEdge(ie1));
      const ie2 = 'Mozilla/4.0 (compatible; MSIE 9.0; Windows NT 6.1; 125LA; .NET CLR 2.0.50727; .NET CLR 3.0.04506.648; .NET CLR 3.5.21022)';
      assert.equal(true, Util.browserIsIEOrOldEdge(ie2));
    })
    it('should detect old Edge', function() {
      const oldEdge = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/64.0.3282.140 Safari/537.36 Edge/18.17763';
      assert.equal(true, Util.browserIsIEOrOldEdge(oldEdge));
    })
    it('should not detect new Edge', function() {
      const newEdge = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/80.0.3987.106 Safari/537.36 Edg/80.0.361.50';
      assert.equal(false, Util.browserIsIEOrOldEdge(newEdge));
    })
    it('should not detect Chrome', function() {
      const chrome = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_14_6) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/80.0.3987.100 Safari/537.36';
      assert.equal(false, Util.browserIsIEOrOldEdge(chrome));
    })
    it('should not detect Safari', function() {
      const safari = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_14_6) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/13.0.5 Safari/605.1.15';
      assert.equal(false, Util.browserIsIEOrOldEdge(safari));
    })
    it('should not crash on null', function() {
      assert.equal(false, Util.browserIsIEOrOldEdge());
    })
  })
  describe('#browserIsIeOnWindowsRtTablet()', function() {
    it('should detect IE on Win RT Tablet', function() {
      const ie1 = 'Mozilla/5.0 (Windows NT 10.0; WOW64; Trident/7.0; Touch; .NET4.0C; .NET4.0E; Tablet PC 2.0; rv 11.0) like Gecko';
      assert.equal(Util.browserIsIeOnWindowsRtTablet(ie1), true);
      const ie2 = 'Mozilla/5.0 (Windows NT 10.0; WOW64; Trident/7.0; Touch; .NET4.0C; .NET4.0E; .NET CLR 2.0.50727; .NET CLR 3.0.30729; .NET CLR 3.5.30729; Tablet PC 2.0; InfoPath.3; rv:11.0) like Gecko';
      assert.equal(Util.browserIsIeOnWindowsRtTablet(ie2), true);
    })
    it('should not detect old Edge', function() {
      const oldEdge = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/64.0.3282.140 Safari/537.36 Edge/18.17763';
      assert.equal(Util.browserIsIeOnWindowsRtTablet(oldEdge), false);
    })
    it('should not detect new Edge', function() {
      const newEdge = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/80.0.3987.106 Safari/537.36 Edg/80.0.361.50';
      assert.equal(Util.browserIsIeOnWindowsRtTablet(newEdge), false);
    })
    it('should not detect Chrome', function() {
      const chrome = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_14_6) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/80.0.3987.100 Safari/537.36';
      assert.equal(Util.browserIsIeOnWindowsRtTablet(chrome), false);
    })
    it('should not detect Safari', function() {
      const safari = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_14_6) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/13.0.5 Safari/605.1.15';
      assert.equal(Util.browserIsIEOrOldEdge(safari), false);
    })
    it('should not crash on null', function() {
      assert.equal(Util.browserIsIeOnWindowsRtTablet(), false);
    })
  })
  describe('#sortWheelEntries()', function() {
    it('should sort strings', function() {
      const entriesIn = [
        {text: 'E'},
        {text: 'A'},
        {text: 'b'},
        {text: 'C'},
        {text: 'Z'}
      ];
      const entriesOut = Util.sortWheelEntries(entriesIn);
      const expectedEntries = [
        {text: 'A'},
        {text: 'b'},
        {text: 'C'},
        {text: 'E'},
        {text: 'Z'}
      ];
      assert.deepStrictEqual(expectedEntries, entriesOut);
    })
    it('should sort integers', function() {
      const entriesIn = [
        {text: '5'},
        {text: '1'},
        {text: '10'},
        {text: '20'},
        {text: '7'}
      ];
      const entriesOut = Util.sortWheelEntries(entriesIn);
      const expectedEntries = [
        {text: '1'},
        {text: '5'},
        {text: '7'},
        {text: '10'},
        {text: '20'},
      ];
      assert.deepStrictEqual(expectedEntries, entriesOut);
    })
    it('should sort floats', function() {
      const entriesIn = [
        {text: '5'},
        {text: '1.03'},
        {text: '10.34'},
        {text: '20'},
        {text: '1000.1'},
        {text: '7.0'},
      ];
      const entriesOut = Util.sortWheelEntries(entriesIn);
      const expectedEntries = [
        {text: '1.03'},
        {text: '5'},
        {text: '7.0'},
        {text: '10.34'},
        {text: '20'},
        {text: '1000.1'},
      ];
      assert.deepStrictEqual(expectedEntries, entriesOut);
    })
    it('should sort numbered entries', function() {
      const entriesIn = [
        {text: '5. Fifth'},
        {text: '1. First'},
        {text: '10. Tenth'},
      ];
      const entriesOut = Util.sortWheelEntries(entriesIn);
      const expectedEntries = [
        {text: '1. First'},
        {text: '5. Fifth'},
        {text: '10. Tenth'},
      ];
      assert.deepStrictEqual(expectedEntries, entriesOut);
    })
    it('should sort mixed entries', function() {
      const entriesIn = [
        {text: 'd'},
        {text: '5'},
        {text: '1'},
        {text: 'A'},
      ];
      const entriesOut = Util.sortWheelEntries(entriesIn);
      const expectedEntries = [
        {text: '1'},
        {text: '5'},
        {text: 'A'},
        {text: 'd'},
      ];
      assert.deepStrictEqual(expectedEntries, entriesOut);
    })
    it('should sort missing text entries', function() {
      const entriesIn = [
        {text: 'd'},
        {image: 'sdfjeiv'},
        {text: '1'},
      ];
      const entriesOut = Util.sortWheelEntries(entriesIn);
      const expectedEntries = [
        {image: 'sdfjeiv'},
        {text: '1'},
        {text: 'd'},
      ];
      assert.deepStrictEqual(expectedEntries, entriesOut);
    })
  })
  describe('#addIdsIfNotThere()', function() {
    it('should add IDs for elements which do not have them', function() {
      const entriesIn = [
        {text: 'A', id: '123'},
        {text: 'B'},
        {text: 'C'},
        {text: 'D', id: '456'},
      ];
      const entriesOut = Util.addIdsIfNotThere(entriesIn);
      assert.strictEqual(entriesOut[0].id, '123');
      assert.strictEqual(entriesOut[1].id.length, 10);
      assert.strictEqual(entriesOut[2].id.length, 10);
      assert.strictEqual(entriesOut[3].id, '456');
    })
    it('does not crash with bad input params', function() {
      assert.deepStrictEqual(Util.addIdsIfNotThere([]), []);
      assert.deepStrictEqual(Util.addIdsIfNotThere(), []);
      assert.deepStrictEqual(Util.addIdsIfNotThere(null), []);
      assert.deepStrictEqual(Util.addIdsIfNotThere('abc'), []);
      assert.deepStrictEqual(Util.addIdsIfNotThere(123), []);
    })
  })
  describe('#renderEntry()', function() {
    it('should render text by itself', function() {
      const entry = {text: 'abc'};
      const expectedHtml = '<div>abc</div>';
      assert.strictEqual(Util.renderEntry(entry), expectedHtml);
    })
    it('should render text with image', function() {
      const entry = {text: 'def', image: 'image-data'};
      const expectedHtml = '<div><img src="image-data" style="height:25px" style="font-size:1rem;">def</div>';
      assert.strictEqual(Util.renderEntry(entry), expectedHtml);
    })
    it('should render image by itself', function() {
      const entry = {image: 'image-data'};
      const expectedHtml = '<div><img src="image-data" style="height:25px" style="font-size:1rem;"></div>';
      assert.strictEqual(Util.renderEntry(entry), expectedHtml);
    })
    it('should render empty entries', function() {
      const entry = {};
      const expectedHtml = '<div></div>';
      assert.strictEqual(Util.renderEntry(entry), expectedHtml);
    })
    it('should not crash with bad input params', function() {
      const expectedHtml = '<div></div>';
      assert.strictEqual(Util.renderEntry(), expectedHtml);
      assert.strictEqual(Util.renderEntry('abc'), expectedHtml);
      assert.strictEqual(Util.renderEntry(123), expectedHtml);
    })
  })
  describe('#getOccurences()', function() {
    it('should count text entries', function() {
      const texts = ['A', 'A', 'A', 'B'];
      assert.strictEqual(Util.getOccurences(texts, 'A'), 3);
      assert.strictEqual(Util.getOccurences(texts, 'B'), 1);
      assert.strictEqual(Util.getOccurences(texts, 'C'), 0);
    })
    it('should return zero when sought text is undefined', function() {
      const texts = ['A', 'A', 'A', 'B'];
      let undef;
      assert.strictEqual(Util.getOccurences(texts, undef), 0);
    })
  })
  describe('#getIndexAtPointer()', function() {
    it('should handle a basic wheel with two entries', function() {
      const entries = [
        {text: 'A'},
        {text: 'B'},
      ]
      const epsilon = 0.000001;
      assert.strictEqual(Util.getIndexAtPointer(entries, 0), 0);
      assert.strictEqual(Util.getIndexAtPointer(entries, Math.PI/4), 0);
      assert.strictEqual(Util.getIndexAtPointer(entries, Math.PI/2+epsilon), 1);
      assert.strictEqual(Util.getIndexAtPointer(entries, 3*Math.PI/4), 1);
      assert.strictEqual(Util.getIndexAtPointer(entries, Math.PI), 1);
      assert.strictEqual(Util.getIndexAtPointer(entries, 5*Math.PI/4), 1);
      assert.strictEqual(Util.getIndexAtPointer(entries, 3*Math.PI/2+epsilon), 0);
      assert.strictEqual(Util.getIndexAtPointer(entries, 7*Math.PI/4), 0);
    })
    it('should handle a basic wheel with four entries', function() {
      const entries = [
        {text: 'A'},
        {text: 'B'},
        {text: 'C'},
        {text: 'D'},
      ]
      const epsilon = 0.000001;
      assert.strictEqual(Util.getIndexAtPointer(entries, 0), 0);
      assert.strictEqual(Util.getIndexAtPointer(entries, Math.PI/4-epsilon), 0);
      assert.strictEqual(Util.getIndexAtPointer(entries, Math.PI/4+epsilon), 1);
      assert.strictEqual(Util.getIndexAtPointer(entries, Math.PI/2), 1);
      assert.strictEqual(Util.getIndexAtPointer(entries, 3*Math.PI/4-epsilon), 1);
      assert.strictEqual(Util.getIndexAtPointer(entries, 3*Math.PI/4+epsilon), 2);
      assert.strictEqual(Util.getIndexAtPointer(entries, Math.PI), 2);
      assert.strictEqual(Util.getIndexAtPointer(entries, 5*Math.PI/4-epsilon), 2);
      assert.strictEqual(Util.getIndexAtPointer(entries, 5*Math.PI/4+epsilon), 3);
      assert.strictEqual(Util.getIndexAtPointer(entries, 3*Math.PI/2), 3);
      assert.strictEqual(Util.getIndexAtPointer(entries, 7*Math.PI/4-epsilon), 3);
      assert.strictEqual(Util.getIndexAtPointer(entries, 7*Math.PI/4+epsilon), 0);
    })
    it('should handle two equal slices', function() {
      const entries = [
        {text: 'A', weight: 1},
        {text: 'B', weight: 1},
      ]
      const epsilon = 0.000001;
      assert.strictEqual(Util.getIndexAtPointer(entries, 0), 0);
      assert.strictEqual(Util.getIndexAtPointer(entries, Math.PI/4), 0);
      assert.strictEqual(Util.getIndexAtPointer(entries, Math.PI/2+epsilon), 1);
      assert.strictEqual(Util.getIndexAtPointer(entries, 3*Math.PI/4), 1);
      assert.strictEqual(Util.getIndexAtPointer(entries, Math.PI), 1);
      assert.strictEqual(Util.getIndexAtPointer(entries, 5*Math.PI/4), 1);
      assert.strictEqual(Util.getIndexAtPointer(entries, 3*Math.PI/2+epsilon), 0);
      assert.strictEqual(Util.getIndexAtPointer(entries, 7*Math.PI/4), 0);
    })
    it('should handle three equal slices', function() {
      const entries = [
        {text: 'A', weight: 1},
        {text: 'B', weight: 1},
        {text: 'C', weight: 1},
      ]
      const epsilon = 0.000001;
      assert.strictEqual(Util.getIndexAtPointer(entries, 0), 0);
      assert.strictEqual(Util.getIndexAtPointer(entries, Math.PI/6), 0);
      assert.strictEqual(Util.getIndexAtPointer(entries, Math.PI/3+epsilon), 1);
      assert.strictEqual(Util.getIndexAtPointer(entries, 2*Math.PI/3), 1);
      assert.strictEqual(Util.getIndexAtPointer(entries, Math.PI+epsilon), 2);
      assert.strictEqual(Util.getIndexAtPointer(entries, 3*Math.PI/2), 2);
      assert.strictEqual(Util.getIndexAtPointer(entries, 5*Math.PI/3+epsilon), 0);
    })
    it('should handle two unequal slices', function() {
      const entries = [
        {text: 'A', weight: 2},
        {text: 'B', weight: 1},
      ]
      const epsilon = 0.000001;
      assert.strictEqual(Util.getIndexAtPointer(entries, 0), 0);
      assert.strictEqual(Util.getIndexAtPointer(entries, Math.PI/2), 0);
      assert.strictEqual(Util.getIndexAtPointer(entries, 2*Math.PI/3+epsilon), 1);
      assert.strictEqual(Util.getIndexAtPointer(entries, 4*Math.PI/3-epsilon), 1);
      assert.strictEqual(Util.getIndexAtPointer(entries, 4*Math.PI/3+epsilon), 0);
      assert.strictEqual(Util.getIndexAtPointer(entries, 3*Math.PI/2), 0);
    })
    it('should handle three unequal slices', function() {
      const entries = [
        {text: 'A', weight: 3},
        {text: 'B', weight: 2},
        {text: 'C', weight: 1},
      ]
      const epsilon = 0.000001;
      assert.strictEqual(Util.getIndexAtPointer(entries, 0), 0);
      assert.strictEqual(Util.getIndexAtPointer(entries, Math.PI/2-epsilon), 0);
      assert.strictEqual(Util.getIndexAtPointer(entries, Math.PI/2+epsilon), 1);
      assert.strictEqual(Util.getIndexAtPointer(entries, Math.PI), 1);
      assert.strictEqual(Util.getIndexAtPointer(entries, 4*Math.PI/3+epsilon), 2);
      assert.strictEqual(Util.getIndexAtPointer(entries, 3*Math.PI/2-epsilon), 2);
      assert.strictEqual(Util.getIndexAtPointer(entries, 7*Math.PI/4), 0);
    })
  })
  describe('#entryIsDuplicate()', function() {
    it('should handle a wheel with no duplicates', function() {
      const entries = [
        {text: 'A', id: 'abc'},
        {text: 'B', id: 'def'},
        {text: 'C', id: 'ghi'}
      ]
      for (let entry of entries) {
        assert.strictEqual(Util.entryIsDuplicate(entries, entry), false);
      }
    })
    it('should handle a wheel with one duplicate', function() {
      const entries = [
        {text: 'A', id: 'abc'},
        {text: 'B', id: 'def'},
        {text: 'C', id: 'ghi'},
        {text: 'A', id: 'jkl'},
        {text: 'D', id: 'mno'},
      ]
      assert.strictEqual(Util.entryIsDuplicate(entries, entries[0]), false);
      assert.strictEqual(Util.entryIsDuplicate(entries, entries[1]), false);
      assert.strictEqual(Util.entryIsDuplicate(entries, entries[2]), false);
      assert.strictEqual(Util.entryIsDuplicate(entries, entries[3]), true);
      assert.strictEqual(Util.entryIsDuplicate(entries, entries[4]), false);
    })
    it('should handle a wheel with multiple duplicates', function() {
      const entries = [
        {text: 'A', id: 'abc'},
        {text: 'B', id: 'def'},
        {text: 'C', id: 'ghi'},
        {text: 'B', id: 'jkl'},
        {text: 'D', id: 'mno'},
        {text: 'B', id: 'pqr'},
        {text: 'B', id: 'stu'}
      ]
      assert.strictEqual(Util.entryIsDuplicate(entries, entries[0]), false);
      assert.strictEqual(Util.entryIsDuplicate(entries, entries[1]), false);
      assert.strictEqual(Util.entryIsDuplicate(entries, entries[2]), false);
      assert.strictEqual(Util.entryIsDuplicate(entries, entries[3]), true);
      assert.strictEqual(Util.entryIsDuplicate(entries, entries[4]), false);
      assert.strictEqual(Util.entryIsDuplicate(entries, entries[5]), true);
      assert.strictEqual(Util.entryIsDuplicate(entries, entries[6]), true);
    })
  })
  describe('#escapeHtml()', function() {
    it('should return plain text unchanged', function() {
      assert.strictEqual(Util.escapeHtml('Lorem ipsum'), 'Lorem ipsum');
    })
    it('should escape HTML', function() {
      assert.strictEqual(Util.escapeHtml('Hi <b>Bob</b>'), 'Hi &lt;b&gt;Bob&lt;/b&gt;');
      assert.strictEqual(Util.escapeHtml('Hi "Bob"'), 'Hi &quot;Bob&quot;');
      assert.strictEqual(Util.escapeHtml('M&M&M'), 'M&amp;M&amp;M');
      assert.strictEqual(Util.escapeHtml('O\'Doul\'s'), 'O&#039;Doul&#039;s');
    })
  })
  describe('#unescapeHtml()', function() {
    it('should return plain text unchanged', function() {
      assert.strictEqual(Util.unescapeHtml('Lorem ipsum'), 'Lorem ipsum');
    })
    it('should unescape HTML', function() {
      const tests = ['Hi <b>Bob</b>', 'Hi "Bob"', 'M&M&M', 'O\'Doul\'s'];
      for (const test of tests) {
        assert.strictEqual(Util.unescapeHtml(Util.escapeHtml(test)), test);
      }
      assert.strictEqual(Util.unescapeHtml('Hi&nbsp;there'), 'Hi there');
    })
  })
  describe('#removeHtml()', function() {
    it('should return plain text unchanged', function() {
      assert.strictEqual(Util.removeHtml('Lorem ipsum'), 'Lorem ipsum');
    })
    it('should remove HTML tags', function() {
      assert.strictEqual(Util.removeHtml('Hi <b>Bob</b>'), 'Hi Bob');
    })
  })
  describe('#getEntriesFromHtml()', function() {
    it('should return text entries in <div> elements, ignoring <br>, <span...>, <div...>', function() {
      const html = '<div>Ali</div>' +
        '<div><span style="color:#ddd">Beatriz</span></div>' +
        '<div>Charles<br></div>' +
        '<div><div style="user-select: auto;">Diya</div></div>';
      const entries = [
        {text: 'Ali'},
        {text: 'Beatriz'},
        {text: 'Charles'},
        {text: 'Diya'}
      ];
      assert.deepEqual(Util.getEntriesFromHtml(html), entries);
    })
    it('should decode encoded HTML tags', function() {
      const html = '<div>&lt;b&gt;Ali&lt;/b&gt;</div>' +
        '<div>Beatriz</div>' +
        '<div>Charles<br></div>';
      const entries = [
        {text: '<b>Ali</b>'},
        {text: 'Beatriz'},
        {text: 'Charles'}
      ];
      assert.deepEqual(Util.getEntriesFromHtml(html), entries);
    })
    it('should return text entries in <p> elements, ignoring <br> and <span...>', function() {
      const html = '<p>Ali</p>' +
        '<p><span style="color:#ddd">Beatriz</span></p>' +
        '<p>Charles<br></p>';
      const entries = [
        {text: 'Ali'},
        {text: 'Beatriz'},
        {text: 'Charles'}
      ];
      assert.deepEqual(Util.getEntriesFromHtml(html), entries);
    })
    it('should return text entries in <div> elements, ignoring <br...>', function() {
      const html = '<div>Ali</div>' +
        '<div>Beatriz<br style="user-select: auto;"></div>' +
        '<div>Charles<br></div>';
      const entries = [
        {text: 'Ali'},
        {text: 'Beatriz'},
        {text: 'Charles'}
      ];
      assert.deepEqual(Util.getEntriesFromHtml(html), entries);
    })
    it('should return text and image entries in <div> elements', function() {
      const html = '<div>Ali<img src="data:image/jpeg;base64,image1" style="font-family: BlinkMacSystemFont, &quot;Segoe UI&quot;, sans-serif; font-size: 1rem; height: 25px;"></div>' +
        '<div>Beatriz</div>' +
        '<div><img src="data:image/png;base64,image2" style="font-family: BlinkMacSystemFont, &quot;Segoe UI&quot;, sans-serif; font-size: 1rem; height: 25px;"></div>';
      const entries = [
        {text: 'Ali', image: 'data:image/jpeg;base64,image1'},
        {text: 'Beatriz'},
        {image: 'data:image/png;base64,image2'}
      ];
      assert.deepEqual(Util.getEntriesFromHtml(html), entries);
    })
    it('should not return HTML when <div> elements are nested in Firefox', function() {
      const html = '<div>Ali</div><div>Beatriz</div><div>Charles</div>' +
                   '<div>Diya</div><div>Eric</div><div>Fatima</div>' +
                   '<div><div><img src="data:image/png;base64,image1" style="height:25px"></div>' +
                   'Gabriel</div><div>Hanna</div><div><br></div>';
      const entries = [
        {text: 'Ali'},
        {text: 'Beatriz'},
        {text: 'Charles'},
        {text: 'Diya'},
        {text: 'Eric'},
        {text: 'Fatima'},
        {image: 'data:image/png;base64,image1'},
        {text: 'Gabriel'},
        {text: 'Hanna'}
      ];
      assert.deepEqual(Util.getEntriesFromHtml(html), entries);
    })
    it('should not return HTML comments', function() {
      const html = '<div><!-- StartFragment -->Ali<!-- EndFragment --></div>' +
                   '<div>Beatriz</div>';
      const entries = [
        {text: 'Ali'},
        {text: 'Beatriz'},
      ];
      assert.deepEqual(Util.getEntriesFromHtml(html), entries);
    })
  })
})
