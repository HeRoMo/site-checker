import {
  AuthOptions,
  Browser,
  devices,
  launch,
  Response,
} from 'puppeteer';
import mkdirp from 'mkdirp';

import { SiteInfo } from './read_file';

interface PreparePageOptions {
  credentials?: AuthOptions;
  device?: string;
  noCache?: boolean;
  viewportHeight?: number;
  viewportWidth?: number;
}

export interface SiteCheckerOptions extends PreparePageOptions {
  fullPage?: boolean;
  outputDir?: string;
  screenshot?: boolean;
  timeline?: boolean;
}

const siteCheckerDefaultOptions: SiteCheckerOptions = {
  viewportWidth: 1440,
  viewportHeight: 900,
  fullPage: false,
};
Object.freeze(siteCheckerDefaultOptions);

async function preparePage(browser: Browser, options: PreparePageOptions) {
  const page = await browser.newPage();
  await page.setCacheEnabled(!options.noCache);
  if (options.device) {
    await page.emulate(devices[options.device]);
  } else if (options.viewportWidth && options.viewportHeight) {
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

async function visitTarget(
  browser: Browser,
  options: SiteCheckerOptions,
  target: SiteInfo,
  outputDir: string,
): Promise<void> {
  const page = await preparePage(browser, options);
  let response: Response | null;
  let traced = false;
  try {
    if (options.timeline) {
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
    await page.close();
  }
}

export async function siteChecker(list: SiteInfo[], opts: SiteCheckerOptions) {
  const options = { ...siteCheckerDefaultOptions, ...opts };
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

  /* eslint-disable no-await-in-loop */
  for (const target of list) { // eslint-disable-line no-restricted-syntax
    await visitTarget(browser, options, target, outputDir);
  }
  /* eslint-enable no-await-in-loop */

  browser.close();
  return list;
}
