import type {
  ActionFunctionArgs,
  HeadersFunction,
  LoaderFunctionArgs,
} from "react-router";
import { useLoaderData, useNavigate } from "react-router";
import { boundary } from "@shopify/shopify-app-react-router/server";
import {
  ActiveBadgesList,
  DeleteConfirmModal,
} from "../features/badge-craft/components";
import {
  fetchDashboardData,
  handleDashboardAction,
} from "../features/badge-craft/services/badgecraft.server";
import { useBadgeCraft } from "../features/badge-craft/hooks/useBadgeCraft";

// 1. Loader: Fetches DB Badges and Shopify Products
export const loader = async ({ request }: LoaderFunctionArgs) => {
  return await fetchDashboardData(request);
};

// 2. Action: Handles deleting badges in the DB & syncing to Shopify Metafields
export const action = async ({ request }: ActionFunctionArgs) => {
  return await handleDashboardAction(request);
};

// 3. React Dashboard Component & Layout
export default function Index() {
  const { badges, products } = useLoaderData<typeof loader>();
  const navigate = useNavigate();

  const {
    badgeToDelete,
    setBadgeToDelete,
    isModalOpen,
    setIsModalOpen,
    submit,
  } = useBadgeCraft(products);

  return (
    <s-box padding="large-200">
      <s-page heading="BadgeCraft Dashboard" inlineSize="large">
        {/* Dashboard Actions Header */}
        <s-box
          paddingBlockEnd="large-100"
          style={{ display: "flex", justifyContent: "flex-end" } as any}
        >
          <s-button
            variant="primary"
            onClick={() => navigate("/app/create-badge")}
          >
            Create Badge
          </s-button>
        </s-box>

        {/* Bottom Section: Active Badges List */}
        <s-section heading="Active Configurations">
          <ActiveBadgesList
            badges={badges}
            products={products}
            onEditClick={(badge) =>
              navigate(`/app/create-badge?id=${badge.id}`)
            }
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
