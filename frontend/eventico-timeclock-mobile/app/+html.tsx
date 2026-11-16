import React from 'react';
import { ScrollViewStyleReset } from 'expo-router/html';

export default function Root({ children }: React.PropsWithChildren) {
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1, shrink-to-fit=no" />
        <meta name="theme-color" content="#3b82f6" />
        <ScrollViewStyleReset />
        <style
          dangerouslySetInnerHTML={{
            __html: `
              html, body, #root { height: 100%; margin: 0; }
              body { background: #f3f4f6; }
              /* Fullscreen overlay to mask any dev tutorial flicker */
              #app-loader { position: fixed; inset: 0; z-index: 9999; display: flex; align-items: center; justify-content: center; flex-direction: column; gap: 8px; background: #f3f4f6; color: #1f2937; font-family: system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial, sans-serif; }
              #app-loader .spinner { width: 32px; height: 32px; border: 3px solid rgba(59,130,246,.25); border-top-color: #3b82f6; border-radius: 50%; animation: spin 1s linear infinite; }
              @keyframes spin { to { transform: rotate(360deg) } }
            `,
          }}
        />
      </head>
      <body>
        <div id="app-loader">
          <div className="spinner" />
          <div>Eventico Time Clock</div>
        </div>
        {children}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              // Hide the loader once the app bundle is loaded and hydrated
              window.addEventListener('load', function hideLoader() {
                var el = document.getElementById('app-loader');
                if (el && el.parentNode) { el.parentNode.removeChild(el); }
              });
            `,
          }}
        />
      </body>
    </html>
  );
}
