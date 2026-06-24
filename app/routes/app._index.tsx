import type {
  ActionFunctionArgs,
  HeadersFunction,
  LoaderFunctionArgs,
} from "react-router";
import { useLoaderData } from "react-router";
import { boundary } from "@shopify/shopify-app-react-router/server";
import {
  BadgeBuilder,
  ProductSelector,
  LivePreview,
  ActiveBadgesList,
  DeleteConfirmModal,
} from "../components/BadgeCraftComponents";
import { fetchDashboardData, handleDashboardAction } from "../services/badgecraft.server";
import { useBadgeCraft } from "../hooks/useBadgeCraft";

// 1. Loader: Fetches DB Badges and Shopify Products
export const loader = async ({ request }: LoaderFunctionArgs) => {
  return await fetchDashboardData(request);
};

// 2. Action: Handles creating, editing, and deleting badges in the DB & syncing to Shopify Metafields
export const action = async ({ request }: ActionFunctionArgs) => {
  return await handleDashboardAction(request);
};

// 3. React Dashboard Component & Layout
export default function Index() {
  const { badges, products } = useLoaderData<typeof loader>();

  const {
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
  } = useBadgeCraft(products);

  return (
    <s-box padding="space-500">
      <s-page heading="BadgeCraft Dashboard">
        
        {/* Main Grid: Left Panel (Builder & Selector), Right Panel (Preview) */}
        <s-grid gridTemplateColumns="@media (min-width: 768px) 1.2fr 0.8fr, 1fr" gap="space-500" style={{ marginBottom: "32px" } as any}>
          <BadgeBuilder
            badgeText={badgeText}
            setBadgeText={setBadgeText}
            textColor={textColor}
            setTextColor={setTextColor}
            bgColor={bgColor}
            setBgColor={setBgColor}
            editingBadgeId={editingBadgeId}
            onCancelEdit={handleCancelEdit}
          >
            <ProductSelector
              searchQuery={searchQuery}
              setSearchQuery={setSearchQuery}
              filteredProducts={filteredProducts}
              selectedProductIds={selectedProductIds}
              setSelectedProductIds={setSelectedProductIds}
            />
          </BadgeBuilder>

          <LivePreview
            badgeText={badgeText}
            textColor={textColor}
            bgColor={bgColor}
          />
        </s-grid>

        {/* Bottom Section: Active Badges List */}
        <s-section heading="Active Configurations">
          <ActiveBadgesList
            badges={badges}
            products={products}
            onEditClick={handleEditClick}
            onDeleteClick={(badgeId) => {
              setBadgeToDelete(badgeId);
              setIsModalOpen(true);
            }}
          />
        </s-section>

      </s-page>

      {/* Custom Delete Confirmation Modal */}
      <DeleteConfirmModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setBadgeToDelete(null);
        }}
        onConfirm={() => {
          if (badgeToDelete) {
            const formData = new FormData();
            formData.append("actionType", "delete");
            formData.append("badgeId", badgeToDelete);
            submit(formData, { method: "post" });
          }
          setIsModalOpen(false);
          setBadgeToDelete(null);
        }}
      />
    </s-box>
  );
}

export const headers: HeadersFunction = (headersArgs) => {
  return boundary.headers(headersArgs);
};
