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

class GmapClient {

  constructor(options={}) {
    let {
      apiUrl = process.env.GMAP_API_URL,
      username = process.env.GMAP_API_USERNAME,
      password = process.env.GMAP_API_PASSWORD,
      suppressLogs = false
    } = options;

    this.apiUrl = apiUrl;
    this.authUrl = `${apiUrl}/auth/`;
    this.username = username;
    this.password = password;

    this.suppressLogs = suppressLogs;

    this.token = null;
    this.expires = null;
  }

  log(msg) {
    if (!this.suppressLogs) {
      return console.log(msg);
    }
  }

  handleError(error) {
    let err = '';
    if (error.response) {
      err = error.response.statusText;
      const errors = error.response.data.errors;
      if (errors) {
        err = `${err}, ${errors}`;
      }
    }
    this.log(err);
    return err;
  }

  setCredentials(options) {
    if (this.isTokenValid()) {
      // There's already a valid token
      return false;
    }

    if (this.apiUrl && this.username && this.password) {
      // Credentials already set
      return false;
    }

    const { url, apiUrl, username, password } = options;
    this.apiUrl = apiUrl || url;
    this.username = username;
    this.password = password;
  }

  isTokenValid() {
    if (this.expires === null) {
      return false;
    }

    const now = new Date(),
          expires = new Date(this.expires);

    if (now > expires) {
      this.token = null;
      this.expires = null;
      return false;
    }

    return true;
  }

  auth() {
    return new Promise((resolve, reject) => {
      if (!this.isTokenValid()) {
        axios.post(this.authUrl, {
          username: this.username,
          password: this.password
        })
        .then((response) => {
          this.token = response.data.token || response.data.id;
          this.expires = response.data.expires_at || response.data.expires;
          resolve({
            data: {
              expires_at: this.expires,
              token: this.token
            }
          });
        })
        .catch((error) => {
          reject(this.handleError(error));
        });
      } else {
        resolve({
          data: {
            expires_at: this.expires,
            token: this.token
          }
        });
      }
    });
  }

  doGet(url, params) {
    return new Promise((resolve, reject) => {
      this.auth()
        .then((authResp) => {
          const token = authResp.data.token;
          axios.get(url, {
              headers: { 'Authorization': token },
              params: params || {}
         })
            .then((response) => {
              resolve(response.data);
            })
            .catch((error) => {
              reject(this.handleError(error));
            });
        })
        .catch((error) => {
          reject(this.handleError(error));
        });
    });
  }

  doAll(urlList) {
    return new Promise((resolve, reject) => {
      this.auth()
        .then((authResp) => {
          const token = authResp.data.token;
          let promiseList = [];
          for (let i=0, l=urlList.length; i<l; ++i) {
            promiseList.push(axios.get(urlList[i], { headers: { 'Authorization': token } }));
          }
          axios.all(promiseList)
            .then((results) => {
              resolve(results);
            })
            .catch((error) => {
              reject(this.handleError(error));
            })
        })
        .catch((error) => {
          reject(this.handleError(error));
        });
    });
  }

  listGraphs(options) {
    const { perPage, page } = options;
    const url = `${this.apiUrl}/graphs`;
    return this.doGet(url, {
        per_page: per_page || 10,
        page: page || 1
    });
  }

  listCollections(options) {
    const { perPage, page } = options;
    const url = `${this.apiUrl}/collections`;
    return this.doGet(url, {
        per_page: per_page || 10,
        page: page || 1
    });
  }

  listEdges(options) {
    const { perPage, page } = options;
    const url = `${this.apiUrl}/edges`;
    return this.doGet(url, {
        per_page: per_page || 10,
        page: page || 1
    });
  }

  getNode(options) {
    const { collection, nodeId } = options;
    const url = `${this.apiUrl}/collections/${collection}/${nodeId}`;
    return this.doGet(url);
  }

  runQuery(options) {
    const { kind, value } = options;
    const url = `${this.apiUrl}/queries/${kind}/execute`;
    return this.doGet(url, {
        variable: value
    });
  }

  listQueries(options) {
    const { perPage, page } = options;
    const url = `${this.apiUrl}/queries`;
    return this.doGet(url, {
        per_page: per_page || 10,
        page: page || 1
    });
  }

  search(options) {
    const { collections, query, perPage, page } = options;
    const url = `${this.apiUrl}/collections/search/`;
    return this.doGet(url, {
        collections: collections,
        query: query || '',
        per_page: perPage || 10,
        page: page || 1
    });
  }

  traversal(options) {
    const { graph, startVertex, maxDepth, direction } = options;
    const url = `${this.apiUrl}/graphs/${graph}/traversal`;
    return this.doGet(url, {
        start_vertex: startVertex,
        max_depth: maxDepth,
        direction: direction
    });
  }

  traversalMultiple(options) {
    const { graphs, startVertex, maxDepth, direction } = options;
    let urlList = [];

    for(let i=0, l=graphs.length; i<l; ++i) {
      urlList.push(`${this.apiUrl}/graphs/${graphs[i]}/traversal?start_vertex=${startVertex}` +
                   `&max_depth=${maxDepth}&direction=${direction}`);
    }

    return this.doAll(urlList);
  }

  pluginData(pluginName, options) {
    const url = `${this.apiUrl}/plugin_data/${pluginName}/`;
    return this.doGet(url, options);
  }
}

module.exports = GmapClient;
