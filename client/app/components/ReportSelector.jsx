import { find } from "lodash";
import React, { useState, useEffect } from "react";
import PropTypes from "prop-types";
import cx from "classnames";
import Input from "antd/lib/input";
import Select from "antd/lib/select";
import { Report } from "@/services/report";
import notification from "@/services/notification";
import { QueryTagsControl } from "@/components/tags-control/TagsControl";
import useSearchResults from "@/lib/hooks/useSearchResults";

const { Option } = Select;
function search(term) {
  if (term === null) {
    return Promise.resolve(null);
  }

  // get recent
  if (!term) {
    return Report.report().then(({ results }) => results);
  }

  // search by report
  return Report.report({ q: term }).then(({ results }) => results);
}

export default function ReportSelector(props) {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedQuery, setSelectedQuery] = useState();
  const [doSearch, searchResults, searching] = useSearchResults(search, { initialResults: [] });

  const placeholder = "Search a report by name";
  const clearIcon = <i className="fa fa-times hide-in-percy" onClick={() => selectQuery(null)} />;
  const spinIcon = <i className={cx("fa fa-spinner fa-pulse hide-in-percy", { hidden: !searching })} />;

  useEffect(() => {
    doSearch(searchTerm);
  }, [doSearch, searchTerm]);

  // set selected from prop
  useEffect(() => {
    if (props.selectedQuery) {
      setSelectedQuery(props.selectedQuery);
    }
  }, [props.selectedQuery]);

  function selectQuery(queryId) {
    let report = null;
    if (queryId) {
      report = find(searchResults, { id: queryId });
      if (!report) {
        // shouldn't happen
        notification.error("Something went wrong...", "Couldn't select report");
      }
    }

    setSearchTerm(report ? null : ""); // empty string triggers recent fetch
    setSelectedQuery(report);
    props.onChange(report);
  }

  function renderResults() {
    if (!searchResults.length) {
      return <div className="text-muted">No results matching search term.</div>;
    }

    return (
      <div className="list-group">
        {searchResults.map(q => (
          <a
            className={cx("report-selector-result", "list-group-item")}
            key={q.id}
            onClick={() => selectQuery(q.id)}
            data-test={`QueryId${q.id}`}>
            {q.name} <QueryTagsControl isDraft={false} tags={q.tags} className="inline-tags-control" />
          </a>
        ))}
      </div>
    );
  }

  if (props.disabled) {
    return <Input value={selectedQuery && selectedQuery.name} placeholder={placeholder} disabled />;
  }

  if (props.type === "select") {
    const suffixIcon = selectedQuery ? clearIcon : null;
    const value = selectedQuery ? selectedQuery.name : searchTerm;

    return (
      <Select
        showSearch
        dropdownMatchSelectWidth={false}
        placeholder={placeholder}
        value={value || undefined} // undefined for the placeholder to show
        onSearch={setSearchTerm}
        onChange={selectQuery}
        suffixIcon={searching ? spinIcon : suffixIcon}
        notFoundContent={null}
        filterOption={false}
        defaultActiveFirstOption={false}
        className={props.className}
        data-test="ReportSelector">
        {searchResults &&
          searchResults.map(q => {
            const disabled = q.is_draft;
            return (
              <Option
                value={q.id}
                key={q.id}
                disabled={disabled}
                className="report-selector-result"
                data-test={`QueryId${q.id}`}>
                {q.name}{" "}
                <QueryTagsControl
                  isDraft={q.is_draft}
                  tags={q.tags}
                  isArchived={q.is_archived}
                  className="d-block"
                />
              </Option>
            );
          })}
      </Select>
    );
  }

  return (
    <span data-test="ReportSelector">
      {selectedQuery ? (
        <Input value={selectedQuery.name} suffix={clearIcon} readOnly />
      ) : (
        <Input
          placeholder={placeholder}
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
          suffix={spinIcon}
        />
      )}
      <div className="scrollbox" style={{ maxHeight: "50vh", marginTop: 15 }}>
        {searchResults && renderResults()}
      </div>
    </span>
  );
}

ReportSelector.propTypes = {
  onChange: PropTypes.func.isRequired,
  selectedQuery: PropTypes.object, // eslint-disable-line react/forbid-prop-types
  type: PropTypes.oneOf(["select", "default"]),
  className: PropTypes.string,
  disabled: PropTypes.bool,
};

ReportSelector.defaultProps = {
  selectedQuery: null,
  type: "default",
  className: null,
  disabled: false,
};
