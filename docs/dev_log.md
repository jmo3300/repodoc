# Repodoc - Development Log

## Prerequisites

nodejs, typescript are installed globally.

## Create Project/Application

Create project

        md repodoc
        cd repodoc

        npm init -y

Adopt package.json accordingly (description and version)

## Preparation

Initialize typescript (create tsconfig.ts)

        tsc --init

Change tsconfig.ts

    "outDir": "./build",                        /* Redirect output structure to the directory. */
    "rootDir": "./src",                       /* Specify the root directory of input files. Use to control the output directory structure with

Create the src directory approtriately. build directory will be created during comilation. 

        md src

Install dependencies according article

        npm install chai mocha ts-node @types/chai @types/mocha --save-dev

## Implementation

### Preparation

repodoc uses

- repoDir:string // path to mono repo
- projectsFile:string // path to the file which contains the JSON object 'projects' (default angular.json)
- templatesDir:string; // path to template file(s) (default template)
- templateFile:string // template file name for creating outfile (default index.hbs)
- outputDir:string // path to output directory for summarized documentation (default repodoc)
- outputFile:string // path to landing page of summarized documentation to be created (default index.html)

outputDir will be created if it does not exist.

outputFile creation is core purpose of repodoc, so it will also be created. if it exists it will be overwritten.

repoDir, projectsFile and templatesDir, templateFile must exist.

So create 

- example (as repoDir), angular.json (as projectsFile)

        md example
        cd example
        touch angular.json // an empty file is enough as projectsfile at the moment for cli
        cd..

- templates (as templateDir), index.hbs (as projectsFile)

        md templates
        cd templates
        touch index.hbs (an empty file is enough as template file at the moment for cli)
        cd..


// TODO: complete and finalize initial dev_log


## 0.0.15

### Make '"strict": true' possible

So, eleminate type 'any' in terms of projects

implement and add Interfaces 'Project' and 'Projects'

eleminate "Object.keys(paramsDefault).map((key: string) => params[key] = args[key]);"

Now, full '"strict": true' is possible.

This in turn avoids to accept implicite any (before "noImplicitAny": false has been necessary due to projects:any and keys...)
