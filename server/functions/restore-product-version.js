'use strict';

const AWS = require('aws-sdk');
const Shopify = require('shopify-api-node');
const { aws } = require('../config');
const { withAuthentication, invokeLambda } = require('./utils');

const documentClient = new AWS.DynamoDB.DocumentClient(aws.dynamodb);

function getProductUpdateMutation() {
  return `
    mutation ProductUpdate($input: ProductInput!) {
      productUpdate(input: $input) {
        product {
          id
        }
        userErrors {
          field
          message
        }
      }
    }
  `;
}

function convertProductToGraphqlProductInput(product) {
  return {
    id: product.admin_graphql_api_id,
    title: product.title,
    descriptionHtml: product.body_html,
    handle: product.handle,
    variants: (product.variants || []).map(variant => (
      {
        id: variant.admin_graphql_api_id,
        title: variant.title,
        taxable: variant.taxable,
        price: variant.price,
      }
    )),
  };
}

async function getProductVersion(productId, productVersionDate) {
  const result = await invokeLambda({
    functionName: 'product-version',
    invocationType: 'RequestResponse',
    payload: JSON.stringify({ productId, productVersionDate }),
  });
  return JSON.parse(result.Payload);
}

module.exports.handler = async (event, context) => {
  console.log('Event', event);

  const { productId, productVersionDate } = event.pathParameters;

  if (!productId || !productVersionDate) {
    return {
      statusCode: 400,
      body: JSON.stringify({
        message: 'Path parameters `productId` and `productVersionDate` are required.',
      }),
    };
  }

  return await withAuthentication(event, async ({ shop, accessToken }) => {

    const shopify = new Shopify({
      shopName: shop,
      accessToken,
    });

    try {
      const productVersion = await getProductVersion(productId, productVersionDate);
      console.log('Product version to restore', productVersion);
      const graphqlProductInput = convertProductToGraphqlProductInput(productVersion);
      console.log('GraphQL product input', graphqlProductInput);

      await shopify.graphql(
        getProductUpdateMutation(),
        { input: graphqlProductInput },
      );
      return { statusCode: 204 };
    } catch (err) {
      console.error('Error', err.extensions || err);
      if (err.statusCode === 401) {
        return {
          statusCode: err.statusCode,
          body: JSON.stringify({
            message: err.statusMessage,
          }),
        };
      } else {
        return {
          statusCode: 500,
          body: JSON.stringify(err),
        };
      }
    }
  });
};
