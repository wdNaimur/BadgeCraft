# Development Roadmap: BadgeCraft

This document provides a checklist of tasks to implement the **BadgeCraft** project step-by-step.

---

## Phase 1: Local Setup & Running the Project
* [ ] Spin up the local development server: `npm run dev`
* [ ] Follow the CLI prompt to log into your Shopify Partner Account.
* [ ] Select/create a Development Store to install the app.
* [ ] Access the embedded Shopify Admin panel dashboard to verify the boilerplate works.

---

## Phase 2: Database Schema Definition
* [x] Add the `Badge` and `ProductBadge` models in `prisma/schema.prisma`.
* [x] Define fields: `id`, `text`, `backgroundColor`, `textColor`, `fontSize`, `createdAt`, `updatedAt`.
* [x] Run `npx prisma migrate dev --name init_badges` to update the local SQLite database.

---

## Phase 3: Product Selector & Admin Form (Polaris & GraphQL Loader)
* [x] Modify `app/routes/app._index.tsx` to include:
  * A table showing existing badges.
  * A "Create Badge" page/modal.
* [x] Use a GraphQL Query in the loader to fetch the store's products (`products(first: 50)`) so the merchant can pick which products they want to assign the badge to.
* [x] Render these products in a Polaris `ResourceList` or multi-select dropdown.

---

## Phase 4: Syncing Badges to Metafields (Server Action)
* [x] Declare metafield configuration under `product.metafields.app.badge_config` in `shopify.app.toml`.
* [x] Write server Action handler in `app/routes/app._index.tsx` to handle syncing.
* [x] When the merchant saves:
  1. Write the badge configuration to Prisma SQLite database.
  2. Call the Shopify Admin GraphQL API to write the badge JSON configuration to the product's metafield (`metafieldsSet` mutation).
* [x] When the merchant deletes:
  1. Query Shopify metafield IDs for assigned products.
  2. Call `metafieldDelete` to clear metafields from products.
  3. Delete from Prisma.

---

## Phase 5: Creating the Theme App Extension (Storefront Rendering)
* [ ] Run the CLI command: `npm run generate extension`
* [ ] Select **Theme App Extension** and name it `product-badge-block`.
* [ ] Inside the generated `extensions/product-badge-block/blocks/badge.liquid`:
  * Write the Liquid HTML to render the badge:
    ```liquid
    {% if product.metafields.app.badge.value %}
      <div style="background-color: {{ product.metafields.app.badge.value.bg_color }}; color: {{ product.metafields.app.badge.value.text_color }}; padding: 4px 8px; border-radius: 4px; display: inline-block;">
        {{ product.metafields.app.badge.value.text }}
      </div>
    {% endif %}
    ```
* [ ] Deploy the extension using `npm run deploy`.
* [ ] Enable the App Block in the development store's Theme Editor.

---

## Phase 6: Automated Inventory Badges (Webhooks)
* [ ] Register the `PRODUCTS_UPDATE` webhook topic.
* [ ] In the webhook route handler:
  * Parse the updated product's inventory level.
  * If inventory falls below 5, automatically set the product's metafield to show a "Low Stock!" badge.
  * If inventory goes back up, automatically clear or change the badge.

---

## Phase 7: Monetization (Billing API)
* [ ] Set up basic subscription pricing in `app/shopify.server.ts`.
* [ ] Protect the Badge Creation action: if the merchant has created more than 2 badges, redirect them to the Shopify Billing confirmation page.
