'use strict';

const parse = require('csv-parse');
const transform = require('stream-transform');
const fs = require('fs')

function readCsv(filename){
  const output = []
  return new Promise(function(resolve, reject){
    fs.readFile(filename, async function(err, data){
      if(err){
        console.log(error);
      }
      parse(data, {columns: true}, function(err, csv){
        csv.forEach(function(vol){
          output.push(vol)
        })
        resolve(output)
      })
    })
  })
}

module.exports = readCsv;
