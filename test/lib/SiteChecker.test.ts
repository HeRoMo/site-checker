import fs from 'fs';

import { SiteChecker, SiteCheckerOptions } from '../../lib/SiteChecker';
import { rmdirRecursive } from '../helper';

describe('SiteChecker', () => {
  describe('#run', () => {
    it('no options', async () => {
      const list = [{ id: '10000', url: 'https://github.com' }];

      expect.assertions(3);
      const sc = new SiteChecker(list, {});
      const result = await sc.run();

      expect(result).toHaveLength(1);
      expect(result[0].status).toBe(200);
      expect(result[0].title).toContain('GitHub');
    });

    describe('with outputDir', () => {
      let opts: SiteCheckerOptions;

      afterEach(async () => {
        await rmdirRecursive(`${opts.outputDir}`);
      });

      test('output screenshot', async () => {
        const list = [{ id: '10000', url: 'https://github.com' }];
        opts = { screenshot: true, outputDir: 'tmp/10000' };

        expect.assertions(4);
        const sc = new SiteChecker(list, opts);
        const result = await sc.run();

        expect(result).toHaveLength(1);
        expect(result[0].status).toBe(200);
        expect(result[0].screenshotPath).not.toBeUndefined();
        expect(fs.existsSync(`${result[0].screenshotPath}`)).toBeTruthy();
      });

      test('output screenshot by iPhone X', async () => {
        const list = [{ id: '10000', url: 'https://github.com' }];
        opts = { screenshot: true, outputDir: 'tmp/10000', device: 'iPhone X' };

        expect.assertions(4);
        const sc = new SiteChecker(list, opts);
        const result = await sc.run();

        expect(result).toHaveLength(1);
        expect(result[0].status).toBe(200);
        expect(result[0].screenshotPath).not.toBeUndefined();
        expect(fs.existsSync(`${result[0].screenshotPath}`)).toBeTruthy();
      });

      test('output timeline', async () => {
        const list = [{ id: '20000', url: 'https://github.com' }];
        opts = { timeline: true, outputDir: 'tmp/20000' };

        expect.assertions(4);
        const sc = new SiteChecker(list, opts);
        const result = await sc.run();

        expect(result).toHaveLength(1);
        expect(result[0].status).toBe(200);
        expect(result[0].timelinePath).not.toBeUndefined();
        expect(fs.existsSync(`${result[0].timelinePath}`)).toBeTruthy();
      });
    });
  });
});
