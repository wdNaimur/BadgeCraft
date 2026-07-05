import {
  useLoaderData,
  Form,
  useSubmit,
  useActionData,
  useNavigate,
} from "react-router";
import type { LoaderFunctionArgs, ActionFunctionArgs } from "react-router";
import { authenticate } from "../shopify.server";
import db from "../db.server";
import { handleDashboardAction } from "../features/badge-craft/services/badgecraft.server";
import { useState, useEffect } from "react";
import {
  ProductSelector,
  LivePreview,
} from "../features/badge-craft/components";

// 1. Loader: Fetches product list and optional editing badge configuration
export const loader = async ({ request }: LoaderFunctionArgs) => {
  const { session, admin } = await authenticate.admin(request);
  const shop = session.shop;

  const url = new URL(request.url);
  const editId = url.searchParams.get("id");

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
    }`,
  );

  const responseJson = await response.json();
  const products =
    responseJson.data?.products?.edges.map((edge: any) => edge.node) || [];

  let editingBadge = null;
  if (editId) {
    editingBadge = await db.badge.findUnique({
      where: { id: editId },
      include: { products: true },
    });
  }

  return { products, editingBadge };
};

// 2. Action: Handles creating or editing badges in DB and Shopify Metafields
export const action = async ({ request }: ActionFunctionArgs) => {
  return await handleDashboardAction(request);
};

export default function CreateBadge() {
  const { products, editingBadge } = useLoaderData<typeof loader>();
  const navigate = useNavigate();
  const submit = useSubmit();
  const actionData = useActionData<any>();

  // State management for inputs
  const [badgeText, setBadgeText] = useState(editingBadge?.text || "NEW ITEM");
  const [textColor, setTextColor] = useState(
    editingBadge?.textColor || "#FFFFFF",
  );
  const [bgColor, setBgColor] = useState(
    editingBadge?.backgroundColor || "#008060",
  );
  const [fontSize, setFontSize] = useState(editingBadge?.fontSize || "medium");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedProductIds, setSelectedProductIds] = useState<string[]>(
    editingBadge?.products.map((p: any) => p.productId) || [],
  );

  // Filter products by search text
  const filteredProducts = products.filter((product: any) =>
    product.title.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  // Redirect back to dashboard on success
  useEffect(() => {
    if (actionData && actionData.success) {
      navigate("/app");
    }
  }, [actionData, navigate]);

  return (
    <s-page
      inlineSize="large"
      heading={
        editingBadge ? "Edit Badge Configuration" : "Create Product Badge"
      }
    >
      {/* Navigation Action header */}
      <s-box paddingBlockEnd="base">
        <s-button onClick={() => navigate("/app")}>
          ← Back to Dashboard
        </s-button>
      </s-box>

      <Form method="post">
        {/* Action configurations */}
        <input
          type="hidden"
          name="actionType"
          value={editingBadge ? "edit" : "create"}
        />
        {editingBadge && (
          <input type="hidden" name="badgeId" value={editingBadge.id} />
        )}

        {/* Hidden inputs to capture selected product IDs under all search filters */}
        {selectedProductIds.map((productId) => (
          <input
            key={productId}
            type="hidden"
            name="productIds"
            value={productId}
          />
        ))}

        {/* Three-Column Sketch Layout */}
        <s-grid gridTemplateColumns="1fr 1.2fr 1fr" gap="base">
          {/* Column 1: Select Products */}
          <s-grid-item>
            <s-box
              background="base"
              borderStyle="solid"
              borderWidth="small-100"
              borderColor="subdued"
              borderRadius="large"
              padding="large-200"
              style={{ height: "100%" } as any}
            >
              <s-box paddingBlockEnd="large-100">
                <s-heading level="2">Select Products</s-heading>
              </s-box>

              <ProductSelector
                searchQuery={searchQuery}
                setSearchQuery={setSearchQuery}
                filteredProducts={filteredProducts}
                selectedProductIds={selectedProductIds}
                setSelectedProductIds={setSelectedProductIds}
              />
            </s-box>
          </s-grid-item>

          {/* Column 2: Live Preview */}
          <s-grid-item>
            <s-box
              background="base"
              borderStyle="solid"
              borderWidth="small-100"
              borderColor="subdued"
              borderRadius="large"
              padding="large-200"
              style={{ height: "100%" } as any}
            >
              <LivePreview
                badgeText={badgeText}
                textColor={textColor}
                bgColor={bgColor}
                fontSize={fontSize}
              />
            </s-box>
          </s-grid-item>

          {/* Column 3: Controls / Styles */}
          <s-grid-item>
            <s-box
              background="base"
              borderStyle="solid"
              borderWidth="small-100"
              borderColor="subdued"
              borderRadius="large"
              padding="large-200"
              style={{ height: "100%" } as any}
            >
              <s-box paddingBlockEnd="large-100">
                <s-heading level="2">Badge Styles</s-heading>
              </s-box>

              <s-box paddingBlockEnd="large-100">
                <s-text-field
                  name="text"
                  label="Badge Label Text"
                  placeholder="e.g. 50% OFF, BOGO"
                  value={badgeText}
                  onChange={(e: any) => setBadgeText(e.currentTarget.value)}
                  required
                ></s-text-field>
              </s-box>

              <s-box paddingBlockEnd="large-100">
                <s-box paddingBlockEnd="small">
                  <s-text color="subdued">Badge Size</s-text>
                </s-box>
                <s-box
                  background="subdued"
                  borderStyle="solid"
                  borderWidth="small-100"
                  borderColor="subdued"
                  borderRadius="base"
                  padding="small"
                  style={{ display: "flex", alignItems: "center" } as any}
                >
                  <select
                    name="fontSize"
                    value={fontSize}
                    onChange={(e) => setFontSize(e.target.value)}
                    style={{
                      width: "100%",
                      background: "transparent",
                      border: "none",
                      outline: "none",
                      fontSize: "14px",
                      color: "var(--bc-text-dark)",
                      cursor: "pointer",
                    }}
                  >
                    <option value="small">Small</option>
                    <option value="medium">Medium</option>
                    <option value="large">Large</option>
                  </select>
                </s-box>
              </s-box>

              <s-grid
                gridTemplateColumns="1fr 1fr"
                gap="base"
                style={{ marginBottom: "20px" } as any}
              >
                <s-box>
                  <s-box paddingBlockEnd="small">
                    <s-text color="subdued">Text Color</s-text>
                  </s-box>
                  <s-box
                    background="subdued"
                    borderStyle="solid"
                    borderWidth="small-100"
                    borderColor="subdued"
                    borderRadius="base"
                    padding="small"
                    style={
                      {
                        display: "flex",
                        alignItems: "center",
                        gap: "8px",
                      } as any
                    }
                  >
                    <input
                      type="color"
                      name="textColor"
                      className="bc-color-preview-box"
                      value={textColor}
                      onChange={(e) => setTextColor(e.target.value)}
                    />
                    <s-text>{textColor}</s-text>
                  </s-box>
                </s-box>

                <s-box>
                  <s-box paddingBlockEnd="small">
                    <s-text color="subdued">Bg Color</s-text>
                  </s-box>
                  <s-box
                    background="subdued"
                    borderStyle="solid"
                    borderWidth="small-100"
                    borderColor="subdued"
                    borderRadius="base"
                    padding="small"
                    style={
                      {
                        display: "flex",
                        alignItems: "center",
                        gap: "8px",
                      } as any
                    }
                  >
                    <input
                      type="color"
                      name="backgroundColor"
                      className="bc-color-preview-box"
                      value={bgColor}
                      onChange={(e) => setBgColor(e.target.value)}
                    />
                    <s-text>{bgColor}</s-text>
                  </s-box>
                </s-box>
              </s-grid>

              <s-box
                style={
                  { display: "flex", gap: "12px", marginTop: "24px" } as any
                }
              >
                <s-button type="submit" variant="primary" style={{ flex: 1 }}>
                  {editingBadge ? "Update Badge" : "Save Configuration"}
                </s-button>
                <s-button onClick={() => navigate("/app")} style={{ flex: 1 }}>
                  Cancel
                </s-button>
              </s-box>
            </s-box>
          </s-grid-item>
        </s-grid>
      </Form>
    </s-page>
  );
}
