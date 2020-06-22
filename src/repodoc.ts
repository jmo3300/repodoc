#!/usr/bin/env node

import * as pu from './paramsUtils';
import * as du from './docUtils';
import yargs from 'yargs';

const main = function():void {

  const args: pu.Args = yargs.options({
    configFile: { type: 'string', default: "repodoc.json", alias: "c" },
    askParams: { type: 'boolean', default: true, alias: "a" },
    copyProjectsDocs: { type: 'boolean', default: true },
  })
  .argv

  pu.initParams(args.configFile)

    .then(pu.updateParamsWithArgs)
    .then(params => pu.askParams(params, args.askParams))
    .then(pu.validateParams)
    .then(params => pu.writeParams(params, args.configFile))

    .then(du.createDoc)

    .catch(e => console.error(e.message))

  }

main();
