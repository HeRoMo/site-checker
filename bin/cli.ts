#!/usr/bin/env node

import { devices, AuthOptions } from 'puppeteer';
import fs from 'fs';
import path from 'path';
import * as yargs from 'yargs';

import { readFile } from '../lib/read_file';
import { siteChecker, InputOpts } from '../index';
import { json2html } from '../lib/json2html';

function isString(str: any): str is 'string' {
  return typeof str === 'string';
}

function isAuthOptions(str: any): str is AuthOptions {
  if (str) {
    const { username, password } = str;
    return (typeof username === 'string' && typeof password === 'string');
  }
  return false;
}

/* Parsing options */
const { argv } = yargs
  .option('u', {
    alias: 'url',
    describe: 'set the url which is checked and captured',
    type: 'string',
    coerce: (arg: string): string => {
      if (/^https?:\/\/[\S]+\.[\S]+/.test(arg)) {
        return arg;
      }
      // console.error(`[ERROR] url option is invalid. ${arg} is invalid url.`);
      // process.exit(1);
      throw new Error(`[ERROR] url option is invalid. ${arg} is invalid url.`);
    },
  })
  .option('l', {
    alias: 'list',
    describe: 'set the filepath of URL list.',
    type: 'string',
    coerce: (arg: string): string => {
      if (fs.existsSync(arg)) {
        return arg;
      }
      // console.error(`[ERROR] list option is invalid. ${arg} is not found`);
      // process.exit(1);
      throw new Error(`[ERROR] list option is invalid. ${arg} is not found`);
    },
  })
  .option('o', {
    alias: 'output',
    describe: 'set output dir name',
    type: 'string',
    coerec: (arg: string): string => path.resolve(arg),
  })
  .option('html', {
    describe: 'output HTML file',
    type: 'boolean',
  })
  .option('d', {
    alias: 'device',
    describe: 'emulate device name',
    type: 'string',
    coerce: (arg) => {
      if (devices[arg]) {
        return arg;
      }
      let message: string;
      if (arg) {
        message = `[ERROR] devise option is invalid. ${arg} is unavarable device.`;
        console.info(message);
      } else {
        message = '[ERROR] devise option requires any device name.';
        console.info(message);
      }
      console.info('avarable devices: ');
      Object.values(devices).forEach((d) => { console.info('\t"%s"', d.name); });
      // process.exit(1);
      throw new Error(message);
    },
  })
  .option('f', {
    alias: 'fullpage',
    describe: 'capture whole page',
    type: 'boolean',
    default: false,
  })
  .option('nocache', {
    describe: 'disable browser cache',
    type: 'boolean',
    default: false,
  })
  .option('timeline', {
    describe: 'access url with tracing timeline.',
    type: 'boolean',
    default: false,
  })
  .option('s', {
    alias: 'screenshot',
    describe: 'take a screenshot at access successfully.',
    type: 'boolean',
    default: true,
  })
  .option('auth', {
    describe: 'basic auth credencial. <username>:<password>',
    type: 'string',
    coerce: (arg: string): AuthOptions => {
      const [username, password] = arg.split(':');
      if (username && password) {
        return { username, password };
      }
      // console.error('[ERROR] auth option is invalid.');
      // process.exit(1);
      throw new Error('[ERROR] auth option is invalid.');
    },
  })
  .version()
  .help('h')
  .alias('h', 'help');

/* Main */
// process.stderr.write = (): boolean => true; // TODO: 必要？
const option: InputOpts = {};
if (typeof argv.output === 'string') option.outputDir = argv.output;
if (typeof argv.device === 'string') option.device = argv.device;
option.fullPage = argv.f;
option.noCache = argv.nocache;
option.timeline = argv.timeline;
option.screenshot = argv.s;
if (isAuthOptions(argv.auth)) option.credentials = argv.auth;
if (typeof argv.list === 'string') {
  console.info('Target URL List: %s', argv.list);
  if (argv.device) console.info('Emulate: %s', argv.device);
  (async () => {
    const list = await readFile(argv.list as string);
    if (!option.outputDir) {
      const parsedPath = path.parse(path.resolve(argv.list as string));
      option.outputDir = `${parsedPath.dir}/${parsedPath.name}`;
    }
    const out = await siteChecker(list, option);
    return out;
  })()
    .then((out) => {
      const resultFilename = `${option.outputDir}/result.json`;
      fs.writeFileSync(resultFilename, JSON.stringify(out, null, ' '));
      console.info(`${resultFilename} is created.`);
      if (argv.html && option.outputDir) {
        json2html(resultFilename, option.outputDir, option.device);
        console.info(`${option.outputDir}/index.html is created.`);
      }
    })
    .catch((error) => {
      console.error(error);
      process.exit(1);
    });
} else if (argv.url) {
  (async () => {
    const { url } = argv;
    if (isString(url)) {
      console.info('Target URL: %s', url);
      if (argv.device) console.info('Emulate: %s', argv.device);
      const list = [{ id: '00000', url }];
      const out = await siteChecker(list, option);
      return out;
    }
    return null;
  })()
    .then((out) => {
      console.info(out);
    })
    .catch((error) => {
      console.error(error);
      process.exit(1);
    });
} else {
  console.error('-l or -u option is required.');
  process.exit(1);
}
