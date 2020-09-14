import fs from 'fs';
import pug from 'pug';

export function json2html(jsonfile: string, outdir: string, device: string|unknown = null) {
  const json = JSON.parse(fs.readFileSync(jsonfile).toString());
  const timestamp = new Date().toLocaleString();
  const data = { sites: json, timestamp, device };
  const html = pug.renderFile(`${__dirname}/templates/template.pug`, data);
  fs.writeFileSync(`${outdir}/index.html`, html);
}
