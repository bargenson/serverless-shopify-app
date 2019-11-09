import React, { useState } from 'react';
import { Page, Card, DataTable, Link, Thumbnail } from '@shopify/polaris';

function getProducts() {
  return fetch('https://versionify.localtunnel.me/products', { credentials: 'include' })
    .then((response) => {
      if (response.ok) {
        return response.json();
      }
      throw new Error(`${response.status}`);
    });
}

function Products() {
  const [ products, setProducts ] = useState();
  if (products) {
    console.log(products);
    const rows = products.map(product => {
      const imageSrc = ((product.images.edges[0] || {}).node || {}).src || 'https://burst.shopifycdn.com/photos/black-leather-choker-necklace_373x@2x.jpg';
      return [
        <Thumbnail
          source={imageSrc}
          alt={product.title}
        />,
        <Link  url={`https://www.example.com/${product.id}`} key="navy-merino-wool">
          {product.title}
        </Link>
      ];
    });
    return (
      <Page title="Products">
        <Card>
          <DataTable
            columnContentTypes={[
              'title',
            ]}
            headings={['', 'Product']}
            rows={rows}
          />
        </Card>
      </Page>
    );
  } else {
    getProducts()
      .then(products => setProducts(products))
      .catch(err => alert(err));

    return (
      <div>
        Loading products...
      </div>
    );
  }
}

export default Products;
