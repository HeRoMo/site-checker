# Site Checker

This is a tool for checking web site status and capturing screenshot.

## Installation

```
npm install -g site-checker
```

## Options
```
Options:
  -u, --url       set the url which is checked and captured
  -l, --list      set the filepath of URL list.                         [string]
  -o, --output    set output dir name                                   [string]
  -d, --device    emulate device name                                   [string]
  -f, --fullpage  capture whole page
  -h, --help      Show help                                            [boolean]
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

`.txt` is one URL per line format. `.csv` format must have *id* column and *url* column.

```bash
$ site-checker -l url-list.csv
```
This command creates `url-list` dir, and output screenshot images and `result.json` file in this dir.

## License

[MIT](https://opensource.org/licenses/MIT)

Copyright (c) 2017-present, HeRoMo
