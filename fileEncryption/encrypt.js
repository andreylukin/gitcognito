const fs = require('fs');

var sc = require('simple-crypto-js');



// TODO : generate these in a disordered way in the space of [a-z0-9] s.t. none are completely HEX
// Must be deterministic with respect to password


let corpus = "These excellant intentions were strengthed when he enterd the Father";
// Superior's diniing-room, though, stricttly speakin, it was not a dining-room, for the Father Superior had only two rooms alltogether; they were, however, much larger and more comfortable than Father Zossima's. But tehre was was no great luxury about the furnishng of these rooms eithar. The furniture was of mohogany, covered with leather, in the old-fashionned style of 1820 the floor was not even stained, but evreything was shining with cleanlyness,";

// and there were many chioce flowers in the windows; the most sumptuous thing in the room at the moment was, of course, the beatifuly decorated table. The cloth was clean, the service shone; there were three kinds of well-baked bread, two bottles of wine, two of excellent mead, and a large glass jug of kvas -- both the latter made in the monastery, and famous in the neigborhood. There was no vodka. Rakitin related afterwards that there were five dishes f soup"+"made of sterlets, served with little fish paties; then boiled fish served in a spesial way; then salmon cutlets, ice pudding and compote, and finally, blanc-mange. Rakitin found out about all these good things, for he could not resist peeping into the kitchen, where he already had a footing. He had a footting everywhere, and got informaiton about everything. He was of an uneasy and envious temper. He was well aware of his own considerable abilities, and nervously exaggerated them in his self-conceit. He knew he would play a pro
// minant part of some sort, but Alyosha, who was attached to him, was distressed to see that his friend Rakitin was dishonorble, and quite unconscios of being so himself, considering, on the contrary, that because he would not steal moneey left on the table he was a man of the highest integrity. Neither Alyosha nor anyone else could have infleunced him in that."


String.prototype.hexEncode = function(){
    var hex, i;

    var result = "";
    for (i=0; i<this.length; i++) {
        hex = this.charCodeAt(i).toString(16);
        result += ("000"+hex).slice(-2);
    }

    return result
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

// console.log("testing".hexEncode().hexDecode());

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
console.log(delims);

// var delims = [
//   {begin:"xyz",end:"qrs"},
//   {begin:"zyx",end:"srz"},
//   {begin:"xys",end:"sqw"},
//   {begin:"zsq",end:"qrz"}
// ]

// MUST BE DETERMINISTIC WRT hash, but disordered
function getDelims(hash) {
  var sub = hash.substr(0,Math.min(6,hash.length));
  var i = parseInt(sub,16) % delims.length;
  return delims[i];
}

function encrypt(text, password){
  var encrypted = new sc.default(password).encrypt(text);
  del = getDelims(encrypted);
  // console.log(encrypted);
  return del.begin+encrypted.hexEncode()+del.end;
}

function decrypt(text, password){

  // console.log("decr" , text);

  var stripped = text;
  delims.forEach(function(delim){
    stripped = stripped.replace(delim.begin, "").replace(delim.end,"");
  });

  var dec = new sc.default(password).decrypt(stripped.hexDecode());
  return dec;
<<<<<<< HEAD
=======

>>>>>>> f9a3ab0d752822f6ee403c45f651fa68347e64a8
}

// var msg = "  var dec = new sc.default(password).decrypt(stripped.hexDecode());";
// var pass = "dsmflksdf";
// var res = encrypt(msg,pass);
// console.log(res);
// console.log(decrypt(res,pass));

// setTimeout(function(){
//   console.log(delims);
  // console.log(decrypt(encrypt("hello","password"),"password"));
// },1000);
//
// iv = { words: [ -978209329, -1317635129, -1821632949, 1296296762 ],
  // sigBytes: 16 };
//
// var message = "testing";
// var key = "secret";
// var wordArray = CryptoJS.enc.Utf8.parse(message); // Word Array
// // var utf8 = CryptoJS.enc.Utf8.stringify(wordArray); // String
// // console.log(utf8);
//
// var encoded = CryptoJS.AES.encrypt(message, key,{mode: CryptoJS.mode.ECB, padding: CryptoJS.pad.NoPadding });
// // console.log(encoded);
// var as_hex = encoded.ciphertext.toString()
//
// // console.log(as_hex);
// var arr = CryptoJS.enc.Hex.parse(as_hex);
// console.log(arr.toString())
// // console.log(encoded.toString())
// var decoded = CryptoJS.AES.decrypt(arr, key,{mode: CryptoJS.mode.ECB, padding: CryptoJS.pad.NoPadding });
// // console.log(arr);
// // console.log(encoded);
// // console.log(arr.toString());
// console.log(CryptoJS.enc.Utf8.stringify(decoded));
// // var utf16 = ; // String
//
//
//
//
// var message = "testing";
// var key = "secret";
//
// // console.log(encoded);
// var as_hex = encoded.ciphertext.toString()
//
// // var encrypted = '3ad77bb40d7a3660a89ecaf32466ef97',
//     key = CryptoJS.enc.Hex.parse('2b7e151628aed2a6abf7158809cf4f3c'),
//     cipherParams = CryptoJS.lib.CipherParams.create({
//         ciphertext: CryptoJS.enc.Hex.parse(as_hex),
//         iv : {
//           words: [ -978209329, -1317635129, -1821632949, 1296296762 ],
//           sigBytes: 16
//         },
//         salt: encoded.salt
//     });
//
//     var encoded = CryptoJS.AES.encrypt(message, key,{mode: CryptoJS.mode.ECB, padding: CryptoJS.pad.NoPadding });
//
// var decrypted3 = CryptoJS.AES.decrypt(cipherParams, key, {mode: CryptoJS.mode.ECB, padding: CryptoJS.pad.NoPadding });
// console.log(CryptoJS.enc.Hex.stringify(decrypted3));
//
//


//
//
//
// var JsonFormatter = {
//     stringify: function (cipherParams) {
//         // create json object with ciphertext
//         console.log("NEW",cipherParams);
//         var jsonObj = {
//         };
//         if (cipherParams.ciphertext) {
//           jsonObj.ct = cipherParams.ciphertext.toString(CryptoJS.enc.Hex);
//         }
//
//         // optionally add iv and salt
//         if (cipherParams.iv) {
//             jsonObj.iv = cipherParams.iv.toString(CryptoJS.enc.Hex);
//         }
//         if (cipherParams.salt) {
//             jsonObj.s = cipherParams.salt.toString(CryptoJS.enc.Hex);
//         }
//
//         // stringify json object
//         return JSON.stringify(jsonObj);
//     },
//
//     parse: function (jsonStr) {
//         // parse json string
//         var jsonObj = JSON.parse(jsonStr);
//
//         // extract ciphertext from json object, and create cipher params object
//         var cipherParams = CryptoJS.lib.CipherParams.create({
//             ciphertext: CryptoJS.enc.Hex.parse(jsonObj.ct)
//         });
//
//         // optionally extract iv and salt
//         if (jsonObj.iv) {
//             cipherParams.iv = CryptoJS.enc.Hex.parse(jsonObj.iv)
//         }
//         if (jsonObj.s) {
//             cipherParams.salt = CryptoJS.enc.Hex.parse(jsonObj.s)
//         }
//
//         return cipherParams;
//     }
// };




//
// // WORKSSSSS
// var key = CryptoJS.lib.WordArray.random(16);
// var iv  = CryptoJS.lib.WordArray.random(16);
// var encrypted = CryptoJS.AES.encrypt("Message", key, { iv: iv });
// // var str = encrypted.toString();
// console.log(encrypted);
// // var as_str = JSON.stringify(encrypted);
// // console.log(as_str);
// // var as_obj = JSON.parse(as_str);
// // console.log(as_obj);
// var decrypted = CryptoJS.AES.decrypt(encrypted, key, { iv: iv });
// console.log(CryptoJS.enc.Utf8.stringify(decrypted));
//
// console.log(key);
// console.log(iv);
//
// key = { words: [ -1419438614, -1090085036, -941159223, 1802311356 ], sigBytes: 16 };
// iv = { words: [ -887071435, 1159865551, -1816538633, -1791449762 ], sigBytes: 16 };
// var old = "mvuGllys88qXCzWpeXs8/w==";
// var old_d = CryptoJS.AES.decrypt(old, key, { iv: iv });
// // old_d.sigBytes = 16;
// console.log(old_d);
// // console.log(old_d.toString(CryptoJS.enc.Base64));
// // console.log(old_d.toString(CryptoJS.enc.Latin1));
// // console.log(old_d.toString(CryptoJS.enc.Utf16BE));
// // console.log(old_d.toString(CryptoJS.enc.Utf8));
// console.log(old_d.toString(CryptoJS.enc.Hex));
// // console.log(old_d.toString(CryptoJS.enc.Utf16));
// console.log(old_d.toString(CryptoJS.enc.Utf16LE));

// CryptoJS.enc.Base64                CryptoJS.enc.Hex
// CryptoJS.enc.Latin1                CryptoJS.enc.Utf16
// CryptoJS.enc.Utf16BE               CryptoJS.enc.Utf16LE
// CryptoJS.enc.Utf8

//
// var key = CryptoJS.lib.WordArray.random(16);
// var iv  = CryptoJS.lib.WordArray.random(16);
// var encrypted = CryptoJS.AES.encrypt("Message", key, { iv: iv });
//
// var ciphertext = encrypted.ciphertext.toString(CryptoJS.enc.Base64);
// console.log(ciphertext);
//
// var decrypted = CryptoJS.AES.decrypt(CryptoJS.enc.Base64.parse(ciphertext), key, { iv: iv });
// console.log((decrypted));
// console.log(CryptoJS.enc.Utf8.stringify(decrypted));



// var message = "some_secret_message";
//
// var key = "6Le0DgMTAAAAANokdEEial"; //length=22
// var iv  = "mHGFxENnZLbienLyANoi.e"; //length=22
//
// key = CryptoJS.enc.Base64.parse(key);
// //key is now e8b7b40e031300000000da247441226a, length=32
// iv = CryptoJS.enc.Base64.parse(iv);
// //iv is now 987185c4436764b6e27a72f2fffffffd, length=32
//
// var cipherData = CryptoJS.AES.encrypt(message, key, { iv: iv });
//
// var cipher_text = cipherData.toString(CryptoJS.enc.Hex);
// console.log(typeof cipher_text);
//
// var data = CryptoJS.AES.decrypt(CryptoJS.enc.Hex.parse(cipher_text), key, { iv: iv });
// console.log(CryptoJS.enc.Utf8.stringify(data));
// //data contains "some_secret_message"



//
// var keySize = 256;
// var ivSize = 128;
// var iterations = 100;
//
// var message = "Hello World";
// var password = "Secret Password";
//
// var salt = CryptoJS.lib.WordArray.random(128/8);
// var iv = CryptoJS.lib.WordArray.random(128/8);
// // console.log(JSON.stringify(salt));
// // console.log(JSON.stringify(iv));
// //
// // salt = { words: [ -1371766922, 1872479715, 1248047622, 940366345 ], sigBytes: 16 };
// // iv = { words: [ -1252189092, 906439614, -1177162215, -1455047692 ], sigBytes: 16 };
// // console.log(JSON.stringify(salt));
// // console.log(JSON.stringify(iv));
//
// function encrypt_ (msg, pass,salt,iv) {
//
//   var key = CryptoJS.PBKDF2(pass, salt, {
//       keySize: keySize/32,
//       iterations: iterations
//     });
//
//
//   var encrypted = CryptoJS.AES.encrypt(msg, key, {
//     iv: iv,
//     padding: CryptoJS.pad.Pkcs7,
//     mode: CryptoJS.mode.ECB
//
//   });
//
//   // salt, iv will be hex 32 in length
//   // append them to the ciphertext for use  in decryption
//   var transitmessage = salt.toString()+ iv.toString() + encrypted.toString();
//   return transitmessage;
// }
//
// function decrypt_ (transitmessage, pass) {
//   var salt = CryptoJS.enc.Hex.parse(transitmessage.substr(0, 32));
//   var iv = CryptoJS.enc.Hex.parse(transitmessage.substr(32, 32))
//   var encrypted = transitmessage.substring(64);
//
//   var key = CryptoJS.PBKDF2(pass, salt, {
//       keySize: keySize/32,
//       iterations: iterations
//     });
//
//   var decrypted = CryptoJS.AES.decrypt(encrypted, key, {
//     iv: iv,
//     padding: CryptoJS.pad.Pkcs7,
//     mode: CryptoJS.mode.ECB
//
//   })
//   return decrypted;
// }
//
// message = "Hello there";
// password = "balloons";
// var encrypted = encrypt_(message, password,salt,iv);
// var decrypted = decrypt_(encrypted, password);
// console.log(encrypted);
// console.log(decrypted.toString(CryptoJS.enc.Utf8));
// console.log(typeof(encrypted));





// var encrypted = CryptoJS.AES.encrypt("Message", "Secret Passphrase",{
//
// });
// var cfg = JsonFormatter.parse(JsonFormatter.stringify(encrypted));
//
//
// var encrypted2 = CryptoJS.AES.encrypt("Message", "Secret Passphrase", cfg);
//
// var ciphertext = encrypted.ciphertext.toString(CryptoJS.enc.Hex);
// // console.log(encrypted2);
// var decrypted2 = CryptoJS.AES.decrypt(ciphertext, "Secret Passphrase", cfg);
//
// var cfg1 = JsonFormatter.parse(JsonFormatter.stringify(encrypted2));
// // var cfg2 = JsonFormatter.parse(JsonFormatter.stringify(decrypted2));
// console.log(cfg1.iv);
// // console.log(cfg2.iv);


// console.log(decrypted2);
// console.log(decrypted2.toString(CryptoJS.enc.Utf8)); // Message








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

module.exports.encrypt = encrypt;
module.exports.decrypt = decrypt;
module.exports.encryptPath = encryptPath;
module.exports.decryptPath = decryptPath;
module.exports.delims = delims;
module.exports.constructDelims = constructDelims;
