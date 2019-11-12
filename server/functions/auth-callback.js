'use strict';

const Crypto = require('crypto');
const querystring = require('querystring');
const nonce = require('nonce');
const safeCompare = require('safe-compare');
const crypto = require('crypto');
const fetch = require('node-fetch');
const { shopify, clientHost, encryption } = require('../config');
const { invokeLambda } = require('./utils');

function getCookie(event, name) {
  const cookie = event.headers.cookie || event.headers.Cookie || '';
  const match = cookie.match(new RegExp('(^| )' + name + '=([^;]+)'));
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

function validateNonce(event) {
  const { state: nonce } = event.queryStringParameters || {};
  return nonce && getCookie(event, 'nonce') === nonce;
}

function validateShop(event) {
  const { shop } = event.queryStringParameters || {};
  return !!shop;
}

function installWebhooks(shop, accessToken) {
  return invokeLambda({
    functionName: 'install-webhooks',
    invocationType: 'Event',
    payload: JSON.stringify({ shop, accessToken }),
  });
}

function createCookie(value) {
  try {
    const cipher = Crypto.createCipher(encryption.algorithm, encryption.secret);
    const encrypted = cipher.update(JSON.stringify(value), 'utf8', 'base64') + cipher.final('base64');
    return `shopify=${encrypted};path=/`;
  } catch (err) {
    throw new Error(err.message);
  }
}

module.exports.handler = async (event, context) => {
  console.log('Event', event);

  const query = event.queryStringParameters || {}
  const { shop, hmac, code } = query;
  const { apiKey, secret } = shopify;

  if(!validateNonce(event)) {
    return {
      statusCode: 403,
      body: JSON.stringify({
        message: 'Invalid nonce',
      }),
    };
  }

  if(!validateShop(event)) {
    return {
      statusCode: 403,
      body: JSON.stringify({
        message: 'Shop is missing',
      }),
    };
  }

  if (validateHmac(hmac, secret, query) === false) {
    return {
      statusCode: 400,
      body: JSON.stringify({
        message: 'Invalid hmac',
      }),
    };
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
    return {
      statusCode: 401,
      body: JSON.stringify({
        message: 'Access token fetch failure',
      }),
    };
  }

  const accessTokenData = await accessTokenResponse.json();
  const { access_token: accessToken } = accessTokenData;

  await installWebhooks(shop, accessToken);

  return {
    statusCode: 303,
    headers: {
      'Location': clientHost,
      'Set-Cookie': createCookie({ accessToken, shop }),
    },
  };
};
