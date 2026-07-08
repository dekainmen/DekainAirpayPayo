var express = require("express");
const cors = require('cors');
const http = require('http');
const bodyParser = require('body-parser');
var app = express();
var path = require('path');
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');
app.use(express.static('public'));

var dat;
const PORT = 8000;
var crypto = require('crypto')
var client_id = "";
var client_secret = "";
var merchant_id = "";
var username = "";
var password = "";

const key = crypto.createHash('md5').update(username + "~:~" + password).digest('hex');
const iv = crypto.randomBytes(8);
// Convert the random bytes buffer to a hexadecimal string
const ivHex = iv.toString('hex');


app.post('/sendData', (req, res) => {
  const dataFromClient = req.body;
  var enc_data = encrypt(JSON.stringify(dataFromClient), key);


  var request = {
    client_id: client_id,
    client_secret: client_secret,
    grant_type: 'client_credentials',
    merchant_id: merchant_id
  };

  var encrypteddata = encrypt(JSON.stringify(request), key)
  console.log(enc_data);
  const msg = {
    encdata: enc_data,
    tokeninput: encrypteddata
  };
  //res.send(enc_data);
  res.json(msg);
});

// Define a route that renders the Pug file and accesses data from the query parameter
app.post('/responsefromairpay', function (req, res, next) {

  const key = crypto.createHash('md5').update(username + "~:~" + password).digest('hex');
  const responseData = req.body.response;
  console.log('>>>>>>>>>>>>>>>>>>>>>', responseData);


  function decrypt(response, secretKey) {

    let data = response;
    console.log('Decrypt function input', response)
    try {
      // Extract IV and encrypted data
      const hash = crypto.createHash('sha256').update(data).digest();
      // Use a portion of the hash as your IV (e.g., the first 16 bytes)
      const iv = hash.slice(0, 16);
      console.log('iv', iv);
      const encryptedData = Buffer.from(data.slice(16), 'base64');
      // Decrypt using OpenSSL and AES-256-CBC
      const decipher = crypto.createDecipheriv('aes-256-cbc', Buffer.from(secretKey, 'utf-8'), iv);
      let decrypted = decipher.update(encryptedData, 'binary', 'utf8');
      console.log(decrypted);
      decrypted += decipher.final();
      console.log('decrypted>>>>>>>>>')
      return decrypted;
    } catch (error) {
      console.error('Decryption error:', error);
      throw error; // Re-throw for proper handling
    }
  }

  const decrypteddata = decrypt(responseData, key);
  const y = decrypteddata
  // Use a regular expression to extract the value associated with "nested"
  const match = y.match(/"data"\s*:\s*\{[^}]*\}/);
  let nestedObjectString
  if (match) {
    nestedObjectString = match[0];
    //console.log(nestedObjectString);
  } else {
    console.error('No match found for "nested" key.');
  }
  let tokenResponse = match;
  let token = JSON.parse("{" + nestedObjectString + "}")

  var TRANSACTIONID = token.data.orderid;
  var APTRANSACTIONID = token.data.ap_transactionid;
  var AMOUNT = token.data.amount;
  var TRANSACTIONSTATUS = token.data.transaction_status;
  var MESSAGE = token.data.message;
  var ap_SecureHash = token.data.ap_securehash;
  var CUSTOMVAR = token.data.custom_var;

  var hashdata = TRANSACTIONID + ':' + APTRANSACTIONID + ':' + AMOUNT + ':' + TRANSACTIONSTATUS + ':' + MESSAGE + ':' + merchant_id + ':' + username;
  console.log('>>>>>>>>>>>>>>>>>>>>>',hashdata);
  var CRC32 = require('crc-32');
  var txnhash = CRC32.str(hashdata);
  console.log('<<<<<<<<<<<<<<<<<<<<<',txnhash);
  

  var chmod = req.body.CHMOD;
  var custmvar = req.body.CUSTOMERVPA;
  if (chmod === 'upi') {
    txnhash = CRC32.str(req.body.TRANSACTIONID + ':' + req.body.APTRANSACTIONID + ':' + req.body.AMOUNT + ':' + req.body.TRANSACTIONSTATUS + ':' + req.body.MESSAGE + ':' + mid + ':' + username + ':' + custmvar);
  }
  txnhash = txnhash >>> 0;
  txndata = ap_SecureHash;
  console.log('@@@@@@@@@@@@@@@@@@@@@',txndata);
  // console.log(txndata.ap_SecureHash);
  var send = { txnhash: txnhash, txndata: txndata, TRANSACTIONID: TRANSACTIONID, APTRANSACTIONID: APTRANSACTIONID, AMOUNT: AMOUNT, MESSAGE: MESSAGE, CUSTOMVAR: CUSTOMVAR, TRANSACTIONSTATUS: TRANSACTIONSTATUS };
  // res.json(send);
  res.render('responsefromairpay',send);
  res.redirect(`http://localhost:3000/responsefromairpay?txnhash=${txnhash}&txndata=${txndata}&TRANSACTIONID=${TRANSACTIONID}&APTRANSACTIONID=${APTRANSACTIONID}&AMOUNT=${AMOUNT}&MESSAGE=${MESSAGE}&CUSTOMVAR=${CUSTOMVAR}&TRANSACTIONSTATUS=${TRANSACTIONSTATUS}`);
});
app.listen(PORT, () => {
  console.log('Server Running on port 5000');
});

function encrypt(request, secretKey) {

  const cipher = crypto.createCipheriv('aes-256-cbc', Buffer.from(secretKey, 'utf-8'), Buffer.from(ivHex));

  // Update the cipher with the request and finalize
  const raw = Buffer.concat([cipher.update(request, 'utf-8'), cipher.final()]);

  // Combine IV and raw data, then base64 encode
  const data = ivHex + raw.toString('base64');

  return data;
}
function getTokenInput(request) {

  return data;
}

