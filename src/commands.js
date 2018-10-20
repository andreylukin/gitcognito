const {encrypt, decrypt} = require('../fileEncryption/encrypt');
const {getFiles, encryptFile} = require('../fileEncryption/fileController');

module.exports = {
  init: function (args) {

    var fs = require('fs');
    if (fs.existsSync(".gcn")) {
        console.log("reinit");
        return;
    }

    // console.log('Do the init');

    var password;
    if(args.p) {
      password = args.p;
    } else {
      var generator = require('generate-password');
      // password = generator.generate({
      //     length: 64,
      //     numbers: true
      // });
      password = "prXYpROZmmZadQTVrpOu9nDRqXu2MajbxnHPOXbHUDdHbhC6PNvlCZMLSMrSfLVu";
    }

    let data = JSON.stringify({
      password : password
    });

    fs.writeFileSync('.gcn', data);

    var mkdirp = require('mkdirp');

    mkdirp('.git_repo', function(err) {
      if (err) console.error(err); return;
      console.log(password);

    });

  },
  clone: function (args,password) {
    // TODO : clone functionality
    console.log("clone " +password +"\n");
    console.log(args);
    console.log("git clone "+"https://github.com/andreylukin/gitcognitoTemp"+" "+process.cwd());
     // git clone https://github.com/andreylukin/gitcognitoTemp .git_repo
  },
  other: function (args,password,shell,count) {

    console.log(shell.exec('pwd').stdout);
    var path = shell.exec('pwd').stdout.replace(/^\s+|\s+$/g, '');
    console.log(count);
    var path = "."+"/..".repeat(count);
    console.log("{"+path+"}");
    var files = getFiles(path);
    console.log(files);
    
    files.forEach(function(file){
      encryptFile(file,password);
    });

    
    
    
    
    
    
    
    // TODO : copy files from editing directory to encrypted repo
    //
    // console.log(args);

    line = "git "+args._[0] + " " + args._.splice(1).map(function(str){
        if(!(str === '.')) {
          return "\""+encrypt(str,password)+"\"";
        } else {
          return str;
        }
      }).join(" ");

      // + " "+args._.splice(1,0).forEach(function(element){
    //   return encrypt(element);
    // })
    // .join(" ");
    for(var p in args) {
      if(!(p==="_")) {
        if(args.hasOwnProperty(p)) {
          if(p.length > 1) {
            line += " --";
          } else {
            line += " -";
          }
            line += p + ' "' + encrypt(args[p],password)+'" ';
        }
      }
    }

    // console.log("Running command: <"+line+">");
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

  let begin = ";};";
  let end = "{;}";
  var array = string.split(begin);
  process.stdout.write(array.map(function(item){
    return decrypt_token(item, begin, end, password);
  }).join(""));
  // string = array.map(function(elem) {
  //   parts = elem.split(end);
  //   console.log(parts);
  //   parts[0] = decrypt(parts[0],password);
  // }).join("");
  // console.log(string);
  // process.stdout.write(string);
}

function decrypt_token(string, beingToken, endToken, password) {
  let encodedString = string.split(beingToken)[1].split(endToken)[0]
  return decrypt(encodedString, password);
}


