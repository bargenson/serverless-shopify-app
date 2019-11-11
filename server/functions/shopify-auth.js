'use strict';

const Crypto = require('crypto');
const { clientHost, encryption } = require('../config');

function getShopifyAuth(cookie) {
  const match = cookie.match(new RegExp('(^| )shopify=([^;]+)'));
  if (match) {
    try {
      const encryptedValue = match[2];
      const decipher = Crypto.createDecipher(encryption.algorithm, encryption.secret);
      const decrypted = decipher.update(encryptedValue, 'base64', 'utf8') + decipher.final('utf8');
      return JSON.parse(decrypted);
    } catch (err) {
      throw new Error(err.message);
    }
  }
  return {};
}

module.exports.handler = async (event, context) => {
  console.log('Event:', event);

  const httpTriggered = !!event.httpMethod;
  const cookie = httpTriggered ? (event.headers.cookie || event.headers.Cookie) : event.cookie;

  if (!cookie) {
    if (httpTriggered) {
      const errorMessage = 'No Shopify cookie';
      return {
        statusCode: 401,
        headers: {
          'Access-Control-Allow-Origin': clientHost,
          'Access-Control-Allow-Credentials': true,
        },
        body: JSON.stringify({ message: errorMessage }),
      };
    }
    throw new Error(errorMessage);
  }

  const shopifyAuth = getShopifyAuth(cookie);

  if (httpTriggered) {
    return {
      headers: {
        'Access-Control-Allow-Origin': clientHost,
        'Access-Control-Allow-Credentials': true,
      },
      body: JSON.stringify(shopifyAuth),
    };
  }
  return shopifyAuth;
};
