

var key = 'reejfiunfowifnwopnjihbvhnjkjhghjkjhghjuygbnjuygbnjuygtvbnjuytgfvbnjuytgvbnjuygmopmp';

const fs = require('fs');
const readline = require('readline');
const { encrypt, decrypt, encryptPath, decryptPath } = require('./encrypt');
var mkdirp = require('mkdirp');


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




module.exports.encryptFile = encryptFile;
module.exports.decryptFile = decryptFile;
