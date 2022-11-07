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
import * as Locales from '../static/Locales.js';


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
      const list = Locales.getNamesForAll(false);
      const records = list.filter(row => row.name=='en');
      assert.strictEqual(records.length, 1);
      assert.strictEqual(records[0].name, 'en');
      assert.strictEqual(records[0].humanName, 'English');
    })
    it('contains the French locale', function() {
      const list = Locales.getNamesForAll(false);
      const records = list.filter(row => row.name=='fr');
      assert.strictEqual(records.length, 1);
      assert.strictEqual(records[0].name, 'fr');
      assert.strictEqual(records[0].humanName, 'Français');
    })
    it('contains the French locale with a flag', function() {
      const list = Locales.getNamesForAll(true);
      const records = list.filter(row => row.name=='fr');
      assert.strictEqual(records.length, 1);
      assert.strictEqual(records[0].name, 'fr');
      assert.strictEqual(records[0].humanName, 'Français 🇫🇷 🇨🇦 🇧🇪 🇨🇭');
    })
  })
})
