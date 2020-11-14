import fs from 'fs';
import path from "path";
import readline from 'readline';
import parse from 'csv-parse';

import { SiteInfo } from './SiteChecker';

const URL_REGEX = /^https?:\/\//;

/**
 * Type Guard for SiteInfo
 *
 * @param obj Input object
 */
function isSiteInfo(obj: any): obj is SiteInfo {
  return typeof obj.id === 'string' && URL_REGEX.test(obj.url);
}

/**
 * Read csv formatted site list file.
 *
 * @param filename Input filepath
 */
async function readCsv(filename: string): Promise<SiteInfo[]> {
  const data = await fs.promises.readFile(filename);
  const csv = parse(data, {
    columns: true, comment: '#', trim: true, skip_empty_lines: true,
  });
  const output: SiteInfo[] = [];
  for await (const line of csv) { // eslint-disable-line no-restricted-syntax
    if (isSiteInfo(line)) {
      output.push({ id: line.id, url: line.url });
    } else {
      console.warn(`line ${JSON.stringify(line)} is invalid.`);
    }
  }
  return output;
}

/**
 * Read text format site list file.
 *
 * @param filename Input filepath
 */
async function readTxt(filename: string): Promise<SiteInfo[]> {
  const output: SiteInfo[] = [];
  let index = 0;
  const input = fs.createReadStream(filename, 'utf8');
  const reader = readline.createInterface({ input });

  for await (const line of reader) { // eslint-disable-line no-restricted-syntax
    const url = line.trim();
    if (URL_REGEX.test(url)) {
      index += 1;
      const id = (`0000${index}`).substr(-5);
      output.push({ id, url });
    }
  }
  return output;
}

/**
 * Read Site list file
 *
 * @param filename Input filepath
 */
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
