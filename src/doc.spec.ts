import 'mocha';
import chai from 'chai';
const expect = chai.expect
import cap from 'chai-as-promised';
chai.use(cap)
import rimraf from 'rimraf'

import createDoc from './doc';
import { Params, paramsDefault } from './config';


beforeEach(async () => {
  rimraf("./repodoc", () => { })
  rimraf("./repodoc.json", () => { })
})

describe('createDoc() with default Parameters', () => {
  it(`should return 'html file saved to repodoc\\index.html'`, async () => {
    rimraf("./repodoc", () => { })
    rimraf("./repodoc.json", () => { })
    await expect(createDoc(paramsDefault)).eventually.equal("html file saved to repodoc\\index.html")
  })
})

describe('createDoc() with invalid input parameters (repoDir, projectsFile, templatesDir, templateFile)', () => {
  it(`should throw error 'projects file 'example\\wrongFile'does not exist'`, async () => {
    await expect(createDoc(
      <Params>{
        copyProjectsDocs: true,
        repoDir: 'example',
        projectsFile: "wrongFile",
        projectsDocsDir: "compodoc",
        projectsDescriptionTitle: "Overview",
        templatesDir: 'templates',
        templateFile: "index.hbs",
        outputDir: 'repodoc',
        outputFile: 'index.html'
      }
      )).to.be.rejectedWith("projects file \'example\\wrongFile\' does not exist")
  })
  it(`should throw error 'repository directory 'wrongDir' is not valid'`, async () => {
    await expect(createDoc(
      <Params>{
        copyProjectsDocs: true,
        repoDir: 'wrongDir',
        projectsFile: "angular.json",
        projectsDocsDir: "compodoc",
        projectsDescriptionTitle: "Overview",
        templatesDir: 'templates',
        templateFile: "index.hbs",
        outputDir: 'repodoc',
        outputFile: 'index.html'
      }
    )).to.be.rejectedWith("repository directory \'wrongDir\' is not valid")
  })
  it(`should throw error 'templates directory 'wrongDir' is not valid'`, async () => {
    await expect(createDoc(
      <Params>{
        copyProjectsDocs: true,
        repoDir: 'example',
        projectsFile: "angular.json",
        projectsDocsDir: "compodoc",
        projectsDescriptionTitle: "Overview",
        templatesDir: 'wrongDir',
        templateFile: "index.hbs",
        outputDir: 'repodoc',
        outputFile: 'index.html'
      }
    )).to.be.rejectedWith("templates directory \'wrongDir\' is not valid")
  })
  it(`should throw error 'template file 'templates\\wrongFile' does not exist`, async () => {
    await expect(createDoc(
      <Params>{
        copyProjectsDocs: true,
        repoDir: 'example',
        projectsFile: "angular.json",
        projectsDocsDir: "compodoc",
        projectsDescriptionTitle: "Overview",
        templatesDir: 'templates',
        templateFile: "wrongFile",
        outputDir: 'repodoc',
        outputFile: 'index.html'
      }
    )).to.be.rejectedWith("template file 'templates\\wrongFile' does not exist")
  })
})
