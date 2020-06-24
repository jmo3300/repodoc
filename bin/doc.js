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
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
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
        getTemplate(String(params.templatesDir), String(params.templateFile)),
        getProjects(String(params.repoDir), String(params.projectsFile))
            .then(function (projects) { return addProjectDescriptions(projects, params); })
            .then(function (projects) { return fetchProjectsDocs(projects, params); })
    ])
        .then(function (values) {
        var template = values[0];
        var projects = values[1];
        return createHtmlString(template, projects);
    })
        .then(function (htmlString) { return writeHtmlFile(htmlString, String(params.outputDir), String(params.outputFile)); })
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
function getTemplate(templatesDir, templateFile) {
    return new Promise(function (resolve, reject) {
        fs_extra_1.default.readFile(path_1.default.join(templatesDir, templateFile), function (error, data) {
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
function getProjects(repoDir, projectsFile) {
    return new Promise(function (resolve, reject) {
        fs_extra_1.default.readFile(path_1.default.join(repoDir, projectsFile), function (error, data) {
            if (error) {
                reject("cannot read projects file (" + error.message + ")");
                return;
            }
            try {
                var projects = JSON.parse(data).projects;
                if (projects === undefined || Object.keys(projects).length < 1) {
                    reject(new Error("file " + path_1.default.join(repoDir, projectsFile) + " contains no project(s)\"").message);
                    return;
                }
                resolve(projects);
            }
            catch (error) {
                reject(new Error("file " + path_1.default.join(repoDir, projectsFile) + " contains no valid JSON\"").message);
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
    var _this = this;
    return new Promise(function (resolve) { return __awaiter(_this, void 0, void 0, function () {
        var inputFile;
        return __generator(this, function (_a) {
            inputFile = path_1.default.join(String(params.repoDir), project.root, "readme.md");
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
            return [2 /*return*/];
        });
    }); });
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
function fetchProjectDocs(projectName, project, params) {
    var _this = this;
    return new Promise(function (resolve) { return __awaiter(_this, void 0, void 0, function () {
        var inputDir;
        return __generator(this, function (_a) {
            inputDir = path_1.default.join(String(params.repoDir), project.root, String(params.projectsDocsDir));
            if (!fsu.dirExists(inputDir)) {
                console.warn(inputDir + " does not exits");
                resolve(projectName);
                return [2 /*return*/];
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
                resolve(inputDir);
            }
            return [2 /*return*/];
        });
    }); });
}
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
function writeHtmlFile(htmlString, outputDir, outputFile) {
    return new Promise(function (resolve, reject) {
        fs_extra_1.default.writeFile(path_1.default.join(outputDir, outputFile), htmlString, function (error) {
            if (error) {
                reject(error);
                return;
            }
            resolve("html file saved to " + path_1.default.join(outputDir, outputFile));
        });
    });
}
//# sourceMappingURL=doc.js.map