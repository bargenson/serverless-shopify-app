const baseUrl = 'https://versionify.localtunnel.me';

async function withResponseHandling(callback) {
  const response = await callback();
  if (response.ok) {
    switch (response.status) {
      case 204: return;
      default: return await response.json();
    }
  } else {
    switch (response.status) {
      case 401: throw new Error('Unauthorized');
      case 404: throw new Error('Resource does not exist');
      default: throw new Error('Unknown error');
    }
  }
}

export async function getShopifyAuth() {
  return withResponseHandling(() => fetch(`${baseUrl}/shopify`, { credentials: 'include' }));
}

export async function getProducts() {
  return withResponseHandling(() => fetch(`${baseUrl}/products`, { credentials: 'include' }));
}

export async function getProductVersions(productId) {
  return withResponseHandling(() =>
    fetch(`${baseUrl}/products/${productId}/versions`, { credentials: 'include' })
  );
}

export async function getProductVersion(productId, productVersionDate) {
  return withResponseHandling(() => fetch(
    `${baseUrl}/products/${productId}/versions/${productVersionDate}`,
    { credentials: 'include' },
  ));
}

export async function restoreProductVersion(productId, productVersionDate) {
  return withResponseHandling(() => fetch(
    `${baseUrl}/products/${productId}/versions/${productVersionDate}/restore`,
    { credentials: 'include' },
  ));
}
