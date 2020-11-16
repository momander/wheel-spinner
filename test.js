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
import NameHat from './static/NameHat.js';
import CircularArray from './static/CircularArray.js';
import DisplayNamePicker from './static/DisplayNamePicker.js';
import * as Locales from './static/Locales.js';
import Path from './static/Path.js';
import * as Util from './static/Util.js';
import * as ImageUtil from './static/ImageUtil.js';


describe('NameHat', function() {
  describe('#pullRandomName()', function() {
    it('should return a name and remove it from hat', function() {
      const hat = new NameHat();
      hat.setNames(['A', 'B', 'C']);
      const name = hat.pullRandomName();
      assert.ok((name=='A' || name=='B' || name=='C'));
      assert.deepEqual(hat.numberOfNames(), 2);
    })
  })
  describe('#addName()', function() {
    it('should add name', function() {
      const hat = new NameHat();
      hat.setNames(['A', 'B', 'C']);
      hat.addName('D');
      assert.deepEqual(hat.getNames(), ['A', 'B', 'C', 'D']);
    })
  })
})

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
})

// describe('DisplayNamePicker', function() {
//   describe('#getDisplayNames()', function() {
//     it('short name list should be unchanged', function() {
//       const picker = new DisplayNamePicker();
//       picker.setNames(['A', 'B', 'C'], 48);
//       picker.tick(0);
//       assert.deepEqual(['A', 'B', 'C'], picker.getDisplayNames());
//     });
//     it('long name list should be shortened, length 4', function() {
//       const picker = new DisplayNamePicker();
//       picker.setNames(['A', 'B', 'C', 'D', 'E', 'F'], 4);
//       picker.tick(0);
//       assert.strictEqual(picker.getNumberOfDisplayNames(), 4, 'name list length');
//       assert.notEqual(picker.getDisplayNames()[0], '', 'index 0');
//       assert.notEqual(picker.getDisplayNames()[1], '', 'index 1');
//       assert.strictEqual(picker.getDisplayNames()[2], '', 'index 2');
//       assert.notEqual(picker.getDisplayNames()[3], '', 'index 3');
//     });
//     it('long name list should be shortened, length 6', function() {
//       const picker = new DisplayNamePicker();
//       picker.setNames(['A', 'B', 'C', 'D', 'E', 'F', 'G'], 6);
//       picker.tick(0);
//       assert.strictEqual(picker.getNumberOfDisplayNames(), 6, 'name list length');
//       assert.notEqual(picker.getDisplayNames()[0], '', 'index 0');
//       assert.notEqual(picker.getDisplayNames()[1], '', 'index 1');
//       assert.strictEqual(picker.getDisplayNames()[2], '', 'index 2');
//       assert.strictEqual(picker.getDisplayNames()[3], '', 'index 3');
//       assert.notEqual(picker.getDisplayNames()[4], '', 'index 4');
//       assert.notEqual(picker.getDisplayNames()[5], '', 'index 5');
//     });
//     it('should move the empty slot when wheel has moved', function() {
//       const picker = new DisplayNamePicker();
//       picker.setNames(['A', 'B', 'C', 'D', 'E', 'F', 'G'], 6);
//       picker.tick(0);
//       picker.tick(1);
//       assert.strictEqual(picker.getNumberOfDisplayNames(), 6, 'name list length');
//       assert.notEqual(picker.getDisplayNames()[0], '', 'index 0');
//       assert.notEqual(picker.getDisplayNames()[1], '', 'index 1');
//       assert.notEqual(picker.getDisplayNames()[2], '', 'index 2');
//       assert.strictEqual(picker.getDisplayNames()[3], '', 'index 3');
//       assert.strictEqual(picker.getDisplayNames()[4], '', 'index 4');
//       assert.notEqual(picker.getDisplayNames()[5], '', 'index 5');
//     });
//   });
// });

describe('Locales', function() {
  describe('#getLocale()', function() {
    it('default locale per domain', function() {
      assert.strictEqual(Locales.getLocale('localhost',        '/'), 'en');
      assert.strictEqual(Locales.getLocale('wheelofnames.com', '/'), 'en');
      assert.strictEqual(Locales.getLocale('rouesdesnoms.com', '/'), 'fr');
    })
    it('return English for unknown domains', function() {
      assert.strictEqual(Locales.getLocale('otherdomain.com', '/'), 'en');
    })
    it('path overrides domain', function() {
      assert.strictEqual(Locales.getLocale('localhost',        '/fr'), 'fr');
      assert.strictEqual(Locales.getLocale('localhost',        '/en'), 'en');
      assert.strictEqual(Locales.getLocale('localhost',        '/th'), 'th');
      assert.strictEqual(Locales.getLocale('wheelofnames.com', '/fr'), 'fr');
      assert.strictEqual(Locales.getLocale('wheelofnames.com', '/en'), 'en');
      assert.strictEqual(Locales.getLocale('wheelofnames.com', '/th'), 'th');
      assert.strictEqual(Locales.getLocale('rouesdesnoms.com', '/fr'), 'fr');
      assert.strictEqual(Locales.getLocale('rouesdesnoms.com', '/en'), 'en');
      assert.strictEqual(Locales.getLocale('rouesdesnoms.com', '/th'), 'th');
    })
    it('can inerpret three-letter locales', function() {
      assert.strictEqual(Locales.getLocale('wheelofnames.com', '/fil/'), 'fil');
    }),
    it('return English for unknown locale paths', function() {
      assert.strictEqual(Locales.getLocale('localhost',        '/xx'), 'en');
      assert.strictEqual(Locales.getLocale('wheelofnames.com', '/xx'), 'en');
      assert.strictEqual(Locales.getLocale('rouesdesnoms.com', '/xx'), 'fr');
    })
    it('path overrides domain with trailing slash', function() {
      assert.strictEqual(Locales.getLocale('localhost',        '/fr/'), 'fr');
      assert.strictEqual(Locales.getLocale('localhost',        '/en/'), 'en');
      assert.strictEqual(Locales.getLocale('localhost',        '/th/'), 'th');
      assert.strictEqual(Locales.getLocale('wheelofnames.com', '/fr/'), 'fr');
      assert.strictEqual(Locales.getLocale('wheelofnames.com', '/en/'), 'en');
      assert.strictEqual(Locales.getLocale('wheelofnames.com', '/th/'), 'th');
      assert.strictEqual(Locales.getLocale('rouesdesnoms.com', '/fr/'), 'fr');
      assert.strictEqual(Locales.getLocale('rouesdesnoms.com', '/en/'), 'en');
      assert.strictEqual(Locales.getLocale('rouesdesnoms.com', '/th/'), 'th');
    })
    it('short-links override locale in path', function() {
      assert.strictEqual(Locales.getLocale('localhost',        '/fra-123'), 'en');
      assert.strictEqual(Locales.getLocale('wheelofnames.com', '/fra-123'), 'en');
      assert.strictEqual(Locales.getLocale('wheelofnames.com', '/tha-123'), 'en');
      assert.strictEqual(Locales.getLocale('rouesdesnoms.com', '/eng-123/'), 'fr');
    })
    it('short-links and locale can co-exist in path', function() {
      assert.strictEqual(Locales.getLocale('localhost',        '/fr/abc-123'), 'fr');
      assert.strictEqual(Locales.getLocale('localhost',        '/th/abc-123'), 'th');
      assert.strictEqual(Locales.getLocale('localhost',        '/abc-123'), 'en');
      assert.strictEqual(Locales.getLocale('wheelofnames.com', '/fr/abc-123'), 'fr');
      assert.strictEqual(Locales.getLocale('wheelofnames.com', '/th/abc-123'), 'th');
      assert.strictEqual(Locales.getLocale('wheelofnames.com', '/abc-123'), 'en');
      assert.strictEqual(Locales.getLocale('rouesdesnoms.com', '/en/abc-123/'), 'en');
      assert.strictEqual(Locales.getLocale('rouesdesnoms.com', '/th/abc-123/'), 'th');
      assert.strictEqual(Locales.getLocale('rouesdesnoms.com', '/abc-123/'), 'fr');
    })
  })
  describe('#getRelativeUrl()', function() {
    it('default locale per domain', function() {
      assert.strictEqual(Locales.getRelativeUrl('localhost',        'en'), '/');
      assert.strictEqual(Locales.getRelativeUrl('wheelofnames.com', 'en'), '/');
      assert.strictEqual(Locales.getRelativeUrl('rouesdesnoms.com', 'fr'), '/');
    })
    it('override locale for domain', function() {
      assert.strictEqual(Locales.getRelativeUrl('localhost',        'fr'), '/fr/');
      assert.strictEqual(Locales.getRelativeUrl('wheelofnames.com', 'fr'), '/fr/');
      assert.strictEqual(Locales.getRelativeUrl('wheelofnames.com', 'th'), '/th/');
      assert.strictEqual(Locales.getRelativeUrl('rouesdesnoms.com', 'en'), '/en/');
    })
    it('default to English for unknown domains', function() {
      assert.strictEqual(Locales.getRelativeUrl('otherdomain.com',  'en'), '/');
      assert.strictEqual(Locales.getRelativeUrl('otherdomain.com',  'fr'), '/fr/');
      assert.strictEqual(Locales.getRelativeUrl('otherdomain.com',  'th'), '/th/');
    })
  })
  describe('#getAbsoluteUrl()', function() {
    it('default locale for domain', function() {
      assert.strictEqual(Locales.getAbsoluteUrl('wheelofnames.com', 'en', 'abc-123'), 'wheelofnames.com/abc-123');
      assert.strictEqual(Locales.getAbsoluteUrl('rouedenoms.com', 'fr', 'abc-123'), 'rouedenoms.com/abc-123');
    })
    it('non-default locale for domain', function() {
      assert.strictEqual(Locales.getAbsoluteUrl('wheelofnames.com', 'tr', 'abc-123'), 'wheelofnames.com/tr/abc-123');
      assert.strictEqual(Locales.getAbsoluteUrl('rouedenoms.com', 'en', 'abc-123'), 'rouedenoms.com/en/abc-123');
    })
  })
  describe('#getLoginLocale()', function() {
    it('Google locales', function() {
      assert.strictEqual(Locales.getLoginLocale('Google', 'en'), 'en_US');
      assert.strictEqual(Locales.getLoginLocale('Google', 'en-PI'), 'en_US');
      assert.strictEqual(Locales.getLoginLocale('Google', 'fr'), 'fr_FR');
      assert.strictEqual(Locales.getLoginLocale('Google', 'no'), 'nb_NO');
      assert.strictEqual(Locales.getLoginLocale('Google', 'tr'), 'tr_TR');
      assert.strictEqual(Locales.getLoginLocale('Google', 'vi'), 'vi_VN');
      assert.strictEqual(Locales.getLoginLocale('Google', 'zh-HK'), 'zh_TW');
      assert.strictEqual(Locales.getLoginLocale('Google', 'zh-CN'), 'zh_CN');
    })
    it('Facebook locales', function() {
      assert.strictEqual(Locales.getLoginLocale('Facebook', 'en'), 'en_US');
      assert.strictEqual(Locales.getLoginLocale('Facebook', 'en-PI'), 'en_US');
      assert.strictEqual(Locales.getLoginLocale('Facebook', 'fr'), 'fr_FR');
      assert.strictEqual(Locales.getLoginLocale('Facebook', 'no'), 'nb_NO');
      assert.strictEqual(Locales.getLoginLocale('Facebook', 'tr'), 'tr_TR');
      assert.strictEqual(Locales.getLoginLocale('Facebook', 'vi'), 'vi_VN');
      assert.strictEqual(Locales.getLoginLocale('Facebook', 'zh-HK'), 'zh_TW');
      assert.strictEqual(Locales.getLoginLocale('Facebook', 'zh-CN'), 'zh_CN');
    })
    it('Twitter locales', function() {
      assert.strictEqual(Locales.getLoginLocale('Twitter', 'en'), 'en');
      assert.strictEqual(Locales.getLoginLocale('Twitter', 'en-PI'), 'en');
      assert.strictEqual(Locales.getLoginLocale('Twitter', 'fr'), 'fr');
      assert.strictEqual(Locales.getLoginLocale('Twitter', 'no'), 'no');
      assert.strictEqual(Locales.getLoginLocale('Twitter', 'tr'), 'tr');
      assert.strictEqual(Locales.getLoginLocale('Twitter', 'vi'), 'vi');
      assert.strictEqual(Locales.getLoginLocale('Twitter', 'zh-HK'), 'zh-tw');
      assert.strictEqual(Locales.getLoginLocale('Twitter', 'zh-CN'), 'zh-cn');
    })
    it('default to US English for unknown locales', function() {
      assert.strictEqual(Locales.getLoginLocale('Google', 'xx'), 'en_US');
      assert.strictEqual(Locales.getLoginLocale('Facebook', 'xx'), 'en_US');
      assert.strictEqual(Locales.getLoginLocale('Twitter', 'xx'), 'en_US');
    })
  })
  describe('#getList()', function() {
    it('contains the default English locale', function() {
      const list = Locales.getOfficialList("https://wheelofnames.com");
      const records = list.filter(row => row.name=='en');
      assert.strictEqual(records.length, 1);
      assert.strictEqual(records[0].name, 'en');
      assert.strictEqual(records[0].url, 'https://wheelofnames.com/');
    })
    it('contains the French locale', function() {
      const list = Locales.getOfficialList("https://wheelofnames.com");
      const records = list.filter(row => row.name=='fr');
      assert.strictEqual(records.length, 1);
      assert.strictEqual(records[0].name, 'fr');
      assert.strictEqual(records[0].url, 'https://wheelofnames.com/fr/');
    })
    it('does not contain the English (Pirate) locale', function() {
      const list = Locales.getOfficialList("https://wheelofnames.com");
      const records = list.filter(row => row.name=='en-PI');
      assert.strictEqual(records.length, 0);
    })
  })
  describe('#getMessagesFileName()', function() {
    it('contains the major locales', function() {
      assert.strictEqual(Locales.getMessagesFileName('en'), 'en-US.json');
      assert.strictEqual(Locales.getMessagesFileName('th'), 'th-TH.json');
      assert.strictEqual(Locales.getMessagesFileName('fr'), 'fr-FR.json');
      assert.strictEqual(Locales.getMessagesFileName('en-PI'), 'en-PI.json');
    })
    it('return English for unknown locales', function() {
      assert.strictEqual(Locales.getMessagesFileName('xx'), 'en-US.json');
    })
  })
  describe('#getLangTipLocale()', function() {
    it('should not show if user is in the right language', function() {
      assert.strictEqual(Locales.getLangTipLocale('en', ['en-US', 'fr-FR']), '');
      assert.strictEqual(Locales.getLangTipLocale('en', ['en', 'fr']), '');
      assert.strictEqual(Locales.getLangTipLocale('fr', ['fr-FR']), '');
      assert.strictEqual(Locales.getLangTipLocale('zh-HK', ['zh-HK']), '');
    })
    it('should not show if user\'s language is not supported', function() {
      assert.strictEqual(Locales.getLangTipLocale('en', ['af_ZA']), '');
      assert.strictEqual(Locales.getLangTipLocale('en', ['my_MM']), '');
    })
    it('should show if user is in another language', function() {
      assert.strictEqual(Locales.getLangTipLocale('en', ['fr-FR']), 'fr');
      assert.strictEqual(Locales.getLangTipLocale('en', ['fr-CA']), 'fr');
      assert.strictEqual(Locales.getLangTipLocale('en', ['th-TH']), 'th');
      assert.strictEqual(Locales.getLangTipLocale('en', ['th']), 'th');
      assert.strictEqual(Locales.getLangTipLocale('en', ['sv-SE']), 'sv');
      assert.strictEqual(Locales.getLangTipLocale('fr', ['th-TH']), 'th');
      assert.strictEqual(Locales.getLangTipLocale('en', ['fr', 'en']), 'fr');
      assert.strictEqual(Locales.getLangTipLocale('en', ['pt-BR']), 'pt');
      assert.strictEqual(Locales.getLangTipLocale('en', ['zh-HK']), 'zh-HK');
      assert.strictEqual(Locales.getLangTipLocale('zh-CN', ['zh-HK']), 'zh-HK');
      assert.strictEqual(Locales.getLangTipLocale('en', ['fil-ph']), 'fil');
    })
    it('should not crash on null or empty array', function() {
      assert.strictEqual(Locales.getLangTipLocale('en', null), '');
      assert.strictEqual(Locales.getLangTipLocale('en', undefined), '');
      assert.strictEqual(Locales.getLangTipLocale('en', []), '');
    })
  })
  describe('#getNamesForAll()', function() {
    it('contains the default English locale', function() {
      const list = Locales.getNamesForAll();
      const records = list.filter(row => row.name=='en');
      assert.strictEqual(records.length, 1);
      assert.strictEqual(records[0].name, 'en');
      assert.strictEqual(records[0].humanName, 'English');
    })
    it('contains the French locale', function() {
      const list = Locales.getNamesForAll();
      const records = list.filter(row => row.name=='fr');
      assert.strictEqual(records.length, 1);
      assert.strictEqual(records[0].name, 'fr');
      assert.strictEqual(records[0].humanName, 'Français');
    })
  })
})

describe('Path', function() {
  describe('#constructor', function() {
    it('should decode root url', function() {
      const location = {host: 'wheelofnames.com', pathname: '/'};
      const path = new Path(location);
      assert.deepEqual(path.locale, 'en');
      assert.deepEqual(path.sharedWheel, '');
    })
    it('should decode locale only', function() {
      let location = {host: 'wheelofnames.com', pathname: '/sv/'};
      let path = new Path(location);
      assert.deepEqual(path.locale, 'sv');
      assert.deepEqual(path.sharedWheel, '');
      location = {host: 'wheelofnames.com', pathname: '/sv'};
      path = new Path(location);
      assert.deepEqual(path.locale, 'sv');
      assert.deepEqual(path.sharedWheel, '');
    })
    it('should decode shared wheel only', function() {
      let location = {host: 'wheelofnames.com', pathname: '/abc-123'};
      let path = new Path(location);
      assert.deepEqual(path.locale, 'en');
      assert.deepEqual(path.sharedWheel, 'abc-123');
    })
    it('should decode locale and shared wheel', function() {
      let location = {host: 'wheelofnames.com', pathname: '/es/abc-xyz'};
      let path = new Path(location);
      assert.deepEqual(path.locale, 'es');
      assert.deepEqual(path.sharedWheel, 'abc-xyz');
    })
  })
  describe('#getAbsoluteUrl', function() {
    it('should handle no locale or shared wheel', function() {
      const location = {protocol: 'https:', host: 'wheelofnames.com', pathname: '/'};
      const path = new Path(location);
      assert.deepEqual(path.getAbsoluteUrl(), 'https://wheelofnames.com/');
    })
    it('should handle prefix', function() {
      const location = {protocol: 'https:', host: 'wheelofnames.com', pathname: '/'};
      const path = new Path(location);
      path.setPathPrefix('prefix');
      assert.deepEqual(path.getAbsoluteUrl(), 'https://wheelofnames.com/prefix/');
    })
    it('should handle prefix and locale', function() {
      const location = {protocol: 'https:', host: 'wheelofnames.com', pathname: '/sv/'};
      const path = new Path(location);
      path.setPathPrefix('prefix');
      assert.deepEqual(path.getAbsoluteUrl(), 'https://wheelofnames.com/prefix/sv/');
    })
    it('should handle prefix and shared wheel', function() {
      const location = {protocol: 'https:', host: 'wheelofnames.com', pathname: '/abc-123'};
      const path = new Path(location);
      path.setPathPrefix('prefix');
      assert.deepEqual(path.getAbsoluteUrl(), 'https://wheelofnames.com/prefix/abc-123/');
    })
    it('should handle prefix, locale and shared wheel', function() {
      const location = {protocol: 'https:', host: 'wheelofnames.com', pathname: '/es/abc-123'};
      const path = new Path(location);
      path.setPathPrefix('prefix');
      assert.deepEqual(path.getAbsoluteUrl(), 'https://wheelofnames.com/prefix/es/abc-123/');
    })
  })
  describe('#getAbsoluteLocalizedRootUrl', function() {
    it('should handle no locale and shared wheel', function() {
      const location = {protocol: 'https:', host: 'wheelofnames.com', pathname: '/abc-123'};
      const path = new Path(location);
      assert.deepEqual(path.getAbsoluteLocalizedRootUrl(), 'https://wheelofnames.com/');
    })
    it('should handle locale and shared wheel', function() {
      const location = {protocol: 'https:', host: 'wheelofnames.com', pathname: '/es/abc-123'};
      const path = new Path(location);
      assert.deepEqual(path.getAbsoluteLocalizedRootUrl(), 'https://wheelofnames.com/es/');
    })
  })
})

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
  describe('#getAddedEntries()', function() {
    it('should find new entries', function() {
      const oldEntries = ['A', 'B'];
      const newEntries = ['A', 'B', 'C', 'D'];
      assert.deepEqual(['C', 'D'], Util.getAddedEntries(oldEntries, newEntries));
    })
    it('should not find new entries if there aren\'t any', function() {
      const oldEntries = ['A', 'B'];
      const newEntries = ['A', 'B'];
      assert.deepEqual([], Util.getAddedEntries(oldEntries, newEntries));
    })
    it('should handle partial overlaps', function() {
      const oldEntries = ['A', 'B'];
      const newEntries = ['B', 'C'];
      assert.deepEqual(['C'], Util.getAddedEntries(oldEntries, newEntries));
    })
    it('should handle undefined', function() {
      assert.deepEqual([], Util.getAddedEntries(undefined, undefined));
      assert.deepEqual(['A', 'B'], Util.getAddedEntries(undefined, ['A', 'B']));
      assert.deepEqual([], Util.getAddedEntries(['A', 'B'], undefined));
    })
  })
  describe('#sortWheelEntries()', function() {
    it('should sort strings', function() {
      const entries = ['E', 'A', 'b', 'C', 'Z'];
      const sortedEntries = Util.sortWheelEntries(entries);
      assert.deepStrictEqual(['A', 'b', 'C', 'E', 'Z'], sortedEntries);
    })
    it('should sort integers', function() {
      const entries = ['5', '1', '10', '20', '7'];
      const sortedEntries = Util.sortWheelEntries(entries);
      assert.deepStrictEqual(['1', '5', '7', '10', '20'], sortedEntries);
    })
    it('should sort floats', function() {
      const entries = ['5', '1.03', '10.34', '20', '1000.1', '7.0'];
      const sortedEntries = Util.sortWheelEntries(entries);
      assert.deepStrictEqual(['1.03', '5', '7.0', '10.34', '20', '1000.1'], sortedEntries);
    })
    it('should sort numbered entries', function() {
      const entries = ['5. Fifth', '1. First', '10. Tenth'];
      const sortedEntries = Util.sortWheelEntries(entries);
      assert.deepStrictEqual(['1. First', '5. Fifth', '10. Tenth'], sortedEntries);
    })
    it('should sort mixed entries', function() {
      const entries = ['d', '5', '1', 'A'];
      const sortedEntries = Util.sortWheelEntries(entries);
      assert.deepStrictEqual(['1', '5', 'A', 'd'], sortedEntries);
    })
  })
  describe('#extractDisplayText()', function() {
    it('should behave when sent nothing', function() {
      assert.strictEqual(Util.extractDisplayText('', true), '');
      assert.strictEqual(Util.extractDisplayText(undefined, true), '');
    })
    it('should do nothing with a short entry', function() {
      assert.strictEqual(Util.extractDisplayText('Martin', true), ' Martin ');
    })
    it('should shorten a long entry', function() {
      const expected = ' Stockholm Syndrom… ';
      const actual = Util.extractDisplayText('Stockholm Syndromes', true);
      assert.strictEqual(actual, expected);
    })
    it('should not shorten a long entry if not asked to', function() {
      const expected = ' Stockholm Syndromes ';
      const actual = Util.extractDisplayText('Stockholm Syndromes', false);
      assert.strictEqual(actual, expected);
    })
    it('should remove image', function() {
      const expected = ' Captain Rodney is… ';
      const imgEntry = '<img src="data:image/jpeg;base64,/9j/4AAQ" style="height:25px">Captain Rodney is an excellent drink';
      const actual = Util.extractDisplayText(imgEntry, true);
      assert.strictEqual(actual, expected);
    })
    it('should decode escape sequences', function() {
      const expected = ' <<Ron Zacapa>> ';
      const actual = Util.extractDisplayText('&lt;&lt;Ron Zacapa&gt;&gt;', true);
      assert.strictEqual(actual, expected);
    })
  })
})
