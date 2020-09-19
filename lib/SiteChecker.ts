import {
  AuthOptions,
  Browser,
  devices,
  launch,
  Response,
} from 'puppeteer';
import mkdirp from 'mkdirp';

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

export interface SiteCheckerOptions {
  credentials?: AuthOptions;
  device?: string;
  fullPage?: boolean;
  noCache?: boolean;
  outputDir?: string;
  screenshot?: boolean;
  timeline?: boolean;
  viewportHeight?: number;
  viewportWidth?: number;
}

const siteCheckerDefaultOptions: SiteCheckerOptions = {
  viewportWidth: 1440,
  viewportHeight: 900,
  fullPage: false,
};
Object.freeze(siteCheckerDefaultOptions);

export class SiteChecker {
  private readonly options: SiteCheckerOptions;
  private readonly outputDir: string;
  private browser: Browser|undefined;

  constructor(private list: SiteInfo[], opts: SiteCheckerOptions) {
    this.options = { ...siteCheckerDefaultOptions, ...opts };
    this.outputDir = '.';
    if (this.options.outputDir) {
      mkdirp.sync(this.options.outputDir);
      this.outputDir = this.options.outputDir;
    }
  }

  public async run(): Promise<SiteInfo[]> {
    await this.launchBrowser();

    try {
      if (this.options.timeline) {
        // tracing can start only once per browser
        for (const target of this.list) { // eslint-disable-line no-restricted-syntax
          // eslint-disable-next-line no-await-in-loop
          await this.visitTarget(target, this.outputDir);
        }
      } else {
        const concurrency = 10;
        let subList = [];
        for (const target of this.list) { // eslint-disable-line no-restricted-syntax
          subList.push(this.visitTarget(target, this.outputDir));
          if (subList.length === concurrency) {
            // eslint-disable-next-line no-await-in-loop
            await Promise.all(subList);
            subList = [];
          }
        }
        if (subList.length > 0) await Promise.all(subList);
      }
      return this.list;
    } finally {
      if (this.browser) this.browser.close();
    }
  }

  private async launchBrowser(): Promise<void> {
    let args = {};
    if (process.env.NO_SANDBOX) {
      args = { args: ['--no-sandbox', '--disable-setuid-sandbox'] };
    }
    this.browser = await launch(args);
  }

  private async preparePage() {
    if (this.browser === undefined) throw new Error('browser is not launched');

    const page = await this.browser.newPage();
    await page.setCacheEnabled(!this.options.noCache);
    if (this.options.device) {
      await page.emulate(devices[this.options.device]);
    } else if (this.options.viewportWidth && this.options.viewportHeight) {
      await page.setViewport({
        width: this.options.viewportWidth,
        height: this.options.viewportHeight,
      });
    }
    if (this.options.credentials) {
      await page.authenticate(this.options.credentials);
    }
    return page;
  }

  private async visitTarget(
    target: SiteInfo,
    outputDir: string,
  ): Promise<void> {
    const page = await this.preparePage();
    let response: Response | null;
    let traced = false;
    try {
      if (this.options.timeline) {
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
        if (this.options.screenshot && response.ok()) {
          const screenshotFile = `screenshot_${target.id}.png`;
          const screenshotPath = `${outputDir}/${screenshotFile}`;
          await page.screenshot({ path: screenshotPath, fullPage: this.options.fullPage, type: 'png' });
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
}
