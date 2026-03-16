var tokenurl = "https://kraken.airpay.co.in/airpay/pay/v4/api/oauth2/token.php";
var client_id = "";
var client_secret = "";
var secret = "";
var username = "";
var password = "";

document.addEventListener("DOMContentLoaded", function form() {
  const myForm = document.getElementById('userform');
  myForm.addEventListener('submit', async (event) => {
    event.preventDefault(); // Prevent the default form submission behavior
    // Get form data
    const formData = new FormData(myForm);
    // Convert form data to a plain object
    const formDataObject = {};
    formData.forEach((value, key) => {
      formDataObject[key] = value;
    });
    var data1 = formDataObject;
    var dat = {
      buyer_email: data1.buyerEmail,
      buyer_firstname: data1.buyerFirstName,
      buyer_lastname: data1.buyerLastName,
      buyer_address: data1.buyerAddress,
      buyer_city: data1.buyerCity,
      buyer_state: data1.buyerState,
      buyer_country: data1.buyerCountry,
      amount: data1.amount,
      orderid: data1.orderid,
      buyer_phone: data1.buyerPhone,
      buyer_pincode: data1.buyerPinCode,
      iso_currency: data1.isocurrency,
      currency_code: data1.currency,
      merchant_id: merchantDetails.mercid,
      mer_dom: btoa("http://localhost:8000")
    };
    console.log(dat);
    var responseData = await sendData(formDataObject);
    console.log('Response from server:', responseData.encdata);
    console.log('token input from server:', responseData.tokeninput);
    const token = await getToken(responseData.tokeninput);
    console.log("token      ", token);
    var url = "https://payments.airpay.co.in/pay/v4/index.php";
    //var accessToken = tokenResponse.data.access_token;
    var url = url + '?token=' + token;
    //var secretKey = md5(username + "~:~" + password);
    var privatekey = await encryptSha(username + ":|:" + password, secret);
    var checksumReq = await calculateChecksum(dat);
    var hid_dat = {
      privatekey: privatekey,
      encdata: responseData.encdata,
      checksum: checksumReq,
      chmod: '',
      merchant_id: merchantDetails.mercid
    };

    const form = document.createElement('form');
    form.setAttribute('id', 'myForm');
    form.setAttribute('method', 'POST');
    form.setAttribute('action', url);
    for (var key in hid_dat) {
      console.log(key, hid_dat[key]);
      const hiddenInput = document.createElement('input');
      hiddenInput.setAttribute('type', 'hidden');
      hiddenInput.setAttribute('name', key);
      hiddenInput.setAttribute('value', hid_dat[key]);
      form.appendChild(hiddenInput);
    }
    const submitButton = document.createElement('input');
    submitButton.setAttribute('type', 'submit');
    submitButton.setAttribute('value', 'Submit');
    form.appendChild(submitButton); // Attach form to the document
    document.body.appendChild(form); // Direct submission
    form.submit();
  });

});
async function sendData(data1) {

  var data = {
    buyer_email: data1.buyerEmail,
    buyer_firstname: data1.buyerFirstName,
    buyer_lastname: data1.buyerLastName,
    buyer_address: data1.buyerAddress,
    buyer_city: data1.buyerCity,
    buyer_state: data1.buyerState,
    buyer_country: data1.buyerCountry,
    amount: data1.amount,
    orderid: data1.orderid,
    buyer_phone: data1.buyerPhone,
    buyer_pinCode: data1.buyerPinCode,
    iso_currency: data1.isocurrency,
    currency_code: data1.currency,
    merchant_id: merchantDetails.mercid,
    mer_dom: btoa('http://localhost:8000')
  };
  const dataToSend = data;
  try {
    const response = await fetch('http://localhost:8000/sendData', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(dataToSend)
    });
    const responseData = await response.json();

    return responseData;

  } catch (error) {
    console.error('Error sending data to server:', error);
  }
}
async function getToken(encr) {
  var request = {
    client_id: client_id,
    client_secret: client_secret,
    grant_type: 'client_credentials',
    merchant_id: merchantDetails.mercid
  };
  var secretKey = md5(username + "~:~" + password);
  var requestData = {
    merchant_id: request.merchant_id,
    encdata: encr,
    checksum: await calculateChecksum(request)
  };

  var access_token = await sendPostData(tokenurl, requestData);
  var decryptedData = await decrypt(JSON.parse(access_token), secretKey);
  const y = decryptedData

  const match = y.match(/"data"\s*:\s*\{[^}]*\}/);
  let nestedObjectString
  if (match) {
    nestedObjectString = match[0];

  } else {
    console.error('No match found for "nested" key.');
  }

  let token = JSON.parse("{" + nestedObjectString + "}")

  let accesstoken = token.data.access_token;
  console.log('>>>>>>>>>>>>>>>>>>', accesstoken);
  return accesstoken;
}

async function decrypt(responsedata, secretKey) {
  try {
    // Ensure the browser supports the Web Crypto API
    if (!window.crypto.subtle) {
      throw new Error('Web Crypto API is not supported in this browser.');
    }

    let data = responsedata.response;

    // Hash the data using SHA-256
    const encoder = new TextEncoder();
    const hashBuffer = await crypto.subtle.digest('SHA-256', encoder.encode(data));

    // Use a portion of the hash as the IV (e.g., the first 16 bytes)
    const iv = new Uint8Array(hashBuffer.slice(0, 16));

    // Convert base64-encoded string to ArrayBuffer
    const base64Data = data.slice(16);
    const encryptedArrayBuffer = Uint8Array.from(atob(base64Data), c => c.charCodeAt(0)).buffer;

    // Import the secret key
    const importedKey = await crypto.subtle.importKey(
      'raw',
      encoder.encode(secretKey),
      { name: 'AES-CBC' },
      false,
      ['decrypt']
    );

    // Decrypt using AES-CBC
    const decryptedArrayBuffer = await crypto.subtle.decrypt(
      { name: 'AES-CBC', iv: iv },
      importedKey,
      encryptedArrayBuffer
    );

    // Convert ArrayBuffer to string
    const decryptedText = new TextDecoder().decode(decryptedArrayBuffer);

    return decryptedText;
  } catch (error) {
    console.error('Decryption error:', error);
    throw error; // Re-throw for proper handling
  }
}

async function sendPostData(tokenurl, postData) {
  return fetch(tokenurl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams(postData),
  })
    .then(function (response) {
      if (!response.ok) {
        throw new Error('HTTP error! Status: ' + response.status);
      }
      return response.text();
    })
    .then(function (responseData) {
      return responseData;
    })
    .catch(function (error) {
      console.error('Error sending POST request:', error.message);
      return null;
    });
}

function calculateChecksum(postData) {
  const sortedData = Object.keys(postData).sort().map(key => postData[key]).join('');

  return calculateChecksumHelper(sortedData + getCurrentDate());
}

function calculateChecksumHelper(data) {
  return sha256(data);
}
function getCurrentDate() {
  const date = new Date();
  return `${date.getFullYear()}-${padZero(date.getMonth() + 1)}-${padZero(date.getDate())}`;
}

function padZero(num) {
  return num.toString().padStart(2, '0');
}
function encryptSha(data, salt) {
  // Build a 256-bit key which is a SHA256 hash of salt and data.
  var key = sha256(salt + '@' + data);
  return key;
}

// SHA256 function
async function sha256(data) {
  const buffer = new TextEncoder().encode(data);
  const hashBuffer = crypto.subtle.digest('SHA-256', buffer);
  const hashArrayBuffer = await hashBuffer;
  const hashArray = Array.from(new Uint8Array(hashArrayBuffer));
  return hashArray.map(byte => byte.toString(16).padStart(2, '0')).join('');
}




