import db from "../db.server";
import { authenticate } from "../shopify.server";
import type { ShopifyProduct, DBBadge } from "../types";

// 1. Fetches DB Badges and Shopify Products
export async function fetchDashboardData(request: Request) {
  const { session, admin } = await authenticate.admin(request);
  const shop = session.shop;

  // Fetch local badge configurations from SQLite
  const dbBadges = await db.badge.findMany({
    where: { shop },
    include: {
      products: true,
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  // Query Shopify's Admin GraphQL API for products
  const response = await admin.graphql(
    `#graphql
    query getProducts {
      products(first: 50) {
        edges {
          node {
            id
            title
            handle
            featuredImage {
              url
            }
          }
        }
      }
    }`
  );
  
  const responseJson = await response.json();
  const products: ShopifyProduct[] = 
    responseJson.data?.products?.edges.map((edge: any) => edge.node) || [];

  return {
    badges: dbBadges as unknown as DBBadge[],
    products,
  };
}

// 2. Creates a badge configuration in DB & syncs to Shopify Product Metafields
interface CreateBadgeInput {
  text: string;
  textColor: string;
  backgroundColor: string;
  productIds: string[];
}

export async function createBadge(request: Request, input: CreateBadgeInput) {
  const { session, admin } = await authenticate.admin(request);
  const shop = session.shop;
  const { text, textColor, backgroundColor, productIds } = input;

  if (!text) {
    return { error: "Badge text is required" };
  }

  // A. Save configuration in local SQLite database
  await db.badge.create({
    data: {
      shop,
      text,
      textColor,
      backgroundColor,
      products: {
        create: productIds.map((productId) => ({
          productId,
        })),
      },
    },
  });

  // B. Sync configuration to Shopify Product Metafields in a single batch mutation
  if (productIds.length > 0) {
    const metafields = productIds.map((productId) => ({
      ownerId: productId,
      namespace: "$app",
      key: "badge_config",
      type: "json",
      value: JSON.stringify({
        text,
        textColor,
        backgroundColor,
      }),
    }));

    const response = await admin.graphql(
      `#graphql
      mutation setMetafields($metafields: [MetafieldsSetInput!]!) {
        metafieldsSet(metafields: $metafields) {
          metafields {
            id
          }
          userErrors {
            field
            message
          }
        }
      }`,
      {
        variables: {
          metafields,
        },
      }
    );
    
    const responseJson = await response.json();
    console.log("Sync metafields result:", JSON.stringify(responseJson));
  }

  return { success: true, message: "Badge created and synced successfully" };
}

// 3. Deletes a badge configuration and clears storefront Shopify Metafields
export async function deleteBadge(request: Request, badgeId: string) {
  const { admin } = await authenticate.admin(request);

  if (badgeId) {
    // Fetch badge products to clear Shopify metafields first
    const badge = await db.badge.findUnique({
      where: { id: badgeId },
      include: { products: true },
    });

    if (badge) {
      // Clear metafields for all assigned products in a single batch mutation using modern metafieldsDelete API
      if (badge.products.length > 0) {
        const metafields = badge.products.map((bp) => ({
          ownerId: bp.productId,
          namespace: "$app",
          key: "badge_config",
        }));

        const response = await admin.graphql(
          `#graphql
          mutation deleteMetafields($metafields: [MetafieldIdentifierInput!]!) {
            metafieldsDelete(metafields: $metafields) {
              deletedMetafields {
                key
                namespace
                ownerId
              }
              userErrors {
                field
                message
              }
            }
          }`,
          {
            variables: {
              metafields,
            },
          }
        );
        
        const responseJson = await response.json();
        console.log("Delete metafields result:", JSON.stringify(responseJson));
      }

      // Delete from local Prisma database (cascades and clears bindings)
      await db.badge.delete({
        where: { id: badgeId },
      });
    }

    return { success: true, message: "Badge deleted and synced successfully" };
  }

  return { error: "Badge ID is required" };
}

// 4. Updates an existing badge configuration in DB & syncs to Shopify Product Metafields
interface UpdateBadgeInput {
  badgeId: string;
  text: string;
  textColor: string;
  backgroundColor: string;
  productIds: string[];
}

export async function updateBadge(request: Request, input: UpdateBadgeInput) {
  const { session, admin } = await authenticate.admin(request);
  const shop = session.shop;
  const { badgeId, text, textColor, backgroundColor, productIds } = input;

  if (!badgeId) {
    return { error: "Badge ID is required for editing" };
  }
  if (!text) {
    return { error: "Badge text is required" };
  }

  // A. Fetch current badge configuration to find changes in product association
  const existingBadge = await db.badge.findUnique({
    where: { id: badgeId },
    include: { products: true },
  });

  if (!existingBadge || existingBadge.shop !== shop) {
    return { error: "Badge not found" };
  }

  const oldProductIds = existingBadge.products.map(p => p.productId);

  const addedProductIds = productIds.filter(id => !oldProductIds.includes(id));
  const removedProductIds = oldProductIds.filter(id => !productIds.includes(id));
  const retainedProductIds = productIds.filter(id => oldProductIds.includes(id));

  // B. Perform local DB updates in a single transaction
  await db.$transaction([
    db.badge.update({
      where: { id: badgeId },
      data: { text, textColor, backgroundColor },
    }),
    db.badgeProduct.deleteMany({
      where: {
        badgeId,
        productId: { in: removedProductIds },
      },
    }),
    db.badgeProduct.createMany({
      data: addedProductIds.map(productId => ({
        badgeId,
        productId,
      })),
    }),
  ]);

  // C. Sync metafields to Shopify Admin GraphQL API
  // 1. Clear metafields for removed products
  if (removedProductIds.length > 0) {
    const metafields = removedProductIds.map((productId) => ({
      ownerId: productId,
      namespace: "$app",
      key: "badge_config",
    }));

    const response = await admin.graphql(
      `#graphql
      mutation deleteMetafields($metafields: [MetafieldIdentifierInput!]!) {
        metafieldsDelete(metafields: $metafields) {
          deletedMetafields {
            key
            namespace
            ownerId
          }
          userErrors {
            field
            message
          }
        }
      }`,
      {
        variables: {
          metafields,
        },
      }
    );
    const responseJson = await response.json();
    console.log("Delete metafields result for edit:", JSON.stringify(responseJson));
  }

  // 2. Set/Update metafields for added and retained products
  const productsToSync = [...addedProductIds, ...retainedProductIds];
  if (productsToSync.length > 0) {
    const metafields = productsToSync.map((productId) => ({
      ownerId: productId,
      namespace: "$app",
      key: "badge_config",
      type: "json",
      value: JSON.stringify({
        text,
        textColor,
        backgroundColor,
      }),
    }));

    const response = await admin.graphql(
      `#graphql
      mutation setMetafields($metafields: [MetafieldsSetInput!]!) {
        metafieldsSet(metafields: $metafields) {
          metafields {
            id
          }
          userErrors {
            field
            message
          }
        }
      }`,
      {
        variables: {
          metafields,
        },
      }
    );
    
    const responseJson = await response.json();
    console.log("Sync metafields result for edit:", JSON.stringify(responseJson));
  }

  return { success: true, message: "Badge updated and synced successfully" };
}

// 5. Handles creating, editing, and deleting badges (Route action handler)
export async function handleDashboardAction(request: Request) {
  const formData = await request.formData();
  const actionType = formData.get("actionType");

  if (actionType === "create") {
    const text = formData.get("text") as string;
    const textColor = formData.get("textColor") as string || "#FFFFFF";
    const backgroundColor = formData.get("backgroundColor") as string || "#000000";
    const productIds = formData.getAll("productIds") as string[];

    return await createBadge(request, { text, textColor, backgroundColor, productIds });
  }

  if (actionType === "edit") {
    const badgeId = formData.get("badgeId") as string;
    const text = formData.get("text") as string;
    const textColor = formData.get("textColor") as string || "#FFFFFF";
    const backgroundColor = formData.get("backgroundColor") as string || "#000000";
    const productIds = formData.getAll("productIds") as string[];

    return await updateBadge(request, { badgeId, text, textColor, backgroundColor, productIds });
  }

  if (actionType === "delete") {
    const id = formData.get("badgeId") as string;
    return await deleteBadge(request, id);
  }

  return null;
}
