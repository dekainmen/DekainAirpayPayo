/*var express = require("express");
var router = express.Router()

var crypto = require('crypto')
var client_id = "1b3817";
var client_secret = "5a06ee4c8ed231ef1a924cb58b885991";
var merchant_id = "247033";
var username = "5326492";
var password = "c3Tpjp7A";
const key = crypto.createHash('md5').update(username + "~:~" + password).digest('hex');


var request = {
    client_id: client_id,
    client_secret: client_secret,
    grant_type: 'client_credentials',
    merchant_id: merchant_id
  };



  router.get('/',function(req,res,next){


  const iv = crypto.randomBytes(8);
// Convert the random bytes buffer to a hexadecimal string
const ivHex = iv.toString('hex');
console.log(ivHex);
function encrypt(request, secretKey) {
  // Generate a random IV (Initialization Vector)
  //const iv = crypto.randomBytes(8).toString('hex');
 
  // Create a Cipher object with AES-256-CBC algorithm
  const cipher = crypto.createCipheriv('aes-256-cbc', Buffer.from(secretKey, 'utf-8'), Buffer.from(ivHex));
 
  // Update the cipher with the request and finalize
  const raw = Buffer.concat([cipher.update(request, 'utf-8'), cipher.final()]);
 
  // Combine IV and raw data, then base64 encode
  const data = ivHex + raw.toString('base64');
 
  return data;
}



var encrypteddata=encrypt(JSON.stringify(request),key)
console.log(encrypteddata);
/*module.exports = {
    encrypt : encrypt
};*/

  
