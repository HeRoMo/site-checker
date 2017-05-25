"use strict";

const CDP = require('chrome-remote-interface');
const file = require('fs');
const readCsv = require('./lib/read_csv.js');

const delay = 0;
const format = 'png'

function sleep(sec) {
  return new Promise(resolve => setTimeout(resolve, sec*1000));
}

function checkAndCapture(list){
  return new Promise(function(resolve, reject){
    CDP(async function(client){
      const output = {}
      const {DOM, Emulation, Network, Page, Runtime} = client;
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
        if (res.type == 'Document' && output[res.requestId] ) {
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

      process.on('SIGINT', () => {
        console.log(' Close CDP')
        client.close(); // ??
        console.log(output)
      });

      for (const target of list) {
        let url = target.url
        try {
          let {frameId} = await Page.navigate({url})
          console.log("Nav : %s %s",frameId,url)
          output[frameId]=target
          await Page.loadEventFired();
          await sleep(delay);
          const {data} = await Page.captureScreenshot({format});
          let filename = "output_"+target.id+".png"
          file.writeFileSync(filename, Buffer.from(data, 'base64'));
        } catch(e) {
          console.log(e)
        }
      }
      await client.close();
      resolve(Object.values(output))
    }).on('error', err => {
      console.log('Cannot connect to Chrome')
      reject(err)
    });
  })
}

async function exec(filename){
  const list = await readCsv(filename);
  return await checkAndCapture(list)
}

exec('url-test.csv').then((out)=>{
  console.log(out)
})
