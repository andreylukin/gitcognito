const fs = require('fs');

var SimpleCrypto = require('simple-crypto-js');

let corpus = "Come all ye loyal classmates now In hall and campus through, Lift up your hearts and voices For the Royal Red and Blue. Fair Harvard has her crimson Old Yale her colors too, But for dear Pennsylvania We wear the Red and Blue. (Refrain) Hurrah, hurrah Pennsylvania! Hurrah for the Red and the Blue! Hurrah, hurrah, hurrah, hurrah, Hurrah for the Red and Blue! ";

String.prototype.hexEncode = function(){
    var hex, i;

    var result = "";
    for (i=0; i<this.length; i++) {
        hex = this.charCodeAt(i).toString(16);
        result += ("000"+hex).slice(-2);
    }

    return result;
}


String.prototype.hexDecode = function(){
    var j;
    var hexes = this.match(/.{1,2}/g) || [];
    var back = "";
    for(j = 0; j<hexes.length; j++) {
        back += String.fromCharCode(parseInt(hexes[j], 16));
    }

    return back;
}

String.prototype.hashCode = function() {
  var hash = 0, i, chr;
  if (this.length === 0) return hash;
  for (i = 0; i < this.length; i++) {
    chr   = this.charCodeAt(i);
    hash  = ((hash << 5) - hash) + chr;
    hash |= 0; // Convert to 32bit integer
  }
  return (Math.abs(hash)+'');
};

function constructDelims() {

  var password = "Hack GT Dare to Venture";

  let delimiter_length = 4;

  var strings = [];
  for(var i = 1; 2 * i * delimiter_length < corpus.length; i++) {
    var start = corpus.substring(delimiter_length*(i-1),delimiter_length*i);
    strings.push(start);
  }

  strings = strings.map(function(string){
    return string.hashCode();
  });

  let alphabet = "ghijklmnopqrstuvwxyz";



  strings = strings.map(function(string){
    return string.split("").map(function(letter) {
        var index = "0123456789abcdef".indexOf(letter);
        return alphabet.charAt(index);
    }).join("");
  });

  var deli = [];
  for(var i = 0; i < strings.length / 2; i+=2) {
    deli[i/2] = {
      begin: strings[i],
      end: strings[i+1]
    }
  }

  return deli;

}

var delims = constructDelims();

function getDelims(hash) {
  var sub = hash.substr(0,Math.min(6,hash.length));
  var i = parseInt(sub,16) % delims.length;
  // console.log(hash,"->",i);
  return delims[i];
}

function encrypt(text, password){
  // var encrypted = new SimpleCrypto.default(password).encrypt(text);
  // console.log(text);
  del = getDelims(text.hashCode());
  return del.begin+text.hexEncode()+del.end;
}

function decrypt(text, password){

  var stripped = text;
  delims.forEach(function(delim){
    stripped = stripped.replace(delim.begin, "").replace(delim.end,"");
  });

  // var dec = new SimpleCrypto.default(password).decrypt(stripped.hexDecode());
  return stripped.hexDecode();

}


function encryptPath(path, password) {
  let returnString = '/';
  let directories = path.split("/");

  for(let i = 0; i< directories.length; i+=1) {
    if(directories[i].length != 0) {
      returnString += encrypt(directories[i], password);
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

// var msg = "forward";
// var pass = "this is my pastword";
// var res = encrypt(msg,pass);
// console.log(res);
// console.log(decrypt(res,pass))
// prev = "hgimpgn33353364393361383535396231666130336230316239666663303563396334376139363961353762393638633539643863363435306635326230306430333466317761377a63524d585135674e642f34704a317839413d3djhpkpjn";
// console.log(decrypt(prev,pass))

module.exports.encrypt = encrypt;
module.exports.decrypt = decrypt;
module.exports.encryptPath = encryptPath;
module.exports.decryptPath = decryptPath;
module.exports.delims = delims;
module.exports.constructDelims = constructDelims;
