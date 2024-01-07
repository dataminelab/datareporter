import React, { useState, useEffect } from "react";
import PropTypes from "prop-types";

import routeWithApiKeySession from "@/components/ApplicationArea/routeWithApiKeySession";
import BigMessage from "@/components/BigMessage";
import PageHeader from "@/components/PageHeader";

import { Report } from "@/services/report";
import routes from "@/services/routes";

import logoUrl from "@/assets/images/report_icon_small.png";
import ReportEditor from "./components/ReportEditor";
import useMedia from "use-media";

import recordEvent from "@/services/recordEvent";

import useReport from "../reports/hooks/useReport";

import "./PublicReportPage.less";

function PublicReport({ currentReport }) {
  console.log("currentReport", currentReport)
  const { report, setReport, saveReport, saveAsReport, deleteReport, showShareReportDialog } = useReport(
    currentReport
  );
  const isMobile = !useMedia({ minWidth: 768 });
  const [reportChanged, setReportChanged] = useState(false);

  useEffect(() => {
    // TODO: ignore new pages?
    recordEvent("view_source", "report", report.id);
  }, [report.id]);

  useEffect(() => {
    document.title = report.name;
  }, [report.name]);
  
  return (
    <div className="container p-t-10 p-b-20">
      <PageHeader title={report.name} />
      <div id="dashboard-container" className="dashboard-page">
        <ReportEditor 
          report={report} 
          reportChanged={reportChanged}
          setReportChanged={setReportChanged}
        />
      </div>
    </div>
  );
}

class PublicReportPage extends React.Component {
  static propTypes = {
    token: PropTypes.string.isRequired,
    onError: PropTypes.func,
  };

  static defaultProps = {
    onError: () => {},
  };

  state = {
    loading: true,
    report: null,
  };

  componentDidMount() {
    Report.getByToken({ token: this.props.token })
      .then(report => this.setState({ report, loading: false }))
      .catch(error => this.props.onError(error));
  }

  render() {
    const { loading, report } = this.state;
    return (
      <div className="public-dashboard-page">
        {loading ? (
          <div className="container loading-message">
            <BigMessage className="" icon="fa-spinner fa-2x fa-pulse" message="Loading..." />
          </div>
        ) : (
          <PublicReport currentReport={report}/>
        )}
        <div id="footer">
          <div className="text-center">
            <a href="https://datareporter.com">
              <img alt="Data reporter Logo" src={logoUrl} width="38" />
            </a>
          </div>
          Powered by <a href="https://dataminelab.com">Data reporter</a>
        </div>
      </div>
    );
  }
}

routes.register(
  "Reports.ViewShared",
  routeWithApiKeySession({
    path: "/public/reports/:token",
    render: pageProps => <PublicReportPage {...pageProps} />,
    getApiKey: currentRoute => currentRoute.routeParams.token,
  })
);
