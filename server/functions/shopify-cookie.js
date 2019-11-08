'use strict';

const { clientHost } = require('../config');

function getShopifyCookie(event) {
  const cookie = event.headers.cookie || event.headers.Cookie || '';
  const match = cookie.match(new RegExp('(^| )shopify=([^;]+)'));
  if (match) {
    return JSON.parse(
      new Buffer(match[2], 'base64').toString('ascii')
    );
  }
  return {};
}

module.exports.handler = async (event, context) => {
  console.log('Event:', event);

  const cookie = getShopifyCookie(event);

  return {
    headers: {
      'Access-Control-Allow-Origin': clientHost,
      'Access-Control-Allow-Credentials': true,
    },
    body: JSON.stringify(cookie),
  };
};
