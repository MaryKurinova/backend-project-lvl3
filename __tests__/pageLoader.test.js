import { beforeAll, describe, it } from '@jest/globals';
import fsp from 'fs/promises';
import { dirname, join, resolve } from 'path';
import { fileURLToPath } from 'url';
import os from 'os';
import nock from 'nock';

import pageLoader from '../src/pageLoader';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const getFixturePath = (filename) => join(__dirname, '..', '__fixtures__', filename);
const readFile = async (filePath) => fsp.readFile(resolve(filePath), 'utf-8');
const getFixture = async (filename) => (
  readFile(getFixturePath(filename)).then((data) => data.toString().trim())
);

const pageUrl = new URL('https://ru.hexlet.io/courses');
const outputFile = 'ru-hexlet-io-courses.html';
let outputDir = '';
let expectedPageContent = '';

const scope = nock(pageUrl.origin).persist();

beforeAll(async () => {
  outputDir = await fsp.mkdtemp(join(os.tmpdir(), 'page-loader-'));
  expectedPageContent = await getFixture('courses.html');
  scope.get(pageUrl.pathname).reply(200, expectedPageContent);
});

describe('Загрузчик страниц', () => {
  it('загружает страницу', async () => {
    await expect(fsp.access(join(outputDir, outputFile))).rejects.toThrow(/ENOENT/);
    await pageLoader(pageUrl.toString(), outputDir);
    await expect(fsp.access(join(outputDir, outputFile))).resolves.not.toThrow();
    const actualContent = await readFile(join(outputDir, outputFile));
    expect(actualContent).toEqual(expectedPageContent);
  });
});
