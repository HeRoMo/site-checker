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

async function preparePage(browser, options){
  let page = await browser.newPage();
  await page.setCacheEnabled(!options.noCache)
  if(!!options.device){
    await page.emulate(devices[options.device])
  } else {
    await page.setViewport({
      width: options.viewportWidth,
      height: options.viewportHeight
    })
  }
  if(!!options.credentials){
    await page.authenticate(options['credentials']);
  }
  return page;
}

async function siteChecker(list, opts){
  const options = Object.assign({}, defaultOptions, opts)
  let outputDir = '.'
  if(!!options.outputDir){
    mkdirp.sync(options.outputDir);
    outputDir = options.outputDir;
  }

  let args = {}
  if(process.env.NO_SANDBOX){
    args = {args: ['--no-sandbox', '--disable-setuid-sandbox'] }
  }

  const browser = await puppeteer.launch(args);
  let page = await preparePage(browser, options)

  try {
    for (let target of list) {
      let response = { ok: () => false }
      let traced = false;
      try{
        if(options.timeline){
          await page.close(); // renew Page object.
          page = await preparePage(browser, options);
          const timeline_file = `timeline_${target.id}.json`
          const timeline_path = `${outputDir}/${timeline_file}`
          await page.tracing.start( { path: timeline_path, screenshots: true } );
          target.timeline_file = timeline_file;
          target.timeline_path = timeline_path;
          traced = true;
        }
        response = await page.goto(target.url);
      } catch(error) {
        target.status = "ERROR"
        target.error_message = error.toString();
        continue;
      } finally {
        if(traced) await page.tracing.stop();
      }
      target.status = response.status()
      target.title = await page.title();
      target.response_url = response.url();
      if(options.screenshot && response.ok()){
        const screenshot_file = `screenshot_${target.id}.png`
        const screenshot_path = `${outputDir}/${screenshot_file}`
        await page.screenshot({ path: screenshot_path, fullPage: options.fullPage });
        target.screenshot_file = screenshot_file;
        target.screenshot_path = screenshot_path;
      }
    }
  } catch(error) {
    throw error;
  }
  browser.close();
  return list
}

module.exports = siteChecker;
