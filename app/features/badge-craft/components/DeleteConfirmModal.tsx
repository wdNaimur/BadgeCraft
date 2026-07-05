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
      <s-box padding="large">
        <s-paragraph>
          Are you sure you want to delete this badge configuration? This will permanently remove the badge from all assigned storefront products.
        </s-paragraph>
        <s-box paddingBlockStart="large-100" style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' } as any}>
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
