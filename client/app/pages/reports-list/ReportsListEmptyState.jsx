import * as React from "react";
import * as PropTypes from "prop-types";
import Button from "antd/lib/button";
import BigMessage from "@/components/BigMessage";
import NoTaggedObjectsFound from "@/components/NoTaggedObjectsFound";
import EmptyState, { EmptyStateHelpMessage } from "@/components/empty-state/EmptyState";
import DynamicComponent from "@/components/DynamicComponent";
import CreateDashboardDialog from "@/components/dashboards/CreateDashboardDialog";
import { currentUser } from "@/services/auth";
import HelpTrigger from "@/components/HelpTrigger";

export default function ReportsListEmptyState({ page, searchTerm, selectedTags }) {
  if (searchTerm !== "") {
    return <BigMessage message="Sorry, we couldn't find anything." icon="fa-search" />;
  }
  if (selectedTags.length > 0) {
    return <NoTaggedObjectsFound objectType="reports" tags={selectedTags} />;
  }
  switch (page) {
    case "favorites":
      return <BigMessage message="Mark reports as Favorite to list them here." icon="fa-star" />;
    case "my":
      const my_msg = currentUser.hasPermission("create_dashboard") ? (
        <span>
          <Button type="primary" size="small" onClick={() => CreateDashboardDialog.showModal()}>
            Create your first report!
          </Button>{" "}
          <HelpTrigger className="f-14" type="REPORTS" showTooltip={false}>
            Need help?
          </HelpTrigger>
        </span>
      ) : (
        <span>Sorry, we couldn't find anything.</span>
      );
      return <BigMessage icon="fa-search">{my_msg}</BigMessage>;
    default:
      return (
        <DynamicComponent name="DashboardList.EmptyState">
          <EmptyState
            icon="zmdi zmdi-view-quilt"
            description="See the big picture"
            illustration="report"
            helpMessage={<EmptyStateHelpMessage helpTriggerType="REPORTS" />}
            illustrationType=".png"
            showDashboardStep
          />
        </DynamicComponent>
      );
  }
}

ReportsListEmptyState.propTypes = {
  page: PropTypes.string.isRequired,
  searchTerm: PropTypes.string.isRequired,
  selectedTags: PropTypes.array.isRequired,
};
