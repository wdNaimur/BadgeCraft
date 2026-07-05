// Define TypeScript interfaces for our application data
export interface ShopifyProduct {
  id: string;
  title: string;
  handle: string;
  featuredImage?: {
    url: string;
  } | null;
}

export interface DBBadgeProduct {
  id: string;
  badgeId: string;
  productId: string;
}

export interface DBBadge {
  id: string;
  shop: string;
  text: string;
  textColor: string;
  backgroundColor: string;
  fontSize: string;
  createdAt: string;
  updatedAt: string;
  products: DBBadgeProduct[];
}
