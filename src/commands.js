const {encrypt, decrypt} = require('../fileEncryption/encrypt');
const {getFiles, encryptFile, syncEncryptDirs,syncDecryptDirs} = require('../fileEncryption/fileController');
const {mkdirp} = require('mkdirp');
const fs = require('fs');
const uuidv1 = require('uuid/v1');

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
  // console.log("{"+line+"}");
  return line;
}


function makeDotFile(password) {
  let data = JSON.stringify({
    password : password
  });

  fs.writeFileSync('.gcn', data);

}

function decrypt_tokens(string,password) {

  var regex = /\b[Gg]it\b/g;
  string = string.replace(regex, "gcn");

  let begin = "[[[[";
  let end = "]]]]";
  var array = string.split(begin);
  process.stdout.write(array.map(function(item){
    var again = item.split(end);
    if(again.length > 1) {
      again[0] = decrypt(again[0],password);
    }
    return again.join("");
  }).join(""));

}

function decrypt_token(string, beginToken, endToken, password) {
  if(string.split(beginToken).length > 1) {
    let encodedString = string.split(beginToken)[1].split(endToken)[0]
    return decrypt(encodedString, password);
  } else {
    return string;
  }
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

function other(args,password,shell) {

  syncEncryptDirs('./', './.git_repo/', password);

  line = assembleEncyptedCommand(args,password,0);

  shell.cd("./.git_repo");

  var run_command = shell.exec(line);

  if(run_command.stdout.length > 0) {
    decrypt_tokens(run_command.stdout,password);
  } else if(run_command.stderr.length > 0) {
    decrypt_tokens(run_command.stderr,password);
  }

  syncDecryptDirs(".git_repo/", password);

}

module.exports = {
  init: init,
  clone: clone,
  other: other
};
