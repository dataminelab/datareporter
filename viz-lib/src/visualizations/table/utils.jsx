import { isNil, map, get, filter, each, sortBy, some, findIndex, toString } from "lodash";
import React from "react";
import cx from "classnames";
import Tooltip from "antd/lib/tooltip";
import ColumnTypes from "./columns";

function nextOrderByDirection(direction) {
  switch (direction) {
    case "ascend":
      return "descend";
    case "descend":
      return null;
    default:
      return "ascend";
  }
}

function toggleOrderBy(columnName, orderBy = [], multiColumnSort = false) {
  const index = findIndex(orderBy, i => i.name === columnName);
  const item = { name: columnName, direction: "ascend" };
  if (index >= 0) {
    item.direction = nextOrderByDirection(orderBy[index].direction);
  }

  if (multiColumnSort) {
    if (!item.direction) {
      return filter(orderBy, i => i.name !== columnName);
    }
    if (index >= 0) {
      orderBy[index] = item;
    } else {
      orderBy.push(item);
    }
    return [...orderBy];
  }
  return item.direction ? [item] : [];
}

function getOrderByInfo(orderBy) {
  const result = {};
  each(orderBy, ({ name, direction }, index) => {
    result[name] = { direction, index: index + 1 };
  });
  return result;
}

export function prepareColumns(columns, searchInput, orderBy, onOrderByChange) {
  columns = filter(columns, "visible");
  columns = sortBy(columns, "order");

  const isMultiColumnSort = orderBy.length > 1;
  const orderByInfo = getOrderByInfo(orderBy);

  let tableColumns = map(columns, column => {
    const isAscend = orderByInfo[column.name] && orderByInfo[column.name].direction === "ascend";
    const isDescend = orderByInfo[column.name] && orderByInfo[column.name].direction === "descend";

    const sortColumnIndex = isMultiColumnSort && orderByInfo[column.name] ? orderByInfo[column.name].index : null;

    const result = {
      key: column.name,
      dataIndex: `record[${JSON.stringify(column.name)}]`,
      align: column.alignContent,
      sorter: { multiple: 1 }, // using { multiple: 1 } to allow built-in multi-column sort arrows
      sortOrder: get(orderByInfo, [column.name, "direction"], null),
      title: (
        <React.Fragment>
          {column.description && (
            <span style={{ paddingRight: 5 }}>
              <Tooltip placement="top" title={column.description}>
                <div className="table-visualization-heading">
                  <i className="fa fa-info-circle" aria-hidden="true"></i>
                </div>
              </Tooltip>
            </span>
          )}
          <Tooltip placement="top" title={column.title}>
            <div className="table-visualization-heading" data-sort-column-index={sortColumnIndex}>
              {column.title}
            </div>
          </Tooltip>
        </React.Fragment>
      ),
      onHeaderCell: () => ({
        className: cx({
          "table-visualization-column-is-sorted": isAscend || isDescend,
        }),
        onClick: (event) => onOrderByChange(toggleOrderBy(column.name, orderBy, event.shiftKey)),
      }),
    };

    const initColumn = ColumnTypes[column.displayAs];
    const Component = initColumn(column);
    result.render = (unused, row) => ({
      children: <Component row={row.record} />,
      props: { className: `display-as-${column.displayAs}` },
    });

    return result;
  });

  tableColumns.push({
    key: "###Redash::Visualizations::Table::Spacer###",
    dataIndex: null,
    title: "",
    className: "table-visualization-spacer",
    render: () => "",
    onHeaderCell: () => ({ className: "table-visualization-spacer" }),
  });

  if (searchInput) {
    // Add searchInput as the ColumnGroup for all table columns
    tableColumns = [
      {
        key: "table-search",
        title: searchInput,
        onHeaderCell: () => ({ className: "table-visualization-search" }),
        children: tableColumns,
      },
    ];
  }

  return tableColumns;
}

export function initRows(rows) {
  return map(rows, (record, index) => ({ key: `record${index}`, record }));
}

export function filterRows(rows, searchTerm, searchColumns) {
  if (searchTerm !== "" && searchColumns.length > 0) {
    searchTerm = searchTerm.toUpperCase();
    const matchFields = map(searchColumns, column => {
      const initColumn = ColumnTypes[column.displayAs];
      const { prepareData } = initColumn(column);
      return (row) => {
        const { text } = prepareData(row);
        return (
          toString(text)
            .toUpperCase()
            .indexOf(searchTerm) >= 0
        );
      };
    });

    return filter(rows, row => some(matchFields, match => match(row.record)));
  }
  return rows;
}

export function sortRows(rows, orderBy) {
  if (orderBy.length === 0 || rows.length === 0) {
    return rows;
  }

  const directions = { ascend: 1, descend: -1 };

  // Create a copy of array before sorting, because .sort() will modify original array
  return [...rows].sort((a, b) => {
    let va;
    let vb;
    for (let i = 0; i < orderBy.length; i += 1) {
      va = a.record[orderBy[i].name];
      vb = b.record[orderBy[i].name];
      if (isNil(va) || va < vb) {
        // if a < b - we should return -1, but take in account direction
        return -1 * directions[orderBy[i].direction];
      }
      if (va > vb || isNil(vb)) {
        // if a > b - we should return 1, but take in account direction
        return 1 * directions[orderBy[i].direction];
      }
    }
    return 0;
  });
}
