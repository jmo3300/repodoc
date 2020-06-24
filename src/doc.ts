/**
 * Creates the Documentation
 * 
 * createDoc(params:Params) is the (only) entry point of this module.
 * 
 * @packageDocumentation
 */

import fse from 'fs-extra';
import path from 'path';

import handlebars from 'handlebars';

import { Params } from './config';
import * as fsu from './fsUtils';


/**
 * Creates the Documentation, in detail:
 * 
 * - creates html file with an entry for each app including 
 *   - a link to app's documentation
 *   - brief description of the app fetched app's from readme.md
 *   - other details of the app availabe in the projects file (usually angular.json)  

 * - copies the documentation of all apps (if desired)
 * 
 * API/Entry point of that main Repodoc module.
 * 
 * @param {Params}  params  Parameter which controls the creation process   
 * 
 * @returns nothing (for instance) but consumes the params by logging them to the console
 * 
 * throws an error if 
 * 
 * - errors arises during creation process in other modules
 * 
 */
export function createDoc(params:Params){
    Promise.all([
        getTemplate(String(params.templatesDir),String(params.templateFile)),
        getProjects(String(params.repoDir),String(params.projectsFile))
            .then(projects => addProjectDescriptions(projects, params))
            .then(projects => fetchProjectsDocs(projects, params))
    ])
        .then((values:any) => {
            const template = values[0];
            const projects = values[1];
            return createHtmlString(template, projects);
            
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
* Extracts app's brief description from a text (which usually comes from app's readme.md).
 * 
 * @param {string} sourceText   The text the function extract the brief description from.   
 * 
 * @returns {string} App's brief description (if exists)
 * 
 * throws an error if
 *  
 * - Chapter '<chapter title>' cannot be not found.
 * 
 */
function extractProjectDescription(sourceText:string, params:Params):string {
    const description_title = String(params.projectsDescriptionTitle)
    const header_mark = "#"
    const search_title = header_mark + " " + description_title;
    let description_title_offset = sourceText.indexOf(search_title);
    if (description_title_offset<0) {
        throw new Error(`Chapter '${description_title}' not found`)
    }
    description_title_offset = description_title_offset + 3; // add line feeds

    let description_text = sourceText.substring(description_title_offset + description_title.length,sourceText.length).trim();
    let descpription_length = sourceText.length;
    descpription_length = description_text.indexOf(header_mark);
    description_text = description_text.substring(0, descpription_length).trim();
    return description_text;
}

/**
 * Reads the file (usually app's readme.md) containing app's brief description
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
function getProjectDescription (project:any,params:Params):Promise<string> {
    return new Promise<string>(async (resolve) => {
        const inputFile:string = path.join(String(params.repoDir),project.root, "readme.md");
        fse.readFile(inputFile, (error:any, data:any) => {
            if (error) {
                console.warn(`cannot read file (${error})`)
                resolve("no descrption due to missing file")
            }else{
                try{
                    resolve(extractProjectDescription(data.toString(),params))
                }catch(error){
                    console.warn(`no description due to ${error} in file ${inputFile}`)
                    resolve(`no description`)
                }
            }
        })
    })
}

/**
 * Adds a property 'repodocDescription' to all project objects
 * 
 * @param   {any} projects  an object with enumerable string objects (an object for each project, angular.json structure)
 * @param   {Params} params   parameters for controlling app's run
 * 
 * @returns the projects input object enriched with 'repodocDescription' property for each project/app
 * 
 */

function addProjectDescriptions(projects:any, params:Params):Promise<any> {

    return new Promise((resolve) => {
        const keys:string[] = Object.keys(projects);
        Promise.all(keys.map((key:string, index:number) => getProjectDescription(projects[key], params)))
            .then((repodocDescriptions:string[]) => {
                keys.map((key, index) => projects[key].repodocDescription = repodocDescriptions[index]);
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
function fetchProjectDocs (projectName:string, project:any, params:Params):Promise<string> {
    return new Promise<string>(async (resolve) => {
        const inputDir = path.join(String(params.repoDir), project.root, String(params.projectsDocsDir));
        if (!fsu.dirExists(inputDir)){
            console.warn(`${inputDir} does not exits`)
            resolve(projectName)
            return
        }
        if (params.copyProjectsDocs){
            fse.copy(inputDir, path.join(String(params.outputDir), projectName, String(params.projectsDocsDir)), function (error) {
                if (error){
                    console.warn(`cannot copy ${inputDir} to ${path.join(String(params.outputDir), projectName)} due to ${error}`)
                    resolve(projectName)
                }else{
                    resolve('<a href="' + path.join(projectName, String(params.projectsDocsDir), "index.html") + '">' + projectName + '</a>')
                }
            });            
        }else{
            resolve(inputDir)
        }
    })
}

function fetchProjectsDocs(projects:any, params:Params):Promise<any> {

    return new Promise((resolve) => {
        const keys:string[] = Object.keys(projects);
        Promise.all(keys.map((key:string) => fetchProjectDocs(key, projects[key], params)))
            .then((repodocReferences:string[]) => {
                keys.map((key, index) => projects[key].repodocReference = repodocReferences[index]);
                resolve(projects);
            })
    })
}

/**
 * Compiles the html template
 * 
 * @param {any}     template    compile function
 * @param {any}     projects    projects objects
 * 
 * @returns {string} html string
 * 
 */
function createHtmlString(template:any, projects:any):Promise<string>{
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
function writeHtmlFile(htmlString:string, outputDir:string, outputFile:string):Promise<string>{
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
