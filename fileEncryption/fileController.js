

// var key = 'reejfiunfowifnwopnjihbvhnjkjhghjkjhghjuygbnjuygbnjuygtvbnjuytgfvbnjuytgvbnjuygmopmp';

const fs = require('fs');
const readline = require('readline');
const { encrypt, decrypt, encryptPath, decryptPath } = require('./encrypt');
var mkdirp = require('mkdirp');
const dirTree = require('directory-tree');
var util = require('util');
var path = require('path')
var shell = require('shelljs');
var recursive = require("recursive-readdir");
var deasync =  require('deasync');

// Given encryptFile("./files/some/ha.txt", "prXYpROZmmZadQTVrpOu9nDRqXu2MajbxnHPOXbHUDdHbhC6PNvlCZMLSMrSfLVu");
// this works. it creates the directories, and stores the file into them.
function encryptFile(fileToEncrypt,key) {
    let encryptedFile = encryptPath(fileToEncrypt, key);
    createDirs("./.git_repo/"+encryptedFile);
    const readFile = readline.createInterface({
        input: fs.createReadStream(fileToEncrypt),
        output: fs.createWriteStream("./.git_repo/"+encryptedFile),
        terminal: false
      });
    readFile
      .on('line', async function(line) {
          await this.output.write(`${encrypt(line, key)}\n`);
    })
      .on('close', function() {
    });
}


// this works no with the  decryptFile("./[[[[e4bbb2135b]]]]/[[[[f1bdb313]]]]/[[[[eab3f00250eb]]]]", "prXYpROZmmZadQTVrpOu9nDRqXu2MajbxnHPOXbHUDdHbhC6PNvlCZMLSMrSfLVu");
function decryptFile(encryptedFile,key) {
    let fileToEncrypt = decryptPath(encryptedFile.replace(".git_repo/", ""), key);
    createDirs(fileToEncrypt);
    // So far, the folders are created and the complete path is correctly decrypted from the name.
    var parentDir = path.resolve(process.cwd(), '..');
    const readFile = readline.createInterface({
        input: fs.createReadStream(encryptedFile), // THE TREE PASSES IN ALL OF THE PATHS ALREADY WITH .git_repo. NO NEED TO ADD THAT
        output: fs.createWriteStream(fileToEncrypt),
        terminal: false
      });
    readFile
      .on('line', async function(line) {
          console.log({line, decrypt: decrypt(line, key)});
          await this.output.write(`${decrypt(line, key)}\n`);
    })
      .on('close', function() {
    });
}



function createDirs(path) {
    if(path.substring(0,2) == "./") path = path.slice(2); // if starts with './', dispose of the beginning;
    let dirs = path.split("/");
    if(dirs.length == 1) return;
    shell.mkdir('-p',  dirs.slice(0, -1).join("/")); // create a complete path, but dispose of last thing in array since thats file;
}


async function getFiles(path) {
    // let arr;
    return new Promise((resolve, reject) => {
        recursive(path, ["node_modules", ".git",".gcn",".git_repo",".DS_Store"], function (err, files) {
            resolve(files);
        });
    });
}


// getFiles(".");

// (async function() {
//     let x = await getFiles(".");
//     console.log(x)
// })

async function syncEncryptDirs(password) {
    let filesdot = await getFiles(".");
    const srcSet = new Set(filesdot);
    let files = await getFiles("./.git_repo/")
    const targetMap = files.reduce(function(a, b){
        let stats = fs.statSync(b);
        a.set(b.split("/").slice(1).join("/"), new Date(util.inspect(stats.mtime)));
        return a;
    }, new Map());

    for(let file of srcSet) {
        let stats = fs.statSync(file);
        let time = new Date(util.inspect(stats.mtime));
        if(!targetMap.has(encrypt(file, password)) || targetMap.get(encrypt(file, password)) < time)  {
            encryptFile(file, password);
        }
        targetMap.delete(encryptPath(file, password))
    }

    if(targetMap.size != 0) {
        for(let [key, value] of targetMap ) {
            if(fs.existsSync("./.git_repo/" + key)) {
                await fs.unlinkSync("./.git_repo/" + key);
            }
        }
    }
}


async function syncDecryptDirs(password) {
    const targetArray = await getFiles("./.git_repo/");
    console.log({targetArray});
    for(let i = 0; i < targetArray.length; i +=1) {
        await decryptFile(targetArray[i], password);
    }
}



module.exports.getFiles = getFiles;
module.exports.encryptFile = encryptFile;
module.exports.decryptFile = decryptFile;
module.exports.syncEncryptDirs = syncEncryptDirs;
module.exports.syncDecryptDirs = syncDecryptDirs;
