import { find } from "lodash";
import React, { useState, useEffect } from "react";
import PropTypes from "prop-types";
import cx from "classnames";
import Input from "antd/lib/input";
import Select from "antd/lib/select";
import { Query } from "@/services/query";
import { Report } from "@/services/report";
import PlainButton from "@/components/PlainButton";
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
    return Promise.resolve([]);
  }

  // search by query and report
  const querySearch = Query.query({ q: term }).then(({ results }) =>
    results.map((query) => ({ ...query, type: "query" }))
  );
  const reportSearch = Report.report({ q: term }).then(({ results }) =>
    results.map((report) => ({ ...report, type: "report" }))
  );

  return Promise.all([reportSearch, querySearch]).then(([reports, queries]) => [...reports, ...queries]);
}

export default function QuerySelector(props) {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedQuery, setSelectedQuery] = useState();
  const [doSearch, searchResults, searching] = useSearchResults(search, {
    initialResults: [],
  });

  const placeholder = "Search a query or report by name";
  const clearIcon = (
    <i
      className="fa fa-times hide-in-percy"
      role="button"
      tabIndex={0}
      aria-label="Clear"
      onClick={() => selectQuery(null)}
    />
  );
  const spinIcon = (
    <span role="status" aria-live="polite" aria-relevant="additions removals">
      <i
        className={cx("fa fa-spinner fa-pulse hide-in-percy", {
          hidden: !searching,
        })}
        aria-hidden="true"
      />
      <span className="sr-only">Searching...</span>
    </span>
  );

  useEffect(() => {
    doSearch(searchTerm);
  }, [doSearch, searchTerm]);

  // set selected from prop
  useEffect(() => {
    if (props.selectedQuery) {
      setSelectedQuery(props.selectedQuery);
    }
  }, [props.selectedQuery]);

  function selectQuery(key) {
    let query = null;
    if (key) {
      const [type, id] = key.split(":");
      query = find(searchResults, { id: parseInt(id, 10), type });
      if (!query) {
        // shouldn't happen
        notification.error("Something went wrong...", "Couldn't select query");
      }
      query = { type, ...query };
    }

    setSearchTerm(query ? null : ""); // empty string triggers recent fetch
    setSelectedQuery(query);
    props.onChange(query);
  }

  function renderResults() {
    if (!searchResults.length) {
      return <div className="text-muted">No results matching search term.</div>;
    }

    return (
      <ul className="list-group">
        {searchResults.map((q) => {
          const key = `${q.type}:${q.id}`;
          return (
            <PlainButton
              className={cx("query-selector-result", "list-group-item", {
                inactive: q.is_draft,
              })}
              key={key}
              role="listitem"
              onClick={() => selectQuery(key)}
              data-test={`QueryId${q.id}`}>
              {q.name} <QueryTagsControl isDraft={q.is_draft} tags={q.tags} className="inline-tags-control" />
            </PlainButton>
          );
        })}
      </ul>
    );
  }

  if (props.disabled) {
    return (
      <Input value={selectedQuery && selectedQuery.name} aria-label="Tied query" placeholder={placeholder} disabled />
    );
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
        data-test="QuerySelector">
        {searchResults &&
          searchResults.map((q) => {
            const disabled = q.is_draft;
            const key = `${q.type}:${q.id}`;
            return (
              <Option
                value={key}
                key={key}
                disabled={disabled}
                className="query-selector-result"
                data-test={`QueryId${q.id}`}>
                {q.name}{" "}
                <QueryTagsControl
                  isDraft={q.is_draft}
                  tags={q.tags}
                  className={cx("inline-tags-control", { disabled })}
                />
              </Option>
            );
          })}
      </Select>
    );
  }

  return (
    <span data-test="QuerySelector">
      {selectedQuery ? (
        <Input value={selectedQuery.name} aria-label="Tied query" suffix={clearIcon} readOnly />
      ) : (
        <Input
          placeholder={placeholder}
          value={searchTerm}
          aria-label="Tied query"
          onChange={(e) => setSearchTerm(e.target.value)}
          suffix={spinIcon}
        />
      )}
      <div className="scrollbox" style={{ maxHeight: "50vh", marginTop: 15 }}>
        {searchResults && renderResults()}
      </div>
    </span>
  );
}

QuerySelector.propTypes = {
  onChange: PropTypes.func.isRequired,
  selectedQuery: PropTypes.object,
  type: PropTypes.oneOf(["select", "default"]),
  className: PropTypes.string,
  disabled: PropTypes.bool,
};

QuerySelector.defaultProps = {
  selectedQuery: null,
  type: "default",
  className: null,
  disabled: false,
};
