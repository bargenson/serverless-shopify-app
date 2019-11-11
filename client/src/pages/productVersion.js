import React, { useState, useEffect } from 'react';
import { Page, Card, Frame, SkeletonPage, SkeletonBodyText, Toast } from '@shopify/polaris';
import { getProductVersion, restoreProductVersion } from '../clients/backend';
import { useParams } from 'react-router-dom';

function ProductVersion() {
  const [ productVersion, setProductVersion ] = useState();
  const [ loading, setLoading ] = useState(true);
  const [ error, setError ] = useState(null);
  const [ notice, setNotice ] = useState(null);
  const { productId, productVersionDate } = useParams();

  useEffect(() => {
    (async () => {
      setError(null);
      setLoading(true);
      try {
        setProductVersion(await getProductVersion(productId, productVersionDate));
      } catch (err) {
        setError(err);
      } finally {
        setLoading(false);
      }
    })();
  }, [productId, productVersionDate]);

  const onRestoreAction = async () => {
    setNotice(null);
    setError(null);
    setLoading(true);
    try {
      await restoreProductVersion(productId, productVersionDate);
      setNotice('Product version restored!');
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  };

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
    return (
      <Page
        title='Product version'
        breadcrumbs={[{content: 'Product versions', url: `/products/${productId}/versions`}]}
        primaryAction={{content: 'Restore', onAction: onRestoreAction}}
      >
        <Card>
          <Card title="Product">
            <Card.Section>
              <p>{productVersion.title}</p>
            </Card.Section>
            <Card.Section title="Description">
              <div dangerouslySetInnerHTML={{__html: productVersion.body_html}} />
            </Card.Section>
          </Card>
        </Card>
        {notice ? (
          <Frame>
            <Toast content={notice} />
          </Frame>
        ) : null}
      </Page>
    );
  }
}

export default ProductVersion;
