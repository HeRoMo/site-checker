'use strict';

const fs = require('fs')
const parse = require('csv-parse');
const transform = require('stream-transform');

function readCsv(filename){
  const output = []
  return new Promise(function(resolve, reject){
    fs.readFile(filename, function(error, data){
      if(error) reject(error);
      parse(data, {columns: true, comment: '#'}, function(error, csv){
        resolve(csv)
      })
    })
  })
}

module.exports = readCsv;
