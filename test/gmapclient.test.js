/*
Copyright 2018 Globo.com

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

import { assert } from 'chai';
import GmapClient from '../src/gmapclient';

describe('GmapClient', () => {

  describe('Module initialization', () => {
    let gmapclient = null;

    before(() => {
      gmapclient = new GmapClient();
    });

    it('Main client should map default parameters as properties', () => {
      assert.property(gmapclient, 'apiUrl');
      assert.property(gmapclient, 'authUrl');
      assert.property(gmapclient, 'username');
      assert.property(gmapclient, 'password');
      assert.property(gmapclient, 'token');
      assert.property(gmapclient, 'expires');
    });

    it('Initializes with token and expires properties as null values', () => {
      assert.equal(gmapclient.token, null);
      assert.equal(gmapclient.expires, null);
    });
  });

  describe('Authentication', () => {
    it('Method checkAuth always returns a Promise', () => {
      assert.isOk(false);
    });
  });

});
