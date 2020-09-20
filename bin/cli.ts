#!/usr/bin/env node

import { devices, AuthOptions } from 'puppeteer';
import fs from 'fs';
import path from 'path';
import yargs = require('yargs');

/* eslint-disable import/first */
import { readFile } from '../lib/readFile';
import { siteChecker, SiteCheckerOptions } from '../index';
import { json2html } from '../lib/json2html';
/* eslint-enable import/first */

const urlRegexp = new RegExp("https?://[\\w!\\?/\\+\\-_~=;\\.,\\*&@#\\$%\\(\\)'\\[\\]]+");

/**
 * valiudate URL
 * @param str URL string
 */
function isUrl(str: any): boolean {
  return urlRegexp.test(str);
}

/**
 * validate auth options
 *
 * @param authOpts auth options
 */
function isAuthOptions(authOpts: any): authOpts is AuthOptions {
  if (authOpts) {
    const { username, password } = authOpts;
    return (typeof username === 'string' && typeof password === 'string');
  }
  return false;
}

/**
 * Command options
 */
interface CommandOptions {
  url: string | undefined;
  list: string | undefined;
  output: string | undefined;
  html: boolean;
  device: string | undefined;
  fullpage: boolean;
  nocache: boolean;
  timeline: boolean;
  screenshot: boolean;
  auth: string | undefined;
}

/**
 * parse input options
 *
 * @param args process.argv
 */
export function parseOptions(args: string[]): CommandOptions {
  const { argv } = yargs(args)
    .option('url', {
      alias: 'u',
      describe: 'set the url which is checked and captured',
      type: 'string',
      coerce: (arg: string): string => {
        if (isUrl(arg)) {
          return arg;
        }
        throw new Error(`[ERROR] url option is invalid. "${arg}" is invalid url.`);
      },
    })
    .option('list', {
      alias: 'l',
      describe: 'set the filepath of URL list.',
      type: 'string',
      coerce: (arg: string): string => {
        if (fs.existsSync(arg)) {
          return arg;
        }
        throw new Error(`[ERROR] list option is invalid. "${arg}" is not found`);
      },
    })
    .option('output', {
      alias: 'o',
      describe: 'set output dir name',
      type: 'string',
      coerec: (arg: string): string => path.resolve(arg),
    })
    .option('html', {
      describe: 'output HTML file',
      type: 'boolean',
      default: false,
    })
    .option('device', {
      alias: 'd',
      describe: 'emulate device name',
      type: 'string',
      coerce: (arg) => {
        if (devices[arg]) {
          return arg;
        }
        let message: string;
        if (arg) {
          message = `[ERROR] devise option is invalid. "${arg}" is unavarable device.`;
        } else {
          message = '[ERROR] devise option requires any device name.';
        }
        let devicesMessage = 'avarable devices: ';
        Object.values(devices).forEach((d) => { devicesMessage += `\n\t${d.name}`; });
        throw new Error(`${message}\n${devicesMessage}`);
      },
    })
    .option('fullpage', {
      alias: 'f',
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
    .option('screenshot', {
      alias: 's',
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
        throw new Error('[ERROR] auth option is invalid.');
      },
    })
    .version()
    .help('h')
    .alias('help', 'h');
  return argv;
}

/**
  * execute SiteChecker using url list
  *
  * @param listFilepath filepath of url list.
  * @param html output HTML file or not
  * @param option options of SiteChecker
  */
async function executeForList(listFilepath: string, html: boolean, option: SiteCheckerOptions) {
  console.info('Target URL List: %s', listFilepath);
  if (option.device) console.info('Emulate: %s', option.device);
  try {
    const list = await readFile(listFilepath);
    if (!option.outputDir) {
      const parsedPath = path.parse(path.resolve(listFilepath));
      // eslint-disable-next-line no-param-reassign
      option.outputDir = `${parsedPath.dir}/${parsedPath.name}`;
    }
    const out = await siteChecker(list, option);
    const resultFilename = `${option.outputDir}/result.json`;
    fs.writeFileSync(resultFilename, JSON.stringify(out, null, ' '));
    console.info(`${resultFilename} is created.`);
    if (html && option.outputDir) {
      json2html(resultFilename, option.outputDir, option.device);
      console.info(`${option.outputDir}/index.html is created.`);
    }
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
}

/**
 * execute SiteChecker for single url
 *
 * @param url target URL
 * @param options options of SiteChecker
 */
async function executeForUrl(url: string, options: SiteCheckerOptions) {
  console.info('Target URL: %s', url);
  if (options.device) console.info('Emulate: %s', options.device);
  try {
    const list = [{ id: '00000', url }];
    const out = await siteChecker(list, options);
    console.info(out);
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
}

/**
 * Execute SiteChecker
 *
 * @param argv commnad options
 */
export async function runCommand(argv: CommandOptions) {
  const option: SiteCheckerOptions = {
    fullPage: argv.fullpage,
    noCache: argv.nocache,
    timeline: argv.timeline,
    screenshot: argv.screenshot,
  };
  if (typeof argv.output === 'string') option.outputDir = argv.output;
  if (typeof argv.device === 'string') option.device = argv.device;
  if (isAuthOptions(argv.auth)) option.credentials = argv.auth;

  if (typeof argv.list === 'string') {
    const { list, html } = argv;
    await executeForList(list, html, option);
  } else if (argv.url) {
    const { url } = argv;
    await executeForUrl(url, option);
  } else {
    console.error('--list or --url option is required.');
    process.exit(1);
  }
}

// Execute command
if (require.main === module) {
  (async () => {
    const argv = parseOptions(process.argv);
    runCommand(argv);
  })();
}
