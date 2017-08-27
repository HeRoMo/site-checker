#!/usr/bin/env node

const puppeteer = require('puppeteer');
const devices = require('puppeteer/DeviceDescriptors');
const fs = require('fs')
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
  .help('h')
  .alias('h', 'help')
  .argv

const readCsv = require('../lib/read_csv.js');
const checkAndCapture = require('../index.js');
async function exec(filename, option){
  const list = await readCsv(filename);
  const out = await checkAndCapture(list, option)
  return out
}

const option = {}
if(!!argv.device) option['device'] = argv.device;

if(!!argv.list){
  console.log('')
  exec(argv.list, option).then((out)=>{
    console.log(out)
  })
} else if(!!argv.url){
  try{
    (async function(){
      const url = argv.url
      console.log('target URL: %s', url)
      const list = [{ id: 0, url }]
      const out = await checkAndCapture(list, option)
      console.log(out)
    })();
  } catch(e){
    console.log(e)
  }
} else {
  console.log('-l or -u option is required.')
  process.exit(1);
}
