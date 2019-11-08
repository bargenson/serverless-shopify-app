'use strict';

const AWS = require('aws-sdk');
const { aws } = require('../config');

const documentClient = new AWS.DynamoDB.DocumentClient(aws.dynamodb);

module.exports.handler = async (event, context) => {
  console.log(event);

  const { productId } = event.pathParameters;

  if (productId) {
    const params = {
      TableName: 'productVersions',
      ScanIndexForward: false,
      KeyConditionExpression: 'id = :productId',
      ExpressionAttributeValues: {
        ':productId': parseInt(productId),
      },
    };
    const productVersions = await documentClient.query(params).promise();
    return {
      statusCode: 200,
      body: JSON.stringify(productVersions.Items),
    };
  } else {
    return {
      statusCode: 400,
      body: JSON.stringify({
        error: 'Path parameter `productId` is required.',
      }),
    };
  }
};
