"use strict";
const {ChromeLauncher} = require('lighthouse/lighthouse-cli/chrome-launcher');

function launchChrome(headless = true){
  const launcher = new ChromeLauncher({
    port: 9222,
    autoSelectChrome: true,
    additionalFlags:[
      '--window-size=1440,900',
      '--disable-gpu',
      headless ? '--headless' : ''
    ]
  });

  return launcher.run().then(() => {
      process.on('SIGINT', () => {
        launcher.kill().then(() => {
          console.log('Chrome has shatdown')
        })
      })
      return launcher
    }).catch(err => {
      return launcher.kill().then(() => {
        throw err;
      }, console.err);
    })
}

module.exports = launchChrome;
