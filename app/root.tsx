import { Links, Meta, Outlet, Scripts, ScrollRestoration } from "react-router";

export default function App() {
  return (
    <html lang="en" suppressHydrationWarning>
      <head suppressHydrationWarning>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              const observer = new MutationObserver((mutations) => {
                for (const mutation of mutations) {
                  // A. Catch attributes like 'bis_size'
                  if (mutation.type === 'attributes' && mutation.attributeName === 'bis_size') {
                    const target = mutation.target;
                    if (target.tagName && target.tagName.toLowerCase().startsWith('s-')) {
                      target.removeAttribute('bis_size');
                    }
                  }
                  
                  // B. Catch added nodes (e.g. Cloudflare beacon script or components)
                  if (mutation.addedNodes) {
                    for (const node of mutation.addedNodes) {
                      if (node.nodeType === 1) {
                        // Remove Cloudflare beacon script
                        if (node.tagName === 'SCRIPT' && (node.src.includes('cloudflareinsights') || node.hasAttribute('data-cf-beacon'))) {
                          node.remove();
                          continue;
                        }
                        
                        // Strip 'bis_size' from custom elements
                        if (node.tagName && node.tagName.toLowerCase().startsWith('s-') && node.hasAttribute('bis_size')) {
                          node.removeAttribute('bis_size');
                        }
                        
                        const children = node.querySelectorAll('[bis_size]');
                        for (const child of children) {
                          child.removeAttribute('bis_size');
                        }

                        const cfScripts = node.querySelectorAll('script[src*="cloudflareinsights"], script[data-cf-beacon]');
                        for (const script of cfScripts) {
                          script.remove();
                        }
                      }
                    }
                  }
                }
              });
              observer.observe(document.documentElement, {
                childList: true,
                subtree: true,
                attributes: true,
                attributeFilter: ['bis_size']
              });
            `,
          }}
        />
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width,initial-scale=1" />
        <link rel="preconnect" href="https://cdn.shopify.com/" />
        <link
          rel="stylesheet"
          href="https://cdn.shopify.com/static/fonts/inter/v4/styles.css"
        />
        <Meta />
        <Links />
      </head>
      <body suppressHydrationWarning>
        <Outlet />
        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  );
}
