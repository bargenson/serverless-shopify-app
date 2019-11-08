'use strict';

const querystring = require('querystring');
const nonce = require('nonce');
const safeCompare = require('safe-compare');
const crypto = require('crypto');
const fetch = require('node-fetch');
const { host, pathPrefix, shopify, clientHost } = require('../config');

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

module.exports.handler = async (event, context) => {
  console.log('Event:', event);

  const query = event.queryStringParameters || {}
  const { shop, hmac, code } = query;
  const { apiKey, secret } = shopify;

  if(!validateNonce(event)) {
    return {
      statusCode: 403,
      body: JSON.stringify({
        error: 'Invalid nonce',
      }),
    };
  }

  if(!validateShop(event)) {
    return {
      statusCode: 403,
      body: JSON.stringify({
        error: 'Shop is missing',
      }),
    };
  }

  if (validateHmac(hmac, secret, query) === false) {
    return {
      statusCode: 400,
      body: JSON.stringify({
        error: 'Invalid hmac',
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
        error: 'Access token fetch failure',
      }),
    };
  }

  const accessTokenData = await accessTokenResponse.json();
  const { access_token: accessToken } = accessTokenData;

  const cookieValue = JSON.stringify({ accessToken, shop });

  return {
    statusCode: 303,
    headers: {
      'Location': clientHost,
      'Set-Cookie': `shopify=${Buffer.from(cookieValue).toString('base64')};path=/`,
    },
  };
};
