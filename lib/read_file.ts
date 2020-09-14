import fs from 'fs';
import path from 'path';
import readline from 'readline';
import parse from 'csv-parse';

/* eslint-disable camelcase */
export interface SiteInfo {
  id: string;
  url: string;
  timelineFile?: string;
  timelinePath?: string;
  status?: number|'ERROR';
  errorMessage?: string;
  title?: string;
  responseUrl?: string;
  screenshotFile?: string;
  screenshotPath?: string;
}
/* eslint-enable camelcase */

function readCsv(filename: string): Promise<SiteInfo[]> {
  const output: { id: string, url: string }[] = [];
  return new Promise((resolve, reject) => {
    fs.readFile(filename, (error, data) => {
      if (error) reject(error);
      parse(data, {
        columns: true, comment: '#', trim: true, skip_empty_lines: true,
      }, (err, csv) => {
        if (err) console.error(err);
        csv.forEach((line: { id: string, url: string }) => {
          output.push({ id: line.id, url: line.url });
        });
      });
    });
    resolve(output);
  });
}

function readTxt(filename: string): Promise<SiteInfo[]> {
  const output: { id: string, url: string }[] = [];
  let index = 0;
  return new Promise((resolve) => {
    const input = fs.createReadStream(filename, 'utf8');
    const reader = readline.createInterface({ input });
    reader.on('line', (line) => {
      const url = line.trim();
      if (!/^https?:\/\//.test(url)) return;
      index += 1;
      const id = (`0000${index}`).substr(-5);
      output.push({ id, url });
    });
    resolve(output);
  });
}

export async function readFile(filename: string): Promise<SiteInfo[]> {
  const extname = path.extname(filename);
  if (extname === '.csv') {
    return readCsv(filename);
  }
  if (extname === '.txt') {
    return readTxt(filename);
  }
  throw new Error('Unsupported file format.');
}
