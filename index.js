"use strict";
const puppeteer = require('puppeteer');
const devices = require('puppeteer/DeviceDescriptors');
const mkdirp = require('mkdirp');

const defaultOptions = {
  viewportWidth: 1440,
  viewportHeight: 900,
  fullPage: false
}
Object.freeze(defaultOptions)

async function siteChecker(list, opts){
  const options = Object.assign({}, defaultOptions, opts)
  let args = {}
  if(process.env.NO_SANDBOX){
    args = {args: ['--no-sandbox', '--disable-setuid-sandbox']}
  }
  const browser = await puppeteer.launch(args);
  let page = await browser.newPage();
  if(!!options['noCache']){
    await page._client.send('Network.setCacheDisabled', {cacheDisabled: true});
  }
  if(!!options['device']){
    console.log('Emulate: %s', options['device'])
    await page.emulate(devices[options['device']])
  } else {
    await page.setViewport({
      width: options.viewportWidth,
      height: options.viewportHeight
    })
  }
  let outputDir = '.'
  if(!!options.outputDir){
    mkdirp.sync(options.outputDir);
    outputDir = options.outputDir;
  }
  if(!!options.credentials){
    await page.authenticate(options['credentials']);
  }
  try {
    for (let target of list) {
      let response = { ok: false }
      let traced = false;
      try{
        if(options.timeline){
          const path = `${outputDir}/trace_${target.id}.json`
          await page.tracing.start( { path , screenshots: true } );
          traced = true;
        }
        response = await page.goto(target.url);
      } catch(error) {
        target.status = "ERROR"
        target.error_message = error.toString();
        continue;
      } finally {
        if(traced) await page.tracing.stop();
        console.log('STOP')
      }
      target.status = response.status
      target.title = await page.title();
      target.response_url = response.url;
      if(response.ok){
        const filename = `capture_${target.id}.png`
        const filepath = `${outputDir}/${filename}`
        await page.screenshot({ path: filepath, fullPage: options.fullPage });
        target.filepath = filepath
        target.filename = filename
      }
    }
  } catch(error) {
    throw error;
  }
  browser.close();
  return list
}

module.exports = siteChecker;
