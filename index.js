"use strict";

const CDP = require('chrome-remote-interface');
const file = require('fs');

const list = [
  {id: '1', url: 'https://www.yahoo.co.jp'},
  {id: '2', url: 'https://githubw.com/hogegggg'},
  {id: '3', url: 'https://www.google.co.jp'},
  {id: '4', url: 'http://www.nttdocomo.co.jp/disaster/index.html#p03'},
  {id: '5', url: 'https://www.amazon.co.jp'}
]
const delay = 0;
const format = 'png'

function sleep(sec) {
  return new Promise(resolve => setTimeout(resolve, sec*1000));
}

CDP(async function(client){
  const {DOM, Emulation, Network, Page, Runtime} = client;
  const output = {}

  await Promise.all([
    Network.enable(),
    Page.enable(),
    DOM.enable()
  ])
  await Network.clearBrowserCache()

  Network.requestWillBeSent((params) => {
    if (params.type == 'Document' && output[params.requestId]) {
      console.log("Sent: %s %s",params.requestId, params.documentURL);
      output[params.requestId]['requestUrl']=params.documentURL
    }
  });

  Network.responseReceived((res) => {
    if (res.type == 'Document' &&
        res.response.requestHeaders &&
        !res.response.requestHeaders.Referer &&
        !res.response.requestHeaders.referer &&
        output[res.requestId] ) {
      console.log("Resp: %s %s", res.requestId ,res.response.status, res.response.url)
      output[res.requestId]['status']=res.response.status
      output[res.requestId]['responseUrl']=res.response.url
    }
  })

  Network.loadingFailed((res) => {
    if (res.type == 'Document' && output[res.requestId]){
      console.log("Erro: %s %s", res.requestId, res.errorText)
      output[res.requestId]['status']='ERR'
      output[res.requestId]['errorText']=res.errorText
    }
  })

  let index = 0;
  for (let target of list) {
    index++
    let url = target.url
    try {
      let {frameId} = await Page.navigate({url})
      console.log("Nav : %s %s",frameId,url)
      output[frameId]=target
      await Page.loadEventFired();
      await sleep(delay);
      const {data} = await Page.captureScreenshot({format});
      let filename = "output_"+index+".png"
      file.writeFileSync(filename, Buffer.from(data, 'base64'));
    } catch(e) {
      console.log(e)
    }
  }

  process.on('SIGINT', () => {
    console.log(' Close CDP')
    client.close(); // ??
    console.log(output)
  });

}).on('error', err => {
  console.log('Cannot connect to Chrome')
  console.log(err)
});
