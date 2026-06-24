import { Form } from "react-router";
import type { ShopifyProduct, DBBadge } from "../types";

// 1. Badge Builder Form Component
interface BadgeBuilderProps {
  badgeText: string;
  setBadgeText: (text: string) => void;
  textColor: string;
  setTextColor: (color: string) => void;
  bgColor: string;
  setBgColor: (color: string) => void;
  editingBadgeId: string | null;
  onCancelEdit?: () => void;
  children: React.ReactNode;
}

export function BadgeBuilder({
  badgeText,
  setBadgeText,
  textColor,
  setTextColor,
  bgColor,
  setBgColor,
  editingBadgeId,
  onCancelEdit,
  children,
}: BadgeBuilderProps) {
  return (
    <s-box background="base" borderStyle="solid" borderWidth="small-100" borderColor="subdued" borderRadius="large" padding="space-500">
      <s-box paddingBlockEnd="space-400">
        <s-heading level="2">
          {editingBadgeId ? "Edit Badge Configuration" : "Create Dynamic Badge"}
        </s-heading>
      </s-box>
      
      <Form method="post">
        <input type="hidden" name="actionType" value={editingBadgeId ? "edit" : "create"} />
        {editingBadgeId && <input type="hidden" name="badgeId" value={editingBadgeId} />}
        
        <s-box paddingBlockEnd="space-400">
          <s-text-field
            name="text"
            label="Badge Label Text"
            placeholder="e.g. 50% OFF, BOGO"
            value={badgeText}
            onChange={(e: any) => setBadgeText(e.currentTarget.value)}
            required
          ></s-text-field>
        </s-box>

        <s-grid gridTemplateColumns="1fr 1fr" gap="space-400" style={{ marginBottom: "20px" } as any}>
          <s-box>
            <s-box paddingBlockEnd="space-200">
              <s-text color="subdued">Text Color</s-text>
            </s-box>
            <s-box background="subdued" borderStyle="solid" borderWidth="small-100" borderColor="subdued" borderRadius="base" padding="space-200" style={{ display: 'flex', alignItems: 'center', gap: '8px' } as any}>
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
            <s-box paddingBlockEnd="space-200">
              <s-text color="subdued">Background Color</s-text>
            </s-box>
            <s-box background="subdued" borderStyle="solid" borderWidth="small-100" borderColor="subdued" borderRadius="base" padding="space-200" style={{ display: 'flex', alignItems: 'center', gap: '8px' } as any}>
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

        {children}

        <s-box style={{ display: "flex", gap: "12px", marginTop: "20px" } as any}>
          <s-button type="submit" variant="primary">
            {editingBadgeId ? "Update Badge Configuration" : "Save Badge Configuration"}
          </s-button>
          {editingBadgeId && onCancelEdit && (
            <s-button onClick={onCancelEdit}>
              Cancel
            </s-button>
          )}
        </s-box>
      </Form>
    </s-box>
  );
}

// 2. Product Selector List Component
interface ProductSelectorProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  filteredProducts: ShopifyProduct[];
  selectedProductIds: string[];
  setSelectedProductIds: React.Dispatch<React.SetStateAction<string[]>>;
}

export function ProductSelector({
  searchQuery,
  setSearchQuery,
  filteredProducts,
  selectedProductIds,
  setSelectedProductIds,
}: ProductSelectorProps) {
  return (
    <s-box paddingBlockEnd="space-400">
      <s-box paddingBlockEnd="space-300">
        <s-search-field
          label="Apply to Products"
          placeholder="Search products..."
          value={searchQuery}
          onChange={(e: any) => setSearchQuery(e.currentTarget.value)}
        ></s-search-field>
      </s-box>
      
      <s-box style={{ maxHeight: "250px", overflowY: "auto" } as any} borderStyle="solid" borderWidth="small-100" borderColor="subdued" borderRadius="base" padding="space-200" background="subdued">
        {filteredProducts.length === 0 ? (
          <s-box style={{ textAlign: "center", padding: "12px" } as any}>
            <s-text color="subdued">No products found.</s-text>
          </s-box>
        ) : (
          filteredProducts.map((product) => (
            <label key={product.id} style={{ display: "flex", alignItems: "center", gap: "12px", padding: "8px 12px", cursor: "pointer" }}>
              <input
                type="checkbox"
                name="productIds"
                value={product.id}
                checked={selectedProductIds.includes(product.id)}
                onChange={(e) => {
                  if (e.target.checked) {
                    setSelectedProductIds(prev => [...prev, product.id]);
                  } else {
                    setSelectedProductIds(prev => prev.filter(id => id !== product.id));
                  }
                }}
                className="bc-product-checkbox"
              />
              {product.featuredImage?.url ? (
                <img
                  src={product.featuredImage.url}
                  alt={product.title}
                  className="bc-product-thumb"
                />
              ) : (
                <s-box className="bc-product-thumb bc-product-thumb-placeholder" />
              )}
              <s-text>{product.title}</s-text>
            </label>
          ))
        )}
      </s-box>
    </s-box>
  );
}

// 3. Live Preview Card Component
interface LivePreviewProps {
  badgeText: string;
  textColor: string;
  bgColor: string;
}

export function LivePreview({ badgeText, textColor, bgColor }: LivePreviewProps) {
  return (
    <s-box
      background="base"
      borderStyle="solid"
      borderWidth="small-100"
      borderColor="subdued"
      borderRadius="large"
      padding="space-500"
      style={{ display: "flex", flexDirection: "column", justifyContent: "space-between" } as any}
    >
      <s-box>
        <s-box paddingBlockEnd="space-400">
          <s-heading level="2">Live Preview</s-heading>
        </s-box>
        <s-box
          background="subdued"
          borderStyle="dashed"
          borderWidth="large-100"
          borderColor="subdued"
          borderRadius="large"
          padding="space-600"
          style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: "140px", position: "relative" } as any}
        >
          <s-text color="subdued" style={{ position: "absolute", top: "10px", left: "10px", textTransform: "uppercase", letterSpacing: "1px", fontSize: "11px" } as any}>
            Storefront Widget
          </s-text>
          
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
        </s-box>
      </s-box>
      
      <s-box background="subdued" borderStyle="solid" borderWidth="small-100" borderColor="subdued" borderRadius="base" padding="space-300" style={{ marginTop: "24px" } as any}>
        <s-text color="subdued">
          <strong>Tip:</strong> The live preview demonstrates how the badge block will style and display itself on your shop storefront.
        </s-text>
      </s-box>
    </s-box>
  );
}

// 4. Active Badges Table Component
interface ActiveBadgesListProps {
  badges: DBBadge[];
  products: ShopifyProduct[];
  onEditClick: (badge: DBBadge) => void;
  onDeleteClick: (badgeId: string) => void;
}

export function ActiveBadgesList({
  badges,
  products,
  onEditClick,
  onDeleteClick,
}: ActiveBadgesListProps) {
  // Helper to map product titles for badges
  const getProductTitle = (productId: string) => {
    const prod = products.find((p) => p.id === productId);
    return prod ? prod.title : "Unknown Product";
  };
  return (
    <s-box background="base" borderStyle="solid" borderWidth="small-100" borderColor="subdued" borderRadius="large" padding="space-500">
      {badges.length === 0 ? (
        <s-box style={{ textAlign: "center", padding: "40px" } as any}>
          <s-heading level="3">No Badges Created</s-heading>
          <s-paragraph>Use the form above to build and apply your first storefront badge.</s-paragraph>
        </s-box>
      ) : (
        <s-box style={{ overflowX: "auto" } as any}>
          <table className="bc-table">
            <thead>
              <tr>
                <th><s-text color="subdued">Badge Preview</s-text></th>
                <th><s-text color="subdued">Configuration</s-text></th>
                <th><s-text color="subdued">Applied Products</s-text></th>
                <th style={{ textAlign: "right" }}><s-text color="subdued">Actions</s-text></th>
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
                    <s-text color="subdued">
                      <strong>Text Color:</strong> {badge.textColor} <br />
                      <strong>Bg Color:</strong> {badge.backgroundColor}
                    </s-text>
                  </td>
                  <td>
                    {badge.products.length === 0 ? (
                      <s-text tone="critical">Not applied to any products</s-text>
                    ) : (
                      badge.products.map((bp) => (
                        <s-box key={bp.id} background="subdued" padding="space-100" borderRadius="base" style={{ display: "inline-block", marginRight: "4px", fontSize: "11px" } as any}>
                          {getProductTitle(bp.productId)}
                        </s-box>
                      ))
                    )}
                  </td>
                  <td style={{ textAlign: "right" }}>
                    <s-button
                      onClick={() => onEditClick(badge)}
                      style={{ marginRight: "8px" } as any}
                    >
                      Edit
                    </s-button>
                    <s-button
                      tone="critical"
                      onClick={() => onDeleteClick(badge.id)}
                    >
                      Delete
                    </s-button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </s-box>
      )}
    </s-box>
  );
}

// 5. Delete Confirmation Modal Component
interface DeleteConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

export function DeleteConfirmModal({
  isOpen,
  onClose,
  onConfirm,
}: DeleteConfirmModalProps) {
  if (!isOpen) return null;
  return (
    <ui-modal id="delete-confirm-modal" open={isOpen} onHide={onClose}>
      <ui-title-bar title="Delete Configuration"></ui-title-bar>
      <s-box padding="space-500">
        <s-paragraph>
          Are you sure you want to delete this badge configuration? This will permanently remove the badge from all assigned storefront products.
        </s-paragraph>
        <s-box paddingBlockStart="space-400" style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' } as any}>
          <s-button onClick={onClose}>
            Cancel
          </s-button>
          <s-button tone="critical" onClick={onConfirm}>
            Delete Configuration
          </s-button>
        </s-box>
      </s-box>
    </ui-modal>
  );
}
