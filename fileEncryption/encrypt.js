const crypto = require('crypto'),
    algorithm = 'aes-256-ctr'

function encrypt(text, password){
  var cipher = crypto.createCipher(algorithm,password)
  var crypted = cipher.update(text,'utf8','hex')
  crypted += cipher.final('hex');
  let begin = "[[[[";
  let end = "]]]]";
  return begin+crypted+end;
}

function decrypt(text, password){
  var decipher = crypto.createDecipher(algorithm,password)
  var dec = decipher.update(text,'hex','utf8')
  dec += decipher.final('utf8');
  return dec;
}

function encryptPath(path, password) {
  let returnString = '';
  let directories = path.split("/");
  for(let i = 0; i< directories.length; i+=1) {
    if(directories[i] == ".") {
      returnString += ".";
    } else {
      returnString += encrypt(directories[i], password);
    }
    returnString += "/"
    if(i == directories.length - 1 && path.charAt(path.length - 1) != '/') {
      returnString = returnString.slice(0, -1);
    }
  }
  return returnString;
}


function decryptPath(path, password) {
  let returnString = '';
  let directories = path.split("/");
  for(let i = 0; i< directories.length; i+=1) {
    if(directories[i] == ".") {
      returnString += ".";
    } else {
      returnString += decrypt(directories[i], password);
    }
    if(directories[i].length != 0) {
      returnString += "/"
    }
    if(i == directories.length - 1 && path.charAt(path.length - 1) != '/') {
      returnString = returnString.slice(0, -1);
    }
  }
  return returnString;

}


module.exports.encrypt = encrypt;
module.exports.decrypt = decrypt;
module.exports.encryptPath = encryptPath;
module.exports.decryptPath = decryptPath;
