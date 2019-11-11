'use strict';

const AWS = require('aws-sdk');
const { aws } = require('../config');

const documentClient = new AWS.DynamoDB.DocumentClient(aws.dynamodb);

function clean(obj) {
  const isArray = obj instanceof Array;
  for (var k in obj){
    if (!obj[k]) isArray ? obj.splice(k,1) : delete obj[k];
    else if (typeof obj[k]=="object") clean(obj[k]);
  }
  return obj;
}

module.exports.handler = async (event, context) => {
  console.log(event);

  const shop = event.headers['x-shopify-shop-domain'];
  const product = JSON.parse(event.body);

  const params = {
    TableName: 'ProductVersions',
    Item: Object.assign({}, clean(product), { shop }),
  };

  await documentClient.put(params).promise();
  return { body: JSON.stringify(product) };
};
