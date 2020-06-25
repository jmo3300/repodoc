"use strict";
/**
 * Creates the Documentation
 *
 * createDoc(params:Params) is the (only) entry point of this module.
 *
 * @packageDocumentation
 */
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createDoc = void 0;
var fs_extra_1 = __importDefault(require("fs-extra"));
var path_1 = __importDefault(require("path"));
var handlebars_1 = __importDefault(require("handlebars"));
var fsu = __importStar(require("./fsUtils"));
/**
 * Creates the Documentation, in detail:
 *
 * - creates html file with an entry for each app including
 *   - a link to app's documentation
 *   - brief description of the app fetched app's from readme.md
 *   - other details of the app availabe in the projects file (usually angular.json)
 *
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
function createDoc(params) {
    Promise.all([
        getTemplate(params),
        getProjects(params)
            .then(function (projects) { return addProjectDescriptions(projects, params); })
            .then(function (projects) { return fetchProjectsDocs(projects, params); })
    ])
        .then(function (values) {
        var template = values[0];
        var projects = values[1];
        return createHtmlString(template, projects);
    })
        .then(function (htmlString) { return writeHtmlFile(htmlString, params); })
        .then(console.log)
        .catch(function (error) { throw error; });
}
exports.createDoc = createDoc;
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
function getTemplate(params) {
    return new Promise(function (resolve, reject) {
        fs_extra_1.default.readFile(path_1.default.join(String(params.templatesDir), String(params.templateFile)), function (error, data) {
            if (error) {
                reject("cannot read template file (" + error.message + ")");
                return;
            }
            resolve(handlebars_1.default.compile(data.toString()));
        });
    });
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
function getProjects(params) {
    return new Promise(function (resolve, reject) {
        var inputFile = path_1.default.join(String(params.repoDir), String(params.projectsFile));
        fs_extra_1.default.readFile(inputFile, function (error, data) {
            if (error) {
                reject("cannot read projects file (" + error.message + ")");
                return;
            }
            try {
                var projects = JSON.parse(data).projects;
                if (projects === undefined || Object.keys(projects).length < 1) {
                    reject(new Error("file " + inputFile + " contains no project(s)\"").message);
                    return;
                }
                resolve(projects);
            }
            catch (error) {
                reject(new Error("file " + path_1.default.join(inputFile) + " contains no valid JSON\"").message);
            }
        });
    });
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
function extractProjectDescription(sourceText, params) {
    var description_title = String(params.projectsDescriptionTitle);
    var header_mark = "#";
    var search_title = header_mark + " " + description_title;
    var description_title_offset = sourceText.indexOf(search_title);
    if (description_title_offset < 0) {
        throw new Error("Chapter '" + description_title + "' not found");
    }
    description_title_offset = description_title_offset + 3; // add line feeds
    var description_text = sourceText.substring(description_title_offset + description_title.length, sourceText.length).trim();
    var descpription_length = sourceText.length;
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
function getProjectDescription(project, params) {
    return new Promise(function (resolve) {
        var inputFile = path_1.default.join(String(params.repoDir), project.root, "readme.md");
        fs_extra_1.default.readFile(inputFile, function (error, data) {
            if (error) {
                console.warn("cannot read file (" + error + ")");
                resolve("no descrption due to missing file");
            }
            else {
                try {
                    resolve(extractProjectDescription(data.toString(), params));
                }
                catch (error) {
                    console.warn("no description due to " + error + " in file " + inputFile);
                    resolve("no description");
                }
            }
        });
    });
}
/**
 * Enriches each project of the 'projects' object with the property 'repodocDescription'
 *
 * @param   {any} projects  an object with enumerable string objects (an object for each project, angular.json structure)
 * @param   {Params} params   parameters for controlling app's run
 *
 * @returns the projects input object enriched with 'repodocDescription' property for each project/app
 *
 * throws no error(s)
 *
 */
function addProjectDescriptions(projects, params) {
    return new Promise(function (resolve) {
        var keys = Object.keys(projects);
        Promise.all(keys.map(function (key, index) { return getProjectDescription(projects[key], params); }))
            .then(function (repodocDescriptions) {
            keys.map(function (key, index) { return projects[key].repodocDescription = repodocDescriptions[index]; });
            resolve(projects);
        });
    });
}
/**
 * Enriches each project of the 'projects' object with the property 'repodocReference'
 *
 * Calls for each project/app **fetchProjectDocs (projectName, project, params)** which
 *
 * - prepares the reference
 * - handles the copying of apps' docs
 *
 * @param   {Object}       projects       Object with all projects (see structure of angular.json)
 * @param   {Params}       outputDir      Object with all parameters needed for documentation creation process
 *
 * @returns {Object}  the input object 'projects' enriched with with property 'repodocReference' for each project/app
 *
 * throws no errors
 *
 */
function fetchProjectsDocs(projects, params) {
    return new Promise(function (resolve) {
        var keys = Object.keys(projects);
        Promise.all(keys.map(function (key) { return fetchProjectDocs(key, projects[key], params); }))
            .then(function (repodocReferences) {
            keys.map(function (key, index) { return projects[key].repodocReference = repodocReferences[index]; });
            resolve(projects);
        });
    });
}
/**
 * Copies apps' docs, if desired (copyProjectsDocs=true is default)
 *
 * Prepares the link to the apps' docs. The link will
 *
 * - leads either
 *
 *   - to apps' docs copy, if a copy is desired/exists or
 *   - to the apps' origine docs
 *
 * - not be prepared, if docs of an app do not exist
 *
 * @param   {string}    projectName       Name of the project, is part of destination path of a potential copy
 * @param   {any}       project           Object with all project details (see structure of angular.json)
 *                                        particually project's root directory which is also part of destination path of a potential copy
 * @param   {boolean}   copyProjectsDocs  true => function copies apps' docs and leads the link to the copy
 *                                        false => function does not copy the apps' docs and leads to the apps' origine docs
 * @param   {string}    outputDir         directory the apps' docs will be copied to
 *
 * @returns {string}    reference to apps' docs (e.g. <a href="path-to-apps-docs/index.html">projectName</a>) or
 *                      only projectName, if there are no docs for an app or the docs cannot be copied
 *
 * throws no errors
 *
 */
function fetchProjectDocs(projectName, project, params) {
    return new Promise(function (resolve) {
        var inputDir = path_1.default.join(String(params.repoDir), project.root, String(params.projectsDocsDir));
        if (!fsu.dirExists(inputDir)) {
            console.warn(inputDir + " does not exits");
            resolve(projectName);
            return;
        }
        if (params.copyProjectsDocs) {
            fs_extra_1.default.copy(inputDir, path_1.default.join(String(params.outputDir), projectName, String(params.projectsDocsDir)), function (error) {
                if (error) {
                    console.warn("cannot copy " + inputDir + " to " + path_1.default.join(String(params.outputDir), projectName) + " due to " + error);
                    resolve(projectName);
                }
                else {
                    resolve('<a href="' + path_1.default.join(projectName, String(params.projectsDocsDir), "index.html") + '">' + projectName + '</a>');
                }
            });
        }
        else {
            resolve('<a href="' + path_1.default.join("..", inputDir, "index.html") + '">' + projectName + '</a>');
        }
    });
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
function createHtmlString(template, projects) {
    return new Promise(function (resolve) { return resolve(template({ project: projects })); });
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
function writeHtmlFile(htmlString, params) {
    return new Promise(function (resolve, reject) {
        var outputFile = path_1.default.join(String(params.outputDir), String(params.outputFile));
        fs_extra_1.default.writeFile(outputFile, htmlString, function (error) {
            if (error) {
                reject(error);
                return;
            }
            resolve("html file saved to " + outputFile);
        });
    });
}
//# sourceMappingURL=doc.js.map