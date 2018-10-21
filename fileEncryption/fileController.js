

// var key = 'reejfiunfowifnwopnjihbvhnjkjhghjkjhghjuygbnjuygbnjuygtvbnjuytgfvbnjuytgvbnjuygmopmp';

const fs = require('fs');
const readline = require('readline');
const { encrypt, decrypt, encryptPath, decryptPath } = require('./encrypt');
var mkdirp = require('mkdirp');
const dirTree = require('directory-tree');
var util = require('util');
var p = require('path')
var shell = require('shelljs');
var recursive = require("recursive-readdir");
var deasync =  require('deasync');

// Given encryptFile("./files/some/ha.txt", "prXYpROZmmZadQTVrpOu9nDRqXu2MajbxnHPOXbHUDdHbhC6PNvlCZMLSMrSfLVu");
// this works. it creates the directories, and stores the file into them.
function encryptFile(fileToEncrypt,key) {
    let encryptedFile = encryptPath(fileToEncrypt, key);
    createDirs("./.git_repo"+encryptedFile);
    const readFile = readline.createInterface({
        input: fs.createReadStream(fileToEncrypt),
        output: fs.createWriteStream("./.git_repo"+encryptedFile),
        terminal: false
      });
    readFile
      .on('line', function(line) {
        this.output.write(`${encrypt(line, key)}\n`);
    })
      .on('close', function() {
    });
}

// works with directories with this decryptFile(".git_repo/ihtmmjhseab7b21a47hgpumjhn/lltnnikveabbf00250ebgitvnlkv", "prXYpROZmmZadQTVrpOu9nDRqXu2MajbxnHPOXbHUDdHbhC6PNvlCZMLSMrSfLVu");
// or decryptFile("./ihtmmjhseab7b21a47hgpumjhn/lltnnikveabbf00250ebgitvnlkv", "prXYpROZmmZadQTVrpOu9nDRqXu2MajbxnHPOXbHUDdHbhC6PNvlCZMLSMrSfLVu");
function decryptFile(encryptedFile,key) {
    if(encryptedFile.substring(0,2) == "./" && encryptedFile.substring(0,11) != ".git_repo") encryptedFile = ".git_repo/" + encryptedFile.slice(2);
    let fileToEncrypt = decryptPath(encryptedFile.replace(".git_repo", ""), key);
    createDirs(fileToEncrypt);
    // So far, the folders are created and the complete path is correctly decrypted from the name.
    const readFile = readline.createInterface({
        input: fs.createReadStream(encryptedFile), // THE TREE PASSES IN ALL OF THE PATHS ALREADY WITH .git_repo/. NO NEED TO ADD THAT
        output: fs.createWriteStream(fileToEncrypt),
        terminal: false
      });
    readFile
      .on('line', function(line) {
        this.output.write(`${decrypt(line, key)}\n`);
    })
      .on('close', function() {
    });
}

// decryptFile(".git_repo/ihtmmjhseab7b21a47b1a246adhgpumjhn","prXYpROZmmZadQTVrpOu9nDRqXu2MajbxnHPOXbHUDdHbhC6PNvlCZMLSMrSfLVu");

function createDirs(path) {
    if(path.substring(0,2) == "./") path = path.slice(2); // if starts with './', dispose of the beginning;
    let dirs = path.split("/");
    if(dirs.length == 1) return;
    shell.mkdir('-p',  dirs.slice(0, -1).join("/")); // create a complete path, but dispose of last thing in array since thats file;
}


function getFiles(path) {
    const set = new Set(["node_modules", ".git",".gcn",".git_repo/",".DS_Store"]);
    var list = []
    , files = fs.readdirSync(path)
    , stats
    ;
    
    files.forEach(function (file) {
    stats = fs.lstatSync(p.join(path, file));
    if(!set.has(file) && file.charAt(0) != ".") {
        if(stats.isDirectory()) {
            list = list.concat(getFiles(p.join(path, file)));
            } else {
            list.push(p.join(path, file));
            }
    }
    });
    
    return list;
}


// fucking works syncEncryptDirs("prXYpROZmmZadQTVrpOu9nDRqXu2MajbxnHPOXbHUDdHbhC6PNvlCZMLSMrSfLVu");
function syncEncryptDirs(password) {
    let filesdot = getFiles(".");
    const srcSet = new Set(filesdot);
    let files = getFiles("./.git_repo")
    const targetMap = files.reduce(function(a, b){
        let stats = fs.statSync(b);
        a.set(b.split("/").slice(1).join("/"), new Date(util.inspect(stats.mtime)));
        return a;
    }, new Map());

    for(let file of srcSet) {
        let stats = fs.statSync(file);
        let time = new Date(util.inspect(stats.mtime));
        if(file != "./.git_repo" && !targetMap.has(encrypt(file, password)) || targetMap.get(encrypt(file, password)) < time)  {
            encryptFile(file, password);
        }
        targetMap.delete(encryptPath(file, password))
    }

    if(targetMap.size != 0) {
        for(let [key, value] of targetMap ) {
            if(fs.existsSync("./.git_repo" + key)) {
                fs.unlinkSync("./.git_repo" + key);
            }
        }
    }
}

// this works syncDecryptDirs("prXYpROZmmZadQTVrpOu9nDRqXu2MajbxnHPOXbHUDdHbhC6PNvlCZMLSMrSfLVu");
function syncDecryptDirs(password) {
    const targetArray =  getFiles("./.git_repo");
    console.log(targetArray);
    for(let i = 0; i < targetArray.length; i +=1) {
        decryptFile(targetArray[i], password);
    }
}




module.exports.getFiles = getFiles;
module.exports.encryptFile = encryptFile;
module.exports.decryptFile = decryptFile;
module.exports.syncEncryptDirs = syncEncryptDirs;
module.exports.syncDecryptDirs = syncDecryptDirs;
