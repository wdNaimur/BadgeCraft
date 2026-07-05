import { useState } from "react";

interface LivePreviewProps {
  badgeText: string;
  textColor: string;
  bgColor: string;
  fontSize?: string;
}

export function LivePreview({ badgeText, textColor, bgColor, fontSize = "medium" }: LivePreviewProps) {
  const [activeTab, setActiveTab] = useState<"pdp" | "plp">("pdp");

  let sizeStyle = {};
  if (fontSize === "small") {
    sizeStyle = { fontSize: "9px", padding: "3px 6px" };
  } else if (fontSize === "large") {
    sizeStyle = { fontSize: "14px", padding: "8px 14px" };
  } else {
    // medium
    sizeStyle = { fontSize: "11px", padding: "5px 10px" };
  }

  const badgeStyle = {
    backgroundColor: bgColor,
    color: textColor,
    ...sizeStyle,
  };

  return (
    <s-stack gap="small">
      <s-box>
        <s-heading>Live Preview</s-heading>
        
        <div className="bc-storefront-wrapper" style={{ marginTop: "12px" }}>
          {/* Browser Chrome Header */}
          <div className="bc-browser-header">
            <div className="bc-browser-dots">
              <span className="bc-browser-dot red"></span>
              <span className="bc-browser-dot yellow"></span>
              <span className="bc-browser-dot green"></span>
            </div>
            <div className="bc-browser-address-bar">
              <svg viewBox="0 0 16 16" fill="currentColor" width="10" height="10">
                <path d="M8 1a3 3 0 0 0-3 3v2H4.5A1.5 1.5 0 0 0 3 7.5v6A1.5 1.5 0 0 0 4.5 15h7a1.5 1.5 0 0 0 1.5-1.5v-6A1.5 1.5 0 0 0 11.5 6H11V4a3 3 0 0 0-3-3zm2 5H6V4a2 2 0 1 1 4 0v2z"/>
              </svg>
              your-store.myshopify.com
            </div>
          </div>

          {/* Navigation / Switcher Tabs */}
          <div className="bc-preview-tabs-container">
            <button
              type="button"
              className={`bc-preview-tab ${activeTab === "pdp" ? "active" : ""}`}
              onClick={() => setActiveTab("pdp")}
            >
              Product Page (PDP)
            </button>
            <button
              type="button"
              className={`bc-preview-tab ${activeTab === "plp" ? "active" : ""}`}
              onClick={() => setActiveTab("plp")}
            >
              Collection Grid (PLP)
            </button>
          </div>

          {/* Mock Storefront Body */}
          <div className="bc-mock-storefront-body">
            {activeTab === "pdp" ? (
              /* PDP Layout Preview */
              <div className="bc-pdp-layout">
                <div className="bc-pdp-image-col">
                  {/* Elegant Backpack SVG Vector */}
                  <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <rect x="25" y="30" width="50" height="50" rx="12" fill="url(#pdp-backpack-grad)" />
                    <rect x="32" y="55" width="36" height="20" rx="6" fill="#1e293b" opacity="0.3" />
                    <path d="M32 60 H68" stroke="#ffffff" strokeWidth="1.5" strokeLinecap="round" opacity="0.4" />
                    <path d="M40 30 C40 22 60 22 60 30" stroke="#475569" strokeWidth="4" strokeLinecap="round" />
                    <circle cx="50" cy="42" r="4" fill="#ffffff" opacity="0.8" />
                    <defs>
                      <linearGradient id="pdp-backpack-grad" x1="25" y1="30" x2="75" y2="80" gradientUnits="userSpaceOnUse">
                        <stop stopColor="#6366f1" />
                        <stop offset="1" stopColor="#4f46e5" />
                      </linearGradient>
                    </defs>
                  </svg>

                  {/* Badge Overlay in the top-left of the image */}
                  {badgeText && (
                    <div className="bc-badge-overlay">
                      <div className="bc-badge-render" style={badgeStyle}>
                        {badgeText}
                      </div>
                    </div>
                  )}
                </div>
                
                <div className="bc-pdp-info-col">
                  <span className="bc-pdp-vendor">Adventure Gear</span>
                  <h3 className="bc-pdp-title">Explorer Leather Backpack</h3>
                  
                  <div className="bc-pdp-rating">
                    {"★".repeat(5)}
                    <span className="bc-pdp-rating-count">(124 reviews)</span>
                  </div>

                  <div className="bc-pdp-price-container">
                    <span className="bc-pdp-price-current">$120.00</span>
                    <span className="bc-pdp-price-compare">$160.00</span>
                  </div>

                  <p className="bc-pdp-description">
                    Handcrafted from full-grain leather, featuring water-resistant zippers and a padded laptop sleeve.
                  </p>

                  <div className="bc-pdp-variants">
                    <span className="bc-pdp-variant-label">Color: Indigo</span>
                    <div className="bc-pdp-variant-options">
                      <button type="button" className="bc-pdp-variant-option active">Indigo</button>
                      <button type="button" className="bc-pdp-variant-option">Olive</button>
                    </div>
                  </div>

                  <div className="bc-pdp-actions">
                    <button type="button" className="bc-pdp-btn bc-pdp-btn-cart">Add to Cart</button>
                    <button type="button" className="bc-pdp-btn bc-pdp-btn-buy">Buy It Now</button>
                  </div>
                </div>
              </div>
            ) : (
              /* PLP Layout Preview */
              <div className="bc-plp-grid">
                {/* Product Card 1 with custom Badge Overlay */}
                <div className="bc-plp-card">
                  <div className="bc-plp-card-image-wrapper">
                    {/* Sneaker SVG Vector */}
                    <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M20 68 C20 68 35 62 48 55 C60 48 78 48 84 52 C90 56 92 68 76 68 C60 68 20 68 20 68 Z" fill="url(#card-shoe-grad)"/>
                      <path d="M40 68 H80" stroke="#ffffff" strokeWidth="2"/>
                      <defs>
                        <linearGradient id="card-shoe-grad" x1="20" y1="50" x2="90" y2="70" gradientUnits="userSpaceOnUse">
                          <stop stopColor="#3b82f6" />
                          <stop offset="1" stopColor="#1d4ed8" />
                        </linearGradient>
                      </defs>
                    </svg>
                    
                    {/* Badge Overlay */}
                    {badgeText && (
                      <div className="bc-badge-overlay">
                        <div className="bc-badge-render" style={badgeStyle}>
                          {badgeText}
                        </div>
                      </div>
                    )}
                  </div>
                  <div className="bc-plp-card-info">
                    <h4 className="bc-plp-card-title">Quantum Sport Sneaker</h4>
                    <span className="bc-plp-card-price">$129.00</span>
                  </div>
                </div>

                {/* Product Card 2 */}
                <div className="bc-plp-card">
                  <div className="bc-plp-card-image-wrapper">
                    {/* Bottle SVG Vector */}
                    <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <rect x="38" y="35" width="24" height="45" rx="6" fill="url(#card-bottle-grad)" />
                      <rect x="44" y="25" width="12" height="10" rx="2" fill="#334155" />
                      <rect x="42" y="32" width="16" height="3" fill="#64748b" />
                      <defs>
                        <linearGradient id="card-bottle-grad" x1="38" y1="35" x2="62" y2="80" gradientUnits="userSpaceOnUse">
                          <stop stopColor="#10b981" />
                          <stop offset="1" stopColor="#047857" />
                        </linearGradient>
                      </defs>
                    </svg>
                  </div>
                  <div className="bc-plp-card-info">
                    <h4 className="bc-plp-card-title">Hydro Gym Bottle</h4>
                    <span className="bc-plp-card-price">$24.00</span>
                  </div>
                </div>

                {/* Product Card 3 */}
                <div className="bc-plp-card">
                  <div className="bc-plp-card-image-wrapper">
                    {/* Watch SVG Vector */}
                    <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <rect x="44" y="15" width="12" height="70" rx="4" fill="#475569" />
                      <rect x="32" y="32" width="36" height="36" rx="8" fill="url(#card-watch-grad)" stroke="#334155" strokeWidth="2" />
                      <circle cx="50" cy="50" r="12" fill="#1e293b" />
                      <path d="M50 42 V50 H55" stroke="#10b981" strokeWidth="1.5" strokeLinecap="round" />
                      <defs>
                        <linearGradient id="card-watch-grad" x1="32" y1="32" x2="68" y2="68" gradientUnits="userSpaceOnUse">
                          <stop stopColor="#f59e0b" />
                          <stop offset="1" stopColor="#d97706" />
                        </linearGradient>
                      </defs>
                    </svg>
                  </div>
                  <div className="bc-plp-card-info">
                    <h4 className="bc-plp-card-title">Classic Smartwatch</h4>
                    <span className="bc-plp-card-price">$199.00</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </s-box>

      <s-box background="subdued" borderStyle="solid" borderWidth="small-100" borderColor="subdued" borderRadius="base" padding="base" style={{ marginTop: "24px" } as any}>
        <s-text color="subdued">
          <strong>Tip:</strong> The live preview demonstrates how the badge block will style and display itself on your shop storefront. Use the tabs to toggle between the product detail page and collection listings.
        </s-text>
      </s-box>
    </s-stack>
  );
}
