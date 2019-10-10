#!/usr/bin/env node

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

import yargs from 'yargs';
import GmapClient from '../gmapclient';

let gmapclient = new GmapClient({
  suppressLogs: true
});

function print(data) {
  return console.log(JSON.stringify(data, null, 4));
}

function runCommand(command, args) {
  const commandList = ['listGraphs', 'listCollections', 'getNode',
                       'getPlugins', 'query', 'search', 'traversal'];

  if (!commandList.includes(command)) {
    return { 'error': `Command not found: ${command}` };
  }

  gmapclient.setCredentials(args);
  gmapclient[command].apply(gmapclient, [args])
    .then(data => print(data))
    .catch(err => print({ error: `${command}: ${err}` }));
}

yargs
  .env('GMAP_API')
  .option('url', {
    alias: 'a',
    describe: 'Globomap API URL',
    demandOption: true
  })
  .option('username', {
    alias: 'u',
    describe: 'Globomap API Username',
    demandOption: true
  })
  .option('password', {
    alias: 'p',
    describe: 'Globomap API Password',
    demandOption: true
  })
  .command('list-graphs', 'List graphs',
    {},
    args => runCommand('listGraphs', args)
  )
  .command('list-collections', 'List collections',
    {},
    args => runCommand('listCollections', args)
  )
  .command('get-node', 'Retrieve a node by collection and node-id',
    {
      collection: {
        alias: 'c',
        demandOption: true
      },
      nodeId: {
        alias: 'n',
        demandOption: true
      }
    },
    args => runCommand('getNode', args)
  )
  .command('get-plugins', 'List plugins metadata',
    {},
    args => runCommand('getPlugins', args)
  )
  .command('query', 'Makes a pre-defined query',
    {
      kind: {
        alias: 'k',
        describe: "Query's key name",
        demandOption: true
      },
      value: {
        alias: 'v',
        describe: 'Variable to pass to the query',
        demandOption: true
      }
    },
    args => runCommand('query', args)
  )
  .command('search', 'Search for nodes',
    {
      collections: {
        alias: 'cs',
        describe: 'List of collectios (comma separated)',
        demandOption: true
      },
      query: {
        alias: 'q',
        demandOption: true
      },
      per_page: {
        alias: 's',
        describe: 'Items per page / page size',
        default: 10
      },
      page: {
        alias: 'pg',
        describe: 'Page number',
        default: 1
      }
    },
    args => runCommand('search', args)
  )
  .command('traversal', 'Makes a traversal search given a graph and initial node',
    {
      graph: {
        alias: 'g',
        describe: 'Grahp where you want to do the traversal search',
        demandOption: true
      },
      start_vertex: {
        alias: 's',
        describe: 'Initial node ID',
        demandOption: true
      },
      max_depth: {
        alias: 'm',
        describe: 'The max depth to search for nodes',
        default: 1
      },
      direction: {
        alias: 'd',
        describe: 'The search direction',
        choices: ['any', 'inbound', 'outbound'],
        default: 'any'
      }
    },
    args => runCommand('traversal', args)
  )
  .demandCommand(1, 'You need to pass at least one command')
  .help()
  .recommendCommands()
  .argv
