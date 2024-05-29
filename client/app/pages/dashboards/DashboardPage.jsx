import { isEmpty } from "lodash";
import React, { useState, useEffect } from "react";
import PropTypes from "prop-types";
import cx from "classnames";

import Button from "antd/lib/button";
import Checkbox from "antd/lib/checkbox";
import routeWithUserSession from "@/components/ApplicationArea/routeWithUserSession";
import DashboardGrid from "@/components/dashboards/DashboardGrid";
import Parameters from "@/components/Parameters";
import Filters from "@/components/Filters";

import { Dashboard } from "@/services/dashboard";
import recordEvent from "@/services/recordEvent";
import resizeObserver from "@/services/resizeObserver";
import routes from "@/services/routes";
import location from "@/services/location";
import url from "@/services/url";
import useImmutableCallback from "@/lib/hooks/useImmutableCallback";

import useDashboard from "./hooks/useDashboard";
import DashboardHeader from "./components/DashboardHeader";

import "./DashboardPage.less";

import { setColorElements } from "@/pages/reports/components/ReportPageHeader";

import { EssenceFixtures } from "@/components/TurniloComponent/common/models/essence/essence.fixtures";
import { FilterTile } from "@/components/TurniloComponent/client/components/filter-tile/filter-tile-widget";
import { Timekeeper } from "@/components/TurniloComponent/common/models/timekeeper/timekeeper";
import { Stage as visualizationStage } from "@/components/TurniloComponent/common/models/stage/stage";


class DashboardSettings extends React.Component {
  static propTypes = {
    dashboardOptions: PropTypes.object.isRequired, // eslint-disable-line react/forbid-prop-types
  };

  render() {
    const { dashboardOptions } = this.props;
    const { dashboard, updateDashboard, addWidgetStyle } = dashboardOptions;
    return (
      <div className="bg-white tiled">
        {/* THIS CHECKBOX DOESNT WORK? */}
        {/* <Checkbox
          checked={!!dashboard.dashboard_filters_enabled}
          onChange={({ target }) => updateDashboard({ dashboard_filters_enabled: target.checked })}
          data-test="DashboardFiltersCheckbox">
          Use Dashboard Level Filters
        </Checkbox> */}
        <AddWidgetContainer dashboardOptions={dashboardOptions} style={addWidgetStyle} />
      </div>
    );
  }
}

class AddWidgetContainer extends React.Component {
  static propTypes = {
    dashboardOptions: PropTypes.object.isRequired, // eslint-disable-line react/forbid-prop-types
    className: PropTypes.string,
  };

  render() {
    const { dashboardOptions, className, ...props } = this.props;
    const { showAddTextboxDialog, showAddWidgetDialog, showReportDialog } = dashboardOptions;
    return (
      <div className={cx("add-widget-container", className)} {...props}>
        <h2>
          <i className="zmdi zmdi-widgets" />
          <span className="hidden-xs hidden-sm">
            You can arrange your queries and reports on a dashboard in the form of widgets.
          </span>
        </h2>
        <div>
          <Button onClick={showReportDialog} className="m-r-15 ant-btn-turnilo"  data-test="AddReportButton">
            Add Report widget
          </Button>
          <Button className="m-r-15" onClick={showAddTextboxDialog} data-test="AddTextboxButton">
            Add Textbox
          </Button>
          <Button type="primary" onClick={showAddWidgetDialog} data-test="AddWidgetButton">
            Add Widget
          </Button>
        </div>
      </div>
    );
  }
}

class DashboardComponent extends React.Component {
  static propTypes = {
    dashboardOptions: PropTypes.object.isRequired, // eslint-disable-line react/forbid-prop-types
  };

  constructor(props) {
    super(props);
    this.state = {
      pageContainer: null,
      addWidgetStyle: {},
      listCreated: false,
      clickerList: [],
      essenceList: [EssenceFixtures.wikiHeatmap()],
      widgetList: [],
    };
  }

  componentDidMount() {
    setColorElements();
    if (this.state.pageContainer) {
      this.unobserve = resizeObserver(this.state.pageContainer, this.handleResize);
    }
  }

  componentWillUnmount() {
    if (this.unobserve) {
      this.unobserve();
    }
  }

  setPageContainer = (pageContainer) => {
    this.setState({ pageContainer });
  };

  handleResize = () => {
    const { pageContainer } = this.state;
    const { dashboardOptions } = this.props;

    if (dashboardOptions.editingLayout) {
      const style = window.getComputedStyle(pageContainer, null);
      const bounds = pageContainer.getBoundingClientRect();
      const paddingLeft = parseFloat(style.paddingLeft) || 0;
      const paddingRight = parseFloat(style.paddingRight) || 0;
      this.setState({
        addWidgetStyle: {
          left: Math.round(bounds.left) + paddingRight,
          width: pageContainer.clientWidth - paddingLeft - paddingRight,
        },
      });
    }

    // reflow grid when container changes its size
    window.dispatchEvent(new Event("resize"));
  };

  setClicker = async (id, clicker) => {
    if (this.state.widgetList.includes(id)) {
      const modelIndex = this.state.widgetList.lastIndexOf(id);
    
      // Create a copy of the clickerList array and update the specific clicker
      const updatedClickers = [...this.state.clickerList];
      updatedClickers[modelIndex] = clicker;
    
      // Update state with the new clickerList array and set the current clicker
      this.setState({
        clickerList: updatedClickers
      });
    } else {
      var clickerList;
      if (!this.state.listCreated) {
        clickerList = [clicker];
      } else {
        clickerList = this.state.clickerList.concat(clicker);
      }
      this.setState({ 
        clickerList: clickerList,
        widgetList: this.state.widgetList.concat(id),
        listCreated: true,
      })
    }
  }

  setEssence = async (id, essence) => {
    if (this.state.widgetList.includes(id)) {
      const modelIndex = this.state.widgetList.lastIndexOf(id);
    
      // Create a copy of the essenceList array and update the specific clicker
      const updatedClickers = [...this.state.essenceList];
      updatedClickers[modelIndex] = essence;
    
      // Update state with the new essenceList array and set the current clicker
      this.setState({
        essenceList: updatedClickers,
      });
    } else {
      var essenceList;
      if (!this.state.listCreated) {
        essenceList = [essence];
      } else {
        essenceList = this.state.essenceList.concat(essence);
      }
      this.setState({ 
        essenceList: essenceList,
        widgetList: this.state.widgetList.concat(id),
        listCreated: true,
      })
    }
  }

  getEssence = (id) => {
    const modelIndex = this.state.widgetList.lastIndexOf(id);
    if (modelIndex === -1) return null;
    return this.state.essenceList[modelIndex];
  }

  render() {
    const { dashboardOptions } = this.props;
    const { dashboard, filters, globalParameters, editingLayout } = dashboardOptions;
    const { addWidgetStyle } = this.state;
    const filterTile = React.createRef();
    return (
      <div className="container" ref={this.setPageContainer} data-test={`DashboardId${dashboard.id}Container`}>
        <DashboardHeader dashboardOptions={dashboardOptions} />
        {!isEmpty(globalParameters) && (
          <div className="dashboard-parameters m-b-10 p-15 bg-white tiled" data-test="DashboardParameters">
            <Parameters parameters={globalParameters} onValuesChange={dashboardOptions.refreshDashboard} />
          </div>
        )}
        {(!isEmpty(filters) || !isEmpty(dashboard.widgets)) && (
          <div className="m-b-10 p-15 bg-white tiled" data-test="DashboardFilters">
            <Filters filters={filters} onChange={dashboardOptions.setFilters} />
            <FilterTile
              ref={filterTile}
              clickerList={this.state.clickerList}
              essenceList={this.state.essenceList}
              timekeeper={new Timekeeper({timeTags:[]})}
              menuStage={visualizationStage}
              setEssence={this.setEssence}
              widgetList={this.state.widgetList}
            />
          </div>
        )}
        {editingLayout && <DashboardSettings dashboardOptions={dashboardOptions} addWidgetStyle={addWidgetStyle} />}
        <div id="dashboard-container">
          <DashboardGrid
            dashboard={dashboard}
            widgets={dashboard.widgets}
            filters={filters}
            isEditing={editingLayout}
            onLayoutChange={editingLayout ? dashboardOptions.saveDashboardLayout : () => {}}
            onBreakpointChange={dashboardOptions.setGridDisabled}
            onLoadWidget={dashboardOptions.loadWidget}
            onRefreshWidget={dashboardOptions.refreshWidget}
            onRemoveWidget={dashboardOptions.removeWidget}
            onParameterMappingsChange={dashboardOptions.loadDashboard}
            setClicker={this.setClicker}
            setEssence={this.setEssence}
            getEssence={this.getEssence}
          />
        </div>
      </div>
    );
  }
}

function withDashboardOptions(WrappedComponent) {
  return function DashboardOptionsWrapper(props) {
    const dashboardOptions = useDashboard(props.dashboard);
    return <WrappedComponent {...props} dashboardOptions={dashboardOptions} />;
  };
}

const DashboardComponentWithOptions = withDashboardOptions(DashboardComponent);

function DashboardPage({ dashboardSlug, dashboardId, onError }) {
  const [dashboard, setDashboard] = useState(null);
  const handleError = useImmutableCallback(onError);

  useEffect(() => {
    Dashboard.get({ id: dashboardId, slug: dashboardSlug })
      .then(dashboardData => {
        recordEvent("view", "dashboard", dashboardData.id);
        setDashboard(dashboardData);

        // if loaded by slug, update location url to use the id
        if (!dashboardId) {
          location.setPath(url.parse(dashboardData.url).pathname, true);
        }
      })
      .catch(handleError);
  }, [dashboardId, dashboardSlug, handleError]);

  return <div className="dashboard-page">{dashboard && <DashboardComponentWithOptions dashboard={dashboard} />}</div>;
}

DashboardPage.propTypes = {
  dashboardSlug: PropTypes.string,
  dashboardId: PropTypes.string,
  onError: PropTypes.func,
};

DashboardPage.defaultProps = {
  dashboardSlug: null,
  dashboardId: null,
  onError: PropTypes.func,
};

// route kept for backward compatibility
routes.register(
  "Dashboards.LegacyViewOrEdit",
  routeWithUserSession({
    path: "/dashboard/:dashboardSlug",
    render: pageProps => <DashboardPage {...pageProps} />,
  })
);

routes.register(
  "Dashboards.ViewOrEdit",
  routeWithUserSession({
    path: "/dashboards/:dashboardId([^-]+)(-.*)?",
    render: pageProps => <DashboardPage {...pageProps} />,
  })
);

export { DashboardPage, DashboardComponent, AddWidgetContainer, DashboardSettings };
