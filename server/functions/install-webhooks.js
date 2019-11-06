'use strict';

const Shopify = require('shopify-api-node');
const { host, pathPrefix } = require('../config');

function getWebhookMutationQuery() {
  return `
    mutation webhookSubscriptionCreate($topic: WebhookSubscriptionTopic!, $webhookSubscription: WebhookSubscriptionInput!) {
      webhookSubscriptionCreate(topic: $topic, webhookSubscription: $webhookSubscription) {
        userErrors {
          field
          message
        }
        webhookSubscription {
          id
        }
      }
    }
  `
}

module.exports.handler = async (event, context, callback) => {
  const shopify = new Shopify({
    shopName: event.shop,
    accessToken: event.accessToken,
  });
  const results = await Promise.all(
    [
      shopify.graphql(getWebhookMutationQuery(), {
        topic: 'PRODUCTS_CREATE',
        webhookSubscription: {
          callbackUrl: `${host}/${pathPrefix}/webhooks/product/create`,
          format: 'JSON',
        },
      }),
      shopify.graphql(getWebhookMutationQuery(), {
        topic: 'PRODUCTS_UPDATE',
        webhookSubscription: {
          callbackUrl: `${host}/${pathPrefix}/webhooks/product/update`,
          format: 'JSON',
        },
      }),
    ],
  );
  const errors = results
    .map(result => result.webhookSubscriptionCreate.userErrors)
    .reduce((a, b) => a.concat(b), [])
    .filter(Boolean);

  if (errors) {
    throw `Error while creating webhooks: ${JSON.stringify(errors)}`;
  }
  callback();
};
