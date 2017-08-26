#!/usr/bin/env node

const fs = require('fs')
const argv = require('yargs')
  .option('u', {
    alias: 'url',
    describe: 'set the url which is checked and captured'
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
  // .option('f', {
  //   alias: 'format',
  //   describe: 'screen shot file format.',
  //   default: 'png',
  //   choices: ['png', 'jpg']
  // })
  .help('h')
  .alias('h', 'help')
  .argv

const readCsv = require('../lib/read_csv.js');
const checkAndCapture = require('../index.js');
async function exec(filename){
  const list = await readCsv(filename);
  const out = await checkAndCapture(list)
  return out
}

if(!!argv.list){
  console.log('')
  exec(argv.list).then((out)=>{
    console.log(out)
  })
} else if(!!argv.url){
  try{
    (async function(){
      const url = argv.url
      console.log('target URL: %s', url)
      const list = [{ id: 0, url }]
      const out = await checkAndCapture(list)
      console.log(out)
    })();
  } catch(e){
    console.log(e)
  }
} else {
  console.log('-l or -u option is required.')
  process.exit(1);
}
