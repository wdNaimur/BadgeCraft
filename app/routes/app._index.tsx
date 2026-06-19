import { useState } from "react";
import type {
  ActionFunctionArgs,
  HeadersFunction,
  LoaderFunctionArgs,
} from "react-router";
import { useLoaderData, useSubmit, Form } from "react-router";
import { authenticate } from "../shopify.server";
import db from "../db.server";
import { boundary } from "@shopify/shopify-app-react-router/server";

// Define TypeScript interfaces for our loader data
interface ShopifyProduct {
  id: string;
  title: string;
  handle: string;
  featuredImage?: {
    url: string;
  } | null;
}

interface DBBadgeProduct {
  id: string;
  badgeId: string;
  productId: string;
}

interface DBBadge {
  id: string;
  shop: string;
  text: string;
  textColor: string;
  backgroundColor: string;
  createdAt: string;
  updatedAt: string;
  products: DBBadgeProduct[];
}

// 1. Loader: Fetches DB Badges and Shopify Products
export const loader = async ({ request }: LoaderFunctionArgs) => {
  const { session, admin } = await authenticate.admin(request);
  const shop = session.shop;

  // Fetch local badge configurations
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
};

// 2. Action: Handles creating and deleting badges in the DB & syncing to Shopify Metafields
export const action = async ({ request }: ActionFunctionArgs) => {
  const { session, admin } = await authenticate.admin(request);
  const shop = session.shop;
  const formData = await request.formData();
  
  const actionType = formData.get("actionType");

  if (actionType === "create") {
    const text = formData.get("text") as string;
    const textColor = formData.get("textColor") as string || "#FFFFFF";
    const backgroundColor = formData.get("backgroundColor") as string || "#000000";
    const productIds = formData.getAll("productIds") as string[];

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

  if (actionType === "delete") {
    const id = formData.get("badgeId") as string;

    if (id) {
      // Fetch badge products to clear Shopify metafields first
      const badge = await db.badge.findUnique({
        where: { id },
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
          where: { id },
        });
      }

      return { success: true, message: "Badge deleted and synced successfully" };
    }
  }

  return null;
};

// 3. React Dashboard Component
export default function Index() {
  const { badges, products } = useLoaderData<typeof loader>();
  const submit = useSubmit();

  // Local Form state for interactive Live Preview
  const [badgeText, setBadgeText] = useState("NEW ITEM");
  const [textColor, setTextColor] = useState("#FFFFFF");
  const [bgColor, setBgColor] = useState("#008060");
  const [searchQuery, setSearchQuery] = useState("");

  // Store which badge is targeted for deletion
  const [badgeToDelete, setBadgeToDelete] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Filter products by search text
  const filteredProducts = products.filter((product) =>
    product.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Helper to map product titles for badges
  const getProductTitle = (productId: string) => {
    const prod = products.find((p) => p.id === productId);
    return prod ? prod.title : "Unknown Product";
  };

  return (
    <div className="badgecraft-container">
      <s-page heading="BadgeCraft Dashboard">
        
        {/* Main Grid: Left Panel (Builder & Selector), Right Panel (Preview) */}
        <div className="bc-grid" style={{ marginBottom: "32px" }}>
          
          {/* Builder Form Card */}
          <div className="bc-card">
            <h2 className="bc-card-title">Create Dynamic Badge</h2>
            
            <Form method="post">
              <input type="hidden" name="actionType" value="create" />
              
              <div className="bc-form-group">
                <label className="bc-label">Badge Label Text</label>
                <input
                  type="text"
                  name="text"
                  className="bc-input"
                  placeholder="e.g. 50% OFF, BOGO"
                  value={badgeText}
                  onChange={(e) => setBadgeText(e.target.value)}
                  required
                />
              </div>

              <div className="bc-color-picker-row">
                <div className="bc-form-group" style={{ flex: 1 }}>
                  <label className="bc-label">Text Color</label>
                  <div className="bc-color-input-wrapper">
                    <input
                      type="color"
                      name="textColor"
                      className="bc-color-preview-box"
                      value={textColor}
                      onChange={(e) => setTextColor(e.target.value)}
                    />
                    <span style={{ fontSize: "13px" }}>{textColor}</span>
                  </div>
                </div>

                <div className="bc-form-group" style={{ flex: 1 }}>
                  <label className="bc-label">Background Color</label>
                  <div className="bc-color-input-wrapper">
                    <input
                      type="color"
                      name="backgroundColor"
                      className="bc-color-preview-box"
                      value={bgColor}
                      onChange={(e) => setBgColor(e.target.value)}
                    />
                    <span style={{ fontSize: "13px" }}>{bgColor}</span>
                  </div>
                </div>
              </div>

              {/* Product Selector */}
              <div className="bc-form-group">
                <label className="bc-label">Apply to Products</label>
                <input
                  type="text"
                  className="bc-input"
                  style={{ marginBottom: "10px" }}
                  placeholder="Search products..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
                
                <div className="bc-product-selector">
                  {filteredProducts.length === 0 ? (
                    <div style={{ padding: "10px", color: "#6d7175", fontSize: "13px" }}>
                      No products found.
                    </div>
                  ) : (
                    filteredProducts.map((product) => (
                      <label key={product.id} className="bc-product-item">
                        <input
                          type="checkbox"
                          name="productIds"
                          value={product.id}
                        />
                        {product.featuredImage?.url ? (
                          <img
                            src={product.featuredImage.url}
                            alt={product.title}
                            className="bc-product-thumb"
                          />
                        ) : (
                          <div
                            className="bc-product-thumb"
                            style={{ background: "#e2e8f0", display: "inline-block" }}
                          />
                        )}
                        <span className="bc-product-info">{product.title}</span>
                      </label>
                    ))
                  )}
                </div>
              </div>

              <button type="submit" className="bc-btn" style={{ marginTop: "10px" }}>
                Save Badge Configuration
              </button>
            </Form>
          </div>

          {/* Real-time Dynamic Preview Card */}
          <div className="bc-card" style={{ display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
            <div>
              <h2 className="bc-card-title">Live Preview</h2>
              <div className="bc-preview-container">
                <span className="bc-preview-label">Storefront Widget</span>
                
                {/* Dynamically styled badge based on local states */}
                <div
                  className="bc-badge-render"
                  style={{
                    backgroundColor: bgColor,
                    color: textColor,
                  }}
                >
                  {badgeText || "PREVIEW"}
                </div>
              </div>
            </div>
            
            <div style={{ background: "#f9fafb", padding: "16px", borderRadius: "8px", border: "1px solid var(--bc-border)" }}>
              <p style={{ fontSize: "12px", margin: 0, color: "#6d7175", lineHeight: "1.4" }}>
                <strong>Tip:</strong> The live preview demonstrates how the badge block will style and display itself on your shop storefront.
              </p>
            </div>
          </div>

        </div>

        {/* Bottom Section: Active Badges List */}
        <s-section heading="Active Configurations">
          <div className="bc-card">
            {badges.length === 0 ? (
              <div className="bc-empty-state">
                <h3>No Badges Created</h3>
                <p>Use the form above to build and apply your first storefront badge.</p>
              </div>
            ) : (
              <div className="bc-table-container">
                <table className="bc-table">
                  <thead>
                    <tr>
                      <th>Badge Preview</th>
                      <th>Configuration</th>
                      <th>Applied Products</th>
                      <th style={{ textAlign: "right" }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {badges.map((badge) => (
                      <tr key={badge.id}>
                        <td>
                          <div
                            className="bc-badge-preview-cell"
                            style={{
                              backgroundColor: badge.backgroundColor,
                              color: badge.textColor,
                            }}
                          >
                            {badge.text}
                          </div>
                        </td>
                        <td>
                          <div style={{ fontSize: "12px" }}>
                            <strong>Text Color:</strong> {badge.textColor} <br />
                            <strong>Bg Color:</strong> {badge.backgroundColor}
                          </div>
                        </td>
                        <td>
                          {badge.products.length === 0 ? (
                            <span style={{ color: "#e14343", fontSize: "12px" }}>Not applied to any products</span>
                          ) : (
                            badge.products.map((bp) => (
                              <span key={bp.id} className="bc-tag">
                                {getProductTitle(bp.productId)}
                              </span>
                            ))
                          )}
                        </td>
                        <td style={{ textAlign: "right" }}>
                          <button
                            type="button"
                            className="bc-btn bc-btn-danger"
                            onClick={() => {
                              setBadgeToDelete(badge.id);
                              setIsModalOpen(true);
                            }}
                          >
                            Delete
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </s-section>

      </s-page>

      {/* Custom Delete Confirmation Modal */}
      {isModalOpen && (
        <div className="bc-modal-backdrop">
          <div className="bc-modal">
            <h3 className="bc-modal-title">
              <span style={{ marginRight: '6px' }}>⚠️</span> Delete Configuration
            </h3>
            <p className="bc-modal-body">
              Are you sure you want to delete this badge configuration? This will permanently remove the badge from all assigned storefront products.
            </p>
            <div className="bc-modal-actions">
              <button
                type="button"
                className="bc-btn-secondary"
                onClick={() => {
                  setIsModalOpen(false);
                  setBadgeToDelete(null);
                }}
              >
                Cancel
              </button>
              <button
                type="button"
                className="bc-btn-danger-modal"
                onClick={() => {
                  if (badgeToDelete) {
                    const formData = new FormData();
                    formData.append("actionType", "delete");
                    formData.append("badgeId", badgeToDelete);
                    submit(formData, { method: "post" });
                  }
                  setIsModalOpen(false);
                  setBadgeToDelete(null);
                }}
              >
                Delete Configuration
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export const headers: HeadersFunction = (headersArgs) => {
  return boundary.headers(headersArgs);
};
