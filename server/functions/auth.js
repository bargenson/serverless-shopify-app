'use strict';

const querystring = require('querystring');
const nonce = require('nonce');
const { host, shopify } = require('../config');

const createNonce = nonce();

module.exports.handler = async (event, context) => {
  console.log('Event', event);

  const { myShopifyDomain, scopes, apiKey, accessMode } = shopify;
  const { shop } = event.queryStringParameters || {};

  const shopRegex = new RegExp(
    `^[a-z0-9][a-z0-9\\-]*[a-z0-9]\\.${myShopifyDomain}$`,
    'i',
  );

  if (shop == null || !shopRegex.test(shop)) {
    return {
      statusCode: 400,
      body: JSON.stringify({
        error: 'Shop param is missing or invalid',
      }),
    };
  }

  const requestNonce = createNonce();

  const redirectParams = {
    state: requestNonce,
    scope: scopes.join(', '),
    client_id: apiKey,
    redirect_uri: `${host}/auth/callback`,
  };

  if (accessMode === 'online') {
    redirectParams['grant_options[]'] = 'per-user';
  }

  const formattedQueryString = querystring.stringify(redirectParams);

  return {
    statusCode: 301,
    headers: {
      Location: `https://${shop}/admin/oauth/authorize?${formattedQueryString}`,
      'Set-Cookie': `nonce=${requestNonce}`,
    }
  };
};
