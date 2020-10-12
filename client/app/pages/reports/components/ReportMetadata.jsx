import { isFunction, has } from "lodash";
import React from "react";
import PropTypes from "prop-types";
import cx from "classnames";
import { Moment } from "@/components/proptypes";
import TimeAgo from "@/components/TimeAgo";
import SchedulePhrase from "@/components/reports/SchedulePhrase";
import { IMG_ROOT } from "@/services/data-source";

import "./ReportMetadata.less";

export default function ReportMetadata({ report, dataSource, layout, onEditSchedule }) {
  return (
    <div className={`report-metadata report-metadata-${layout}`}>
      <div className="report-metadata-item">
        <img className="profile__image_thumb" src={report.user.profile_image_url} alt="Avatar" />
        <div className="report-metadata-property">
          <strong className={cx("report-metadata-label", { "text-muted": report.user.is_disabled })}>
            {report.user.name}
          </strong>
          <span className="report-metadata-value">
            created{" "}
            <strong>
              <TimeAgo date={report.created_at} />
            </strong>
          </span>
        </div>
      </div>
      <div className="report-metadata-item">
        <img className="profile__image_thumb" src={report.last_modified_by.profile_image_url} alt="Avatar" />
        <div className="report-metadata-property">
          <strong className={cx("report-metadata-label", { "text-muted": report.last_modified_by.is_disabled })}>
            {report.last_modified_by.name}
          </strong>
          <span className="report-metadata-value">
            updated{" "}
            <strong>
              <TimeAgo date={report.updated_at} />
            </strong>
          </span>
        </div>
      </div>
      <div className="report-metadata-space" />
      {has(dataSource, "name") && has(dataSource, "type") && (
        <div className="report-metadata-item">
          Data Source:
          <img src={`${IMG_ROOT}/${dataSource.type}.png`} width="20" alt={dataSource.type} />
          <div className="report-metadata-property">
            <div className="report-metadata-label">{dataSource.name}</div>
          </div>
        </div>
      )}
      <div className="report-metadata-item">
        <div className="report-metadata-property">
          <span className="report-metadata-label">
            <span className="zmdi zmdi-refresh m-r-5" />
            Refresh Schedule
          </span>
          <span className="report-metadata-value">
            <SchedulePhrase
              isLink={isFunction(onEditSchedule)}
              isNew={report.isNew()}
              schedule={report.schedule}
              onClick={onEditSchedule}
            />
          </span>
        </div>
      </div>
    </div>
  );
}

ReportMetadata.propTypes = {
  layout: PropTypes.oneOf(["table", "horizontal"]),
  report: PropTypes.shape({
    created_at: PropTypes.oneOfType([PropTypes.string, Moment]).isRequired,
    updated_at: PropTypes.oneOfType([PropTypes.string, Moment]).isRequired,
    user: PropTypes.shape({
      name: PropTypes.string.isRequired,
      profile_image_url: PropTypes.string.isRequired,
      is_disabled: PropTypes.bool,
    }).isRequired,
    last_modified_by: PropTypes.shape({
      name: PropTypes.string.isRequired,
      profile_image_url: PropTypes.string.isRequired,
      is_disabled: PropTypes.bool,
    }).isRequired,
    schedule: PropTypes.object,
  }).isRequired,
  dataSource: PropTypes.shape({
    type: PropTypes.string,
    name: PropTypes.string,
  }),
  onEditSchedule: PropTypes.func,
};

ReportMetadata.defaultProps = {
  layout: "table",
  dataSource: null,
  onEditSchedule: null,
};
