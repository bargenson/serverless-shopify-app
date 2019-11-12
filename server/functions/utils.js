'use strict';

const AWS = require('aws-sdk');
const { aws, offline, serviceName, environment } = require('../config');

const lambda = new AWS.Lambda(aws.lambda);

const utils = {
  async withAuthentication(event, callback) {
    return utils.getShopifyAuth(event.headers.cookie || event.headers.Cookie)
      .catch(err => {
        const errorMessage = 'Unauthorized';
        console.error(errorMessage, err);
        return {
          statusCode: 401,
          body: JSON.stringify({
            message: 'Unauthorized',
          }),
        };
      })
      .then(({ shop, accessToken }) => callback({ shop, accessToken }));
  },

  invokeLambda({functionName, invocationType, payload}) {
    const functionFullName = offline ? functionName : `${serviceName}-${environment}-${functionName}`;
    return lambda.invoke({
      FunctionName: functionFullName,
      InvocationType: invocationType,
      Payload: payload,
    }).promise();
  },

  async getShopifyAuth(cookie) {
    const result = await utils.invokeLambda({
      functionName: 'shopify-auth',
      invocationType: 'RequestResponse',
      payload: JSON.stringify({ cookie }),
    });
    return JSON.parse(result.Payload);
  },
};

module.exports = utils;
