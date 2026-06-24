import { useState, useEffect } from "react";
import { useSubmit, useActionData } from "react-router";
import type { ShopifyProduct, DBBadge } from "../types";

export function useBadgeCraft(products: ShopifyProduct[]) {
  const actionData = useActionData<any>();
  const submit = useSubmit();

  // Local Form state for interactive Live Preview
  const [badgeText, setBadgeText] = useState("NEW ITEM");
  const [textColor, setTextColor] = useState("#FFFFFF");
  const [bgColor, setBgColor] = useState("#008060");
  const [searchQuery, setSearchQuery] = useState("");

  // Edit configuration state
  const [editingBadgeId, setEditingBadgeId] = useState<string | null>(null);
  const [selectedProductIds, setSelectedProductIds] = useState<string[]>([]);

  // Store which badge is targeted for deletion
  const [badgeToDelete, setBadgeToDelete] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Reset/Clear form state
  const handleCancelEdit = () => {
    setEditingBadgeId(null);
    setBadgeText("NEW ITEM");
    setTextColor("#FFFFFF");
    setBgColor("#008060");
    setSelectedProductIds([]);
  };

  // Reset form when action succeeds
  useEffect(() => {
    if (actionData && actionData.success) {
      handleCancelEdit();
    }
  }, [actionData]);

  // Load badge configuration for editing
  const handleEditClick = (badge: DBBadge) => {
    setEditingBadgeId(badge.id);
    setBadgeText(badge.text);
    setTextColor(badge.textColor);
    setBgColor(badge.backgroundColor);
    setSelectedProductIds(badge.products.map((p) => p.productId));
  };

  // Filter products by search text
  const filteredProducts = products.filter((product) =>
    product.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return {
    badgeText,
    setBadgeText,
    textColor,
    setTextColor,
    bgColor,
    setBgColor,
    searchQuery,
    setSearchQuery,
    editingBadgeId,
    selectedProductIds,
    setSelectedProductIds,
    badgeToDelete,
    setBadgeToDelete,
    isModalOpen,
    setIsModalOpen,
    handleCancelEdit,
    handleEditClick,
    filteredProducts,
    submit,
  };
}
