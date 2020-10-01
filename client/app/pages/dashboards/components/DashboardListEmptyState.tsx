import * as PropTypes from "prop-types";
import * as React from "react";
// eslint-disable-next-line @typescript-eslint/ban-ts-ignore
// @ts-ignore
import BigMessage from "../../../components/BigMessage";
import EmptyState from "../../../components/empty-state/EmptyState";
// eslint-disable-next-line @typescript-eslint/ban-ts-ignore
// @ts-ignore
import NoTaggedObjectsFound from "../../../components/NoTaggedObjectsFound";

export interface DashboardListEmptyStateProps {
  page: string;
  searchTerm: string;
  selectedTags: string[];
}

export default function DashboardListEmptyState({ page, searchTerm, selectedTags }: DashboardListEmptyStateProps) {
  if (searchTerm !== "") {
    return <BigMessage message="Sorry, we couldn't find anything." icon="fa-search" />;
  }
  if (selectedTags.length > 0) {
    return <NoTaggedObjectsFound objectType="dashboards" tags={selectedTags} />;
  }
  switch (page) {
    case "favorites":
      return <BigMessage message="Mark dashboards as Favorite to list them here." icon="fa-star" />;
    default:
      return (
        <EmptyState
          icon="zmdi zmdi-view-quilt"
          description="See the big picture"
          illustration="dashboard"
          helpLink="https://help.redash.io/category/22-dashboards"
          showDashboardStep={true}
        />
      );
  }
}

DashboardListEmptyState.propTypes = {
  page: PropTypes.string.isRequired,
  searchTerm: PropTypes.string.isRequired,
  selectedTags: PropTypes.array.isRequired
};
