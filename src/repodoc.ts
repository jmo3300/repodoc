#!/usr/bin/env node

/**
 * CLI / processing controller
 * @packageDocumentation
 */

import * as pu from './config';
import * as du from './doc';
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
    .then(params => pu.writeParamsToFile(params, args.configFile))

    .then(du.createDoc)

    .catch(e => console.error(e.message))

  }

main();
