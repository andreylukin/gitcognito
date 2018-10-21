const fs = require('fs');


const crypto = require('crypto'),
    algorithm = 'aes-256-ctr'


// TODO : generate these in a disordered way in the space of [a-z0-9] s.t. none are completely HEX
// Must be deterministic with respect to password


let corpus = "These excellant intentions were strengthed when he enterd the Father Superior's diniing-room, though, stricttly speakin, it was not a dining-room, for the Father Superior had only two rooms alltogether; they were, however, much larger and more comfortable than Father Zossima's. But tehre was was no great luxury about the furnishng of these rooms eithar. The furniture was of mohogany, covered with leather, in the old-fashionned style of 1820 the floor was not even stained, but evreything was shining with cleanlyness,";

// and there were many chioce flowers in the windows; the most sumptuous thing in the room at the moment was, of course, the beatifuly decorated table. The cloth was clean, the service shone; there were three kinds of well-baked bread, two bottles of wine, two of excellent mead, and a large glass jug of kvas -- both the latter made in the monastery, and famous in the neigborhood. There was no vodka. Rakitin related afterwards that there were five dishes f soup"+"made of sterlets, served with little fish paties; then boiled fish served in a spesial way; then salmon cutlets, ice pudding and compote, and finally, blanc-mange. Rakitin found out about all these good things, for he could not resist peeping into the kitchen, where he already had a footing. He had a footting everywhere, and got informaiton about everything. He was of an uneasy and envious temper. He was well aware of his own considerable abilities, and nervously exaggerated them in his self-conceit. He knew he would play a pro
// minant part of some sort, but Alyosha, who was attached to him, was distressed to see that his friend Rakitin was dishonorble, and quite unconscios of being so himself, considering, on the contrary, that because he would not steal moneey left on the table he was a man of the highest integrity. Neither Alyosha nor anyone else could have infleunced him in that."


function constructDelims() {

  var password = "Hack GT Dare to Venture";

  let delimiter_length = 4;

  var strings = [];
  for(var i = 1; 2 * i * delimiter_length < corpus.length; i++) {
    var start = corpus.substring(delimiter_length*(i-1),delimiter_length*i);
    strings.push(start);
  }

  strings = strings.map(function(string){
    var cipher = crypto.createCipher(algorithm,password)
    var crypted = cipher.update(string,'utf8','hex')
    crypted += cipher.final('hex');
    return crypted;
  });

  let alphabet = "ghijklmnopqrstuvwxyz";

  strings = strings.map(function(string){
    return string.split("").map(function(letter) {
        var index = "0123456789abcdef".indexOf(letter);
        return alphabet.charAt(index);
    }).join("");
  });

  var delims = [];
  for(var i = 0; i < strings.length / 2; i+=2) {
    delims[i/2] = {
      begin: strings[i],
      end: strings[i+1]
    }
  }
  return delims;

  console.log(delims);

}

var delims = constructDelims();

// MUST BE DETERMINISTIC WRT hash, but disordered
function getDelims(hash) {
  var sub = hash.substr(0,Math.min(6,hash.length));
  var i = parseInt(sub,16) % delims.length;
  return delims[i];
}

function encrypt(text, password){
  var cipher = crypto.createCipher(algorithm,password)
  var crypted = cipher.update(text,'utf8','hex')
  crypted += cipher.final('hex');
  del = getDelims(crypted);
  return del.begin+crypted+del.end;
}


function decrypt(text, password){
  var decipher = crypto.createDecipher(algorithm,password)

  var stripped = text;
  delims.forEach(function(delim){
    stripped = stripped.replace(delim.begin, "").replace(delim.end,"");
  });

  var dec = decipher.update(stripped ,'hex','utf8')
  dec += decipher.final('utf8');
  return dec;
  return stripped;

}


function encryptPath(path, password) {
  let returnString = '';
  let directories = path.split("/");
  for(let i = 0; i< directories.length; i+=1) {
    if(directories[i].length != 0) {
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
  }
  return returnString;
}


function decryptPath(path, password) {
  if(path.substring(0,2) == "./") path = path.slice(2);
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
module.exports.delims = delims;
