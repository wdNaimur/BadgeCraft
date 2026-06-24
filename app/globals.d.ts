declare module "*.css";

import * as React from 'react';

declare module 'react' {
  namespace JSX {
    interface IntrinsicElements {
      's-page': any;
      's-button': any;
      's-section': any;
      's-paragraph': any;
      's-stack': any;
      's-box': any;
      's-heading': any;
      's-unordered-list': any;
      's-list-item': any;
      's-link': any;
      's-text-field': any;
      's-search-field': any;
      's-app-nav': any;
      's-text': any;
      's-link-item': any;
      'ui-modal': any;
      'ui-title-bar': any;
      's-grid': any;
      's-grid-item': any;
    }
  }
}

export {};


