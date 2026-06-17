import { ScrollViewStyleReset } from 'expo-router/html';
import type { ReactNode } from 'react';

// This file is web-only and used to configure the root HTML for every
// web page during static rendering.
// The contents of this function only run in Node.js environments and
// do not have access to the DOM or browser APIs.
export default function Root({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta httpEquiv="X-UA-Compatible" content="IE=edge" />
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1, maximum-scale=1, viewport-fit=cover"
        />

        {/*
          Disable body scrolling on web. This makes ScrollView components work closer to how they do on native.
          However, body scrolling is often nice to have for mobile web. If you want to enable it, remove this line.
        */}
        <ScrollViewStyleReset />

        {/* Root layout + safe-area for mobile web (notched devices, home indicator). */}
        <style dangerouslySetInnerHTML={{ __html: responsiveRootStyles }} />
        {/* Add any additional <head> elements that you want globally available on web... */}
      </head>
      <body>{children}</body>
    </html>
  );
}

const responsiveRootStyles = `
html {
  -webkit-text-size-adjust: 100%;
  text-size-adjust: 100%;
  width: 100%;
  max-width: 100vw;
  overflow-x: hidden;
}
body {
  background-color: #fff;
  width: 100%;
  max-width: 100vw;
  margin: 0;
  padding: 0;
  overflow-x: hidden;
  min-height: 100%;
  min-height: 100dvh;
}
#root {
  width: 100%;
  max-width: 100vw;
  overflow-x: hidden;
  flex: 1;
  min-height: 100dvh;
}
@media (prefers-color-scheme: dark) {
  body {
    background-color: #000;
  }
}`;
