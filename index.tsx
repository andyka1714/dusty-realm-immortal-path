import React from 'react';
import { createRoot } from 'react-dom/client';
import { Provider } from 'react-redux';
import { store } from './store/store';
import App from './App';
import "./styles/globals.css";
import { AdventurePixelPrototypePreview } from './components/adventure/AdventurePixelPrototypePreview';
import { isPixelPrototypePreviewEnabled } from './utils/pixelPrototypePreview';

const container = document.getElementById('root');
if (!container) throw new Error('Failed to find the root element');
const root = createRoot(container);
const showPixelPrototypePreview = isPixelPrototypePreviewEnabled(
  window.location.search
);

root.render(
  <React.StrictMode>
    {showPixelPrototypePreview ? (
      <AdventurePixelPrototypePreview />
    ) : (
      <Provider store={store}>
        <App />
      </Provider>
    )}
  </React.StrictMode>
);
