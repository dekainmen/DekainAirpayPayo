const crypto = require("crypto");
const https = require("https");
const querystring = require("querystring");

/**
 * MD5 Key for AES-256 (matches sample's hashing of username and password)
 */
function md5Key(username, password) {
  return crypto.createHash("md5")
    .update(username + "~:~" + password)
    .digest("hex");
}

/**
 * AES-256-CBC Encryption (aligns with WP plugin's encrypt function)
 */
function encrypt(text, secretKey) {
  const iv = crypto.randomBytes(8).toString("hex");
  const cipher = crypto.createCipheriv("aes-256-cbc", Buffer.from(secretKey, "utf-8"), Buffer.from(iv));
  const raw = Buffer.concat([cipher.update(text, "utf-8"), cipher.final()]);
  return iv + raw.toString("base64");
}

/**
 * AES-256-CBC Decryption (aligns with WP plugin's decrypt function)
 * The IV is the first 16 characters of the response.
 */
function decrypt(data, secretKey) {
  try {
    const iv = data.slice(0, 16);
    const encryptedData = data.slice(16);
    const decipher = crypto.createDecipheriv("aes-256-cbc", Buffer.from(secretKey, "utf-8"), Buffer.from(iv));
    let decrypted = decipher.update(Buffer.from(encryptedData, "base64"), null, "utf8");
    decrypted += decipher.final("utf8");
    return decrypted.trim();
  } catch (error) {
    console.error("Decryption error:", error);
    throw error;
  }
}

/**
 * Checksum for Token (aligns with WP plugin's checksumcal)
 * Appends current date in YYYY-MM-DD format (India timezone).
 */
function generateObjectChecksum(data) {
  const sortedKeys = Object.keys(data).sort();
  let payload = "";
  for (const key of sortedKeys) {
    payload += data[key];
  }
  // Use India timezone for date to match Airpay server (UTC+5:30)
  const today = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Kolkata',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  }).format(new Date());

  return crypto.createHash("sha256")
    .update(payload + today)
    .digest("hex");
}

/**
 * Checksum for Payment (aligns with WP plugin's encrypt_sha)
 * Used for privatekey generation: hash(salt + '@' + data)
 */
function generatePrivatekey(udata, secret) {
  return crypto.createHash("sha256")
    .update(`${secret}@${udata}`)
    .digest("hex");
}

function sendPost(url, payload) {
  return new Promise((resolve, reject) => {
    const postData = querystring.stringify(payload);
    const u = new URL(url);
    const options = {
      hostname: u.hostname,
      path: u.pathname + u.search,
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        "Content-Length": Buffer.byteLength(postData)
      }
    };

    const req = https.request(options, res => {
      let body = "";
      res.on("data", c => body += c);
      res.on("end", () => resolve(body));
    });

    req.on("error", reject);
    req.write(postData);
    req.end();
  });
}

/**
 * GET ACCESS TOKEN
 */
async function getAccessToken() {
  const merchant_id = process.env.AIRPAY_MERCHANT_ID;
  const username = process.env.AIRPAY_USERNAME;
  const password = process.env.AIRPAY_PASSWORD;
  const client_id = process.env.AIRPAY_CLIENT_ID;
  const client_secret = process.env.AIRPAY_CLIENT_SECRET;

  const key = md5Key(username, password);

  const requestBody = {
    client_id,
    client_secret,
    grant_type: "client_credentials",
    merchant_id
  };

  const encryptedData = encrypt(JSON.stringify(requestBody), key);
  const checksum = generateObjectChecksum(requestBody);

  const payload = {
    merchant_id,
    encdata: encryptedData,
    checksum
  };

  const tokenUrl = "https://kraken.airpay.co.in/airpay/pay/v4/api/oauth2/token.php";
  const response = await sendPost(tokenUrl, payload);

  try {
    const parsedResponse = JSON.parse(response);
    const decrypted = decrypt(parsedResponse.response, key);
    const tokenResponse = JSON.parse(decrypted);
    if (tokenResponse.data && tokenResponse.data.access_token) {
      return tokenResponse.data.access_token;
    } else {
      throw new Error(`Token response error: ${tokenResponse.msg || "Unknown error"}`);
    }
  } catch (err) {
    console.error("Token retrieval failed:", err);
    throw err;
  }
}

/**
 * CREATE PAYMENT FORM
 */
exports.createPayment = async (order) => {
  const merchant_id = process.env.AIRPAY_MERCHANT_ID;
  const username = process.env.AIRPAY_USERNAME;
  const password = process.env.AIRPAY_PASSWORD;
  const secret = process.env.AIRPAY_SECRET;

  const accessToken = await getAccessToken();
  const key = md5Key(username, password);

  const data = {
    buyer_email: order.email,
    buyer_firstname: order.name,
    buyer_lastname: order.lastname || "User",
    buyer_address: order.address || "NA",
    buyer_city: order.city || "NA",
    buyer_state: order.state || "NA",
    buyer_country: order.country || "IN",
    amount: Number(order.amount).toFixed(2),
    orderid: order.order_id,
    buyer_phone: order.phone,
    buyer_pincode: order.pincode || "000000",
    iso_currency: "inr",
    currency_code: "356",
    merchant_id,
    mer_dom: Buffer.from("http://localhost").toString("base64")
  };

  // WP plugin sorts keys before JSON stringification for encdata
  const sortedData = {};
  Object.keys(data).sort().forEach(k => sortedData[k] = data[k]);

  const udata = username + ":|:" + password;
  const privatekey = generatePrivatekey(udata, secret);
  const checksum = generateObjectChecksum(data);
  const encdata = encrypt(JSON.stringify(sortedData), key);

  const actionUrl = `https://payments.airpay.co.in/pay/v4/index.php?token=${encodeURIComponent(accessToken)}`;

  return {
    type: "form",
    action: actionUrl,
    method: "POST",
    fields: {
      privatekey,
      merchant_id,
      checksum,
      encdata,
      chmod: "",
      buyerEmail: data.buyer_email,
      buyerPhone: data.buyer_phone,
      buyerFirstName: data.buyer_firstname,
      buyerLastName: data.buyer_lastname,
      buyerAddress: data.buyer_address,
      buyerCity: data.buyer_city,
      buyerState: data.buyer_state,
      buyerCountry: data.buyer_country,
      buyerPinCode: data.buyer_pincode,
      orderid: data.orderid,
      amount: data.amount,
      currency: "356",
    }
  };
};

/**
 * CRC32 implementation (matches PHP's crc32 and Node's crc-32 package)
 */
function crc32(str) {
  let crc = 0 ^ -1;
  const table = [];
  for (let i = 0; i < 256; i++) {
    let c = i;
    for (let j = 0; j < 8; j++) {
      c = (c & 1) ? (0xEDB88320 ^ (c >>> 1)) : (c >>> 1);
    }
    table[i] = c;
  }
  for (let i = 0; i < str.length; i++) {
    crc = (crc >>> 8) ^ table[(crc ^ str.charCodeAt(i)) & 0xFF];
  }
  return (crc ^ -1) >>> 0;
}

/**
 * VERIFY RESPONSE
 */
exports.verifyResponse = async (responseData) => {
  const username = process.env.AIRPAY_USERNAME;
  const password = process.env.AIRPAY_PASSWORD;
  const merchant_id = process.env.AIRPAY_MERCHANT_ID;

  const key = md5Key(username, password);
  const decrypted = decrypt(responseData, key);

  const token = JSON.parse(decrypted);
  const data = token.data;

  const TRANSACTIONID = data.orderid;
  const APTRANSACTIONID = data.ap_transactionid;
  const AMOUNT = data.amount;
  const TRANSACTIONSTATUS = data.transaction_status;
  const MESSAGE = data.message;
  const ap_SecureHash = data.ap_securehash;

  const hashdata = `${TRANSACTIONID}:${APTRANSACTIONID}:${AMOUNT}:${TRANSACTIONSTATUS}:${MESSAGE}:${merchant_id}:${username}`;
  
  let txnhash = crc32(hashdata);

  if (data.chmod === 'upi' && data.customer_vpa) {
    txnhash = crc32(`${hashdata}:${data.customer_vpa}`);
  }

  const isValid = (txnhash === Number(ap_SecureHash));

  return {
    isValid,
    status: TRANSACTIONSTATUS,
    orderId: TRANSACTIONID,
    amount: AMOUNT,
    message: MESSAGE,
    data: data
  };
};

