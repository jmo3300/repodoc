"use strict";
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
require("mocha");
var chai_1 = __importDefault(require("chai"));
var expect = chai_1.default.expect;
var chai_as_promised_1 = __importDefault(require("chai-as-promised"));
chai_1.default.use(chai_as_promised_1.default);
var rimraf_1 = __importDefault(require("rimraf"));
var doc_1 = __importDefault(require("./doc"));
var config_1 = require("./config");
beforeEach(function () { return __awaiter(void 0, void 0, void 0, function () {
    return __generator(this, function (_a) {
        rimraf_1.default("./repodoc", function () { });
        rimraf_1.default("./repodoc.json", function () { });
        return [2 /*return*/];
    });
}); });
describe('createDoc() with default Parameters', function () {
    it("should return 'html file saved to repodoc\\index.html'", function () { return __awaiter(void 0, void 0, void 0, function () {
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    rimraf_1.default("./repodoc", function () { });
                    rimraf_1.default("./repodoc.json", function () { });
                    return [4 /*yield*/, expect(doc_1.default(config_1.paramsDefault)).eventually.equal("html file saved to repodoc\\index.html")];
                case 1:
                    _a.sent();
                    return [2 /*return*/];
            }
        });
    }); });
});
describe('createDoc() with invalid input parameters (repoDir, projectsFile, templatesDir, templateFile)', function () {
    it("should throw error 'projects file 'example\\wrongFile'does not exist'", function () { return __awaiter(void 0, void 0, void 0, function () {
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, expect(doc_1.default({
                        copyProjectsDocs: true,
                        repoDir: 'example',
                        projectsFile: "wrongFile",
                        projectsDocsDir: "compodoc",
                        projectsDescriptionTitle: "Overview",
                        templatesDir: 'templates',
                        templateFile: "index.hbs",
                        outputDir: 'repodoc',
                        outputFile: 'index.html'
                    })).to.be.rejectedWith("projects file \'example\\wrongFile\' does not exist")];
                case 1:
                    _a.sent();
                    return [2 /*return*/];
            }
        });
    }); });
    it("should throw error 'repository directory 'wrongDir' is not valid'", function () { return __awaiter(void 0, void 0, void 0, function () {
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, expect(doc_1.default({
                        copyProjectsDocs: true,
                        repoDir: 'wrongDir',
                        projectsFile: "angular.json",
                        projectsDocsDir: "compodoc",
                        projectsDescriptionTitle: "Overview",
                        templatesDir: 'templates',
                        templateFile: "index.hbs",
                        outputDir: 'repodoc',
                        outputFile: 'index.html'
                    })).to.be.rejectedWith("repository directory \'wrongDir\' is not valid")];
                case 1:
                    _a.sent();
                    return [2 /*return*/];
            }
        });
    }); });
    it("should throw error 'templates directory 'wrongDir' is not valid'", function () { return __awaiter(void 0, void 0, void 0, function () {
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, expect(doc_1.default({
                        copyProjectsDocs: true,
                        repoDir: 'example',
                        projectsFile: "angular.json",
                        projectsDocsDir: "compodoc",
                        projectsDescriptionTitle: "Overview",
                        templatesDir: 'wrongDir',
                        templateFile: "index.hbs",
                        outputDir: 'repodoc',
                        outputFile: 'index.html'
                    })).to.be.rejectedWith("templates directory \'wrongDir\' is not valid")];
                case 1:
                    _a.sent();
                    return [2 /*return*/];
            }
        });
    }); });
    it("should throw error 'template file 'templates\\wrongFile' does not exist", function () { return __awaiter(void 0, void 0, void 0, function () {
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, expect(doc_1.default({
                        copyProjectsDocs: true,
                        repoDir: 'example',
                        projectsFile: "angular.json",
                        projectsDocsDir: "compodoc",
                        projectsDescriptionTitle: "Overview",
                        templatesDir: 'templates',
                        templateFile: "wrongFile",
                        outputDir: 'repodoc',
                        outputFile: 'index.html'
                    })).to.be.rejectedWith("template file 'templates\\wrongFile' does not exist")];
                case 1:
                    _a.sent();
                    return [2 /*return*/];
            }
        });
    }); });
});
//# sourceMappingURL=doc.spec.js.map