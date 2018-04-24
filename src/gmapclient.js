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

import axios from 'axios';

export default class GmapClient {

  constructor(options={}) {
    let {
      apiUrl = process.env.GMAP_API_URL,
      username = process.env.GMAP_USERNAME,
      password = process.env.GMAP_PASSWORD
    } = options;

    this.apiUrl = apiUrl;
    this.authUrl = `${apiUrl}/auth/`;
    this.username = username;
    this.password = password;

    this.token = null;
    this.expires = null;
  }

  auth() {
    if (!this.token) {
      return axios.post(this.authUrl, {
        username: this.username,
        password: this.password
      })
      .then((response) => {
        this.token = response.data.token;
        this.expires = response.data.expires_at;
      });
    }

    return new Promise((resolve, reject) => {
      resolve({
        data: {
          expires_at: this.expires,
          token: this.token
        }
      });
    });
  }

  doGet(url) {
    return new Promise((resolve, reject) => {
      this.auth()
        .then((authResp) => {
          const token = authResp.data.token;
          axios.get(url, { headers: { 'Authorization': token } })
            .then((response) => {
              resolve(response.data);
            })
            .catch((error) => {
              console.log(error);
              reject(error);
            });
        })
        .catch((error) => {
          console.log(error);
          reject(error);
        });
    });
  }

  listGraphs() {
    const url = `${this.apiUrl}/graphs`;

    return this.doGet(url);
  }

  listCollections() {
    const url = `${this.apiUrl}/collections`;

    return this.doGet(url);
  }

  getNode(options) {
    const { collection, nodeId } = options;
    const url = `${this.apiUrl}/collections/${collection}/${nodeId}`;

    return this.doGet(url);
  }

  query(options) {
    const { kind, value } = options;
    const url = `${this.apiUrl}/queries/${kind}/execute?variable=${value}`;

    return this.doGet(url);
  }

  search(options) {
    const { collections, query, perPage, page } = options;
    const url = `${this.apiUrl}/collections/search/?collections=${collections}&` +
                `query=${query}&per_page=${perPage}&page=${page}`;

    return this.doGet(url);
  }

  traversal(options) {
    const { graph, startVertex, maxDepth, direction } = options;
    const url = `${this.apiUrl}/graphs/${graph}/traversal?start_vertex=${startVertex}` +
                `&max_depth=${maxDepth}&direction=${direction}`;

    return this.doGet(url);
  }

}
