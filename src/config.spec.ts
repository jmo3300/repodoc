import fs from 'fs';
import 'mocha';
import chai from 'chai';
const expect = chai.expect
import cap from 'chai-as-promised';
chai.use(cap)

import createDoc from './doc';
import { Params, paramsDefault, validateParams } from './config';

beforeEach(() => {
  try {
    fs.rmdirSync('./repodoc', { recursive: true })
  } catch (error) { console.log(error) }
  try {
    if (fs.existsSync('./repodoc.json')){
      fs.unlinkSync('./repodoc.json')
    }
  } catch (error) { console.log(error) }
  try {
    fs.rmdirSync('./wrong', { recursive: true })
  } catch (error) { console.log(error) }
})

describe('validateParams()', () => {
  it(`should throw error with multiple errors concerning input directories`, async () => {
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
    )).to.be.rejectedWith("multipe errors in parameters:\n- repository directory \'wrong\' is not valid\n- template file \'wrong\\wrong\' does not exist\n")
  })
})
describe('validateParams()', () => {
  it(`should throw error with multiple errors concerning input files`, async () => {
    await expect(validateParams(
      <Params>{
        copyProjectsDocs: true,
        repoDir: 'example',
        projectsFile: "wrong",
        projectsDocsDir: "wrong",
        projectsDescriptionTitle: "wrong",
        templatesDir: 'templates',
        templateFile: "wrong",
        outputDir: 'repodoc',
        outputFile: 'index.html'
      }
    )).to.be.rejectedWith("multipe errors in parameters:\n- projects file \'example\\wrong\' does not exist\n- template file \'templates\\wrong\' does not exist\n")
  })
})
describe('validateParams()', () => {
  it(`should throw error multiple errors concerning directories and files not necessarily present`, async () => {
    await expect(validateParams(
      <Params>{
        copyProjectsDocs: true,
        repoDir: 'example',
        projectsFile: "angular.json",
        projectsDocsDir: "<?>",
        projectsDescriptionTitle: "Overview",
        templatesDir: 'templates',
        templateFile: "index.hbs",
        outputDir: '<?>',
        outputFile: '<?>'
      }
    )).to.be.rejectedWith("multipe errors in parameters:\n- projects documentation directory \'<?>\' is not valid\n- output directory \'<?>\' is not valid\n- outputfile name \'<?>\' is not valid\n")
  })
})
