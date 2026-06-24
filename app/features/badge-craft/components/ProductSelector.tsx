import type React from "react";
import type { ShopifyProduct } from "../types";

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
