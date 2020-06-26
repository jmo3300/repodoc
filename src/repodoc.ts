#!/usr/bin/env node

/**
 * CLI / processing controller
 * @packageDocumentation
 */

import * as config from './config';
import createDoc from './doc';
import yargs from 'yargs';

const main = function():void {

  const args: config.Args = yargs.options({
    configFile: { type: 'string', default: "repodoc.json", alias: "c" },
    askParams: { type: 'boolean', default: true, alias: "a" },
    copyProjectsDocs: { type: 'boolean', default: true },
  })
  .argv

  config.initParams(args.configFile)

    .then(config.updateParamsWithArgs)
    .then(params => config.askParams(params, args.askParams))
    .then(config.validateParams)
    .then(params => config.writeParamsToFile(params, args.configFile))

    .then(createDoc)

    .catch(error => console.error(error))

  }

main();
