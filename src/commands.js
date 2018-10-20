const {encrypt, decrypt} = require('../fileEncryption/encrypt');
const {getFiles, encryptFile} = require('../fileEncryption/fileController');
const {mkdirp} = require('mkdirp');
const fs = require('fs');
const uuidv1 = require('uuid/v1');

function assembleEncyptedCommand(args,password,offset) {
  var unencrypted = args._.splice(0,offset+1).join(" ");
  var encrypted = args._.map(function(str){
    if(!(str === '.')) {
      return "\""+encrypt(str,password)+"\"";
    } else {
      return str;
    }
  }).join(" ");
  line = "git "+unencrypted+" "+encrypted;

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
  return line;
}


function makeDotFile(password) {
  let data = JSON.stringify({
    password : password
  });

  fs.writeFileSync('.gcn', data);

}

module.exports = {
  init: function (args) {

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

  },
  clone: function (args,shell) {

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

  },
  other: function (args,password,shell,count) {

    var files = getFiles();

    files.forEach(function(file){
      encryptFile(file,password);
    });

    line = assembleEncyptedCommand(args,password,0);
    // console.log("{"+line+"}")

    shell.cd("./.git_repo");

    var run_command = shell.exec(line,{stdio: "inherit"});

    if(run_command.stdout.length > 0) {
      decrypt_tokens(run_command.stdout,password);
    } else if(run_command.stderr.length > 0) {
      decrypt_tokens(run_command.stderr,password);
    }

  }
};

function decrypt_tokens(string,password) {
  let begin = "[[[[";
  let end = "]]]]";
  var array = string.split(begin);
  process.stdout.write(array.map(function(item){
    return decrypt_token(item, begin, end, password);
  }).join(""));
}

function decrypt_token(string, beingToken, endToken, password) {
  let encodedString = string.split(beingToken)[1].split(endToken)[0]
  return decrypt(encodedString, password);
}


