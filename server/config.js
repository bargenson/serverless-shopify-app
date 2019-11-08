const config = {
  host: process.env.HOST,
  clientHost: process.env.CLIENT_HOST,
  pathPrefix: process.env.PATH_PREFIX,
  shopify: {
    apiKey: process.env.SHOPIFY_API_KEY,
    secret: process.env.SHOPIFY_SECRET,
    myShopifyDomain: 'myshopify.com',
    scopes: ['read_products, write_products'],
    accessMode: 'online',
  },
  session: {
    key: 'auth',
    signed: false,
    httpOnly: false,
  },
  aws: {
    lambda: {
      apiVersion: '2015-03-31',
      endpoint: process.env.AWS_LAMBDA_ENDPOINT,
      region: 'us-east-1',
    },
    dynamodb: {
      region: 'localhost',
      endpoint: 'http://localhost:8000',
    },
  },
};

console.log('Config:', config);

module.exports = config;
