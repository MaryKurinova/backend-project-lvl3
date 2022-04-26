import process from 'process';
import fsp from 'fs/promises';
import axios from 'axios';
import path from 'path';

const transformName = (name) => name.replace(/\W+/g, '-').replace(/-$/, '');

const urlToFilename = (url, defaultExt = '.html') => {
  const { dir, name, ext } = path.parse(url);
  const slug = transformName(path.join(dir, name));
  const extName = ext || defaultExt;

  return `${slug}${extName}`;
};

const urlToDirname = (url, suffix = '_files') => {
  const { dir, name } = path.parse(url);
  const slug = transformName(path.join(dir, name));

  return `${slug}${suffix}`;
};

const load = (uri) => axios.get(uri, { responseType: 'arraybuffer' }).then(({ data }) => data);

const makeDir = (pathToDirPage) => fsp.access(pathToDirPage).catch(() => fsp.mkdir(pathToDirPage));

export default (pageAddress, dirname = process.cwd()) => {
  let pageURL;
  try {
    pageURL = new URL(pageAddress);
  } catch (e) {
    return Promise.reject(e);
  }
  const hostAndPath = `${pageURL.hostname}${pageURL.pathname}`;

  const pathToHtmlFile = path.join(dirname, urlToFilename(hostAndPath));
  const dirPage = urlToDirname(hostAndPath);
  const pathToDirPage = path.join(dirname, dirPage);

  return makeDir(pathToDirPage)
    .then(() => load(pageURL.toString()))
    .then((page) => fsp.writeFile(pathToHtmlFile, page))
    .then(() => pathToHtmlFile);
};
