// create documentation
const TypeDoc = require('typedoc');
const app = new TypeDoc.Application();
// runs with "npx ./scripts/doc.js" 
// but not with npm run doc (when package.json contains "scripts": {... "doc":"scripts/doc.js" ...})
app.bootstrap({
    mode: 'modules',
    exclude: "**/*+(index|.spec|.e2e).ts",    
    ignoreCompilerErrors: true,
    // logger: 'none',
    target: 'ES5',
    module: 'CommonJS',
    experimentalDecorators: true
});

const project = app.convert(app.expandInputFiles(['src']));

if (project) { // Project may not have converted correctly
    const outputDir = 'docs/html';
    app.generateDocs(project, outputDir);
}

// fetch graphics 
// (for using the same reference to graphics/assets within README.md for npm/git and typodoc
const cpx = require('cpx')
cpx.copySync("docs/assets/**/*", "docs/html/docs/assets");
