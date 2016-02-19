import { fileExists, readFile } from 'util/fs';
import fse from 'fs-extra';
import path from 'path';

describe('(Util) fs', () => {
  describe('#fileExists', () => {
    it('returns true when file exists', () => {
      const finalPath = path.join(process.cwd(), 'tmp/example.js');
      fse.outputFileSync(finalPath, 'path');

      expect(fileExists(finalPath)).to.be.true;
      fse.removeSync(finalPath);
    });

    it('returns false when file doesnt exist', () => {
      expect(fileExists('tmp/some/random/path')).to.be.false;
    });
  });

  describe('#readFile', () => {
    const finalPath = path.join(process.cwd(), 'tmp/example.js');

    beforeEach(() => {
      fse.outputFileSync(finalPath, 'file to be read');
    });

    afterEach(() => {
      fse.removeSync(finalPath);
    });

    it('lets you pass in relative path', () => {
      const file = readFile('tmp/example.js');
      expect(file).to.eql('file to be read');
    });
  });
});
