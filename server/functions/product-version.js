'use strict';

const AWS = require('aws-sdk');
const { aws } = require('../config');
const { withAuthentication } = require('./utils');

const documentClient = new AWS.DynamoDB.DocumentClient(aws.dynamodb);

module.exports.handler = async (event, context) => {
  console.log(event);

  const httpTriggered = !!event.httpMethod;
  const { productId, productVersionDate } = httpTriggered ? event.pathParameters : event;

  if (!productId || !productVersionDate) {
    const errorMessage = 'Parameters `productId` and `productVersionDate` are required.';
    if (httpTriggered) {
      return {
        statusCode: 400,
        body: JSON.stringify({
          message: errorMessage,
        }),
      };
    }
    throw new Error(errorMessage);
  }

  const params = {
    TableName: 'ProductVersions',
    Key: {
      id: parseInt(productId),
      updated_at: productVersionDate,
    },
  };

  const { Item: productVersion } = await documentClient.get(params).promise();
  if (productVersion) {
    return httpTriggered ? {
      statusCode: 200,
      body: JSON.stringify(productVersion),
    } : productVersion;
  }
  return httpTriggered ? { statusCode: 404 } : undefined;
};
