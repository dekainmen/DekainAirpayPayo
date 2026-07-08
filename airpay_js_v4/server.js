//const { response } = require('express');
const express = require('express');
//const http = require('http');
const path = require('path');
const axios = require('axios');
const http = require('http');
const bodyParser = require('body-parser');

const CryptoJS = require("crypto-js");
const crypto = require("crypto");

const app = express();
// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');
var username = "";
var password = "";

app.use(express.static(path.join(__dirname, 'public')));
const post = require('./routes/routes');

const port = 3000;

app.use(express.static(path.join(__dirname + '/')));
app.use(express.static(path.join(__dirname , 'responsefromairpay')));


app.get('/responsefromairpay',async function(req,res){

    const txnhash = req.query.txnhash;
    const txndata = req.query.txndata;
    const TRANSACTIONID = req.query.TRANSACTIONID;
    const APTRANSACTIONID = req.query.APTRANSACTIONID;
    const AMOUNT = req.query.AMOUNT;
    const MESSAGE = req.query.MESSAGE;
    const CUSTOMVAR = req.query.CUSTOMVAR;
    const TRANSACTIONSTATUS = req.query.TRANSACTIONSTATUS;
     
    res.render('responsefromairpay',{txndata: txndata,TRANSACTIONID:TRANSACTIONID,APTRANSACTIONID:APTRANSACTIONID,AMOUNT:AMOUNT,MESSAGE:MESSAGE,CUSTOMVAR:CUSTOMVAR,TRANSACTIONSTATUS :TRANSACTIONSTATUS});

})
app.get('/updatedUrl', function(req, res) {
    // Access the same data and render the same Pug page
    const txndata = req.query.txndata;
    const TRANSACTIONID = req.query.TRANSACTIONID;
    const APTRANSACTIONID = req.query.APTRANSACTIONID;
    const AMOUNT = req.query.AMOUNT;
    const MESSAGE = req.query.MESSAGE;
    const CUSTOMVAR = req.query.CUSTOMVAR;
    const TRANSACTIONSTATUS = req.query.TRANSACTIONSTATUS;

    res.render('responsefromairpay', {
        txndata: txndata,
        TRANSACTIONID: TRANSACTIONID,
        APTRANSACTIONID: APTRANSACTIONID,
        AMOUNT: AMOUNT,
        MESSAGE: MESSAGE,
        CUSTOMVAR: CUSTOMVAR,
        TRANSACTIONSTATUS: TRANSACTIONSTATUS
    });
});

app.listen(port,(req,res) => console.log('Running...'));