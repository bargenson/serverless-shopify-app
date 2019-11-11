'use strict';

const Shopify = require('shopify-api-node');
const { withAuthentication } = require('./utils');

function getProductsQuery() {
  return `
    query Products {
      products(first: 100) {
        edges {
          node {
            id
            title
            images(first: 1) {
              edges {
                node {
                  src
                }
              }
            }
          }
        }
      }
    }
  `;
}

module.exports.handler = async (event, context) => {
  console.log(event);

  return withAuthentication(event, async ({ shop, accessToken }) => {
    const shopify = new Shopify({
      shopName: shop,
      accessToken: accessToken,
    });

    try {
      const result = await shopify.graphql(getProductsQuery());
      const products = result.products.edges
        .map(result => result.node)
        .map(result => Object.assign({}, result, { id: parseInt(result.id.split('/').pop()) }));

      return {
        statusCode: 200,
        body: JSON.stringify(products),
      };
    } catch (err) {
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
