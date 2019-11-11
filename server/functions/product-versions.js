'use strict';

const AWS = require('aws-sdk');
const { aws } = require('../config');
const { withAuthentication } = require('./utils');

const documentClient = new AWS.DynamoDB.DocumentClient(aws.dynamodb);

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
  console.log(event);

  const { productId } = event.pathParameters;

  if (productId) {
    return withAuthentication(event, async ({ shop, accessToken }) => {
      const params = {
        TableName: 'ProductVersions',
        IndexName: 'ShopIndex',
        KeyConditionExpression: 'id = :productId AND shop = :shop',
        ExpressionAttributeValues: {
          ':productId': parseInt(productId),
          ':shop': shop,
        },
      };
      const { Items: productVersions } = await documentClient.query(params).promise();
      return {
        statusCode: 200,
        body: JSON.stringify(productVersions.sort((a, b) => a.updated_at < b.updated_at)),
      };
    });
  } else {
    return {
      statusCode: 400,
      body: JSON.stringify({
        message: 'Path parameter `productId` is required.',
      }),
    };
  }
};
