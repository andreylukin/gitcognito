

// var key = 'reejfiunfowifnwopnjihbvhnjkjhghjkjhghjuygbnjuygbnjuygtvbnjuytgfvbnjuytgvbnjuygmopmp';

const fs = require('fs');
const readline = require('readline');
const { encrypt, decrypt, encryptPath, decryptPath } = require('./encrypt');
var mkdirp = require('mkdirp');
const dirTree = require('directory-tree');


function encryptFile(fileToEncrypt,key) {
  // console.log("encrypting",fileToEncrypt);
    let encryptedFile = encryptPath(fileToEncrypt, key);
    createDirs("./.git_repo/"+encryptedFile);
    const readFile = readline.createInterface({
        input: fs.createReadStream(fileToEncrypt),
        output: fs.createWriteStream("./.git_repo/"+encryptedFile),
        terminal: false
      });
    readFile
      .on('line', function(line) {
          this.output.write(`${encrypt(line, key)}\n`);
          // console.log("written");
    })
      .on('close', function() {
        // console.log(`Created "${this.output.path}"`);
    });
}

function decryptFile(encryptedFile,key) {
    let fileToEncrypt = decryptPath(encryptedFile, key);
    createDirs(fileToEncrypt);
    const readFile = readline.createInterface({
        input: fs.createReadStream(encryptedFile),
        output: fs.createWriteStream(fileToEncrypt),
        terminal: false
      });
    readFile
      .on('line', function(line) {
          this.output.write(`${decrypt(line, key)}\n`);
    })
      .on('close', function() {
        // console.log(`Created "${this.output.path}"`);
    });
}


function createDirs(path) {
    let dirs = path.split("/");
    if(path.charAt(path.length - 1) == '/') {
        mkdirp.sync(dirs.splice(0, dirs.length - 2).join("/"));
    } else {
        mkdirp.sync(path.split("/").splice(0, dirs.length - 1).join("/"));
    }
}


function getFiles(path) {
    return getFilesHelper(dirTree(path), []);
}


const ignore = ["node_modules", ".git",".gcn",".git_repo",".DS_Store"];

function getFilesHelper(tree, array) {
    if(tree.children == undefined || tree.children.length == 0 ) {
        array.push(tree.path)
        return array;
    };
    for(let i = 0; i< tree.children.length; i+=1) {
        if(!ignore.includes(tree.children[i].name)) {
            getFilesHelper(tree.children[i], array);
        }
    }
    return array;
}


module.exports.getFiles = getFiles;
module.exports.encryptFile = encryptFile;
module.exports.decryptFile = decryptFile;
