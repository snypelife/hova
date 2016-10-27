import ProjectSettings from 'models/project-settings';
import path from 'path';
import fs from 'fs';
import fse from 'fs-extra';
import config from 'config';
import { fileExists } from 'util/fs';

const { basePath } = config;
const settingsPath = basePath + '/.reduxrc';
const templatePath = basePath + '/templates/.reduxrc';

const packageCache = require(path.join(basePath, 'package.json'));

describe('ProjectSettings', () => {
  beforeEach(() => {
    fileExists(settingsPath) && fse.removeSync(settingsPath);
  });

  afterEach(() => {
    fileExists(settingsPath) && fse.removeSync(settingsPath);
  });

  const settings = new ProjectSettings();

  describe('#settingsPath', () => {
    it('returns current directory with .reduxrc appended', () => {
      expect(settings.settingsPath()).to.eql(settingsPath);
    });
  });

  describe('#settingsExist', () => {
    it('returns true when settings exist', () => {
      fs.writeFileSync(settingsPath, 'settings');
      expect(settings.settingsExist()).to.be.true;
    });

    it('returns false when settings arnt present', () => {
      expect(settings.settingsExist()).to.be.false;
    });
  });

  describe('#templatePath', () => {
    it('returns current directory with proper template appended', () => {
      expect(settings.templatePath()).to.eql(templatePath);
    });

    it('can take a custom template path in constructor for different configs', () => {
      const settings = new ProjectSettings('../../templates/.starterrc');
      const expectedPath = basePath + '/templates/.starterrc';
      expect(settings.templatePath()).to.eql(expectedPath);
    });
  });

  describe('#buildFromTemplate', () => {
    it('doesnt have .reduxrc already present', () => {
      const fn = () => {
        fs.readFileSync(settingsPath);
      };

      expect(fn).to.throw;
    });

    it('copies .reduxrc in templates and makes copy in directory root', () => {
      settings.buildFromTemplate();

      const template = fs.readFileSync(templatePath);
      const rc = fs.readFileSync(settingsPath);

      expect(rc).to.not.be.undefined;
      expect(rc).to.eql(template);

      fs.unlinkSync(settingsPath);
    });
  });

  describe('#loadSettings', () => {
    it('loads settings from .reduxrc if already exists', () => {
      fs.writeFileSync(
        settingsPath, JSON.stringify({ test: 'works!' })
      );
      const settings = new ProjectSettings();
      expect(settings.getSetting('test')).to.eql('works!');
    });

    it('loads settings from package.json', () => {
      try {
        fs.writeFileSync(
          path.join(basePath, 'package.json'), JSON.stringify({
            redux: {
              test: 'it works!'
            }
          })
        );
        const settings = new ProjectSettings();
        expect(settings.getSetting('test')).to.eql('it works!');
      } finally {
        // cleanup
        fs.writeFileSync(
          path.join(basePath, 'package.json'),
          JSON.stringify(packageCache, null, '  ') + '\n'
        );
      }
    });

    it('creates a new .reduxrc if not present', () => {
      new ProjectSettings();

      const template = fs.readFileSync(templatePath);
      const rc = fs.readFileSync(settingsPath);
      expect(rc).to.eql(template);
    });
  });

  describe('#getSetting', () => {
    it('returns the value of that setting', () => {
      const mockedSettings = {
        testOne: 'works',
        testTwo: 'works as well!'
      };
      fs.writeFileSync(settingsPath, JSON.stringify(mockedSettings));

      const settings = new ProjectSettings();
      expect(settings.getSetting('testOne')).to.eql('works');
      expect(settings.getSetting('testTwo')).to.eql('works as well!');
    });
  });

  describe('#getAllSettings', () => {
    it('returns json of all settings', () => {
      const mockedSettings = {
        testOne: 'works',
        testTwo: 'works as well!'
      };
      fs.writeFileSync(settingsPath, JSON.stringify(mockedSettings));

      const settings = new ProjectSettings();
      const { testOne, testTwo } = settings.getAllSettings();
      expect(testOne).to.eql('works');
      expect(testTwo).to.eql('works as well!');
    });
  });

  describe('#setSetting', () => {
    it('sets new settings', () => {
      const mockedSettings = { testOne: 'works' };
      fs.writeFileSync(settingsPath, JSON.stringify(mockedSettings));

      const settings = new ProjectSettings();
      expect(settings.getSetting('testOne')).to.eql('works');

      settings.setSetting('testOne', 'new setting');
      expect(settings.getSetting('testOne')).to.eql('new setting');
    });
  });

  describe('#setAllSettings', () => {
    it('takes a javascript object and overrides current settings', () => {
      const preWrittenSettings = { testOne: 'some information' };
      fs.writeFileSync(settingsPath, JSON.stringify(preWrittenSettings));

      const settings = new ProjectSettings();
      expect(settings.getSetting('testOne')).to.eql('some information');

      const overrideAll = {
        testOne: 'new information',
        anotherKey: 'with some value'
      };
      settings.setAllSettings(overrideAll);
      expect(settings.getAllSettings()).to.eql(overrideAll);
    });
  });

  describe('#save', () => {
    it('saves the current settings to the file', () => {
      const mockedSettings = { testOne: 'works' };
      fs.writeFileSync(settingsPath, JSON.stringify(mockedSettings));

      const settings = new ProjectSettings();
      settings.setSetting('testOne', 'new setting');
      settings.save();

      const newFile = fs.readFileSync(settingsPath, 'utf8');
      expect(newFile).to.match(/new setting/);
    });
  });
});
