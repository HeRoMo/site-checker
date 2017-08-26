"use strict";
const puppeteer = require('puppeteer');

const defaultOptions = {
  format: 'png',
  viewportWidth: 1440,
  viewportHeight: 900,
  delay: 0,
  userAgent: null,
  fullPage: false
}

async function checkAndCapture(list, options = defaultOptions){
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  await page.setViewport({
    width: options.viewportWidth,
    height: options.viewportHeight
  })
  try {
    for (let target of list) {
      const response = await page.goto(target.url);
      target.status = response.status
      if(response.ok){
        const filename = `capture_${target.id}.png`
        await page.screenshot({ path: filename });
        target.capture = filename
      }
    }
  } catch(e){
    console.log(e)
  }
  browser.close();
  return list
}

module.exports = checkAndCapture;
