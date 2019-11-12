import React, { useState, useEffect } from 'react';
import { Frame, Loading, Banner } from '@shopify/polaris';
import {
  BrowserRouter as Router,
  Switch,
  Route,
  Redirect,
} from 'react-router-dom';
import { Provider } from '@shopify/app-bridge-react';
import '@shopify/polaris/styles.css';
import { Products, ProductVersions, ProductVersion } from './pages';
import { getShopifyAuth } from './clients/backend';

function App() {
  const [shopifyAuth, setShopifyAuth] = useState();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    setError(false);
    setLoading(true);
    (async () => {
      try {
        setShopifyAuth(await getShopifyAuth());
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  if (loading) {
    return (
      <Frame>
        <Loading />
      </Frame>
    );
  } else if (error) {
    return (
      <Banner
        title='Error while reaching server'
        status='critical'
      >
        <p>
          Please try refreshing the page in a few moment.
        </p>
        <p>
          Details: {error}
        </p>
      </Banner>
    );
  } else {
    const config = {
      apiKey: 'd105ad6ba3544e9eb78f2d07c115dd45',
      shopOrigin: shopifyAuth.shop,
      forceRedirect: false,
    };
    return (
      <React.Fragment>
        <Provider config={config}>
          <Router>
            <Switch>
              <Route exact path="/">
                <Redirect to="/products" />
              </Route>
              <Route exact path='/products'>
                <Products />
              </Route>
              <Route exact path='/products/:productId/versions'>
                <ProductVersions />
              </Route>
              <Route exact path='/products/:productId/versions/:productVersionDate'>
                <ProductVersion />
              </Route>
            </Switch>
          </Router>
        </Provider>
      </React.Fragment>
    );
  }
}

export default App;
