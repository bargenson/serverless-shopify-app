import React, { useState, useEffect } from 'react';
import { Page, Card, DataTable, Frame, Link, SkeletonPage, SkeletonBodyText, Toast } from '@shopify/polaris';
import { getProductVersions } from '../clients/backend';
import { useParams } from 'react-router-dom';

function ProductVersions() {
  const [ productVersions, setProductVersions ] = useState([]);
  const [ loading, setLoading ] = useState(true);
  const [ error, setError ] = useState(false);
  const { productId } = useParams();

  useEffect(() => {
    setError(false);
    setLoading(true);
    (async () => {
      try {
        setProductVersions(await getProductVersions(productId));
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    })();
  }, [productId]);

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
    const rows = productVersions.map(productVersion => {
      return [
        <Link  url={`/products/${productId}/versions/${productVersion.updated_at}`}>
          {new Date(productVersion.updated_at).toLocaleString()}
        </Link>
      ];
    });

    return (
      <Page
        title="Product history"
        subtitle={(productVersions[0] || {}).title || ''}
        breadcrumbs={[{content: 'Products', url: '/products'}]}
      >
        <Card>
          <DataTable
            columnContentTypes={[
              'text',
            ]}
            headings={['Date']}
            rows={rows}
          />
        </Card>
      </Page>
    );
  }
}

export default ProductVersions;
