# Repodoc

## Project Purpose

Repodoc creates an app index for a (angular) monorepo/multiapp project. 

Assembles docs of all apps. 

## Implementation Approach / Plan

Repodoc
- finds the apps of a monorepo and their details within the angular.json of monorepo
- extracts the text of the chapter "Project Purpose" of the readme.md of each app
- copies the app's docs (if desired)
- creates an html file based on a handlebar template with a list of all apps containing
    - a link to app's docs (either copied docs or original docs)
    - app's brief description (based its readme.md, there the text of the chapter 'Project Purpose')

## Implementation / Realization

See Development Log.
