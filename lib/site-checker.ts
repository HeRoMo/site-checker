import {
  AuthOptions,
  Browser,
  devices,
  launch,
  Response,
} from 'puppeteer';
import mkdirp from 'mkdirp';

import { SiteInfo } from './read_file';

export interface InputOpts {
  outputDir?: string;
  device?: string;
  fullPage?: boolean;
  noCache?: boolean;
  timeline?: boolean;
  screenshot?: boolean;
  credentials?: AuthOptions;
}

interface preparePageOptions {
  viewportWidth: number;
  viewportHeight: number;
  device?: string;
  credentials?: AuthOptions;
  noCache?: boolean;
}

const defaultOptions = {
  viewportWidth: 1440,
  viewportHeight: 900,
  fullPage: false,
};
Object.freeze(defaultOptions);

async function preparePage(browser: Browser, options: preparePageOptions) {
  const page = await browser.newPage();
  await page.setCacheEnabled(!options.noCache);
  if (options.device) {
    await page.emulate(devices[options.device]);
  } else {
    await page.setViewport({
      width: options.viewportWidth,
      height: options.viewportHeight,
    });
  }
  if (options.credentials) {
    await page.authenticate(options.credentials);
  }
  return page;
}

export async function siteChecker(list: SiteInfo[], opts: InputOpts) {
  const options = { ...defaultOptions, ...opts };
  let outputDir = '.';
  if (options.outputDir) {
    mkdirp.sync(options.outputDir);
    outputDir = options.outputDir;
  }

  let args = {};
  if (process.env.NO_SANDBOX) {
    args = { args: ['--no-sandbox', '--disable-setuid-sandbox'] };
  }

  const browser = await launch(args);
  let page = await preparePage(browser, options);

  /* eslint-disable no-await-in-loop */
  // eslint-disable-next-line no-restricted-syntax
  for (const target of list) {
    let response: Response|null;
    let traced = false;
    try {
      if (options.timeline) {
        await page.close(); // renew Page object.
        page = await preparePage(browser, options);
        const timelineFile = `timeline_${target.id}.json`;
        const timelinePath = `${outputDir}/${timelineFile}`;
        await page.tracing.start({ path: timelinePath, screenshots: true });
        target.timelineFile = timelineFile; // eslint-disable-line no-param-reassign
        target.timelinePath = timelinePath; // eslint-disable-line no-param-reassign
        traced = true;
      }

      response = await page.goto(target.url);

      if (response) {
        target.status = response.status(); // eslint-disable-line no-param-reassign
        target.title = await page.title(); // eslint-disable-line no-param-reassign
        target.responseUrl = response.url(); // eslint-disable-line no-param-reassign
        if (options.screenshot && response.ok()) {
          const screenshotFile = `screenshot_${target.id}.png`;
          const screenshotPath = `${outputDir}/${screenshotFile}`;
          await page.screenshot({ path: screenshotPath, fullPage: options.fullPage, type: 'png' });
          target.screenshotFile = screenshotFile; // eslint-disable-line no-param-reassign
          target.screenshotPath = screenshotPath; // eslint-disable-line no-param-reassign
        }
      }
    } catch (error) {
      target.status = 'ERROR'; // eslint-disable-line no-param-reassign
      target.errorMessage = error.toString(); // eslint-disable-line no-param-reassign
    } finally {
      if (traced) await page.tracing.stop();
    }
  }
  /* eslint-enable no-await-in-loop */

  browser.close();
  return list;
}
