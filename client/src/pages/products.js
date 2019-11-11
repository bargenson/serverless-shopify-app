import React, { useState, useEffect } from 'react';
import { Page, Card, DataTable, Frame, Link, Thumbnail, SkeletonPage, SkeletonBodyText, Toast } from '@shopify/polaris';
import { getProducts } from '../clients/backend';

const defaultThumbnailSrc = 'https://www.softwarearge.com/wp-content/uploads/2018/09/no-image-icon-6.png';

function Products() {
  const [ products, setProducts ] = useState([]);
  const [ loading, setLoading ] = useState(true);
  const [ error, setError ] = useState(false);

  useEffect(() => {
    setError(false);
    setLoading(true);
    (async () => {
      try {
        setProducts(await getProducts());
      } catch (err) {
        setError(err);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  if (loading || error) {
    return (
      <SkeletonPage primaryAction>
        <Card sectioned>
          <SkeletonBodyText />
        </Card>
        {error ? (
          <Frame>
            <Toast content={error.message} error />
          </Frame>
        ) : null}
      </SkeletonPage>
    );
  } else {
    const rows = products.map(product => {
      const imageSrc =
        (
          (
            product.images.edges[0] || {}
          ).node || {}
        ).src || defaultThumbnailSrc;
      return [
        <Thumbnail
          source={imageSrc}
          alt={product.title}
        />,
        <Link url={`/products/${product.id}/versions`}>
          {product.title}
        </Link>
      ];
    });
    return (
      <Page title="Products">
        <Card>
          <DataTable
            columnContentTypes={[
              'text',
            ]}
            headings={['', 'Product']}
            rows={rows}
          />
        </Card>
      </Page>
    );
  }
}

export default Products;
