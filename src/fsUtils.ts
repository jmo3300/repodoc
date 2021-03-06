/**
 * Some functions for ease file handling in the context of Repodoc
 * @packageDocumentation
 */


import fs from 'fs';
import validFilename from 'valid-filename';

export function dirExists(filePath:string):boolean {
  return fs.existsSync(filePath) && fs.lstatSync(filePath).isDirectory()
}
export function fileExists(filePath:string):boolean {
  return fs.existsSync(filePath) && fs.lstatSync(filePath).isFile()
}

export function isValidFilename(fileName:string):boolean {
  return validFilename(fileName);
}

// TODO: use a more appropriate check
export function isValidDirectoryName(dirName:string):boolean {
  return validFilename(dirName);
}

export function dirCreate(filePath:string):boolean {
  if (fs.existsSync(filePath)){
    return true;
  }else
    try {
      fs.mkdirSync(filePath)
      return true;
    }catch(e) {
      return false;
    }
}
