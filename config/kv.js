const axios = require("axios");

/**
 * ENV CONFIG
 */
const ACCOUNT_ID =
  process.env.CF_ACCOUNT_ID;

const NAMESPACE_ID =
  process.env.CF_NAMESPACE_ID;

const API_TOKEN =
  process.env.CF_API_TOKEN;

/**
 * Base URL
 */
const BASE_URL =
  `https://api.cloudflare.com/client/v4/accounts/${ACCOUNT_ID}/storage/kv/namespaces/${NAMESPACE_ID}/values`;

/**
 * Headers
 */
const headers = {
  Authorization: `Bearer ${API_TOKEN}`,
  "Content-Type": "application/json"
};

module.exports = {

  async set(key, value) {

    await axios.put(
      `${BASE_URL}/${key}`,
      value,
      { headers }
    );

    return true;
  },

  async get(key) {

    try {

      const res = await axios.get(
        `${BASE_URL}/${key}`,
        { headers }
      );

      return res.data;

    } catch (err) {

      if (err.response?.status === 404)
        return null;

      throw err;
    }
  },

  async del(key) {

    await axios.delete(
      `${BASE_URL}/${key}`,
      { headers }
    );

    return true;
  }

};
