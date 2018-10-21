const {encrypt, decrypt, constructDelims} = require('../fileEncryption/encrypt');
const {getFiles, encryptFile, syncEncryptDirs,syncDecryptDirs} = require('../fileEncryption/fileController');
const {mkdirp} = require('mkdirp');
const fs = require('fs');
const uuidv1 = require('uuid/v1');

var delims = constructDelims();
console.log(delims);
var front = delims.map(pair => pair.begin);
var back = delims.map(pair => pair.end);
var regex = new RegExp('('+front.join("|")+')(.*?)('+back.join("|")+')', 'g')

function assembleEncyptedCommand(args,password,offset) {
  var unencrypted = args._.splice(0,offset+1).join(" ");
  var encrypted = args._.map(function(str){
    keywords = ['.', 'HEAD', 'origin','-','--','clear','set-url', 'remote','add'];
    url_match = /^((http[s]?|ssh|ftp):\/)?\/?([^:\/\s]+)((\/\w+)*\/)([\w\-\.]+[^#?\s]+)(.*)?(#[\w\-]+)?$/g;
    if(!(keywords.indexOf(str) >= 0) && !url_match.test(str)) {
      return "\""+encrypt(str,password)+"\"";
    } else {
      return str;
    }
  }).join(" ");
  const scenes = ['diff','status', 'branch', 'interactive', 'ui'];
  color_opts= '-c color.'+scenes.join('=always -c color.')+'=always ';
  line = 'git '+color_opts+unencrypted+" "+encrypted;

  for(var p in args) {
    if(!(p==="_")) {
      if(args.hasOwnProperty(p)) {
        if(p.length > 1) {
          line += " --";
        } else {
          line += " -";
        }
        line += p;
        if(typeof(args[p]) === "string") {
          line += ' "'+encrypt(args[p],password)+'" ';
        } else if(typeof(args[p]) === "boolean") {
          line += ' ';
        } else {
          line += ' '+args[p];
        }
      }
    }
  }
  console.log(line)
  return line;
}


function makeDotFile(password) {
  let data = JSON.stringify({
    password : password
  });

  fs.writeFileSync('.gcn', data);

}

function decrypt_tokens(string,password) {

  var git_reg = /\b[Gg]it\b/g;
  string = string.replace(git_reg, "gcn");

  var components = string.split(regex);
  for(var i=0; i < components.length; i++) {
    if(front.indexOf(components[i]) >= 0) {
      components[i] = "";
      components[i+1] = decrypt(components[i+1],password);
      components[i+2] = "";
      i+=2;
    }
  }

  process.stdout.write(components.join(""));

}


function init(args) {

  if (fs.existsSync(".gcn")) {
      console.log("reinit");
      // TODO
      return;
  }

  var password;
  if(args.p) {
    password = args.p;
  } else {
    var generator = require('generate-password');

    password = "prXYpROZmmZadQTVrpOu9nDRqXu2MajbxnHPOXbHUDdHbhC6PNvlCZMLSMrSfLVu";
  }

  makeDotFile(password);
  mkdirp.sync('.git_repo');

}

function clone(args,shell) {

  if (typeof args.p === "undefined"){
    console.log("You must supply the encryption key to clone a gcn repo.");
    return;
  }

  let temp_name = '.gcn_clone_temporary_'+uuidv1();
  mkdirp.sync(temp_name);
  shell.cd(temp_name);
  password = args.p;
  delete(args.p);
  var command = assembleEncyptedCommand(args,password,1);
  shell.exec(command);
  var dir_name = shell.exec("ls").stdout.replace(/(\r\n\t|\n|\r\t)/gm,"");
  makeDotFile(password);
  shell.exec("mv * .git_repo");
  shell.cd("..");
  shell.mv([temp_name],dir_name);

  // TODO: update editing direcetory by decryption

}

async function other(args,password,shell) {

  await syncEncryptDirs(password);
  line = assembleEncyptedCommand(args,password,0);

  shell.cd("./.git_repo");

  var run_command = shell.exec(line);

  if(run_command.stdout.length > 0) {
    decrypt_tokens(run_command.stdout,password);
  } else if(run_command.stderr.length > 0) {
    decrypt_tokens(run_command.stderr,password);
  }


  shell.cd("..");

  await syncDecryptDirs(password);



}


// syncDecryptDirs("prXYpROZmmZadQTVrpOu9nDRqXu2MajbxnHPOXbHUDdHbhC6PNvlCZMLSMrSfLVu");


module.exports = {
  init: init,
  clone: clone,
  other: other
};
