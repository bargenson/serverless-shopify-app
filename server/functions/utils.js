'use strict';

const AWS = require('aws-sdk');
const { aws } = require('../config');

const lambda = new AWS.Lambda(aws.lambda);

async function getShopifyAuth(cookie) {
  const result = await lambda.invoke({
    FunctionName: 'shopify-auth',
    InvocationType: 'RequestResponse',
    Payload: JSON.stringify({ cookie }),
  }).promise();
  return JSON.parse(result.Payload);
}

module.exports = {
  async withAuthentication(event, callback) {
    return getShopifyAuth(event.headers.cookie || event.headers.Cookie)
      .catch(err => ({
        statusCode: 401,
        body: JSON.stringify({
          message: 'Unauthorized',
        }),
      }))
      .then(({ shop, accessToken }) => callback({ shop, accessToken }));
  }
};
