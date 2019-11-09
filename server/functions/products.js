'use strict';

const Shopify = require('shopify-api-node');

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
  `
}

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

  const { shop, accessToken } = getShopifyCookie(event);

  const shopify = new Shopify({
    shopName: shop,
    accessToken: accessToken,
  });

  const result = await shopify.graphql(getProductsQuery());
  const products = result.products.edges
    .map(result => result.node)
    .map(result => Object.assign({}, result, { id: parseInt(result.id.split('/').pop()) }));
  
  return {
    statusCode: 200,
    body: JSON.stringify(products),
  };
};
