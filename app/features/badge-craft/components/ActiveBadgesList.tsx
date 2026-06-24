import type { ShopifyProduct, DBBadge } from "../types";

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
