import fse from 'fs-extra';
import path from 'path';

import handlebars from 'handlebars';

import { Params } from './paramsUtils';
import * as fu from './fsUtils';


/**
 * Creates the html file with 
 * 
 * - description of and 
 * - link to the docs of 
 * 
 * all projects within the monorepo.
 * 
 * Copies the docs of all projects to the output directory, if desired.
 * 
 * API of that module.
 * 
 * @param {Params}  params  Parameter which controls the process   
 * 
 * @returns nothing (for instance) but consumes the params by logging them to the console
 * 
 * throws an error if 
 * 
 * - an error arises during creation process
 * 
 */
export function createDoc(params:Params){
Promise.all([
        getTemplate(String(params.templatesDir),String(params.templateFile)),
        getProjects(String(params.repoDir),String(params.projectsFile))
            .then(projects => addPurposes(projects, String(params.repoDir)))
            .then(projects => fetchProjectsDocs(projects, params.copyProjectsDocs, String(params.projectsDocsDir), String(params.repoDir), String(params.outputDir)))
    ])
        .then((values:any) => {
            const template = values[0];
            const projects = values[1];
            return getHtmlString(template, projects);
            
        })
        .then(htmlString => writeHtmlFile(htmlString, String(params.outputDir), String(params.outputFile)))
        .then(console.log)
        .catch(error => { throw error })
}

/**
 * Reads the hbs template file and compiles it.
 * 
 * @returns {string} template creation function
 * 
 * throws an error if file 
 * 
 * - cannot be read
 * 
 */
function getTemplate(templatesDir:string, templateFile:string): Promise<string> { 
    return new Promise<string>((resolve: (value?: any) => void, reject: (reason: any) => void) => {
        fse.readFile(path.join(templatesDir, templateFile), (error: any, data: any) => {
            if (error) {
                reject (`cannot read template file (${error.message})`)
                return
            }
            resolve(handlebars.compile(data.toString()));
        })
    })
}

/**
 * Extracts all apps/projects from angular.json resp. from a file which contains projects the way angular.json contains.
 * 
 * @returns {JSON} projects with their details
 * 
 * throws an error if the file 
 * 
 * - cannot be read
 * - contains no valid JSON
 * - contains no project(s)
 * 
 */
function getProjects(repoDir:string, projectsFile): Promise<JSON> {
return new Promise<JSON>((resolve, reject) => {
        fse.readFile(path.join(repoDir, projectsFile), (error: any, data: any) => {
            if (error) {
                reject (`cannot read projects file (${error.message})`)
                return
            }
            try{
                const projects = JSON.parse(data).projects
                if (projects===undefined || Object.keys(projects).length<1){
                    reject(new Error(`file ${path.join(repoDir, projectsFile)} contains no project(s)"`).message);
                    return
                }
                resolve(projects)
            }catch(error){
                reject(new Error(`file ${path.join(repoDir, projectsFile)} contains no valid JSON"`).message);
            }
        })
    })
}

/**
* Extracts apps' brief description from a text (which usually comes from apps' readme.md).
 * 
 * @param {string} sourceText   The text the function extract the purpose/brief description from.   
 * 
 * @returns {string} Apps' brief description (if exists)
 * 
 * throws an error if
 *  
 * - Chapter '## Project Purpose' cannot be not found. (The chapter the description is being fetched from.)
 * 
 */
function extractPurpose(sourceText:string):string {
    const project_purpose_title = "Project Purpose"
    const header_mark = "##"
    const search_title = header_mark + " " + project_purpose_title;
    let project_purpose_title_offset = sourceText.indexOf(search_title);
    if (project_purpose_title_offset<0) {
        throw new Error(`Chapter '${search_title}' not found`)
    }
    project_purpose_title_offset = project_purpose_title_offset + 3; // add line feeds

    let project_purpose_text = sourceText.substring(project_purpose_title_offset + project_purpose_title.length,sourceText.length).trim();
    let project_purpose_text_length = sourceText.length;
    project_purpose_text_length = project_purpose_text.indexOf(header_mark);
    project_purpose_text = project_purpose_text.substring(0, project_purpose_text_length).trim();
    return project_purpose_text;
}

/**
 * Reads the file (usually is apps' readme.md) containing apps' purpose/brief description
 * 
 * @param {string} readmeFile   Name of the file to be read   
 * 
 * @returns {string} Either 
 * 
 * - content of the file read of   
 * 
 * - 'no descrption due to missing file' notice, if the file cannot be read
 * - 'no description due to ...' notice, if file has unusable content. *
 * 
 * throws no error(s)
  *  
 */
function getPurpose (readmeFile:string):Promise<string> {
    return new Promise<string>(async (resolve) => {
        fse.readFile(readmeFile, (error:any, data:any) => {
            if (error) {
                console.warn(`cannot read file (${error})`)
                resolve("no descrption due to missing file")
            }else{
                try{
                    resolve(extractPurpose(data.toString()))
                }catch(error){
                    console.warn(`no description due to ${error} in file ${readmeFile}`)
                    resolve(`no description due to ${error}`)
                }
            }
        })
    })
}

/**
 * Adds a property 'purpose' to all project objects
 * 
 * @param   {any} projects  an object with enumerable string objects (an object for each project, angular.json structure)
 * @param   {any} repoDir   mono repo directory (, where the multi project project resides)
 * 
 * @returns the projects input object enriched with 'purpose' property for each project
 * 
 */

function addPurposes(projects:any, repoDir):Promise<any> {

    return new Promise((resolve) => {
        const keys:string[] = Object.keys(projects);
        Promise.all(keys.map((key:string, index:number) => getPurpose(path.join(repoDir, projects[key].root, 'readme.md'))))
            .then((purposes:string[]) => {
                keys.map((key, index) => projects[key].purpose = purposes[index]);
                resolve(projects);
            })
    })
}

/**
 * Creates the html file with reference to all projects within a monorepo.
 * 
 * API of that module.
 * 
 * @param   {any}       projects            an object with enumerable string objects (an object for each project, angular.json structure)
 * @param   {boolean}   copyProjectsDocs    true => function copies app's docs and lead the link to the copy
 * @param   {any}       repoDir             mono repo directory (, where the multi project project resides)
 *                                          false => function does not copy app's docs and lead the to the original app's docs 
 * @param   {string}    outputDir           directory the app's docs will be copied to
 * 
 * @returns the projects input object enriched with 'reference' property for each project
 * 
 * throws an error if 
 * 
 * - an error arises during creation process
 * 
 */
const fetchProjectsDocs = function (projects:any, copyProjectsDocs:boolean, projectsDocsDir:string, repoDir:string, outputDir:string):Promise<any> {

    return new Promise((resolve) => {
        const keys:string[] = Object.keys(projects);
        Promise.all(keys.map((key:string) => fetchProjectDocs(key, projects[key], copyProjectsDocs, projectsDocsDir, repoDir, outputDir)))
            .then((references:string[]) => {
                keys.map((key, index) => projects[key].reference = references[index]);
                resolve(projects);
            })
    })
}

/**
 * Copies app's doc, if desired (copyProjectsDocs=true)
 * 
 * Prepares the link to app's docs. The link will 
 * 
 * - lead to app's docs' copy, if a copy is desired/exists
 * - lead to original app's docs
 * - not be prepared, docs of an app do not exist 
 * 
 * @param   {string}    projectName       Name of the project, is part of destination path of an potiéntial copy
 * @param   {any}       project           Object with all project details, partiually project's root directory 
 *                                        with is part of destination path of an potiéntial copy
 * @param   {boolean}   copyProjectsDocs  true => function copies app's docs and lead the link to the copy
 *                                        false => function does not copy app's docs and lead the to the original app's docs 
 * @param   {string}    outputDir         directory the app's docs will be copied to
 * 
 * @returns {string}    reference to app's docs (e.g. <a href="path-to-projects-docs/index.html">projectName</a>)
 *                      projectName, if there are no docs for an app or the docs cannot be copied
 * 
 * throws no errors 
 * 
 */
function fetchProjectDocs (projectName, project:any, copyProjectsDocs, projectsDocsDir:string, repoDir:string, outputDir:string):Promise<string> {
    return new Promise<string>(async (resolve) => {
        const inputDir = path.join(repoDir, project.root, projectsDocsDir);
        if (!fu.dirExists(inputDir)){
            console.warn(`${inputDir} does not exits`)
            resolve(projectName)
            return
        }
        if (copyProjectsDocs){
            fse.copy(inputDir, path.join(outputDir, projectName, projectsDocsDir), function (error) {
                if (error){
                    console.warn(`cannot copy ${inputDir} to ${path.join(outputDir, projectName)} due to ${error}`)
                    resolve(projectName)
                }else{
                    resolve('<a href="' + path.join(projectName, projectsDocsDir, "index.html") + '">' + projectName + '</a>')
                }
            });            
        }else{
            resolve(inputDir)
        }
    })
}

/**
 * Compiles the html template
 * 
 * @param {any} template    compile function
 * @param {any} projects    projects objects
 * 
 * @returns {any} object    the input object enriched with 'purpose' property for each project
 * 
 */
function getHtmlString(template:any, projects:any):Promise<string>{
    return new Promise<string>((resolve) => resolve(template({project:projects})))
}

/**
 * Writes the html code to a file
 * 
 * @param   {string}    htmlString  html code
 * @param   {string}    outputDir   directory the output file will be written to
 * @param   {string}    outputFile  file the html code will be written to
 * 
 * @returns {string}    notice 'html file is written to ...'
 * 
 * throws an error if
 *  
 * - file cannot be written.
 * 
 */
function writeHtmlFile(htmlString:string, outputDir:string, outputFile):Promise<string>{
    return new Promise<string>((resolve, reject) => {
        fse.writeFile(path.join(outputDir, outputFile), htmlString, (error:any) => {
        if (error) {
            reject (error)
            return
        }
        resolve(`html file saved to ${path.join(outputDir, outputFile)}`)
        })
    })
}
