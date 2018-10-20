var shell = require('shelljs');
shell.config.silent = true;

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
  other: function (args,password) {

    // console.log(args);

    free_params = args._;

    line = "git "+args._.join(" ");
    for(var p in args) {
      if(!(p==="_")) {
        if(args.hasOwnProperty(p)) {
            line = line + " -" + p + ' "' + args[p]+'" ';
        }
      }
    }
    // console.log("Running command: <"+line+">");

    shell.cd("./.git_repo");
    var run_command = shell.exec(line);
    // console.log(run_command);
    if(run_command.stdout.length > 0) {
      process.stdout.write(run_command.stdout);
    } else if(run_command.stderr.length > 0) {
      process.stdout.write(run_command.stderr);
    }

  }
};
