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
const Twitter = require('twitter');

exports.getTwitterUserNames = async function(apiKey, appSecret, bearerToken, searchTerm) {
  console.log(`Searching Twitter for "${searchTerm}"`);
  const client = new Twitter({
    consumer_key: apiKey,
    consumer_secret: appSecret,
    bearer_token: bearerToken
  });
  let tweets = await getAllTweets(client, searchTerm, getDateHoursAgo(24));
  console.log(`Got ${tweets.length} tweets back`);
  let userNames = tweets.map(tweet => tweet.user.screen_name);
  userNames = getNonDuplicates(userNames);
  console.log(`Tweets came from ${userNames.length} different users`);
  userNames = userNames.map(userName => '@' + userName);
  return userNames.sort(alphabeticallyNonCaseSensitive);
}

function getDateHoursAgo(hours) {
  return new Date(new Date().getTime() - 1000 * 60 * 60 * hours);
}

function getNonDuplicates(array) {
  let retVal = [];
  array.forEach(entry => {
    if (!retVal.includes(entry)) {
      retVal.push(entry);
    }
  });
  return retVal;
}

async function getAllTweets(client, searchTerm, oldestDate) {
  console.log(`getAllTweets("${searchTerm}", "${oldestDate}") called`);
  let shouldGetNextPage = true;
  let maxId = null;
  let apiCalls = 0;
  retVal = [];
  while (shouldGetNextPage) {
    let tweets = await getPageOfTweets(client, searchTerm, maxId);
    apiCalls += 1;
    if (tweets.length < 50 || apiCalls > 5) {
      shouldGetNextPage = false;
    }
    for (let i=0; i<tweets.length; i++) {
      let tweet = tweets[i];
      if (new Date(tweet['created_at']) < oldestDate) {
        console.log(`Found tweet that was too old: ${tweet['created_at']}`);
        shouldGetNextPage = false;
        break;
      }
      else {
        retVal.push(tweet);
        maxId = tweet.id - 1;
      }
    }
    if (retVal.length > 0) {
      console.log(`Oldest tweet: ${retVal.slice(-1)[0]['created_at']}`);
    }
  }
  return retVal;
}

async function getPageOfTweets(client, searchTerm, maxId) {
  var params = {q: searchTerm, count: 100, result_type: 'recent', max_id: maxId};
  console.log('Hitting the Twitter API, params follow');
  console.log(params);
  return new Promise(function(resolve, reject) {
    client.get('search/tweets', params, function(error, result, response) {
      if (error) throw error;
      console.log(`Found ${result.statuses.length} tweets`);
      resolve(result.statuses);
    });
  });
}

function alphabeticallyNonCaseSensitive(a, b) {
  a = a.toLowerCase();
  b = b.toLowerCase();
  if (a < b) return -1;
  if (a > b) return 1;
  return 0;
}
