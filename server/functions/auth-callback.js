'use strict';

const querystring = require('querystring');
const nonce = require('nonce');
const safeCompare = require('safe-compare');
const crypto = require('crypto');
const { host, pathPrefix, shopify } = require('../config');

function getCookie(event, name) {
  const match = event.headers.cookie.match(new RegExp('(^| )' + name + '=([^;]+)'));
  if (match) return match[2];
}

function validateHmac(hmac, secret, query) {
  const { hmac: _hmac, signature: _signature, ...map } = query;

  const orderedMap = Object.keys(map)
    .sort((value1, value2) => value1.localeCompare(value2))
    .reduce((accum, key) => {
      accum[key] = map[key];
      return accum;
    }, {});

  const message = querystring.stringify(orderedMap);
  const generatedHash = crypto
    .createHmac('sha256', secret)
    .update(message)
    .digest('hex');

  return safeCompare(generatedHash, hmac);
}

module.exports.handler = async (event, context, callback) => {
  const query = event.queryStringParameters || {}
  const { state: nonce, shop, hmac, code } = query;
  const { apiKey, secret } = shopify;

  if (nonce == null || getCookie(event, 'nonce') !== nonce) {
    return callback(null, {
      statusCode: 403,
      body: JSON.stringify({
        error: 'Invalid nonce',
      }),
    });
  }

  if (shop == null) {
    return callback(null, {
      statusCode: 403,
      body: JSON.stringify({
        error: 'Shop is missing',
      }),
    });
  }

  if (validateHmac(hmac, secret, query) === false) {
    return callback(null, {
      statusCode: 400,
      body: JSON.stringify({
        error: 'Invalid hmac',
      }),
    });
  }

  const accessTokenQuery = querystring.stringify({
    code,
    client_id: apiKey,
    client_secret: secret,
  });

  const accessTokenResponse = await fetch(
    `https://${shop}/admin/oauth/access_token`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Content-Length': Buffer.byteLength(accessTokenQuery).toString(),
      },
      body: accessTokenQuery,
    },
  );

  if (!accessTokenResponse.ok) {
    return callback(null, {
      statusCode: 401,
      body: JSON.stringify({
        error: 'Access token fetch failure',
      }),
    });
  }

  const accessTokenData = await accessTokenResponse.json();
  const { access_token: accessToken } = accessTokenData;

  callback(null, {
    statusCode: 200,
    headers: {
      'Set-Cookie': `accessToken=${accessToken};path=/`,
    },
  });
};
