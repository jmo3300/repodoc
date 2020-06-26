#!/usr/bin/env node
"use strict";
/**
 * CLI / processing controller
 * @packageDocumentation
 */
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var config = __importStar(require("./config"));
var doc_1 = __importDefault(require("./doc"));
var yargs_1 = __importDefault(require("yargs"));
var main = function () {
    var args = yargs_1.default.options({
        configFile: { type: 'string', default: "repodoc.json", alias: "c" },
        askParams: { type: 'boolean', default: true, alias: "a" },
        copyProjectsDocs: { type: 'boolean', default: true },
    })
        .argv;
    config.initParams(args.configFile)
        .then(config.updateParamsWithArgs)
        .then(function (params) { return config.askParams(params, args.askParams); })
        .then(config.validateParams)
        .then(function (params) { return config.writeParamsToFile(params, args.configFile); })
        .then(doc_1.default)
        .catch(function (error) { return console.error(error); });
};
main();
//# sourceMappingURL=repodoc.js.map