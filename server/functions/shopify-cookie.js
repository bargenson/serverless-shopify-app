'use strict';

const { clientHost } = require('../config');

function getShopifyCookie(event, name) {
  const cookie = event.headers.cookie || event.headers.Cookie || '';
  const match = cookie.match(new RegExp('(^| )' + name + '=([^;]+)'));
  if (match) {
    return JSON.parse(
      new Buffer(match[2], 'base64').toString('ascii')
    );
  }
  return {};
}

module.exports.handler = async (event, context) => {
  console.log('Event:', event);

  const cookie = getShopifyCookie(event, 'shopify');

  return {
    headers: {
      'Access-Control-Allow-Origin': clientHost,
      'Access-Control-Allow-Credentials': true,
    },
    body: JSON.stringify(cookie),
  };
};
