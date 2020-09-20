import fs from 'fs';

import { parseOptions, runCommand } from '../../bin/cli';
import { rmdirRecursive } from '../helper';

describe('parseOptions', () => {
  test('--list', () => {
    const argv = [
      '/usr/bin/node',
      '/usr/local/bin/site-checker',
      '--list',
      'test/fixtures/url-list.txt',
    ];

    const options = parseOptions(argv);
    expect(options.list).toBe('test/fixtures/url-list.txt');
  });

  test('--url --html --device', () => {
    const argv = [
      '/usr/bin/node',
      '/usr/local/bin/site-checker',
      '-u', 'https://google.com',
      '--html',
      '--device', 'iPhone X',
    ];

    const options = parseOptions(argv);
    expect(options.device).toBe('iPhone X');
  });

  test('--auth', () => {
    const argv = [
      '/usr/bin/node',
      '/usr/local/bin/site-checker',
      '--auth', 'user:pass',
    ];

    const options = parseOptions(argv);
    expect(options.auth).toMatchObject({ username: 'user', password: 'pass' });
  });
});

const defaultOpts = {
  url: undefined,
  list: undefined,
  output: undefined,
  html: false,
  device: undefined,
  fullpage: false,
  nocache: false,
  timeline: false,
  screenshot: true,
  auth: undefined,
};

describe('runCommand', () => {
  describe('with URL', () => {
    test('output screenshot', async () => {
      const argv = {
        ...defaultOpts,
        url: 'https://github.com',
        output: 'tmp/runCommand/001',
      };
      await runCommand(argv);

      expect(fs.existsSync(`${argv.output}/screenshot_00000.png`)).toBeTruthy();
      rmdirRecursive(argv.output);
    });
  });

  describe('with LIST', () => {
    test('output result.json', async () => {
      const argv = {
        ...defaultOpts,
        list: 'test/fixtures/url-list.csv',
        output: 'tmp/runCommand/002',
      };
      await runCommand(argv);

      expect(fs.existsSync(`${argv.output}/result.json`)).toBeTruthy();
      rmdirRecursive(argv.output);
    });
  });

  describe('with LIST --html', () => {
    test('output index.html', async () => {
      const argv = {
        ...defaultOpts,
        list: 'test/fixtures/url-list.csv',
        output: 'tmp/runCommand/003',
        html: true,
      };
      await runCommand(argv);

      expect(fs.existsSync(`${argv.output}/index.html`)).toBeTruthy();
      rmdirRecursive(argv.output);
    });
  });
});
