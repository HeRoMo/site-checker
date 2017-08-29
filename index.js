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

async function checkAndCapture(list, opts){
  const options = Object.assign({}, defaultOptions)
  Object.assign(options, opts)
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
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
      const response = await page.goto(target.url);
      target.status = response.status
      if(response.ok){
        const filename = `capture_${target.id}.png`
        const filepath = `${outputDir}/${filename}`
        await page.screenshot({ path: filepath, fullPage: options.fullPage });
        target.filepath = filepath
        target.filename = filename
      }
    }
  } catch(e){
    console.log(e)
  }
  browser.close();
  return list
}

module.exports = checkAndCapture;
