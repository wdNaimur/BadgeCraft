declare module "*.css";

declare global {
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
      's-app-nav': any;
      's-text': any;
      's-link-item': any;
      'ui-modal': any;
      'ui-title-bar': any;
    }
  }
}

export {};


