

var key = 'reejfiunfowifnwopnjihbvhnjkjhghjkjhghjuygbnjuygbnjuygtvbnjuytgfvbnjuytgvbnjuygmopmp';

const fs = require('fs');
const readline = require('readline');
const { encrypt, decrypt, encryptPath, decryptPath } = require('./encrypt');
var mkdirp = require('mkdirp');
const dirTree = require('directory-tree');


function encryptFile(fileToEncrypt) {
    let encryptedFile = encryptPath(fileToEncrypt, key);
    createDirs(encryptedFile);
    const readFile = readline.createInterface({
        input: fs.createReadStream(fileToEncrypt),
        output: fs.createWriteStream(encryptedFile),
        terminal: false
      });
    readFile
      .on('line', function(line) {
          this.output.write(`${encrypt(line, key)}\n`);
    })
      .on('close', function() {
        console.log(`Created "${this.output.path}"`);
    });
}

function decryptFile(encryptedFile) {
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
        console.log(`Created "${this.output.path}"`);
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


const tree = dirTree('./');

const ignore = ["node_modules", ".git"]

function getFiles(tree, array) {
    if(tree.children == undefined || tree.children.length == 0 ) {
        array.push(tree.path)
        return array;
    };
    for(let i = 0; i< tree.children.length; i+=1) {
        if(!ignore.includes(tree.children[i].name)) {
            getFiles(tree.children[i], array);
        }
    }
    return array;
}



module.exports.encryptFile = encryptFile;
module.exports.decryptFile = decryptFile;
