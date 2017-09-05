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
  const options = Object.assign({}, defaultOptions)
  Object.assign(options, opts)
  let args = {}
  if(process.env.NO_SANDBOX){
    args = {args: ['--no-sandbox', '--disable-setuid-sandbox']}
  }
  const browser = await puppeteer.launch(args);
  let page = await browser.newPage();
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
  try {
    for (let target of list) {
      let response = { ok: false }
      try{
        response = await page.goto(target.url);
      } catch(error) {
        target.status = "ERROR"
        target.error_message = error.toString();
        continue;
      }
      target.status = response.status
      target.title = await page.title();
      target.reponse_url = response.url;
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
