'use strict';

const Shopify = require('shopify-api-node');
const { host, pathPrefix } = require('../config');

function getWebhooksByCallbackUrlQuery(callbackUrl) {
  return `
    query WebhookSubscriptions($callbackUrl: URL) {
      webhookSubscriptions(first: 1, callbackUrl: $callbackUrl) {
        edges {
          node {
            id
          }
        }
      }
    }
  `
}

function getWebhookMutationQuery() {
  return `
    mutation WebhookSubscriptionCreate($topic: WebhookSubscriptionTopic!, $webhookSubscription: WebhookSubscriptionInput!) {
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

function createWebhook(shopify, topic, callbackUrl) {
  return shopify.graphql(getWebhookMutationQuery(), {
    topic,
    webhookSubscription: {
      callbackUrl,
      format: 'JSON',
    },
  });
}

async function webhookExists(shopify, callbackUrl) {
  const result = await shopify.graphql(getWebhooksByCallbackUrlQuery(), {
    callbackUrl,
  });
  return result.webhookSubscriptions.edges.length > 0;
}

module.exports.handler = async (event, context) => {
  console.log('Event:', event);

  const shopify = new Shopify({
    shopName: event.shop,
    accessToken: event.accessToken,
  });

  const promises = [];

  const productCreateCallbackUrl = `${host}/${pathPrefix}/webhooks/product/create`;
  if (!await webhookExists(shopify, productCreateCallbackUrl)) {
    promises.push(createWebhook(shopify, 'PRODUCTS_CREATE', productCreateCallbackUrl));
  }

  const updateCreateCallbackUrl = `${host}/${pathPrefix}/webhooks/product/update`;
  if (!await webhookExists(shopify, updateCreateCallbackUrl)) {
    promises.push(createWebhook(shopify, 'PRODUCTS_UPDATE', updateCreateCallbackUrl));
  }

  const creationResults = await Promise.all(promises);
  const errors = creationResults
    .map(result => result.webhookSubscriptionCreate.userErrors)
    .reduce((a, b) => a.concat(b), [])
    .filter(Boolean);

  if (errors.length > 0) {
    throw `Error while creating webhooks: ${JSON.stringify(errors)}`;
  }
};
