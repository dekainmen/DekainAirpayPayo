var express = require('express');

var router = express.Router();
var bodyParser = require('body-parser')
const app = express();

var jsonParser = bodyParser.json()
var urlencodedParser = bodyParser.urlencoded({ extended: false })


router.post('/responsefromairpay', urlencodedParser, async (req, res) => {
  customvar_data = req.body.CUSTOMVAR;
  var CUSTOM_DATA_arr = customvar_data.split('|');
  var customvar        = CUSTOM_DATA_arr['0'].trim();
  var username =  CUSTOM_DATA_arr['1'].trim();
  var mercid        = CUSTOM_DATA_arr['2'].trim();
  var All_data = req.body.TRANSACTIONID + ':' + req.body.APTRANSACTIONID + ':' + req.body.AMOUNT + ':' + req.body.TRANSACTIONSTATUS + ':' + req.body.MESSAGE + ':' + mercid + ':' + username;
  if(req.body.CHMOD && (req.body.CHMOD == 'upi')){
    All_data = All_data + ':' + req.body.CUSTOMERVPA;
  }
  var CRC32 = require('crc-32');
  var txnhash = CRC32.str(All_data);
  txnhash = txnhash >>> 0;
  txndata = req.body;
  if(txndata.TRANSACTIONSTATUS == '200' && txnhash != txndata.ap_SecureHash){
    res.render('error');
  }else{
    res.render('responsefromairpay', { txnhash: txnhash, txndata: txndata,customvar:customvar});
  }
});



module.exports = router;