"use strict";

const CDP = require('chrome-remote-interface');
const file = require('fs');

const list = [
  'http://www.yahoo.co.jp',
  'https://www.google.co.jp',
  'https://www.amazon.co.jp'
]
const delay = 0;
const format = 'png'

function sleep(sec) {
  return new Promise(resolve => setTimeout(resolve, sec*1000));
}

CDP(async function(client){
  // console.log(client)
  const {DOM, Emulation, Network, Page, Runtime} = client;

  await Promise.all([
    Network.enable(),
    Page.enable(),
    DOM.enable()
  ])

  Network.requestWillBeSent((params) => {
      // console.log(params.request.id);
  });

  let index = 0;
  for (let url of list){
    index++
    await Page.navigate({url})
    await Page.loadEventFired();
    await sleep(delay);
    const {data} = await Page.captureScreenshot({format});
    let filename = "output_"+index+".png"
    file.writeFileSync(filename, Buffer.from(data, 'base64'));
  }

  process.on('SIGINT', () => {
    console.log(' Close CDP')
    client.close(); // ??
  });

}).on('error', err => {
  console.log('Cannot connect to Chrome')
  console.log(err)
});
