# Project Overview: BadgeCraft

## What are we doing?
We are building **BadgeCraft**, a Shopify application that allows merchants to create custom promotional badges (e.g., "Best Seller", "10% OFF", "Eco-Friendly") and display them on their online store's product pages.

### Key Features of BadgeCraft
1. **Merchant Dashboard (Admin Panel):**
   * A form to design badges: select text, background/text colors, and display styles.
   * A product selector to assign badges to specific products.
   * A listing page showing all active badges and their assigned products.
2. **Dynamic Storefront Display (Customer Facing):**
   * A visual badge rendered on the product detail page right above or below the product price.
   * Highly optimized layout matching the merchant's theme aesthetics.
3. **Automated Badging Rules:**
   * Automatic badges based on product conditions (e.g., automatically add a "Low Stock!" badge if inventory is below 5).

---

## Why are we doing it? (Learning Objectives)
Shopify App development has evolved significantly over the last few years. Developing this app teaches us the **modern standards** of Shopify development:

1. **Embedded App Design (App Bridge):**
   * **Why:** In the past, apps lived in separate tabs. Now, Shopify requires apps to be *embedded* directly inside the merchant's admin panel using iframe/App Bridge integration.
   * **Learning:** We will learn how to make our app feel like native Shopify software.
2. **GraphQL-First Development:**
   * **Why:** Shopify's REST Admin API is deprecated for new features. Shopify requires GraphQL for modern apps.
   * **Learning:** We will learn how to execute fast, paginated queries and mutations on products, metafields, and collections.
3. **Zero-Code Theme Integration (Theme App Extensions):**
   * **Why:** Previously, apps edited the merchant's Liquid theme files directly. If the app was uninstalled, it left behind broken code ("ghost code"). Shopify now enforces **Theme App Extensions**.
   * **Learning:** We will learn to write modular Liquid code blocks that merchants can drag-and-drop into their stores without modifying their codebase.
4. **Session Security & OAuth Flow:**
   * **Why:** App data security is paramount.
   * **Learning:** We will learn how Shopify executes the OAuth handshake, issues access tokens, and securely keeps sessions stored in our database.
5. **Decoupled Data Architecture (Prisma + Metafields):**
   * **Why:** Storefronts need to load badges in under 50ms. Fetching badge data from our database on every page visit is too slow.
   * **Learning:** We will save configurations in our local database for the admin dashboard, but sync the active badges to **Shopify Product Metafields** so they are served directly from Shopify's fast CDN.
