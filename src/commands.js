const {encrypt, decrypt, encryptFile, decryptFile} = require('../fileEncryption/encrypt');

module.exports = {
  init: function (args) {

    var fs = require('fs');
    if (fs.existsSync(".gcn")) {
        console.log("reinit");
        return;
    }

    console.log('Do the init');

    var password;
    if(args.p) {
      password = args.p;
    } else {
      var generator = require('generate-password');
      password = generator.generate({
          length: 64,
          numbers: true
      });
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
  other: function (args,password,shell) {

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
  // console.log("return info: ");
  // console.log(string);
  // console.log("done")
  let begin = ";};";
  let end = "{;}";
  var array = string.split(begin);
  // console.log(array);
  process.stdout.write(array.map(function(item){
    var again = item.split(end);
    if(again.length > 1) {
      again[0] = decrypt(again[0],password);
    }
    return again.join("");
  }).join(""));
  // string = array.map(function(elem) {
  //   parts = elem.split(end);
  //   console.log(parts);
  //   parts[0] = decrypt(parts[0],password);
  // }).join("");
  // console.log(string);
  // process.stdout.write(string);
}
