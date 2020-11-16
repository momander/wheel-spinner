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
const nonEnglishDomains = [ {partialName: 'noms', locale: 'fr'} ];
const locales = [
  {name: 'en', humanName: 'English',  googleName: 'en_US', twitterName: 'en', file: 'en-US.json'},
  {name: 'fr', humanName: 'Français', googleName: 'fr_FR', twitterName: 'fr', file: 'fr-FR.json'},
  {name: 'sv', humanName: 'Svenska',  googleName: 'sv_SE', twitterName: 'sv', file: 'sv-SE.json'},
]

export function getLocale(hostName, pathName) {
  return getPathLocale(pathName) || getDomainLocale(hostName);
}

export function getRelativeUrl(hostName, locale) {
  return getDomainLocale(hostName)==locale ? '/' : `/${locale}/`;
}

export function getAbsoluteUrl(hostName, locale, path) {
  const link = hostName + getRelativeUrl(hostName, locale) + '/' + path;
  return link.replace('//', '/');
}

export function getLoginLocale(providerName, locale) {
  const matchedLocales = locales.filter(l => l.name == locale);
  if (providerName.toLowerCase() == 'twitter') {
    return matchedLocales.reduce((acc, current) => current.twitterName, 'en_US');
  }
  else {
    return matchedLocales.reduce((acc, current) => current.googleName, 'en_US');
  }
}

export function getOfficialList(hostName) {
  return locales.map(l => {
    return {
      name: l.name,
      url: hostName + getRelativeUrl(hostName, l.name)
    }
  }).filter(l => l.name!='en-PI');
}

export function getMessagesFileName(locale) {
  return locales.filter(l => l.name==locale)
                .reduce((acc, current) => current.file, 'en-US.json');
}

export function getLangTipLocale(systemLocale, navigatorLanguages) {
  if (!navigatorLanguages || !navigatorLanguages.length) return '';
  const userLocale = navigatorLanguages[0];
  const shouldShowLanguageTip = (!areSameLocale(userLocale, systemLocale) &&
                                 localeIsSupported(userLocale));
  return shouldShowLanguageTip ? getClosestSupportedLocale(userLocale) : '';
}

export function getNamesForAll() {
  return locales
           .map(locale => ({name: locale.name, humanName: locale.humanName}))
           .sort((a, b) => a.humanName.localeCompare(b.humanName))
}

export function getDomainLocale(hostName) {
  return nonEnglishDomains
            .filter(domain => hostName.includes(domain.partialName))
            .reduce((acc, current) => current.locale, 'en');
}

function areSameLocale(locale1, locale2) {
  if (locale1.length==locale2.length) {
    return (locale1 == locale2);
  }
  else {
    return (getLangFromLocale(locale1) == getLangFromLocale(locale2));
  }
}

function getLangFromLocale(locale) {
  return locale.split('-')[0];
}

function localeIsSupported(locale) {
  return !!locales.find(l => areSameLocale(locale, l.name));
}

function getClosestSupportedLocale(locale) {
  return locales.find(l => areSameLocale(locale, l.name)).name;
}

function getPathLocale(pathName) {
  return locales
            .map(locale => locale.name)
            .find(locale => {
              const re1 = new RegExp(`\\/${locale}\\/?$`);
              const re2 = new RegExp(`\\/${locale}\\/`);
              return (pathName.match(re1) || pathName.match(re2));
            })
}
