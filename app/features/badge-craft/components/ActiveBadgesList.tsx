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
    <s-box
      background="base"
      borderStyle="solid"
      borderWidth="small-100"
      borderColor="subdued"
      borderRadius="large"
      padding="large"
    >
      {badges.length === 0 ? (
        <>
          <s-heading level="3">No Badges Created</s-heading>
          <s-paragraph>
            Use the form above to build and apply your first storefront badge.
          </s-paragraph>
        </>
      ) : (
        <s-table>
          {/* Header row */}
          <s-table-header-row>
            <s-table-header>
              <s-text color="subdued">Badge Preview</s-text>
            </s-table-header>

            <s-table-header>
              <s-text color="subdued">Applied Products</s-text>
            </s-table-header>

            <s-table-header>
              <s-text color="subdued">Actions</s-text>
            </s-table-header>
          </s-table-header-row>

          {/* Body */}
          <s-table-body>
            {badges.map((badge) => (
              <s-table-row key={badge.id}>
                {/* Badge preview cell */}
                <s-table-cell>
                  <div
                    className="bc-badge-preview-cell"
                    style={{
                      backgroundColor: badge.backgroundColor,
                      color: badge.textColor,
                    }}
                  >
                    {badge.text}
                  </div>
                </s-table-cell>

                {/* Applied products cell */}
                <s-table-cell>
                  <s-stack direction="inline" gap="base">
                    {badge.products.length === 0 ? (
                      <s-text tone="critical">
                        Not applied to any products
                      </s-text>
                    ) : (
                      badge.products.map((bp) => (
                        <s-badge key={bp.id} tone="success">
                          {getProductTitle(bp.productId)}
                        </s-badge>
                      ))
                    )}
                  </s-stack>
                </s-table-cell>

                {/* Actions cell */}
                <s-table-cell>
                  <s-stack direction="block" gap="base">
                    <s-button onClick={() => onEditClick(badge)}>Edit</s-button>
                    <s-button
                      tone="critical"
                      onClick={() => onDeleteClick(badge.id)}
                    >
                      Delete
                    </s-button>
                  </s-stack>
                </s-table-cell>
              </s-table-row>
            ))}
          </s-table-body>
        </s-table>
      )}
    </s-box>
  );
}
