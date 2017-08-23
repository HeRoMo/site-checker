"use strict";

const CDP = require('chrome-remote-interface');
const file = require('fs');

const verbose = false;

function sleep(sec) {
  return new Promise(resolve => setTimeout(resolve, sec*1000));
}

const defaultOptions = {
  format: 'png',
  viewportWidth: 1440,
  viewportHeight: 900,
  delay: 0,
  userAgent: null,
  fullPage: false
}

function checkAndCapture(list, options = defaultOptions){
  return new Promise(function(resolve, reject){
    CDP(async function(client){
      const output = {}
      const {DOM, Emulation, Network, Page, Runtime} = client;
      const deviceMetrics = {
        width: options.viewportWidth || defaultOptions.viewportWidth,
        height: options.viewportHeight || defaultOptions.viewportHeight,
        screenWidth: options.viewportWidth || defaultOptions.viewportWidth,
        screenHeight: options.viewportHeight || defaultOptions.viewportHeight,
        offsetX: 0,
        offsetY: 0,
        deviceScaleFactor: 1,
        mobile: false,
        fitWindow: false,
      }
      await Promise.all([
        Network.enable(),
        Page.enable(),
        DOM.enable(),
        Emulation.setDeviceMetricsOverride(deviceMetrics),
        Emulation.setPageScaleFactor({pageScaleFactor:1}),
        Emulation.setVisibleSize({width: deviceMetrics.width, height: deviceMetrics.height})
      ])
      await Network.clearBrowserCache()

      Network.requestWillBeSent((params) => {
        if (params.type == 'Document' && output[params.requestId]) {
          output[params.requestId]['requestUrl']=params.documentURL
          if(verbose) console.log("Sent: %s %s",params.requestId, params.documentURL);
        }
      });

      Network.responseReceived((res) => {
        if (res.type == 'Document' && output[res.requestId] ) {
          output[res.requestId]['status']=res.response.status
          output[res.requestId]['responseUrl']=res.response.url
          if(verbose) console.log("Resp: %s %s", res.requestId ,res.response.status, res.response.url);
        }
      })

      Network.loadingFailed((res) => {
        if (res.type == 'Document' && output[res.requestId]){
          output[res.requestId]['status']='ERR'
          output[res.requestId]['errorText']=res.errorText
          if(verbose) console.log("Erro: %s %s", res.requestId, res.errorText);
        }
      })

      process.on('SIGINT', () => {
        console.log(' Close CDP')
        client.close(); // ??
        console.log(output)
      });

      for (let target of list) {
        let url = target.url
        try {
          let {frameId} = await Page.navigate({url})
          if(verbose) console.log("Nav : %s %s",frameId,url)
          output[frameId]=target
          await Page.loadEventFired();
          if (options.fullPage) {
            const {root: {nodeId: documentNodeId}} = await DOM.getDocument();
            const {nodeId: bodyNodeId} = await DOM.querySelector({
              selector: 'body',
              nodeId: documentNodeId,
            });
            const {model: {height}} = await DOM.getBoxModel({nodeId: bodyNodeId});
            await Promise.all([
              Emulation.setVisibleSize({width: options.viewportWidth, height: height}),
              Emulation.forceViewport({x: 0, y: 0, scale: 1})
            ]);
          }
          await sleep(options.delay);
          if(target.status == 200){
            const {data} = await Page.captureScreenshot({format: options.format, fromSurface: true});
            const filename = "capture_"+target.id+".png"
            file.writeFileSync(filename, Buffer.from(data, 'base64'));
            target.capture = filename
          }
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

module.exports = checkAndCapture;
