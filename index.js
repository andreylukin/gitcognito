var shell = require('shelljs');
shell.config.silent = true;

var parse = require('./src/commands.js');

module.exports = () => {

  var args = require('minimist')(process.argv.slice(2));

  command = args._[0];

  var fs = require("fs");

  if(command === 'init') {

    parse.init(args);
    return;

  } else if(command === 'clone') {

    parse.clone(args,shell);
    return;

  } else {

    // Find root directory of gcn repo
    while(!shell.test('-f', '.gcn')) {
      shell.cd("../");
      if(shell.exec("pwd").stdout === "/\n") {
        console.log("Error: not a gcn repo");
        return;
      }
    }

    // Load ecryption key / password
    var contents = fs.readFileSync(".gcn");
    try {
      var jsonContent = JSON.parse(contents);
    } catch(error) {
      console.log(error);
    }
    var password = jsonContent.password;

    // This is a gcn repo and it is initialized. Parse commands
    parse.other(args,password,shell)

  }

}
