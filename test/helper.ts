import fs from 'fs';

/**
 * delete directory and files in the directroy
 *
 * workaround: use `rmdir(dir, { recursive: true })` in Node v12 or after
 * @param path path to delete dir
 */
export async function rmdirRecursive(path: string) {
  const files = await fs.promises.readdir(path);
  const unlinks = files.map((file) => fs.promises.unlink(`${path}/${file}`));
  await Promise.all(unlinks);
  await fs.promises.rmdir(path);
}
