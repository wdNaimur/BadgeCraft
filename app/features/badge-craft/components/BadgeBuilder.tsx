import { Form } from "react-router";

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
