'use strict'
const fs = require('fs');
const pug = require('pug')

function json2html(jsonfile, outdir) {
  const json = JSON.parse(fs.readFileSync(jsonfile))
  const data = { sites: json }
  var html = pug.renderFile(`${__dirname}/templates/template.pug`, data);
  fs.writeFileSync(`${outdir}/index.html`, html);
}

module.exports = json2html;
