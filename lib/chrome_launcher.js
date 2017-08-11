"use strict";
const chromeLauncher = require('lighthouse/chrome-launcher');

function launchChrome(headless = false){
  const opts = {
    port: 9222,
    chromeFlags:[
      '--window-size=1440,900',
      '--disable-gpu',
      headless ? '--headless' : ''
    ]
  }

  return chromeLauncher.launch(opts).then(chrome => {
    console.log('Launch Chrome')
    return chrome
  });
}

module.exports = launchChrome;
