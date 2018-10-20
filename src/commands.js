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
    // args._.splice(1,0).forEach(function(element){
    //   return (element+"*");
    // })
    // console.log(args._);
    line = "git "+args._.splice(0).join(" ");
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

    console.log("Running command: <"+line+">");
    shell.cd("./.git_repo");
    // console.log(shell.exec("pwd"));
    var run_command = shell.exec(line,{stdio: "inherit"});
    // console.log(run_command);
    if(run_command.stdout.length > 0) {
      decrypt_tokens(run_command.stdout);
    } else if(run_command.stderr.length > 0) {
      decrypt_tokens(run_command.stderr);
    }


  }
};

function decrypt_tokens(string) {
  process.stdout.write(string);
}
