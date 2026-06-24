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
