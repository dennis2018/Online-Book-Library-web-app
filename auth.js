/*
   Copyright 2016, Google, Inc.
   Licensed under the Apache License, Version 2.0 (the "License");
   you may not use this file except in compliance with the License.
   You may obtain a copy of the License at
       http://www.apache.org/licenses/LICENSE-2.0
   Unless required by applicable law or agreed to in writing, software
   distributed under the License is distributed on an "AS IS" BASIS,
   WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   See the License for the specific language governing permissions and
   limitations under the License.
*/

module.exports = function(config) {

  var {google} = require('googleapis');

  function getAuthenticationUrl() {
    var client = new google.auth.OAuth2(
      config.oauth2.clientId,
      config.oauth2.clientSecret,
      config.oauth2.redirectUrl
    );
    // Use 'profile' scope to authorize fetching the user's profile
    return client.generateAuthUrl({ scope: ['profile'] });
  }

  function getUser(authorizationCode, callback) {
    var client = new google.auth.OAuth2(
      config.oauth2.clientId,
      config.oauth2.clientSecret,
      config.oauth2.redirectUrl
    );
    // With the code returned from OAuth flow, get an access token
    client.getToken(authorizationCode, function(err, tokens) {
      if (err) return callback(err);
      // Configure this Google API client to use the access token
      client.setCredentials(tokens);
      // Call the Google+ API to get the profile of the user who authenticated
      google.plus('v1').people.get({ userId: 'me', auth: client }, function(err, profile) {
        if (err) return callback(err);
        var user = {
          id: profile.data.id,
          name: profile.data.displayName,
          imageUrl: profile.data.image.url
        };
        callback(null, user);
      });
    });
  }

  return {
    getAuthenticationUrl: getAuthenticationUrl,
    getUser: getUser
  };
};
