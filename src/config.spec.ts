import 'mocha';
import chai from 'chai';
const expect = chai.expect
import cap from 'chai-as-promised';
chai.use(cap)
import rimraf from 'rimraf'

import createDoc from './doc';
import { Params, paramsDefault, validateParams } from './config';

beforeEach(async () => {
  })
  
  describe('validateParams()', () => {
    it(`should throw error with multiple errors`, async () => {
      await expect(validateParams(
        <Params>{
          copyProjectsDocs: true,
          repoDir: 'wrong',
          projectsFile: "wrong",
          projectsDocsDir: "wrong",
          projectsDescriptionTitle: "wrong",
          templatesDir: 'wrong',
          templateFile: "wrong",
          outputDir: 'repodoc',
          outputFile: 'index.html'
        }
        )).to.be.rejectedWith("multipe errors in parameters:\n- repository directory \'wrong\' is not valid\n- templates directory \'wrong\' is not valid\n")
    })
})
  