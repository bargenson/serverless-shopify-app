import React, { useState } from 'react';
import { AppProvider } from '@shopify/polaris';
import { Provider } from '@shopify/app-bridge-react';
import translations from '@shopify/polaris/locales/en.json';
import '@shopify/polaris/styles.css';
import Products from './containers/products';

function getShopifyCookie() {
  return fetch('https://versionify.localtunnel.me/shopify', { credentials: 'include' })
    .then((response) => {
      if (response.ok) {
        return response.json();
      }
      throw new Error(`${response.status}`);
    });
}

function App() {
  const [shopifyCookie, setShopifyCookie] = useState();

  if (shopifyCookie) {
    if (shopifyCookie.shop) {
      const config = {
        apiKey: 'd105ad6ba3544e9eb78f2d07c115dd45',
        shopOrigin: shopifyCookie.shop,
        forceRedirect: false,
      };

      return (
        <React.Fragment>
          <Provider config={config}>
            <AppProvider i18n={translations}>
              <Products />
            </AppProvider>
          </Provider>
        </React.Fragment>
      );
    } else {
      return (
        <React.Fragment>
          Please connect first.
        </React.Fragment>
      );
    }
  } else {
    getShopifyCookie()
      .then((shopifyCookie) => {
        setShopifyCookie(shopifyCookie);
      })
      .catch((err) => {
        alert(err);
      });

    return (
      <React.Fragment>
        Loading...
      </React.Fragment>
    );
  }
}

export default App;
