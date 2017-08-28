'use strict';

const fs = require('fs');
const path = require('path');

function readCsv(filename){
  const parse = require('csv-parse');
  const output = []
  return new Promise(function(resolve, reject){
    fs.readFile(filename, function(error, data){
      if(error) reject(error);
      parse(data, { columns: true, comment: '#' }, function(error, csv){
        for(const data of csv){
          output.push( { id: data.id, url: data.url } )
        }
      })
    })
    resolve(output)
  })
}

function readTxt(filename){
  const readline = require('readline');
  const output = []
  let index = 0;
  return new Promise(function(resolve, reject){
    const input = fs.createReadStream(filename, 'utf8');
    const reader = readline.createInterface({ input });
    reader.on('line', (line) => {
      const url = line.trim();
      if(!/^https?:\/\//.test(url)) return;
      index++
      const id = ('00000' + index).substr(-5)
      output.push({ id, url })
    });
    resolve(output)
  })
}

function readFile(filename){
  const extname = path.extname(filename);
  if(extname === '.csv'){
    return readCsv(filename);
  } else if(extname === '.txt'){
    return readTxt(filename)
  } else {
    return Promise.reject('Unsupported file format.')
  }
}

module.exports = readFile;
