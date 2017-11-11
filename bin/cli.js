#!/usr/bin/env node

const puppeteer = require('puppeteer');
const devices = require('puppeteer/DeviceDescriptors');
const fs = require('fs');
const path = require('path');

/* Parsing options */
const argv = require('yargs')
  .option('u', {
    alias: 'url',
    describe: 'set the url which is checked and captured',
    coerce: function(arg){
      if(/^https?:\/\/[\S]+\.[\S]+/.test(arg)){
        return arg;
      } else {
        console.error(`[ERROR] ${arg} is invalid url.`);
        process.exit(1);
      }
    }
  })
  .option('l',{
    alias: 'list',
    describe: 'set the filepath of URL list.',
    type: 'string',
    coerce: function(arg){
      if(fs.existsSync(arg)){
        return arg
      } else {
        console.error(`[ERROR] ${arg} is not found`)
        process.exit(1);
      }
    }
  })
  .option('o', {
    alias: 'output',
    describe: 'set output dir name',
    type: 'string',
    coerec: function(arg){
      return path.resolve(arg);
    }
  })
  .option('html', {
    describe: 'output HTML file',
    type: 'boolean'
  })
  .option('d', {
    alias: 'device',
    describe: 'emulate device name',
    type: 'string',
    coerce: function(arg){
      if(devices[arg]){
        return arg
      } else {
        console.log('avarable devices: ')
        for(const d of devices) console.log('\t"%s"', d.name);
        process.exit(1);
      }
    }
  })
  .option('f', {
    alias: 'fullpage',
    describe: 'capture whole page',
    type: 'boolean'
  })
  .option('nocache',{
    describe: 'disable browser cache',
    type: 'boolean'
  })
  .option('timeline',{
    describe: 'access url with tracing timeline.',
    type: 'boolean'
  })
  .option('s',{
    alias: 'screenshot',
    describe: 'take a screenshot at access successfully.',
    type: 'boolean',
    default: true
  })
  .option('auth', {
    describe: 'basic auth credencial. <username>:<password>',
    type: 'string',
    coerce: function(arg){
      const [username, password] = arg.split(':');
      if(username && password){
        return {username, password} ;
      } else {
        console.log('auth option is invalid');
        process.exit(1);
      }
    }
  })
  .version()
  .help('h')
  .alias('h', 'help')
  .argv

/* Main */
const stdErrWrite = process.stderr.write;
process.stderr.write = function(){}

const readFile = require('../lib/read_file.js');
const siteChecker = require('../index.js');
const json2html = require('../lib/json2html')

const option = {}
if(!!argv.output) option['outputDir'] = argv.output;
if(!!argv.device) option['device'] = argv.device;
option['fullPage'] = argv.fullpage;
option['noCache'] = argv.nocache;
option['timeline'] = argv.timeline;
option['screenshot'] = argv.screenshot
if(!!argv.auth) option['credentials'] = argv.auth;
if(!!argv.list){
  console.log('Target URL List: %s', argv.list);
  (async () => {
    const list = await readFile(argv.list);
    if(!option.outputDir){
      const parsedPath = path.parse(path.resolve(argv.list));
      option.outputDir = `${parsedPath.dir}/${parsedPath.name}`
    }
    const out = await siteChecker(list, option)
    return out
  })()
  .then((out)=>{
    const resultFilename = `${option.outputDir}/result.json`
    fs.writeFileSync(resultFilename, JSON.stringify(out, null, ' '))
    console.log(`${resultFilename} is created.`)
    if(!!argv.html) {
      json2html(resultFilename, option.outputDir, option.device)
      console.log(`${option.outputDir}/index.html is created.`)
    }
  })
  .catch((error)=>{
    console.log(error);
    process.exit(1);
  })
} else if(!!argv.url){
  (async () => {
    const url = argv.url
    console.log('Target URL: %s', url)
    const list = [{ id: '00000', url }]
    const out = await siteChecker(list, option)
    return out
  })()
  .then((out)=>{
    console.log(out)
  })
  .catch((error) => {
    console.log(error);
    process.exit(1);
  })
} else {
  console.log('-l or -u option is required.')
  process.exit(1);
}
