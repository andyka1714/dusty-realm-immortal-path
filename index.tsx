import React, { Suspense, lazy } from 'react';
import { createRoot } from 'react-dom/client';
import { Provider } from 'react-redux';
import { store } from './store/store';
import App from './App';
import "./styles/globals.css";
import { isPixelPrototypePreviewEnabled } from './utils/pixelPrototypePreview';

const AdventurePixelPrototypePreview = lazy(() =>
  import('./components/adventure/AdventurePixelPrototypePreview').then((module) => ({
    default: module.AdventurePixelPrototypePreview,
  }))
);

const container = document.getElementById('root');
if (!container) throw new Error('Failed to find the root element');
const root = createRoot(container);
const showPixelPrototypePreview = isPixelPrototypePreviewEnabled(
  window.location.search
);

root.render(
  <React.StrictMode>
    {showPixelPrototypePreview ? (
      <Suspense fallback={<div className="min-h-screen bg-stone-950 text-stone-400" />}>
        <AdventurePixelPrototypePreview />
      </Suspense>
    ) : (
      <Provider store={store}>
        <App />
      </Provider>
    )}
  </React.StrictMode>
);
