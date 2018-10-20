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


    // console.log(shell.exec("pwd").stdout);
    var count = 0;
    while(!shell.test('-f', '.gcn')) {
      shell.cd("../");
      count++;
      console.log("going up");
      // console.log(shell.exec("pwd").stdout);
      if(shell.exec("pwd").stdout === "/\n") {
        console.log("Error: not a gcn repo");
        return;
      }
    }

    var contents = fs.readFileSync(".gcn");
    try {
      var jsonContent = JSON.parse(contents);
    } catch(error) {
      console.log(error);
    }

    var password = jsonContent.password;

    // this is a gcn repo and it is initialized. parse commands

    if(command === 'clone') {
      parse.clone(args,password);
    } else {
      parse.other(args,password,shell,count)
    }

  }

}
