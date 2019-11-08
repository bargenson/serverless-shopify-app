import React from 'react';
import { AppProvider } from '@shopify/polaris';
import { Provider } from '@shopify/app-bridge-react';
import Cookies from 'js-cookie';
import translations from '@shopify/polaris/locales/en.json';
import '@shopify/polaris/styles.css';

function getShopifyCookie() {
  const base64 = Cookies.get('shopify');
  if (base64) {
    return JSON.parse(atob(base64));
  }
  return {};
}

function App() {
  const shopifyCookie = getShopifyCookie();
  console.log(shopifyCookie);

  const config = {
    apiKey: 'API_KEY',
    shopOrigin: shopifyCookie.shop,
    forceRedirect: false,
  };
  return (
    <React.Fragment>
      <Provider config={config}>
        <AppProvider i18n={translations}>
          <h1>Hello</h1>
          <p>
            Cookies: {JSON.stringify(Cookies.get())}
          </p>
        </AppProvider>
      </Provider>
    </React.Fragment>
  );
}

export default App;
