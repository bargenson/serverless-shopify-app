const config = {
  serviceName: process.env.SERVICE_NAME,
  environment: process.env.ENVIRONMENT,
  offline: process.env.OFFLINE,
  host: process.env.HOST,
  clientHost: process.env.CLIENT_HOST,
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
    },
    dynamodb: {
      endpoint: process.env.AWS_DYNAMODB_ENDPOINT,
    },
  },
  encryption: {
    secret: process.env.ENCRYPTION_SECRET,
    algorithm: 'aes-256-cbc',
  },
};

console.log('Config:', config);

module.exports = config;
