# Site Checker
[![GitHub version](https://badge.fury.io/gh/HeRoMo%2Fsite-checker.svg)](https://badge.fury.io/gh/HeRoMo%2Fsite-checker)
[![npm version](https://badge.fury.io/js/site-checker.svg)](https://badge.fury.io/js/site-checker)

This is a tool for checking web site status and capturing screenshot.

Japanese Guide is [here](https://github.com/HeRoMo/site-checker/wiki/%E4%BD%BF%E3%81%84%E6%96%B9).

## Installation

```
npm install -g site-checker
```

You can use docker image of site-checker.

```
docker run --rm -v <output dir of host>:/output:rw ghcr.io/heromo/site-checker:develop -u https://github.com/HeRoMo/site-checker
```

## Options
```
Options:
  -u, --url         set the url which is checked and captured
  -l, --list        set the filepath of URL list.                       [string]
  -o, --output      set output dir name                                 [string]
      --html        output HTML file                                   [boolean]
  -d, --device      emulate device name                                 [string]
  -f, --fullpage    capture whole page                                 [boolean]
      --nocache     disable browser cache                              [boolean]
      --timeline    access url with tracing timeline.                  [boolean]
  -s, --screenshot  take a screenshot at access successfully.
                                                       [boolean] [default: true]
      --auth        basic auth credencial. <username>:<password>        [string]
      --version     Show version number                                [boolean]
  -h, --help        Show help                                          [boolean]
```

## Usage

### Check a single URL

You can check a single url by using `-u` option.

```bash
$ site-checker -u https://github.com/HeRoMo/site-checker
Target URL: https://github.com/HeRoMo/site-checker
[ { id: '00000',
    url: 'https://github.com/HeRoMo/site-checker',
    status: 200,
    filepath: './capture_00000.png',
    filename: 'capture_00000.png' } ]
```
and output a screenshot image as `capture_00000.png`

### URL list

By using `-l` option, you can check multiple URL at once.
`-l` option accept two file format, `.txt` and `.csv`

`.txt` is one URL per line format. `.csv` format must have *id* column and *url* column
(see [sample](samples/url-list.csv)).

```bash
$ site-checker -l url-list.csv
```
This command creates dir named `url-list`, and output screenshot images and `result.json` file in this dir.

With `--html` option, the result is also output as an HTML file (index.html).

### Record site timeline

By using `--timeline` option, You can record web site performance.

When you run site-checker with `--timeline` option,
site-checker outputs *timelime_XXXXX.json* file which
is compatible to Performance (a.k.a Timeline) of Chrome Dev Tool.

```bash
$ site-checker -l url-list.csv --timeline -d 'iPhone X'
```

You can watch the result by using Chrome Dev Tool or [DevTools Timeline Viewer](https://chromedevtools.github.io/timeline-viewer/)

### Authentication
Site-checker supports basic authentication.<br>
You can set username and password by using `--auth` option.

```bash
$ site-checker -u https://basic-auth-site.com --auth username:password
Target URL: https://basic-auth-site.com
[ { id: '00000',
    url: 'https://basic-auth-site.com',
    status: 200,
    filepath: './capture_00000.png',
    filename: 'capture_00000.png' } ]
```

`--auth` option takes colon separated username and password.
if you use `--auth` option with `-l` option, site-checker uses same credentials to every url of list.

## License

[MIT](https://opensource.org/licenses/MIT)

Copyright (c) 2017-present, HeRoMo
