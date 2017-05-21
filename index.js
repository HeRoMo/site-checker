"use strict";

const CDP = require('chrome-remote-interface');
const file = require('fs');

const list = [
  'http://www.yahoo.co.jp',
  'https://www.google.co.jp',
  'https://www.amazon.co.jp'
]
const url = 'https://www.yahoo.co.jp'
const delay = 0;
const format = 'png'

function sleep(sec) {
  return new Promise(resolve => setTimeout(resolve, sec*1000));
}

CDP(async function(client){
  // console.log(client)
  const {DOM, Emulation, Network, Page, Runtime} = client;

  await Network.enable();
  await Page.enable();
  await DOM.enable();

  Network.requestWillBeSent((params) => {
      // console.log(params.request.id);
  });


  let index = 0
  await Page.navigate({url: list[index]})

  Page.loadEventFired(async (qqq) => {
    console.log(qqq)
    await sleep(delay)
    DOM.getDocument((err, doc)=>{
      console.log(doc)
      DOM.querySelector({
        nodeId: doc.root.nodeId,
        selector: 'title'
      },(err, params) => {
        console.log(params)
        DOM.getOuterHTML({nodeId: params.nodeId}).then((html)=>{
          console.log(html)
        })
      })
    })
    const screenshot = await Page.captureScreenshot({format});
    const buffer = new Buffer(screenshot.data, 'base64');
    let filename = "output_"+index+".png"
    file.writeFile(filename, buffer, 'base64', function(err) {
      if (err) {
        console.error(err);
      } else {
        console.log('Screenshot saved');
      }
    });

    index++
    if(index < list.length){
      await Page.navigate({url: list[index]})
    } else {
      await client.close(); // ??
    }
  })

  process.on('SIGINT', () => {
    console.log(' Close CDP')
    client.close(); // ??
  });


}).on('error', err => {
  console.log('Cannot connect to Chrome')
  console.log(err)
});
