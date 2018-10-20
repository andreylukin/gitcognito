
module.exports = () => {
  var args = require('minimist')(process.argv.slice(2));
  // console.dir(args);
  command = args._[0];

  var fs = require("fs");

  if(command === 'init') {
    // start the gitcognito repo

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
          length: 16,
          numbers: true
      });
    }

    let data = JSON.stringify({
      password : password
    });
    fs.writeFileSync('.gcn', data);

    // 'uEyMTw32v9'
    console.log(password);


    return;
  }

  if (!fs.existsSync(".gcn")) {
    console.log("Error: not a gcn repo");
    return;
  }

  var contents = fs.readFileSync(".gcn");
  try {
    var jsonContent = JSON.parse(contents);
  } catch(error) {
    console.log(error);
  }
  console.log("Encryption password:", jsonContent.password,"\n");

}
