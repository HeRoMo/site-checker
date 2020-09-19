import { readFile } from '../../lib/readFile';

test('read txt file', async () => {
  expect.assertions(3);
  const filename = 'test/fixtures/url-list.txt';
  const results = await readFile(filename);

  expect(results).toBeInstanceOf(Array);
  expect(results).toHaveLength(3);
  expect(results[0]).toMatchObject({ id: '00001', url: 'https://www.github.com' });
});

test('read csv file', async () => {
  global.console.warn = jest.fn();

  expect.assertions(4);
  const filename = 'test/fixtures/url-list.csv';
  const results = await readFile(filename);

  expect(results).toBeInstanceOf(Array);
  expect(results).toHaveLength(4);
  expect(results[0]).toMatchObject({ id: '10000', url: 'https://github.com' });
  expect(global.console.warn).toHaveBeenCalledWith(
    'line {"id":"10001","url":"htt://www.google.com/","memo":"\'invalid url\'"} is invalid.',
  );
});

test('Unsupported file format', async () => {
  expect.assertions(1);
  const filename = 'test/fixtures/url-list.yml';
  expect(readFile(filename)).rejects.toThrow();
});
