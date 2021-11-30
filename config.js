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

module.exports = {
  projectId: '[your Google Developers Console project ID]',
  keyFilename: './key.json',
  bucketName: '[your Google Cloud Storage bucket name]',
  cookieSecret: '[cookie signing key]',
  oauth2: {
    clientId: '[Client ID for web application credentials]',
    clientSecret: '[Client Secret for web application credentials]',
    redirectUrl: process.env.REDIRECT_URL || 'http://localhost:8080/oauth2callback'
  }
};
