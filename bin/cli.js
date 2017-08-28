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
      if(/^https?:\/\//i.test(arg)){
        return arg;
      } else {
        console.log('Please set valid url')
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
        console.error('Not Exists')
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
    describe: 'capture whole page'
  })
  .help('h')
  .alias('h', 'help')
  .argv

/* Main */
const readFile = require('../lib/read_csv.js');
const checkAndCapture = require('../index.js');

const option = {}
if(!!argv.output) option['outputDir'] = argv.output;
if(!!argv.device) option['device'] = argv.device;
if(!!argv.fullpage) option['fullPage'] = true;
if(!!argv.list){
  console.log('target URL List: %s', argv.list);
  (async () => {
    const list = await readFile(argv.list);
    if(!option.outputDir){
      const parsedPath = path.parse(path.resolve(argv.list));
      option.outputDir = `${parsedPath.dir}/${parsedPath.name}`
    }
    const out = await checkAndCapture(list, option)
    return out
  })()
  .then((out)=>{
    console.log(out)
  })
  .catch((error)=>{
    console.log(error)
  })
} else if(!!argv.url){
  (async () => {
    const url = argv.url
    console.log('target URL: %s', url)
    const list = [{ id: 0, url }]
    const out = await checkAndCapture(list, option)
    return out
  })()
  .then((out)=>{
    console.log(out)
  })
  .catch((error) => {
    console.log(error)
  })
} else {
  console.log('-l or -u option is required.')
  process.exit(1);
}
